import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,rmSync,mkdtempSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const config=process.env.ARCADE_CONFIG;
const run=(args)=>spawnSync(process.execPath,['scripts/arcade-machine.mjs',...args],{encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
test('native 22-owner machine builds five scenes, deterministic replay, fork/swap/recombine/refusal and real tamper challenge', {skip:!config?'ARCADE_CONFIG required for actual acquired owner integrations':false},()=>{
 const home=mkdtempSync(join(tmpdir(),'arcade-native-'));
 try{
  const out=join(home,'machine');let r=run(['build','--config',config,'--out',out,'--authorize','LOCAL_FICTIONAL_ONLY']);assert.equal(r.status,0,r.stderr);
  const manifest=JSON.parse(readFileSync(join(out,'manifest.json')));assert.equal(manifest.coverage.executingNativeDonorRepositories,22);assert.ok(manifest.coverage.verifiedSourceRepositories>=50);
  const receipts=JSON.parse(readFileSync(join(out,'receipt.json')));assert.equal(receipts.fieldVerified,false);
  for(const mission of ['mit','voqal','garden','jubilee','commons']){const scene=JSON.parse(readFileSync(join(out,'scenes',mission+'.json')));assert.ok(scene.execution.stages.length>=6);assert.equal(scene.execution.results.silence.result.disposition,'boundary_refused');assert.equal(scene.execution.results.catalog.records.length,64)}
  r=run(['verify','--config',config,'--out',out]);assert.equal(r.status,0,r.stderr);
  for(const [action,status] of [['break','REFUSE_TAMPER'],['refuse','REFUSE_RECEIVER'],['fork','HOLD_BRANCH_SELECTION_REQUIRED'],['swap','LOCAL_SOFTWARE_COMPLETE'],['recombine','LOCAL_SOFTWARE_COMPLETE']]){
   const p=join(home,action),request=join(home,action+'.json');writeFileSync(request,JSON.stringify({schema:'arcade.challenge/v1',mission:'garden',action,authorized:true,receiver:'HOLD',variant:'A',secondary:'jubilee',requestId:'challenge-'+action}));
   r=run(['challenge','--config',config,'--request',request,'--out',p,'--authorize','LOCAL_FICTIONAL_ONLY']);assert.equal(r.status,0,r.stderr);
   const scene=JSON.parse(readFileSync(join(p,'result.json')));assert.equal(scene.status,status);
   if(action==='break')assert.equal(scene.challengeProof.code,'RECEIPT_IDENTITY_MISMATCH');
   if(action==='swap')assert.equal(scene.execution.results.deck.selectedNativeFieldDonor,'freegraph');
   if(action==='fork'){assert.ok(scene.parentSoftwarePlan);assert.equal(scene.execution.results.voyage.replay.currentness,'unresolved')}
   if(action==='recombine')assert.equal(scene.execution.results.voyage.packet.branch_heads.find(b=>b.branch_id==='branch-combined').status,'live');
  }
  const path=join(out,'scenes/garden.json'),old=readFileSync(path);writeFileSync(path,'forged');r=run(['verify','--config',config,'--out',out]);assert.equal(r.status,2);assert.match(r.stderr,/PACKET_BYTES/);writeFileSync(path,old);
  r=run(['build','--config',config,'--out',out,'--authorize','LOCAL_FICTIONAL_ONLY']);assert.equal(r.status,2);
 }finally{rmSync(home,{recursive:true,force:true})}
});
