#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const tasks=[
 ['guest-03','Dogram','python3',['-m','dogram.cli','examples/mutated_mathals/interest-mediated-support.json']],
 ['guest-06','autodiscography-vault','npm',['test']],
 ['guest-07','the-haunted-phonography','npm',['test']],
 ['guest-21','3rdi','python3',['-m','unittest','discover','-s','tests','-v']]
];
try{
 const argv=process.argv.slice(2);
 if(argv.length!==4||argv[0]!=='--sources'||argv[2]!=='--out')throw Error('HOLD_FLAGS');
 const roots=JSON.parse(readFileSync(resolve(argv[1]),'utf8'));
 const out=resolve(argv[3]);
 if(Object.keys(roots).length!==22||existsSync(out))throw Error('HOLD_SOURCE_OR_OUTPUT_SHAPE');
 mkdirSync(out,{recursive:false});
 const receipts=[];
 for(const [id,owner,exe,args] of tasks){
  const result=spawnSync(exe,args,{cwd:resolve(roots[id]),encoding:'utf8',timeout:180000,
   maxBuffer:1000000,env:{...process.env,PYTHONNOUSERSITE:'1',PYTHONPYCACHEPREFIX:join(out,'pycache-'+id)}});
  const log=[result.stdout||'',result.stderr||''].join('\n');
  writeFileSync(join(out,id+'.log'),log,{flag:'wx'});
  const logHash='sha256:'+createHash('sha256').update(log).digest('hex');
  receipts.push({id,owner,argv:[exe,...args],exitCode:result.status,
   logHash,nativeOwnerCodeExecuted:result.status===0,
   sourceIdentityFromAcquisition:true,
   humanEvidence:false,publishAuthorization:false});
 }
 const body={schema:'cannon.guest-native-tests/v1',
  testedOwnerCount:receipts.length,successfulOwnerTests:receipts.filter(x=>x.nativeOwnerCodeExecuted).length,
  unchangedUnexecutedGuests:22-receipts.length,receipts,
  doesNotProveCrossEngineSemanticInterop:true,
  independentlyVerifiedHumanOutcome:false,externalDispatch:false};
 writeFileSync(join(out,'receipt.json'),JSON.stringify(body,null,2)+'\n');
 process.stdout.write(JSON.stringify({successfulOwnerTests:body.successfulOwnerTests,receipts},null,2)+'\n');
 if(receipts.some(x=>x.exitCode!==0))process.exitCode=2;
}catch(e){console.error('HOLD:',String(e.message).slice(0,1000));process.exitCode=2}
