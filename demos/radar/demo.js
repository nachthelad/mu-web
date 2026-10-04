'use strict';
window.__GOLDEN_RADAR_DEMO__=true;
const handlers=new Map();
window.__eventBus={on(name,fn){if(!handlers.has(name))handlers.set(name,new Set());handlers.get(name).add(fn);},off(name,fn){handlers.get(name)?.delete(fn);}};
function emit(name,value){for(const fn of handlers.get(name)??[])fn(value);}
function eventPacket(enabled){return new DataView(Uint8Array.from([193,5,11,enabled?1:0,3]).buffer);}
function entity(id,type,x,y){return {netId:id,npcType:type,transform:{pos:{x,y:0,z:y}}};}
function reset(){window.__world={mapIndex:0,terrain:{},playerEntity:{localPlayer:true,transform:{pos:{x:125,y:0,z:128}}},netObjsQuery:{entities:[entity(1,44,155,148),entity(2,79,91,94),entity(3,43,177,115)]},isWalkable(x,y){return Math.sin(x/19)+Math.cos(y/23)>.1;}};}
reset();
document.getElementById('controls').addEventListener('click',e=>{
  const action=e.target.dataset.action,world=window.__world;let message='';
  if(action==='start'){emit('MapEventState',eventPacket(true));message='Anuncio simulado recibido: invasión activa en este mapa.';}
  if(action==='stop'){emit('MapEventState',eventPacket(false));message='Fin anunciado. Los monstruos permanecen hasta que el cliente los retire.';}
  if(action==='scope'){world.netObjsQuery.entities=[];message='Dragones fuera de alcance: quedan como avistamientos durante 90 s.';}
  if(action==='death'){world.netObjsQuery.entities.forEach(o=>o.dying=true);message='Muertes recibidas: se eliminan las detecciones y su rastro reciente.';}
  if(action==='map'){world.mapIndex=world.mapIndex===0?2:0;world.netObjsQuery.entities=[];emit('warpCompleted',{map:world.mapIndex});message='Nuevo mapa: se limpiaron los avistamientos y el anuncio anterior.';}
  if(action==='disconnect'){world.playerEntity=null;world.netObjsQuery.entities=[];message='Desconectado: radar sin posiciones.';}
  if(action==='reset'){reset();message='Demo reiniciada: esperando anuncio de invasión.';}
  if(message)document.getElementById('result').textContent=message;
});
