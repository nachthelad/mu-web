// Static extraction from public assets. Never starts the game or uses an account.
const fs=require('node:fs'),crypto=require('node:crypto');
const s=fs.readFileSync('artifacts/stats-research/current-layout.js','utf8'),idx=fs.readFileSync('artifacts/stats-research/current-entry.js','utf8');
const hashes=JSON.parse(fs.readFileSync('artifacts/stats-research/current-audit.json','utf8'));
for(const [key,source] of [['layout',s],['entry',idx]])if(crypto.createHash('sha256').update(source).digest('hex')!==hashes[key])throw Error('Unaudited '+key);
const block=term=>{const start=s.indexOf(term);if(start<0)throw Error(term);let p=s.indexOf('{',start),depth=1;for(p++;depth;p++){if(s[p]==='{')depth++;if(s[p]==='}')depth--;}return s.slice(start,p);};
const enumStart=s.indexOf('var Z='),catalogStart=s.indexOf('const bte=');
const enumCode=s.slice(enumStart,s.indexOf('Z||{})',enumStart)+6),catalog=s.slice(catalogStart,s.indexOf(']',catalogStart)+1)+';';
const native=s.slice(s.indexOf('function IE('),s.indexOf('const xa=0',s.indexOf('function IE(')));
const item='const g9e='+s.slice(s.indexOf('g9e=[')+4,s.indexOf('const Qo=',s.indexOf('function rh(')));
const tooltip=s.slice(s.indexOf('const z$e='),s.indexOf('const Joe=',s.indexOf('const z$e=')));
const scaffolding=`const Oe={Sword:0,Axe:1,Mace:2,Spear:3,Bow:4,Staff:5,Shield:6,Helm:7,Armor:8,Pants:9,Gloves:10,Boots:11,Wing:12,Helper:13,Potion:14,Etc:15};
const T=(key,values)=>key+(values?' '+Object.entries(values).map(([k,v])=>k+'='+v).join(' '):'');
const Ft={features:{},data:{ancientSets:{}}},Wd=(g,n)=>_o.getItem(g,n)?.ItemName,UE=(g,n,l,name)=>name+' +'+l,Rz=()=>undefined,bz=()=>null,Mi=()=>null;`;
fs.writeFileSync('demos/helper/character-current-audited.js',`// Public build 2026-10-12. Native formulas and tooltip unchanged; translation/catalog are fixture scaffolding.
// MobX: Copyright (c) 2015 Michel Weststrate, MIT; see MOBX-LICENSE.txt.
(function(root){function nativeFixture(){${enumCode};${block('class se{')};${block('function uo(')};${catalog}
const _o={getItem:(group,num)=>bte.find(item=>item.Group===group&&item.Index===num)};${native}
${scaffolding}
${item}
${tooltip}
return {calculate:W_t,slots:se,hasItem:item=>!!_o.getItem(item.group,item.num),name:item=>Xoe(item),itemStats:yg,tooltip:sPt,catalogue:bte};}
function mobxFixture(){${idx.slice(idx.indexOf('function v('),idx.indexOf('class xt{'))}
return {observable:b,reaction:ys,action:j};}
const result={nativeFixture,mobxFixture};if(typeof module==='object')module.exports=result;else root.__CURRENT_CHARACTER_FIXTURE__=result;})(globalThis);`);
