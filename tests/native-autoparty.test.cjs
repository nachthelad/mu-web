const {test}=require('node:test'),assert=require('node:assert/strict');
const {NativeAutoParty}=require('../src/helper/level-helper.user.js');
const state={connected:true,uiState:5,ready:true,name:'Hero'};
test('native party applies on/off once, preserves warps and resyncs sessions',()=>{
 const party=new NativeAutoParty(),sent=[],social={sendChat:text=>{sent.push(text);return true;}},socket={};
 const run=(s,n,on=true,session=socket)=>party.sync(social,s,session,n,on);
 run(state,0);run(state,500);run({...state,loading:true},1000);run(state,3500);assert.deepEqual(sent,['/autoparty on']);
 run(state,4000,false);run(state,4500,false);assert.deepEqual(sent,['/autoparty on','/autoparty off']);
 run({...state,connected:false},5000,false);run(state,5500,false);assert.equal(sent.at(-1),'/autoparty off');assert.equal(sent.length,3);
 run({...state,name:'Other'},6000);run(state,6500,true,{});assert.equal(sent.length,5);
});
test('unavailable, loading or dead do not send; rejected sends retry with a delay',()=>{
 const party=new NativeAutoParty(),sent=[],socket={},social={sendChat:text=>{sent.push(text);return sent.length>1;}};
 for(const patch of [{ready:false},{loading:true},{dead:true}])party.sync(social,{...state,...patch},socket,0,true);
 assert.equal(sent.length,0);party.sync(social,state,socket,0,true);assert.match(party.message,/reintentando/);
 party.sync(social,state,socket,500,true);assert.equal(sent.length,1);party.sync(social,state,socket,3000,true);assert.equal(sent.length,2);assert.equal(party.message,'');
 party.sync(social,state,socket,6000,true);assert.equal(sent.length,2);
});
