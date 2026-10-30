import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {compileTruth} from '../scripts/truth-first-compiler.mjs';
import {sourceQuestionSeeds} from '../scripts/national-treasure-question-crossing.mjs';
import {initialQuestions,feedbackQuestions,assessInvestigation,run}
 from '../scripts/question-experiment-loop.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const fmt=x=>JSON.stringify(x,null,2)+'\n';
function fakeOriginalEngine(input){
 const missing=!input.source_locator?'source-object':
  !input.chronology?'chronology':!input.counterevidence?'counterevidence':'discriminator';
 return {schema:'national-treasure.question-receipt/v0',
  kind:'question_frontier',input:{clue:input.clue,claim:input.claim},
  evidence:{provenance_class:input.provenance_class,
   support_confidence:input.support_confidence,source_locator:input.source_locator,
   source_families:input.source_families,chronology:input.chronology,
   counterevidence:input.counterevidence,falsifier:input.falsifier,
   competing_explanations:input.competing_explanations},
  aperture:{id:missing,missing,reason:'A specific source gap must be resolved'},
  question:'What is the next independent observation?',
  other_doors:[],non_claims:['No answer','No verdict','No admission','No truth promotion']};
}
function nativeProof(truth){
 const core={schema:'cannon.truth-first-native-proof/v1',
  sourceCompilerSha256:truth.compilerSha256,
  originalNativeMediaSha256:['1'.repeat(64),'2'.repeat(64)],
  realWorldOutcomes:0,publication:false,
  authorizedCase:'ADAPTED',directOnlyCase:'HOLD_DIRECT_TYPE_MISMATCH'};
 return {...core,proofSha256:sha(fmt(core))};
}
function investigation(item){
 const core={schema:'iron-lung/question-investigation/v1',outputKind:'REVIEW_ONLY_SPECULATION',
  selectedAnswer:null,modelCanExecute:false,modelCanAdvanceQuestion:false,authority:'NONE',
  steps:Array.from({length:9},()=>({authority:'NONE',status:'POSSIBILITY_UNVERIFIED',
   executed:false,factAdmitted:false,ownerApproval:false})),requests:9,
  originalQuestionSha256:item.receiptSha256,
  source:{originalQuestionSha256:item.receiptSha256,caseId:item.id,originalQuestion:item.receipt},
  provider:{kind:'deterministic-fixture',model:'iron-lung-typed-fixture',revision:'v1'}};
 return {...core,investigationSha256:sha(JSON.stringify(core))};
}
test('the real CANNON source produces two truly different National Treasure question apertures',()=>{
 const {items,seeds,truth}=initialQuestions(fakeOriginalEngine);
 assert.equal(items.length,2);
 assert.equal(items[0].receipt.aperture.id,'chronology');
 assert.equal(items[1].receipt.aperture.id,'source-object');
 assert.equal(items[0].receipt.evidence.provenance_class,'primary');
 assert.equal(items[1].receipt.evidence.provenance_class,'speculation');
 assert.equal(items[1].receipt.evidence.source_locator,'');
 assert.equal(seeds.originalTruthSha256,truth.compilerSha256);
});
test('after verified original synthetic native evidence, source-backed question advances only to counterevidence',()=>{
 const {items,truth}=initialQuestions(fakeOriginalEngine);
 const date={commit:'932c3400903123630d1dc6957ee38ae955944930',
  observedAt:'2026-10-29T19:38:37.000Z',
  scope:'FIRST_INSPECTED_COMMIT_DATE_NOT_EARLIEST_APPEARANCE',
  verifiedBy:'LOCAL_GIT_COMMITTER_METADATA'};
 const follow=feedbackQuestions(items,truth,nativeProof(truth),fakeOriginalEngine,date);
 assert.deepEqual(follow.map(x=>x.nextQuestion.aperture.id),['counterevidence','source-object']);
 assert.equal(follow[1].nativeProofSha256,null);
 assert.equal(follow[1].nextQuestion.evidence.source_locator,'');
 assert.equal(follow[1].nextQuestion.evidence.support_confidence,'unsupported');
 assert.ok(follow[0].nextQuestion.evidence.chronology.includes('not proven earliest'));
});
test('model outputs remain unverified and cannot govern original software tests or next question',()=>{
 const {items}=initialQuestions(fakeOriginalEngine);
 const m=investigation(items[0]);
 const summary=assessInvestigation(null,items[0],m);
 assert.equal(summary.modelSelectedNativeRoute,false);
 assert.equal(summary.modelEstablishedFact,false);
 assert.equal(summary.modelAuthoredNextQuestion,false);
 assert.equal(summary.result,'HELD_MODEL_TEXT_NOT_EXECUTED');
 const promoted=structuredClone(m);promoted.modelCanExecute=true;
 assert.throws(()=>assessInvestigation(null,items[0],promoted),/NO_MODEL_CONTROL/);
 const fake=structuredClone(m);fake.source.originalQuestion.input.clue='FORGED';
 assert.throws(()=>assessInvestigation(null,items[0],fake),/MODEL_HASH/);
 const partial=structuredClone(m);partial.steps.pop();
 assert.throws(()=>assessInvestigation(null,items[0],partial),/NO_MODEL_CONTROL/);
});
test('no unapproved executable path is accepted',async()=>{
 const x=await run(['inspect']);
 assert.equal(x.status,'READ_ONLY');
 assert.deepEqual(x.sourceSeedIds,['REAL_REGISTERED_ADAPTER','SYNTHETIC_ADAPTER_DISABLED']);
 await assert.rejects(run(['inspect','--authorize','SYNTHETIC_TEST_ONLY']),/INSPECT_READ_ONLY/);
 await assert.rejects(run(['build','--out','/tmp/test']),/REQUIRED_/);
});
