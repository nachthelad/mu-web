// ==UserScript==
// @name         MU · HUB
// @namespace    local.mu.hub
// @version      1.4.7
// @description  Controles compactos del radar y del ciclo de leveleo.
// @match        https://mu.mormon.garden/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(location.hostname!=='mu.mormon.garden' && !window.__LEVEL_HELPER_DEMO__ && !window.__GOLDEN_RADAR_DEMO__)return;
  if(document.getElementById('mu-hub'))return;
  const instanceKey=Symbol.for('mu.addons.instance.hub.v1');
  if(window[instanceKey])return;
  window[instanceKey]=true;
  const host=document.createElement('div');host.id='mu-hub';
  host.style.cssText='position:fixed;left:14px;top:76px;z-index:2147483000;pointer-events:auto';
  const root=host.attachShadow({mode:'open'}),modules=new Map();let settingsOpen=false,partyOpen=false,collapsed=false;
  const icons={play:'M7 4v16l13-8z',pause:'M6 4h4v16H6zm8 0h4v16h-4z',party:'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM1 21v-3a8 8 0 0 1 16 0v3zm17-16v3h-3v2h3v3h2v-3h3V8h-3V5z',gear:'M19 13v-2l2-2-2-3-3 1-1-4h-4l-1 4-3-1-2 3 2 2v2l-2 2 2 3 3-1 1 4h4l1-4 3 1 2-3zm-6 2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z',history:'M12 3a9 9 0 1 1-8.5 12h2.2A7 7 0 1 0 6 8H3V2l2.3 2.3A9 9 0 0 1 12 3zm-1 4h2v5l4 2-1 2-5-3z'};
  icons.minimize='M6 14l6-6 6 6-2 2-4-4-4 4z';icons.expand='M6 10l2-2 4 4 4-4 2 2-6 6z';icons.lock='M6 10V7a6 6 0 0 1 12 0v3h2v12H4V10zm2 0h8V7a4 4 0 0 0-8 0z';icons.unlock='M6 10V7a6 6 0 0 1 12 0h-2a4 4 0 0 0-8 0v3h12v12H4V10z';
  icons.map='M3 4l6-2 6 2 6-2v18l-6 2-6-2-6 2zm2 2v13l3-1V5zm5-1v13l4 1V6zm6 1v13l3-1V5z';
  const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name]}"/></svg>`;
  root.innerHTML=`<style>:host{font:12px Verdana,sans-serif;color:#eee6d1;color-scheme:dark}*{box-sizing:border-box}.box{width:304px;max-width:calc(100vw - 28px);max-height:calc(100dvh - 90px);overflow:auto;scrollbar-width:thin;background:#15170ff2;border:1px solid #76633d;border-radius:8px}header{display:flex;align-items:center;gap:4px;padding:8px;position:sticky;top:0;background:#15170f;z-index:1}header[data-movable=true]{cursor:grab;touch-action:none;user-select:none}header[data-dragging=true]{cursor:grabbing}button{flex-shrink:0}.drag-handle{flex:1;min-width:12px;align-self:stretch}.box[data-collapsed] > :not(header){display:none!important}button{display:grid;place-items:center;position:relative;width:30px;height:30px;padding:0;border:1px solid #76633d;border-radius:50%;background:#15170f;color:#e7c780;cursor:pointer}button:disabled{opacity:.4;cursor:default}button:focus-visible{outline:2px solid #e7c780;outline-offset:2px}button[aria-pressed=true],button[aria-expanded=true]{color:#c1e7a0;border-color:#a4c880}svg{width:18px;height:18px;fill:currentColor}.count{font-size:9px;position:absolute;bottom:-3px;right:-3px;background:#15170f;border-radius:4px;padding:1px 2px}.party-count{padding:0 10px 8px;color:#aeb6a0;font-size:10px}.state{padding:0 10px 8px;color:#aeb6a0;font-size:10px}.party-panel{padding:12px;border-top:1px solid #76633d;font-size:11px;line-height:1.6}.party-panel h2{font-size:12px;color:#e7c780;margin:0 0 6px}.party-panel p{margin:6px 0}.missing{padding:12px;color:#aeb6a0;font-size:11px}[hidden]{display:none!important}</style><section class="box" aria-label="HUB"><header><span class="drag-handle" aria-hidden="true"></span><button class="lock" aria-label="Desbloquear posición" aria-pressed="true">${svg('lock')}</button><button class="toggle" disabled aria-label="Helper no instalado" aria-pressed="false">${svg('play')}</button><button class="party" disabled aria-label="Ver party automática" aria-expanded="false" aria-controls="hub-party">${svg('party')}<span class="count">—</span></button><button class="map" disabled aria-label="Ocultar mapa" aria-pressed="true">${svg('map')}</button><button class="history" disabled aria-label="Ver historial del radar">${svg('history')}</button><button class="settings" aria-label="Ver configuración" aria-expanded="false" aria-controls="hub-modules">${svg('gear')}</button><button class="minimize" aria-label="Minimizar HUB" aria-expanded="true">${svg('minimize')}</button></header><div class="state" role="status" aria-live="polite">Esperando módulos</div><section id="hub-party" class="party-panel" aria-label="Party automática" hidden><h2>Party</h2><p class="party-status"></p><p>Siempre activa · acepta invitaciones automáticamente.</p><p>Invita en Arena e Icarus hasta 5 integrantes, contando tu personaje. Un envío cada 10 s; reintento al minuto.</p></section><div id="hub-modules"><div class="radar-slot"><div class="missing">Instalá Golden Radar para ver el mapa.</div></div><div class="helper-slot"></div></div></section>`;
  document.body.append(host);const $=s=>root.querySelector(s);
  const positionKey=window.__LEVEL_HELPER_DEMO__ || window.__GOLDEN_RADAR_DEMO__?'mu.hub.demo-position.v1':'mu.hub.position.v1';
  let locked=true,drag=null;
  function savePosition(){try{localStorage.setItem(positionKey,JSON.stringify({x:parseFloat(host.style.left),y:parseFloat(host.style.top),locked}));}catch{/* Position stays usable when storage is unavailable. */}}
  function place(x,y){const rect=host.getBoundingClientRect();host.style.left=Math.max(0,Math.min(x,Math.max(0,innerWidth-rect.width)))+'px';host.style.top=Math.max(0,Math.min(y,Math.max(0,innerHeight-rect.height)))+'px';}
  function renderLock(){const button=$('.lock');button.innerHTML=svg(locked?'lock':'unlock');button.setAttribute('aria-pressed',String(locked));button.setAttribute('aria-label',locked?'Desbloquear posición':'Bloquear posición');button.title=button.getAttribute('aria-label');$('header').dataset.movable=String(!locked);}
  try{const saved=JSON.parse(localStorage.getItem(positionKey));if(saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)){locked=saved.locked!==false;place(saved.x,saved.y);}}catch{}
  $('.lock').onclick=()=>{locked=!locked;renderLock();savePosition();};
  const handle=$('header');
  // Pointer clicks act on the toolbar without taking keyboard focus from the game.
  // Keyboard activation keeps normal focus and Config's return-focus behavior.
  handle.addEventListener('pointerdown',event=>{const button=event.target.closest('button');if(event.button!==0||!button||button.disabled)return;event.preventDefault();const focused=root.activeElement;if(focused?.matches('button')&&focused.closest('header')===handle)focused.blur();});
  handle.addEventListener('click',event=>{const button=event.target.closest('button');if(event.detail>0&&button&&root.activeElement===button)button.blur();});
  handle.addEventListener('pointerdown',event=>{if(locked || event.button!==0 || event.target.closest('button'))return;const rect=host.getBoundingClientRect();drag={id:event.pointerId,x:event.clientX-rect.left,y:event.clientY-rect.top};handle.setPointerCapture(event.pointerId);handle.dataset.dragging='true';event.preventDefault();});
  handle.addEventListener('pointermove',event=>{if(!drag || drag.id!==event.pointerId)return;place(event.clientX-drag.x,event.clientY-drag.y);event.preventDefault();});
  function finishDrag(event){if(!drag || drag.id!==event.pointerId)return;drag=null;handle.dataset.dragging='false';if(handle.hasPointerCapture(event.pointerId))handle.releasePointerCapture(event.pointerId);savePosition();}
  for(const name of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(name,finishDrag);
  window.addEventListener('resize',()=>{place(parseFloat(host.style.left),parseFloat(host.style.top));savePosition();});
  renderLock();
  function render(){const helper=modules.get('helper'),state=helper?.getState();$('.toggle').disabled=!helper || (!state.running && !state.ready);$('.toggle').setAttribute('aria-pressed',String(!!state?.running));$('.toggle').setAttribute('aria-label',state?.running?'Pausar ciclo':'Iniciar ciclo');$('.toggle').innerHTML=svg(state?.running?'pause':'play');$('.party').disabled=!helper;$('.count').textContent=state?`${state.partyCount}/5`:'—';$('.state').textContent=state?.message??'Helper no instalado';$('.history').disabled=!modules.has('radar');const radar=modules.get('radar'),mapState=radar?.getState();$('.map').disabled=typeof radar?.actions.map!=='function';$('.map').setAttribute('aria-pressed',String(mapState?.mapVisible!==false));$('.map').setAttribute('aria-label',mapState?.mapVisible===false?'Mostrar mapa':'Ocultar mapa');$('.party-status').textContent=state?`${state.partyCount}/5 integrantes${state.partyCount<2?' · buscando compañero':''}`:'Helper no instalado';let badge=root.querySelector('.party-count');if(!badge){badge=document.createElement('div');badge.className='party-count';$('.state').after(badge);}badge.hidden=!configModule();badge.textContent=state?`Party ${state.partyCount}/5`:'';for(const b of root.querySelectorAll('button[aria-label]'))b.title=b.getAttribute('aria-label');}
  function setCollapsed(value){collapsed=value;$('.box').toggleAttribute('data-collapsed',value);const button=$('.minimize');button.innerHTML=svg(value?'expand':'minimize');button.setAttribute('aria-expanded',String(!value));button.setAttribute('aria-label',value?'Expandir HUB':'Minimizar HUB');button.title=button.getAttribute('aria-label');place(parseFloat(host.style.left),parseFloat(host.style.top));}
  $('.minimize').onclick=()=>setCollapsed(!collapsed);
  function setParty(open){if(open)setCollapsed(false);partyOpen=open;$('#hub-party').hidden=!open;$('.party').setAttribute('aria-expanded',String(open));$('.party').setAttribute('aria-label',open?'Ocultar party automática':'Ver party automática');if(open)setSettings(false);render();}
  function configModule(){return [...modules.values()].find(mod=>mod.capabilities?.configurationWindow);}
  function setSettings(open){if(open)setCollapsed(false);if(open)setParty(false);settingsOpen=open;const config=configModule();if(config){config.actions?.settings?.(open);}else for(const mod of modules.values()){mod.actions?.settings?.(open);if(mod.id==='radar')mod.host.toggleAttribute('data-hub-settings-open',open);}$('.settings').setAttribute('aria-expanded',String(open));$('.settings').setAttribute('aria-label',open?'Ocultar configuración':'Ver configuración');render();}
  function register(event){
    const mod=event.detail;if(typeof mod?.id!=='string'||!mod.id||modules.has(mod.id)||!(mod.host instanceof HTMLElement)&&!mod.capabilities)return;
    modules.set(mod.id,mod);
    if(mod.capabilities?.configurationWindow){for(const entry of modules.values())if(entry!==mod){entry.actions?.settings?.(false);entry.host?.removeAttribute('data-hub-settings-open');}mod.actions?.attach?.();$('.party').hidden=true;$('#hub-party').hidden=true;partyOpen=false;mod.actions?.settings?.(settingsOpen);render();return;}
    mod.actions?.attach?.();
    if(['radar','helper'].includes(mod.id)&&mod.host){
      if(mod.id==='radar'&&mod.host.shadowRoot){const style=document.createElement('style');style.textContent=':host([data-hub-settings-open]) canvas,:host([data-hub-settings-open]) .legend,:host([data-hub-settings-open]) .rows{display:none!important}:host([data-hub-settings-open]) .panel{height:auto!important;min-height:0!important;resize:none!important}:host([data-hub-settings-open]) .body{container-type:normal!important;flex:none!important;overflow:visible!important}';mod.host.shadowRoot.append(style);mod.host.toggleAttribute('data-hub-settings-open',settingsOpen&&!configModule());}
      if(mod.capabilities?.floatingMap){document.body.append(mod.host);$('.radar-slot').replaceChildren();}else $('.'+mod.id+'-slot').replaceChildren(mod.host);mod.actions?.settings?.(settingsOpen&&!configModule());
    }
    {
      for(const [key,target] of [['view',$('#hub-modules')],['actions',$('header')]]){const capability=mod.capabilities?.[key];if(!(capability?.host instanceof HTMLElement))continue;const wrapper=document.createElement('div');wrapper.dataset.module=mod.id;wrapper.dataset.order=String(capability.order??100);wrapper.append(capability.host);target.append(wrapper);const siblings=[...target.children].filter(e=>e.dataset.order!==undefined).sort((a,b)=>Number(a.dataset.order)-Number(b.dataset.order));for(const sibling of siblings)target.append(sibling);}
    }
    $('header').append($('.minimize'));
    $('.box').style.width=(304+Math.max(0,$('header').querySelectorAll(':scope > [data-module]').length-1)*34)+'px';
    place(parseFloat(host.style.left),parseFloat(host.style.top));render();
  }
  window.addEventListener('mu-hub:register',register);
  window.addEventListener('mu-hub:state',render);
  window.addEventListener('mu-config:state',event=>{settingsOpen=!!event.detail?.opened;$('.settings').setAttribute('aria-expanded',String(settingsOpen));$('.settings').setAttribute('aria-label',settingsOpen?'Ocultar configuración':'Ver configuración');render();});
  $('.toggle').onclick=()=>{modules.get('helper')?.actions.toggle();render();};
  $('.party').onclick=()=>setParty(!partyOpen);
  $('.settings').onclick=()=>setSettings(!settingsOpen);
  $('.map').onclick=()=>{const radar=modules.get('radar');radar?.actions.map?.(radar.getState().mapVisible===false);render();};
  $('.history').onclick=()=>{setCollapsed(false);const radar=modules.get('radar');radar?.actions.map?.(true);radar?.actions.history();render();};
  for(const name of ['pointerdown','pointerup','click','dblclick','keydown','keyup','wheel','contextmenu'])host.addEventListener(name,e=>e.stopPropagation());
  window.dispatchEvent(new CustomEvent('mu-hub:discover'));render();
})();
