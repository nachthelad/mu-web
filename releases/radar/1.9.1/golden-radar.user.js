// ==UserScript==
// @name         MU · Golden Radar
// @namespace    local.mu.golden-radar
// @version      1.9.1
// @description  Radar local de dragones recibidos por el cliente durante Golden Invasion.
// @match        https://mu.mormon.garden/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  const DRAGONS = new Map([[43,"Golden Budge Dragon"],[44,"Golden Dragon"],[53,"Golden Titan"],[54,"Golden Soldier"],[78,"Golden Goblin"],[79,"Golden Derkon"],[80,"Golden Lizard King"],[81,"Golden Vepar"],[82,"Golden Tantallos"],[83,"Golden Wheel"],[493,"Golden Dark Knight"],[494,"Golden Devil"],[495,"Golden Stone Golem"],[496,"Golden Crust"],[497,"Golden Satyros"],[498,"Golden Twin Tail"],[499,"Golden Iron Knight"],[500,"Golden Napin"],[501,"Great Golden Dragon"],[502,"Golden Rabbit"]]);
  const MAPS = {0:'Lorencia',1:'Dungeon',2:'Devias',3:'Noria',4:'Lost Tower',7:'Atlans',8:'Tarkan',10:'Icarus'};
  const TTL = 90000;
  const INVADERS=new Map([[42,'Red Dragon'],[135,'White Wizard'],[136,'Destructive Soldier'],[137,'Destructive Archer']]);
  function visibleInvaders(data,whiteWizard,redDragon){const visible=row=>row.type===42?redDragon:whiteWizard;return {...data,live:data.live.filter(visible),recent:data.recent.filter(visible)};}
  function invaderColor(row){return row.type===42?'#ff7373':INVADERS.has(row.type)?'#f5f5ff':null;}
  const HISTORY_KEY='mu.golden-radar.sightings.v1';
  const HISTORY_LIMIT=5000;
  class Archive {
    constructor(storage,key=HISTORY_KEY) {
      this.storage=storage;this.key=key;this.records=[];this.saved=true;this.revision=0;this.observed=new Set();
      this.session=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
      try {
        const raw=storage.getItem(key);
        if(raw){const value=JSON.parse(raw);if(value.version!==1 || !Array.isArray(value.records))throw new Error('Invalid archive');
          this.records=value.records.filter(r=>r && typeof r.id==='string' && Number.isInteger(r.map) && r.map>=0 && DRAGONS.has(r.type) && Number.isFinite(r.x) && Number.isFinite(r.y) && r.x>=0 && r.x<256 && r.y>=0 && r.y<256 && Number.isFinite(r.time) && r.time>=0).slice(-HISTORY_LIMIT);}
      } catch {this.saved=false;this.loadFailed=true;}
    }
    observe(map,rows,now,confirmed) {
      if(!Number.isInteger(map) || map<0)return;
      let changed=false;
      for(const row of rows){
        const key=map+':'+row.observation;
        if(this.observed.has(key))continue;
        this.observed.add(key);
        this.records.push({id:this.session+':'+key,map,type:row.type,x:Math.floor(row.x),y:Math.floor(row.y),time:now,invasionConfirmed:!!confirmed});changed=true;
      }
      if(!changed)return;
      this.records=this.records.slice(-HISTORY_LIMIT);this.revision++;
      // Preserve malformed/unknown data rather than silently replacing it.
      if(this.loadFailed)return;
      try {this.storage.setItem(this.key,this.export());this.saved=true;}catch{this.saved=false;}
    }
    forMap(map,includeBudge=true){return this.records.filter(r=>r.map===map && (includeBudge || r.type!==43));}
    export(){return JSON.stringify({version:1,kind:'first-observed-positions',records:this.records},null,2);}
  }
  function position(entity) {
    const p = entity?.transform?.pos;
    return p && Number.isFinite(p.x) && Number.isFinite(p.z) && p.x >= 0 && p.z >= 0 && p.x < 256 && p.z < 256
      ? {x:p.x,y:p.z} : null;
  }
  function invasionPacket(packet) {
    if (!(packet instanceof DataView) || packet.byteLength !== 5 || packet.getUint8(0) !== 0xc1 || packet.getUint8(1) !== 5 || packet.getUint8(2) !== 0x0b) return null;
    return {enabled:!!(packet.getUint8(3)&1),event:packet.getUint8(4)};
  }
  function goldenNotice(packet){
    if(!(packet instanceof DataView)||packet.byteLength<5||packet.getUint8(0)!==0xc1||packet.getUint8(1)!==packet.byteLength||packet.getUint8(2)!==0x0d||packet.getUint8(3)!==0)return null;
    let text='';for(let i=4;i<packet.byteLength;i++){const c=packet.getUint8(i);if(!c)break;text+=String.fromCharCode(c);}
    const normalized=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(!/golden\s+(?:invasion|dragon)|invasion\s+(?:dorada|de dorados)|dragon(?:es)?\s+dorado/.test(normalized))return null;
    // A kill announcement is not a start/end signal for the whole event.
    if(/defeated|killed|derrot|elimin|matado/.test(normalized))return null;
    if(/has ended|finished|finaliz|termin|ended\b/.test(normalized))return'ended';
    if(/will (?:start|begin)|starts? in|comenzara|empezara|en \d+ (?:segundos|minutos)/.test(normalized))return'soon';
    if(/invasion!|has (?:started|begun)|appeared|comenzo|empezo|inici|apareci/.test(normalized))return'active';
    return null;
  }
  class GoldenEvent {
    constructor(){this.sequence=0;this.value=null;}
    clear(){this.value=null;}
    observe(phase,now){
      if(phase==='ended'){if(this.value)this.value={...this.value,phase,at:now};return;}
      if(!['soon','active'].includes(phase))return;
      if(this.value?.phase==='ended'&&now-this.value.at<60000)return;
      if(!this.value || this.value.phase==='ended' || now-this.value.startedAt>2100000)this.value={id:++this.sequence,phase,at:now,startedAt:now};
      else this.value={...this.value,phase:this.value.phase==='active'?'active':phase,at:now};
    }
    get(now){return this.value&&now-this.value.startedAt<=2100000?{...this.value}:null;}
  }
  class Tracker {
    constructor(types=DRAGONS) { this.types=types;this.sequence=0;this.clear(); }
    clear() { this.history=new Map();this.encounters=new WeakMap(); this.map=null; this.hero=null; this.world=null; }
    scan(world, now, includeBudge=true) {
      const hero=world?.playerEntity, player=position(hero);
      if (!hero || !player) { this.clear(); return {player:null,live:[],recent:[]}; }
      if (this.world!==world || this.hero!==hero || this.map!==world.mapIndex) {this.history.clear();this.encounters=new WeakMap();}
      this.world=world; this.hero=hero; this.map=world.mapIndex;
      const live=[], present=new Set();
      for (const entity of world.netObjsQuery?.entities ?? []) {
        const id=entity.netId, type=entity.npcType;
        if (!this.types.has(type) || id===undefined || entity.localPlayer) continue;
        if (entity.worldIndex!==undefined && entity.worldIndex!==world.mapIndex) continue;
        if (entity.dying) { this.history.delete(id); continue; }
        const p=position(entity);
        if (!p || entity.objOutOfScope) continue;
        if(!this.encounters.has(entity))this.encounters.set(entity,++this.sequence);
        const row={id,type,observation:this.encounters.get(entity),name:this.types.get(type),...p,seen:now,distance:Math.hypot(p.x-player.x,p.y-player.y)};
        present.add(id); this.history.set(id,row);
        if (includeBudge || type!==43) live.push(row);
      }
      const recent=[];
      for (const [id,row] of this.history) {
        if (now-row.seen>TTL) this.history.delete(id);
        else if (!present.has(id) && (includeBudge || row.type!==43)) recent.push({...row,distance:Math.hypot(row.x-player.x,row.y-player.y)});
      }
      live.sort((a,b)=>a.distance-b.distance);
      return {player,live,recent};
    }
  }
  function invasionMonsters(packet){if(!(packet instanceof DataView)||packet.byteLength<7)return null;const status=packet.getUint8(3),total=packet.getUint16(4),count=packet.getUint8(6);if(![1,2].includes(status)||packet.byteLength!==7+count*3)return null;const maps=[];for(let i=0;i<count;i++)maps.push({map:packet.getUint8(7+i*3),alive:packet.getUint16(8+i*3)});return{status,total,maps};}
  function countdown(text){const m=/^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(text.trim());if(!m||Number(m[3])>59||(m[1]&&Number(m[2])>59))return null;return (Number(m[1]??0)*3600+Number(m[2])*60+Number(m[3]))*1000;}
  function hudInvasion(clock,title=''){
    const rows=title.split('\n'),maps=[];
    for(const row of rows){const m=/^(.+):\s*(\d+)$/.exec(row.trim());if(!m)continue;const name=m[1].trim().toLowerCase(),entry=Object.entries(MAPS).find(([,n])=>n.toLowerCase()===name||(name==='davias'&&n==='Devias'));if(entry)maps.push({map:Number(entry[0]),alive:Number(m[2])});}
    const count=/^(\d+)\s+(?:left|restantes?|quedan?)$/i.exec(clock.trim());
    const active=!!count||maps.length>0||/^(?:active|activ[oa]|en curso)$/i.test(clock.trim());
    return {active,total:count?Number(count[1]):maps.length?maps.reduce((sum,m)=>sum+m.alive,0):null,maps};
  }
  class HudInvasion {
    constructor(){this.clear();}
    clear(){this.value=null;this.signature=null;}
    read(clock,title,now){const data=hudInvasion(clock,title),signature=JSON.stringify(data);if(!data.active){const ended=!!this.value;this.clear();return {ended};}if(signature!==this.signature){this.signature=signature;this.value={...data,at:now};}return now-this.value.at<=900000?{...this.value,maps:this.value.maps.map(m=>({...m}))}:{};}
  }
  const core={hudInvasion,HudInvasion,invasionMonsters,countdown,Tracker,Archive,position,invasionPacket,goldenNotice,GoldenEvent,DRAGONS,INVADERS,visibleInvaders,TTL,HISTORY_KEY,HISTORY_LIMIT};
  if (typeof module==='object' && module.exports && typeof document==='undefined') { module.exports=core; return; }
  if (location.hostname!=='mu.mormon.garden' && !window.__GOLDEN_RADAR_DEMO__) return;
  if (document.getElementById('mu-golden-radar')) return;
  const instanceKey=Symbol.for('mu.addons.instance.radar.v1');
  if(window[instanceKey])return;
  window[instanceKey]=true;
  console.info('[Golden Radar] Iniciando versión 1.4.0');

  const host=document.createElement('div'); host.id='mu-golden-radar';host.dataset.version='1.9.1';
  host.style.cssText='position:fixed;top:76px;left:14px;z-index:2147483000;pointer-events:auto;max-height:calc(100dvh - 90px);';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>
    :host{color:#f5e9cf;font:12px Verdana,sans-serif;color-scheme:dark;user-select:text}
    *{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer;color:inherit;background:#282319;border:1px solid #69542c;border-radius:4px;padding:6px 9px}button:focus-visible,input:focus-visible{outline:2px solid #ffcb66;outline-offset:3px}
    .panel{display:flex;flex-direction:column;width:288px;height:auto;max-width:calc(100vw - 28px);max-height:calc(100dvh - 90px);overflow:hidden;background:#11130fb8;border:1px solid #776039;border-radius:0;box-shadow:none}
    header{flex-shrink:0;display:flex;align-items:center;gap:4px;padding:4px 8px;border-bottom:0}header .mapline{flex:1;min-width:0;margin:0;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}header .status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}header button{display:grid;place-items:center;width:24px;height:24px;padding:0;border-radius:50%;color:#e7c780;background:#15170ff2;border:1px solid #76633d}header svg,.tab svg{width:15px;height:15px;fill:currentColor}header button[aria-expanded=true]{color:#c1e7a0;border-color:#a4c880}.tab{width:44px;height:44px;border-radius:50%;padding:0;place-items:center}.settings{padding:10px;border-top:1px solid #343b2b;font:11px Verdana,sans-serif;line-height:1.6}.settings h2{font-size:12px;margin:0;color:#e7c780}.settings input[type=range]{width:100%;display:block}.settings p{color:#a5ad98}[hidden]{display:none!important}
    .body{min-height:0;overflow:auto;padding:0 8px 8px;scrollbar-width:none}.body::-webkit-scrollbar{display:none}.status{font:12px Verdana,sans-serif;color:#b8bba8;line-height:1.6}.status[data-active=true]{color:#ffd277}.mapline{margin:0 0 6px;font:12px monospace;color:#c9cbb8}
    canvas{display:block;width:100%;height:auto;aspect-ratio:1;margin:0 auto;border:1px solid #424838;border-radius:3px;background:#182016}
    .legend{display:flex;flex-wrap:wrap;gap:6px;font:9px Verdana,sans-serif;margin:6px 0;color:#b5bba8}.you{color:#83d4d7}.live{color:#ffca63}.past{color:#9b987c}
    .row{padding:4px 0;border-top:1px solid #343b2b;font:12px Verdana,sans-serif;line-height:1.7}.row small{color:#a5ad98;display:block}.empty,.note{font:11px Verdana,sans-serif;color:#a5ad98;line-height:1.6}.note{border-top:1px solid #343b2b;margin-top:10px;padding-top:9px}label{display:block;font:11px Verdana,sans-serif;margin-top:10px}input{accent-color:#d9a94a}
    .tab{display:none}:host(.collapsed) .panel{display:none}:host(.collapsed) .tab{display:grid}.demo{color:#ffca63;font:10px Verdana,sans-serif;letter-spacing:.1em;margin-bottom:7px}
    @media(max-height:600px){canvas{width:160px;max-width:100%;margin:auto}.body{padding:8px}header{padding:7px}.note{display:none}}
    </style><button class="tab" aria-label="Abrir Golden Radar" title="Mostrar radar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4l6-2 6 2 6-2v18l-6 2-6-2-6 2zm2 2v13l3-1V5zm5-1v13l4 1V6zm6 1v13l3-1V5z"/></svg></button><section class="panel" aria-label="Golden Radar"><header><div class="mapline"></div><div class="status" role="status" aria-live="polite"></div><button class="min" aria-label="Minimizar radar" title="Ocultar mapa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4l6-2 6 2 6-2v18l-6 2-6-2-6 2zm2 2v13l3-1V5zm5-1v13l4 1V6zm6 1v13l3-1V5z"/></svg></button><button class="history-toggle" aria-label="Ver historial" title="Historial" aria-expanded="false" aria-controls="radar-history"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 1-8.5 12h2.2A7 7 0 1 0 6 8H3V2l2.3 2.3A9 9 0 0 1 12 3zm-1 4h2v5l4 2-1 2-5-3z"/></svg></button><button class="settings-toggle" aria-label="Ver configuración del radar" title="Configuración" aria-expanded="false" aria-controls="radar-settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13v-2l2-2-2-3-3 1-1-4h-4l-1 4-3-1-2 3 2 2v2l-2 2 2 3 3-1 1 4h4l1-4 3 1 2-3zm-6 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg></button><button class="move-toggle" aria-label="Desbloquear posición del radar" title="Desbloquear para mover" aria-pressed="false">↔</button></header><div class="body"><div class="demo" hidden>DEMO</div><canvas width="512" height="512" role="img" aria-label="Radar de coordenadas del mapa; posiciones detalladas en la lista"></canvas><div class="legend"><span class="you">◆ Vos</span><span class="live">● Detectado</span><span class="past">○ Avistamiento</span></div><div class="rows"></div></div></section>`;
  document.body.append(host);
  const $=s=>root.querySelector(s), canvas=$('canvas'),ctx=canvas.getContext('2d');
  if (window.__GOLDEN_RADAR_DEMO__) $('.demo').hidden=false;
  const tracker=new Tracker();
  const invaders=new Tracker(INVADERS);
  let storage;try{storage=window.localStorage;}catch{storage=null;}
  const archive=new Archive(storage,window.__GOLDEN_RADAR_DEMO__?'mu.golden-radar.demo-sightings.v1':HISTORY_KEY);
  const historyUI=document.createElement('details');historyUI.className='archive';
  historyUI.innerHTML='<summary>Historial guardado</summary><p class="archive-state"></p><label title="Mostrar puntos históricos; la detección continúa"><input class="show-history" type="checkbox" role="switch" checked> Trackear dorados</label><div class="archive-rows"></div><button class="export">Exportar historial</button>';
  historyUI.id='radar-history';historyUI.hidden=true;historyUI.open=true;
  $('.body').append(historyUI);
  const settings=document.createElement('section');settings.id='radar-settings';settings.className='settings';settings.hidden=true;settings.setAttribute('aria-label','Configuración del radar');
  settings.innerHTML='<h2>Configuración</h2>';
  const settingsHost=document.createElement('div'),settingsRoot=settingsHost.attachShadow({mode:'open'});
  settingsRoot.innerHTML='<style>:host{display:block;font:12px Verdana,sans-serif;color:#eee6d1;color-scheme:dark}label{display:flex;flex-direction:row-reverse;align-items:center;justify-content:space-between;gap:12px;margin:12px 0}input[type=checkbox]{appearance:none;flex-shrink:0;width:34px;height:20px;border:1px solid #76633d;border-radius:12px;background:#292c20;position:relative;cursor:pointer}input[type=checkbox]::before{content:"";position:absolute;left:3px;top:3px;width:12px;height:12px;border-radius:50%;background:#aeb6a0}input[type=checkbox]:checked{background:#a4c880;border-color:#a4c880}input[type=checkbox]:checked::before{left:17px;background:#15170f}button{font:inherit;background:transparent;border:1px solid #76633d;border-radius:4px;color:#e7c780;padding:8px;cursor:pointer}button:focus-visible,input:focus-visible{outline:2px solid #e7c780}</style>';
  settingsRoot.append(historyUI.querySelector('label'));settingsRoot.append(historyUI.querySelector('.export'));settings.append(settingsHost);$('.body').insertBefore(settings,canvas);
  const showHistory=settingsRoot.querySelector('.show-history'),exportHistory=settingsRoot.querySelector('.export');
  const whiteLabel=document.createElement('label'),redLabel=document.createElement('label');
  whiteLabel.innerHTML='<input class="track-white-wizard" type="checkbox" role="switch"> Trackear White Wizard Corps';
  redLabel.innerHTML='<input class="track-red-dragon" type="checkbox" role="switch"> Trackear Red Dragon';
  whiteLabel.title='Mostrar White Wizard y sus soldados/arqueros recibidos por el cliente';redLabel.title='Mostrar Red Dragon; independiente de Golden Dragon';
  settingsRoot.insertBefore(whiteLabel,exportHistory);settingsRoot.insertBefore(redLabel,exportHistory);
  const whiteToggle=whiteLabel.querySelector('input'),redToggle=redLabel.querySelector('input');
  let whiteVisible=false,redVisible=false,beforeWhite=false,beforeRed=false;
  const trackingKey=window.__GOLDEN_RADAR_DEMO__?'mu.golden-radar.demo-settings.v1':'mu.golden-radar.settings.v1';
  let beforeTrackingRaw=null,trackingInvalid=false;
  try{const raw=storage?.getItem(trackingKey);if(raw!==null&&raw!==undefined){const saved=JSON.parse(raw);if(saved?.version!==1||typeof saved.whiteWizard!=='boolean'||typeof saved.redDragon!=='boolean')trackingInvalid=true;else{whiteVisible=saved.whiteWizard;redVisible=saved.redDragon;}}}catch{trackingInvalid=true;}
  const trackingState=document.createElement('p');trackingState.setAttribute('role','status');settingsRoot.append(trackingState);
  function saveTracking(){if(trackingInvalid)throw new Error('Preferencias de Radar inválidas; se conservan los datos existentes.');if(!storage)throw new Error('No se pudo acceder al almacenamiento del Radar.');storage.setItem(trackingKey,JSON.stringify({version:1,whiteWizard:whiteToggle.checked,redDragon:redToggle.checked}));whiteVisible=whiteToggle.checked;redVisible=redToggle.checked;trackingState.textContent='';}
  let historicVisible=true,configAvailable=false,beforeHistoric=true;
  showHistory.onchange=()=>{if(!configAvailable)historicVisible=showHistory.checked;};
  whiteToggle.onchange=redToggle.onchange=()=>{if(!configAvailable)try{saveTracking();}catch(error){fillTracking();trackingState.textContent=error.message;}};
  function fillTracking(){showHistory.checked=historicVisible;whiteToggle.checked=whiteVisible;redToggle.checked=redVisible;}
  fillTracking();
  const settingsProvider={host:settingsHost,order:20,title:'Radar',slot:'visualization-tracking',begin(){beforeHistoric=historicVisible;beforeWhite=whiteVisible;beforeRed=redVisible;beforeTrackingRaw=storage?.getItem(trackingKey)??null;fillTracking();},validate(){return trackingInvalid?'Preferencias de Radar inválidas; se conservan los datos existentes.':null;},apply(){saveTracking();historicVisible=showHistory.checked;},rollback(){historicVisible=beforeHistoric;whiteVisible=beforeWhite;redVisible=beforeRed;if(storage&&storage.getItem(trackingKey)!==beforeTrackingRaw){if(beforeTrackingRaw===null)storage.removeItem(trackingKey);else storage.setItem(trackingKey,beforeTrackingRaw);}},discard(){fillTracking();}};
  window.addEventListener('mu-hub:register',event=>{if(event.detail?.capabilities?.configurationWindow){configAvailable=true;settings.hidden=true;}});

  const historyStyle=document.createElement('style');historyStyle.textContent='.archive{margin-top:12px;border-top:1px solid #343b2b;padding-top:10px;font:11px Verdana,sans-serif;line-height:1.6}.archive summary{cursor:pointer;color:#8bbade}.archive-state{color:#abbc9e}.archive .export{margin-top:8px}.archive-rows .row{font-size:11px}';root.append(historyStyle);
  const historicLegend=document.createElement('span');historicLegend.style.color='#8bbade';historicLegend.textContent='＋ Historial';$('.legend').append(historicLegend);
  for(const [color,text] of [['#f5f5ff','● White Wizard Corps'],['#ff7373','● Red Dragon']]){const label=document.createElement('span');label.style.color=color;label.textContent=text;$('.legend').append(label);}
  exportHistory.onclick=()=>{const url=URL.createObjectURL(new Blob([archive.export()],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='mu-golden-avistamientos-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  let archiveRenderKey='';
  function renderArchive(map,includeBudge) {
    const key=[map,includeBudge,archive.revision,archive.saved].join(':');
    const records=archive.forMap(map,includeBudge);
    if(key!==archiveRenderKey){archiveRenderKey=key;
      historyUI.querySelector('summary').textContent=`Historial · ${records.length}`;
      $('.archive-state').textContent=archive.saved?'':'Historial sin guardar · exportá';
      const container=$('.archive-rows');container.replaceChildren();
      for(const r of records.slice(-10).reverse()){const p=document.createElement('div');p.className='row';p.textContent=`${DRAGONS.get(r.type)} · ${r.x}, ${r.y}`;const d=document.createElement('small');d.textContent=new Date(r.time).toLocaleString('es-AR')+(r.invasionConfirmed?' · invasión':'');p.append(d);container.append(p);}
      if(!records.length){const p=document.createElement('p');p.className='empty';p.textContent='Sin registros';container.append(p);}
    }
    return records;
  }
  const goldenEvent=new GoldenEvent();
  let stopped=false,bus=null,signal=null,terrain=null,lastWorld=null,lastMap=null,lastHero=null,lastTerrain=null;
  let captureSpots=true,remaining=null,scheduled=null,eventAlias=null,timerAvailable=false,lastPacketAt=-Infinity,hudBlocked=false;
  const hud=new HudInvasion();
  let huntSnapshot={map:null,live:[],recent:[],seen:0};
  let lastStatus='',lastRows='',lastMapline='';
  function onInvasion(packet) {
    const data=invasionPacket(packet);
    if (data) signal={...data,map:window.__world?.mapIndex,hero:window.__world?.playerEntity};
    if(data?.enabled&&data.event===3)goldenEvent.observe('active',Date.now());
  }
  function onMonsters(packet){const data=invasionMonsters(packet);if(!data)return;lastPacketAt=Date.now();hudBlocked=data.status===2;goldenEvent.observe(data.status===1?'active':'ended',Date.now());remaining={...data,at:lastPacketAt,eventId:huntingEvent(Date.now())?.id};}
  function timerEvent(now){const rows=[...document.querySelectorAll('.event-timers .event-row')],row=rows.find(row=>/golden invasion|invasión dorada|invasion dorada/i.test(row.querySelector('.event-row-label')?.textContent??''));const clock=row?.querySelector('.event-row-clock')?.textContent??'',ms=row?countdown(clock):null;timerAvailable=!!row;if(row){const current=hud.read(clock,row.getAttribute('title')??'',now);if(!current.active)hudBlocked=false;if(current.active&&!hudBlocked&&now-lastPacketAt>=1000){if(goldenEvent.value?.phase==='ended'){goldenEvent.clear();eventAlias=null;}goldenEvent.observe('active',now);const id=eventAlias?.native===goldenEvent.value?.id?eventAlias.id:scheduled&&Math.abs(goldenEvent.value.startedAt-scheduled.startsAt)<60000?scheduled.id:goldenEvent.value?.id;if(now-lastPacketAt>1000)remaining={status:1,total:current.total,maps:current.maps,at:current.at,eventId:id};}else if(current.ended&&now-lastPacketAt>=1000){goldenEvent.observe('ended',now);remaining=null;}}if(ms===null)return null;const startsAt=now+ms;if(!scheduled||Math.abs(scheduled.startsAt-startsAt)>2000)scheduled={id:'timer:'+Math.round(startsAt/1000),phase:'scheduled',startsAt,at:now};return {...scheduled,at:now};}
  function huntingEvent(now){const timer=timerEvent(now),event=goldenEvent.get(now);if(event&&!eventAlias&&scheduled&&Math.abs(event.startedAt-scheduled.startsAt)<60000)eventAlias={native:event.id,id:scheduled.id};if(eventAlias&&event?.id!==eventAlias.native)eventAlias=null;if(eventAlias&&event){const linked={...event,id:eventAlias.id};return event.phase!=='ended'||now-event.at<5000?linked:timer??linked;}return event&&(event.phase!=='ended'||now-event.at<5000)?event:timer??event;}
  function onNotice(packet){const phase=goldenNotice(packet);if(phase){hudBlocked=phase==='ended';goldenEvent.observe(phase,Date.now());}}
  function onWarp() { signal=null;tracker.clear();invaders.clear(); }
  function bindBus() {
    const next=window.__eventBus;
    if (next===bus) return;
    if (bus) {bus.off('InvasionMonsters',onMonsters);bus.off('MapEventState',onInvasion);bus.off('ServerMessage',onNotice);bus.off('requestWarp',onWarp);bus.off('warpCompleted',onWarp);}
    bus=next;signal=null;remaining=null;scheduled=null;eventAlias=null;hud.clear();lastPacketAt=-Infinity;hudBlocked=false;goldenEvent.clear();
    if (bus?.on && bus?.off) {bus.on('InvasionMonsters',onMonsters);bus.on('MapEventState',onInvasion);bus.on('ServerMessage',onNotice);bus.on('requestWarp',onWarp);bus.on('warpCompleted',onWarp);}
    else bus=null;
  }
  function background(world,player) {
    if (world!==lastWorld || world?.mapIndex!==lastMap || world?.terrain!==lastTerrain || (!!player && !terrain)) {
      lastWorld=world;lastMap=world?.mapIndex;lastTerrain=world?.terrain;
      terrain=null;
      if (player && world?.terrain && typeof world.isWalkable==='function') {
        terrain=document.createElement('canvas');terrain.width=512;terrain.height=512;
        const c=terrain.getContext('2d');
        for(let x=0;x<256;x+=4) for(let y=0;y<256;y+=4) {
          c.fillStyle=world.isWalkable(x,y)?'#273722':'#141b12';c.fillRect(x*2,(252-y)*2,8,8);
        }
      }
    }
    ctx.clearRect(0,0,512,512);ctx.fillStyle='#182016';ctx.fillRect(0,0,512,512);
    if (terrain) ctx.drawImage(terrain,0,0);
    ctx.strokeStyle='#6c785a44';ctx.lineWidth=1;
    ctx.font='18px monospace';ctx.fillStyle='#a7b391';
    for(let n=0;n<256;n+=64){const p=n*2;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,512);ctx.moveTo(0,512-p);ctx.lineTo(512,512-p);ctx.stroke();ctx.fillText(String(n),p+4,506);}
    ctx.fillText('Y ↑',8,24);ctx.fillText('X →',452,506);
  }
  function dot(row,color,hollow=false) {
    ctx.beginPath();ctx.arc(row.x*2,(256-row.y)*2,hollow?8:7,0,Math.PI*2);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2;hollow?ctx.stroke():ctx.fill();
  }
  function renderRows(data,now) {
    const rows=[...data.live.map(r=>({...r,current:true})),...data.recent.map(r=>({...r,current:false}))];
    const key=rows.map(r=>`${r.id}:${r.type}:${Math.floor(r.x)}:${Math.floor(r.y)}:${Math.round(r.distance)}:${r.current}:${Math.floor((now-r.seen)/1000)}`).join('|');
    const value=key || (data.player?'empty-world:'+whiteVisible+':'+redVisible:'empty-client');
    if(value===lastRows)return;lastRows=value;
    const container=$('.rows');container.replaceChildren();
    if(!rows.length){const p=document.createElement('div');p.className='empty';p.textContent=data.player?(whiteVisible||redVisible?'Sin objetivos visibles':'Sin dorados'):'Sin personaje';container.append(p);return;}
    for(const row of rows){const p=document.createElement('div');p.className='row';p.style.color=invaderColor(row)??(row.current?'#ffca63':'#b0b49c');
      p.textContent=`${row.current?'●':'○'} ${row.name}`;
      const details=document.createElement('small');details.textContent=`${Math.floor(row.x)}, ${Math.floor(row.y)} · ${Math.round(row.distance)} tiles · ${row.current?'ahora':`${Math.floor((now-row.seen)/1000)} s`}`;
      p.append(details);container.append(p);}
  }
  // Independent presentation host; the existing Radar tick owns all updates.
  const counter=document.createElement('aside');counter.id='mu-golden-counter';counter.hidden=true;
  counter.style.cssText='position:fixed;left:14px;top:150px;z-index:2147483000;max-width:100vw;pointer-events:auto';
  const counterRoot=counter.attachShadow({mode:'open'});
  counterRoot.innerHTML=`<style>:host{font:12px Verdana,sans-serif;color:#eee6d1;color-scheme:dark}:host([hidden]){display:none!important}section{background:#15170ff2;border:1px solid #76633d;border-radius:8px;overflow:hidden}.maps{padding:0 8px 8px;max-height:40vh;overflow:auto}.map-count{display:flex;justify-content:space-between;gap:16px;padding:4px 0}.map-count b{color:#e7c780}header{display:flex;flex-wrap:wrap;align-items:center;gap:10px;background:#15170ff2;border:1px solid #76633d;border-radius:8px;padding:8px;user-select:none;touch-action:none}strong{color:#e7c780}button{color:inherit;background:#282319;border:1px solid #76633d;border-radius:4px;cursor:pointer;padding:5px}button:focus-visible{outline:2px solid #e7c780}output{white-space:nowrap}</style><section><header><strong>Golden Invasion</strong><output aria-live="polite"></output><button type="button"></button></header><div class="maps" aria-live="polite"></div></section>`;
  document.body.append(counter);
  const counterHeader=counterRoot.querySelector('header'),counterOutput=counterRoot.querySelector('output'),counterLock=counterRoot.querySelector('button'),counterMaps=counterRoot.querySelector('.maps');
  const COUNTER_KEY=window.__GOLDEN_RADAR_DEMO__?'mu.golden-radar.demo-counter-position.v1':'mu.golden-radar.counter-position.v1';
  let counterLocked=true,counterDrag=null,counterIdentity=null,counterBlockedHud=null,counterBlocked=false,counterBlockedPacket=-Infinity;
  function counterPlace(x,y){const box=counter.getBoundingClientRect();counter.style.left=Math.max(0,Math.min(x,innerWidth-box.width))+'px';counter.style.top=Math.max(0,Math.min(y,innerHeight-box.height))+'px';}
  function counterFit(){counterPlace(parseFloat(counter.style.left)||0,parseFloat(counter.style.top)||0);}
  function counterSave(){try{localStorage.setItem(COUNTER_KEY,JSON.stringify({x:parseFloat(counter.style.left),y:parseFloat(counter.style.top),locked:counterLocked}));}catch{}}
  function counterRenderLock(){counterLock.textContent=counterLocked?'🔒':'🔓';counterLock.setAttribute('aria-pressed',String(counterLocked));counterLock.title=counterLocked?'Desbloquear posición del contador':'Fijar posición del contador';counterLock.setAttribute('aria-label',counterLock.title);counterHeader.style.cursor=counterLocked?'':'move';}
  try{const saved=JSON.parse(localStorage.getItem(COUNTER_KEY));if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y)){counterPlace(saved.x,saved.y);counterLocked=saved.locked!==false;}}catch{}
  counterRenderLock();counterLock.onclick=()=>{counterLocked=!counterLocked;counterRenderLock();counterSave();};
  counterHeader.addEventListener('pointerdown',e=>{if(counterLocked||e.button!==0||e.target.closest('button'))return;const box=counter.getBoundingClientRect();counterDrag={id:e.pointerId,x:e.clientX-box.x,y:e.clientY-box.y};counterHeader.setPointerCapture(e.pointerId);e.preventDefault();});
  counterHeader.addEventListener('pointermove',e=>{if(counterDrag?.id===e.pointerId)counterPlace(e.clientX-counterDrag.x,e.clientY-counterDrag.y);});
  const counterEndDrag=()=>{if(counterDrag){counterDrag=null;counterSave();}};
  counterHeader.addEventListener('pointerup',counterEndDrag);counterHeader.addEventListener('pointercancel',counterEndDrag);
  for(const name of ['pointerdown','pointerup','click','dblclick','contextmenu','keydown','keyup','wheel'])counter.addEventListener(name,e=>e.stopPropagation());
  window.addEventListener('resize',counterFit);
  function renderCounter(now,player){
    const store=window.__store,identity=JSON.stringify([store?.username,store?.accountFor,store?.gsSocket?.url,store?.playerData?.name]);
    const hudRow=[...document.querySelectorAll('.event-timers .event-row')].find(row=>/golden invasion|invasión dorada|invasion dorada/i.test(row.querySelector('.event-row-label')?.textContent??''));
    const hudSignature=hudRow?JSON.stringify([hudRow.querySelector('.event-row-clock')?.textContent,hudRow.title]):null;
    if(counterIdentity!==null&&identity!==counterIdentity){counterBlocked=true;counterBlockedHud=hudSignature;counterBlockedPacket=lastPacketAt;}
    counterIdentity=identity;
    const online=!store||(!store.connectionLost&&!store.isOffline&&store.gsSocket?.readyState===1);
    if(!player||!online){counter.hidden=true;counterBlocked=true;counterBlockedHud=hudSignature;counterBlockedPacket=lastPacketAt;return;}
    if(counterBlocked&&counterBlockedHud===hudSignature&&lastPacketAt===counterBlockedPacket){counter.hidden=true;return;}
    counterBlocked=false;counterBlockedHud=null;
    const event=huntingEvent(now),data=remaining;
    counter.hidden=event?.phase!=='active';if(counter.hidden)return;
    const fresh=data?.status===1&&data.eventId===event.id&&now-data.at<=(lastPacketAt===data.at?60000:900000);
    const nativeCount=/^(\d+)\s+(?:left|restantes?|quedan?)$/i.exec(hudRow?.querySelector('.event-row-clock')?.textContent?.trim()??'');
    const total=data?.at===lastPacketAt?data.total:nativeCount?Number(nativeCount[1]):null;
    counterOutput.textContent=fresh&&Number.isInteger(total)?`${total} restantes`:'Sin datos';
    const mapRows=fresh?data.maps:[];
    const mapSignature=JSON.stringify(mapRows);
    if(counterMaps.dataset.signature!==mapSignature){
      counterMaps.dataset.signature=mapSignature;counterMaps.replaceChildren();
      if(!mapRows.length){counterMaps.textContent='Sin datos por mapa';}
      for(const row of mapRows){const line=document.createElement('div');line.className='map-count';const name=document.createElement('span'),count=document.createElement('b');name.textContent=MAPS[row.map]??`Mapa ${row.map}`;count.textContent=String(row.alive);line.append(name,count);counterMaps.append(line);}
    }
    counterOutput.title=fresh?data.maps.map(row=>`${MAPS[row.map]??`Mapa ${row.map}`}: ${row.alive} restantes`).join('\n'):'';
    counterFit();
  }
  function tick() {
    if(stopped)return;
    try {
      bindBus();const world=window.__world,now=Date.now();
      if(window.__store && (window.__store.connectionLost || window.__store.isOffline || window.__store.gsSocket?.readyState!==1)){goldenEvent.clear();remaining=null;scheduled=null;eventAlias=null;hud.clear();lastPacketAt=-Infinity;hudBlocked=false;}
      if (lastHero!==world?.playerEntity) {signal=null;lastHero=world?.playerEntity;}
      const data=tracker.scan(world,now,true);
      const extra=visibleInvaders(invaders.scan(world,now),whiteVisible,redVisible);
      const displayed={...data,live:[...data.live,...extra.live].sort((a,b)=>a.distance-b.distance),recent:[...data.recent,...extra.recent]};
      renderCounter(now,data.player);
      huntSnapshot={map:world?.mapIndex,live:data.live,recent:data.recent,seen:now};
      window.dispatchEvent(new CustomEvent('mu-radar:hunting',{detail:{seen:now}}));
      if(signal && (signal.map!==world?.mapIndex || signal.hero!==world?.playerEntity || !data.player)) signal=null;
      const active=!!data.player && signal?.enabled && signal.event===3;
      if(data.player&&captureSpots)archive.observe(world.mapIndex,data.live,now,active);

      const historical=renderArchive(data.player?world.mapIndex:null,true);
      const message=!data.player?'Sin personaje':active?'Invasión confirmada':extra.live.length?'Invasores visibles':data.live.length?'Dorados':signal?'Sin invasión':'';
      if(message!==lastStatus){$('.status').textContent=message;$('.mapline').title=message;$('.mapline').style.color=active?'#ffd277':'#c9cbb8';$('.status').dataset.active=String(!!active || data.live.length>0);lastStatus=message;}
      const mapline=data.player?`${MAPS[world.mapIndex]??`Mapa ${world.mapIndex}`} · ${Math.floor(data.player.x)}, ${Math.floor(data.player.y)}`:'Desconectado';
      if(mapline!==lastMapline){$('.mapline').textContent=mapline;lastMapline=mapline;}
      renderRows(displayed,now);
      if(!host.classList.contains('collapsed')){
        background(world,data.player);
        if(historicVisible)for(const row of historical){const x=row.x*2,y=(256-row.y)*2;ctx.strokeStyle='#8bbade';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}
        for(const row of data.recent)dot(row,'#a8a184',true);
        for(const row of data.live)dot(row,'#ffc85c');
        for(const row of extra.recent)dot(row,invaderColor(row),true);
        for(const row of extra.live)dot(row,invaderColor(row));
        if(data.player){ctx.save();ctx.translate(data.player.x*2,(256-data.player.y)*2);ctx.rotate(Math.PI/4);ctx.fillStyle='#81dbe0';ctx.fillRect(-6,-6,12,12);ctx.restore();}
      }
      $('.tab').title=active?'Radar · invasión activa':'Mostrar radar';$('.tab').style.borderColor=active?'#a4c880':'#76633d';
    } catch { $('.status').textContent='Cliente incompatible · radar pausado';destroy(false); }
  }

  const POSITION_KEY=window.__GOLDEN_RADAR_DEMO__?'mu.golden-radar.demo-position.v1':'mu.golden-radar.position.v1';
  let unlocked=false,drag=null;
  function place(x,y){
    const box=host.getBoundingClientRect();
    host.style.left=Math.max(0,Math.min(x,window.innerWidth-box.width))+'px';
    host.style.top=Math.max(0,Math.min(y,window.innerHeight-Math.min(box.height,window.innerHeight)))+'px';
    host.style.maxHeight='calc(100dvh - '+parseFloat(host.style.top)+'px)';
    $('.panel').style.maxHeight=host.style.maxHeight;
  }
  function savePosition(){try{const box=host.getBoundingClientRect();localStorage.setItem(POSITION_KEY,JSON.stringify({x:box.x,y:box.y,locked:!unlocked}));}catch{}}
  try{const saved=JSON.parse(localStorage.getItem(POSITION_KEY));if(saved && Number.isFinite(saved.x)&&Number.isFinite(saved.y)){place(saved.x,saved.y);unlocked=saved.locked===false;}}catch{}
  function renderLock(){const button=$('.move-toggle');button.setAttribute('aria-pressed',String(!unlocked));button.setAttribute('aria-label',unlocked?'Fijar posición del radar':'Desbloquear posición del radar');button.title=button.getAttribute('aria-label');button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(unlocked?'M6 10V7a6 6 0 0 1 12 0h-2a4 4 0 0 0-8 0v3h12v12H4V10z':'M6 10V7a6 6 0 0 1 12 0v3h2v12H4V10zm2 0h8V7a4 4 0 0 0-8 0z')+'"/></svg>';$('header').style.cursor=unlocked?'move':'';}
  $('.move-toggle').onclick=()=>{unlocked=!unlocked;renderLock();savePosition();};renderLock();
  $('header').addEventListener('pointerdown',e=>{if(!unlocked||e.button!==0||e.target.closest('button'))return;const box=host.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX-box.x,y:e.clientY-box.y};$('header').setPointerCapture(e.pointerId);e.preventDefault();});
  $('header').addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId)place(e.clientX-drag.x,e.clientY-drag.y);});
  function endDrag(){if(drag){drag=null;savePosition();}}
  $('header').addEventListener('pointerup',endDrag);$('header').addEventListener('pointercancel',endDrag);
  function fitPosition(){if(host.classList.contains('collapsed'))return;place(parseFloat(host.style.left),parseFloat(host.style.top));}
  window.addEventListener('resize',fitPosition);

  const stopEvents=['pointerdown','pointerup','click','dblclick','contextmenu','keydown','keyup','wheel'];
  for(const name of stopEvents)host.addEventListener(name,e=>e.stopPropagation());
  function setMapVisible(visible){host.classList.toggle('collapsed',!visible);if(visible){fitPosition();tick();}window.dispatchEvent(new CustomEvent('mu-hub:state',{detail:{id:'radar'}}));}
  $('.min').onclick=()=>setMapVisible(false);$('.tab').onclick=()=>setMapVisible(true);
  $('.settings-toggle').onclick=()=>{if(configAvailable){window.dispatchEvent(new CustomEvent('mu-config:open'));return;}settings.hidden=!settings.hidden;$('.settings-toggle').setAttribute('aria-expanded',String(!settings.hidden));$('.settings-toggle').setAttribute('aria-label',settings.hidden?'Ver configuración del radar':'Ocultar configuración del radar');};
  $('.history-toggle').onclick=()=>{historyUI.hidden=!historyUI.hidden;historyUI.open=true;$('.history-toggle').setAttribute('aria-expanded',String(!historyUI.hidden));$('.history-toggle').setAttribute('aria-label',historyUI.hidden?'Ver historial':'Ocultar historial');};
  // HUB mounts this view; scanning, archive and scheduler remain owned by radar.
  const hubModule={id:'radar',host,capabilities:{settings:settingsProvider,floatingMap:true},getState:()=>({map:lastMapline,status:lastStatus,stopped,mapVisible:!host.classList.contains('collapsed')}),actions:{captureSpots:enabled=>{captureSpots=!!enabled;},map:visible=>setMapVisible(visible),huntingData:()=>({ready:!stopped&&!!bus,records:archive.records.map(r=>({...r})),types:[...DRAGONS.keys()],event:huntingEvent(Date.now()),timerAvailable,remaining:remaining?{...remaining,maps:remaining.maps.map(m=>({...m})),eventId:remaining.eventId}:null,...huntSnapshot}),settings:open=>{settings.hidden=!open;},history:()=>$('.history-toggle').click(),attach:()=>{host.dataset.hub='true';host.classList.remove('collapsed');host.style.setProperty('position','fixed','important');document.body.append(host);let saved=false;try{const value=JSON.parse(localStorage.getItem(POSITION_KEY));saved=Number.isFinite(value?.x)&&Number.isFinite(value?.y);}catch{}if(!saved)place(14,200);else fitPosition();}}};
  const hubStyle=document.createElement('style');hubStyle.textContent=':host([data-hub]) header button:not(.move-toggle),:host([data-hub]) .tab{display:none!important}:host([data-hub].collapsed){display:none!important}';root.append(hubStyle);
  function registerHub(){window.dispatchEvent(new CustomEvent('mu-hub:register',{detail:hubModule}));}
  window.addEventListener('mu-hub:discover',registerHub);registerHub();
  const timer=setInterval(tick,250);
  function destroy(remove) {
    stopped=true;clearInterval(timer);tracker.clear();invaders.clear();counter.remove();window.removeEventListener('resize',counterFit);
    if(bus){bus.off('InvasionMonsters',onMonsters);bus.off('MapEventState',onInvasion);bus.off('ServerMessage',onNotice);bus.off('requestWarp',onWarp);bus.off('warpCompleted',onWarp);}
    window.removeEventListener('resize',fitPosition);window.removeEventListener('pagehide',onPageHide);if(remove)host.remove();
  }
  function onPageHide(){destroy(true);}
  window.addEventListener('pagehide',onPageHide);tick();
})();
