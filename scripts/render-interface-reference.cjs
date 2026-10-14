// Static visual comparison on the user's installed 1.1.0 capture, not live-game proof.
const {chromium}=require('./browser-runtime.cjs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:1919,height:147}});
 await page.goto(pathToFileURL(path.resolve('demos/interface/preview.html')).href);await page.waitForSelector('[data-mu-interface]');
 const css=await page.locator('.mui-side-frame').first().evaluate(n=>{const s=getComputedStyle(n);return {borderImageSource:s.borderImageSource,borderImageSlice:s.borderImageSlice,borderImageRepeat:s.borderImageRepeat};});
 const reference=pathToFileURL(path.resolve('docs/screenshots/interface-installed-1.1.0.png')).href;
 await page.setContent('<style>body{margin:0;background:#000}img{display:block;width:1919px;height:147px}</style><img>');
 await page.locator('img').evaluate((img,url)=>img.src=url,reference);await page.locator('img').evaluate(img=>img.decode());
 await page.evaluate(css=>{for(const [side,w] of [['left',557],['right',549]]){const n=document.createElement('div');Object.assign(n.style,css,{position:'absolute',top:'62px',height:'70px',width:w+'px',boxSizing:'border-box',borderStyle:'solid',borderColor:'transparent',borderWidth:'0 67px',[side]:'0px'});document.body.append(n);}},css);
 // Retain the captured native chat toggle above the decorative left panel.
 await page.evaluate(url=>{const n=document.createElement('div');Object.assign(n.style,{position:'absolute',left:'8px',top:'97px',width:'29px',height:'29px',backgroundImage:`url("${url}")`,backgroundPosition:'-8px -97px',backgroundSize:'1919px 147px'});document.body.append(n);},reference);
 await page.screenshot({path:'docs/screenshots/interface-ornate-reference-preview.png'});
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
