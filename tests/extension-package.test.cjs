const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {build,verify,modules}=require('../scripts/extension-package.cjs');
const data=Object.fromEntries(Object.entries(modules).map(([id,name])=>[id,fs.readFileSync(path.resolve('src',id,name))]));
test('MV3 package preserves canonical bytes, narrow MAIN scope and deterministic hashes',()=>{
 const a=build(data),b=build(data);assert.deepEqual(a.metadata,b.metadata);
 const m=JSON.parse(a.files['manifest.json']);assert.equal(m.manifest_version,3);assert.equal(m.minimum_chrome_version,'120');
 assert.deepEqual(m.content_scripts[1],{matches:['https://mu.mormon.garden/*'],js:Object.values(modules),run_at:'document_idle',world:'MAIN',all_frames:false});
 assert.deepEqual(m.content_scripts.map(c=>[c.world,c.run_at]),[['MAIN','document_start'],['MAIN','document_idle'],['ISOLATED','document_idle']]);
 assert.deepEqual(m.host_permissions,['https://mu.mormon.garden/*']);
 assert.equal(m.background.service_worker,'worker.js');assert.ok(m.action.default_title);
 for(const key of ['permissions','web_accessible_resources'])assert.equal(m[key],undefined);
 for(const [id,name] of Object.entries(modules))assert.deepEqual(a.files[name],data[id]);
 assert.deepEqual(verify(a.metadata,n=>a.files[n],data),Object.fromEntries(Object.keys(a.metadata.files).map(n=>[n,a.files[n]])));
});
test('legacy packages remain verifiable with their original layout',()=>{
 const legacy=build(data,'1.0.0',false);assert.equal(JSON.parse(legacy.files['manifest.json']).background,undefined);
 assert.deepEqual(verify(legacy.metadata,n=>legacy.files[n],data),legacy.files);
});
test('archived panel assets verify independently of current presentation sources',()=>{
 const a=build(data);assert.throws(()=>verify(a.metadata,n=>n==='panel.js'?Buffer.from('changed'):a.files[n],data),/Hash/);
 assert.throws(()=>verify({...a.metadata,files:{...a.metadata.files,'../bad':a.metadata.files['panel.js']}},n=>a.files[n],data),/Ruta/);
});
test('rejects corrupt files, metadata, missing modules and wider scope',()=>{
 const a=build(data);assert.throws(()=>verify(a.metadata,n=>n==='manifest.json'?Buffer.from('{}'):a.files[n],data),/Hash/);
 assert.throws(()=>verify({...a.metadata,sha256:'bad'},n=>a.files[n],data),/Hash/);
 assert.throws(()=>build({...data,hub:null}),/Falta/);
 assert.throws(()=>build({...data,radar:Buffer.from(data.radar.toString().replace('https://mu.mormon.garden/*','https://*/*'))}),/Metadatos/);
 assert.throws(()=>build(data,'1.0.65536'),/Versión/);
});
