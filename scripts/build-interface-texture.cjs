// Convert the generated artwork to a small embedded texture. Run before release.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('./browser-runtime.cjs');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();await page.goto(pathToFileURL(path.resolve('src/interface/assets/ornate-frame-generated.png')).href);
 // Crop the generator's external black padding; keep complete ornamental ends.
 const data=await page.evaluate(async()=>{const img=document.querySelector('img');await img.decode();const c=document.createElement('canvas');c.width=576;c.height=96;c.getContext('2d').drawImage(img,0,180,img.naturalWidth,355,0,0,576,96);return c.toDataURL('image/webp',0.92);});
 fs.writeFileSync('src/interface/assets/ornate-frame.webp',Buffer.from(data.split(',')[1],'base64'));
 const file='src/interface/interface.user.js',source=fs.readFileSync(file,'utf8');
 const line=`  const METAL_TEXTURE = '${data}'; // embedded-generated-texture`;
 fs.writeFileSync(file,source.includes('// embedded-generated-texture')?source.replace(/^  const METAL_TEXTURE = .*\/\/ embedded-generated-texture$/m,line):source.replace("  let enabled = true;",line+"\n  let enabled = true;"));
 console.log('Textura incorporada: '+Buffer.from(data.split(',')[1],'base64').length+' bytes.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
