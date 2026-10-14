'use strict';
// Only a local simulator: these entities and packets never reach the game.
const goldDemoHandlers=new Map();
window.__eventBus={on(name,fn){if(!goldDemoHandlers.has(name))goldDemoHandlers.set(name,new Set());goldDemoHandlers.get(name).add(fn);},off(name,fn){goldDemoHandlers.get(name)?.delete(fn);}};
function goldDemoEmit(name,value){for(const fn of goldDemoHandlers.get(name)??[])fn(value);}
function goldDemoNotice(text,type=0){const bytes=Uint8Array.from([193,5+text.length,13,type,...Array.from(text,c=>c.charCodeAt(0)),0]);goldDemoEmit('ServerMessage',new DataView(bytes.buffer));}
const goldDemoDestinations={noria:{map:3,x:174,y:112,level:10},tarkan2:{map:8,x:98,y:145,level:140},atlans2:{map:7,x:227,y:52,level:80},atlans3:{map:7,x:65,y:160,level:90},lorencia:{map:0,x:142,y:126,level:10},devias:{map:2,x:207,y:42,level:20}};
Object.assign(window.__world,{attackTarget:null,pickupTarget:null,castRequest:null,castApproach:null});
Object.assign(window.__store.playerData,{charClass:4,items:[],maxHP:100});
window.__store.playerId=1;hero.netId=1;
window.__store.muHelper.config={skills:[9,0,0],useHealPotion:false};
window.__store.pickupItemRequest=function(id){
  const world=window.__world,drop=world.netObjsQuery.entities.find(e=>e.netId===id&&e.droppedItem);if(!drop)return;
  log('Recoger Kundun '+id);
  setTimeout(()=>{
    if(window.__goldDemo.rejectLoot){goldDemoEmit('ItemPickUpRequestFailed',new DataView(Uint8Array.from([195,4,34,255]).buffer));return;}
    this.playerData.items.push(drop.droppedItem.item);world.netObjsQuery.entities=world.netObjsQuery.entities.filter(e=>e!==drop);
    goldDemoEmit('ItemAddedToInventory',new DataView(Uint8Array.from([195,16,34,12,11,64,0,0,0,224,0,255,255,255,255,255]).buffer));
  },400);
};
const goldDemoBaseChat=window.__social.sendChat.bind(window.__social);
window.__social.sendChat=function(text){
  const target=goldDemoDestinations[text.replace('/move ','')];if(!target)return goldDemoBaseChat(text);
  log(text);
  if(window.__store.playerData.level<target.level){setTimeout(()=>goldDemoNotice(`You need to be level ${target.level} in order to warp`,1),200);return true;}
  window.__store.sceneLoading=true;
  setTimeout(()=>{const world=window.__world;world.mapIndex=target.map;hero.transform.pos.x=target.x;hero.transform.pos.z=target.y;hero.playerMoveTo.point={x:target.x,y:target.y};hero.playerMoveTo.handled=true;world.netObjsQuery.entities=[];window.__store.sceneLoading=false;goldDemoEmit('MapChanged',new DataView(Uint8Array.from([195,15,28,15,1,0,target.map,target.x,target.y,0,0,0,0,0,0]).buffer));},600);
  return true;
};
window.__goldDemo={rejectLoot:false,autoKill:true,moving:true,
  start(){goldDemoNotice('[Lorencia] Golden invasion!');},
  soon(){goldDemoNotice('Golden Dragon invasion will start in 1 minute');},
  end(){goldDemoNotice('[Lorencia] Golden invasion has ended.');},
  monster(){const world=window.__world;const e={netId:900,npcType:world.mapIndex===8?82:world.mapIndex===7?80:world.mapIndex===2?53:world.mapIndex===3?78:43,worldIndex:world.mapIndex,transform:{pos:{x:hero.transform.pos.x+2,z:hero.transform.pos.z+2}}};world.netObjsQuery.entities.push(e);},
  drop(){const world=window.__world;world.netObjsQuery.entities.push({netId:901+window.__store.playerData.items.length,worldIndex:world.mapIndex,transform:{pos:{x:hero.transform.pos.x+1,z:hero.transform.pos.z+1}},droppedItem:{group:14,num:11,item:{group:14,num:11,lvl:8}}});}
};
let goldDemoLastAttack=null,goldDemoAttackAt=0;
setInterval(()=>{
  const world=window.__world,gd=window.__goldDemo;
  if(gd.moving&&!hero.dying&&!hero.playerMoveTo.handled){hero.transform.pos.x=hero.playerMoveTo.point.x;hero.transform.pos.z=hero.playerMoveTo.point.y;hero.playerMoveTo.handled=true;}
  if(world.pickupTarget){const drop=world.pickupTarget;world.pickupTarget=null;window.__store.pickupItemRequest(drop.netId);}
  if(world.attackTarget&&!world.attackTarget.dying){
    if(goldDemoLastAttack!==world.attackTarget){goldDemoLastAttack=world.attackTarget;goldDemoAttackAt=Date.now();log('Atacar dorado '+world.attackTarget.netId);}
    if(gd.autoKill&&Date.now()-goldDemoAttackAt>=1000){const e=world.attackTarget;e.dying={killedByHero:true,killerNetId:1};const packet=new DataView(new ArrayBuffer(9));packet.setUint8(0,193);packet.setUint8(1,9);packet.setUint8(2,23);packet.setUint16(3,e.netId);packet.setUint16(7,1);gd.drop();goldDemoEmit('ObjectGotKilled',packet);world.attackTarget=null;world.castRequest=null;log('Dorado muerto · drop Kundun');}
  }
},250);
document.getElementById('gold-start').onclick=()=>window.__goldDemo.start();
document.getElementById('gold-monster').onclick=()=>window.__goldDemo.monster();
document.getElementById('gold-end').onclick=()=>window.__goldDemo.end();
