#!/usr/bin/env node
import {resolve} from 'node:path';
import {buildNative,coldVerifyNative} from '../src/culture-forge.mjs';
const [cmd,...tail]=process.argv.slice(2);
function options(args){
 const ret={};
 for(let i=0;i<args.length;i+=2){const key=args[i]?.replace(/^--/,'');
  if(!['webz','gro','out','topic'].includes(key)||!args[i]?.startsWith('--')||!args[i+1]||key in ret)throw Error('INVALID_CLI_FLAGS');
  ret[key]=args[i+1];}
 for(const req of ['webz','gro','out'])if(!ret[req])throw Error('MISSING_'+req);
 return ret;
}
try {
 if(!['build','verify'].includes(cmd))throw Error('EXPECTED_BUILD_OR_VERIFY');
 const o=options(tail),roots={webz:resolve(o.webz),gro:resolve(o.gro)},out=resolve(o.out);
 const result=cmd==='build'?await buildNative(roots,out,o.topic):await coldVerifyNative(roots,out);
 console.log(JSON.stringify(result,null,2));
}catch(error){console.error('HOLD:',String(error.message).slice(0,600));process.exitCode=2;}
