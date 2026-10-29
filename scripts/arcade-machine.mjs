#!/usr/bin/env node
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {loadConfig,checkPackages} from '../src/arcade/sources.mjs';
function options(argv){
 const [command,...tail]=argv;if(!['acquire','build','verify','challenge','serve'].includes(command)||tail.length%2)throw Error('USAGE: acquire|build|verify|challenge|serve --config PATH --out PATH');
 const opts={};for(let i=0;i<tail.length;i+=2){const k=tail[i];if(!['--config','--out','--request','--authorize','--into','--sessions','--port'].includes(k)||Object.hasOwn(opts,k)||!tail[i+1])throw Error('UNKNOWN_OR_DUPLICATE_FLAG');opts[k]=tail[i+1]}
 if(command==='acquire'){if(Object.keys(opts).join()!=='--into')throw Error('ACQUIRE_REQUIRES_NEW_INTO_DIRECTORY');return {command,opts}}
 if(!opts['--config']||!opts['--out'])throw Error('CONFIG_AND_OUTPUT_REQUIRED');
 if(['build','challenge'].includes(command)&&opts['--authorize']!=='LOCAL_FICTIONAL_ONLY')throw Error('HOLD_EXPLICIT_LOCAL_FICTIONAL_AUTHORIZATION_REQUIRED');
 if(command==='challenge'&&!opts['--request'])throw Error('CHALLENGE_REQUEST_REQUIRED');
 if(command==='verify'&&(opts['--authorize']||opts['--request']||opts['--sessions']))throw Error('VERIFY_TAKES_NO_NEW_GRANT_OR_REQUEST');
 return {command,opts};
}
let sandbox;
try{
 const {command,opts}=options(process.argv.slice(2));
 if(command==='acquire'){
  const {acquireMachine}=await import('../src/arcade/acquire.mjs');console.log(JSON.stringify(await acquireMachine(resolve(opts['--into'])),null,2));
 }else{
  const config=loadConfig(resolve(opts['--config']));checkPackages(config);
  if(command==='serve'){
   if(!opts['--sessions'])throw Error('NEW_OR_EXISTING_LOCAL_SESSIONS_DIRECTORY_REQUIRED');
   const {serveMachine}=await import('../src/arcade/server.mjs');
   const server=await serveMachine({configPath:resolve(opts['--config']),packetPath:resolve(opts['--out']),sessionsPath:resolve(opts['--sessions']),port:opts['--port']?Number(opts['--port']):7792});
   console.log(JSON.stringify({status:'LOCAL_NATIVE_MACHINE_READY',url:'http://127.0.0.1:'+server.port+'/first-boot.html',authority:'LOCAL_FICTIONAL_SOFTWARE_ONLY',externalDispatch:false}));
  }else if(process.env.ARCADE_NATIVE_CHILD!=='1'){
   sandbox=mkdtempSync(join(tmpdir(),'arcade-worker-'));
   const loader=join(resolve(config.toolchain),'node_modules/tsx/dist/loader.mjs');
   const env={...process.env,ARCADE_NATIVE_CHILD:'1',GIT_NO_REPLACE_OBJECTS:'1',PYTHONPYCACHEPREFIX:sandbox,PYTHONNOUSERSITE:'1',PYTHONPATH:'',TSX_DISABLE_CACHE:'1'};
   // Never inherit a prior worker's TS/module cache or permit runtime installs.
   const result=JSON.parse(execFileSync(process.execPath,['--import',loader,resolve(process.argv[1]),...process.argv.slice(2)],{env,encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe']}));
   if(command==='verify')result.status='FRESH_PROCESS_NATIVE_COLD_REPLAY_VERIFIED';
   console.log(JSON.stringify(result,null,2));
  }else{
   const {composeMachine,composeChallenge,writeFiles,verifyOutput,sceneSummary}=await import('../src/arcade/packet.mjs');
   if(command==='verify')console.log(JSON.stringify(await verifyOutput(config,resolve(opts['--out'])),null,2));
   else{
    const result=command==='build'?await composeMachine(config):await composeChallenge(config,JSON.parse(readFileSync(resolve(opts['--request']))));
    writeFiles(config,resolve(opts['--out']),result.files);
    console.log(JSON.stringify({status:result.scene?.status??result.receipt.status,receiptId:result.receipt.receiptId,coverage:result.manifest?.coverage??null,...(result.summary?{summary:result.summary}:{}),fieldVerified:false},null,2));
   }
  }
 }
}catch(error){console.error('HOLD / REFUSE:',String(error.stderr||error.stack||error.message).slice(0,3600));process.exitCode=2}
finally{if(sandbox)rmSync(sandbox,{recursive:true,force:true})}
