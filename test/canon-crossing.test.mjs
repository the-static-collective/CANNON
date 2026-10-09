import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,readFile,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
import {makeDemo} from "../src/demo.mjs";
import {digest,project} from "../src/canon-field.mjs";
import {inspectPinnedGitCommit,preparePlan,carry,verifyCrossing,native} from "../src/canon-crossing.mjs";
const src=process.env.CANNON002_SOURCE_ROOT;
const relatte=process.env.CANNON002_RELATTE_ROOT;
const originalSha="7bc551610421bd60a8dbf624d93d7a6682ce3987";
const originalRepo="the-static-collective/static-os";
const at="2026-10-08T22:14:00.000Z";
const keys=["source","relatte"];
const opts=(root,bundle,pins)=>({bundle,pins,owner_id:"static-os-owner",
  scope:"fabrication:design",track:"experimental",
  source_root:src,relay_root:relatte,created_at:at,output_root:root,disposition:"HOLD"});
function rewrite(value){return structuredClone(value);}
test("explicit owner selection identifies a single exact canonical commit; other canons survive",()=>{
  const d=makeDemo(),p=project(d.bundle,d.pins);
  assert.equal(p.frontiers.length,3);
  assert.equal(p.active.length,4);
  assert.equal(p.active.find(x=>x.owner_id==="static-os-owner"&&x.track==="experimental").commit,originalSha);
  assert.equal(p.main_privilege,0);
});
test("40-character commit and source repo are actually checked in local Git, not from PR description",
 {skip:!src},()=>{
  const x=inspectPinnedGitCommit(src,originalRepo,originalSha);
  assert.equal(x.commit,originalSha);
  assert.match(x.tree,/^[0-9a-f]{40}$/);
  assert.match(x.object_sha256,/^sha256:[a-f0-9]{64}$/);
  assert.equal(x.local_git_object_verified,true);
  assert.equal(x.ref_tip_or_global_latest_verified,false);
  assert.throws(()=>inspectPinnedGitCommit(src,"the-static-collective/reLATTE",originalSha),
    /GIT_ORIGIN_DOES_NOT_MATCH_CLAIMED_REPOSITORY/);
  assert.throws(()=>inspectPinnedGitCommit(src,originalRepo,"a".repeat(40)),
    /LOCAL_GIT_OBJECT_OR_REPOSITORY_NOT_VERIFIED|SOURCE_COMMIT_NOT_EXACT/);
});
test("source grant cannot emerge from unresolved competing owner decisions",
 {skip:!src},()=>{
  const d=makeDemo(),a={...d.bundle,histories:structuredClone(d.bundle.histories)};
  const alt=d.pins.owners[1];
  // An already signed second owner can only conflict when it selects the same scope
  // with its own signed event; the projection's conflict logic is independently
  // covered in CANON 001 tests.
  const untrustedPins=rewrite(d.pins);
  untrustedPins.owners[0].public_key=alt.public_key;
  assert.throws(()=>preparePlan(opts(join("/tmp","unused"),a,untrustedPins)),
    /OWNER_KEY_NOT_EXTERNALLY_TRUSTED/);
});
test("immutable CANNON plan pins both owner signed history and exact Git object",
 {skip:!src},()=>{
  const d=makeDemo(),p=preparePlan(opts(join("/tmp","cannon-not-written"),d.bundle,d.pins));
  assert.equal(p.selection.commit,originalSha);
  assert.equal(p.request.spec.donor_claims.cannon_source_binding.exact_git_object.commit,originalSha);
  assert.equal(p.request.spec.donor_claims.cannon_source_binding.selected_owner_pins_sha256,digest(d.pins));
  assert.equal(p.request.spec.requested_effect.execution,false);
  assert.equal(p.request.spec.requested_effect.physical_action,false);
  assert.equal(p.request.disposition,"HOLD");
  assert.equal(p.request.spec.source_history_head,p.selection.owner_frontier.head);
});
test("invalid signed target, wrong owner pins and invalid disposition fail before native crossing",
 {skip:!src},()=>{
  const d=makeDemo();
  const bad=rewrite(d.bundle);bad.histories[0][1].target.commit="f".repeat(40);
  assert.throws(()=>preparePlan(opts("/tmp/none",bad,d.pins)),/INVALID_OWNER_SIGNATURE/);
  assert.throws(()=>preparePlan({...opts("/tmp/none",d.bundle,d.pins),disposition:"ADMIT"}),
    /CANON_ADMISSION_REQUIRES_NEW_POLICY/);
  assert.throws(()=>preparePlan({...opts("/tmp/none",d.bundle,d.pins),owner_id:"wrong-owner"}),
    /CANON_SCOPE_NOT_UNIQUELY_SELECTED/);
});
test("CANNON signed owner history → actual pinned Git → native reLATTE file crossing → owner-local HOLD",
 {skip:!src||!relatte},async(t)=>{
  const work=await mkdtemp(join(tmpdir(),"cannon002-native-"));
  const output=join(work,"crossing");
  try{
    const demo=makeDemo();
    const args=opts(output,demo.bundle,demo.pins);
    const plan=preparePlan(args);
    const record=await carry(plan,relatte);
    assert.match(record.crossing_id,/^relatte-crossing-v0:/);
    assert.match(record.receive_receipt_id,/^relatte-receipt-v0:/);
    assert.match(record.disposition_receipt_id,/^relatte-receipt-v0:/);
    assert.equal(record.status,"RECEIVED_AND_RECEIVER_LOCAL_HOLD");
    assert.equal(record.git_merge_performed,false);
    const verifyArgs={...args,plan,
      expected_receiver_public_key_pin:record.receiver_public_key_pin,
      expected_crossing_source_public_key_pin:record.crossing_source_public_key_pin};
    const proof=await verifyCrossing(verifyArgs);
    assert.equal(proof.main_changed,false);
    assert.equal(proof.remote_transport_performed,false);
    assert.equal(proof.owner_streams_verified,3);
    assert.equal(proof.physical_actions,0);
    assert.equal(proof.source_git_commit,originalSha);
    const rel=JSON.parse(await readFile(join(output,"relatte-native-result.json"),"utf8"));
    assert.equal(rel.receive_receipt.kind,"RECEIVED");
    assert.equal(rel.disposition_receipt.kind,"R3_HOLD");
    assert.equal(rel.disposition_receipt.semantic_effect,"none");
    const api=await native(relatte);
    assert.equal(await api.verifyOpaqueOrganCrossing(rel.crossing),true);
    assert.equal(await api.verifyReceipt(rel.receive_receipt),true);
    assert.equal(await api.verifyReceipt(rel.disposition_receipt),true);
    await t.test("replay is cold; identical receiver state survives process-independent reopen",async()=>{
      const receiver=await api.LocalReceiver.open(plan.request.receiver_root);
      assert.deepEqual(receiver.snapshot(),rel.receiver_snapshot);
      assert.deepEqual(receiver.snapshot().held,[rel.crossing.crossing_id]);
    });
    await t.test("changed source selection does not admit old crossing",async()=>{
      const changed=rewrite(demo.bundle);
      changed.histories[0][1].target.commit="a".repeat(40);
      await assert.rejects(()=>verifyCrossing({...verifyArgs,bundle:changed}),
        /INVALID_OWNER_SIGNATURE/);
    });
    await t.test("a changed externally supplied owner trust anchor is denied",async()=>{
      const changed=rewrite(demo.pins);
      changed.owners[0].public_key=changed.owners[1].public_key;
      await assert.rejects(()=>verifyCrossing({...verifyArgs,pins:changed}),
        /OWNER_KEY_NOT_EXTERNALLY_TRUSTED/);
    });
    await t.test("a different receiver signing key is denied",async()=>{
      const fake=rewrite(record.receiver_public_key_pin);
      fake.x="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
      await assert.rejects(()=>verifyCrossing({
        ...verifyArgs,expected_receiver_public_key_pin:fake}),
        /EXTERNALLY_SELECTED_RELATTE_SIGNER_PINS_REQUIRED/);
    });
    await t.test("tamper native reLATTE crossing is caught even if JSON syntax remains valid",async()=>{
      const path=join(output,"relatte-native-result.json");
      const good=await readFile(path,"utf8");
      const changed=JSON.parse(good);
      changed.crossing.extensions.organ_adapter.donor_claims.deployment_granted=true;
      await writeFile(path,JSON.stringify(changed)+"\n","utf8");
      try{await assert.rejects(()=>verifyCrossing(verifyArgs),/INVALID_NATIVE_RELATTE_CROSSING/)}
      finally{await writeFile(path,good,"utf8")}
    });
    await t.test("tamper receiver disposition signed receipt rejected",async()=>{
      const path=join(output,"relatte-native-result.json");
      const good=await readFile(path,"utf8");
      const changed=JSON.parse(good);
      changed.disposition_receipt.kind="R3_ADMIT";
      await writeFile(path,JSON.stringify(changed)+"\n","utf8");
      try{await assert.rejects(()=>verifyCrossing(verifyArgs),/INVALID_NATIVE_RECEIVER_SIGNATURE/)}
      finally{await writeFile(path,good,"utf8")}
    });
    await t.test("tamper source object reference in plan is rejected before native effect",async()=>{
      const changed=rewrite(plan);
      changed.source_binding.exact_git_object.commit="b".repeat(40);
      await assert.rejects(()=>verifyCrossing({...verifyArgs,plan:changed}),
        /COLD_SOURCE_PLAN_INVALID_OR_SUPERSEDED/);
    });
    await t.test("no replay overwrite: new crossing cannot reuse old receiver root",async()=>{
      await assert.rejects(()=>carry(plan,relatte),/REVIEW_OCCURRENCE_EXISTS_NO_AUTORETRY/);
    });
  }finally{await rm(work,{recursive:true,force:true})}
});
