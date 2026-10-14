const {chromium}=require('../scripts/browser-runtime.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();await page.clock.install({time:new Date('2026-10-14T12:00:00Z')});
 await page.goto(pathToFileURL(path.resolve('demos/helper/preview.html')).href);
 await page.evaluate(()=>{
  const h=__world.playerEntity;h.netId=1;h.guild={id:42};h.transform.pos.x=12;h.transform.pos.z=39;__world.mapIndex=6;__store.playerData.level=60;
  __world.netObjsQuery.entities=[{netId:2,objectNameInWorld:'Clan',guild:{id:42},playerAnimation:{},transform:{pos:{x:13,z:39}}}];
  window.__partySent=[];__social.partyInvite=t=>__partySent.push({name:t.name,at:Date.now()});
 });
 const play=page.locator('#mu-helper-quick-control .play'),count=()=>page.evaluate(()=>__partySent.length);
 await play.click();await page.clock.runFor(1500);assert.equal(await count(),0);await play.click();await page.clock.runFor(3000);assert.equal(await count(),0);
 await play.click();await page.clock.runFor(1999);assert.equal(await count(),0);await page.clock.runFor(501);assert.equal(await count(),1);
 await play.click();await page.clock.runFor(65000);assert.equal(await count(),1);
 await page.evaluate(()=>{__world.netObjsQuery.entities[0]={netId:3,objectNameInWorld:'NewClan',guild:{id:42},playerAnimation:{},transform:{pos:{x:13,z:39}}};});
 await play.click();await page.clock.runFor(1999);assert.equal(await count(),1);await page.clock.runFor(501);assert.equal(await count(),2);
 console.log('PASS party delay: real scheduler, pause/resume and fresh entity with controlled browser clock (demo only)');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
