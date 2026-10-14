const {test}=require('node:test'),assert=require('node:assert/strict'),{AutoParty}=require('../src/helper/level-helper.user.js');
const player=(patch={})=>({netId:2,guild:{id:42},objectNameInWorld:'Near',playerAnimation:{},transform:{pos:{x:48,z:59}},...patch});
test('solo invita al clan confirmado, aunque otro jugador esté más cerca',()=>{
 const t=setup([player({guild:{id:7},objectNameInWorld:'Other',transform:{pos:{x:47,z:59}}}),player({netId:3,objectNameInWorld:'Clan'})]);
 t.party.step(t.world,t.social,t.s,0);t.party.step(t.world,t.social,t.s,2000);assert.deepEqual(t.sent,[{netId:3,name:'Clan'}]);
});
test('mapas nuevos conservan filtro de clan y no amplían expulsiones',()=>{
 for(const map of [2,83,84,85]){
  const t=setup([player({guild:{id:7}})]);t.s.map=map;
  t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,0);
  t.world.netObjsQuery.entities[0].guild={id:42};
  t.party.step(t.world,t.social,t.s,10000);t.party.step(t.world,t.social,t.s,12000);assert.equal(t.sent.length,1);
  const kicked=[];t.s.position={x:47,y:59};t.social.partyKick=i=>kicked.push(i);
  t.social.partyMembers=[{name:'Hero',index:0},{name:'Away',index:1,mapId:map,x:100,y:100}];
  t.party.step(t.world,t.social,t.s,20000);
  t.social.partyMembers=t.social.partyMembers.map(m=>({...m}));
  t.party.step(t.world,t.social,t.s,60000);assert.deepEqual(kicked,[]);
 }
});
test('sin clan propio o candidato desconocido nunca invita; no convierte IDs',()=>{
 for(const guild of [undefined,null,{}, {id:null},{id:''},{id:'42'},{id:-1},{id:NaN},{id:1.5}]){
  const t=setup();t.world.playerEntity.guild=guild;t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,0);
  const u=setup([player({guild})]);u.party.step(u.world,u.social,u.s,0);assert.equal(u.sent.length,0);
 }
});
test('relee clan propio y cercano al cambiar personaje, clan o mundo',()=>{
 const t=setup();t.party.step(t.world,t.social,t.s,0);t.party.step(t.world,t.social,t.s,2000);assert.equal(t.sent.length,1);
 t.world.playerEntity.guild={id:7};t.party.step(t.world,t.social,t.s,60000);assert.equal(t.sent.length,1);
 t.world.netObjsQuery.entities[0].guild={id:7};t.party.step(t.world,t.social,t.s,70000);t.party.step(t.world,t.social,t.s,72000);assert.equal(t.sent.length,2);
 delete t.world.netObjsQuery.entities[0].guild;t.party.step(t.world,t.social,t.s,140000);assert.equal(t.sent.length,2);
 t.s.name='Next';t.world.playerEntity={netId:8,guild:{id:9},transform:{pos:{x:47,z:59}}};t.party.step(t.world,t.social,t.s,150000);assert.equal(t.sent.length,2);
 t.world.netObjsQuery.entities[0].guild={id:9};t.party.step(t.world,t.social,t.s,160000);t.party.step(t.world,t.social,t.s,162000);assert.equal(t.sent.length,3);
 t.world.playerEntity={netId:8,transform:{pos:{x:47,z:59}}};t.party.step(t.world,t.social,t.s,230000);assert.equal(t.sent.length,3);
});
function setup(entities=[player()]){const sent=[],party=new AutoParty(),world={playerEntity:{netId:1,guild:{id:42},transform:{pos:{x:47,z:59}}},netObjsQuery:{entities}},social={partyMembers:[],partyInvite:t=>sent.push(t)},s={ready:true,name:'Hero',map:6};return{sent,party,world,social,s};}
test('siempre activa, limita frecuencia y reintenta por nombre tras un minuto',()=>{const t=setup();const run=n=>t.party.step(t.world,t.social,t.s,n);run(0);run(1000);run(2000);run(10000);assert.equal(t.sent.length,1);run(61999);assert.equal(t.sent.length,1);run(62000);assert.equal(t.sent.length,2);});
test('party excluye monstruos, muertos, lejos, propio personaje y miembros',()=>{for(const patch of [{npcType:2},{dying:true},{objOutOfScope:true},{worldIndex:0},{localPlayer:true},{netId:1},{objectNameInWorld:'Hero'},{transform:{pos:{x:51,z:59}}},{playerAnimation:null}]){const t=setup([player(patch)]);t.party.enabled=true;t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,0);}const t=setup();t.party.enabled=true;t.social.partyMembers=[{name:'Hero'},{name:'Near'}];t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,0);});
test('party completa, no lider, invitacion pendiente y desconexion no envian',()=>{for(const kind of ['full','member','pending','offline']){const t=setup();t.party.enabled=true;if(kind==='full')t.social.partyMembers=Array.from({length:5},()=>({name:'Hero'}));if(kind==='member')t.social.partyMembers=[{name:'Leader'}];if(kind==='pending')t.social.partyRequest={};if(kind==='offline')t.s.ready=false;t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,0);}});

test('invita en Davias 1–4, Arena 1–4 e Icarus; excluye otros mapas',()=>{for(const map of [0,1,2,3,6,10,11,82,83,84,85,86]){const t=setup();t.party.enabled=true;t.s.map=map;t.party.step(t.world,t.social,t.s,0);t.party.step(t.world,t.social,t.s,2000);assert.equal(t.sent.length,[2,6,10,83,84,85].includes(map)?1:0);}});

test('sigue invitando tras aceptaciones hasta cinco y repone vacantes',()=>{
 const entities=Array.from({length:5},(_,i)=>player({netId:i+2,objectNameInWorld:'Player'+i})),t=setup(entities);
 t.social.partyMembers=[{name:'Hero'}];
 t.party.step(t.world,t.social,t.s,0);for(let i=0;i<4;i++){t.party.step(t.world,t.social,t.s,2000+i*10000);assert.equal(t.sent.length,i+1);t.social.partyMembers.push({name:t.sent[i].name});}
 t.party.step(t.world,t.social,t.s,40000);assert.equal(t.sent.length,4);
 const left=t.social.partyMembers.pop();t.party.step(t.world,t.social,t.s,42000);assert.equal(t.sent.length,4);t.party.step(t.world,t.social,t.s,44000);assert.equal(t.sent.length,5);assert.equal(t.sent[4].name,left.name);
 t.social.partyMembers.push(left);t.party.step(t.world,t.social,t.s,52000);assert.equal(t.sent.length,5);
});
test('no responde invitaciones: la aceptación pertenece al autoparty nativo',()=>{
 const t=setup();t.social.partyRequest={requesterId:99};t.social.partyRespond=()=>assert.fail('respuesta directa');
 t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,0);
});

test('expulsa lejos tras 30 s con datos frescos y busca reemplazo al quedar hueco',()=>{const t=setup();const kicked=[];t.s.position={x:47,y:59};t.social.partyKick=i=>kicked.push(i);t.social.partyMembers=[{name:'Hero',index:0},{name:'Far',index:3,mapId:6,x:100,y:100}];t.party.step(t.world,t.social,t.s,0);t.party.step(t.world,t.social,t.s,29000);assert.equal(kicked.length,0);t.social.partyMembers=t.social.partyMembers.map(m=>({...m}));t.party.step(t.world,t.social,t.s,30000);assert.deepEqual(kicked,[3]);t.party.step(t.world,t.social,t.s,31000);assert.equal(kicked.length,1);t.social.partyMembers=[{name:'Hero',index:0}];t.party.step(t.world,t.social,t.s,40000);assert.ok(t.sent.length>0);});
test('no expulsa con datos viejos ni si vuelve cerca; otro mapa cuenta como lejos',()=>{const t=setup();t.s.position={x:47,y:59};const kicked=[];t.social.partyKick=i=>kicked.push(i);t.social.partyMembers=[{name:'Hero'},{name:'Away',index:2,mapId:10,x:47,y:59}];t.party.step(t.world,t.social,t.s,0);t.party.step(t.world,t.social,t.s,30000);assert.equal(kicked.length,0);t.social.partyMembers=[{name:'Hero'},{name:'Away',index:2,mapId:6,x:48,y:59}];t.party.step(t.world,t.social,t.s,31000);assert.equal(kicked.length,0);});
