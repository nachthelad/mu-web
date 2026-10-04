const {chromium}=require('../scripts/browser-runtime.cjs');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('demos/helper/preview.html')).href);
  const helper=page.locator('#mu-level-helper');assert.equal(await helper.count(),1);
  assert.equal(await helper.locator('.config').isVisible(),false);
  await helper.locator('.settings').click();assert.equal(await helper.locator('.config').isVisible(),true);
  await helper.locator('.toggle').click();await page.waitForFunction(()=>document.getElementById('mu-level-helper').shadowRoot.querySelector('.toggle').getAttribute('aria-pressed')==='true');
  await helper.locator('.toggle').click();assert.equal(await helper.locator('.toggle').getAttribute('aria-pressed'),'false');
  await page.screenshot({path:'docs/screenshots/helper-current.png'});
  assert.deepEqual(errors,[]);console.log('PASS Helper: standalone, settings, start/pause, no JS errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
