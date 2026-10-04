const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),{spawn}=require('node:child_process');
test('local demos resolve every script and reject paths outside public folders',async()=>{
 const child=spawn(process.execPath,[path.resolve(__dirname,'../scripts/server.cjs')],{stdio:['ignore','pipe','pipe']});
 let stderr='';child.stderr.on('data',chunk=>stderr+=chunk);
 try{
  await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('exit',code=>reject(Error('Server exited '+code+': '+stderr)));child.once('error',reject);});
  for(const route of ['/','/preview.html','/helper-preview.html','/hub-preview.html']){
   const response=await fetch('http://127.0.0.1:4173'+route);assert.equal(response.status,200);
   const html=await response.text();for(const match of html.matchAll(/<script src="([^"]+)"/g)){const script=await fetch(new URL(match[1],response.url));assert.equal(script.status,200,match[1]);assert.match(script.headers.get('content-type'),/javascript/);}
  }
  assert.equal((await fetch('http://127.0.0.1:4173/README.md')).status,404);
  assert.equal((await fetch('http://127.0.0.1:4173/dist/manifest.json')).status,200);
 }finally{child.kill();await new Promise(resolve=>child.exitCode!==null?resolve():child.once('exit',resolve));}
});
