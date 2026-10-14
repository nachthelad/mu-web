const {chromium}=require('../scripts/browser-runtime.cjs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:900,height:900}});await page.goto(pathToFileURL(path.resolve('demos/helper/character-panels.html')).href);
 const cfg=page.locator('#mu-config'),open=async()=>{await page.locator('#mu-hub header > .settings').click();await cfg.getByRole('tab',{name:'Estadísticas',exact:true}).click();},key='mu.level-helper.demo-settings.v1';
 await open();await cfg.locator('.detailed-stats').check();await cfg.locator('.stats-save-state').filter({hasText:'guardado automáticamente'}).waitFor();assert.equal(await page.locator('.mu-item-window').count(),0);
 assert.equal(await cfg.locator('.detailed-stats').evaluate(n=>getComputedStyle(n).appearance),'none');
 const help=cfg.locator('.stats-help summary').last();await help.hover();assert.equal(await cfg.locator('#stats-help').isVisible(),true);await help.focus();await page.keyboard.press('Enter');assert.equal(await cfg.locator('#stats-help').isVisible(),true);await page.keyboard.press('Enter');
 await cfg.locator('.cancel').click();await open();assert.equal(await cfg.locator('.detailed-stats').isChecked(),true);
 await page.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='mu.level-helper.demo-settings.v1')throw Error('Storage full');return originalSet.call(this,k,v);};});
 await cfg.locator('.detailed-stats').click();await cfg.locator('.stats-save-state').filter({hasText:'No guardado'}).waitFor();assert.equal(await cfg.locator('.detailed-stats').isChecked(),true);
 await page.evaluate(()=>Storage.prototype.setItem=originalSet);await cfg.locator('.cancel').click();await page.reload();await open();assert.equal(await cfg.locator('.detailed-stats').isChecked(),true);
 await cfg.getByRole('tab',{name:'Leveleo',exact:true}).click();await cfg.locator('.spot-x').first().fill('88');await cfg.getByRole('tab',{name:'Estadísticas',exact:true}).click();await cfg.locator('.detailed-stats').uncheck();await cfg.locator('.stats-save-state').filter({hasText:'guardado automáticamente'}).waitFor();await cfg.locator('.cancel').click();await open();assert.equal(await cfg.locator('.detailed-stats').isChecked(),false);await cfg.getByRole('tab',{name:'Leveleo',exact:true}).click();assert.equal(await cfg.locator('.spot-x').first().inputValue(),'47');
 assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).detailedStats,key),false);
 console.log('PASS detailed stats autosave: cancel/reload, no native window opening, independent draft, storage failure and keyboard help');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
