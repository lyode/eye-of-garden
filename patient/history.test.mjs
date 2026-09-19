import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {prepareHistory} from './history.mjs';
import {buildReport,medicationSummary} from './records.mjs';
const data={version:1,profile:{name:'Example'},schedules:[{id:'base',name:'Example medicine',dose:'old plan',start:'2026-01-01',end:null,times:['07:00','04:00']}],records:{'base|2026-08-01|07:00':{status:'taken',actual:'2026-08-01T07:00:00Z',note:'Preserve',revisions:[]}},remarks:[]};
const file={format:'eye-of-garden-history',version:1,id:'example',days:[{date:'2026-05-23',intakeDay:true,medicines:[{name:'Example medicine',dose:'new plan',time:'07:00',status:'unknown'},{name:'Example medicine',dose:'overnight',time:'04:00–05:00',status:'skipped'}],notes:['Patient reported fewer sessions; no confirmed intake times.']}]};
const original=JSON.stringify(data),result=prepareHistory(data,file);
assert.equal(JSON.stringify(data),original);assert.deepEqual(result.next.records['base|2026-08-01|07:00'],data.records['base|2026-08-01|07:00']);assert.deepEqual(result.next.schedules[0],data.schedules[0]);assert.equal(result.preview[0].previous.length,2);
const report=buildReport(result.next,'2026-05-23','2026-05-23',{includeNotes:true});
assert.equal(report.rows.length,2);assert.equal(report.rows[0].status,'unknown');assert.equal(report.rows[1].status,'skipped');assert.equal(report.rows[1].date,'2026-05-23');assert.equal(report.rows[1].scheduledDate,'2026-05-24');assert.equal(report.rows[1].actual,null);assert.equal(report.remarks.length,1);
assert.equal(buildReport(result.next,'2026-05-24','2026-05-24').rows[0].dose,'old plan');
assert.throws(()=>prepareHistory(result.next,file));
const blocked=structuredClone(file);blocked.days[0].date='2026-08-01';assert.throws(()=>prepareHistory(data,blocked));assert.equal(JSON.stringify(data),original);
for(const change of [f=>f.days.push(f.days[0]),f=>f.days[0].medicines[0].status='taken',f=>f.days[0].medicines[0].time='25:00',f=>f.days[0].notes=['x'.repeat(1001)],f=>f.days[0].intakeDay='yes']){const bad=structuredClone(file);change(bad);assert.throws(()=>prepareHistory(data,bad));}
const boundary=structuredClone(file);boundary.days[0].date='2026-12-31';const boundaryReport=buildReport(prepareHistory(data,boundary).next,'2026-12-31','2026-12-31');assert.equal(boundaryReport.rows[1].scheduledDate,'2027-01-01');
const mixed={rows:[{...report.rows[1],intakeDay:false},{...report.rows[1]}]};assert.equal(medicationSummary(mixed).length,2);
// The main tracker and report agree about overnight dates without changing record keys.
const source=fs.readFileSync(new URL('../medication.js',import.meta.url),'utf8');const decl=['day','slotStart','scheduledDate'].map(n=>source.match(new RegExp('  const '+n+'=[^\\n]+'))[0]).join('\n');const context=vm.createContext({});vm.runInContext(decl,context);
assert.equal(vm.runInContext("scheduledDate('2026-12-31','04:00–05:00',true)",context),'2027-01-01');assert.equal(vm.runInContext("scheduledDate('2026-12-31','06:00',true)",context),'2026-12-31');assert.equal(vm.runInContext("scheduledDate('2026-12-31','04:00',false)",context),'2026-12-31');
console.log('PASS: atomic historical overrides, duplicate and intake-record protection, no invented taken doses, unchanged other dates, 6am boundaries, next-morning report dates and preserved record IDs.');
