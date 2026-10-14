const {test}=require('node:test'),assert=require('node:assert/strict');
const {accountIdentity,AccountSettings}=require('../src/helper/level-helper.user.js');
const authenticated=(username='A')=>({username,accountFor:'world/a1',uiState:5,gsSocket:{readyState:1}});
test('identity uses accepted account and world, never character or local account choice',()=>{
 const a=authenticated();assert.equal(accountIdentity(a),JSON.stringify(['world','A']));
 assert.equal(accountIdentity({...a,accountFor:'world/a2',playerData:{name:'Other'}}),accountIdentity(a));
 for(const uiState of [0,1,2])assert.equal(accountIdentity({...a,uiState}),null);
 for(const uiState of [3,4,5])assert.equal(accountIdentity({...a,uiState}),accountIdentity(a));
 for(const patch of [{isOffline:true},{connectionLost:true},{username:''},{accountFor:''},{gsSocket:{readyState:3}}])assert.equal(accountIdentity({...a,...patch}),null);
 assert.notEqual(accountIdentity({...a,accountFor:'other/a1'}),accountIdentity(a));
});
test('independent accounts, immutable legacy, conflicts and conditional rollback',()=>{
 const map=new Map([['base','legacy']]),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)},profiles=new AccountSettings(storage,'base');
 const a=accountIdentity(authenticated()),b=accountIdentity(authenticated('B'));
 profiles.write(a,null,'one',a);profiles.write(b,null,'two',b);assert.equal(profiles.read(a),'one');assert.equal(profiles.read(b),'two');assert.equal(map.get('base'),'legacy');
 assert.throws(()=>profiles.write(a,'one','bad',b),/Cambió la cuenta/);
 assert.throws(()=>profiles.write(a,null,'bad',a),/otra ventana/);
 profiles.write(a,'one','next',a);assert.throws(()=>profiles.rollback(a,'one',null),/otra ventana/);profiles.rollback(a,'next','one');assert.equal(profiles.read(a),'one');
 assert.throws(()=>profiles.key(null),/desconocida/);
});
