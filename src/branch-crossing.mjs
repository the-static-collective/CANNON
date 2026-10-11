/** CANNON 009 — real, bounded, opt-in local GHoT hash -> native reLATTE HOLD.
 * The only executable capability is a strictly pinned local system.hash.
 * A GitHub Actions sandbox is not an owner authorization for real deployments.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync,mkdirSync,writeFileSync,existsSync,realpathSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {inspect} from './branch-loadout.mjs';
import {readSource} from './present-use.mjs';

export const GHOT_SHA='e35dd470384d864b7b0b629a68dad570875a7df0';
export const RELATTE_SHA='dcc8cdca84c440aa4294134f020fb7095bf87f24';
export const SUMMARY_SCHEMA='cannon.branch-work-receipt/v0';
const assert=(v,s)=>{if(!v)throw Error(s);};
const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const checkedRoot=(roots,repo,sha)=>{
  assert(roots!==null&&typeof roots==='object'&&typeof roots[repo]==='string','ROOT_NOT_DECLARED: '+repo);
  const root=realpathSync(resolve(roots[repo]));
  const actual=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',timeout:10000}).trim();
  assert(actual===sha,'DONOR_CHECKOUT_NOT_EXACT: '+repo);
  return root;
};
const write=(p,obj)=>writeFileSync(p,JSON.stringify(obj,null,2)+'\n',{flag:'wx',mode:0o600});
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const canonical=x=>{
  if(x===null||typeof x==='string'||typeof x==='boolean'||typeof x==='number')return JSON.stringify(x);
  if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';
  assert(x&&typeof x==='object','NOT_JSON');
  return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
};
const equal=(a,b)=>canonical(a)===canonical(b);
function onePersisted(home,kind){
  const dir=join(home,'records');
  const names=readdirSync(dir).filter(x=>x.endsWith('-'+kind+'-'+(kind==='task'?'':kind==='receipt'?'':'') ) && false);
  // Filename contains timestamp, kind, and UUID; parse content instead of trusting names.
  const found=readdirSync(dir).filter(x=>x.includes('-'+kind+'-')&&x.endsWith('.json')).map(x=>read(join(dir,x)));
  assert(found.length===1,'GHOT_EXPECTED_ONE_'+kind.toUpperCase());
  return found[0];
}
export function verifyGhot(task,receipt,input){
  assert(typeof input==='string'&&/^[0-9a-f]{64}$/.test(input),'INVALID_SOURCE_COMMITMENT');
  assert(task.kind==='ghot.task'&&task.version==='0'&&task.capability==='system.hash'&&task.input===input,'TASK_NOT_BOUND_TO_LOADOUT');
  assert(task.constraints?.network==='not-required','UNEXPECTED_TASK_NETWORK_POLICY');
  assert(receipt.kind==='ghot.receipt'&&receipt.version==='0'&&receipt.capability==='system.hash'&&receipt.status==='ok'&&receipt.error===null,'GHOT_WORK_FAILED');
  assert(receipt.task_id===task.task_id&&receipt.requester_node_id===task.requester_node_id,'TASK_RECEIPT_NOT_LINKED');
  const expected=hash(input);
  assert(equal(receipt.output,{sha256:expected}),'GHOT_HASH_OUTPUT_MISMATCH');
  assert(receipt.output_sha256===hash(canonical(receipt.output)),'GHOT_OUTPUT_COMMITMENT_MISMATCH');
  return {task_id:task.task_id,receipt_id:receipt.receipt_id,receipt_sha256:hash(canonical(receipt)),output_sha256:expected};
}
function selectedSources(loadout,roots){
  const source=inspect(loadout,roots);
  const ghRoot=checkedRoot(roots,'the-static-collective/GHoT',GHOT_SHA);
  const reRoot=checkedRoot(roots,'the-static-collective/reLATTE',RELATTE_SHA);
  const gh=readSource({id:'ghot-executor',repository:'the-static-collective/GHoT',commit:GHOT_SHA,path:'ghot/reference_node.py',media_type:'text/plain',tags:[]},roots).witness;
  const rel=readSource({id:'relatte-receiver',repository:'the-static-collective/reLATTE',commit:RELATTE_SHA,path:'src/roundtrip.ts',media_type:'text/plain',tags:[]},roots).witness;
  assert(source.status==='SOURCE_VERIFIED_REVIEW_REQUIRED','CANNON_SOURCE_NOT_VERIFIED');
  return {source,ghRoot,reRoot,gh,rel};
}
function makeRequest(source,gh,rel,work,out){
  const now=Date.now(),t=s=>new Date(now+s*1000).toISOString();
  return {schema:'relatte.opaque-roundtrip-request/v0',
    spec:{schema:'relatte.opaque-organ-spec/v0',family_ref:'organ:ghot/system.hash',
      donor_contract_ref:'ghot.receipt/v0',artifact_kind:'bounded-local-hash-result',
      source_world:'world:cannon-branch-loadout-009',
      source_particular:'particular:ghot:'+work.receipt_id,
      source_history_head:'sha256:'+source.reportSha256,
      payload_refs:[{address:'sha256:'+work.receipt_sha256,role:'local-receipt-reference',media_type:'application/json'}],
      donor_claims:{loadout_report_sha256:source.reportSha256,
        original_ghot_git_commit:GHOT_SHA,ghot_source_blob_sha256:gh.blob_sha256,
        original_relatte_git_commit:RELATTE_SHA,relatte_source_blob_sha256:rel.blob_sha256,
        ghot_task_id:work.task_id,ghot_receipt_id:work.receipt_id,ghot_output_sha256:work.output_sha256,
        donor_code_ran_locally:true,donor_code_ran_only_system_hash:true,
        donor_authority_transferred:false,remote_effect_executed:false},
      requested_effect:{kind:'candidate-ingress',authority:'receiver-local',execution_authorized:false},
      return_address:'return:cannon/branch-work-009',created_at:t(0)},
    receiver_root:join(out,'receiver'),
    receiver:{world_id:'world:cannon-review-room',receiver_particular:'particular:cannon-review-009',
      contract_ref:'contract:branch-work-inspection/v0'},
    bundle_path:join(out,'crossing-bundle.json'),result_path:join(out,'crossing-result.json'),
    disposition:'HOLD',transport_created_at:t(1),received_at:t(2),disposed_at:t(3),
    route_note:'pinned GHoT hash receipt -> reLATTE sovereign HOLD, local CI only'};
}
function summarize(sources,work,result){
  assert(result.receive_receipt?.kind==='RECEIVED','NOT_RECEIVED');
  assert(result.disposition_receipt?.kind==='R3_HOLD','NOT_HELD');
  return {schema:SUMMARY_SCHEMA,source_loadout_report:'sha256:'+sources.source.reportSha256,
    source_count:sources.source.entries.length,
    ghot_repository:'the-static-collective/GHoT',ghot_exact_sha:GHOT_SHA,
    ghot_source_sha256:sources.gh.blob_sha256,
    ghot_operation:'system.hash',ghot_result_sha256:work.output_sha256,
    ghot_receipt_sha256:work.receipt_sha256,
    relatte_repository:'the-static-collective/reLATTE',relatte_exact_sha:RELATTE_SHA,
    relatte_source_sha256:sources.rel.blob_sha256,
    crossing_id:result.crossing.crossing_id,receive_receipt_id:result.receive_receipt.receipt_id,
    disposition_receipt_id:result.disposition_receipt.receipt_id,
    disposition:'HOLD',source_verified_locally:true,
    actual_local_hash_executed:true,receipt_signatures_cold_verified:true,
    remote_effects:0,external_owner_identity_authenticated:false,
    owner_operational_permission:false,public_service_deployed:false,
    nonClaims:['A sample CI executor is not the user machine','Source hash does not prove source rights','Receiver HOLD is not ADMIT','Payload reference is not transfer of original GHoT receipt bytes']};
}
export async function run(loadout,roots,outPath){
  assert(!existsSync(outPath),'OUTPUT_ALREADY_EXISTS');
  const sources=selectedSources(loadout,roots);
  const out=resolve(outPath);
  mkdirSync(out,{recursive:false,mode:0o700});
  const home=join(out,'ghot-local');mkdirSync(home,{mode:0o700});
  const response=execFileSync('python3',[join(sources.ghRoot,'ghot/reference_node.py'),'run','system.hash',JSON.stringify(sources.source.reportSha256)],{
    cwd:sources.ghRoot,env:{...process.env,GHOT_HOME:home},
    encoding:'utf8',timeout:40000,maxBuffer:1048576,stdio:['ignore','pipe','pipe']});
  const output=JSON.parse(response),task=onePersisted(home,'task'),receipt=onePersisted(home,'receipt');
  assert(equal(output,receipt),'GHOT_STDOUT_PERSISTENCE_MISMATCH');
  const work=verifyGhot(task,receipt,sources.source.reportSha256);
  write(join(out,'loadout-report.json'),sources.source);
  write(join(out,'ghot-task.json'),task);write(join(out,'ghot-receipt.json'),receipt);
  const request=makeRequest(sources.source,sources.gh,sources.rel,work,out);
  write(join(out,'crossing-request.json'),request);
  const result=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types',join(sources.reRoot,'scripts/opaque-roundtrip.ts')],{
    cwd:sources.reRoot,input:JSON.stringify(request),encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024,
    stdio:['pipe','pipe','pipe']}));
  const summary=summarize(sources,work,result);
  write(join(out,'public-inspection.json'),summary);
  return await verify(loadout,roots,out);
}
export async function verify(loadout,roots,outPath){
  const sources=selectedSources(loadout,roots),out=resolve(outPath);
  assert(equal(read(join(out,'loadout-report.json')),sources.source),'LOADOUT_CHANGED');
  const task=read(join(out,'ghot-task.json')),receipt=read(join(out,'ghot-receipt.json'));
  assert(equal(task,onePersisted(join(out,'ghot-local'),'task')),'GHOT_TASK_HISTORY_TAMPERED');
  assert(equal(receipt,onePersisted(join(out,'ghot-local'),'receipt')),'GHOT_RECEIPT_HISTORY_TAMPERED');
  const work=verifyGhot(task,receipt,sources.source.reportSha256),request=read(join(out,'crossing-request.json'));
  assert(request.spec.donor_claims.ghot_receipt_id===work.receipt_id&&request.spec.payload_refs[0].address==='sha256:'+work.receipt_sha256,'CROSSING_WORK_BINDING_MISMATCH');
  assert(request.spec.source_history_head==='sha256:'+sources.source.reportSha256,'CROSSING_LOADOUT_NOT_BOUND');
  assert(request.disposition==='HOLD'&&request.result_path===join(out,'crossing-result.json'),'CROSSING_PATH_OR_DISPOSITION_CHANGED');
  const mod=await import(pathToFileURL(join(sources.reRoot,'src/index.ts')).href);
  const result=read(request.result_path);
  assert(result.request_id===mod.computeOpaqueRoundTripRequestId(request),'REQUEST_ID_MISMATCH');
  assert(await mod.verifyOpaqueOrganCrossing(result.crossing),'INVALID_ORGAN_CROSSING');
  assert(await mod.verifyReceipt(result.receive_receipt),'INVALID_RECEIVE_SIGNATURE');
  assert(await mod.verifyReceipt(result.disposition_receipt),'INVALID_HOLD_SIGNATURE');
  assert(result.receive_receipt.kind==='RECEIVED'&&result.disposition_receipt.kind==='R3_HOLD','WRONG_DISPOSITION');
  const receiver=await mod.LocalReceiver.open(request.receiver_root);
  assert(receiver.snapshot().held.includes(result.crossing.crossing_id),'RECEIVER_JOURNAL_DISAGREES');
  const transport=await mod.readFileBundle(request.bundle_path);
  assert(transport.crossing.crossing_id===result.crossing.crossing_id,'TRANSPORT_CROSSING_DISAGREES');
  const summary=summarize(sources,work,result);
  assert(equal(read(join(out,'public-inspection.json')),summary),'PUBLIC_INSPECTION_TAMPERED');
  return {status:'COLD_REPLAY_VERIFIED_REAL_LOCAL_WORK',summary};
}
