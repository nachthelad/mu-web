'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('../scripts/browser-runtime.cjs');
const {build,verify,modules}=require('../scripts/extension-package.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=Object.fromEntries(Object.entries(modules).map(([id,name])=>[id,Buffer.from(read(`src/${id}/${name}`))]));
const packageIndex=process.argv.indexOf('--package');
if(packageIndex>=0&&!process.argv[packageIndex+1])throw Error('Falta ruta de paquete');
const requestedPackage=packageIndex>=0?path.resolve(root,process.argv[packageIndex+1]):null;
const packageVersion=requestedPackage?JSON.parse(fs.readFileSync(path.join(requestedPackage,'manifest.json'))).version:process.env.MU_EXTENSION_VERSION||'1.0.0';
if(requestedPackage&&JSON.parse(fs.readFileSync(path.join(requestedPackage,'manifest.json'))).background){require('node:child_process').execFileSync(process.execPath,[path.join(__dirname,'extension-panel-ui.cjs'),'--package',requestedPackage],{stdio:'inherit'});return;}
const bundle=build(data,packageVersion,false),temporary=fs.mkdtempSync(path.join(root,'tests/.extension-browser-'));
const packageDir=requestedPackage||path.join(temporary,'package');
if(requestedPackage)verify(bundle.metadata,name=>fs.readFileSync(path.join(packageDir,name)),data);
else {fs.mkdirSync(packageDir);for(const [name,bytes] of Object.entries(bundle.files))fs.writeFileSync(path.join(packageDir,name),bytes);}
const script=code=>`<script nonce="mu-demo">${code.replace(/<\/script/gi,'<\\/script')}</script>`;
const instrumentation=`window.__metrics={intervals:0,listeners:0,registrations:[],violations:[]};
const nativeInterval=window.setInterval;window.setInterval=function(...args){window.__metrics.intervals++;return nativeInterval.apply(this,args)};
const nativeListen=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(...args){window.__metrics.listeners++;return nativeListen.apply(this,args)};
window.__modules=new Map();window.addEventListener('mu-hub:register',e=>{window.__metrics.registrations.push(e.detail.id);window.__modules.set(e.detail.id,e.detail)});
document.addEventListener('securitypolicyviolation',e=>window.__metrics.violations.push(e.violatedDirective));`;
const base=read('demos/hub/preview.html').replace(/<script[\s\S]*?<\/script>/g,'')+'<div class="scene"></div><button id="toggle"></button><button id="vitals"></button><p id="feedback"></p>';
const fixture=first=>base+script(instrumentation)+script(read('demos/helper/demo.js'))+script(read('demos/hub/golden-hunt-demo.js'))+script(`window.__LEVEL_HELPER_DEMO__=location.hostname!=='mu.mormon.garden';window.__store.username='ExtensionDemo';window.__store.accountFor='extension-world/a1';window.__store.playerData.exp=10000;window.__store.gsSocket.url='wss://demo.invalid:444';`)+script(read('demos/interface/demo.js'))+(first?Object.values(modules).map(name=>script(bundle.files[name].toString())).join(''):'');
const csp="default-src 'none'; script-src 'nonce-mu-demo'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'";
async function duplicate(page,files){
 return page.evaluate(files=>{
  const before={intervals:__metrics.intervals,listeners:__metrics.listeners,commands:commands.length};
  const hosts=[...__modules.values()].map(m=>m.host);
  for(const code of files){const tag=document.createElement('script');tag.nonce='mu-demo';tag.textContent=code;document.body.append(tag);tag.remove();}
  const after={intervals:__metrics.intervals,listeners:__metrics.listeners,commands:commands.length};
  return {before,after,sameHosts:hosts.every(h=>[...__modules.values()].some(m=>m.host===h))};
 },files);
}
async function check(page){
 await page.waitForFunction(()=>window.__modules?.size===4&&window[Symbol.for('mu.addons.instance.interface.v1')]);
 for(const id of ['mu-hub','mu-golden-radar','mu-level-helper','mu-config','mu-analytics','mu-interface-style'])assert.equal(await page.locator('#'+id).count(),1,id);
 assert.equal(await page.locator('#mu-hub #mu-level-helper').count(),1);
 assert.equal(await page.locator('.v097d-bottom-bar[data-mu-interface]').count(),1);
 assert.equal(await page.locator('#mu-hub header').evaluate(h=>h.lastElementChild.className),'minimize');
 const result=await duplicate(page,Object.values(modules).map(n=>bundle.files[n].toString()));assert.deepEqual(result.before,result.after);assert.equal(result.sameHosts,true);
 assert.equal(await page.evaluate(()=>__modules.get('radar').actions.huntingData().ready),true);
}
(async()=>{
 let context;const errors=[];
 try{
  context=await chromium.launchPersistentContext(path.join(temporary,'profile'),{channel:'chromium',headless:true,ignoreDefaultArgs:['--disable-extensions'],viewport:{width:1100,height:850},args:[`--disable-extensions-except=${packageDir}`,`--load-extension=${packageDir}`]});
  await context.route('**/*',route=>{
   const url=new URL(route.request().url());
   if(route.request().isNavigationRequest())return route.fulfill({status:200,contentType:'text/html',headers:{'Content-Security-Policy':csp},body:url.pathname==='/outside'?'<html><body>Fuera del juego</body></html>':fixture(url.pathname==='/userscripts-first')});
   return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://mu.mormon.garden/extension-first');await check(page);
  const ordered=await page.evaluate(()=>[...new Set(__metrics.registrations)].filter(id=>id!=='hub'));
  assert.deepEqual(ordered,['radar','helper','config','analytics']);
  const cfg=page.locator('#mu-config');
  await page.locator('#mu-hub header > .settings').click();
  const reset=cfg.locator('.auto-reset');const old=await reset.isChecked();await reset.setChecked(!old);await cfg.locator('.cancel').click();
  await page.locator('#mu-hub header > .settings').click();await cfg.locator('.autosave-state').filter({hasText:'Switch guardado'}).waitFor();assert.equal(await reset.isChecked(),!old);
  await reset.setChecked(!old);await cfg.locator('.save').click();await cfg.locator('.window').waitFor({state:'hidden'});
  const settings=await page.evaluate(()=>localStorage.getItem('mu.level-helper.settings.v1.account.'+encodeURIComponent(JSON.stringify(['extension-world','ExtensionDemo']))));assert.equal(JSON.parse(settings).autoReset,!old);
  // Production keys on a locally fulfilled game URL; never a real account.
  await page.evaluate(()=>{localStorage.setItem('mu.golden-radar.sightings.v1','{"version":1,"records":[]}');localStorage.setItem('mu.analytics.history.v1','{"version":1,"records":[]}');});
  await page.reload();await check(page);assert.equal(await page.evaluate(()=>localStorage.getItem('mu.level-helper.settings.v1.account.'+encodeURIComponent(JSON.stringify(['extension-world','ExtensionDemo'])))),settings);
  assert.equal(await page.evaluate(()=>localStorage.getItem('mu.analytics.history.v1')),'{"version":1,"records":[]}');
  await page.locator('#mu-hub header > .toggle').click();assert.equal(await page.locator('#mu-hub header > .toggle').getAttribute('aria-pressed'),'true');
  await page.locator('#mu-hub header > .toggle').click();assert.equal(await page.locator('#mu-hub header > .toggle').getAttribute('aria-pressed'),'false');
  await page.locator('#mu-hub').getByRole('button',{name:'Ver EXP por spot'}).click();
  await page.locator('#mu-analytics .start').click();await page.evaluate(()=>goldDemoEmit('experienceGained',{added:12000}));await page.locator('#mu-analytics .stop').click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('mu.analytics.history.v1')).records.at(-1).exp),12000);
  const texture=await page.evaluate(async()=>{const css=document.getElementById('mu-interface-style').textContent;const src=css.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/)?.[0];if(!src)return false;const img=new Image();img.src=src;await img.decode();return img.naturalWidth>0});assert.equal(texture,true);
  const violations=await page.evaluate(()=>__metrics.violations);assert.deepEqual(violations,[]);
  fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});await page.screenshot({path:path.join(root,'artifacts/chrome-extension-demo.png')});
  await page.goto('https://mu.mormon.garden/userscripts-first');await check(page);
  await page.locator('#mu-hub header > .settings').click();assert.equal(await reset.isChecked(),!old);await cfg.locator('.cancel').click();
  await page.goto('https://example.invalid/outside');assert.equal(await page.locator('#mu-hub').count(),0);
  await page.goto('http://mu.mormon.garden/outside');assert.equal(await page.locator('#mu-hub').count(),0);
  // Late discovery and alternative module order without extension injection.
  await page.goto('https://example.invalid/alternate');
  await page.evaluate(()=>{window.__GOLDEN_RADAR_DEMO__=true;window.__ANALYTICS_DEMO__=true;});
  for(const id of ['hub','analytics','config','helper','radar','interface'])await duplicate(page,[data[id].toString()]);
  await check(page);
  assert.deepEqual(errors,[]);
  const evidence={browser:context.browser().version(),extensionVersion:bundle.metadata.version,packageSha256:bundle.metadata.sha256,checks:['actual MV3 MAIN injection','narrow HTTPS scope','six unique hosts','original hosts mounted','both duplicate load orders: no extra intervals/listeners/commands','late discovery','play/pause','Config save/cancel/reload','localStorage continuity','Analytics events','inline styles and embedded texture under fixture CSP'],limitations:['Fixtures only; no real account or game connection.','Live site CSP and real gameplay remain unverified.']};
  fs.writeFileSync(path.join(root,'artifacts/chrome-extension-validation.json'),JSON.stringify(evidence,null,2)+'\n');
  console.log('PASS extension browser '+evidence.browser+' (isolated profile; local fixtures; no game connection)');
 }finally{if(context)await context.close();fs.rmSync(temporary,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
