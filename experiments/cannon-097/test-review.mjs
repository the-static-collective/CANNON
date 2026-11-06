import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,cpSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {review,verifyCase,optimal,replayOrigin,pinOriginal,HOLD} from './review.mjs';
import {verifyOriginalQuestion} from '../cannon-096/review.mjs';

const motif=process.env.MOTIF012_SOURCE;
const question=process.env.MOTIF009_QUESTION_DIR;
const hidden=process.env.MOTIF012_HIDDEN_DIR;
assert.ok(motif&&question&&hidden,'Missing original immutable source fixture inputs');
let checked,original,packet;
const read=x=>JSON.parse(readFileSync(x,'utf8'));
before(()=>{
 checked=review(motif,question,hidden);
 original=verifyOriginalQuestion(question);
 packet=read(join(hidden,'HIDDEN_SHARED','inference.json'));
});
const mutate=fn=>{const data=structuredClone(packet);fn(data);return data};
test('exact immutable MOTIF-012 source is byte and Git tree pinned',()=>{
 const pin=pinOriginal(motif);
 assert.equal(pin.commit,'cd4884af4cb456aeab07f8f5738d1df0f6d3c852');
 assert.equal(Object.keys(pin.blobs).length,2);
});
test('original four PNG world hypotheses are sourced and not observed',()=>{
 assert.equal(checked.original_four_png_worlds_sha256,original.content_sha256);
 assert.equal(original.custody.actual_answer_observed,false);
 assert.equal(checked.actual_human_evidence_authenticated,false);
});
test('all five latent provenance scenarios match an independent rational implementation',()=>{
 assert.equal(checked.five_finite_synthetic_cases.length,5);
 assert.ok(checked.five_finite_synthetic_cases.every(x=>
   x.human_source_attestations===0&&
   x.optimal_unsent_questions_independently_replayed===true));
});
test('hidden single common cause and genuine independent convergence are distinguished',()=>{
 const one=replayOrigin('SHARED_UPSTREAM_TOKEN').h[0];
 const five=replayOrigin('INDEPENDENT_CAPTURE_AUDIT').h[2];
 assert.ok(Number(one.n)/Number(one.d)>.95);
 assert.ok(Number(five.n)/Number(five.d)>.95);
});
test('mere textual similarity is not proof of shared ancestry',()=>{
 const weak=read(join(hidden,'SIMILAR_WORDING_ONLY','inference.json'));
 assert.equal(weak.no_decision_without_asking.action,'HOLD_NO_ORIGIN_CLAIM');
 assert.equal(weak.question_policy_up_to_two.kind,'ASK');
});
test('four visual worlds are still hypothetical even when a source partition is probable',()=>{
 assert.equal(checked.original_source_is_hypothetical,true);
 assert.equal(checked.external_source_independence_demonstrated,false);
 assert.equal(checked.global_model_generalization_demonstrated,false);
});
test('negative control rejects forged real human source identity',()=>{
 const x=mutate(z=>{z.authority.original_witness_identity_authenticated=true});
 assert.throws(()=>verifyCase(x,original,'HIDDEN_SHARED'),HOLD);
});
test('negative control rejects source cue claiming physical authentication',()=>{
 const x=mutate(z=>{z.joint_cue_evidence.external_authentication_performed=true});
 assert.throws(()=>verifyCase(x,original,'HIDDEN_SHARED'),HOLD);
});
test('negative control rejects reclassified independent source reports',()=>{
 const x=mutate(z=>{z.new_simulated_reports[1].upstream_receipt_supplied=true});
 assert.throws(()=>verifyCase(x,original,'HIDDEN_SHARED'),HOLD);
});
test('negative control rejects forged Bayesian source partition posterior',()=>{
 const x=mutate(z=>{z.source_origin_posterior.ONE_ORIGIN='1/2'});
 assert.throws(()=>verifyCase(x,original,'HIDDEN_SHARED'),HOLD);
});
test('negative control rejects changed cost-sensitive provenance question',()=>{
 const x=mutate(z=>{z.question_policy_up_to_two_loss=0});
 assert.throws(()=>verifyCase(x,original,'HIDDEN_SHARED'),HOLD);
});
test('negative control rejects missing or misordered source attribution receipt',()=>{
 const x=mutate(z=>{z.evidence_ledger[2].sequence=4});
 assert.throws(()=>verifyCase(x,original,'HIDDEN_SHARED'),HOLD);
});
test('independent original PNG custody detects a changed image byte',()=>{
 const tmp=mkdtempSync(join(tmpdir(),'cannon097-'));
 try{
   const p=join(tmp,'question');
   cpSync(question,p,{recursive:true});
   const f=join(p,'worlds','LEFT_FULL','start.png');
   writeFileSync(f,Buffer.concat([readFileSync(f),Buffer.from('tampered')]));
   assert.throws(()=>verifyOriginalQuestion(p));
 }finally{rmSync(tmp,{recursive:true,force:true})}
});
test('source review remains unsigned and no actual contacts or actions happen',()=>{
 assert.equal(checked.status,'HOLD_LATENT_ORIGIN_MATH_REPLAYED_WITNESSES_UNAUTHENTICATED');
 assert.equal(checked.signed,false);
 assert.equal(checked.people_contacted,0);
 assert.equal(checked.physical_actions,0);
 assert.equal(checked.source_deployments,0);
 assert.equal(checked.code_admitted,false);
});
