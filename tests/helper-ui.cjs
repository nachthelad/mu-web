const {chromium}=require('../scripts/browser-runtime.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install();
  await page.goto(pathToFileURL(path.resolve('demos/helper/preview.html')).href);
  const helper=page.locator('#mu-level-helper');assert.equal(await helper.count(),1);
  const quick=page.locator('#mu-helper-quick-control');
  assert.equal(await quick.count(),1);
  await page.keyboard.press('F10');assert.equal(await quick.locator('.play').getAttribute('aria-pressed'),'true');
  await page.keyboard.down('F10');assert.equal(await quick.locator('.play').getAttribute('aria-pressed'),'false');
  await page.keyboard.down('F10');assert.equal(await quick.locator('.play').getAttribute('aria-pressed'),'false');await page.keyboard.up('F10');
  await page.evaluate(()=>{const i=document.createElement('input');i.id='quick-input';document.body.append(i);i.focus();});
  await page.keyboard.press('F10');assert.equal(await quick.locator('.play').getAttribute('aria-pressed'),'false');
  await page.locator('#quick-input').evaluate(e=>e.remove());
  await page.keyboard.press('Shift+F10');assert.equal(await quick.locator('.play').getAttribute('aria-pressed'),'false');
  await helper.evaluate(e=>e.style.display='none');assert.equal(await quick.isVisible(),true);
  await quick.locator('.play').click();assert.equal(await quick.locator('.play').getAttribute('aria-pressed'),'true');
  await page.keyboard.press('F10');assert.equal(await quick.locator('.play').getAttribute('aria-pressed'),'false');
  await helper.evaluate(e=>e.style.removeProperty('display'));
  const grip=await quick.locator('.grip').boundingBox();await page.mouse.move(grip.x+5,grip.y+5);await page.mouse.down();await page.mouse.move(300,220);await page.mouse.up();
  const saved=await quick.boundingBox();await page.reload();const restored=await quick.boundingBox();assert.equal(restored.x,saved.x);assert.equal(restored.y,saved.y);
  // Mirror the native HUD, including its inline sizes and Interface size scale.
  const mountTimers=()=>page.evaluate(()=>{
    document.querySelector('.event-timers')?.remove();
    const timers=document.createElement('div');timers.className='event-timers';timers.style.cssText='position:fixed;right:8px;top:80px;transform:scale(.8);transform-origin:right top;width:144px';
    timers.innerHTML=[['Blood Castle','59:20'],['Devil Square','30:20'],['Chaos Castle','10:10'],['Golden Invasion','Active']].map(([name,time])=>`<div class="event-row" style="height:14px;line-height:14px"><span class="mu-text event-row-label" style="font-size:12px;width:92px;color:#ff9600">${name}</span><span class="mu-text event-row-clock" style="font-size:12px;width:46px;color:#ff9600">${time}</span></div>`).join('');document.body.append(timers);
  });
  const verifyTimers=async()=>assert.deepEqual(await page.locator('.event-timers').evaluate(e=>{
    const label=e.querySelector('.event-row-label'),clock=e.querySelector('.event-row-clock'),row=e.querySelector('.event-row');
    return{transform:getComputedStyle(e).transform,font:getComputedStyle(label).fontSize,row:getComputedStyle(row).height,clockFont:getComputedStyle(clock).fontSize,fits:label.getBoundingClientRect().right<=clock.getBoundingClientRect().left&&clock.getBoundingClientRect().right<=e.getBoundingClientRect().right,color:getComputedStyle(label).color,text:e.textContent};
  }),{transform:'none',font:'16px',row:'24px',clockFont:'16px',fits:true,color:'rgb(255, 150, 0)',text:'Blood Castle59:20Devil Square30:20Chaos Castle10:10Golden InvasionActive'});
  await mountTimers();await verifyTimers();
  await page.locator('.event-timers').evaluate(e=>e.style.transform='scale(.6)');await verifyTimers();
  await mountTimers();await verifyTimers();
  await page.reload();await mountTimers();await verifyTimers();
  assert.equal(await page.locator('#mu-helper-event-timers-style').count(),1);
  assert.equal(await helper.locator('.config').isVisible(),false);
  await helper.locator('.settings').click();assert.equal(await helper.locator('.config').isVisible(),true);
  await helper.getByRole('tab',{name:'Visualización',exact:true}).click();
  const helmet=helper.getByRole('checkbox',{name:'Ocultar casco',exact:true});assert.equal(await helmet.isChecked(),false);
  await page.evaluate(()=>{
    const part=()=>({Ready:true,loadSeq:0,Unload(){this.Ready=false;this.loadSeq++;}});
    const model={Ready:true,Helm:part(),HelmMask:part(),loadPartAsync(){return Promise.resolve();},setDefaultHelm(){return Promise.resolve();},setDefaultMask(){this.HelmMask.Unload();}};
    window.__world.playerEntity.modelObject=model;window.__world.playerEntity.charAppearance={helm:{group:7,num:1,lvl:9},changed:false};window.originalHelmetLoader=model.loadPartAsync;
  });
  await helmet.check();assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'false');
  assert.equal(await page.evaluate(()=>window.__world.playerEntity.modelObject.HelmMask.Ready),false);
  await helmet.uncheck();assert.equal(await page.evaluate(()=>window.__world.playerEntity.modelObject.loadPartAsync===window.originalHelmetLoader),true);
  assert.equal(await page.evaluate(()=>window.__world.playerEntity.charAppearance.helm.num),1);
  await helper.locator('.toggle').click();await page.waitForFunction(()=>document.getElementById('mu-level-helper').shadowRoot.querySelector('.toggle').getAttribute('aria-pressed')==='true');
  await helper.locator('.toggle').click();assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'false');
  // Exercise the actual scheduler: idle Lorencia used to toggle Home for probes.
  await page.clock.runFor(1000);
  await page.evaluate(()=>{
    window.homeChanges=[];const store=window.__store;
    store.muHelper.active=false;
    store.toggleMuHelper=function(){window.homeChanges.push(!this.muHelper.active);this.muHelper.active=!this.muHelper.active;};
    store.playerData.level=20;
    window.__world.playerEntity.playerAnimation={action:1};
    window.__world.playerEntity.transform.pos={x:47,z:59};
    window.__world.playerEntity.playerMoveTo={point:{x:47,y:59},handled:true};
  });
  await helper.locator('.toggle').click();await page.clock.runFor(1000);
  assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
  await page.clock.runFor(30000);
  await page.evaluate(()=>{window.__world.playerEntity.transform.pos.x=50;});
  await page.clock.runFor(30000);
  assert.deepEqual(await page.evaluate(()=>window.homeChanges),[true]);
  assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>window.__world.playerEntity.playerMoveTo.handled),true);
  await helper.locator('.toggle').click();await page.clock.runFor(500);
  assert.deepEqual(await page.evaluate(()=>window.homeChanges),[true,false]);
  // Pausing stops Home once, then manual Home stays under the player's control.
  await page.evaluate(()=>window.__store.toggleMuHelper());
  await page.clock.runFor(10000);
  assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
  assert.deepEqual(await page.evaluate(()=>window.homeChanges),[true,false,true]);
  assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'false');
  await page.evaluate(()=>window.__store.toggleMuHelper());
  // A rejected Home request must pause once, then a fresh Play can recover.
  await page.evaluate(()=>{window.homeAttempts=0;window.__store.toggleMuHelper=function(){window.homeAttempts++;};window.__world.playerEntity.transform.pos={x:47,z:59};});
  await helper.locator('.toggle').click();await page.clock.runFor(11500);
  assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'false');
  assert.match(await helper.locator('.status').textContent(),/Home no confirmó la activación/);
  assert.equal(await page.evaluate(()=>window.homeAttempts),1);
  await page.evaluate(()=>{window.__store.toggleMuHelper=function(){window.homeAttempts++;this.muHelper.active=!this.muHelper.active;};});
  await helper.locator('.toggle').click();await page.clock.runFor(1000);
  assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
  assert.equal(await page.evaluate(()=>window.homeAttempts),2);
  await helper.locator('.toggle').click();await page.clock.runFor(500);
  await page.screenshot({path:'docs/screenshots/helper-current.png'});
  await helmet.scrollIntoViewIfNeeded();await page.screenshot({path:'docs/screenshots/helper-hide-helmet.png'});
  assert.deepEqual(errors,[]);console.log('PASS Helper: standalone, settings, start/pause, no JS errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
