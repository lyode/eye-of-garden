import {SyncSession} from './sync-core.mjs';
import {VerificationGate,authMessage} from './verification.mjs';
import {privateAccountEnabled,privateDocumentsEnabled} from './config.mjs';
import {connectFirebase} from './firebase-adapter.mjs';
// The tracker bridge validates every incoming backup and never changes guest records.
export async function mountPrivateAccount(host,bridge,connect=connectFirebase){
  if(!privateAccountEnabled){host.textContent='Private accounts are being prepared. Online sync and document uploads are not enabled.';return;}
  host.innerHTML=`<h3 tabindex="-1">My private account</h3><p>Sign in with the same email on your computer and iPhone. Verify your email before saving medical records. This browser keeps a local copy for recovery; use your personal device and download a backup regularly.</p><p data-status role="status">Connecting…</p>
    <form data-login><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button>Sign in</button><button type="button" data-register>Create account</button><button type="button" data-reset>Reset password</button></form>
    <div data-member hidden><p data-identity></p><p data-verification-help></p><button data-verify>Send verification email</button><button data-refresh>Check verification status</button><p data-verification-tip>Open the verification link in your email, then choose Check verification status. Checking status does not send another email. Look in Spam/Junk too. You can keep using and saving your device-only tracker while waiting.</p><div data-verified hidden><button data-import>Copy this device’s plan into my account</button><button data-sync>Sync now</button><button data-backup>Download account backup</button><button data-online>Load online copy</button><p>Loading the online copy replaces pending edits in this account view. Download a backup first. If another device edited your record, syncing pauses rather than overwriting it.</p><div data-documents><h4>Private doctor documents</h4><p>PDF, JPG or PNG; up to 10 MB. Files belong only to your signed-in account. Do not upload files on a shared device.</p><form data-upload><input type="file" accept="application/pdf,image/jpeg,image/png" required><button>Upload privately</button></form><div data-files></div></div><p data-document-pending>Private document uploads are not available yet. Medication syncing is separate.</p></div><button data-out>Sign out</button></div>`;
  const $=s=>host.querySelector(s),message=t=>$('[data-status]').textContent=t;
  $('[data-documents]').hidden=!privateDocumentsEnabled;$('[data-document-pending]').hidden=privateDocumentsEnabled;
  let api,session=null,generation=0,unsubscribe=null,timer=null,stopWatching=null,authPending=false,nextCheckAt=0;
  let retryStorage;try{retryStorage=localStorage;}catch{}const verification=new VerificationGate({storage:retryStorage});
  const cache={read:uid=>{try{return JSON.parse(localStorage.getItem('eog_account_'+uid)||'null');}catch{return null;}},write:(uid,value)=>localStorage.setItem('eog_account_'+uid,JSON.stringify(value))};
  const labels={ready:'Connected to your private account.',pending:'Saved on this device. Waiting to sync.',saving:'Saving online…',saved:'Saved online at ',offline:'Not synced. Keep this browser open or download a backup, then retry.',conflict:'Another device changed this record. Your pending copy is kept; download it before loading the online copy.',unavailable:'Cannot read the online record. Check your connection and retry.'};
  const safely=fn=>async e=>{e?.preventDefault();try{await fn(e);}catch(err){message(authMessage(err));}};
  function verificationUI(){
    const user=api?.auth.currentUser,state=user?verification.state(user.uid):{};
    const seconds=state.seconds||0,verify=$('[data-verify]'),refresh=$('[data-refresh]');
    verify.disabled=authPending||state.pending||seconds>0;
    verify.textContent=state.pending?'Sending…':seconds?'Try resend in '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'):'Send verification email';
    const checkSeconds=Math.max(0,Math.ceil((nextCheckAt-Date.now())/1000));
    refresh.disabled=authPending||checkSeconds>0;refresh.textContent=checkSeconds?'Check again in '+checkSeconds+'s':'Check verification status';
    for(const button of host.querySelectorAll('[data-login] button,[data-out]'))button.disabled=authPending;
    $('[data-verification-help]').hidden=!user||user.emailVerified;
    $('[data-verification-tip]').hidden=!user||user.emailVerified;
    $('[data-verification-help]').textContent=state.limited?'Sending is temporarily limited by Firebase. The countdown is this app’s retry pause, not a guaranteed unblock time. Check for an earlier email before trying again.':state.failed?'The last email request failed. Check for an earlier email, then retry after the pause if needed.':state.sentAt?'Verification email requested at '+new Date(state.sentAt).toLocaleTimeString()+'. Delivery to your inbox is not confirmed. Check your inbox and Spam/Junk.':'If you already requested an email, check your inbox and Spam/Junk before sending another.';
  }
  const authAction=fn=>safely(async e=>{if(authPending)return;authPending=true;verificationUI();try{await fn(e);}finally{authPending=false;verificationUI();}});
  async function sendVerification(){
    const user=api.auth.currentUser;if(!user||user.emailVerified)return;
    message('Requesting a verification email…');const request=verification.send(user.uid,()=>api.verify());verificationUI();
    try{await request;if(api.auth.currentUser?.uid===user.uid)message('Verification email requested. Check your inbox and Spam/Junk, open the link, then choose Check verification status.');}
    finally{verificationUI();}
  }
  function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  async function files(uid,epoch){const docs=await api.listDocuments(uid);if(epoch!==generation)return;const list=$('[data-files]');list.replaceChildren();for(const item of docs){const b=document.createElement('button');b.textContent='Download '+item.name;b.onclick=safely(async()=>download(await api.download(uid,item.path),item.name));list.append(b);}}
  async function account(user){const epoch=++generation;clearTimeout(timer);stopWatching?.();stopWatching=null;unsubscribe?.();unsubscribe=null;session?.close();session=null;bridge.leaveAccount();bridge.sessionChanged?.(user,api);$('[data-member]').hidden=!user;$('[data-login]').hidden=!!user;$('[data-verified]').hidden=true;verificationUI();if(!user){message('Signed out. Device-only records remain separate.');return;}$('[data-identity]').textContent=user.email;$('[data-verify]').hidden=user.emailVerified;$('[data-refresh]').hidden=user.emailVerified;if(!user.emailVerified){message('Email is not verified yet. Open the verification link from your inbox, then check verification status here. Device-only records remain available.');return;}
    session=new SyncSession({uid:user.uid,remote:api.remote,cache,onState:s=>{if(epoch===generation)message(labels[s]+(s==='saved'?new Date().toLocaleString():''));},onData:payload=>{if(epoch===generation)bridge.showAccount(payload?JSON.parse(payload):null);}});
    bridge.enterAccount(user.uid);bridge.setLoading(true);$('[data-verified]').hidden=false;const active=session;
    try{await active.open();}catch{}if(epoch!==generation)return;bridge.setLoading(false);
    unsubscribe=bridge.onChange(data=>{try{active.edit(JSON.stringify(data));clearTimeout(timer);timer=setTimeout(()=>active.sync().catch(()=>{}),900);}catch(err){message(err.message);throw err;}});
    stopWatching=api.watch(user.uid,latest=>{if(epoch!==generation||active.busy)return;if(active.state.dirty){if((latest?.revision||0)!==active.state.revision)message(labels.conflict);return;}if((latest?.revision||0)!==active.state.revision)active.loadOnline().catch(err=>message(err.message));});
    if(privateDocumentsEnabled)files(user.uid,epoch).catch(()=>$('[data-files]').textContent='Document storage is unavailable. Please retry later.');
  }
  api=await connect();setInterval(verificationUI,1000);api.observe(user=>account(user).catch(err=>message(authMessage(err))));
  $('[data-login]').onsubmit=authAction(async()=>{const form=$('[data-login]');const email=form.elements.email.value,password=form.elements.password.value;form.elements.password.value='';await api.signIn(email,password);});
  $('[data-register]').onclick=authAction(async()=>{const form=$('[data-login]');if(!form.reportValidity())return;if(form.elements.password.value.length<8)throw Error('Use at least 8 characters for a new account password.');const email=form.elements.email.value,password=form.elements.password.value;form.elements.password.value='';await api.register(email,password);try{await sendVerification();}catch(err){message('Your account was created, but the verification email request failed. '+authMessage(err));}});
  $('[data-reset]').onclick=authAction(async()=>{const email=$('[data-login]').elements.email;if(!email.reportValidity())return;await api.reset(email.value);message('If an account exists, follow the reset instructions sent to that email.');});
  $('[data-verify]').onclick=authAction(sendVerification);
  $('[data-refresh]').onclick=authAction(async()=>{if(Date.now()<nextCheckAt)return;nextCheckAt=Date.now()+10000;message('Checking verification status…');try{await account(await api.refresh());}catch(err){if(err.code==='auth/too-many-requests')nextCheckAt=Date.now()+300000;throw err;}});
  $('[data-sync]').onclick=safely(async()=>{if(session?.state.dirty)await session.sync();else await session?.loadOnline();});
  $('[data-import]').onclick=safely(async()=>{if(!session||!confirm('Copy the device-only plan into this signed-in account? Existing online content will be replaced by a new revision.'))return;session.edit(JSON.stringify(bridge.guestCopy()));bridge.showAccount(JSON.parse(session.state.payload));await session.sync();});
  $('[data-backup]').onclick=()=>{if(session?.state.payload)download(new Blob([session.state.payload],{type:'application/json'}),'eye-of-garden-account-backup.json');};
  $('[data-online]').onclick=safely(async()=>{if(session?.state.dirty&&!confirm('Have you downloaded your pending backup? Load the online copy and replace pending edits in this view?'))return;await session?.loadOnline();});
  $('[data-upload]').onsubmit=safely(async()=>{const input=$('[data-upload] input'),file=input.files[0],uid=api.auth.currentUser?.uid,epoch=generation;if(!uid||!file)return;message('Uploading privately…');await api.upload(uid,file);if(epoch!==generation)return;input.value='';await files(uid,epoch);message('Document uploaded to your private account.');});
  $('[data-out]').onclick=safely(async()=>{if(session?.state.dirty&&!confirm('Some changes are not online yet. Download a backup before signing out. Sign out now?'))return;await api.signOut();});
  window.addEventListener('online',()=>session?.sync().catch(()=>{}));
}
