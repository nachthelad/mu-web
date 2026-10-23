import {Renderer} from './renderer.js';
const $=s=>document.querySelector(s),titles={config:'Configuración',radar:'Radar e historial',analytics:'EXP por spot'};
const sectionDescriptions={caza:'Viaje al Balrog Colosal y Home al llegar.',level:'Mapas y spots de tu progresión.',obtain:'Categorías, nombres y condiciones de recogida.',party:'Invitaciones y aceptación automática.',appearance:'Trackeo y estilos en tu pantalla.',stats:''};
let tabId=null,generation=null,lease=null,view='config',revision=0,connected=false,serial=0,queue=Promise.resolve(),polling=false;
const renderer=new Renderer($('#mirror'),event=>enqueue(async()=>{await request({op:'event',view,...event});renderer.acknowledge(event);await read();}));
function error(text=''){$('#error').hidden=!text;$('#error').textContent=text;}
function controls(){for(const id of ['play','overlay','open-view','go-game'])$('#'+id).disabled=!connected;$('#config-section').disabled=!connected||view!=='config';$('#mirror').inert=!connected;$('#connect').textContent=connected?'Desconectar':'Conectar';$('#connect').title=connected?'Desconectar el panel. Play sigue con su estado actual.':'Conectar el panel con la pestaña elegida';}
function offline(text){connected=false;serial++;controls();$('#connection').textContent='Desconectado';$('#connection').dataset.connected='false';error(text);}
function enqueue(fn){queue=queue.then(fn).catch(e=>{if(e.disconnected||/sesión|conexión|disponible|respuesta|receiving end|connection|No tab with id|invalidated/i.test(e.message))offline(e.message);else error(e.message);});return queue;}
async function raw(message){
  const result=await Promise.race([chrome.runtime.sendMessage(message),new Promise((_,reject)=>setTimeout(()=>reject(Error('Sin respuesta. La acción no se reenvió.')),6000))]);
  if(!result?.ok)throw Object.assign(Error(result?.error||'Sin conexión'),{disconnected:!!result?.disconnected});return result;
}
async function request(body){
  if(!connected)throw Error('Sin conexión. Reconectá la sesión.');
  const token=serial,destination=tabId;
  const result=await raw({type:'request',tabId:destination,request:{...body,generation,lease}});
  if(token!==serial||destination!==tabId)throw Error('Respuesta de una sesión anterior descartada');
  if(result.status){if(result.status.generation!==generation)throw Error('Cambió la sesión. Reconectá y revisá el borrador.');paint(result.status);}
  return result;
}
function paint(s){
  const who=s.identity,h=s.helper;
  const incompatible=['unsupported','error'].includes(s.client?.state);
  $('#connection').textContent=incompatible?'Cliente no compatible':who.ready?'Conectado':'Esperando personaje';$('#connection').dataset.connected=String(!incompatible);
  $('#account').textContent=who.account?`${who.world} / ${who.account}`:s.client?.message||'Esperando login';$('#character').textContent=who.character||'—';$('#tab-label').textContent='#'+tabId;
  $('#play').textContent=h?.running?'Ⅱ Pausar Play':'▶ Iniciar Play';$('#play').setAttribute('aria-pressed',String(!!h?.running));$('#play').disabled=!connected||!h||(!h.running&&!h.ready);
  $('#overlay').checked=s.overlay;$('#engine-state').textContent=h?.message||'Esperando motores';
}
async function read(){
  const result=await request({op:'read',view,revision});renderer.apply(result.view);revision=result.view.revision;
  if(view==='config'&&!renderer.configurationOpen()){
    await request({op:'open',view});const reopened=await request({op:'read',view,revision});renderer.apply(reopened.view);revision=reopened.view.revision;
  }
  $('#mirror').hidden=false;$('#empty').hidden=true;
  $('#open-view').hidden=view==='config';
  syncSections();
}
function syncSections(){
  const select=$('#config-section'),tabs=renderer.tabs();$('#section-selector').hidden=view!=='config';
  if(!tabs.length){select.disabled=true;return;}
  if(JSON.stringify([...select.options].map(o=>[o.value,o.textContent]))!==JSON.stringify(tabs.map(t=>[t.id,t.label])))select.replaceChildren(...tabs.map(t=>{const o=document.createElement('option');o.value=t.id;o.textContent=t.label;return o;}));
  const selected=tabs.find(t=>t.selected);if(selected){select.value=selected.id;const stats=view==='config'&&selected.id==='stats';renderer.statsMode(stats);document.querySelector('.page-footer').hidden=stats;if(view==='config'){$('#heading').textContent=selected.label;$('#description').textContent=sectionDescriptions[selected.id]||'';}}select.disabled=!connected;
}
$('#config-section').onchange=()=>{const selected=$('#config-section').value;enqueue(async()=>{await request({op:'open',view:'config'});await read();renderer.selectTab(selected);});};
async function list(){
  const r=await raw({type:'list'}),selected=tabId===null?$('#target').value:String(tabId),select=$('#target');select.replaceChildren();
  for(const t of r.tabs){const o=document.createElement('option');o.value=t.id;o.textContent=`#${t.id} · ${t.title}${t.discarded?' (suspendida)':''}`;o.disabled=t.discarded;select.append(o);}
  if(!r.tabs.length){const o=document.createElement('option');o.value='';o.textContent='Abrí una pestaña de MU';select.append(o);}
  if(r.tabs.some(t=>String(t.id)===selected))select.value=selected;
  if(connected&&!r.tabs.some(t=>t.id===tabId))offline('Se cerró la pestaña del juego. Elegí otra y conectá.');
}
async function disconnect(){
  if(connected)try{await request({op:'disconnect'});}catch{}
  connected=false;serial++;lease=null;generation=null;revision=0;renderer.clear();$('#mirror').hidden=true;$('#empty').hidden=false;$('#open-view').hidden=false;controls();$('#connection').textContent='Desconectado';$('#connection').dataset.connected='false';$('#account').textContent=$('#character').textContent=$('#tab-label').textContent='—';$('#engine-state').textContent='Panel desconectado. Play sigue con su estado actual en el juego.';
}
window.addEventListener('focus',()=>enqueue(list));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)enqueue(list);});
$('#target').addEventListener('focus',()=>enqueue(list));
$('#target').onchange=()=>enqueue(async()=>{await disconnect();tabId=null;$('#connection').textContent='Sin conectar';$('#account').textContent=$('#character').textContent=$('#tab-label').textContent='—';error('Destino cambiado. El borrador anterior se descartó; conectá la nueva sesión.');});
async function connect(){
  const selected=Number($('#target').value);if(!Number.isInteger(selected)||!$('#target').value)throw Error('Abrí el juego y elegí una pestaña.');
  await disconnect();tabId=selected;
  const hello=await raw({type:'request',tabId,request:{op:'hello'}});generation=hello.status.generation;
  const result=await raw({type:'request',tabId,request:{op:'connect',generation}});lease=result.lease;serial++;connected=true;controls();paint(result.status);error();await request({op:'open',view});await read();
}
$('#connect').onclick=()=>enqueue(async()=>{error();if(connected)await disconnect();else await connect();});
$('#refresh').onclick=()=>enqueue(async()=>{await list();await connect();});
for(const button of document.querySelectorAll('[data-view]'))button.onclick=()=>enqueue(async()=>{
  view=button.dataset.view;revision=0;renderer.clear();$('#heading').textContent=titles[view];
  $('#section-selector').hidden=view!=='config';$('#config-section').disabled=true;
  $('#description').textContent={config:'Tus rutas, preferencias y estilo. Todo en un lugar.',radar:'Avistamientos recibidos, mapa e historial del Radar.',analytics:'Medí y compará la experiencia de tus spots.'}[view];
  $('#workspace-label').textContent={config:'AJUSTES DE LA CUENTA',radar:'RADAR EN VIVO',analytics:'MEDICIONES E HISTORIAL'}[view];$('#open-view').textContent='Abrir '+titles[view].toLowerCase();
  for(const b of document.querySelectorAll('[data-view]'))if(b===button)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  if(connected){await request({op:'open',view});await read();}
});
$('#open-view').onclick=()=>enqueue(async()=>{await request({op:'open',view});await read();});
for(const [id,action] of [['play','play']])$('#'+id).onclick=()=>enqueue(async()=>{error();await request({op:'action',action});await read();});
$('#overlay').onchange=()=>enqueue(async()=>{await request({op:'action',action:'overlay',value:$('#overlay').checked});await read();});
$('#go-game').onclick=()=>{if(connected)chrome.tabs.update(tabId,{active:true});};
$('#extension-version').textContent='v'+chrome.runtime.getManifest().version;
$('#update-extension').onclick=()=>$('#update-dialog').showModal();
$('#cancel-update').onclick=()=>$('#update-dialog').close();
$('#confirm-update').onclick=()=>{enqueue(async()=>{const button=$('#confirm-update');button.disabled=true;try{await disconnect();chrome.runtime.reload();}catch(e){button.disabled=false;$('#update-dialog').close();throw e;}});};
window.addEventListener('pagehide',()=>{if(connected)chrome.runtime.sendMessage({type:'request',tabId,request:{op:'disconnect',generation,lease}}).catch(()=>{});});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#update-dialog').open&&connected&&view==='config'){event.preventDefault();renderer.cancel();}});
// Transport refresh only; game engines keep their own original schedulers.
setInterval(()=>{if(!connected||polling||document.hidden)return;polling=true;enqueue(read).finally(()=>{polling=false;});},1000);
controls();enqueue(list);
