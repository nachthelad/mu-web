const {test}=require('node:test'),assert=require('node:assert/strict');
const {minimumLevel,LEVEL_MAPS,validPath,levelPath,route,goldPreferences,validGoldPreferences,Cycle}=require('../src/helper/level-helper.user.js');
test('MG and DL warp window exact minima, evolutions and other class separation',()=>{
 const expected=[33,6,6,13,13,13,13,19,26,33,66,132,198,33,33,33,39,39,46,46,46,52,59,92,92,112,92,112,99,99,125,138];
 assert.deepEqual(LEVEL_MAPS.map(m=>minimumLevel(m.id,12)),expected);assert.deepEqual(LEVEL_MAPS.map(m=>minimumLevel(m.id,13)),expected);
 for(const cls of [16,17])assert.deepEqual(LEVEL_MAPS.map(m=>minimumLevel(m.id,cls)),expected);
 for(const cls of [0,4,8,undefined])assert.deepEqual(LEVEL_MAPS.map(m=>minimumLevel(m.id,cls)),LEVEL_MAPS.map(m=>m.minLevel));
});
test('user MG route accepted, strict minimums and increasing order, safe other-class start',()=>{
 const path=[['lorencia',10],['arena',52],['arena2',100],['arena3',133],['arena4',200]].map(([map,level])=>({map,level,x:67,y:74}));
 assert.equal(validPath(path,12),true);assert.equal(validPath(path,4),false);assert.equal(validPath(path,'stored'),true);
 assert.equal(validPath([{map:'arena3',level:131,x:1,y:1}],12),false);assert.equal(validPath([path[0],{...path[1],level:10}],12),false);
 assert.equal(route(133,{path},12).id,'arena3');assert.equal(route(200,{path},12).minLevel,198);
 const cycle=new Cycle({path});assert.equal(cycle.start({ready:true,name:'Hero',position:{x:1,y:1},level:200,charClass:4},0),false);assert.equal(cycle.running,false);
 assert.deepEqual(levelPath({},12).map(p=>p.level),[6,33,112]);assert.equal(route(33,{icarus:true},12).id,'arena');assert.equal(route(112,{icarus:true},12).id,'icarus');
});
test('Golden destinations use class defaults and validate class minimums',()=>{
 const mg={gold:goldPreferences({},12)};assert.equal(validGoldPreferences(mg,12),true);assert.equal(validGoldPreferences(mg,4),false);assert.equal(mg.gold.route.find(p=>p.map==='tarkan2').level,92);
 mg.gold.route.find(p=>p.map==='tarkan2').level=91;assert.equal(validGoldPreferences(mg,12),false);
});
