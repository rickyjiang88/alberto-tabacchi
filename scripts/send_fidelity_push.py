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
    title = "Alberto Fidelity"
    body = ("Il tuo ordine è pronto per il ritiro!" if kind == "order_ready"
            else "La tua prenotazione è stata confermata!")
    sent = 0
    failures = []
    for uid in sorted(uids):
        token_doc = db.collection("fidelityPushTokens").document(uid).get()
        token = (token_doc.to_dict() or {}).get("token") if token_doc.exists else None
        if not token:
            continue
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
        token_doc = db.collection('fidelityPushTokens').document(test_uid).get()
        token = (token_doc.to_dict() or {}).get('token') if token_doc.exists else None
        if not token:
            raise SystemExit('Test not sent: no registered push token for this UID')
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
