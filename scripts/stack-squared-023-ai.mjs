#!/usr/bin/env node
/**
 * STACK² 023 — independent GHoT packet → original reLATTE R14 sovereign HOLD.
 * The reLATTE source is pinned, not copied. Cold verification launches NO donor.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {inspect} from './stack-squared-022-ai.mjs';

export const GHOT_COMMIT='6194d91ba83bad63606f6f6741723007227518f2';
export const RELATTE_R14='dcc8cdca84c440aa4294134f020fb7095bf87f24';
export const RELATTE_PATHS=[
  'src/roundtrip.ts','src/organ.ts','src/receiver.ts','src/protocol.ts',
  'src/transport.ts','src/canonical.ts','src/index.ts','scripts/opaque-roundtrip.ts'
];
const gh022='examples/stack-squared-022-ai.plan.json';
const fail=(ok,why)=>{if(!ok)throw Error(why);};
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const make=path=>writeFileSync(path,typeof path==='never'?'':arguments[1],{flag:'wx',mode:0o600});
function exactCheckout(root,shaCommit,paths){
  root=realpathSync(resolve(root));
  const git=(...argv)=>execFileSync('git',['-C',root,...argv],{encoding:'utf8',timeout:15000}).trim();
  fail(git('rev-parse','HEAD')===shaCommit,'SOURCE_COMMIT_NOT_PINNED');
  for(const path of paths){
    const local=readFileSync(join(root,path));
    const original=execFileSync('git',['-C',root,'show',shaCommit+':'+path],
      {timeout:15000,maxBuffer:4*1024*1024});
    fail(sha(local)===sha(original),'SOURCE_BYTES_CHANGED:'+path);
  }
  return root;
}
function validatePlan(plan){
  fail(obj(plan),'INVALID_STACK23_PLAN');
  fail(Object.keys(plan).sort().join(',')==='auto_execute,ghot_commit,mode,receiver,relatte_commit,schema,source_plan','UNEXPECTED_PLAN_FIELD');
  fail(plan.schema==='cannon.stack-squared-ai-relatte-plan/v0'&&
    plan.mode==='SIGNED_HOLD_ONLY'&&plan.auto_execute===false,'UNAUTHORIZED_MODE');
  fail(plan.ghot_commit===GHOT_COMMIT&&plan.relatte_commit===RELATTE_R14&&
    plan.source_plan===gh022,'UNPINNED_SOURCE');
  fail(obj(plan.receiver)&&Object.keys(plan.receiver).sort().join(',')==='contract_ref,receiver_particular,world_id'&&
    plan.receiver.world_id==='world:cannon-stack2-023-local'&&
    plan.receiver.receiver_particular==='particular:cannon-stack2-023-review'&&
    plan.receiver.contract_ref==='contract:stack2-ai-packet-inspection/v0',
    'RECEIVER_POLICY_CHANGED');
  return plan;
}
function witness(plan,ghot,reportPath){
  const existing=read(resolve(gh022));
  fail(existing.ghot_commit===plan.ghot_commit,'GHOT_022_WITNESS_SOURCE_CHANGED');
  return inspect(existing,ghot,reportPath);
}
function evidence(report,w){
  fail(report.report_id===w.native_report_id,'REPORT_ID_DISAGREEMENT');
  fail(Array.isArray(report.attempts)&&report.attempts.length>=1&&report.attempts.every(x=>
    x.status==='EXECUTED' && obj(x.packet) && obj(x.signed_receipt) &&
    x.packet.packet_id===w.results[report.attempts.indexOf(x)]?.portable_packet_id),
    'NOT_ALL_GHOT_PACKETS_EXECUTED');
  return true;
}
function timestamps(report){
  const last=report.attempts.at(-1);
  const raw=Date.parse(last?.signed_receipt?.created_at);
  fail(Number.isFinite(raw),'INVALID_SIGNED_GHOT_TIMESTAMP');
  const at=secs=>new Date(raw+secs*1000).toISOString();
  return {created_at:at(1),transport_created_at:at(2),received_at:at(3),disposed_at:at(4)};
}
export function requestFor(plan,report,w,reportBytes,out){
  evidence(report,w);
  const t=timestamps(report);
  const reportHash=sha(reportBytes);
  return {
    schema:'relatte.opaque-roundtrip-request/v0',
    spec:{
      schema:'relatte.opaque-organ-spec/v0',
      family_ref:'organ:cannon/stack-squared-023-ghot-ai',
      donor_contract_ref:'ghot.ai-recomposition-report/v0',
      artifact_kind:'source-verified-native-ghot-instrument-packet-and-cannon-witness',
      source_world:'world:cannon-stack2-023-export',
      source_particular:'particular:cannon-stack2-023:'+reportHash,
      source_history_head:'sha256:'+reportHash,
      payload_refs:[
        {address:'sha256:'+reportHash,role:'exact-native-ghot-report-bytes',media_type:'application/json'},
        {address:'sha256:'+sha(Buffer.from(JSON.stringify(w))),role:'cannon-022-cold-witness',media_type:'application/json'}
      ],
      donor_claims:{
        native_ghot_report:report,
        native_ghot_report_file_sha256:reportHash,
        native_ghot_report_id:report.report_id,
        native_ghot_source_commit:GHOT_COMMIT,
        native_ghot_receipt_ids:w.results.map(x=>x.signed_receipt_id),
        native_ghot_packet_ids:w.results.map(x=>x.portable_packet_id),
        cannon_022_witness:w,
        native_ghot_verification:true,
        cannon_witness_class:'UNSIGNED_CANNON_LOCAL_INSPECTION',
        source_signature_not_human_authority:true,
        reLATTE_R14_ref:RELATTE_R14,
        external_effects:0,
        donor_reexecuted_during_crossing:false,
        owner_act:false,
        receiver_admission:false
      },
      requested_effect:{kind:'candidate-ingress',authority:'receiver-local',
                        execution_authorized:false,admit_requested:false},
      return_address:'return:cannon/stack-squared-023',
      created_at:t.created_at
    },
    receiver_root:join(out,'receiver'),
    receiver:plan.receiver,
    bundle_path:join(out,'crossing-bundle.json'),
    result_path:join(out,'crossing-result.json'),
    disposition:'HOLD',
    transport_created_at:t.transport_created_at,
    received_at:t.received_at,
    disposed_at:t.disposed_at,
    route_note:'exact native GHoT instrument packet via Cannon 022 → sovereign reLATTE R14 HOLD'
  };
}
function publicView(w,result){
  return {
    schema:'cannon.stack-squared-ai-relatte-public/v0',
    source_commit:GHOT_COMMIT,
    relatte_commit:RELATTE_R14,
    ghot_report_id:w.native_report_id,
    ghot_report_sha256:w.native_report_sha256,
    cannon_witness_id:w.witness_id,
    ghot_signed_execution_receipts:w.results.map(x=>x.signed_receipt_id),
    ghot_portable_packet_ids:w.results.map(x=>x.portable_packet_id),
    relatte_crossing_id:result.crossing.crossing_id,
    relatte_received_receipt_id:result.receive_receipt.receipt_id,
    relatte_hold_receipt_id:result.disposition_receipt.receipt_id,
    destination:'R3_HOLD',
    original_ghot_donor_reexecuted:false,
    original_relatte_receiver_used:true,
    cold_signatures_verified:true,
    source_human_identity_established:false,
    receiver_admitted:false,
    external_effects:0,
    production_deployed:false
  };
}
export async function run(plan,ghotRoot,relatteRoot,reportPath,destination){
  validatePlan(plan);
  const out=resolve(destination);
  fail(!existsSync(out),'OUTPUT_ALREADY_EXISTS');
  const relatte=exactCheckout(relatteRoot,RELATTE_R14,RELATTE_PATHS);
  const w=witness(plan,ghotRoot,reportPath);
  const reportBytes=readFileSync(resolve(reportPath));
  const report=JSON.parse(reportBytes.toString('utf8'));
  fail(sha(reportBytes)===w.native_report_sha256,'REPORT_BYTES_CHANGED');
  const request=requestFor(plan,report,w,reportBytes,out);
  mkdirSync(out,{mode:0o700});
  writeFileSync(join(out,'cannon-source-witness.json'),JSON.stringify(w,null,2)+'\n',{flag:'wx',mode:0o600});
  writeFileSync(join(out,'crossing-request.json'),JSON.stringify(request,null,2)+'\n',{flag:'wx',mode:0o600});
  const returned=execFileSync(process.execPath,['--experimental-strip-types',
    join(relatte,'scripts/opaque-roundtrip.ts')],{
    cwd:relatte,input:JSON.stringify(request),encoding:'utf8',timeout:90000,
    maxBuffer:12*1024*1024,stdio:['pipe','pipe','pipe']
  });
  const result=JSON.parse(returned);
  const publicResult=publicView(w,result);
  writeFileSync(join(out,'public-inspection.json'),JSON.stringify(publicResult,null,2)+'\n',{flag:'wx',mode:0o600});
  return verify(plan,ghotRoot,relatteRoot,reportPath,out);
}
export async function verify(plan,ghotRoot,relatteRoot,reportPath,destination){
  validatePlan(plan);
  const out=realpathSync(resolve(destination));
  const relatte=exactCheckout(relatteRoot,RELATTE_R14,RELATTE_PATHS);
  const w=witness(plan,ghotRoot,reportPath);
  fail(same(read(join(out,'cannon-source-witness.json')),w),'SOURCE_WITNESS_CHANGED');
  const reportBytes=readFileSync(resolve(reportPath));
  fail(sha(reportBytes)===w.native_report_sha256,'GHOT_REPORT_BYTES_CHANGED');
  const report=JSON.parse(reportBytes.toString('utf8'));
  const request=requestFor(plan,report,w,reportBytes,out);
  fail(same(read(join(out,'crossing-request.json')),request),'CROSSING_REQUEST_CHANGED');
  const r14=await import(pathToFileURL(join(relatte,'src/index.ts')).href);
  const result=read(join(out,'crossing-result.json'));
  fail(result.schema==='relatte.opaque-roundtrip-result/v0'&&
       result.request_id===r14.computeOpaqueRoundTripRequestId(request),
       'ROUNDTRIP_REQUEST_CHANGED');
  fail(await r14.verifyOpaqueOrganCrossing(result.crossing),'INVALID_NATIVE_SIGNED_CROSSING');
  fail(await r14.verifyReceipt(result.receive_receipt),'INVALID_NATIVE_RECEIVED');
  fail(await r14.verifyReceipt(result.disposition_receipt),'INVALID_NATIVE_R3_HOLD');
  fail(result.receive_receipt.kind==='RECEIVED'&&result.disposition_receipt.kind==='R3_HOLD'&&
       result.receive_receipt.semantic_effect==='none'&&result.disposition_receipt.semantic_effect==='none',
       'ADMISSION_PROMOTION');
  fail(result.receive_receipt.crossing_id===result.crossing.crossing_id&&
       result.disposition_receipt.crossing_id===result.crossing.crossing_id,
       'RECEIPTS_NOT_BOUND_TO_CROSSING');
  fail(result.receive_receipt.world_id===request.receiver.world_id&&
       result.disposition_receipt.world_id===request.receiver.world_id&&
       result.receive_receipt.receiver_particular===request.receiver.receiver_particular&&
       result.disposition_receipt.receiver_particular===request.receiver.receiver_particular,
       'RECEIPT_RECEIVER_MISMATCH');
  fail(result.crossing.source_history_head===request.spec.source_history_head&&
       result.crossing.source_particular===request.spec.source_particular &&
       same(result.crossing.payload_refs,request.spec.payload_refs)&&
       same(result.crossing.requested_effect,request.spec.requested_effect),
       'NATIVE_SOURCE_EVIDENCE_CHANGED');
  const ext=result.crossing.extensions?.organ_adapter;
  fail(ext?.family_ref===request.spec.family_ref&&
       ext.donor_contract_ref===request.spec.donor_contract_ref&&
       ext.artifact_kind===request.spec.artifact_kind&&
       same(ext.donor_claims,request.spec.donor_claims),
       'SIGNED_GHOT_CLAIMS_CHANGED');
  const bundle=await r14.readFileBundle(request.bundle_path);
  fail(same(bundle.crossing,result.crossing),'TRANSPORT_CHANGED');
  fail(same(bundle,await r14.verifyAndExtractTransportFrame(result.transport_frame)),
       'FRAME_CHANGED');
  const receiver=await r14.LocalReceiver.open(request.receiver_root);
  const snap=receiver.snapshot();
  fail(same(snap,result.receiver_snapshot),'RECEIVER_JOURNAL_CHANGED');
  fail(snap.held.length===1&&snap.held[0]===result.crossing.crossing_id&&
       snap.received.includes(result.crossing.crossing_id)&&
       snap.admitted.length===0&&snap.refused.length===0&&snap.returned.length===0,
       'RECEIVER_NOT_HELD');
  fail(same(read(join(out,'public-inspection.json')),publicView(w,result)),
       'PUBLIC_RECEIPT_OVERCLAIM');
  return {status:'STACK_SQUARED_023_NATIVE_R3_HOLD_COLD_VERIFIED',
    crossing_id:result.crossing.crossing_id,received:result.receive_receipt.receipt_id,
    hold:result.disposition_receipt.receipt_id,admitted:false};
}
async function main(){
  const [verb,planFile,ghotRoot,relatteRoot,reportPath,destination,...flags]=process.argv.slice(2);
  fail((verb==='run'||verb==='verify')&&planFile&&ghotRoot&&relatteRoot&&reportPath&&destination,
       'USAGE: run|verify PLAN GHOT_ROOT RELATTE_ROOT PRIVATE_REPORT NEW_OUTPUT [--approve-local-hold]');
  fail(flags.length===(verb==='run'?1:0)&&
       (verb!=='run'||flags[0]==='--approve-local-hold'),'EXPLICIT_LOCAL_HOLD_APPROVAL_REQUIRED');
  const args=[read(planFile),ghotRoot,relatteRoot,reportPath,destination];
  const result=await(verb==='run'?run:verify)(...args);
  console.log(JSON.stringify(result,null,2));
}
if(process.argv[1]?.endsWith('stack-squared-023-ai.mjs')){
  main().catch(e=>{console.error('HOLD:',String(e.message).slice(0,350));process.exitCode=1;});
}
