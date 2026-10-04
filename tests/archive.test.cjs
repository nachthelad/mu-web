const {test}=require('node:test');const assert=require('node:assert/strict');
const {Archive,Tracker,HISTORY_KEY}=require('../src/radar/golden-radar.user.js');
function storage(){const values=new Map();return{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};}
const row=(observation,x=100)=>({observation,type:44,x,y:120});
test('persiste posición inicial, mapa y fecha entre nuevas sesiones',()=>{
 const s=storage(),a=new Archive(s);a.observe(0,[row(1)],1000,true);a.observe(0,[row(1,150)],2000,true);
 const restored=new Archive(s);assert.equal(restored.records.length,1);assert.equal(restored.records[0].x,100);assert.equal(restored.records[0].time,1000);assert.equal(restored.records[0].invasionConfirmed,true);assert.equal(restored.forMap(2).length,0);
 restored.observe(2,[row(1)],3000,false);assert.equal(new Archive(s).records.length,2);
});
test('reutilizar netId con una entidad nueva crea un encuentro nuevo',()=>{
 const tracker=new Tracker(),a=new Archive(storage());
 const enemy=()=>({netId:1,npcType:44,transform:{pos:{x:100,y:0,z:120}}});
 const w={mapIndex:0,playerEntity:enemy(),netObjsQuery:{entities:[enemy()]}};
 a.observe(0,tracker.scan(w,0).live,0,false);a.observe(0,tracker.scan(w,10).live,10,false);assert.equal(a.records.length,1);
 w.netObjsQuery.entities=[enemy()];a.observe(0,tracker.scan(w,20).live,20,false);assert.equal(a.records.length,2);
});
test('fallo de escritura conserva datos exportables sin afirmar que se guardaron',()=>{
 const a=new Archive({getItem:()=>null,setItem:()=>{throw new Error('Quota');}});a.observe(0,[row(1)],100,false);
 assert.equal(a.saved,false);assert.equal(JSON.parse(a.export()).records.length,1);
});
test('datos corruptos se preservan, sin sobrescribir silenciosamente',()=>{
 let writes=0;const a=new Archive({getItem:()=>'{broken',setItem:()=>writes++});a.observe(0,[row(1)],100,false);
 assert.equal(a.saved,false);assert.equal(writes,0);assert.equal(a.records.length,1);
});
test('se limita a 5000 registros y omite coordenadas corruptas al leer',()=>{
 const s=storage(),a=new Archive(s);a.observe(0,Array.from({length:5002},(_,n)=>row(n)),100,false);assert.equal(a.records.length,5000);
 const valid=a.records[0];s.setItem(HISTORY_KEY,JSON.stringify({version:1,records:[valid,{...valid,x:256},{...valid,type:2},null]}));assert.equal(new Archive(s).records.length,1);
});
