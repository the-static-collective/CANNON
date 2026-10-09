#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {forge,emit,coldVerify} from '../src/adapter-forge.mjs';
function args(list){
 const out={};
 for(let i=0;i<list.length;i+=2){
  if(!list[i]?.startsWith('--')||!list[i+1]||Object.hasOwn(out,list[i].slice(2)))throw Error('INVALID_OR_DUPLICATE_ARGUMENT');
  out[list[i].slice(2)]=list[i+1];
 }
 if(!out.plan||!out.roots)throw Error('PLAN_AND_ROOTS_REQUIRED');
 return out;
}
try{
 const [command,...params]=process.argv.slice(2);
 if(!['inspect','build','verify'].includes(command))throw Error('EXPECTED_INSPECT_BUILD_VERIFY');
 const options=args(params),read=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
 const plan=read(options.plan),roots=read(options.roots);
 const result=command==='inspect'?forge(plan,roots):
   command==='build'?options.out&&emit(plan,roots,resolve(options.out)):
   options.out&&coldVerify(plan,roots,resolve(options.out));
 if(!result)throw Error('OUTPUT_REQUIRED');
 console.log(JSON.stringify(result,null,2));
}catch(e){
 console.error('HOLD:',String(e.message).slice(0,400));
 process.exitCode=2;
}