#!/usr/bin/env node
/** STACK² 018. Direct, bounded, exact-native ceremony; never launches an arbitrary script. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {run,verify} from '../src/stack-squared-018.mjs';
const [op,planPath,loadoutPath,rootsPath,outPath]=process.argv.slice(2);
if(!['run','verify'].includes(op)||!planPath||!loadoutPath||!rootsPath||!outPath||
    process.argv.length!==7){
  console.error('Usage: node scripts/stack-squared-018.mjs run|verify PLAN LOADOUT ROOTS NEW_OUTPUT');
  process.exit(2);
}
try{
  const read=path=>JSON.parse(readFileSync(resolve(path),'utf8'));
  const result=await (op==='run'?run:verify)(read(planPath),read(loadoutPath),
    read(rootsPath),resolve(outPath));
  console.log(JSON.stringify(result,null,2));
}catch(e){
  console.error('HOLD:',String(e.message).slice(0,600));
  process.exitCode=1;
}
