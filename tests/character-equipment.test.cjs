const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {nativeFixture,mobxFixture}=require('../demos/helper/character-current-audited.js');
const {characterStats,compareStats,pairCharacterInventory,validPreferences,DEFAULTS}=require('../src/helper/level-helper.user.js');
const native=nativeFixture(),item=(group,num)=>({group,num,lvl:13,isExcellent:true,isAncient:false,excellentFlags:32,optionLevel:4,luck:true});
const fixture=()=>({uiState:5,gsSocket:{readyState:1,url:'wss://demo'},playerData:{name:'Mage',charClass:2,level:400,str:65535,agi:65535,sta:65535,eng:65535,leadership:0,items:[item(5,11),item(6,0),item(7,0),item(8,0),item(9,0),item(10,0),item(11,0),item(12,0),item(13,0),item(13,12),item(13,8),item(13,9)]}});
const stats=store=>characterStats(store,{playerEntity:{}},'demo',native);
test('current public catalog: all slots, type-specific tooltip and immutable A/B',()=>{
 const store=fixture(),a=stats(store);assert.equal(a.equipmentDetails.length,12);assert.ok(a.equipmentDetails.every(piece=>piece.state==='Tooltip del cliente'));
 const text=slot=>a.equipmentDetails[slot].lines.join(' ');
 assert.match(text(0),/item.exc.excellentDamage/);assert.match(text(1),/item.exc.maxLife/);assert.match(text(10),/item.exc.maxLife/);assert.match(text(9),/item.exc.maxLife/);assert.match(text(7),/item.increaseDamage/);
 store.playerData.items[11].lvl=0;const b=stats(store);assert.equal(a.equipment[11].lvl,13);assert.ok(compareStats(a,b).warnings.some(w=>w.startsWith('Cambió Anillo 2')));
 store.playerData.items.push(item(5,10));assert.equal(stats(store).equipmentDetails.length,12);
});
test('partial catalog and empty slots preserve independent native metrics and other items',()=>{
 const store=fixture();store.playerData.items[10]=null;store.playerData.items[11]={...item(99,999)};const result=stats(store);
 assert.equal(result.equipmentDetails[10].state,'Vacío');assert.equal(result.equipmentDetails[11].state,'Item sin resolver');assert.ok(result.equipmentDetails[0].lines.length);
 assert.equal(result.metrics.find(m=>m.key==='wizardryMin').value,7281);
 store.playerData.items[0]={...item(99,999)};const partial=stats(store);assert.equal(partial.metrics.find(m=>m.key==='damageMin').value,null);assert.ok(partial.metrics.find(m=>m.key==='attackRate').value>0);
 store.playerData.items.length=3;assert.equal(stats(store).equipmentDetails[11].state,'Datos pendientes');
});
test('current MobX and exact native mutual-close loop preserve individual close and other menus',async()=>{
 const {observable,reaction,action}=mobxFixture(),c=observable({uiState:5,inventoryEnabled:false,characterInfoEnabled:false,skillListEnabled:false});
 const source=fs.readFileSync('artifacts/stats-research/current-ui.js','utf8');assert.ok(source.includes('for(const n of St)n!==e&&n.open()&&n.close()'));
 const St=['inventoryEnabled','characterInfoEnabled','skillListEnabled'].map(key=>({open:()=>c[key],close:()=>action(()=>c[key]=false)}));
 const disposers=St.map(e=>reaction(e.open,t=>{if(t)for(const n of St)n!==e&&n.open()&&n.close()}));const stop=pairCharacterInventory(c);
 action(()=>c.inventoryEnabled=true);await Promise.resolve();action(()=>c.characterInfoEnabled=true);assert.equal(c.inventoryEnabled,true);await Promise.resolve();
 action(()=>c.inventoryEnabled=false);assert.equal(c.characterInfoEnabled,true);action(()=>c.inventoryEnabled=true);await Promise.resolve();action(()=>c.skillListEnabled=true);assert.equal(c.characterInfoEnabled,false);assert.equal(c.inventoryEnabled,false);
 stop();action(()=>c.characterInfoEnabled=true);action(()=>c.inventoryEnabled=true);assert.equal(c.characterInfoEnabled,false);disposers.forEach(fn=>fn());
 assert.equal(validPreferences({version:1,spots:DEFAULTS.spots,sendParty:true,acceptParty:true,pairInventory:'yes'}),false);
});
