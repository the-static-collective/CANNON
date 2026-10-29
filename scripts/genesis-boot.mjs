#!/usr/bin/env node
/** Execute checked-in, exact-Git original code from five distinct repos.
 * Never checks out repositories, never installs a system, never contacts real people.
 */
import {resolve} from 'node:path';
import {buildGenesisBoot,coldVerifyGenesisBoot} from '../src/genesis-boot.mjs';
const [cmd,...tail]=process.argv.slice(2);
const usage='genesis-boot.mjs build|verify --staticos PATH --webz PATH --gro PATH --ghot PATH --jarvis PATH --out NEW_DIRECTORY [--question PUBLIC_SAFE_TEXT]';
try{
 if(!['build','verify'].includes(cmd))throw Error('EXPECTED_BUILD_OR_VERIFY: '+usage);
 if(tail.length%2)throw Error('UNPAIRED_FLAG');
 const opts={};
 for(let i=0;i<tail.length;i+=2){
  const flag=tail[i],value=tail[i+1],key=flag?.replace(/^--/,'');
  if(!flag?.startsWith('--')||!['staticos','webz','gro','ghot','jarvis','out','question'].includes(key)
    ||!value||Object.hasOwn(opts,key))throw Error('INVALID_FLAG_OR_DUPLICATE');
  opts[key]=value;
 }
 for(const need of ['staticos','webz','gro','ghot','jarvis','out'])if(!opts[need])throw Error('MISSING_'+need);
 if(cmd==='verify'&&opts.question)throw Error('VERIFY_READS_ORIGINAL_REQUEST_NO_NEW_QUESTION');
 const roots={staticos:resolve(opts.staticos),webz:resolve(opts.webz),gro:resolve(opts.gro),
  ghot:resolve(opts.ghot),jarvis:resolve(opts.jarvis)};
 const out=resolve(opts.out);
 const result=cmd==='build'?await buildGenesisBoot(roots,out,
  {question:opts.question??'Can one Suitcase help an ordinary house become cooperative infrastructure?',
   mission:'living-house',scenario:'FICTIONAL_A_B',mode:'OFFLINE_HOLD_ONLY'}):
  await coldVerifyGenesisBoot(roots,out);
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,700));process.exitCode=2;}
