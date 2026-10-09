#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {composeBridge,emit,coldVerify} from '../src/kinship-bridge.mjs';
try{
  const [command,...args]=process.argv.slice(2);
  if(!['inspect','build','verify'].includes(command)||args.length%2)throw Error('EXPECTED_INSPECT_BUILD_VERIFY');
  const flags={};
  for(let i=0;i<args.length;i+=2){
    const k=args[i]?.slice(2);
    if(!args[i]?.startsWith('--')||!['plan','roots','scenario','input','pin','out','privacy'].includes(k)
      ||Object.hasOwn(flags,k))throw Error('UNKNOWN_OR_DUPLICATE_ARGUMENT');
    flags[k]=args[i+1];
  }
  if(!flags.plan||!flags.roots||!flags.scenario||!flags.input||(
    command!=='inspect'&&!flags.out))throw Error('MISSING_REQUIRED_ARGUMENTS');
  const read=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
  const p=read(flags.plan),r=read(flags.roots),s=read(flags.scenario),
    i=read(flags.input),pin=flags.pin?read(flags.pin):null;
  if(command==='build'){
    const receipt=emit(p,r,s,i,pin,resolve(flags.out),flags.privacy==='local-only-confirmed');
    console.log(JSON.stringify({status:'HOLD_REVIEW',receipt_id:receipt.receipt_id,
      input_mode:i.mode,real_station_authority:'NONE'},null,2));
  }else if(command==='verify'){
    console.log(JSON.stringify(coldVerify(p,r,s,i,pin,resolve(flags.out)),null,2));
  }else{
    const o=composeBridge(p,r,s,i,pin);
    // Keep supplied local aggregate amounts out of terminal output.
    console.log(JSON.stringify({status:o.receipt.disposition,input_mode:i.mode,
      countries:o.report.territories.map(t=>({country:t.country,status:t.status,
        unknown_checks:t.unknown_checks,blocked_checks:t.blocked_checks})),
      receipt_id:o.receipt.receipt_id},null,2));
  }
}catch(e){console.error('HOLD:',String(e.message).slice(0,400));process.exitCode=2;}
