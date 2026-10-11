#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {run,verify} from '../src/branch-crossing.mjs';
try {
  const [mode,loadoutFile,rootsFile,out]=process.argv.slice(2);
  if(!['run','verify'].includes(mode)||!loadoutFile||!rootsFile||!out||process.argv.length!==6)throw Error('USAGE run|verify loadout-plan.json checkout-roots.json fresh-output-dir');
  const read=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
  const plan=read(loadoutFile),roots=read(rootsFile);
  const result=await (mode==='run'?run(plan,roots,resolve(out)):verify(plan,roots,resolve(out)));
  console.log(JSON.stringify(result,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,500));process.exitCode=2;}
