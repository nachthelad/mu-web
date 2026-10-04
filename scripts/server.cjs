const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const aliases={'/':'/demos/hub/preview.html','/preview.html':'/demos/radar/preview.html','/helper-preview.html':'/demos/helper/preview.html','/hub-preview.html':'/demos/hub/preview.html'};
const server=http.createServer((req,res)=>{
 try{
  const url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(aliases[url]){res.writeHead(302,{Location:aliases[url]});res.end();return;}
  if(!/^\/(demos|src|dist)\//.test(url)){res.writeHead(404);res.end();return;}
  const file=path.resolve(root,'.'+url),relative=path.relative(root,file);
  if(relative.startsWith('..')||path.isAbsolute(relative)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':'application/javascript; charset=utf-8');
  fs.createReadStream(file).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(400);res.end();}
});
server.listen(4173,'127.0.0.1',()=>console.log('Demo: http://127.0.0.1:4173/'));
