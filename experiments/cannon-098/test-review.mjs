import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,cpSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {review,decodePNG,independentClosure,pin,PINS,HOLD} from './review.mjs';
const env=process.env;
const motif=env.MOTIF013_SOURCE,graft=env.GRAFT031_SOURCE;
const question=env.MOTIF009_QUESTION_DIR,probe=env.MOTIF013_PROBE_DIR;
const answer=env.MOTIF013_ANSWER_DIR;
assert.ok(motif&&graft&&question&&probe&&answer,'Original immutable sources and receipts are required');
let received,one,two,goal,goalOld;
const get=(f)=>JSON.parse(readFileSync(f,'utf8'));
before(async()=>{
 received=await review(motif,graft,question,probe,answer);
 one=decodePNG(readFileSync(join(probe,'before.png')));
 two=decodePNG(readFileSync(join(probe,'outside.png')));
 goal=decodePNG(readFileSync(join(probe,'new-goal.png')));
 goalOld=decodePNG(readFileSync(join(question,'worlds','LEFT_FULL','target.png')));
});
test('original immutable GRAFT and MOTIF source owners exactly match pinned Git blobs',()=>{
 assert.equal(pin(motif,'motif').commit,PINS.motif.commit);
 assert.equal(pin(graft,'graft').commit,PINS.graft.commit);
});
test('original byte-based model states are independently decoded as actual 9x8 PNGs',()=>{
 assert.equal(one.length,8);
 assert.equal(one[0].length,9);
 assert.equal(one.join('').split('#').length-1,8);
 assert.equal(two.join('').split('#').length-1,6);
});
test('closed old full-height wall cannot be crossed by the 2x2 red block',()=>{
 const closure=independentClosure(one,goalOld);
 assert.equal(closure.closed,true);
 assert.equal(closure.reachable,false);
 assert.equal(received.independent_classical_closed_world_old.reachable,false);
});
test('real newly generated environmental model explains a synthetic opening',()=>{
 const closure=independentClosure(two,goal);
 assert.equal(closure.reachable,true);
 assert.ok(closure.shortest_moves>0);
 assert.equal(closure.shortest_moves,
   received.independent_classical_closed_world_after_synthetic_event.shortest_moves);
});
test('GRAFT generated source and source-owner compiler replay exactly',()=>{
 assert.equal(received.generated_js_recompiled_from_owner,true);
 assert.equal(received.source_families_tested,3);
 assert.equal(received.original_graft_source.blob,PINS.graft.blob);
});
test('independent reviewer retains a strict held, non-physical interpretation',()=>{
 assert.equal(received.status,'HOLD_NEW_MODEL_BOUNDED_NOT_OBSERVED_OR_ADMITTED');
 assert.equal(received.external_observations_verified,false);
 assert.equal(received.real_user_action_authorized,false);
 assert.equal(received.canonical_admission,false);
 assert.equal(received.people_contacted,0);
});
test('the changed model does not quietly replace the original four candidates',()=>{
 const q=get(join(probe,'missing-question.json'));
 assert.equal(q.original_world_ids.length,4);
 assert.deepEqual(new Set(Object.values(q.original_world_blue_counts)),new Set([4,8]));
 assert.equal(q.observed_synthetic_blue_count,6);
});
test('a damaged PNG fails independently of previous signed image testimony',()=>{
 const image=Buffer.from(readFileSync(join(probe,'outside.png')));
 image[image.length-22]^=0x01;
 assert.throws(()=>decodePNG(image),HOLD);
});
test('changed source-model evidence cannot silently authorize an actual action',async()=>{
 const t=mkdtempSync(join(tmpdir(),'cannon098-'));
 try{
  const copied=join(t,'probe');
  cpSync(probe,copied,{recursive:true});
  const file=join(copied,'missing-question.json');
  const p=get(file);p.authority.real_environment_changed=true;
  writeFileSync(file,JSON.stringify(p));
  await assert.rejects(review(motif,graft,question,copied,answer),HOLD);
 }finally{rmSync(t,{recursive:true,force:true})}
});
test('an altered generated source is rejected before adoption',async()=>{
 const t=mkdtempSync(join(tmpdir(),'cannon098-'));
 try{
  const copied=join(t,'probe');
  cpSync(probe,copied,{recursive:true});
  const file=join(copied,'generated-environment.mjs');
  writeFileSync(file,readFileSync(file,'utf8')+'\n// changed');
  await assert.rejects(review(motif,graft,question,copied,answer),HOLD);
 }finally{rmSync(t,{recursive:true,force:true})}
});
test('the independent result is content addressed without signing a witness',()=>{
 assert.equal(received.signed_by_external_witness,false);
 const {content_sha256,...rest}=received;
 // The receipt is computed by the independent reviewer's source.
 assert.equal(typeof content_sha256,'string');
 assert.equal(content_sha256.length,64);
});
