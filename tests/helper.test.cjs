const {test}=require('node:test');const assert=require('node:assert/strict');
const {Cycle,route,NativeHelper}=require('../src/helper/level-helper.user.js');
const state=(patch={})=>({ready:true,name:'Hero',level:1,map:0,position:{x:47,y:59},dead:false,loading:false,...patch});
test('ruta respeta niveles 50/170, preferencia Arena y alternativa',()=>{
 assert.equal(route(49).map,0);assert.equal(route(50).map,6);assert.equal(route(169).map,6);assert.equal(route(170).map,10);
 assert.deepEqual([route(100).x,route(100).y],[12,39]);assert.deepEqual([route(100,{arenaAlternative:true}).x,route(100,{arenaAlternative:true}).y],[31,74]);assert.equal(route(200,{icarus:false}).map,6);
});
test('move sólo una vez; espera mapa y no spamea si el servidor no responde',()=>{
 const c=new Cycle();c.start(state({level:50}),0);
 assert.equal(c.step(state({level:50}),0).text,'/move arena');assert.equal(c.step(state({level:50}),4000),null);
 assert.equal(c.step(state({level:50,map:6,position:{x:30,y:40}}),10000).kind,'walk');
 const no=new Cycle();no.start(state({level:50}),0);no.step(state({level:50}),0);assert.equal(no.step(state({level:50}),6000).text,'/move stadium');assert.equal(no.step(state({level:50}),12000).kind,'stop');
});
test('reset 400 una vez y espera descenso de nivel',()=>{
 const c=new Cycle();c.start(state({level:400,map:10}),0);
 assert.equal(c.step(state({level:400,map:10}),0).text,'/reset');assert.equal(c.step(state({level:400,map:10}),5000),null);
 const next=c.step(state({level:1,map:0,position:{x:125,y:125}}),10000);assert.equal(next.kind,'walk');assert.equal(next.spot.map,0);assert.equal(c.resets,1);
});
test('reset rechazado pausa y no repite comando',()=>{
 const c=new Cycle();c.start(state({level:400}),0);c.step(state({level:400}),0);for(let t=5000;t<30000;t+=5000)assert.equal(c.step(state({level:400}),t),null);assert.equal(c.step(state({level:400}),30000).kind,'stop');assert.equal(c.step(state({level:400}),32000),null);
});
test('muerte en Icarus vuelve desde respawn al último spot',()=>{
 const c=new Cycle(),s=state({level:200,map:10,position:{x:43,y:155}});c.start(s,0);assert.equal(c.step(s,0).kind,'helper');
 assert.equal(c.step({...s,dead:true},1000).kind,'clear');assert.equal(c.step({...s,map:0,position:{x:120,y:120}},5000).text,'/move icarus');
 assert.equal(c.step({...s,position:{x:10,y:10}},7000).kind,'walk');
});
test('caza dentro de radio sin caminar al centro en cada ataque',()=>{
 const c=new Cycle(),s=state();c.start(s,0);assert.equal(c.step(s,0).kind,'helper');assert.equal(c.step({...s,position:{x:52,y:59}},2000).kind,'helper');
 assert.equal(c.step({...s,position:{x:70,y:59}},5000).kind,'walk');
});
test('desconexión y otro personaje detienen; no reanuda solo',()=>{
 for(const patch of [{ready:false},{name:'Other'}]){const c=new Cycle();c.start(state(),0);assert.equal(c.step(state(patch),1000).kind,'stop');assert.equal(c.step(state(),2000),null);}
});
test('falta de progreso pausa, mientras carga no actúa',()=>{
 const c=new Cycle(),s=state({position:{x:130,y:130}});c.start(s,0);assert.equal(c.step({...s,loading:true},10000),null);assert.equal(c.step(s,11000).kind,'walk');assert.equal(c.step(s,57000).kind,'stop');
});
test('cambio de mapa sin entidad durante carga no detiene el ciclo',()=>{
 const c=new Cycle();c.start(state({level:170}),0);c.step(state({level:170}),0);
 assert.equal(c.step({ready:false,connected:true,loading:true,position:null},1000),null);assert.equal(c.running,true);
 assert.equal(c.step(state({level:170,map:10,position:{x:10,y:10}}),3000).kind,'walk');
});

test('Home espera confirmacion, evita dobles toggles y detiene antes de viajar',()=>{
 const n=new NativeHelper(),s={muHelper:{active:false},calls:0,toggleMuHelper(){this.calls++;}};
 assert.equal(n.sync(s,true,0),'waiting');assert.equal(n.sync(s,true,500),'waiting');assert.equal(s.calls,1);
 s.muHelper.active=true;assert.equal(n.sync(s,true,1000),'ready');assert.equal(n.sync(s,false,1500),'waiting');assert.equal(s.calls,2);
 assert.equal(n.sync(s,false,2000),'waiting');s.muHelper.active=false;assert.equal(n.sync(s,false,2500),'ready');
});
test('Home rechazado pausa sin repetir y falta de API es explicita',()=>{
 const n=new NativeHelper(),s={muHelper:{active:false},toggleMuHelper(){}};
 n.sync(s,true,0);assert.equal(n.sync(s,true,10001),'timeout');assert.equal(new NativeHelper().sync({},true,0),'unavailable');
});
test('Home permite un nuevo intento después del timeout, en ambas direcciones',()=>{
 for(const active of [true,false]){
  const n=new NativeHelper(),s={muHelper:{active:!active},calls:0,toggleMuHelper(){this.calls++;}};
  assert.equal(n.sync(s,active,0),'waiting');
  assert.equal(n.sync(s,active,10001),'timeout');assert.equal(n.pending,null);
  assert.equal(n.sync(s,active,15000),'waiting');assert.equal(s.calls,2);
  s.muHelper.active=active;assert.equal(n.sync(s,active,15500),'ready');
 }
});
test('Home informa zona segura sin enviar inicio y permite salir o detener',()=>{
 const n=new NativeHelper(),s={muHelper:{active:false},calls:0,toggleMuHelper(){this.calls++;}};
 let safe=true;const world={playerEntity:{attributeSystem:{isAboveZero(key){assert.equal(key,'inSafeZone');return safe;}}}};
 assert.equal(n.sync(s,true,0,world),'safe-zone');assert.equal(s.calls,0);assert.equal(n.pending,null);
 safe=false;assert.equal(n.sync(s,true,500,world),'waiting');assert.equal(s.calls,1);
 s.muHelper.active=true;assert.equal(n.sync(s,true,1000,world),'ready');
 safe=true;assert.equal(n.sync(s,false,1500,world),'waiting');assert.equal(s.calls,2);
});

test('reset con desconexion selecciona el mismo personaje una vez y retoma tras entrar',()=>{
 const c=new Cycle();c.start(state({level:400}),0);c.step(state({level:400}),0);
 assert.equal(c.step({ready:false,connected:false,uiState:2},2000),null);assert.equal(c.running,true);
 const menu={ready:false,connected:true,uiState:3,characters:['Other','Hero']};
 assert.deepEqual(c.step(menu,5000),{kind:'select',name:'Hero'});assert.equal(c.step(menu,6000),null);
 assert.equal(c.step({...menu,uiState:4,loading:true},7000),null);
 assert.equal(c.step(state({level:1,position:{x:125,y:125}}),8000).kind,'walk');assert.equal(c.resets,1);
});
test('reingreso espera lista cargada, cancela si falta personaje y expira sin spamear',()=>{
 for(const mode of ['missing','timeout']){const c=new Cycle();c.start(state({level:400}),0);c.step(state({level:400}),0);
 assert.equal(c.step({ready:false,connected:true,uiState:3,loadingCharacters:true,characters:[]},2000),null);
 const s=mode==='missing'?{ready:false,connected:true,uiState:3,characters:['Other']}:{ready:false,connected:false};
 if(mode==='timeout')for(let t=7000;t<90000;t+=5000)assert.equal(c.step(s,t),null);
 assert.equal(c.step(s,mode==='missing'?3000:92000).kind,'stop');assert.equal(c.step(s,93000),null);
 }
});
test('detener durante reingreso cancela seleccion y no retoma automaticamente',()=>{
 const c=new Cycle();c.start(state({level:400}),0);c.step(state({level:400}),0);c.stop();
 assert.equal(c.step({ready:false,connected:true,uiState:3,characters:['Hero']},5000),null);
});

test('fallback stadium una vez, confirma Arena y no envia si arena funciono',()=>{
 const c=new Cycle();c.start(state({level:50}),0);c.step(state({level:50}),0);
 assert.equal(c.step(state({level:50}),5000),null);assert.equal(c.step(state({level:50}),21000).text,'/move stadium');assert.equal(c.step(state({level:50}),9000),null);
 assert.equal(c.step(state({level:50,map:6,position:{x:30,y:40}}),10000).kind,'walk');assert.equal(c.running,true);
 const ok=new Cycle();ok.start(state({level:50}),0);ok.step(state({level:50}),0);assert.equal(ok.step(state({level:50,map:6,position:{x:12,y:39}}),21000).kind,'helper');
 const other=new Cycle();other.start(state({level:170}),0);other.step(state({level:170}),0);assert.equal(other.step(state({level:170}),21000).kind,'stop');
});
