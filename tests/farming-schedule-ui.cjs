const {chromium}=require('../scripts/browser-runtime.cjs'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {DEFAULTS}=require('../src/helper/level-helper.user.js');
const account=JSON.stringify(['farming-world','Demo']),key='mu.level-helper.demo-settings.v1.account.'+encodeURIComponent(account),runtime='mu.level-helper.demo-schedule-runtime.v1.account.'+encodeURIComponent(account);
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext(),errors=[];
 const init=[fs.readFileSync('tests/fixtures/farming-client-audited.cjs','utf8'),fs.readFileSync('tests/fixtures/farming-demo.js','utf8'),'installFarmDemo();window.__ACCOUNT_SETTINGS_DEMO__=true;Object.assign(__store,{username:"Demo",accountFor:"farming-world/a1"});__store.gsSocket.url="wss://demo.invalid:444";window.addEventListener("mu-hub:register",e=>{if(e.detail.id==="helper")window.__helper=e.detail;});'].join('\n');
 await context.route('http://localhost:4173/**',r=>{const url=new URL(r.request().url()),file=path.resolve('.'+decodeURIComponent(url.pathname));let body=fs.readFileSync(file);if(url.pathname.endsWith('/demo.js'))body=Buffer.from(body+'\n'+init);return r.fulfill({contentType:file.endsWith('.html')?'text/html':'text/javascript',body});});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-10-22T03:00:00-03:00')});await page.goto('http://localhost:4173/demos/helper/preview.html');
 await page.evaluate(([k,p])=>localStorage.setItem(k,JSON.stringify(p)),[key,{version:1,...DEFAULTS,autoReset:false,schedule:{version:1,enabled:true,start:'02:00',end:'06:00'}}]);await page.reload();
 const advance=async(ms=1000)=>{for(let i=0;i<ms/500;i++){await page.clock.runFor(500);await page.waitForTimeout(40);}};const state=()=>page.evaluate(()=>__helper.getState());
 await advance(2000);assert.equal((await state()).running,true,JSON.stringify(await state()));assert.equal((await state()).mode,'farming');assert.match((await state()).message,/Farmeando/);assert.equal(await page.evaluate(()=>__store.muHelper.active),false);
 // Reload cannot recapture a different spot in the active occurrence.
 await page.reload();await advance(7000);assert.equal((await state()).running,false);assert.match((await state()).schedule.message,/capturar un spot/);
 await page.keyboard.press('F10');await advance();assert.equal((await state()).running,true,JSON.stringify(await state()));
 await page.evaluate(()=>__world.playerEntity.dying=true);await advance();assert.equal((await state()).running,false);await page.evaluate(()=>__world.playerEntity.dying=false);await advance(4000);assert.equal((await state()).running,false);
 await page.keyboard.press('F10');await advance();assert.equal((await state()).running,true,JSON.stringify(await state()));
 await page.evaluate(()=>__world.mapIndex=37);await advance();assert.equal((await state()).running,false);await page.evaluate(()=>__world.mapIndex=33);await advance(3000);assert.equal((await state()).running,false);
 await page.keyboard.press('F10');await advance();assert.equal((await state()).running,true,JSON.stringify(await state()));
 await page.clock.setSystemTime(new Date('2026-10-22T06:00:00-03:00'));await advance();assert.equal((await state()).running,false);assert.equal(await page.evaluate(()=>__world.castRequest),null);assert.equal(await page.evaluate(()=>__store.muHelper.active),false);
 assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).farmUntil>0,runtime),true);assert.deepEqual(errors,[]);
 console.log('PASS farming schedule: shared resolver, Home off, reload inhibition, death/map cancellation, explicit restart and exact deadline. Isolated account fixture.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
