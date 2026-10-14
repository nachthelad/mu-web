'use strict';
const GAME='https://mu.mormon.garden/*';
const panelURL=chrome.runtime.getURL('panel.html');
let opening=null;
async function panelTabs(){
  // Only inspect our own extension contexts; no access to other browser tabs.
  const contexts=await chrome.runtime.getContexts({contextTypes:['TAB'],documentUrls:[panelURL]});
  return [...new Set(contexts.map(c=>c.tabId).filter(id=>id>=0))].map(id=>({id}));
}
async function openPanel(reload=false){
  // Query again after every worker restart; no persisted tab ID can become stale.
  if(opening)return opening;
  opening=(async()=>{
    const tabs=await panelTabs();
    const existing=tabs[0];
    if(existing){const tab=await chrome.tabs.update(existing.id,{active:true,...(reload?{url:panelURL}:{})});await chrome.windows.update(tab.windowId,{focused:true});return existing.id;}
    return (await chrome.tabs.create({url:panelURL})).id;
  })();
  try{return await opening;}finally{opening=null;}
}
chrome.action.onClicked.addListener(()=>{openPanel().catch(console.error);});
async function restorePanelAfterUpdate(details){
  if(details.reason!=='update')return;
  // Chrome may close extension tabs on reload. Restore one panel, never MU.
  const id=await openPanel(true);
  const tabs=await panelTabs();
  const duplicates=tabs.filter(t=>t.id!==id).map(t=>t.id);
  if(duplicates.length)await chrome.tabs.remove(duplicates);
}
chrome.runtime.onInstalled.addListener(details=>{restorePanelAfterUpdate(details).catch(console.error);});
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  if(sender.id!==chrome.runtime.id||sender.url!==panelURL)return;
  const handle=async()=>{
    if(message?.type==='list'){
      const tabs=await chrome.tabs.query({url:GAME});
      return {ok:true,tabs:tabs.map(t=>({id:t.id,title:t.title||'MU',discarded:!!t.discarded}))};
    }
    if(message?.type!=='request'||!Number.isInteger(message.tabId)||!message.request||JSON.stringify(message.request).length>20000)throw Error('Mensaje inválido');
    const tab=await chrome.tabs.get(message.tabId);
    if(!tab.url?.startsWith('https://mu.mormon.garden/')||tab.discarded)throw Error('Pestaña no disponible');
    return await chrome.tabs.sendMessage(message.tabId,{type:'mu-panel',request:message.request},{frameId:0});
  };
  handle().then(reply,error=>reply({ok:false,disconnected:true,error:error.message||'Sin conexión'}));
  return true;
});
