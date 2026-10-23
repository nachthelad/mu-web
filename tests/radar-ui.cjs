// Run with Playwright available in NODE_PATH: node tests/radar-ui.cjs
const {chromium}=require('../scripts/browser-runtime.cjs');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    const page=await browser.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../demos/radar/preview.html')).href);
    const radar=page.locator('#mu-golden-radar');
    assert.equal(await radar.count(),1);
    for(let floor=1;floor<=6;floor++){
      await page.evaluate(map=>{window.__world.mapIndex=map;},23+floor);
      await page.waitForFunction(name=>document.getElementById('mu-golden-radar').shadowRoot.querySelector('.mapline').textContent.startsWith(name),`Kalima ${floor}`);
      assert.equal(await radar.locator('.kalima-reference').isVisible(),true);
      assert.match(await radar.locator('.kalima-reference').innerText(),/Spawn de referencia: 26, 76.*sin confirmar.*No indica si está vivo/);
    }
    await page.evaluate(()=>{window.__world.netObjsQuery.entities=[{netId:501,npcType:275,transform:{pos:{x:32,z:88}}}];});
    await page.waitForFunction(()=>document.getElementById('mu-golden-radar').shadowRoot.querySelector('.rows').textContent.includes('Kundun'));
    assert.match(await radar.locator('.rows').innerText(),/Kundun[\s\S]*32, 88[\s\S]*ahora/);
    assert.equal(await page.evaluate(()=>{let radar;const listener=e=>{if(e.detail.id==='radar')radar=e.detail;};window.addEventListener('mu-hub:register',listener);window.dispatchEvent(new CustomEvent('mu-hub:discover'));window.removeEventListener('mu-hub:register',listener);return radar.actions.huntingData().live.length;}),0);
    await page.screenshot({path:'docs/screenshots/kalima-radar.png'});
    await page.evaluate(()=>{window.__world.netObjsQuery.entities[0].dying=true;});
    await page.waitForFunction(()=>!document.getElementById('mu-golden-radar').shadowRoot.querySelector('.rows').textContent.includes('Kundun'));
    await page.reload();
    assert.equal(await radar.locator('.kalima-reference').isVisible(),false);
    for(const [map,name] of [[33,'Aida'],[83,'Arena 2'],[84,'Arena 3'],[85,'Arena 4'],[6,'Arena'],[999,'Mapa 999'],[0,'Lorencia']]){
      await page.evaluate(map=>{window.__world.mapIndex=map;},map);
      await page.waitForFunction(name=>document.getElementById('mu-golden-radar').shadowRoot.querySelector('.mapline').textContent===`${name} · 125, 128`,name);
    }
    const origin=await radar.boundingBox();
    await radar.locator('.move-toggle').click();
    const handle=await radar.locator('header .mapline').boundingBox();
    await page.mouse.move(handle.x+5,handle.y+5);await page.mouse.down();await page.mouse.move(handle.x+65,handle.y+35,{steps:5});await page.mouse.up();
    const moved=await radar.boundingBox();assert.equal(Math.round(moved.x-origin.x),60);
    await radar.locator('.move-toggle').click();await page.reload();
    assert.equal(Math.round((await radar.boundingBox()).x),Math.round(moved.x));
    await page.screenshot({path:'docs/screenshots/radar-current.png'});
    assert.equal(await radar.locator('input[type=range]').count(),0);
    assert.equal(await radar.locator('header strong').count(),0);
    assert.equal(await radar.locator('header .status').count(),1);
    assert.equal(await radar.locator('.body').evaluate(e=>getComputedStyle(e).scrollbarWidth),'none');
    await radar.locator('.settings-toggle').click();
    assert.equal(await radar.locator('.settings').isVisible(),true);
    assert.equal(await radar.locator('.include-budge').count(),0);
    assert.equal(await radar.locator('.settings').innerText().then(t=>t.includes('Altura')),false);
    await radar.locator('.settings-toggle').click();
    assert.equal(await radar.locator('.rows .row').count(),3);
    await page.evaluate(()=>{for(const [i,type] of [42,135,136,137].entries())window.__world.netObjsQuery.entities.push({netId:100+i,npcType:type,transform:{pos:{x:120+i,z:130}}});});
    await page.waitForTimeout(600);assert.equal(await radar.locator('.rows .row').count(),3);
    await radar.locator('.settings-toggle').click();
    await radar.locator('.track-white-wizard').check();
    await page.waitForTimeout(600);assert.equal(await radar.locator('.rows .row').count(),6);
    await radar.locator('.track-red-dragon').check();
    await page.waitForTimeout(600);assert.equal(await radar.locator('.rows .row').count(),7);
    assert.equal(await radar.locator('.rows .row').filter({hasText:'Red Dragon'}).evaluate(e=>e.style.color),'rgb(255, 115, 115)');
    await page.screenshot({path:'docs/screenshots/invasion-tracking-preview.png'});
    await radar.locator('.track-white-wizard').uncheck();await radar.locator('.track-red-dragon').uncheck();
    await radar.locator('.settings-toggle').click();
    await page.waitForTimeout(600);assert.equal(await radar.locator('.rows .row').count(),3);
    await page.locator('[data-action=start]').click();
    await page.waitForFunction(()=>document.getElementById('mu-golden-radar').shadowRoot.querySelector('.status').textContent.includes('confirmada'));
    await page.locator('[data-action=scope]').click();
    await page.waitForFunction(()=>document.getElementById('mu-golden-radar').shadowRoot.querySelector('.rows').textContent.includes(' s'));
    await page.locator('[data-action=map]').click();
    await page.waitForFunction(()=>document.getElementById('mu-golden-radar').shadowRoot.querySelector('.mapline').textContent.includes('Devias'));
    assert.equal(await radar.locator('.rows .row').count(),0);
    await page.locator('[data-action=disconnect]').click();
    await page.waitForFunction(()=>document.getElementById('mu-golden-radar').shadowRoot.querySelector('.status').textContent.includes('Sin personaje'));
    await radar.locator('.min').click();
    assert.equal(await radar.locator('.tab').isVisible(),true);
    await radar.locator('.tab').click();
    assert.equal(await radar.locator('.panel').isVisible(),true);
    await radar.locator('.history-toggle').click();
    assert.equal(await radar.locator('.archive').isVisible(),true);
    assert.deepEqual(errors,[]);
    console.log('PASS: radar startup, detections, invasion, scope, map, disconnect, minimize/reopen, history; no JS errors.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
