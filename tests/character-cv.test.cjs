const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),crypto=require('crypto');
const {pairCharacterInventory}=require('../src/helper/level-helper.user.js');
const fixture=require('../demos/helper/character-cv-audited.js');
test('actual current registry: reproduce exclusive C/V, then verify hook, both directions, explicit closes, other menus and restoration',async()=>{
 const audit=JSON.parse(fs.readFileSync('artifacts/stats-research/cv-audit.json'));for(const [key,file]of [['mobx','rework-index.js'],['ui','cv-index-D5yEXyzD.js']])assert.equal(crypto.createHash('sha256').update(fs.readFileSync('artifacts/stats-research/'+file)).digest('hex'),audit.hashes[key]);
 const m=fixture.mobxFixture(),store=m.observable({uiState:5,characterInfoEnabled:false,inventoryEnabled:false,skillListEnabled:false,sceneLoading:false,spritesLoading:false,connectionLost:false}),native=fixture.installNativeClosures(store,m),set=(key,value)=>m.action(()=>store[key]=value);
 set('characterInfoEnabled',true);set('inventoryEnabled',true);assert.equal(store.characterInfoEnabled,false);assert.equal(store.inventoryEnabled,true);
 set('characterInfoEnabled',true);assert.equal(store.inventoryEnabled,false);
 const dispose=pairCharacterInventory(store);assert.equal(typeof dispose,'function');
 set('inventoryEnabled',true);assert.equal(store.characterInfoEnabled,true);assert.equal(store.inventoryEnabled,true);
 await Promise.resolve();set('characterInfoEnabled',false);assert.equal(store.characterInfoEnabled,false);assert.equal(store.inventoryEnabled,true);
 set('characterInfoEnabled',true);assert.equal(store.inventoryEnabled,true);await Promise.resolve();set('inventoryEnabled',false);assert.equal(store.characterInfoEnabled,true);assert.equal(store.inventoryEnabled,false);
 set('inventoryEnabled',true);set('skillListEnabled',true);assert.equal(store.characterInfoEnabled,false);assert.equal(store.inventoryEnabled,false);
 set('characterInfoEnabled',true);set('inventoryEnabled',true);m.action(()=>native.social.partyWindowEnabled=true);assert.equal(store.characterInfoEnabled,false);assert.equal(store.inventoryEnabled,false);
 dispose();set('characterInfoEnabled',true);set('inventoryEnabled',true);assert.equal(store.characterInfoEnabled,false);native.dispose();
});
