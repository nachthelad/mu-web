const {test}=require('node:test'),assert=require('node:assert/strict');
const {ExcellentLoot,matchesLoot,validLootPreferences,LOOT_DEFAULTS,DEFAULTS}=require('../src/helper/level-helper.user.js');
const box=(lvl=8)=>({netId:20,worldIndex:0,objectNameInWorld:'Caja traducida',transform:{pos:{x:51,z:50}},droppedItem:{isMoney:false,item:{group:14,num:11,lvl,isExcellent:false,luck:false}}});
function setup(){const entity=box(),hero={transform:{pos:{x:50,z:50}},playerMoveTo:{point:{x:50,y:50},handled:true}},world={playerEntity:hero,pickupTarget:null,netObjsQuery:{entities:[entity]}};return{entity,world,hero,picker:new ExcellentLoot(),s:{ready:true,map:0,position:{x:50,y:50}},cycle:{running:true,settled:false,stage:{x:100,y:100},config:DEFAULTS},store:{muHelper:{active:true,config:new Uint8Array(257)},pickupItemRequest(){}},preferences:{loot:{...LOOT_DEFAULTS,enabled:true,kundun:true},excellentNames:[]}};}
const step=(t,now=0,busy=false)=>t.picker.step(t.cycle,t.s,t.world,t.store,t.preferences,now,busy);
test('Kundun identifies only real +1..+5, independent of text, names, Excellent and Luck',()=>{
 const t=setup();for(let lvl=0;lvl<=15;lvl++)assert.equal(matchesLoot(box(lvl),t.preferences),lvl>=8&&lvl<=12);
 for(const patch of [{group:13},{num:10},{lvl:undefined},{lvl:8.5}]){const e=box();Object.assign(e.droppedItem.item,patch);e.objectNameInWorld='Box of Kundun +1';assert.equal(matchesLoot(e,t.preferences),false);}
 assert.equal(matchesLoot(box(),{...t.preferences,loot:{...t.preferences.loot,kundun:false}}),false);
 assert.equal(validLootPreferences({...t.preferences,loot:{...t.preferences.loot,kundun:'true'}}),false);
 const legacy={...t.preferences,loot:{...t.preferences.loot}};delete legacy.loot.kundun;assert.equal(validLootPreferences(legacy),true);
});
test('Kundun uses hero range before spot arrival, prefers boxes and leaves ordinary loot scoped',()=>{
 const t=setup();step(t);assert.equal(t.world.pickupTarget,t.entity);assert.equal(t.picker.pending.kundun,true);
 const far=setup();far.entity.transform.pos.x=60;step(far);assert.equal(far.world.pickupTarget,null);
 const normal=setup();normal.entity.droppedItem.item={group:8,num:1,isAncient:true};step(normal);assert.equal(normal.world.pickupTarget,null);
 const priority=setup();priority.cycle.settled=true;priority.cycle.stage={x:50,y:50};priority.preferences.loot.ancient=true;const ancient=box();ancient.netId=21;ancient.transform.pos.x=50;ancient.droppedItem.item={group:8,num:1,isAncient:true};priority.world.netObjsQuery.entities.unshift(ancient);step(priority);assert.equal(priority.world.pickupTarget,priority.entity);
});
test('Kundun respects master, Play, Home, busy transitions, safe zone, scope, range and manual targets',()=>{
 for(const change of [t=>t.preferences.loot.enabled=false,t=>t.cycle.running=false,t=>t.store.muHelper.active=false,t=>t.store.muHelper.config[1]=0x80,t=>t.s.dead=true,t=>t.s.loading=true,t=>t.s.ready=false,t=>t.entity.objOutOfScope=true,t=>t.entity.worldIndex=3,t=>t.hero.attributeSystem={isAboveZero:()=>true},t=>t.preferences.loot.kundun=false]){const t=setup();change(t);step(t);assert.equal(t.world.pickupTarget,null);}
 const busy=setup();step(busy,0,true);assert.equal(busy.world.pickupTarget,null);
 const manual=setup();const other=box();manual.world.pickupTarget=other;step(manual);assert.equal(manual.world.pickupTarget,other);
 const blocked=setup();blocked.entity.transform.pos.x=54;blocked.world.pathfinder={search:()=>[]};step(blocked);assert.equal(blocked.world.pickupTarget,null);
 const cancel=setup();step(cancel);cancel.cycle.running=false;step(cancel,500);assert.equal(cancel.world.pickupTarget,null);
});
test('Kundun retries only three times with spacing and requires a matching inventory response',()=>{
 const t=setup();step(t);t.picker.failed(100);step(t,2099);assert.equal(t.world.pickupTarget,null);step(t,2100);assert.equal(t.world.pickupTarget,t.entity);
 t.picker.failed(2200);step(t,4200);assert.equal(t.world.pickupTarget,t.entity);t.picker.failed(4300);step(t,6300);assert.equal(t.world.pickupTarget,null);step(t,64300);assert.equal(t.world.pickupTarget,t.entity);
 const p=new DataView(new ArrayBuffer(16));p.setUint8(0,0xc1);p.setUint8(2,0x22);p.setUint8(3,12);p.setUint8(4,11);p.setUint8(5,8<<3);p.setUint8(9,14<<4);
 const wrong=new DataView(p.buffer.slice(0));wrong.setUint8(5,9<<3);assert.equal(t.picker.confirm(wrong),false);assert.equal(t.picker.confirm(p),true);step(t,65000);assert.equal(t.world.pickupTarget,null);
});
