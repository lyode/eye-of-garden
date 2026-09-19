import {ConflictError} from './sync-core.mjs';
import {firebaseConfig,privateDocumentsEnabled} from './config.mjs';
export async function connectFirebase(){
  const [appSDK,authSDK,dbSDK,fileSDK]=await Promise.all([
    import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'),
    privateDocumentsEnabled ? import('https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js') : Promise.resolve(null)
  ]);
  // Separate auth instance from the legacy administration page.
  const app=appSDK.getApps().find(a=>a.name==='private-health')||appSDK.initializeApp(firebaseConfig,'private-health');
  const auth=authSDK.getAuth(app),db=dbSDK.getFirestore(app),storage=fileSDK?.getStorage(app);
  await authSDK.setPersistence(auth,authSDK.browserSessionPersistence);
  const ensure=uid=>{if(auth.currentUser?.uid!==uid||!auth.currentUser.emailVerified)throw Error('Sign in with a verified email first.');};
  const reference=uid=>dbSDK.doc(db,'healthAccounts',uid,'medication','current');
  return {
    auth,
    observe:fn=>authSDK.onAuthStateChanged(auth,fn),
    signIn:(email,password)=>authSDK.signInWithEmailAndPassword(auth,email,password),
    register:(email,password)=>authSDK.createUserWithEmailAndPassword(auth,email,password),
    verify:()=>authSDK.sendEmailVerification(auth.currentUser),
    async refresh(){await auth.currentUser.reload();await auth.currentUser.getIdToken(true);return auth.currentUser;},
    reset:email=>authSDK.sendPasswordResetEmail(auth,email),
    signOut:()=>authSDK.signOut(auth),
    watch(uid,fn){ensure(uid);return dbSDK.onSnapshot(reference(uid),snap=>{if(!snap.metadata.fromCache)fn(snap.exists()?snap.data():null);},()=>{});},
    remote:{
      async read(uid){ensure(uid);const snap=await dbSDK.getDocFromServer(reference(uid));return snap.exists()?snap.data():null;},
      async commit(uid,expected,payload){ensure(uid);return dbSDK.runTransaction(db,async tx=>{const target=reference(uid),snap=await tx.get(target),revision=snap.exists()?snap.data().revision:0;if(revision!==expected)throw new ConflictError();const next={revision:revision+1,payload,updatedAt:dbSDK.serverTimestamp()};tx.set(target,next);tx.set(dbSDK.doc(db,'healthAccounts',uid,'history',String(next.revision)),next);return next.revision;});}
    },
    async listDocuments(uid){ensure(uid);if(!storage)throw Error('Document uploads are not enabled.');const items=await fileSDK.listAll(fileSDK.ref(storage,'privateHealth/'+uid));return Promise.all(items.items.map(async ref=>{const meta=await fileSDK.getMetadata(ref);return {path:ref.fullPath,name:meta.customMetadata?.displayName||ref.name,size:meta.size};}));},
    async upload(uid,file){ensure(uid);if(!storage)throw Error('Document uploads are not enabled.');if(!['application/pdf','image/jpeg','image/png'].includes(file.type)||file.size>10*1024*1024)throw Error('Choose a PDF, JPG or PNG up to 10 MB.');const destination=fileSDK.ref(storage,'privateHealth/'+uid+'/'+crypto.randomUUID());await fileSDK.uploadBytes(destination,file,{contentType:file.type,customMetadata:{displayName:file.name.slice(0,160)}});},
    async download(uid,path){ensure(uid);if(!storage)throw Error('Document uploads are not enabled.');if(!path.startsWith('privateHealth/'+uid+'/'))throw Error('Wrong account');return fileSDK.getBlob(fileSDK.ref(storage,path));}
  };
}
