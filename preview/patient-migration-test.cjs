// Profile additions must preserve existing schedules, records, corrections and day plans.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../medication.js'),'utf8');
const decl=['day','validDay','validTime','slotStart','slotEnd','validSlot','palette'].map(n=>source.match(new RegExp('  const '+n+'=[^\\n]+'))[0]).join('\n');
const validation=source.slice(source.indexOf('  function validate(d)'),source.indexOf('  let unreadableStoredRecord'));
const data={version:1,schedules:[{id:'legacy',name:'Test',dose:'Test',times:['06:00'],start:'2026-09-01',end:null}],records:{'legacy|2026-09-19|06:00':{status:'taken',actual:'2026-09-18T22:05:00Z',note:'Keep',revisions:[{note:'Original'}]}},remarks:[{date:'2026-09-19',kind:'doctorAdvice',text:'Patient note',recordedAt:'2026-09-19T01:00:00Z'}],profile:{name:'Test Patient'}};
const ctx=vm.createContext({data});vm.runInContext(decl+'\n'+validation,ctx);const result=vm.runInContext('JSON.stringify(validate(JSON.parse(JSON.stringify(data))))',ctx);assert.deepEqual(JSON.parse(result),data);data.profile.name='x'.repeat(101);assert.throws(()=>vm.runInContext('validate(data)',ctx));
console.log('PASS: profile and advice additions preserve legacy schedules, actual intake and correction history.');

data.profile={name:'Test Patient',nickname:'Alex',bio:'My garden',allergies:'Private'};data.appearance={palette:'ocean',mode:'night',accent:'#112233',fit:'cover',textSize:'large'};
assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(validate(JSON.parse(JSON.stringify(data))))',ctx)),data);
data.appearance.mode='invalid';assert.throws(()=>vm.runInContext('validate(data)',ctx));
console.log('PASS: personalized profile and theme round-trip without changing medication records; malformed theme rejected.');
