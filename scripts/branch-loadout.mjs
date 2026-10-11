#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {inspect,verify} from '../src/branch-loadout.mjs';
try{
  const [cmd,planFile,rootsFile,resultFile]=process.argv.slice(2);
  if(!['inspect','verify'].includes(cmd)||!planFile||!rootsFile||!resultFile)throw Error('USAGE: inspect|verify plan.json roots.json output.json');
  const load=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
  const plan=load(planFile),roots=load(rootsFile);
  if(cmd==='inspect'){
    const result=inspect(plan,roots);
    writeFileSync(resolve(resultFile),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
    console.log(JSON.stringify({status:result.status,reportSha256:result.reportSha256,sourceCount:result.entries.length,executions:0}));
  }else console.log(JSON.stringify(verify(plan,roots,load(resultFile))));
}catch(e){console.error('HOLD:',e.message);process.exitCode=2;}
