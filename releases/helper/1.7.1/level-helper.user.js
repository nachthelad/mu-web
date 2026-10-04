// ==UserScript==
// @name         MU · Level & Reset Helper
// @namespace    local.mu.level-helper
// @version      1.7.1
// @description  Ruta Lorencia/Arena/Icarus y reset a nivel 400; inicio manual.
// @match        https://mu.mormon.garden/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function(){
  'use strict';
  const DEFAULTS={icarus:true,arenaAlternative:false,radius:8};
  function route(level,config=DEFAULTS){
    if(level<50)return{id:'lorencia',map:0,name:'Lorencia',x:47,y:59,command:'/move lorencia'};
    if(level>=170 && config.icarus)return{id:'icarus',map:10,name:'Icarus',x:43,y:155,command:'/move icarus'};
    return{id:'arena',map:6,name:'Arena',x:config.arenaAlternative?31:12,y:config.arenaAlternative?74:39,command:'/move arena'};
  }
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  class Cycle {
    constructor(config={}){this.config={...DEFAULTS,...config};this.running=false;this.message='Detenido';this.resets=0;}
    start(snapshot,now){
      if(!snapshot?.ready || !snapshot.name || !snapshot.position || !Number.isInteger(snapshot.level) || snapshot.level<1)return false;
      this.running=true;this.name=snapshot.name;this.stage=null;this.pending=null;this.dead=false;this.settled=false;this.lastMove=-Infinity;this.lastCommand=-Infinity;this.lastAttack=-Infinity;this.progressAt=now;this.bestDistance=Infinity;this.lastLevel=snapshot.level;this.message='Iniciando ruta';return true;
    }
    stop(message='Detenido'){this.running=false;this.pending=null;this.message=message;return{kind:'stop'};}
    step(s,now){
      if(!this.running)return null;
      if(this.pending?.kind==='reset' && !s?.ready){
        if(now-this.pending.at>90000)return this.stop('Pausado: no pudo reingresar después del reset');
        if(s?.uiState===3 && s.connected && !s.loadingCharacters){
          if(!s.characters?.includes(this.name))return this.stop('Pausado: el personaje del ciclo no está en la lista');
          if(!this.pending.selected){this.pending.selected=true;this.message='Reingresando con '+this.name;return{kind:'select',name:this.name};}
        }
        this.message='Reset: esperando reingreso con '+this.name;return null;
      }
      if(s?.loading && s.connected){this.message='Esperando carga del mapa';return null;}
      if(!s?.ready || !s.position)return this.stop('Pausado: desconexión o cliente no disponible');
      if(s.name!==this.name)return this.stop('Pausado: cambió el personaje');
      if(!Number.isInteger(s.level) || s.level<1)return this.stop('Pausado: nivel no disponible');
      if(s.loading){this.message='Esperando carga del mapa';return null;}
      if(s.dead){this.dead=true;this.settled=false;this.pending=this.pending?.kind==='reset'?this.pending:null;this.progressAt=now;this.message='Muerto: esperando reaparecer';return{kind:'clear'};}
      if(this.pending?.kind==='reset'){
        if(s.level<this.pending.level){this.pending=null;this.stage=null;this.dead=false;this.resets++;this.message='Reset confirmado: reiniciando ruta';}
        else if(now-this.pending.at>(this.pending.selected?90000:30000))return this.stop('Pausado: /reset no confirmó un nuevo nivel');
        else{this.message='Esperando confirmación de /reset';return null;}
      }
      if(this.dead){this.dead=false;this.progressAt=now;this.bestDistance=Infinity;this.message='Reapareciste: volviendo al último spot';}
      if(s.level>=400){
        if(now-this.lastCommand<5000)return null;
        this.pending={kind:'reset',level:s.level,at:now};this.lastCommand=now;this.message='Enviando /reset';return{kind:'command',text:'/reset'};
      }
      // A level drop not caused by our reset is still a server-side reset.
      if(s.level<this.lastLevel){this.stage=null;this.progressAt=now;this.bestDistance=Infinity;}
      this.lastLevel=s.level;
      const target=route(s.level,this.config);
      if(!this.stage || this.stage.id!==target.id){this.stage=target;this.settled=false;this.progressAt=now;this.bestDistance=Infinity;this.pending=null;}
      if(this.pending?.kind==='warp'){
        if(s.map===this.stage.map){this.pending=null;this.settled=false;this.progressAt=now;this.bestDistance=Infinity;}
        else if(now-this.pending.at>(this.stage.map===6?5000:20000)){
 if(this.stage.map===6 && !this.pending.stadium){this.pending={kind:'warp',at:now,stadium:true};this.lastCommand=now;this.message='Enviando /move stadium';return{kind:'command',text:'/move stadium'};}
 return this.stop('Pausado: move no cambió el mapa');
}
        else{this.message='Esperando llegada a '+this.stage.name;return null;}
      }
      if(s.map!==this.stage.map){
        if(now-this.lastCommand<5000)return null;
        this.pending={kind:'warp',at:now};this.lastCommand=now;this.message='Enviando '+this.stage.command;return{kind:'command',text:this.stage.command};
      }
      const d=distance(s.position,this.stage);
      if(d<=2)this.settled=true;
      if(this.settled && d<=this.config.radius+2){this.bestDistance=Infinity;this.progressAt=now;this.message=`Leveleando en ${this.stage.name} ${this.stage.x}, ${this.stage.y}`;
        if(now-this.lastAttack>=1000){this.lastAttack=now;return{kind:'helper',spot:this.stage,radius:this.config.radius};}return null;
      }
      if(d<this.bestDistance-.5){this.bestDistance=d;this.progressAt=now;}
      if(now-this.progressAt>45000)return this.stop('Pausado: no pudo avanzar al spot durante 45 s');
      this.message=`Volviendo a ${this.stage.name} ${this.stage.x}, ${this.stage.y}`;
      if(now-this.lastMove>=2500){this.lastMove=now;return{kind:'walk',spot:this.stage};}return null;
    }
    commandRejected(){return this.stop('Pausado: el cliente no pudo enviar el comando');}
  }
  class NativeHelper {
    constructor(){this.pending=null;}
    sync(store,active,now){
      if(typeof store?.toggleMuHelper!=='function' || !store.muHelper)return 'unavailable';
      if(this.pending){
        if(!!store.muHelper.active===this.pending.active)this.pending=null;
        else if(now-this.pending.at>10000)return 'timeout';
        else return 'waiting';
      }
      if(!!store.muHelper.active===active)return 'ready';
      store.toggleMuHelper();this.pending={active,at:now};return 'waiting';
    }
  }
  class AutoParty {
    constructor(){this.lastInvite=-Infinity;this.invited=new Map();this.character=null;this.previousMembers=new Set();this.answered=new WeakSet();}
    step(world,social,s,now){
      if(!s.ready || s.loading || s.dead || !social)return;
      if(this.character!==s.name){this.character=s.name;this.invited.clear();this.previousMembers.clear();this.answered=new WeakSet();this.lastInvite=-Infinity;}
      const members=social.partyMembers??[],names=new Set(members.map(m=>m.name));
      for(const name of this.previousMembers)if(!names.has(name))this.invited.delete(name);
      this.previousMembers=names;
      const request=social.partyRequest;
      if(request){
        if(members.length<5 && typeof social.partyRespond==='function' && !this.answered.has(request)){
          social.partyRespond(true);this.answered.add(request);
        }return;
      }
      if(![6,10].includes(s.map) || typeof social.partyInvite!=='function' || members.length>=5 || (members.length && members[0].name!==s.name) || now-this.lastInvite<10000)return;
      const hero=world?.playerEntity,p=hero?.transform?.pos;if(!p)return;
      const players=(world.netObjsQuery?.entities??[]).filter(e=>{
        const q=e?.transform?.pos,name=e?.objectNameInWorld;
        return e && !e.localPlayer && e.netId!==hero.netId && Number.isInteger(e.netId) && e.npcType===undefined && (e.playerAnimation || e.skin!==undefined) && !e.dying && !e.objOutOfScope && (e.worldIndex===undefined || e.worldIndex===s.map) && typeof name==='string' && name.length>0 && name!==s.name && (now-(this.invited.get(name)??-Infinity)>=60000) && !members.some(m=>m.name===name) && q && Number.isFinite(q.x) && Number.isFinite(q.z) && Math.abs(Math.floor(q.x)-Math.floor(p.x))<=2 && Math.abs(Math.floor(q.z)-Math.floor(p.z))<=2;
      }).sort((a,b)=>Math.hypot(a.transform.pos.x-p.x,a.transform.pos.z-p.z)-Math.hypot(b.transform.pos.x-p.x,b.transform.pos.z-p.z));
      const target=players[0];if(!target)return;
      social.partyInvite({netId:target.netId,name:target.objectNameInWorld});this.invited.set(target.objectNameInWorld,now);this.lastInvite=now;
    }
  }
  const COMBAT_ACTIONS=new Set([38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,80,81,82,83,84,85,86,87,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,130,131,132,133,134,135,136,137,138,139,140,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,246,247,248,249,250,251,252,253,254,255,256,257,258,282]);
  class LorenciaSearch {
    constructor(){this.reset();this.index=0;}
    reset(){this.idleSince=null;this.pending=null;this.lastProbe=-Infinity;this.hero=null;}
    step(cycle,s,world,store,now){
      const hero=world?.playerEntity;
      if(!cycle.running || !cycle.settled || !s.ready || s.loading || s.dead || s.map!==0 || s.level>=50){this.reset();return null;}
      if(this.hero!==hero){this.reset();this.hero=hero;}
      if(this.pending){
        if(distance(s.position,this.pending.spot)<=1 || now-this.pending.at>=6000){this.pending=null;this.idleSince=now;return{kind:'helper'};}
        return null;
      }
      const move=hero?.playerMoveTo?.point;
      const busy=COMBAT_ACTIONS.has(hero?.playerAnimation?.action) || world.attackTarget || world.castRequest || world.castApproach || world.pickupTarget || (move && Math.hypot(move.x-s.position.x,move.y-s.position.y)>.8);
      if(!store?.muHelper?.active || busy){this.idleSince=now;return null;}
      if(this.idleSince===null){this.idleSince=now;return null;}
      if(now-this.idleSince<1000 || now-this.lastProbe<3000)return null;
      const offsets=[[3,0],[3,3],[0,3],[-3,3],[-3,0],[-3,-3],[0,-3],[3,-3]];
      for(let i=0;i<offsets.length;i++){
        const [dx,dy]=offsets[this.index++%offsets.length],spot={x:47+dx,y:59+dy};
        if(distance(s.position,spot)<1 || !world.isWalkable?.(spot.x,spot.y) || (world.getTerrainFlag?.(spot.x,spot.y)&1))continue;
        this.lastProbe=now;this.pending={spot,at:now};return{kind:'walk',spot};
      }
      this.lastProbe=now;return null;
    }
  }
  if(typeof module==='object' && module.exports && typeof document==='undefined'){module.exports={Cycle,route,NativeHelper,AutoParty,LorenciaSearch,DEFAULTS};return;}
  if(location.hostname!=='mu.mormon.garden' && !window.__LEVEL_HELPER_DEMO__)return;
  if(document.getElementById('mu-level-helper'))return;
  const host=document.createElement('div');host.id='mu-level-helper';host.style.cssText='position:fixed;right:14px;top:240px;z-index:2147483000;max-width:calc(100vw - 28px);';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML='<style>:host{color-scheme:dark;font:12px Verdana,sans-serif;color:#eee6d1;display:block}button{display:grid;place-items:center;width:44px;height:44px;padding:0;color:#e7c780;background:#15170ff2;border:1px solid #76633d;border-radius:50%;cursor:pointer}button:hover{background:#292c20}button:focus-visible{outline:2px solid #e7c780;outline-offset:3px}button:disabled{opacity:.45;cursor:default}button[aria-pressed="true"]{border-color:#a4c880;color:#c1e7a0}svg{width:20px;height:20px;fill:currentColor}.pause{display:none}button[aria-pressed="true"] .play{display:none}button[aria-pressed="true"] .pause{display:block}[hidden]{display:none!important}.controls{display:flex;gap:6px;justify-content:flex-end}.config{width:280px;max-width:calc(100vw - 28px);max-height:calc(100dvh - 305px);overflow:auto;margin-top:8px;padding:14px;background:#15170ff2;border:1px solid #76633d;border-radius:8px;line-height:1.6}.config h2{font-size:13px;color:#e7c780;margin:0 0 10px}.config p{margin:8px 0}.config dl{margin:0}.config dt{color:#aeb6a0;margin-top:8px}.config dd{margin:0}.status{color:#c1e7a0}@media(max-height:550px){:host{top:80px!important}.config{max-height:calc(100dvh - 145px)}}</style><div class="controls"><button class="toggle" aria-label="Iniciar ciclo" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="play" d="M7 4v16l13-8z"/><path class="pause" d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg></button><button class="party" aria-label="Ver party automática" aria-pressed="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM1 21v-3a8 8 0 0 1 16 0v3zm17-16v3h-3v2h3v3h2v-3h3V8h-3V5z"/></svg></button><button class="settings" aria-label="Ver configuración" aria-expanded="false" aria-controls="helper-config"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 13a7.8 7.8 0 0 0 0-2l2-1.5-2-3.5-2.4 1a8.3 8.3 0 0 0-1.7-1L15 3h-4l-.4 3a8.3 8.3 0 0 0-1.7 1L6.5 6l-2 3.5 2 1.5a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a8.3 8.3 0 0 0 1.7 1L11 21h4l.3-3a8.3 8.3 0 0 0 1.7-1l2.4 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg></button></div><section id="helper-config" class="config" aria-label="Configuración del helper" hidden><h2>Configuración</h2><p class="status" role="status" aria-live="polite"></p><p class="character"></p><dl><dt>Ruta</dt><dd>Lorencia 47, 59 · hasta nivel 50. Busca alrededor tras 1 s sin atacar.</dd><dd>Arena 12, 39 · niveles 50–169</dd><dd>Icarus 43, 155 · desde nivel 170</dd><dt>Reset</dt><dd>/reset al nivel 400. Reingresa con el mismo personaje.</dd><dt>Ataque</dt><dd>MU Helper del juego (Home). Usa sus skills y pociones.</dd><dt>Invitaciones de party</dt><dd class="party-state"></dd><dd>Solo Arena e Icarus · hasta 2 tiles por eje · un envío cada 10 s · reintento al minuto. Acepta invitaciones automáticamente. Busca 2–5 integrantes, contando tu personaje.</dd></dl></section>';
  document.body.append(host);const $=s=>root.querySelector(s);
  const cycle=new Cycle(),native=new NativeHelper(),party=new AutoParty(),search=new LorenciaSearch();let queuedAction=null,desiredHelper=null,ownedMove=null;
  function render(s){const button=$('.toggle');button.disabled=!cycle.running && !s.ready;button.setAttribute('aria-pressed',String(cycle.running));button.setAttribute('aria-label',cycle.running?'Pausar ciclo':'Iniciar ciclo');const invite=$('.party');invite.setAttribute('aria-label','Ver party automática');$('.status').textContent=cycle.message;$('.character').textContent=s.ready?`${s.name} · nivel ${s.level} · ${Math.floor(s.position.x)}, ${Math.floor(s.position.y)} · ${cycle.resets} resets`:'Esperando personaje';const count=window.__social?.partyMembers?.length||1;$('.party-state').textContent=`Siempre activa · ${count}/5 integrantes${count<2?' · buscando compañero':''}`;for(const e of root.querySelectorAll('button'))e.title=e.getAttribute('aria-label');}
  function snapshot(){
    const store=window.__store,world=window.__world,p=world?.playerEntity?.transform?.pos,pd=store?.playerData;
    const connected=!!(store?.gsSocket?.readyState===1 && !store.connectionLost && !store.isOffline);
    return{connected,uiState:store?.uiState,loadingCharacters:!!store?.loadingCharactersList,characters:store?.charactersList?.map(c=>c.Name),ready:!!(store?.uiState===5 && pd && p && Number.isFinite(p.x) && Number.isFinite(p.z) && world.playerEntity.playerMoveTo && connected && typeof window.__social?.sendChat==='function'),name:pd?.name,level:pd?.level,map:world?.mapIndex,position:p?{x:p.x,y:p.z}:null,dead:!!world?.playerEntity?.dying || pd?.currentHP<=0,loading:!!store?.sceneLoading || !!store?.spritesLoading};
  }
  function clearOwned(){
    if(ownedMove){const {hero,x,y}=ownedMove;
      if(hero===window.__world?.playerEntity && hero.playerMoveTo?.point.x===x && hero.playerMoveTo?.point.y===y && !hero.dying){
        const p=hero.transform.pos;hero.playerMoveTo.point.x=p.x;hero.playerMoveTo.point.y=p.z;hero.playerMoveTo.handled=false;hero.playerMoveTo.sendToServer=true;
      }
    }ownedMove=null;
  }
  function enact(action){
    if(!action)return;
    if(action.kind==='select'){
      clearOwned();queuedAction=null;desiredHelper=null;native.pending=null;
      const store=window.__store;
      if(typeof store?.selectCharacterRequest!=='function'){cycle.stop('Pausado: selección de personaje no disponible');return;}
      store.focusedChar=action.name;store.focusCharacterRequest?.(action.name);store.selectCharacterRequest(action.name);return;
    }
    if(action.kind==='helper'){clearOwned();desiredHelper=true;return;}
    desiredHelper=false;clearOwned();
    if(action.kind==='stop'||action.kind==='clear'){queuedAction=null;return;}
    queuedAction=action;
  }
  function serviceHelper(now){
    if(desiredHelper===null)return;
    const result=native.sync(window.__store,desiredHelper,now);
    if(result==='unavailable'||result==='timeout'){
      queuedAction=null;cycle.stop(result==='timeout'?'Pausado: Home no confirmó el cambio del MU Helper':'Pausado: MU Helper no disponible');desiredHelper=null;return;
    }
    if(result==='waiting'){cycle.message='Esperando Home: '+(desiredHelper?'activar':'detener')+' MU Helper';return;}
    if(!queuedAction)return;
    const action=queuedAction;queuedAction=null;
    if(action.kind==='command'){if(!window.__social.sendChat(action.text))cycle.commandRejected();return;}
    if(action.kind==='walk'){
      const world=window.__world,hero=world?.playerEntity,{x,y}=action.spot;
      if(world?.terrain==null || !hero || hero.dying)return;
      if(!world.isWalkable(x,y)){cycle.stop('Pausado: coordenadas del spot no transitables');return;}
      hero.playerMoveTo.point.x=x+.5;hero.playerMoveTo.point.y=y+.5;hero.playerMoveTo.handled=false;hero.playerMoveTo.sendToServer=true;
      ownedMove={hero,x:x+.5,y:y+.5};if(search.pending?.spot===action.spot)search.pending.at=now;
    }
  }
  function refresh(){
    try{
      const s=snapshot(),now=Date.now();
      if(!queuedAction || s.dead || !s.ready){
        const searchAction=search.step(cycle,s,window.__world,window.__store,now);
        if(searchAction)enact(searchAction);else if(!search.pending)enact(cycle.step(s,now));
        if(search.pending)cycle.message='Buscando enemigos cerca de Lorencia 47, 59';
      }
      if(s.ready && !s.loading)serviceHelper(now);
      else if(!s.ready){queuedAction=null;desiredHelper=null;native.pending=null;clearOwned();}
      party.step(window.__world,window.__social,s,now);
      render(s);window.dispatchEvent(new CustomEvent('mu-hub:state',{detail:{id:'helper',state:hubModule.getState()}}));
    }catch(e){cycle.stop('Pausado: cliente incompatible');clearOwned();render({ready:false});console.error('[Level Helper]',e);}
  }
  $('.settings').onclick=()=>{const panel=$('.config');panel.hidden=!panel.hidden;$('.settings').setAttribute('aria-expanded',String(!panel.hidden));$('.settings').setAttribute('aria-label',panel.hidden?'Ver configuración':'Ocultar configuración');render(snapshot());};
  $('.party').onclick=()=>{if($('.config').hidden)$('.settings').click();};
  $('.toggle').onclick=()=>{if(cycle.running)enact(cycle.stop());else cycle.start(snapshot(),Date.now());refresh();};
  for(const name of ['pointerdown','pointerup','click','dblclick','keydown','keyup','wheel','contextmenu'])host.addEventListener(name,e=>e.stopPropagation());
  const hubStyle=document.createElement('style');hubStyle.textContent=':host([data-hub=true]){position:static!important;display:block;max-width:none!important}:host([data-hub=true]) .controls{display:none}:host([data-hub=true]) .config{width:100%;max-width:none;max-height:none;margin:0;border:0;border-top:1px solid #76633d;border-radius:0}';root.append(hubStyle);
 const hubModule={id:'helper',host,getState:()=>({running:cycle.running,ready:snapshot().ready,message:cycle.message,partyCount:window.__social?.partyMembers?.length||1}),actions:{toggle:()=>$('.toggle').click(),settings:open=>{const panel=$('.config');panel.hidden=!open;$('.settings').setAttribute('aria-expanded',String(open));},attach:()=>{host.dataset.hub='true';host.style.setProperty('position','static','important');}}};
 function registerHub(){window.dispatchEvent(new CustomEvent('mu-hub:register',{detail:hubModule}));}
 window.addEventListener('mu-hub:discover',registerHub);registerHub();
  const timer=setInterval(refresh,500);window.addEventListener('pagehide',()=>{clearInterval(timer);clearOwned();if(window.__store?.muHelper?.active && desiredHelper!==null)window.__store.toggleMuHelper();},{once:true});refresh();
})();
