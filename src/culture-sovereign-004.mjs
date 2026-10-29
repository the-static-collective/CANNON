import {readSource} from './present-use.mjs';
import {verify as verifyCultureUse} from './culture-use-003.mjs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync,writeFileSync,mkdirSync,existsSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
const hash=v=>createHash('sha256').update(v).digest('hex');
const sha=v=>'sha256:'+hash(v);
const fail=(v,s)=>{if(!v)throw Error(s)};
const json=x=>JSON.stringify(x,null,2)+'\n';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const canonical=x=>{if(x===null||typeof x==='string'||typeof x==='boolean'||typeof x==='number')return JSON.stringify(x);
 if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';
 fail(x&&typeof x==='object','INVALID_JSON');
 return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}'};
const same=(a,b)=>canonical(a)===canonical(b);
export const CARRIER_SOURCES={
 ghot:{repo:'the-static-collective/GHoT',sha:'e35dd470384d864b7b0b629a68dad570875a7df0',
  files:['ghot/reference_node.py','ghot/executor_pantry.py','ghot/power_field.py','ghot/relatte_identity.py']},
 relatte:{repo:'the-static-collective/reLATTE',sha:'dcc8cdca84c440aa4294134f020fb7095bf87f24',
  files:['scripts/opaque-roundtrip.ts','src/index.ts','src/roundtrip.ts','src/protocol.ts','src/receiver.ts','src/organ.ts','src/transport.ts','src/canonical.ts']}
};

function nativeCut(root,source){
 const dir=realpathSync(resolve(root));
 const w=source.files.map(path=>{
  const evidence=readSource({id:'native',repository:source.repo,commit:source.sha,path,media_type:'text/plain',tags:[]},
   {[source.repo]:dir}).witness;
  const file=join(dir,path);
  fail(realpathSync(file)===file&&sha(readFileSync(file))===evidence.blob_sha256,'ORIGINAL_WORKTREE_CHANGED');
  return evidence;
 });
 return {dir,w};
}
function persisted(home,kind){
 const files=readdirSync(join(home,'records')).filter(x=>x.includes('-'+kind+'-')&&x.endsWith('.json'));
 fail(files.length===1,'ONE_GHOT_RECORD_REQUIRED_'+kind);
 return read(join(home,'records',files[0]));
}
function checkGhot(task,receipt,reviewSha){
 fail(task.kind==='ghot.task'&&task.version==='0'&&task.capability==='system.hash'&&
  task.input===reviewSha&&task.constraints?.network==='not-required','GHOT_TASK_SOURCE_OR_EFFECT');
 fail(receipt.kind==='ghot.receipt'&&receipt.version==='0'&&receipt.capability==='system.hash'&&
  receipt.status==='ok'&&receipt.error===null&&receipt.task_id===task.task_id&&
  receipt.requester_node_id===task.requester_node_id,'GHOT_RECEIPT_INVALID');
 fail(same(receipt.output,{sha256:hash(reviewSha)})&&
  receipt.output_sha256===hash(canonical(receipt.output)),'GHOT_HASH_NOT_REPLAYED');
 return {taskId:task.task_id,receiptId:receipt.receipt_id,receiptDigest:sha(Buffer.from(canonical(receipt)))};
}
function times(){return ['2026-10-29T12:00:00.000Z','2026-10-29T12:01:00.000Z',
 '2026-10-29T12:02:00.000Z','2026-10-29T12:03:00.000Z'];}
function request(review,cut,task,receipt,out){
 const t=times(),reviewBytes=Buffer.from(json(review)),reviewDigest=sha(reviewBytes);
 const claim={kind:'CULTURE_USE_REVIEW_ONLY',nativeSourceWitnesses:cut.w,
  originalReview:review,originalGhotTask:task,originalGhotReceipt:receipt,
  receiverMayNotAdmitRights:true,actualHumanAuthenticated:false,
  originalCulturalWorkLicensed:false,actualPennyIssued:0,marketTokenIssued:0,
  requestedFinancialEffect:false};
 return {
  schema:'relatte.opaque-roundtrip-request/v0',
  spec:{schema:'relatte.opaque-organ-spec/v0',family_ref:'organ:cannon/culture-review-004',
   donor_contract_ref:'cannon.culture-use-review/v1',artifact_kind:'held-cultural-work-review',
   source_world:'world:cannon-culture-four',
   source_particular:'particular:culture-use:'+review.receiptId,
   source_history_head:reviewDigest,
   payload_refs:[
    {address:reviewDigest,role:'source-cannon-work-review',media_type:'application/json'},
    {address:review.originalComicSha256,role:'original-cultural-carrier',media_type:'text/html'},
    {address:review.independentPressReceipt,role:'independent-press-hold',media_type:'application/json'},
    {address:sha(Buffer.from(canonical(receipt))),role:'native-ghot-hash-receipt',media_type:'application/json'}],
   donor_claims:claim,requested_effect:{kind:'REVIEW_ONLY',authority:'RECEIVER_LOCAL',execute:false},
   return_address:'return:cannon/culture-four',created_at:t[0]},
  receiver_root:join(out,'sovereign-receiver'),
  receiver:{world_id:'world:culture-receiver-held',receiver_particular:'particular:culture-four-review',
   contract_ref:'contract:review-not-financial-authority'},
  bundle_path:join(out,'transport.json'),result_path:join(out,'roundtrip.json'),
  disposition:'HOLD',transport_created_at:t[1],received_at:t[2],disposed_at:t[3],
  route_note:'Native CANNON cultural work -> GHoT local SHA -> signed reLATTE sovereign HOLD'
 };
}
const write=(path,obj)=>writeFileSync(path,json(obj),{flag:'wx',mode:0o600});
export async function run(roots,forge,held,useDir,out){
 fail(!existsSync(out),'OUTPUT_ALREADY_EXISTS');
 const prior=await verifyCultureUse(roots,forge,held,useDir);
 fail(prior.status==='NATIVE_CULTURE_REVIEW_COLD_REPLAYED','NATIVE_CULTURE_PREDECESSOR_CHANGED');
 const g=nativeCut(roots.ghot,CARRIER_SOURCES.ghot),r=nativeCut(roots.relatte,CARRIER_SOURCES.relatte);
 const review=read(join(useDir,'review.json'));
 fail(review.receiptId===prior.reviewId&&review.authenticatedHumanDeeds===0&&
  review.pennyWorld?.issuedUnits===0,'UNSAFE_WORK_REVIEW');
 const outDir=resolve(out);mkdirSync(outDir,{mode:0o700});
 const home=join(outDir,'ghot-local');mkdirSync(home,{mode:0o700});
 const commit=hash(Buffer.from(json(review)));
 const response=execFileSync('python3',[join(g.dir,'ghot/reference_node.py'),'run','system.hash',JSON.stringify(commit)],{
  cwd:g.dir,env:{...process.env,GHOT_HOME:home},encoding:'utf8',
  timeout:40000,maxBuffer:1024*1024,stdio:['ignore','pipe','pipe']});
 const task=persisted(home,'task'),receipt=persisted(home,'receipt');
 fail(same(JSON.parse(response),receipt),'GHOT_STDOUT_NOT_PERSISTED');
 checkGhot(task,receipt,commit);
 write(join(outDir,'ghot-task.json'),task);write(join(outDir,'ghot-receipt.json'),receipt);
 const req=request(review,{w:{ghot:g.w,relatte:r.w}},task,receipt,outDir);
 write(join(outDir,'request.json'),req);
 execFileSync(process.execPath,['--experimental-strip-types',join(r.dir,'scripts/opaque-roundtrip.ts')],{
  cwd:r.dir,input:JSON.stringify(req),encoding:'utf8',timeout:60000,maxBuffer:6*1024*1024,
  stdio:['pipe','pipe','pipe']});
 return verify(roots,forge,held,useDir,outDir);
}
export async function verify(roots,forge,held,useDir,out){
 const prior=await verifyCultureUse(roots,forge,held,useDir);
 fail(prior.status==='NATIVE_CULTURE_REVIEW_COLD_REPLAYED','CULTURE_REVIEW_FAILED');
 const g=nativeCut(roots.ghot,CARRIER_SOURCES.ghot),r=nativeCut(roots.relatte,CARRIER_SOURCES.relatte);
 const review=read(join(useDir,'review.json')),outDir=resolve(out);
 const task=read(join(outDir,'ghot-task.json')),receipt=read(join(outDir,'ghot-receipt.json'));
 fail(same(task,persisted(join(outDir,'ghot-local'),'task'))&&
  same(receipt,persisted(join(outDir,'ghot-local'),'receipt')),'GHOT_HISTORY_TAMPERED');
 const work=checkGhot(task,receipt,hash(Buffer.from(json(review))));
 const expected=request(review,{w:{ghot:g.w,relatte:r.w}},task,receipt,outDir);
 const req=read(join(outDir,'request.json'));
 fail(same(req,expected),'CROSSING_REQUEST_REWRITTEN');
 const native=await import(pathToFileURL(join(r.dir,'src/index.ts')).href);
 const result=read(join(outDir,'roundtrip.json'));
 fail(result.request_id===native.computeOpaqueRoundTripRequestId(req),'REQUEST_ID_CHANGED');
 fail(await native.verifyOpaqueOrganCrossing(result.crossing),'INVALID_SIGNED_CROSSING');
 fail(await native.verifyReceipt(result.receive_receipt),'INVALID_SIGNED_RECEIVE');
 fail(await native.verifyReceipt(result.disposition_receipt),'INVALID_SIGNED_HOLD');
 fail(result.receive_receipt.kind==='RECEIVED'&&result.disposition_receipt.kind==='R3_HOLD'&&
  result.receive_receipt.semantic_effect==='none'&&result.disposition_receipt.semantic_effect==='none',
  'IMPLICIT_ADMISSION');
 fail(result.crossing.source_history_head===sha(Buffer.from(json(review)))&&
  result.crossing.extensions?.organ_adapter?.donor_claims?.originalReview?.receiptId===review.receiptId,
  'ORIGINAL_REVIEW_NOT_SIGNED');
 const bundle=await native.readFileBundle(req.bundle_path);
 fail(bundle.crossing.crossing_id===result.crossing.crossing_id,'TRANSPORT_BYTES_CHANGED');
 const world=await native.LocalReceiver.open(req.receiver_root);
 fail(world.snapshot().held.includes(result.crossing.crossing_id),'RECEIVER_DID_NOT_PERSIST_HOLD');
 return {schema:'cannon.culture-sovereign-return/v1',status:'SIGNED_RECEIVED_AND_RECEIVER_LOCAL_HOLD',
  originalCultureReceipt:review.receiptId,originalPressReceipt:review.independentPressReceipt,
  ghotTask:work.taskId,ghotReceipt:work.receiptId,
  crossing:result.crossing.crossing_id,received:result.receive_receipt.receipt_id,
  held:result.disposition_receipt.receipt_id,signedObjectsVerified:3,
  senderEffects:0,recipientAdmission:false,actualHumanDeeds:0,pennyIssued:0,
  publicEditions:0,nftMinted:0};
}
