#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {emit,coldVerify,now} from '../src/present-use.mjs';
function parse(args) {
  const o={};
  for(let i=0;i<args.length;i+=2) {
    if(!/^--[a-z-]+$/.test(args[i]??'')|| !args[i+1] ||Object.hasOwn(o,args[i].slice(2)))
      throw Error('INVALID_CLI_ARGUMENTS');
    o[args[i].slice(2)]=args[i+1];
  }
  for(const x of ['plan','roots']) if(!o[x])throw Error('MISSING_'+x.toUpperCase());
  return o;
}
const [cmd,...args]=process.argv.slice(2);
try {
  if(!['now','build','verify'].includes(cmd)) throw Error('EXPECTED_NOW_BUILD_OR_VERIFY');
  const options=parse(args);
  const read=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
  const plan=read(options.plan),roots=read(options.roots);
  if(cmd==='now') console.log(JSON.stringify(now(plan,roots,options.goal??plan.goal),null,2));
  else {
    if(!options.out)throw Error('MISSING_OUT');
    const result=cmd==='build'?emit(plan,roots,resolve(options.out)):
      coldVerify(plan,roots,resolve(options.out));
    console.log(JSON.stringify(result,null,2));
  }
} catch(e) {console.error('HOLD:',String(e.message).slice(0,420));process.exitCode=2;}
