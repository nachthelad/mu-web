// ==UserScript==
// @name         MU · Interfaz
// @namespace    mu.mormon.garden.addons
// @version      1.1.0
// @description  Barra clásica adaptable sin dragones, conservando controles y orbes nativos.
// @match        https://mu.mormon.garden/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';
  if (document.getElementById('mu-interface-style')) return;
  const METAL_TEXTURE = 'data:image/webp;base64,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'; // embedded-generated-texture
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
    background:#141518 url("${typeof METAL_TEXTURE === 'string' ? METAL_TEXTURE : ''}") repeat-x left top / 144px 48px;
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
  function offset(x) { return x < 200 ? 45 : x >= 437 ? -40 : 0; }
  function decorate(bar) {
    // Keep the native painted wells, key labels and menu icons. Only split
    // decorative tiles into three regions; never clone a control or listener.
    const tiles = [...bar.children].filter(n => n.classList.contains('v097d-tile'));
    for (const tile of tiles) {
      const x = Number.parseFloat(tile.style.left), w = Number.parseFloat(tile.style.width);
      if (!Number.isFinite(x) || !Number.isFinite(w)) continue;
      for (const [start, end, adjustment] of [[0,160,45],[200,437,0],[477,640,-40]]) {
        const from = Math.max(start,x), to = Math.min(end,x+w);
        if (from >= to) continue;
        const key = `${x}-${start}`;
        let frame = bar.querySelector(`.mui-orb-frame[data-region="${key}"]`);
        if (!frame) {
          frame = document.createElement('div');frame.className = 'mui-orb-frame';
          frame.dataset.region = key;frame.dataset.adjustment = String(adjustment);frame.setAttribute('aria-hidden','true');
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
    // Reserve a left gutter for the game's chat toggle, including narrow views.
    const gutter = Math.min(56,viewport*0.1);
    const scale = Math.min(native, (viewport-2*gutter) / 640);
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
      const shift = node.classList.contains('v097d-skill-slot') ? 0 : extra/2 +
        (node.classList.contains('mui-orb-frame') ? Number(node.dataset.adjustment) : offset(x));
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
