const {test}=require('node:test'),assert=require('node:assert/strict');
const {MAPS,KALIMA_BOSSES,kalimaReference,Tracker,TTL}=require('../src/radar/golden-radar.user.js');
const entity=(netId,npcType,x=30,y=80)=>({netId,npcType,transform:{pos:{x,z:y}}});
test('Kalima floors and unconfirmed spawn reference are bounded to K1–K6',()=>{
 for(let floor=1;floor<=6;floor++){assert.equal(MAPS[23+floor],`Kalima ${floor}`);assert.deepEqual([kalimaReference(23+floor).x,kalimaReference(23+floor).y],[26,76]);}
 for(const map of [null,undefined,23,30,36,'24',24.5])assert.equal(kalimaReference(map),null);
});
test('Kalima bosses use actual coordinates without contaminating goldens, clear on death/map/disconnect and expire',()=>{
 const w={mapIndex:29,playerEntity:entity(0),netObjsQuery:{entities:[entity(1,275,32,88),entity(2,338,40,90),entity(3,269)]}};
 const tracker=new Tracker(KALIMA_BOSSES),data=tracker.scan(w,0);
 assert.deepEqual(data.live.map(r=>[r.name,r.x,r.y]),[['Kundun',32,88],['Illusion of Kundun',40,90]]);
 assert.equal(new Tracker().scan(w,0).live.length,0);
 w.netObjsQuery.entities[0].dying=true;assert.deepEqual(tracker.scan(w,1).live.map(r=>r.type),[338]);
 w.netObjsQuery.entities=[];assert.equal(tracker.scan(w,2).recent.length,1);assert.equal(tracker.scan(w,TTL+2).recent.length,0);
 w.netObjsQuery.entities=[entity(4,161)];tracker.scan(w,TTL+3);w.mapIndex=24;w.netObjsQuery.entities=[];assert.equal(tracker.scan(w,TTL+4).recent.length,0);
 w.netObjsQuery.entities=[entity(5,181)];tracker.scan(w,TTL+5);assert.equal(tracker.scan(null,TTL+6).recent.length,0);
});
