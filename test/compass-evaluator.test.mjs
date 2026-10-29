import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {evaluateComparison,reviewHTML,run} from '../scripts/compass-evaluator.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
function packet(){
 const provider={kind:'deterministic-fixture',model:'iron-lung-typed-fixture',revision:'v1'};
 const source={rawText:'Two software tools might share a common interface.',
  rawTextSha256:hash('Two software tools might share a common interface.'),
  braidSha256:'a'.repeat(64)};
 const base=Array.from({length:9},(_,i)=>({candidateText:'proposed question '+i}));
 const card='FACT stated\nIDEA speculative\nRELATION unverified\nASK concrete test';
 const dyad=n=>Array.from({length:n},(_,i)=>({card,response:'possible response '+i}));
 const core={schema:'iron-lung/compass-comparison/v1',
  baseline:{steps:base,source},dyadNine:{steps:dyad(9),source},
  dyadTwentySeven:{steps:dyad(27),source},
  provider,requestCounts:{original:9,equalBudget:9,microquestions:27,total:45},
  result:'PROPOSALS_ONLY',humanApproval:false,fieldSelection:null};
 return {...core,comparisonSha256:hash(JSON.stringify(core))};
}
test('the equal-call budget and separate exploratory budget remain explicit',()=>{
 const p=packet(),r=evaluateComparison(p);
 assert.equal(r.equalInferenceBudget.prose,9);
 assert.equal(r.equalInferenceBudget.compass,9);
 assert.equal(r.exploratoryMicroBudget.compass,27);
 assert.equal(r.exploratoryMicroBudget.confoundedByAdditionalCalls,true);
 assert.equal(r.autoPromotedCapabilities,0);
 assert.equal(r.scoreStatus,'LEXICAL_DIAGNOSTICS_NOT_QUALITY_PROOF');
 assert.equal(r.views.compassNine.cardLinesOverThreeWords,0);
 assert.equal(r.views.compassNine.cardLinesUnderTwoWords,0);
});
test('forged model comparison and invalid long prompt lines are rejected',()=>{
 const p=packet();
 p.comparisonSha256='0'.repeat(64);
 assert.throws(()=>evaluateComparison(p),/COMPARISON_DIGEST/);
 const q=packet();
 q.dyadNine.steps[0].card='FACT stated extra extra extra';
 const {comparisonSha256,...core}=q;
 q.comparisonSha256=hash(JSON.stringify(core));
 assert.throws(()=>evaluateComparison(q),/NOT_DYADS/);
});
test('HTML review escapes generated content rather than injecting it into reviewer page',()=>{
 const p=packet(),r=evaluateComparison(p);
 p.dyadNine.steps[0].response='<img src=x onerror=alert(1)>';
 const html=reviewHTML(p,r);
 assert.ok(html.includes('&lt;img'));
 assert.ok(!html.includes('<img src=x'));
 assert.ok(html.includes('FACT stated'));
});
test('inspect mode never takes authorizations or runs a model',()=>{
 assert.throws(()=>run(['inspect','--lung','/tmp','--authorize','SYNTHETIC_TEST_ONLY']),/READ_ONLY/);
 assert.throws(()=>run(['build','--lung','/tmp']),/MISSING_/);
});
