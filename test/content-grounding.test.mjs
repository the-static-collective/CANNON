import test from 'node:test';
import assert from 'node:assert/strict';
import {extractActualContract} from '../scripts/real-contract-compass.mjs';
import {analyze,htmlReview,run} from '../scripts/content-grounding.mjs';
import {createHash} from 'node:crypto';
const h=x=>createHash('sha256').update(x).digest('hex');
const scenarios=['ADAPTED','DIRECT_ONLY'],arms=['DYAD_NEUTRAL','DYAD_YOU','FOCUSED_NEUTRAL','FOCUSED_YOU'];
function specimen(){
 const canonical=extractActualContract(),task=canonical.task;
 const provider={kind:'deterministic-fixture',model:'iron-lung-typed-fixture',revision:'v1'};
 const steps=[],results=[];
 for(const scenario of scenarios)for(const arm of arms){
  const responses=[];
  for(let i=0;i<9;i++){
   const c='SOURCE_PROOF produces\ncannon.reflex-memory/v1 memory\nA bridge\ncould translate\nreceipt identity\nDifferent ports\nremain different\nYou identify\nproducer output';
   const response='unverified';
   responses.push(response);
   steps.push({scenario,arm,card:c,response,expected:'NO'});
  }
  results.push({scenario,arm,calls:9,exactCorrect:0,echoes:0,unanswered:0,responses});
 }
 const p={schema:'iron-lung/content-triangulation/v1',task,taskSha256:h(JSON.stringify(task)),
 provider,steps,results,callCount:72,equalCallsPerArm:9,noAutoDecision:true,
 humanAuthorization:false,sourceChanged:false};
 return {packet:{...p,receiptSha256:h(JSON.stringify(p))},canonical};
}
test('real original CANNON registry contracts, not fabricated stage names',()=>{
 const v=extractActualContract();
 assert.equal(v.task.producer.outputPort,'cannon.reflex-memory/v1');
 assert.equal(v.task.consumer.inputPort,'planz.generated-plan/v1');
 assert.equal(v.task.edge.adapter,'VERIFIED_RECEIPT_PLAN_ID_V1');
 assert.equal(v.task.edge.field,'reusableRecipe.planId');
});
test('strictly label-free content and constant-call second-person controls',()=>{
 const {packet,canonical}=specimen();
 const report=analyze(packet,canonical);
 assert.equal(report.measurements.length,8);
 assert.equal(report.totalModelCalls,72);
 assert.equal(report.measurements.every(x=>x.labelsInModelInput===0&&x.headerlessLinesVerified),true);
 assert.equal(report.noNativeExecution,true);
 assert.equal(report.modelInventedCapability,false);
 assert.equal(report.noAutoWinner,true);
 assert.ok(report.counterfactual.includes('SYNTHETIC'));
 const html=htmlReview(packet,report);
 assert.ok(html.includes('CANNON')===false || html.includes('compass'));
 assert.ok(html.includes('Different ports'));
});
test('source contract mutations and fake authority are refused',()=>{
 const {packet,canonical}=specimen();
 const bad=structuredClone(packet);bad.task.edge.field='invented';
 assert.throws(()=>analyze(bad,canonical),/OWNER_PACKET_HASH/);
 const grant=structuredClone(packet);grant.humanAuthorization=true;
 assert.throws(()=>analyze(grant,canonical),/NO_GRANTED_ACTIONS/);
 const altered=structuredClone(packet);altered.steps[0].card='FACT supplied';
 const {receiptSha256,...body}=altered;
 altered.receiptSha256=h(JSON.stringify(body));
 assert.throws(()=>analyze(altered,canonical),/LABEL_FREE/);
});
test('inspect mode reads originals and never calls an untrusted model',()=>{
 const result=run(['inspect']);
 assert.equal(result.mode,'READ_ONLY');
 assert.equal(result.permission,false);
 assert.throws(()=>run(['inspect','--authorize','SYNTHETIC_TEST_ONLY']),/INSPECT_ONLY/);
 assert.throws(()=>run(['build','--lung','/tmp']),/REQUIRED_/);
});
