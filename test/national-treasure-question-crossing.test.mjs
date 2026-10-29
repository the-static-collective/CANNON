import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceQuestionSeeds,validateOriginalQuestion,run}
 from '../scripts/national-treasure-question-crossing.mjs';

const mock= (seed,aperture)=>({
 schema:'national-treasure.question-receipt/v0',kind:'question_frontier',
 input:{clue:seed.engineInput.clue,claim:seed.engineInput.claim},
 evidence:{...seed.engineInput},
 aperture:{id:aperture,missing:'required evidence',reason:'The question remains unresolved'},
 question:'Which independent evidence is still missing?',
 other_doors:[],
 non_claims:['Not an answer','Not evidence promotion','Not a witnessed link','Not a legal conclusion']
});
test('original CANNON facts, not a guessed model answer, seed the question frontier',()=>{
 const s=sourceQuestionSeeds();
 assert.equal(s.schema,'cannon.treasure-compass-seeds/v1');
 assert.equal(s.sourceOwner,'the-static-collective/CANNON');
 assert.equal(s.seeds.length,2);
 const [real,withheld]=s.seeds;
 assert.equal(real.caseId,'REAL_REGISTERED_ADAPTER');
 assert.equal(real.engineInput.provenance_class,'primary');
 assert.equal(real.engineInput.support_confidence,'possible');
 assert.ok(real.engineInput.source_locator.includes('932c3400903123630d1dc6957ee38ae955944930'));
 assert.ok(real.engineInput.source_locator.includes(s.exactCannonEvidence.compositionSha256));
 assert.equal(real.engineInput.source_families.length,1);
 assert.ok(real.engineInput.claim.includes('VERIFIED_RECEIPT_PLAN_ID_V1'));
 assert.equal(withheld.caseId,'SYNTHETIC_ADAPTER_DISABLED');
 assert.equal(withheld.engineInput.source_locator,'');
 assert.equal(withheld.engineInput.provenance_class,'speculation');
 assert.equal(withheld.engineInput.support_confidence,'unsupported');
 assert.equal(withheld.evidenceStatus,'NO_ORIGINAL_SOURCE_OBJECT_FOR_HYPOTHETICAL_STATE');
});
test('the original source-backed question must concern chronology, the unsupported one its source',()=>{
 const [real,withheld]=sourceQuestionSeeds().seeds;
 assert.equal(validateOriginalQuestion(real,mock(real,'chronology')),true);
 assert.equal(validateOriginalQuestion(withheld,mock(withheld,'source-object')),true);
 const wrong=mock(real,'source-object');
 assert.throws(()=>validateOriginalQuestion(real,wrong),/REQUIRED_MISSING_APERTURE/);
});
test('question-only receipts refuse forged answers and false support promotions',()=>{
 const [real,withheld]=sourceQuestionSeeds().seeds;
 const withAnswer={...mock(real,'chronology'),answer:'yes'};
 assert.throws(()=>validateOriginalQuestion(real,withAnswer),/ORIGINAL_NO_ANSWER/);
 const promoted=mock(withheld,'source-object');
 promoted.evidence.support_confidence='established';
 assert.throws(()=>validateOriginalQuestion(withheld,promoted),/PROVENANCE_NOT_PROMOTED/);
 const verdict={...mock(withheld,'source-object'),conclusion:'EXECUTE'};
 assert.throws(()=>validateOriginalQuestion(withheld,verdict),/ORIGINAL_NO_ANSWER/);
});
test('list is genuinely read-only; build cannot fabricate authority',async()=>{
 const summary=await run(['list']);
 assert.equal(summary.noAnswer,true);
 assert.equal(summary.cases.length,2);
 assert.equal(summary.engineOwner,'the-static-collective/national-treasure');
 assert.rejects(run(['list','--authorize','SYNTHETIC_TEST_ONLY']),/LIST_NO_TOOL_CALL/);
 assert.rejects(run(['build','--treasure','/tmp','--out','/tmp/anything']),/AUTHORITY/);
});
