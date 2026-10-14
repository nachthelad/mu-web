// Reproducible static extraction. No game engine, network, account or commands.
const fs=require('node:fs'),crypto=require('node:crypto');
const s=fs.readFileSync('artifacts/stats-research/layout.js','utf8'),idx=fs.readFileSync('artifacts/stats-research/index.js','utf8');
if(crypto.createHash('sha256').update(s).digest('hex')!=='d72dc219facdaf835443e76c28fb385ee8d4d3f3d52844d71e76d934ccdef325')throw Error('Unaudited layout');
if(crypto.createHash('sha256').update(idx).digest('hex')!=='c19e11a0381d7608813970b1062e9575bdb7f5860878588d8b839bdb90ac95fe')throw Error('Unaudited entry');
const extract=name=>{const start=s.indexOf('function '+name+'(');if(start<0)throw Error(name);let i=s.indexOf('{',start),depth=1;for(i++;depth;i++){if(s[i]==='{')depth++;if(s[i]==='}')depth--;}return s.slice(start,i);};
const objects=[10,11].map(num=>{const start=s.indexOf('{Group:5,Index:'+num+',');return s.slice(start,s.indexOf('}',start)+1);});
let native=s.slice(s.indexOf('function ro('),s.indexOf('const _a=0',s.indexOf('function ro(')));
native=native.replace(/const E3e=.*?;function RLt.*?const A3e=.*?;function ELt.*?function uE/s,'function uE');
const enumStart=s.indexOf('var Z='),enumEnd=s.indexOf('Z||{})',enumStart)+6;
const slotStart=s.indexOf('class ce{');let slotEnd=s.indexOf('{',slotStart)+1,slotDepth=1;for(;slotDepth;slotEnd++){if(s[slotEnd]==='{')slotDepth++;if(s[slotEnd]==='}')slotDepth--;}
const slots=s.slice(slotStart,slotEnd);
if(!slots.includes('static RightHandSlot=1'))throw Error('Slot class changed');
const prelude=`const catalogue=[${objects.join(',')}];const Ao={getItem:(group,num)=>catalogue.find(item=>item.Group===group&&item.Index===num)};${slots}${s.slice(enumStart,enumEnd)};`;
const tooltip=[extract('az'),extract('bae'),extract('wae'),extract('w9e')].join('\n');
const source=`// MobX portion: Copyright (c) 2015 Michel Weststrate, MIT; see MOBX-LICENSE.txt.
// Extracted public client fixture. Layout SHA256 d72dc219facdaf835443e76c28fb385ee8d4d3f3d52844d71e76d934ccdef325.
// Formulas, slots and class numbers are unmodified. Catalog lookup is fixture scaffolding.
(function(root){
function nativeFixture(){${prelude}
${native}
const Oe={Mace:2,Staff:5,Helper:13};const Yo=(e,t)=>Math.trunc(e/t);${tooltip}
return {calculate:ALt,hasItem:item=>!!Ao.getItem(item.group,item.num),name:item=>Ao.getItem(item.group,item.num)?.ItemName,itemStats:item=>{const c=Ao.getItem(item.group,item.num);if(!c)return null;return {magicPower:w9e({group:c.Group,index:c.Index,level:c.ItemLvl,magicPower:c.MagicPwr},item.lvl??0,item.isExcellent===true,item.isAncient===true)};},catalogue,slots:ce};}
function mobxFixture(){${idx.slice(idx.indexOf('function v('),idx.indexOf('class xt{'))}
return {observable:b,reaction:ys,action:j};}
const result={nativeFixture,mobxFixture};if(typeof module==='object')module.exports=result;else root.__CHARACTER_CLIENT_FIXTURE__=result;
})(globalThis);
`;
fs.writeFileSync('demos/helper/character-client-audited.js',source);
fs.writeFileSync('tests/fixtures/character-client-audited.cjs',"module.exports=require('../../demos/helper/character-client-audited.js');\n");

