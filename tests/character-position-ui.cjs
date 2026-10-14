const {chromium}=require('../scripts/browser-runtime.cjs'),assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true});try{for(const skin of ['season6','v097d']){
 const page=await browser.newPage({viewport:{width:1280,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto(pathToFileURL(path.resolve('demos/helper/character-panels.html')).href+'?skin='+skin);await page.clock.runFor(600);
 const cfg=page.locator('#mu-config'),c=page.locator(skin==='v097d'?'.v097d-character':'.character-info'),v=page.locator(skin==='v097d'?'.v097d-inventory':'.inventory');
 const open=async()=>{await page.locator('#mu-hub header > .settings').click();await cfg.getByRole('tab',{name:'Estadísticas',exact:true}).click();};
 await open();await cfg.locator('.pair-inventory').check();await page.clock.runFor(600);await cfg.locator('.detailed-stats').check();await page.clock.runFor(600);await cfg.locator('.cancel').click();await page.locator('#native-c').click();await page.locator('#native-v').click();await page.clock.runFor(600);
 const drag=async(target,dx,dy)=>{const b=await target.locator(':scope > header').boundingBox();await page.mouse.move(b.x+35,b.y+8);await page.mouse.down();await page.mouse.move(b.x+35+dx,b.y+8+dy,{steps:10});await page.mouse.up();};
 await drag(c,170,130);await drag(v,-170,160);const styles=await Promise.all([c.evaluate(e=>e.style.cssText),v.evaluate(e=>e.style.cssText)]);
 await page.clock.runFor(2500);assert.deepEqual(await Promise.all([c.evaluate(e=>e.style.cssText),v.evaluate(e=>e.style.cssText)]),styles);
 await page.locator('#staff-b').click();await page.clock.runFor(600);assert.deepEqual(await Promise.all([c.evaluate(e=>e.style.cssText),v.evaluate(e=>e.style.cssText)]),styles);
 await page.locator('#mu-helper-stats .capture-a').click();await page.clock.runFor(600);assert.deepEqual(await Promise.all([c.evaluate(e=>e.style.cssText),v.evaluate(e=>e.style.cssText)]),styles);
 await open();await cfg.locator('.detailed-stats').uncheck();await page.clock.runFor(600);await cfg.locator('.cancel').click();assert.deepEqual(await Promise.all([c.evaluate(e=>e.style.cssText),v.evaluate(e=>e.style.cssText)]),styles);
 await page.locator('#native-v').click();await page.locator('#native-v').click();await page.clock.runFor(600);assert.deepEqual(await Promise.all([c.evaluate(e=>e.style.cssText),v.evaluate(e=>e.style.cssText)]),styles);
 await page.reload();await page.clock.runFor(600);await page.locator('#native-c').click();await page.locator('#native-v').click();await page.clock.runFor(600);assert.deepEqual(await Promise.all([c.evaluate(e=>e.style.cssText),v.evaluate(e=>e.style.cssText)]),styles);
 assert.deepEqual(errors,[]);console.log('PASS '+skin+' C/V native drag placement survives refresh, item change, A/B, stats OFF, recreation and reload (native persistence scaffold)');await page.close();
}}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
