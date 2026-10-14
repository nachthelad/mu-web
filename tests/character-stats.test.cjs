const {test}=require('node:test'),assert=require('node:assert/strict');
const {characterStats,compareStats,StatsComparison,validPreferences,DEFAULTS,accountIdentity}=require('../src/helper/level-helper.user.js');
const fixture=()=>({username:'MageAccount',accountFor:'demo/world/session',uiState:5,gsSocket:{readyState:1,url:'wss://demo/game'},playerData:{name:'Mage',charClass:0,level:10,str:20,agi:30,sta:40,eng:90,leadership:0,attackSpeed:0,items:[null,{group:5,num:0,lvl:3,isExcellent:false},...Array(10).fill(null)]},currentSkill:9});
const world={playerEntity:{}};
test('capture rejects a stale authenticated account before the next refresh',()=>{const store=fixture(),owner=accountIdentity(store);assert.ok(characterStats(store,world,owner));store.username='AnotherAccount';assert.equal(characterStats(store,world,owner),null);assert.ok(characterStats(store,world,accountIdentity(store)));});
test('absent metrics stay null; native calculator requires complete known equipment',()=>{
 const store=fixture();let calls=0;const native={calculate(){calls++;return{damageMin:10,damageMax:20,wizardryMin:30,wizardryMax:40,staffRate:15};},hasItem:()=>true};
 let value=characterStats(store,world,'demo',native);assert.equal(calls,1);assert.equal(value.metrics.find(m=>m.key==='wizardryMin').value,30);assert.equal(value.metrics.find(m=>m.key==='effectiveDamage').value,null);assert.equal(value.metrics.find(m=>m.key==='attackSpeed').value,0);
 delete store.playerData.eng;value=characterStats(store,world,'demo',native);assert.equal(calls,1);assert.equal(value.metrics.find(m=>m.key==='wizardryMin').value,null);
 store.playerData.eng=90;native.hasItem=()=>false;value=characterStats(store,world,'demo',native);assert.equal(calls,2);assert.equal(value.metrics.find(m=>m.key==='wizardryMin').value,null);
 native.hasItem=()=>{throw Error('unavailable');};assert.equal(characterStats(store,world,'demo',native).metrics.find(m=>m.key==='damageMin').value,null);
 store.playerData.items=null;assert.equal(characterStats(store,world,'demo',native).equipment,null);
});
test('snapshots are immutable copies; delta, zero denominator and identity guards',()=>{
 const store=fixture(),model=new StatsComparison();model.update(characterStats(store,world,'demo',null,100));assert.equal(model.capture('b'),false);model.capture('a');
 store.playerData.eng=180;store.playerData.attackSpeed=10;store.playerData.items[1].num=1;model.update(characterStats(store,world,'demo',null,200));model.capture('b');
 assert.equal(model.a.equipment[1].num,0);assert.equal(model.a.metrics.find(m=>m.key==='eng').value,90);
 const result=compareStats(model.a,model.b);assert.equal(result.rows.find(m=>m.key==='eng').percent,100);assert.equal(result.rows.find(m=>m.key==='attackSpeed').delta,10);assert.equal(result.rows.find(m=>m.key==='attackSpeed').percent,null);assert.equal(result.rows.find(m=>m.key==='effectiveDamage').delta,null);assert.ok(result.warnings.includes('Cambió Energía'));
 model.update(characterStats(store,world,'stale-account'));assert.equal(model.a,null);assert.equal(compareStats(characterStats(store,world,'demo'),model.current),null);
 model.update(characterStats(store,world,'demo'));model.capture('a');store.playerData.name='Other';model.update(characterStats(store,world,'demo'));assert.equal(model.a,null);
 model.capture('a');store.gsSocket.readyState=3;model.update(characterStats(store,world,'demo'));assert.equal(model.current,null);assert.equal(model.a,null);
});
test('old preferences default off and malformed flag is rejected',()=>{
 const old={version:1,spots:DEFAULTS.spots,sendParty:true,acceptParty:true};assert.equal(validPreferences(old),true);assert.equal(validPreferences({...old,detailedStats:true}),true);assert.equal(validPreferences({...old,detailedStats:'true'}),false);
});
