const {test}=require('node:test'),assert=require('node:assert/strict'),{AutoParty}=require('../src/helper/level-helper.user.js');
const player=(patch={})=>({netId:2,objectNameInWorld:'Near',playerAnimation:{},transform:{pos:{x:48,z:59}},...patch});
function setup(entities=[player()]){const sent=[],party=new AutoParty(),world={playerEntity:{netId:1,transform:{pos:{x:47,z:59}}},netObjsQuery:{entities}},social={partyMembers:[],partyInvite:t=>sent.push(t)},s={ready:true,name:'Hero',map:6};return{sent,party,world,social,s};}
test('siempre activa, limita frecuencia y reintenta por nombre tras un minuto',()=>{const t=setup();const run=n=>t.party.step(t.world,t.social,t.s,n);run(0);run(1000);run(10000);assert.equal(t.sent.length,1);run(60000);assert.equal(t.sent.length,2);});
test('party excluye monstruos, muertos, lejos, propio personaje y miembros',()=>{for(const patch of [{npcType:2},{dying:true},{objOutOfScope:true},{worldIndex:0},{localPlayer:true},{netId:1},{objectNameInWorld:'Hero'},{transform:{pos:{x:51,z:59}}},{playerAnimation:null}]){const t=setup([player(patch)]);t.party.enabled=true;t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,0);}const t=setup();t.party.enabled=true;t.social.partyMembers=[{name:'Hero'},{name:'Near'}];t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,0);});
test('party completa, no lider, invitacion pendiente y desconexion no envian',()=>{for(const kind of ['full','member','pending','offline']){const t=setup();t.party.enabled=true;if(kind==='full')t.social.partyMembers=Array.from({length:5},()=>({name:'Hero'}));if(kind==='member')t.social.partyMembers=[{name:'Leader'}];if(kind==='pending')t.social.partyRequest={};if(kind==='offline')t.s.ready=false;t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,0);}});

test('solo invita en Arena e Icarus; Lorencia y otros mapas no envian',()=>{for(const map of [0,1,2,3,6,10,11]){const t=setup();t.party.enabled=true;t.s.map=map;t.party.step(t.world,t.social,t.s,0);assert.equal(t.sent.length,[6,10].includes(map)?1:0);}});

test('sigue invitando tras aceptaciones hasta cinco y repone vacantes',()=>{
 const entities=Array.from({length:5},(_,i)=>player({netId:i+2,objectNameInWorld:'Player'+i})),t=setup(entities);
 t.social.partyMembers=[{name:'Hero'}];
 for(let i=0;i<4;i++){t.party.step(t.world,t.social,t.s,i*10000);assert.equal(t.sent.length,i+1);t.social.partyMembers.push({name:t.sent[i].name});}
 t.party.step(t.world,t.social,t.s,40000);assert.equal(t.sent.length,4);
 const left=t.social.partyMembers.pop();t.party.step(t.world,t.social,t.s,41000);assert.equal(t.sent.length,5);assert.equal(t.sent[4].name,left.name);
 t.social.partyMembers.push(left);t.party.step(t.world,t.social,t.s,52000);assert.equal(t.sent.length,5);
});
test('acepta invitaciones automaticamente una vez por solicitud incluso fuera de Arena',()=>{
 const t=setup();let accepted=0;t.s.map=0;t.social.partyRequest={requesterId:99};t.social.partyRespond=value=>{assert.equal(value,true);accepted++;};
 t.party.step(t.world,t.social,t.s,0);t.party.step(t.world,t.social,t.s,500);assert.equal(accepted,1);assert.equal(t.sent.length,0);
 t.social.partyRequest={requesterId:100};t.party.step(t.world,t.social,t.s,1000);assert.equal(accepted,2);
 t.social.partyMembers=Array.from({length:5},()=>({name:'Hero'}));t.social.partyRequest={requesterId:101};t.party.step(t.world,t.social,t.s,1500);assert.equal(accepted,2);
});

test('expulsa lejos tras 30 s con datos frescos y busca reemplazo al quedar hueco',()=>{const t=setup();const kicked=[];t.s.position={x:47,y:59};t.social.partyKick=i=>kicked.push(i);t.social.partyMembers=[{name:'Hero',index:0},{name:'Far',index:3,mapId:6,x:100,y:100}];t.party.step(t.world,t.social,t.s,0);t.party.step(t.world,t.social,t.s,29000);assert.equal(kicked.length,0);t.social.partyMembers=t.social.partyMembers.map(m=>({...m}));t.party.step(t.world,t.social,t.s,30000);assert.deepEqual(kicked,[3]);t.party.step(t.world,t.social,t.s,31000);assert.equal(kicked.length,1);t.social.partyMembers=[{name:'Hero',index:0}];t.party.step(t.world,t.social,t.s,40000);assert.ok(t.sent.length>0);});
test('no expulsa con datos viejos ni si vuelve cerca; otro mapa cuenta como lejos',()=>{const t=setup();t.s.position={x:47,y:59};const kicked=[];t.social.partyKick=i=>kicked.push(i);t.social.partyMembers=[{name:'Hero'},{name:'Away',index:2,mapId:10,x:47,y:59}];t.party.step(t.world,t.social,t.s,0);t.party.step(t.world,t.social,t.s,30000);assert.equal(kicked.length,0);t.social.partyMembers=[{name:'Hero'},{name:'Away',index:2,mapId:6,x:48,y:59}];t.party.step(t.world,t.social,t.s,31000);assert.equal(kicked.length,0);});
