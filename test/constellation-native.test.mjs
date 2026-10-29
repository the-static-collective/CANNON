import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,existsSync,rmSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {buildPacket,verifyPacket} from '../src/constellation/packet.mjs';
const acquisition=process.env.CONSTELLATION_ROOTS;
test('native ten-checkout integration: deterministic, cold, tamper, false claim, idempotency, refusal and rollback', {skip:!acquisition?'Set CONSTELLATION_ROOTS to acquired exact donor directory; required in constellation CI':false},async()=>{
 const roots=JSON.parse(readFileSync(acquisition));
 const dir=mkdtempSync(join(tmpdir(),'constellation-native-test-'));
 const out=join(dir,'first'),second=join(dir,'second');
 try{
  const r=await buildPacket(roots,out);assert.equal(r.fieldVerified,false);assert.equal(r.sourceRepositories,9);
  assert.equal((await verifyPacket(roots,out)).status,'INDEPENDENT_PROCESS_REPLAY_REQUIRED');
  await buildPacket(roots,second);
  assert.equal(readFileSync(join(out,'receipt.json'),'utf8'),readFileSync(join(second,'receipt.json'),'utf8'));
  const rec=JSON.parse(readFileSync(join(out,'receiver-exercise.json')));
  assert.deepEqual(rec.cases.map(x=>x.first),['HELD','REFUSED','STORED']);
  assert.equal(rec.cases[2].replay,'ALREADY_STORED');assert.equal(rec.cases[2].revoked,'BLOCKED');
  assert.equal(rec.cases[1].storedObservations,0);
  const {coldVerifyGenesisBoot}=await import('../src/genesis-boot.mjs');
  const inherited=Object.fromEntries(['staticos','webz','gro','ghot','jarvis'].map(k=>[k,roots[k]]));
  assert.equal((await coldVerifyGenesisBoot(inherited,join(out,'genesis'))).status,'CROSS_BRANCH_NATIVE_COLD_REPLAY_VERIFIED');
  const house=JSON.parse(readFileSync(join(out,'genesis/house-A.json')));assert.equal(house.outputs.real_home,'NOT_BUILT');
  for(const filename of ['receipt.json','genesis/house-A.html','receiver-exercise.json','manifest.json','proof-report.json']){
   const pristine=readFileSync(join(out,filename));writeFileSync(join(out,filename),filename==='receipt.json'?JSON.stringify({...r,fieldVerified:true}):'counterfeit');
   await assert.rejects(verifyPacket(roots,out),/PACKET_BYTES/);writeFileSync(join(out,filename),pristine);
  }
  writeFileSync(join(out,'extra'),'forged');await assert.rejects(verifyPacket(roots,out),/PACKET_FILE_SET/);rmSync(join(out,'extra'));
  await assert.rejects(buildPacket(roots,out),/OUTPUT_EXISTS/);
  const missing={...roots,ghot:join(dir,'missing')};await assert.rejects(buildPacket(missing,join(dir,'no-output')));assert.equal(existsSync(join(dir,'no-output')),false);
  // A real mid-pipeline process error after source checks must not emit a packet.
  const nodeBin=join(dir,'bin');mkdirSync(nodeBin);const python=join(nodeBin,'python3');writeFileSync(python,'#!/bin/sh\nexit 71\n',{mode:0o755});
  const env={...process.env,PATH:nodeBin+':'+process.env.PATH};
  assert.throws(()=>execFileSync(process.execPath,['scripts/constellation.mjs','build','--roots',acquisition,'--out',join(dir,'partial'),'--authorize','LOCAL_FICTIONAL_ONLY'],{cwd:new URL('../',import.meta.url),env,stdio:'pipe'}));
  assert.equal(existsSync(join(dir,'partial')),false);
 }finally{rmSync(dir,{recursive:true,force:true})}
});
