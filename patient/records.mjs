export function cleanProfile(value={}) {
  const limits={name:100,role:24,condition:120,doctor:100,clinic:120,notes:500};
  const result={};for(const [key,max] of Object.entries(limits)){if(value[key]!==undefined&&typeof value[key]!=='string')throw Error('Check your profile fields.');result[key]=(value[key]||'').trim().slice(0,max);}
  if(!['','patient','care-partner'].includes(result.role))throw Error('Choose patient or care partner.');
  return result;
}
export function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===value;}
export function buildReport(data,from,to,{includeNotes=false,timezone=Intl.DateTimeFormat().resolvedOptions().timeZone}={}){
  if(!validDate(from)||!validDate(to)||to<from||Date.parse(to)-Date.parse(from)>92*86400000)throw Error('Choose a date range of up to 93 days.');
  const rows=[];
  for(let date=from;date<=to;date=new Date(Date.parse(date+'T12:00:00Z')+86400000).toISOString().slice(0,10)){
    const plans=data.dayPlans&&Object.hasOwn(data.dayPlans,date)?data.dayPlans[date]:null;
    const schedules=(data.schedules||[]).filter(s=>plans?plans.includes(s.id):date>=s.start&&(!s.end||date<=s.end)&&!s.dayOnly);
    const items=schedules.flatMap(s=>s.times.map(time=>({s,time}))).sort((a,b)=>(a.time<'06:00'?1:0)-(b.time<'06:00'?1:0)||a.time.localeCompare(b.time));
    for(const {s,time} of items){const r=data.records?.[s.id+'|'+date+'|'+time];rows.push({date,time,medicine:s.name,dose:s.dose,asNeeded:!!s.asNeeded,status:r?.status||'unknown',actual:r?.actual||null,note:includeNotes?r?.note||'':'',corrections:r?.revisions?.length||0});}
  }
  if(rows.length>15000)throw Error('This report is too large. Choose fewer days.');
  return {version:1,patient:cleanProfile(data.profile).name,from,to,timezone,generatedAt:new Date().toISOString(),rows,remarks:includeNotes?(data.remarks||[]).filter(r=>r.date>=from&&r.date<=to).map(({date,kind,text})=>({date,kind,text})):[]};
}
export function reportSummary(report){const count={scheduled:0,taken:0,skipped:0,missed:0,unknown:0,asNeededTaken:0};for(const r of report.rows){if(r.asNeeded){if(r.status==='taken')count.asNeededTaken++;continue;}count.scheduled++;count[['taken','skipped','missed','unknown'].includes(r.status)?r.status:'unknown']++;}return count;}
export function renderReport(host,report){
  host.replaceChildren();const add=(tag,text,parent=host)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;};
  add('h2',report.patient?report.patient+' — medication review':'Medication review');add('p',report.from+' to '+report.to+' · Recorded time zone: '+report.timezone);
  add('p','Patient-entered records for clinical discussion. Unrecorded doses are not assumed missed. Overnight entries keep their actual calendar dates.');
  const summary=reportSummary(report);add('p',`${summary.taken} recorded taken · ${summary.unknown} not recorded · ${summary.skipped} skipped · ${summary.missed} marked missed · ${summary.asNeededTaken} as-needed doses recorded taken.`);
  add('p','Report prepared: '+new Date(report.generatedAt).toLocaleString()+'. This is the last report the patient chose to share; it does not update automatically.');
  const wrap=add('div','');wrap.className='review-table-wrap';const table=add('table','',wrap);table.className='review-table';const head=add('tr','',add('thead','',table));for(const title of ['Date / planned time','Medicine / dose','Record','Actual time','Note'])add('th',title,head).scope='col';const body=add('tbody','',table);
  for(const r of report.rows){const tr=add('tr','',body);add('td',r.date+' · '+r.time,tr);add('td',r.medicine+' — '+r.dose+(r.asNeeded?' (as needed)':''),tr);add('td',r.status==='unknown'?'Not recorded':r.status,tr);let actual='—';if(r.actual){try{actual=new Intl.DateTimeFormat('en-GB',{dateStyle:'short',timeStyle:'short',timeZone:report.timezone}).format(new Date(r.actual));}catch{actual=r.actual;}}add('td',actual,tr);add('td',r.note+(r.corrections?' · '+r.corrections+' correction(s) recorded':''),tr);}
  if(!report.rows.length)add('p','No planned doses in this date range.');
  if(report.remarks.length){add('h3','Notes selected by the patient');for(const r of report.remarks)add('p',r.date+' · '+r.text);}
}
