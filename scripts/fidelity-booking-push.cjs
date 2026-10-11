const admin=require('firebase-admin');
const raw=process.env.FIREBASE_SERVICE_ACCOUNT;
if(!raw){console.error('Missing FIREBASE_SERVICE_ACCOUNT secret');process.exit(1)}
admin.initializeApp({credential:admin.credential.cert(JSON.parse(raw))});
const db=admin.firestore();
async function main(){
 const snapshot=await db.collection('orders').where('type','==','TABLE_BOOKING').get();
 let sent=0;
 for(const doc of snapshot.docs){
  const b=doc.data(),status=String(b.bookingStatus||b.status||'').toUpperCase();
  const ref=db.collection('fidelityPushState').doc(doc.id);
  const previous=await ref.get();
  const wasConfirmed=previous.exists&&previous.data().confirmed===true;
  const confirmed=status.includes('CONFERM');
  if(!previous.exists){await ref.set({confirmed,initializedAt:admin.firestore.FieldValue.serverTimestamp()});continue}
  if(!confirmed){if(previous.data().confirmed)await ref.set({confirmed:false},{merge:true});continue}
  if(wasConfirmed)continue;
  const uids=[...new Set([b.customerUid,...(Array.isArray(b.groupMemberUids)?b.groupMemberUids:[])].filter(Boolean))];
  let success=false;
  for(const uid of uids){
   const tokenDoc=await db.collection('fidelityPushTokens').doc(uid).get();
   const token=tokenDoc.data()?.token;
   if(!token)continue;
   try{
    await admin.messaging().send({token,notification:{title:'Alberto Fidelity',body:'La tua prenotazione del '+String(b.date||'')+' alle '+String(b.time||'')+' è confermata.'},webpush:{fcmOptions:{link:'https://albertotabacchi.com/fidelity-preview/'}}});
    success=true;sent++;
   }catch(err){console.error('FCM send failed for booking '+doc.id+': '+(err.code||err.message))}
  }
  if(success)await ref.set({confirmed:true,sentAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});
 }
 console.log('Push sent: '+sent);
}
main().catch(e=>{console.error(e);process.exit(1)});
