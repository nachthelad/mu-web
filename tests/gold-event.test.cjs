const {test}=require('node:test'),assert=require('node:assert/strict');
const {GoldenEvent,goldenNotice}=require('../src/radar/golden-radar.user.js');
const {serverMessage,serverKey}=require('../src/helper/level-helper.user.js');
const packet=(text,type=0)=>new DataView(Uint8Array.from([193,5+text.length,13,type,...Buffer.from(text,'latin1'),0]).buffer);
test('anuncios oficiales start/preaviso/end, sin chats ni mensajes de muerte',()=>{
  assert.equal(goldenNotice(packet('[Lorencia] Golden invasion!')),'active');
  assert.equal(goldenNotice(packet('Golden Dragon invasion will start in 1 minute')),'soon');
  assert.equal(goldenNotice(packet('[Lorencia] Golden invasion has ended.')),'ended');
  assert.equal(goldenNotice(packet('Player has defeated the Lorencia Golden Dragon!')),null);
  assert.equal(goldenNotice(packet('[Lorencia] Golden invasion!',1)),null);
  assert.equal(goldenNotice(packet('Red Dragon invasion!')),null);
  assert.equal(goldenNotice(packet('Golden Dragon spotted by a player')),null);
  assert.deepEqual(serverMessage(packet('You need to be level 140 in order to warp',1)),{type:1,text:'You need to be level 140 in order to warp'});
});
test('estado conserva identidad entre mapas, preaviso/start no duplica, fin y expiración',()=>{
  const e=new GoldenEvent();e.observe('soon',0);e.observe('active',3000);const id=e.get(3000).id;
  e.observe('active',300000);assert.equal(e.get(300000).id,id);
  e.observe('ended',600000);e.observe('active',600500);assert.equal(e.get(600500).phase,'ended');
  e.observe('active',700000);assert.notEqual(e.get(700000).id,id);
  assert.equal(e.get(2800001),null);e.clear();assert.equal(e.get(2800001),null);
});
test('clave de servidor separa host/puerto y excluye nonce de sesión',()=>{
  const a=serverKey('wss://proxy.example/ws?host=game1&port=55901&session=secret');
  assert.equal(a.includes('secret'),false);assert.notEqual(a,serverKey('wss://proxy.example/ws?host=game2&port=55901&session=secret'));
  assert.equal(a,serverKey('wss://proxy.example/ws?host=game1&port=55901&session=other'));
});
