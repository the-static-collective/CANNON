#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {composeSurplus,emit,coldVerify} from '../src/kinship-surplus.mjs';
try{
  const [action,...args]=process.argv.slice(2);
  if(!['inspect','build','verify'].includes(action))throw Error('EXPECTED_INSPECT_BUILD_VERIFY');
  if(args.length%2)throw Error('UNPAIRED_ARGUMENT');
  const flags={};
  for(let i=0;i<args.length;i+=2){
    const flag=args[i],key=flag?.slice(2);
    if(!flag?.startsWith('--')||!['plan','roots','station','out'].includes(key)||Object.hasOwn(flags,key))
      throw Error('INVALID_OR_DUPLICATE_ARGUMENT');
    flags[key]=args[i+1];
  }
  if(!flags.plan||!flags.roots||!flags.station||
    (action!=='inspect'&&!flags.out))throw Error('MISSING_REQUIRED_ARGUMENT');
  const read=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
  const plan=read(flags.plan),roots=read(flags.roots),station=read(flags.station);
  const result=action==='inspect'
    ?composeSurplus(plan,roots,station).receipt
    :action==='build'?emit(plan,roots,station,resolve(flags.out))
    :coldVerify(plan,roots,station,resolve(flags.out));
  console.log(JSON.stringify(result,null,2));
}catch(e){
  console.error('HOLD:',String(e.message).slice(0,400));
  process.exitCode=2;
}
