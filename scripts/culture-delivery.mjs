#!/usr/bin/env node
import {resolve} from 'node:path';
import {deliverToPress,verifyPressDelivery} from '../src/culture-delivery.mjs';
const [cmd,...args]=process.argv.slice(2);
const expected=new Set(['webz','gro','press','forge','out','choice']);
function parse(argv){
 if(argv.length%2!==0)throw Error('INVALID_FLAGS');
 const p={};
 for(let i=0;i<argv.length;i+=2){
  const flag=argv[i];if(!flag?.startsWith('--'))throw Error('INVALID_FLAG');
  const name=flag.slice(2);if(!expected.has(name)||name in p||!argv[i+1])throw Error('INVALID_OR_DUPLICATE_ARGUMENT');
  p[name]=argv[i+1];
 }
 for(const n of ['webz','gro','press','forge','out'])if(!p[n])throw Error('MISSING_'+n);
 return p;
}
try{
 if(!['deliver','verify'].includes(cmd))throw Error('EXPECTED_DELIVER_OR_VERIFY');
 const o=parse(args);const roots={webz:resolve(o.webz),gro:resolve(o.gro),press:resolve(o.press)};
 const r=cmd==='deliver'?await deliverToPress(roots,resolve(o.forge),resolve(o.out),o.choice??'HOLD'):
  await verifyPressDelivery(roots,resolve(o.forge),resolve(o.out),o.choice??'HOLD');
 console.log(JSON.stringify(r,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,480));process.exitCode=2}
