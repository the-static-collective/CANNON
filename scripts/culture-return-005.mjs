import {resolve} from 'node:path';
import {runReturn,verifyReturn} from '../src/culture-return-005.mjs';
const [command,...args]=process.argv.slice(2);
const keys=['webz','gro','press','fm','penny','ghot','relatte','planz','graft','jarvis','forge','held','use','sovereign','out'];
try{
 if(!['run','verify'].includes(command)||args.length!==keys.length*2)throw Error('EXPECTED_RUN_OR_VERIFY_AND_15_FLAGS');
 const opts={};
 for(let i=0;i<args.length;i+=2){
  const k=args[i]?.slice(2);
  if(!keys.includes(k)||!args[i].startsWith('--')||opts[k]||!args[i+1])throw Error('INVALID_OPTION');
  opts[k]=resolve(args[i+1]);
 }
 if(keys.some(k=>!opts[k]))throw Error('MISSING_REQUIRED_ROOT');
 const roots={webz:opts.webz,gro:opts.gro,press:opts.press,fm:opts.fm,
  penny:opts.penny,ghot:opts.ghot,relatte:opts.relatte,
  planz:opts.planz,graft:opts.graft,jarvis:opts.jarvis};
 const operation=command==='run'?runReturn:verifyReturn;
 const out=await operation(roots,opts.forge,opts.held,opts.use,opts.sovereign,opts.out);
 console.log(JSON.stringify(out,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,550));process.exitCode=2;}
