const {test}=require('node:test'),assert=require('node:assert/strict');
const {Cycle,DEFAULTS,validPreferences}=require('../src/helper/level-helper.user.js');
const s={ready:true,name:'Hero',level:400,map:10,position:{x:43,y:155}};
test('reset keeps its historical enabled default and accepts only boolean preferences',()=>{
 const prefs={version:1,...DEFAULTS};assert.equal(prefs.autoReset,true);delete prefs.autoReset;assert.equal(validPreferences(prefs),true);
 for(const value of [false,true])assert.equal(validPreferences({...prefs,autoReset:value}),true);
 for(const value of [0,1,null,'false'])assert.equal(validPreferences({...prefs,autoReset:value}),false);
 const c=new Cycle();c.start(s,0);assert.equal(c.step(s,0).text,'/reset');
});
test('disabled reset continues the last leveling spot at 400 and above, enabling later sends once',()=>{
 const c=new Cycle({autoReset:false});c.start(s,0);for(const [now,level] of [[0,400],[5000,400],[10000,401]]){const action=c.step({...s,level},now);assert.equal(action.kind,'helper');assert.equal(action.spot.id,'icarus');assert.equal(c.pending,null);assert.equal(c.running,true);}
 c.config.autoReset=true;assert.equal(c.step(s,15000).text,'/reset');assert.equal(c.step(s,16000),null);
});
test('a sent reset still waits for confirmation when the preference is disabled',()=>{
 const c=new Cycle();c.start(s,0);c.step(s,0);c.config.autoReset=false;assert.equal(c.step(s,5000),null);assert.equal(c.pending.kind,'reset');assert.equal(c.step({...s,level:1,map:0,position:{x:125,y:125}},10000).kind,'walk');assert.equal(c.resets,1);assert.equal(c.config.autoReset,false);
});
