import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {join} from 'node:path';
import {review,checkSource,originalControl,proofCheck,sha,HOLD,
 GRAFT_COMMIT,MOTIF_ORIGINAL} from './verify.mjs';
const graft=process.env.GRAFT_SOURCE;
const motif=process.env.MOTIF_ORIGINAL;
const gapFile=process.env.MOTIF_GAP;
assert.ok(graft&&motif&&gapFile,'Exact owner checkout and generated gap required');
let packet,gap,source;
before(async()=>{
 gap=JSON.parse(readFileSync(gapFile,'utf8'));
 packet=await review(graft,motif,gap);
 source=await import(pathToFileURL(join(graft,'src/missing-operator-forge-029.mjs')).href);
});
test('original source branches verified by exact immutable SHA and Git blobs',()=>{
 const r=checkSource(graft,GRAFT_COMMIT,
  {'src/missing-operator-forge-029.mjs':'3ce0366a26b927a63cf22f0e99a70e4f3db89258'});
 assert.equal(r.length,1);assert.equal(packet.source_owner.commit,GRAFT_COMMIT);
 assert.equal(packet.original_original_motif_commit,MOTIF_ORIGINAL);
});
test('GRAFT reads a genuine prior MOTIF missing-verb invariant',()=>{
 assert.equal(proofCheck(gap),gap.content_sha256);
 assert.equal(gap.requested_goal.join('/'),'inspected/bike1');
 assert.equal(packet.synthetic_original_fixed_grammar_unreachable,true);
});
test('source-native original MOTIF 002 control exhaustively excludes new predicate',()=>{
 const c=originalControl(motif,source.casesForSyntheticGraph().train);
 assert.equal(c.fixed_verb_count,2);
 assert.equal(c.fixed_step8_reaches,false);
 assert.equal(c.invariant_holds,true);
 assert.equal(c.fair_classical_denied_permission_leak,false);
});
test('original GRAFT compiler generated new source absent initial MOTIF repertoire',()=>{
 assert.equal(packet.generated.head_relation,'inspected');
 assert.deepEqual(packet.generated.required_guards,['broken','permits']);
 assert.equal(packet.generated.genuine_original_graft_compiler,true);
 assert.equal(packet.generated.installed,false);
 assert.equal(packet.generated.source_sha256,
  sha(packet.generated.source));
});
test('original source module independently reproduces new generated JS',()=>{
 const a=source.compileVariant(gap,packet.generated.required_guards);
 assert.equal(a.source,packet.generated.source);
 assert.equal(a.source_sha256,packet.generated.source_sha256);
});
test('two weaker hypotheses failed, exact combined guard survives',()=>{
 assert.equal(packet.native_evidence.variants_generated,3);
 assert.equal(packet.native_evidence.rejected.length,2);
 assert.ok(packet.native_evidence.rejected.every(v=>v.failures.length>0));
});
test('six genuinely untouched trial inputs validated outside original GRAFT selection',()=>{
 assert.equal(packet.independent_final.n,6);
 assert.equal(packet.independent_final.correct,6);
 assert.equal(packet.independent_final.positives,2);
 assert.equal(packet.independent_final.negatives,4);
});
test('permission denial never becomes execution or fake source authority',()=>{
 assert.equal(packet.status,'HOLD_GENERATED_OPERATOR_UNADMITTED');
 assert.equal(packet.consent_from_packet,false);
 assert.equal(packet.signed,false);
 assert.equal(packet.operator_admitted,false);
 assert.equal(packet.automatic_repo_writes,0);
 assert.equal(packet.external_requests,0);
});
test('classical equivalence is explicit; no unearned general capability claim',()=>{
 assert.equal(packet.fair_classical_learner_can_receive_same_examples,true);
 assert.equal(packet.superior_to_classical_not_claimed,true);
 assert.equal(packet.no_observed_physical_inspection,true);
});
test('CANNON receipt content can be independently rehashed',()=>{
 const {content_sha256,...body}=packet;
 assert.equal(sha(body),content_sha256);
});
test('changed source commit is explicitly refused',()=>{
 assert.throws(()=>checkSource(process.cwd(),GRAFT_COMMIT,
  {'src/missing-operator-forge-029.mjs':'3ce0366a26b927a63cf22f0e99a70e4f3db89258'}),HOLD);
});
test('fake permission or modified goal fails even if receipt rehashed',()=>{
 const p=JSON.parse(JSON.stringify(gap));
 p.permission_to_deploy=true;
 const {content_sha256,...body}=p;
 p.content_sha256=sha(body);
 assert.throws(()=>proofCheck(p),HOLD);
 const q=JSON.parse(JSON.stringify(gap));
 q.requested_goal=['permits','bike1'];
 const {content_sha256:c,...b}=q;
 q.content_sha256=sha(b);
 assert.throws(()=>proofCheck(q),HOLD);
});
