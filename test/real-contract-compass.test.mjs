import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {extractActualContract,compareReport,reviewPage,run} from '../scripts/real-contract-compass.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
function specimen(){
 const task=extractActualContract().task;
 const provider={kind:'deterministic-fixture',model:'iron-lung-typed-fixture',revision:'v1'};
 const ids=['NEUTRAL_DYAD','YOU_DYAD','NEUTRAL_COMPILED','YOU_COMPILED'];
 const expectations=[task.producer.outputPort,task.edge.adapter,task.requiredAuthorization,
  task.consumer.inputPort,task.edge.field,'false',
  task.producer.capability,task.edge.adapter,task.requiredAuthorization];
 const steps=[],arms=[];
 for(const id of ids){
  const responses=[];
  for(let i=0;i<9;i++){
   const response='unverified candidate '+i;
   responses.push(response);
   steps.push({arm:id,expected:expectations[i],card:'FACT sourced\nIDEA speculative\nRELATION typed',
    response});
  }
  arms.push({id,requests:9,questionCount:9,correctExact:0,echoCount:0,
   unansweredCount:0,secondPersonResponseCount:0,responses});
 }
 const base={schema:'iron-lung/compass-real-comparison/v1',
  task,taskSha256:sha(JSON.stringify(task)),provider,steps,arms,
  totalCalls:36,equalRequestsPerArm:9,automaticPromotions:0,
  sourceAdmission:false,humanPermission:false};
 return {...base,receiptSha256:sha(JSON.stringify(base))};
}
test('REAL source-backed reflex recipe provides actual adapter, stage and exact ports',()=>{
 const {task,source}=extractActualContract();
 assert.equal(task.producer.stage,'SOURCE_PROOF');
 assert.equal(task.consumer.stage,'VISUAL_STUDY');
 assert.equal(task.producer.outputPort,'cannon.reflex-memory/v1');
 assert.equal(task.consumer.inputPort,'planz.generated-plan/v1');
 assert.equal(task.edge.adapter,'VERIFIED_RECEIPT_PLAN_ID_V1');
 assert.equal(task.edge.field,'reusableRecipe.planId');
 assert.equal(task.requiredAuthorization,'SYNTHETIC_TEST_ONLY');
 assert.equal(task.publishAllowed,false);
 assert.equal(source.nativeProducerOutputPort,'cannon.inspand-receipt/v1');
 assert.notEqual(source.wrapperOutputPort,source.nativeProducerOutputPort);
});
test('equal-request four-arm comparison is explicitly limited to exact-source extraction',()=>{
 const p=specimen(),actual=extractActualContract();
 const r=compareReport(p,actual);
 assert.equal(r.methods.length,4);
 assert.equal(r.questionsPerArm,9);
 assert.equal(r.callTotal,36);
 assert.equal(r.modelGeneratedNewAdapters,0);
 assert.equal(r.copiedGroundTruthDoesNotProveReasoning,true);
 assert.equal(r.autoSelectedWinner,false);
 assert.equal(r.authorizedNativeExecutions,0);
});
test('altered original values or simulated permission are refused',()=>{
 const p=specimen(),actual=extractActualContract();
 const bad=structuredClone(p);bad.task.edge.field='invented.field';
 assert.throws(()=>compareReport(bad,actual),/MODEL_RECEIPT/);
 const forged=structuredClone(p);forged.humanPermission=true;
 assert.throws(()=>compareReport(forged,actual),/NO_AUTHORITY/);
});
test('HTML reviewer escapes untrusted FLAN output, exact source remains visible',()=>{
 const p=specimen(),r=compareReport(p,extractActualContract());
 p.steps[0].response='<script>attack</script>';
 const html=reviewPage(p,r);
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>attack'));
 assert.ok(html.includes('reusableRecipe.planId'));
});
test('read-only inspection never requires original model checkout or grants build',()=>{
 const o=run(['inspect']);
 assert.equal(o.execution,false);
 assert.equal(o.task.edge.adapter,'VERIFIED_RECEIPT_PLAN_ID_V1');
 assert.throws(()=>run(['inspect','--authorize','SYNTHETIC_TEST_ONLY']),/INSPECT_NO_EXECUTION/);
 assert.throws(()=>run(['build','--lung','/tmp']),/MISSING_/);
});
