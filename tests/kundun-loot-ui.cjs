const {chromium}=require('../scripts/browser-runtime.cjs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-18T18:00:00Z')});
 await page.goto(pathToFileURL(path.resolve('demos/helper/preview.html')).href);await page.addScriptTag({path:path.resolve('src/config/config.user.js')});
 const config=page.locator('#mu-config'),helper=page.locator('#mu-level-helper'),boxToggle=config.getByRole('checkbox',{name:'Recoger cajas Kundun (+1 a +5)',exact:true});
 const open=async()=>{await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mu-config:open')));await config.getByRole('tab',{name:'Obtener',exact:true}).click();};
 await open();assert.equal(await boxToggle.isChecked(),false);await boxToggle.check();await config.locator('.cancel').click();await open();assert.equal(await boxToggle.isChecked(),false);
 await config.locator('.excellent-loot').check();await boxToggle.check();assert.equal(await config.locator('[data-loot=nameExcellent]').isChecked(),true);assert.equal(await config.locator('[data-loot=nameLuck]').isChecked(),true);await config.locator('.save').click();
 assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'false');
 await page.reload();await page.addScriptTag({path:path.resolve('src/config/config.user.js')});await open();assert.equal(await boxToggle.isChecked(),true);assert.equal(await config.locator('.excellent-names').inputValue(),'');await config.locator('.cancel').click();
 await page.evaluate(()=>{window.__store.muHelper.config=new Uint8Array(257);window.__store.pickupItemRequest=()=>{};window.__world.pickupTarget=null;});
 await helper.locator('.toggle').click();await page.clock.runFor(1500);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
 // Hero is now outside the saved spot radius. Pending Kundun must defer returning Home/route movement.
 await page.evaluate(()=>{
  const hero=window.__world.playerEntity;hero.transform.pos.x=63;hero.transform.pos.z=59;hero.playerMoveTo.point={x:63,y:59};hero.playerMoveTo.handled=true;
  window.kundun={netId:301,worldIndex:0,objectNameInWorld:'Caja traducida',transform:{pos:{x:64,z:59}},droppedItem:{isMoney:false,item:{group:14,num:11,lvl:8,isExcellent:false,luck:false}}};window.__world.netObjsQuery.entities=[window.kundun];
 });
 await page.clock.runFor(2000);assert.equal(await page.evaluate(()=>window.__world.pickupTarget?.netId),301);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);assert.deepEqual(await page.evaluate(()=>window.__world.playerEntity.playerMoveTo.point),{x:63,y:59});
 await open();assert.match(await config.locator('.loot-state').textContent(),/Kundun: recogiendo \+1/);await config.locator('.window').screenshot({path:'docs/screenshots/kundun-loot-preview.png'});
 await page.setViewportSize({width:390,height:720});await boxToggle.scrollIntoViewIfNeeded();assert.equal(await boxToggle.isVisible(),true);await config.locator('.window').screenshot({path:'docs/screenshots/kundun-loot-mobile.png'});
 await boxToggle.uncheck();await config.locator('.save').click();assert.equal(await page.evaluate(()=>window.__world.pickupTarget),null);
 await open();await boxToggle.check();await config.locator('.save').click();
 // Stop/restart from the configured spot, then pause a pending pickup manually.
 await helper.locator('.toggle').click();await page.evaluate(()=>{const h=window.__world.playerEntity;h.transform.pos.x=47;h.transform.pos.z=59;h.playerMoveTo.point={x:47,y:59};window.kundun.transform.pos.x=48;});
 await helper.locator('.toggle').click();await page.clock.runFor(2000);assert.equal(await page.evaluate(()=>window.__world.pickupTarget?.netId),301);await helper.locator('.toggle').click();assert.equal(await page.evaluate(()=>window.__world.pickupTarget),null);
 assert.deepEqual(errors,[]);console.log('PASS Kundun: default OFF, cancel, save, reload, empty names, strict name flags, scheduler priority outside spot, mobile, disable and manual pause.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
