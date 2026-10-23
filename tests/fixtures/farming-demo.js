// Test-only synthetic world and packet recorder; no game connection.
window.installFarmDemo=function(){
  const store=__store,world=__world,hero=world.playerEntity;window.farmPackets=[];
  Object.assign(store.playerData,{charClass:0,level:400,eng:1200,currentMP:100,currentAG:100,tileFlag:0});store.skills=[{number:1},{number:4},{number:16},{number:40}];store.currentSkill=1;store.selectSkill=function(n){this.currentSkill=this.skills.some(k=>k.number===n)?n:-1;};store.sendToGS=p=>farmPackets.push({skill:p.SkillId,target:p.TargetId});store.pickupItemRequest=id=>farmPackets.push({pickup:id});
  Object.assign(hero,{charAppearance:{charClass:0},pathfinding:{path:null},playerAnimation:{}});hero.attributeSystem.getValue=()=>0;hero.transform={pos:{x:50,z:50},rot:{y:0}};hero.playerMoveTo.point={x:50,y:50};
  Object.assign(world,{mapIndex:33,attackTarget:null,castRequest:null,pickupTarget:null,castApproach:null,pathfinder:{search:(a,b)=>[a,b]},getByNetId(id){return this.netObjsQuery.entities.find(e=>e.netId===id);}});
  world.netObjsQuery.entities=[{netId:88,npcType:2,worldIndex:33,transform:{pos:{x:51,z:50}}}];
  window.farmClient=__farmClientFixture.create(store,world);window.__FARM_DEMO_NATIVE__=farmClient.native;
};
