/** CANNON 013: Real Project0 semantic addressing and authority-denial proof for
 * Founder Node 012's original branch evidence. No Project0 contract rewrite.
 */
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readSource} from './present-use.mjs';
import {discover} from './founder-pollen-012.mjs';
export const PROJECT0_SHA='08f892eb379ef538cce5b3ca081ecf683b448a4b';
export const RELATTE_SHA='dcc8cdca84c440aa4294134f020fb7095bf87f24';
const assert=(v,e)=>{if(!v)throw Error(e)};
const json=x=>JSON.stringify(x,null,2)+'\n';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const write=(p,v)=>writeFileSync(p,json(v),{flag:'wx',mode:0o600});
const canon=x=>{
 if(x===null||typeof x==='string'||typeof x==='boolean')return JSON.stringify(x);
 if(typeof x==='number'){assert(Number.isSafeInteger(x),'NOT_CANONICAL_NUMBER');return JSON.stringify(x)}
 if(Array.isArray(x))return '['+x.map(canon).join(',')+']';
 assert(x&&typeof x==='object'&&Object.getPrototypeOf(x)===Object.prototype,'NON_PLAIN_JSON');
 return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canon(x[k])).join(',')+'}';
};
const equal=(a,b)=>canon(a)===canon(b);
function exactRoot(roots,repo,sha){
 assert(typeof roots?.[repo]==='string','MISSING_ROOT: '+repo);
 const root=realpathSync(resolve(roots[repo]));
 const actual=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',timeout:10000}).trim();
 assert(actual===sha,'WRONG_SOURCE_REVISION: '+repo);
 return root;
}
function original(roots,repo,commit,path,id){
 const root=exactRoot(roots,repo,commit);
 const src=readSource({id,repository:repo,commit,path,media_type:'text/plain',tags:[]},roots);
 return {root,witness:src.witness,content:src.content};
}
function project0Kernel(root){
 // The only authority evaluation runs Project0's compiled, pinned original code.
 // package-lock npm ci and tsc build are done in Project0's independent checkout.
 const require=createRequire(import.meta.url);
 const canonical=require(join(root,'.build/src/canonical-addressing/index.js'));
 const kernel=require(join(root,'.build/src/reference-kernel/index.js'));
 for(const method of ['computeArtifactAddress','computeSemanticAddress','parseSemanticAddress','canonicalizeDomainValue'])
   assert(typeof canonical[method]==='function','PROJECT0_FUNCTION_UNAVAILABLE: '+method);
 for(const method of ['evaluateAuthority','evaluatePipelineAdmission'])
   assert(typeof kernel[method]==='function','PROJECT0_AUTHORITY_UNAVAILABLE: '+method);
 assert(typeof kernel.ReceiptGraph==='function','PROJECT0_RECEIPT_GRAPH_UNAVAILABLE');
 return {canonical,kernel};
}
export async function derive(roots){
 const founder=await discover(roots);
 assert(founder.executionAuthorized===false&&founder.verified_source_report.donor_executions===0,'FOUNDER_AUTHORITY_CHANGED');
 const c=original(roots,'the-static-collective/project0',PROJECT0_SHA,
  'src/canonical-addressing/index.ts','project0-canonical-floor');
 const a=original(roots,'the-static-collective/project0',PROJECT0_SHA,
  'src/reference-kernel/authority.ts','project0-native-authority');
 const ad=original(roots,'the-static-collective/project0',PROJECT0_SHA,
  'src/reference-kernel/admission.ts','project0-native-admission');
 assert(c.content.includes('export function computeSemanticAddress')&&
        a.content.includes('export function evaluateAuthority')&&
        ad.content.includes('export function evaluatePipelineAdmission'),'PROJECT0_SOURCE_MISSING');
 const {canonical,kernel}=project0Kernel(c.root);
 // Explicitly choose raw saved dossier bytes; raw artifacts never use JCS.
 const savedBytes=Buffer.from(json(founder),'utf8');
 const raw=canonical.computeArtifactAddress(savedBytes);
 assert(raw.digestHex===createHash('sha256').update(savedBytes).digest('hex'),'PROJECT0_RAW_ARTIFACT_DIVERGED');
 const node={
  kind:'proposal',
  body:{
   schema:'cannon.project0-founder-proposal-projection/v0',
   cannon_dossier_sha256:founder.dossier_sha256,
   raw_founder_dossier_artifact_address:raw.textualId,
   owner_project:'the-static-collective/founder-node',
   discovered_neighbor:'the-static-collective/the-haunted-toaster',
   source_project:'the-static-collective/toaster-lab',
   audited_source_branches:founder.candidate_plan.entries.map(e=>({
    repository:e.repository,branchHint:e.branchHint,commit:e.commit,path:e.path
   })),
   epistemic_kind:'proposed-unadmitted-integration',
   source_code_execution:false,disclosure_basis:'public-source-branch-and-nonsecret-ci-dossier',
   no_authentication_claim:true,
  },
  // This is a reproducible specimen timestamp, not a claimed historical event.
  createdAt:'2026-10-11T12:00:00Z',
  createdBy:'process:cannon013-fixture',
  provenance:[],
  disclosure:'public'
 };
 const addressed=canonical.computeSemanticAddress('Node',node);
 assert(addressed.textualId.startsWith('node-')&&
   canonical.parseSemanticAddress('Node',addressed.textualId).toString('hex')===addressed.digestHex,'PROJECT0_NODE_ROUNDTRIP');
 const request={
   requester:'process:cannon013-fixture',actor:'process:cannon013-fixture',
   purpose:'review-found-branch-integration',
   destinationScopeId:'scope:source-review-only',status:'proposal-only'
 };
 const req=canonical.computeSemanticAddress('Request',request);
 assert(canonical.parseSemanticAddress('Request',req.textualId).toString('hex')===req.digestHex,'PROJECT0_REQUEST_ROUNDTRIP');
 const pseudoGrant='grant:not-present'; // Explicitly absent, not a real capability.
 const authority=kernel.evaluateAuthority(new kernel.ReceiptGraph(),pseudoGrant,{
   policyRef:'policy:none',permittedScopes:[],permittedPurposes:[],
   permittedDisclosures:[],permittedRecipients:[]
 },{
   actor:'process:cannon013-fixture',capability:'run-donor-branch',
   scopeId:'scope:source-review-only',purpose:'review-found-branch-integration',
   disclosure:'public',evaluatedAt:'2026-10-11T12:00:00Z'
 });
 assert(authority.status==='refused'&&authority.reasonCodes.length===1&&
   authority.reasonCodes[0]==='AUTHORITY_MISSING','MISSING_LEASE_NOT_REFUSED');
 const pipeline=kernel.evaluatePipelineAdmission({authority,provenance:{status:'valid',reasonCodes:[]},disclosureAllowed:true});
 assert(pipeline.status==='refused'&&pipeline.reasonCodes.includes('AUTHORITY_MISSING'),'MISSING_LEASE_PROMOTED_TO_ADMISSION');
 // Demonstrate Project0 meaning-sensitive distinctions: same content with
 // a different disclosure is a distinct semantic identity.
 const alteredDisclosure=canonical.computeSemanticAddress('Node',{...node,disclosure:'private'});
 assert(alteredDisclosure.textualId!==addressed.textualId,'DISCLOSURE_IGNORED_IN_SEMANTIC_ADDRESS');
 // Type is a domain: same body cannot be hashed as arbitrary JCS or wrong kind.
 const domainDigest=canonical.canonicalizeDomainValue('Project0-Node-v1|',{
   kind:node.kind,body:node.body,createdAt:node.createdAt,
   createdBy:node.createdBy,provenance:node.provenance,disclosure:node.disclosure
 }).digestHex;
 assert(domainDigest===addressed.digestHex,'PROJECT0_CANONICAL_DOMAIN_DIVERGED');
 const body={
  schema:'cannon.project0-semantic-floor-witness/v0',
  founder_pollen_dossier_sha256:founder.dossier_sha256,
  source_witnesses:[c.witness,a.witness,ad.witness],
  project0_source_commit:PROJECT0_SHA,
  native_project0_addressing_verified:true,
  canonical_node_body:node,semantic_node_id:addressed.textualId,
  semantic_node_digest_sha256:addressed.digestHex,
  canonical_request_body:request,semantic_request_id:req.textualId,
  raw_dossier_artifact_sha256:raw.digestHex,
  three_distinct_identity_domains:{
    cannon_jcs_address:founder.dossier_sha256,
    project0_raw_artifact_address:raw.textualId,
    project0_domain_node_address:addressed.textualId
  },
  native_project0_authority_check:{status:authority.status,reasonCodes:authority.reasonCodes,
    graph_grant_count:0,synthetic_missing_grant:true},
  native_project0_admission_check:{status:pipeline.status,reasonCodes:pipeline.reasonCodes},
  disclosure_sensitive_identity:true,project0_node_admitted:false,
  original_project0_modules_executed:true,donor_programs_executed:false,
  founder_pollen_module_authority_exported:false,receiver_authority_transferred:false,
  remote_effects:0,
  nonClaims:[
   'Project0 semantic identity is typed deterministic addressing, not authorization',
   'Raw artifact address is SHA256 of exact saved JSON file bytes, not canonical JSON',
   'The Project0 proposal Node is addressed, but not inserted into an admitted graph',
   'The Project0 reference kernel refuses a deliberately absent authority grant',
   'The specimen timestamp and creator label identify fixture fields, not a human event',
   'The reLATTE HOLD below is an independent receiving-world disposition',
  ],
 };
 return {founder,project0:{...body,semantic_witness_sha256:
   'sha256:'+createHash('sha256').update(canon(body)).digest('hex')}};
}
export function requestFor(witness,out,at=Date.now()){
 assert(witness?.schema==='cannon.project0-semantic-floor-witness/v0'&&
        witness.native_project0_admission_check?.status==='refused'&&
        witness.project0_node_admitted===false,'PROJECT0_CANNOT_CARRY_ADMISSION_CLAIM');
 const fmt=i=>new Date(at+i*1000).toISOString(),r=resolve(out);
 return {schema:'relatte.opaque-roundtrip-request/v0',
  spec:{schema:'relatte.opaque-organ-spec/v0',
   family_ref:'organ:cannon/project0-floor-013',
   donor_contract_ref:'cannon.project0-semantic-floor-witness/v0',
   artifact_kind:'project0-addressed-unadmitted-founder-capability',
   source_world:'world:cannon-project0-fixture-013',
   source_particular:'particular:cannon-project0-013',
   source_history_head:witness.semantic_witness_sha256,
   payload_refs:[{address:witness.semantic_witness_sha256,role:'source-pinned-project0-semantic-witness',media_type:'application/json'}],
   donor_claims:{witness,project0_node_admitted:false,execution_authorized:false,authority_transferred:false},
   requested_effect:{kind:'candidate-ingress',authority:'receiver-local',execution_authorized:false},
   return_address:'return:cannon/project0-013',created_at:fmt(0)},
  receiver_root:join(r,'receiver'),receiver:{world_id:'world:project0-reference-review',
   receiver_particular:'particular:project0-receiver-013',
   contract_ref:'contract:project0-meaning-floor-review/v0'},
  bundle_path:join(r,'transport.json'),result_path:join(r,'roundtrip-result.json'),
  disposition:'HOLD',transport_created_at:fmt(1),received_at:fmt(2),disposed_at:fmt(3),
  route_note:'Project0 original canonical semantics + missing-lease REFUSED -> reLATTE signed RECEIVE/HOLD'};
}
function publicSummary(witness,result){
 return {schema:'cannon.project0-public-inspection/v0',
  original_project0_commit:PROJECT0_SHA,
  founder_dossier_sha256:witness.founder_pollen_dossier_sha256,
  project0_semantic_node_id:witness.semantic_node_id,
  project0_semantic_request_id:witness.semantic_request_id,
  project0_raw_artifact_sha256:witness.raw_dossier_artifact_sha256,
  cannon_canonical_dossier_sha256:witness.three_distinct_identity_domains.cannon_jcs_address,
  project0_reference_authority:'REFUSED_AUTHORITY_MISSING',
  project0_admission:'REFUSED',project0_node_admitted:false,
  crossing_id:result.crossing.crossing_id,
  relatte_received_id:result.receive_receipt.receipt_id,
  relatte_hold_id:result.disposition_receipt.receipt_id,
  receiver_disposition:'HOLD',remote_effects:0,donor_code_executed:false,production_deployed:false};
}
export async function run(roots,outDir){
 assert(!existsSync(outDir),'OUTPUT_ALREADY_EXISTS');
 const {founder,project0}=await derive(roots);
 const rel=original(roots,'the-static-collective/reLATTE',RELATTE_SHA,'src/roundtrip.ts','relatte-pinned');
 assert(rel.witness.size>0,'NATIVE_RELATTE_NOT_PRESENT');
 const out=resolve(outDir);mkdirSync(out,{recursive:false,mode:0o700});
 write(join(out,'founder-pollen-source.json'),founder);
 write(join(out,'project0-semantic-witness.json'),project0);
 const req=requestFor(project0,out);write(join(out,'crossing-request.json'),req);
 const raw=execFileSync(process.execPath,['--experimental-strip-types',join(rel.root,'scripts/opaque-roundtrip.ts')],{
  cwd:rel.root,input:JSON.stringify(req),encoding:'utf8',timeout:60000,maxBuffer:5*1024*1024,
  stdio:['pipe','pipe','pipe']});
 const result=JSON.parse(raw);write(join(out,'public-inspection.json'),publicSummary(project0,result));
 return verify(roots,out);
}
export async function verify(roots,outDir){
 const expected=await derive(roots),out=resolve(outDir);
 const source=readFileSync(join(out,'founder-pollen-source.json'));
 const project0=read(join(out,'project0-semantic-witness.json'));
 assert(source.equals(Buffer.from(json(expected.founder))),'RAW_FOUNDER_ARTIFACT_REPLAY_CHANGED');
 assert(equal(project0,expected.project0),'PROJECT0_MEANING_OR_AUTHORITY_REPLAY_CHANGED');
 const r=read(join(out,'crossing-request.json'));
 assert(equal(r,requestFor(expected.project0,out,Date.parse(r.spec.created_at))),'PROJECT0_RELATTE_REQUEST_CHANGED');
 const rel=original(roots,'the-static-collective/reLATTE',RELATTE_SHA,'src/roundtrip.ts','relatte-pinned');
 const mod=await import(pathToFileURL(join(rel.root,'src/index.ts')).href);
 const result=read(r.result_path);
 assert(result.request_id===mod.computeOpaqueRoundTripRequestId(r),'R14_REQUEST_ID_CHANGED');
 assert(await mod.verifyOpaqueOrganCrossing(result.crossing),'R14_CROSSING_SIGNATURE_INVALID');
 assert(await mod.verifyReceipt(result.receive_receipt),'R14_RECEIVE_SIGNATURE_INVALID');
 assert(await mod.verifyReceipt(result.disposition_receipt),'R14_HOLD_SIGNATURE_INVALID');
 assert(result.receive_receipt.kind==='RECEIVED'&&result.disposition_receipt.kind==='R3_HOLD','R14_NOT_RECEIVED_HELD');
 assert(result.receive_receipt.crossing_id===result.crossing.crossing_id&&
   result.disposition_receipt.crossing_id===result.crossing.crossing_id,'RECEIPTS_NOT_BOUND_TO_CROSSING');
 const claims=result.crossing.extensions?.organ_adapter?.donor_claims;
 assert(equal(claims?.witness,expected.project0)&&claims.execution_authorized===false&&
   claims.project0_node_admitted===false,'SIGNED_PROJECT0_EVIDENCE_MISSING');
 const receiver=await mod.LocalReceiver.open(r.receiver_root);
 assert(receiver.snapshot().held.includes(result.crossing.crossing_id),'R14_RECEIVER_HOLD_NOT_DURABLE');
 const bundle=await mod.readFileBundle(r.bundle_path);
 assert(bundle.crossing.crossing_id===result.crossing.crossing_id,'R14_BUNDLE_TAMPERED');
 const summary=publicSummary(expected.project0,result);
 assert(equal(read(join(out,'public-inspection.json')),summary),'PUBLIC_PROJECT0_SUMMARY_TAMPERED');
 return {status:'PROJECT0_NATIVE_SEMANTIC_AND_MISSING_AUTHORITY_RELATTE_HOLD_VERIFIED',
  summary,project0_runtime_checked:true,project0_authority_permitted:false,
  signed_relatte_receipts_verified:3,donor_code_executed:false,remote_effects:0};
}
