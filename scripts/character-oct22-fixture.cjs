// Verbatim extraction from the public October 22 client, without boot or authentication.
const fs=require('node:fs'),crypto=require('node:crypto'),dir='artifacts/client-oct22/';
const s=fs.readFileSync(dir+'layout.js','utf8'),idx=fs.readFileSync(dir+'index.js','utf8'),ui=fs.readFileSync(dir+'ui.js','utf8');
const section=(a,b)=>{const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<=start)throw Error(a);return s.slice(start,end);};
const block=term=>{const start=s.indexOf(term);if(start<0)throw Error(term);let p=s.indexOf('{',start),depth=1;for(p++;depth;p++){if(s[p]==='{')depth++;if(s[p]==='}')depth--;}return s.slice(start,p);};
const mappedExports={store:'f as n',social:'K as V',bus:'x as aw',calculate:'Uxt as b1',catalog:'No as bU',slots:'re as aL',itemStats:'Gg as nF',tooltip:'MNt as nH',name:'mk as fd'};
for(const v of Object.values(mappedExports))if(!s.slice(s.lastIndexOf('export{')).includes(v))throw Error(v);
const enums=section('var Z=','),P=')+');';
// Catalog ends at its array, not the following live data loader.
const catStart=s.indexOf('const mae='),cat=s.slice(catStart,s.indexOf(']',catStart)+1)+';';
const formulas=section('var Xa=','const Fa=0'),item=section('const ze={','const or='),tooltip=section('const QJe=','const Kse=');
const mobx=idx.slice(idx.indexOf('function _(e)'),idx.indexOf('class xt{'));
const closures=ui.slice(ui.indexOf('const jt=['),ui.indexOf('const xt=100',ui.indexOf('const jt=[')));
if(!closures.includes('function F0()')||!mobx)throw Error('Native C/V/MobX extraction');
const scaffold=`const _=(key,values)=>key+(values?' '+Object.entries(values).map(([k,v])=>k+'='+v).join(' '):'');const xt={features:{},data:{ancientSets:{}}},lm=(g,n)=>No.getItem(g,n)?.ItemName,gS=(g,n,l,name)=>name+' +'+l,rs=()=>undefined,NO=()=>undefined,zO=()=>null;`;
const output=`// Audited public client 2026-10-22. Extracted formulas/catalog/properties/tooltips/C-V.
// Translations, skill names and Ancient configuration are scaffolding; no client boot.
// MobX MIT: see artifacts/client-recheck/MOBX-LICENSE.txt.
(function(root){function nativeFixture(){${enums}${block('class re{')}${cat}
const No={getItem:(g,n)=>mae.find(i=>i.Group===g&&i.Index===n)};
${formulas}${scaffold}${item}${tooltip}
return {calculate:Uxt,slots:re,itemStats:Gg,tooltip:MNt,name:mk,hasItem:i=>!!No.getItem(i.group,i.num),catalogue:mae,compatible:true,wizardrySlot:0};}
function mobxFixture(){${mobx}\nreturn {observable:b,reaction:ys,action:j};}
function installNativeClosures(c,mobx){const X=mobx.action,disposers=[],zt=(...args)=>{const d=mobx.reaction(...args);disposers.push(d);return d;};
const ne=mobx.observable({partyWindowEnabled:false,guildWindowEnabled:false}),Ae=mobx.observable({windowEnabled:false,toggleWindow(){this.windowEnabled=!this.windowEnabled}}),sn=mobx.observable({windowOpen:false,closeWindow(){this.windowOpen=false}}),ct=mobx.observable({open:false}),on=mobx.observable({windowOpen:false});
${closures}F0();return {dispose:()=>disposers.forEach(fn=>fn()),social:ne};}
const result={nativeFixture,mobxFixture,installNativeClosures};if(typeof module==='object')module.exports=result;else root.__OCT21_CHARACTER_FIXTURE__=result;})(globalThis);`;
fs.writeFileSync('demos/helper/character-oct22-audited.js',output);
const files=['root.html','index.js','layout.js','boot.js','ui.js'];
fs.writeFileSync(dir+'audit.json',JSON.stringify({date:'2026-10-22',entry:'/assets/index-D-gOSya0.js',module:'/assets/layout-DCITLqBq.js',exports:mappedExports,map:{Aida:33},classes:{DarkLord:16,LordEmperor:17},hashes:Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(dir+f)).digest('hex')])),limitations:'Static public audit and extracted fixtures only; no real account or server commands.'},null,2));
