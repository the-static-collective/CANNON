import test,{before} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {GRAFT_SHA,SOURCE_PINS,HOLD,hash,sourceCheck,fixtures,
  syntheticSourcePacket,review} from './review.mjs';

const root=process.env.GRAFT_SOURCE;
assert.ok(root,'GRAFT_SOURCE is required and must be exact owner checkout');
let packet;
before(async()=>{packet=await review(root)});
test('exact independently pinned original GRAFT commit not main',()=>{
 const proven=sourceCheck(root);
 assert.equal(packet.selected_graft.commit,GRAFT_SHA);
 assert.equal(packet.selected_graft.branch_is_not_main,true);
 assert.equal(proven.length,5);
 assert.deepEqual(proven,packet.selected_graft.source_files);
});
test('actual GRAFT closed-template source, not a CANNON copy, generated the new organ',()=>{
 assert.equal(packet.selected_operator.origin,'ORIGINAL_GRAFT_027_COMPILED_SOURCE');
 assert.equal(packet.selected_operator.source_sha256,
   createHash('sha256').update(packet.selected_operator.source).digest('hex'));
 assert.equal(packet.selected_operator.source_installed_in_motif,false);
 assert.equal(packet.selected_operator.network_authority,'NONE');
 assert.equal(packet.selected_operator.selector.join('.'),'observed.reachable_actions');
});
test('GRAFT source owner compiler independently regenerates exact candidate',async()=>{
 const owner=await import(pathToFileURL(join(root,'src/capability-gardener-027.mjs')).href);
 const rerun=owner.compileVariant(packet.selected_operator.selector);
 assert.equal(rerun.source,packet.selected_operator.source);
 assert.equal(rerun.source_sha256,packet.selected_operator.source_sha256);
 assert.equal(rerun.code_installed,false);
});
test('new executable works on blind untouched final cases',async()=>{
 const {execute}=await import('data:text/javascript;base64,'+
   Buffer.from(packet.selected_operator.source).toString('base64'));
 for(const f of packet.final_blind_cases){
  const v=execute(f.response);
  assert.equal(v.status,'OBSERVED_NUMERIC_FIELD');
  assert.equal(v.value,f.expected);
 }
});
test('source owner generated multiple and rejects original decoy candidates',()=>{
 assert.ok(packet.original_graft_eval.variants_tested>=3);
 assert.ok(packet.original_graft_eval.rejected.some(x=>
   x.selector.join('.')==='advertised.reachable_actions'));
 assert.ok(packet.original_graft_eval.rejected.some(x=>x.failures.length>0));
});
test('a train-only shortcut loses, but matched-budget exhaustive baseline ties',()=>{
 const c=packet.independent_final_check;
 assert.equal(c.n,4);
 assert.equal(c.generated_correct,4);
 assert.equal(c.naive_train_only_baseline_correct,0);
 assert.equal(c.matched_holdout_informed_exhaustive_baseline_correct,4);
 assert.equal(c.superior_to_matched_classical_baseline,false);
 assert.equal(c.selection_holdout_used_by_graft,true);
});
test('ALEX-shaped discovery packet is labeled synthetic only',()=>{
 const f=syntheticSourcePacket();
 assert.equal(f.public_provider_proposals[0].operation.path,'/fictional');
 assert.equal(f.authority,'none');
 assert.equal(packet.source_packet.live_provider_discovered,false);
 assert.match(packet.source_packet.kind,/SYNTHETIC/);
});
test('every original negative fixture refuses field values',async()=>{
 const {execute}=await import('data:text/javascript;base64,'+
   Buffer.from(packet.selected_operator.source).toString('base64'));
 for(const f of fixtures().negative)
  assert.notEqual(execute(f.response).status,'OBSERVED_NUMERIC_FIELD');
});
test('packet has no production rights or external effects',()=>{
 assert.equal(packet.disposition,'HOLD_FOR_MOTIF_LOCAL_SYNTHETIC_REVIEW');
 assert.equal(packet.is_signed,false);
 assert.equal(packet.received_by_motif,false);
 assert.equal(packet.observed_real_world_outcome,false);
 assert.ok(Object.values(packet.authority).every(x=>x===false));
});
test('serialized receipt content digest matches intact claims',()=>{
 const {content_sha256,...body}=packet;
 assert.equal(hash(body),content_sha256);
});
test('GRAFT original source verifier holds on incorrect checkout',()=>{
 assert.throws(()=>sourceCheck(process.cwd()),HOLD);
});
test('new generated source is data-only numeric projection without I/O calls',()=>{
 assert.ok(!packet.selected_operator.source.includes('fetch('));
 assert.ok(!packet.selected_operator.source.includes('require('));
 assert.ok(!packet.selected_operator.source.includes('writeFileSync('));
 assert.match(packet.selected_operator.source,/const FIELD_PATH=/);
});
