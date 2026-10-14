const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {manager}=require('../scripts/release-manager.cjs');
function fixture(){const root=fs.mkdtempSync(path.join(__dirname,'.release-test-'));const names={radar:'golden-radar.user.js',helper:'level-helper.user.js',hub:'hub.user.js',config:'config.user.js',analytics:'analytics.user.js',interface:'interface.user.js'};function source(module,version,extra=''){const dir=path.join(root,'src',module);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,names[module]),`// @version ${version}\n// @match https://mu.mormon.garden/*\n// @grant none\n// @run-at document-idle\n${extra}\n`);}fs.mkdirSync(path.join(root,'tests'));for(const id of Object.keys(names))source(id,'1.0.0');return{root,source,m:manager(root),cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};}
test('Windows promotion retries transient sharing errors without weakening validation',{skip:process.platform!=='win32'},()=>{
 const t=fixture(),original=fs.renameSync;let failures=0;
 try{fs.renameSync=(from,to)=>{if(from===path.join(t.root,'.release-stage')&&failures++<2)throw Object.assign(Error('temporary sharing lock'),{code:'EPERM'});return original(from,to);};const set=t.m.publish({validate:()=>{}});assert.equal(JSON.parse(fs.readFileSync(path.join(t.root,'dist/manifest.json'))).id,set.id);assert.ok(failures>=3);t.m.verify(set,'dist');}finally{fs.renameSync=original;t.cleanup();}
});
test('sharing uses the current release, preserves pending sources and regenerates ZIP on rollback',()=>{
 const t=fixture();try{
  const set=t.m.publish({validate:()=>{}}),zip=path.join(t.root,'dist/mu-web-chrome-1.0.0.zip');assert.equal(fs.existsSync(zip),true);
  const before=fs.readFileSync(zip);t.source('helper','1.0.1','// pending');const shared=t.m.share();assert.deepEqual(shared.bytes,before);
  assert.equal(JSON.parse(fs.readFileSync(path.join(t.root,'dist/manifest.json'))).id,set.id);
  const newer=t.m.publish({validate:()=>{}});assert.equal(newer.extension.version,'1.0.1');assert.equal(fs.existsSync(zip),false);
  t.m.rollback(set.id);assert.deepEqual(fs.readFileSync(zip),before);
  assert.match(fs.readFileSync(path.join(t.root,'src/helper/level-helper.user.js'),'utf8'),/pending/);
 }finally{t.cleanup();}
});
test('release retains three previous versions and compatible sets, rollback verifies hashes',()=>{
 const t=fixture();try{
  let current;const sets=[];
  for(let i=0;i<6;i++){t.source('radar',`1.0.${i}`);current=t.m.publish({validate:()=>{}});sets.push(current.id);}
  assert.equal(fs.readdirSync(path.join(t.root,'releases/radar')).length,4);
  assert.equal(fs.readdirSync(path.join(t.root,'releases/sets')).length,4);
  const previous=sets[4];t.m.rollback(previous);assert.equal(JSON.parse(fs.readFileSync(path.join(t.root,'dist/manifest.json'))).id,previous);
  assert.match(fs.readFileSync(path.join(t.root,'src/radar/golden-radar.user.js'),'utf8'),/1.0.5/);
  const script=path.join(t.root,'releases/radar/1.0.4/golden-radar.user.js');fs.appendFileSync(script,'// corrupt');
  assert.throws(()=>t.m.rollback(previous),/Hash/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(t.root,'dist/manifest.json'))).id,previous);
 }finally{t.cleanup();}
});
test('failed validation, same-version edits, unselected changes, source races and locks preserve dist',()=>{
 const t=fixture();try{
  const initial=t.m.publish({validate:()=>{}});assert.equal(t.m.publish({validate:()=>{}}).id,initial.id);
  t.source('radar','1.0.1');assert.throws(()=>t.m.publish({validate:()=>{throw Error('failed validation');}}),/failed validation/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(t.root,'dist/manifest.json'))).id,initial.id);
  assert.throws(()=>t.m.publish({module:'hub',validate:()=>{}}),/También cambió radar/);
  t.source('radar','1.0.0','// changed');assert.throws(()=>t.m.publish({validate:()=>{}}),/Incrementá/);
  t.source('radar','1.0.1');assert.throws(()=>t.m.publish({validate:()=>t.source('radar','1.0.2')}),/fuentes cambiaron/);
  fs.writeFileSync(path.join(t.root,'releases/.lock'),'busy');assert.throws(()=>t.m.publish({validate:()=>{}}),/otra operación/);
  assert.throws(()=>t.m.rollback('../outside'),/otra operación/);fs.unlinkSync(path.join(t.root,'releases/.lock'));
  assert.throws(()=>t.m.rollback('../outside'),/ID inválido/);
 }finally{t.cleanup();}
});
test('failed promotion restores the previous complete distribution',()=>{
 const t=fixture(),rename=fs.renameSync;try{
  const previous=t.m.publish({validate:()=>{}});t.source('hub','1.0.1');
  fs.renameSync=(from,to)=>{if(from.endsWith('.release-stage'))throw Error('simulated promotion failure');return rename(from,to);};
  assert.throws(()=>t.m.publish({validate:()=>{}}),/simulated promotion/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(t.root,'dist/manifest.json'))).id,previous.id);
  assert.equal(fs.readdirSync(path.join(t.root,'releases/sets')).length,1);
  assert.equal(fs.existsSync(path.join(t.root,'.release-backup')),false);
 }finally{fs.renameSync=rename;t.cleanup();}
});

test('rollback to a legacy three-module set removes Config and allows a new joint release',()=>{
 const t=fixture();try{const set=t.m.publish({validate:()=>{}});const manifest=JSON.parse(fs.readFileSync(path.join(t.root,'releases/sets',set.id+'.json')));delete manifest.extension;delete manifest.modules.config;fs.writeFileSync(path.join(t.root,'releases/sets',set.id+'.json'),JSON.stringify(manifest));t.m.rollback(set.id);assert.equal(fs.existsSync(path.join(t.root,'dist/config.user.js')),false);const next=t.m.publish({validate:()=>{}});assert.equal(next.modules.config.version,'1.0.0');t.source('config','1.0.1');assert.equal(t.m.publish({module:'config',validate:()=>{}}).modules.config.version,'1.0.1');}finally{t.cleanup();}
});

test('rollback to a four-module set removes Analytics; next joint release restores it',()=>{
 const t=fixture();try{const set=t.m.publish({validate:()=>{}}),manifest=JSON.parse(fs.readFileSync(path.join(t.root,'releases/sets',set.id+'.json')));delete manifest.extension;delete manifest.modules.analytics;fs.writeFileSync(path.join(t.root,'releases/sets',set.id+'.json'),JSON.stringify(manifest));t.m.rollback(set.id);assert.equal(fs.existsSync(path.join(t.root,'dist/analytics.user.js')),false);assert.equal(t.m.publish({validate:()=>{}}).modules.analytics.version,'1.0.0');t.source('analytics','1.0.1');assert.equal(t.m.publish({module:'analytics',validate:()=>{}}).modules.analytics.version,'1.0.1');}finally{t.cleanup();}
});

test('Interface is optional in older sets; joint release restores it and module selector works',()=>{
 const t=fixture();try{const initial=t.m.publish({validate:()=>{}}),manifest=JSON.parse(fs.readFileSync(path.join(t.root,'releases/sets',initial.id+'.json')));delete manifest.extension;delete manifest.modules.interface;fs.writeFileSync(path.join(t.root,'releases/sets',initial.id+'.json'),JSON.stringify(manifest));t.m.rollback(initial.id);assert.equal(fs.existsSync(path.join(t.root,'dist/interface.user.js')),false);assert.equal(t.m.publish({validate:()=>{}}).modules.interface.version,'1.0.0');t.source('interface','1.0.1');assert.equal(t.m.publish({module:'interface',validate:()=>{}}).modules.interface.version,'1.0.1');}finally{t.cleanup();}
});

test('extension archives exact packages, detects corruption, retains versions and legacy rollback removes it',()=>{
 const t=fixture();try{
  const first=t.m.publish({validate:()=>{}});assert.equal(first.extension.version,'1.0.0');
  const original=fs.readFileSync(path.join(t.root,'dist/chrome-extension/manifest.json'));
  assert.equal(t.m.publish({validate:()=>{}}).extension.version,'1.0.0');
  for(let i=1;i<=5;i++){t.source('helper',`1.0.${i}`);t.m.publish({module:'helper',validate:()=>{}});}
  assert.equal(fs.readdirSync(path.join(t.root,'releases/extensions')).length,4);
  const current=JSON.parse(fs.readFileSync(path.join(t.root,'dist/manifest.json'))),target=path.join(t.root,'releases/extensions',current.extension.version,'manifest.json');
  const bytes=fs.readFileSync(target);fs.appendFileSync(target,'corrupt');assert.throws(()=>t.m.rollback(current.id),/Hash/);fs.writeFileSync(target,bytes);
  const legacy={...current};delete legacy.extension;fs.writeFileSync(path.join(t.root,'releases/sets',current.id+'.json'),JSON.stringify(legacy));
  t.m.rollback(current.id);assert.equal(fs.existsSync(path.join(t.root,'dist/chrome-extension')),false);
  assert.throws(()=>t.m.publish({module:'hub',validate:()=>{}}),/conjunta/);
  const next=t.m.publish({validate:()=>{}});assert.equal(next.extension.version,current.extension.version);
  assert.notDeepEqual(fs.readFileSync(path.join(t.root,'dist/chrome-extension/manifest.json')),original);
 }finally{t.cleanup();}
});

test('generator race preserves the prior userscripts and extension package',()=>{
 const t=fixture();try{
  fs.mkdirSync(path.join(t.root,'scripts'));const watched=path.join(t.root,'scripts/extension-package.cjs');fs.writeFileSync(watched,'// initial');
  const initial=t.m.publish({validate:()=>{}});t.source('radar','1.0.1');
  assert.throws(()=>t.m.publish({validate:()=>fs.appendFileSync(watched,'// concurrent')}),/generador/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(t.root,'dist/manifest.json'))).id,initial.id);
  assert.equal(JSON.parse(fs.readFileSync(path.join(t.root,'dist/chrome-extension/manifest.json'))).version,'1.0.0');
 }finally{t.cleanup();}
});
