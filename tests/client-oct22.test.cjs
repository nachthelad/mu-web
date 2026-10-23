const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {minimumLevel,LEVEL_MAPS,characterStats}=require('../src/helper/level-helper.user.js');
const {MAPS,hudInvasion}=require('../src/radar/golden-radar.user.js');
const fixture=require('../demos/helper/character-oct22-audited.js');
test('October 22 adapter provenance: exact public exports and native Character Info call',()=>{
 const dir='artifacts/client-oct22/',audit=JSON.parse(fs.readFileSync(dir+'audit.json'));
 for(const [file,hash]of Object.entries(audit.hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(dir+file)).digest('hex'),hash);
 const layout=fs.readFileSync(dir+'layout.js','utf8'),boot=fs.readFileSync(dir+'boot.js','utf8'),entry=fs.readFileSync(dir+'index.js','utf8');
 for(const exp of Object.values(audit.exports))assert.ok(layout.slice(layout.lastIndexOf('export{')).includes(exp));
 assert.ok(entry.includes('layout-DCITLqBq.js'));assert.ok(entry.includes('boot-V1YFbozx.js'));
 assert.ok(boot.includes('b1 as gM'));assert.match(boot,/o=gM\(\{charClass:e.charClass,level:e.level,strength:e.str,agility:e.agi,vitality:e.sta,energy:e.eng,leadership:e.leadership,items:e.items\}\)/);
 assert.match(layout,/WD_33AIDA=33/);assert.match(layout,/DarkLord=16/);assert.match(layout,/LordEmperor=17/);
});
test('Aida label and invasion map breakdown use world 33',()=>{
 assert.equal(MAPS[33],'Aida');
 assert.deepEqual(hudInvasion('2 left','Aida: 2'),{active:true,total:2,maps:[{map:33,alive:2}]});
});
test('DL and Lord Emperor use the audited reduced warp minima; other classes retain defaults',()=>{
 const boot=fs.readFileSync('artifacts/client-oct22/boot.js','utf8');
 assert.match(boot,/F8=new Set\(\[Ge.MagicGladiator,Ge.DarkLord,Ge.RageFighter\]\)/);
 assert.match(boot,/function G8\(e,t\)\{return e===400\|\|!F8.has\(t\)\?e:Math.trunc\(e\*\(100-B8\)\/100\)\}/);
 for(const m of LEVEL_MAPS){
  for(const cl of [16,17])assert.equal(minimumLevel(m.id,cl),Math.trunc(m.minLevel*66/100));
  assert.equal(minimumLevel(m.id,0),m.minLevel);
 }
});
test('native DL metrics include leadership and preserve main staff calculation and tooltips',()=>{
 const native=fixture.nativeFixture(),items=Array(12).fill(null);
 const input={charClass:16,level:100,strength:1000,agility:600,vitality:500,energy:400,leadership:300,items};
 assert.deepEqual(native.calculate(input),{attackSpeed:60,magicSpeed:60,damageMin:170,damageMax:240,dualWield:false,attackRate:2196,attackRatePvp:2700,defense:85,defenseRate:85,defenseRatePvp:500,wizardryMin:44,wizardryMax:100,staffRate:0,curseMin:44,curseMax:100});
 assert.equal(native.calculate({...input,leadership:1300}).attackRate,2296);
 const pd={name:'DLFixture',charClass:16,level:100,str:1000,agi:600,sta:500,eng:400,leadership:300,items};
 const snapshot=characterStats({uiState:5,gsSocket:{readyState:1,url:'wss://fixture'},playerData:pd},{playerEntity:{}},'demo',native);
 assert.equal(snapshot.metrics.find(m=>m.key==='attackRate').value,2196);
 assert.equal(snapshot.metrics.find(m=>m.key==='leadership').value,300);
 const staff={group:5,num:11,lvl:13,isExcellent:true,optionLevel:4,excellentFlags:32};items[0]=staff;
 const wizard=native.calculate({...input,charClass:2,energy:65535});assert.equal(wizard.wizardryMin,7384);assert.equal(wizard.wizardryMax,16493);
 assert.equal(native.itemStats(staff).magicPower,110);assert.ok(native.tooltip(staff,{freeRequirements:true}).lines.some(l=>l.text.includes('value=110')));
});
