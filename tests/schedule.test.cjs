const {test}=require('node:test'),assert=require('node:assert/strict');
const {DailySchedule,scheduleWindow,validSchedule,SCHEDULE_DEFAULTS,validPreferences,DEFAULTS}=require('../src/helper/level-helper.user.js');
const config={version:1,enabled:true,start:'02:00',end:'06:00'},at=s=>Date.parse('2026-10-18T'+s+'-03:00');
test('schedule: disabled default, strict times, compatible optional v1 preferences',()=>{
 assert.equal(SCHEDULE_DEFAULTS.enabled,false);assert.equal(validSchedule(undefined),true);
 for(const c of [{...config,start:'2:00'},{...config,end:'24:00'},{...config,start:'02:60'},{...config,end:'02:00'},{...config,enabled:1},null])assert.equal(validSchedule(c),false);
 assert.equal(validPreferences({version:1,...DEFAULTS,schedule:config},'stored'),true);
 assert.equal(validPreferences({version:1,...DEFAULTS,schedule:{...config,end:'02:00'}},'stored'),false);
});
test('schedule: exact [start,end), explicit IANA zone regardless of process TZ',()=>{
 const previous=process.env.TZ;
 try{for(const zone of ['UTC','Asia/Tokyo','America/Los_Angeles']){process.env.TZ=zone;
 for(const [time,active] of [['01:59:59.999',false],['02:00:00.000',true],['05:59:59.999',true],['06:00:00.000',false]])assert.equal(scheduleWindow(config,at(time)).active,active);
 assert.equal(scheduleWindow(config,at('02:00:00')).start,at('02:00:00'));
 }}finally{if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;}
});
test('schedule: overnight uses the previous calendar start and crosses months/years',()=>{
 const c={...config,start:'22:00',end:'03:00'};
 const w=scheduleWindow(c,Date.parse('2027-01-01T01:00:00-03:00'));
 assert.equal(w.active,true);assert.equal(w.start,Date.parse('2026-12-31T22:00:00-03:00'));assert.equal(w.end,Date.parse('2027-01-01T03:00:00-03:00'));
 assert.equal(scheduleWindow(c,Date.parse('2027-01-01T03:00:00-03:00')).active,false);
});
test('schedule: manual inhibition survives reload, edits and disable/enable, expires next occurrence',()=>{
 let p=new DailySchedule();const w=p.sync(config,at('03:00:00'));p.pause(at('03:00:00'),w.end);
 p=new DailySchedule(JSON.parse(JSON.stringify(p.record)));assert.match(p.blocked(at('04:00:00'),'Hero','tab'),/Pausado manualmente/);
 p.sync({...config,end:'05:00'},at('04:00:00'));assert.equal(p.record.pausedUntil,at('06:00:00'));
 p.sync({...config,enabled:false},at('04:00:00'));p.sync({...config,start:'01:00',end:'07:00'},at('04:00:00'));assert.equal(p.record.pausedUntil,at('07:00:00'));
 p.sync(config,at('03:00:00')+86400000);assert.equal(p.blocked(at('03:00:00')+86400000,'Hero','tab'),'');
});
test('schedule: attempted start and failures block loops, character and tab leases protect ownership',()=>{
 const p=new DailySchedule(),now=at('03:00:00');p.sync(config,now);p.attempt('Hero','first',now,at('06:00:00'));
 assert.match(p.blocked(now,'Hero','first'),/interrumpido/);
 p.claim('Hero','first',now);assert.match(p.blocked(now,'Other','first'),/personaje/);assert.match(p.blocked(now,'Hero','second'),/otra pestaña/);
 assert.equal(p.blocked(now+3001,'Hero','second'),'');
 p.fail('Home no confirmó');assert.equal(p.blocked(now+4000,'Hero','first'),'Home no confirmó');
 p.sync({...config,start:'01:00',end:'07:00'},now+4000);assert.equal(p.blocked(now+4000,'Hero','first'),'Home no confirmó');
 p.sync(config,now+86400000);assert.equal(p.blocked(now+86400000,'Hero','first'),'');
 assert.throws(()=>new DailySchedule({version:1}),/inválido/);
});
