// Local fixture: simulated dialogs, audited calculation and MobX. No account.
const fixture=window.__CHARACTER_CLIENT_FIXTURE__,nativeStats=fixture.nativeFixture(),mobx=fixture.mobxFixture();
window.__STATS_DEMO_NATIVE__=nativeStats;window.__STATS_DEMO_COMPATIBLE__=true;
Object.assign(window.__store.playerData,{name:'SoulMaster',charClass:2,level:400,str:65535,agi:65535,sta:65535,eng:65535,leadership:0,items:Array(12).fill(null),maxHP:100000,maxMP:100000,maxSD:100000,maxAG:100000});
const archangel={group:5,num:10,lvl:0,isExcellent:false,optionLevel:0,excellentFlags:0},kundun={group:5,num:11,lvl:13,isExcellent:true,optionLevel:4,excellentFlags:32};
window.__store.playerData.items[nativeStats.catalogue[0].ItemSlot]=archangel;
window.__store=mobx.observable({...window.__store,characterInfoEnabled:false,inventoryEnabled:false,skillListEnabled:false,spritesLoading:false});
const windowOrder=[];
const classicSkin=new URL(location.href).searchParams.get('skin')==='v097d';
// Native window drag/persistence scaffolding. Helper must never overwrite it.
function placeDemoWindow(element,key){
 const scale=Math.min(innerWidth<850?1:1.5,(innerHeight-36)/element.offsetHeight,(innerWidth-24)/element.offsetWidth),width=element.offsetWidth*scale,height=element.offsetHeight*scale;
 let position;try{position=JSON.parse(localStorage.getItem('mu.native-window.demo.'+key));}catch{}
 const x=Math.max(12,Math.min(position?.x??(key==='characterInfoEnabled'?12:innerWidth-width-12),innerWidth-width-12)),y=Math.max(12,Math.min(position?.y??12,innerHeight-height-12));
 element.style.cssText+=';right:auto;bottom:auto;left:'+x+'px;top:'+y+'px;transform:scale('+scale+');transform-origin:0 0;';
}
function bindDemoWindow(element,key){
 placeDemoWindow(element,key);const header=element.querySelector('header');header.style.cursor='grab';header.style.touchAction='none';
 header.addEventListener('pointerdown',event=>{if(event.button!==0||event.target.closest('button'))return;const rect=element.getBoundingClientRect(),x=event.clientX,y=event.clientY;header.setPointerCapture(event.pointerId);event.preventDefault();
 const move=e=>{if(e.pointerId!==event.pointerId)return;const left=Math.max(12,Math.min(rect.left+e.clientX-x,innerWidth-rect.width-12)),top=Math.max(12,Math.min(rect.top+e.clientY-y,innerHeight-rect.height-12));element.style.left=left+'px';element.style.top=top+'px';};
 const end=e=>{if(e.pointerId!==event.pointerId)return;localStorage.setItem('mu.native-window.demo.'+key,JSON.stringify({x:parseFloat(element.style.left),y:parseFloat(element.style.top)}));header.removeEventListener('pointermove',move);header.removeEventListener('pointerup',end);header.removeEventListener('pointercancel',end);};
 header.addEventListener('pointermove',move);header.addEventListener('pointerup',end);header.addEventListener('pointercancel',end);
 });
}
window.addEventListener('resize',()=>{for(const [key,selector]of [['characterInfoEnabled','.character-info,.v097d-character'],['inventoryEnabled','.inventory,.v097d-inventory']]){const element=document.querySelector(selector);if(element)placeDemoWindow(element,key);}});
function renderNativeDemo(){
 for(const [key,kind,label] of [['characterInfoEnabled','character-info','Character Info C'],['inventoryEnabled','inventory','Inventario V']]){
  const skinClass=classicSkin?(kind==='character-info'?'v097d-character':'v097d-inventory'):kind;
  let element=document.querySelector('.mu-item-window.'+skinClass);
  if(!window.__store[key]){element?.remove();const i=windowOrder.indexOf(key);if(i>=0)windowOrder.splice(i,1);continue;}
  if(!element){element=document.createElement('section');element.className='mu-item-window '+kind;element.tabIndex=-1;element.setAttribute('role','dialog');element.setAttribute('aria-label',label);element.innerHTML='<header>'+label+'<button class="head-close" type="button" aria-label="Cerrar '+label+'">×</button></header>'+(kind==='character-info'?'<p>Soul Master · Nivel 400</p><p>Fuerza: 65535</p><p>Agilidad: 65535</p><p>Vitalidad: 65535</p><p>Energía: 65535</p><p class="native-wizardry"></p><label>Puntos <input aria-label="Puntos" value="1" size="2"></label><button type="button">＋</button>':'<p>Equipo · slot 0</p><div class="staff-slot"></div><div class="inventory-grid">'+Array(48).fill('<span></span>').join('')+'</div>');element.querySelector('.head-close').onclick=()=>mobx.action(()=>window.__store[key]=false);document.body.append(element);windowOrder.push(key);element.focus({preventScroll:true});element.addEventListener('pointerdown',()=>{const i=windowOrder.indexOf(key);if(i>=0)windowOrder.splice(i,1);windowOrder.push(key);});}
  if(classicSkin&&element){element.classList.remove(kind);element.classList.add('v097d-window',skinClass);element.style.height='433px';}
  if(element&&!element.dataset.nativeDrag){element.dataset.nativeDrag='true';bindDemoWindow(element,key);}
 }
 const pd=window.__store.playerData,calculated=nativeStats.calculate({charClass:pd.charClass,level:pd.level,strength:pd.str,agility:pd.agi,vitality:pd.sta,energy:pd.eng,leadership:pd.leadership,items:pd.items});
 const wizardry=document.querySelector('.native-wizardry');if(wizardry)wizardry.textContent='Wizardry Dmg '+calculated.wizardryMin+'–'+calculated.wizardryMax;
 const slot=document.querySelector('.staff-slot');if(slot)slot.textContent=nativeStats.name(pd.items[0])+' +'+pd.items[0].lvl+' · '+nativeStats.itemStats(pd.items[0]).magicPower+'%';
}
for(const key of ['inventoryEnabled','characterInfoEnabled','skillListEnabled'])mobx.reaction(()=>window.__store[key],open=>{if(open)for(const other of ['inventoryEnabled','characterInfoEnabled','skillListEnabled'])if(other!==key&&window.__store[other])mobx.action(()=>window.__store[other]=false);});
mobx.reaction(()=>[window.__store.characterInfoEnabled,window.__store.inventoryEnabled,window.__store.playerData.items[0]],renderNativeDemo);
document.addEventListener('keydown',event=>{if(event.repeat||event.isComposing||event.ctrlKey||event.metaKey||event.target.matches('input,textarea,[contenteditable]'))return;const key=event.code==='KeyC'?'characterInfoEnabled':event.code==='KeyV'?'inventoryEnabled':event.code==='Escape'?windowOrder.at(-1):null;if(key)mobx.action(()=>window.__store[key]=event.code==='Escape'?false:!window.__store[key]);});
for(const [id,key] of [['native-c','characterInfoEnabled'],['native-v','inventoryEnabled']])document.getElementById(id).onclick=()=>mobx.action(()=>window.__store[key]=!window.__store[key]);
document.getElementById('staff-a').onclick=()=>mobx.action(()=>window.__store.playerData.items[0]={...archangel});
document.getElementById('staff-b').onclick=()=>mobx.action(()=>window.__store.playerData.items[0]={...kundun});
