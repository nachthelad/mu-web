const {test}=require('node:test'),assert=require('node:assert/strict');
const {Tracker,INVADERS,visibleInvaders,TTL}=require('../src/radar/golden-radar.user.js');
const entity=(netId,npcType)=>({netId,npcType,transform:{pos:{x:100,z:120}}});
test('White Wizard Corps y Red Dragon separados de Golden hunt y entre sí',()=>{
 const world={mapIndex:0,playerEntity:entity(0),netObjsQuery:{entities:[42,44,135,136,137,2].map((type,i)=>entity(i+1,type))}};
 const golden=new Tracker(),extra=new Tracker(INVADERS),data=extra.scan(world,0);
 assert.deepEqual(golden.scan(world,0).live.map(r=>r.type),[44]);
 assert.deepEqual(data.live.map(r=>r.type),[42,135,136,137]);
 assert.deepEqual(visibleInvaders(data,false,false).live,[]);
 assert.deepEqual(visibleInvaders(data,true,false).live.map(r=>r.type),[135,136,137]);
 assert.deepEqual(visibleInvaders(data,false,true).live.map(r=>r.type),[42]);
 world.netObjsQuery.entities[0].dying=true;
 assert.deepEqual(extra.scan(world,1).live.map(r=>r.type),[135,136,137]);
 world.netObjsQuery.entities=[];assert.equal(extra.scan(world,2).recent.length,3);
 assert.equal(extra.scan(world,TTL+2).recent.length,0);
 extra.scan(world,TTL+3);world.mapIndex=2;assert.equal(extra.scan(world,TTL+4).recent.length,0);
});
