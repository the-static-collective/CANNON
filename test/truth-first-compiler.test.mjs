import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {compileTruth,inspectTruth,run} from '../scripts/truth-first-compiler.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
test('facts from actual original owner ports; missing direct compatibility is held',()=>{
 const x=compileTruth();
 assert.equal(inspectTruth(x),true);
 assert.equal(x.kind,'DETERMINISTIC_SOURCE_CONTRACT_NOT_MODEL_INFERENCE');
 assert.equal(x.evidence.originalSourceVerified,true);
 assert.equal(x.evidence.wrapperProducerType,'cannon.reflex-memory/v1');
 assert.equal(x.evidence.receiverRequiredType,'planz.generated-plan/v1');
 assert.equal(x.evidence.nativeProducerReceiptType,'cannon.inspand-receipt/v1');
 assert.equal(x.decisions[0].caseId,'ADAPTED');
 assert.equal(x.decisions[0].status,'TESTABLE_WITH_OPERATOR_AUTHORIZATION');
 assert.equal(x.decisions[0].adapter,'VERIFIED_RECEIPT_PLAN_ID_V1');
 assert.equal(x.decisions[0].sourceReceiptField,'reusableRecipe.planId');
 assert.equal(x.decisions[1].status,'HOLD_DIRECT_TYPE_MISMATCH');
 assert.equal(x.decisions[1].adapterAvailableForThisCase,false);
 assert.equal(x.decisions[1].counterfactual,true);
 assert.equal(x.decisions.every(d=>d.nativeExecuted===false&&d.noHumanApprovalInferred),true);
 assert.equal(x.generatedSoftwareCapabilities,0);
 assert.equal(x.automaticallySelectedActions,0);
});
test('fact and relationship content, no empty semantic headers, source bounded dyads',()=>{
 const x=compileTruth();
 assert.ok(x.dyadLines.length>=6);
 assert.ok(x.dyadLines.every(l=>l.split(/\s+/).length>=2&&l.split(/\s+/).length<=3));
 assert.ok(x.dyadLines.every(l=>!/^(FACT|IDEA|RELATION|SOURCE|ADAPTER|ASK)\s/.test(l)));
 assert.ok(x.dyadLines.some(l=>l.includes('VERIFIED_RECEIPT_PLAN_ID_V1')));
 assert.ok(x.dyadLines.some(l=>l.includes('could translate')));
 assert.ok(x.dyadLines.some(l=>l.includes('cannot connect')));
 assert.deepEqual(x,compileTruth());
});
test('forged field, fake approval and invented adapter fail closed',()=>{
 const o=compileTruth(),forged=structuredClone(o);
 forged.decisions[1].testMayProceed=true;
 assert.throws(()=>inspectTruth(forged),/COMPILER_HASH/);
 const forgedPermission=structuredClone(o);forgedPermission.publisherPermission=true;
 assert.throws(()=>inspectTruth(forgedPermission),/UNTRUSTED_TRUTH/);
 const rehashed=structuredClone(o);rehashed.decisions[0].adapter='UNKNOWN_AUTONOMOUS_ADAPTER';
 rehashed.decisions[0].decisionSha256=sha(JSON.stringify(rehashed.decisions[0]));
 const {compilerSha256,...body}=rehashed;
 rehashed.compilerSha256=sha(JSON.stringify(body,null,2)+'\n');
 assert.throws(()=>inspectTruth(rehashed),/SOURCE_CONTRACT_CHANGED|COMPILER_HASH/);
});
test('inspect read-only, and no native execution for synthetic adapter-disabled scenario',()=>{
 const x=run(['inspect']);
 assert.equal(x.schema,'cannon.truth-first-compiler/v1');
 assert.throws(()=>run(['inspect','--authorize','SYNTHETIC_TEST_ONLY']),/READ_ONLY/);
 assert.throws(()=>run(['build','--case','DIRECT_ONLY','--plan','plan-000000000000000000000000',
  '--planz','/tmp','--roots','/tmp/roots.json','--out','/tmp/abc',
  '--authorize','SYNTHETIC_TEST_ONLY']),/NO_UNADAPTED_EXECUTION/);
 assert.throws(()=>run(['build','--case','ADAPTED','--plan','plan-000000000000000000000000',
  '--planz','/tmp','--roots','/tmp/roots.json','--out','/tmp/abc']),/AUTHORIZATION/);
});
