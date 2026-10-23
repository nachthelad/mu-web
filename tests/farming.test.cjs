const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm');
const {FarmSession,farmAdapter,farmSkill,principalMode,DEFAULTS,LOOT_DEFAULTS,ExcellentLoot,LEVEL_MAPS,LEGACY_LEVEL_MAPS,migrateLeveling,validLeveling,searchLevelMaps,DailySchedule}=require('../src/helper/level-helper.user.js');
const {create,sources}=require('./fixtures/farming-client-audited.cjs');
function fixture(){
 const calls=[],hero={localPlayer:true,charAppearance:{charClass:0},transform:{pos:{x:50,z:50},rot:{y:0}},playerMoveTo:{point:{x:50,y:50},handled:true},pathfinding:{path:null},playerAnimation:{},attributeSystem:{isAboveZero:()=>false,getValue:()=>0}};
 const mob={netId:8,npcType:2,worldIndex:33,transform:{pos:{x:51,z:50}}};
 const world={mapIndex:33,playerEntity:hero,attackTarget:null,castRequest:null,pickupTarget:null,castApproach:null,netObjsQuery:{entities:[mob]},getByNetId(id){return this.netObjsQuery.entities.find(e=>e.netId===id);},getTerrainFlag:()=>0,isWalkable:()=>true,pathfinder:{search:(a,b)=>[a,b]}};
 const store={isOffline:false,skills:[{number:1},{number:4},{number:16},{number:40}],currentSkill:1,playerData:{charClass:0,level:400,eng:1200,currentMP:100,currentAG:100,currentHP:100,tileFlag:0},muHelper:{active:false},selectSkill(n){this.currentSkill=this.skills.some(k=>k.number===n)?n:-1;},sendToGS(p){calls.push({skill:p.SkillId,target:p.TargetId});},sendWalkStop(){calls.push('stop');}};
 const s={ready:true,level:400,map:33,warpSerial:0,name:'Hero',account:'account',server:'server',charClass:0,position:{x:50,y:50}},prefs={...DEFAULTS,autoReset:false},client=create(store,world),native=farmAdapter(client.native),farm=new FarmSession();
 return {calls,hero,mob,world,store,s,prefs,client,native,farm};
}
test('principal mode keeps leveling, reset priority and a single farming intent',()=>{
 assert.equal(principalMode({level:399},{}),'leveling');assert.equal(principalMode({level:400},{}),'resetting');assert.equal(principalMode({level:400},{autoReset:false}),'farming');
});
test('extracted native cast sends targeted skill at 400 without Home and no basic attack',()=>{
 const f=fixture();assert.ok(f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0));f.farm.step(f.s,f.store,0);assert.equal(f.world.attackTarget,null);f.client.tick(.5);assert.deepEqual(f.calls,[{skill:1,target:8}]);assert.equal(f.store.muHelper.active,false);
 f.farm.stop();f.client.tick(2);assert.equal(f.calls.length,1);assert.equal(f.world.castRequest,null);
});
test('pause before the native cast tick releases only its request; a new manual request survives',()=>{
 const f=fixture();f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0);f.farm.step(f.s,f.store,0);f.farm.stop();f.client.tick(2);assert.deepEqual(f.calls,[]);
 f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0);f.farm.step(f.s,f.store,0);const manual={target:f.hero};f.world.castRequest=manual;f.farm.stop();assert.equal(f.world.castRequest,manual);
});
test('resources wait without reissuing casts and cooldown/unsupported/missing metadata block safely',()=>{
 const f=fixture();f.store.playerData.currentMP=0;assert.equal(f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0),true);f.farm.step(f.s,f.store,0);f.client.tick(2);assert.deepEqual(f.calls,[]);assert.match(f.farm.message,/mana/);
 assert.match(farmSkill(f.native,f.store,16).error,/cancelación/);assert.match(farmSkill(f.native,f.store,40).error,/cancelación/);assert.match(farmSkill(null,f.store,1).error,/build/);delete f.store.playerData.currentAG;assert.match(farmSkill(f.native,f.store,1).error,/recursos/);assert.equal(farmAdapter({}),null);
});
test('ordinary attack is not claimed while a native basic callback is in flight',()=>{
 const f=fixture();f.native.combat.attackInFlight=true;assert.equal(f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0),false);assert.match(f.farm.message,/pendientes/);assert.equal(f.world.attackTarget,null);
});
for(const [name,mutate]of [
 ['death',f=>f.s.dead=true],['map',f=>f.s.map=38],['same-world warp',f=>f.s.warpSerial++],['account',f=>f.s.account='other'],['character',f=>f.s.name='other'],['server',f=>f.s.server='other'],['class',f=>f.s.charClass=4],['disconnect',f=>f.s.ready=false],['loading',f=>f.s.loading=true],['hero',f=>f.world.playerEntity={...f.hero}],['manual skill',f=>f.store.currentSkill=4],['Home on',f=>f.store.muHelper.active=true],['manual attack',f=>f.world.attackTarget=f.mob]
])test(name+' cancels farming with no implicit restart',()=>{
 const f=fixture();f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0);f.farm.step(f.s,f.store,0);mutate(f);f.farm.step(f.s,f.store,500);assert.equal(f.farm.active,false);assert.equal(f.world.castRequest,null);f.client.tick(1);assert.deepEqual(f.calls,[]);f.farm.step({...f.s,ready:true,dead:false},f.store,1000);assert.equal(f.farm.active,false);
});
test('actual monster predicate rejects NPCs, players, dead, stale, summoned and safe targets',()=>{
 for(const patch of [{npcType:200+1},{npcType:undefined},{dying:true},{summonedBy:1},{objOutOfScope:true},{localPlayer:true}]){const f=fixture();Object.assign(f.mob,patch);f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0);f.farm.step(f.s,f.store,0);assert.equal(f.world.castRequest,null);}
 const f=fixture();f.world.getTerrainFlag=()=>1;assert.equal(f.native.monster(f.world,f.mob),false);
});
test('manual movement is preserved when canceling an owned approach',()=>{
 const f=fixture();f.mob.transform.pos.x=58;f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0);f.farm.step(f.s,f.store,0);assert.equal(f.hero.playerMoveTo.point.x,58);f.hero.playerMoveTo.point={x:44,y:44};f.farm.step(f.s,f.store,500);assert.equal(f.farm.active,false);assert.deepEqual(f.hero.playerMoveTo.point,{x:44,y:44});
});
test('path stays inside captured spot and blocked navigation never casts at distance',()=>{
 const f=fixture();f.mob.transform.pos.x=58;f.world.pathfinder.search=()=>[{x:50,y:50},{x:70,y:50},{x:58,y:50}];f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0);f.farm.step(f.s,f.store,0);assert.equal(f.world.castRequest,null);assert.equal(f.hero.playerMoveTo.handled,true);
});
test('legacy 26-map profiles remain valid; migration only prepares six disabled rows in a copy',()=>{
 const old={leveling:{version:1,maps:LEVEL_MAPS.filter(m=>LEGACY_LEVEL_MAPS.includes(m.id)).map(m=>({map:m.id,level:m.minLevel,enabled:false,spots:[]}))}};const bytes=JSON.stringify(old);assert.equal(validLeveling(old,0),true);const next=migrateLeveling(old,0);assert.equal(next.leveling.maps.length,32);assert.equal(next.leveling.maps.slice(26).every(m=>!m.enabled&&!m.spots.length),true);assert.equal(JSON.stringify(old),bytes);assert.equal(validLeveling(next,0),true);
});
test('family ordering and normalized search retain all Arena and Kanturu variants',()=>{
 assert.deepEqual(searchLevelMaps(' ÁRE na ').map(m=>m.id),['arena','arena2','arena3','arena4']);assert.equal(searchLevelMaps('kanturu').length,4);assert.equal(searchLevelMaps('missing').length,0);assert.equal(searchLevelMaps('aida2')[0].warpIndex,28);assert.equal(searchLevelMaps('aida2')[0].map,null);
});
test('scheduled farming cannot recover a different document spot until explicit Play',()=>{
 const policy=new DailySchedule();policy.record.farmUntil=10000;policy.record.farmOwner='old-document';assert.match(policy.blocked(1,'Hero','new-document'),/capturar un spot/);assert.equal(policy.blocked(1,'Hero','old-document'),'');
});
test('same picker uses filters without Home/config and stays inside the captured farming area',()=>{
 const f=fixture(),picker=new ExcellentLoot();f.store.pickupItemRequest=()=>{};f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0);
 const drop={netId:91,worldIndex:33,transform:{pos:{x:51,z:50}},objectNameInWorld:'Dragon Armor',droppedItem:{isMoney:false,item:{group:7,num:1,lvl:0,luck:true,isExcellent:true}}};f.world.netObjsQuery.entities=[drop];
 const preferences={loot:{...LOOT_DEFAULTS,enabled:true,namesEnabled:true},excellentNames:['dragon']},cycle={running:true,stage:{...f.farm.spot},settled:true,config:{radius:8}};
 picker.step(cycle,f.s,f.world,f.store,preferences,0,false,false,f.farm);assert.equal(f.world.pickupTarget,drop);assert.equal(picker.pending.entity,drop);picker.clear();assert.equal(f.world.pickupTarget,null);
 drop.transform.pos.x=59;picker.step(cycle,f.s,f.world,f.store,preferences,1000,false,false,f.farm);assert.equal(f.world.pickupTarget,null);
 drop.transform.pos.x=51;f.store.muHelper.active=true;picker.step(cycle,f.s,f.world,f.store,preferences,2000,false,false,f.farm);assert.equal(f.world.pickupTarget,null);
});
test('Zen is collected adjacent without movement and unknown crystal data is not identified',()=>{
 const f=fixture(),picker=new ExcellentLoot();f.farm.start(f.s,f.world,f.store,f.prefs,f.native,0);const zen={netId:92,worldIndex:33,transform:{pos:{x:51,z:50}},droppedItem:{isMoney:true,amount:10}};f.world.netObjsQuery.entities=[zen];let pickups=[];f.store.pickupItemRequest=id=>pickups.push(id);
 picker.step({running:true,stage:f.farm.spot,settled:true,config:{radius:8}},f.s,f.world,f.store,{loot:{...LOOT_DEFAULTS,enabled:true,zen:true}},0,false,false,f.farm);assert.deepEqual(pickups,[92]);assert.equal(f.world.pickupTarget,null);assert.equal(f.hero.playerMoveTo.handled,true);
});
test('extracted Home method refuses activation at 400 rather than bypassing it',()=>{
 for(const level of [399,400]){const box={notices:0,sends:0,ATt:n=>n>=400,DTt:()=>box.notices++,Lve:{createPacket:()=>({buffer:{}})}};vm.createContext(box);vm.runInContext(`store={playerData:{level:${level}},muHelper:{active:false},isOffline:false,sendToGS(){sends++},${sources.home}};store.toggleMuHelper()`,box);assert.equal(box.sends,level===399?1:0);assert.equal(box.notices,level===400?1:0);}
});
