const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const modules={radar:'golden-radar.user.js',helper:'level-helper.user.js',hub:'hub.user.js'};
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
function manager(root=ROOT){
 root=fs.realpathSync(root);
 function file(p){const full=path.resolve(root,p),rel=path.relative(root,full);if(!rel||rel.startsWith('..')||path.isAbsolute(rel))throw Error('Ruta fuera del proyecto');let cursor=full;while(cursor!==root){if(fs.existsSync(cursor)&&fs.lstatSync(cursor).isSymbolicLink())throw Error('No se permiten enlaces en rutas de release');cursor=path.dirname(cursor);}return full;}
 function json(p){return JSON.parse(fs.readFileSync(file(p),'utf8'));}
 function write(p,data){fs.mkdirSync(path.dirname(file(p)),{recursive:true});fs.writeFileSync(file(p),data);}
 function remove(p){fs.rmSync(file(p),{recursive:true,force:true});}
 function version(data){const v=data.toString().match(/@version\s+(\S+)/)?.[1];if(!v||!/^\d+(?:\.\d+){2,3}$/.test(v))throw Error('Versión inválida');return v;}
 function syntax(data){execFileSync(process.execPath,['--check'],{input:data,stdio:['pipe','pipe','pipe']});}
 function verify(manifest,base='releases'){
  if(manifest.contract!==1)throw Error('Contrato desconocido');
  const result={};for(const [id,name] of Object.entries(modules)){
   const item=manifest.modules[id];if(!item||!/^\d+(?:\.\d+){2,3}$/.test(item.version)||item.file!==name)throw Error('Manifiesto inválido');
   const data=fs.readFileSync(file(base==='dist'?`dist/${name}`:`releases/${id}/${item.version}/${name}`));
   if(hash(data)!==item.sha256||version(data)!==item.version)throw Error(`Hash/versión incorrectos: ${id}`);syntax(data);result[id]=data;
  }return result;
 }
 function locked(action){
  fs.mkdirSync(file('releases'),{recursive:true});const lock=file('releases/.lock');let fd;
  try{fd=fs.openSync(lock,'wx');}catch{throw Error('Hay otra operación de release o un lock pendiente en releases/.lock.');}
  try{
   if(fs.existsSync(file('.release-backup'))||fs.existsSync(file('.release-stage')))throw Error('Hay una promoción interrumpida. Conservá .release-backup/.release-stage y recuperá dist antes de continuar.');
   return action();
  }finally{fs.closeSync(fd);fs.unlinkSync(lock);}
 }
 function archive(id,data){
  const v=version(data),folder=`releases/${id}/${v}`,target=`${folder}/${modules[id]}`;
  if(fs.existsSync(file(target))&&hash(fs.readFileSync(file(target)))!==hash(data))throw Error(`La versión ${id} ${v} ya existe con otro contenido; incrementá @version.`);
  write(target,data);if(!fs.existsSync(file(`${folder}/metadata.json`)))write(`${folder}/metadata.json`,JSON.stringify({version:v,sha256:hash(data),createdAt:new Date().toISOString()},null,2)+'\n');
 }
 function promote(manifest,data){
  let backed=false,promoted=false;
  try{
   for(const [id,name] of Object.entries(modules))write(`.release-stage/${name}`,data[id]);
   write('.release-stage/manifest.json',JSON.stringify(manifest,null,2)+'\n');
   if(fs.existsSync(file('dist'))){fs.renameSync(file('dist'),file('.release-backup'));backed=true;}
   fs.renameSync(file('.release-stage'),file('dist'));
   promoted=true;
   verify(manifest,'dist');
  }catch(error){if(backed){remove('dist');fs.renameSync(file('.release-backup'),file('dist'));}else if(promoted)remove('dist');remove('.release-stage');throw error;}
  if(backed)remove('.release-backup');
 }
 function prune(current){
  const setsDir='releases/sets';const sets=fs.readdirSync(file(setsDir)).filter(n=>n.endsWith('.json')).map(n=>({name:n,manifest:json(`${setsDir}/${n}`)})).sort((a,b)=>b.manifest.createdAt.localeCompare(a.manifest.createdAt));
  const keep=sets.filter(s=>s.manifest.id!==current.id).slice(0,3);keep.push({name:current.id+'.json',manifest:current});
  const protectedVersions={};for(const id of Object.keys(modules))protectedVersions[id]=new Set(keep.map(s=>s.manifest.modules[id].version));
  for(const id of Object.keys(modules)){
   const folders=fs.readdirSync(file(`releases/${id}`),{withFileTypes:true}).filter(d=>d.isDirectory()&&/^\d+(?:\.\d+){2,3}$/.test(d.name)).map(d=>d.name).sort((a,b)=>b.localeCompare(a,undefined,{numeric:true}));
   const previous=folders.filter(v=>v!==current.modules[id].version).slice(0,3);for(const v of previous)protectedVersions[id].add(v);
   for(const v of folders)if(!protectedVersions[id].has(v))remove(`releases/${id}/${v}`);
  }
  const keptSets=new Set(keep.map(s=>s.name));for(const s of sets)if(!keptSets.has(s.name))remove(`${setsDir}/${s.name}`);
 }
 function publish({module:chosen,validate}={}){return locked(()=>{
  if(chosen&&!modules[chosen])throw Error('Módulo inválido: radar, helper o hub');
  const previous=fs.existsSync(file('dist/manifest.json'))?json('dist/manifest.json'):null;
  if(chosen&&!previous)throw Error('La primera publicación debe incluir todos los módulos.');
  const data={};for(const id of Object.keys(modules))data[id]=fs.readFileSync(file(`src/${id}/${modules[id]}`));
  if(previous){verify(previous,'dist');for(const id of Object.keys(modules))if(chosen&&id!==chosen&&hash(data[id])!==previous.modules[id].sha256)throw Error(`También cambió ${id}. Publicá todos los módulos o resolvé ese cambio primero.`);}
  for(const id of Object.keys(modules)){version(data[id]);syntax(data[id]);const target=`releases/${id}/${version(data[id])}/${modules[id]}`;if(fs.existsSync(file(target))&&hash(fs.readFileSync(file(target)))!==hash(data[id]))throw Error(`Incrementá @version de ${id}: esa versión ya fue archivada.`);}
  if(validate)validate();else{
   for(const script of ['scripts/check.cjs'])execFileSync(process.execPath,[file(script)],{cwd:root,stdio:'inherit'});
   const tests=fs.readdirSync(file('tests')).filter(n=>n.endsWith('.test.cjs')).map(n=>file('tests/'+n));
   execFileSync(process.execPath,['--test',...tests],{cwd:root,stdio:'inherit'});
   execFileSync(process.execPath,[file('scripts/test-ui.cjs')],{cwd:root,stdio:'inherit'});
  }
  for(const id of Object.keys(modules))if(hash(fs.readFileSync(file(`src/${id}/${modules[id]}`)))!==hash(data[id]))throw Error('Las fuentes cambiaron durante la validación; volvé a ejecutar release.');
  if(previous&&Object.keys(modules).every(id=>hash(data[id])===previous.modules[id].sha256)){console.log('Sin cambios: se conserva el conjunto vigente.');return previous;}
  for(const id of Object.keys(modules))archive(id,data[id]);
  const createdAt=new Date().toISOString(),id=createdAt.replace(/[:.]/g,'-')+'-'+crypto.randomBytes(3).toString('hex');
  const manifest={id,createdAt,contract:1,validation:['syntax','logic','browser-ui'],limitations:['Simulación local; partida real no verificada.'],modules:{}};
  for(const id of Object.keys(modules))manifest.modules[id]={version:version(data[id]),file:modules[id],sha256:hash(data[id])};
  write(`releases/sets/${id}.json`,JSON.stringify(manifest,null,2)+'\n');
  try{promote(manifest,data);}catch(error){remove(`releases/sets/${id}.json`);throw error;}
  prune(manifest);console.log('Publicado localmente: '+id);return manifest;
 });}
 function rollback(id){return locked(()=>{
  if(!/^[a-zA-Z0-9_-]+$/.test(id))throw Error('ID inválido');const manifest=json(`releases/sets/${id}.json`),data=verify(manifest);promote(manifest,data);console.log('Restaurado dist: '+id+'. Las fuentes src no se modificaron.');return manifest;
 });}
 return {publish,rollback,verify};
}
module.exports={manager,publish:options=>manager().publish(options),rollback:id=>manager().rollback(id)};
