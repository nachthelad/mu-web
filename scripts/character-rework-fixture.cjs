// Extract the current public client's calculation verbatim, without booting it.
const fs=require('node:fs'),crypto=require('node:crypto');
const file='artifacts/stats-research/rework-layout.js',s=fs.readFileSync(file,'utf8');
const block=term=>{const start=s.indexOf(term);if(start<0)throw Error(term);let p=s.indexOf('{',start),depth=1;for(p++;depth;p++){if(s[p]==='{')depth++;if(s[p]==='}')depth--;}return s.slice(start,p);};
const en=s.indexOf('var Z='),cat=s.indexOf('const Ene=');
const enumCode=s.slice(en,s.indexOf('Z||{})',en)+6),catalog=s.slice(cat,s.indexOf(']',cat)+1)+';';
const formulas=s.slice(s.indexOf('function UE('),s.indexOf('const za=0',s.indexOf('function UE(')));
const audit={date:'2026-10-14',entry:'/assets/index-C399rQbj.js',module:'/assets/layout-68bM4dWi.js',exports:{calculate:'FPt as b1',catalog:'Co as bU',slots:'se as aL',itemStats:'_g as np'},hashes:{}};
for(const [key,value]of Object.entries(audit.exports))if(!s.slice(s.lastIndexOf('export{')).includes(value))throw Error('export '+key);
for(const name of ['layout','index','boot','window'])audit.hashes[name]=crypto.createHash('sha256').update(fs.readFileSync('artifacts/stats-research/rework-'+name+'.js')).digest('hex');
fs.writeFileSync('artifacts/stats-research/rework-audit.json',JSON.stringify(audit,null,2));
fs.writeFileSync('demos/helper/character-rework-audited.js',`// Public build 2026-10-14. Exact calculation and catalog; no game session.
(function(root){function nativeFixture(){${enumCode};${block('class se{')};${block('function po(')};${catalog}
const Co={getItem:(group,num)=>Ene.find(item=>item.Group===group&&item.Index===num)};${formulas}
return {calculate:FPt,slots:se,hasItem:item=>!!Co.getItem(item.group,item.num),name:item=>Co.getItem(item.group,item.num)?.ItemName,catalogue:Ene,compatible:true};}
const result={nativeFixture};if(typeof module==='object')module.exports=result;else root.__REWORK_CHARACTER_FIXTURE__=result;})(globalThis);`);
