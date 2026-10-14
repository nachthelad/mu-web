const {test}=require('node:test'),assert=require('node:assert/strict');
const {capturePathLocation}=require('../src/helper/level-helper.user.js');
const s={ready:true,name:'Hero',map:0,position:{x:47.8,y:59.2}};
test('live coherent Arena location takes precedence over a historical warp packet',()=>{
 assert.deepEqual(capturePathLocation({...s,map:6,entityMap:6,warpArrival:{map:0}}),{map:'arena',x:47,y:59});
 assert.match(capturePathLocation({...s,map:6,entityMap:0,warpArrival:{map:6}}).error,/escenario 6, mapa del personaje 0/);
 assert.match(capturePathLocation({...s,loading:true}).error,/carga de escenario/);
});
test('capture accepts only complete coherent unique locations, including explicit Arena variants',()=>{
 for(const [map,id] of [[0,'lorencia'],[3,'noria'],[6,'arena'],[10,'icarus'],[83,'arena2'],[84,'arena3'],[85,'arena4']])assert.deepEqual(capturePathLocation({...s,map}),{map:id,x:47,y:59});
 for(const patch of [{ready:false},{loading:true},{dead:true},{map:null},{map:99},{map:2},{map:1},{map:4},{map:7},{map:8},{entityMap:3},{warpArrival:{map:3}},...[-1,256,NaN,Infinity,null,undefined].map(x=>({position:{x,y:50}})),{position:null}])assert.ok(capturePathLocation({...s,...patch}).error,JSON.stringify(patch));
});
