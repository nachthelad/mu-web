const {test}=require('node:test'),assert=require('node:assert/strict');
const {zenInReach,ExcellentLoot,LOOT_DEFAULTS,DEFAULTS}=require('../src/helper/level-helper.user.js');
const money=(x,y,id=20)=>({netId:id,worldIndex:0,transform:{pos:{x,z:y}},droppedItem:{isMoney:true}});
function setup(){const hero={transform:{pos:{x:47.9,z:59.9}},playerMoveTo:{point:{x:70,y:80},handled:false,sendToServer:false},pathfinding:{path:[{x:70,y:80}],from:{x:47,y:59},to:{x:70,y:80}}},world={playerEntity:hero,pickupTarget:null,netObjsQuery:{entities:[]}},requests=[],config=new Uint8Array(257);config[2]=0x80;return {loot:new ExcellentLoot(),world,requests,s:{ready:true,level:20,map:0,position:{x:47.9,y:59.9}},cycle:{running:true,settled:true,config:DEFAULTS},store:{muHelper:{active:true,config},pickupItemRequest(id){requests.push(id);}},preferences:{loot:{...LOOT_DEFAULTS,enabled:true,zen:true,range:8},excellentNames:[]}};}
const step=(t,now=0,hunting=false)=>t.loot.step(t.cycle,t.s,t.world,t.store,t.preferences,now,hunting);
test('native integer-tile reach: adjacent diagonal allowed, a second tile excluded even if numerically close',()=>{
 assert.equal(zenInReach(money(48.99,60.99),{x:47.01,y:59.01}),true);
 assert.equal(zenInReach(money(49,59.9),{x:47.9,y:59.9}),false);
 assert.equal(zenInReach(money(47.9,61),{x:47.9,y:59.9}),false);
 assert.equal(zenInReach(money(NaN,59),{x:47,y:59}),false);
});
test('Zen is requested directly without any pickup, movement or path changes; range and Todo cannot extend it',()=>{
 for(const all of [false,true])for(const range of [1,8]){
  const t=setup();t.preferences.loot={...t.preferences.loot,all,range};const before=structuredClone(t.world.playerEntity),near=money(48.99,60.99),far=money(49,59.9,21);t.world.netObjsQuery.entities=[far,near];step(t);assert.deepEqual(t.requests,[20]);assert.equal(t.world.pickupTarget,null);assert.deepEqual(t.world.playerEntity,before);assert.equal(t.loot.pending.direct,true);step(t,500);assert.deepEqual(t.requests,[20]);
  t.loot.clear();t.world.netObjsQuery.entities=[far];step(t,1000);assert.deepEqual(t.requests,[20]);assert.deepEqual(t.world.playerEntity,before);
 }
});
test('disabled Zen, pause, death, hunting and an existing manual pickup never send a Zen request',()=>{
 for(const change of [t=>t.preferences.loot.zen=false,t=>t.cycle.running=false,t=>t.s.dead=true,t=>t.world.pickupTarget={netId:99}]){const t=setup();t.world.netObjsQuery.entities=[money(48,59)];change(t);step(t);assert.deepEqual(t.requests,[]);}
 const t=setup();t.world.netObjsQuery.entities=[money(48,59)];step(t,0,true);assert.deepEqual(t.requests,[]);
});
test('request rejection and timeout retain cooldown and never erase a later manual target or movement',()=>{
 const t=setup(),near=money(48,59);t.world.netObjsQuery.entities=[near];const before=structuredClone(t.world.playerEntity);step(t);t.world.pickupTarget=near;t.loot.failed(500);assert.equal(t.world.pickupTarget,near);assert.deepEqual(t.world.playerEntity,before);t.world.pickupTarget=null;step(t,60000);assert.deepEqual(t.requests,[20]);step(t,60500);assert.deepEqual(t.requests,[20,20]);step(t,75500);assert.equal(t.loot.pending,null);assert.deepEqual(t.world.playerEntity,before);
 for(const mode of ['false','throw']){const q=setup();q.world.netObjsQuery.entities=[near];q.store.pickupItemRequest=()=>{if(mode==='throw')throw Error('rejected');return false;};step(q);assert.equal(q.loot.pending,null);assert.match(q.loot.message,/rechazado/);assert.equal(q.world.pickupTarget,null);}
});
