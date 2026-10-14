const {test}=require('node:test'),assert=require('node:assert/strict');
const {Cycle,currentPathStep,warpDestination}=require('../src/helper/level-helper.user.js');
const packet=(map,legacy=false)=>{const p=new DataView(new ArrayBuffer(legacy?8:15));p.setUint8(0,0xc3);p.setUint8(2,0x1c);p.setUint8(3,legacy?1:0x0f);if(legacy)p.setUint8(4,map);else{p.setUint8(4,1);p.setUint16(5,map,true);}return p;};
test('Arena follows fresh server destination and walks before enabling Home',()=>{
 for(const [id,level,destination] of [['arena2',100,83],['arena3',200,84],['arena4',300,85]])for(const from of [0,6]){
  const c=new Cycle({path:[{map:id,level,x:20,y:30}]}),s={ready:true,name:'Hero',level,map:from,warpSerial:7,position:{x:100,y:100}};c.start(s,0);assert.equal(c.step(s,0).text,'/move '+id);
  assert.equal(c.step({...s,warpArrival:{serial:7,map:destination}},1000),null);
  assert.equal(c.step({...s,warpSerial:8,warpArrival:{serial:8,map:destination}},1500),null);
  const arrived={...s,map:destination,warpSerial:8,warpArrival:{serial:8,map:destination}};
  assert.equal(c.step(arrived,2000).kind,'walk');assert.equal(c.stage.map,destination);
  assert.equal(c.step({...arrived,position:{x:20,y:30}},5000).kind,'helper');
  assert.equal(c.step({...arrived,position:{x:20,y:30}},6000).kind,'helper');
 }
});
test('arrival parser validates modern/legacy maps and ignores internal-teleport map bytes',()=>{
 for(const legacy of [false,true]){const p=packet(42,legacy);assert.equal(warpDestination(p),42);p.setUint8(legacy?3:4,0);assert.equal(warpDestination(p),null);}
 assert.equal(warpDestination(packet(300)),300);assert.equal(warpDestination(new DataView(new ArrayBuffer(15))),null);assert.equal(warpDestination(null),null);
});
test('new step captures current casilla and level without changing prior levels',()=>{
 const path=[{map:'icarus',level:190,x:43,y:155}],s={ready:true,map:6,level:123,position:{x:31.9,y:74.2}};
 assert.deepEqual(currentPathStep(s,path),{map:'arena',level:123,x:31,y:74});assert.equal(path[0].level,190);
 assert.deepEqual(currentPathStep({...s,map:7,level:401},path),{map:'atlans',level:401,x:31,y:74});
 assert.equal(currentPathStep({...s,ready:false},path).map,'lorencia');assert.ok(Number.isNaN(currentPathStep({...s,map:999},path).x));
 for(const [map,id] of [[83,'arena2'],[84,'arena3'],[85,'arena4']])assert.deepEqual(currentPathStep({...s,map,level:321},path),{map:id,level:321,x:31,y:74});
});
test('starting on the correct Arena world walks directly; other worlds do not confirm arrival',()=>{
 for(const [map,id,level] of [[83,'arena2',100],[84,'arena3',200],[85,'arena4',300]]){
  const s={ready:true,name:'Hero',level,map,warpSerial:0,position:{x:100,y:100}},c=new Cycle({path:[{map:id,level,x:20,y:30}]});c.start(s,0);assert.equal(c.step(s,0).kind,'walk');
  const other=new Cycle({path:[{map:id,level,x:20,y:30}]});other.start({...s,map:0},0);other.step({...s,map:0},0);assert.equal(other.step({...s,map:42,warpSerial:1,warpArrival:{serial:1,map:42}},1000),null);assert.equal(other.step({...s,map:42},21000).kind,'stop');
 }
});
