const {test}=require('node:test'),assert=require('node:assert/strict');
const {Cycle,route,AutoParty,validPreferences,DEFAULTS}=require('../src/helper/level-helper.user.js');
const custom={version:1,spots:{lorencia:{x:105,y:81},arena:{x:31,y:74},icarus:{x:60,y:100}},sendParty:true,acceptParty:true};
const snapshot={ready:true,name:'Hero',level:20,map:0,position:{x:47,y:59}};
test('custom spots keep level routing and recalculate an active stage',()=>{
 assert.equal(validPreferences(custom),true);for(const [level,id] of [[49,'lorencia'],[50,'arena'],[170,'icarus']]){const spot=route(level,{...DEFAULTS,...custom});assert.equal(spot.id,id);assert.deepEqual({x:spot.x,y:spot.y},custom.spots[id]);}
 const cycle=new Cycle();cycle.start(snapshot,0);cycle.step(snapshot,0);cycle.config={...cycle.config,...custom};assert.equal(cycle.step(snapshot,3000).spot.x,105);assert.equal(cycle.running,true);
 for(const value of [-1,256,1.5,NaN,'105']){const copy=structuredClone(custom);copy.spots.lorencia.x=value;assert.equal(validPreferences(copy),false);}
 assert.equal(validPreferences({version:1}),false);
});
test('independent map toggles fall back by level and keep reset priority',()=>{
 for(const arena of [false,true])for(const icarus of [false,true]){
  const config={...DEFAULTS,...custom,arena,icarus};
  for(const level of [1,49,50,169,170,399])assert.equal(route(level,config).id,level>=170&&icarus?'icarus':level>=50&&arena?'arena':'lorencia');
 }
 const s={...snapshot,level:200,map:10,position:{x:43,y:155}},cycle=new Cycle();cycle.start(s,0);cycle.step(s,0);cycle.config={...cycle.config,arena:false,icarus:false};assert.equal(cycle.step(s,5000).text,'/move lorencia');assert.equal(cycle.step({...s,level:400},10000).text,'/reset');
 const invalid={...custom,arena:'false'};assert.equal(validPreferences(invalid),false);assert.equal(validPreferences(custom),true);
});
test('sending and accepting party are independent and disabled sending never prunes',()=>{
 for(const sendParty of [false,true])for(const acceptParty of [false,true]){
  const party=new AutoParty(),calls=[],s={...snapshot,map:6},social={partyMembers:[],partyRequest:{},partyRespond:v=>calls.push(['accept',v]),partyInvite:v=>calls.push(['invite',v])},world={playerEntity:{netId:1,guild:{id:42},transform:{pos:{x:47,z:59}}},netObjsQuery:{entities:[{netId:2,guild:{id:42},objectNameInWorld:'Other',playerAnimation:{},transform:{pos:{x:48,z:59}}}]}};
  party.prune=()=>{calls.push(['prune']);return false;};party.step(world,social,s,0,{sendParty,acceptParty});assert.equal(calls.some(c=>c[0]==='accept'),false);assert.equal(calls.some(c=>c[0]==='prune'),sendParty);
  social.partyRequest=null;party.step(world,social,s,11000,{sendParty,acceptParty});party.step(world,social,s,13000,{sendParty,acceptParty});assert.equal(calls.some(c=>c[0]==='invite'),sendParty);
 }
});
