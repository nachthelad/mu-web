// Extract audited public source verbatim. No game boot, session or sockets.
const fs=require('node:fs'),crypto=require('node:crypto');
const recheck=process.argv.includes('--recheck'),dir=recheck?'artifacts/client-recheck/':'artifacts/stats-2026-10-21/',uiFile=recheck?'index-BzlLuH3h.js':'index-deEbYU8n.js',s=fs.readFileSync(dir+'layout.js','utf8'),idx=fs.readFileSync(dir+'index.js','utf8'),ui=fs.readFileSync(dir+uiFile,'utf8');
const block=term=>{const start=s.indexOf(term);if(start<0)throw Error(term);let p=s.indexOf('{',start),depth=1;for(p++;depth;p++){if(s[p]==='{')depth++;if(s[p]==='}')depth--;}return s.slice(start,p);};
const section=(a,b)=>{const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<=start)throw Error(a+' / '+b);return s.slice(start,end);};
const mappedExports={calculate:'QCt as b1',catalog:'No as bU',slots:'se as aL',itemStats:'zg as nC',tooltip:'I5t as nE',name:'ek as fd'};
for(const value of Object.values(mappedExports))if(!s.slice(s.lastIndexOf('export{')).includes(value))throw Error(value);
const enumStart=s.indexOf('var Z='),catStart=s.indexOf('const Une=');
const enums=s.slice(enumStart,s.indexOf('Z||{})',enumStart)+6),catalog=s.slice(catStart,s.indexOf(']',catStart)+1)+';';
const formulas=section('var Xa=','const Fa=0');
const item=section('const Oe=','const or=');
const tooltip=section('const EJe=','const Rse=');
const scaffolding=`const T=(key,values)=>key+(values?' '+Object.entries(values).map(([k,v])=>k+'='+v).join(' '):'');
const xt={features:{},data:{ancientSets:{}}},am=(g,n)=>No.getItem(g,n)?.ItemName,sS=(g,n,l,name)=>name+' +'+l,as=()=>undefined,MO=()=>undefined,yO=()=>null;`;
const mobx=idx.slice(idx.indexOf('function _(e)'),idx.indexOf('class xt{'));
const closures=ui.slice(ui.indexOf('const jt=['),ui.indexOf('const bt=100',ui.indexOf('const jt=[')));
if(!closures.includes('function G0()')||!mobx)throw Error('Native closure/MobX extraction');
const output=`// Public client 2026-10-21. Verbatim formulas, fallback catalog, item properties, tooltip and MobX closures.
// Translations, skill names, Ancient configuration and auxiliary stores are explicit scaffolding.
// MobX MIT: see MOBX-LICENSE.txt. Never boots a game or authenticates.
(function(root){function nativeFixture(){${enums};${block('class se{')};${catalog}
const No={getItem:(g,n)=>Une.find(i=>i.Group===g&&i.Index===n)};
${formulas}
${scaffolding}
${item}
${tooltip}
return {calculate:QCt,slots:se,itemStats:zg,tooltip:I5t,name:ek,hasItem:i=>!!No.getItem(i.group,i.num),catalogue:Une,compatible:true,wizardrySlot:0};}
function mobxFixture(){${mobx}\nreturn {observable:b,reaction:ys,action:j};}
function installNativeClosures(c,mobx){const X=mobx.action,re=mobx.observable,disposers=[];
const zt=(...args)=>{const dispose=mobx.reaction(...args);disposers.push(dispose);return dispose;};
const ne=re({partyWindowEnabled:false,guildWindowEnabled:false}),Ae=re({windowEnabled:false,toggleWindow(){this.windowEnabled=!this.windowEnabled}}),nn=re({windowOpen:false,closeWindow(){this.windowOpen=false}}),at=re({open:false}),sn=re({windowOpen:false});
${closures}
G0();return {dispose:()=>disposers.forEach(fn=>fn()),social:ne};}
const result={nativeFixture,mobxFixture,installNativeClosures};if(typeof module==='object')module.exports=result;else root.__OCT21_CHARACTER_FIXTURE__=result;})(globalThis);`;
fs.writeFileSync(recheck?'demos/helper/character-recheck-audited.js':'demos/helper/character-oct21-audited.js',output);
const files=['root.html','index.js','layout.js','boot.js',uiFile,recheck?'index-CRTYn6sm.js':'index-XkyGNZAS.js',recheck?'windowState-BxHZLNXq.js':'windowState-WrR6PWrq.js'];
fs.writeFileSync(dir+'audit.json',JSON.stringify({date:'2026-10-21',entry:recheck?'/assets/index-Do3IjarP.js':'/assets/index-URnTVW_1.js',module:recheck?'/assets/layout-CoOAKkh-.js':'/assets/layout-DQbdTT-G.js',exports:mappedExports,world:'store.world; bridge n/V/aw preserved',wizardrySlot:0,closures:uiFile+' jt/G0',hashes:Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(dir+f)).digest('hex')])),limitations:'Static public audit and isolated extracted fixtures only. Fallback catalog, no real account; translations, skill and Ancient configuration scaffolded.'},null,2));

