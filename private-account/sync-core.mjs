// Pure synchronization model. Each account has a separate cache and revision.
export class ConflictError extends Error { constructor(){super('Another device changed these records. Download your pending copy, then load the online copy.');this.name='ConflictError';} }
export class SyncSession {
  constructor({uid,remote,cache,onState=()=>{},onData=()=>{}}){this.uid=uid;this.remote=remote;this.cache=cache;this.onState=onState;this.onData=onData;this.closed=false;this.busy=null;this.counter=0;this.state=cache.read(uid)||{revision:0,payload:null,dirty:false};}
  saveCache(){this.cache.write(this.uid,this.state);}
  async open(){
    if(this.state.payload)this.onData(this.state.payload);
    try{const latest=await this.remote.read(this.uid);if(this.closed)return;
      if(this.state.dirty){if((latest?.revision||0)!==this.state.revision){this.onState('conflict');return;}return this.sync();}
      this.state={revision:latest?.revision||0,payload:latest?.payload||null,dirty:false};this.saveCache();this.onData(this.state.payload);this.onState('ready');
    }catch(e){this.onState(this.state.payload?'offline':'unavailable');throw e;}
  }
  edit(payload){if(this.closed)throw Error('Signed out');if(typeof payload!=='string'||new TextEncoder().encode(payload).length>700000)throw Error('Record is too large to sync. Download a backup.');this.state={...this.state,payload,dirty:true};this.counter++;this.saveCache();this.onState('pending');}
  sync(){if(this.closed)return Promise.resolve();if(this.busy)return this.busy;this.busy=this.flush().finally(()=>{this.busy=null;});return this.busy;}
  async flush(){
    try{while(!this.closed&&this.state.dirty){const sent=this.state.payload,version=this.counter,expected=this.state.revision;this.onState('saving');
      const revision=await this.remote.commit(this.uid,expected,sent);if(this.closed)return;
      this.state={revision,payload:this.state.payload,dirty:this.counter!==version};this.saveCache();
    }if(!this.closed)this.onState('saved');}catch(e){if(!this.closed)this.onState(e instanceof ConflictError?'conflict':'offline');throw e;}
  }
  async loadOnline(){if(this.busy)throw Error('Wait for the current save to finish.');const version=this.counter;const latest=await this.remote.read(this.uid);if(this.closed)return;if(this.counter!==version||this.busy){this.onState('conflict');throw new ConflictError();}this.counter++;this.state={revision:latest?.revision||0,payload:latest?.payload||null,dirty:false};this.saveCache();this.onData(this.state.payload);this.onState('ready');}
  close(){this.closed=true;this.onData(null);}
}
