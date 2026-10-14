const {test}=require('node:test'),assert=require('node:assert/strict');
const {Cycle}=require('../src/helper/level-helper.user.js');
const hero={ready:true,name:'Hero',level:400,map:10,position:{x:43,y:155},account:'world/A',server:'server'};
const menu={...hero,ready:false,uiState:3,connected:true,loadingCharacters:false,characters:['Other','Hero']};
function reset(){const c=new Cycle();assert.equal(c.start(hero,0),true);assert.equal(c.step(hero,0).text,'/reset');return c;}
test('delayed scheduler recovers exact target at 91s and after many minutes, independent of slot',()=>{
 for(const delay of [91000,600000])for(const characters of [['Hero'],['Hero','Other'],['Other','Hero']]){
  const c=reset();assert.deepEqual(c.step({...menu,characters},delay),{kind:'select',name:'Hero'});
  assert.equal(c.resets,0);assert.equal(c.step({...menu,uiState:4,loading:true},delay+1000),null);
  assert.equal(c.step({...hero,level:1,map:0},delay+600000).kind,'walk');assert.equal(c.resets,1);
  assert.equal(c.pending?.kind==='reset',false);
 }
});
test('three spaced requests then stop without repeating reset; loading never retries',()=>{
 const c=reset();assert.equal(c.step(menu,91000).kind,'select');
 for(let t=91500;t<101000;t+=500)assert.equal(c.step(menu,t),null);
 assert.equal(c.step(menu,101000).kind,'select');
 for(let t=101500;t<111000;t+=500)assert.equal(c.step(menu,t),null);
 assert.equal(c.step(menu,111000).kind,'select');
 for(let t=111500;t<121000;t+=500)assert.equal(c.step(menu,t),null);
 assert.equal(c.step(menu,121000).kind,'stop');assert.match(c.message,/3 intentos/);
 assert.equal(c.step(menu,999999),null);
 const loading=reset();loading.step(menu,1000);
 for(let t=1500;t<90000;t+=500)assert.equal(loading.step({...menu,uiState:4,loading:true},t),null);
 assert.equal(loading.step({...menu,uiState:4,loading:true},90000).kind,'stop');
});
test('list delay and unavailable connection wait only a finite observed budget',()=>{
 const c=reset();for(let t=5000;t<90000;t+=5000)assert.equal(c.step({...menu,loadingCharacters:true,characters:[]},t),null);
 assert.equal(c.step({...menu,loadingCharacters:true},90000).kind,'stop');
 const d=reset();assert.equal(d.step({...menu,connected:false},600000),null);
 assert.deepEqual(d.step(menu,600500),{kind:'select',name:'Hero'});
 const missing=reset();assert.equal(missing.step({...menu,characters:['Other']},91000).kind,'stop');
});
test('manual stop, session change and restart invalidate earlier selection attempts',()=>{
 for(const patch of [{account:null},{account:'world/B'},{server:'other'}]){
  const c=reset();assert.equal(c.step({...menu,...patch},91000).kind,'stop');assert.equal(c.step(menu,92000),null);
 }
 const c=reset();c.step(menu,1000);c.stop();assert.equal(c.step(menu,600000),null);
 c.start(hero,600000);assert.equal(c.step(hero,600000).text,'/reset');assert.equal(c.step(menu,601000).kind,'select');assert.equal(c.pending.attempts,1);
});
test('command queue delay does not consume sent reset confirmation budget',()=>{
 const c=reset();c.commandSent(100000,0);assert.equal(c.step(hero,100500),null);assert.equal(c.pending.wait,500);
});
