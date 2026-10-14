const {test}=require('node:test'),assert=require('node:assert/strict');
const {ExcellentLoot,matchesExcellentLoot,lootNames,validPreferences,nativeLootSettings,nativeLootConflict,DEFAULTS}=require('../src/helper/level-helper.user.js');
const drop=(patch={})=>({netId:20,worldIndex:0,objectNameInWorld:'Dragon Armor +3',transform:{pos:{x:48,z:59}},droppedItem:{isMoney:false,item:{group:8,num:1,lvl:3,isExcellent:true,luck:true}},...patch});
function setup(){const entity=drop(),world={mapIndex:0,playerEntity:{transform:{pos:{x:47,z:59}},playerMoveTo:{point:{x:47,y:59},handled:true}},pickupTarget:null,netObjsQuery:{entities:[entity]}},s={ready:true,name:'Hero',map:0,level:20,position:{x:47,y:59}},cycle={running:true,settled:true,config:DEFAULTS},config=new Uint8Array(257);config[2]=0x80;return{loot:new ExcellentLoot(),entity,world,s,cycle,store:{muHelper:{active:true,config},pickupItemRequest(){}},preferences:{excellentLoot:true,excellentNames:['Dragon']}};}
const step=(t,now=0,hunting=false)=>t.loot.step(t.cycle,t.s,t.world,t.store,t.preferences,now,hunting);
function packet(entity){const p=new DataView(new ArrayBuffer(16)),item=entity.droppedItem.item;p.setUint8(0,0xc1);p.setUint8(2,0x22);p.setUint8(3,12);p.setUint8(4,item.num&255);p.setUint8(5,((item.lvl??0)<<3)|4);p.setUint8(7,1|((item.num&256)>>1));p.setUint8(9,item.group<<4);return p;}
test('AND strict: Excellent, Luck y nombre parcial; nunca se infieren opciones del texto',()=>{
 assert.equal(matchesExcellentLoot(drop(),['dragon']),true);assert.equal(matchesExcellentLoot(drop({objectNameInWorld:'DRAGON Gloves'}),[' Dragon ']),true);
 for(const patch of [{isExcellent:false},{isExcellent:undefined},{luck:false},{luck:undefined},{isExcellent:1},{luck:1}]){const e=drop();Object.assign(e.droppedItem.item,patch);assert.equal(matchesExcellentLoot(e,['Dragon']),false);}
 assert.equal(matchesExcellentLoot(drop(),[]),false);assert.equal(matchesExcellentLoot(drop(),['Legendary']),false);assert.equal(matchesExcellentLoot(drop({objectNameInWorld:undefined}),['Dragon']),false);
 const zen=drop();zen.droppedItem.isMoney=true;assert.equal(matchesExcellentLoot(zen,['Dragon']),false);
 assert.deepEqual(lootNames(' Dragon \r\n\nDRAGON\n  Legendary   Armor  '),['dragon','legendary armor']);
});
test('preferencias v1 viejas y límites del listado',()=>{
 const old={...DEFAULTS,version:1};assert.equal(validPreferences(old),true);
 for(const patch of [{excellentLoot:'true'},{excellentNames:'Dragon'},{excellentNames:['']},{excellentNames:['a'.repeat(81)]},{excellentNames:Array(51).fill('Dragon')}])assert.equal(validPreferences({...old,...patch}),false);
 assert.equal(validPreferences({...old,excellentLoot:false,excellentNames:['Dragon']}),true);
});
test('blob nativo: detecta OR amplios pero conserva Zen/jewels; no confunde pickSelectedItems',()=>{
 const config=new Uint8Array(257);config[2]=0x80;config[1]=0x48;config[27]=0x80;assert.deepEqual(nativeLootSettings(config),{broad:false,any:true,range:8});
 for(const [byte,bit] of [[1,0x10],[1,0x20],[1,0x80],[27,0x40]]){const broad=config.slice();broad[byte]|=bit;assert.equal(nativeLootSettings(broad).broad,true);assert.match(nativeLootConflict({excellentLoot:true},broad),/desactivá/);}
 assert.equal(nativeLootConflict({excellentLoot:false,excellentNames:[]},null),'');assert.match(nativeLootConflict({excellentLoot:false,excellentNames:['Dragon']},null),/esperando/);
 assert.equal(nativeLootSettings({pickExcellent:false}),null);assert.equal(nativeLootSettings(new Uint8Array(12)),null);
});
test('selección cercana, scope/mapa, radio y camino; deja intactos clicks manuales',()=>{
 const t=setup(),bad=drop({netId:21});bad.droppedItem.item.luck=false;t.world.netObjsQuery.entities.unshift(bad);step(t);assert.equal(t.world.pickupTarget,t.entity);
 for(const patch of [{objOutOfScope:true},{worldIndex:7},{worldIndex:undefined},{transform:{pos:{x:80,z:59}}}]){const t=setup();Object.assign(t.entity,patch);step(t);assert.equal(t.world.pickupTarget,null);}
 const blocked=setup();blocked.world.pathfinder={search:()=>[{x:47,y:59}]};blocked.entity.transform.pos.x=52;step(blocked);assert.equal(blocked.world.pickupTarget,null);
 const manual=setup(),other=drop({netId:99});manual.world.pickupTarget=other;step(manual);assert.equal(manual.world.pickupTarget,other);
});
test('apagado, vacío, pausa, muerte, traslado y Golden hunt no recogen',()=>{
 for(const change of [t=>t.preferences.excellentLoot=false,t=>t.preferences.excellentNames=[],t=>t.cycle.running=false,t=>t.cycle.settled=false,t=>t.s.dead=true,t=>t.s.loading=true,t=>t.s.ready=false,t=>t.store.muHelper.active=false,t=>t.store.muHelper.config[1]=0x20]){const t=setup();change(t);step(t);assert.equal(t.world.pickupTarget,null);}
 const t=setup();step(t,0,true);assert.equal(t.world.pickupTarget,null);step(t);assert.equal(t.world.pickupTarget,t.entity);step(t,500,true);assert.equal(t.world.pickupTarget,null);
});
test('confirmación requiere item correcto; desaparición no es éxito; rechazo espera un minuto',()=>{
 const t=setup();step(t);const wrong=packet(t.entity);wrong.setUint8(4,2);assert.equal(t.loot.confirm(wrong),false);assert.equal(t.loot.confirm(new DataView(new ArrayBuffer(2))),false);
 const noLuck=packet(t.entity);noLuck.setUint8(5,24);assert.equal(t.loot.confirm(noLuck),false);
 const noExcellent=packet(t.entity);noExcellent.setUint8(7,0);assert.equal(t.loot.confirm(noExcellent),false);
 t.world.pickupTarget=null;t.world.netObjsQuery.entities=[];step(t,500);assert.notEqual(t.loot.pending,null);step(t,15000);assert.equal(t.loot.pending,null);assert.match(t.loot.message,/confirmar/);
 t.world.netObjsQuery.entities=[t.entity];step(t,74999);assert.equal(t.world.pickupTarget,null);step(t,75000);assert.equal(t.world.pickupTarget,t.entity);assert.equal(t.loot.confirm(packet(t.entity)),true);assert.equal(t.loot.pending,null);step(t,76000);assert.equal(t.world.pickupTarget,null);
 const failed=setup();step(failed);failed.loot.failed(500);step(failed,1000);assert.equal(failed.world.pickupTarget,null);step(failed,60500);assert.equal(failed.world.pickupTarget,failed.entity);
});
test('cancelar solo movimiento propio; cambio de target o personaje no toca lo manual',()=>{
 const t=setup();step(t);t.world.playerEntity.playerMoveTo.point={x:48,y:59};t.world.playerEntity.pathfinding={path:[{x:48,y:59}]};t.preferences.excellentLoot=false;step(t,500);assert.equal(t.world.pickupTarget,null);assert.equal(t.world.playerEntity.pathfinding.path,null);assert.deepEqual(t.world.playerEntity.playerMoveTo.point,{x:47,y:59});
 const manual=setup();step(manual);const other=drop({netId:99});manual.world.pickupTarget=other;step(manual,500);assert.equal(manual.loot.pending,null);assert.equal(manual.world.pickupTarget,other);
 const changed=setup();step(changed);changed.s.map=7;step(changed,500);assert.equal(changed.loot.pending,null);
});
