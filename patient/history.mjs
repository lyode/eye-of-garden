import {validDate} from './records.mjs?v=20260920-intakeday1';

// Historical plans are additions to the archive, with overrides only on named days.
// Unknown intake is never promoted to taken; no actual time is manufactured.
export function prepareHistory(data,file,now=new Date().toISOString()){
  if(file?.format!=='eye-of-garden-history'||file.version!==1||!/^[a-z0-9-]{1,60}$/.test(file.id)||!Array.isArray(file.days)||!file.days.length||file.days.length>93)throw Error('Choose a valid historical-plan file (up to 93 days).');
  const next=structuredClone(data),seen=new Set(),preview=[];
  next.dayPlans=next.dayPlans||{};next.remarks=next.remarks||[];
  const text=(value,max,label)=>{if(typeof value!=='string'||!value.trim()||value.length>max)throw Error('Check '+label+'.');return value.trim();};
  for(const entry of file.days){
    const date=entry.date;
    if(!validDate(date)||seen.has(date)||typeof entry.intakeDay!=='boolean'||!Array.isArray(entry.medicines)||entry.medicines.length>100||!Array.isArray(entry.notes)||entry.notes.length>10)throw Error('Check the dates and medicines in the history file.');
    seen.add(date);if(data.lockedDays?.[date])throw Error(date+' is locked. Add a correction note instead. No days were changed.');
    if(Object.keys(data.records).some(key=>key.split('|')[1]===date))throw Error(date+' already has intake records. No days were changed.');
    const prefix='history-'+file.id+'-'+date+'-';
    if(data.schedules.some(s=>s.id.startsWith(prefix)))throw Error('This history has already been added. Use Edit this day for corrections.');
    const oldIds=data.dayPlans?.[date];
    const previous=data.schedules.filter(s=>oldIds?oldIds.includes(s.id):!s.dayOnly&&s.start<=date&&(!s.end||s.end>=date)).flatMap(s=>s.times.map(time=>({name:s.name,dose:s.dose,time})));
    const list=entry.medicines.map((m,i)=>{
      const name=text(m.name,120,'medicine name'),dose=text(m.dose,240,'dose'),time=m.time;
      const validTime=t=>typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t);
      const parts=typeof time==='string'?time.split('–'):[];
      if(!parts.length||parts.length>2||parts.some(t=>!validTime(t))||parts.length===2&&parts[1]<=parts[0]||!['unknown','skipped'].includes(m.status))throw Error('Historical entries must have valid times and be unrecorded or explicitly skipped.');
      const instructions=m.instructions===undefined?'':text(m.instructions,500,'medicine note');
      const schedule={id:prefix+i,name,dose,times:[time],start:date,end:date,dayOnly:true,intakeDay:entry.intakeDay,instructions,createdAt:now};
      if(m.status==='skipped')next.records[schedule.id+'|'+date+'|'+time]={status:'skipped',actual:null,note:'Patient reported this session omitted in historical notes.',recordedAt:now,revisions:[]};
      return schedule;
    });
    next.schedules.push(...list);next.dayPlans[date]=list.map(s=>s.id);
    for(const note of entry.notes)next.remarks.push({date,kind:'noteType',text:text(note,1000,'daily note'),recordedAt:now});
    preview.push({date,intakeDay:entry.intakeDay,previous,medicines:entry.medicines,notes:entry.notes});
  }
  return {next,preview};
}

export function mountHistoryImport(host,{read,validate,save}){
  if(host.querySelector('[data-history-panel]'))return;
  const panel=document.createElement('details');panel.className='eog-panel';panel.dataset.historyPanel='';
  panel.innerHTML='<summary>Add historical day plans</summary><p>Review a historical-plan file before saving. It replaces the plan only on listed days, retains earlier schedules, and never marks doses taken. Days with intake records are protected.</p><label>Historical-plan file<input type="file" accept="application/json,.json" data-history-file></label><div data-history-review></div><p data-history-status role="status"></p><button type="button" class="eog-button" data-history-save disabled>Save reviewed history</button>';
  host.append(panel);const review=panel.querySelector('[data-history-review]'),message=panel.querySelector('[data-history-status]'),button=panel.querySelector('[data-history-save]');let file=null,source=null;
  const add=(tag,text,parent=review)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;};
  panel.querySelector('input').onchange=async e=>{button.disabled=true;file=null;review.replaceChildren();message.textContent='';
    try{const selected=e.target.files?.[0];if(!selected)return;if(selected.size>1000000)throw Error('Choose a history file smaller than 1 MB.');const parsed=JSON.parse(await selected.text()),data=read();const result=prepareHistory(data,parsed);validate(result.next);source=JSON.stringify(data);file=parsed;
      add('h3',result.preview.length+' day(s) to review');
      for(const day of result.preview){const detail=add('details','');add('summary',day.date+' · '+day.medicines.length+' medicine entries · '+day.medicines.filter(m=>m.status==='skipped').length+' reported skipped',detail);add('p',day.intakeDay?'Intake day: 6am to 5:59am next morning.':'Calendar date.',detail);const old=add('details','',detail);add('summary','Previous plan (retained in archive)',old);for(const m of day.previous)add('p',m.time+' · '+m.name+' · '+m.dose,old);add('h4','Plan to save',detail);for(const m of day.medicines)add('p',m.time+(day.intakeDay&&m.time<'06:00'?' next morning':'')+' · '+m.name+' · '+m.dose+' · '+(m.status==='skipped'?'Reported skipped':'Intake not confirmed')+(m.instructions?' · '+m.instructions:''),detail);for(const note of day.notes)add('p',note,detail);}
      message.textContent='Ready for review. No changes have been saved.';button.disabled=false;
    }catch(e){message.textContent=e.message||'Unable to read this file. Existing records are unchanged.';}
  };
  button.onclick=()=>{try{if(!file)return;if(JSON.stringify(read())!==source)throw Error('Your records changed during review. Select the file again to refresh the comparison.');const result=prepareHistory(read(),file);validate(result.next);save(result.next,result.preview[0].date);button.disabled=true;file=null;message.textContent='Historical plans saved. No doses marked taken. Check your account sync status below.';}catch(e){message.textContent=e.message;}};
}
