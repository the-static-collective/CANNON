import {run,verify} from '../src/culture-sovereign-004.mjs';
import {resolve} from 'node:path';
const [op,...args]=process.argv.slice(2);
try {
 if(!['run','verify'].includes(op)||args.length!==22)throw Error('EXPECTED_11_OPTIONS');
 const options={};
 for(let i=0;i<args.length;i+=2){
  if(!args[i].startsWith('--'))throw Error('BAD_FLAG');
  options[args[i].slice(2)]=resolve(args[i+1]);
 }
 const roots={webz:options.webz,gro:options.gro,press:options.press,
  fm:options.fm,penny:options.penny,ghot:options.ghot,relatte:options.relatte};
 const f=op==='run'?run:verify;
 console.log(JSON.stringify(await f(roots,options.forge,options.held,options.use,options.out),null,2));
}catch(e){console.error('HOLD',String(e.message).slice(0,400));process.exitCode=2;}
