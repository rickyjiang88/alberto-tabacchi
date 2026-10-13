#!/usr/bin/env python3
"""Email the owner once per new Alberto Fidelity registration.

Runs server-side via GitHub Actions: never expose the Resend key or Firebase
service account in the public website. Does not change points, wallet, bookings,
or any existing customer data.
"""
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

DESTINATION = "info@albertotabacchi.com"
SENDER = "Alberto Fidelity <info@albertotabacchi.com>"
FIRST_ALLOWED = datetime(2026, 10, 13, 21, 17, tzinfo=timezone.utc)
RECENT_WINDOW = timedelta(days=7)


def send_email(api_key: str, customer_id: str, name: str, surname: str, created_at: datetime) -> str:
    when = created_at.astimezone(ZoneInfo("Europe/Rome")).strftime("%d/%m/%Y alle %H:%M")
    full_name = " ".join(part for part in (name, surname) if part).strip()
    payload = {
        "from": SENDER,
        "to": [DESTINATION],
        "subject": "Alberto Fidelity | Nuova registrazione cliente",
        "text": (
            "Un nuovo cliente si è registrato ad Alberto Fidelity.\n\n"
            f"Nome e cognome: {full_name}\n"
            f"Registrazione: {when}\n\n"
            "Notifica automatica di registrazione. Non riguarda prenotazioni o preordini."
        ),
    }
    req = Request(
        "https://api.resend.com/emails",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Accept-Language": "it-IT,it;q=0.9",
            "User-Agent": "Mozilla/5.0 (compatible; AlbertoFidelity/1.0; +https://albertotabacchi.com)",
            "Idempotency-Key": f"alberto-fidelity-registration-{customer_id}",
        },
        method="POST",
    )
    try:
        with urlopen(req, timeout=25) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        # Do not print request headers or customer data into public CI logs.
        raise RuntimeError(f"Resend HTTP {exc.code}") from None
    except URLError:
        raise RuntimeError("Resend connection failed") from None
    message_id = result.get("id")
    if not message_id:
        raise RuntimeError("Resend did not return an email ID")
    return message_id


def main() -> int:
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    if not api_key:
        print("ERROR: RESEND_API_KEY missing. Automatic registration emails cannot run.", file=sys.stderr)
        return 1

    service_account = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON", "").strip()
    if not service_account:
        print("ERROR: missing FIREBASE_SERVICE_ACCOUNT_JSON GitHub Actions secret.", file=sys.stderr)
        return 1

    firebase_admin.initialize_app(credentials.Certificate(json.loads(service_account)))
    db = firestore.client()
    cutoff = max(FIRST_ALLOWED, datetime.now(timezone.utc) - RECENT_WINDOW)
    customers = db.collection("fidelityCustomers").where(
        filter=FieldFilter("createdAt", ">=", cutoff)
    ).stream()
    sent, skipped = 0, 0
    for doc in customers:
        item = doc.to_dict() or {}
        created_at = item.get("createdAt")
        if not isinstance(created_at, datetime):
            continue
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        if created_at < FIRST_ALLOWED:
            continue
        marker = db.collection("fidelityRegistrationNotifications").document(doc.id)
        state = marker.get()
        if state.exists and (state.to_dict() or {}).get("status") == "sent":
            skipped += 1
            continue
        name, surname = str(item.get("name") or "").strip(), str(item.get("surname") or "").strip()
        if not name or not surname:
            print("A registration is missing a name/surname and cannot be notified yet.")
            continue
        message_id = send_email(api_key, doc.id, name, surname, created_at)
        marker.set({
            "status": "sent",
            "customerCode": doc.id,
            "resendMessageId": message_id,
            "createdAt": firestore.SERVER_TIMESTAMP,
        })
        sent += 1
    print(f"Registration notification run completed: sent={sent}, already_sent={skipped}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
