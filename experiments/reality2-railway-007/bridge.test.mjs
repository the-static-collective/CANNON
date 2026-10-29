import test from 'node:test';import assert from 'node:assert/strict';
import {inventionSideQuest} from './bridge.mjs';
test('source-owned Groovetown-006 portfolio powers optional read-only side quest',()=>{
 const q=inventionSideQuest();assert.equal(q.status,'HYPOTHETICAL_SIDE_QUEST');
 assert.equal(q.baselineConditionallyFeasible,1);assert.equal(q.combinedConditionallyFeasible,4);
 assert.equal(q.additionalBeyondStrongestSingle,1);assert.equal(q.sourceEvidence,'SYNTHETIC_COMPUTED');
 assert(q.limits.every(x=>typeof x==='string'));
});
