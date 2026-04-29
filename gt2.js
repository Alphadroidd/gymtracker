
function woStartRest(){
  if(!WO)return;clearInterval(WO.restTimer);WO.restRemaining=60;WO.restTotal=60;woRenderRest();
  WO.restTimer=setInterval(function(){
    if(!WO)return;WO.restRemaining--;
    if(WO.restRemaining<=0){clearInterval(WO.restTimer);vib([200,100,200,100,300]);var a=document.getElementById('wo-rest-area');if(a)a.innerHTML='';toast('\u23F0 Descansou! Hora de treinar!');}
    else woUpdateRing();
  },1000);
}
function woRenderRest(){
  var el=document.getElementById('wo-rest-area');if(!el||!WO)return;
  var circ=2*Math.PI*54;
  el.innerHTML='<div style="background:var(--card);border:1px solid var(--blue);border-radius:var(--rl);box-shadow:0 0 20px rgba(77,148,255,0.12);margin-bottom:12px"><div style="padding:14px 16px;border-bottom:1px solid var(--border)"><p style="font-size:12px;font-weight:700;color:var(--blue2);text-transform:uppercase;letter-spacing:0.08em">\u23F8 Descanso</p></div><div style="padding:20px;display:flex;flex-direction:column;align-items:center;gap:14px"><div style="position:relative;width:120px;height:120px"><svg width="120" height="120" style="transform:rotate(-90deg)"><circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" stroke-width="6"/><circle cx="60" cy="60" r="54" fill="none" stroke="var(--blue)" stroke-width="6" id="rest-ring" stroke-linecap="round" stroke-dasharray="'+circ+' '+circ+'"/></svg><div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><span style="font-family:var(--fd);font-size:34px;line-height:1" id="rest-num">'+WO.restRemaining+'</span><span style="font-size:11px;color:var(--muted)">seg</span></div></div><div style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" style="width:auto" onclick="woRestAdd(-15)">-15s</button><button class="btn btn-ghost btn-sm" style="width:auto" onclick="woRestAdd(15)">+15s</button><button class="btn btn-ghost btn-sm" style="width:auto" onclick="woRestAdd(30)">+30s</button></div><button class="btn btn-danger" onclick="woSkipRest()">Pular \u25B6</button></div></div>';
  woUpdateRing();
}
function woUpdateRing(){
  if(!WO)return;
  var num=document.getElementById('rest-num'),ring=document.getElementById('rest-ring');if(!num||!ring)return;
  num.textContent=WO.restRemaining;num.style.color=WO.restRemaining<=10?'var(--orange)':'var(--txt)';
  var circ=2*Math.PI*54;
  ring.setAttribute('stroke-dasharray',(circ*(WO.restRemaining/WO.restTotal))+' '+circ);
  ring.setAttribute('stroke',WO.restRemaining<=10?'var(--orange)':'var(--blue)');
}
function woRestAdd(d){if(!WO)return;WO.restRemaining=Math.max(0,WO.restRemaining+d);WO.restTotal=Math.max(WO.restTotal,WO.restRemaining);woUpdateRing();}
function woSkipRest(){if(!WO)return;clearInterval(WO.restTimer);var a=document.getElementById('wo-rest-area');if(a)a.innerHTML='';}
function woCheckDone(){
  if(!WO)return;var fa=document.getElementById('wo-finish-area');if(!fa)return;
  var all=WO.workout.exercises.every(function(ex){return WO.sets[ex.id]>=ex.sets;});
  if(all)fa.innerHTML='<button class="btn btn-green pulse" onclick="woAskFinish()" style="font-size:18px;min-height:60px">\uD83C\uDFC6 Finalizar Treino</button>';
  else if(woDoneSets()>0)fa.innerHTML='<button class="btn btn-ghost" onclick="woAskFinish()" style="font-size:14px">Encerrar antecipado</button>';
  else fa.innerHTML='';
}


// PART 3: Finish, Music, History, Detail, Stats
function woAskFinish(){
  openModal('<h2 style="font-family:var(--fd);font-size:26px;margin-bottom:16px">Como foi o treino?</h2>'
    +'<p style="color:var(--txt2);font-size:13px;margin-bottom:14px">Dura\u00E7\u00E3o: '+fmtDur(WO?WO.elapsed:0)+' \u00B7 '+woDoneSets()+'/'+woTotalSets()+' s\u00E9ries</p>'
    +'<p class="lbl" style="margin-bottom:10px">Como voc\u00EA se sentiu?</p>'
    +'<div style="display:flex;gap:8px;margin-bottom:20px"><button class="feeling-btn" id="feel-easy" onclick="selectFeeling(\'easy\')"><span class="feel-ico">\uD83D\uDE0A</span>F\u00E1cil</button><button class="feeling-btn" id="feel-medium" onclick="selectFeeling(\'medium\')"><span class="feel-ico">\uD83D\uDE24</span>Moderado</button><button class="feeling-btn" id="feel-hard" onclick="selectFeeling(\'hard\')"><span class="feel-ico">\uD83E\uDD75</span>Dif\u00EDcil</button></div>'
    +'<div style="display:flex;flex-direction:column;gap:10px"><button class="btn btn-green" onclick="closeModal();woFinish()">\uD83D\uDCBE Salvar e Finalizar</button><button class="btn btn-danger" onclick="closeModal();stopWorkout();showPage(\'home\')">\uD83D\uDDD1 Descartar</button><button class="btn btn-ghost" onclick="closeModal()">Continuar</button></div>');
}
function selectFeeling(f){if(WO)WO.feeling=f;document.querySelectorAll('.feeling-btn').forEach(function(b){b.classList.remove('selected');});var el=document.getElementById('feel-'+f);if(el)el.classList.add('selected');}
function woFinish(){
  if(!WO)return;
  var session={id:uid(),workoutId:WO.workout.id,workoutName:WO.workout.name,type:'gym',date:new Date().toISOString(),duration:Math.ceil(WO.elapsed/60),feeling:WO.feeling,
    exercises:WO.workout.exercises.map(function(ex){return{name:ex.name,sets:ex.sets,completedSets:WO.sets[ex.id]||0,weight:(WO.data[ex.id]&&WO.data[ex.id].weight)||0,reps:(WO.data[ex.id]&&WO.data[ex.id].reps)||ex.reps};})};
  saveSession(session);stopWorkout();toast('\uD83C\uDFC6 Treino salvo!');setTimeout(function(){showPage('history');},600);
}

function renderMusicPlayer(){
  var saved=localStorage.getItem('gt_music_url')||'',el=document.getElementById('music-player');if(!el)return;
  if(!saved){
    el.innerHTML='<div style="padding:10px 14px;display:flex;align-items:center;gap:8px">'
      +'<span style="font-size:18px;flex-shrink:0">\uD83C\uDFB5</span>'
      +'<input id="music-url-inp" placeholder="Cole link YouTube / playlist..." style="flex:1;font-size:13px;padding:7px 10px;border-radius:8px" onkeydown="if(event.key===\'Enter\')setMusicUrl()"/>'
      +'<button onclick="pasteMusic()" title="Colar" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:7px 10px;color:var(--txt2);font-size:16px;cursor:pointer;flex-shrink:0">\uD83D\uDCCB</button>'
      +'<button onclick="setMusicUrl()" style="background:var(--blue);border:none;border-radius:8px;padding:7px 14px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--fb);flex-shrink:0">\u25B6</button>'
      +'</div>';
    return;
  }
  var embedUrl='',ytList=saved.match(/[?&]list=([\w-]+)/),ytVideo=saved.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if(ytList)embedUrl='https://www.youtube.com/embed/videoseries?list='+ytList[1]+'&autoplay=1&rel=0';
  else if(ytVideo)embedUrl='https://www.youtube.com/embed/'+ytVideo[1]+'?autoplay=1&rel=0';
  else embedUrl=saved;
  el.innerHTML='<div><div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:16px">\uD83C\uDFB5</span><span style="font-size:12px;font-weight:600;color:var(--txt2)">Player de M\u00FAsica</span></div><div style="display:flex;gap:8px"><button onclick="toggleMusicSize()" id="music-size-btn" style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:4px 10px;color:var(--txt2);font-size:12px;cursor:pointer;font-family:var(--fb)">\u2B06 Expandir</button><button onclick="clearMusicUrl()" style="background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer;padding:2px 6px">\u2715</button></div></div><div id="music-frame-wrap" style="height:0;overflow:hidden;transition:height 0.3s"><iframe src="'+embedUrl+'" style="width:100%;height:200px;border:none;display:block" allow="autoplay;encrypted-media" allowfullscreen></iframe></div></div>';
}
function pasteMusic(){
  var inp=document.getElementById('music-url-inp');if(!inp)return;
  if(navigator.clipboard&&navigator.clipboard.readText){
    navigator.clipboard.readText().then(function(text){
      if(text&&text.trim()){inp.value=text.trim();inp.focus();toast('\uD83D\uDCCB Link colado!');}
      else{inp.focus();document.execCommand('paste');}
    }).catch(function(){inp.focus();document.execCommand('paste');});
  } else {
    inp.focus();document.execCommand('paste');
  }
}
function toggleMusicSize(){var wrap=document.getElementById('music-frame-wrap'),btn=document.getElementById('music-size-btn');if(!wrap)return;if(wrap.style.height==='0px'||wrap.style.height==='0'){wrap.style.height='200px';if(btn)btn.textContent='\u2B07 Minimizar';}else{wrap.style.height='0';if(btn)btn.textContent='\u2B06 Expandir';}}
function setMusicUrl(){var inp=document.getElementById('music-url-inp');if(!inp||!inp.value.trim())return;localStorage.setItem('gt_music_url',inp.value.trim());renderMusicPlayer();setTimeout(function(){toggleMusicSize();},100);}
function clearMusicUrl(){localStorage.removeItem('gt_music_url');renderMusicPlayer();}

var FEELING_LABEL={easy:'\uD83D\uDE0A F\u00E1cil',medium:'\uD83D\uDE24 Moderado',hard:'\uD83E\uDD75 Dif\u00EDcil'};
function renderHistory(){
  var hist=getHistory();
  document.getElementById('hist-sub').textContent=hist.length+' atividades registradas';
  var el=document.getElementById('hist-body');
  if(!hist.length){el.innerHTML='<div class="empty"><div style="font-size:48px">\uD83D\uDCCB</div><p>Nenhum treino ainda.</p></div>';return;}
  el.innerHTML=hist.map(function(s){return'<div onclick="showPage(\'detail\',\''+s.id+'\')" style="background:var(--card);border:1px solid var(--border);border-left:3px solid '+(s.type==='tennis'?'var(--green)':s.type==='activity'?'var(--purple)':'var(--blue2)')+';border-radius:var(--rl);padding:16px;margin-bottom:10px;cursor:pointer"><div style="display:flex;align-items:flex-start;gap:12px"><span style="font-size:28px;flex-shrink:0">'+(s.type==='tennis'?'\uD83C\uDFBE':s.type==='activity'?'\uD83C\uDFC3':'\uD83C\uDFCB\uFE0F')+'</span><div style="flex:1"><div style="font-weight:700;font-size:16px;margin-bottom:4px">'+esc(s.workoutName||'Treino')+'</div><div style="font-size:13px;color:var(--txt2);margin-bottom:6px">'+fmtDate(s.date)+' \u00B7 '+fmtMin(s.duration||0)+(s.feeling?' \u00B7 '+FEELING_LABEL[s.feeling]:'')+'</div><div>'+(s.exercises||[]).slice(0,4).map(function(ex){return'<span class="badge">'+esc(ex.name)+(ex.weight>0?' '+ex.weight+'kg':'')+'</span>';}).join('')+'</div>'+(s.notes?'<p style="font-size:13px;color:var(--txt2);margin-top:6px;font-style:italic">"'+esc(s.notes)+'"</p>':'')+'</div><button onclick="event.stopPropagation();delSession(\''+s.id+'\');renderHistory()" style="background:none;border:none;color:var(--muted);font-size:18px;padding:4px;cursor:pointer">\uD83D\uDDD1</button></div></div>';}).join('');
}
function renderDetail(id){
  var s=getHistory().find(function(x){return x.id===id;});if(!s){showPage('history');return;}
  document.getElementById('detail-hdr').innerHTML='<button onclick="showPage(\'history\')" style="background:none;border:none;color:var(--txt2);font-size:14px;margin-bottom:8px;padding:0;cursor:pointer;font-family:var(--fb)">\u2190 Voltar</button><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><div style="font-family:var(--fd);font-size:26px">'+esc(s.workoutName||'Treino')+'</div><button data-sid="'+s.id+'" onclick="openEditSession(this.dataset.sid)" style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:8px 14px;color:var(--txt2);font-size:13px;font-weight:700;cursor:pointer;font-family:var(--fb)">\u270F Editar</button></div><p style="font-size:13px;color:var(--txt2)">'+new Date(s.date).toLocaleDateString('pt-BR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})+'</p>';
  document.getElementById('detail-body').innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr'+(s.feeling?' 1fr':'')+';gap:10px;margin-bottom:20px"><div class="card" style="text-align:center"><div style="font-family:var(--fd);font-size:26px;color:var(--blue2)">'+fmtMin(s.duration||0)+'</div><div style="font-size:12px;color:var(--muted)">Dura\u00E7\u00E3o</div></div><div class="card" style="text-align:center"><div style="font-family:var(--fd);font-size:26px;color:var(--orange)">'+(s.exercises||[]).length+'</div><div style="font-size:12px;color:var(--muted)">Exerc\u00EDcios</div></div>'+(s.feeling?'<div class="card" style="text-align:center"><div style="font-size:26px">'+(s.feeling==='easy'?'\uD83D\uDE0A':s.feeling==='medium'?'\uD83D\uDE24':'\uD83E\uDD75')+'</div><div style="font-size:12px;color:var(--muted)">'+(s.feeling==='easy'?'F\u00E1cil':s.feeling==='medium'?'Moderado':'Dif\u00EDcil')+'</div></div>':'')+'</div>'
    +(s.exercises||[]).map(function(ex){return'<div class="card" style="padding:14px 16px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between"><div><div style="font-weight:700;font-size:15px">'+esc(ex.name)+'</div><div style="font-size:13px;color:var(--txt2)">'+(ex.completedSets||ex.sets)+'\u00D7'+ex.reps+' reps</div></div>'+(ex.weight>0?'<div style="text-align:right"><div style="font-family:var(--fd);font-size:22px;color:var(--blue2)">'+ex.weight+'</div><div style="font-size:11px;color:var(--muted)">kg</div></div>':'')+'</div>';}).join('')
    +(s.notes?'<div class="card" style="margin-top:8px"><p style="font-size:14px;color:var(--txt2);line-height:1.6">'+esc(s.notes)+'</p></div>':'')
    +'<button class="btn btn-ghost" onclick="showPage(\'history\')" style="margin-top:16px">\u2190 Voltar ao Hist\u00F3rico</button>';
}

function openEditSession(id){
  var s=getHistory().find(function(x){return x.id===id;});if(!s)return;
  var d=new Date(s.date);
  var dateVal=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  var dur=s.duration||0;
  var quickBtns=[30,45,60,75,90,120].map(function(t){return'<button data-val="'+t+'" onclick="document.getElementById(\'edit-dur\').value=this.dataset.val" style="padding:6px 12px;border-radius:var(--rs);border:1px solid var(--border);background:var(--bg);color:var(--txt2);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--fb)">'+t+'min</button>';}).join('');
  openModal(
    '<h2 style="font-family:var(--fd);font-size:26px;margin-bottom:4px">\u270F Editar Registro</h2>'
    +'<p style="font-size:14px;color:var(--txt2);margin-bottom:20px">'+esc(s.workoutName||'Treino')+'</p>'
    +'<div style="display:flex;flex-direction:column;gap:16px">'
    +'<div><span class="lbl">Data</span>'
    +'<input type="date" id="edit-date" value="'+dateVal+'"/>'
    +'</div>'
    +'<div><span class="lbl">Dura\u00E7\u00E3o (minutos)</span>'
    +'<div class="ngrp" style="margin-bottom:8px">'
    +'<button class="sbtn" onclick="var i=document.getElementById(\'edit-dur\');i.value=Math.max(1,+i.value-5)">-</button>'
    +'<input type="number" id="edit-dur" value="'+dur+'" min="1" style="text-align:center"/>'
    +'<button class="sbtn" onclick="var i=document.getElementById(\'edit-dur\');i.value=+i.value+5">+</button>'
    +'</div>'
    +'<div style="display:flex;gap:6px;flex-wrap:wrap">'+quickBtns+'</div>'
    +'</div>'
    +'<div><span class="lbl">Observa\u00E7\u00F5es</span>'
    +'<textarea id="edit-notes" rows="2" style="resize:vertical">'+esc(s.notes||'')+'</textarea>'
    +'</div>'
    +'<button class="btn btn-blue" data-sid="'+id+'" onclick="saveEditSession(this.dataset.sid)">\u2713 Salvar</button>'
    +'<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'
    +'</div>'
  );
}

function saveEditSession(id){
  var dateInp=document.getElementById('edit-date');
  var durInp=document.getElementById('edit-dur');
  var notesInp=document.getElementById('edit-notes');
  if(!dateInp||!durInp)return;
  var newDate=new Date(dateInp.value+'T12:00:00').toISOString();
  var newDur=Math.max(1,+durInp.value||1);
  var newNotes=notesInp?notesInp.value:'';
  lss(KEYS.H,getHistory().map(function(s){
    if(s.id!==id)return s;
    return Object.assign({},s,{date:newDate,duration:newDur,notes:newNotes});
  }));
  closeModal();
  toast('\u2705 Registro atualizado!');
  renderDetail(id);
}

function renderStats(){
  var hist=getHistory(),wk=weekStats(),wh=getWeights(),now=new Date();
  var mo=hist.filter(function(s){var d=new Date(s.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
  var totalH=hist.reduce(function(a,s){return a+(s.duration||0);},0);
  var counts={};hist.forEach(function(s){(s.exercises||[]).forEach(function(ex){counts[ex.name]=(counts[ex.name]||0)+(ex.completedSets||ex.sets);});});
  var top=Object.entries(counts).sort(function(a,b){return b[1]-a[1];}).slice(0,5),maxC=(top[0]&&top[0][1])||1,exs=Object.keys(wh);
  var year=now.getFullYear(),month=now.getMonth(),firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
  var monthNames=['Janeiro','Fevereiro','Mar\u00E7o','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  var dayMap={};hist.forEach(function(s){var d=new Date(s.date);if(d.getMonth()===month&&d.getFullYear()===year){var key=d.getDate();if(!dayMap[key])dayMap[key]=new Set();dayMap[key].add(s.type||'gym');}});
  var dayHeaders=['D','S','T','Q','Q','S','S'].map(function(d){return'<div style="text-align:center;font-size:11px;color:var(--muted);font-weight:600;padding:4px 0">'+d+'</div>';}).join('');
  var calCells=Array(firstDay).fill('<div class="cal-day empty"></div>').join('');
  for(var d=1;d<=daysInMonth;d++){var types=dayMap[d],isToday=d===now.getDate(),cls='cal-day';if(types){if(types.size>1)cls+=' has-multi';else if(types.has('tennis'))cls+=' has-tennis';else if(types.has('activity'))cls+=' has-activity';else cls+=' has-gym';}if(isToday)cls+=' today';calCells+='<div class="'+cls+'">'+d+'</div>';}
  var feelingStats={easy:0,medium:0,hard:0};hist.filter(function(s){return s.feeling;}).forEach(function(s){feelingStats[s.feeling]++;});
  var totalFeelings=Object.values(feelingStats).reduce(function(a,v){return a+v;},0);
  document.getElementById('stats-body').innerHTML=
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">'
    +[['\uD83D\uDCC5','Semana',wk.n,'treinos','var(--blue2)'],['\u23F1\uFE0F','Semana',fmtMin(wk.mins),'','var(--orange)'],['\uD83D\uDCC6','Este m\u00EAs',mo.length,'treinos','var(--green)'],['\uD83C\uDFC6','Total',Math.round(totalH/60*10)/10,'h','var(--purple)']].map(function(arr){return'<div class="card" style="text-align:center;padding:16px"><div style="font-size:22px;margin-bottom:4px">'+arr[0]+'</div><div style="font-family:var(--fd);font-size:26px;color:'+arr[4]+'">'+arr[2]+(arr[3]?'<span style="font-size:16px"> '+arr[3]+'</span>':'')+'</div><div style="font-size:11px;color:var(--muted);margin-top:4px">'+arr[1]+'</div></div>';}).join('')+'</div>'
    +'<p class="lbl" style="margin-bottom:8px">Calend\u00E1rio - '+monthNames[month]+' '+year+'</p>'
    +'<div class="card" style="margin-bottom:8px"><div class="cal-grid">'+dayHeaders+'</div><div class="cal-grid">'+calCells+'</div><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:12px;font-size:11px;color:var(--txt2)"><span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(77,148,255,0.3);margin-right:4px"></span>Muscula\u00E7\u00E3o</span><span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(63,185,80,0.3);margin-right:4px"></span>T\u00EAnis</span><span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:rgba(163,113,247,0.3);margin-right:4px"></span>Atividade</span></div></div>'
    +(totalFeelings>0?'<p class="lbl" style="margin-bottom:8px;margin-top:16px">Como voc\u00EA tem se sentido</p><div class="card" style="margin-bottom:20px;display:flex;gap:0">'+[['easy','\uD83D\uDE0A','F\u00E1cil','var(--green)'],['medium','\uD83D\uDE24','Moderado','var(--orange)'],['hard','\uD83E\uDD75','Dif\u00EDcil','var(--red)']].map(function(arr){return'<div style="flex:1;text-align:center;padding:12px 4px;border-right:1px solid var(--border)"><div style="font-size:22px">'+arr[1]+'</div><div style="font-family:var(--fd);font-size:22px;color:'+arr[3]+'">'+feelingStats[arr[0]]+'</div><div style="font-size:11px;color:var(--muted)">'+arr[2]+'</div></div>';}).join('')+'</div>':'')
    +(top.length?'<p class="lbl" style="margin-bottom:12px;margin-top:4px">Mais Realizados</p><div class="card" style="margin-bottom:20px">'+top.map(function(arr,i){return'<div style="margin-bottom:'+(i<top.length-1?'12px':'0')+'"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:14px;font-weight:600">'+esc(arr[0])+'</span><span style="font-size:13px;color:var(--muted)">'+arr[1]+' s\u00E9ries</span></div><div class="prog"><div class="prog-fill" style="width:'+arr[1]/maxC*100+'%"></div></div></div>';}).join('')+'</div>':'')
    +(exs.length?'<p class="lbl" style="margin-bottom:12px">Evolu\u00E7\u00E3o de Carga</p><select id="sel-ex" onchange="renderWeightChart()" style="margin-bottom:12px">'+exs.map(function(e){return'<option value="'+esc(e)+'">'+esc(e)+'</option>';}).join('')+'</select><div id="wt-chart"></div>':'');
  if(exs.length)renderWeightChart();
}