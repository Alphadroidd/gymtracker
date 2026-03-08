// ===== AUTH SYSTEM =====
var AUTH_KEY='gt_auth_users';
var SESSION_KEY='gt_session';
var CURRENT_USER=null;

function simpleHash(str){
  var hash=0;
  for(var i=0;i<str.length;i++){hash=((hash<<5)-hash)+str.charCodeAt(i);hash|=0;}
  return hash.toString(36);
}
function authGetUsers(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'[]');}catch(e){return[];}}
function authSaveUsers(u){localStorage.setItem(AUTH_KEY,JSON.stringify(u));}
function userKey(k){return CURRENT_USER?'u_'+CURRENT_USER+'_'+k:k;}
function setupUserStorage(){
  var _ls=function(k){try{return JSON.parse(localStorage.getItem(userKey(k))||'null');}catch(e){return null;}};
  var _lss=function(k,v){try{localStorage.setItem(userKey(k),JSON.stringify(v));}catch(e){}};
  window.ls=_ls;window.lss=_lss;ls=_ls;lss=_lss;
}
function authSwitchTab(tab){
  document.getElementById('auth-login-form').style.display=tab==='login'?'flex':'none';
  document.getElementById('auth-register-form').style.display=tab==='register'?'flex':'none';
  document.getElementById('tab-login').classList.toggle('active',tab==='login');
  document.getElementById('tab-register').classList.toggle('active',tab==='register');
  document.getElementById('login-error').classList.remove('show');
  document.getElementById('reg-error').classList.remove('show');
}
function authShowError(id,msg){var el=document.getElementById(id);el.textContent=msg;el.classList.add('show');}
function authLogin(){
  var user=(document.getElementById('login-user').value||'').trim().toLowerCase();
  var pass=document.getElementById('login-pass').value||'';
  if(!user||!pass){authShowError('login-error','Preencha usu\u00E1rio e senha.');return;}
  var users=authGetUsers();
  var found=users.find(function(u){return u.username===user;});
  if(!found){authShowError('login-error','Usu\u00E1rio n\u00E3o encontrado.');return;}
  if(found.passHash!==simpleHash(pass)){authShowError('login-error','Senha incorreta.');return;}
  authStartSession(user);
}
function authRegister(){
  var user=(document.getElementById('reg-user').value||'').trim().toLowerCase();
  var pass=document.getElementById('reg-pass').value||'';
  var pass2=document.getElementById('reg-pass2').value||'';
  if(!user||user.length<2){authShowError('reg-error','Nome muito curto (m\u00EDn. 2 letras).');return;}
  if(!/^[a-z0-9_]+$/.test(user)){authShowError('reg-error','Use apenas letras min\u00FAsculas, n\u00FAmeros e _.');return;}
  if(pass.length<4){authShowError('reg-error','Senha muito curta (m\u00EDn. 4 caracteres).');return;}
  if(pass!==pass2){authShowError('reg-error','As senhas n\u00E3o coincidem.');return;}
  var users=authGetUsers();
  if(users.find(function(u){return u.username===user;})){authShowError('reg-error','Nome de usu\u00E1rio j\u00E1 existe.');return;}
  users.push({username:user,passHash:simpleHash(pass),createdAt:new Date().toISOString()});
  authSaveUsers(users);
  authStartSession(user);
}
function authStartSession(username){
  CURRENT_USER=username;
  localStorage.setItem(SESSION_KEY,username);
  setupUserStorage();
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('user-switcher').style.display='flex';
  document.getElementById('user-badge-name').textContent=username;
  initData();
  renderHome();
}
function authShowSwitcher(){
  var users=authGetUsers();
  var others=users.filter(function(u){return u.username!==CURRENT_USER;});
  var html='<h3 style="font-family:var(--fd);font-size:24px;margin-bottom:4px">\uD83D\uDC64 '+CURRENT_USER+'</h3>'
    +'<p style="font-size:13px;color:var(--txt2);margin-bottom:16px">Sess\u00E3o atual</p>';
  if(others.length){
    html+='<p class="lbl" style="margin-bottom:8px">Trocar para</p>'
      +others.map(function(u){return'<button onclick="authSwitchUser(\''+u.username+'\')" style="width:100%;padding:12px 16px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg);color:var(--txt);font-family:var(--fb);font-size:15px;font-weight:600;cursor:pointer;text-align:left;margin-bottom:8px">\uD83D\uDC64 '+u.username+'</button>';}).join('');
  }
  html+='<div style="height:1px;background:var(--border);margin:12px 0"></div>'
    +'<button onclick="authLogout()" style="width:100%;padding:12px;border-radius:var(--r);border:1px solid rgba(248,81,73,0.3);background:rgba(248,81,73,0.08);color:var(--red);font-family:var(--fb);font-size:14px;font-weight:700;cursor:pointer;margin-bottom:8px">\uD83D\uDEAA Sair da conta</button>'
    +'<button onclick="closeModal()" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:transparent;color:var(--txt2);font-family:var(--fb);font-size:13px;cursor:pointer">Cancelar</button>';
  openModal(html);
}
function authSwitchUser(username){
  closeModal();
  CURRENT_USER=username;
  localStorage.setItem(SESSION_KEY,username);
  setupUserStorage();
  document.getElementById('user-badge-name').textContent=username;
  if(typeof WO!=='undefined'&&WO){clearInterval(WO.timer);clearInterval(WO.restTimer);WO=null;}
  showPage('home');
  toast('\uD83D\uDC64 Trocou para '+username);
}
function authLogout(){
  closeModal();
  if(typeof WO!=='undefined'&&WO){clearInterval(WO.timer);clearInterval(WO.restTimer);WO=null;}
  CURRENT_USER=null;
  localStorage.removeItem(SESSION_KEY);
  ls=function(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
  lss=function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
  window.ls=ls;window.lss=lss;
  document.getElementById('auth-screen').style.display='flex';
  document.getElementById('user-switcher').style.display='none';
  authRenderUsersList();
  authSwitchTab('login');
  document.getElementById('login-user').value='';
  document.getElementById('login-pass').value='';
}
function authRenderUsersList(){
  var users=authGetUsers();
  var el=document.getElementById('auth-users-list');
  if(!el)return;
  if(!users.length){el.innerHTML='';return;}
  el.innerHTML='<div style="margin-top:8px;border-top:1px solid var(--border);padding-top:14px">'
    +'<p style="font-size:11px;color:var(--muted);text-align:center;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Contas neste dispositivo</p>'
    +users.map(function(u){
      return'<button onclick="document.getElementById(\'login-user\').value=\''+u.username+'\';document.getElementById(\'login-pass\').focus()" '
        +'style="width:100%;padding:10px 14px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg);color:var(--txt2);font-family:var(--fb);font-size:14px;font-weight:600;cursor:pointer;text-align:left;margin-bottom:6px;display:flex;align-items:center;gap:10px">'
        +'<span style="width:32px;height:32px;border-radius:50%;background:var(--bluedim);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">\uD83D\uDC64</span>'
        +u.username+'</button>';
    }).join('')+'</div>';
}


// PART 1: Data layer
var EXERCISE_IMGS={};
var KEYS={W:'gt_w2',H:'gt_h2',WH:'gt_wh2',INIT:'gt_init3',WATER:'gt_water',WATERMETA:'gt_watermeta',FOOD:'gt_food'};
var DEFAULTS=[
  {id:'wa',name:'Treino A',exercises:[
    {id:'e1',name:'Lat Pulldown',sets:3,reps:10,weight:0},
    {id:'e2',name:'Leg Extension',sets:3,reps:10,weight:0},
    {id:'e3',name:'Hip Adductor',sets:3,reps:10,weight:0},
    {id:'e4',name:'Tr\u00EDceps na Corda',sets:3,reps:10,weight:0},
    {id:'e5',name:'B\u00EDceps Curl',sets:3,reps:10,weight:0},
    {id:'e6',name:'Abdominal',sets:3,reps:15,weight:0}]},
  {id:'wb',name:'Treino B',exercises:[
    {id:'e7',name:'Leg Press',sets:3,reps:10,weight:0},
    {id:'e8',name:'Seated Leg Curl',sets:3,reps:10,weight:0},
    {id:'e9',name:'Hip Abductor',sets:3,reps:10,weight:0},
    {id:'e10',name:'Chest Press',sets:3,reps:10,weight:0},
    {id:'e11',name:'Abdominal',sets:3,reps:15,weight:0}]}
];

var ls=function(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
var lss=function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
window.ls=ls;window.lss=lss;

function initData(){
  if(!localStorage.getItem(userKey(KEYS.INIT))){
    lss(KEYS.W,DEFAULTS);lss(KEYS.H,[]);lss(KEYS.WH,{});
    lss(KEYS.WATER,{});lss(KEYS.WATERMETA,2500);lss(KEYS.FOOD,{});
    localStorage.setItem(userKey(KEYS.INIT),'1');
  }
}
var getWorkouts=function(){return ls(KEYS.W)||[];};
var saveWorkouts=function(v){lss(KEYS.W,v);};
var getHistory=function(){return ls(KEYS.H)||[];};
var getWeights=function(){return ls(KEYS.WH)||{};};

function saveSession(s){
  var h=getHistory();h.unshift(s);lss(KEYS.H,h);
  var wh=getWeights();
  (s.exercises||[]).forEach(function(ex){
    if(!wh[ex.name])wh[ex.name]=[];
    wh[ex.name].push({date:s.date,weight:ex.weight,reps:ex.reps});
  });
  lss(KEYS.WH,wh);
}
function delSession(id){lss(KEYS.H,getHistory().filter(function(s){return s.id!==id;}));}
function weekStats(){
  var h=getHistory(),now=new Date();
  var ws=new Date(now);ws.setDate(now.getDate()-now.getDay());ws.setHours(0,0,0,0);
  var sess=h.filter(function(s){return new Date(s.date)>=ws;});
  return{n:sess.length,mins:sess.reduce(function(a,s){return a+(s.duration||0);},0)};
}
function lastWeightsMap(){
  var lw={};
  getHistory().forEach(function(s){(s.exercises||[]).forEach(function(ex){if(!(ex.name in lw))lw[ex.name]=ex.weight;});});
  return lw;
}
function getTodayKey(){return new Date().toISOString().split('T')[0];}
function getWaterToday(){var w=ls(KEYS.WATER)||{};return w[getTodayKey()]||0;}
function addCustomWater(){var inp=document.getElementById('water-custom');var v=inp?+inp.value:0;if(v>0){addWater(v);renderWater();}}
function addWater(ml){var w=ls(KEYS.WATER)||{};var k=getTodayKey();w[k]=(w[k]||0)+ml;lss(KEYS.WATER,w);}
function setWaterMeta(ml){lss(KEYS.WATERMETA,ml);}
function getWaterMeta(){return ls(KEYS.WATERMETA)||2500;}
function getFoodToday(){var f=ls(KEYS.FOOD)||{};return f[getTodayKey()]||{breakfast:[],lunch:[],snack:[],dinner:[]};}
function saveFoodToday(data){var f=ls(KEYS.FOOD)||{};f[getTodayKey()]=data;lss(KEYS.FOOD,f);}

function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36);}
function vib(p){if(navigator.vibrate)navigator.vibrate(p||[80]);}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmtDur(s){var h=~~(s/3600),m=~~(s%3600/60),ss=s%60;return h?h+'h '+m+'m':m?m+'m '+ss+'s':ss+'s';}
function fmtMin(m){return m<60?m+'min':~~(m/60)+'h'+(m%60?' '+m%60+'min':'');}
function fmtDate(d){
  var date=new Date(d),now=new Date(),days=~~((now-date)/86400000);
  if(days===0)return'Hoje';if(days===1)return'Ontem';if(days<7)return days+' dias atr\u00E1s';
  return date.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});
}
function toast(msg,ok){
  var el=document.createElement('div');
  el.className='toast '+(ok===false?'t-info':'t-ok');
  el.textContent=msg;
  document.getElementById('toasts').appendChild(el);
  setTimeout(function(){el.remove();},3000);
}
function openModal(html){document.getElementById('modal-body').innerHTML=html;document.getElementById('modal').style.display='flex';}
function closeModal(){document.getElementById('modal').style.display='none';}

var NAV_PAGES=['home','history','stats','workouts','water','food','suggest','profile'];
function showPage(name,data){
  document.querySelectorAll('.pg').forEach(function(p){p.classList.remove('show');});
  document.querySelectorAll('.ntab').forEach(function(b){b.classList.remove('on');});
  document.getElementById('nav').style.display='flex';
  var pg=document.getElementById('pg-'+name);
  if(!pg)return;
  pg.classList.add('show');
  if(NAV_PAGES.includes(name)){var t=document.getElementById('ntab-'+name);if(t)t.classList.add('on');}
  else{document.getElementById('nav').style.display='none';}
  if(name==='home')renderHome();
  else if(name==='history')renderHistory();
  else if(name==='stats')renderStats();
  else if(name==='workouts')renderWorkouts();
  else if(name==='workout')startWorkout(data);
  else if(name==='tennis')renderTennis();
  else if(name==='activity')renderActivity();
  else if(name==='detail')renderDetail(data);
  else if(name==='expicker')renderExPicker(data);
  else if(name==='water')renderWater();
  else if(name==='food')renderFood();
  else if(name==='suggest')renderSuggest();
  else if(name==='profile')renderProfile();
}

var homeEditMode=false;
function renderHome(){
  var workouts=getWorkouts(),wk=weekStats(),hist=getHistory().slice(0,3);
  var colors=[
    {bg:'rgba(77,148,255,0.1)',bd:'rgba(77,148,255,0.3)',ic:'rgba(77,148,255,0.15)',tx:'#58a6ff'},
    {bg:'rgba(255,123,0,0.1)',bd:'rgba(255,123,0,0.3)',ic:'rgba(255,123,0,0.15)',tx:'#ff9a3c'},
    {bg:'rgba(163,113,247,0.1)',bd:'rgba(163,113,247,0.3)',ic:'rgba(163,113,247,0.15)',tx:'#c4b5fd'},
    {bg:'rgba(63,185,80,0.1)',bd:'rgba(63,185,80,0.3)',ic:'rgba(63,185,80,0.15)',tx:'#4ade80'}
  ];
  var liveBanner=WO?'<div onclick="showPage(\'workout\',\''+WO.workout.id+'\')" style="margin:0 20px 16px;padding:14px 16px;background:linear-gradient(135deg,rgba(77,148,255,0.15),rgba(255,123,0,0.1));border:1px solid rgba(77,148,255,0.4);border-radius:var(--r);display:flex;align-items:center;gap:12px;cursor:pointer"><div class="pulse" style="width:44px;height:44px;border-radius:10px;background:rgba(77,148,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">'+(WO.started?'\u25B6\uFE0F':'\u23F8')+'</div><div style="flex:1"><div style="font-weight:700;color:var(--blue2);font-size:15px">Treino '+(WO.started?'em andamento':'pronto para iniciar')+'</div><div style="font-size:13px;color:var(--txt2)">'+esc(WO.workout.name)+' \u00B7 <span id="banner-clock">'+(WO.started?fmtDur(WO.elapsed):'Aguardando')+'</span></div></div><span style="color:var(--blue2);font-size:20px">\u203A</span></div>':'';
  var wBtns='';
  workouts.forEach(function(w,i){
    var c=colors[i%colors.length],alive=WO&&WO.workout.id===w.id;
    if(homeEditMode){
      wBtns+='<div style="background:'+c.bg+';border:2px dashed '+c.bd+';border-radius:20px;padding:14px 16px;margin-bottom:10px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="width:48px;height:48px;border-radius:14px;background:'+c.ic+';border:1px solid '+c.bd+';display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:28px;color:'+c.tx+';flex-shrink:0">'+esc(w.name.split(' ').pop())+'</span><input value="'+esc(w.name)+'" oninput="homeRenameWorkout(\''+w.id+'\',this.value)" style="flex:1;font-weight:700;font-size:16px;border-radius:var(--rs);padding:8px 10px"/></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button onclick="showPage(\'workout\',\''+w.id+'\')" style="flex:1;min-width:80px;padding:9px 8px;border-radius:var(--r);border:1px solid '+c.bd+';background:'+c.ic+';color:'+c.tx+';font-size:13px;font-weight:700">\u25B6 Treinar</button><button onclick="homeEditExercises(\''+w.id+'\')" style="flex:1;min-width:80px;padding:9px 8px;border-radius:var(--r);border:1px solid var(--border);background:var(--card);color:var(--txt2);font-size:13px;font-weight:700">\u270F\uFE0F Exerc\u00EDcios</button><button onclick="homeDupWorkout(\''+w.id+'\')" style="padding:9px 12px;border-radius:var(--r);border:1px solid var(--border);background:var(--card);color:var(--txt2);font-size:13px;font-weight:700">\uD83D\uDCCB</button><button onclick="homeDelWorkout(\''+w.id+'\')" style="padding:9px 12px;border-radius:var(--r);border:1px solid rgba(248,81,73,0.3);background:rgba(248,81,73,0.08);color:var(--red);font-size:13px;font-weight:700">\uD83D\uDDD1</button></div></div>';
    }else{
      wBtns+='<button onclick="showPage(\'workout\',\''+w.id+'\')" style="display:flex;align-items:center;gap:14px;padding:16px;border-radius:20px;border:1px solid '+c.bd+';background:'+c.bg+';color:var(--txt);width:100%;margin-bottom:10px;font-family:var(--fb);cursor:pointer;text-align:left"><span style="width:52px;height:52px;border-radius:14px;background:'+c.ic+';border:1px solid '+c.bd+';display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:30px;font-weight:900;color:'+c.tx+';flex-shrink:0;letter-spacing:-1px">'+esc(w.name.split(' ').pop())+'</span><div style="flex:1"><div style="font-weight:700;font-size:17px">'+esc(w.name)+(alive?' <span style="font-size:10px;background:rgba(77,148,255,0.2);color:var(--blue2);padding:2px 7px;border-radius:99px">\u25CF AO VIVO</span>':'')+'</div><div style="font-size:12px;color:var(--muted)">'+(w.exercises||[]).length+' exerc\u00EDcios</div></div><span style="font-size:20px;color:'+c.tx+'">\u2192</span></button>';
    }
  });
  var editBar=homeEditMode
    ?'<div style="display:flex;gap:8px;margin-bottom:14px"><button onclick="homeAddWorkout()" style="flex:1;padding:11px;border-radius:var(--r);border:2px dashed var(--blue);background:var(--bluedim);color:var(--blue2);font-size:14px;font-weight:700;cursor:pointer">+ Novo Treino</button><button onclick="homeEditMode=false;renderHome()" style="padding:11px 16px;border-radius:var(--r);border:1px solid var(--border);background:var(--card);color:var(--green);font-size:14px;font-weight:700;cursor:pointer">\u2713 Pronto</button></div>'
    :'<button onclick="homeEditMode=true;renderHome()" style="width:100%;margin-bottom:14px;padding:11px;border-radius:var(--r);border:1px dashed var(--border);background:transparent;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer">\u270F\uFE0F Gerenciar Treinos</button>';
  var wml=getWaterToday(),wmeta=getWaterMeta(),wpct=Math.min(100,Math.round(wml/wmeta*100));
  var waterBar='<div onclick="showPage(\'water\')" style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:12px 16px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px"><span style="font-size:24px">\uD83D\uDCA7</span><div style="flex:1"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:13px;font-weight:600">\u00C1gua hoje</span><span style="font-size:13px;color:var(--teal);font-weight:700">'+wml+'ml / '+wmeta+'ml</span></div><div class="prog"><div class="prog-fill" style="width:'+wpct+'%;background:linear-gradient(90deg,var(--teal),#06b6d4)"></div></div></div></div>';
  var histHtml=hist.length?hist.map(function(s){return'<div onclick="showPage(\'detail\',\''+s.id+'\')" style="background:var(--card);border:1px solid var(--border);border-left:3px solid '+(s.type==='tennis'?'var(--green)':s.type==='activity'?'var(--purple)':'var(--blue2)')+';border-radius:var(--rl);padding:14px 16px;display:flex;align-items:center;gap:12px;margin-bottom:8px;cursor:pointer"><span style="font-size:24px">'+(s.type==='tennis'?'\uD83C\uDFBE':s.type==='activity'?'\uD83C\uDFC3':'\uD83C\uDFCB\uFE0F')+'</span><div style="flex:1"><div style="font-weight:600;font-size:15px">'+esc(s.workoutName||'Treino')+'</div><div style="font-size:12px;color:var(--muted)">'+fmtDate(s.date)+' \u00B7 '+fmtMin(s.duration||0)+'</div></div><span style="color:var(--muted);font-size:18px">\u203A</span></div>';}).join(''):'<div class="empty"><div style="font-size:48px">\uD83D\uDCAA</div><p>Nenhum treino ainda.</p></div>';
  document.getElementById('home-body').innerHTML=
    '<div style="padding:calc(20px + var(--st)) 20px 0;background:linear-gradient(180deg,rgba(77,148,255,0.07),transparent)"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><div><div style="font-family:var(--fd);font-size:36px;letter-spacing:0.04em">GymTracker</div><p style="font-size:13px;color:var(--txt2)">Ol\u00E1, <strong>'+esc(CURRENT_USER||'')+'</strong>!</p></div><img src="icon-192.png" style="width:48px;height:48px;border-radius:16px;object-fit:cover"/></div>'
    +'<div style="display:flex;gap:12px;margin:16px 0;padding:14px 16px;background:var(--card);border:1px solid var(--border);border-radius:var(--r)"><div style="flex:1;text-align:center"><div style="font-family:var(--fd);font-size:30px;color:var(--blue2)">'+wk.n+'</div><div style="font-size:11px;color:var(--muted)">Treinos semana</div></div><div style="width:1px;background:var(--border)"></div><div style="flex:1;text-align:center"><div style="font-family:var(--fd);font-size:30px;color:var(--orange)">'+fmtMin(wk.mins)+'</div><div style="font-size:11px;color:var(--muted)">Tempo total</div></div></div></div>'
    +liveBanner
    +'<div style="padding:0 20px 20px">'+waterBar
    +'<div style="margin-bottom:10px"><p style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em">Iniciar Treino</p></div>'
    +editBar+wBtns
    +'<button onclick="showPage(\'tennis\')" style="display:flex;align-items:center;gap:14px;padding:16px;border-radius:20px;border:1px solid rgba(63,185,80,0.3);background:rgba(63,185,80,0.08);color:var(--txt);width:100%;margin-bottom:10px;font-family:var(--fb);cursor:pointer;text-align:left"><span style="width:40px;height:40px;border-radius:12px;background:rgba(63,185,80,0.15);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">\uD83C\uDFBE</span><div style="flex:1"><div style="font-weight:700;font-size:17px">Registrar T\u00EAnis</div><div style="font-size:12px;color:var(--muted)">Dura\u00E7\u00E3o e observa\u00E7\u00F5es</div></div><span style="font-size:20px;color:var(--green)">\u2192</span></button>'
    +'<button onclick="showPage(\'activity\')" style="display:flex;align-items:center;gap:14px;padding:16px;border-radius:20px;border:1px solid rgba(163,113,247,0.3);background:rgba(163,113,247,0.08);color:var(--txt);width:100%;margin-bottom:24px;font-family:var(--fb);cursor:pointer;text-align:left"><span style="width:40px;height:40px;border-radius:12px;background:rgba(163,113,247,0.15);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">\uD83C\uDFC3</span><div style="flex:1"><div style="font-weight:700;font-size:17px">Registrar Atividade</div><div style="font-size:12px;color:var(--muted)">Corrida, bike, yoga e mais</div></div><span style="font-size:20px;color:var(--purple)">\u2192</span></button>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><p style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em">\u00DAltimos Treinos</p><button onclick="showPage(\'history\')" style="font-size:13px;color:var(--blue2);background:none;border:none;cursor:pointer;font-family:var(--fb)">Ver todos \u2192</button></div>'
    +histHtml+'</div>';
}