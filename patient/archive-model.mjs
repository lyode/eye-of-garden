// A read-only snapshot for each completed day, with shared medication definitions.
// This is an accidental-edit safeguard, not a clinical signature or tamper-proof ledger.
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
const stamp=s=>typeof s==='string'&&Number.isFinite(Date.parse(s));
export const localDay=(now=new Date())=>[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
export function schedulesFor(data,date){const lock=data.lockedDays?.[date];if(lock)return lock.scheduleIds.map(id=>data.archiveSchedules[id]);const ids=data.dayPlans?.[date];return data.schedules.filter(s=>ids?ids.includes(s.id):!s.dayOnly&&s.start<=date&&(!s.end||s.end>=date));}
export function recordFor(data,id,date,time){const key=id+'|'+date+'|'+time;return data.lockedDays?.[date]?data.lockedDays[date].records[key]:data.records[key];}
export function remarksFor(data,date){const lock=data.lockedDays?.[date];return lock?[...lock.remarks,...lock.corrections.map(c=>({date,kind:'correction',text:c.text,recordedAt:c.recordedAt}))]:(data.remarks||[]).filter(r=>r.date===date);}
export function validateArchive(data){
  const locks=data.lockedDays,defs=data.archiveSchedules;if(locks===undefined&&defs===undefined)return;
  if(!locks||typeof locks!=='object'||Array.isArray(locks)||!defs||typeof defs!=='object'||Array.isArray(defs)||Object.keys(locks).length>10000)throw Error('Invalid saved history.');
  for(const [id,s] of Object.entries(defs)){if(!/^[a-z0-9-]+$/i.test(id)||!s||s.id!==id||typeof s.name!=='string'||!s.name||s.name.length>120||typeof s.dose!=='string'||s.dose.length>240||!Array.isArray(s.times)||!s.times.length||s.times.length>24||new Set(s.times).size!==s.times.length||s.times.some(t=>typeof t!=='string'||!/^([01]\d|2[0-3]):[0-5]\d(–([01]\d|2[0-3]):[0-5]\d)?$/.test(t)||t.includes('–')&&t.split('–')[1]<=t.split('–')[0])||typeof s.intakeDay!=='boolean'||typeof s.asNeeded!=='boolean'||s.instructions!==undefined&&(typeof s.instructions!=='string'||s.instructions.length>500))throw Error('Invalid saved medication.');}
  for(const [date,l] of Object.entries(locks)){
    if(!validDate(date)||!l||!stamp(l.lockedAt)||typeof l.timezone!=='string'||l.timezone.length>100||!Array.isArray(l.scheduleIds)||new Set(l.scheduleIds).size!==l.scheduleIds.length||l.scheduleIds.some(id=>!Object.hasOwn(defs,id))||!l.records||typeof l.records!=='object'||Array.isArray(l.records)||!Array.isArray(l.remarks)||!Array.isArray(l.corrections)||l.corrections.length>100)throw Error('Invalid saved day.');
    for(const [key,r] of Object.entries(l.records)){const [id,d,time,...extra]=key.split('|');if(extra.length||d!==date||!l.scheduleIds.includes(id)||!defs[id].times.includes(time)||!r||!['taken','skipped','missed','unknown'].includes(r.status)||typeof r.note!=='string'||r.note.length>500||r.status==='taken'&&!stamp(r.actual)||!Array.isArray(r.revisions))throw Error('Invalid saved intake.');}
    for(const r of l.remarks)if(!r||r.date!==date||typeof r.text!=='string'||r.text.length>1000||!stamp(r.recordedAt)||!['noteType','doctorAdvice','concern','effect','improvement'].includes(r.kind))throw Error('Invalid saved note.');
    for(const c of l.corrections)if(!c||typeof c.text!=='string'||!c.text.trim()||c.text.length>1000||!stamp(c.recordedAt))throw Error('Invalid correction note.');
  }
}
export function lockPeriod(data,from,to,now=new Date(),timezone=Intl.DateTimeFormat().resolvedOptions().timeZone){
  if(!validDate(from)||!validDate(to)||to<from||to>=localDay(now)||Date.parse(to)-Date.parse(from)>365*86400000)throw Error('Choose completed days before today, up to 366 days at a time.');
  const next=structuredClone(data);next.lockedDays??={};next.archiveSchedules??={};let count=0;
  for(let date=from;date<=to;date=new Date(Date.parse(date+'T12:00:00Z')+86400000).toISOString().slice(0,10)){
    if(next.lockedDays[date])continue;
    const schedules=schedulesFor(next,date),remarks=remarksFor(next,date);
    if(!schedules.length&&!remarks.length)continue;
    const following=new Date(Date.parse(date+'T12:00:00Z')+86400000).toISOString().slice(0,10);
    if(schedules.some(s=>s.intakeDay)&&now<new Date(following+'T06:00:00'))throw Error('This intake day continues until 6am the following morning. Lock it after that time.');
    const records={};for(const s of schedules){const definition={id:s.id,name:s.name,dose:s.dose,times:[...s.times],intakeDay:!!s.intakeDay,asNeeded:!!s.asNeeded,instructions:s.instructions||''};if(next.archiveSchedules[s.id]&&JSON.stringify(next.archiveSchedules[s.id])!==JSON.stringify(definition))throw Error('A medicine definition conflicts with saved history. Keep the original and create a new plan.');next.archiveSchedules[s.id]=definition;for(const time of s.times){const key=s.id+'|'+date+'|'+time;if(next.records[key])records[key]=structuredClone(next.records[key]);}}
    next.lockedDays[date]={lockedAt:now.toISOString(),timezone,scheduleIds:schedules.map(s=>s.id),records,remarks:structuredClone(remarks),corrections:[]};count++;
  }
  if(!count)throw Error('No new days to lock in this period. Existing locked days are already safe from ordinary edits.');
  validateArchive(next);return {data:next,count};
}
export function addCorrection(data,date,text,now=new Date()){
  if(!data.lockedDays?.[date])throw Error('Choose a locked day.');text=String(text).trim();if(!text||text.length>1000)throw Error('Write a correction note, up to 1,000 characters.');
  const next=structuredClone(data);next.lockedDays[date].corrections.push({text,recordedAt:now.toISOString()});validateArchive(next);return next;
}
// Restoring an older backup keeps this account's already locked snapshots.
export function preserveLockedHistory(current,incoming){
  const next=structuredClone(incoming);if(!Object.keys(current.lockedDays||{}).length)return next;
  next.lockedDays??={};next.archiveSchedules??={};
  for(const [id,s] of Object.entries(current.archiveSchedules||{})){if(next.archiveSchedules[id]&&JSON.stringify(next.archiveSchedules[id])!==JSON.stringify(s))throw Error('This backup conflicts with a locked medicine. Your current history has not changed.');next.archiveSchedules[id]=structuredClone(s);}
  for(const [date,l] of Object.entries(current.lockedDays)){
    const other=next.lockedDays[date];if(other){if(JSON.stringify({...other,corrections:[]})!==JSON.stringify({...l,corrections:[]}))throw Error('This backup has a different locked copy of '+date+'. Your current history has not changed.');const corrections=[...l.corrections];for(const c of other.corrections)if(!corrections.some(x=>x.text===c.text&&x.recordedAt===c.recordedAt))corrections.push(c);next.lockedDays[date]={...structuredClone(l),corrections:corrections.sort((a,b)=>a.recordedAt.localeCompare(b.recordedAt))};}else next.lockedDays[date]=structuredClone(l);
  }
  validateArchive(next);return next;
}
