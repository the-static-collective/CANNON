#!/usr/bin/env node
/** First boot belongs to the operator, never to a cloud service.
 * Requires five source-owned checkouts and an existing writable output folder.
 * Binds only 127.0.0.1, does not auto-execute at startup.
 */
import {resolve} from 'node:path';
import {createBootConsole} from '../src/boot-console.mjs';
const opts={};
try{
 const args=process.argv.slice(2);
 if(args.length%2)throw Error('INVALID_FLAG_PAIRS');
 for(let i=0;i<args.length;i+=2){
  const k=args[i]?.replace(/^--/,'');
  if(!args[i]?.startsWith('--')||!['staticos','webz','gro','ghot','jarvis','out-parent','port'].includes(k)
     ||Object.hasOwn(opts,k)||!args[i+1])throw Error('UNEXPECTED_OR_DUPLICATE_FLAG');
  opts[k]=args[i+1];
 }
 for(const key of ['staticos','webz','gro','ghot','jarvis','out-parent'])
  if(!opts[key])throw Error('MISSING_'+key.toUpperCase());
 const parsedPort=opts.port===undefined?8766:Number(opts.port);
 if(!Number.isSafeInteger(parsedPort)||parsedPort<1024||parsedPort>65535)
  throw Error('PORT_MUST_BE_1024_TO_65535');
 const roots=Object.fromEntries(['staticos','webz','gro','ghot','jarvis']
  .map(k=>[k,resolve(opts[k])]));
 const consoleApp=createBootConsole({roots,outParent:resolve(opts['out-parent'])});
 const url=await consoleApp.start(parsedPort);
 console.log('GENESIS BOOT 002 / LOOPBACK ONLY / NO FIRST-LOAD EXECUTION');
 console.log('OPEN: '+url);
 console.log('All first-boot actions require an explicit human browser click.');
 process.on('SIGINT',()=>consoleApp.stop().then(()=>process.exit(0)));
 process.on('SIGTERM',()=>consoleApp.stop().then(()=>process.exit(0)));
}catch(err){console.error('HOLD:',String(err.message).slice(0,380));process.exitCode=2;}
