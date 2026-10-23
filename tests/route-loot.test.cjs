const {test}=require('node:test'),assert=require('node:assert/strict');
const {LEVEL_MAPS,levelPath,validPath,validPreferences,route,Cycle,DEFAULTS,LOOT_DEFAULTS,lootPolicy,matchesLoot,ExcellentLoot,nativeLootConflict}=require('../src/helper/level-helper.user.js');
const path=[{map:'lorencia',level:10,x:47,y:59},{map:'atlans3',level:110,x:65,y:160},{map:'icarus',level:190,x:43,y:155}];
const prefs={version:1,...DEFAULTS,path,loot:{...LOOT_DEFAULTS,enabled:true,namesEnabled:true},excellentNames:['dragon']};
const state=(patch={})=>({ready:true,name:'Hero',level:10,map:0,warpSerial:0,position:{x:47,y:59},...patch});
test('32 destinations match the supplied minima and preserve legacy spots/toggles',()=>{
 assert.equal(LEVEL_MAPS.length,32);assert.equal(new Set(LEVEL_MAPS.map(m=>m.id)).size,32);
 assert.deepEqual(LEVEL_MAPS.map(m=>m.minLevel),[50,10,10,20,20,20,20,30,40,50,100,200,300,50,50,50,60,60,70,70,70,80,90,140,140,170,140,170,150,150,190,210]);
 assert.deepEqual(levelPath({...DEFAULTS,arena:false,spots:{...DEFAULTS.spots,lorencia:{x:105,y:81}}}),[{map:'lorencia',level:10,x:105,y:81},{map:'icarus',level:170,x:43,y:155}]);
 assert.deepEqual(lootPolicy({excellentLoot:true}),{...LOOT_DEFAULTS,enabled:true,namesEnabled:true});
});
test('route boundaries, delays, ascending order, malformed coordinates and minimum enforcement',()=>{
 assert.equal(validPreferences(prefs),true);assert.equal(route(9,prefs),null);
 for(const [level,id] of [[10,'lorencia'],[109,'lorencia'],[110,'atlans3'],[189,'atlans3'],[190,'icarus'],[399,'icarus']])assert.equal(route(level,prefs).id,id);
 for(const invalid of [[],null,{},Array(27).fill(path[0]),[{...path[0],map:'unknown'}],[{...path[0],level:9}],[{...path[0],level:400}],[{...path[0],x:256}],[{...path[0],y:NaN}],[path[1],path[0]],[path[0],{...path[1],level:10}]])assert.equal(validPath(invalid),false);
 assert.equal(validPreferences({...prefs,path:[{...path[0],level:9}]}),false);
});
test('below first minimum stays in initial map, including after reset and with inaccessible first destination',()=>{
 const c=new Cycle(prefs),s=state({level:1});c.start(s,0);assert.equal(c.step(s,0).kind,'helper');assert.equal(c.pending,null);
 const other=new Cycle({...prefs,path:[path[1]]});other.start(s,0);assert.equal(other.step(s,0).kind,'helper');assert.equal(other.stage.map,0);
 const spawn=state({level:1,position:{x:125,y:125}}),base=new Cycle({...prefs,path:[path[1]]});base.start(spawn,0);const fallback=base.step(spawn,0);assert.equal(fallback.kind,'walk');assert.equal(fallback.spot.id,'lorencia');assert.equal(fallback.spot.x,47);assert.equal(base.pending,null);
 assert.equal(other.step({...s,level:110},5000).text,'/move atlans3');assert.equal(other.step({...s,level:400},10000).text,'/reset');
 const next=other.step({...s,level:1},15000);assert.equal(next.kind,'helper');assert.equal(other.stage.map,0);assert.equal(other.resets,1);
});
test('same-map variants wait for a fresh MapChanged and cannot use stadium fallback',()=>{
 const config={...prefs,path:[{map:'devias',level:20,x:100,y:100},{map:'devias2',level:30,x:100,y:100}]};
 const c=new Cycle(config),s=state({level:20,map:2,position:{x:100,y:100},warpSerial:7});c.start(s,0);c.step(s,0);
 assert.equal(c.step({...s,level:30},5000).text,'/move devias2');assert.equal(c.step({...s,level:30},10000),null);
 assert.equal(c.step({...s,level:30,warpSerial:8},11000).kind,'helper');
 const failed=new Cycle({...prefs,path:[{map:'arena',level:50,x:12,y:39},{map:'arena2',level:100,x:20,y:30}]});const arena=state({level:50,map:6,position:{x:12,y:39}});failed.start(arena,0);failed.step(arena,0);assert.equal(failed.step({...arena,level:100},5000).text,'/move arena2');assert.equal(failed.step({...arena,level:100},26000).kind,'stop');
});
const drop=(patch={})=>({netId:20,worldIndex:0,objectNameInWorld:'Dragon Armor',transform:{pos:{x:48,z:59}},droppedItem:{isMoney:false,item:{group:8,num:1,lvl:3,luck:true,isExcellent:true}},...patch});
test('Arena 2/3/4 use explicit chat teleports and confirm arrival even when starting in Arena',()=>{
 for(const [id,level,destination] of [['arena2',100,83],['arena3',200,84],['arena4',300,85]])for(const map of [0,6]){
  const c=new Cycle({...prefs,path:[{map:id,level,x:20,y:30}]}),s=state({map,level,position:{x:20,y:30},warpSerial:7});c.start(s,0);
  const action=c.step(s,0);assert.equal(action.text,'/move '+id);assert.equal(action.warpIndex,undefined);
  assert.equal(c.step(s,1000),null);assert.equal(c.step({...s,map:destination,warpSerial:8},2000).kind,'helper');
 }
});
test('loot categories OR and name requirements AND; exact jewels IDs; money independent of names',()=>{
 const good=drop(),plain=drop({droppedItem:{item:{group:8,num:1,isExcellent:false,luck:false}}}),money=drop({droppedItem:{isMoney:true}});
 assert.equal(matchesLoot(good,prefs),true);assert.equal(matchesLoot(plain,prefs),false);assert.equal(matchesLoot(money,prefs),false);
 assert.equal(matchesLoot(plain,{...prefs,loot:{...prefs.loot,nameExcellent:false,nameLuck:false}}),true);
 assert.equal(matchesLoot(drop({objectNameInWorld:'Plate Armor'}),prefs),false);
 for(const key of ['zen','all'])assert.equal(matchesLoot(money,{...prefs,loot:{...prefs.loot,[key]:true}}),true);
 assert.equal(matchesLoot(drop({objectNameInWorld:'Plate Armor'}),{...prefs,loot:{...prefs.loot,excellent:true}}),true);
 assert.equal(matchesLoot(drop({droppedItem:{item:{isAncient:true}}}),{...prefs,loot:{...prefs.loot,ancient:true}}),true);
 for(const [group,num] of [[12,15],[14,13],[14,14],[14,16],[14,22],[14,31],[14,41],[14,42],[14,43],[14,44]])assert.equal(matchesLoot(drop({droppedItem:{item:{group,num}}}),{...prefs,loot:{...prefs.loot,jewels:true}}),true);
 assert.equal(matchesLoot(drop({droppedItem:{item:{group:14,num:11}}}),{...prefs,loot:{...prefs.loot,jewels:true}}),false);
 assert.equal(matchesLoot(plain,{...prefs,loot:{...prefs.loot,namesEnabled:false}}),false);
 for(const range of [0,9,1.5,NaN])assert.equal(validPreferences({...prefs,loot:{...prefs.loot,range}}),false);
});
test('unified loot rejects overlapping native Zen/jewels but disabled policy leaves Home independent',()=>{
 const blob=new Uint8Array(257);blob[2]=0x80;
 assert.equal(nativeLootConflict(prefs,blob),'');
 for(const bit of [8,16,32,64,128]){blob[1]=bit;assert.match(nativeLootConflict(prefs,blob),/todos los filtros/);assert.equal(nativeLootConflict({...prefs,loot:{...prefs.loot,enabled:false}},blob),'');}
});
test('money requires explicit success; disappearance does not count; non-excellent pickup confirmation works',()=>{
 const blob=new Uint8Array(257);blob[2]=0x10;
 const requests=[],entity=drop({droppedItem:{isMoney:true}}),world={playerEntity:{},pickupTarget:null,netObjsQuery:{entities:[entity]}},s=state(),cycle={running:true,settled:true,config:prefs,stage:path[0]},store={muHelper:{active:true,config:blob},pickupItemRequest(id){requests.push(id);}},loot=new ExcellentLoot(),settings={...prefs,loot:{...prefs.loot,zen:true,range:5}};
 loot.step(cycle,s,world,store,settings,0);assert.equal(world.pickupTarget,null);assert.deepEqual(requests,[entity.netId]);assert.equal(loot.pending.direct,true);
 world.netObjsQuery.entities=[];loot.step(cycle,s,world,store,settings,1000);assert.notEqual(loot.pending,null);
 const packet=new DataView(new ArrayBuffer(8));packet.setUint8(0,0xc1);packet.setUint8(2,0x22);packet.setUint8(3,0xff);assert.equal(loot.confirm(packet),false);packet.setUint8(3,0xfe);assert.equal(loot.confirm(packet),true);
 const plain=drop({droppedItem:{item:{group:8,num:1,lvl:3,luck:false,isExcellent:false}}});world.netObjsQuery.entities=[plain];loot.step(cycle,s,world,store,{...settings,loot:{...settings.loot,all:true}},2000);assert.equal(world.pickupTarget,plain);
 const item=new DataView(new ArrayBuffer(10));item.setUint8(0,0xc1);item.setUint8(2,0x22);item.setUint8(3,1);item.setUint8(4,1);item.setUint8(5,24);item.setUint8(9,128);assert.equal(loot.confirm(item),true);
});

test('disabled steps preserve spots, skip intermediate destinations and resume when enabled',()=>{
 const steps=[{map:'arena2',level:100,x:11,y:22},{map:'arena3',level:200,x:33,y:44},{map:'arena4',level:300,x:55,y:66,enabled:false}];
 const config={...prefs,path:steps};assert.equal(validPath(steps),true);
 assert.equal(route(399,config).id,'arena3');assert.equal(route(399,config).stepIndex,1);
 const restored=JSON.parse(JSON.stringify(config));restored.path[2].enabled=true;
 assert.equal(route(399,restored).id,'arena4');assert.equal(route(399,restored).x,55);assert.equal(route(399,restored).y,66);
 restored.path[1].enabled=false;assert.equal(route(250,restored).id,'arena2');assert.equal(route(399,restored).id,'arena4');
 assert.equal(validPath(steps.map(p=>({...p,enabled:false}))),false);assert.equal(validPath([{...steps[0],enabled:'false'}]),false);
 const c=new Cycle({...config,autoReset:false}),s=state({level:350,map:84,position:{x:33,y:44}});assert.equal(c.start(s,0),true);assert.equal(c.step(s,0).kind,'helper');assert.equal(c.stage.id,'arena3');
});
