// Verbatim extraction from the public Kanturu client; no boot or authentication.
const fs=require('node:fs'),crypto=require('node:crypto'),dir='artifacts/client-kanturu/';
const s=fs.readFileSync(dir+'layout.js','utf8'),idx=fs.readFileSync(dir+'entry.js','utf8'),ui=fs.readFileSync(dir+'ui.js','utf8');
const section=(a,b)=>{const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<=start)throw Error(a);return s.slice(start,end);};
const block=term=>{const start=s.indexOf(term);if(start<0)throw Error(term);let p=s.indexOf('{',start),depth=1;for(p++;depth;p++){if(s[p]==='{')depth++;if(s[p]==='}')depth--;}return s.slice(start,p);};
const mappedExports={store:'f as n',social:'K as V',bus:'x as aw',calculate:'U5t as b1',catalog:'No as bU',slots:'re as aL',itemStats:'Gg as nF',tooltip:'MNt as nH',name:'mk as fg'};
for(const v of Object.values(mappedExports))if(!s.slice(s.lastIndexOf('export{')).split(',').includes(v))throw Error(v);
const enums=section('var Z=','),P=')+');';
const catStart=s.indexOf('const mae='),cat=s.slice(catStart,s.indexOf(']',catStart)+1)+';';
const formulas=section('var Xa=','const Fa=0'),item=section('const ze={','const or='),tooltip=section('const QJe=','const Kse=');
const mobx=idx.slice(idx.indexOf('function _(e)'),idx.indexOf('class xt{'));
const closures=ui.slice(ui.indexOf('const Ot=['),ui.indexOf('const yt=100',ui.indexOf('const Ot=[')));
if(!closures.includes('function Z0()')||!mobx)throw Error('Native C/V/MobX extraction');
const scaffold=`const _=(key,values)=>key+(values?' '+Object.entries(values).map(([k,v])=>k+'='+v).join(' '):'');const xt={features:{},data:{ancientSets:{}}},lm=(g,n)=>No.getItem(g,n)?.ItemName,gS=(g,n,l,name)=>name+' +'+l,rs=()=>undefined,NO=()=>undefined,zO=()=>null;`;
const output=`// Audited public Kanturu client 2026-10-22. Extracted formulas/catalog/properties/tooltips/C-V.
// Translations, skill names and Ancient configuration are scaffolding; no client boot.
// MobX MIT: see artifacts/client-recheck/MOBX-LICENSE.txt.
(function(root){function nativeFixture(){${enums}${block('class re{')}${cat}
const No={getItem:(g,n)=>mae.find(i=>i.Group===g&&i.Index===n)};
${formulas}${scaffold}${item}${tooltip}
return {calculate:U5t,slots:re,itemStats:Gg,tooltip:MNt,name:mk,hasItem:i=>!!No.getItem(i.group,i.num),catalogue:mae,compatible:true,wizardrySlot:0};}
function mobxFixture(){${mobx}\nreturn {observable:b,reaction:ys,action:j};}
function installNativeClosures(l,mobx){const $=mobx.action,disposers=[],Ut=(...args)=>{const d=mobx.reaction(...args);disposers.push(d);return d;};
const Q=mobx.observable({partyWindowEnabled:false,guildWindowEnabled:false}),Le=mobx.observable({windowEnabled:false,toggleWindow(){this.windowEnabled=!this.windowEnabled}}),Wt=mobx.observable({windowOpen:false,closeWindow(){this.windowOpen=false}}),st=mobx.observable({open:false}),Ft=mobx.observable({windowOpen:false});
${closures}Z0();return {dispose:()=>disposers.forEach(fn=>fn()),social:Q};}
const result={nativeFixture,mobxFixture,installNativeClosures};if(typeof module==='object')module.exports=result;else root.__OCT21_CHARACTER_FIXTURE__=result;})(globalThis);`;
fs.writeFileSync('demos/helper/character-kanturu-audited.js',output);
const download=JSON.parse(fs.readFileSync(dir+'download.json'));
const files=['root.html','entry.js','layout.js','boot.js','ui.js','packets.js'];
fs.writeFileSync(dir+'audit.json',JSON.stringify({...download,exports:mappedExports,ui:'/assets/index-CSWR8x1U.js',packets:'/assets/packets-BVlj3W9O.js',hashes:Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(dir+f)).digest('hex')])),limitations:'Static public audit and extracted fixtures only; no real account or server commands.'},null,2));
