#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {run,verify} from '../src/chronomid-seam-011.mjs';
try {
 const [mode,rootsFile,outDir]=process.argv.slice(2);
 if(!['run','verify'].includes(mode)||!rootsFile||!outDir||process.argv.length!==5)throw Error('USAGE run|verify roots.json output-dir');
 const roots=JSON.parse(readFileSync(resolve(rootsFile),'utf8'));
 const result=await (mode==='run'?run(roots,resolve(outDir)):verify(roots,resolve(outDir)));
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,450));process.exitCode=2}
