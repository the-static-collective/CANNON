/**
 * CANON CROSSING 002 — exact Git object + externally pinned CANNON owner stream
 * → genuine reLATTE R14 opaque-organ crossing → independent local receiver HOLD.
 *
 * No network, Git writes, CI attestations, execution/deployment grant or implicit
 * authority from `main`. SOURCE GIT REMOTE is configuration evidence only.
 */
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {readFile,writeFile,mkdir,stat} from "node:fs/promises";
import {dirname,join,resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {canonical,digest,project} from "./canon-field.mjs";

export const PLAN_SCHEMA="cannon.canon-crossing-plan/v0";
export const RECORD_SCHEMA="cannon.canon-crossing-record/v0";
const VALID_SHA=/^[0-9a-f]{40}$/;
const TIMESTAMP=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const check=(ok,code)=>{if(!ok)throw Error(code)};
const sha256=b=>"sha256:"+createHash("sha256").update(b).digest("hex");
const same=(a,b)=>canonical(a)===canonical(b);
const allowed=(s)=>typeof s==="string"&&s.length>0&&s.length<=128;
const asOwn=(o,keys)=>o&&typeof o==="object"&&!Array.isArray(o)&&
  Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
function git(repo,args){
  try{return execFileSync("git",["-C",repo,...args],
    {encoding:"buffer",timeout:15_000,maxBuffer:2*1024*1024})}
  catch(e){throw Error("LOCAL_GIT_OBJECT_OR_REPOSITORY_NOT_VERIFIED:"+args[0])}
}
const txt=b=>b.toString("utf8").trim();
function canonicalGitOrigin(repo){
  return [
    "https://github.com/"+repo+".git","https://github.com/"+repo,
    "git@github.com:"+repo+".git",
  ];
}
export function inspectPinnedGitCommit(repoRoot,expectedRepository,sha){
  check(allowed(repoRoot)&&allowed(expectedRepository)&&
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(expectedRepository)&&
    VALID_SHA.test(sha),"INVALID_GIT_SOURCE_SELECTOR");
  const origin=txt(git(repoRoot,["remote","get-url","origin"]));
  check(canonicalGitOrigin(expectedRepository).includes(origin),
    "GIT_ORIGIN_DOES_NOT_MATCH_CLAIMED_REPOSITORY");
  const object=txt(git(repoRoot,["rev-parse","--verify",sha+"^{commit}"]));
  check(object===sha,"SOURCE_COMMIT_NOT_EXACT");
  const format=txt(git(repoRoot,["rev-parse","--show-object-format"]));
  check(format==="sha1","ONLY_40_CHARACTER_SHA1_COMMIT_OBJECTS_SUPPORTED");
  const bytes=git(repoRoot,["cat-file","commit",sha]);
  check(bytes.byteLength>40 && bytes.byteLength<=128*1024,"COMMIT_OBJECT_BOUNDS");
  const tree=txt(git(repoRoot,["rev-parse",sha+"^{tree}"]));
  check(VALID_SHA.test(tree),"UNVERIFIED_GIT_TREE");
  return {
    schema:"cannon.local-git-object-witness/v0",
    repository:expectedRepository,commit:sha,tree,object_sha256:sha256(bytes),
    origin_claim:origin,object_type:"commit",local_git_object_verified:true,
    origin_cryptographically_authenticated:false,
    ref_tip_or_global_latest_verified:false
  };
}
function pickSelected(bundle,pins,ownerId,scope,track) {
  check(allowed(ownerId)&&allowed(scope)&&allowed(track),
    "INVALID_EXPLICIT_CANON_SELECTION");
  const view=project(bundle,pins);
  const selected=view.active.filter(x=>x.owner_id===ownerId&&x.scope===scope&&x.track===track);
  check(selected.length===1,"CANON_SCOPE_NOT_UNIQUELY_SELECTED");
  check(!view.conflicts.some(x=>x.scope_and_track===scope+"|"+track),
    "MULTI_OWNER_CANON_CONFLICT_UNRESOLVED");
  const event=view.historical_events.find(x=>x.hash===selected[0].selection_event_hash);
  check(Boolean(event)&&event.action==="ADMIT"&&
    event.target.commit===selected[0].commit,"INVALID_HISTORY_SOURCE_EVENT");
  return {view,selection:selected[0],selectionEvent:event};
}
function requestTimes(at){
  check(typeof at==="string"&&TIMESTAMP.test(at)&&!Number.isNaN(Date.parse(at))&&
    new Date(at).toISOString()===at,"INVALID_ROUTE_TIMESTAMP");
  return [0,1000,2000,3000].map(v=>new Date(Date.parse(at)+v).toISOString());
}
export function preparePlan({bundle,pins,owner_id,scope,track,source_root,
  relay_root,created_at,output_root,disposition="HOLD"}) {
  check(disposition==="HOLD"||disposition==="REFUSE","CANON_ADMISSION_REQUIRES_NEW_POLICY");
  check(typeof relay_root==="string"&&relay_root.length>0&&
    typeof output_root==="string"&&output_root.length>0,"EXACT_PATHS_REQUIRED");
  const picked=pickSelected(bundle,pins,owner_id,scope,track);
  const git=inspectPinnedGitCommit(source_root,picked.selection.repository,picked.selection.commit);
  const [created,transport,received,disposed]=requestTimes(created_at);
  const selection_identity={
    owner_id,scope,track,
    selection_event_hash:picked.selection.selection_event_hash,
    repository:picked.selection.repository,commit:picked.selection.commit,
    owner_frontier:picked.view.frontiers.find(x=>x.owner_id===owner_id),
    claimed_evidence:picked.selection.evidence_claims
  };
  const source_binding={
    schema:"cannon.source-binding/v0",
    selected_owner:owner_id,scope,track,
    selected_event_hash:selection_identity.selection_event_hash,
    selected_event_sha256:digest(selection_identity),
    selected_history_bundle_sha256:digest(bundle),
    selected_owner_pins_sha256:digest(pins),
    exact_git_object:git,
    effect_permission:"NONE"
  };
  const spec={
    schema:"relatte.opaque-organ-spec/v0",
    family_ref:"family:cannon.canon-crossing-002",
    donor_contract_ref:"contract:cannon.owner-signed-canon-selection/v0",
    artifact_kind:"owner-selected-exact-git-commit-reference",
    source_world:"world:cannon:"+owner_id,
    source_particular:"particular:cannon:"+selection_identity.selection_event_hash,
    source_history_head:selection_identity.owner_frontier.head,
    payload_refs:[
      {address:digest(source_binding),role:"selected-canon-source-binding",media_type:"application/vnd.cannon.selection+json"},
      {address:digest(bundle),role:"selected-owner-histories",media_type:"application/vnd.cannon.histories+json"},
    ],
    donor_claims:{
      cannon_source_binding:source_binding,
      independent_owner_selection:true,
      git_main_required:false,git_merge_required:false,
      external_trust_pins_required:true,claimed_ci_evidence_only:true,
      deployment_granted:false,physical_granted:false,
    },
    requested_effect:{
      kind:"CANON_REVIEW_PROPOSAL",admission:"RECEIVER_LOCAL",
      automatic_admission:false,execution:false,physical_action:false
    },
    return_address:null,created_at:created,
  };
  const root=resolve(output_root);
  const receiver={
    world_id:"world:cannon-receiver-002",
    receiver_particular:"particular:cannon-review-port-002",
    contract_ref:"contract:cannon-receiver-held-candidate/v0"
  };
  const request={
    schema:"relatte.opaque-roundtrip-request/v0",
    spec,receiver_root:join(root,"receiver-private"),
    receiver,bundle_path:join(root,"relatte-transport.json"),
    result_path:join(root,"relatte-native-result.json"),
    disposition,transport_created_at:transport,received_at:received,
    disposed_at:disposed,route_note:"CANNON source-selected sha -> receiver-local bounded review only"
  };
  const value={
    schema:PLAN_SCHEMA,
    selection:selection_identity,
    source_binding,
    request,
    initial_holder:"CANNON_SOURCE_OWNER",
    final_receiver_policy:"OPERATOR_SELECTED_LOCAL_"+disposition,
    claimed_effect:"CANDIDATE_ONLY",
    relatte_donor_root_hint:resolve(relay_root),
    external_source_pins_required:true,
  };
  return {...value,plan_id:"cannon-crossing-002:"+digest(value)};
}
export async function native(relatteRoot) {
  // The caller MUST independently pin the checked-out donor commit. A path
  // imported without that provenance is not a substitute for supply-chain trust.
  const {runOpaqueOrganRoundTrip, verifyOpaqueOrganCrossing,
    verifyReceipt,verifyAndExtractTransportFrame,LocalReceiver}
       =await import(pathToFileURL(join(resolve(relatteRoot),"src/index.ts")).href);
  return {runOpaqueOrganRoundTrip,verifyOpaqueOrganCrossing,
    verifyReceipt,verifyAndExtractTransportFrame,LocalReceiver};
}
async function exists(p) {
  try{await stat(p);return true}catch{return false}
}
export async function carry(plan,relatteRoot) {
  check(plan?.schema===PLAN_SCHEMA&&
    plan.plan_id==="cannon-crossing-002:"+digest(
      Object.fromEntries(Object.entries(plan).filter(([k])=>k!=="plan_id"))),
    "PLAN_ID_INVALID");
  const root=resolve(join(plan.request.result_path,".."));
  check(!(await exists(root)),"REVIEW_OCCURRENCE_EXISTS_NO_AUTORETRY");
  await mkdir(dirname(root),{recursive:true,mode:0o700});
  await mkdir(root,{recursive:false,mode:0o700});
  const api=await native(relatteRoot);
  const result=await api.runOpaqueOrganRoundTrip(plan.request);
  check(result.receive_receipt.kind==="RECEIVED"&&
    result.disposition_receipt.kind==="R3_"+plan.request.disposition&&
    result.disposition_receipt.semantic_effect==="none",
    "UNAUTHORIZED_RECEIVER_DISPOSITION");
  const record={
    schema:RECORD_SCHEMA,
    plan_id:plan.plan_id,
    request_id:result.request_id,
    crossing_id:result.crossing.crossing_id,
    receive_receipt_id:result.receive_receipt.receipt_id,
    disposition_receipt_id:result.disposition_receipt.receipt_id,
    // Ephemeral lab pin — must be independently established in production.
    receiver_public_key_pin:result.disposition_receipt.signing.public_key,
    crossing_source_public_key_pin:result.crossing.signing.public_key,
    transport_is_payload_transfer:false,
    exact_branch_changed:false,
    git_merge_performed:false,remote_deploy:false,physical_actions:0,
    receipt_owner_not_the_canon_source:true,
    status:"RECEIVED_AND_RECEIVER_LOCAL_"+plan.request.disposition,
  };
  await writeFile(join(root,"cannon-bridge-record.json"),JSON.stringify(record,null,2)+"\n",
    {encoding:"utf8",flag:"wx",mode:0o600});
  return record;
}
export async function verifyCrossing({plan,bundle,pins,owner_id,scope,track,
  source_root,relay_root,created_at,output_root,disposition="HOLD",
  expected_receiver_public_key_pin,expected_crossing_source_public_key_pin}) {
  const expected=preparePlan({
    bundle,pins,owner_id,scope,track,source_root,relay_root,created_at,
    output_root,disposition
  });
  check(same(plan,expected),"COLD_SOURCE_PLAN_INVALID_OR_SUPERSEDED");
  const root=resolve(output_root);
  const record=JSON.parse(await readFile(join(root,"cannon-bridge-record.json"),"utf8"));
  const result=JSON.parse(await readFile(join(root,"relatte-native-result.json"),"utf8"));
  const api=await native(relay_root);
  check(await api.verifyOpaqueOrganCrossing(result.crossing),
    "INVALID_NATIVE_RELATTE_CROSSING");
  check(await api.verifyReceipt(result.receive_receipt)&&
        await api.verifyReceipt(result.disposition_receipt),
    "INVALID_NATIVE_RECEIVER_SIGNATURE");
  const extracted=await api.verifyAndExtractTransportFrame(result.transport_frame);
  check(extracted.crossing_id===result.crossing.crossing_id,
    "NATIVE_TRANSPORT_NOT_MATCHING_CROSSING");
  check(await exists(plan.request.bundle_path),
    "NATIVE_FILE_BUNDLE_MISSING");
  check(result.crossing.extensions?.organ_adapter?.family_ref===
      "family:cannon.canon-crossing-002" &&
    same(result.crossing.extensions.organ_adapter.donor_claims,
      plan.request.spec.donor_claims) &&
    same(result.crossing.payload_refs,plan.request.spec.payload_refs) &&
    result.crossing.source_history_head===plan.selection.owner_frontier.head &&
    result.crossing.source_particular===plan.request.spec.source_particular &&
    same(result.crossing.requested_effect,plan.request.spec.requested_effect),
    "NATIVE_CROSSING_NOT_BOUND_TO_ORIGINAL_OWNER_SELECTION");
  check(result.receive_receipt.crossing_id===result.crossing.crossing_id&&
        result.disposition_receipt.crossing_id===result.crossing.crossing_id,
    "RECEIPT_REFERENT_CROSSING_MISMATCH");
  check(result.receive_receipt.world_id===plan.request.receiver.world_id&&
        result.receive_receipt.receiver_particular===plan.request.receiver.receiver_particular&&
        result.disposition_receipt.world_id===plan.request.receiver.world_id &&
        result.disposition_receipt.receiver_particular===plan.request.receiver.receiver_particular,
    "RECEIVER_LOCAL_IDENTITY_MISMATCH");
  check(result.receive_receipt.kind==="RECEIVED"&&
        result.receive_receipt.semantic_effect==="none"&&
        result.disposition_receipt.kind==="R3_"+disposition&&
        result.disposition_receipt.semantic_effect==="none",
    "RECEIVER_MUST_RETAIN_LOCAL_NON_EFFECT_DECISION");
  check(expected_receiver_public_key_pin&&expected_crossing_source_public_key_pin&&
        same(result.receive_receipt.signing.public_key,expected_receiver_public_key_pin)&&
        same(result.disposition_receipt.signing.public_key,expected_receiver_public_key_pin)&&
        same(result.crossing.signing.public_key,expected_crossing_source_public_key_pin),
    "EXTERNALLY_SELECTED_RELATTE_SIGNER_PINS_REQUIRED");
  check(record.plan_id===plan.plan_id && record.request_id===result.request_id&&
        record.crossing_id===result.crossing.crossing_id&&
        record.receive_receipt_id===result.receive_receipt.receipt_id&&
        record.disposition_receipt_id===result.disposition_receipt.receipt_id &&
        same(record.receiver_public_key_pin,expected_receiver_public_key_pin)&&
        same(record.crossing_source_public_key_pin,expected_crossing_source_public_key_pin)&&
        record.remote_deploy===false&&record.physical_actions===0&&
        record.git_merge_performed===false&&record.transport_is_payload_transfer===false,
    "FABRICATED_BRIDGE_RECORD_CLAIMS");
  // Native receiver independently re-opens its durable local signed journal.
  const receiver=await api.LocalReceiver.open(plan.request.receiver_root);
  check(same(receiver.snapshot(),result.receiver_snapshot),
    "RECEIVER_DURABLE_JOURNAL_NOT_REPLAYABLE");
  check(receiver.snapshot().held.includes(result.crossing.crossing_id)||
      disposition==="REFUSE"&&receiver.snapshot().refused.includes(result.crossing.crossing_id),
    "RECEIVER_LOCAL_DISPOSITION_NOT_REPLAYED");
  return {
    status:"SOURCE_PINNED_CANON_CROSSED_NATIVE_RELATTE_RECEIVER_"+disposition,
    selection_event:plan.selection.selection_event_hash,
    source_git_commit:plan.selection.commit,
    source_git_tree:plan.source_binding.exact_git_object.tree,
    owner_streams_verified:project(bundle,pins).frontiers.length,
    native_crossing_id:result.crossing.crossing_id,
    receive_receipt_id:result.receive_receipt.receipt_id,
    local_disposition_receipt_id:result.disposition_receipt.receipt_id,
    initial_canons_changed:false,main_changed:false,merges:0,
    remote_transport_performed:false,physical_actions:0,deployment_grants:0,
    receiver_keys_self_described_in_lab:true,
  };
}
