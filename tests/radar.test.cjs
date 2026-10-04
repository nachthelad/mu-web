const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Tracker,position,invasionPacket,TTL}=require('../src/radar/golden-radar.user.js');
const entity=(id,type,x=100,y=120)=>({netId:id,npcType:type,transform:{pos:{x,y:0,z:y}}});
const world=()=>({mapIndex:0,playerEntity:entity(0,undefined),netObjsQuery:{entities:[entity(1,44),entity(2,79,110),entity(3,43,120),entity(4,2)]}});
test('MapEventState: bit Enable, evento dorado y datos inválidos',()=>{
 const packet=bytes=>new DataView(Uint8Array.from(bytes).buffer);
 assert.deepEqual(invasionPacket(packet([193,5,11,1,3])),{enabled:true,event:3});
 assert.deepEqual(invasionPacket(packet([193,5,11,2,3])),{enabled:false,event:3});
 assert.equal(invasionPacket(packet([193,4,11,1,3])),null);
 assert.equal(invasionPacket(packet([193,5,12,1,3])),null);
 assert.equal(invasionPacket(new ArrayBuffer(5)),null);
});
test('selecciona tipos reales, x/z y orden de distancia; Budge opcional',()=>{
 const tracker=new Tracker(),w=world(),data=tracker.scan(w,0);
 assert.deepEqual(data.live.map(r=>r.type),[44,79,43]);
 assert.equal(data.live[1].distance,10);assert.equal(data.live[0].y,120);
 assert.deepEqual(tracker.scan(w,10,false).live.map(r=>r.type),[44,79]);
 assert.equal(position(entity(9,44,NaN)),null);assert.equal(position(entity(9,44,256)),null);
});
test('salida de alcance caduca y recalcula distancia desde el jugador',()=>{
 const tracker=new Tracker(),w=world();tracker.scan(w,100);
 w.netObjsQuery.entities=[];w.playerEntity.transform.pos.x=110;
 const data=tracker.scan(w,1000);assert.equal(data.live.length,0);assert.equal(data.recent.length,3);assert.equal(data.recent[0].distance,10);
 assert.equal(tracker.scan(w,101+TTL).recent.length,0);
});
test('muertos se retiran; fuera de alcance queda como rastro',()=>{
 const tracker=new Tracker(),w=world();tracker.scan(w,0);
 w.netObjsQuery.entities[0].dying=true;w.netObjsQuery.entities[1].objOutOfScope=true;
 const data=tracker.scan(w,500);assert.deepEqual(data.live.map(r=>r.type),[43]);assert.deepEqual(data.recent.map(r=>r.type),[79]);
});
test('mapa, personaje, mundo y desconexión no conservan rastros',()=>{
 for(const mutate of [w=>w.mapIndex=2,w=>w.playerEntity=entity(0,undefined),w=>w.playerEntity=null]){
  const tracker=new Tracker(),w=world();tracker.scan(w,0);w.netObjsQuery.entities=[];mutate(w);
  assert.equal(tracker.scan(w,100).recent.length,0);
 }
 const tracker=new Tracker();tracker.scan(world(),0);const next=world();next.netObjsQuery.entities=[];assert.equal(tracker.scan(next,10).recent.length,0);
});
test('no cuenta jugadores disfrazados, otro mapa ni posiciones inválidas',()=>{
 const w=world();w.netObjsQuery.entities[0].localPlayer=true;w.netObjsQuery.entities[1].worldIndex=2;w.netObjsQuery.entities[2].transform.pos.z=-1;
 assert.equal(new Tracker().scan(w,0).live.length,0);
});

test('Atlans: detecta tres dorados Lizard King y Vepar sin incluir monstruos comunes',()=>{
 const w=world();w.mapIndex=7;w.netObjsQuery.entities=[entity(10,80,90,110),entity(11,81,95,115),entity(12,80,110,125),entity(13,51)];
 const tracker=new Tracker(),data=tracker.scan(w,100,false);
 assert.deepEqual(data.live.map(r=>r.id).sort((a,b)=>a-b),[10,11,12]);
 assert.equal(data.live.find(r=>r.type===81).name,'Golden Vepar');
 const {Archive}=require('../src/radar/golden-radar.user.js');const archive=new Archive({getItem:()=>null,setItem:()=>{}});archive.observe(7,data.live,100,false);assert.equal(archive.forMap(7,false).length,3);
 w.netObjsQuery.entities=[];assert.equal(tracker.scan(w,200,false).recent.length,3);
});

test('catálogo completo del cliente: detección e historial en cualquier mapa',()=>{
 const types=require('./fixtures/golden-types.json');
 for(const map of [0,2,3,7,8,10,33,37,51,99]){
  const w=world();w.mapIndex=map;w.netObjsQuery.entities=types.map(([type],i)=>entity(i+10,type));
  w.netObjsQuery.entities.push(entity(1000,236),entity(1001,151),entity(1002,42));
  const data=new Tracker().scan(w,0,true);
  assert.deepEqual(data.live.map(r=>[r.type,r.name]),types);
  const {Archive}=require('../src/radar/golden-radar.user.js');let saved;const storage={getItem:()=>saved||null,setItem:(k,v)=>saved=v};
  const archive=new Archive(storage);archive.observe(map,data.live,100,false);
  assert.equal(new Archive(storage).forMap(map).length,types.length);
  assert.equal(new Tracker().scan(w,0,false).live.length,types.length-1);
 }
});
