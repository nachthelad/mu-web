const {test}=require('node:test'),assert=require('node:assert/strict');
const {HideHelmet}=require('../src/helper/level-helper.user.js');
function fixture(){
 const part=()=>({Ready:true,loadSeq:0,mesh:'initial',Unload(){this.loadSeq++;this.Ready=false;this.mesh=null;}});
 const model={Ready:true,Helm:part(),HelmMask:part(),Armor:part(),async loadPartAsync(dir,p,name){const seq=++p.loadSeq;await Promise.resolve();if(seq===p.loadSeq){p.mesh=name;p.Ready=true;}},setDefaultMask(){this.HelmMask.Unload();},setDefaultHelm(){return this.loadPartAsync('Player/',this.Helm,'class-head');}};
 const entity={localPlayer:true,modelObject:model,charAppearance:{helm:{group:7,num:1,lvl:9},changed:false}};
 return {world:{mapIndex:0,playerEntity:entity},store:{uiState:5,playerData:{items:[entity.charAppearance.helm],defense:100}},model,entity};
}
test('only local helmet rendering is intercepted; equipment, stats, other sockets stay intact',async()=>{
 const f=fixture(),c=new HideHelmet(),before=JSON.stringify(f.store),helm=f.entity.charAppearance.helm,original=f.model.loadPartAsync;
 c.enabled=true;c.sync(f.world,f.store);await f.model.loadPartAsync('Player/',f.model.HelmMask,'new-helmet');
 assert.equal(f.model.HelmMask.mesh,null);assert.equal(f.model.Helm.mesh,'initial');
 await f.model.loadPartAsync('Player/',f.model.Armor,'armor');assert.equal(f.model.Armor.mesh,'armor');
 assert.equal(JSON.stringify(f.store),before);assert.equal(f.entity.charAppearance.helm,helm);
 const other=fixture();await other.model.loadPartAsync('Player/',other.model.HelmMask,'remote');assert.equal(other.model.HelmMask.mesh,'remote');
 f.entity.charAppearance.helm={group:7,num:2,lvl:13};c.enabled=false;c.sync(f.world,f.store);
 assert.equal(f.model.loadPartAsync,original);assert.equal(f.entity.charAppearance.changed,true);
 await f.model.loadPartAsync('Player/',f.model.HelmMask,'current-helmet');assert.equal(f.model.HelmMask.mesh,'current-helmet');
});
test('pending helmet load is cancelled and missing class head restored',async()=>{
 const f=fixture(),c=new HideHelmet();const pending=f.model.loadPartAsync('Player/',f.model.HelmMask,'stale');
 f.model.Helm.Unload();c.enabled=true;c.sync(f.world,f.store);await pending;await Promise.resolve();
 assert.equal(f.model.HelmMask.mesh,null);assert.equal(f.model.Helm.mesh,'class-head');
});
test('rebinds new world/entity/model and suspends in loading, selection, transformations and Chaos Castle',()=>{
 const a=fixture(),b=fixture(),c=new HideHelmet(),original=a.model.loadPartAsync;c.enabled=true;c.sync(a.world,a.store);
 c.sync(b.world,b.store);assert.equal(a.model.loadPartAsync,original);assert.equal(c.binding.model,b.model);
 for(const patch of [{skin:14},{map:18},{loading:true},{ui:3},{local:false}]){
  const f=fixture();if(patch.skin)f.entity.skin=patch.skin;if(patch.map)f.world.mapIndex=patch.map;if(patch.loading)f.store.sceneLoading=true;if(patch.ui)f.store.uiState=patch.ui;if(patch.local===false)f.entity.localPlayer=false;
  c.sync(f.world,f.store);assert.equal(c.binding,null);assert.equal(c.enabled,true);
 }
 c.sync(b.world,b.store);assert.ok(c.binding);c.detach();assert.equal(c.binding,null);
});
test('cosmetic failure restores adapter without escaping into cycle',()=>{
 const f=fixture(),c=new HideHelmet(),original=f.model.loadPartAsync;
 f.model.HelmMask.Unload=()=>{throw Error('mock render error');};c.enabled=true;
 const log=console.error;try{console.error=()=>{};assert.doesNotThrow(()=>c.sync(f.world,f.store));}finally{console.error=log;}
 assert.equal(c.enabled,false);assert.equal(c.binding,null);assert.equal(f.model.loadPartAsync,original);
});
