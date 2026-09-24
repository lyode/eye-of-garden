// Compare entered plans; do not infer clinical decisions or actual consumption.
const nextDay=d=>new Date(Date.parse(d+'T12:00:00Z')+86400000).toISOString().slice(0,10);
const key=r=>JSON.stringify([r.medicine.trim().toLowerCase(),r.dose,r.time,!!r.asNeeded,!!r.intakeDay]);
const timing=(a,b)=>(a.time<'06:00'?1:0)-(b.time<'06:00'?1:0)||a.time.localeCompare(b.time)||a.dose.localeCompare(b.dose);
export function planPeriods(report){
  const byDate=new Map();for(const row of report.rows){if(!byDate.has(row.date))byDate.set(row.date,[]);byDate.get(row.date).push(row);}
  const periods=[];for(let date=report.from;date<=report.to;date=nextDay(date)){
    const rows=byDate.get(date)||[],signature=JSON.stringify(rows.map(key).sort()),previous=periods.at(-1);
    if(previous?.signature===signature)previous.to=date;else periods.push({from:date,to:date,signature,rows});
  }
  return periods.map((p,i)=>({...p,changes:i&&p.rows.length&&periods[i-1].rows.length?comparePlans(periods[i-1].rows,p.rows):[],baseline:i===0||!periods[i-1].rows.length}));
}
export function comparePlans(before,after){
  const group=rows=>{const map=new Map();for(const r of rows){const name=r.medicine.trim().toLowerCase();if(!map.has(name))map.set(name,[]);map.get(name).push(r);}return map;};
  const old=group(before),current=group(after),changes=[];
  for(const name of [...new Set([...old.keys(),...current.keys()])].sort()){
    const a=old.get(name)||[],b=current.get(name)||[];
    if(JSON.stringify(a.map(key).sort())===JSON.stringify(b.map(key).sort()))continue;
    changes.push({medicine:(b[0]||a[0]).medicine,type:!a.length?'Added to recorded plan':!b.length?'No longer in recorded plan':'Dose / timing / frequency changed',before:[...a].sort(timing),after:[...b].sort(timing)});
  }
  return changes;
}
export function describePlan(rows){return rows.map(r=>r.time+(r.intakeDay&&r.time<'06:00'?' next morning':'')+' · '+r.dose+(r.asNeeded?' · as needed':'')).join('; ');}
export function renderPlanChanges(host,report){
  const el=(tag,text,parent=host)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;},periods=planPeriods(report);
  el('h3','Medication adjustments during this period');el('p','Changes below compare the plans entered in the tracker. They do not prove a doctor changed treatment or that a dose was taken. No comparison is inferred across a gap with no recorded plan.');
  for(const p of periods){
    const card=el('section','');card.className='plan-period';el('h4',p.from+(p.to!==p.from?' to '+p.to:''),card);
    if(!p.rows.length){el('p','No medication plan recorded for these dates.',card);continue;}
    if(p.baseline){el('p',p.from===report.from?'Plan at the start of your selected period':'Next available recorded plan after a gap',card);const medicines=new Map();for(const r of p.rows){if(!medicines.has(r.medicine))medicines.set(r.medicine,[]);medicines.get(r.medicine).push(r);}const list=el('ul','',card);for(const [name,rows] of medicines)el('li',name+': '+describePlan(rows.sort(timing)),list);}
    else if(p.changes.length){for(const c of p.changes){const item=el('div','',card);item.className='plan-change';el('strong',c.medicine+' · '+c.type,item);el('p','Before: '+(c.before.length?describePlan(c.before):'Not in previous recorded plan'),item);el('p','Now: '+(c.after.length?describePlan(c.after):'Not in this recorded plan'),item);}}
  }
  if(periods.length===1&&periods[0].rows.length)el('p','No changes to the recorded plan were found within these dates. Intake records may still vary from day to day.');
}
