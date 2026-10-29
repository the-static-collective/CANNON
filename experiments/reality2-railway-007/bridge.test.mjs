import test from 'node:test';import assert from 'node:assert/strict';
import {inventionSideQuest} from './bridge.mjs';
test('original 006 crossing either computes from exact owners or explicitly HOLDs',async()=>{
 const q=await inventionSideQuest();
 assert(['HYPOTHETICAL_SIDE_QUEST','HOLD_SOURCE_ANCESTRY_MISSING','HOLD_INCONCLUSIVE'].includes(q.status));
 assert.equal(q.schema,'reality2-railway-sidequest-v1');
 if(q.status==='HYPOTHETICAL_SIDE_QUEST'){
   assert.equal(q.baselineConditionallyFeasible,1);
   assert.equal(q.combinedConditionallyFeasible,4);
   assert.equal(q.additionalBeyondStrongestSingle,1);
   assert.equal(q.sourceEvidence,'SYNTHETIC_COMPUTED');
 }else{
   assert.equal(q.baselineConditionallyFeasible,null);
   assert.equal(q.sourceEvidence,'NOT_YET_ATTESTED');
 }
});
