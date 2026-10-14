'use strict';
const crypto=require('node:crypto');
const fs=require('node:fs'),path=require('node:path');
const assets=['worker.js','page-bridge.js','content-bridge.js','panel.html','panel.css','panel.js','renderer.js'];
const modules={radar:'golden-radar.user.js',helper:'level-helper.user.js',config:'config.user.js',analytics:'analytics.user.js',interface:'interface.user.js',hub:'hub.user.js'};
const sha256=data=>crypto.createHash('sha256').update(data).digest('hex');
function build(data,version='1.0.0',external=true){
 if(!/^\d+\.\d+\.\d+$/.test(version)||version.split('.').some(n=>Number(n)>65535))throw Error('Versión de extensión inválida');
 const files={};
 for(const [id,name] of Object.entries(modules)){
  if(!data[id])throw Error('Falta módulo de extensión: '+id);
  const text=data[id].toString();
  const matches=[...text.matchAll(/^\/\/\s*@match\s+(\S+)/gm)].map(m=>m[1]);
  if(JSON.stringify(matches)!==JSON.stringify(['https://mu.mormon.garden/*'])||!/^\/\/\s*@grant\s+none\s*$/m.test(text)||!/^\/\/\s*@run-at\s+document-idle\s*$/m.test(text))throw Error('Metadatos incompatibles con extensión: '+id);
  files[name]=Buffer.from(data[id]);
 }
 const manifest={manifest_version:3,name:'MU · Addons locales',version,minimum_chrome_version:'120',description:'Radar, Helper, Config, Analytics, Interface y HUB para MU.',content_scripts:[{matches:['https://mu.mormon.garden/*'],js:Object.values(modules),run_at:'document_idle',world:'MAIN',all_frames:false}]};
 if(external){
  for(const name of assets)files[name]=fs.readFileSync(path.join(__dirname,'../src/extension',name));
  manifest.action={default_title:'Abrir centro de control MU'};
  manifest.background={service_worker:'worker.js'};
  manifest.host_permissions=['https://mu.mormon.garden/*'];
  manifest.content_security_policy={extension_pages:"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'"};
  manifest.content_scripts.unshift({matches:['https://mu.mormon.garden/*'],js:['page-bridge.js'],run_at:'document_start',world:'MAIN',all_frames:false});
  manifest.content_scripts.push({matches:['https://mu.mormon.garden/*'],js:['content-bridge.js'],run_at:'document_idle',world:'ISOLATED',all_frames:false});
 }
 files['manifest.json']=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
 const hashes=Object.fromEntries(Object.keys(files).sort().map(name=>[name,sha256(files[name])]));
 const metadata={version,sha256:sha256(JSON.stringify(hashes)),files:hashes};
 return {files,metadata};
}
function verify(metadata,read,data){
 if(!metadata||typeof metadata.files!=='object')throw Error('Metadatos de extensión inválidos');
 const external=Object.hasOwn(metadata.files,'panel.html');
 const expected=external?null:build(data,metadata.version,false);
 // Historical archives retain their own UI assets, independent of current src.
 const hashes={};const files={};
 for(const [name,digest] of Object.entries(metadata.files)){
  if(!/^[\w.-]+$/.test(name))throw Error('Ruta de extensión inválida');
  files[name]=Buffer.from(read(name));hashes[name]=sha256(files[name]);
  if(hashes[name]!==digest)throw Error('Hash de extensión incorrecto: '+name);
 }
 if(external){
  if(metadata.sha256!==sha256(JSON.stringify(Object.fromEntries(Object.keys(hashes).sort().map(n=>[n,hashes[n]])))))throw Error('Hash/metadatos de extensión incorrectos');
  for(const [id,name] of Object.entries(modules))if(!files[name]||!files[name].equals(Buffer.from(data[id])))throw Error('Hash de módulo de extensión incorrecto: '+id);
  const manifest=JSON.parse(files['manifest.json']);
  if(manifest.version!==metadata.version||manifest.manifest_version!==3||!assets.every(n=>files[n]))throw Error('Metadatos de extensión inválidos');
  if(JSON.stringify(manifest.host_permissions)!==JSON.stringify(['https://mu.mormon.garden/*'])||manifest.permissions?.length||manifest.web_accessible_resources?.length||manifest.content_scripts.some(c=>JSON.stringify(c.matches)!==JSON.stringify(['https://mu.mormon.garden/*'])||c.all_frames!==false))throw Error('Alcance de extensión inválido');
  return files;
 }
 if(JSON.stringify(metadata)!==JSON.stringify(expected.metadata))throw Error('Hash/metadatos de extensión incorrectos');
 for(const [name,digest] of Object.entries(expected.metadata.files)){
  files[name]=read(name);
  if(sha256(files[name])!==digest)throw Error('Hash de extensión incorrecto: '+name);
 }
 return files;
}
module.exports={build,verify,modules,assets};
