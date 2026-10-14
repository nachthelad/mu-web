// The isolated world has extension messaging; MAIN never receives Chrome APIs.
(()=>{
  'use strict';
  const channel=crypto.randomUUID(),pending=new Map();let serial=0;
  window.addEventListener('message',event=>{
    const m=event.data;
    if(event.source!==window||event.origin!==location.origin||m?.bridge!=='mu-panel-v1'||m.channel!==channel||m.direction!=='response')return;
    const entry=pending.get(m.id);if(!entry)return;
    pending.delete(m.id);clearTimeout(entry.timer);
    const result=m.result;
    entry.reply(result&&JSON.stringify(result).length<3000000?result:{ok:false,error:'Respuesta demasiado grande'});
  });
  chrome.runtime.onMessage.addListener((message,sender,reply)=>{
    if(sender.id!==chrome.runtime.id||message?.type!=='mu-panel')return;
    if(!message.request||JSON.stringify(message.request).length>20000){reply({ok:false,error:'Mensaje inválido'});return;}
    const id=++serial;
    const timer=setTimeout(()=>{pending.delete(id);reply({ok:false,disconnected:true,error:'Sin respuesta del juego. La acción no se reenvió.'});},4500);
    pending.set(id,{reply,timer});
    window.postMessage({bridge:'mu-panel-v1',channel,direction:'request',id,request:message.request},location.origin);
    return true;
  });
})();
