const {test}=require('node:test'),assert=require('node:assert/strict');
const {BalrogEvent,BalrogTrip,balrogNotice,validPreferences,DEFAULTS}=require('../src/helper/level-helper.user.js');
const appeared=(map='Noria',x=100,y=120)=>balrogNotice(0,`The Balrog Colosal has appeared in ${map} at ${x}, ${y}! It takes a group to bring it down.`);
const state=()=>({ready:true,loading:false,dead:false,account:'a',server:'s',name:'Hero',charClass:4,level:200,map:0,position:{x:47,y:59},warpSerial:0});
test('Balrog: only audited server notices and exact known destinations, never chat or generic Balrog',()=>{
 assert.equal(balrogNotice(1,'The Balrog Colosal has appeared in Noria at 100, 120! It takes a group to bring it down.'),null);
 assert.equal(balrogNotice(0,'The Balrog has appeared in Noria at 100, 120! It takes a group to bring it down.'),null);
 assert.equal(balrogNotice(2,'The Big Boss is already out, in Noria at 100, 120: 100% health left.'),null);
 assert.equal(appeared().destination.map,3);assert.equal(appeared('Arena 3').destination.map,84);
 assert.equal(appeared('Davias').destination.id,'devias');assert.deepEqual(appeared('Unknown'),{invalid:true});assert.deepEqual(appeared('Noria',256),{invalid:true});
 assert.equal(balrogNotice(0,'The Balrog Colosal has appeared in Noria at 1.5, 120! It takes a group to bring it down.'),null);
 assert.deepEqual(balrogNotice(0,'The Balrog Colosal has left Noria undefeated.'),{ended:true});
 assert.deepEqual(balrogNotice(0,'Hero has defeated the Big Boss Balrog Colosal!'),{ended:true});
 assert.equal(balrogNotice(0,'Hero has defeated the Golden Balrog!'),null);
});
test('Balrog: reminders preserve expiry, changes invalidate journey, end and identity block stale native recovery',()=>{
 const e=new BalrogEvent();e.observe(appeared(),100);const original=e.get(100);e.observe(appeared(),50000);assert.equal(e.get(50000).id,original.id);assert.equal(e.get(50000).expires,1800100);
 assert.equal(e.get(1800100),null);e.observe(appeared(),1800200);assert.notEqual(e.get(1800200).id,original.id);
 e.observe(appeared('Noria',110),1800300);assert.equal(e.get(1800300).x,110);
 e.observe({ended:true},1800400);e.recover({running:true,map:'Noria',spot:{x:110,y:120},seconds:100},1800500);assert.equal(e.get(1800500),null);
 e.nativeBlocked=false;e.recover({running:true,map:null,spot:null,seconds:30},1800600);assert.equal(e.get(1800600),null);
 e.recover({running:true,map:'Noria',spot:{x:110,y:120},seconds:100},1800600);assert.equal(e.get(1800600).expires,1900600);
 e.reset();e.recover({running:true,map:'Noria',spot:{x:110,y:120},seconds:100},1800700);assert.equal(e.get(1800700),null);
});
test('Balrog: actual warp/map and position confirmation precede Home, no custom attack/loot',()=>{
 const e=new BalrogEvent(),s=state(),t=new BalrogTrip(),world={terrain:{},isWalkable:()=>true,pathfinder:{search:(_,p)=>[p]}};
 e.observe(appeared(),0);assert.equal(t.start(s,e.get(0),0),true);
 assert.equal(t.step(s,e.get(0),0,world).kind,'command');assert.equal(t.step({...s,map:3},e.get(1),1,world),null);
 const arrived={...s,map:3,entityMap:3,warpSerial:1,warpArrival:{map:3}};
 assert.equal(t.step(arrived,e.get(2),2,world).kind,'walk');
 assert.equal(t.step({...arrived,position:{x:100.5,y:120.5}},e.get(3),3,world).kind,'helper');assert.equal(t.phase,'home');
 assert.equal(t.step({...arrived,position:{x:105,y:125}},e.get(100),100,world).kind,'helper');
 assert.equal(t.active,true);assert.equal(t.step(arrived,null,101,world).kind,'stop');assert.equal(t.active,false);
});
test('Balrog: pending warp, lack of progress, invalid identity, obstacles and low access are bounded',()=>{
 const e=new BalrogEvent();e.observe(appeared(),0);const event=e.get(0),world={terrain:{},isWalkable:()=>true};
 let s=state(),t=new BalrogTrip();assert.equal(t.start({...s,level:1},event,0),false);
 t.start(s,event,0);t.step(s,event,0,world);assert.equal(t.step(s,event,30001,world).kind,'stop');
 t=new BalrogTrip();s={...s,map:3};t.start(s,event,0);t.step(s,event,0,world);assert.equal(t.step(s,event,20001,world).kind,'stop');
 for(const change of [{dead:true},{ready:false},{name:'Other'},{account:'other'},{server:'other'}]){t=new BalrogTrip();t.start(s,event,0);assert.equal(t.step({...s,...change},event,1,world).kind,'stop');}
 t=new BalrogTrip();t.start(s,event,0);assert.equal(t.step(s,event,1,{...world,isWalkable:()=>false}).kind,'stop');
 t=new BalrogTrip();t.start(s,event,0);assert.equal(t.step(s,event,1,{...world,pathfinder:{search:()=>[]}}).kind,'stop');
 const preferences={version:1,spots:DEFAULTS.spots,sendParty:true,acceptParty:true};assert.equal(validPreferences(preferences,'stored'),true);assert.equal(validPreferences({...preferences,balrogEnabled:true},'stored'),true);assert.equal(validPreferences({...preferences,balrogEnabled:'true'},'stored'),false);
});
