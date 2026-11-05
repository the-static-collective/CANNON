import test, {before} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {
  CHECKPOINT, HOLD, selection, verifyOriginalSource, runOriginalWithTests,
  reviewNative, buildReceipt, sha256, stable, gitBlob, inspectSelectedSource
} from './cannon-door.mjs';

const source = process.env.MOTIF_SOURCE;
assert.ok(source, 'MOTIF_SOURCE must be exact owner checkout');
let manifest, proof, native;

before(()=>{
  manifest=selection();
  proof=verifyOriginalSource(source, manifest);
  native=runOriginalWithTests(source);
});
function cloneDoor() {return structuredClone(native.result);}
function cloneDenied(){return structuredClone(native.denied);}
function cloneSelection(){return structuredClone(manifest);}
function check(d, h=cloneDenied(), m=manifest, p=proof){
  return reviewNative(d,h,m,p);
}
function redaction(d){
  const {content_sha256, ...rest}=d;
  return {...rest, content_sha256:sha256(rest)};
}
function withSelection(mutator) {
  const tmp=mkdtempSync(join(tmpdir(),'cannon-selection-'));
  const path=join(tmp,'selection.json');
  try {
    const doc=cloneSelection();
    mutator(doc);
    writeFileSync(path, JSON.stringify(doc));
    return selection(path);
  } finally {rmSync(tmp,{recursive:true,force:true});}
}

test('CANNON selects actual unmerged MOTIF branch commit, not main',()=>{
  assert.equal(manifest.selected_commit,CHECKPOINT);
  assert.equal(manifest.role,'SOURCE_SELECTED_FOR_INDEPENDENT_REVIEW');
  assert.equal(manifest.disposition,'HOLD_FOR_INDEPENDENT_RECEIVER_REVIEW');
  assert.equal(proof.commit,CHECKPOINT);
  assert.equal(proof.files.length,6);
  assert.equal(proof.native_registry_contracts,5);
});
test('CANNON computes the true Git blob SHA with NUL framing',()=>{
  const p=join(source,'experiments/door-foundry-001/door_foundry.py');
  assert.equal(gitBlob(readFileSync(p)),manifest.pinned_files[
    'experiments/door-foundry-001/door_foundry.py']);
  assert.notEqual(gitBlob(Buffer.from('altered')),manifest.pinned_files[
    'experiments/door-foundry-001/door_foundry.py']);
});
test('original MOTIF native tests and both synthetic exercises executed',()=>{
  assert.equal(native.owner_tests_exit_zero,true);
  assert.equal(native.result.stage,'PROPOSED');
  assert.equal(native.denied.stage,'HOLD');
  assert.equal(native.result.composition.length,5);
});
test('independent CANNON review accepts exact typed native owner evidence',()=>{
  const assessed=check(cloneDoor());
  assert.equal(assessed.capabilities_replayed,5);
  assert.equal(assessed.ordinary_fixed_planner_also_succeeds,true);
  assert.equal(assessed.door_status,'PROPOSED_NOT_OBSERVED');
});
test('receiver packet is deterministic and retains independent HOLD',()=>{
  const packet=buildReceipt(manifest,proof,native);
  assert.equal(packet.content_sha256,sha256(
    Object.fromEntries(Object.entries(packet).filter(([k])=>k!=='content_sha256'))));
  assert.equal(packet.disposition,'HOLD_FOR_INDEPENDENT_RECEIVER_REVIEW');
  assert.equal(packet.selection.selected_as_canon,false);
  assert.equal(packet.source.source_is_not_main,true);
  assert.equal(packet.actor_or_receiver_authorized,false);
  assert.equal(packet.external_effects_performed,false);
  assert.equal(packet.evidence.observed_human_outcome,false);
  assert.deepEqual(packet,buildReceipt(manifest,proof,native));
});
test('no auto-admission from successful source owner unit suite',()=>{
  const p=buildReceipt(manifest,proof,native);
  assert.equal(p.evidence.native_owner_tests_passed,true);
  assert.equal(p.selection.permission_to_execute_externally,false);
  assert.equal(p.no_auto_merge,true);
});
test('forged real-world action, with updated checksum, is still refused',()=>{
  const d=cloneDoor();d.external_action_executed=true;
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('forged observation, with updated checksum, is still refused',()=>{
  const d=cloneDoor();d.observed_outcome={confirmed:true};
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('forged stage ACTED is still refused',()=>{
  const d=cloneDoor();d.stage='ACTED';
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('rewriting synthetic digest is refused',()=>{
  const d=cloneDoor();d.predicted_new_facts=[];
  assert.throws(()=>check(d),HOLD);
});
test('erasing goal facts does not pass after recomputing digest',()=>{
  const d=cloneDoor();d.predicted_new_facts=[];
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('unrecognized output fields never acquire authority',()=>{
  const d=cloneDoor();d.recipient_approved=true;
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('altered source snapshot in native receipt is refused',()=>{
  const d=cloneDoor();d.composition[0].source_git_blob='f'.repeat(40);
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('typed dependency change or missing provider is refused',()=>{
  const d=cloneDoor();d.composition=d.composition.filter(x=>x.id!=='motif.003.scan-affordances');
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('dishonest reduced primitive step count is refused',()=>{
  const d=cloneDoor();d.replayed_macro.expanded_primitive_steps=1;
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('fixed classical success cannot be hidden',()=>{
  const d=cloneDoor();d.fixed_classical_baseline.original_002_goal_reached=false;
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('fake cost improvement cannot pass receipt check',()=>{
  const d=cloneDoor();d.declared_total_cost_units=1;
  assert.throws(()=>check(redaction(d)),HOLD);
});
test('denied simulated consent must HOLD',()=>{
  const denied=cloneDenied();denied.stage='PROPOSED';
  assert.throws(()=>check(cloneDoor(),denied),HOLD);
});
test('extra claim in denied outcome is refused',()=>{
  const denied=cloneDenied();denied.sent_to_human=true;
  assert.throws(()=>check(cloneDoor(),denied),HOLD);
});
test('fabricated selected repo cannot pass manifest validation',()=>{
  assert.throws(()=>withSelection(m=>{m.source_owner='fake/CANNON';}),HOLD);
});
test('fabricated selected commit cannot pass manifest validation',()=>{
  assert.throws(()=>withSelection(m=>{m.selected_commit='0'.repeat(40);}),HOLD);
});
test('manually promoted admission flag cannot pass',()=>{
  assert.throws(()=>withSelection(m=>{m.authority.admission=true;}),HOLD);
});
test('manually promoted signature flag cannot pass',()=>{
  assert.throws(()=>withSelection(m=>{m.authority.selection_signature=true;}),HOLD);
});
test('new unregistered adapter cannot sneak into manifest',()=>{
  assert.throws(()=>withSelection(m=>{m.expected_capabilities[0].handler='exec_arbitrary';}),HOLD);
});
test('source bytes cannot be repinned by editing manifest',()=>{
  assert.throws(()=>withSelection(m=>{m.pinned_files[
    'experiments/002/motif002.py']='0'.repeat(40);}),HOLD);
});
test('source checkout wrong SHA cannot be considered selected',()=>{
  const m=cloneSelection();m.selected_commit='0'.repeat(40);
  assert.throws(()=>verifyOriginalSource(source,m),HOLD);
});
test('origin syntax check is not treated as identity proof',()=>{
  assert.equal(proof.source_address_syntax_matches,true);
  assert.equal(proof.origin_is_authenticated,false);
});
test('native original result cannot be transplanted to a different selection',()=>{
  const p={...proof,commit:'0'.repeat(40)};
  assert.throws(()=>check(cloneDoor(),cloneDenied(),manifest,p),HOLD);
});
test('CANNON report has no autonomous write or contact capability',()=>{
  const packet=inspectSelectedSource(source);
  assert.equal(packet.selection.permission_to_execute_externally,false);
  assert.equal(packet.actor_or_receiver_authorized,false);
  assert.equal(packet.external_effects_performed,false);
});
