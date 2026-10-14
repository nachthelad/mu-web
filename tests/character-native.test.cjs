const {test}=require('node:test'),assert=require('node:assert/strict');
const {nativeFixture,mobxFixture}=require('./fixtures/character-client-audited.cjs');
const {characterStats,pairCharacterInventory}=require('../src/helper/level-helper.user.js');
const native=nativeFixture();
const archangel={group:5,num:10,lvl:0,isExcellent:false,optionLevel:0,excellentFlags:0};
const kundun={group:5,num:11,lvl:13,isExcellent:true,optionLevel:4,excellentFlags:32};
test('verified catalog and tooltip independently match both reported staffs',()=>{
 assert.equal(native.slots.LeftHandSlot,0);assert.equal(native.slots.RightHandSlot,1);
 assert.deepEqual(native.catalogue.map(item=>item.ItemSlot),[0,0]);
 assert.equal(native.itemStats(archangel).magicPower,53);assert.equal(native.itemStats(kundun).magicPower,110);
});
test('full Soul Master, catalog primary slot: native omission and separate staff values',()=>{
 const items=Array(12).fill(null),store={uiState:5,gsSocket:{readyState:1,url:'wss://demo'},playerData:{name:'SoulMaster',charClass:2,level:400,str:65535,agi:65535,sta:65535,eng:65535,leadership:0,items}};
 const metric=(s,key)=>s.metrics.find(row=>row.key===key).value;
 for(const [item,rate,additional,excellent] of [[archangel,53,0,0],[kundun,110,16,10]]){
  items[native.catalogue.find(c=>c.Index===item.num).ItemSlot]=item;
  const result=characterStats(store,{playerEntity:{}},'demo',native);
  assert.equal(metric(result,'wizardryMin'),7281);assert.equal(metric(result,'wizardryMax'),16383);assert.equal(metric(result,'staffRate'),0);
  assert.equal(metric(result,'staffTooltipRate'),rate);assert.equal(metric(result,'staffAdditional'),additional);assert.equal(metric(result,'excellentRate'),excellent);
  assert.equal(metric(result,'effectiveDamage'),null);assert.match(result.staffWarning,/slot 0/);
  assert.equal(metric(result,'damageMin'),item.num===10?8244:8294);assert.equal(metric(result,'damageMax'),item.num===10?16438:16493);
 }
 // Native range still does not react to the additional/excellent-rate flags.
 items[0]={...kundun,optionLevel:7,excellentFlags:0};
 assert.equal(metric(characterStats(store,{playerEntity:{}},'demo',native),'wizardryMin'),7281);
 delete items[0].optionLevel;assert.equal(metric(characterStats(store,{playerEntity:{}},'demo',native),'staffAdditional'),null);
 delete items[0].lvl;assert.equal(metric(characterStats(store,{playerEntity:{}},'demo',native),'staffTooltipRate'),null);
 items[0]=null;assert.equal(metric(characterStats(store,{playerEntity:{}},'demo',native),'staffTooltipRate'),null);
});
test('actual audited MobX reaction: C/V only, explicit close and third windows remain native',async()=>{
 const {observable,reaction,action}=mobxFixture();
 const store=observable({uiState:5,characterInfoEnabled:false,inventoryEnabled:false,skillListEnabled:false});
 const keys=['inventoryEnabled','characterInfoEnabled','skillListEnabled'];
 const reactions=keys.map(key=>reaction(()=>store[key],open=>{if(open)for(const other of keys)if(other!==key&&store[other])action(()=>store[other]=false);}));
 const dispose=pairCharacterInventory(store);assert.equal(typeof dispose,'function');
 action(()=>store.characterInfoEnabled=true);await Promise.resolve();action(()=>store.inventoryEnabled=true);await Promise.resolve();assert.equal(store.characterInfoEnabled,true);assert.equal(store.inventoryEnabled,true);
 action(()=>store.characterInfoEnabled=false);await Promise.resolve();assert.equal(store.characterInfoEnabled,false);assert.equal(store.inventoryEnabled,true);
 action(()=>store.characterInfoEnabled=true);await Promise.resolve();assert.equal(store.inventoryEnabled,true);
 action(()=>store.skillListEnabled=true);await Promise.resolve();assert.equal(store.characterInfoEnabled,false);assert.equal(store.inventoryEnabled,false);
 // After the sibling veto is consumed, even another opening in the same task
 // must retain native exclusivity (no broad microtask exemption).
 action(()=>store.characterInfoEnabled=true);action(()=>store.inventoryEnabled=true);action(()=>store.skillListEnabled=true);
 assert.equal(store.characterInfoEnabled,false);assert.equal(store.inventoryEnabled,false);await Promise.resolve();
 dispose();action(()=>store.characterInfoEnabled=true);await Promise.resolve();action(()=>store.inventoryEnabled=true);assert.equal(store.characterInfoEnabled,false);
 reactions.forEach(stop=>stop());assert.equal(pairCharacterInventory({}),null);
});
