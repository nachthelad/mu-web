// Compatibility only: reuse the client's cached module, never boot another game.
(()=>{
  'use strict';
  const marker=Symbol.for('mu.addons.client-compat.v1');if(window[marker])return;
  const state=window[marker]={state:'loading',message:'Esperando cliente'};
  const keys=['__store','__world','__social','__eventBus'];
  const legacy=()=>keys.every(key=>window[key]);
  async function initialize(){
    if(legacy()){state.state='legacy';state.message='';return;}
    const builds=[{entry:'/assets/index-C5JIMxmo.js',module:'/assets/layout-A1P3A0u1.js'},{entry:'/assets/index-D-gOSya0.js',module:'/assets/layout-DCITLqBq.js'},{entry:'/assets/index-Do3IjarP.js',module:'/assets/layout-CoOAKkh-.js'},{entry:'/assets/index-URnTVW_1.js',module:'/assets/layout-DQbdTT-G.js'}];
    const build=builds.find(build=>[...document.querySelectorAll('script[type="module"][src]')].some(script=>{
      const url=new URL(script.src,location.href);return url.origin===location.origin&&url.pathname===build.entry&&!url.search;
    }));
    if(!build){state.state='unsupported';state.message='Cliente no compatible. Hace falta actualizar el addon.';return;}
    try{
      const native=await import(new URL(build.module,location.origin).href);
      // Another initializer/client may have supplied the original globals meanwhile.
      if(legacy()){state.state='legacy';state.message='';return;}
      const store=native.n,social=native.V,bus=native.aw;
      if(!store||typeof store.uiState!=='number'||!store.playerData||!('world' in store)||!('gsSocket' in store)||typeof social?.sendChat!=='function'||typeof bus?.on!=='function'||typeof bus?.off!=='function'||keys.some(key=>key in window))throw Error('Interfaces del cliente no compatibles');
      const values={__store:()=>store,__world:()=>store.world,__social:()=>social,__eventBus:()=>bus};
      Object.defineProperties(window,Object.fromEntries(keys.map(key=>[key,{configurable:true,get:values[key]}])));
      state.state='ready';state.message='';
    }catch{
      state.state='error';state.message='No se pudo conectar con este cliente. Recargá el juego; si persiste, actualizá el addon.';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
// Presentation adapter only. Original modules retain all engines and transactions.
(()=>{
  'use strict';
  const marker=Symbol.for('mu.addons.external-panel.v1');if(window[marker])return;
  window[marker]=true;
  const modules=new Map(),ids=new WeakMap(),caches=new Map();let nextId=0,epoch=0,previousIdentity='',lease=null;
  const documentId=crypto.randomUUID();
  let overlay=false;
  const hidden=document.createElement('style');hidden.id='mu-external-panel-style';
  function hide(){hidden.textContent='#mu-hub,#mu-config,#mu-analytics,#mu-level-helper{display:none!important}'+(overlay?'':'#mu-golden-radar{display:none!important}');(document.head||document.documentElement)?.append(hidden);}
  hide();
  window.addEventListener('mu-hub:register',e=>{const m=e.detail;if(['helper','radar','config','analytics'].includes(m?.id)&&!modules.has(m.id))modules.set(m.id,m);});
  window.addEventListener('mu-hub:state',()=>session());
  window.addEventListener('DOMContentLoaded',()=>{hide();window.dispatchEvent(new CustomEvent('mu-hub:discover'));},{once:true});
  function identity(){
    const s=window.__store,p=s?.playerData;
    const authenticated=!!s&&s.gsSocket?.readyState===1&&!s.connectionLost&&!s.isOffline&&[3,4,5].includes(s.uiState);
    const slash=typeof s?.accountFor==='string'?s.accountFor.indexOf('/'):-1;
    let server='';try{server=new URL(s.gsSocket.url).host;}catch{}
    return {account:authenticated&&typeof s.username==='string'?s.username:'',world:authenticated&&slash>0?s.accountFor.slice(0,slash):'',character:authenticated?p?.name||'':'',server:authenticated?server:'',ready:authenticated&&s.uiState===5&&!s.sceneLoading&&!s.spritesLoading};
  }
  function session(){
    const who=identity(),key=JSON.stringify([who.account,who.world,who.character,who.server]);
    if(previousIdentity!==key){previousIdentity=key;epoch++;lease=null;caches.clear();modules.get('config')?.actions.settings(false);}
    return {generation:documentId+':'+epoch,identity:who};
  }
  function check(r){const s=session();if(!lease||r.lease!==lease||r.generation!==s.generation)throw Error('Cambió la sesión. Reconectá y revisá el borrador.');return s;}
  function status(){const s=session(),client=window[Symbol.for('mu.addons.client-compat.v1')];return {...s,client:{state:client.state,message:client.message},overlay,statsVisible:modules.get('helper')?.getState()?.statsVisible===true,helper:modules.get('helper')?.getState(),analytics:modules.get('analytics')?.getState(),radar:modules.get('radar')?.getState()};}
  const allowedTags=new Set('div span p section aside header footer h1 h2 h3 h4 button input textarea select option optgroup label details summary fieldset legend strong b i em small br hr ul ol li table thead tbody tr th td progress canvas svg path circle rect line polyline polygon g title style'.split(' '));
  const attrOK=name=>/^(?:id|class|style|role|title|type|name|value|min|max|step|rows|cols|placeholder|for|tabindex|disabled|hidden|checked|selected|open|width|height|viewBox|d|fill|stroke|stroke-width|cx|cy|r|x|y|x1|x2|y1|y2|points|aria-[\w-]+|data-[\w-]+)$/.test(name);
  function serialize(view,revision){
    const host=modules.get(view)?.host;if(!host)throw Error('Módulo todavía no disponible');
    const nodes={},live=new Map();let count=0;
    function visit(node){
      if(++count>24000)throw Error('Vista demasiado grande');
      if(node.nodeType!==1&&node.nodeType!==3)return null;
      if(node.nodeType===1&&(!allowedTags.has(node.localName)||node.dataset.retired==='golden-hunt'))return null;
      let id=ids.get(node);if(!id){id=++nextId;ids.set(node,id);}live.set(id,node);
      if(node.nodeType===3){nodes[id]={id,text:node.textContent};return id;}
      const attrs={};for(const a of node.attributes)if(attrOK(a.name))attrs[a.name]=a.value;
      const props={};
      if(node.matches('input:not([type=password]),textarea,select,progress'))props.value=node.value;
      if(node.matches('input'))props.checked=node.checked;
      if(node.localName==='canvas')try{props.image=node.toDataURL('image/png');}catch{}
      const children=[...node.childNodes].map(visit).filter(Boolean);
      const shadow=node.shadowRoot?[...node.shadowRoot.childNodes].map(visit).filter(Boolean):null;
      nodes[id]={id,tag:node.localName,ns:node.namespaceURI,attrs,props,children,shadow};return id;
    }
    const root=visit(host),old=caches.get(view),full=!old||revision!==old.revision;
    const changed=full?Object.values(nodes):Object.entries(nodes).filter(([id,n])=>JSON.stringify(n)!==JSON.stringify(old.nodes[id])).map(([,n])=>n);
    const removed=full?[]:Object.keys(old.nodes).filter(id=>!nodes[id]).map(Number);
    const nextRevision=(old?.revision||0)+1;caches.set(view,{nodes,live,revision:nextRevision});
    return {root,full,nodes:changed,removed,revision:nextRevision};
  }
  function targetFor(r){
    if(!['config','radar','analytics'].includes(r.view)||!Number.isSafeInteger(r.node))throw Error('Control inválido');
    const t=caches.get(r.view)?.live.get(r.node);if(!t?.isConnected||t.nodeType!==1||t.disabled||t.closest('[inert]'))throw Error('Control vencido o no disponible');
    // Only controls from the last serialized view, never selectors or arbitrary page nodes.
    if(!t.matches('button,input:not([type=password]),select,textarea,summary'))throw Error('Acción no permitida');
    return t;
  }
  let busy=false;
  async function handle(r){
    if(!r||typeof r!=='object'||typeof r.op!=='string')throw Error('Mensaje inválido');
    if(r.op==='hello')return {ok:true,status:status()};
    if(r.op==='connect'){
      const s=session();if(r.generation!==s.generation)throw Error('Cambió la sesión');
      // Explicit reconnection takes ownership and discards any old draft.
      // Old panels keep their invalid lease and cannot submit pending controls.
      modules.get('config')?.actions.settings(false);
      lease=crypto.randomUUID();caches.clear();return {ok:true,lease,status:status()};
    }
    check(r);
    if(r.op==='disconnect'){modules.get('config')?.actions.settings(false);lease=null;caches.clear();return {ok:true};}
    if(r.op==='read'){
      if(!['config','radar','analytics'].includes(r.view))throw Error('Vista inválida');
      return {ok:true,status:status(),view:serialize(r.view,r.revision)};
    }
    if(r.op==='open'){
      if(r.view==='config')modules.get('config')?.actions.open();
      else if(r.view==='analytics')modules.get('analytics')?.actions.open();
      else if(r.view!=='radar')throw Error('Vista inválida');
      return {ok:true,status:status()};
    }
    if(r.op==='action'){
      if(r.action==='gold')throw Error('Golden hunt no disponible');
      if(!['play','overlay'].includes(r.action))throw Error('Acción inválida');
      if(r.action==='overlay'){if(typeof r.value!=='boolean')throw Error('Valor inválido');overlay=r.value;hide();if(overlay)modules.get('radar')?.actions.map(true);}
      else{const h=modules.get('helper');if(!h)throw Error('Helper no disponible');if(r.action==='play')h.actions.toggle();}
      return {ok:true,status:status()};
    }
    if(r.op==='event'){
      const t=targetFor(r);
      function selection(){
        if(!r.selection)return;
        const selected=targetFor({...r,node:r.selection.node}),{start,end}=r.selection;
        if(!selected.matches('textarea,input[type=text],input:not([type])')||![start,end].every(Number.isInteger)||start<0||end<start||end>selected.value.length)throw Error('Selección inválida');
        selected.setSelectionRange(start,end);
      }
      if(r.event==='click'){
        if(t.classList.contains('remove-name'))selection();
        if(r.view==='analytics'&&t.classList.contains('clear')){if(r.confirmed!==true)throw Error('Falta confirmar borrado');modules.get('analytics')?.actions.clearHistory(true);}
        else t.click();
      }
      else if(['input','change'].includes(r.event)&&t.matches('input:not([type=checkbox]):not([type=radio]),textarea,select')){
        if(typeof r.value!=='string'||r.value.length>12000)throw Error('Valor inválido');t.value=r.value;selection();t.dispatchEvent(new Event(r.event,{bubbles:true,composed:true}));
      }else if(r.event==='keydown'&&r.key==='Enter'&&t.matches('input.new-name')){selection();t.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,composed:true}));}
      else throw Error('Evento no permitido');
      return {ok:true,status:status()};
    }
    throw Error('Operación inválida');
  }
  window.addEventListener('message',async event=>{
    const m=event.data;if(event.source!==window||event.origin!==location.origin||m?.bridge!=='mu-panel-v1'||m.direction!=='request'||typeof m.channel!=='string'||!Number.isSafeInteger(m.id))return;
    let result;
    if(busy)result={ok:false,error:'Otra operación en curso'};
    else{busy=true;try{result=await handle(m.request);}catch(error){result={ok:false,error:error.message};}finally{busy=false;}}
    window.postMessage({bridge:'mu-panel-v1',direction:'response',channel:m.channel,id:m.id,result},location.origin);
  });
})();
