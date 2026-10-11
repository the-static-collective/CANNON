#!/usr/bin/env node
/* Runs original TranchNode source through its own pinned tsx dependency.
   Writes only to an explicitly supplied sandbox directory. */
import {readFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
try{
 const [operation,checkout,storeDirectory,material]=process.argv.slice(2);
 if(!['put','verify'].includes(operation)||!checkout||!storeDirectory||!material)
  throw Error('USAGE: put|verify tranchnode-checkout store-directory material-file');
 const original=await import(pathToFileURL(join(resolve(checkout),'src/artifact-store.ts')).href);
 const bytes=readFileSync(resolve(material));
 const storePath=resolve(storeDirectory);
 mkdirSync(storePath,{recursive:true});
 const store=new original.FilesystemArtifactStore(storePath);
 const address=original.artifactAddress(bytes);
 let created=false;
 if(operation==='put'){
  const result=await store.put(bytes);
  created=result.created;
  if(result.address!==address||result.byteLength!==bytes.length)throw Error('TRANCH_PUT_IDENTITY_MISMATCH');
 }
 const returned=await store.get(address);
 if(!returned.equals(bytes))throw Error('TRANCH_READ_DID_NOT_VERIFY_SOURCE_BYTES');
 console.log(JSON.stringify({schema:'cannon.tranchnode-native-artifact-witness/v0',
  address,created,verified_byte_length:returned.length,backend:'real-tranchnode-filesystem-artifact-store',
  sandbox_only:true}));
}catch(e){console.error('HOLD:',String(e.message).slice(0,240));process.exitCode=2}
