const {chromium}=require('../scripts/browser-runtime.cjs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1100,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-05T18:00:00Z')});await page.goto(pathToFileURL(path.resolve('demos/helper/preview.html')).href);
 await page.addScriptTag({path:path.resolve('src/config/config.user.js')});
 const config=page.locator('#mu-config'),helper=page.locator('#mu-level-helper'),toggle=config.getByRole('switch',{name:'Activar loot del addon',exact:true}),names=config.getByLabel('Nombres de sets o items'),play=helper.locator('.toggle');
 const open=async()=>{await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mu-config:open')));await config.getByRole('tab',{name:'Obtener',exact:true}).click();};
 await open();assert.equal(await toggle.isChecked(),false);assert.equal(await names.inputValue(),'');
 await toggle.check();await names.fill('Dragon\nLegendary');await config.locator('.cancel').click();await open();assert.equal(await toggle.isChecked(),false);assert.equal(await names.inputValue(),'');
 await toggle.check();await names.fill(' Dragon \nDRAGON\nLegendary');await config.locator('.save').click();
 assert.equal(await play.getAttribute('aria-pressed'),'false');assert.deepEqual(await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('mu.level-helper.demo-settings.v1'));return[s.excellentLoot,s.excellentNames];}),[true,['dragon','legendary']]);
 await page.reload();await page.addScriptTag({path:path.resolve('src/config/config.user.js')});await open();assert.equal(await toggle.isChecked(),true);assert.equal(await names.inputValue(),'dragon\nlegendary');
 await names.fill(Array(51).fill('Dragon').map((v,i)=>v+i).join('\n'));await config.locator('.save').click();assert.equal(await config.locator('.window').isVisible(),true);assert.equal(await names.getAttribute('aria-invalid'),'true');assert.match(await config.locator('[data-module=helper] .error').innerText(),/50 nombres/);await config.locator('.cancel').click();
 // Inject client seams and real item flags, with all broad native filters off.
 await page.evaluate(()=>{
  const config=new Uint8Array(257);config[2]=0x80;config[1]=0;window.__store.muHelper.config=config;window.__store.pickupItemRequest=()=>{};
  window.__world.pickupTarget=null;window.__world.attackTarget={netId:1};
  const listeners={};window.__eventBus={on(name,fn){(listeners[name]??=new Set()).add(fn);},off(name,fn){listeners[name]?.delete(fn);},emit(name,p){for(const fn of listeners[name]??[])fn(p);}};
  window.lootDrop=(id,name,excellent,luck)=>({netId:id,worldIndex:0,objectNameInWorld:name,transform:{pos:{x:48,z:59}},droppedItem:{isMoney:false,item:{group:8,num:1,lvl:3,isExcellent:excellent,luck}}});
  window.validLoot=window.lootDrop(20,'Dragon Armor +3',true,true);
  window.__world.netObjsQuery.entities.push(window.lootDrop(21,'Dragon Armor',false,true),window.lootDrop(22,'Dragon Gloves',true,false),window.lootDrop(23,'Plate Armor',true,true),window.validLoot);
 });
 await page.clock.runFor(500);await play.click();await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>window.__world.pickupTarget?.netId),20);
 // Rejected pickup is cleared and skipped, instead of a request each refresh.
 await page.evaluate(()=>window.__eventBus.emit('ItemPickUpRequestFailed',new DataView(new ArrayBuffer(4))));await page.clock.runFor(1500);assert.equal(await page.evaluate(()=>window.__world.pickupTarget),null);
 await page.evaluate(()=>{window.nextLoot=window.lootDrop(24,'Legendary Armor',true,true);window.__world.netObjsQuery.entities.push(window.nextLoot);});await page.clock.runFor(500);assert.equal(await page.evaluate(()=>window.__world.pickupTarget?.netId),24);
 // Turning off cancels a pending pickup; saved names remain editable.
 await open();await toggle.uncheck();await config.locator('.save').click();assert.equal(await page.evaluate(()=>window.__world.pickupTarget),null);await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>window.__world.pickupTarget),null);
 await open();await toggle.check();await names.fill('');await config.locator('.save').click();await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>window.__world.pickupTarget),null);
 // Native broad filters suspend addon pickup while leveling remains active.
 await open();await names.fill('Dragon');await config.locator('.save').click();await page.evaluate(()=>window.__store.muHelper.config[1]|=0x20);await page.clock.runFor(500);assert.equal(await play.getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>window.__world.pickupTarget),null);await open();assert.match(await config.locator('.loot-state').textContent(),/desactivá/);await config.locator('.cancel').click();await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
 await page.evaluate(()=>window.__store.muHelper.config[1]&=~0x20);await page.clock.runFor(1000);assert.equal(await play.getAttribute('aria-pressed'),'true');await play.click();
 // Provider rollback restores both switch and list when another module fails.
 await page.evaluate(()=>{const host=document.createElement('div');window.dispatchEvent(new CustomEvent('mu-hub:register',{detail:{id:'fail-loot',capabilities:{settings:{host,order:100,begin(){},validate(){},apply(){throw Error('expected rollback');},rollback(){},discard(){}}}}}));});
 await open();await toggle.uncheck();await names.fill('Plate');await config.locator('.save').click();assert.equal(await config.locator('.window').isVisible(),true);assert.deepEqual(await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('mu.level-helper.demo-settings.v1'));return[s.excellentLoot,s.excellentNames];}),[true,['dragon']]);await config.locator('.cancel').click();await open();assert.equal(await toggle.isChecked(),true);assert.equal(await names.inputValue(),'dragon');
 await names.fill('Dragon\nLegendary');await config.locator('.window').screenshot({path:'docs/screenshots/loot-config-preview.png'});await page.setViewportSize({width:390,height:650});await names.scrollIntoViewIfNeeded();assert.equal(await names.isVisible(),true);assert.equal(await config.locator('.window').evaluate(e=>{const r=e.getBoundingClientRect();return r.width<=innerWidth&&r.height<=innerHeight;}),true);
 assert.deepEqual(errors,[]);console.log('PASS Excellent loot: AND filter, save/cancel, persistence, validation, rejection, disabled/empty, native conflict, rollback and compact viewport.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
