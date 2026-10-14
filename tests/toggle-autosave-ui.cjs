const {chromium}=require('../scripts/browser-runtime.cjs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:850,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('demos/helper/preview.html')).href);await page.addScriptTag({path:path.resolve('src/config/config.user.js')});
 const cfg=page.locator('#mu-config'),key='mu.level-helper.demo-settings.v1',open=()=>page.evaluate(()=>window.dispatchEvent(new CustomEvent('mu-config:open'))),raw=()=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
 const saved=()=>cfg.locator('.autosave-state').filter({hasText:'Switch guardado'}).waitFor();await open();
 await cfg.locator('.spot-x').first().fill('88');await cfg.locator('.map-level').fill('15');
 await cfg.locator('.auto-reset').uncheck();await saved();assert.equal((await raw()).autoReset,false);assert.equal((await raw()).spots.lorencia.x,47);assert.equal(await cfg.locator('.spot-x').first().inputValue(),'88');
 await cfg.locator('.soul-shield').uncheck();await saved();assert.equal((await raw()).soulShield,false);await cfg.locator('.cancel').click();await open();assert.equal(await cfg.locator('.auto-reset').isChecked(),false);assert.equal(await cfg.locator('.soul-shield').isChecked(),false);assert.equal(await cfg.locator('.spot-x').first().inputValue(),'47');
 await cfg.locator('.map-enabled').uncheck();await saved();assert.equal((await raw()).leveling.maps.find(m=>m.map==='lorencia').enabled,false);
 await cfg.locator('.map-enabled').check();await saved();await cfg.locator('.spot-enabled').first().uncheck();await saved();assert.equal((await raw()).leveling.maps.find(m=>m.map==='lorencia').spots[0].enabled,false);
 await cfg.locator('.spot-enabled').first().check();await saved();await cfg.locator('.spot-x').first().fill('80');await cfg.locator('.spot-enabled').first().click();await cfg.locator('.autosave-state').filter({hasText:'No guardado'}).waitFor();assert.equal((await raw()).leveling.maps.find(m=>m.map==='lorencia').spots[0].enabled,true);assert.equal(await cfg.locator('.spot-enabled').first().isChecked(),true);assert.equal(await cfg.locator('.spot-x').first().inputValue(),'80');
 await cfg.locator('.cancel').click();await open();
 for(const selector of ['.auto-reset','.soul-shield','.map-enabled','.spot-enabled']){const input=cfg.locator(selector).first();assert.equal(await input.getAttribute('role'),'switch');assert.equal(await input.evaluate(n=>getComputedStyle(n).appearance),'none');}
 const enabledBox=await cfg.locator('.map-enabled').boundingBox(),levelBox=await cfg.locator('.map-level').boundingBox();assert.ok(levelBox.y>enabledBox.y+enabledBox.height);
 await cfg.locator('.window').screenshot({path:'docs/screenshots/toggle-autosave-preview.png'});
 await page.evaluate(()=>{window.__originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='mu.level-helper.demo-settings.v1')throw Error('Storage full');return window.__originalSet.call(this,k,v);};});
 await cfg.locator('.auto-reset').click();await cfg.locator('.autosave-state').filter({hasText:'No guardado'}).waitFor();assert.equal(await cfg.locator('.auto-reset').isChecked(),false);assert.equal((await raw()).autoReset,false);await page.evaluate(()=>Storage.prototype.setItem=window.__originalSet);
 const beforeFailedSave=await raw();await page.evaluate(()=>{const host=document.createElement('div');window.dispatchEvent(new CustomEvent('mu-hub:register',{detail:{id:'failing-save-demo',capabilities:{settings:{host,order:999,title:'Demo failure',begin(){},validate(){return null;},apply(){throw Error('Demo apply failure');},rollback(){},discard(){}}}}}));});
 await cfg.locator('.spot-x').first().fill('81');await cfg.locator('.save').click();await cfg.locator('.content > .error').filter({hasText:'restauraron'}).waitFor();assert.deepEqual(await raw(),beforeFailedSave);
 await cfg.locator('.cancel').click();await page.reload();await page.addScriptTag({path:path.resolve('src/config/config.user.js')});await open();assert.equal(await cfg.locator('.auto-reset').isChecked(),false);assert.equal(await cfg.locator('.soul-shield').isChecked(),false);assert.deepEqual(errors,[]);
 console.log('PASS autosave switches: isolated fields, cancel/reload, maps/spots, pending coordinates, storage failure, layout and accessibility.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
