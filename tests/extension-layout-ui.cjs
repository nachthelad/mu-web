'use strict';
// Real extension, intercepted demo document: no account or game-server access.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('../scripts/browser-runtime.cjs');
const {build,modules}=require('../scripts/extension-package.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const baseline=process.argv.includes('--baseline'),phase=baseline?'before':'after';
const output=path.join(root,'artifacts/ui-revamp');fs.mkdirSync(output,{recursive:true});
const temp=fs.mkdtempSync(path.join(root,'tests/.layout-browser-')),packageDir=path.join(temp,'package');fs.mkdirSync(packageDir);
const data=Object.fromEntries(Object.entries(modules).map(([id,name])=>[id,Buffer.from(read(`src/${id}/${name}`))]));
for(const [name,bytes] of Object.entries(build(data).files))fs.writeFileSync(path.join(packageDir,name),bytes);
const script=code=>`<script nonce="mu-demo">${code.replace(/<\/script/gi,'<\\/script')}</script>`;
const base=read('demos/hub/preview.html').replace(/<script[\s\S]*?<\/script>/g,'')+'<div class="scene"></div><button id="toggle"></button><button id="vitals"></button><p id="feedback"></p>';
const key='mu.level-helper.settings.v1.account.'+encodeURIComponent(JSON.stringify(['layout-world','LayoutDemo']));
const {DEFAULTS,LEVEL_MAPS}=require('../src/helper/level-helper.user.js');
const preferences={...DEFAULTS,version:1,leveling:{version:1,maps:LEVEL_MAPS.map(m=>({map:m.id,enabled:['lorencia','devias','tarkan'].includes(m.id),level:m.minLevel,spots:m.id==='lorencia'?[[66,70],[54,82],[73,61],[80,65],[84,70],[89,77]].map(([x,y],i)=>({x,y,enabled:i!==2})):[{x:100,y:110,enabled:true}]}))}};
const setup=`window.__LEVEL_HELPER_DEMO__=false;__store.username='LayoutDemo';__store.accountFor='layout-world/a1';__store.gsSocket.url='wss://demo.invalid:444';localStorage.setItem(${JSON.stringify(key)},${JSON.stringify(JSON.stringify(preferences))});`;
const fixture=base+script(read('demos/helper/demo.js'))+script(read('demos/hub/golden-hunt-demo.js'))+script(setup)+script(read('demos/interface/demo.js'));
const tabs=[['level','.map-select'],['obtain','.excellent-names'],['caza','.balrog-play'],['party','.send-party'],['appearance','.wing-style'],['stats','.detailed-stats']];
(async()=>{let context;const results=[],errors=[];try{
 context=await chromium.launchPersistentContext(path.join(temp,'profile'),{channel:'chromium',headless:true,ignoreDefaultArgs:['--disable-extensions'],viewport:{width:1920,height:1080},args:[`--disable-extensions-except=${packageDir}`,`--load-extension=${packageDir}`]});
 context.on('page',p=>p.on('pageerror',e=>errors.push(e.message)));
 await context.route('**/*',r=>new URL(r.request().url()).protocol==='chrome-extension:'?r.continue():r.request().isNavigationRequest()?r.fulfill({status:200,contentType:'text/html',headers:{'Content-Security-Policy':"default-src 'none'; script-src 'nonce-mu-demo'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'"},body:fixture}):r.abort());
 const game=await context.newPage();await game.goto('https://mu.mormon.garden/layout-demo');await game.waitForFunction(()=>window[Symbol.for('mu.addons.instance.helper.v1')]);
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const panel=await context.newPage();await panel.goto(`chrome-extension://${new URL(worker.url()).host}/panel.html`);await panel.locator('#connect').click();await panel.locator('.map-select').waitFor();
 await panel.locator('.map-select').selectOption('lorencia');await panel.locator('.map-spot').nth(5).waitFor();assert.equal(await panel.locator('.map-spot').count(),6,'fixture must include six original spots');
 for(const width of baseline?[1920,1360,390]:[1920,1360,900,390,320]){await panel.setViewportSize({width,height:width<=390?844:width===1360?1000:1080});
  for(const [tab,control] of tabs){await panel.locator('#config-section').selectOption(tab);await panel.locator(control).waitFor();await panel.evaluate(()=>window.scrollTo(0,0));
   const geometry=await panel.evaluate(()=>{const main=document.querySelector('main'),mirror=document.querySelector('#mirror');return{width:innerWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight,scrollWidth:document.documentElement.scrollWidth,mainWidth:main.getBoundingClientRect().width,mirrorWidth:mirror.getBoundingClientRect().width};});
   results.push({tab,...geometry});if(!baseline){assert.ok(geometry.scrollWidth<=width+1,`${tab} page overflows at ${width}: ${geometry.scrollWidth}`);
    assert.equal(await panel.locator('#heading').textContent(),await panel.locator('#config-section option:checked').textContent(),'section heading follows the original selected tab');
    const controls=panel.locator('#mirror').locator('input,select,textarea,button');
    for(const control of await controls.all()){if(!await control.isVisible())continue;const box=await control.boundingBox();assert.ok(box.x>=-1&&box.x+box.width<=width+1,`${tab}: control outside viewport at ${width}`);}
    if(tab==='level'&&width>=1360){const editor=await panel.locator('.map-spots').boundingBox(),summary=await panel.locator('.map-plan').boundingBox();assert.ok(summary.x>=editor.x+editor.width,'progression stays alongside the editor');}
   }
   await panel.screenshot({path:path.join(output,`${phase}-${tab}-${width}.png`),fullPage:true});
  }
 }
 if(!baseline){await panel.setViewportSize({width:1360,height:1000});await panel.locator('#config-section').selectOption('level');await panel.locator('.spot-x').first().fill('47');await panel.locator('.spot-x').first().focus();const handle=await panel.locator('.spot-x').first().elementHandle();await panel.waitForTimeout(1300);assert.equal(await handle.evaluate(n=>n.isConnected&&n.getRootNode().activeElement===n&&n.value==='47'),true,'same focused node survives projection');
  await panel.keyboard.press('Tab');assert.equal(await panel.locator('.spot-y').first().evaluate(n=>n.getRootNode().activeElement===n),true,'keyboard proceeds from X to Y');
  await panel.locator('.level-recovery > summary').click();await panel.locator('.legacy-edit').click();await panel.locator('.steps').waitFor();assert.equal(await panel.locator('.map-edit').isVisible(),true,'legacy recovery remains operable');
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(output,`${phase}-metrics.json`),JSON.stringify(results,null,2));console.log(`Layout ${phase}: ${results.length} comparable captures; ${baseline?'baseline recorded':'overflow, focus, keyboard and recovery passed'}`);
}finally{await context?.close();if(temp.startsWith(path.join(root,'tests')+path.sep))fs.rmSync(temp,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
