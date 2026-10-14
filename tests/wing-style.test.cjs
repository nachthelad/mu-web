const {test}=require('node:test'),assert=require('node:assert/strict');
const {WingStyle,HideHelmet,WING_STYLES,validPreferences,DEFAULTS}=require('../src/helper/level-helper.user.js');
const catalog=require('./fixtures/wing-catalog.json');
function fixture(){
 const wings={group:12,num:4,lvl:9,isExcellent:false,luck:true};
 const part=()=>({Ready:true,loadSeq:0,mesh:'original',Unload(){this.loadSeq++;this.Ready=false;this.mesh=null;}});
 const model={Ready:true,Wings:part(),Helm:part(),HelmMask:part(),async loadPartAsync(dir,p,name){const seq=++p.loadSeq;await Promise.resolve();if(seq===p.loadSeq){p.mesh=name;p.Ready=true;}},async setWingsAsync(item){this.lastItem=item;if(!item){this.Wings.Unload();return;}await this.loadPartAsync('Item/',this.Wings,`${item.group}/${item.num}`);},setDefaultHelm(){return Promise.resolve();},setDefaultMask(){}};
 const entity={localPlayer:true,modelObject:model,charAppearance:{wings,changed:false}};
 return {world:{mapIndex:0,playerEntity:entity},store:{uiState:5,playerData:{items:[wings],defense:100}},model,entity};
}
test('all deployed wing models render as copies, switch directly and restore originals',async()=>{
 const f=fixture(),c=new WingStyle(),before=JSON.stringify(f.store);
 assert.equal(WING_STYLES.length,catalog.length+1);
 for(const row of catalog){
  const option=WING_STYLES.find(o=>o.group===row.group&&o.num===row.num);assert.ok(option,row.name);
  c.style=option.id;c.sync(f.world,f.store);await f.model.setWingsAsync(f.entity.charAppearance.wings);
  assert.equal(f.model.Wings.mesh,`${row.group}/${row.num}`);assert.equal(f.model.lastItem.lvl,9);assert.equal(f.model.lastItem.luck,true);
  assert.equal(JSON.stringify(f.store),before);assert.equal(f.entity.charAppearance.wings.num,4);
  await f.model.setWingsAsync(null);assert.equal(f.model.Wings.mesh,null);
 }
 c.style='unknown';c.sync(f.world,f.store);assert.equal(c.style,'original');assert.equal(c.binding,null);
 const prefs={version:1,spots:DEFAULTS.spots,sendParty:true,acceptParty:true};
 assert.ok(validPreferences(prefs));for(const o of WING_STYLES)assert.ok(validPreferences({...prefs,wingStyle:o.id}));
 assert.equal(validPreferences({...prefs,wingStyle:'unknown'}),false);
});
test('switching styles invalidates an in-flight load of the previous model',async()=>{
 const f=fixture(),c=new WingStyle();c.style='blade-knight';c.sync(f.world,f.store);
 const pending=f.model.setWingsAsync(f.entity.charAppearance.wings);
 c.style='wing-13-30';c.sync(f.world,f.store);await pending;assert.equal(f.model.Wings.mesh,null);
 await f.model.setWingsAsync(f.entity.charAppearance.wings);assert.equal(f.model.Wings.mesh,'13/30');
});
test('wing style changes only local rendering copies and restores current equipment',async()=>{
 const f=fixture(),c=new WingStyle(),original=f.model.setWingsAsync,before=JSON.stringify(f.store);c.style='blade-knight';c.sync(f.world,f.store);
 await f.model.setWingsAsync(f.entity.charAppearance.wings);
 assert.equal(f.model.Wings.mesh,'12/5');assert.equal(f.model.lastItem.lvl,9);assert.equal(f.model.lastItem.luck,true);assert.notEqual(f.model.lastItem,f.entity.charAppearance.wings);assert.equal(f.entity.charAppearance.wings.num,4);assert.equal(JSON.stringify(f.store),before);
 const other=fixture();await other.model.setWingsAsync(other.entity.charAppearance.wings);assert.equal(other.model.Wings.mesh,'12/4');
 f.entity.charAppearance.wings={group:12,num:3,lvl:13};await f.model.setWingsAsync(f.entity.charAppearance.wings);assert.equal(f.model.lastItem.lvl,13);
 c.style='original';c.sync(f.world,f.store);assert.equal(f.model.setWingsAsync,original);assert.equal(f.entity.charAppearance.changed,true);await f.model.setWingsAsync(f.entity.charAppearance.wings);assert.equal(f.model.Wings.mesh,'12/3');
});
test('no wings are invented and pending cosmetic loads cannot overwrite restored originals',async()=>{
 const f=fixture(),c=new WingStyle();c.style='blade-knight';c.sync(f.world,f.store);await f.model.setWingsAsync(null);assert.equal(f.model.Wings.mesh,null);
 const pending=f.model.setWingsAsync(f.entity.charAppearance.wings);c.style='original';c.sync(f.world,f.store);await pending;assert.equal(f.model.Wings.mesh,null);await f.model.setWingsAsync(f.entity.charAppearance.wings);assert.equal(f.model.Wings.mesh,'12/4');
});
test('rebinds hero models and suspends while loading, transformed, remote or in Chaos Castle',()=>{
 const a=fixture(),b=fixture(),c=new WingStyle(),original=a.model.setWingsAsync;c.style='blade-knight';c.sync(a.world,a.store);c.sync(b.world,b.store);assert.equal(a.model.setWingsAsync,original);assert.equal(c.binding.model,b.model);
 for(const patch of ['loading','sprites','selection','skin','chaos','remote','missing']){const f=fixture();if(patch==='loading')f.store.sceneLoading=true;if(patch==='sprites')f.store.spritesLoading=true;if(patch==='selection')f.store.uiState=3;if(patch==='skin')f.entity.skin=14;if(patch==='chaos')f.world.mapIndex=18;if(patch==='remote')f.entity.localPlayer=false;if(patch==='missing')delete f.model.setWingsAsync;c.sync(f.world,f.store);assert.equal(c.binding,null);assert.equal(c.style,'blade-knight');}
 c.sync(b.world,b.store);assert.ok(c.binding);c.detach();assert.equal(c.binding,null);
});
test('helmet adapter and wings coexist and native failures restore the original method',async()=>{
 const f=fixture(),c=new WingStyle(),helmet=new HideHelmet();helmet.enabled=true;helmet.sync(f.world,f.store);c.style='blade-knight';c.sync(f.world,f.store);await f.model.setWingsAsync(f.entity.charAppearance.wings);assert.equal(f.model.Wings.mesh,'12/5');await f.model.loadPartAsync('Player/',f.model.HelmMask,'helmet');assert.equal(f.model.HelmMask.mesh,null);c.detach();helmet.detach();
 for(const asyncFailure of [false,true]){const f=fixture(),c=new WingStyle();const original=f.model.setWingsAsync=asyncFailure?()=>Promise.reject(Error('mock')):()=>{throw Error('mock');};c.style='blade-knight';c.sync(f.world,f.store);const log=console.error;console.error=()=>{};try{await f.model.setWingsAsync(f.entity.charAppearance.wings);}finally{console.error=log;}assert.equal(c.style,'original');assert.equal(c.binding,null);assert.equal(f.model.setWingsAsync,original);assert.match(c.message,/No se pudieron/);}
});
