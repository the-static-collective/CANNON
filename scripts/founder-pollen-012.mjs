#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {discover,run,verify} from '../src/founder-pollen-012.mjs';
try{
 const [mode,rootFile,outdir]=process.argv.slice(2);
 if(!['discover','run','verify'].includes(mode)||!rootFile||(['run','verify'].includes(mode)&&!outdir))
   throw Error('USAGE: discover roots.json | run roots.json fresh-output-dir | verify roots.json output-dir');
 const roots=JSON.parse(readFileSync(resolve(rootFile),'utf8'));
 const result=mode==='discover'?await discover(roots):mode==='run'?await run(roots,resolve(outdir)):await verify(roots,resolve(outdir));
 console.log(JSON.stringify(result,null,2));
}catch(error){console.error('HOLD:',String(error.message).slice(0,400));process.exitCode=2}
