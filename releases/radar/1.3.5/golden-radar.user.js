// ==UserScript==
// @name         MU · Golden Radar
// @namespace    local.mu.golden-radar
// @version      1.3.5
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
  class Tracker {
    constructor() { this.sequence=0;this.clear(); }
    clear() { this.history=new Map();this.encounters=new WeakMap(); this.map=null; this.hero=null; this.world=null; }
    scan(world, now, includeBudge=true) {
      const hero=world?.playerEntity, player=position(hero);
      if (!hero || !player) { this.clear(); return {player:null,live:[],recent:[]}; }
      if (this.world!==world || this.hero!==hero || this.map!==world.mapIndex) {this.history.clear();this.encounters=new WeakMap();}
      this.world=world; this.hero=hero; this.map=world.mapIndex;
      const live=[], present=new Set();
      for (const entity of world.netObjsQuery?.entities ?? []) {
        const id=entity.netId, type=entity.npcType;
        if (!DRAGONS.has(type) || id===undefined || entity.localPlayer) continue;
        if (entity.worldIndex!==undefined && entity.worldIndex!==world.mapIndex) continue;
        if (entity.dying) { this.history.delete(id); continue; }
        const p=position(entity);
        if (!p || entity.objOutOfScope) continue;
        if(!this.encounters.has(entity))this.encounters.set(entity,++this.sequence);
        const row={id,type,observation:this.encounters.get(entity),name:DRAGONS.get(type),...p,seen:now,distance:Math.hypot(p.x-player.x,p.y-player.y)};
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
  const core={Tracker,Archive,position,invasionPacket,TTL,HISTORY_KEY,HISTORY_LIMIT};
  if (typeof module==='object' && module.exports && typeof document==='undefined') { module.exports=core; return; }
  if (location.hostname!=='mu.mormon.garden' && !window.__GOLDEN_RADAR_DEMO__) return;
  if (document.getElementById('mu-golden-radar')) return;
  console.info('[Golden Radar] Iniciando versión 1.3.5');

  const host=document.createElement('div'); host.id='mu-golden-radar';host.dataset.version='1.3.5';
  host.style.cssText='position:fixed;top:76px;left:14px;z-index:2147483000;pointer-events:auto;max-height:calc(100dvh - 90px);';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>
    :host{color:#f5e9cf;font:12px Verdana,sans-serif;color-scheme:dark;user-select:text}
    *{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer;color:inherit;background:#282319;border:1px solid #69542c;border-radius:4px;padding:6px 9px}button:focus-visible,input:focus-visible{outline:2px solid #ffcb66;outline-offset:3px}
    .panel{display:flex;flex-direction:column;width:288px;height:auto;max-width:calc(100vw - 28px);max-height:calc(100dvh - 90px);overflow:hidden;background:#11130fb8;border:1px solid #776039;border-radius:0;box-shadow:none}
    header{flex-shrink:0;display:flex;align-items:center;gap:4px;padding:4px 8px;border-bottom:0}header .mapline{flex:1;min-width:0;margin:0;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}header .status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}header button{display:grid;place-items:center;width:24px;height:24px;padding:0;border-radius:50%;color:#e7c780;background:#15170ff2;border:1px solid #76633d}header svg,.tab svg{width:15px;height:15px;fill:currentColor}header button[aria-expanded=true]{color:#c1e7a0;border-color:#a4c880}.tab{width:44px;height:44px;border-radius:50%;padding:0;place-items:center}.settings{padding:10px;border-top:1px solid #343b2b;font:11px Verdana,sans-serif;line-height:1.6}.settings h2{font-size:12px;margin:0;color:#e7c780}.settings input[type=range]{width:100%;display:block}.settings p{color:#a5ad98}[hidden]{display:none!important}
    .body{min-height:0;overflow:auto;padding:0 8px 8px;scrollbar-width:none}.body::-webkit-scrollbar{display:none}.status{font:12px Verdana,sans-serif;color:#b8bba8;line-height:1.6}.status[data-active=true]{color:#ffd277}.mapline{margin:0 0 6px;font:12px monospace;color:#c9cbb8}
    canvas{display:block;width:100%;height:auto;aspect-ratio:1;margin:0 auto;border:1px solid #424838;border-radius:3px;background:#182016}
    .legend{display:flex;gap:6px;font:9px Verdana,sans-serif;margin:6px 0;color:#b5bba8}.you{color:#83d4d7}.live{color:#ffca63}.past{color:#9b987c}
    .row{padding:4px 0;border-top:1px solid #343b2b;font:12px Verdana,sans-serif;line-height:1.7}.row small{color:#a5ad98;display:block}.empty,.note{font:11px Verdana,sans-serif;color:#a5ad98;line-height:1.6}.note{border-top:1px solid #343b2b;margin-top:10px;padding-top:9px}label{display:block;font:11px Verdana,sans-serif;margin-top:10px}input{accent-color:#d9a94a}
    .tab{display:none}:host(.collapsed) .panel{display:none}:host(.collapsed) .tab{display:grid}.demo{color:#ffca63;font:10px Verdana,sans-serif;letter-spacing:.1em;margin-bottom:7px}
    @media(max-height:600px){canvas{width:160px;max-width:100%;margin:auto}.body{padding:8px}header{padding:7px}.note{display:none}}
    </style><button class="tab" aria-label="Abrir Golden Radar" title="Mostrar radar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4l6-2 6 2 6-2v18l-6 2-6-2-6 2zm2 2v13l3-1V5zm5-1v13l4 1V6zm6 1v13l3-1V5z"/></svg></button><section class="panel" aria-label="Golden Radar"><header><div class="mapline"></div><div class="status" role="status" aria-live="polite"></div><button class="min" aria-label="Minimizar radar" title="Ocultar mapa"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4l6-2 6 2 6-2v18l-6 2-6-2-6 2zm2 2v13l3-1V5zm5-1v13l4 1V6zm6 1v13l3-1V5z"/></svg></button><button class="history-toggle" aria-label="Ver historial" title="Historial" aria-expanded="false" aria-controls="radar-history"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 1-8.5 12h2.2A7 7 0 1 0 6 8H3V2l2.3 2.3A9 9 0 0 1 12 3zm-1 4h2v5l4 2-1 2-5-3z"/></svg></button><button class="settings-toggle" aria-label="Ver configuración del radar" title="Configuración" aria-expanded="false" aria-controls="radar-settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13v-2l2-2-2-3-3 1-1-4h-4l-1 4-3-1-2 3 2 2v2l-2 2 2 3 3-1 1 4h4l1-4 3 1 2-3zm-6 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg></button><button class="move-toggle" aria-label="Desbloquear posición del radar" title="Desbloquear para mover" aria-pressed="false">↔</button></header><div class="body"><div class="demo" hidden>DEMO</div><canvas width="512" height="512" role="img" aria-label="Radar de coordenadas del mapa; posiciones detalladas en la lista"></canvas><div class="legend"><span class="you">◆ Vos</span><span class="live">● Detectado</span><span class="past">○ Avistamiento</span></div><div class="rows"></div><label><input type="checkbox" checked> Budge</label></div></section>`;
  document.body.append(host);
  const $=s=>root.querySelector(s), canvas=$('canvas'),ctx=canvas.getContext('2d');
  if (window.__GOLDEN_RADAR_DEMO__) $('.demo').hidden=false;
  const tracker=new Tracker();
  let storage;try{storage=window.localStorage;}catch{storage=null;}
  const archive=new Archive(storage,window.__GOLDEN_RADAR_DEMO__?'mu.golden-radar.demo-sightings.v1':HISTORY_KEY);
  const historyUI=document.createElement('details');historyUI.className='archive';
  historyUI.innerHTML='<summary>Historial guardado</summary><p class="archive-state"></p><label><input class="show-history" type="checkbox" checked> Ver puntos</label><div class="archive-rows"></div><button class="export">Exportar</button>';
  historyUI.id='radar-history';historyUI.hidden=true;historyUI.open=true;
  $('.body').append(historyUI);
  const settings=document.createElement('section');settings.id='radar-settings';settings.className='settings';settings.hidden=true;settings.setAttribute('aria-label','Configuración del radar');
  settings.innerHTML='<h2>Configuración</h2>';
  const budge=$('.body > label');budge.querySelector('input').className='include-budge';settings.append(budge);settings.append(historyUI.querySelector('label'));settings.append(historyUI.querySelector('.export'));$('.body').insertBefore(settings,canvas);

  const historyStyle=document.createElement('style');historyStyle.textContent='.archive{margin-top:12px;border-top:1px solid #343b2b;padding-top:10px;font:11px Verdana,sans-serif;line-height:1.6}.archive summary{cursor:pointer;color:#8bbade}.archive-state{color:#abbc9e}.archive .export{margin-top:8px}.archive-rows .row{font-size:11px}';root.append(historyStyle);
  const historicLegend=document.createElement('span');historicLegend.style.color='#8bbade';historicLegend.textContent='＋ Historial';$('.legend').append(historicLegend);
  $('.export').onclick=()=>{const url=URL.createObjectURL(new Blob([archive.export()],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='mu-golden-avistamientos-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
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
  let stopped=false,bus=null,signal=null,terrain=null,lastWorld=null,lastMap=null,lastHero=null,lastTerrain=null;
  let lastStatus='',lastRows='',lastMapline='';
  function onInvasion(packet) {
    const data=invasionPacket(packet);
    if (data) signal={...data,map:window.__world?.mapIndex,hero:window.__world?.playerEntity};
  }
  function onWarp() { signal=null;tracker.clear(); }
  function bindBus() {
    const next=window.__eventBus;
    if (next===bus) return;
    if (bus) {bus.off('MapEventState',onInvasion);bus.off('requestWarp',onWarp);bus.off('warpCompleted',onWarp);}
    bus=next;signal=null;
    if (bus?.on && bus?.off) {bus.on('MapEventState',onInvasion);bus.on('requestWarp',onWarp);bus.on('warpCompleted',onWarp);}
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
    const value=key || (data.player?'empty-world':'empty-client');
    if(value===lastRows)return;lastRows=value;
    const container=$('.rows');container.replaceChildren();
    if(!rows.length){const p=document.createElement('div');p.className='empty';p.textContent=data.player?'Sin dorados':'Sin personaje';container.append(p);return;}
    for(const row of rows){const p=document.createElement('div');p.className='row';p.style.color=row.current?'#ffca63':'#b0b49c';
      p.textContent=`${row.current?'●':'○'} ${row.name}`;
      const details=document.createElement('small');details.textContent=`${Math.floor(row.x)}, ${Math.floor(row.y)} · ${Math.round(row.distance)} tiles · ${row.current?'ahora':`${Math.floor((now-row.seen)/1000)} s`}`;
      p.append(details);container.append(p);}
  }
  function tick() {
    if(stopped)return;
    try {
      bindBus();const world=window.__world,now=Date.now();
      if (lastHero!==world?.playerEntity) {signal=null;lastHero=world?.playerEntity;}
      const includeBudge=$('.include-budge').checked;
      const data=tracker.scan(world,now,true);
      if(signal && (signal.map!==world?.mapIndex || signal.hero!==world?.playerEntity || !data.player)) signal=null;
      const active=!!data.player && signal?.enabled && signal.event===3;
      if(data.player)archive.observe(world.mapIndex,data.live,now,active);
      if(!includeBudge){data.live=data.live.filter(r=>r.type!==43);data.recent=data.recent.filter(r=>r.type!==43);}
      const historical=renderArchive(data.player?world.mapIndex:null,includeBudge);
      const message=!data.player?'Sin personaje':active?'Invasión confirmada':data.live.length?'Dorados':signal?'Sin invasión':'';
      if(message!==lastStatus){$('.status').textContent=message;$('.mapline').title=message;$('.mapline').style.color=active?'#ffd277':'#c9cbb8';$('.status').dataset.active=String(!!active || data.live.length>0);lastStatus=message;}
      const mapline=data.player?`${MAPS[world.mapIndex]??`Mapa ${world.mapIndex}`} · ${Math.floor(data.player.x)}, ${Math.floor(data.player.y)}`:'Desconectado';
      if(mapline!==lastMapline){$('.mapline').textContent=mapline;lastMapline=mapline;}
      renderRows(data,now);
      if(!host.classList.contains('collapsed')){
        background(world,data.player);
        if($('.show-history').checked)for(const row of historical){const x=row.x*2,y=(256-row.y)*2;ctx.strokeStyle='#8bbade';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}
        for(const row of data.recent)dot(row,'#a8a184',true);
        for(const row of data.live)dot(row,'#ffc85c');
        if(data.player){ctx.save();ctx.translate(data.player.x*2,(256-data.player.y)*2);ctx.rotate(Math.PI/4);ctx.fillStyle='#81dbe0';ctx.fillRect(-6,-6,12,12);ctx.restore();}
      }
      $('.tab').title=active?'Radar · invasión activa':'Mostrar radar';$('.tab').style.borderColor=active?'#a4c880':'#76633d';
    } catch { $('.status').textContent='Cliente incompatible · radar pausado';destroy(false); }
  }

  const POSITION_KEY='mu.golden-radar.position.v1';
  let unlocked=false,drag=null;
  function place(x,y){
    const box=host.getBoundingClientRect();
    host.style.left=Math.max(0,Math.min(x,window.innerWidth-box.width))+'px';
    host.style.top=Math.max(0,Math.min(y,window.innerHeight-Math.min(box.height,window.innerHeight)))+'px';
    host.style.maxHeight='calc(100dvh - '+parseFloat(host.style.top)+'px)';
    $('.panel').style.maxHeight=host.style.maxHeight;
  }
  function savePosition(){try{const box=host.getBoundingClientRect();localStorage.setItem(POSITION_KEY,JSON.stringify({x:box.x,y:box.y}));}catch{}}
  try{const saved=JSON.parse(localStorage.getItem(POSITION_KEY));if(saved && Number.isFinite(saved.x)&&Number.isFinite(saved.y))place(saved.x,saved.y);}catch{}
  $('.move-toggle').onclick=()=>{unlocked=!unlocked;$('.move-toggle').setAttribute('aria-pressed',String(unlocked));$('.move-toggle').setAttribute('aria-label',unlocked?'Fijar posición del radar':'Desbloquear posición del radar');$('.move-toggle').title=unlocked?'Arrastrá la cabecera; pulsá para fijar':'Desbloquear para mover';$('header').style.cursor=unlocked?'move':'';if(!unlocked)savePosition();};
  $('header').addEventListener('pointerdown',e=>{if(!unlocked||e.button!==0||e.target.closest('button'))return;const box=host.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX-box.x,y:e.clientY-box.y};$('header').setPointerCapture(e.pointerId);e.preventDefault();});
  $('header').addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId)place(e.clientX-drag.x,e.clientY-drag.y);});
  function endDrag(){if(drag){drag=null;savePosition();}}
  $('header').addEventListener('pointerup',endDrag);$('header').addEventListener('pointercancel',endDrag);
  function fitPosition(){const box=host.getBoundingClientRect();place(box.x,box.y);}
  window.addEventListener('resize',fitPosition);

  const stopEvents=['pointerdown','pointerup','click','dblclick','contextmenu','keydown','keyup','wheel'];
  for(const name of stopEvents)host.addEventListener(name,e=>e.stopPropagation());
  $('.min').onclick=()=>host.classList.add('collapsed');$('.tab').onclick=()=>{host.classList.remove('collapsed');tick();};
  $('.settings-toggle').onclick=()=>{settings.hidden=!settings.hidden;$('.settings-toggle').setAttribute('aria-expanded',String(!settings.hidden));$('.settings-toggle').setAttribute('aria-label',settings.hidden?'Ver configuración del radar':'Ocultar configuración del radar');};
  $('.history-toggle').onclick=()=>{historyUI.hidden=!historyUI.hidden;historyUI.open=true;$('.history-toggle').setAttribute('aria-expanded',String(!historyUI.hidden));$('.history-toggle').setAttribute('aria-label',historyUI.hidden?'Ver historial':'Ocultar historial');};
  const timer=setInterval(tick,250);
  function destroy(remove) {
    stopped=true;clearInterval(timer);tracker.clear();
    if(bus){bus.off('MapEventState',onInvasion);bus.off('requestWarp',onWarp);bus.off('warpCompleted',onWarp);}
    window.removeEventListener('resize',fitPosition);window.removeEventListener('pagehide',onPageHide);if(remove)host.remove();
  }
  function onPageHide(){destroy(true);}
  window.addEventListener('pagehide',onPageHide);tick();
})();
