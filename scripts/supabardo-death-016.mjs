#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {run,verify} from '../src/supabardo-death-016.mjs';
try{
 const [mode,rootsFile,out]=process.argv.slice(2);
 if(!['run','verify'].includes(mode)||!rootsFile||!out)throw Error('USAGE run|verify exact-git-roots.json fresh-output-dir');
 const roots=JSON.parse(readFileSync(resolve(rootsFile),'utf8'));
 console.log(JSON.stringify(mode==='run'?await run(roots,resolve(out)):await verify(roots,resolve(out)),null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,320));process.exitCode=2}
