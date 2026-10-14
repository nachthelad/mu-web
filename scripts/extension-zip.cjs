'use strict';
const {deflateRawSync}=require('node:zlib'),{createHash}=require('node:crypto');
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
// Standard UTF-8 ZIP; fixed dates make the archive reproducible.
function zip(files){
 const parts=[],directory=[];let offset=0;
 for(const name of Object.keys(files).sort()){
  if(!/^[\w./-]+$/.test(name)||name.includes('..')||name.startsWith('/'))throw Error('Ruta ZIP inválida');
  const filename=Buffer.from(name),data=Buffer.from(files[name]),compressed=deflateRawSync(data),crc=crc32(data);
  const local=Buffer.alloc(30);local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(8,8);local.writeUInt16LE(33,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(data.length,22);local.writeUInt16LE(filename.length,26);
  parts.push(local,filename,compressed);
  const central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(8,10);central.writeUInt16LE(33,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(data.length,24);central.writeUInt16LE(filename.length,28);central.writeUInt32LE(offset,42);
  directory.push(central,filename);offset+=local.length+filename.length+compressed.length;
 }
 const central=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(Object.keys(files).length,8);end.writeUInt16LE(Object.keys(files).length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...parts,central,end]);
}
function build(files,version){
 const instructions=`MU · Extensión local ${version}\n\nRequiere Chrome 120 o posterior.\n1. Descomprimí este ZIP en una carpeta fija.\n2. Desactivá los seis userscripts MU de Tampermonkey, si los tenés.\n3. Abrí chrome://extensions y activá Modo desarrollador.\n4. Elegí Cargar descomprimida y seleccioná la carpeta chrome-extension incluida.\n5. Recargá el juego. Conservá la carpeta mientras uses la extensión.\n6. Clic en el icono MU abre el Centro de control en otra pestaña.\n7. Elegí la pestaña del juego, pulsá Conectar y configurá desde el panel.\n\nCerrar el panel no pausa Play. El juego debe permanecer abierto.\nDespués de una recarga o cambio de cuenta, reconectá explícitamente.\nNo necesita servidor localhost. Minimapa en el juego es opcional.\n\nSolo actúa en https://mu.mormon.garden/*.\nNo hace falta instalar Node, npm ni Tampermonkey para usarla.\n\nActualizar: reemplazá los archivos de chrome-extension con el nuevo paquete,\nrecargá la extensión desde chrome://extensions y después el juego.\nVolver a Tampermonkey: desactivá la extensión, reactivá un script por módulo\ny recargá el juego. No uses ambos formatos simultáneamente.\n\nLos ajustes e historiales se guardan en localStorage del juego.\nEl ZIP contiene código e instrucciones; no contiene datos personales ni sesiones.\nProbado con fixtures locales en Chromium separado. Partida real pendiente.\n`;
 const entries={'INSTALAR.txt':Buffer.from(instructions),...Object.fromEntries(Object.entries(files).map(([name,bytes])=>['chrome-extension/'+name,bytes]))};
 const bytes=zip(entries),name=`mu-web-chrome-${version}.zip`,sha256=createHash('sha256').update(bytes).digest('hex');
 return {name,bytes,checksum:Buffer.from(`${sha256}  ${name}\n`),sha256};
}
module.exports={build,zip,crc32};
