const API_KEY = '';
let currentLang = localStorage.getItem('ufeLang') || 'en';

document.addEventListener('DOMContentLoaded', () => {
  buildNavStates(); setupTheme(); setupLanguage(); setupAccessibilityTools(); setupChatbot(); setupCountdown(); renderSchedule(); setupRegisterForm(); setupAdmin(); setupFadeUps(); recordInteraction('page_view');
  document.addEventListener('click', e => { if(e.target.closest('a,button')) recordInteraction('click'); });
});
function langObj(obj){ return obj?.[currentLang] || obj?.en || '' }
function buildNavStates(){
  const navToggle=document.getElementById('navToggle'), navLinks=document.getElementById('navLinks');
  navToggle?.addEventListener('click',()=>navLinks.classList.toggle('open'));
  document.querySelectorAll('.dropdown .menu-btn').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();btn.parentElement.classList.toggle('open')}));
  document.addEventListener('click',e=>{ if(!e.target.closest('.dropdown')) document.querySelectorAll('.dropdown.open').forEach(d=>d.classList.remove('open')); });
  window.addEventListener('scroll',()=>document.getElementById('mainNav')?.classList.toggle('scrolled', scrollY>20));
  const path=location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a=>{ const href=a.getAttribute('href')||''; const file=href.split('/').pop()||'index.html'; if(file===path || (path===''&&file==='index.html')) a.classList.add('active'); });
}
function setupTheme(){
  const root=document.documentElement, btn=document.getElementById('themeToggle');
  const saved=localStorage.getItem('ufeTheme')||'light'; root.setAttribute('data-theme',saved); updateThemeBtn(saved);
  btn?.addEventListener('click',()=>{ const next=root.getAttribute('data-theme')==='dark'?'light':'dark'; root.setAttribute('data-theme',next); localStorage.setItem('ufeTheme',next); updateThemeBtn(next); });
}
function updateThemeBtn(theme){ const b=document.getElementById('themeToggle'); if(!b)return; const n=UFE.nav[currentLang]; b.setAttribute('aria-label',theme==='dark'?n.themeLight:n.themeDark); b.innerHTML='<span class="toggle-track"><span class="toggle-dot"></span></span><span class="sr-only">'+(theme==='dark'?n.themeLight:n.themeDark)+'</span>'; }
function setupLanguage(){ document.querySelectorAll('.lang-switcher button').forEach(b=>b.addEventListener('click',()=>applyLang(b.dataset.lang))); applyLang(currentLang); }
function applyLang(lang){
  currentLang=lang; localStorage.setItem('ufeLang',lang); document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr'; document.body.classList.toggle('rtl',lang==='ar');
  document.querySelectorAll('.lang-switcher button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const key=el.dataset.i18n; const v=UFE.nav[lang]?.[key] || UFE.footer[lang]?.[key] || UFE.ui[lang]?.[key] || el.dataset[lang]; if(v) el.textContent=v; });
  document.querySelectorAll('.t,[data-en][data-fr][data-ar]').forEach(el=>{ const v=el.dataset[lang]; if(v) el.textContent=v; });
  document.querySelectorAll('[data-placeholder-en]').forEach(el=>{ const v=el.dataset['placeholder'+lang[0].toUpperCase()+lang.slice(1)]; if(v) el.setAttribute('placeholder',v); });
  updateThemeBtn(document.documentElement.getAttribute('data-theme')||'light'); updateChatbotLanguage(); renderSchedule(); if(window.updateCampusZoneTexts) window.updateCampusZoneTexts();
}
function setupAccessibilityTools(){
  const panel=document.getElementById('accessPanel');
  if(!panel) return;
  const togglePanel=()=>panel.classList.toggle('open');
  document.querySelectorAll('#accessToggle').forEach(btn=>btn.addEventListener('click',togglePanel));
  if(!document.getElementById('accessFab')){
    const fab=document.createElement('button');
    fab.id='accessFab';
    fab.className='access-fab';
    fab.type='button';
    fab.setAttribute('aria-label','Open accessibility tools');
    fab.title='Accessibility Tools';
    fab.textContent='♿';
    fab.addEventListener('click',togglePanel);
    document.body.appendChild(fab);
  }
  document.getElementById('largeTextBtn')?.addEventListener('click',()=>document.body.classList.toggle('large-text'));
  document.getElementById('contrastBtn')?.addEventListener('click',()=>document.body.classList.toggle('high-contrast'));
  document.getElementById('motionBtn')?.addEventListener('click',()=>document.body.classList.toggle('reduce-motion'));
  document.getElementById('readPageBtn')?.addEventListener('click',()=>speakText(document.querySelector('main')?.innerText || document.body.innerText));
  document.getElementById('stopSpeechBtn')?.addEventListener('click',()=>speechSynthesis.cancel());
}
function speakText(text){ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text.replace(/\s+/g,' ').slice(0,4200)); u.lang=currentLang==='ar'?'ar-EG':currentLang==='fr'?'fr-FR':'en-US'; speechSynthesis.speak(u); }
function setupCountdown(){
  const ids=['cd-days','cd-hours','cd-mins','cd-secs']; if(!ids.every(id=>document.getElementById(id))) return;
  let year=new Date().getFullYear(); let target=new Date(`${year}-09-01T18:00:00+03:00`).getTime(); if(target<Date.now()) target=new Date(`${year+1}-09-01T18:00:00+03:00`).getTime();
  const tick=()=>{ const diff=Math.max(0,target-Date.now()); const d=Math.floor(diff/86400000),h=Math.floor(diff%86400000/3600000),m=Math.floor(diff%3600000/60000),s=Math.floor(diff%60000/1000); [d,h,m,s].forEach((v,i)=>document.getElementById(ids[i]).textContent=String(v).padStart(2,'0'));}; tick(); setInterval(tick,1000);
}
function renderSchedule(){ const box=document.getElementById('strollSchedule'); if(!box) return; box.innerHTML=UFE.schedule.map((it,i)=>`<div class="stroll-item fade-up"><div class="stroll-time">${it.time}</div><div class="stroll-dot">${String(i+1).padStart(2,'0')}</div><article class="stroll-card"><h3>${langObj(it).title}</h3><p>${langObj(it).desc}</p></article></div>`).join(''); setupFadeUps(); }
function setupRegisterForm(){ const form=document.getElementById('registerForm'); if(!form)return; const loc=form.querySelector('[name="location"]'), country=document.getElementById('countryGroup'); loc?.addEventListener('change',()=>country.classList.toggle('visible',loc.value==='outside')); form.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form).entries());data.createdAt=new Date().toISOString();const regs=JSON.parse(localStorage.getItem('ufeRegistrations')||'[]');regs.push(data);localStorage.setItem('ufeRegistrations',JSON.stringify(regs));document.getElementById('registerFormWrapper').style.display='none';document.getElementById('formSuccess').style.display='block';}); }
function recordInteraction(type){ const arr=JSON.parse(localStorage.getItem('ufeInteractions')||'[]'); arr.push({type,page:location.pathname,at:new Date().toISOString()}); localStorage.setItem('ufeInteractions',JSON.stringify(arr)); }
function setupAdmin(){ const form=document.getElementById('adminLoginForm'); if(!form)return; form.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form); if(fd.get('username')==='admin'&&fd.get('password')==='ufe2026'){document.getElementById('adminLogin').style.display='none';document.getElementById('adminDashboard').classList.add('active');renderAdmin();}else document.getElementById('adminError').textContent='Invalid credentials. Try admin / ufe2026';}); }
function renderAdmin(){ const regs=JSON.parse(localStorage.getItem('ufeRegistrations')||'[]'), ints=JSON.parse(localStorage.getItem('ufeInteractions')||'[]'), quiz=JSON.parse(localStorage.getItem('ufeQuizSouvenirs')||'[]'); const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v}; set('adminTotal',regs.length); set('adminInteractions',ints.length); set('adminQuiz',quiz.length); set('adminToday',regs.filter(r=>(r.createdAt||'').slice(0,10)===new Date().toISOString().slice(0,10)).length); const body=document.getElementById('adminTableBody'); if(body) body.innerHTML=regs.length?regs.slice().reverse().map(r=>`<tr><td>${r.firstName||''} ${r.lastName||''}</td><td>${r.email||''}</td><td>${r.major||''}</td><td>${(r.createdAt||'').slice(0,10)}</td></tr>`).join(''):'<tr><td colspan="4">No registrations yet.</td></tr>'; }
function setupChatbot(){ const bot=document.getElementById('ufeChatbot'); if(!bot)return; bot.querySelector('.chatbot-launch')?.addEventListener('click',()=>bot.classList.toggle('open')); bot.querySelector('.chatbot-close')?.addEventListener('click',()=>bot.classList.remove('open')); bot.querySelector('.chatbot-form')?.addEventListener('submit',async e=>{e.preventDefault();const input=bot.querySelector('input');const msg=input.value.trim();if(!msg)return;input.value='';addChat('user',msg);const loading=addChat('bot','...');const reply=await askGemini(msg);loading.textContent=reply;}); updateChatbotLanguage(); }
function addChat(type,text){ const m=document.createElement('div'); m.className=type==='user'?'user-msg':'bot-msg'; m.textContent=text; document.querySelector('.chatbot-messages')?.appendChild(m); m.scrollIntoView({block:'end'}); return m; }
function updateChatbotLanguage(){ const c=UFE.chat[currentLang]; const bot=document.getElementById('ufeChatbot'); if(!bot||!c)return; bot.querySelector('.chatbot-title').textContent=c.title; bot.querySelector('.chatbot-form input').placeholder=c.placeholder; bot.querySelector('.chatbot-form button').textContent=c.send; const first=bot.querySelector('.chatbot-messages .bot-msg'); if(first&&first.dataset.fixed==='hello') first.textContent=c.hello; }
async function askGemini(message){ const c=UFE.chat[currentLang]; return localAnswer(message) || c.fallback; }
function localAnswer(q){ q=q.toLowerCase(); const l=currentLang; const A={en:{reg:'Use the Register page. Registration is free and takes less than one minute.',sch:'Open Day starts on September 1 at 6:00 PM. The route includes arrival, speakers, experience walk, 3D campus, quiz, and registration support.',acc:'The site includes larger text, high contrast, reduced motion, text-to-speech, multilingual content, and guided accessibility support.',quiz:'The Pathfinder quiz suggests a suitable UFE path and creates a souvenir-style result.',campus:'The Campus 3D page lets you rotate the future campus model and click zones.'},fr:{reg:'Utilisez la page S’inscrire. L’inscription est gratuite et prend moins d’une minute.',sch:'L’Open Day commence le 1er septembre à 18h00. Le parcours inclut l’accueil, les intervenants, l’expérience, le campus 3D, le quiz et l’aide à l’inscription.',acc:'Le site inclut grand texte, contraste élevé, réduction du mouvement, lecture vocale, contenu multilingue et accompagnement.',quiz:'Le quiz Pathfinder suggère un parcours UFE et crée un résultat souvenir.',campus:'La page Campus 3D permet de tourner le modèle du futur campus et de cliquer sur les zones.'},ar:{reg:'استخدم صفحة التسجيل. التسجيل مجاني ويستغرق أقل من دقيقة.',sch:'يبدأ اليوم المفتوح يوم 1 سبتمبر الساعة 6 مساءً، ويشمل الاستقبال والمتحدثين وجولة التجربة والحرم ثلاثي الأبعاد والاختبار ودعم التسجيل.',acc:'يتضمن الموقع تكبير النص والتباين العالي وتقليل الحركة والقراءة الصوتية والمحتوى متعدد اللغات ودعم الإتاحة.',quiz:'يقترح اختبار باثفايندر المسار الأقرب لك في UFE ويقدم نتيجة تذكارية.',campus:'صفحة الحرم ثلاثي الأبعاد تتيح تدوير نموذج الحرم المستقبلي والضغط على المناطق.'}}; if(q.includes('register')||q.includes('inscription')||q.includes('تسجيل'))return A[l].reg; if(q.includes('schedule')||q.includes('time')||q.includes('programme')||q.includes('جدول')||q.includes('ميعاد'))return A[l].sch; if(q.includes('access')||q.includes('wheel')||q.includes('إتاحة')||q.includes('كرسي'))return A[l].acc; if(q.includes('quiz')||q.includes('pathfinder')||q.includes('اختبار'))return A[l].quiz; if(q.includes('campus')||q.includes('3d')||q.includes('حرم'))return A[l].campus; return ''; }
function setupFadeUps(){ const els=document.querySelectorAll('.fade-up:not(.watched)'); if(!els.length)return; const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.12}); els.forEach(el=>{el.classList.add('watched');io.observe(el);}); }


/* =========================================================
   FINAL ADMIN DASHBOARD RENDERER
   ========================================================= */
function setupAdmin(){
  const form=document.getElementById('adminLoginForm');
  if(!form)return;
  const openDashboard=()=>{
    document.getElementById('adminLogin').style.display='none';
    document.getElementById('adminDashboard').classList.add('active');
    renderAdmin();
  };
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const fd=new FormData(form);
    if(fd.get('username')==='admin'&&fd.get('password')==='ufe2026') openDashboard();
    else document.getElementById('adminError').textContent='Invalid credentials. Try admin / ufe2026';
  });
  document.getElementById('adminExportCsv')?.addEventListener('click',()=>exportAdminCsv());
}

function adminDemoData(){
  const majors=['Architecture','Computer Engineering','Digital Marketing','BIS','Mechanical Engineering','Economics / Management','Applied Languages'];
  const names=[['Mariam','Hassan'],['Omar','Khaled'],['Leila','Guindy'],['Youssef','Ahmed'],['Sarah','Mostafa'],['Karim','Nabil'],['Nour','Samir'],['Farida','Tarek'],['Hamza','Ali'],['Roba','Mahmoud'],['Adam','Sherif'],['Lina','Wael']];
  const today=new Date();
  const regs=names.map((n,i)=>{
    const d=new Date(today); d.setDate(today.getDate()-(i%7));
    return {firstName:n[0],lastName:n[1],email:(n[0]+'.'+n[1]+'@example.com').toLowerCase(),major:majors[i%majors.length],city:['Cairo','New Cairo','El Shorouk','Madinaty'][i%4],createdAt:d.toISOString()};
  });
  const pages=['/index.html','/pages/majors.html','/pages/schedule.html','/pages/campus3d.html','/pages/register.html','/pages/quiz.html','/pages/accessibility.html'];
  const ints=[];
  for(let i=0;i<96;i++){
    const d=new Date(today); d.setDate(today.getDate()-(i%7));
    ints.push({type:i%3===0?'page_view':'click',page:pages[i%pages.length],at:d.toISOString()});
  }
  const quiz=regs.slice(0,8).map((r,i)=>({name:r.firstName,major:majors[(i+2)%majors.length],createdAt:r.createdAt}));
  return {regs,ints,quiz,demo:true};
}

function adminData(){
  let regs=JSON.parse(localStorage.getItem('ufeRegistrations')||'[]');
  let ints=JSON.parse(localStorage.getItem('ufeInteractions')||'[]');
  let quiz=JSON.parse(localStorage.getItem('ufeQuizSouvenirs')||'[]');
  if(!regs.length && !ints.length && !quiz.length) return adminDemoData();
  return {regs,ints,quiz,demo:false};
}

function setAdminText(id,value){ const el=document.getElementById(id); if(el) el.textContent=value; }
function fmtPct(n){ return `${Math.round(n)}%`; }
function safeDate(v){ const d=new Date(v||Date.now()); return isNaN(d)?new Date():d; }
function pageLabel(path){
  const p=(path||'home').split('/').pop()||'home';
  return p.replace('.html','').replace('index','Home').replace('majors','Experience').replace('campus3d','Campus 3D').replace(/^./,c=>c.toUpperCase());
}

function renderAdmin(){
  const {regs,ints,quiz,demo}=adminData();
  const todayKey=new Date().toISOString().slice(0,10);
  const pageViews=ints.filter(i=>i.type==='page_view').length || Math.max(1, Math.floor(ints.length*.45));
  const interactions=ints.length;
  const todayRegs=regs.filter(r=>(r.createdAt||'').slice(0,10)===todayKey).length;
  const conversion=pageViews ? (regs.length/pageViews)*100 : 0;
  const engagement=regs.length ? (interactions/regs.length).toFixed(1) : interactions;

  setAdminText('adminTotal', regs.length);
  setAdminText('adminToday', todayRegs);
  setAdminText('adminInteractions', interactions);
  setAdminText('adminQuiz', quiz.length);
  setAdminText('adminConversion', fmtPct(conversion));
  setAdminText('adminAvgEngagement', engagement);
  setAdminText('adminKpiUpdated', 'Updated ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}));
  setAdminText('adminDataMode', demo ? 'Demo preview' : 'Live data');
  setAdminText('adminTotalDelta', demo ? 'Sample preview data' : 'Across all submitted forms');

  renderTrend(regs);
  renderMajorChart(regs);
  renderPageChart(ints);
  renderFunnel(pageViews, interactions, regs.length, quiz.length);
  renderAdminTable(regs, demo);
}

function renderTrend(regs){
  const box=document.getElementById('adminTrendBars'); if(!box)return;
  const days=[]; const now=new Date();
  for(let i=6;i>=0;i--){ const d=new Date(now); d.setDate(now.getDate()-i); days.push({key:d.toISOString().slice(0,10),label:d.toLocaleDateString([], {weekday:'short'}),count:0}); }
  regs.forEach(r=>{ const k=(r.createdAt||'').slice(0,10); const day=days.find(d=>d.key===k); if(day) day.count++; });
  const max=Math.max(1,...days.map(d=>d.count));
  box.innerHTML=days.map(d=>`<div class="admin-bar-item"><div class="admin-bar-track"><div class="admin-bar-fill" style="height:${Math.max(6,(d.count/max)*100)}%"></div></div><div class="admin-bar-value">${d.count}</div><div class="admin-bar-label">${d.label}</div></div>`).join('');
}

function renderMajorChart(regs){
  const box=document.getElementById('adminMajorChart'); if(!box)return;
  const counts={}; regs.forEach(r=>{ const m=r.major||'Undecided'; counts[m]=(counts[m]||0)+1; });
  const rows=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const max=Math.max(1,...rows.map(r=>r[1]));
  box.innerHTML=rows.length?rows.map(([label,count])=>`<div class="admin-hbar-row"><div class="admin-hbar-top"><span>${label}</span><strong>${count}</strong></div><div class="admin-hbar-track"><div class="admin-hbar-fill" style="width:${Math.max(8,(count/max)*100)}%"></div></div></div>`).join(''):'<p class="muted">No major data yet.</p>';
}

function renderPageChart(ints){
  const box=document.getElementById('adminPageChart'); if(!box)return;
  const counts={}; ints.forEach(i=>{ const p=pageLabel(i.page); counts[p]=(counts[p]||0)+1; });
  const rows=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,7);
  const max=Math.max(1,...rows.map(r=>r[1]));
  box.innerHTML=rows.length?rows.map(([label,count])=>`<div class="admin-hbar-row"><div class="admin-hbar-top"><span>${label}</span><strong>${count}</strong></div><div class="admin-hbar-track"><div class="admin-hbar-fill" style="width:${Math.max(8,(count/max)*100)}%"></div></div></div>`).join(''):'<p class="muted">No page interactions yet.</p>';
}

function renderFunnel(pageViews, interactions, registrations, quizCount){
  const box=document.getElementById('adminFunnel'); if(!box)return;
  const rows=[
    ['Page Views','Visitor awareness',pageViews],
    ['Interactions','Clicks, tools, navigation',interactions],
    ['Registrations','Submitted forms',registrations],
    ['Quiz Results','Pathfinder souvenirs',quizCount]
  ];
  const max=Math.max(1,...rows.map(r=>r[2]));
  box.innerHTML=rows.map(([name,desc,val])=>`<div class="admin-funnel-step" style="--w:${Math.max(8,(val/max)*100)}%"><span>${name}<small>${desc}</small></span><strong>${val}</strong></div>`).join('');
}

function renderAdminTable(regs,demo){
  const body=document.getElementById('adminTableBody'); if(!body)return;
  body.innerHTML=regs.length?regs.slice().sort((a,b)=>safeDate(b.createdAt)-safeDate(a.createdAt)).map(r=>`<tr><td>${r.firstName||''} ${r.lastName||''}</td><td>${r.email||''}</td><td>${r.major||'Undecided'}</td><td>${r.city||r.country||''}</td><td>${(r.createdAt||'').slice(0,10)}</td><td><span class="admin-status-chip">${demo?'Sample':'Confirmed'}</span></td></tr>`).join(''):'<tr><td colspan="6">No registrations yet.</td></tr>';
}

function exportAdminCsv(){
  const {regs}=adminData();
  const header=['First Name','Last Name','Email','Phone','Major','City','Country','Date'];
  const esc=v=>'"'+String(v||'').replaceAll('"','""')+'"';
  const rows=regs.map(r=>[r.firstName,r.lastName,r.email,r.phone,r.major,r.city,r.country,(r.createdAt||'').slice(0,10)].map(esc).join(','));
  const csv=[header.join(','),...rows].join('\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='ufe-open-day-registrations.csv';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
