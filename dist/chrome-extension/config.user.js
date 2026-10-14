// ==UserScript==
// @name         MU · Config
// @namespace    local.mu.config
// @version      1.3.1
// @description  Ventana independiente para ajustes de módulos MU compatibles.
// @match        https://mu.mormon.garden/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(location.hostname!=='mu.mormon.garden'&&!window.__LEVEL_HELPER_DEMO__&&!window.__GOLDEN_RADAR_DEMO__)return;
  if(document.getElementById('mu-config'))return;
  const instanceKey=Symbol.for('mu.addons.instance.config.v1');
  if(window[instanceKey])return;
  window[instanceKey]=true;
  const host=document.createElement('div');host.id='mu-config';host.style.cssText='position:fixed;left:340px;top:76px;z-index:2147483100;pointer-events:auto';
  const root=host.attachShadow({mode:'open'}),providers=new Map();let opened=false,minimized=false,returnFocus=null,drag=null,keyboardInteraction=false;
  root.innerHTML=`<style>:host{color-scheme:dark;font:12px Verdana,sans-serif;color:#eee6d1}*{box-sizing:border-box}[hidden]{display:none!important}.window{width:360px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 24px);display:flex;flex-direction:column;background:#15170f;border:1px solid #76633d;border-radius:8px;box-shadow:0 8px 24px #0007}header{flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #76633d;cursor:grab;touch-action:none;user-select:none}header h2{margin:0;color:#e7c780;font-size:14px}.window.minimized{width:230px}.window.minimized .content,.window.minimized footer{display:none}.header-actions{display:flex;gap:4px}.minimize{padding:4px 8px;font-size:18px}.content{overflow:auto;padding:0 14px 10px;min-height:0;scrollbar-width:thin}.provider+.provider{border-top:1px solid #76633d;padding-top:8px;margin-top:12px}.error{color:#f1b5a4;font-size:11px}.error:empty{display:none}.empty{color:#aeb6a0}footer{flex-shrink:0;display:flex;justify-content:flex-end;gap:8px;padding:12px 14px;border-top:1px solid #76633d}button{font:inherit;color:#e7c780;border:1px solid #76633d;background:#15170f;border-radius:4px;padding:8px 12px;cursor:pointer}button:focus-visible{outline:2px solid #e7c780;outline-offset:2px}.save{background:#e7c780;color:#15170f}.close{border:0;padding:4px 8px;font-size:20px}.launcher{width:44px;height:44px;border-radius:50%;font-size:22px}button:disabled{opacity:.5;cursor:default}</style><button class="launcher" aria-label="Abrir configuración" aria-expanded="false">⚙</button><section class="window" role="dialog" aria-modal="false" aria-labelledby="config-title" hidden><header><h2 id="config-title">Configuración</h2><div class="header-actions"><button class="minimize" aria-label="Minimizar configuración" aria-expanded="true" aria-controls="config-content">−</button><button class="close" aria-label="Cerrar configuración">×</button></div></header><div class="content" id="config-content"><p class="empty">Esperando módulos con ajustes.</p><div class="providers"></div><p class="error" role="alert"></p></div><footer><button class="cancel">Cancelar</button><button class="save">Guardar</button></footer></section>`;
  document.body.append(host);const $=s=>root.querySelector(s);
  function ordered(){return [...providers.values()].sort((a,b)=>(a.provider.order??100)-(b.provider.order??100)||a.id.localeCompare(b.id));}
  function mountProviders(){
    const entries=ordered();
    for(const entry of entries){
      const slot=entry.provider.slot;
      const owner=typeof slot==='string'?entries.find(other=>other!==entry&&other.provider.slots?.[slot] instanceof HTMLElement&&!entry.provider.host.contains(other.provider.slots[slot])):null;
      const target=owner?.provider.slots[slot]??entry.wrapper;
      if(entry.provider.host.parentNode!==target)target.append(entry.provider.host);
      entry.wrapper.hidden=!!owner;
    }
  }
  function activeElement(){let el=document.activeElement;while(el?.shadowRoot?.activeElement)el=el.shadowRoot.activeElement;return el;}
  function fit(){const rect=host.getBoundingClientRect();host.style.left=Math.max(0,Math.min(parseFloat(host.style.left)||0,innerWidth-rect.width))+'px';host.style.top=Math.max(0,Math.min(parseFloat(host.style.top)||0,innerHeight-rect.height))+'px';}
  function state(){window.dispatchEvent(new CustomEvent('mu-config:state',{detail:{opened,minimized}}));}
  let saving=false;
  function open(value=true){
    if(saving)return;
    if(value===opened){if(value&&minimized)minimize(false);return;}
    if(value){returnFocus=activeElement();try{for(const {provider} of ordered())provider.begin();}catch{for(const {provider} of ordered())try{provider.discard();}catch{}$('.error').textContent='No se pudo abrir la configuración.';return;}opened=true;minimize(false);$('.window').hidden=false;$('.launcher').hidden=true;$('.error').textContent='';fit();if(keyboardInteraction)$('.close').focus();}
    else{for(const {provider} of ordered())provider.discard();opened=false;minimize(false);$('.window').hidden=true;$('.launcher').hidden=host.dataset.hub==='true';if(keyboardInteraction||!returnFocus?.matches?.('button'))returnFocus?.focus?.();}
    $('.launcher').setAttribute('aria-expanded',String(opened));state();
  }
  function minimize(value=!minimized){minimized=value;$('.window').classList.toggle('minimized',minimized);$('.content').inert=minimized;$('footer').inert=minimized;$('.minimize').setAttribute('aria-expanded',String(!minimized));$('.minimize').setAttribute('aria-label',minimized?'Restaurar configuración':'Minimizar configuración');$('.minimize').title=minimized?'Restaurar configuración':'Minimizar configuración';$('.minimize').textContent=minimized?'＋':'−';fit();state();}
  async function save(){
    if(saving)return;saving=true;$('.save').disabled=true;
    const list=ordered(),applied=[];$('.error').textContent='';
    try{
    try{const errors=list.map(({provider})=>provider.validate()).filter(Boolean);if(errors.length){$('.error').textContent=errors.join(' ');return;}
      for(const entry of list){applied.push(entry);await entry.provider.apply();}
    }catch(error){let rollbackFailed=false;for(const {provider} of applied.reverse())try{await provider.rollback();}catch{rollbackFailed=true;}
      $('.error').textContent=rollbackFailed?'No se pudo guardar ni restaurar todos los ajustes. Revisá el almacenamiento.':'No se pudo guardar. Se restauraron los ajustes anteriores.';console.error('[MU Config]',error);return;
    }
    }finally{saving=false;$('.save').disabled=false;}
    open(false);
  }
  function register(event){const mod=event.detail,provider=mod?.capabilities?.settings;if(typeof mod?.id!=='string'||!mod.id||providers.has(mod.id)||!(provider?.host instanceof HTMLElement)||!['begin','validate','apply','discard','rollback'].every(key=>typeof provider[key]==='function'))return;
    const wrapper=document.createElement('section');wrapper.className='provider';wrapper.dataset.module=mod.id;wrapper.setAttribute('aria-label',provider.title??mod.name??mod.id);wrapper.append(provider.host);providers.set(mod.id,{id:mod.id,provider,wrapper});
    for(const entry of ordered())$('.providers').append(entry.wrapper);$('.empty').hidden=providers.size>0;$('.save').disabled=providers.size===0;if(opened){try{provider.begin();}catch{providers.delete(mod.id);wrapper.remove();$('.error').textContent='No se pudo cargar el módulo '+mod.id;}}mountProviders();fit();announce();
  }
  const hubModule={id:'config',name:'Config',version:'1.3.1',host,getState:()=>({opened,minimized}),capabilities:{configurationWindow:true},actions:{settings:open,attach(){host.dataset.hub='true';$('.launcher').hidden=true;},open}};
  function announce(){window.dispatchEvent(new CustomEvent('mu-hub:register',{detail:hubModule}));}
  window.addEventListener('mu-hub:register',register);window.addEventListener('mu-hub:discover',announce);window.addEventListener('mu-config:open',()=>open(true));window.addEventListener('resize',fit);
  $('.minimize').onclick=event=>{minimize();if(event.detail===0)$('.minimize').focus();};
  $('.launcher').addEventListener('pointerdown',event=>{if(event.button===0){event.preventDefault();root.activeElement?.blur?.();}});$('.launcher').onclick=()=>open(!opened);$('.close').onclick=$('.cancel').onclick=()=>open(false);$('.save').onclick=save;$('.save').disabled=true;
  document.addEventListener('pointerdown',()=>{keyboardInteraction=false;},{capture:true});document.addEventListener('keydown',event=>{keyboardInteraction=true;if(event.key==='Escape'&&opened&&!window[Symbol.for('mu.addons.external-panel.v1')]){event.preventDefault();event.stopPropagation();open(false);}},{capture:true});
  const handle=$('header');handle.addEventListener('pointerdown',event=>{const button=event.target.closest('button');if(event.button!==0||!button)return;event.preventDefault();const focused=root.activeElement;if(focused?.matches('button'))focused.blur();});handle.addEventListener('click',event=>{const button=event.target.closest('button');if(event.detail>0&&button&&root.activeElement===button)button.blur();});handle.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('button'))return;const rect=host.getBoundingClientRect();drag={id:event.pointerId,x:event.clientX-rect.left,y:event.clientY-rect.top};handle.setPointerCapture(event.pointerId);event.preventDefault();});
  handle.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;host.style.left=(event.clientX-drag.x)+'px';host.style.top=(event.clientY-drag.y)+'px';fit();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(name,()=>{drag=null;});
  for(const name of ['pointerdown','pointerup','click','dblclick','keydown','keyup','wheel','contextmenu'])host.addEventListener(name,event=>event.stopPropagation());
  const resizeObserver=new ResizeObserver(fit);resizeObserver.observe($('.window'));window.addEventListener('pagehide',()=>resizeObserver.disconnect(),{once:true});
  announce();window.dispatchEvent(new CustomEvent('mu-hub:discover'));fit();
})();
