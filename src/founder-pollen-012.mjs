/** CANNON 012 — original Founder Node Pollen Scout -> real tested donor branch loadout.
 * READ SOURCE AND PROPOSE ONLY. Pollen advice neither selects canon nor authorizes jobs.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readSource} from './present-use.mjs';
import {inspect as inspectLoadout,validate as validateLoadout} from './branch-loadout.mjs';

export const FOUNDER_SHA='fa6240ce5c9dfea154dcc714301ab4c0e0d548e5';
export const AUTHORITY_SHA='b99dd1bf3e9af4c30a4f0e365237357086b7fdf6';
export const RELATTE_SHA='dcc8cdca84c440aa4294134f020fb7095bf87f24';
export const ANCHOR='toaster-lab',DOOR='haunted-toaster';
const SOURCE_CATALOG=Object.freeze([
  {id:'toaster-lab-proposal-transfer',project_id:ANCHOR,
    repository:'the-static-collective/toaster-lab',
    branchHint:'agent/pr-3-exportable-proposal',
    commit:'ec923f3e36874309ec5f16b6480576ed5c55f5e2',
    path:'src/lib/toasterProposalTransfer.ts',runtime:'NODE_22',argv:[],
    evidenceUrl:'https://github.com/the-static-collective/toaster-lab/actions/runs/31230529597',
    gates:['Human reviews exact source interface and local dependencies before any use',
           'Proposal-export module does not authorize Haunted Toaster validation or execution']},
  {id:'haunted-toaster-lab-import',project_id:DOOR,
    repository:'the-static-collective/the-haunted-toaster',
    branchHint:'agent/import-toaster-lab-proposal',
    commit:'c227036ee47c1445b06db52c1d55e702490a0da0',
    path:'src/full-measure/src/lab-proposal.cjs',runtime:'NODE_22',argv:[],
    evidenceUrl:'https://github.com/the-static-collective/the-haunted-toaster/actions/runs/31238538668',
    gates:['Human reviews destination-owned score admission and input constraints',
           'GHoT execution, application launch, render and remote effects remain unauthorized']},
]);
const assert=(v,s)=>{if(!v)throw Error(s)};
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const canonical=x=>{
  if(x===null||typeof x==='boolean'||typeof x==='string')return JSON.stringify(x);
  if(typeof x==='number'){assert(Number.isSafeInteger(x),'UNSAFE_NUMBER');return JSON.stringify(x)}
  if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';
  assert(x&&typeof x==='object'&&Object.getPrototypeOf(x)===Object.prototype,'INVALID_JSON');
  return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
};
const address=x=>sha(Buffer.from(canonical(x)));
const equal=(x,y)=>canonical(x)===canonical(y);
const write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx',mode:0o600});
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const requireRoot=(roots,repo,shaValue)=>{
  assert(roots&&typeof roots==='object'&&typeof roots[repo]==='string','MISSING_ROOT: '+repo);
  const root=realpathSync(resolve(roots[repo]));
  const current=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',timeout:10000}).trim();
  assert(current===shaValue,'GIT_CHECKOUT_NOT_PINNED: '+repo);
  return root;
};
const source=(roots,s)=>{
  const root=requireRoot(roots,s.repository,s.commit);
  const o=readSource({id:s.id,repository:s.repository,commit:s.commit,path:s.path,media_type:'text/plain',tags:[]},roots);
  return {root,...o};
};
const FOUNDER_SOURCES=[
  {id:'pollen-scout',repository:'the-static-collective/founder-node',commit:FOUNDER_SHA,path:'src/services/nearbyGrowth.ts'},
  {id:'founder-composition',repository:'the-static-collective/founder-node',commit:FOUNDER_SHA,path:'src/services/ecosystemComposition.ts'},
];
const REGISTRY_SOURCES=[
  {id:'authority-projects',repository:'the-static-collective/jubilee-authority-kit',commit:AUTHORITY_SHA,path:'registry/projects.json'},
  {id:'authority-invariants',repository:'the-static-collective/jubilee-authority-kit',commit:AUTHORITY_SHA,path:'registry/invariants.json'},
];
export function validateRegistry(projectDoc,invariantDoc){
  assert(projectDoc?.version===1&&typeof projectDoc.updated==='string'&&Array.isArray(projectDoc.projects),'INVALID_PROJECT_REGISTRY');
  assert(invariantDoc?.version===1&&typeof invariantDoc.updated==='string'&&Array.isArray(invariantDoc.invariants),'INVALID_INVARIANT_REGISTRY');
  const ids=new Set();
  for(const p of projectDoc.projects){
    assert(p&&typeof p.id==='string'&&!ids.has(p.id),'DUPLICATE_PROJECT');
    assert(/^the-static-collective\/[A-Za-z0-9_.-]+$/.test(p.repository),'INVALID_PROJECT_REPOSITORY');
    assert(['active','seed','dormant','ancestor','monument','unresolved'].includes(p.status),'UNKNOWN_LIFECYCLE');
    assert(Array.isArray(p.relations)&&Array.isArray(p.owns)&&Array.isArray(p.nonAuthority),'INVALID_PROJECT_ROLE');
    ids.add(p.id);
  }
  const invariants=new Set();
  for(const v of invariantDoc.invariants){
    assert(v&&typeof v.id==='string'&&!invariants.has(v.id),'DUPLICATE_INVARIANT');
    assert(ids.has(v.owner)&&Array.isArray(v.consumers)&&v.consumers.every(id=>ids.has(id)),'INVARIANT_PARTICIPANT_UNKNOWN');
    assert(Array.isArray(v.proofRefs)&&typeof v.maturity==='string','INVALID_INVARIANT_PROOFS');
    invariants.add(v.id);
  }
  const project=projectDoc.projects.find(p=>p.id===ANCHOR);
  const dest=projectDoc.projects.find(p=>p.id===DOOR);
  assert(project?.repository==='the-static-collective/toaster-lab'&&dest?.repository==='the-static-collective/the-haunted-toaster','PROJECT_IDENTITY_NOT_REGISTRY_BACKED');
  const typed=project.relations.find(r=>r.type==='PROPOSES_TO'&&r.target===DOOR);
  assert(!!typed,'MISSING_REAL_TYPED_RELATION');
  const inv=invariantDoc.invariants.find(v=>v.id==='proposal-not-authority');
  assert(inv?.maturity==='proven'&&inv.owner===ANCHOR&&inv.consumers.includes(DOOR),'MISSING_RECORDED_PROVEN_INVARIANT');
  return true;
}
const toContext=p=>({...p,name:p.repository.split('/').pop(),description:p.role,
  authorityDomain:p.owns.join(', '),laws:[],readme:'',architecture:'',
  openIssues:[],activePRs:[],recentCommits:[],roadmap:[]});
export function selectReviewSources(nearby,projects){
  assert(nearby&&Array.isArray(nearby.doors)&&nearby.doors.length<=3,'INVALID_POLLEN_OUTPUT');
  const door=nearby.doors.find(x=>x.projectId===DOOR);
  assert(door?.repository==='the-static-collective/the-haunted-toaster'&&door.status==='active','REQUIRED_EVIDENCED_DOOR_MISSING');
  assert(door.evidence.some(e=>e.kind==='typed-relation'&&e.relationType==='PROPOSES_TO'&&e.direction==='outbound'&&e.sourceProjectId===ANCHOR&&e.targetProjectId===DOOR),'TYPED_RELATION_NOT_EVIDENCED');
  assert(door.evidence.some(e=>e.kind==='shared-invariant'&&e.invariantId==='proposal-not-authority'&&e.ownerProjectId===ANCHOR),'SHARED_INVARIANT_NOT_EVIDENCED');
  for(const s of SOURCE_CATALOG){
    const p=projects.find(x=>x.id===s.project_id);
    assert(p&&p.repository===s.repository,'CATALOG_PROJECT_REPOSITORY_MISMATCH');
  }
  return SOURCE_CATALOG.map(({project_id,...entry})=>({...entry,
    gates:[...entry.gates]}));
}
export async function discover(roots){
  const [pollenSource,compositionSource]=FOUNDER_SOURCES.map(s=>source(roots,s));
  const [projectsSource,invariantsSource]=REGISTRY_SOURCES.map(s=>source(roots,s));
  assert(pollenSource.content.includes('export function deriveNearbyGrowth'),'ORIGINAL_POLLEN_FUNCTION_UNAVAILABLE');
  assert(compositionSource.content.includes('export function createWorkbenchInspectionHandoff'),'ORIGINAL_HANDOFF_FUNCTION_UNAVAILABLE');
  const projectDoc=JSON.parse(projectsSource.content),invariantDoc=JSON.parse(invariantsSource.content);
  validateRegistry(projectDoc,invariantDoc);
  const founderRoot=pollenSource.root;
  const pollenModule=await import(pathToFileURL(join(founderRoot,'src/services/nearbyGrowth.ts')).href);
  const compositionModule=await import(pathToFileURL(join(founderRoot,'src/services/ecosystemComposition.ts')).href);
  assert(typeof pollenModule.deriveNearbyGrowth==='function'&&typeof compositionModule.createWorkbenchInspectionHandoff==='function','FOUNDERS_NATIVE_FUNCTIONS_MISSING');
  const projects=projectDoc.projects.map(toContext);
  const registryWitness={
    projects:{version:projectDoc.version,updated:projectDoc.updated,source:'pinned:the-static-collective/jubilee-authority-kit@'+AUTHORITY_SHA+'/registry/projects.json'},
    invariants:{version:invariantDoc.version,updated:invariantDoc.updated,source:'pinned:the-static-collective/jubilee-authority-kit@'+AUTHORITY_SHA+'/registry/invariants.json'},
  };
  const input={routedProjectIds:[ANCHOR],projects,invariants:invariantDoc.invariants,registryWitness};
  // Execute original *pure routing and projection* functions, never Founder Node's server.
  const nearby=pollenModule.deriveNearbyGrowth(input);
  const eco=compositionModule.deriveEcosystemComposition({...input,nearbyGrowth:nearby});
  assert(eco.draft?.state==='proposal-only'&&eco.draft.anchorProjectIds.includes(ANCHOR),'NO_REAL_COMPOSITION_DRAFT');
  assert(eco.draft.participants.some(x=>x.projectId===DOOR),'POLLEN_DOOR_NOT_IN_COMPOSITION');
  const handoff=compositionModule.createWorkbenchInspectionHandoff(eco.draft);
  assert(handoff.schema==='static-collective.founder-node.workbench-inspection.v0.1'&&handoff.executionAuthorized===false&&handoff.compatibility==='unverified'&&handoff.localReadiness==='unknown'&&handoff.destinationAcceptance==='not-requested','FOUNDER_HANDOFF_CLAIMS_AUTHORITY');
  const entries=selectReviewSources(nearby,projects);
  const plan={schema:'cannon.branch-loadout-plan/v0',
    purpose:'Founder Node Pollen Scout evidence-backed Toaster Lab -> Haunted Toaster source review; no execution',
    entries};
  validateLoadout(plan);
  const loadout=inspectLoadout(plan,roots); // Original CANNON 008 Git object verification, zero donor executions.
  assert(loadout.status==='SOURCE_VERIFIED_REVIEW_REQUIRED'&&loadout.entries.length===2&&loadout.donor_executions===0,'LOADOUT_AUTHORITY_INVALID');
  const result={
    schema:'cannon.founder-pollen-bridge/v0',
    founder_source_commit:FOUNDER_SHA,authority_registry_commit:AUTHORITY_SHA,
    pinned_original_sources:[pollenSource.witness,compositionSource.witness,projectsSource.witness,invariantsSource.witness],
    routed_project:ANCHOR,
    genuine_pollen_result:nearby,
    founder_workbench_handoff:handoff,
    catalog_selected_only_for_review:true,related_project_door:DOOR,
    candidate_plan:plan,verified_source_report:loadout,
    corroboration:{
      original_pollen_function_executed:true,
      original_ecosystem_projection_executed:true,
      registry_source_verified_locally:true,
      invariant_maturity_is_registry_claim_not_independent_proof:true,
      candidate_source_files_locally_verified:true,
      candidate_modules_imported_or_executed:false,
      projected_compatibility_verified:false,
      permission_transferred:false,
      source_signer_authenticated:false,
    },
    disposition:'PROPOSAL_REVIEW_REQUIRED',executionAuthorized:false,
    ghotActivationAuthorized:false,canonSelected:false,deployments:0,externalEffects:0,
    nonClaims:['Pollen selection is evidenced relevance, not acceptance or authorization',
      'Registry proofRef is a recorded reference, not independent cryptographic proof',
      'Explicit pinned branch entries were reviewed into the experiment catalog, not selected by Pollen Scout',
      'Source Git remote configuration is not an authenticated source-owner assertion',
      'Founder Node UI intent is not sampled or authenticated',
      'No donor module or GHoT activation is executed'],
  };
  return {...result,dossier_sha256:address(result)};
}
export function roundtripRequest(dossier,out,time=Date.now()){
  assert(dossier?.schema==='cannon.founder-pollen-bridge/v0'&&dossier.executionAuthorized===false&&dossier.externalEffects===0,'CANNOT_TRANSPORT_AUTHORITY');
  const at=i=>new Date(time+i*1000).toISOString(),root=resolve(out);
  return {schema:'relatte.opaque-roundtrip-request/v0',
    spec:{schema:'relatte.opaque-organ-spec/v0',family_ref:'organ:cannon/founder-pollen-012',
      donor_contract_ref:'cannon.founder-pollen-bridge/v0',
      artifact_kind:'founder-evidenced-two-branch-review-proposal',
      source_world:'world:cannon-branch-review-012',source_particular:'particular:cannon-founder-pollen-012',
      source_history_head:dossier.dossier_sha256,
      payload_refs:[{address:dossier.dossier_sha256,role:'verified-founder-pollen-branch-plan',media_type:'application/json'}],
      donor_claims:{dossier,source_verified:true,donor_executions:0,authority_transferred:false,
        signer_authenticated:false,requested_output:'RECEIVE_THEN_HOLD'},
      requested_effect:{kind:'candidate-ingress',authority:'receiver-local',execution_authorized:false},
      return_address:'return:cannon/founder-pollen-012',created_at:at(0)},
    receiver_root:join(root,'receiver'),receiver:{world_id:'world:cannon-review-012',
      receiver_particular:'particular:cannon-review-012',contract_ref:'contract:pollen-source-review/v0'},
    bundle_path:join(root,'transport.json'),result_path:join(root,'roundtrip-result.json'),
    disposition:'HOLD',transport_created_at:at(1),received_at:at(2),disposed_at:at(3),
    route_note:'Native Founder Node evidence and source verified CANNON 008 branch loadout, HOLD with no authority transfer'};
}
const summarize=(d,r)=>({
  schema:'cannon.founder-pollen-public-inspection/v0',dossier_sha256:d.dossier_sha256,
  original_founder_commit:FOUNDER_SHA,original_registry_commit:AUTHORITY_SHA,
  subject_project:d.routed_project,candidate_neighbor:d.related_project_door,
  source_branch_count:d.verified_source_report.entries.length,
  evidence_classes:d.genuine_pollen_result.doors.find(x=>x.projectId===DOOR).evidence.map(x=>x.kind),
  reviewed_branch_pins:d.candidate_plan.entries.map(x=>({repository:x.repository,branchHint:x.branchHint,commit:x.commit,path:x.path})),
  crossing_id:r.crossing.crossing_id,receive_receipt_id:r.receive_receipt.receipt_id,
  hold_receipt_id:r.disposition_receipt.receipt_id,
  disposition:'HOLD',executionAuthorized:false,
  pollen_is_authority:false,branch_selection_is_canon:false,donor_modules_executed:false,
  remoteEffects:0,productionDeployed:false});
export async function run(roots,outdir){
  assert(!existsSync(outdir),'OUTPUT_ALREADY_EXISTS');
  const d=await discover(roots);
  const rel=source(roots,{id:'relatte-original-R14',repository:'the-static-collective/reLATTE',
    commit:RELATTE_SHA,path:'src/roundtrip.ts'});
  assert(rel.witness.size>0,'RELATTE_NOT_VERIFIED');
  const out=resolve(outdir);mkdirSync(out,{recursive:false,mode:0o700});
  write(join(out,'founder-pollen-dossier.json'),d);
  write(join(out,'candidate-loadout-plan.json'),d.candidate_plan);
  write(join(out,'verified-loadout-report.json'),d.verified_source_report);
  const request=roundtripRequest(d,out);write(join(out,'roundtrip-request.json'),request);
  const raw=execFileSync(process.execPath,['--experimental-strip-types',join(rel.root,'scripts/opaque-roundtrip.ts')],{
    cwd:rel.root,input:JSON.stringify(request),encoding:'utf8',timeout:60000,maxBuffer:5*1024*1024,
    stdio:['pipe','pipe','pipe']});
  const result=JSON.parse(raw);
  assert(result.receive_receipt.kind==='RECEIVED'&&result.disposition_receipt.kind==='R3_HOLD','NOT_HELD');
  write(join(out,'public-inspection.json'),summarize(d,result));
  return verify(roots,out);
}
export async function verify(roots,outdir){
  const expected=await discover(roots),out=resolve(outdir);
  const report=read(join(out,'founder-pollen-dossier.json'));
  assert(equal(report,expected),'FOUNDER_DISCOVERY_COLD_REPLAY_CHANGED');
  assert(equal(read(join(out,'candidate-loadout-plan.json')),expected.candidate_plan),'CANDIDATE_PLAN_TAMPERED');
  assert(equal(read(join(out,'verified-loadout-report.json')),expected.verified_source_report),'ORIGINAL_SOURCE_REPLAY_CHANGED');
  const reRoot=requireRoot(roots,'the-static-collective/reLATTE',RELATTE_SHA);
  const request=read(join(out,'roundtrip-request.json'));
  assert(equal(request,roundtripRequest(expected,out,Date.parse(request.spec.created_at))),'RELATTE_REQUEST_TAMPERED');
  const mod=await import(pathToFileURL(join(reRoot,'src/index.ts')).href);
  const result=read(request.result_path);
  assert(result.request_id===mod.computeOpaqueRoundTripRequestId(request),'ROUNDTRIP_REQUEST_ID_CHANGED');
  assert(await mod.verifyOpaqueOrganCrossing(result.crossing),'CROSSING_SIGNATURE_INVALID');
  assert(await mod.verifyReceipt(result.receive_receipt),'RECEIVE_SIGNATURE_INVALID');
  assert(await mod.verifyReceipt(result.disposition_receipt),'HOLD_SIGNATURE_INVALID');
  assert(result.receive_receipt.kind==='RECEIVED'&&result.disposition_receipt.kind==='R3_HOLD','UNAUTHORIZED_DISPOSITION');
  assert(result.receive_receipt.crossing_id===result.crossing.crossing_id&&result.disposition_receipt.crossing_id===result.crossing.crossing_id,'RECEIPT_NOT_BOUND');
  const embedded=result.crossing.extensions?.organ_adapter?.donor_claims;
  assert(equal(embedded?.dossier,expected)&&embedded?.authority_transferred===false,'FOUNDER_DOSSIER_NOT_CARRIED');
  const receiver=await mod.LocalReceiver.open(request.receiver_root);
  assert(receiver.snapshot().held.includes(result.crossing.crossing_id),'RECEIVER_HOLD_LOST');
  const bundle=await mod.readFileBundle(request.bundle_path);
  assert(bundle.crossing.crossing_id===result.crossing.crossing_id,'BUNDLE_CROSSING_MISMATCH');
  const summary=summarize(expected,result);
  assert(equal(read(join(out,'public-inspection.json')),summary),'PUBLIC_INSPECTION_TAMPERED');
  return {status:'FOUNDER_POLLEN_TO_CANNON_SOURCE_LOADOUT_RELATTE_HOLD_COLD_VERIFIED',
    summary,original_founder_source_files:2,original_registry_files:2,verified_branch_modules:2,
    upstream_modules_executed:0,branch_programs_executed:0,remote_effects:0};
}
