#!/usr/bin/env node
// Ingest signed local GHoT artifacts; never issue ACT or run donor programs.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {ingest,verify} from '../src/branch-signed-crossing-010.mjs';
try{
 const [mode,planFile,rootsFile,evidenceOrDir,outDir]=process.argv.slice(2);
 if(!['ingest','verify'].includes(mode)||!planFile||!rootsFile||!evidenceOrDir||(mode==='ingest'&&!outDir)){
   throw Error('USAGE: ingest plan.json roots.json signed-ghot-evidence.json output-dir | verify plan.json roots.json output-dir');
 }
 const read=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
 const plan=read(planFile),roots=read(rootsFile);
 const result=mode==='ingest'?await ingest(plan,roots,read(evidenceOrDir),resolve(outDir)):await verify(plan,roots,resolve(evidenceOrDir));
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,300));process.exitCode=2}
