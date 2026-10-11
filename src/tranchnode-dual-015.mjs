/**
 * CANNON 015 — Dual TranchNode lineage. Offline, owner-provided historic
 * export preserved as private raw bytes in current TranchNode. Public proof
 * contains only *public source-code* provenance, never private data.
 *
 * The original 2026-era app is not started, queried, logged into, or scraped.
 */
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readSource} from './present-use.mjs';
import {design as design014} from './project0-tranch-014.mjs';

export const LEGACY_SHA='c1ab651e55f85d9f13551c89c1de39097d6b16a4';
export const TRANCH_SHA='7fbb0c868befd5f6a7478bdd0447477a0e8e075e';
export const PROJECT0_SHA='08f892eb379ef538cce5b3ca081ecf683b448a4b';
export const RELATTE_SHA='dcc8cdca84c440aa4294134f020fb7095bf87f24';
const fail=(ok,s)=>{if(!ok)throw Error(s)};
const digest=x=>createHash('sha256').update(x).digest('hex');
const write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx',mode:0o600});
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function checkout(roots,repo,sha){
 fail(typeof roots?.[repo]==='string','MISSING_EXACT_ROOT: '+repo);
 const root=realpathSync(resolve(roots[repo]));
 const current=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',timeout:12000}).trim();
 fail(current===sha,'SOURCE_REVISION_CHANGED: '+repo);
 return root;
}
function original(roots,repository,commit,path,id){
 const root=checkout(roots,repository,commit);
 const result=readSource({id,repository,commit,path,media_type:'text/plain',tags:[]},roots);
 return {root,content:result.content,witness:result.witness};
}
const keys=(v,k)=>v&&typeof v==='object'&&!Array.isArray(v)&&
 Object.keys(v).sort().join('|')===k.slice().sort().join('|');
const text=(v,n=6000)=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
const enums={
 privacy:['PRIVATE'],review:['UNREAD','READ','TAGGED','CURATED','ARCHIVED'],
 provider:['MANUAL','SUNO','BANDCAMP','IMPORT'],
 tao:['OBSERVED','DERIVED','METAPHOR','INTERPRETATION'],
 stage:['seed','sprout','rooted','flowering','fruit','compost','soil']
};
function safeList(xs,max){fail(Array.isArray(xs)&&xs.length<=max,'EXPORT_LIST_BOUNDS');return xs}
export function validatePrivateExport(input){
 fail(keys(input,['schema','privacy','format','codex','songs','annotations','foreign_seeds']),'PRIVATE_EXPORT_FIELDS');
 fail(input.schema==='cannon.tranchnode-v1-local-export/v0'&&input.privacy==='PRIVATE'&&
  input.format==='manual-owner-supplied' ,'NOT_EXPLICIT_PRIVATE_LOCAL_EXPORT');
 const c=input.codex;
 fail(keys(c,['albums','branching_ideas','porch_nodes']),'CODEX_FIELDS');
 const unique=(xs)=>new Set(xs).size===xs.length;
 safeList(c.albums,200).forEach(a=>fail(keys(a,['id','title','notes'])&&
  Number.isSafeInteger(a.id)&&text(a.title,250)&&text(a.notes,12000),'ALBUM_INVALID'));
 fail(unique(c.albums.map(a=>a.id)),'DUPLICATE_ALBUM_ID');
 safeList(c.branching_ideas,200).forEach(b=>fail(keys(b,['id','title','notes','createdAt'])&&
  text(b.id,150)&&text(b.title,250)&&text(b.notes,12000)&&
  !Number.isNaN(Date.parse(b.createdAt)),'BRANCH_INVALID'));
 fail(unique(c.branching_ideas.map(b=>b.id)),'DUPLICATE_BRANCH');
 safeList(c.porch_nodes,200).forEach(n=>fail(keys(n,['id','noticing','timestamp','stage'])&&
  text(n.id,150)&&text(n.noticing,12000)&&!Number.isNaN(Date.parse(n.timestamp))&&
  enums.stage.includes(n.stage),'PORCH_INVALID'));
 fail(unique(c.porch_nodes.map(n=>n.id)),'DUPLICATE_PORCH_NODE');
 safeList(input.songs,100).forEach(s=>fail(keys(s,['id','title','lyrics','provider','review_state','privacy','created_at','tags'])&&
  text(s.id,150)&&text(s.title,250)&&text(s.lyrics,350000)&&enums.provider.includes(s.provider)&&
  enums.review.includes(s.review_state)&&s.privacy==='PRIVATE'&&
  !Number.isNaN(Date.parse(s.created_at))&&
  Array.isArray(s.tags)&&s.tags.length<=30&&s.tags.every(x=>text(x,80)),'SONG_PRIVATE_OR_SHAPE_INVALID'));
 fail(unique(input.songs.map(s=>s.id)),'DUPLICATE_SONG');
 safeList(input.annotations,500).forEach(a=>fail(keys(a,['id','song_id','mode','text','tags'])&&
  text(a.id,150)&&text(a.song_id,150)&&enums.tao.includes(a.mode)&&
  text(a.text,24000)&&Array.isArray(a.tags)&&a.tags.length<=30&&
  a.tags.every(x=>text(x,80)),'ANNOTATION_INVALID'));
 fail(unique(input.annotations.map(a=>a.id)),'DUPLICATE_ANNOTATION');
 const songs=new Set(input.songs.map(s=>s.id));
 fail(input.annotations.every(a=>songs.has(a.song_id)),'ANNOTATION_UNKNOWN_SONG');
 safeList(input.foreign_seeds,100).forEach(p=>fail(keys(p,['id','sourceNode','traceId','payload','hop'])&&
  text(p.id,150)&&text(p.sourceNode,150)&&text(p.traceId,150)&&[1,2,3].includes(p.hop)&&
  keys(p.payload,['observed','taoMode'])&&text(p.payload.observed,12000)&&
  enums.tao.includes(p.payload.taoMode),'FOREIGN_SEED_INVALID'));
 fail(unique(input.foreign_seeds.map(p=>p.id)),'DUPLICATE_FOREIGN_SEED');
 return input;
}
export function publicCodeIndex(){
 return {
  schema:'webz.tranchnode-lineage-source-index/v0',
  sources:[
   {repository:'the-static-collective/tranchNode-v1',commit:LEGACY_SHA,
    role:'legacy-application-structure',source_kind:'historical-source-code'},
   {repository:'the-static-collective/tranchnode',commit:TRANCH_SHA,
    role:'exact-byte-immutable-custody',source_kind:'independent-artifact-store'},
   {repository:'the-static-collective/project0',commit:PROJECT0_SHA,
    role:'typed-continuity-without-authority',source_kind:'conformance-kernel'}
  ],
  concepts:['albums','branching_ideas','porch_nodes','songs','annotations','foreign_seeds'],
  annotationModes:['OBSERVED','DERIVED','METAPHOR','INTERPRETATION'],
  canonicalClaim:'none',
  sourceOwnerAuthenticated:false,
  personalArchiveAccess:false,
  privateBytesIncluded:false,
  privateContentHashesIncluded:false,
  uploadOrRemoteFetch:false,
  publicReleaseAuthorized:false,
  deploymentAuthorized:false,
  actualCollectionSize:'withheld',
  note:'A public directory of pinned source-code capabilities. It is not a published creative archive or permission to use its contents.'
 };
}
function tranchOperation(roots,mode,store,source){
 const t=checkout(roots,'the-static-collective/tranchnode',TRANCH_SHA);
 const originalHelper=join(import.meta.dirname,'../scripts/tranchnode-artifact-014.mjs');
 const raw=execFileSync(process.execPath,['--import',join(t,'node_modules/tsx/dist/loader.mjs'),
  originalHelper,mode,t,store,source],{
  cwd:t,encoding:'utf8',timeout:45000,maxBuffer:1024*1024,stdio:['ignore','pipe','pipe']
 });
 return JSON.parse(raw);
}
export async function prepare(roots,privateInputBytes){
 fail(privateInputBytes.length>0&&privateInputBytes.length<=4*1024*1024,'LOCAL_INPUT_SIZE_REFUSED');
 const incoming=JSON.parse(privateInputBytes.toString('utf8'));
 validatePrivateExport(incoming);
 const source=[
  original(roots,'the-static-collective/tranchNode-v1',LEGACY_SHA,'src/types.ts','v1-original-types'),
  original(roots,'the-static-collective/tranchNode-v1',LEGACY_SHA,'src/lib/autodiscographyHive.ts','v1-original-hive'),
  original(roots,'the-static-collective/tranchNode-v1',LEGACY_SHA,'src/data.ts','v1-original-seeded-codex'),
  original(roots,'the-static-collective/tranchnode',TRANCH_SHA,'src/artifact-store.ts','v2-original-store')
 ];
 const [types,hive,codex,store]=source;
 for(const [s,sig] of [[types,'export interface Song'],[types,'export interface SongAnnotation'],
  [types,'export interface PorchNode'],[types,'export interface Codex'],
  [hive,'export function validatePacket'],[codex,'export const DEFAULT_CODEX'],
  [store,'export class FilesystemArtifactStore']])
  fail(s.content.includes(sig),'ORIGINAL_V1_CONTRACT_DRIFT: '+sig);
 for(const x of enums.tao)fail(types.content.includes("'"+x+"'")&&hive.content.includes('"'+x+'"'),
  'V1_TAO_CATEGORY_MISSING: '+x);
 const floor=await design014(roots);
 const originalProject0=checkout(roots,'the-static-collective/project0',PROJECT0_SHA);
 const continuity=createRequire(import.meta.url)(join(originalProject0,'.build/src/continuity-profile/index.js'));
 const inputDigest='sha256:'+digest(privateInputBytes);
 const legacySource='github:the-static-collective/tranchNode-v1@'+LEGACY_SHA;
 const newSource='github:the-static-collective/tranchnode@'+TRANCH_SHA;
 const lane=(lane,mode,evidence,non,uncertainty=[])=>({
  lane,mode,dimensions:[{dimension:lane+'-source-status',evidenceRefs:[evidence]}],
  transformationRefs:[],residualRefs:[],uncertainty,doesNotEstablish:non
 });
 const claim={
  schema:'p0.continuity/0.1',purpose:'private archival preservation of historical Autodiscography structures',
  subjectRef:inputDigest,ancestorRoots:[legacySource],
  environment:{decoderRef:'schema-witness:tranchNode-v1@'+LEGACY_SHA,
   runtimeRef:'original-tranchnode-store@'+TRANCH_SHA,
   policyRefs:[],contextRefs:['privacy:PRIVATE','disclosure:withheld']},
  lanes:[
   lane('text-schema','preserved',legacySource,['identity','authority']),
   lane('custody','transformed',newSource,['identity','authority']),
   lane('representation-story','unresolved',legacySource,['identity','authority'],[
    'Historic repository schema does not prove the meaning or completeness of owner-imported material']),
   lane('identity','unresolved',legacySource,['authority'],['No human signer has been authenticated']),
   lane('authority','unresolved',newSource,['identity'],['Private source custody grants no public disclosure'])
  ],
  outputRefs:[inputDigest],parentContinuityRefs:[],occurrenceClaim:'continuation-only'
 };
 const continuityRef=continuity.addressContinuityClaim(claim);
 const alive=continuity.deriveStillAlive(claim);
 fail(alive.authority.portableEffect==='none'&&alive.authority.externalAdmissionRequired===true,
  'CONTINUITY_GRANTS_PERMISSION');
 const witness={
  schema:'cannon.tranchnode-dual-lineage-private-witness/v0',
  historical_application_commit:LEGACY_SHA,current_store_commit:TRANCH_SHA,
  original_source_witnesses:source.map(x=>x.witness),
  imported_bytes_source:'operator-provided-local-file',
  original_app_or_server_executed:false,
  original_app_db_or_supabase_queried:false,
  internet_fetch_during_import:false,
  imported_visibility:'PRIVATE',
  literal_source_bytes_sha256:inputDigest,
  literal_source_byte_length:privateInputBytes.length,
  underlying_project0_tranchnode_014_digest:floor.digest_sha256,
  project0_continuity:{claim,ref:continuityRef,alive},
  source_verification:'VERIFIED_EXACT_LOCAL_GIT_OBJECTS_NOT_AUTHORSHIP',
  owner_identity_authenticated:false,
  public_release_authorized:false,
  sovereign_execution_authorized:false,
  private_records_in_crossing:false,
  public_manifest:publicCodeIndex(),
  nonClaims:[
   'Legacy source types can describe an archive without proving the record was created by that application',
   'A local manually presented export is not an authenticated historical database snapshot',
   'No Suno access, account login, shared Supabase, network subscription, or remote execution occurs',
   'The contents remain private: public manifest contains public code provenance only',
   'Original TranchNode immutable artifact store preserves bytes, not historical truth',
   'Project0 continuity records a loss-aware projection, not transferred authority',
   'Signed reLATTE crossing proves local transport, not ownership or permission to publish'
  ]
 };
 return witness;
}
export function roundtripRequest(witness,out,time=Date.now()){
 fail(witness?.schema==='cannon.tranchnode-dual-lineage-private-witness/v0'&&
  witness.imported_visibility==='PRIVATE'&&witness.public_release_authorized===false&&
  witness.project0_continuity.alive.authority.portableEffect==='none'&&
  witness.private_records_in_crossing===false,'PUBLIC_OR_AUTHORITY_ESCALATION');
 const at=i=>new Date(time+i*1000).toISOString(),p=resolve(out);
 return {
  schema:'relatte.opaque-roundtrip-request/v0',
  spec:{schema:'relatte.opaque-organ-spec/v0',
   family_ref:'organ:cannon/tranchnode-dual-lineage-015',
   donor_contract_ref:'cannon.tranchnode-dual-lineage-private-witness/v0',
   artifact_kind:'private-legacy-autodisco-local-custody-witness',
   source_world:'world:cannon-private-legacy-archive-015',
   source_particular:'particular:cannon-legacy-custody-015',
   source_history_head:witness.literal_source_bytes_sha256,
   payload_refs:[{address:witness.literal_source_bytes_sha256,
    role:'private-address-reference-withheld-by-public-index',media_type:'application/json'}],
   donor_claims:{private_witness:witness,source_bytes_not_embedded:true,
    authority_transferred:false,public_release_authorized:false,
    execution_authorized:false},
   requested_effect:{kind:'candidate-ingress',authority:'receiver-local',execution_authorized:false},
   return_address:'return:cannon/legacy-archive-015',created_at:at(0)},
  receiver_root:join(p,'receiver'),receiver:{world_id:'world:local-private-preservation-015',
   receiver_particular:'particular:private-archive-015',
   contract_ref:'contract:local-private-hold-not-publication/v0'},
  bundle_path:join(p,'bundle.json'),result_path:join(p,'roundtrip-result.json'),
  disposition:'HOLD',transport_created_at:at(1),received_at:at(2),disposed_at:at(3),
  route_note:'Private manual export -> local TranchNode exact-byte store -> Project0 continuity -> local reLATTE HOLD; no website publishing'
 };
}
function publicSummary(){
 return {...publicCodeIndex(),report_kind:'code-capability-index-only',
  held_payload_metadata:'withheld',
  local_private_import_disclosed:false,
  private_artifact_address:'withheld',
  private_artifact_byte_length:'withheld'};
}
export async function run(roots,inputFile,outDir){
 fail(!existsSync(outDir),'OUTPUT_ALREADY_EXISTS');
 const content=readFileSync(resolve(inputFile));
 const w=await prepare(roots,content);
 const rel=original(roots,'the-static-collective/reLATTE',RELATTE_SHA,'src/roundtrip.ts','r14-private');
 const out=resolve(outDir);mkdirSync(out,{recursive:false,mode:0o700});
 const privateRoot=join(out,'private');mkdirSync(privateRoot,{mode:0o700});
 const exportFile=join(privateRoot,'exact-manual-export.json');
 writeFileSync(exportFile,content,{flag:'wx',mode:0o600});
 const store=join(privateRoot,'objects');
 const put=tranchOperation(roots,'put',store,exportFile);
 fail(put.address===w.literal_source_bytes_sha256&&put.created===true,'TRANCH_PRIVATE_PUT_MISMATCH');
 const again=tranchOperation(roots,'put',store,exportFile);
 fail(again.address===put.address&&again.created===false,'TRANCH_IDEMPOTENCY_VIOLATION');
 write(join(privateRoot,'private-proof.json'),{witness:w,first:put,repeated:again});
 const req=roundtripRequest(w,out);
 write(join(privateRoot,'r14-request.json'),req);
 const result=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types',join(rel.root,'scripts/opaque-roundtrip.ts')],{
  cwd:rel.root,input:JSON.stringify(req),encoding:'utf8',timeout:60000,
  stdio:['pipe','pipe','pipe'],maxBuffer:6*1024*1024
 }));
 fail(result.disposition_receipt.kind==='R3_HOLD','LOCAL_PRIVATE_RECEIVER_NOT_HELD');
 write(join(out,'public-code-index.json'),publicSummary());
 return verify(roots,inputFile,out);
}
export async function verify(roots,inputFile,outDir){
 const content=readFileSync(resolve(inputFile));
 const witness=await prepare(roots,content);
 const out=resolve(outDir),privateRoot=join(out,'private');
 fail(readFileSync(join(privateRoot,'exact-manual-export.json')).equals(content),
  'PRIVATE_ORIGINAL_FILE_CHANGED');
 const proof=read(join(privateRoot,'private-proof.json'));
 fail(eq(proof.witness,witness)&&proof.first.created===true&&proof.repeated.created===false,
  'PRIVATE_WITNESS_OR_IDEMPOTENCY_CHANGED');
 const stored=tranchOperation(roots,'verify',join(privateRoot,'objects'),join(privateRoot,'exact-manual-export.json'));
 fail(stored.address===witness.literal_source_bytes_sha256&&
  stored.verified_byte_length===content.length,'NATIVE_TRANCH_STORE_CORRUPT');
 const r=read(join(privateRoot,'r14-request.json'));
 fail(eq(r,roundtripRequest(witness,out,Date.parse(r.spec.created_at))),'PRIVATE_CROSSING_REBOUND');
 const rel=original(roots,'the-static-collective/reLATTE',RELATTE_SHA,'src/roundtrip.ts','r14-private');
 const mod=await import(pathToFileURL(join(rel.root,'src/index.ts')).href);
 const x=read(r.result_path);
 fail(x.request_id===mod.computeOpaqueRoundTripRequestId(r),'R14_PRIVATE_REQUEST_CHANGED');
 fail(await mod.verifyOpaqueOrganCrossing(x.crossing)&&
  await mod.verifyReceipt(x.receive_receipt)&&
  await mod.verifyReceipt(x.disposition_receipt),'R14_PRIVATE_SIGNATURE_INVALID');
 fail(x.receive_receipt.kind==='RECEIVED'&&x.disposition_receipt.kind==='R3_HOLD'&&
  x.receive_receipt.crossing_id===x.crossing.crossing_id&&
  x.disposition_receipt.crossing_id===x.crossing.crossing_id,'R14_PRIVATE_RECEIPTS_MISMATCH');
 const claims=x.crossing.extensions?.organ_adapter?.donor_claims;
 fail(eq(claims?.private_witness,witness)&&claims?.source_bytes_not_embedded===true&&
  claims?.public_release_authorized===false,'PRIVATE_SOURCE_NOT_HELD_SAFELY');
 const receiver=await mod.LocalReceiver.open(r.receiver_root);
 fail(receiver.snapshot().held.includes(x.crossing.crossing_id),'PRIVATE_HOLD_LOST');
 const file=await mod.readFileBundle(r.bundle_path);
 fail(file.crossing.crossing_id===x.crossing.crossing_id,'PRIVATE_BUNDLE_CHANGED');
 fail(eq(read(join(out,'public-code-index.json')),publicSummary()),'PUBLIC_INDEX_CHANGED');
 const publicBytes=readFileSync(join(out,'public-code-index.json'),'utf8');
 fail(!publicBytes.includes(witness.literal_source_bytes_sha256)&&
  !publicBytes.includes(inputFile)&&
  !content.toString().split('\n').some(s=>s.length>120&&publicBytes.includes(s)),
  'PRIVATE_DATA_LEAK_IN_PUBLIC_OUTPUT');
 return {status:'DUAL_TRANCHNODE_PRIVATE_SOURCE_CUSTODY_PROJECT0_CONTINUITY_R14_HOLD_VERIFIED',
  original_app_loaded:false,original_app_online:false,
  historical_schema_verified:true,modern_immutable_store_verified:true,
  content_deduplicated:true,continuity_authority:'UNRESOLVED',
  native_relatte_objects_verified:3,remote_effects:0,
  privacy:'PRIVATE',public_release_authorized:false,webz_code_index_only:true};
}
