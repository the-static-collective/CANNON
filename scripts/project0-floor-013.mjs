#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {derive,run,verify} from '../src/project0-floor-013.mjs';
try{
 const [mode,rootsFile,out]=process.argv.slice(2);
 if(!['inspect','run','verify'].includes(mode)||!rootsFile||(mode!=='inspect'&&!out))
  throw Error('USAGE inspect roots.json | run roots.json fresh-dir | verify roots.json dir');
 const roots=JSON.parse(readFileSync(resolve(rootsFile),'utf8'));
 const result=mode==='inspect'?(await derive(roots)).project0:mode==='run'?await run(roots,resolve(out)):await verify(roots,resolve(out));
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,550));process.exitCode=2}
