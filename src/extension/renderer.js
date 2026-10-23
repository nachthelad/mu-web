// Safe incremental DOM projection. Never inject HTML, script, URLs or listeners.
const TAGS=new Set('div span p section aside header footer h1 h2 h3 h4 button input textarea select option optgroup label details summary fieldset legend strong b i em small br hr ul ol li table thead tbody tr th td progress canvas svg path circle rect line polyline polygon g title style'.split(' '));
const attrOK=name=>/^(?:id|class|style|role|title|type|name|value|min|max|step|rows|cols|size|placeholder|for|tabindex|disabled|hidden|checked|selected|open|width|height|viewBox|d|fill|stroke|stroke-width|cx|cy|r|x|y|x1|x2|y1|y2|points|aria-[\w-]+|data-[\w-]+)$/.test(name);
// Presentation only: keep the serialized ancestry and original controls intact.
// Grid spans lay out the map editor and its summary without reparenting nodes.
const CSS=`
:host{display:block!important;position:static!important;inset:auto!important;width:100%!important;max-width:100%!important;height:auto!important;max-height:none!important;color-scheme:dark;font:13px Verdana,sans-serif;--external-line:#343c2c;--external-muted:#a4ae98;--external-gold:#ddc58a}
*{box-sizing:border-box;min-width:0}[hidden]{display:none!important}
.window,.panel{width:100%!important;max-width:100%!important;max-height:none!important;box-shadow:none!important;border:0!important;border-radius:0!important;background:transparent!important}
.content{overflow:visible!important;padding:0!important;max-height:none!important}.window>header{display:none!important}
footer{padding:16px 0!important;position:sticky;bottom:0;z-index:5;background:#10130f!important;border-color:var(--external-line)!important}
.launcher,.min,.move-toggle,.settings-toggle,.tab,.tabs{display:none!important}.body{padding:0!important}
button,input,select,textarea{font-size:13px!important}button,input:not([type=checkbox]),select{min-height:36px}button{max-width:100%}input,select,textarea{max-width:100%}button:hover:enabled{border-color:var(--external-gold)}
h3{font-size:15px!important;margin:0 0 12px;color:var(--external-gold)!important}.help,.min-level{font-size:12px!important;line-height:1.65!important;color:var(--external-muted)!important;max-width:75ch}.help{margin:8px 0}
p:empty{display:none!important}canvas,img{max-width:100%}.archive-rows{max-height:420px;overflow:auto}
.provider+.provider{border-color:var(--external-line)!important}.switch{gap:16px;margin:0;padding:10px 0;min-height:44px}.switch input{margin:0}.switch select{width:min(300px,60%)}
details{border-color:var(--external-line)!important;margin-top:16px}summary{font-size:13px!important;padding:12px 0!important}label{line-height:1.5}
:host>div:has(>.account-state){display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:10px 0 18px;margin-bottom:22px;border-bottom:1px solid var(--external-line)}
.account-state{margin:0!important}.import-legacy{font-size:12px!important;background:transparent;border-color:var(--external-line)}

/* Map editor: two main tracks, one summary track. No DOM relocation. */
#level-panel:has(>.map-leveling:not([hidden])){display:grid;grid-template-columns:minmax(210px,.85fr) minmax(260px,1.15fr) minmax(250px,300px);column-gap:28px;row-gap:12px;align-items:start}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling{display:contents}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>h3:first-of-type{grid-column:1/3;grid-row:1}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>p.help:not(.map-min):first-of-type{grid-column:1/3;grid-row:2;margin:0}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>label{grid-column:1;grid-row:3;display:grid;gap:6px;align-self:end}
.map-select{margin:0!important;min-height:38px}
#level-panel:has(>.map-leveling:not([hidden])) .map-settings{grid-column:2;grid-row:3;display:flex;flex-direction:row;align-items:end;gap:24px}
.map-settings .switch{justify-content:flex-start;padding:0;min-height:38px;flex:1}.map-settings label:not(.switch){flex:0 0 100px}.map-settings input[type=number]{max-width:100%!important}
#level-panel:has(>.map-leveling:not([hidden])) .map-min{grid-column:1/3;grid-row:4;margin:0}
#level-panel:has(>.map-leveling:not([hidden])) .map-summary{grid-column:1/3;grid-row:5;border:0;border-top:1px solid var(--external-line);padding:12px 0 0;margin:0;line-height:1.6}
#level-panel:has(>.map-leveling:not([hidden])) .map-spots{grid-column:1/3;grid-row:6/10}
.map-spot{display:grid;grid-template-columns:140px 190px minmax(0,1fr);column-gap:24px;align-items:center;border:0!important;border-bottom:1px solid var(--external-line)!important;border-radius:0!important;padding:12px 0!important;margin:0!important}
.map-spot>.switch{margin:0!important;padding:0;justify-content:flex-start}.spot-coords{gap:12px!important}.spot-coords label{display:flex;align-items:center;gap:8px!important;font-size:12px}.spot-coords input{width:100%;min-width:0}.spot-actions{margin:0!important;gap:8px!important;justify-content:flex-end}.spot-actions button{padding:8px 10px;font-size:12px!important}.spot-capture{grid-column:2/-1;margin:8px 0 0!important}
#level-panel:has(>.map-leveling:not([hidden])) .map-add{grid-column:1/3;grid-row:10;justify-self:start}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>.map-add + p.help{grid-column:1/3;grid-row:11;margin:0}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>h3:nth-of-type(2){grid-column:3;grid-row:1}
#level-panel:has(>.map-leveling:not([hidden])) .map-plan{grid-column:3;grid-row:2/4;line-height:1.9;margin:0;padding-bottom:16px;border-bottom:1px solid var(--external-line);overflow-wrap:anywhere}
#level-panel:has(>.map-leveling:not([hidden]))>.switch:has(.auto-reset){grid-column:3;grid-row:4}
#level-panel:has(>.map-leveling:not([hidden]))>.switch:has(.soul-shield){grid-column:3;grid-row:5}
#level-panel:has(>.map-leveling:not([hidden]))>.buff-state{grid-column:3;grid-row:6}
#level-panel:has(>.map-leveling:not([hidden]))>.autosave-state{grid-column:3;grid-row:7;margin:0}
#level-panel:has(>.map-leveling:not([hidden])) .migration-note{grid-column:3;grid-row:8}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>details{grid-column:1/3;grid-row:12;margin:0}
#level-panel:has(>.map-leveling:not([hidden]))>.level-recovery{grid-column:1/-1;grid-row:13;margin:0}

/* Existing destination rows and secondary hunt preferences. */
#goldens-panel{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:12px 40px;align-items:start}
#goldens-panel>.tab-title{grid-column:1;grid-row:1;margin:0}#goldens-panel>p.help:first-of-type{grid-column:1;grid-row:2;margin:0}
.gold-steps{grid-column:1;grid-row:3/6}.gold-step{display:grid;grid-template-columns:minmax(0,1fr) 130px;gap:24px;align-items:end;border:0!important;border-bottom:1px solid var(--external-line)!important;border-radius:0!important;padding:12px 0!important;margin:0!important}.gold-step .step-head{margin:0}.gold-step .range{display:grid;gap:4px;font-size:12px}.gold-step .range input{width:100%}.gold-step .step-head button{min-width:36px}
.add-gold{grid-column:1;grid-row:6;justify-self:start}.gold-options{grid-column:2;grid-row:1/6}.gold-options .switch{border-bottom:1px solid var(--external-line)}.gold-info{grid-column:2;grid-row:6}#goldens-panel>p.help:last-child{grid-column:1/-1;grid-row:7}

/* Loot categories and names remain one original form, laid out in columns. */
#obtain-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,320px);gap:12px 40px;align-items:start}
#obtain-panel>.tab-title{grid-column:1;grid-row:1;margin:0}#obtain-panel>.switch:has(.excellent-loot){grid-column:2;grid-row:1}
#obtain-panel>.range{grid-column:2;grid-row:2;flex-wrap:wrap}#obtain-panel>.switch:has([data-loot=all]){grid-column:1;grid-row:2;max-width:300px}
#obtain-panel>.categories{grid-column:1;grid-row:3;grid-template-columns:repeat(4,minmax(0,1fr));gap:0 24px}#obtain-panel .categories .switch{justify-content:space-between;border-bottom:1px solid var(--external-line)}
.names-section{grid-column:1;grid-row:4;border:0;margin:0}.names-section>summary{border-top:1px solid var(--external-line)}.names-section>.switch{max-width:300px}.names-section>.categories{display:flex;gap:32px;flex-wrap:wrap}.names-section>.categories .switch{gap:24px}.excellent-names{min-height:120px;line-height:1.6}.extra-entry{gap:8px}
#loot-help{grid-column:2;grid-row:3/5;margin:0}.loot-state{grid-column:1/-1;grid-row:5}

/* Small sections stay simple; tracking and styles use functional columns. */
#party-panel{display:grid;grid-template-columns:repeat(2,minmax(0,360px));gap:12px 48px}#party-panel>h3{grid-column:1/-1;margin:0}#party-panel>.switch{border-bottom:1px solid var(--external-line)}
#appearance-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px 40px;align-items:start}
#appearance-panel>h3:first-child{grid-column:1;grid-row:1;margin:0}.tracking-slot{grid-column:1;grid-row:2/7}
#appearance-panel>.styles-title{grid-column:2;grid-row:1;border:0;margin:0;padding:0}
#appearance-panel>.switch:has(.hide-helmet){grid-column:2;grid-row:2}#appearance-panel>.helmet-state{grid-column:2;grid-row:3}
#appearance-panel>.switch:has(.wing-style){grid-column:2;grid-row:4}#appearance-panel>.wing-state{grid-column:2;grid-row:5}#appearance-panel>.help{grid-column:2;grid-row:6;margin:0}
#stats-panel{display:flex;flex-direction:column;gap:8px;max-width:520px}#stats-panel>.stats-option{width:100%;border-bottom:1px solid var(--external-line)}.window:has(#stats-panel:not([hidden]))>footer{display:none!important}.stats-help{flex:none}.stats-help>summary{padding:0!important}.stats-help>p{color:var(--external-gold);margin:0}#stats-panel>h3{grid-column:1/-1;margin:0}#stats-panel>.help{margin:0}#stats-panel>.switch{border-bottom:1px solid var(--external-line)}

@media(max-width:1250px){
.map-spot{grid-template-columns:120px 160px minmax(0,1fr);gap:16px}.spot-actions button{font-size:11px!important;padding:7px}.map-settings{gap:12px!important}
#level-panel:has(>.map-leveling:not([hidden])){grid-template-columns:minmax(180px,.85fr) minmax(230px,1.15fr) 260px;column-gap:20px}
#obtain-panel>.categories{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:1050px){
#level-panel:has(>.map-leveling:not([hidden])){grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px 24px}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>h3:nth-of-type(2){grid-column:1/-1;grid-row:12;margin-top:16px}
#level-panel:has(>.map-leveling:not([hidden])) .map-plan{grid-column:1/-1;grid-row:13;max-width:none}
#level-panel:has(>.map-leveling:not([hidden]))>.switch:has(.auto-reset){grid-column:1;grid-row:14}
#level-panel:has(>.map-leveling:not([hidden]))>.switch:has(.soul-shield){grid-column:2;grid-row:14}
#level-panel:has(>.map-leveling:not([hidden]))>.buff-state{grid-column:1/-1;grid-row:15}
#level-panel:has(>.map-leveling:not([hidden]))>.autosave-state{grid-column:1/-1;grid-row:16}
#level-panel:has(>.map-leveling:not([hidden])) .migration-note{grid-column:1/-1;grid-row:17}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>details{grid-column:1/-1;grid-row:18}
#level-panel:has(>.map-leveling:not([hidden]))>.level-recovery{grid-column:1/-1;grid-row:19}
#goldens-panel,#obtain-panel{grid-template-columns:minmax(0,1fr) 280px;column-gap:24px}
.gold-step{grid-template-columns:minmax(0,1fr);gap:8px}.gold-step .range{display:flex;justify-content:flex-end;gap:12px}.gold-step .range span{flex:0 1 auto}.gold-step .range input{width:92px}
}
@media(max-width:700px){
:host>div:has(>.account-state){gap:8px;margin-bottom:16px;padding-bottom:16px}.import-legacy{font-size:11px!important}
#level-panel:has(>.map-leveling:not([hidden])) .map-settings{grid-column:1/-1;grid-row:4;justify-content:space-between}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>label{grid-column:1/-1}
#level-panel:has(>.map-leveling:not([hidden])) .map-min{grid-row:5}#level-panel:has(>.map-leveling:not([hidden])) .map-summary{grid-row:6}
#level-panel:has(>.map-leveling:not([hidden])) .map-spots{grid-row:7/10}
.map-spot{grid-template-columns:minmax(90px,1fr) minmax(150px,1fr);gap:12px}.map-spot>.switch{justify-content:space-between}.spot-actions{grid-column:1/-1;justify-content:flex-start}.spot-capture{grid-column:1/-1}.spot-actions button{font-size:12px!important;padding:8px}
#level-panel:has(>.map-leveling:not([hidden]))>.switch:has(.auto-reset){grid-column:1/-1;grid-row:14}
#level-panel:has(>.map-leveling:not([hidden]))>.switch:has(.soul-shield){grid-column:1/-1;grid-row:15}
#level-panel:has(>.map-leveling:not([hidden]))>.buff-state{grid-row:16}#level-panel:has(>.map-leveling:not([hidden]))>.autosave-state{grid-row:17}#level-panel:has(>.map-leveling:not([hidden])) .migration-note{grid-row:18}
#level-panel:has(>.map-leveling:not([hidden]))>.map-leveling>details{grid-row:19}#level-panel:has(>.map-leveling:not([hidden]))>.level-recovery{grid-row:20}
#goldens-panel,#obtain-panel,#party-panel,#appearance-panel,#stats-panel{display:flex;flex-direction:column;gap:12px}
#goldens-panel>*,#obtain-panel>*,#party-panel>*,#appearance-panel>*,#stats-panel>*{width:100%}.gold-steps{order:0}.add-gold{align-self:flex-start;width:auto!important}.gold-options{order:1}.gold-info{order:2}#goldens-panel>p.help:last-child{order:3}
.gold-step{gap:8px;grid-template-columns:minmax(0,1fr);padding:10px 0!important}.step-head{flex-wrap:wrap}.step-head select{min-width:100px}
.gold-step .step-head{display:grid;grid-template-columns:22px minmax(0,1fr) repeat(3,32px);gap:4px}.gold-step .step-head select{min-width:0}.gold-step .step-head button{min-width:32px;padding:4px}.gold-step .range{display:flex;justify-content:flex-end;gap:12px}.gold-step .range span{flex:0 1 auto}.gold-step .range input{width:92px}
#obtain-panel>.categories{grid-template-columns:repeat(2,minmax(0,1fr));gap:0 16px}.names-section>.categories{gap:8px 24px}.tracking-slot{padding-bottom:16px;border-bottom:1px solid var(--external-line)}
.switch{min-height:44px}.switch select{width:60%}.map-settings label:not(.switch){flex-basis:90px}
}
`;
export class Renderer{
  constructor(container,send){this.container=container;this.send=send;this.nodes=new Map();this.data=new Map();this.bound=new WeakSet();this.styles=new WeakMap();this.ids=new WeakMap();this.pending=new Map();this.sequence=0;this.textControl=null;}
  clear(){this.container.replaceChildren();this.nodes.clear();this.data.clear();this.pending.clear();this.textControl=null;}
  acknowledge(event){if(this.pending.get(event.node)===event.editToken)this.pending.delete(event.node);}
  tabs(){return [...this.nodes.values()].filter(n=>n.nodeType===1&&n.matches('[data-tab]')).map(n=>({id:n.dataset.tab,label:n.textContent.trim(),selected:n.getAttribute('aria-selected')==='true'}));}
  configurationOpen(){return [...this.nodes.values()].some(n=>n.nodeType===1&&n.matches('.window')&&!n.hidden);}
  statsMode(enabled){for(const n of this.nodes.values())if(n.nodeType===1&&n.matches('footer')){if(enabled)n.style.setProperty('display','none','important');else n.style.removeProperty('display');}}
  selectTab(id){const n=[...this.nodes.values()].find(n=>n.nodeType===1&&n.dataset?.tab===id);if(n)n.click();}
  cancel(){for(const n of this.nodes.values())if(n.nodeType===1&&n.matches('button.cancel')){n.click();return;}}
  selection(){const t=this.textControl;if(!t?.isConnected||!Number.isInteger(t.selectionStart))return undefined;return {node:this.ids.get(t),start:t.selectionStart,end:t.selectionEnd};}
  bind(root){
    if(this.bound.has(root))return;this.bound.add(root);
    const target=e=>{const origin=e.composedPath()[0],t=origin.closest?.('button,input,select,textarea,summary')||origin;return {t,id:this.ids.get(t)};};
    root.addEventListener('focusin',e=>{const {t}=target(e);if(t.matches?.('input,textarea'))this.textControl=t;});
    root.addEventListener('click',e=>{
      if(e.__muForwarded)return;const {t,id}=target(e);if(!id||!t.matches?.('button,input[type=checkbox],input[type=radio],summary'))return;
      e.__muForwarded=true;e.preventDefault();e.stopPropagation();
      if(t.classList.contains('clear')&&!confirm('¿Borrar todas las mediciones de Analytics? Exportá antes si querés conservarlas.'))return;
      this.send({node:id,event:'click',confirmed:t.classList.contains('clear'),selection:this.selection()});
    });
    for(const event of ['input','change'])root.addEventListener(event,e=>{
      if(e.__muForwarded)return;const {t,id}=target(e);if(!id||!t.matches?.('input:not([type=checkbox]):not([type=radio]),textarea,select'))return;
      e.__muForwarded=true;e.stopPropagation();const editToken=++this.sequence;this.pending.set(id,editToken);this.send({node:id,event,value:t.value,editToken,selection:this.selection()});
    });
    root.addEventListener('keydown',e=>{
      if(e.__muForwarded)return;const {t,id}=target(e);if(!id)return;
      if(t.matches?.('[data-tab]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
        const tabs=[...t.parentNode.querySelectorAll('[data-tab]')],index=tabs.indexOf(t),next=e.key==='Home'?tabs[0]:e.key==='End'?tabs.at(-1):tabs[(index+(e.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length];e.__muForwarded=true;e.preventDefault();e.stopPropagation();next.focus();next.click();return;
      }
      if(t.matches?.('input[data-map-search]')&&['ArrowUp','ArrowDown','Enter','Escape'].includes(e.key)){
        if(e.isComposing||e.key==='Escape'&&t.getAttribute('aria-expanded')!=='true')return;
        e.__muForwarded=true;e.preventDefault();e.stopPropagation();this.send({node:id,event:'keydown',key:e.key,selection:this.selection()});return;
      }
      if(e.key!=='Enter'||!t.matches?.('input.new-name'))return;e.__muForwarded=true;e.preventDefault();e.stopPropagation();this.send({node:id,event:'keydown',key:'Enter',selection:this.selection()});
    });
  }
  apply(view){
    if(view.full)this.clear();
    // Removing a focused field can emit change synchronously. Its original
    // control is already gone, so invalidate every removed ID before detaching.
    for(const id of view.removed){const n=this.nodes.get(id);if(n)this.ids.delete(n);this.pending.delete(id);}
    for(const id of view.removed){this.nodes.get(id)?.remove();this.nodes.delete(id);this.data.delete(id);}
    for(const d of view.nodes)this.data.set(d.id,d);
    const render=id=>{
      const d=this.data.get(id);if(!d)return null;
      let n=this.nodes.get(id);
      if(Object.hasOwn(d,'text')){if(!n){n=document.createTextNode(d.text);this.nodes.set(id,n);}else if(n.textContent!==d.text)n.textContent=d.text;return n;}
      if(!TAGS.has(d.tag))return null;
      if(!n){n=d.tag==='canvas'?document.createElement('img'):document.createElementNS(d.ns==='http://www.w3.org/2000/svg'?d.ns:'http://www.w3.org/1999/xhtml',d.tag);this.nodes.set(id,n);this.ids.set(n,id);}
      for(const a of [...n.attributes])if(attrOK(a.name)&&!Object.hasOwn(d.attrs,a.name))n.removeAttribute(a.name);
      for(const [key,value] of Object.entries(d.attrs))if(attrOK(key)&&n.getAttribute(key)!==value)n.setAttribute(key,value);
      if(d.tag==='canvas'){n.alt=d.attrs['aria-label']||'Radar';n.style.cssText='display:block;width:100%;max-width:512px;height:auto;margin:auto';if(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(d.props.image||'')&&n.src!==d.props.image)n.src=d.props.image;}
      function children(parent,list){const wanted=list.map(render).filter(Boolean);for(let i=0;i<wanted.length;i++)if(parent.childNodes[i]!==wanted[i])parent.insertBefore(wanted[i],parent.childNodes[i]||null);for(const child of [...parent.childNodes])if(!wanted.includes(child))child.remove();}
      children(n,d.children);
      if(d.shadow){const shadow=n.shadowRoot||n.attachShadow({mode:'open'});children(shadow,d.shadow);let style=this.styles.get(shadow);if(!style){style=document.createElement('style');style.textContent=CSS;this.styles.set(shadow,style);}shadow.append(style);this.bind(shadow);}
      if(Object.hasOwn(d.props,'checked'))n.checked=!!d.props.checked;
      if(Object.hasOwn(d.props,'value')&&!(this.pending.has(id)&&n.getRootNode().activeElement===n)&&n.value!==d.props.value)n.value=d.props.value;
      return n;
    };
    const root=render(view.root);if(root&&this.container.firstChild!==root)this.container.replaceChildren(root);this.bind(this.container);
    // Game-only position styles must not position the root outside the panel.
    if(root){root.style.cssText='display:block;position:static;width:100%;height:auto';root.removeAttribute('data-hub');root.removeAttribute('data-hub-settings-open');root.classList.remove('collapsed');}
  }
}
