
function renderWeightChart(){
  var sel=document.getElementById('sel-ex');if(!sel)return;
  var name=sel.value,wh=getWeights(),data=(wh[name]||[]).slice(-10),el=document.getElementById('wt-chart');if(!el)return;
  if(!data.length){el.innerHTML='';return;}
  var maxW=Math.max.apply(null,data.map(function(d){return d.weight||0;}).concat([1]));
  var last=(data[data.length-1]&&data[data.length-1].weight)||0,best=Math.max.apply(null,data.map(function(d){return d.weight||0;}));
  el.innerHTML='<div class="card"><div style="display:flex;gap:12px;margin-bottom:16px"><div style="flex:1;text-align:center"><div style="font-family:var(--fd);font-size:24px;color:var(--blue2)">'+last+'kg</div><div style="font-size:11px;color:var(--muted)">\u00DAltima</div></div><div style="flex:1;text-align:center"><div style="font-family:var(--fd);font-size:24px;color:var(--orange)">'+best+'kg</div><div style="font-size:11px;color:var(--muted)">Melhor</div></div></div>'+(data.length>1?'<div style="display:flex;align-items:flex-end;gap:4px;height:80px">'+data.map(function(d,i){return'<div style="flex:1;height:100%;display:flex;align-items:flex-end"><div style="width:100%;height:'+(d.weight||0)/maxW*100+'%;background:'+(i===data.length-1?'linear-gradient(180deg,var(--blue),var(--bluedim))':'var(--border)')+';border-radius:3px 3px 0 0"></div></div>';}).join('')+'</div>':'')+'</div>';
}


// PART 4: Water, Food, Tennis, Activities
function renderWater(){
  try {
    var ml=getWaterToday(),meta=getWaterMeta(),pct=Math.min(100,Math.round(ml/meta*100));
    var cups=Math.ceil(meta/250),filled=Math.round(ml/250);
    var sub=document.getElementById('water-sub');
    if(sub) sub.textContent=ml+'ml de '+meta+'ml - '+pct+'%';
    var drops='';
    for(var i=0;i<cups;i++){
      drops+='<div class="drop '+(i<filled?'filled':'')+'" onclick="addWater(250);renderWater()">\uD83D\uDCA7</div>';
    }
    var quickBtns='';
    [150,200,250,350,500].forEach(function(v){
      quickBtns+='<button class="btn btn-ghost btn-sm" style="flex:1;padding:8px 4px;font-size:13px" onclick="addWater('+v+');renderWater()">+'+v+'ml</button>';
    });
    var metaBtns='';
    [1500,2000,2500,3000,3500].forEach(function(v){
      metaBtns+='<button class="btn btn-ghost btn-sm" style="flex:1;padding:8px 4px;font-size:12px;'+(meta===v?'border-color:var(--blue);color:var(--blue2)':'')+'" onclick="setWaterMeta('+v+');renderWater()">'+v+'ml</button>';
    });
    var body=document.getElementById('water-body');
    if(!body) return;
    body.innerHTML=
      '<div class="card" style="text-align:center;padding:24px;margin-bottom:16px">'
      +'<div style="font-family:var(--fd);font-size:52px;color:var(--teal);line-height:1">'+ml+'<span style="font-size:24px">ml</span></div>'
      +'<div style="font-size:14px;color:var(--txt2);margin:6px 0 16px">Meta: '+meta+'ml &middot; '+pct+'%</div>'
      +'<div class="prog" style="height:8px;margin-bottom:8px"><div class="prog-fill" style="width:'+pct+'%;background:linear-gradient(90deg,var(--teal),#06b6d4)"></div></div>'
      +(pct>=100?'<p style="font-size:13px;color:var(--teal);font-weight:600;margin-top:8px">\uD83C\uDF89 Meta atingida!</p>':'')
      +'</div>'
      +'<p class="lbl" style="margin-bottom:10px">Copos de 250ml</p>'
      +'<div class="water-drops" style="margin-bottom:20px">'+drops+'</div>'
      +'<p class="lbl" style="margin-bottom:10px">Adicionar rapidamente</p>'
      +'<div style="display:flex;gap:8px;margin-bottom:16px">'+quickBtns+'</div>'
      +'<div style="display:flex;gap:8px;margin-bottom:24px">'
      +'<input type="number" id="water-custom" placeholder="Outro valor (ml)" style="flex:1"/>'
      +'<button class="btn btn-blue" style="width:auto;padding:10px 16px;min-height:44px" onclick="addCustomWater()">Adicionar</button>'
      +'</div>'
      +'<p class="lbl" style="margin-bottom:10px">Meta di\u00E1ria</p>'
      +'<div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap">'+metaBtns+'</div>'
      +'<button class="btn btn-danger" style="margin-top:12px" onclick="var w=ls(KEYS.WATER)||{};w[getTodayKey()]=0;lss(KEYS.WATER,w);renderWater()">\uD83D\uDD04 Resetar hoje</button>';
  } catch(e) {
    var body=document.getElementById('water-body');
    if(body) body.innerHTML='<div class="empty"><div style="font-size:48px">\uD83D\uDCA7</div><p style="color:var(--red)">Erro: '+e.message+'</p></div>';
    console.error('renderWater error:', e);
  }
}

var MEAL_NAMES={breakfast:'\u2600\uFE0F Caf\u00E9 da Manh\u00E3',lunch:'\uD83C\uDF24\uFE0F Almo\u00E7o',snack:'\uD83C\uDF4E Lanche',dinner:'\uD83C\uDF19 Jantar'};
var FOOD_SUGGESTIONS={
  breakfast:['Ovos mexidos com torrada integral','Iogurte grego com granola e frutas','Tapioca com queijo e presunto','Aveia com banana e mel','Vitamina de frutas com whey','P\u00E3o integral com pasta de amendoim'],
  lunch:['Arroz integral, feij\u00E3o e frango grelhado','Salada de quinoa com legumes','Macarr\u00E3o integral ao molho de tomate','Peixe assado com legumes','Bowl de prote\u00EDna com arroz e vegetais','Frango ao curry com arroz basmati'],
  snack:['Frutas variadas','Castanhas e am\u00EAndoas','Iogurte natural','Barra de cereal integral','Ma\u00E7\u00E3 com pasta de amendoim','Hummus com cenoura'],
  dinner:['Sopa de legumes com frango','Omelete com vegetais','Fil\u00E9 de peixe grelhado com salada','Frango com br\u00F3colis no vapor','Carne magra com batata doce','Wrap integral com atum']
};
function renderFood(){
  try {
    var today=getFoodToday();
    var meals=['breakfast','lunch','snack','dinner'];
    var html='<p style="font-size:13px;color:var(--txt2);margin-bottom:16px">\uD83D\uDCC5 '+new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})+'</p>';
    meals.forEach(function(meal){
      var items=today[meal]||[];
      var icon=MEAL_NAMES[meal].split(' ')[0];
      var mname=MEAL_NAMES[meal].slice(MEAL_NAMES[meal].indexOf(' ')+1);
      var itemsHtml='';
      if(items.length){
        for(var i=0;i<items.length;i++){
          var safeItem=esc(items[i]);
          itemsHtml+='<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">'
            +'<span style="flex:1;font-size:14px">'+safeItem+'</span>'
            +'<button data-meal="'+meal+'" data-idx="'+i+'" onclick="removeFoodItem(this.dataset.meal,+this.dataset.idx)" style="background:none;border:none;color:var(--muted);font-size:16px;padding:2px;cursor:pointer">\u2715</button>'
            +'</div>';
        }
      } else {
        itemsHtml='<p style="font-size:13px;color:var(--muted);padding:8px 0">Nenhum item registrado</p>';
      }
      var suggs='';
      var slist=FOOD_SUGGESTIONS[meal]||[];
      for(var j=0;j<Math.min(3,slist.length);j++){
        suggs+='<button data-meal="'+meal+'" data-item="'+esc(slist[j])+'" onclick="addFoodItem(this.dataset.meal,this.dataset.item)" style="background:var(--bg);border:1px solid var(--border);border-radius:var(--rs);padding:7px 10px;font-size:12px;color:var(--txt2);cursor:pointer;text-align:left;font-family:var(--fb)">'+esc(slist[j])+'</button>';
      }
      html+='<div class="meal-card">'
        +'<div class="meal-hdr" data-meal="'+meal+'" onclick="toggleMeal(this.dataset.meal)">'
        +'<div style="display:flex;align-items:center;gap:10px">'
        +'<span style="font-size:18px">'+icon+'</span>'
        +'<div><div style="font-weight:700;font-size:15px">'+mname+'</div>'
        +'<div style="font-size:12px;color:var(--muted)">'+items.length+' item'+(items.length!==1?'s':'')+'</div>'
        +'</div></div>'
        +'<span style="color:var(--muted)" id="arrow-'+meal+'">\u25BC</span>'
        +'</div>'
        +'<div class="meal-body" id="meal-'+meal+'">'
        +itemsHtml
        +'<div style="display:flex;gap:8px;margin-top:10px;margin-bottom:10px">'
        +'<input id="food-input-'+meal+'" placeholder="Adicionar alimento..." style="flex:1;font-size:14px;padding:8px 10px"/>'
        +'<button data-meal="'+meal+'" class="btn btn-blue" style="width:auto;padding:8px 14px;min-height:38px;font-size:13px" onclick="addFoodFromInput(this.dataset.meal)">+ Add</button>'
        +'</div>'
        +'<p style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Sugest\u00F5es</p>'
        +'<div style="display:flex;flex-direction:column;gap:6px">'+suggs+'</div>'
        +'<button data-meal="'+meal+'" onclick="showAllSuggestions(this.dataset.meal)" style="background:none;border:none;color:var(--blue2);font-size:13px;cursor:pointer;padding:8px 0;font-family:var(--fb)">Ver mais \u2192</button>'
        +'</div></div>';
    });
    var body=document.getElementById('food-body');
    if(body) body.innerHTML=html;
  } catch(e) {
    var body=document.getElementById('food-body');
    if(body) body.innerHTML='<div class="empty"><div style="font-size:48px">\uD83C\uDF7D\uFE0F</div><p style="color:var(--red)">Erro: '+e.message+'</p></div>';
    console.error('renderFood error:', e);
  }
}

function toggleMeal(meal){var body=document.getElementById('meal-'+meal),arrow=document.getElementById('arrow-'+meal);if(!body)return;var open=body.classList.contains('open');body.classList.toggle('open');if(arrow)arrow.textContent=open?'\u25BC':'\u25B2';}
function addFoodFromInput(meal){var inp=document.getElementById('food-input-'+meal);if(!inp||!inp.value.trim())return;addFoodItem(meal,inp.value.trim());inp.value='';renderFood();setTimeout(function(){toggleMeal(meal);},50);}
function addFoodItem(meal,item){var today=getFoodToday();today[meal]=(today[meal]||[]).concat([item]);saveFoodToday(today);renderFood();}
function removeFoodItem(meal,idx){var today=getFoodToday();today[meal]=(today[meal]||[]).filter(function(_,i){return i!==idx;});saveFoodToday(today);renderFood();}
function showAllSuggestions(meal){
  var mname=MEAL_NAMES[meal].slice(MEAL_NAMES[meal].indexOf(' ')+1);
  var btns='';
  (FOOD_SUGGESTIONS[meal]||[]).forEach(function(s){
    btns+='<button data-meal="'+meal+'" data-item="'+esc(s)+'" onclick="addFoodItem(this.dataset.meal,this.dataset.item);closeModal()" style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px;font-size:14px;color:var(--txt);cursor:pointer;text-align:left;font-family:var(--fb)">'+esc(s)+'</button>';
  });
  openModal('<h3 style="font-family:var(--fd);font-size:22px;margin-bottom:16px">Sugest\u00F5es - '+mname+'</h3><div style="display:flex;flex-direction:column;gap:8px">'+btns+'</div>');
}

function renderTennis(){
  document.getElementById('tennis-body').innerHTML='<div style="display:flex;flex-direction:column;gap:16px"><div><span class="lbl">Data</span><input type="date" id="t-date" value="'+new Date().toISOString().split('T')[0]+'"/></div><div><span class="lbl">Dura\u00E7\u00E3o (minutos)</span><div class="ngrp" style="margin-bottom:8px"><button class="sbtn" onclick="tStep(-15)">-</button><input type="number" id="t-dur" value="60" min="1"/><button class="sbtn" onclick="tStep(15)">+</button></div><div style="display:flex;gap:8px">'+[30,45,60,90,120].map(function(t){return'<button class="btn btn-ghost btn-sm" style="flex:1" onclick="document.getElementById(\'t-dur\').value='+t+'">'+t+'min</button>';}).join('')+'</div></div><div><span class="lbl">Observa\u00E7\u00F5es</span><textarea id="t-notes" placeholder="Como foi?" rows="3" style="resize:vertical"></textarea></div><div><span class="lbl">Como voc\u00EA se sentiu?</span><div style="display:flex;gap:8px"><button class="feeling-btn" id="tf-easy" onclick="selectTFeeling(\'easy\')"><span class="feel-ico">\uD83D\uDE0A</span>F\u00E1cil</button><button class="feeling-btn" id="tf-medium" onclick="selectTFeeling(\'medium\')"><span class="feel-ico">\uD83D\uDE24</span>Moderado</button><button class="feeling-btn" id="tf-hard" onclick="selectTFeeling(\'hard\')"><span class="feel-ico">\uD83E\uDD75</span>Dif\u00EDcil</button></div></div><button class="btn btn-green" onclick="saveTennis()" style="font-size:17px;min-height:56px">\uD83D\uDCBE Salvar T\u00EAnis</button></div>';
  window._tFeeling=null;
}
function selectTFeeling(f){window._tFeeling=f;document.querySelectorAll('[id^="tf-"]').forEach(function(b){b.classList.remove('selected');});var el=document.getElementById('tf-'+f);if(el)el.classList.add('selected');}
function tStep(d){var i=document.getElementById('t-dur');if(i)i.value=Math.max(5,(+i.value||60)+d);}
function saveTennis(){var dur=+((document.getElementById('t-dur')||{}).value)||60,notes=(document.getElementById('t-notes')||{}).value||'',date=(document.getElementById('t-date')||{}).value||new Date().toISOString().split('T')[0];saveSession({id:uid(),type:'tennis',workoutName:'T\u00EAnis \uD83C\uDFBE',date:new Date(date+'T12:00:00').toISOString(),duration:dur,notes:notes,feeling:window._tFeeling,exercises:[]});toast('\uD83C\uDFBE T\u00EAnis salvo!');setTimeout(function(){showPage('history');},700);}

var ACTIVITIES=[
  {id:'run',name:'Corrida',ico:'\uD83C\uDFC3'},{id:'bike',name:'Ciclismo',ico:'\uD83D\uDEB4'},{id:'swim',name:'Nata\u00E7\u00E3o',ico:'\uD83C\uDFCA'},{id:'yoga',name:'Yoga',ico:'\uD83E\uDDD8'},
  {id:'walk',name:'Caminhada',ico:'\uD83D\uDEB6'},{id:'dance',name:'Dan\u00E7a',ico:'\uD83D\uDC83'},{id:'jump',name:'Pular Corda',ico:'\u26A1'},{id:'hiit',name:'HIIT',ico:'\uD83D\uDD25'},
  {id:'pilates',name:'Pilates',ico:'\uD83E\uDD38'},{id:'box',name:'Boxe',ico:'\uD83E\uDD4A'},{id:'skate',name:'Skate',ico:'\uD83D\uDEF9'},{id:'surf',name:'Surf',ico:'\uD83C\uDFC4'},
  {id:'climb',name:'Escalada',ico:'\uD83E\uDDD7'},{id:'row',name:'Remo',ico:'\uD83D\uDEA3'},{id:'football',name:'Futebol',ico:'\u26BD'},{id:'basketball',name:'Basquete',ico:'\uD83C\uDFC0'},
  {id:'volleyball',name:'V\u00F4lei',ico:'\uD83C\uDFD0'},{id:'hike',name:'Trilha',ico:'\u26F0\uFE0F'},{id:'stretch',name:'Alongamento',ico:'\uD83D\uDE46'},{id:'other',name:'Outro',ico:'\uD83C\uDFAF'}
];
var _actSelected=null;
function renderActivity(){
  _actSelected=null;
  var grid=ACTIVITIES.map(function(a){return'<button id="act-'+a.id+'" onclick="selectActivity(\''+a.id+'\')" style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 6px;border-radius:var(--r);border:1px solid var(--border);background:var(--card);cursor:pointer;font-family:var(--fb);font-size:11px;font-weight:600;color:var(--txt2)"><span style="font-size:26px">'+a.ico+'</span><span>'+a.name+'</span></button>';}).join('');
  document.getElementById('activity-body').innerHTML='<div style="display:flex;flex-direction:column;gap:16px"><div><span class="lbl" style="margin-bottom:10px">Selecione a atividade</span><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">'+grid+'</div></div><div><span class="lbl">Data</span><input type="date" id="act-date" value="'+new Date().toISOString().split('T')[0]+'"/></div><div><span class="lbl">Dura\u00E7\u00E3o (minutos)</span><div class="ngrp" style="margin-bottom:8px"><button class="sbtn" onclick="actStep(-5)">-</button><input type="number" id="act-dur" value="30" min="1"/><button class="sbtn" onclick="actStep(5)">+</button></div><div style="display:flex;gap:8px">'+[15,30,45,60,90].map(function(t){return'<button class="btn btn-ghost btn-sm" style="flex:1" onclick="document.getElementById(\'act-dur\').value='+t+'">'+t+'min</button>';}).join('')+'</div></div><div><span class="lbl">Observa\u00E7\u00F5es</span><textarea id="act-notes" placeholder="Como foi?" rows="2" style="resize:vertical"></textarea></div><div><span class="lbl">Como voc\u00EA se sentiu?</span><div style="display:flex;gap:8px"><button class="feeling-btn" id="af-easy" onclick="selectAFeeling(\'easy\')"><span class="feel-ico">\uD83D\uDE0A</span>F\u00E1cil</button><button class="feeling-btn" id="af-medium" onclick="selectAFeeling(\'medium\')"><span class="feel-ico">\uD83D\uDE24</span>Moderado</button><button class="feeling-btn" id="af-hard" onclick="selectAFeeling(\'hard\')"><span class="feel-ico">\uD83E\uDD75</span>Dif\u00EDcil</button></div></div><button class="btn btn-orange" onclick="saveActivity()" style="font-size:17px;min-height:56px">\uD83D\uDCBE Salvar Atividade</button></div>';
  window._aFeeling=null;
}