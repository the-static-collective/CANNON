/** CHRONOMID 011: August 7 source-pinned seam archaeology.
 * No old app executed. Source truth and proposal remain separate.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readSource} from './present-use.mjs';

export const MID_SOURCES=Object.freeze([
  {label:'seamforge-contract',repository:'the-static-collective/SEAMforge',commit:'2188ffef41db27307083ea9c27751facf173ea07',path:'src/types.ts',created_at:'2026-08-07T18:16:30Z',chronological_position:49},
  {label:'seamforge-analysis',repository:'the-static-collective/SEAMforge',commit:'2188ffef41db27307083ea9c27751facf173ea07',path:'server.ts',created_at:'2026-08-07T18:16:30Z',chronological_position:49},
  {label:'oracle-contract',repository:'the-static-collective/toaster-oracle',commit:'5997d1aacab0c913c7b0fb110369dc17b821db01',path:'src/types.ts',created_at:'2026-08-07T19:08:38Z',chronological_position:50},
  {label:'oracle-admission-simulator',repository:'the-static-collective/toaster-oracle',commit:'5997d1aacab0c913c7b0fb110369dc17b821db01',path:'src/lib/toasterValidator.ts',created_at:'2026-08-07T19:08:38Z',chronological_position:50},
]);
export const R14_SHA='dcc8cdca84c440aa4294134f020fb7095bf87f24';
const required={
  'seamforge-contract':['export interface SeamCandidate','export interface Incompatibility','export interface ConservationReport','export interface SliceReceipt','"OBSERVED FACT"','"PROPOSAL"','"UNSUPPORTED / UNKNOWN"','authorityNotTransferred: string[]','epistemicCategory: EpistemicCategory;'],
  'seamforge-analysis':['/api/analyze-evidence','/api/counterfactual-sim','status: "fallback"','epistemicCategory: "PROPOSAL"'],
  'oracle-contract':['export interface CreativeProposal','export interface VisualScoreCandidate','export interface ToasterAdmissionResult','export type LockStatus','export interface AxisLock','status: "admitted" | "refused"'],
  'oracle-admission-simulator':['export function proposalToCandidateScore','export function admitAndResolveToasterScore','Math.random()','Date.now()','refusalReasons.push','motionAmplitude > 1.1','temporalDensity > 60','materialComplexity > 7']
};
const assert=(v,code)=>{if(!v)throw Error(code)};
const hash=v=>createHash('sha256').update(v).digest('hex');
const canon=x=>{
  if(x===null||typeof x==='boolean'||typeof x==='string')return JSON.stringify(x);
  if(typeof x==='number'){assert(Number.isSafeInteger(x),'UNSAFE_NUMBER');return JSON.stringify(x)}
  if(Array.isArray(x))return '['+x.map(canon).join(',')+']';
  assert(x&&typeof x==='object'&&Object.getPrototypeOf(x)===Object.prototype,'NONPLAIN_OBJECT');
  return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canon(x[k])).join(',')+'}';
};
const sha=x=>'sha256:'+hash(Buffer.from(canon(x)));
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx',mode:0o600});
const equal=(a,b)=>canon(a)===canon(b);
const pinned=(roots,repo,commit)=>{
  assert(typeof roots[repo]==='string','MISSING_REPO_ROOT: '+repo);
  const dir=realpathSync(resolve(roots[repo]));
  const head=execFileSync('git',['-C',dir,'rev-parse','HEAD'],{encoding:'utf8',timeout:12000}).trim();
  assert(head===commit,'CHECKOUT_NOT_EXACTLY_PINNED: '+repo);
  return dir;
};
export function inspectMid(roots){
  assert(roots&&typeof roots==='object'&&!Array.isArray(roots),'MISSING_ROOTS');
  const sources=MID_SOURCES.map(s=>{
    pinned(roots,s.repository,s.commit);
    const observed=readSource({id:s.label,repository:s.repository,commit:s.commit,path:s.path,media_type:'text/plain',tags:[]},roots);
    for(const marker of required[s.label])assert(observed.content.includes(marker),'SOURCE_TYPE_MARKER_MISSING: '+s.label);
    return {id:s.label,created_at:s.created_at,chronological_position:s.chronological_position,
      ...observed.witness,observed_contract_markers:required[s.label],
      epistemic_class:'OBSERVED_SOURCE_TEXT',source_execution:false};
  });
  const body={
    schema:'cannon.chronomid-seam/v0',subject:'August 7, 2026 middle of 98 repository creation order',
    source_count:4,sources,
    observed:{
      SEAMforge:['SeamCandidate supports hypothesis, evidenceRefs, incompatibilities and authorityNotTransferred','ConservationReport tracks information, authority and determinism conservation','SEAMforge server exposes AI-assisted analyze-evidence and counterfactual-sim with proposal-labeled fallback'],
      'toaster-oracle':['CreativeProposal carries requestedAxes, locks and antiGoals','VisualScoreCandidate is passed to a local score admission simulator','Oracle candidate seed defaults to Math.random()','Oracle admission result uses Date.now() and a local status string'],
    },
    seam_candidate:{
      epistemic_class:'PROPOSAL',seam_type:'projection',
      title:'Oracle proposal -> SEAMforge evidence-tagged review -> receiver-local reLATTE HOLD',
      source_contract:'toaster-oracle.CreativeProposal',
      proposed_destination_contract:'SEAMforge.SeamCandidate',
      preserved:['original proposal identity','requested axes and refusal reasons as observed fields','exact Git object provenance'],
      transformed:['Oracle admission status -> quoted source claim only, not downstream admission','proposal rationale -> candidate hypothesis (not observed fact)','source project contracts -> evidence references with source SHA'],
      lost_or_unavailable:['No confirmed runtime adapter between old projects','No proof seed reproducibility without explicit seed','No Oracle rendering or app-level CI here','No cross-project owner or authority trust','SEAMforge and Oracle currently have no non-main branch at source snapshot'],
      authority_not_transferred:['Oracle simulated admission','SEAMforge inferred contract guarantees','Gemini-generated interpretation','Rights to execute external processes','reLATTE receiver admission'],
      gates:[
        'Human review of exact proposal-to-SeamCandidate field mapping',
        'Explicit deterministic seed and separate display identity for Oracle output',
        'Preserve source evidence vs inference vs proposal on all target fields',
        'Review ownership of runtime code before loading or executing it',
        'Receiver-local decision remains HOLD until separately admitted'
      ],
      smallest_next_test:'Pure adapter contract fixtures for CreativeProposal -> SeamCandidate, with hostile epistemic and authority negative tests',
      confidence:'working-hypothesis'
    },
    execution:{old_servers_started:false,gemini_called:false,oracle_validator_run:false,old_apis_called:false,remote_effects:0},
    admission:'NONE',source_signer_authenticated:false,
    ghot_030_readiness:'HOLD_MAIN_ONLY_SOURCE_HINT', // GHoT 030 branchHint rejects main.
    ghot_candidate_emitted:false,
    nonclaims:['Matching type names is evidence of structure, not interoperability','Source Git origin config does not authenticate owners','A source simulator calling a score admitted cannot admit anything to the Collective','Main-only historical code cannot bypass branch-worker v030 branch hint check']
  };
  return {...body,dossier_sha256:sha(body)};
}
export function requestFor(dossier,outputDir,time=Date.now()){
  assert(dossier?.schema==='cannon.chronomid-seam/v0'&&dossier.admission==='NONE'&&dossier.execution.remote_effects===0,'DOSSIER_SCOPE_INVALID');
  const out=resolve(outputDir);
  const fmt=i=>new Date(time+i*1000).toISOString();
  return {schema:'relatte.opaque-roundtrip-request/v0',
    spec:{schema:'relatte.opaque-organ-spec/v0',
      family_ref:'organ:cannon/chronomid-seam-011',
      donor_contract_ref:'cannon.chronomid-seam/v0',
      artifact_kind:'source-verified-middlestack-proposed-seam',
      source_world:'world:static-collective-2026-08-07',
      source_particular:'particular:cannon-chronomid-011',
      source_history_head:dossier.dossier_sha256,
      payload_refs:[{address:dossier.dossier_sha256,role:'source-pinned-seam-dossier',
        media_type:'application/json'}],
      donor_claims:{dossier,
        source_verification_method:'original-git-object-local-config-only',
        source_code_executed:false,seam_operationally_proven:false,
        external_owner_authenticated:false,remote_effects:0},
      requested_effect:{kind:'candidate-ingress',authority:'receiver-local',execution_authorized:false},
      return_address:'return:cannon/chronomid-011',created_at:fmt(0)},
    receiver_root:join(out,'receiver'),
    receiver:{world_id:'world:cannon-middle-chronology',
      receiver_particular:'particular:middle-review-room-011',
      contract_ref:'contract:chronomid-source-seam-review/v0'},
    bundle_path:join(out,'transport.json'),result_path:join(out,'result.json'),
    disposition:'HOLD',transport_created_at:fmt(1),received_at:fmt(2),disposed_at:fmt(3),
    route_note:'Source-backed SEAMforge x Oracle proposed seam; no runtime execution and no authority transfer'};
}
function inspectResult(dossier,result){
  assert(result.crossing&&result.receive_receipt?.kind==='RECEIVED'&&result.disposition_receipt?.kind==='R3_HOLD','NOT_HELD');
  return {schema:'cannon.chronomid-public-inspection/v0',
    dossier_sha256:dossier.dossier_sha256,
    chronological_midpoint:[49,50],created_on:'2026-08-07',
    projects:['the-static-collective/SEAMforge','the-static-collective/toaster-oracle'],
    source_git_commits:[MID_SOURCES[0].commit,MID_SOURCES[2].commit],
    exact_source_count:4,
    crossing_id:result.crossing.crossing_id,
    receive_receipt_id:result.receive_receipt.receipt_id,
    hold_receipt_id:result.disposition_receipt.receipt_id,
    receiver_disposition:'HOLD',
    seam_status:'SOURCE_VERIFIED_PROPOSAL_NOT_TESTED_AS_ADAPTER',
    oracle_runtime_admission:false,original_code_executed:false,
    ghot_030_readiness:'HOLD_MAIN_ONLY_SOURCE_HINT',
    owners_authenticated:false,remote_effects:0,deployed:false};
}
export async function run(roots,outDir){
  assert(!existsSync(outDir),'OUTPUT_ALREADY_EXISTS');
  const dossier=inspectMid(roots);
  const relRoot=pinned(roots,'the-static-collective/reLATTE',R14_SHA);
  const rel=readSource({id:'relatte-r14',repository:'the-static-collective/reLATTE',
    commit:R14_SHA,path:'src/roundtrip.ts',media_type:'text/plain',tags:[]},roots);
  assert(rel.witness.size>0,'RELATTE_SUBSTRATE_NOT_PRESENT');
  const out=resolve(outDir);
  mkdirSync(out,{recursive:false,mode:0o700});
  write(join(out,'dossier.json'),dossier);
  const request=requestFor(dossier,out);write(join(out,'request.json'),request);
  const raw=execFileSync(process.execPath,['--experimental-strip-types',join(relRoot,'scripts/opaque-roundtrip.ts')],{
    cwd:relRoot,input:JSON.stringify(request),encoding:'utf8',timeout:60000,maxBuffer:5*1024*1024,
    stdio:['pipe','pipe','pipe']});
  const result=JSON.parse(raw);
  write(join(out,'public-inspection.json'),inspectResult(dossier,result));
  return verify(roots,out);
}
export async function verify(roots,outDir){
  const expected=inspectMid(roots),out=resolve(outDir);
  pinned(roots,'the-static-collective/reLATTE',R14_SHA);
  const request=read(join(out,'request.json'));
  assert(equal(read(join(out,'dossier.json')),expected),'SOURCE_DOSSIER_COLD_REPLAY_MISMATCH');
  assert(equal(request,requestFor(expected,out,Date.parse(request.spec.created_at))),'ROUNDTRIP_REQUEST_REBOUND');
  const mod=await import(pathToFileURL(join(resolve(roots['the-static-collective/reLATTE']),'src/index.ts')).href);
  const result=read(request.result_path);
  assert(result.request_id===mod.computeOpaqueRoundTripRequestId(request),'REQUEST_ID_INVALID');
  assert(await mod.verifyOpaqueOrganCrossing(result.crossing),'SIGNATURE_INVALID');
  assert(await mod.verifyReceipt(result.receive_receipt),'RECEIVE_SIGNATURE_INVALID');
  assert(await mod.verifyReceipt(result.disposition_receipt),'HOLD_SIGNATURE_INVALID');
  assert(result.receive_receipt.kind==='RECEIVED'&&result.disposition_receipt.kind==='R3_HOLD','BAD_RECEIPT_KINDS');
  assert(result.receive_receipt.crossing_id===result.crossing.crossing_id&&result.disposition_receipt.crossing_id===result.crossing.crossing_id,'RECEIPTS_NOT_BOUND');
  const embedded=result.crossing.extensions?.organ_adapter?.donor_claims;
  assert(equal(embedded?.dossier,expected),'SIGNED_SEAM_PROPOSAL_NOT_EMBEDDED');
  assert(embedded?.source_code_executed===false&&embedded?.external_owner_authenticated===false,'CLAIMED_AUTHORITY');
  const receiver=await mod.LocalReceiver.open(request.receiver_root);
  assert(receiver.snapshot().held.includes(result.crossing.crossing_id),'HOLD_NOT_DURABLE');
  const bundle=await mod.readFileBundle(request.bundle_path);
  assert(bundle.crossing.crossing_id===result.crossing.crossing_id,'TRANSPORT_NOT_SOURCE_BOUND');
  const summary=inspectResult(expected,result);
  assert(equal(read(join(out,'public-inspection.json')),summary),'INSPECTION_REPORT_TAMPERED');
  return {status:'CHRONOMID_ORIGINAL_SOURCE_TO_SIGNED_RELATTE_HOLD_COLD_VERIFIED',
    summary,source_count:4,applications_executed:0,admissions:0,remote_effects:0};
}
