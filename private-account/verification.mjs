// Client pacing only: Firebase may keep a server-side restriction for longer.
export class VerificationGate {
  constructor({storage,now=()=>Date.now()}={}) { this.storage=storage;this.now=now;this.memory=new Map();this.pending=new Set(); }
  read(uid) {
    let saved=this.memory.get(uid)||{};
    try { const raw=JSON.parse(this.storage?.getItem('eog_verification_'+uid)||'null');if(raw&&Number.isFinite(raw.until)&&raw.until>(saved.until||0))saved=raw; } catch {}
    return saved;
  }
  write(uid,state) { this.memory.set(uid,state);try{this.storage?.setItem('eog_verification_'+uid,JSON.stringify(state));}catch{} }
  state(uid) { const saved=this.read(uid);return {...saved,pending:this.pending.has(uid),seconds:Math.max(0,Math.ceil(((saved.until||0)-this.now())/1000))}; }
  async send(uid,request) {
    if(!uid)throw Error('Sign in before requesting verification.');
    const before=this.state(uid);
    if(before.pending||before.seconds){const error=Error('Please wait before requesting another verification email.');error.code='verification/cooldown';throw error;}
    this.pending.add(uid);this.write(uid,{...before,until:this.now()+60000});
    try { await request();this.write(uid,{until:this.now()+60000,sentAt:this.now(),limited:false,failed:false}); }
    catch(error) { this.write(uid,{...before,until:this.now()+(error.code==='auth/too-many-requests'?300000:60000),limited:error.code==='auth/too-many-requests',failed:true});throw error; }
    finally { this.pending.delete(uid); }
  }
}

export function authMessage(error) {
  const messages={
    'auth/too-many-requests':'Firebase has temporarily limited requests. Stop retrying for now. Check your inbox and Spam/Junk for an earlier verification email. Firebase does not give us an exact unblock time.',
    'auth/network-request-failed':'The connection failed. Check your internet connection before trying again.',
    'auth/invalid-credential':'The email or password was not accepted. Check the details and try again.',
    'auth/invalid-email':'Enter a valid email address.',
    'auth/email-already-in-use':'An account already uses this email. Choose Sign in instead.',
    'auth/weak-password':'Choose a stronger password with at least 8 characters.',
    'auth/user-disabled':'This account is disabled. Contact the site owner for help.',
    'auth/operation-not-allowed':'This sign-in method is unavailable. Please contact the site owner.',
    'auth/quota-exceeded':'The service has reached its request limit. Please try later.'
  };
  return messages[error?.code]||(error?.code?.startsWith('auth/')?'The account request could not be completed. Please try later.':error?.message)||'Could not complete this action.';
}
