const {chromium}=require('../scripts/browser-runtime.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext(),errors=[];
 await context.route('http://localhost:4173/**',route=>{
  const file=path.resolve('.'+new URL(route.request().url()).pathname);let body=fs.readFileSync(file);
  if(file.endsWith('level-helper.user.js'))body=Buffer.from("window.__ACCOUNT_SETTINGS_DEMO__=true;Object.assign(window.__store,{username:'A',accountFor:'demo-world/a1'});\n"+body);
  return route.fulfill({contentType:file.endsWith('.html')?'text/html':'text/javascript',body});
 });
 async function start(){
  const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));await p.clock.install();
  await p.goto('http://localhost:4173/demos/helper/preview.html');
  await p.evaluate(()=>{
   const s=window.__store;window.calls=[];window.sent=[];s.playerData.level=400;
   s.charactersList=[{Name:'Other',Level:1},{Name:'DemoHero',Level:1}];s.focusedChar='Other';
   s.focusCharacterRequest=name=>window.calls.push(['focus',name]);
   s.selectCharacterRequest=name=>{window.calls.push(['select',name]);};
   window.__social.sendChat=text=>{window.sent.push(text);if(text==='/reset'){s.uiState=3;s.loadingCharactersList=true;s.playerData.name='';}return true;};
  });
  await p.locator('#mu-level-helper .toggle').click();await p.clock.runFor(1000);
  assert.equal(await p.evaluate(()=>window.sent.filter(x=>x==='/reset').length),1);return p;
 }
 const selects=p=>p.evaluate(()=>window.calls.filter(x=>x[0]==='select'));
 const running=p=>p.locator('#mu-level-helper .toggle').getAttribute('aria-pressed');
 const p=await start();await p.evaluate(()=>window.__store.loadingCharactersList=false);
 await p.clock.fastForward(91000);assert.deepEqual(await selects(p),[['select','DemoHero']]);assert.equal(await running(p),'true');
 // Native selection populates playerData before the world is actually ready.
 await p.evaluate(()=>{const s=window.__store;s.uiState=4;s.sceneLoading=true;s.playerData.name='DemoHero';s.playerData.level=1;});
 await p.clock.runFor(15000);assert.equal((await selects(p)).length,1);assert.equal(await running(p),'true');
 await p.evaluate(()=>{window.__store.uiState=5;window.__store.sceneLoading=false;});await p.clock.fastForward(120000);
 assert.equal(await running(p),'true');assert.match(await p.locator('#mu-level-helper .status').textContent(),/Lorencia|viajando|Caminando|spot|Home/i);
 assert.equal(await p.evaluate(()=>window.sent.filter(x=>x==='/reset').length),1);await p.close();
 // Production syncAccount runs before Cycle: unknown identity, logout and switch cancel.
 for(const patch of [{username:''},{uiState:2},{connectionLost:true},{username:'B'}]){
  const q=await start();await q.evaluate(patch=>Object.assign(window.__store,patch),patch);await q.clock.runFor(500);
  assert.equal(await running(q),'false');assert.deepEqual(await selects(q),[]);
  await q.evaluate(()=>Object.assign(window.__store,{username:'A',uiState:3,connectionLost:false,loadingCharactersList:false}));await q.clock.fastForward(120000);
  assert.equal(await running(q),'false');assert.deepEqual(await selects(q),[]);await q.close();
 }
 const paused=await start();await paused.locator('#mu-level-helper .toggle').click();await paused.evaluate(()=>window.__store.loadingCharactersList=false);await paused.clock.fastForward(120000);assert.deepEqual(await selects(paused),[]);await paused.close();
 for(const result of ['false','throw']){
  const q=await start();await q.evaluate(result=>{window.__store.loadingCharactersList=false;window.__store.selectCharacterRequest=()=>{if(result==='throw')throw Error('fixture');return false;};},result);
  await q.clock.runFor(500);assert.equal(await running(q),'false');await q.close();
 }
 const retry=await start();await retry.evaluate(()=>window.__store.loadingCharactersList=false);await retry.clock.runFor(31000);
 assert.equal((await selects(retry)).length,3);assert.equal(await running(retry),'false');assert.equal(await retry.evaluate(()=>window.sent.filter(x=>x==='/reset').length),1);
 assert.deepEqual(errors,[]);console.log('Reset reentry UI OK: production identity, delayed scheduler, loading confirmation, exact target, bounded retries, rejection, pause/logout/session invalidation (fixtures only).');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
