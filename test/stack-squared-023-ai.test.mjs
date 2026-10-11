import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join, resolve} from 'node:path';
import {verify, run} from '../scripts/stack-squared-023-ai.mjs';

const root=process.env.STACK23_GHOT_ROOT;
const relatte=process.env.STACK23_RELATTE_ROOT;
const report=process.env.STACK23_GHOT_REPORT;
const out=process.env.STACK23_OUTPUT;
const planPath=resolve('examples/stack-squared-023-ai.plan.json');
const plan=JSON.parse(readFileSync(planPath,'utf8'));
function ready(){
  assert.ok(root && relatte && report && out,
    'STACK23_GHOT_ROOT, STACK23_RELATTE_ROOT, STACK23_GHOT_REPORT, STACK23_OUTPUT required');
}
async function cold() {return verify(plan,root,relatte,report,out);}
async function altered(file,change,code){
  const old=readFileSync(file);
  try {
    const value=JSON.parse(old.toString('utf8'));
    change(value);
    writeFileSync(file,JSON.stringify(value,null,2)+'\n');
    await assert.rejects(cold(), code);
  } finally {writeFileSync(file,old);}
}
test('actual original reLATTE R14 produced independent signed RECEIVED and R3_HOLD',async()=>{
  ready();
  const state=await cold();
  assert.equal(state.status,'STACK_SQUARED_023_NATIVE_R3_HOLD_COLD_VERIFIED');
  assert.equal(state.admitted,false);
  assert.ok(state.crossing_id.startsWith('relatte-crossing-v0:'));
  assert.ok(state.hold.startsWith('relatte-receipt-v0:'));
  const publicView=JSON.parse(readFileSync(join(out,'public-inspection.json')));
  assert.equal(publicView.original_ghot_donor_reexecuted,false);
  assert.equal(publicView.original_relatte_receiver_used,true);
  assert.equal(publicView.receiver_admitted,false);
  assert.equal(publicView.external_effects,0);
  assert.ok(!JSON.stringify(publicView).includes('Rosemary grows'));
});
test('plan cannot grant ACT, admission or move source pins',async()=>{
  ready();
  await assert.rejects(verify({...plan,auto_execute:true},root,relatte,report,out),/UNAUTHORIZED_MODE/);
  await assert.rejects(verify({...plan,mode:'ADMIT'},root,relatte,report,out),/UNAUTHORIZED_MODE/);
  await assert.rejects(verify({...plan,ghot_commit:'0'.repeat(40)},root,relatte,report,out),/UNPINNED_SOURCE/);
  await assert.rejects(verify({...plan,receiver:{...plan.receiver,world_id:'world:attacker'}},root,relatte,report,out),
    /RECEIVER_POLICY_CHANGED/);
});
test('tampered GHoT evidence and request refuse',async()=>{
  ready();
  await altered(join(out,'crossing-request.json'),x=>{x.spec.donor_claims.owner_act=true;},/CROSSING_REQUEST_CHANGED/);
  await altered(join(out,'cannon-source-witness.json'),x=>{x.native_report_sha256='0'.repeat(64);},/SOURCE_WITNESS_CHANGED/);
  await altered(report,x=>{x.attempts[0].packet.status='SILENTLY_ADMITTED';},/INVALID_PORTABLE_SEED_PACKET|TAMPERED_REPORT|INVALID_REPORT|INVALID_.*|SOURCE|verified|Command failed|NATIVE_VERIFIER_REFUSED/);
});
test('tampered original reLATTE signatures, signed claims and transport refuse',async()=>{
  ready();
  await altered(join(out,'crossing-result.json'),x=>{x.crossing.extensions.organ_adapter.donor_claims.owner_act=true;},
    /INVALID_NATIVE_SIGNED_CROSSING/);
  await altered(join(out,'crossing-result.json'),x=>{x.receive_receipt.kind='ADMITTED';},
    /INVALID_NATIVE_RECEIVED/);
  await altered(join(out,'crossing-result.json'),x=>{x.disposition_receipt.kind='R3_ADMIT';},
    /INVALID_NATIVE_R3_HOLD/);
  await altered(join(out,'crossing-bundle.json'),x=>{x.crossing_id='forged';},/INVALID_TRANSPORT_FRAME_ID|TRANSPORT_CROSSING_ID_MISMATCH/);
});
test('receiver durable journal, public report and cold verify refuse tampering',async()=>{
  ready();
  const journal=join(out,'receiver','journal.jsonl');
  const original=readFileSync(journal);
  try {
    const lines=original.toString('utf8').trimEnd().split('\n');
    const event=JSON.parse(lines[0]);
    event.crossing_id='forged';
    lines[0]=JSON.stringify(event);
    writeFileSync(journal,lines.join('\n')+'\n');
    await assert.rejects(cold());
  }finally{writeFileSync(journal,original);}
  await altered(join(out,'public-inspection.json'),x=>{x.receiver_admitted=true;},/PUBLIC_RECEIPT_OVERCLAIM/);
});
test('no second native execution on cold verify; run is explicitly gated',async()=>{
  ready();
  const req=join(out,'crossing-request.json');
  const before=readFileSync(req);
  const cli=resolve('scripts/stack-squared-023-ai.mjs');
  const args=['run',planPath,root,relatte,report,join(out,'different-out')];
  const response=spawnSync('node',[cli,...args],{encoding:'utf8'});
  assert.notEqual(response.status,0);
  assert.match(response.stderr,/EXPLICIT_LOCAL_HOLD_APPROVAL_REQUIRED/);
  await cold();
  assert.deepEqual(readFileSync(req),before);
});
