import test from 'node:test';
import assert from 'node:assert/strict';
import {run,buildQuestions,updateQuestions,html} from '../scripts/multi-repo-question-field.mjs';
const mk=record=>{
 const id=!record.source_locator?'source-object':!record.chronology?'chronology':!record.counterevidence?'counterevidence':'falsifier';
 return {schema:'national-treasure.question-receipt/v0',kind:'question_frontier',
  input:{clue:record.clue,claim:record.claim},
  evidence:{...record},aperture:{id,missing:id,reason:'Missing independent verification'},
  question:'Which source would falsify this crossing?',
  other_doors:[],non_claims:['Not answer','Not authority','Not historical truth','Not approval']};
};
const cases=[
 {id:'PLZ_TO_CANNON',from:'planz',to:'CANNON',fromType:'planZ-proposal',toType:'CANNON-plan',
  claim:'known original CANNON planZ use',sourceCase:'EXISTING_NATIVE_WITH_EXPLICIT_SELECTION',
  kind:'NATIVE_ROUTE_PREVIOUSLY_EXECUTED_BUT_SCHEMA_BRIDGE_NOT_A_FREE_CAST',evidenceClass:'primary',support:'possible',knownNative:true},
 ...['PLZ_TO_PLAYDECK','PLAYDECK_TO_TOASTER','TOASTER_TO_LEMONPRESS','PLAYDECK_TO_LEMONPRESS','CANNON_TO_TOASTER']
 .map(id=>({id,from:'playdeck',to:'toaster',fromType:'receipt one',toType:'receipt two',claim:'No verified adapter',
  sourceCase:'UNTESTED_CROSS_REPO_EDGE',kind:'HOLD_NO_TESTED_ADAPTER',evidenceClass:'speculation',support:'unsupported',knownNative:false}))
];
const inventory={schema:'cannon.verified-interface-inventory/v1',owners:[
 {id:'planz',files:[{locator:'https://github.com/the-static-collective/planZ/'}]},
 {id:'playdeck',files:[{locator:'https://github.com/the-static-collective/playdeck/'}]},
 {id:'toaster',files:[{locator:'https://github.com/the-static-collective/the-haunted-toaster/'}]}],
 interfaces:cases};
test('six actual-source cross contracts always start as research questions, not adapters',()=>{
 const q=buildQuestions(inventory,mk);
 assert.equal(q.namedCases,6);
 assert.equal(q.entries[0].question.aperture.id,'chronology');
 assert.ok(q.entries.slice(1).every(x=>x.question.aperture.id==='source-object'
  &&x.seed.source_locator===''&&x.seed.provenance_class==='speculation'
  &&x.status==='UNANSWERED_HELD'));
 assert.equal(q.independentlyProvenNewBridges,0);
 assert.equal(q.modelMayAdmitAnswers,false);
});
test('new date evidence advances only previously known CANNON route, never fictional adapters',()=>{
 const q=buildQuestions(inventory,mk);
 const next=updateQuestions(q,mk,{commit:'932c3400903123630d1dc6957ee38ae955944930',
  date:'2026-10-29T19:38:37.000Z',scope:'OBSERVED_SINGLE_COMMIT_NOT_EARLIEST_HISTORY'});
 assert.equal(next[0].nextAperture,'counterevidence');
 assert.equal(next[0].unanswered,true);
 assert.ok(next.slice(1).every(x=>x.nextAperture==='source-object'
  &&x.modelInfluencedNextQuestion===false));
 const changed=structuredClone(q);changed.entries[1].seed.source_locator='invented';
 assert.throws(()=>updateQuestions(changed,mk,{commit:'932c3400903123630d1dc6957ee38ae955944930',
  date:'2026-10-29T19:38:37.000Z',scope:'OBSERVED_SINGLE_COMMIT_NOT_EARLIEST_HISTORY'}),/UNKNOWN_STAYS_UNKNOWN/);
});
test('HTML reviewer escapes untrusted proposed source claims',()=>{
 const q=buildQuestions(inventory,mk),n=updateQuestions(q,mk,{
  commit:'932c3400903123630d1dc6957ee38ae955944930',
  date:'2026-10-29T19:38:37.000Z',
  scope:'OBSERVED_SINGLE_COMMIT_NOT_EARLIEST_HISTORY'});
 q.entries[1].seed.clue='<script>unsafe</script>';
 const page=html(q,n);
 assert.ok(page.includes('&lt;script&gt;unsafe'));
 assert.ok(!page.includes('<script>unsafe</script>'));
});
test('list is read-only; build does not silently select or execute repository crossings',async()=>{
 const list=await run(['list']);
 assert.equal(list.edges.length,6);
 assert.equal(list.owners.length,4);
 assert.equal(list.noRuntimeExecuted,true);
 await assert.rejects(run(['list','--authorize','SYNTHETIC_TEST_ONLY']),/LIST_READ_ONLY/);
 await assert.rejects(run(['build','--owners','/tmp/x','--treasure','/tmp/y','--out','/tmp/z']),/AUTHORIZE/);
});
