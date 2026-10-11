import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {validatePlan,sources,verify} from '../src/stack-squared-018.mjs';
const plan=()=>JSON.parse(readFileSync(new URL('../examples/stack-squared-018.plan.json',import.meta.url),'utf8'));
const loadout=()=>JSON.parse(readFileSync(new URL('../examples/branch-loadout-008.plan.json',import.meta.url),'utf8'));
test('native floor permits only two explicit native local capabilities and pinned records',()=>{
  const p=plan();
  assert.equal(validatePlan(p),p);
  const reject=mutate=>{
    const candidate=structuredClone(p);mutate(candidate);
    assert.throws(()=>validatePlan(candidate),/UNAPPROVED_NATIVE_CAPABILITY|INVALID_PLAN_FIELDS/);
  };
  reject(x=>x.allowed_capabilities.push('system.shell'));
  reject(x=>x.plan_ids[0]='CHOOSE_ANY');
  reject(x=>x.allowed_capabilities[1]='GHoT.execute');
  reject(x=>x.execution_authorized=true);
  reject(x=>x.mode='AUTO_ADMIT');
  reject(x=>x.plan_ids.reverse());
});
test('missing native original source refuses before creating local evidence',()=>{
  assert.throws(()=>sources(plan(),loadout(),{}),/MISSING_REPO_ROOT/);
});
test('actual native SENSE, GHoT local task and reLATTE signed HOLD cold-verify',async t=>{
  if(!process.env.STACK2_018_ROOTS||!process.env.STACK2_018_OUTPUT){
    t.skip('requires real exact pinned checkout and finished native specimen');return;
  }
  const roots=JSON.parse(readFileSync(process.env.STACK2_018_ROOTS,'utf8'));
  const out=process.env.STACK2_018_OUTPUT;
  const result=await verify(plan(),loadout(),roots,out);
  assert.equal(result.status,'STACK_SQUARED_018_NATIVE_COLD_VERIFIED');
  assert.equal(result.summary.native_planz_run,true);
  assert.equal(result.summary.native_ghot_local_system_hash,true);
  assert.equal(result.summary.signed_objects_cold_verified,3);
  assert.equal(result.summary.receiver_admitted,false);
  assert.equal(result.summary.external_effects,0);
  assert.equal(result.summary.native_planz_proposals.length,2);
  assert(result.summary.native_planz_proposals.every(x=>x.selection==='NONE'&&x.authority==='none'));
});
test('actual specimen refuses forged plan result, GHoT receipt, crossing and summary',async t=>{
  if(!process.env.STACK2_018_ROOTS||!process.env.STACK2_018_OUTPUT){
    t.skip('requires real exact pinned checkout and finished native specimen');return;
  }
  const roots=JSON.parse(readFileSync(process.env.STACK2_018_ROOTS,'utf8')),out=process.env.STACK2_018_OUTPUT;
  for(const [file,mutate] of [
    ['native-planz-output.json',v=>{v.frames[0].authority='owner';}],
    ['native-ghot-receipt.json',v=>{v.output.sha256='0'.repeat(64);}],
    ['crossing-request.json',v=>{v.disposition='ADMIT';}],
    ['crossing-result.json',v=>{v.crossing.extensions.organ_adapter.donor_claims.external_effects=1;}],
    ['public-inspection.json',v=>{v.receiver_admitted=true;}]
  ]){
    const path=join(out,file),original=readFileSync(path);
    try{
      const changed=JSON.parse(original.toString('utf8'));
      mutate(changed);
      writeFileSync(path,JSON.stringify(changed)+'\n');
      await assert.rejects(()=>verify(plan(),loadout(),roots,out),undefined,file+' tampering must refuse');
    }finally{
      writeFileSync(path,original);
    }
  }
  assert.equal((await verify(plan(),loadout(),roots,out)).status,'STACK_SQUARED_018_NATIVE_COLD_VERIFIED');
});
