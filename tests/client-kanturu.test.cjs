const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const fixture=require('../demos/helper/character-kanturu-audited.js');
test('Kanturu adapter provenance uses the actual Character Info caller and exact item-name export',()=>{
 const dir='artifacts/client-kanturu/',audit=JSON.parse(fs.readFileSync(dir+'audit.json'));
 for(const [file,hash]of Object.entries(audit.hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+file)).digest('hex'),hash);
 const l=fs.readFileSync(dir+'layout.js','utf8'),b=fs.readFileSync(dir+'boot.js','utf8'),e=fs.readFileSync(dir+'entry.js','utf8');
 const exports=l.slice(l.lastIndexOf('export{')).split(',');
 for(const exp of Object.values(audit.exports))assert.ok(exports.includes(exp),exp);
 assert.ok(e.includes('layout-A1P3A0u1.js'));assert.ok(e.includes('boot-BJb3X1Q4.js'));
 assert.match(b,/b1 as FM/);assert.match(b,/o=FM\(\{charClass:e.charClass,level:e.level,strength:e.str,agility:e.agi,vitality:e.sta,energy:e.eng,leadership:e.leadership,items:e.items\}\)/);
 assert.ok(exports.includes('EJe as fd'));assert.ok(exports.includes('mk as fg'));
});
test('Kanturu native metrics, Fenrir naming and tooltips use the newly extracted client',()=>{
 const n=fixture.nativeFixture(),items=Array(12).fill(null);
 const input={charClass:2,level:10,strength:65535,agility:65535,vitality:65535,energy:65535,leadership:0,items};
 items[0]={group:5,num:11,lvl:13,isExcellent:true,optionLevel:4,excellentFlags:32};
 const result=n.calculate(input);assert.equal(result.wizardryMin,7384);assert.equal(result.wizardryMax,16493);
 assert.equal(n.itemStats(items[0]).magicPower,110);assert.ok(n.tooltip(items[0],{freeRequirements:true}).lines.some(l=>l.text.includes('value=110')));
 const fenrir=n.catalogue.find(i=>i.ItemName==='Horn of Fenrir');assert.ok(fenrir);assert.match(n.name({group:fenrir.Group,num:fenrir.Index,lvl:0}),/Fenrir/);
});
test('new native window registry enforces exclusivity before the addon adapts C/V',()=>{
 const mobx=fixture.mobxFixture(),store=mobx.observable({characterInfoEnabled:false,inventoryEnabled:false,skillListEnabled:false});
 const native=fixture.installNativeClosures(store,mobx);
 mobx.action(()=>{store.characterInfoEnabled=true;});assert.equal(store.characterInfoEnabled,true);
 mobx.action(()=>{store.inventoryEnabled=true;});assert.equal(store.inventoryEnabled,true);assert.equal(store.characterInfoEnabled,false);
 native.dispose();
});
