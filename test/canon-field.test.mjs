import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,readFileSync,rmSync,writeFileSync,existsSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {canonical,digest,newOwner,signEvent,project,EVENT_SCHEMA,BUNDLE_SCHEMA,PINS_SCHEMA} from "../src/canon-field.mjs";
import {makeDemo} from "../src/demo.mjs";

const clone=x=>structuredClone(x);
const at=(s=0)=>new Date(Date.UTC(2026,9,8,12,s,0)).toISOString();
function target(commit="a".repeat(40),ref_hint="main"){
  return {repository:"the-static-collective/example",commit,ref_hint,evidence:["EVIDENCE CLAIM ONLY"]};
}
function fixture(){
  const owner=newOwner();
  const pins={schema:PINS_SCHEMA,owners:[{owner_id:"source-owner",public_key:owner.public_key}]};
  const events=[];
  const append=({action="ADMIT",track="experimental",scope="domain:design",commit="a".repeat(40),
                 replaces=null,occurred_at=at(events.length),ref_hint="main",targetOverride}={})=>{
    const event=signEvent({
      schema:EVENT_SCHEMA,owner_id:"source-owner",seq:events.length,
      previous:events.length?digest(events.at(-1)):null,
      occurred_at,scope,track,action,
      target:targetOverride??(action==="ADMIT"?target(commit,ref_hint):null),
      replaces,authority:"CANON_SELECTION_ONLY",public_key:owner.public_key
    },owner.private_key);
    events.push(event);return event;
  };
  return {owner,pins,events,append,bundle:()=>({schema:BUNDLE_SCHEMA,histories:[events]})};
}
test("three independent synthetic owners: no branch merges, all three canons survive",()=>{
  const {bundle,pins,view}=makeDemo();
  const cold=project(JSON.parse(JSON.stringify(bundle)),JSON.parse(JSON.stringify(pins)));
  assert.deepEqual(view,cold);
  assert.equal(view.frontiers.length,3);
  assert.equal(view.historical_events.length,7);
  assert.equal(view.active.length,4);
  assert.equal(view.automatic_merges,0);
  assert.equal(view.main_privilege,0);
  assert.equal(view.deployment_grants,0);
  assert.equal(view.physical_execution_grants,0);
  assert.equal(view.conflicts.length,0);
  const c=view.active.find(v=>v.owner_id==="static-os-owner"&&v.track==="experimental");
  assert.equal(c.commit,"7bc551610421bd60a8dbf624d93d7a6682ce3987");
  assert.equal(view.active.find(v=>v.owner_id==="static-os-owner"&&v.track==="historical").commit,
    "a97bf1e20b97eab060d6180cd7f4156ccc644b69");
  assert.equal(view.active.find(v=>v.owner_id==="ghot-owner").repository,"the-static-collective/GHoT");
  assert.equal(view.active.find(v=>v.owner_id==="relatte-owner").repository,"the-static-collective/reLATTE");
});
test("canon is not simply default branch, merged state or most recent SHA",()=>{
  const f=fixture();f.append({ref_hint:"main"});const v=project(f.bundle(),f.pins);
  assert.equal(v.active.length,1);assert.equal(v.active[0].ref_hint,"main");
  assert.equal(v.active[0].authority,"CANON_SELECTION_ONLY");
  assert.equal(v.active[0].git_object_verified,false);
  assert.equal(v.active[0].test_results_verified,false);
  assert.equal(v.active[0].physical_or_deployment_permission,false);
});
test("supersession preserves historical source and selects only exact successor SHA",()=>{
  const f=fixture();const a=f.append();const b=f.append({commit:"b".repeat(40),replaces:digest(a)});
  const v=project(f.bundle(),f.pins);
  assert.equal(v.active.length,1);assert.equal(v.active[0].commit,"b".repeat(40));
  assert.equal(v.historical_events[0].hash,digest(a));
  assert.equal(v.historical_events[1].replaces,digest(a));
  assert.notEqual(digest(a),digest(b));
});
test("withdrawal does not imply deletion, globally absent history or new action",()=>{
  const f=fixture();const a=f.append();f.append({action:"WITHDRAW",replaces:digest(a)});
  const v=project(f.bundle(),f.pins);
  assert.equal(v.active.length,0);assert.equal(v.historical_events.length,2);
  assert.equal(v.historical_events[0].action,"ADMIT");
  assert.equal(v.historical_events[1].action,"WITHDRAW");
});
test("withdrawal requires an actual active signed selection and exact referent",()=>{
  const f=fixture();f.append({action:"WITHDRAW",replaces:"sha256:"+"a".repeat(64)});
  assert.throws(()=>project(f.bundle(),f.pins),/WITHDRAWAL_DOES_NOT_REFERENCE_CURRENT/);
  const g=fixture();g.append();g.append({action:"WITHDRAW",replaces:"sha256:"+"0".repeat(64)});
  assert.throws(()=>project(g.bundle(),g.pins),/WITHDRAWAL_DOES_NOT_REFERENCE_CURRENT/);
});
test("new canonical ADMIT must explicitly supersede previous active selection",()=>{
  const f=fixture();f.append();f.append({commit:"b".repeat(40)});
  assert.throws(()=>project(f.bundle(),f.pins),/ADMISSION_MUST_EXPLICITLY_SUPERSEDE/);
});
test("withdraw and readmit independently; no stale grant or stale selection revived",()=>{
  const f=fixture();const a=f.append();const w=f.append({action:"WITHDRAW",replaces:digest(a)});
  const next=f.append({commit:"c".repeat(40)});
  const v=project(f.bundle(),f.pins);
  assert.equal(v.active[0].commit,"c".repeat(40));
  assert.equal(v.historical_events[1].hash,digest(w));
  assert.equal(v.historical_events[2].hash,digest(next));
});
test("tampering exact branch hint or commit denies same owner signature",()=>{
  for(const field of ["commit","ref_hint","evidence"]){
    const f=fixture();f.append();const b=clone(f.bundle());
    b.histories[0][0].target[field]=field==="evidence"?["FALSE"]:"changed";
    assert.throws(()=>project(b,f.pins),/INVALID_OWNER_SIGNATURE|INVALID_COMMIT_OR_CLAIMED_EVIDENCE/);
  }
});
test("forged claims and recomputed display digest cannot mint physical execution",()=>{
  const f=fixture();f.append();const b=clone(f.bundle());
  b.histories[0][0].authority="HARDWARE_START";
  assert.throws(()=>project(b,f.pins),/INVALID_CANON_EVENT/);
  const v=project(f.bundle(),f.pins);
  v.active[0].physical_or_deployment_permission=true;
  assert.equal(project(f.bundle(),f.pins).active[0].physical_or_deployment_permission,false);
});
test("attacker resiging with new key does not replace externally pinned owner",()=>{
  const f=fixture();f.append();const attacker=newOwner();
  const body=clone(f.events[0]);delete body.signature;body.public_key=attacker.public_key;
  const bad=signEvent(body,attacker.private_key);
  assert.throws(()=>project({schema:BUNDLE_SCHEMA,histories:[[bad]]},f.pins),/OWNER_KEY_NOT_EXTERNALLY_TRUSTED/);
});
test("duplicate owner histories and owner omitted from externally pinned checkpoint fail",()=>{
  const f=fixture();f.append();
  assert.throws(()=>project({schema:BUNDLE_SCHEMA,histories:[f.events,f.events]},f.pins),
    /UNTRUSTED_OR_DUPLICATED_OWNER_HISTORY/);
  const view=project(f.bundle(),f.pins);
  const cp={schema:"cannon.observer-checkpoint/v1",frontiers:view.frontiers};
  assert.throws(()=>project({schema:BUNDLE_SCHEMA,histories:[]},f.pins,cp),
    /CHECKPOINT_OWNER_HISTORY_OMITTED/);
});
test("rollback or equivocation against separately pinned observer frontier denied",()=>{
  const f=fixture();f.append();const checkpoint={
    schema:"cannon.observer-checkpoint/v1",
    frontiers:project(f.bundle(),f.pins).frontiers
  };
  const a=f.events[0];f.append({commit:"b".repeat(40),replaces:digest(a)});
  const stronger={schema:"cannon.observer-checkpoint/v1",
    frontiers:project(f.bundle(),f.pins).frontiers};
  assert.throws(()=>project({schema:BUNDLE_SCHEMA,histories:[[a]]},f.pins,stronger),
    /OBSERVER_FRONTIER_ROLLBACK_OR_EQUIVOCATION/);
  assert.equal(project(f.bundle(),f.pins,checkpoint).active[0].commit,"b".repeat(40));
});
test("broken parent hash, sequence jump and owner-clock regression all rejected",()=>{
  const f=fixture();const a=f.append();f.append({commit:"b".repeat(40),replaces:digest(a)});
  for(const field of ["previous","seq"]){
    const bad=clone(f.bundle());bad.histories[0][1][field]=field==="seq"?5:"sha256:"+"0".repeat(64);
    assert.throws(()=>project(bad,f.pins));
  }
  const g=fixture();const c=g.append();
  g.append({commit:"b".repeat(40),replaces:digest(c),occurred_at:at(0).replace("12:00:00","11:00:00")});
  assert.throws(()=>project(g.bundle(),g.pins),/OWNER_CLOCK_REGRESSION/);
});
test("simultaneous independent owners in same scope are visibly conflicting, not arbitrarily resolved",()=>{
  const a=fixture();a.append();
  const key=newOwner();const other=signEvent({
    schema:EVENT_SCHEMA,owner_id:"another-owner",seq:0,previous:null,
    occurred_at:at(),scope:"domain:design",track:"experimental",action:"ADMIT",
    target:target("b".repeat(40)),replaces:null,
    authority:"CANON_SELECTION_ONLY",public_key:key.public_key
  },key.private_key);
  const pins={schema:PINS_SCHEMA,owners:[
    ...a.pins.owners,{owner_id:"another-owner",public_key:key.public_key}]};
  const v=project({schema:BUNDLE_SCHEMA,histories:[a.events,[other]]},pins);
  assert.equal(v.active.length,2);assert.equal(v.conflicts.length,1);
  assert.equal(v.conflicts[0].resolution,"UNRESOLVED_NO_AUTOMATIC_WINNER");
});
test("operational canon never becomes deployment permission",()=>{
  const f=fixture();f.append({track:"operational"});
  const v=project(f.bundle(),f.pins);
  assert.equal(v.active[0].track,"operational");
  assert.equal(v.active[0].authority,"CANON_SELECTION_ONLY");
  assert.equal(v.deployment_grants,0);
});
test("malformed, non-exact signature, invalid SHA and undeclared extra fields are refused",()=>{
  const f=fixture();
  assert.throws(()=>f.append({commit:"HEAD"}),/INVALID_COMMIT_OR_CLAIMED_EVIDENCE/);
  f.append();const altered=clone(f.bundle());altered.histories[0][0].extra="ACTIVATE";
  assert.throws(()=>project(altered,f.pins),/SIGNED_EVENT_FIELDS_NOT_EXACT/);
});
test("canon serializer is deterministic independent of JSON key insertion",()=>{
  assert.equal(canonical({b:2,a:1}),canonical({a:1,b:2}));
  assert.equal(digest({b:[1,2],a:{d:4,c:3}}),digest({a:{c:3,d:4},b:[1,2]}));
});
test("CLI demo cold verifies in new process and never overwrites prior occurrence",()=>{
  const root=mkdtempSync(join(tmpdir(),"cannon001-"));
  try {
    const target=join(root,"one");
    const tool=new URL("../scripts/cannon.mjs",import.meta.url).pathname;
    const demo=spawnSync(process.execPath,[tool,"demo",target],{encoding:"utf8"});
    assert.equal(demo.status,0,demo.stderr);
    assert.equal(existsSync(join(target,"bundle.json")),true);
    const verify=spawnSync(process.execPath,[tool,"verify",
      join(target,"bundle.json"),join(target,"lab-generated-pins.json")],{encoding:"utf8"});
    assert.equal(verify.status,0,verify.stderr);
    const out=JSON.parse(verify.stdout);
    assert.equal(out.active.length,4);
    const repeat=spawnSync(process.execPath,[tool,"demo",target],{encoding:"utf8"});
    assert.equal(repeat.status,2);
    assert.match(repeat.stderr,/CANNON_OCCURRENCE_ALREADY_EXISTS_NO_AUTORETRY/);
    const cp=join(root,"pin.json");
    const checkpoint=spawnSync(process.execPath,[tool,"checkpoint",
      join(target,"bundle.json"),join(target,"lab-generated-pins.json"),cp],{encoding:"utf8"});
    assert.equal(checkpoint.status,0,checkpoint.stderr);
    const verifyWithPin=spawnSync(process.execPath,[tool,"verify",
      join(target,"bundle.json"),join(target,"lab-generated-pins.json"),cp],{encoding:"utf8"});
    assert.equal(verifyWithPin.status,0,verifyWithPin.stderr);
  } finally {rmSync(root,{recursive:true,force:true})}
});
