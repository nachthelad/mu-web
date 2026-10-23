const {chromium}=require('../scripts/browser-runtime.cjs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-22T21:00:00Z')});await page.goto(pathToFileURL(path.resolve('demos/helper/preview.html')).href);
 await page.addScriptTag({path:path.resolve('tests/fixtures/farming-client-audited.cjs')});
 await page.evaluate(()=>{
  const store=__store,world=__world,hero=world.playerEntity;window.farmPackets=[];
  Object.assign(store.playerData,{charClass:0,level:400,eng:1200,currentMP:100,currentAG:100,tileFlag:0});store.skills=[{number:1},{number:4},{number:16},{number:40}];store.currentSkill=1;store.selectSkill=function(n){this.currentSkill=this.skills.some(k=>k.number===n)?n:-1;};store.sendToGS=p=>farmPackets.push({skill:p.SkillId,target:p.TargetId});store.pickupItemRequest=id=>farmPackets.push({pickup:id});
  Object.assign(hero,{charAppearance:{charClass:0},pathfinding:{path:null},playerAnimation:{}});hero.attributeSystem.getValue=()=>0;hero.transform={pos:{x:50,z:50},rot:{y:0}};hero.playerMoveTo.point={x:50,y:50};
  Object.assign(world,{mapIndex:33,attackTarget:null,castRequest:null,pickupTarget:null,castApproach:null,pathfinder:{search:(a,b)=>[a,b]},getByNetId(id){return this.netObjsQuery.entities.find(e=>e.netId===id);}});
  world.netObjsQuery.entities=[{netId:88,npcType:2,worldIndex:33,transform:{pos:{x:51,z:50}}}];
  window.farmClient=__farmClientFixture.create(store,world);window.__FARM_DEMO_NATIVE__=farmClient.native;
 });
 await page.clock.runFor(500);const helper=page.locator('#mu-level-helper'),quick=page.locator('#mu-helper-quick-control');
 await helper.locator('.settings').click();await helper.locator('.auto-reset').uncheck();await helper.locator('.autosave-state').filter({hasText:'Switch guardado'}).waitFor();
 // Search acts on the canonical select, preserving the committed map until Enter.
 const search=helper.locator('.map-search');await search.fill('Áre na');assert.equal(await helper.locator('.map-select option').count(),4);assert.deepEqual(await helper.locator('.map-select option').allTextContents(),['Arena · activo','Arena 2','Arena 3','Arena 4']);
 await search.press('ArrowDown');await search.press('Enter');assert.match(await helper.locator('.map-min').textContent(),/Arena 2/);assert.equal(await search.inputValue(),'');
 await search.fill('inexistente');assert.equal(await helper.locator('.map-select option').count(),0);assert.match(await helper.locator('.map-search-state').textContent(),/Sin coincidencias/);await search.press('Escape');assert.match(await helper.locator('.map-min').textContent(),/Arena 2/);
 await helper.locator('.map-select').selectOption('aida2');assert.equal(await helper.locator('.map-enabled').isDisabled(),true);assert.match(await helper.locator('.map-min').textContent(),/correspondencia/);
 await helper.getByRole('tab',{name:'Caza',exact:true}).click();assert.equal(await helper.locator('.farm-settings button').count(),0);assert.equal(await helper.locator('.farm-skill').inputValue(),'selected');
 await helper.locator('.settings').click();await page.keyboard.press('F10');await page.clock.runFor(500);
 assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'true');assert.match(await helper.locator('.status').textContent(),/Farmeando/);assert.match(await quick.locator('.play').textContent(),/Farmeando/);
 assert.equal(await page.evaluate(()=>__store.muHelper.active),false);await page.evaluate(()=>farmClient.tick(.5));assert.deepEqual(await page.evaluate(()=>farmPackets),[{skill:1,target:88}]);
 await page.keyboard.press('F10');await page.evaluate(()=>farmClient.tick(2));assert.equal(await page.evaluate(()=>farmPackets.length),1);assert.equal(await page.evaluate(()=>__world.castRequest),null);
 // Pending native requests are canceled, death does not resume on respawn.
 await page.keyboard.press('F10');await page.clock.runFor(500);await page.evaluate(()=>__world.playerEntity.dying=true);await page.clock.runFor(500);assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'false');await page.evaluate(()=>__world.playerEntity.dying=false);await page.clock.runFor(1000);assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'false');
 // Unsupported map and unsupported Nova do not toggle Home or send a reset.
 await page.evaluate(()=>__world.mapIndex=10);await page.keyboard.press('F10');assert.match(await helper.locator('.status').textContent(),/solo Aida/);assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'false');
 await page.evaluate(()=>{__world.mapIndex=33;__store.currentSkill=40;});await page.keyboard.press('F10');assert.match(await helper.locator('.status').textContent(),/cancelación/);
 await page.evaluate(()=>{__store.currentSkill=1;__store.playerData.currentMP=0;});await page.keyboard.press('F10');await page.clock.runFor(500);assert.match(await helper.locator('.status').textContent(),/esperando mana/);assert.equal(await page.evaluate(()=>__world.castRequest),null);await page.keyboard.press('F10');
 // Reach 400 during leveling: Home stops and route stops advancing.
 await page.evaluate(()=>{__store.playerData.level=399;__store.playerData.currentMP=100;__store.buffs=[4];__world.playerEntity.transform.pos={x:43,z:155};__world.mapIndex=10;});
 await page.keyboard.press('F10');await page.clock.runFor(1500);assert.equal(await page.evaluate(()=>__store.muHelper.active),true);
 await page.evaluate(()=>{__world.mapIndex=33;__store.playerData.level=400;__world.playerEntity.transform.pos={x:50,z:50};__world.playerEntity.playerMoveTo.point={x:50,y:50};});await page.clock.runFor(2000);assert.equal(await page.evaluate(()=>__store.muHelper.active),false);assert.match(await helper.locator('.status').textContent(),/Farmeando/);assert.equal(await page.evaluate(()=>__world.attackTarget),null);
 await helper.locator('.settings').click();await helper.getByRole('tab',{name:'Caza',exact:true}).click();fs.mkdirSync('artifacts/farming-400',{recursive:true});await helper.screenshot({path:'artifacts/farming-400/farming.png'});await page.keyboard.press('F10'); // editable focus does not trigger if on a select
 await helper.locator('.toggle').click();
 assert.deepEqual(errors,[]);console.log('PASS farming UI: single F10/Play, extracted manual cast at 400/Home off, 399→400 transition, cancellation, resources, map/skill gates, canonical search and no extra start control. Isolated fixture only.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
