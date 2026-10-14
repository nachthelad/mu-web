const {test}=require('node:test'),assert=require('node:assert/strict');
const {GoldenHunt,MoveLevels,HUNT_ROUTE,huntPoints,isKundun}=require('../src/helper/level-helper.user.js');
const storage=()=>{const data=new Map();return{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};};
function setup(level=200){const s={ready:true,connected:true,name:'Hero',charClass:4,server:'demo',level,map:0,position:{x:47,y:59},warpSerial:0};const world={netObjsQuery:{entities:[]},isWalkable:()=>true,getTerrainFlag:()=>0};const levels=new MoveLevels(storage());const h=new GoldenHunt(levels);h.enabled=true;const c={event:{id:1,phase:'active',at:0},records:[],types:[43,53,54,80,81,82,83],world,lootCount:0};return{s,c,h,levels};}
function arrive(t,now=1){t.h.commandSent(now-1,t.s.warpSerial);const d=t.h.destination;t.s.map=d.map;t.s.position={x:d.x,y:d.y};t.s.warpSerial++;return t.h.step(t.s,t.c,now);}
test('Kundun identifica 14/11 nivel 8–12, sin tomar Box of Luck ni Symbol',()=>{assert.equal(isKundun({group:14,num:11,lvl:8}),true);for(const i of [{group:14,num:11,lvl:0},{group:14,num:29,lvl:8},{group:14,num:11,lvl:13}])assert.equal(isKundun(i),false);});
test('aprende requisito por personaje/clase y persiste sin inventar nivel de dinero',()=>{const t=setup(10);assert.equal(t.levels.required(t.s,HUNT_ROUTE[0]),null);assert.equal(t.levels.learn(t.s,HUNT_ROUTE[0],'You need 8500 in order to warp'),false);assert.equal(t.levels.learn(t.s,HUNT_ROUTE[0],'You need to be level 140 in order to warp'),true);assert.equal(new MoveLevels(t.levels.storage).required(t.s,HUNT_ROUTE[0]),140);assert.equal(t.levels.required({...t.s,charClass:12},HUNT_ROUTE[0]),null);});
test('prueba desconocido una vez, aprende rechazo y omite requisito conocido',()=>{const t=setup(10);assert.equal(t.h.step(t.s,t.c,0).text,'/move tarkan2');t.h.commandSent(0,t.s.warpSerial);t.h.feedback('You need to be level 140 in order to warp',t.s,10);assert.equal(t.h.step(t.s,t.c,6000).text,'/move atlans3');assert.equal(t.levels.required(t.s,HUNT_ROUTE[0]),140);});
test('Tarkan vacío sale a los dos minutos; Atlans mantiene cinco minutos',()=>{const t=setup();t.h.step(t.s,t.c,0);arrive(t,1000);t.s.position.x+=2;t.h.progressAt=120999;assert.notEqual(t.h.step(t.s,t.c,120999)?.kind,'command');assert.equal(t.h.step(t.s,t.c,121000).text,'/move atlans3');arrive(t,122000);assert.equal(t.h.step(t.s,t.c,422000).text,'/move atlans2');});
test('avistamiento reinicia espera en Tarkan y Kundun pendiente bloquea salida',()=>{
  const t=setup();t.h.step(t.s,t.c,0);arrive(t,1000);const e={netId:5,npcType:82,transform:{pos:{x:100,z:145}}};t.c.world.netObjsQuery.entities=[e];t.h.step(t.s,t.c,110000);t.c.world.netObjsQuery.entities=[];t.h.step(t.s,t.c,121000);assert.equal(t.h.destination.id,'tarkan2');
  const drop={netId:6,transform:{pos:{x:100,z:145}},droppedItem:{item:{group:14,num:11,lvl:8}}};t.c.world.netObjsQuery.entities=[drop];assert.equal(t.h.step(t.s,t.c,229999).kind,'huntLoot');assert.equal(t.h.step(t.s,t.c,230000),null);t.c.lootCount=1;t.h.step(t.s,t.c,231000);t.c.world.netObjsQuery.entities=[];assert.equal(t.h.step(t.s,t.c,233000).text,'/move atlans3');
});
test('spots históricos primero, únicos, region Atlans2/3 separada y terreno seguro excluido',()=>{const d=HUNT_ROUTE[1],world={isWalkable:()=>true,getTerrainFlag:(x,y)=>x===210&&y===55?1:0};const points=huntPoints(d,[{map:7,x:220,y:60},{map:7,x:220,y:60},{map:7,x:62,y:160},{map:7,x:210,y:55}],world);assert.deepEqual(points[0],{x:220,y:60});assert.equal(points.filter(p=>p.x===220&&p.y===60).length,1);assert.equal(points.some(p=>p.x===62&&p.y===160),false);assert.equal(points.some(p=>p.x===210&&p.y===55),false);});
test('loot tiene prioridad, desaparición no confirma, respuesta confirma y rechazo pausa',()=>{const t=setup();t.h.step(t.s,t.c,0);arrive(t);const drop={netId:99,worldIndex:8,transform:{pos:{x:98,z:145}},droppedItem:{group:14,num:11,item:{group:14,num:11,lvl:8}}};t.c.world.netObjsQuery.entities=[drop];assert.equal(t.h.step(t.s,t.c,500).kind,'huntLoot');t.c.world.netObjsQuery.entities=[];assert.equal(t.h.step(t.s,t.c,1000),null);t.c.lootCount=1;t.h.step(t.s,t.c,1500);assert.equal(t.h.boxes,1);t.c.world.netObjsQuery.entities=[{...drop,netId:100}];t.h.step(t.s,t.c,2000);t.h.lootFailed('Inventario lleno');assert.equal(t.h.active,false);assert.match(t.h.message,/Inventario lleno/);});
test('dorados vivos primero, nunca comunes ni fuera de mapa; desconexión cancela',()=>{const t=setup();t.h.step(t.s,t.c,0);arrive(t);const e={netId:10,npcType:82,worldIndex:8,transform:{pos:{x:100,z:145}}};t.c.world.netObjsQuery.entities=[{...e,npcType:2},e];assert.equal(t.h.step(t.s,t.c,500).entity,e);assert.equal(t.h.step({...t.s,ready:false},t.c,1000).kind,'clear');assert.equal(t.h.enabled,false);});
test('fin global cierra tras loot y evento completado no vuelve a empezar',()=>{const t=setup();t.h.step(t.s,t.c,0);arrive(t);t.c.event.phase='ended';assert.equal(t.h.step(t.s,t.c,500).kind,'clear');assert.equal(t.h.active,false);assert.equal(t.h.enabled,true);t.c.event.phase='active';assert.equal(t.h.step(t.s,t.c,1000),null);});
test('cancelar retira estado pendiente y muerte suspende presupuesto',()=>{const t=setup();t.h.step(t.s,t.c,0);arrive(t,100);t.h.step({...t.s,dead:true},t.c,200);t.h.step(t.s,t.c,10200);assert.equal(t.h.arrivedAt,10100);assert.equal(t.h.cancel().kind,'clear');assert.equal(t.h.pending,null);assert.equal(t.h.active,false);});
test('requisito conocido no envía /move y datos corruptos no se sobrescriben',()=>{
  const t=setup(10);t.levels.learn(t.s,HUNT_ROUTE[0],'You need to be level 140 in order to warp');assert.equal(t.h.step(t.s,t.c,0).kind,'clear');assert.equal(t.h.destination.id,'atlans3');
  const st=storage();st.setItem('mu.gold-hunter.move-levels.v1','corrupt');const levels=new MoveLevels(st);levels.learn(t.s,HUNT_ROUTE[0],'You need to be level 140 in order to warp');assert.equal(st.getItem(levels.key),'corrupt');assert.equal(levels.saved,false);
});
test('rechazo se correlaciona con comando enviado, no con nivel de otra clase',()=>{
  const t=setup();t.h.step(t.s,t.c,0);t.h.feedback('You need to be level 140 in order to warp',t.s,1);assert.equal(t.levels.required(t.s,HUNT_ROUTE[0]),null);
  t.h.commandSent(10,0);t.h.feedback('You need to be level 140 in order to warp',{...t.s,charClass:12},11);assert.equal(t.levels.required(t.s,HUNT_ROUTE[0]),null);
});
test('muerte en otro mapa conserva tiempo restante al volver y warp erróneo no confirma',()=>{
  const t=setup();t.h.step(t.s,t.c,0);arrive(t,1000);t.h.step({...t.s,dead:true},t.c,61000);t.s.map=0;t.h.step(t.s,t.c,71000);t.h.commandSent(71000,t.s.warpSerial);arrive(t,72000);assert.equal(t.h.arrivedAt,12000);
  t.h.next();t.h.step(t.s,t.c,80000);t.h.commandSent(80000,t.s.warpSerial);t.s.map=7;t.s.position={x:227,y:52};t.s.warpSerial++;t.h.step(t.s,t.c,81000);assert.notEqual(t.h.pending,null);
});
test('loot pendiente al vencer los 5 min demora salida hasta confirmar o reportar error',()=>{
  const t=setup();t.h.step(t.s,t.c,0);arrive(t,1);const e={netId:12,worldIndex:8,transform:{pos:{x:98,z:145}},droppedItem:{item:{group:14,num:11,lvl:8}}};t.c.world.netObjsQuery.entities=[e];t.h.step(t.s,t.c,300000);assert.equal(t.h.step(t.s,t.c,301000),null);assert.equal(t.h.destination.id,'tarkan2');t.h.step(t.s,t.c,316000);assert.equal(t.h.enabled,false);assert.match(t.h.message,/sin confirmación/);
});
test('patrulla inmóvil pausa tras 45 s y un mapa bloqueado no emite walk',()=>{
  const t=setup();t.h.step(t.s,t.c,0);arrive(t,1);assert.equal(t.h.step(t.s,t.c,45002).kind,'clear');assert.match(t.h.message,/sin avanzar/);
  const b=setup();b.c.world.isWalkable=()=>false;b.h.step(b.s,b.c,0);assert.equal(arrive(b,1).kind,'clear');assert.match(b.h.message,/sin puntos transitables/);
});
test('Radar vivo interrumpe patrulla fuera de región, prioriza nivel y conserva objetivo',()=>{
  const t=setup();t.h.step(t.s,t.c,0);arrive(t,1);
  const low={netId:10,npcType:83,transform:{pos:{x:100,z:145}}},high={netId:11,npcType:82,transform:{pos:{x:195,z:61}}};
  t.c.world.netObjsQuery.entities=[low,high];Object.assign(t.c,{map:8,live:[{id:10},{id:11}],recent:[],seen:100});
  assert.equal(t.h.step(t.s,t.c,100).entity,high);low.transform.pos={x:98,z:145};t.c.seen=400;assert.equal(t.h.step(t.s,t.c,400).entity,high);
  assert.equal(t.h.kills[8],undefined);
});
test('perder scope no confirma kill ni impone espera de cadáver; busca rastro una vez',()=>{
  const t=setup();t.h.step(t.s,t.c,0);arrive(t,1);const e={netId:10,npcType:82,transform:{pos:{x:110,z:145}}};t.c.world.netObjsQuery.entities=[e];t.h.step(t.s,t.c,100);
  e.objOutOfScope=true;t.h.step(t.s,t.c,200);assert.equal(t.h.corpseUntil,0);assert.equal(t.h.kills[8],undefined);
  Object.assign(t.c,{map:8,live:[],seen:201,recent:[{id:10,type:82,observation:1,x:110,y:145,seen:100}]});assert.deepEqual(t.h.step(t.s,t.c,201).spot,{x:110,y:145});
  t.s.position={x:110,y:145};t.h.step(t.s,t.c,300);assert.equal(t.h.recentSearch,null);
});
test('quinta kill propia espera loot, deduplica encuentro y omite todo Atlans',()=>{
  const t=setup();t.h.step(t.s,t.c,0);arrive(t,1);t.h.next();t.h.step(t.s,t.c,6000);arrive(t,6001);
  for(let i=0;i<5;i++){const e={netId:22,npcType:80,worldIndex:7,transform:{pos:{x:65,z:160}},dying:{killedByHero:true}};t.c.world.netObjsQuery.entities=[e];t.h.step(t.s,t.c,7000+i*5000);t.h.step(t.s,t.c,7001+i*5000);}
  assert.equal(t.h.kills[7],5);assert.equal(t.h.destination.id,'atlans3');
  const drop={netId:99,worldIndex:7,transform:{pos:{x:66,z:160}},droppedItem:{item:{group:14,num:11,lvl:8}}};t.c.world.netObjsQuery.entities=[drop];assert.equal(t.h.step(t.s,t.c,28000).kind,'huntLoot');
  assert.equal(t.h.step(t.s,t.c,33000),null);assert.equal(t.h.destination.id,'atlans3');t.c.lootCount=1;t.h.step(t.s,t.c,34000);t.c.world.netObjsQuery.entities=[];
  assert.equal(t.h.step(t.s,t.c,36000).text,'/move lorencia');assert.equal(t.h.boxes,1);assert.equal(t.h.kills[7],5);
});
test('muerte ajena no cuenta y señal inválida no acredita una kill',()=>{
  const {killedPacket,huntVisible}=require('../src/helper/level-helper.user.js');assert.equal(killedPacket(new DataView(new ArrayBuffer(9))),null);assert.equal(huntVisible({netId:2,transform:{pos:{x:1,z:1}}},8),true);
  const t=setup();t.h.step(t.s,t.c,0);arrive(t,1);t.c.world.netObjsQuery.entities=[{netId:2,npcType:82,dying:{killedByHero:false},transform:{pos:{x:98,z:145}}}];t.h.step(t.s,t.c,100);assert.equal(t.h.kills[8],undefined);
});
