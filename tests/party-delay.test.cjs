const {test}=require('node:test'),assert=require('node:assert/strict');
const {AutoParty,DEFAULTS,validPreferences}=require('../src/helper/level-helper.user.js');
const player=(id=2,guild=42)=>({netId:id,objectNameInWorld:'P'+id,guild:{id:guild},playerAnimation:{},transform:{pos:{x:48,z:59}}});
function setup(config={sendParty:true,sendPartyOutside:true}){
 const sent=[],party=new AutoParty(),candidate=player(),world={playerEntity:{netId:1,guild:{id:42},transform:{pos:{x:47,z:59}}},netObjsQuery:{entities:[candidate]}},social={partyMembers:[],partyInvite:v=>{sent.push(v);}},s={ready:true,connected:true,account:'a',server:'s',name:'Hero',map:6,position:{x:47,y:59}};
 return{party,candidate,world,social,s,config,sent,run(now){party.step(world,social,s,now,config);}};
}
test('both groups wait 2000 ms and native void counts only as dispatch',()=>{
 for(const guild of [42,7]){const t=setup();t.candidate.guild.id=guild;t.run(0);t.run(1999);assert.equal(t.sent.length,0);t.run(2000);assert.equal(t.sent.length,1);t.run(2001);assert.equal(t.sent.length,1);}
});
test('oldest mature candidate wins; both switches never duplicate; global and name cooldowns remain',()=>{
 const t=setup();t.run(0);const newer=player(3,7);newer.transform.pos.x=47;t.world.netObjsQuery.entities.unshift(newer);t.run(1900);t.run(2000);assert.equal(t.sent[0].name,'P2');t.run(11999);assert.equal(t.sent.length,1);t.run(12000);assert.equal(t.sent[1].name,'P3');t.run(61999);assert.equal(t.sent.length,2);t.run(62000);assert.equal(t.sent[2].name,'P2');
});
test('loss of eligibility cancels presence; return needs a new 2000 ms',()=>{
 const cases=[
  t=>{t.world.netObjsQuery.entities=[];return()=>t.world.netObjsQuery.entities=[t.candidate];},
  t=>{t.candidate.transform.pos.x=52;return()=>t.candidate.transform.pos.x=48;},
  t=>{t.candidate.objOutOfScope=true;return()=>t.candidate.objOutOfScope=false;},
  t=>{t.candidate.dying=true;return()=>t.candidate.dying=false;},
  t=>{t.config.sendParty=false;return()=>t.config.sendParty=true;},
  t=>{t.candidate.guild.id=7;t.config.sendPartyOutside=false;return()=>t.config.sendPartyOutside=true;},
  t=>{t.s.ready=false;return()=>t.s.ready=true;},
  t=>{t.s.connected=false;return()=>t.s.connected=true;},
  t=>{t.s.loading=true;return()=>t.s.loading=false;},
  t=>{t.s.dead=true;return()=>t.s.dead=false;},
  t=>{t.social.partyRequest={};return()=>t.social.partyRequest=null;},
  t=>{t.social.partyMembers=[{name:'Leader'}];return()=>t.social.partyMembers=[];},
  t=>{t.social.partyMembers=Array.from({length:5},()=>({name:'Hero'}));return()=>t.social.partyMembers=[];},
  t=>{t.social.partyMembers=[{name:'Hero'},{name:'P2'}];return()=>t.social.partyMembers=[];}
 ];
 for(const change of cases){const t=setup();t.run(0);const restore=change(t);t.run(1500);restore();t.run(2000);t.run(3999);assert.equal(t.sent.length,0);t.run(4000);assert.equal(t.sent.length,1);}
});
test('pause, map, account, server, character, hero and entity identity reset pending presence',()=>{
 for(const change of [t=>t.party.cancel(),t=>t.s.map=10,t=>t.s.account='b',t=>t.s.server='b',t=>t.s.name='Other',t=>t.world.playerEntity={...t.world.playerEntity},t=>t.world.netObjsQuery.entities=[player()],t=>t.candidate.netId=3,t=>t.candidate.objectNameInWorld='Renamed',t=>t.candidate.guild.id=7,t=>t.world.playerEntity.guild.id=7]){
  const t=setup();t.run(0);change(t);t.run(1500);t.run(3499);assert.equal(t.sent.length,0);t.run(3500);assert.equal(t.sent.length,1);
 }
});
test('unknown guild never becomes an outside candidate; outside off by default',()=>{
 assert.equal(DEFAULTS.sendPartyOutside,false);
 for(const guild of [undefined,null,{}, {id:-1},{id:'7'},{id:NaN}])for(const own of [false,true]){const t=setup();if(own)t.world.playerEntity.guild=guild;else t.candidate.guild=guild;t.run(0);t.run(2000);assert.equal(t.sent.length,0);}
 const t=setup({sendParty:true});t.candidate.guild.id=7;t.run(0);t.run(2000);assert.equal(t.sent.length,0);
});
test('outside only never enables pruning; explicit false or throwing invite does not record success',()=>{
 const t=setup({sendParty:false,sendPartyOutside:true});t.candidate.guild.id=7;t.party.prune=()=>assert.fail('outside must not prune');t.social.partyInvite=()=>false;t.run(0);t.run(2000);assert.equal(t.party.invited.size,0);assert.equal(t.party.lastInvite,-Infinity);
 t.social.partyInvite=()=>{throw Error('rejected');};assert.throws(()=>t.run(2100));assert.equal(t.party.invited.size,0);
 t.social.partyInvite=v=>t.sent.push(v);t.run(2200);assert.equal(t.sent.length,1);
});
test('optional v1 preference accepts old and new booleans only',()=>{
 const old={version:1,spots:DEFAULTS.spots,sendParty:true,acceptParty:true};assert.equal(validPreferences(old),true);
 for(const v of [true,false])assert.equal(validPreferences({...old,sendPartyOutside:v}),true);
 for(const v of [null,1,'false',{}])assert.equal(validPreferences({...old,sendPartyOutside:v}),false);
});
test('canceling one group preserves the other; hero replacement cannot bypass global cooldown',()=>{
 const t=setup();t.world.netObjsQuery.entities.push(player(3,7));t.run(0);t.party.cancel('clan');t.run(1500);t.run(2000);assert.equal(t.sent[0].name,'P3');
 t.world.playerEntity={...t.world.playerEntity};t.run(2500);t.run(4500);assert.equal(t.sent.length,1);t.run(11999);assert.equal(t.sent.length,1);t.run(12000);assert.equal(t.sent[1].name,'P2');
});
