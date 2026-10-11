"""Send pending Alberto Fidelity push notifications using a server-side Firebase service account.

Required environment variable: FIREBASE_SERVICE_ACCOUNT_JSON (GitHub Actions secret).
No Firebase private key is ever included in the public website.
"""
import json
import os
from datetime import datetime, timedelta, timezone

import firebase_admin
from firebase_admin import credentials, firestore, messaging
from google.cloud.firestore_v1.base_query import FieldFilter

secret = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
if not secret:
    raise SystemExit("Missing FIREBASE_SERVICE_ACCOUNT_JSON; no notifications sent")
firebase_admin.initialize_app(credentials.Certificate(json.loads(secret)))
db = firestore.client()

def registered_tokens(uid):
    """Return all distinct device tokens, including the original single-device field."""
    snapshot = db.collection("fidelityPushTokens").document(uid).get()
    record = snapshot.to_dict() or {}
    tokens = set()
    if isinstance(record.get("token"), str) and record["token"]:
        tokens.add(record["token"])
    devices = record.get("devices") or {}
    if isinstance(devices, dict):
        for device in devices.values():
            if isinstance(device, dict) and isinstance(device.get("token"), str) and device["token"]:
                tokens.add(device["token"])
    return sorted(tokens)

def deliver(order_ref):
    @firestore.transactional
    def claim(tx):
        snapshot = order_ref.get(transaction=tx)
        if not snapshot.exists:
            return None
        order = snapshot.to_dict()
        event = order.get("pushEvent") or {}
        if event.get("status") != "pending":
            return None
        kind = event.get("type")
        if kind == "order_ready" and order.get("status") != "PRONTO":
            return None
        if kind == "booking_confirmed" and order.get("bookingStatus") != "CONFERMATA":
            return None
        if kind not in ("order_ready", "booking_confirmed"):
            return None
        tx.update(order_ref, {"pushEvent.status": "processing", "pushEvent.processingAt": firestore.SERVER_TIMESTAMP})
        return order, kind

    data = claim(db.transaction())
    if not data:
        return
    order, kind = data
    uids = {str(order.get("customerUid") or "").strip()}
    if kind == "booking_confirmed":
        uids.update(str(uid).strip() for uid in (order.get("groupMemberUids") or []))
    uids.discard("")
    if kind == "order_ready":
        number = order.get("orderNumber")
        order_label = f"#{int(number):04d}" if str(number or "").isdigit() else f"#{order_ref.id[:8]}"
        title = f"Alberto · Ordine {order_label} pronto"
        body = f"Il tuo ordine {order_label} è pronto per il ritiro!"
    else:
        title = "Alberto · Prenotazione confermata"
        covers = order.get("covers") or order.get("guests")
        date = str(order.get("date") or "")
        if len(date) == 10 and date[4] == "-" and date[7] == "-":
            date = f"{date[8:10]}/{date[5:7]}/{date[:4]}"
        time = str(order.get("time") or "")
        details = []
        if covers:
            details.append(f"per {covers} coperti")
        if date:
            details.append(f"del {date}")
        if time:
            details.append(f"alle ore {time}")
        body = "La tua prenotazione " + " ".join(details) + " è confermata." if details else "La tua prenotazione è stata confermata!"
    sent = 0
    failures = []
    for uid in sorted(uids):
        for token in registered_tokens(uid):
            try:
                messaging.send(messaging.Message(
                    token=token,
                    notification=messaging.Notification(title=title, body=body),
                    webpush=messaging.WebpushConfig(
                        fcm_options=messaging.WebpushFCMOptions(link="https://albertotabacchi.com/fidelity-preview/")
                    ),
                    data={"url": "/fidelity-preview/", "orderId": order_ref.id, "kind": kind},
                ))
                sent += 1
            except Exception as exc:
                failures.append(f"{uid}: {type(exc).__name__}")
    update = {"pushEvent.status": "sent" if sent else "no_recipient",
              "pushEvent.sentAt": firestore.SERVER_TIMESTAMP, "pushEvent.sentCount": sent}
    if failures:
        update["pushEvent.failures"] = failures[:10]
        if not sent:
            update["pushEvent.status"] = "failed"
    order_ref.update(update)
    print(f"{order_ref.id}: {kind}: sent={sent}, failures={len(failures)}")

def main():
    test_uid = os.environ.get('TEST_PUSH_UID', '').strip()
    if test_uid:
        tokens = registered_tokens(test_uid)
        if not tokens:
            raise SystemExit('Test not sent: no registered push token for this UID')
        for token in tokens:
            message_id = messaging.send(messaging.Message(
                token=token,
                notification=messaging.Notification(title='Alberto Fidelity', body='Notifica di prova: tutto funziona!'),
                webpush=messaging.WebpushConfig(fcm_options=messaging.WebpushFCMOptions(link='https://albertotabacchi.com/fidelity-preview/')),
                data={'url': '/fidelity-preview/', 'kind': 'test'},
            ))
            print('Test push accepted by Firebase:', message_id)
        return
    docs = db.collection("orders").where(
        filter=FieldFilter("pushEvent.status", "==", "pending")
    ).limit(100).stream()
    for snapshot in docs:
        try:
            deliver(snapshot.reference)
        except Exception as exc:
            print(f"{snapshot.id}: ERROR {type(exc).__name__}: {exc}")

if __name__ == "__main__":
    main()
