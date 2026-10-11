/** CANNON 014 — original World Encounter, L-Branch, continuity, TranchNode
 * immutable bytes, GHoT local hash, reLATTE signed HOLD. No delegated authority.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync,readdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {derive as original013} from './project0-floor-013.mjs';
import {readSource} from './present-use.mjs';

export const P0_SHA='08f892eb379ef538cce5b3ca081ecf683b448a4b';
export const TRANCH_SHA='7fbb0c868befd5f6a7478bdd0447477a0e8e075e';
export const GHOT_SHA='b01758bee55d66d699160715ec377b45f7589707';
export const REL_SHA='dcc8cdca84c440aa4294134f020fb7095bf87f24';
const assert=(v,code)=>{if(!v)throw Error(code)};
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const bytes=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
const write=(p,x)=>writeFileSync(p,bytes(x),{flag:'wx',mode:0o600});
const hash=x=>createHash('sha256').update(x).digest('hex');
const canonical=x=>{
 if(x===null||typeof x==='string'||typeof x==='boolean')return JSON.stringify(x);
 if(typeof x==='number'){assert(Number.isSafeInteger(x),'UNSAFE_NUMBER');return JSON.stringify(x)}
 if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';
 assert(x&&typeof x==='object'&&Object.getPrototypeOf(x)===Object.prototype,'NOT_CANONICAL');
 return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
};
const same=(a,b)=>canonical(a)===canonical(b);
const root=(roots,repo,commit)=>{
 assert(typeof roots?.[repo]==='string','ROOT_UNAVAILABLE: '+repo);
 const r=realpathSync(resolve(roots[repo]));
 assert(execFileSync('git',['-C',r,'rev-parse','HEAD'],{encoding:'utf8',timeout:12000}).trim()===commit,
  'SOURCE_NOT_PINNED: '+repo);
 return r;
};
function readOriginal(roots,repo,sha,path,id){
 const checkout=root(roots,repo,sha);
 const src=readSource({id,repository:repo,commit:sha,path,media_type:'text/plain',tags:[]},roots);
 return {checkout,witness:src.witness,content:src.content};
}
const SOURCES=[
 ['the-static-collective/project0',P0_SHA,'src/world-encounter/evaluate.ts','p0-world-encounter'],
 ['the-static-collective/project0',P0_SHA,'src/l-branch/evaluate.ts','p0-l-branch'],
 ['the-static-collective/project0',P0_SHA,'src/continuity-profile/inspect.ts','p0-continuity'],
 ['the-static-collective/tranchnode',TRANCH_SHA,'src/artifact-store.ts','tranchnode-artifact-store'],
 ['the-static-collective/GHoT',GHOT_SHA,'ghot/reference_node.py','ghot-native-hash'],
];
export async function design(roots){
 const underlying=await original013(roots);
 const sourceReads=SOURCES.map(([r,s,p,id])=>readOriginal(roots,r,s,p,id));
 const srcWitnesses=sourceReads.map(x=>x.witness);
 assert(sourceReads[0].content.includes('export function evaluateEncounter')&&
  sourceReads[1].content.includes('export function runLBranch')&&
  sourceReads[2].content.includes('export function deriveStillAlive')&&
  sourceReads[3].content.includes('export class FilesystemArtifactStore')&&
  sourceReads[4].content.includes('system.hash'),'MISSING_REAL_NATIVE_SURFACE');
 const project0=sourceReads[0].checkout;
 const req=createRequire(import.meta.url);
 const world=req(join(project0,'.build/src/world-encounter/index.js'));
 const propagation=req(join(project0,'.build/src/l-branch/index.js'));
 const continuity=req(join(project0,'.build/src/continuity-profile/index.js'));
 const p0canonical=req(join(project0,'.build/src/canonical-addressing/index.js'));
 const artifactBytes=bytes(underlying.project0);
 const raw=p0canonical.computeArtifactAddress(artifactBytes);
 const tranchAddress='sha256:'+raw.digestHex;
 const proposed={
  protocolVersion:'p0.exchange/0.1',
  originNodeRef:'cannon:project0-floor-013',
  originFrameRef:underlying.project0.semantic_node_id,
  originVersionRef:P0_SHA,
  offered:{objectRef:tranchAddress,mediaType:'application/json',sourceReceiptRefs:[],
    disclosureClass:'public'},
  sourceProvenanceRefs:[
    'github:the-static-collective/project0@'+P0_SHA,
    'github:the-static-collective/tranchnode@'+TRANCH_SHA,
    underlying.project0.semantic_node_id,
  ],
  sourceAuthorityRefs:[],
  sourceEpistemicKind:'proposal',
  sourceVerificationState:'verified',
  capabilityUsed:'offer_readonly_artifact_reference',
  limitations:['source-bytes-only','not-source-truth','not-execution-authorization',
   'no-private-artifacts','no-authority-import','no-crossing-auto-admission'],
 };
 const context={
  destinationNodeRef:'ghot:isolated-local-hash',
  destinationFrameRef:'ghot:synthetic-review-room-014',
  manifest:{nodeRef:'ghot:isolated-local-hash',protocolVersion:'p0.exchange/0.1',
    accepts:['proposal'],emits:[],capabilities:['inspect_public_address'],
    requiredScopes:['public'],mustNever:['accept_source_authority_as_local','execute_donor_programs']},
  grantedScopes:['public'],destinationAuthorityRefs:[],
 };
 const encounterEnvelope=world.addressEncounterRecord('exchange_envelope',proposed);
 const denied=world.evaluateEncounter(proposed,context,{
  requiredCapability:'inspect_public_address',requiredScope:'public',
  localDetermination:'refuse',evidenceRefs:[underlying.project0.semantic_node_id],
 });
 assert(denied.body.status==='refused'&&denied.body.reasonCode==='ENCOUNTER_DISCLOSURE_REFUSED'&&
  denied.body.inspectedObject===false,'ENCOUNTER_NOT_REFUSED');
 const declaration={protocolVersion:'p0.l-branch/0.1',
  snapshotRef:underlying.project0.semantic_node_id,
  excitationRef:encounterEnvelope.ref,
  purposeRef:'read-only-local-source-propagation',
  participantRefs:['inspect-address','attempt-effect'],
  influenceRefs:[],authorityRefs:[],
  evaluatorId:'p0.lbranch-014-fixture',evaluatorVersion:'0.1.0',
  policyRef:'policy:inspect-only',budget:{maxSteps:3,maxFrontierWidth:2,maxDepth:2}};
 const candidates=[
  {candidateRef:'inspect-address',depth:1,requiresInputRefs:[encounterEnvelope.ref],
   requiresInfluenceRefs:[],requiresAuthorityRefs:[],
   requiredPolicyRef:'policy:inspect-only',terminal:false},
  {candidateRef:'attempt-effect',depth:2,requiresInputRefs:['inspect-address'],
   requiresInfluenceRefs:[],requiresAuthorityRefs:['grant:never-issued'],
   requiredPolicyRef:'policy:inspect-only',terminal:false},
 ];
 const branch=propagation.runLBranch(declaration,candidates);
 assert(branch.terminal.body.refusedAttemptRefs.includes('attempt-effect')&&
  branch.terminal.body.authorityRefsUsed.length===0&&
  branch.steps.some(x=>x.body.refusalReasonCodes['attempt-effect']==='LBRANCH_AUTHORITY_REQUIRED'),
  'LBRANCH_EFFECT_NOT_REFUSED');
 const mkLane=(lane,mode,evidence,non,uncertainty=[])=>({
  lane,mode,dimensions:[{dimension:lane+'-observed',evidenceRefs:[evidence]}],
  transformationRefs:[],residualRefs:[],uncertainty,doesNotEstablish:non
 });
 const claim={schema:'p0.continuity/0.1',
  purpose:'crossing custody witness without inheriting authority',
  subjectRef:encounterEnvelope.ref,
  ancestorRoots:[underlying.project0.semantic_node_id],
  environment:{decoderRef:'original-project0/'+P0_SHA,runtimeRef:'disposable-ci',
   policyRefs:['policy:inspect-only'],contextRefs:[denied.ref]},
  lanes:[
   mkLane('custody','preserved',tranchAddress,['authority','identity']),
   mkLane('protocol','preserved',encounterEnvelope.ref,['authority']),
   mkLane('authority','unresolved',denied.ref,['identity'],['no lease was offered or minted']),
   mkLane('identity','unresolved',underlying.project0.semantic_node_id,['authority'],['project0 source identity does not authenticate owner'])
  ],
  outputRefs:[branch.terminal.ref,denied.ref],parentContinuityRefs:[],
  occurrenceClaim:'continuation-only'};
 const continuityRef=continuity.addressContinuityClaim(claim);
 assert(continuity.verifyContinuityClaim(continuityRef,claim),'CONTINUITY_CANONICAL_INVALID');
 const alive=continuity.deriveStillAlive(claim);
 assert(alive.authority.portableEffect==='none'&&alive.authority.externalAdmissionRequired===true&&
  alive.unresolved.some(x=>x.lane==='authority'),'CONTINUITY_AUTHORITY_PROMOTED');
 const core={
  schema:'cannon.project0-tranchnode-encounter/v0',
  base_project0_013_id:underlying.project0.semantic_witness_sha256,
  original_git_source_witnesses:srcWitnesses,
  native_project0_world_encounter:{envelope:proposed,envelope_ref:encounterEnvelope.ref,
    disposition:denied.body,disposition_ref:denied.ref},
  native_project0_l_branch:{declaration,candidates,
    declaration_ref:branch.declaration.ref,
    steps:branch.steps.map(x=>({ref:x.ref,body:x.body})),
    terminal:{ref:branch.terminal.ref,body:branch.terminal.body}},
  native_project0_continuity:{claim,ref:continuityRef,alive},
  tranch_node_proposed_artifact_address:tranchAddress,
  tranch_node_exact_bytes_sha256:raw.digestHex,
  ghot_expected_sha256_of_address_string:hash(tranchAddress),
  source_world_authorized_execution:false,
  destination_encounter_admitted:false,
  project0_node_admitted:false,
  signer_identity_authenticated:false,
  independent_authority_grant:false,
  external_effects:0,
  nonClaims:[
   'Local store custody of proposal JSON is not rights to publish, act or admit',
   'Project0 encounter refused is a local evaluation, not reLATTE HOLD',
   'L-Branch matching refs and policy is not external permission; effect candidate is refused',
   'Continuity preserves evidence of distinction, not authority transfer or owner identity',
   'GHoT native hash receipt is unsigned, local, sandbox-created and has no external effect',
   'TranchNode immutable storage checks actual bytes, not truth of source assertions',
  ]};
 return {...core,digest_sha256:'sha256:'+hash(canonical(core)),artifact_bytes:artifactBytes};
}
function tranchRun(roots,operation,store,material){
 const tranch=root(roots,'the-static-collective/tranchnode',TRANCH_SHA);
 const command=join(import.meta.dirname,'../scripts/tranchnode-artifact-014.mjs');
 const raw=execFileSync(process.execPath,['--import',join(tranch,'node_modules/tsx/dist/loader.mjs'),
  command,operation,tranch,store,material],{
   cwd:tranch,encoding:'utf8',timeout:40000,maxBuffer:1024*1024,
   stdio:['ignore','pipe','pipe']});
 return JSON.parse(raw);
}
function ghotHash(roots,home,address){
 const ghot=root(roots,'the-static-collective/GHoT',GHOT_SHA);
 const raw=execFileSync('python3',[join(ghot,'ghot/reference_node.py'),'hash',address],{
  cwd:ghot,env:{...process.env,GHOT_HOME:home},encoding:'utf8',
  stdio:['ignore','pipe','pipe'],timeout:30000,maxBuffer:3*1024*1024});
 const receipt=JSON.parse(raw);
 assert(receipt.kind==='ghot.receipt'&&receipt.capability==='system.hash'&&
  receipt.status==='ok'&&receipt.output?.sha256===hash(address),'GHOT_NATIVE_HASH_MISMATCH');
 return receipt;
}
export function requestFor(dossier,out,at=Date.now()){
 assert(dossier?.schema==='cannon.project0-tranchnode-encounter/v0'&&
  dossier.destination_encounter_admitted===false&&
  dossier.native_project0_continuity.alive.authority.portableEffect==='none'&&
  dossier.native_project0_l_branch.terminal.body.refusedAttemptRefs.includes('attempt-effect'),
  'ILLEGAL_AUTHORITY_PROJECTION');
 const fmt=i=>new Date(at+i*1000).toISOString(),r=resolve(out);
 return {schema:'relatte.opaque-roundtrip-request/v0',
  spec:{schema:'relatte.opaque-organ-spec/v0',
   family_ref:'organ:cannon/project0-tranch-014',
   donor_contract_ref:'cannon.project0-tranchnode-encounter/v0',
   artifact_kind:'project0-encounter-refusal-and-tranchnode-custody',
   source_world:'world:cannon-project0-tranch-014',
   source_particular:'particular:cannon-refused-encounter-014',
   source_history_head:dossier.digest_sha256,
   payload_refs:[{address:dossier.digest_sha256,role:'source-verified-multi-branch-proof',media_type:'application/json'}],
   donor_claims:{dossier,source_is_custodied:true,project0_encounter_admitted:false,
    authority_transferred:false,ghot_work_effects:0},
   requested_effect:{kind:'candidate-ingress',authority:'receiver-local',execution_authorized:false},
   return_address:'return:cannon/project0-tranchnode-014',created_at:fmt(0)},
  receiver_root:join(r,'receiver'),receiver:{world_id:'world:local-r14-014',
   receiver_particular:'particular:review-receiver-014',contract_ref:'contract:hold-encounter-only/v0'},
  bundle_path:join(r,'bundle.json'),result_path:join(r,'roundtrip-result.json'),
  disposition:'HOLD',transport_created_at:fmt(1),received_at:fmt(2),disposed_at:fmt(3),
  route_note:'P0 encounter REFUSED; local TranchNode bytes custodied; GHoT hash-only; R14 receives then HOLDS'};
}
function summary(d,gh,r){
 return {schema:'cannon.project0-tranchnode-public/v0',
  project0_world_ref:d.native_project0_world_encounter.envelope_ref,
  project0_encounter_disposition:'REFUSED',
  l_branch_terminal_ref:d.native_project0_l_branch.terminal.ref,
  l_branch_refused_effect:'attempt-effect',
  continuity_ref:d.native_project0_continuity.ref,
  continuity_authority_effect:'NONE',
  tranch_artifact_address:d.tranch_node_proposed_artifact_address,
  ghot_hash_receipt_id:gh.receipt_id,ghot_hash_signed:false,
  reLATTE_crossing_id:r.crossing.crossing_id,reLATTE_RECEIVED:r.receive_receipt.receipt_id,
  reLATTE_HOLD:r.disposition_receipt.receipt_id,receiver_disposition:'HOLD',
  materialized_source_bytes:true,private_corpus_copied:false,donor_code_executed:false,
  execution_authorized:false,remote_effects:0};
}
export async function run(roots,outDir){
 assert(!existsSync(outDir),'OUTPUT_ALREADY_EXISTS');
 const d=await design(roots);
 const rel=readOriginal(roots,'the-static-collective/reLATTE',REL_SHA,'src/roundtrip.ts','relatte-014');
 assert(rel.witness.size>0,'RELATTE_NATIVE_NOT_VERIFIED');
 const out=resolve(outDir);mkdirSync(out,{recursive:false,mode:0o700});
 const artifact=join(out,'project0-013-witness.json');
 writeFileSync(artifact,d.artifact_bytes,{flag:'wx',mode:0o600});
 const {artifact_bytes:_,...core}=d;write(join(out,'four-branch-dossier.json'),core);
 const store=join(out,'tranch-objects');
 const put=tranchRun(roots,'put',store,artifact);
 assert(put.address===d.tranch_node_proposed_artifact_address&&put.created===true&&
  put.verified_byte_length===d.artifact_bytes.length,'TRANCH_IMMUTABLE_PUT_FAILED');
 write(join(out,'tranch-custody-receipt.json'),put);
 const ghotHome=join(out,'ghot-sandbox');
 const ghotReceipt=ghotHash(roots,ghotHome,put.address);
 write(join(out,'ghot-hash-receipt.json'),ghotReceipt);
 const request=requestFor(core,out);write(join(out,'r14-request.json'),request);
 const output=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types',join(rel.checkout,'scripts/opaque-roundtrip.ts')],{
  cwd:rel.checkout,input:JSON.stringify(request),encoding:'utf8',timeout:60000,
  stdio:['pipe','pipe','pipe'],maxBuffer:6*1024*1024}));
 assert(output.disposition_receipt.kind==='R3_HOLD','R14_NOT_HELD');
 write(join(out,'public-inspection.json'),summary(core,ghotReceipt,output));
 return verify(roots,out);
}
export async function verify(roots,outDir){
 const out=resolve(outDir),designAgain=await design(roots);
 const {artifact_bytes:originalBytes,...expected}=designAgain;
 assert(readFileSync(join(out,'project0-013-witness.json')).equals(originalBytes),'ORIGINAL_BYTES_TAMPERED');
 assert(same(read(join(out,'four-branch-dossier.json')),expected),'FOUR_BRANCH_DOSSIER_REPLAY_CHANGED');
 const store=join(out,'tranch-objects');
 const result=tranchRun(roots,'verify',store,join(out,'project0-013-witness.json'));
 assert(result.address===expected.tranch_node_proposed_artifact_address&&
  result.verified_byte_length===originalBytes.length,'TRANCH_OBJECT_MISSING_OR_CORRUPT');
 const custody=read(join(out,'tranch-custody-receipt.json'));
 assert(custody.address===result.address&&custody.verified_byte_length===result.verified_byte_length&&
  custody.created===true,'TRANCH_CUSTODY_LOG_TAMPERED');
 const g=read(join(out,'ghot-hash-receipt.json'));
 assert(g.kind==='ghot.receipt'&&g.capability==='system.hash'&&g.status==='ok'&&
  g.output?.sha256===hash(result.address)&&g.error===null,'GHOT_HASH_RECORD_CHANGED');
 const ghotRoot=root(roots,'the-static-collective/GHoT',GHOT_SHA);
 assert(ghotRoot.length>0,'GHOT_SOURCE_MISSING');
 const savedReceipts=readdirSync(join(out,'ghot-sandbox','records'))
  .filter(x=>x.includes('-receipt-')&&x.endsWith('.json'));
 assert(savedReceipts.length===1,'GHOT_NATIVE_RECEIPT_COUNT_CHANGED');
 assert(same(read(join(out,'ghot-sandbox','records',savedReceipts[0])),g),'GHOT_PERSISTED_RECEIPT_CHANGED');
 const r=read(join(out,'r14-request.json'));
 assert(same(r,requestFor(expected,out,Date.parse(r.spec.created_at))),'R14_REQUEST_REBOUND');
 const rel=readOriginal(roots,'the-static-collective/reLATTE',REL_SHA,'src/roundtrip.ts','relatte-014');
 const mod=await import(pathToFileURL(join(rel.checkout,'src/index.ts')).href);
 const crossing=read(r.result_path);
 assert(crossing.request_id===mod.computeOpaqueRoundTripRequestId(r),'R14_REQUEST_BINDING_FAIL');
 assert(await mod.verifyOpaqueOrganCrossing(crossing.crossing),'R14_CROSSING_NOT_SIGNED');
 assert(await mod.verifyReceipt(crossing.receive_receipt),'R14_RECEIVE_NOT_SIGNED');
 assert(await mod.verifyReceipt(crossing.disposition_receipt),'R14_HOLD_NOT_SIGNED');
 assert(crossing.receive_receipt.kind==='RECEIVED'&&crossing.disposition_receipt.kind==='R3_HOLD',
  'R14_DISPOSITION_CHANGED');
 assert(crossing.receive_receipt.crossing_id===crossing.crossing.crossing_id&&
  crossing.disposition_receipt.crossing_id===crossing.crossing.crossing_id,'R14_RECEIPT_WRONG_CROSSING');
 const inside=crossing.crossing.extensions?.organ_adapter?.donor_claims;
 assert(same(inside?.dossier,expected)&&inside?.authority_transferred===false&&
  inside?.project0_encounter_admitted===false,'SIGNED_SOURCE_CLAIMS_REBOUND');
 const receiver=await mod.LocalReceiver.open(r.receiver_root);
 assert(receiver.snapshot().held.includes(crossing.crossing.crossing_id),'HOLD_NOT_DURABLE');
 const bundle=await mod.readFileBundle(r.bundle_path);
 assert(bundle.crossing.crossing_id===crossing.crossing.crossing_id,'R14_FILE_BUNDLE_TAMPER');
 assert(same(read(join(out,'public-inspection.json')),summary(expected,g,crossing)),
  'PUBLIC_INSPECTION_TAMPERED');
 return {status:'PROJECT0_THREE_PROTOCOLS_TRANCHNODE_GHOT_RELATTE_COLD_VERIFIED',
  summary:summary(expected,g,crossing),
  original_sources_checked:SOURCES.length,
  native_project0_protocols_exercised:3,immutable_tranch_bytes_verified:true,
  ghot_local_hash_only:true,ghot_signature:false,
  signed_relatte_objects_verified:3,authority_transferred:false,external_effects:0};
}
