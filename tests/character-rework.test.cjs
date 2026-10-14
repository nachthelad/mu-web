const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {characterStats}=require('../src/helper/level-helper.user.js');
const {nativeFixture}=require('../demos/helper/character-rework-audited.js');
test('new public build: hashes, real native exports, full equipment calculation and independent unknown piece',()=>{
 const audit=JSON.parse(fs.readFileSync('artifacts/stats-research/rework-audit.json'));
 for(const [name,hash]of Object.entries(audit.hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('artifacts/stats-research/rework-'+name+'.js')).digest('hex'),hash);
 const native=nativeFixture(),items=Array(12).fill(null);items[0]={group:5,num:11,lvl:13,isExcellent:true};
 const pd={name:'Fixture',charClass:2,level:400,str:65535,agi:65535,sta:65535,eng:65535,leadership:0,items},store={uiState:5,gsSocket:{readyState:1,url:'wss://fixture'},playerData:pd};
 const metrics=()=>Object.fromEntries(characterStats(store,{playerEntity:{}},'demo',native).metrics.map(m=>[m.key,m.value]));
 assert.equal(metrics().damageMin,8294);assert.equal(metrics().wizardryMin,7281);assert.equal(metrics().staffRate,0);
 items[1]=items[0];items[0]=null;assert.equal(metrics().wizardryMin,7384);assert.equal(metrics().staffRate,110);
 items[11]={group:999,num:999,lvl:0,isExcellent:false};assert.equal(metrics().wizardryMin,7384);assert.equal(metrics().defense,16383);
 const s=fs.readFileSync('artifacts/stats-research/rework-layout.js','utf8'),boot=fs.readFileSync('artifacts/stats-research/rework-boot.js','utf8');
 for(const declaration of Object.values(audit.exports))assert.ok(s.slice(s.lastIndexOf('export{')).includes(declaration));
 assert.match(boot,/o=aM\(\{charClass:e.charClass,level:e.level,strength:e.str,agility:e.agi/);assert.match(boot,/b1 as aM/);
 assert.match(s,/function _g\(e\).*magicPower:a\$e\(i,t,n,a\)/);
 // Independent booleans and own close handlers do not prove coexistence.
 // The separate index-D5yEXyzD registry is covered in character-cv.test.cjs.
 assert.match(s,/closeTop\(\)\{for\(let t=this.order.length-1/);assert.match(boot,/onClose:\(\)=>\{w.characterInfoEnabled=!1/);
});
