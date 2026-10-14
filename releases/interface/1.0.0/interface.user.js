// ==UserScript==
// @name         MU · Interfaz
// @namespace    mu.mormon.garden.addons
// @version      1.0.0
// @description  Barra clásica adaptable sin dragones, conservando controles y orbes nativos.
// @match        https://mu.mormon.garden/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';
  if (document.getElementById('mu-interface-style')) return;
  let enabled = true;
  const tracked = new Set();
  const style = document.createElement('style');
  style.id = 'mu-interface-style';
  style.textContent = `
  .v097d-bottom-bar[data-mu-interface] {
    left:0!important;width:var(--mui-width)!important;
    transform:scale(var(--mui-scale))!important;transform-origin:0 100%!important;
    overflow:visible!important;
  }
  .v097d-bottom-bar[data-mu-interface]::before {
    content:"";position:absolute;left:0;right:0;top:45px;bottom:0;
    background:linear-gradient(#393a3d,#17191d 16%,#101215 80%,#27292d);
    box-shadow:inset 0 1px #8c8166,inset 0 -1px #6b624f;
    pointer-events:none;
  }
  .v097d-bottom-bar[data-mu-interface]>.v097d-corner,
  .v097d-bottom-bar[data-mu-interface]>.v097d-tile,
  .v097d-bottom-bar[data-mu-interface]>.mu-resize-grip {display:none!important}
  .v097d-bottom-bar[data-mu-interface]>[data-mui-shift] {
    translate:var(--mui-shift) 0;
  }
  .v097d-bottom-bar[data-mu-interface]>.v097d-skill-slot {
    left:var(--mui-picker-left)!important;top:var(--mui-picker-top)!important;
  }
  .v097d-bottom-bar[data-mu-interface]>.v097d-potion,
  .v097d-bottom-bar[data-mu-interface]>.v097d-skill-box,
  .v097d-bottom-bar[data-mu-interface]>.v097d-menu-button {
    box-shadow:0 0 0 1px #8c8166;
    border-radius:2px;
  }
  .v097d-bottom-bar[data-mu-interface]>.v097d-potion:hover,
  .v097d-bottom-bar[data-mu-interface]>.v097d-menu-button:hover {
    filter:brightness(1.25);
  }
  .v097d-bottom-bar>.mui-orb-frame {position:absolute;pointer-events:none;display:none}
  .v097d-bottom-bar[data-mu-interface]>.mui-orb-frame {display:block}
  `;
  document.head.append(style);

  function put(node, name, value) {
    if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
  }
  function group(x) { return x < 200 ? 0 : x >= 437 ? 1 : 0.5; }
  function decorate(bar) {
    // Keep the native painted wells, key labels and menu icons. Only split
    // decorative tiles into three regions; never clone a control or listener.
    const tiles = [...bar.children].filter(n => n.classList.contains('v097d-tile'));
    for (const tile of tiles) {
      const x = Number.parseFloat(tile.style.left), w = Number.parseFloat(tile.style.width);
      if (!Number.isFinite(x) || !Number.isFinite(w)) continue;
      for (const [start, end, factor] of [[0,200,0],[200,437,0.5],[437,640,1]]) {
        const from = Math.max(start,x), to = Math.min(end,x+w);
        if (from >= to) continue;
        const key = `${x}-${start}`;
        let frame = bar.querySelector(`.mui-orb-frame[data-region="${key}"]`);
        if (!frame) {
          frame = document.createElement('div');frame.className = 'mui-orb-frame';
          frame.dataset.region = key;frame.dataset.factor = String(factor);frame.setAttribute('aria-hidden','true');
          // Insert behind original fills and controls.
          bar.insertBefore(frame,bar.firstChild);
        }
        const css = getComputedStyle(tile);
        for (const prop of ['background-image','background-size','background-position','background-repeat']) put(frame,prop,css.getPropertyValue(prop));
        put(frame,'width',`${w}px`);put(frame,'height','48px');
        put(frame,'left',`${x}px`);put(frame,'top','45px');
        put(frame,'clip-path',`inset(0 ${x+w-to}px 0 ${from-x}px)`);
      }
    }
  }
  function adapt(bar) {
    tracked.add(bar);
    if (!enabled) {bar.removeAttribute('data-mu-interface');return;}
    // Read the inline native transform: our CSS override never changes it.
    const native = Number(bar.style.transform.match(/scale\(([\d.]+)\)/)?.[1]) || 1;
    const viewport = document.documentElement.clientWidth;
    if (!viewport) return;
    const scale = Math.min(native, viewport / 640);
    const width = viewport / scale;
    const extra = Math.max(0, width - 640);
    put(bar, '--mui-width', `${width}px`);put(bar, '--mui-scale', `${scale}`);
    decorate(bar);
    const picker = [...bar.children].filter(node=>node.classList.contains('v097d-skill-slot'));
    const columns = Math.max(1,Math.min(picker.length,Math.floor((width-16)/32)));
    picker.forEach((node,index)=>{
      const row = Math.floor(index/columns), count = Math.min(columns,picker.length-row*columns);
      put(node,'--mui-picker-left',`${(width-count*32)/2+(index%columns)*32}px`);
      put(node,'--mui-picker-top',`${-17-row*36}px`);
    });
    for (const node of bar.children) {
      if (node.matches('.v097d-tile,.v097d-corner,.mu-resize-grip')) continue;
      // Picker moves as one centered group; its child sprites stay native.
      const x = Number.parseFloat(node.style.left);
      if (!Number.isFinite(x)) continue;
      const shift = extra * (node.classList.contains('v097d-skill-slot') ? 0 :
        node.classList.contains('mui-orb-frame') ? Number(node.dataset.factor) : group(x));
      if (!node.hasAttribute('data-mui-shift')) node.setAttribute('data-mui-shift', '');
      put(node, '--mui-shift', `${shift}px`);
    }
    if (!bar.hasAttribute('data-mu-interface')) bar.setAttribute('data-mu-interface', '');
  }
  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      for (const bar of tracked) if (!bar.isConnected) tracked.delete(bar);
      document.querySelectorAll('.v097d-bottom-bar').forEach(adapt);
    });
  }
  const observer = new MutationObserver(records => {
    if (records.some(r => r.type === 'childList' ?
      r.target.closest?.('.v097d-bottom-bar') || [...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.v097d-bottom-bar')||n.querySelector?.('.v097d-bottom-bar'))) :
      !r.target.classList?.contains('mui-orb-frame') && r.target.closest?.('.v097d-bottom-bar'))) schedule();
  });
  observer.observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  window.addEventListener('resize', schedule);
  window.addEventListener('mu-interface:toggle', event => {
    enabled = typeof event.detail?.enabled === 'boolean' ? event.detail.enabled : !enabled;
    schedule();
  });
  schedule();
})();
