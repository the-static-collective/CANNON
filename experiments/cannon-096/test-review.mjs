import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,cpSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {review,verifyReplay,verifyPinnedSource,verifyOriginalQuestion,
   F,parseFraction,sha,HOLD,MOTIF_COMMIT,SOURCE_BLOB} from './review.mjs';
const motif=process.env.MOTIF_SOURCE;
const question=process.env.MOTIF009_QUESTION_DIR;
const reportdir=process.env.MOTIF011_LEDGER_DIR;
assert.ok(motif&&question&&reportdir,'Original pinned checkout and synthetic report ledger required');
let audit,original,p;
before(()=>{
 audit=review(motif,question,reportdir);
 original=verifyOriginalQuestion(question);
 p=JSON.parse(readFileSync(join(reportdir,'LEFT_PARTIAL','replay.json'),'utf8'));
});
function mutate(fn){
 const x=JSON.parse(JSON.stringify(p));
 fn(x);
 return x;
}
function rehashReport(x){
 const r=x.steps[1].report;
 const {content_sha256,...body}=r;
 r.content_sha256=sha(body);
 const step=x.steps[1];
 step.report_sha256=r.content_sha256;
 const {content_sha256:oldHash,...row}=step;
 step.content_sha256=sha(row);
 const {content_sha256:__,...whole}=x;
 x.content_sha256=sha(whole);
 return x;
}
test('exact original MOTIF-011 code and Git source blob are verified',()=>{
 assert.equal(verifyPinnedSource(motif).commit,MOTIF_COMMIT);
 assert.equal(audit.original_motif_source.source_git_blob_sha1,SOURCE_BLOB);
});
test('authentic source PNG bytes, unadmitted GRAFT and held original questions',()=>{
 assert.equal(audit.original_009_png_question_sha256,original.content_sha256);
 assert.equal(audit.initial_four_png_worlds_byte_verified,true);
 assert.equal(original.custody.actual_answer_observed,false);
});
test('four genuinely independent CANNON rational replays over four distinct truth fixtures',()=>{
 assert.equal(audit.status,'HOLD_DEPENDENCY_STRUCTURE_VERIFIED_SOURCE_INDEPENDENCE_UNATTESTED');
 assert.equal(audit.report_groups_verified,4);
 assert.equal(audit.independent_rational_replays.length,4);
 assert.ok(audit.independent_rational_replays.every(x=>
   x.report_count===10&&x.distinct_root_count===4&&
   x.dependent_copies===6&&x.root_only_Bayes_independently_verified===true));
});
test('seventy percent style duplicated rumor is rejected as seven independent roots',()=>{
 const left=audit.independent_rational_replays.find(x=>x.truth==='LEFT_PARTIAL');
 assert.ok(left.grouped_true_extent_probability>.79);
 assert.ok(left.naive_true_extent_probability<.002);
});
test('rational exact arithmetic remains canonical',()=>{
 assert.deepEqual(F(8,10),{n:4n,d:5n});
 assert.deepEqual(parseFraction('4/5'),F(4,5));
 assert.throws(()=>parseFraction('9/09'),HOLD);
});
test('CANNON receipt proves only provenance structure not actual witness identity',()=>{
 assert.equal(audit.independent_witness_identity_confirmed,false);
 assert.equal(audit.externally_signed,false);
 assert.equal(audit.human_contacts,0);
 assert.equal(audit.physical_actions,0);
 assert.equal(audit.automatic_admission,false);
 const {content_sha256,...b}=audit;assert.equal(sha(b),content_sha256);
});
test('cross-origin mutation is refused even if report hashes are rewritten',()=>{
 const x=rehashReport(mutate(r=>{r.steps[1].report.origin_id='B'}));
 assert.throws(()=>verifyReplay(x,original),HOLD);
});
test('copied witness self-declared independence is refused even if rehashed',()=>{
 const x=rehashReport(mutate(r=>{r.steps[1].report.claimed_independent_root=true}));
 assert.throws(()=>verifyReplay(x,original),HOLD);
});
test('forged human observation is refused even if nested hashes are changed',()=>{
 const x=rehashReport(mutate(r=>{r.steps[1].report.actual_human_witness=true}));
 assert.throws(()=>verifyReplay(x,original),HOLD);
});
test('malformed posterior cannot masquerade as Bayesian revision',()=>{
 const x=mutate(r=>{r.steps[1].posterior.LEFT_PARTIAL='1/2'});
 const {content_sha256,...b}=x;x.content_sha256=sha(b);
 assert.throws(()=>verifyReplay(x,original),HOLD);
});
test('report graph without original 009 bytes never passes independent review',()=>{
 const tmp=mkdtempSync(join(tmpdir(),'cannon096-'));
 try{
   cpSync(question,join(tmp,'question'),{recursive:true});
   const f=join(tmp,'question','worlds','LEFT_FULL','start.png');
   writeFileSync(f,Buffer.concat([readFileSync(f),Buffer.from('tamper')]));
   assert.throws(()=>verifyOriginalQuestion(join(tmp,'question')),HOLD);
 }finally{rmSync(tmp,{recursive:true,force:true});}
});
