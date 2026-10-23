'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('../scripts/browser-runtime.cjs');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'src/extension/page-bridge.js'),'utf8');
const kanturu=process.argv.includes('--kanturu'),oct22=process.argv.includes('--oct22'),recheck=process.argv.includes('--recheck'),entry=kanturu?'/assets/index-C5JIMxmo.js':oct22?'/assets/index-D-gOSya0.js':recheck?'/assets/index-Do3IjarP.js':'/assets/index-URnTVW_1.js',layout=kanturu?'/assets/layout-A1P3A0u1.js':oct22?'/assets/layout-DCITLqBq.js':recheck?'/assets/layout-CoOAKkh-.js':'/assets/layout-DQbdTT-G.js';
const script=code=>`<script nonce="fixture">${code.replace(/<\/script/gi,'<\\/script')}</script>`;
const setup=`window.nativeFixture={store:{uiState:5,playerData:{name:'FixtureHero',charClass:16},username:'FixtureAccount',accountFor:'fixture/account',gsSocket:{readyState:1,url:'wss://fixture.invalid'},world:{mapIndex:33}},social:{sendChat(){window.commands++;}},bus:{on(){},off(){}}};window.commands=0;window.moduleLoads=0;window.nativeGate=new Promise(resolve=>window.releaseNative=resolve);`;
const html=mode=>'<!doctype html>'+script(setup)+(mode==='legacy'?script(`Object.assign(window,{__store:nativeFixture.store,__world:nativeFixture.store.world,__social:nativeFixture.social,__eventBus:nativeFixture.bus});`):mode==='partial'?script('window.__social={stale:true};'):'')+script(source)+`<script type="module" src="${mode==='unknown'?'/assets/index-unknown.js':entry}"></script>`;
async function state(page){return page.evaluate(()=>({...window[Symbol.for('mu.addons.client-compat.v1')]}));}
async function settled(page){await page.waitForFunction(()=>['ready','legacy','error','unsupported'].includes(window[Symbol.for('mu.addons.client-compat.v1')]?.state));return state(page);}
async function hello(page){return page.evaluate(()=>new Promise(resolve=>{
 const handler=e=>{if(e.data?.bridge==='mu-panel-v1'&&e.data.direction==='response'){window.removeEventListener('message',handler);resolve(e.data.result);}};
 window.addEventListener('message',handler);window.postMessage({bridge:'mu-panel-v1',direction:'request',channel:'fixture',id:1,request:{op:'hello'}},location.origin);
}));}
(async()=>{
 const browser=await chromium.launch({headless:true}),checks=[];
 try{
  for(const mode of ['known','legacy','late','invalid','fetch-error','partial','unknown']){
   const context=await browser.newContext(),page=await context.newPage();let imports=0;
   await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.pathname===layout){imports++;if(mode==='fetch-error')return route.fulfill({status:404,body:'missing'});return route.fulfill({contentType:'text/javascript',body:`window.moduleLoads++;${mode==='late'?'await window.nativeGate;':''}const {store:n,social:V,bus:aw}=window.nativeFixture;${mode==='invalid'?'export {n,V};':'export {n,V,aw};'}`});}
    if(url.pathname===entry||url.pathname==='/assets/index-unknown.js')return route.fulfill({contentType:'text/javascript',body:mode==='known'?`import {n} from '${layout}';window.entryStore=n;`:''});
    return route.fulfill({contentType:'text/html',headers:{'Content-Security-Policy':"default-src 'none'; script-src 'self' 'nonce-fixture'; style-src 'unsafe-inline'"},body:html(mode)});
   });
   await page.goto('https://mu.mormon.garden/'+mode,{waitUntil:'domcontentloaded'});
   if(mode==='late'){
    assert.equal((await state(page)).state,'loading');assert.equal((await hello(page)).status.identity.ready,false);
    assert.equal(await page.evaluate(()=>Object.hasOwn(window,'__store')),false);await page.evaluate(()=>window.releaseNative());
   }
   const status=await settled(page),response=await hello(page);assert.equal(response.ok,true);assert.equal(response.status.client.state,status.state);
   if(['known','late','legacy'].includes(mode)){
    assert.equal(status.state,mode==='legacy'?'legacy':'ready');assert.equal(response.status.identity.character,'FixtureHero');assert.equal(response.status.identity.ready,true);
    assert.equal(await page.evaluate(()=>__store===nativeFixture.store&&__social===nativeFixture.social&&__eventBus===nativeFixture.bus),true);
    assert.equal(imports,mode==='legacy'?0:1);assert.equal(await page.evaluate(()=>moduleLoads),mode==='legacy'?0:1);
    if(mode!=='legacy'){
     if(mode==='known')assert.equal(await page.evaluate(()=>entryStore===__store),true);
     await page.evaluate(()=>{nativeFixture.store.world=null;});assert.equal(await page.evaluate(()=>__world),null);
     await page.evaluate(()=>{nativeFixture.store.world={mapIndex:29};});assert.equal(await page.evaluate(()=>__world.mapIndex),29);
     await page.evaluate(code=>{const s=document.createElement('script');s.nonce='fixture';s.textContent=code;document.head.append(s);},source);
     assert.equal(await page.evaluate(()=>__store===nativeFixture.store),true);assert.equal(await page.evaluate(()=>moduleLoads),1);
    }
   }else{
    assert.equal(status.state,mode==='unknown'?'unsupported':'error');assert.equal(response.status.identity.ready,false);assert.match(status.message,/cliente|Cliente/);
    assert.equal(await page.evaluate(()=>Object.hasOwn(window,'__store')||Object.hasOwn(window,'__world')||Object.hasOwn(window,'__eventBus')),false);
    if(mode==='unknown')assert.equal(imports,0);
   }
   assert.equal(await page.evaluate(()=>commands),0);checks.push(mode);await context.close();
  }
  fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});fs.writeFileSync(path.join(root,'artifacts/extension-client-validation.json'),JSON.stringify({checks,limitations:['Isolated fixtures; no real account, client boot or server commands.']},null,2)+'\n');
  console.log('PASS extension client compatibility ('+checks.join(', ')+')');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
