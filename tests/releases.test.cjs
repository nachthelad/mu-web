const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {manager}=require('../scripts/release-manager.cjs');
function fixture(){const root=fs.mkdtempSync(path.join(__dirname,'.release-test-'));const names={radar:'golden-radar.user.js',helper:'level-helper.user.js',hub:'hub.user.js'};function source(module,version,extra=''){const dir=path.join(root,'src',module);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,names[module]),`// @version ${version}\n${extra}\n`);}for(const id of Object.keys(names))source(id,'1.0.0');return{root,source,m:manager(root),cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};}
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
