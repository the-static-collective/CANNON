#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {prepare,run,verify} from '../src/tranchnode-dual-015.mjs';
try{
 const [mode,rootsPath,inputPath,out]=process.argv.slice(2);
 if(!['inspect','run','verify'].includes(mode)||!rootsPath||!inputPath||(mode!=='inspect'&&!out))
  throw Error('USAGE inspect|run|verify roots.json owner-local-export.json [new-output-dir]');
 const roots=JSON.parse(readFileSync(resolve(rootsPath),'utf8'));
 const result=mode==='inspect'?await prepare(roots,readFileSync(resolve(inputPath))):
  mode==='run'?await run(roots,resolve(inputPath),resolve(out)):
   await verify(roots,resolve(inputPath),resolve(out));
 if(mode==='inspect'){
  // No private JSON or content digest written to stdout from a private inspection.
  console.log(JSON.stringify({status:'PRIVATE_EXPORT_SOURCE_AND_SHAPE_REVIEWED',
   privacy:result.imported_visibility,local_review_only:true,public_release_authorized:false},null,2));
 }else console.log(JSON.stringify(result,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,380));process.exitCode=2}
