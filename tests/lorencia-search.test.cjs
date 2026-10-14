const {test}=require('node:test'),assert=require('node:assert/strict');
const {Cycle,NativeHelper}=require('../src/helper/level-helper.user.js');
test('Home stays active through idle leveling and nearby native movement',()=>{
 for(const level of [20,200]){
  const s={ready:true,name:'Hero',level,map:0,position:{x:47,y:59}},cycle=new Cycle({arena:false,icarus:false}),native=new NativeHelper();
  const store={muHelper:{active:true},calls:0,toggleMuHelper(){this.calls++;this.muHelper.active=!this.muHelper.active;}};
  cycle.start(s,0);
  for(let now=0;now<=60000;now+=500){
   s.position={x:47+(now%7000<3000?0:3),y:59};
   const action=cycle.step(s,now);
   assert.ok(!action||action.kind==='helper');
   if(action)assert.equal(native.sync(store,true,now),'ready');
  }
  assert.equal(store.calls,0);assert.equal(store.muHelper.active,true);assert.equal(cycle.running,true);
  assert.equal(cycle.step({...s,position:{x:70,y:59}},65000).kind,'walk');
 }
});
