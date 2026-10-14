const {chromium}=require('../scripts/browser-runtime.cjs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1100,height:850}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
 await page.goto(pathToFileURL(path.resolve('demos/hub/preview.html')).href);
 await page.evaluate(()=>{
  const hero=window.__world.playerEntity;
  const part=()=>({Ready:true,loadSeq:0,mesh:'original',Unload(){this.Ready=false;this.loadSeq++;this.mesh=null;}});
  const model={Ready:true,Wings:part(),Helm:part(),HelmMask:part(),async loadPartAsync(dir,p,name){const seq=++p.loadSeq;await Promise.resolve();if(seq===p.loadSeq){p.mesh=name;p.Ready=true;}},async setWingsAsync(w){if(!w){this.Wings.Unload();return;}return this.loadPartAsync('Item/',this.Wings,`${w.group}/${w.num}`);},setDefaultHelm(){return Promise.resolve();},setDefaultMask(){}};
  hero.modelObject=model;hero.charAppearance={wings:{group:12,num:4,lvl:9},helm:{group:7,num:1},changed:false};window.wingOriginal=model.setWingsAsync;
  window.appearanceTick=setInterval(()=>{if(hero.charAppearance.changed){hero.charAppearance.changed=false;model.setWingsAsync(hero.charAppearance.wings);}},20);
 });
 const config=page.locator('#mu-config'),gear=page.locator('#mu-hub header > .settings'),visual=config.getByRole('tab',{name:'Visualización',exact:true});
 const open=async()=>{await gear.click();await visual.click();};await open();
 assert.equal(await config.getByRole('heading',{name:'Trackeo',exact:true}).count(),1);assert.equal(await config.getByRole('heading',{name:'Estilos',exact:true}).count(),1);
 assert.equal(await config.locator('.tracking-slot .show-history').count(),1);assert.equal(await config.locator('.tracking-slot .track-white-wizard').count(),1);assert.equal(await config.locator('[data-module=radar]').isVisible(),false);
 await config.getByRole('tab',{name:'Leveleo',exact:true}).click();assert.equal(await config.locator('.track-white-wizard').isVisible(),false);await visual.click();
 await config.locator('.wing-style').selectOption('blade-knight');await config.locator('.hide-helmet').check();await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>window.__world.playerEntity.modelObject.setWingsAsync===window.wingOriginal),true);
 await config.locator('.cancel').click();await open();assert.equal(await config.locator('.wing-style').inputValue(),'original');assert.equal(await config.locator('.hide-helmet').isChecked(),false);
 await config.locator('.wing-style').selectOption('blade-knight');await config.locator('.hide-helmet').check();await config.locator('.track-white-wizard').check();await config.locator('.save').click();await page.clock.runFor(1000);
 assert.equal(await page.evaluate(()=>window.__world.playerEntity.modelObject.Wings.mesh),'12/5');assert.equal(await page.evaluate(()=>window.__world.playerEntity.charAppearance.wings.num),4);assert.equal(await page.locator('#mu-hub header > .toggle').getAttribute('aria-pressed'),'false');
 await open();await config.locator('.window').screenshot({path:'docs/screenshots/visualization-wings-preview.png'});
 const catalog=require('./fixtures/wing-catalog.json');
 assert.equal(await config.locator('.wing-style option').count(),catalog.length+1);
 for(const row of catalog){
  const id=row.group===12&&row.num===5?'blade-knight':`wing-${row.group}-${row.num}`;
  await config.locator('.wing-style').selectOption(id);await config.locator('.save').click();await page.clock.runFor(1000);
  assert.equal(await page.evaluate(()=>window.__world.playerEntity.modelObject.Wings.mesh),`${row.group}/${row.num}`);
  assert.equal(await page.evaluate(()=>window.__world.playerEntity.charAppearance.wings.num),4);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mu.level-helper.demo-settings.v1')).wingStyle),id);
  await open();
 }
 await config.locator('.wing-style').selectOption('blade-knight');await config.locator('.save').click();await page.clock.runFor(1000);await open();
 // Rollback restores both persisted styles and tracking after a later provider fails.
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('mu-hub:register',{detail:{id:'failing-test',capabilities:{settings:{host:document.createElement('div'),order:30,begin(){},validate(){return null;},apply(){throw Error('demo rollback');},rollback(){},discard(){}}}}})));
 await config.locator('.wing-style').selectOption('original');await config.locator('.track-white-wizard').uncheck();await config.locator('.save').click();await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>window.__world.playerEntity.modelObject.Wings.mesh),'12/5');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mu.golden-radar.demo-settings.v1')).whiteWizard),true);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mu.level-helper.demo-settings.v1')).wingStyle),'blade-knight');
 await config.locator('.cancel').click();await page.reload();await open();assert.equal(await config.locator('.wing-style').inputValue(),'blade-knight');assert.equal(await config.locator('.track-white-wizard').isChecked(),true);assert.equal(await config.locator('.hide-helmet').isChecked(),false);
 await page.evaluate(()=>{const hero=window.__world.playerEntity;hero.charAppearance={wings:{group:12,num:4,lvl:9},changed:false};hero.modelObject={Ready:true,Wings:{Unload(){}},setWingsAsync(w){this.lastItem=w;return Promise.resolve();}};});
 await page.clock.runFor(1000);await page.evaluate(()=>window.__world.playerEntity.modelObject.setWingsAsync(window.__world.playerEntity.charAppearance.wings));assert.equal(await page.evaluate(()=>window.__world.playerEntity.modelObject.lastItem.num),5);
 await page.setViewportSize({width:375,height:640});await config.locator('.wing-style').scrollIntoViewIfNeeded();assert.equal(await config.locator('.wing-style').isVisible(),true);assert.equal(await config.locator('.window').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}),true);await config.locator('.window').screenshot({path:'docs/screenshots/visualization-wings-compact-preview.png'});
 assert.deepEqual(errors,[]);console.log('PASS Visualización: 16 deployed styles, Save/Cancel, cosmetic rendering, persisted rollback, reload restoration and compact viewport.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
