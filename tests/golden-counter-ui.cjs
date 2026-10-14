const {chromium}=require('../scripts/browser-runtime.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-10T12:00:00Z')});
 await page.goto(pathToFileURL(path.resolve('demos/hub/preview.html')).href);
 const setHud=async(clock,title='')=>{await page.evaluate(({clock,title})=>{let root=document.querySelector('.event-timers');if(!root){root=document.createElement('div');root.className='event-timers';root.innerHTML='<div class="event-row"><span class="event-row-label">Golden Invasion</span><span class="event-row-clock"></span></div>';document.body.append(root);}root.querySelector('.event-row').title=title;root.querySelector('.event-row-clock').textContent=clock;},{clock,title});await page.clock.runFor(1500);};
 const panel=page.locator('#mu-golden-counter'),out=panel.locator('output');
 assert.equal(await panel.isVisible(),false);
 await setHud('6 left','Lorencia: 2\nDevias: 4');assert.equal(await out.innerText(),'6 restantes');assert.match(await out.getAttribute('title'),/Devias: 4/);
 assert.equal(await panel.locator('.map-count').count(),2);assert.equal(await panel.locator('.map-count').nth(0).innerText(),'Lorencia\n2');assert.equal(await panel.locator('.map-count').nth(1).innerText(),'Devias\n4');
 await setHud('4 left','Lorencia: 0\nDevias: 4');assert.equal(await panel.locator('.map-count').nth(0).locator('b').innerText(),'0');
 await setHud('6 left','Lorencia: 2\nDevias: 4');
 assert.equal(await page.locator('#mu-hub header > .toggle').getAttribute('aria-pressed'),'false');
 await page.evaluate(()=>window.__world.netObjsQuery.entities=[]);await page.clock.runFor(500);assert.equal(await out.innerText(),'6 restantes');
 await page.addScriptTag({path:path.resolve('src/extension/page-bridge.js')});assert.equal(await panel.isVisible(),true);assert.equal(await page.locator('#mu-golden-radar').isVisible(),false);
 await page.screenshot({path:'docs/screenshots/golden-counter-preview.png'});
 const origin=await panel.boundingBox();await panel.locator('button').click();const handle=await panel.locator('strong').boundingBox();await page.mouse.move(handle.x+5,handle.y+5);await page.mouse.down();await page.mouse.move(handle.x+105,handle.y+65,{steps:5});await page.mouse.up();const moved=await panel.boundingBox();assert.equal(Math.round(moved.x-origin.x),100);
 await panel.locator('button').click();await page.mouse.move(moved.x+15,moved.y+15);await page.mouse.down();await page.mouse.move(moved.x+65,moved.y+65);await page.mouse.up();assert.equal(Math.round((await panel.boundingBox()).x),Math.round(moved.x));
 await page.reload();await setHud('6 left','Lorencia: 2\nDevias: 4');assert.equal(Math.round((await panel.boundingBox()).x),Math.round(moved.x));assert.equal(await panel.locator('button').getAttribute('aria-pressed'),'true');
 await setHud('3 left','invalid');assert.equal(await out.innerText(),'3 restantes');assert.equal(await out.getAttribute('title'),'');
 assert.equal(await panel.locator('.map-count').count(),0);assert.equal(await panel.locator('.maps').innerText(),'Sin datos por mapa');
 await setHud('0 left');assert.equal(await out.innerText(),'0 restantes');
 await setHud('Active');assert.equal(await out.innerText(),'Sin datos');
 await setHud('Active','Lorencia: 2');assert.equal(await out.innerText(),'Sin datos');
 await setHud('6 left');await page.clock.fastForward(901000);assert.equal(await out.innerText(),'Sin datos');
 await setHud('0:59:00');assert.equal(await panel.isVisible(),false);
 await setHud('4 left');assert.equal(await out.innerText(),'4 restantes');
 await page.evaluate(()=>window.__store.username='another');await page.clock.runFor(500);assert.equal(await panel.isVisible(),false);
 await setHud('2 left');assert.equal(await out.innerText(),'2 restantes');
 await page.evaluate(()=>{document.querySelector('.event-timers').remove();const packet=new DataView(new ArrayBuffer(13));packet.setUint8(3,1);packet.setUint16(4,6);packet.setUint8(6,2);packet.setUint8(7,0);packet.setUint16(8,2);packet.setUint8(10,2);packet.setUint16(11,4);goldDemoHandlers.get('InvasionMonsters').forEach(fn=>fn(packet));});await page.clock.runFor(500);assert.equal(await out.innerText(),'6 restantes');
 await page.clock.fastForward(61000);assert.equal(await out.innerText(),'Sin datos');
 await page.setViewportSize({width:240,height:180});await page.clock.runFor(500);const compact=await panel.boundingBox();assert.ok(compact.x>=0&&compact.y>=0&&compact.x+compact.width<=241);
 await page.evaluate(()=>window.__store.connectionLost=true);await page.clock.runFor(500);assert.equal(await panel.isVisible(),false);
 assert.deepEqual(errors,[]);console.log('PASS golden counter: native totals, extension, pause, stale/missing/zero, new event, identity, drag/lock/persistence.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


