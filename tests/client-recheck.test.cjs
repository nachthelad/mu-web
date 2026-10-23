const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const previous=require('../demos/helper/character-oct21-audited.js'),current=require('../demos/helper/character-recheck-audited.js');
test('second October 21 public build: verified hashes, identity exports and Character Info provenance',()=>{
 const audit=JSON.parse(fs.readFileSync('artifacts/client-recheck/audit.json')),s=fs.readFileSync('artifacts/client-recheck/layout.js','utf8'),boot=fs.readFileSync('artifacts/client-recheck/boot.js','utf8');
 assert.equal(audit.entry,'/assets/index-Do3IjarP.js');assert.equal(audit.module,'/assets/layout-CoOAKkh-.js');
 for(const [file,hash]of Object.entries(audit.hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('artifacts/client-recheck/'+file)).digest('hex'),hash);
 const exp=s.slice(s.lastIndexOf('export{'));for(const value of [...Object.values(audit.exports),'f as n','q as V','x as aw'])assert.ok(exp.includes(value));
 assert.match(s,/const f=new class\{csSocket;gsSocket;/);assert.match(s,/q=new class\{chatLines=/);assert.match(s,/world;/);
 assert.ok(boot.includes('from"./layout-CoOAKkh-.js"'));assert.ok(boot.includes('n as E'));assert.ok(boot.includes('b1 as sR'));assert.match(boot,/o=sR\(\{charClass:e.charClass,level:e.level,strength:e.str/);
 // Compare extracted executable code, not just export aliases: catalog is the changed section.
 const a=fs.readFileSync('demos/helper/character-oct21-audited.js','utf8').split('\n'),b=fs.readFileSync('demos/helper/character-recheck-audited.js','utf8').split('\n');
 assert.equal(a.length,b.length);const changed=a.map((line,i)=>line===b[i]?null:i).filter(i=>i!==null);assert.deepEqual(changed,[3]);assert.ok(a[3].includes('const Une=['));assert.ok(b[3].includes('const Une=['));
});
test('second build uses current catalog; all four staff combinations match native calculations and tooltip',()=>{
 const n=current.nativeFixture(),old=previous.nativeFixture(),staff={group:5,num:11,lvl:13,isExcellent:true,optionLevel:4,excellentFlags:32};
 const pd={charClass:2,level:10,strength:65535,agility:65535,vitality:65535,energy:65535,leadership:0};
 for(const [left,right]of [[null,null],[staff,null],[null,staff],[staff,staff]]){
  const items=Array(12).fill(null);items[0]=left;items[1]=right;const result=n.calculate({...pd,items});assert.deepEqual(result,old.calculate({...pd,items}));assert.equal(result.wizardryMin,left?7384:7281);assert.equal(result.wizardryMax,left?16493:16383);assert.equal(result.staffRate,left?110:0);
 }
 assert.equal(n.itemStats(staff).magicPower,110);assert.deepEqual(n.tooltip(staff,{level:10,freeRequirements:true,worn:[]}),old.tooltip(staff,{level:10,freeRequirements:true,worn:[]}));
 const armor=n.catalogue.find(i=>i.ItemName==='Dragon Knight Helm'),oldArmor=old.catalogue.find(i=>i.ItemName==='Dragon Knight Helm');assert.equal(armor.ReqLvl,0);assert.equal(oldArmor.ReqLvl,380);
});
