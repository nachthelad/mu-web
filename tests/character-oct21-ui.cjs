// Production bridge + production Helper; public source extracted fixtures, no account or network.
const {chromium}=require('../scripts/browser-runtime.cjs'),fs=require('node:fs'),assert=require('node:assert/strict');
const read=f=>fs.readFileSync(f,'utf8'),script=s=>'<script>'+s.replace(/<\/script/gi,'<\\/script')+'</script>';
const kanturu=process.argv.includes('--kanturu'),oct22=process.argv.includes('--oct22'),recheck=process.argv.includes('--recheck'),entryFile=kanturu?'index-C5JIMxmo.js':oct22?'index-D-gOSya0.js':recheck?'index-Do3IjarP.js':'index-URnTVW_1.js',layoutPath=kanturu?'/assets/layout-A1P3A0u1.js':oct22?'/assets/layout-DCITLqBq.js':recheck?'/assets/layout-CoOAKkh-.js':'/assets/layout-DQbdTT-G.js',fixtureFile=kanturu?'demos/helper/character-kanturu-audited.js':oct22?'demos/helper/character-oct22-audited.js':recheck?'demos/helper/character-recheck-audited.js':'demos/helper/character-oct21-audited.js';
const prefs={version:1,spots:{lorencia:{x:47,y:59},arena:{x:12,y:39},icarus:{x:43,y:155}},sendParty:true,acceptParty:true,detailedStats:true,pairInventory:true};
const key=(world,account)=>'mu.level-helper.settings.v1.account.'+encodeURIComponent(JSON.stringify([world,account]));
(async()=>{const browser=await chromium.launch({headless:true});try{for(const mode of ['known','unknown','invalid']){
 const page=await browser.newPage({viewport:{width:1380,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));let imports=0;
 const entry=mode==='unknown'?'index-unverified.js':entryFile;
 const init=`window.__LEVEL_HELPER_DEMO__=false;const f=__OCT21_CHARACTER_FIXTURE__;window.__fixtureMobx=f.mobxFixture();
 window.__fixtureStore=__fixtureMobx.observable({...__store,username:'StatsFixture',accountFor:'fixture-world/local',world:__world,characterInfoEnabled:true,inventoryEnabled:false,skillListEnabled:false});
 Object.assign(__fixtureStore.playerData,{charClass:2,str:65535,agi:65535,sta:65535,eng:65535,leadership:0,level:10,items:Array(12).fill(null)});__fixtureStore.playerData.items[0]={group:5,num:11,lvl:13,isExcellent:true,optionLevel:4,excellentFlags:32};
 window.__fixtureClosures=f.installNativeClosures(__fixtureStore,__fixtureMobx);window.__fixtureSocial={...__social,sendChat(){throw Error('Unexpected command')}};window.__fixtureBus={on(){},off(){}};
 localStorage.setItem(${JSON.stringify(key('fixture-world','StatsFixture'))},${JSON.stringify(JSON.stringify(prefs))});
 window.__nativeGate=new Promise(r=>window.__releaseNative=r);delete window.__store;delete window.__world;delete window.__social;
 window.__uiRender=()=>{document.querySelector('.character-info').hidden=!__fixtureStore.characterInfoEnabled;document.querySelector('.inventory').hidden=!__fixtureStore.inventoryEnabled};__fixtureMobx.reaction(()=>[__fixtureStore.characterInfoEnabled,__fixtureStore.inventoryEnabled],__uiRender);__uiRender();
 for(const [id,key]of [['native-c','characterInfoEnabled'],['native-v','inventoryEnabled']])document.getElementById(id).onclick=()=>__fixtureMobx.action(()=>__fixtureStore[key]=!__fixtureStore[key]);
 document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea')||e.repeat)return;const s=__fixtureStore;__fixtureMobx.action(()=>{if(e.key==='c')s.characterInfoEnabled=!s.characterInfoEnabled;if(e.key==='v')s.inventoryEnabled=!s.inventoryEnabled;if(e.key==='Escape'){if(s.inventoryEnabled)s.inventoryEnabled=false;else s.characterInfoEnabled=false;}});});`;
 const windows='<style>:root{color-scheme:dark}body{background:#080b08;color:#eee6d1}</style><section class="mu-item-window character-info" style="position:absolute;left:20px;top:20px;width:250px;height:640px;background:#222;color:white">Native Character Info</section><section class="mu-item-window inventory" style="position:absolute;left:1000px;top:20px;width:250px;height:640px;background:#222;color:white">Native Inventory</section>';
 const html='<meta charset="utf-8"><script type="module" src="/assets/'+entry+'"></script><button id="native-c" style="position:fixed;bottom:5px;left:700px;z-index:999999">C</button><button id="native-v" style="position:fixed;bottom:5px;left:750px;z-index:999999">V</button><input id="typing" style="position:fixed;bottom:5px;left:900px"><button id="arrive"></button><button id="die"></button><button id="disconnect"></button><button id="toggle"></button><button id="vitals"></button><p id="feedback"></p><p id="commands"></p><div class="scene"></div>'+windows+script(read('demos/helper/demo.js'))+script(read(fixtureFile))+script(init)+script(read('src/extension/page-bridge.js'))+script(read('src/helper/level-helper.user.js'));
 const module=read(fixtureFile)+`\nawait window.__nativeGate;const f=globalThis.__OCT21_CHARACTER_FIXTURE__.nativeFixture();export const n=__fixtureStore,V=__fixtureSocial,aw=__fixtureBus,b1=f.calculate,bU={getItem:(g,n)=>f.catalogue.find(i=>i.Group===g&&i.Index===n)},aL=f.slots,${oct22||kanturu?'nF':'nC'}=f.itemStats,${oct22||kanturu?'nH':'nE'}=${mode==='invalid'?'null':'f.tooltip'},${kanturu?'fg':'fd'}=f.name;`;
 await page.route('**/*',route=>{const p=new URL(route.request().url()).pathname;if(p==='/')return route.fulfill({contentType:'text/html',body:html});if(p===layoutPath){imports++;return route.fulfill({contentType:'text/javascript',body:module});}return route.fulfill({contentType:'text/javascript',body:''});});
 await page.goto('https://mu.mormon.garden/',{waitUntil:'domcontentloaded'});
 assert.equal(await page.evaluate(()=>window.__store===undefined),true);await page.evaluate(()=>__releaseNative());
 const metric=k=>page.locator('#mu-helper-stats').locator('tbody tr').filter({has:page.locator('th',{hasText:k})}).first().locator('td').first();
 if(mode==='unknown'){assert.equal(imports,0);assert.equal(await page.evaluate(()=>window.__store===undefined),true);}
 else{
  await page.waitForFunction(()=>window.__store===__fixtureStore);assert.equal(imports,1);
  const panel=page.locator('#mu-helper-stats .stats-view');await panel.waitFor();
  if(mode==='invalid'){await page.waitForFunction(()=>document.querySelector('#mu-helper-stats')?.shadowRoot?.textContent.includes('Adaptador nativo no disponible'));assert.equal(await metric('Mágico nativo mínimo').textContent(),'No disponible');}
  else{
   await page.waitForFunction(()=>document.querySelector('#mu-helper-stats')?.shadowRoot?.querySelector('tbody tr:nth-child(3) td')?.textContent==='7384');
   assert.equal(await metric('Mágico nativo máximo').textContent(),'16493');assert.equal(await metric('Staff leído por C').textContent(),'110');
   assert.doesNotMatch(await panel.locator('.stats-warning').textContent(),/omite el staff|Adaptador nativo no disponible/);
   assert.equal(await page.evaluate(()=>__store===__fixtureStore&&__world===__fixtureStore.world),true);
   const state=()=>page.evaluate(()=>({running:document.querySelector('#mu-level-helper').shadowRoot.querySelector('.toggle').getAttribute('aria-pressed'),message:document.querySelector('#mu-level-helper').shadowRoot.querySelector('.status').textContent,c:__store.characterInfoEnabled,v:__store.inventoryEnabled}));
   assert.match((await state()).message,/cuenta conectada; inicio manual/);assert.equal((await state()).running,'false');
   await page.locator('#native-v').click();assert.ok((await state()).c&&(await state()).v);await page.keyboard.press('Escape');assert.ok((await state()).c&&!(await state()).v);
   await page.locator('#native-c').click();await page.locator('#native-v').click();await page.locator('#native-c').click();assert.ok((await state()).c&&(await state()).v);
   await page.locator('#typing').fill('cv');assert.ok((await state()).c&&(await state()).v);await page.locator('#typing').blur();
   await panel.locator('.capture-a').click();await page.evaluate(()=>__store.playerData.items[0]={group:5,num:10,lvl:0,isExcellent:false,optionLevel:0,excellentFlags:0});await page.waitForFunction(()=>document.querySelector('#mu-helper-stats').shadowRoot.querySelector('tbody tr:nth-child(5) td').textContent==='53');await panel.locator('.capture-b').click();assert.match(await panel.locator('.stats-captures').textContent(),/A:.*B:/);
   await page.evaluate(()=>{const c=document.querySelector('.character-info'),clone=c.cloneNode(false);clone.textContent='Recreated native C';c.replaceWith(clone);});await panel.waitFor();
   await page.screenshot({path:'docs/screenshots/character-oct21-cv.png'});
   const toggle=selector=>page.locator('#mu-level-helper').locator(selector).evaluate(n=>n.click()),saved=(field,value)=>page.waitForFunction(({key,field,value})=>JSON.parse(localStorage.getItem(key))[field]===value,{key:key('fixture-world','StatsFixture'),field,value});
   await toggle('.pair-inventory');await saved('pairInventory',false);await page.waitForFunction(n=>n.title==='C/V conserva el comportamiento nativo.',await page.locator('#mu-level-helper .pair-inventory').elementHandle());assert.ok((await state()).c&&(await state()).v);await page.locator('#native-v').click();await page.locator('#native-v').click();assert.ok(!(await state()).c&&(await state()).v);
   await toggle('.pair-inventory');await saved('pairInventory',true);await page.waitForFunction(n=>n.title.startsWith('C/V habilitado'),await page.locator('#mu-level-helper .pair-inventory').elementHandle());await page.locator('#native-c').click();assert.ok((await state()).c&&(await state()).v);
   await toggle('.detailed-stats');await saved('detailedStats',false);assert.ok((await state()).c&&(await state()).v);await page.waitForFunction(()=>document.querySelector('#mu-helper-stats')?.hidden===true);await page.locator('#native-c').click();await page.locator('#native-c').click();assert.ok((await state()).c&&(await state()).v);
   await toggle('.detailed-stats');await saved('detailedStats',true);await panel.waitFor();assert.equal((await state()).running,'false');
   await page.evaluate(()=>__fixtureMobx.action(()=>__store.skillListEnabled=true));assert.ok(!(await state()).c&&!(await state()).v);
   await page.evaluate(()=>{__store.username='OtherAccount';});await page.waitForFunction(()=>document.querySelector('#mu-level-helper').shadowRoot.querySelector('.status').textContent==='Pausado: cambió la cuenta');assert.equal((await state()).running,'false');
   assert.equal(await page.locator('#mu-helper-stats').count(),0);
   await page.evaluate(()=>{__store.username='StatsFixture';__store.characterInfoEnabled=true;});await panel.waitFor();assert.equal((await state()).running,'false');assert.match(await panel.locator('.stats-captures').textContent(),/A: sin captura.*B: sin captura/);
   await page.evaluate(()=>__store.accountFor='other-world/local');await page.waitForFunction(()=>document.querySelector('#mu-helper-stats')?.hidden===true);assert.equal((await state()).running,'false');
  }
 }
 assert.deepEqual(errors,[]);await page.close();
 }console.log('PASS '+(oct22?'October 22':recheck?'October 21 recheck':'October 21')+' bridge+stats late shared import, native closures, both opening orders, Escape/input, A/B/equipment/recreation, account/world isolation, no Play, unknown/malformed build');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

