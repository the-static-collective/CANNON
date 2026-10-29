#!/usr/bin/env node
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
// All actual build/verify imports run in one fresh process, including Python's
// isolated bytecode cache. Replays never reuse a previous Node module cache.
const [command,...args]=process.argv.slice(2);
let sandbox;
try{
 if(!['build','verify'].includes(command)||args.length%2)throw Error('USAGE: build|verify --roots roots.json --out DIRECTORY [--authorize LOCAL_FICTIONAL_ONLY]');
 const opts={};for(let i=0;i<args.length;i+=2){const k=args[i];if(!['--roots','--out','--authorize'].includes(k)||Object.hasOwn(opts,k)||!args[i+1])throw Error('INVALID_OR_DUPLICATE_FLAG');opts[k]=args[i+1]}
 if(!opts['--roots']||!opts['--out'])throw Error('ROOTS_AND_OUTPUT_REQUIRED');
 if(command==='build'&&opts['--authorize']!=='LOCAL_FICTIONAL_ONLY')throw Error('HOLD_EXPLICIT_LOCAL_FICTIONAL_AUTHORIZATION_REQUIRED');
 if(command==='verify'&&opts['--authorize'])throw Error('VERIFY_NEEDS_NO_NEW_AUTHORIZATION');
 if(process.env.CONSTELLATION_CHILD!=='1'){
  sandbox=mkdtempSync(join(tmpdir(),'constellation-python-'));
  const stdout=execFileSync(process.execPath,[resolve(process.argv[1]),command,...args],{encoding:'utf8',maxBuffer:4*1024*1024,timeout:120000,env:{...process.env,CONSTELLATION_CHILD:'1',GIT_NO_REPLACE_OBJECTS:'1',PYTHONPYCACHEPREFIX:sandbox,PYTHONNOUSERSITE:'1',PYTHONPATH:''},stdio:['ignore','pipe','pipe']});
  const result=JSON.parse(stdout);
  if(command==='verify'){result.status='FRESH_PROCESS_COLD_REPLAY_VERIFIED';result.independentHumanVerified=false}
  console.log(JSON.stringify(result,null,2));
 }else{
  const {buildPacket,verifyPacket}=await import('../src/constellation/packet.mjs');
  const roots=Object.fromEntries(Object.entries(JSON.parse(readFileSync(resolve(opts['--roots']),'utf8'))).map(([k,v])=>[k,resolve(v)]));
  const r=await (command==='build'?buildPacket(roots,resolve(opts['--out'])):verifyPacket(roots,resolve(opts['--out'])));
  console.log(JSON.stringify(command==='build'?{status:r.status,receiptId:r.receiptId,sourceRepositories:r.sourceRepositories,fieldVerified:false}:r,null,2));
 }
}catch(error){console.error('HOLD / REFUSE:',String(error.stderr||error.message).slice(0,1600));process.exitCode=2}
finally{if(sandbox)rmSync(sandbox,{recursive:true,force:true})}
