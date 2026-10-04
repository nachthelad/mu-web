const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
for(const folder of ['src','demos','scripts']){
 for(const file of fs.readdirSync(path.join(root,folder),{recursive:true}).filter(f=>/\.(?:js|cjs)$/.test(f)))execFileSync(process.execPath,['--check',path.join(root,folder,file)],{stdio:'inherit'});
}
console.log('Sintaxis OK.');
