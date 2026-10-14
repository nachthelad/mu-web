const {test}=require('node:test'),assert=require('node:assert/strict');
const {LEVEL_MAPS,DEFAULTS,MapVisit,Cycle,validLeveling,migrateLeveling,minimumLevel}=require('../src/helper/level-helper.user.js');
const snap=(patch={})=>({ready:true,connected:true,name:'Hero',level:20,map:0,position:{x:47,y:59},...patch});
const point=(x,y,enabled=true)=>({x,y,enabled});
function config(){const leveling={version:1,maps:LEVEL_MAPS.map(m=>({map:m.id,enabled:false,level:m.minLevel,spots:[]}))};for(const [map,level,spots]of [['lorencia',10,[point(47,59),point(60,70)]],['arena',50,[point(12,39)]],['icarus',170,[point(43,155)]]])Object.assign(leveling.maps.find(m=>m.map===map),{enabled:true,level,spots});return {...DEFAULTS,leveling};}
test('catalog complete, variants, disabled incomplete maps and class minima validate',()=>{const c=config();assert.ok(validLeveling(c,0));assert.equal(c.leveling.maps.length,26);assert.ok(c.leveling.maps.some(m=>m.map==='icarus'));c.leveling.maps.find(m=>m.map==='arena2').enabled=true;assert.ok(validLeveling(c,0));const visit=new MapVisit();assert.equal(visit.choose(c,snap({level:120})).id,'arena');c.leveling.maps[0].spots.push(point(256,1));assert.equal(validLeveling(c,0),false);});
test('migration is a draft, retains selected alternatives and reports incompatible repeated map levels',()=>{const old={...DEFAULTS,path:[{map:'lorencia',level:10,x:20,y:30},{map:'lorencia',level:20,x:40,y:50},{map:'icarus',level:170,x:43,y:155}],routes:undefined};const raw=JSON.stringify(old),m=migrateLeveling(old,0);assert.equal(JSON.stringify(old),raw);assert.equal(m.leveling.maps.find(m=>m.map==='lorencia').spots.length,1);assert.ok(m.warnings.length);assert.equal(m.leveling.maps.find(m=>m.map==='icarus').enabled,true);const stored={...old,leveling:m.leveling};assert.deepEqual(migrateLeveling(stored,0).leveling,m.leveling);});
test('one spot per visit remains forever with no enemies; next visit chooses another',()=>{const c=config(),v=new MapVisit(),s=snap(),first=v.choose(c,s);for(let i=0;i<1000;i++)assert.deepEqual(v.choose(c,s),first);v.newVisit();assert.notDeepEqual(v.choose(c,s),first);});
test('immediate threshold transition with live enemies and attack targets; high start skips expired maps',()=>{const c=new Cycle(config()),s=snap();assert.ok(c.start(s,0));c.step(s,0,{attackTarget:{},netObjsQuery:{entities:[{}]}});assert.equal(c.stage.id,'lorencia');const action=c.step({...s,level:80},500,{attackTarget:{},castRequest:{},netObjsQuery:{entities:[{}]}});assert.equal(action.text,'/move arena');assert.equal(c.stage.id,'arena');const high=new Cycle(config());high.start(snap({level:200}),0);assert.equal(high.step(snap({level:200}),0).text,'/move icarus');});
test('ties select one map stably and rotate next visit, with no mid-stage oscillation',()=>{const c=config(),n=c.leveling.maps.find(m=>m.map==='noria');Object.assign(n,{enabled:true,level:10,spots:[point(20,30)]});const v=new MapVisit(),first=v.choose(c,snap());for(let i=0;i<20;i++)assert.equal(v.choose(c,snap()).id,first.id);v.newVisit();assert.notEqual(v.choose(c,snap()).id,first.id);});
test('pause/death/Goldens-style stage invalidation preserves choice; reset changes it; failures pause',()=>{const c=new Cycle(config()),s=snap();c.start(s,0);c.step(s,0);const initial={...c.stage};c.stop();c.start(s,1000);c.step(s,1000);assert.deepEqual(c.stage,initial);c.step({...s,dead:true},2000);c.step(s,3000);assert.deepEqual(c.stage,initial);c.stage=null;c.pending=null;c.step(s,4000);assert.deepEqual(c.stage,initial);c.step({...s,level:400},5000);c.step({...s,level:20},6000);assert.notDeepEqual(c.stage,initial);c.step({...s,level:80},11000);c.commandRejected();assert.equal(c.running,false);});
test('no usable map blocks Play; unrelated legacy class minima do not decide new progression',()=>{const c=config();for(const m of c.leveling.maps)m.enabled=false;const cycle=new Cycle(c);assert.equal(cycle.start(snap(),0),false);assert.match(cycle.message,/mapa.*spot/);});
test('shared-world variants require a confirmed warp even if world ID already matches',()=>{const c=config();for(const m of c.leveling.maps)m.enabled=false;Object.assign(c.leveling.maps.find(m=>m.map==='atlans3'),{enabled:true,spots:[point(30,40)]});const cycle=new Cycle(c),s=snap({level:100,map:7,warpSerial:0});cycle.start(s,0);assert.equal(cycle.step(s,0).text,'/move atlans3');assert.equal(cycle.pending.sameMap,true);assert.equal(cycle.step(s,100),null);cycle.step({...s,warpSerial:1},500);assert.equal(cycle.pending,null);});
test('legacy varySpots flag cannot rotate a new map visit after stalled movement',()=>{const c=new Cycle({...config(),varySpots:true}),s=snap({position:{x:1,y:1}});c.start(s,0);c.step(s,0);c.step(s,46000);assert.equal(c.running,false);assert.match(c.message,/45 s/);});
test('disabled MG minima remain recoverable for another class, but enabled maps respect it',()=>{const c=config(),m=c.leveling.maps.find(m=>m.map==='arena2');m.level=minimumLevel('arena2',12);assert.equal(validLeveling(c,0),true);m.enabled=true;assert.equal(validLeveling(c,0),false);assert.equal(validLeveling(c,12),true);});
test('a threshold crossed during same-world warp waits for that arrival confirmation',()=>{const c=config();for(const m of c.leveling.maps)m.enabled=false;Object.assign(c.leveling.maps.find(m=>m.map==='atlans3'),{enabled:true,spots:[point(30,40)]});Object.assign(c.leveling.maps.find(m=>m.map==='icarus'),{enabled:true,spots:[point(43,155)]});const cycle=new Cycle(c),s=snap({level:100,map:7,warpSerial:0});cycle.start(s,0);cycle.step(s,0);assert.equal(cycle.step({...s,level:200},1000),null);assert.equal(cycle.stage.id,'atlans3');assert.equal(cycle.step({...s,level:200,warpSerial:1},2000).text,'/move icarus');assert.equal(cycle.pending.kind,'warp');assert.equal(cycle.step({...s,level:200,warpSerial:1},2500),null);});
test('reaching the current map first threshold does not select a different spot',()=>{const c=config(),v=new MapVisit(),first=v.choose(c,snap({level:1}));assert.deepEqual(v.choose(c,snap({level:10})),first);});

test('safe respawn walks to saved coordinates, including arrival tolerance, then enables Home',()=>{
 const c=new Cycle(config()),s=snap({position:{x:120,y:120}});let safe=true;
 const world={playerEntity:{attributeSystem:{isAboveZero:()=>safe}},getTerrainFlag:()=>0};
 c.start(s,0);assert.equal(c.step(s,0,world).kind,'walk');
 const near={...s,position:{x:46,y:59}};
 assert.equal(c.step(near,2500,world).kind,'walk');assert.equal(c.settled,false);assert.equal(c.running,true);
 safe=false;assert.equal(c.step(snap(),3000,world).kind,'helper');
 safe=true;assert.equal(c.step(near,5000,world).kind,'walk');assert.equal(c.settled,false);
});
test('saved safe-zone spot reports invalid coordinates instead of activating Home',()=>{
 const c=new Cycle(config()),s=snap(),world={playerEntity:{attributeSystem:{isAboveZero:()=>true}},getTerrainFlag:()=>1};
 c.start(s,0);assert.equal(c.step(s,0,world).kind,'stop');assert.match(c.message,/spot guardado.*zona segura/);
});

test('map thresholds and reset take priority over buff work while confirmed travel remains exclusive',()=>{
 const c=new Cycle(config()),s=snap();c.start(s,0);c.step(s,0);
 assert.equal(c.transitionDue(s),false);assert.equal(c.transitionDue({...s,level:50}),true);
 c.step({...s,level:50},500);assert.equal(c.transitionDue({...s,level:200}),false);
 c.step({...s,map:6,level:50,position:{x:12,y:39}},1000);
 assert.equal(c.transitionDue({...s,map:6,level:170}),true);
 assert.equal(c.transitionDue({...s,map:6,level:400}),true);
 assert.equal(c.transitionDue({...s,map:6,level:170,loading:true}),false);
});
