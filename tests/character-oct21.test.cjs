const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {characterStats,StatsComparison,pairCharacterInventory}=require('../src/helper/level-helper.user.js');
const fixture=require('../demos/helper/character-oct21-audited.js');
test('21 October exports, Character Info call, main-hand correction, tooltip and bridge provenance',()=>{
 const audit=JSON.parse(fs.readFileSync('artifacts/stats-2026-10-21/audit.json'));
 for(const [name,hash]of Object.entries(audit.hashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('artifacts/stats-2026-10-21/'+name)).digest('hex'),hash);
 const layout=fs.readFileSync('artifacts/stats-2026-10-21/layout.js','utf8'),boot=fs.readFileSync('artifacts/stats-2026-10-21/boot.js','utf8');
 for(const value of Object.values(audit.exports))assert.ok(layout.slice(layout.lastIndexOf('export{')).includes(value));
 for(const value of ['n as E','b1 as sR','aL as We'])assert.ok(boot.includes(value));
 assert.match(boot,/o=sR\(\{charClass:e.charClass,level:e.level,strength:e.str,agility:e.agi/);
 assert.match(layout,/function K4e\(e\).*?H1\(n,se.LeftHandSlot\)/);
 const bridge=fs.readFileSync('src/extension/page-bridge.js','utf8');assert.match(bridge,/store=native.n,social=native.V,bus=native.aw/);assert.match(bridge,/__world:\(\)=>store.world/);
});
test('21 October native staff combinations, item options, null dependencies and independent A/B',()=>{
 const native=fixture.nativeFixture(),items=Array(12).fill(null),staff={group:5,num:11,lvl:13,isExcellent:true,optionLevel:4,excellentFlags:32};
 const pd={name:'Fixture',charClass:2,level:10,str:65535,agi:65535,sta:65535,eng:65535,leadership:0,items},store={uiState:5,gsSocket:{readyState:1,url:'wss://fixture'},playerData:pd},world={playerEntity:{}};
 const read=()=>characterStats(store,world,'demo',native),metrics=()=>Object.fromEntries(read().metrics.map(m=>[m.key,m.value]));
 for(const [a,b,min,max,rate]of [[null,null,7281,16383,0],[staff,null,7384,16493,110],[null,staff,7281,16383,0],[staff,staff,7384,16493,110]]){
  items[0]=a;items[1]=b;const m=metrics(),exact=native.calculate({charClass:2,level:10,strength:65535,agility:65535,vitality:65535,energy:65535,leadership:0,items});
  assert.deepEqual([m.wizardryMin,m.wizardryMax,m.staffRate],[min,max,rate]);for(const key of ['damageMin','damageMax','defense','defenseRate','attackRate'])assert.equal(m[key],exact[key]);assert.equal(m.effectiveDamage,null);
  if(a&&b){assert.equal(m.staffTooltipRate,null);assert.match(read().staffWarning,/C consulta slot 0/);}else if(a){assert.equal(read().staffWarning,null);assert.equal(m.damageMin,8294);}else if(b)assert.match(read().staffWarning,/solo consulta slot 0/);
 }
 items[0]=staff;items[1]=null;const ab=new StatsComparison();ab.update(read());ab.capture('a');
 const lines=native.tooltip(staff,{freeRequirements:true,level:10,worn:items}).lines.map(l=>l.text).join(' ');
 assert.match(lines,/wizardryIncrease value=110/);assert.match(lines,/additionalWizardry value=16/);assert.match(lines,/exc.excellentDamage/);
 const ordinary={group:5,num:0,lvl:0,isExcellent:false};assert.match(native.tooltip(ordinary,{freeRequirements:true,level:10,worn:items}).lines.map(l=>l.text).join(' '),/item.offHandStaff/);
 items[0]={...staff,optionLevel:7,excellentFlags:0};assert.equal(metrics().wizardryMin,7384);assert.equal(metrics().staffAdditional,28);assert.equal(metrics().excellentRate,0);
 items[0]={group:5,num:10,lvl:0,isExcellent:false,optionLevel:0,excellentFlags:0};ab.update(read());ab.capture('b');assert.equal(ab.a.metrics.find(m=>m.key==='staffRate').value,110);assert.equal(metrics().staffRate,53);
 items[0]={group:999,num:999,lvl:0,isExcellent:false};assert.equal(metrics().wizardryMin,null);assert.equal(metrics().damageMin,null);assert.equal(metrics().attackRate,114735);
 items[0]=null;items[1]={group:999,num:999,lvl:0,isExcellent:false};assert.equal(metrics().wizardryMin,7281);assert.equal(metrics().damageMin,null);
 delete items[0];assert.equal(metrics().wizardryMin,null);items[0]=null;pd.eng=undefined;assert.equal(metrics().wizardryMin,null);assert.equal(metrics().wizardryBaseMin,null);
});
test('21 October exact native MobX jt/G0 registry: exclusive first, hook both orders, close/third menu/dispose',async()=>{
 const m=fixture.mobxFixture(),s=m.observable({uiState:5,characterInfoEnabled:false,inventoryEnabled:false,skillListEnabled:false}),n=fixture.installNativeClosures(s,m),set=(key,v)=>m.action(()=>s[key]=v);
 set('characterInfoEnabled',true);set('inventoryEnabled',true);assert.equal(s.characterInfoEnabled,false);set('characterInfoEnabled',true);assert.equal(s.inventoryEnabled,false);
 const dispose=pairCharacterInventory(s);set('inventoryEnabled',true);assert.ok(s.inventoryEnabled&&s.characterInfoEnabled);await Promise.resolve();set('characterInfoEnabled',false);assert.ok(s.inventoryEnabled&&!s.characterInfoEnabled);set('characterInfoEnabled',true);assert.ok(s.inventoryEnabled&&s.characterInfoEnabled);
 await Promise.resolve();set('inventoryEnabled',false);assert.ok(s.characterInfoEnabled&&!s.inventoryEnabled);set('inventoryEnabled',true);set('skillListEnabled',true);assert.ok(!s.inventoryEnabled&&!s.characterInfoEnabled);
 set('characterInfoEnabled',true);set('inventoryEnabled',true);m.action(()=>n.social.partyWindowEnabled=true);assert.ok(!s.inventoryEnabled&&!s.characterInfoEnabled);
 dispose();set('characterInfoEnabled',true);set('inventoryEnabled',true);assert.equal(s.characterInfoEnabled,false);n.dispose();
});
