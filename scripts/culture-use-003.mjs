#!/usr/bin/env node
import {resolve} from 'node:path';
import {build,verify} from '../src/culture-use-003.mjs';
const [command,...args]=process.argv.slice(2);
const permitted=new Set(['webz','gro','press','fm','penny','forge','held','out','variant']);
try {
 if(!['build','verify'].includes(command)||args.length%2)throw Error('INVALID_COMMAND');
 const opts={};
 for(let i=0;i<args.length;i+=2){
  const key=args[i]?.replace(/^--/,'');
  if(!permitted.has(key)||!args[i]?.startsWith('--')||key in opts||!args[i+1])throw Error('INVALID_ARG');
  opts[key]=args[i+1];
 }
 for(const key of ['webz','gro','press','fm','penny','forge','held','out'])if(!opts[key])throw Error('MISSING_'+key);
 const roots={webz:resolve(opts.webz),gro:resolve(opts.gro),press:resolve(opts.press),
  fm:resolve(opts.fm),penny:resolve(opts.penny)};
 const result=command==='build'?await build(roots,resolve(opts.forge),resolve(opts.held),resolve(opts.out),opts.variant??'confirmed'):
  await verify(roots,resolve(opts.forge),resolve(opts.held),resolve(opts.out));
 console.log(JSON.stringify(result,null,2));
}catch(error){console.error('HOLD:',String(error.message).slice(0,500));process.exitCode=2;}
