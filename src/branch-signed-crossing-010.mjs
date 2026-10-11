/** CANNON 010 — signed GHoT 030 evidence -> native reLATTE R14 RECEIVE/HOLD.
 * This module only INGESTS already-created GHoT evidence. It NEVER issues ACT.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdirSync,existsSync,writeFileSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {inspect} from './branch-loadout.mjs';
import {readSource} from './present-use.mjs';
import {jcs,address,verifySignedWorkerEvidence} from './ghot-signed-030.mjs';

export const GHOT_030_SHA='b01758bee55d66d699160715ec377b45f7589707';
export const RELATTE_R14_SHA='dcc8cdca84c440aa4294134f020fb7095bf87f24';
export const OUTPUT_SCHEMA='cannon.signed-ghot-crossing/v0';
const assert=(v,msg)=>{if(!v)throw Error(msg)};
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx',mode:0o600});
const equal=(x,y)=>jcs(x)===jcs(y);
function pinnedRoot(roots,repo,sha){
  assert(Object.hasOwn(roots,repo)&&typeof roots[repo]==='string','MISSING_CHECKOUT: '+repo);
  const root=realpathSync(resolve(roots[repo]));
  const head=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',timeout:10000}).trim();
  assert(head===sha,'UNPINNED_HEAD: '+repo);
  return root;
}
export function identifySources(plan,roots){
  const census=inspect(plan,roots);
  assert(census.status==='SOURCE_VERIFIED_REVIEW_REQUIRED','INVALID_PARENT_LOADOUT');
  const selected=plan.entries.filter(e=>e.id==='planz-sense-001');
  assert(selected.length===1&&selected[0].repository==='the-static-collective/planZ','EXPECTED_SENSE_CAPABILITY');
  const entry=selected[0];
  const pl=readSource({id:'signed-worker-selected-source',repository:entry.repository,commit:entry.commit,path:entry.path,media_type:'text/plain',tags:[]},roots).witness;
  const ghRoot=pinnedRoot(roots,'the-static-collective/GHoT',GHOT_030_SHA);
  const reRoot=pinnedRoot(roots,'the-static-collective/reLATTE',RELATTE_R14_SHA);
  const ghot=readSource({id:'ghot030-owner-worker',repository:'the-static-collective/GHoT',commit:GHOT_030_SHA,path:'ghot/branch_worker.py',media_type:'text/plain',tags:[]},roots).witness;
  const activation=readSource({id:'ghot030-activation-ticket',repository:'the-static-collective/GHoT',commit:GHOT_030_SHA,path:'ghot/activation_ticket.py',media_type:'text/plain',tags:[]},roots).witness;
  const substrate=readSource({id:'relatte-r14-opaque',repository:'the-static-collective/reLATTE',commit:RELATTE_R14_SHA,path:'src/roundtrip.ts',media_type:'text/plain',tags:[]},roots).witness;
  return {census,entry,pl,ghot,activation,substrate,ghRoot,reRoot,
    expectedContext:{repository:entry.repository,branchHint:entry.branchHint,
      commit:entry.commit,path:entry.path,sha256:pl.blob_sha256.slice('sha256:'.length)}};
}
function dates(complete){
  const ms=Date.parse(complete);
  assert(Number.isFinite(ms),'GHOT_COMPLETION_TIME_INVALID');
  const at=i=>new Date(ms+i*1000).toISOString();
  return [at(1),at(2),at(3),at(4)];
}
function requestFor(evidence,witness,sources,out){
  const [created_at,transport_created_at,received_at,disposed_at]=dates(evidence.receipt.completed_at);
  return {schema:'relatte.opaque-roundtrip-request/v0',
    spec:{schema:'relatte.opaque-organ-spec/v0',
      family_ref:'organ:ghot/branch-worker-030',
      donor_contract_ref:'ghot.activation.execution-receipt/v0',
      artifact_kind:'body-signed-owner-local-source-hash-evidence',
      source_world:'world:ghot030-local-witness',
      source_particular:evidence.receipt.issuer_particular,
      source_history_head:witness.evidence_sha256,
      payload_refs:[{address:witness.evidence_sha256,
        role:'signed-ghot-evidence-in-envelope',media_type:'application/json'}],
      donor_claims:{
        ghot_exact_source_commit:GHOT_030_SHA,
        ghot_source_blob_sha256:sources.ghot.blob_sha256,
        activation_source_blob_sha256:sources.activation.blob_sha256,
        relatte_exact_source_commit:RELATTE_R14_SHA,
        substrate_source_blob_sha256:sources.substrate.blob_sha256,
        cannon_loadout_sha256:sources.census.reportSha256,
        evidence_sha256:witness.evidence_sha256,
        ghot_signature_verified_independently_by_cannon:true,
        signer_is_authenticated_human:false,
        signer_trust_established_externally:false,
        simulated_ci_act_is_not_owner_consent:true,
        donor_code_executed:false,
        remote_effects:0,
        evidence,
      },
      requested_effect:{kind:'candidate-ingress',authority:'receiver-local',admission_requested:false,
        external_execution_requested:false},
      return_address:'return:cannon/signed-ghot-010',created_at},
    receiver_root:join(out,'receiver'),
    receiver:{world_id:'world:cannon-review-010',receiver_particular:'particular:cannon-review-010',
      contract_ref:'contract:signed-ghot-evidence-review/v0'},
    bundle_path:join(out,'transport.json'),result_path:join(out,'roundtrip-result.json'),
    disposition:'HOLD',transport_created_at,received_at,disposed_at,
    route_note:'GHoT 030 signed ticket+receipt -> verified CANNON ingest -> reLATTE sovereign HOLD'};
}
function summaryOf(evidence,witness,sources,result){
  assert(result.receive_receipt?.kind==='RECEIVED'&&result.disposition_receipt?.kind==='R3_HOLD','NOT_RECEIVED_AND_HELD');
  return {schema:OUTPUT_SCHEMA,
    source_commit:evidence.context.commit,branch_hint:evidence.context.branchHint,
    source_file:evidence.context.path,source_blob_sha256:evidence.context.sha256,
    exact_ghot_commit:GHOT_030_SHA,exact_relatte_commit:RELATTE_R14_SHA,
    parent_loadout_sha256:sources.census.reportSha256,
    ghot_ticket_id:witness.ticket_id,ghot_execution_receipt_id:witness.execution_receipt_id,
    ghot_body_particular:witness.body_signer_particular,
    signed_evidence_sha256:witness.evidence_sha256,
    ghot_ticket_signature_verified:true,ghot_execution_signature_verified:true,
    body_signer_cross_checked:true,
    signed_evidence_embedded_in_relatte_crossing:true,
    crossing_id:result.crossing.crossing_id,
    relatte_receive_receipt_id:result.receive_receipt.receipt_id,
    relatte_disposition_receipt_id:result.disposition_receipt.receipt_id,
    receiver_disposition:'HOLD',relatte_signatures_cold_verified:true,
    local_git_read_only:true,remote_effects:0,
    signer_is_externally_trusted_owner:false,
    synthetic_ci_act_is_human_permission:false,
    receiver_admitted:false,production_deployed:false,
    nonClaims:[
      'BODY signature proves local key possession, not human identity or ownership',
      'Synthetic CI ACT is not authority for a user machine',
      'RECEIVE and HOLD are not ADMIT',
      'No donor source executed or remotely deployed',
    ]};
}
export async function ingest(plan,roots,evidence,outDir){
  assert(!existsSync(outDir),'OUTPUT_ALREADY_EXISTS');
  const sources=identifySources(plan,roots);
  const witness=await verifySignedWorkerEvidence(evidence,sources.expectedContext);
  const out=resolve(outDir);
  // No output artifacts before exact source + independent cryptographic validation.
  mkdirSync(out,{recursive:false,mode:0o700});
  write(join(out,'signed-ghot-evidence.json'),evidence);
  write(join(out,'loadout-report.json'),sources.census);
  const request=requestFor(evidence,witness,sources,out);
  write(join(out,'crossing-request.json'),request);
  const raw=execFileSync(process.execPath,['--experimental-strip-types',join(sources.reRoot,'scripts/opaque-roundtrip.ts')],{
    cwd:sources.reRoot,input:JSON.stringify(request),encoding:'utf8',timeout:60000,maxBuffer:5*1024*1024,
    stdio:['pipe','pipe','pipe']});
  const result=JSON.parse(raw);
  const summary=summaryOf(evidence,witness,sources,result);
  write(join(out,'public-inspection.json'),summary);
  const portable={schema:'cannon.signed-ghot-portable-witness/v0',evidence,
    crossing:result.crossing,
    receive_receipt:result.receive_receipt,
    disposition_receipt:result.disposition_receipt};
  write(join(out,'portable-signed-evidence.json'),portable);
  return verify(plan,roots,out);
}
export async function verify(plan,roots,outDir){
  const sources=identifySources(plan,roots),out=resolve(outDir);
  const evidence=read(join(out,'signed-ghot-evidence.json'));
  const witness=await verifySignedWorkerEvidence(evidence,sources.expectedContext);
  assert(equal(read(join(out,'loadout-report.json')),sources.census),'PARENT_LOADOUT_REPLAY_CHANGED');
  const request=read(join(out,'crossing-request.json'));
  assert(equal(request,requestFor(evidence,witness,sources,out)),'ROUNDTRIP_REQUEST_REBOUND');
  const sub=await import(pathToFileURL(join(sources.reRoot,'src/index.ts')).href);
  const result=read(request.result_path);
  assert(result.request_id===sub.computeOpaqueRoundTripRequestId(request),'ROUNDTRIP_REQUEST_ID_CHANGED');
  assert(await sub.verifyOpaqueOrganCrossing(result.crossing),'CROSSING_SIGNATURE_INVALID');
  assert(await sub.verifyReceipt(result.receive_receipt),'RECEIVE_SIGNATURE_INVALID');
  assert(await sub.verifyReceipt(result.disposition_receipt),'HOLD_SIGNATURE_INVALID');
  assert(result.receive_receipt.kind==='RECEIVED'&&result.receive_receipt.semantic_effect==='none','RECEIVE_SEMANTICS_CHANGED');
  assert(result.disposition_receipt.kind==='R3_HOLD'&&result.disposition_receipt.semantic_effect==='none','HOLD_SEMANTICS_CHANGED');
  assert(result.receive_receipt.crossing_id===result.crossing.crossing_id&&result.disposition_receipt.crossing_id===result.crossing.crossing_id,'RECEIPT_CROSSING_MISMATCH');
  assert(result.crossing.source_history_head===witness.evidence_sha256,'SOURCE_HISTORY_CHANGED');
  const embedded=result.crossing.extensions?.organ_adapter?.donor_claims;
  assert(embedded?.evidence_sha256===witness.evidence_sha256&&equal(embedded.evidence,evidence),'GHOT_SIGNED_EVIDENCE_NOT_TRANSPORTED');
  assert(embedded.signer_trust_established_externally===false&&embedded.remote_effects===0,'AUTHORITY_LAUNDERING');
  const bundle=await sub.readFileBundle(request.bundle_path);
  assert(bundle.crossing.crossing_id===result.crossing.crossing_id,'TRANSPORT_ID_CHANGED');
  const receiver=await sub.LocalReceiver.open(request.receiver_root);
  assert(receiver.snapshot().held.includes(result.crossing.crossing_id),'RECEIVER_HOLD_NOT_DURABLE');
  const summary=summaryOf(evidence,witness,sources,result);
  assert(equal(read(join(out,'public-inspection.json')),summary),'PUBLIC_SUMMARY_MISMATCH');
  assert(equal(read(join(out,'portable-signed-evidence.json')),{
    schema:'cannon.signed-ghot-portable-witness/v0',evidence,crossing:result.crossing,
    receive_receipt:result.receive_receipt,disposition_receipt:result.disposition_receipt
  }),'PORTABLE_WITNESS_TAMPERED');
  return {status:'SIGNED_GHOT_TO_RELATTE_HOLD_COLD_VERIFIED',
    summary,sourceObjectsVerified:4,ghotSignedObjectsVerified:2,
    relatteSignedObjectsVerified:3,externalEffects:0};
}
