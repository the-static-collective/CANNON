import test from 'node:test';
import assert from 'node:assert/strict';
import {buildIntent,nextQuestion,reviewPage,run}
 from '../scripts/playdeck-toaster-red-gate.mjs';
import {createHash} from 'node:crypto';
const sha=x=>createHash('sha256').update(x).digest('hex');
const source={
 receipt:{schemaVersion:'0.1',id:'genesis-001-receipt',phase:'projected',
  source:{planId:'genesis-001-composed'},events:[{id:'evt-1'}],
  carry:{held:['card-09']}},
 receiptSha256:'a'.repeat(64),
 directlyAccepted:false,renamedAccepted:false,
 originalErrorCode:'INVALID_DOGRAM_TRACE_RECEIPT'
};
function mockQuestion(input){
 return {schema:'national-treasure.question-receipt/v0',kind:'question_frontier',
  evidence:{...input},aperture:{id:'source-object',missing:'recoverable source',
  reason:'The relation has no source'},
  question:'Which original native render evidence establishes this relationship?',
  non_claims:['no answer','no promotion','no inference','no approval']};
}
test('a projected PlayDeck source cannot become a Toaster video receipt by renaming fields',()=>{
 const spec=buildIntent(source);
 assert.equal(spec.state,'HOLD_REQUIRES_ORIGINAL_TOASTER_RENDER');
 assert.equal(spec.producerPhase,'projected');
 assert.equal(spec.producerCanInherit,false);
 assert.equal(spec.nativeDirectCastAccepted,false);
 assert.equal(spec.renamedReceiptAccepted,false);
 assert.equal(spec.originalToasterError,'INVALID_DOGRAM_TRACE_RECEIPT');
 assert.equal(spec.bridgeImplemented,false);
 assert.equal(spec.realToasterVideoRendered,false);
 assert.equal(spec.neededIndependentEvidence.length,6);
 assert.ok(spec.nativeToasterDogramRequires.includes('output.sha256'));
 assert.ok(spec.nativeToasterDogramRequires.includes('canonicalExecution.timelineHash'));
 assert.equal(spec.specSha256,sha(JSON.stringify((({specSha256,...body})=>body)(spec),null,2)+'\n'));
});
test('National Treasure receives the missing adapter relationship, never a forged source object',()=>{
 const spec=buildIntent(source),q=nextQuestion(spec,mockQuestion);
 assert.equal(q.originalQuestion.aperture.id,'source-object');
 assert.equal(q.originalQuestion.evidence.source_locator,'');
 assert.equal(q.originalQuestion.evidence.support_confidence,'unsupported');
 assert.equal(q.originalQuestion.evidence.provenance_class,'speculation');
 assert.equal(q.status,'UNANSWERED');
 assert.equal(q.authority,'NONE');
 assert.equal(q.originalQuestionSha256,sha(JSON.stringify(q.originalQuestion)));
 const html=reviewPage(spec,q);
 assert.ok(html.includes('Original PlayDeck receipt'));
 assert.ok(html.includes('native render'));
 assert.ok(!html.includes('EXECUTED_ADAPTER'));
});
test('no permission is granted by rendered field spoofing or mocked source acceptance',()=>{
 const changed=structuredClone(source);changed.renamedAccepted=true;
 assert.throws(()=>buildIntent(changed),/NO_BYPASS/);
 const invented=structuredClone(source);invented.originalErrorCode=null;
 assert.throws(()=>buildIntent(invented),/NO_BYPASS/);
 const spec=buildIntent(source);
 const q=(data)=>({...mockQuestion(data),aperture:{id:'chronology'}});
 assert.throws(()=>nextQuestion(spec,q),/QUESTION_NOT_VERDICT/);
 const admitted=(data)=>({...mockQuestion(data),answer:'connected'});
 assert.throws(()=>nextQuestion(spec,admitted),/QUESTION_NOT_VERDICT/);
});
test('inspection is read-only and all build paths are explicit',async()=>{
 const state=await run(['inspect']);
 assert.equal(state.operation,'READ_ONLY');
 assert.equal(state.status,'HOLD_MISSING_RENDER_EVIDENCE');
 await assert.rejects(run(['inspect','--authorize','SYNTHETIC_TEST_ONLY']),/INSPECT_READ_ONLY/);
 await assert.rejects(run(['build','--playdeck','/tmp/playdeck']),/OWNER_/);
 await assert.rejects(run(['red','--playdeck','/tmp','--toaster','/tmp','--out','/tmp/red']),/RED_NO_OUTPUT/);
});
