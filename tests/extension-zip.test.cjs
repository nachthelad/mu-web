const {test}=require('node:test'),assert=require('node:assert/strict'),{inflateRawSync}=require('node:zlib');
const {build,crc32,zip}=require('../scripts/extension-zip.cjs');
test('ZIP contains exact extension bytes and instructions with reproducible checksums',()=>{
 const files={'manifest.json':Buffer.from('{"manifest_version":3}'),'helper.user.js':Buffer.from('const value="á";')},a=build(files,'1.0.0'),b=build(files,'1.0.0');
 assert.deepEqual(a.bytes,b.bytes);assert.equal(a.name,'mu-web-chrome-1.0.0.zip');assert.match(a.checksum.toString(),new RegExp('^'+a.sha256));
 const entries={};let offset=0;
 while(a.bytes.readUInt32LE(offset)===0x04034b50){const length=a.bytes.readUInt16LE(offset+26),compressed=a.bytes.readUInt32LE(offset+18),start=offset+30+length,name=a.bytes.subarray(offset+30,start).toString();entries[name]=inflateRawSync(a.bytes.subarray(start,start+compressed));assert.equal(crc32(entries[name]),a.bytes.readUInt32LE(offset+14));offset=start+compressed;}
 assert.deepEqual(entries['chrome-extension/manifest.json'],files['manifest.json']);assert.deepEqual(entries['chrome-extension/helper.user.js'],files['helper.user.js']);assert.match(entries['INSTALAR.txt'].toString(),/Desactivá los seis userscripts/);assert.equal(Object.keys(entries).length,3);
 assert.equal(a.bytes.readUInt32LE(offset),0x02014b50);assert.equal(a.bytes.readUInt32LE(a.bytes.length-22),0x06054b50);
 assert.equal(crc32(Buffer.from('123456789')),0xcbf43926);assert.throws(()=>zip({'../escape':Buffer.from('')}),/Ruta/);
});
