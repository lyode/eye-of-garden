/* Reconnect the original garden scene and its existing star effects. */
(() => {
  const words={en:{title:'Night Garden',visit:'Visit the Night Garden',intro:'A quiet sky, with a little light for everyone.',leaf:'Back to My Leaf',pause:'Pause sparkling',resume:'Resume sparkling',sample:'Preview sky: fictional sample stars.',help:'Select a star to explore the original garden.'},ms:{title:'Taman Malam',visit:'Lawati Taman Malam',intro:'Langit tenang, dengan sedikit cahaya untuk semua.',leaf:'Kembali ke Daun Saya',pause:'Jeda kerlipan',resume:'Sambung kerlipan',sample:'Langit pratonton: bintang contoh rekaan.',help:'Pilih bintang untuk menerokai taman asal.'},zh:{title:'夜间花园',visit:'走进夜间花园',intro:'安静的夜空，为每个人留一点光。',leaf:'返回我的叶子',pause:'暂停闪烁',resume:'继续闪烁',sample:'预览星空：虚构的示例星星。',help:'选择一颗星星，探索原来的花园。'}};
  let lang=document.getElementById('eogLanguage').value||'en',paused=false;
  const text=k=>(words[lang]||words.en)[k];
  const leafEntry=document.createElement('div');leafEntry.className='eog-surface night-entry';leafEntry.dataset.noTranslate='';document.getElementById('myLeaf').prepend(leafEntry);
  const homeEntry=document.createElement('aside');homeEntry.className='eog-surface night-entry night-home';homeEntry.dataset.noTranslate='';document.getElementById('home').append(homeEntry);
  const controls=document.createElement('div');controls.className='eog-surface night-controls';controls.dataset.noTranslate='';document.querySelector('#garden .garden-heading-row').before(controls);
  function render(){
    for(const entry of [leafEntry,homeEntry])entry.innerHTML=`<div><h3>${text('title')}</h3><p>${text('intro')}</p></div><button type="button" class="eog-button" data-eog-route="garden">✦ ${text('visit')}</button>`;
    controls.innerHTML=`<button type="button" class="eog-button eog-secondary" data-eog-route="myLeaf">← ${text('leaf')}</button><button type="button" class="eog-button eog-secondary" id="night-pause" aria-pressed="${paused}">${text(paused?'resume':'pause')}</button><p>${text(window.EOG_PREVIEW?'sample':'help')}</p>`;
    document.getElementById('night-pause').onclick=()=>{paused=!paused;document.getElementById('garden').classList.toggle('night-paused',paused);render();};
  }
  document.addEventListener('eog:language',e=>{lang=e.detail;render();});
  document.addEventListener('eog:navigation',e=>{if(e.detail==='garden')document.querySelector('.eog-header nav [data-eog-route="myLeaf"]').setAttribute('aria-current','page');});
  render();
})();
