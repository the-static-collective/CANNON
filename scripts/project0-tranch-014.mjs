#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {design,run,verify} from '../src/project0-tranch-014.mjs';
try{
 const [mode,rootsFile,outDir]=process.argv.slice(2);
 if(!['design','run','verify'].includes(mode)||!rootsFile||(mode!=='design'&&!outDir))
  throw Error('USAGE: design roots.json | run roots.json fresh-output | verify roots.json output');
 const roots=JSON.parse(readFileSync(resolve(rootsFile),'utf8'));
 const r=mode==='design'?await design(roots):mode==='run'?await run(roots,resolve(outDir)):await verify(roots,resolve(outDir));
 if(mode==='design')delete r.artifact_bytes;
 console.log(JSON.stringify(r,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,450));process.exitCode=2}
