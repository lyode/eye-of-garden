/* Navigation and tab-only drafts. This module never sends notes or moods to a server. */
(() => {
  'use strict';
  const copy = {
    en: {
      home:'Home',room:'My Room',garden:'My Garden',learn:'Learn',stories:'Stories',iris:'Iris',health:'My Health',language:'Language',
      eyebrow:'A little space, just for you',hero:'For every step<br>of your journey.',intro:'Keep medication times, daily observations and doctor reviews together. A supportive space for people living with Parkinson’s and other movement-related conditions, and the families beside them.',enter:'Open medication tracker',explore:'Explore the garden',pace:'Come as you are. Go at your own pace.',photo:'There is room for you<br>to grow here.',welcome:'You belong here.',belong:'For yourself. For someone you love. For the days in between.',start:'What feels right today?',startSub:'A small moment is a good place to begin.',
      roomDesc:'Put a thought into words. Make a little room for yourself.',gardenDesc:'Visit your leaf and spend a gentle moment in the garden.',storyDesc:'Find a new perspective in the stories already growing here.',learnDesc:'Find information for yourself and the people beside you.',write:'Write a little',visit:'Visit my leaf',read:'Read a story',find:'Explore resources',irisTitle:'A word with Iris',irisDesc:'A place to share with the Garden team, or read a message from Iris.',irisAction:'Meet Iris',footer:'An independent space for support, reflection and connection.',healthLink:'About My Health',back:'← Back home',
      roomIntro:'A quiet moment, in your own words.',mood:'How does today feel?',good:'A good day',okay:'Somewhere in between',hard:'A difficult day',moodReply:'Thank you for checking in. There is no right way to feel.',noteLabel:'What would you like to put into words?',placeholder:'Today, I’m thinking about…',draftHelp:'This draft stays in this open tab. Download it to keep a copy. It is not saved to your account or sent to Iris.',download:'Download my note',clear:'Clear draft',undo:'Undo clear',downloaded:'Your note is ready to download. Keep it somewhere you trust.',empty:'Write a little first, then download your note.',cleared:'Draft cleared. You can undo this while this tab stays open.',restored:'Your draft is back.',chars:'characters',accountLater:'Account saving is being prepared. For now, closing or refreshing this tab will clear your draft and check-in.',
      irisIntro:'A listening place in the Garden.',irisExplain:'Iris brings together messages from the Garden team and words shared by members. Messages you send here go to the team; they are different from your own notes in My Room.',send:'Write to the Garden team',messages:'Read Iris messages',response:'Replies are not immediate. This is a space for support and reflection, not medical care.',
      learnIntro:'Find a little understanding.',learnText:'Start with information from established organisations. These first resources focus on Parkinson’s and care partners.',resource1:'Understanding Parkinson’s',resource1Text:'Browse information and resources from Parkinson’s UK.',resource2:'For families and care partners',resource2Text:'Explore care partner resources from the Parkinson’s Foundation.',external:'External website · English',sourceDate:'Links checked 13 September 2026. These organisations publish their own content; a link does not imply a partnership or professional review of Eye of Garden.',
      healthIntro:'A thoughtful next step.',healthText:'Personal health records and medication schedules are planned for a later stage, after secure accounts and access controls are ready.',healthSub:'Health records cannot be saved here yet. Doctor monitoring is not currently available.',healthAction:'Explore learning resources',preview:'Design preview · Sample garden · Nothing is sent to the live service',skip:'Skip to content'
    },
    ms: {
      home:'Utama',room:'Ruang Saya',garden:'Taman Saya',learn:'Belajar',stories:'Kisah',iris:'Iris',health:'Kesihatan Saya',language:'Bahasa',
      eyebrow:'Sedikit ruang, untuk diri anda',hero:'Untuk setiap langkah<br>perjalanan anda.',intro:'Ruang yang tenang untuk mereka yang hidup dengan keadaan berkaitan pergerakan, serta keluarga dan pasangan yang menemani mereka.',enter:'Buka penjejak ubat',explore:'Terokai taman',pace:'Jadilah diri anda. Ikut rentak sendiri.',photo:'Ada ruang untuk anda<br>bertumbuh di sini.',welcome:'Anda dialu-alukan di sini.',belong:'Untuk diri sendiri. Untuk insan tersayang. Untuk setiap hari.',start:'Apa yang anda perlukan hari ini?',startSub:'Mulakan dengan satu detik kecil.',
      roomDesc:'Luahkan fikiran anda. Beri sedikit ruang untuk diri sendiri.',gardenDesc:'Lawati daun anda dan nikmati detik yang tenang di taman.',storyDesc:'Temui pandangan baharu melalui kisah yang tumbuh di sini.',learnDesc:'Cari maklumat untuk diri sendiri dan insan di sisi anda.',write:'Tulis sedikit',visit:'Lawati daun saya',read:'Baca kisah',find:'Terokai sumber',irisTitle:'Berbicara dengan Iris',irisDesc:'Kongsi dengan pasukan Taman, atau baca pesanan daripada Iris.',irisAction:'Kenali Iris',footer:'Ruang bebas untuk sokongan, renungan dan hubungan.',healthLink:'Tentang Kesihatan Saya',back:'← Kembali ke utama',
      roomIntro:'Detik tenang, dengan kata-kata anda sendiri.',mood:'Bagaimana perasaan anda hari ini?',good:'Hari yang baik',okay:'Biasa sahaja',hard:'Hari yang sukar',moodReply:'Terima kasih kerana berkongsi. Semua perasaan anda diterima.',noteLabel:'Apa yang ingin anda luahkan?',placeholder:'Hari ini, saya memikirkan…',draftHelp:'Draf ini kekal dalam tab yang terbuka ini. Muat turun untuk menyimpan salinan. Ia tidak disimpan dalam akaun atau dihantar kepada Iris.',download:'Muat turun nota',clear:'Kosongkan draf',undo:'Batal pengosongan',downloaded:'Nota anda sedia dimuat turun. Simpan di tempat yang anda percayai.',empty:'Tulis sedikit dahulu, kemudian muat turun nota anda.',cleared:'Draf dikosongkan. Anda boleh memulihkannya selagi tab ini terbuka.',restored:'Draf anda dipulihkan.',chars:'aksara',accountLater:'Simpanan akaun sedang disediakan. Buat masa ini, menutup atau memuat semula tab ini akan mengosongkan draf dan catatan perasaan anda.',
      irisIntro:'Tempat untuk mendengar di Taman.',irisExplain:'Iris menghimpunkan pesanan pasukan Taman dan kata-kata ahli. Pesanan yang anda hantar di sini diterima oleh pasukan; ia berbeza daripada nota anda dalam Ruang Saya.',send:'Tulis kepada pasukan Taman',messages:'Baca pesanan Iris',response:'Balasan tidak serta-merta. Ini ruang untuk sokongan dan renungan, bukan rawatan perubatan.',
      learnIntro:'Memahami, sedikit demi sedikit.',learnText:'Mulakan dengan maklumat daripada organisasi yang dikenali. Sumber awal ini memfokuskan Parkinson dan rakan penjagaan.',resource1:'Memahami Parkinson',resource1Text:'Layari maklumat dan sumber daripada Parkinson’s UK.',resource2:'Untuk keluarga dan rakan penjagaan',resource2Text:'Terokai sumber penjagaan daripada Parkinson’s Foundation.',external:'Laman web luar · Bahasa Inggeris',sourceDate:'Pautan disemak pada 13 September 2026. Organisasi ini menerbitkan kandungan sendiri; pautan tidak bermaksud kerjasama atau semakan profesional terhadap Eye of Garden.',
      healthIntro:'Langkah seterusnya yang teliti.',healthText:'Rekod kesihatan peribadi dan jadual ubat dirancang untuk peringkat seterusnya, selepas akaun selamat dan kawalan akses tersedia.',healthSub:'Rekod kesihatan belum boleh disimpan di sini. Pemantauan doktor belum tersedia.',healthAction:'Terokai sumber pembelajaran',preview:'Pratonton reka bentuk · Taman contoh · Tiada data dihantar ke perkhidmatan langsung',skip:'Langkau ke kandungan'
    },
    zh: {
      home:'首页',room:'我的空间',garden:'我的花园',learn:'了解更多',stories:'故事',iris:'Iris',health:'我的健康',language:'语言',
      eyebrow:'给自己，一点小小的空间',hero:'陪伴你旅程中的<br>每一步。',intro:'为有运动相关状况的人，以及陪伴他们的家人和伴侣，留一处温柔的空间。',enter:'打开用药追踪',explore:'逛逛花园',pace:'做你自己。按自己的节奏来。',photo:'在这里，<br>有属于你的成长空间。',welcome:'这里欢迎你。',belong:'为了自己。为了所爱的人。为了每一个平凡的日子。',start:'今天，你想做些什么？',startSub:'从一个小小的片刻开始，就很好。',
      roomDesc:'把心里的想法写下来，给自己留一点空间。',gardenDesc:'看看你的叶子，在花园里度过片刻安宁。',storyDesc:'在这里慢慢生长的故事中，发现新的视角。',learnDesc:'为自己和身边的人，寻找有用的信息。',write:'写下几句话',visit:'看看我的叶子',read:'读一个故事',find:'浏览资源',irisTitle:'和 Iris 说说话',irisDesc:'与花园团队分享，或读一封 Iris 的来信。',irisAction:'认识 Iris',footer:'一个独立的空间，给予支持、思考与连接。',healthLink:'关于我的健康',back:'← 返回首页',
      roomIntro:'用自己的话，留住一个安静的片刻。',mood:'今天感觉怎么样？',good:'不错的一天',okay:'平平常常',hard:'有些艰难',moodReply:'谢谢你停下来感受自己。每一种感受，都可以被接纳。',noteLabel:'有什么想写下来的？',placeholder:'今天，我在想……',draftHelp:'草稿只保留在当前打开的标签页中。请下载以保留副本。它不会保存到账号，也不会发送给 Iris。',download:'下载我的笔记',clear:'清空草稿',undo:'撤销清空',downloaded:'你的笔记已准备好下载。请保存在你信任的地方。',empty:'先写下几句话，再下载你的笔记。',cleared:'草稿已清空。只要此标签页还开着，就可以撤销。',restored:'你的草稿已恢复。',chars:'字符',accountLater:'账号保存功能正在准备中。目前，关闭或刷新此标签页将清除草稿和心情记录。',
      irisIntro:'花园里，一个倾听的地方。',irisExplain:'Iris 汇集花园团队的来信和成员分享的话语。你在这里发送的消息会交给团队，与“我的空间”中留给自己的笔记不同。',send:'写信给花园团队',messages:'阅读 Iris 来信',response:'回复不会即时送达。这里提供支持与交流，不提供医疗服务。',
      learnIntro:'一点一点，多些了解。',learnText:'从专业组织发布的信息开始。首批资源聚焦帕金森及家人和照护伙伴。',resource1:'了解帕金森',resource1Text:'浏览 Parkinson’s UK 的信息与资源。',resource2:'给家人与照护伙伴',resource2Text:'探索 Parkinson’s Foundation 的照护伙伴资源。',external:'外部网站 · 英文',sourceDate:'链接核查日期：2026年9月13日。这些组织自行发布内容；提供链接不代表合作关系，也不代表 Eye of Garden 已通过专业审核。',
      healthIntro:'用心准备，下一步。',healthText:'个人健康记录和用药时间表计划在后续阶段推出，届时将先完善安全账号和访问权限。',healthSub:'目前无法在这里保存健康记录，也尚未提供医生监测服务。',healthAction:'浏览学习资源',preview:'设计预览 · 示例花园 · 不会向线上服务发送数据',skip:'跳至正文'
    }
  };
  const icons = {
    leaf:'<path d="M20 3C7 2 2 7 5 14c2 5 12 6 15-11Z"/><path d="M3 21 15 9M9 15l-1-5m4 2h5"/>',
    room:'<path d="m3 11 9-8 9 8v10H3Z"/><path d="M9 21v-8h6v8"/>',
    stories:'<path d="M12 5v16M3 4c4-1 6 0 9 1 3-1 5-2 9-1v15c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>',
    learn:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6M7 10h6m-3-3v6"/>'
  };
  const svg = key => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key]}</svg>`;
  let lang = 'en';
  try { lang = localStorage.getItem('eog_language') || 'en'; } catch {}
  if (!copy[lang]) lang = 'en';
  let mood = '', statusKey = '', undoDraft = '';
  const t = key => copy[lang][key];
  const txt = key => `<span data-eog-copy="${key}">${t(key)}</span>`;
  const button = (key, route, secondary=false) => `<button type="button" class="eog-button${secondary?' eog-secondary':''}" data-eog-route="${route}">${txt(key)}<span aria-hidden="true">↗</span></button>`;
  const back = () => button('back','home',true);
  const header = document.createElement('header');
  header.className = 'eog-header'; header.dataset.noTranslate = '';
  header.innerHTML = `<button type="button" class="eog-brand" data-eog-route="home">${svg('leaf')}Eye of Garden</button><nav aria-label="Main navigation">${['home','room','myLeaf','learn','question','iris'].map((route,i)=>`<button type="button" data-eog-route="${route}">${txt(['home','room','garden','learn','stories','iris'][i])}</button>`).join('')}</nav><select id="eogLanguage" aria-label="${t('language')}"><option value="en">English</option><option value="ms">Melayu</option><option value="zh">简体中文</option></select>`;
  document.body.prepend(header);
  const skip = document.createElement('a');skip.href='#home';skip.className='eog-skip';skip.dataset.noTranslate='';skip.innerHTML=txt('skip');header.before(skip);
  if(window.EOG_PREVIEW){const banner=document.createElement('div');banner.className='eog-preview';banner.dataset.noTranslate='';banner.innerHTML=txt('preview');header.before(banner);}
  document.body.classList.add('eog-redesign');
  const home = document.getElementById('home');
  home.classList.add('eog-welcome','eog-surface');home.dataset.noTranslate='';home.tabIndex=-1;
  home.innerHTML = `<div class="eog-hero-grid"><div><div class="eog-eyebrow">${txt('eyebrow')}</div><h1 data-eog-html="hero">${t('hero')}</h1><p class="eog-intro">${txt('intro')}</p><div class="eog-actions">${button('enter','medication')}${button('explore','myLeaf',true)}</div><p class="eog-small">${txt('pace')}</p></div><figure class="eog-hero-photo"><img src="garden-bg-new.png" alt="" fetchpriority="high"><figcaption data-eog-html="photo">${t('photo')}</figcaption></figure></div><div class="eog-welcome-line">${txt('welcome')}${txt('belong')}</div><div class="eog-section-heading"><h2>${txt('start')}</h2><p>${txt('startSub')}</p></div><div class="eog-cards">${[['room','roomDesc','write','room','room'],['garden','gardenDesc','visit','myLeaf','leaf'],['stories','storyDesc','read','question','stories'],['learn','learnDesc','find','learn','learn']].map(([title,desc,action,route,icon])=>`<article class="eog-card"><span class="eog-icon">${svg(icon)}</span><h3>${txt(title)}</h3><p>${txt(desc)}</p><button type="button" class="eog-text-button" data-eog-route="${route}">${txt(action)} <span aria-hidden="true">→</span></button></article>`).join('')}</div><aside class="eog-iris-strip"><div class="eog-iris-mark" aria-hidden="true">i</div><div><h3>${txt('irisTitle')}</h3><p>${txt('irisDesc')}</p></div>${button('irisAction','iris',true)}</aside><span id="count" hidden></span>`;
  const sections = {
    room:`${back()}<div class="eog-eyebrow">${txt('room')}</div><h2 tabindex="-1">${txt('roomIntro')}</h2><div class="eog-panel"><h3>${txt('mood')}</h3><div class="eog-moods" role="group" aria-label="${t('mood')}">${['good','okay','hard'].map(key=>`<button type="button" data-eog-mood="${key}" aria-pressed="false">${txt(key)}</button>`).join('')}</div><p id="eogMoodReply" class="eog-status" aria-live="polite"></p><label for="eogNote">${txt('noteLabel')}</label><textarea id="eogNote" maxlength="5000" placeholder="${t('placeholder')}" aria-describedby="eogDraftHelp eogAccountLater"></textarea><div class="eog-draft-meta"><p id="eogDraftHelp">${txt('draftHelp')}</p><p id="eogCount">0 / 5000</p></div><div class="eog-actions"><button type="button" class="eog-button" id="eogDownload">${txt('download')}</button><button type="button" class="eog-button eog-secondary" id="eogClear">${txt('clear')}</button><button type="button" class="eog-button eog-secondary" id="eogUndo" hidden>${txt('undo')}</button></div><p id="eogDraftStatus" class="eog-status" role="status"></p></div><p id="eogAccountLater" class="eog-small">${txt('accountLater')}</p>`,
    iris:`${back()}<div class="eog-eyebrow">Iris</div><h2 tabindex="-1">${txt('irisIntro')}</h2><div class="eog-panel"><p>${txt('irisExplain')}</p><div class="eog-actions">${button('messages','irisMessages')}${button('send','tell',true)}</div><p class="eog-small">${txt('response')}</p></div>`,
    learn:`${back()}<div class="eog-eyebrow">${txt('learn')}</div><h2 tabindex="-1">${txt('learnIntro')}</h2><p class="eog-muted">${txt('learnText')}</p><a class="eog-resource" href="https://www.parkinsons.org.uk/information" target="_blank" rel="noopener noreferrer"><h3>${txt('resource1')} ↗</h3><p>${txt('resource1Text')}</p><small>Parkinson’s UK · ${txt('external')}</small></a><a class="eog-resource" href="https://www.parkinson.org/resources-support/carepartners" target="_blank" rel="noopener noreferrer"><h3>${txt('resource2')} ↗</h3><p>${txt('resource2Text')}</p><small>Parkinson’s Foundation · ${txt('external')}</small></a><p class="eog-small">${txt('sourceDate')}</p>`,
    health:`${back()}<div class="eog-eyebrow">${txt('health')}</div><h2 tabindex="-1">${txt('healthIntro')}</h2><div class="eog-panel"><p>${txt('healthText')}</p><p class="eog-muted">${txt('healthSub')}</p>${button('healthAction','learn',true)}</div>`
  };
  for(const [id,html] of Object.entries(sections)){const section=document.createElement('section');section.id=id;section.className='section eog-surface eog-subpage';section.dataset.noTranslate='';section.innerHTML=html;home.after(section);}
  const footer=document.createElement('footer');footer.className='eog-footer';footer.dataset.noTranslate='';footer.innerHTML=`<p>Eye of Garden · ${txt('footer')}</p><button type="button" data-eog-route="health">${txt('healthLink')} →</button>`;document.body.append(footer);
  function refreshLanguage(){
    document.querySelectorAll('[data-eog-copy]').forEach(el=>el.textContent=t(el.dataset.eogCopy));
    document.querySelectorAll('[data-eog-html]').forEach(el=>el.innerHTML=t(el.dataset.eogHtml));
    document.getElementById('eogLanguage').value=lang;
    document.getElementById('eogLanguage').setAttribute('aria-label',t('language'));
    document.getElementById('eogNote').placeholder=t('placeholder');
    document.querySelector('.eog-moods').setAttribute('aria-label',t('mood'));
    document.getElementById('eogMoodReply').textContent=mood?t('moodReply'):'';
    document.getElementById('eogDraftStatus').textContent=statusKey?t(statusKey):'';
    document.documentElement.lang=lang==='zh'?'zh-CN':lang;document.title='Eye of Garden';
  }
  function updateRoute(route){
    document.querySelectorAll('.eog-header nav [data-eog-route]').forEach(el=>{const active=el.dataset.eogRoute===route||(el.dataset.eogRoute==='iris'&&['tell','irisMessages'].includes(route));if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    skip.href='#'+route;
  }
  function navigate(route){
    if(!document.getElementById(route))return;
    if(route==='home'&&window.showHome)window.showHome();
    else if(route!=='home'&&window.show)window.show(route);
    else {document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active',s.id===route));home.style.display=route==='home'?'block':'none';document.body.classList.toggle('eog-home-flat',route==='home');}
    updateRoute(route);
    const target=document.getElementById(route).querySelector('h1,h2')||document.getElementById(route);target.tabIndex=-1;target.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
  }
  document.addEventListener('click',e=>{const target=e.target.closest('[data-eog-route]');if(target)navigate(target.dataset.eogRoute);});
  document.addEventListener('eog:navigation',e=>updateRoute(e.detail));
  document.addEventListener('eog:language',e=>{lang=copy[e.detail]?e.detail:'en';refreshLanguage();});
  document.getElementById('eogLanguage').addEventListener('change',e=>{lang=e.target.value;if(window.setLanguage)window.setLanguage(lang);else{try{localStorage.setItem('eog_language',lang);}catch{}refreshLanguage();}});
  document.querySelectorAll('[data-eog-mood]').forEach(el=>el.addEventListener('click',()=>{mood=el.dataset.eogMood;document.querySelectorAll('[data-eog-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));document.getElementById('eogMoodReply').textContent=t('moodReply');}));
  const note=document.getElementById('eogNote');
  function count(){document.getElementById('eogCount').textContent=`${note.value.length} / 5000`;}
  function status(key){statusKey=key;document.getElementById('eogDraftStatus').textContent=t(key);}
  note.addEventListener('input',()=>{count();statusKey='';document.getElementById('eogDraftStatus').textContent='';if(note.value){undoDraft='';document.getElementById('eogUndo').hidden=true;}});
  document.getElementById('eogDownload').addEventListener('click',()=>{if(!note.value.trim()){status('empty');note.focus();return;}const blob=new Blob([note.value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`eye-of-garden-note-${new Date().toISOString().slice(0,10)}.txt`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('downloaded');});
  document.getElementById('eogClear').addEventListener('click',()=>{if(!note.value)return;undoDraft=note.value;note.value='';count();document.getElementById('eogUndo').hidden=false;status('cleared');});
  document.getElementById('eogUndo').addEventListener('click',()=>{if(note.value)return;note.value=undoDraft;undoDraft='';count();document.getElementById('eogUndo').hidden=true;status('restored');});
  refreshLanguage();updateRoute('home');
  window.addEventListener('load',()=>{if(location.hash==='#medication')navigate('medication');});
})();
