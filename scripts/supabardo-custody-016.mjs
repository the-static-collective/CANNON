#!/usr/bin/env node
/** Execute ORIGINAL TranchNode artifact-store methods, not a substitute.
 * seal reads fixed original public evidence; restore reads only native CAS.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {FILENAMES,manifestValid,SB,TRANCH} from '../src/supabardo-death-016.mjs';
try{
 const [mode,sourceRepo,storeDir,argument]=process.argv.slice(2);
 if(!['seal','restore'].includes(mode)||!sourceRepo||!storeDir||!argument)throw Error('USAGE seal|restore sourceRoot storeRoot fixtureDir|manifest.json');
 const m=await import(pathToFileURL(join(resolve(sourceRepo),'src/artifact-store.ts')).href);
 const r=resolve(storeDir);mkdirSync(r,{recursive:true,mode:0o700});
 const store=new m.FilesystemArtifactStore(r);
 if(mode==='seal'){
  const entries=[];
  for(const name of FILENAMES){
   const data=readFileSync(join(resolve(argument),name));
   const one=await store.put(data);
   const two=await store.put(data);
   if(!one.created||two.created||one.address!==two.address||one.byteLength!==data.length||
     !(await store.get(one.address)).equals(data))throw Error('NATIVE_IMMUTABLE_IDEMPOTENCY_REFUSED');
   entries.push({name,address:one.address,byteLength:data.length});
  }
  console.log(JSON.stringify({schema:'cannon.supabardo-stored-fixtures/v0',source_commit:SB,store_commit:TRANCH,
   private_data_included:false,entries}));
 }else{
  const manifest=manifestValid(JSON.parse(readFileSync(resolve(argument),'utf8')));
  const target=join(dirname(r),'recovered','fixtures');mkdirSync(target,{recursive:true,mode:0o700});
  for(const entry of manifest.entries){
   const data=await store.get(entry.address);
   if(data.length!==entry.byteLength||m.artifactAddress(data)!==entry.address)
    throw Error('NATIVE_CAS_MATERIAL_DOES_NOT_MATCH_SOURCE');
   const file=join(target,entry.name);
   writeFileSync(file,data,{mode:0o600});
   if(!readFileSync(file).equals(data))throw Error('RECOVERED_BYTES_CHANGED');
  }
  console.log(JSON.stringify({schema:'cannon.native-tranchnode-restoration/v0',
   verified_entries:manifest.entries.length,private_data_included:false}));
 }
}catch(e){console.error('HOLD:',String(e.message).slice(0,300));process.exitCode=2}
