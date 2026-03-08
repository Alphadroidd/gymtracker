
function homeRenameWorkout(id,val){saveWorkouts(getWorkouts().map(function(w){return w.id===id?Object.assign({},w,{name:val}):w;}));}
function homeAddWorkout(){var name='Treino '+String.fromCharCode(65+getWorkouts().length);var nw={id:uid(),name:name,exercises:[]};saveWorkouts(getWorkouts().concat([nw]));renderHome();setTimeout(function(){homeEditExercises(nw.id);},100);}
function homeDupWorkout(id){var w=getWorkouts().find(function(x){return x.id===id;});if(!w)return;saveWorkouts(getWorkouts().concat([Object.assign({},w,{id:uid(),name:w.name+' (c\u00F3pia)',exercises:(w.exercises||[]).map(function(e){return Object.assign({},e,{id:uid()});})})]));renderHome();}
function homeDelWorkout(id){openModal('<h3 style="font-family:var(--fd);font-size:24px;margin-bottom:10px">Excluir treino?</h3><p style="color:var(--txt2);font-size:14px;margin-bottom:20px">Essa a\u00E7\u00E3o n\u00E3o pode ser desfeita.</p><div style="display:flex;flex-direction:column;gap:10px"><button class="btn btn-danger" onclick="saveWorkouts(getWorkouts().filter(function(w){return w.id!==\''+id+'\';}));closeModal();renderHome()">\uD83D\uDDD1 Excluir</button><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button></div>');}
function homeEditExercises(wId){renderExerciseEditorModal(wId);}

var EXSUGG=[];
function renderExerciseEditorModal(wId){
  var w=getWorkouts().find(function(x){return x.id===wId;});if(!w)return;
  function exRows(){
    var wC=getWorkouts().find(function(x){return x.id===wId;});
    return(wC.exercises||[]).map(function(ex){return'<div id="exrow-'+ex.id+'" style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:12px;margin-bottom:8px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="color:var(--muted);font-size:16px;flex-shrink:0">\u2630</span><input value="'+esc(ex.name)+'" list="ex-sugg-modal" placeholder="Nome do exerc\u00EDcio" oninput="modalUpdEx(\''+wId+'\',\''+ex.id+'\',\'name\',this.value)" style="flex:1;font-weight:600;font-size:14px;padding:7px 10px"/><button onclick="modalRmEx(\''+wId+'\',\''+ex.id+'\')" style="background:none;border:none;color:var(--red);font-size:20px;padding:4px;cursor:pointer;flex-shrink:0">\u2715</button></div><div style="display:flex;gap:8px"><div style="flex:1"><span class="lbl">S\u00E9ries</span><input type="number" value="'+ex.sets+'" min="1" oninput="modalUpdEx(\''+wId+'\',\''+ex.id+'\',\'sets\',+this.value)" style="text-align:center;padding:7px 8px;font-size:15px"/></div><div style="flex:1"><span class="lbl">Reps</span><input type="number" value="'+ex.reps+'" min="1" oninput="modalUpdEx(\''+wId+'\',\''+ex.id+'\',\'reps\',+this.value)" style="text-align:center;padding:7px 8px;font-size:15px"/></div></div></div>';}).join('');
  }
  openModal('<div style="margin-bottom:16px"><h2 style="font-family:var(--fd);font-size:24px">'+esc(w.name)+'</h2><p style="font-size:12px;color:var(--txt2)">Toque no nome para editar</p></div>'
    +'<span class="lbl" style="margin-bottom:10px">Nome do treino</span>'
    +'<input id="modal-wo-name" value="'+esc(w.name)+'" oninput="modalRenameWorkout(\''+wId+'\',this.value)" style="margin-bottom:16px;font-size:17px;font-weight:700"/>'
    +'<span class="lbl" style="margin-bottom:10px">Exerc\u00EDcios</span>'
    +'<datalist id="ex-sugg-modal">'+EXSUGG.map(function(s){return'<option value="'+esc(s)+'">';}).join('')+'</datalist>'
    +'<div id="modal-ex-list">'+exRows()+'</div>'
    +'<button onclick="modalAddEx(\''+wId+'\')" style="width:100%;padding:12px;border-radius:var(--r);border:2px dashed var(--blue);background:var(--bluedim);color:var(--blue2);font-size:14px;font-weight:700;cursor:pointer;margin-top:4px;margin-bottom:20px;font-family:var(--fb)">+ Adicionar Exerc\u00EDcio</button>'
    +'<button class="btn btn-green" onclick="closeModal();renderHome();if(WO&&WO.workout.id===\''+wId+'\'){WO.workout=getWorkouts().find(function(x){return x.id===\''+wId+'\';});renderWoBody();}">\u2713 Salvar e Fechar</button>');
}


// PART 2: Exercise editor helpers + Workout state
function modalRenameWorkout(wId,val){saveWorkouts(getWorkouts().map(function(w){return w.id===wId?Object.assign({},w,{name:val}):w;}));}
function modalUpdEx(wId,exId,field,val){saveWorkouts(getWorkouts().map(function(w){return w.id===wId?Object.assign({},w,{exercises:(w.exercises||[]).map(function(e){return e.id===exId?Object.assign({},e,{[field]:val}):e;})}):w;}));}
function modalRmEx(wId,exId){saveWorkouts(getWorkouts().map(function(w){return w.id===wId?Object.assign({},w,{exercises:(w.exercises||[]).filter(function(e){return e.id!==exId;})}):w;}));var _r=document.getElementById('exrow-'+exId);if(_r)_r.remove();}
function modalAddEx(wId){
  var ne={id:uid(),name:'',sets:3,reps:10,weight:0};
  saveWorkouts(getWorkouts().map(function(w){return w.id===wId?Object.assign({},w,{exercises:(w.exercises||[]).concat([ne])}):w;}));
  var list=document.getElementById('modal-ex-list');
  if(list){
    var div=document.createElement('div');
    div.id='exrow-'+ne.id;
    div.style.cssText='background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:12px;margin-bottom:8px';
    div.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="color:var(--muted);font-size:16px;flex-shrink:0">\u2630</span><input value="" list="ex-sugg-modal" placeholder="Nome do exerc\u00EDcio" oninput="modalUpdEx(\''+wId+'\',\''+ne.id+'\',\'name\',this.value)" style="flex:1;font-weight:600;font-size:14px;padding:7px 10px" autofocus/><button onclick="modalRmEx(\''+wId+'\',\''+ne.id+'\')" style="background:none;border:none;color:var(--red);font-size:20px;padding:4px;cursor:pointer;flex-shrink:0">\u2715</button></div><div style="display:flex;gap:8px"><div style="flex:1"><span class="lbl">S\u00E9ries</span><input type="number" value="3" min="1" oninput="modalUpdEx(\''+wId+'\',\''+ne.id+'\',\'sets\',+this.value)" style="text-align:center;padding:7px 8px;font-size:15px"/></div><div style="flex:1"><span class="lbl">Reps</span><input type="number" value="10" min="1" oninput="modalUpdEx(\''+wId+'\',\''+ne.id+'\',\'reps\',+this.value)" style="text-align:center;padding:7px 8px;font-size:15px"/></div></div>';
    list.appendChild(div);div.querySelector('input').focus();
  }
}

var WO=null;
function woBegin(){
  if(!WO||WO.started)return;
  WO.started=true;WO.start=Date.now();
  WO.timer=setInterval(function(){
    WO.elapsed=Math.floor((Date.now()-WO.start)/1000);
    var el=document.getElementById('wo-clock');if(el)el.textContent=fmtDur(WO.elapsed);
    var bc=document.getElementById('banner-clock');if(bc)bc.textContent=fmtDur(WO.elapsed);
    woUpdateProgress();
  },1000);
  renderWoHeader();
}
function startWorkout(id){
  if(WO&&WO.workout.id===id){renderWoHeader();renderWoBody();return;}
  if(WO){clearInterval(WO.timer);clearInterval(WO.restTimer);}
  var w=getWorkouts().find(function(x){return x.id===id;});
  if(!w){showPage('home');return;}
  var lw=lastWeightsMap();
  WO={workout:w,start:null,started:false,elapsed:0,timer:null,restTimer:null,restRemaining:0,restTotal:60,sets:{},data:{},feeling:null};
  w.exercises.forEach(function(ex){WO.sets[ex.id]=0;WO.data[ex.id]={weight:lw[ex.name]||ex.weight||0,reps:ex.reps};});
  renderWoHeader();renderWoBody();renderMusicPlayer();
}
function stopWorkout(){if(WO){if(WO.timer)clearInterval(WO.timer);if(WO.restTimer)clearInterval(WO.restTimer);}WO=null;}
function woTotalSets(){return WO?WO.workout.exercises.reduce(function(a,e){return a+e.sets;},0):0;}
function woDoneSets(){return WO?Object.values(WO.sets).reduce(function(a,v){return a+v;},0):0;}
function woUpdateProgress(){
  var tot=woTotalSets(),done=woDoneSets();
  var p=document.getElementById('wo-prog');if(p)p.style.width=(tot?done/tot*100:0)+'%';
  var l=document.getElementById('wo-prog-lbl');if(l)l.textContent=done+'/'+tot+' s\u00E9ries';
}
function renderWoHeader(){
  if(!WO)return;
  document.getElementById('wo-hdr').innerHTML=
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><button onclick="showPage(\'home\')" style="background:none;border:none;color:var(--txt2);font-size:22px;padding:4px;line-height:1;cursor:pointer">\u2190</button><div style="flex:1;display:flex;align-items:center;gap:10px"><span style="width:36px;height:36px;border-radius:10px;background:var(--bluedim);border:1px solid rgba(77,148,255,0.3);display:flex;align-items:center;justify-content:center;font-family:var(--fd);font-size:24px;color:var(--blue2);flex-shrink:0">'+WO.workout.name.split(' ').pop()+'</span><span style="font-family:var(--fd);font-size:24px">'+esc(WO.workout.name)+'</span></div><button onclick="woEditWorkout()" style="background:none;border:none;color:var(--txt2);font-size:20px;padding:4px;cursor:pointer">\u270F\uFE0F</button>'
    +(WO.started?'<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--rs);padding:5px 12px;font-family:var(--fd);font-size:20px;color:var(--blue2)" id="wo-clock">'+fmtDur(WO.elapsed)+'</div><button onclick="woAskFinish()" style="background:rgba(248,81,73,0.12);border:1px solid rgba(248,81,73,0.35);border-radius:8px;padding:5px 12px;color:#f85149;font-family:var(--fb);font-size:13px;font-weight:700;cursor:pointer">\u23F9</button>':'<button onclick="woBegin()" style="background:linear-gradient(135deg,#2ea043,#3fb950);border:none;border-radius:8px;padding:8px 18px;color:#fff;font-family:var(--fb);font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(63,185,80,0.4)">\u25B6 Iniciar</button>')
    +'</div><div style="display:flex;align-items:center;gap:10px"><div class="prog" style="flex:1"><div class="prog-fill" id="wo-prog" style="width:0%"></div></div><span style="font-size:12px;color:var(--muted)" id="wo-prog-lbl">0/'+woTotalSets()+' s\u00E9ries</span></div>';
  woUpdateProgress();
}
function woEditWorkout(){if(!WO)return;renderExerciseEditorModal(WO.workout.id);}
function renderWoBody(){
  if(!WO)return;
  var freshW=getWorkouts().find(function(x){return x.id===WO.workout.id;});
  if(freshW){WO.workout=freshW;freshW.exercises.forEach(function(ex){if(!(ex.id in WO.sets))WO.sets[ex.id]=0;if(!(ex.id in WO.data))WO.data[ex.id]={weight:0,reps:ex.reps};});}
  document.getElementById('wo-body').innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:10px 14px;background:var(--card);border:1px solid var(--border);border-radius:var(--r)"><span style="font-size:13px;color:var(--txt2)">'+WO.workout.exercises.length+' exerc\u00EDcios</span><button onclick="woEditWorkout()" style="background:var(--bluedim);border:1px solid rgba(77,148,255,0.3);border-radius:var(--rs);padding:6px 14px;color:var(--blue2);font-size:13px;font-weight:700;cursor:pointer;font-family:var(--fb)">\u270F\uFE0F Editar Treino</button></div>'
    +WO.workout.exercises.map(function(ex){return renderExCard(ex);}).join('')
    +'<div id="wo-rest-area"></div><div id="wo-finish-area" style="margin-top:8px"></div>';
  woCheckDone();
}
function exThumb(name,done){
  var url=EXERCISE_IMGS[name];
  if(!url){var keys=Object.keys(EXERCISE_IMGS),norm=function(s){return s.toLowerCase().replace(/[^a-z0-9]/g,'');},nameLow=norm(name);for(var i=0;i<keys.length;i++){if(norm(keys[i])===nameLow){url=EXERCISE_IMGS[keys[i]];break;}}}
  var html='<div style="width:58px;height:58px;border-radius:12px;overflow:hidden;flex-shrink:0;background:var(--bg2);position:relative">';
  if(url)html+='<img src="'+url+'" style="width:100%;height:100%;object-fit:cover;display:block" loading="lazy"/>';
  else html+='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:26px">'+(done?'\u2705':'\uD83D\uDCAA')+'</div>';
  if(done)html+='<div style="position:absolute;inset:0;background:rgba(63,185,80,0.7);display:flex;align-items:center;justify-content:center;font-size:22px">\u2705</div>';
  return html+'</div>';
}
function renderExCard(ex){
  if(!WO)return'';
  var done=WO.sets[ex.id]>=ex.sets,d=WO.data[ex.id]||{weight:0,reps:ex.reps},lw=lastWeightsMap()[ex.name];
  var dots=Array.from({length:ex.sets},function(_,j){return'<div style="width:10px;height:10px;border-radius:50%;background:'+(j<WO.sets[ex.id]?'var(--green)':'var(--border)')+'"></div>';}).join('');
  var body=done?'<div style="padding:0 16px 14px"><div style="background:rgba(63,185,80,0.08);border:1px solid rgba(63,185,80,0.2);border-radius:var(--rs);padding:10px 14px;display:flex;align-items:center;gap:8px"><span>\uD83C\uDFAF</span><span style="font-size:13px;color:var(--green);font-weight:600">Conclu\u00EDdo!</span></div></div>'
    :'<div style="padding:0 16px 14px;display:flex;flex-direction:column;gap:12px"><div style="display:flex;gap:12px"><div style="flex:1"><span class="lbl">Carga (kg)</span><div class="ngrp"><button class="sbtn" onclick="woStep(\''+ex.id+'\',\'weight\',-2.5)">-</button><input type="number" value="'+d.weight+'" min="0" step="0.5" oninput="woSet(\''+ex.id+'\',\'weight\',+this.value)" id="inp-w-'+ex.id+'"/><button class="sbtn" onclick="woStep(\''+ex.id+'\',\'weight\',2.5)">+</button></div>'+(lw>0?'<p style="font-size:11px;color:var(--muted);margin-top:3px">\u00DAltima: '+lw+'kg</p>':'')+'</div><div style="flex:1"><span class="lbl">Reps</span><div class="ngrp"><button class="sbtn" onclick="woStep(\''+ex.id+'\',\'reps\',-1)">-</button><input type="number" value="'+d.reps+'" min="1" oninput="woSet(\''+ex.id+'\',\'reps\',+this.value)" id="inp-r-'+ex.id+'"/><button class="sbtn" onclick="woStep(\''+ex.id+'\',\'reps\',1)">+</button></div></div></div><button class="btn btn-blue" onclick="woCompleteSet(\''+ex.id+'\')">\u2713 Concluir S\u00E9rie '+(WO.sets[ex.id]+1)+'/'+ex.sets+'</button></div>';
  return'<div id="exc-'+ex.id+'" style="background:var(--card);border:1px solid '+(done?'var(--green)':'var(--border)')+';border-radius:var(--rl);margin-bottom:12px;overflow:hidden"><div style="padding:14px 16px;display:flex;align-items:center;gap:12px">'+exThumb(ex.name,done)+'<div style="flex:1"><div style="font-weight:700;font-size:16px;color:'+(done?'var(--green)':'var(--txt)')+'">'+esc(ex.name)+'</div><div style="font-size:13px;color:var(--txt2)">'+WO.sets[ex.id]+'/'+ex.sets+' s\u00E9ries \u00B7 '+ex.reps+' reps</div></div><div style="display:flex;gap:4px">'+dots+'</div></div>'+body+'</div>';
}
function woStep(exId,field,delta){
  if(!WO)return;
  var d=WO.data[exId]||{},nv=Math.max(field==='reps'?1:0,(parseFloat(d[field])||0)+delta);
  var _d=Object.assign({},d);_d[field]=nv;WO.data[exId]=_d;
  var inp=document.getElementById('inp-'+field[0]+'-'+exId);if(inp)inp.value=nv;
}
function woSet(exId,field,val){if(!WO)return;var _d=WO.data[exId]||{};_d[field]=val;WO.data[exId]=_d;}
function woCompleteSet(exId){
  if(!WO)return;if(!WO.started)woBegin();
  WO.sets[exId]=(WO.sets[exId]||0)+1;vib([50,30,100]);
  var ex=WO.workout.exercises.find(function(e){return e.id===exId;});
  var card=document.getElementById('exc-'+exId);
  if(card&&ex){var t=document.createElement('div');t.innerHTML=renderExCard(ex);card.replaceWith(t.firstElementChild);}
  woUpdateProgress();woStartRest();woCheckDone();
  setTimeout(function(){var _ra=document.getElementById('wo-rest-area');if(_ra)_ra.scrollIntoView({behavior:'smooth',block:'center'});},150);
}