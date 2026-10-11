/** CANNON STACK² 018 — real native planZ SENSE → GHoT hash → reLATTE signed HOLD.
 * Bounded CI/local experimental ceremony only. No external ACT or ADMIT.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,readdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {inspect} from './branch-loadout.mjs';
import {readSource} from './present-use.mjs';
import {verifyGhot,GHOT_SHA,RELATTE_SHA} from './branch-crossing.mjs';

export const PLANZ_SHA='e8111fdb64c5587b33aece0fed639ed3d03375ac';
export const PLAN_SCHEMA='cannon.stack-squared-native-plan/v0';
export const SUMMARY_SCHEMA='cannon.stack-squared-native-summary/v0';
const SOURCE_REGISTRY='registry/seed-plan-records.jsonl';
const PLANZ_BIN='002/bin/sense-global.mjs';
const PLANZ_ENGINE='002/src/senses-engine.mjs';
const GHOST_BIN='ghot/reference_node.py';
const RELATTE_SOURCE='src/roundtrip.ts';
const ID_A='PLZ-TRANCH-ROOM-001';
const ID_B='PLZ-HUMAN-SUPABARDO-001';
const fail=(ok,reason)=>{if(!ok)throw Error(reason);};
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const canonical=v=>{
  if(v===null||typeof v==='string'||typeof v==='boolean')return JSON.stringify(v);
  if(typeof v==='number'){fail(Number.isSafeInteger(v),'UNSAFE_INTEGER');return JSON.stringify(v);}
  if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
  fail(obj(v),'NON_CANONICAL_JSON');
  return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
};
const same=(a,b)=>canonical(a)===canonical(b);
const hash=x=>createHash('sha256').update(x).digest('hex');
const digest=x=>hash(canonical(x));
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const write=(path,contents)=>writeFileSync(path,typeof contents==='string'?contents:JSON.stringify(contents,null,2)+'\n',{flag:'wx',mode:0o600});

export function validatePlan(plan){
  fail(obj(plan)&&Object.keys(plan).sort().join(',')==='allowed_capabilities,mode,plan_ids,schema','INVALID_PLAN_FIELDS');
  fail(plan.schema===PLAN_SCHEMA&&plan.mode==='READ_ONLY_PLANZ_AND_LOCAL_GHOT_HASH'&&
    Array.isArray(plan.plan_ids)&&plan.plan_ids.length===2&&
    plan.plan_ids[0]===ID_A&&plan.plan_ids[1]===ID_B&&
    Array.isArray(plan.allowed_capabilities)&&
    same(plan.allowed_capabilities,['planZ.SENSE_GLOBAL','GHoT.system.hash']),'UNAPPROVED_NATIVE_CAPABILITY');
  return plan;
}
function exactRoot(roots,repository,sha){
  fail(obj(roots)&&typeof roots[repository]==='string','MISSING_REPO_ROOT: '+repository);
  const root=realpathSync(resolve(roots[repository]));
  fail(execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',timeout:10000}).trim()===sha,
    'DONOR_CHECKOUT_NOT_PINNED: '+repository);
  return root;
}
function original(roots,repository,sha,path,id){
  return readSource({id,repository,commit:sha,path,media_type:'text/plain',tags:[]},roots);
}
export function sources(plan,loadout,roots){
  validatePlan(plan);
  const census=inspect(loadout,roots);
  fail(census.entries.some(e=>e.id==='planz-sense-001'&&e.source.commit===PLANZ_SHA&&e.entrypoint===PLANZ_BIN),
    'ORIGINAL_PLANZ_LOADOUT_NOT_SELECTED');
  const planz=exactRoot(roots,'the-static-collective/planZ',PLANZ_SHA);
  const ghot=exactRoot(roots,'the-static-collective/GHoT',GHOT_SHA);
  const relatte=exactRoot(roots,'the-static-collective/reLATTE',RELATTE_SHA);
  const bin=original(roots,'the-static-collective/planZ',PLANZ_SHA,PLANZ_BIN,'native-planz-bin');
  const engine=original(roots,'the-static-collective/planZ',PLANZ_SHA,PLANZ_ENGINE,'native-planz-engine');
  const registry=original(roots,'the-static-collective/planZ',PLANZ_SHA,SOURCE_REGISTRY,'native-planz-registry');
  const worker=original(roots,'the-static-collective/GHoT',GHOT_SHA,GHOST_BIN,'native-ghot-worker');
  const substrate=original(roots,'the-static-collective/reLATTE',RELATTE_SHA,RELATTE_SOURCE,'native-relatte-r14');
  fail(bin.content.includes('senseCensus')&&engine.content.includes('export function senseCensus')&&
    worker.content.includes('system.hash')&&substrate.content.includes('runOpaqueOrganRoundTrip'),
    'ORIGINAL_NATIVE_CAPABILITY_NOT_PRESENT');
  const raw=registry.content.split(/\r?\n/).filter(x=>x.trim()).map(x=>JSON.parse(x));
  const rows=plan.plan_ids.map(id=>{
    const match=raw.filter(x=>x.planId===id);
    fail(match.length===1&&match[0].schema==='static-collective/planz-plan-record/v0',
      'MISSING_OR_AMBIGUOUS_REAL_SOURCE_RECORD: '+id);
    return match[0];
  });
  return {census,roots:{planz,ghot,relatte},witnesses:{
    planz_bin:bin.witness,planz_engine:engine.witness,planz_registry:registry.witness,
    ghot_worker:worker.witness,relatte_r14:substrate.witness
  },rows};
}
function inputPaths(out){
  return {seed:join(out,'native-planz-seed.jsonl'),
    provisional:join(out,'native-planz-provisional.jsonl')};
}
function executePlanZ(origin,out,rows,verifyInputs){
  const {seed,provisional}=inputPaths(out);
  const a=JSON.stringify(rows[0])+'\n',b=JSON.stringify(rows[1])+'\n';
  if(verifyInputs){
    fail(readFileSync(seed,'utf8')===a&&readFileSync(provisional,'utf8')===b,'PLANZ_SOURCE_RECORDS_CHANGED');
  }else{
    write(seed,a);write(provisional,b);
  }
  const stdout=execFileSync(process.execPath,[join(origin,PLANZ_BIN),seed,provisional],{
    cwd:origin,encoding:'utf8',timeout:30000,maxBuffer:1024*1024,
    stdio:['ignore','pipe','pipe']
  });
  const result=JSON.parse(stdout);
  fail(result.schema==='static-collective/planz-global-sense-run/v0'&&
    result.dedupedRecordCount===2&&result.inputs.seedRecords===1&&result.inputs.provisionalRecords===1&&
    result.frames.length===2&&result.unaryCandidates.length===2&&
    same(result.frames.map(x=>x.planId),rows.map(x=>x.planId))&&
    result.frames.every(x=>x.authority==='none'&&x.selection==='NONE')&&
    result.unaryCandidates.every(x=>x.authority==='none'&&x.selection==='NONE')&&
    result.authority==='none'&&result.selection==='NONE','PLANZ_NATIVE_AUTHORITY_OR_OUTPUT_CHANGED');
  return result;
}
function onePersisted(home,kind){
  const files=readdirSync(join(home,'records')).filter(x=>x.includes('-'+kind+'-')&&x.endsWith('.json'));
  fail(files.length===1,'EXPECTED_ONE_GHOT_'+kind);
  return read(join(home,'records',files[0]));
}
function dates(finished){
  const base=Date.parse(finished);
  fail(Number.isFinite(base),'GHOT_TIME_INVALID');
  const at=n=>new Date(base+n*1000).toISOString();
  return {created_at:at(1),transport_created_at:at(2),received_at:at(3),disposed_at:at(4)};
}
function crossingRequest(report,planz,task,receipt,work,out){
  const t=dates(receipt.finished_at),runHash=digest(planz);
  return {
    schema:'relatte.opaque-roundtrip-request/v0',
    spec:{schema:'relatte.opaque-organ-spec/v0',family_ref:'organ:stack-squared/native-sense-hash-018',
      donor_contract_ref:'cannon.stack-squared-native/v0',
      artifact_kind:'native-plan-sense-and-ghot-bounded-hash',
      source_world:'world:cannon-stack2-018-local',
      source_particular:'particular:ghot:'+receipt.receipt_id,
      source_history_head:'sha256:'+runHash,
      payload_refs:[
        {address:'sha256:'+runHash,role:'native-planz-result',media_type:'application/json'},
        {address:'sha256:'+work.receipt_sha256,role:'native-ghot-receipt',media_type:'application/json'}
      ],
      donor_claims:{cannon_loadout_sha256:report.census.reportSha256,
        source_git_witnesses:report.witnesses,
        planz_real_source_ids:report.rows.map(x=>x.planId),
        planz_native_result_sha256:runHash,
        planz_native_result:planz,
        ghot_task:task,ghot_receipt:receipt,
        ghot_receipt_sha256:work.receipt_sha256,
        ghot_result_sha256:work.output_sha256,
        native_planz_ran_locally:true,native_ghot_system_hash_ran_locally:true,
        external_effects:0,remote_execution:false,owner_permission_inferred:false,
        signer_human_identity_established:false},
      requested_effect:{kind:'candidate-ingress',authority:'receiver-local',execution_authorized:false},
      return_address:'return:cannon/stack-squared-018',created_at:t.created_at},
    receiver_root:join(out,'receiver'),
    receiver:{world_id:'world:cannon-stack2-review',receiver_particular:'particular:cannon-stack2-review-018',
      contract_ref:'contract:stack2-native-inspection/v0'},
    bundle_path:join(out,'crossing-bundle.json'),
    result_path:join(out,'crossing-result.json'),
    disposition:'HOLD',transport_created_at:t.transport_created_at,
    received_at:t.received_at,disposed_at:t.disposed_at,
    route_note:'native planZ senses -> native GHoT hash -> signed reLATTE receiver-local HOLD'
  };
}
function publicSummary(report,planz,work,result){
  fail(result.receive_receipt.kind==='RECEIVED'&&result.disposition_receipt.kind==='R3_HOLD',
    'NOT_RECEIVED_HELD');
  return {schema:SUMMARY_SCHEMA,source_records:report.rows.map(x=>x.planId),
    source_count:report.rows.length,original_git_witnesses:Object.keys(report.witnesses).length,
    native_planz_run:true,native_planz_frame_count:planz.frames.length,
    native_planz_proposals:planz.unaryCandidates.map(x=>({id:x.candidateId,chamber:x.chamber,
      sourcePlanIds:x.sourcePlanIds,authority:x.authority,selection:x.selection})),
    native_ghot_local_system_hash:true,ghot_result_sha256:work.output_sha256,
    ghot_receipt_sha256:work.receipt_sha256,
    native_relatte_signed_crossing_id:result.crossing.crossing_id,
    native_relatte_receive_receipt_id:result.receive_receipt.receipt_id,
    native_relatte_hold_receipt_id:result.disposition_receipt.receipt_id,
    signed_objects_cold_verified:3,
    disposition:'HOLD',receiver_admitted:false,external_effects:0,
    donor_mutations:0,git_merges:0,production_deployed:false,
    external_owner_identity_authenticated:false,
    nonclaims:['PlanZ outputs proposals, not human selection',
      'GHoT local hash did not run a planZ mutation candidate or external job',
      'Synthetic CI run does not grant real owner execution permission',
      'reLATTE signed RECEIVE and HOLD confer no owner admission',
      'Source code witnessed by local Git is not authentication of human identity']};
}
export async function run(plan,loadout,roots,output){
  fail(!existsSync(output),'CREATE_ONLY_OUTPUT_EXISTS');
  const report=sources(plan,loadout,roots);
  const out=resolve(output);
  mkdirSync(out,{mode:0o700});
  write(join(out,'original-records.json'),report.rows);
  write(join(out,'original-git-witnesses.json'),report.witnesses);
  write(join(out,'cannon-loadout-report.json'),report.census);
  const planz=executePlanZ(report.roots.planz,out,report.rows,false);
  write(join(out,'native-planz-output.json'),planz);
  const planzCommitment=digest(planz);
  const home=join(out,'ghot-local');mkdirSync(home,{mode:0o700});
  const stdout=execFileSync('python3',[join(report.roots.ghot,GHOST_BIN),'run','system.hash',
      JSON.stringify(planzCommitment)],{
    cwd:report.roots.ghot,env:{...process.env,GHOT_HOME:home},
    encoding:'utf8',timeout:40000,maxBuffer:1024*1024,
    stdio:['ignore','pipe','pipe']
  });
  const task=onePersisted(home,'task'),receipt=onePersisted(home,'receipt');
  fail(same(JSON.parse(stdout),receipt),'GHOT_STDOUT_NOT_PERSISTED');
  const work=verifyGhot(task,receipt,planzCommitment);
  write(join(out,'native-ghot-task.json'),task);
  write(join(out,'native-ghot-receipt.json'),receipt);
  const request=crossingRequest(report,planz,task,receipt,work,out);
  write(join(out,'crossing-request.json'),request);
  const answer=execFileSync(process.execPath,['--experimental-strip-types',
    join(report.roots.relatte,'scripts/opaque-roundtrip.ts')],{
    cwd:report.roots.relatte,input:JSON.stringify(request),encoding:'utf8',
    timeout:60000,maxBuffer:5*1024*1024,stdio:['pipe','pipe','pipe']
  });
  const result=JSON.parse(answer);
  write(join(out,'public-inspection.json'),publicSummary(report,planz,work,result));
  return verify(plan,loadout,roots,out);
}
export async function verify(plan,loadout,roots,output){
  const report=sources(plan,loadout,roots),out=resolve(output);
  fail(same(read(join(out,'original-records.json')),report.rows),'ORIGINAL_SOURCE_RECORDS_CHANGED');
  fail(same(read(join(out,'original-git-witnesses.json')),report.witnesses),'SOURCE_WITNESS_CHANGED');
  fail(same(read(join(out,'cannon-loadout-report.json')),report.census),'LOADOUT_CHANGED');
  const actual=executePlanZ(report.roots.planz,out,report.rows,true);
  fail(same(read(join(out,'native-planz-output.json')),actual),'NATIVE_PLANZ_OUTPUT_CHANGED');
  const task=read(join(out,'native-ghot-task.json')),receipt=read(join(out,'native-ghot-receipt.json'));
  fail(same(task,onePersisted(join(out,'ghot-local'),'task'))&&
    same(receipt,onePersisted(join(out,'ghot-local'),'receipt')),'GHOT_PERSISTENCE_CHANGED');
  const work=verifyGhot(task,receipt,digest(actual));
  const request=read(join(out,'crossing-request.json'));
  fail(same(request,crossingRequest(report,actual,task,receipt,work,out)),'CROSSING_REQUEST_CHANGED');
  const r14=await import(pathToFileURL(join(report.roots.relatte,'src/index.ts')).href);
  const result=read(join(out,'crossing-result.json'));
  fail(result.request_id===r14.computeOpaqueRoundTripRequestId(request),'ROUNDTRIP_REQUEST_ID_CHANGED');
  fail(await r14.verifyOpaqueOrganCrossing(result.crossing),'INVALID_NATIVE_CROSSING_SIGNATURE');
  fail(await r14.verifyReceipt(result.receive_receipt),'INVALID_NATIVE_RECEIVE_SIGNATURE');
  fail(await r14.verifyReceipt(result.disposition_receipt),'INVALID_NATIVE_HOLD_SIGNATURE');
  fail(result.receive_receipt.kind==='RECEIVED'&&result.receive_receipt.semantic_effect==='none'&&
    result.disposition_receipt.kind==='R3_HOLD'&&result.disposition_receipt.semantic_effect==='none',
    'AUTHORITY_PROMOTION');
  fail(result.receive_receipt.crossing_id===result.crossing.crossing_id&&
    result.disposition_receipt.crossing_id===result.crossing.crossing_id,'RECEIPT_NOT_BOUND_TO_CROSSING');
  fail(result.crossing.source_history_head==='sha256:'+digest(actual),'PLANZ_RESULT_NOT_BOUND');
  const evidence=result.crossing.extensions?.organ_adapter?.donor_claims;
  fail(evidence&&same(evidence.planz_native_result,actual)&&
    same(evidence.source_git_witnesses,report.witnesses)&&
    same(evidence.ghot_task,task)&&same(evidence.ghot_receipt,receipt)&&
    evidence.ghot_result_sha256===work.output_sha256&&
    evidence.external_effects===0&&evidence.owner_permission_inferred===false,
    'SIGNED_NATIVE_EVIDENCE_CHANGED');
  const bundle=await r14.readFileBundle(request.bundle_path);
  fail(bundle.crossing.crossing_id===result.crossing.crossing_id,'FILE_TRANSPORT_MISMATCH');
  const receiver=await r14.LocalReceiver.open(request.receiver_root);
  fail(receiver.snapshot().held.includes(result.crossing.crossing_id),'SOVEREIGN_HOLD_NOT_DURABLE');
  const summary=publicSummary(report,actual,work,result);
  fail(same(read(join(out,'public-inspection.json')),summary),'PUBLIC_INSPECTION_CHANGED');
  return {status:'STACK_SQUARED_018_NATIVE_COLD_VERIFIED',summary};
}
