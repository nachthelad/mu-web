const {chromium}=require('../scripts/browser-runtime.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{
  const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const load=async()=>{await page.goto(pathToFileURL(path.resolve('demos/hub/preview.html')).href);await page.clock.runFor(1000);};
  await page.clock.install({time:new Date('2026-10-04T12:00:00Z')});await load();
  const hub=page.locator('#mu-hub'),g=hub.locator('header > .gold'),play=hub.locator('header > .toggle');
  assert.equal(await g.getAttribute('aria-pressed'),'false');assert.equal(await g.isDisabled(),false);
  await page.evaluate(()=>{window.__store.playerData.level=200;window.__goldDemo.moving=false;});
  await play.click();await page.clock.runFor(1500);assert.equal(await play.getAttribute('aria-pressed'),'true');
  await g.click();await page.clock.runFor(500);assert.equal(await g.getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>document.getElementById('commands').textContent.includes('/move tarkan2')),false);
  await page.evaluate(()=>window.__goldDemo.soon());await page.clock.runFor(3000);
  assert.equal(await page.evaluate(()=>window.__world.mapIndex),8);assert.equal(await play.getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>window.__store.muHelper.active),false);
  await page.evaluate(()=>window.__goldDemo.monster());await page.clock.runFor(4500);
  assert.equal(await page.evaluate(()=>window.__store.playerData.items.length),1);
  assert.match(await hub.locator('.state').innerText(),/Kundun/);
  await hub.locator('header > .settings').click();await page.screenshot({path:'docs/screenshots/golden-hunt-preview.png'});await hub.locator('header > .settings').click();
  for(const map of [7,7,0,2]){await page.clock.fastForward(301000);await page.clock.runFor(3000);assert.equal(await page.evaluate(()=>window.__world.mapIndex),map);}
  await page.clock.fastForward(301000);await page.clock.runFor(3000);
  assert.equal(await play.getAttribute('aria-pressed'),'true');assert.equal(await g.getAttribute('aria-pressed'),'true');
  const route=await page.evaluate(()=>document.getElementById('commands').textContent);
  for(const command of ['/move tarkan2','/move atlans2','/move atlans3','/move lorencia','/move devias'])assert.equal(route.split(command).length-1,1,route);
  assert.match(route,/\/move icarus/); // existing leveleo resumes
  await page.evaluate(()=>window.__goldDemo.start());await page.clock.runFor(2000);
  assert.equal((await page.evaluate(()=>document.getElementById('commands').textContent)).split('/move tarkan2').length-1,1);
  await g.click();assert.equal(await g.getAttribute('aria-pressed'),'false');

  // G alone is armed but cannot send commands; Play starts the first accessible map.
  await load();await page.evaluate(()=>{window.__store.playerData.level=50;window.__store.playerData.name='LowHero';});await page.clock.runFor(500);
  await g.click();await page.evaluate(()=>window.__goldDemo.start());await page.clock.runFor(2000);
  assert.equal(await play.getAttribute('aria-pressed'),'false');assert.equal(await page.evaluate(()=>window.__world.mapIndex),0);
  assert.equal(await page.evaluate(()=>document.getElementById('commands').textContent.includes('/move tarkan2')),false);
  await play.click();await page.clock.runFor(6000);assert.equal(await page.evaluate(()=>window.__world.mapIndex),0);
  assert.equal(await page.evaluate(()=>document.getElementById('commands').textContent.includes('/move atlans')),false);
  await play.click();await page.clock.runFor(1000);assert.equal(await play.getAttribute('aria-pressed'),'false');assert.equal(await page.evaluate(()=>window.__store.muHelper.active),false);
  // Play cancellation clears the hunter's attack/cast and leaves G armed.
  await load();await page.evaluate(()=>{window.__store.playerData.name='TargetHero';window.__store.playerData.level=200;window.__goldDemo.autoKill=false;});await play.click();await g.click();await page.evaluate(()=>window.__goldDemo.start());await page.clock.runFor(3000);
  await page.evaluate(()=>window.__goldDemo.monster());await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>!!window.__world.attackTarget),true);
  await play.click();await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>window.__world.attackTarget),null);assert.equal(await page.evaluate(()=>window.__world.castRequest),null);assert.equal(await g.getAttribute('aria-pressed'),'true');
  // Rejected Kundun is visible, uncounted, and disables G.
  await load();await page.evaluate(()=>{window.__store.playerData.name='LootHero';window.__store.playerData.level=200;window.__goldDemo.rejectLoot=true;});await play.click();await g.click();await page.evaluate(()=>window.__goldDemo.start());await page.clock.runFor(3000);await page.evaluate(()=>window.__goldDemo.drop());await page.clock.runFor(1500);
  assert.equal(await g.getAttribute('aria-pressed'),'false');assert.match(await hub.locator('.state').innerText(),/rechazó el Kundun/);assert.equal(await page.evaluate(()=>window.__store.playerData.items.length),0);
  // Real adapter: target outside the gate region and without optional worldIndex.
  await load();await page.evaluate(()=>{window.__store.playerData.name='FastHero';window.__store.playerData.level=200;window.__goldDemo.autoKill=false;});await page.clock.runFor(500);
  await play.click();await g.click();await page.evaluate(()=>window.__goldDemo.start());await page.clock.runFor(3000);
  await page.evaluate(()=>{
    window.__huntLatency=[];window.__reactionLatency=[];window.addEventListener('mu-radar:hunting',event=>{if(window.__fastEntity&&window.__world.attackTarget===window.__fastEntity){window.__huntLatency.push(Date.now()-window.__fastSeen);window.__reactionLatency.push(Date.now()-event.detail.seen);}});
    const e={netId:910,npcType:82,transform:{pos:{x:195,z:61}}};window.__fastEntity=e;window.__world.netObjsQuery.entities.push(e);window.__fastSeen=Date.now();
  });
  await page.clock.runFor(250);
  assert.equal(await page.evaluate(()=>window.__world.attackTarget===window.__fastEntity),true);
  assert.equal(await page.evaluate(()=>window.__world.castRequest?.target===window.__fastEntity),true);
  assert.equal(await page.evaluate(()=>window.__reactionLatency[0]),0);
  const latency=await page.evaluate(()=>window.__huntLatency[0]);assert.ok(latency<=250,`scan + reaction ${latency} ms`);
  await page.evaluate(()=>{window.__pendingCast=window.__world.castRequest;});await page.clock.runFor(1000);
  assert.equal(await page.evaluate(()=>window.__world.castRequest===window.__pendingCast),true); // do not reset native approach
  await page.evaluate(()=>window.__world.pathfinder={search:()=>null});await page.clock.runFor(250);
  assert.equal(await page.evaluate(()=>window.__world.attackTarget),null);assert.equal(await page.evaluate(()=>window.__world.castRequest),null);
  await page.evaluate(()=>{delete window.__world.pathfinder;window.__world.netObjsQuery.entities=[];window.__goldDemo.monster();});await page.clock.runFor(500);
  for(let i=0;i<5;i++){
    if(i){await page.evaluate(()=>window.__goldDemo.monster());await page.clock.runFor(500);}
    await page.evaluate(()=>{
      const e=window.__world.attackTarget;
      const p=new DataView(new ArrayBuffer(9));p.setUint8(0,193);p.setUint8(1,9);p.setUint8(2,23);p.setUint16(3,e.netId);p.setUint16(7,2);
      goldDemoEmit('ObjectGotKilled',p);p.setUint16(7,1);e.dying={killedByHero:true};window.__goldDemo.drop();goldDemoEmit('ObjectGotKilled',p);goldDemoEmit('ObjectGotKilled',p);window.__world.attackTarget=null;window.__world.castRequest=null;
    });
    await page.clock.runFor(2200);
  }
  await page.clock.runFor(1500);
  assert.equal(await page.evaluate(()=>window.__store.playerData.items.length),5);
  assert.equal(await page.evaluate(()=>window.__world.mapIndex),7);
  const quickRoute=await page.evaluate(()=>document.getElementById('commands').textContent);assert.match(quickRoute,/\/move atlans3/);
  console.log(`PASS Radar scan + Helper reaction: ${latency} ms; pending cast preserved; five own kills, foreign/duplicate packets excluded, Kundun before warp.`);
  // Existing module capability is required, even when the client is ready.
  await page.goto(pathToFileURL(path.resolve('demos/helper/preview.html')).href);await page.clock.runFor(500);
  await page.evaluate(()=>window.__GOLDEN_RADAR_DEMO__=true);await page.addScriptTag({path:path.resolve('src/hub/hub.user.js')});await page.clock.runFor(500);
  assert.equal(await g.isDisabled(),true); // no Radar yet
  await page.addScriptTag({path:path.resolve('src/radar/golden-radar.user.js')});await page.clock.runFor(500);
  assert.equal(await g.isDisabled(),true); // old demo lacks attack/loot seams and EventBus
  assert.deepEqual(errors,[]);
  console.log('PASS Golden hunt: G, preaviso, cinco destinos, combate, Kundun confirmado, niveles aprendidos, no reinicio, reanuda según Helper; sin cuenta real.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
