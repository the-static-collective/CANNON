#!/usr/bin/env node
/** CANNON STACK² 017: create-only synthetic composition and cold verification. */
import {readFileSync} from 'node:fs';
import {emit,coldVerify} from '../src/stack-squared-017.mjs';
const [command,planFile,loadoutFile,rootsFile,out]=process.argv.slice(2);
if(!['run','verify'].includes(command)||!planFile||!loadoutFile||!rootsFile||!out){
  console.error('Usage: node scripts/stack-squared-017.mjs run|verify PLAN LOADOUT ROOTS NEW_OUTPUT_DIR');
  process.exit(2);
}
const read=path=>JSON.parse(readFileSync(path,'utf8'));
try{
  const p=read(planFile),l=read(loadoutFile),r=read(rootsFile);
  const result=command==='run'?emit(p,l,r,out):coldVerify(p,l,r,out);
  process.stdout.write(JSON.stringify({
    status:command==='run'?result.status:result.status,
    receipt_id:result.receipt_id,
    donor_programs_executed:result.donor_programs_executed,
    owner_admitted:result.owner_admitted
  },null,2)+'\n');
}catch(error){
  console.error(String(error.message));
  process.exitCode=1;
}
