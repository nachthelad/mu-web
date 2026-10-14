const {chromium}=require('../scripts/browser-runtime.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-13T12:00:00Z')});
 const tick=ms=>page.clock.runFor(ms);
 const overlay=page.locator('#mu-balrog-control'),button=overlay.locator('button'),config=page.locator('#mu-config');
 async function open(){
  await page.goto(pathToFileURL(path.resolve('demos/hub/preview.html')).href);await tick(1000);
  await page.evaluate(()=>{
   window.__store.playerData.level=200;
   window.addEventListener('mu-hub:register',e=>{if(e.detail.id==='helper')window.balrogModule=e.detail;});window.dispatchEvent(new CustomEvent('mu-hub:discover'));
   window.__store.warpCommandRequest=function(index){log('Warp nativo '+index);this.sceneLoading=true;setTimeout(()=>{const w=window.__world;w.mapIndex=3;w.playerEntity.transform.pos.x=174;w.playerEntity.transform.pos.z=112;w.playerEntity.playerMoveTo.handled=true;this.sceneLoading=false;goldDemoEmit('MapChanged',new DataView(Uint8Array.from([195,15,28,15,1,3,0,174,112,0,0,0,0,0,0]).buffer));},600);return true;};
   window.addEventListener('keydown',e=>{if(e.key==='Home'&&!e.composedPath().some(n=>n instanceof Element&&n.matches('input,textarea,select,button')))window.__store.toggleMuHelper();});
  });
  await page.locator('#mu-hub header > .settings').click();await config.getByRole('tab',{name:'Caza',exact:true}).click();
 }
 async function enable(){await config.locator('.balrog-enabled').check();await page.waitForFunction(()=>localStorage.getItem('mu.level-helper.demo-settings.v1')?.includes('"balrogEnabled":true'));await tick(500);}
 const notice=(map='Noria',x=100,y=120)=>page.evaluate(({map,x,y})=>goldDemoNotice(`The Balrog Colosal has appeared in ${map} at ${x}, ${y}! It takes a group to bring it down.`),{map,x,y});
 async function start(){await notice();await tick(500);await button.click();await tick(5000);}
 await open();assert.equal(await overlay.isVisible(),false);await enable();assert.equal(await overlay.isVisible(),false);
 await page.evaluate(()=>goldDemoNotice('The Balrog has appeared in Noria at 100, 120! It takes a group to bring it down.'));await tick(500);assert.equal(await overlay.isVisible(),false);
 await page.screenshot({path:'docs/screenshots/caza-config-preview.png'});
 // Start with native Home already active: travel must wait for the off confirmation.
 await page.evaluate(()=>{window.__store.muHelper.active=true;});await notice();await tick(500);
 assert.equal(await overlay.isVisible(),true);assert.equal(await page.evaluate(()=>balrogModule.getState().running),false);
 await button.click();await tick(100);assert.equal(await page.evaluate(()=>commands.some(c=>c.startsWith('Warp nativo'))),false);
 await tick(5000);assert.equal(await page.evaluate(()=>window.__world.mapIndex),3);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
 assert.equal(await button.getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>balrogModule.getState().running),false);
 assert.equal(await page.evaluate(()=>commands.filter(c=>c.startsWith('Warp nativo')).length),1);
 assert.equal(await page.evaluate(()=>!!window.__world.attackTarget||!!window.__world.pickupTarget),false);
 await page.screenshot({path:'docs/screenshots/caza-balrog-preview.png'});
 await button.click();await tick(2000);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),false);
 await page.mouse.click(1150,800);await page.keyboard.press('Home');await tick(2000);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
 await tick(10000);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
 // An event ending after Pausa cannot turn off manually activated Home.
 await page.evaluate(()=>goldDemoNotice('The Balrog Colosal has left Noria undefeated.'));await tick(1000);assert.equal(await overlay.isVisible(),false);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
 await notice('Lorencia',80,80);await tick(1000);assert.equal(await button.getAttribute('aria-pressed'),'false');
 // Switch off cancels active hunt, round-trips independently of Config Cancel.
 await button.click();await tick(5000);await config.locator('.balrog-enabled').uncheck();await tick(2000);assert.equal(await overlay.isVisible(),false);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),false);
 await enable();await start();assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
 await page.evaluate(()=>goldDemoNotice('Hero has defeated the Big Boss Balrog Colosal!'));await tick(2000);assert.equal(await overlay.isVisible(),false);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),false);
 // A changed destination cancels; no hidden reroute or auto start on next event.
 await start();await notice('Noria',110,130);await tick(2000);assert.equal(await button.getAttribute('aria-pressed'),'false');assert.equal(await page.evaluate(()=>window.__store.muHelper.active),false);
 // Outstanding reset must remain owned by Cycle; no Balrog request is sent.
 await page.locator('#mu-hub header > .toggle').click();await page.evaluate(()=>{window.__store.playerData.level=400;});await tick(1000);await button.click();assert.match(await config.locator('.balrog-state').textContent(),/confirmación/);assert.equal(await button.getAttribute('aria-pressed'),'false');
 await open();await enable();await start();await page.evaluate(()=>{window.__store.playerData.name='AnotherHero';});await tick(1000);assert.equal(await overlay.isVisible(),false);assert.equal(await page.evaluate(()=>balrogModule.getState().balrog.active),false);
 // End received while the warp is in flight cancels the later walk/Home.
 await open();await enable();await notice();await tick(500);await button.click();assert.equal(await page.evaluate(()=>window.__store.sceneLoading),true);
 await page.evaluate(()=>goldDemoNotice('The Balrog Colosal has left Noria undefeated.'));await tick(5000);assert.equal(await overlay.isVisible(),false);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),false);
 // Pausa during the delayed Home-on acknowledgement waits then stops it once.
 await page.evaluate(()=>{window.__store.toggleMuHelper=function(){log('Home demorado');setTimeout(()=>{this.muHelper.active=!this.muHelper.active;},1000);};});await notice('Noria',100,120);await tick(500);await button.click();await tick(1100);await button.click();await tick(2000);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),false);
 await page.mouse.click(1150,800);await page.keyboard.press('Home');await tick(3000);assert.equal(await page.evaluate(()=>window.__store.muHelper.active),true);
 await open();await enable();await page.evaluate(()=>{window.__world.isWalkable=()=>false;});await notice('Lorencia',90,90);await tick(500);await button.click();await tick(2000);assert.match(await config.locator('.balrog-state').textContent(),/no transitable/);assert.equal(await button.getAttribute('aria-pressed'),'false');
 // Standalone uses the same section, control and Home lifecycle without HUB/Config.
 await page.goto(pathToFileURL(path.resolve('demos/helper/preview.html')).href);await tick(500);
 const helper=page.locator('#mu-level-helper');await helper.locator('.settings').click();await helper.getByRole('tab',{name:'Caza',exact:true}).click();await helper.locator('.balrog-enabled').check();await tick(500);
 assert.equal(await helper.locator('.balrog-enabled').isChecked(),true);assert.equal(await helper.locator('.balrog-play').isDisabled(),true);
 assert.deepEqual(errors,[]);console.log('PASS Balrog: switch, travel, native warp/Home confirmations, Pausa then keyboard Home, event end/change, reset, identity, obstacles and standalone.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
