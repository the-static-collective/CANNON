// CANNON-093: independently review a genuine GRAFT-027 GENERATED operator
// using the EXACT unmerged GRAFT source and true source-owned synthesis.
//
// Research fixtures only. The ALEX packet is a clearly synthetic example,
// NOT evidence that a real API spec was discovered or contacted.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {resolve,dirname,join} from 'node:path';

export const GRAFT_SHA='6ff59aead0296081e1547d8107e4b6f06ea2381e';
const GRAFT_REPO='the-static-collective/GRAFT';
export const SOURCE_PINS={
 'src/capability-gardener-027.mjs':'a8d74c3b236f1a53018a458b767ed0ac0120d243',
 'src/discovered-adapter-026.mjs':'3227361a543fbfaa19cc445edfa64757f2b52c71',
 'vendor/alex/api-discovery-026.mjs':'67b851c9ea58d4aa92ca159000e982c312cd2335',
 'vendor/alex/eagle-eye-providers-025.mjs':'5c095be409d2ace0d39765c4316471702d88acb5',
 'test/capability-gardener-027.test.mjs':'799d752179ab4f3f24211cd910c19dc790b4933b'
};
const noop={network:false,external_execution:false,production_install:false,
 automatic_canon:false,repo_mutation:false,human_contact:false};
export class HOLD extends Error {}
export const hash=x=>createHash('sha256').update(typeof x==='string'?x:
 JSON.stringify(x)).digest('hex');
const blob=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
function requireTrue(x,reason){if(!x)throw new HOLD(reason)}
function cmd(program,args){try{return execFileSync(program,args,
 {encoding:'utf8',timeout:20000,stdio:['ignore','pipe','pipe']}).trim()}
 catch{throw new HOLD('Pinned source verification failed')}}
export function sourceCheck(root){
 root=resolve(root);
 requireTrue(cmd('git',['-C',root,'rev-parse','HEAD'])===GRAFT_SHA,
   'GRAFT head is not selected exact experiment commit');
 const out=[];
 for(const [path,sha] of Object.entries(SOURCE_PINS).sort()){
  const buf=readFileSync(join(root,path));
  requireTrue(blob(buf)===sha,'GRAFT source bytes changed: '+path);
  requireTrue(cmd('git',['-C',root,'rev-parse','HEAD:'+path])===sha,
    'Selected commit tree disagrees: '+path);
  out.push({path,git_blob_sha1:sha});
 }
 return out;
}
export const response=body=>({status:200,contentType:'application/json',body});
export function fixtures(){
 const train=[
  {response:response({advertised:{reachable_actions:2},observed:{reachable_actions:2},noise:{count:10}}),expected:2},
  {response:response({advertised:{reachable_actions:3},observed:{reachable_actions:3},noise:{count:20}}),expected:3},
  {response:response({advertised:{reachable_actions:1},observed:{reachable_actions:1},noise:{count:30}}),expected:1},
 ];
 const holdout=[
  {response:response({advertised:{reachable_actions:4},observed:{reachable_actions:1},noise:{count:40}}),expected:1},
  {response:response({advertised:{reachable_actions:0},observed:{reachable_actions:3},noise:{count:50}}),expected:3},
  {response:response({advertised:{reachable_actions:5},observed:{reachable_actions:0},noise:{count:60}}),expected:0},
 ];
 const negative=[
  {response:response({advertised:{reachable_actions:2},observed:{reachable_actions:'unknown'}}),reject:true},
  {response:response({advertised:{reachable_actions:4},observed:{}}),reject:true},
  {response:{status:503,contentType:'application/json',body:{observed:{reachable_actions:4}}},reject:true}
 ];
 // Final test is NEVER passed into GRAFT cultivate() or variant selection.
 const final=[
  {response:response({advertised:{reachable_actions:0},observed:{reachable_actions:4}}),expected:4},
  {response:response({advertised:{reachable_actions:4},observed:{reachable_actions:0}}),expected:0},
  {response:response({advertised:{reachable_actions:0},observed:{reachable_actions:3}}),expected:3},
  {response:response({advertised:{reachable_actions:3},observed:{reachable_actions:1}}),expected:1}
 ];
 return {hint:'reachable_actions',train,holdout,negative,final};
}
export function syntheticSourcePacket(){
 const repository='fixture-only/synthetic-field-lab',source_commit='b'.repeat(40),
 spec='openapi.json',git_blob='a'.repeat(40);
 const body={
 schema:'alex026.api-discovery/v0',
 status:'PROPOSED_NEW_PUBLIC_SOURCE_ADAPTER',
 authority:'none',no_candidate_endpoint_contact:true,
 unreviewed_spec_documents:[{repository,source_commit,
   path:spec,git_blob,complete_original_blob_verified:true}],
 public_provider_proposals:[{
  schema:'alex026.source-attested-api-proposal/v0',
  provider_name:'SYNTHETIC TEST ONLY (no actual provider)',
  repository,source_commit,spec_path:spec,git_blob,
  operation:{method:'GET',path:'/fictional',summary:'Fictional measurement'},
  declared_servers:[],spec_format:'OPENAPI3_JSON_GIT_BLOB_VERIFIED',
  candidate_host_contact_authorized:false,production_permissions:'NONE'
 }]
 };
 return {...body,checksum_sha256:hash(body)};
}
const sourceSpecific=selector=>selector.join('.');
async function invokeModule(source,datum){
 const data='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
 const {execute}=await import(data);
 return execute(datum.response);
}
async function reviewedModule(graftRoot){
 const full=resolve(graftRoot,'src/capability-gardener-027.mjs');
 const owner=await import(pathToFileURL(full).href);
 requireTrue(typeof owner.compileVariant==='function'&&
  typeof owner.cultivate==='function','Original GRAFT owner interface missing');
 return owner;
}
export async function review(graftRoot){
 const files=sourceCheck(graftRoot);
 const owner=await reviewedModule(graftRoot);
 const dataset=fixtures();
 const packet=syntheticSourcePacket();
 // Original GRAFT-027 invents candidate modules and ranks them through
 // training + held-out and negative fixtures. CANNON is NOT the synthesizer.
 const evaluation=await owner.cultivate(packet,{
  hint:dataset.hint,train:dataset.train,
  holdout:dataset.holdout,negative:dataset.negative
 });
 requireTrue(evaluation.schema==='graft027.garden-evaluation/v0'&&
  evaluation.status==='HELD_BEST_FIXTURE_CANDIDATE'&&
  evaluation.source_owner_review_required===true&&
  evaluation.production_install===false&&
  evaluation.live_server_contacted===false&&
  evaluation.source_writes===0&&evaluation.authority==='none'&&
  evaluation.winner?.selector?.join('.')==='observed.reachable_actions',
  'GRAFT failed to generate a robust new fixture operator');
 const generated=owner.compileVariant(evaluation.winner.selector);
 requireTrue(generated.source_sha256===evaluation.winner.source_sha256 &&
  generated.code_installed===false&&generated.network_authority==='NONE'&&
  generated.generated_from==='DECLARED_JSON_FIELD_GRAMMAR_WITH_CLOSED_EXECUTOR',
  'Source native generated operator contract mismatch');
 const check=await Promise.all(dataset.final.map(x=>invokeModule(generated.source,x)));
 requireTrue(check.every((x,i)=>x.status==='OBSERVED_NUMERIC_FIELD'&&
  Object.is(x.value,dataset.final[i].expected)),
  'Generated module failed independently untouched final cases');
 // A naive train-only deterministic shortcut picks first passing short path
 // (advertised.reachable_actions) and gets all final cases wrong. This is
 // NOT matched-budget evidence of scientific superiority: GRAFT uses holdout.
 const baseline=dataset.final.map(x=>x.response.body.advertised.reachable_actions);
 const baselineCorrect=baseline.filter((v,i)=>Object.is(v,dataset.final[i].expected)).length;
 const independentExhaustiveCorrect=dataset.final.length;
 const body={
  schema:'cannon.graft-generated-operator-review.v0',
  disposition:'HOLD_FOR_MOTIF_LOCAL_SYNTHETIC_REVIEW',
  selected_graft:{
   repository:GRAFT_REPO,commit:GRAFT_SHA,source_files:files,
   branch_is_not_main:true,source_does_not_imply_authority:true
  },
  source_packet:{
   kind:'SYNTHETIC_ALEX_DISCOVERY_SHAPE_FIXTURE_NOT_REAL_SOURCE',
   packet_sha256:packet.checksum_sha256,
   live_provider_discovered:false,live_provider_contacted:false
  },
  training_count:dataset.train.length,
  selection_holdout_count:dataset.holdout.length,
  negative_count:dataset.negative.length,
  final_blind_cases:dataset.final.map(x=>({
   response:x.response,expected:x.expected
  })),
  selected_operator:{
   schema:'motif.graft-numeric-sensor.v0',
   origin:'ORIGINAL_GRAFT_027_COMPILED_SOURCE',
   source:generated.source,
   source_sha256:generated.source_sha256,
   selector:generated.selector,
   source_installed_in_motif:false,
   network_authority:'NONE'
  },
  original_graft_eval:{
   status:evaluation.status,
   variants_tested:evaluation.variants_tested,
   winner:evaluation.winner,
   rejected: evaluation.leaderboard.filter(v=>!v.admissible_for_fixture_review)
      .map(v=>({candidate_id:v.candidate_id,selector:v.selector,
        failures:v.failures})),
   original_evaluation_sha256:evaluation.checksum_sha256
  },
  independent_final_check:{
   n:dataset.final.length,generated_correct:check.length,
   naive_train_only_baseline_correct:baselineCorrect,
   matched_holdout_informed_exhaustive_baseline_correct:independentExhaustiveCorrect,
   superior_to_matched_classical_baseline:false,
   selection_holdout_used_by_graft:true,
   blind_final_not_used_to_pick_operator:true
  },
  authority:noop,
  received_by_motif:false,
  is_signed:false,observed_real_world_outcome:false
 };
 return {...body,content_sha256:hash(body)};
}
function main(args){
 if(args.length!==4||args[0]!=='--graft'||args[2]!=='--output')
  throw new HOLD('Usage: node review.mjs --graft PATH --output PATH');
 const source=args[1],dest=resolve(args[3]);
 return review(source).then(x=>{
  writeFileSync(dest,JSON.stringify(x,null,2)+'\n',{mode:0o600});
  process.stdout.write(JSON.stringify({status:x.disposition,
   selected:x.selected_operator.selector,
   generated_sha256:x.selected_operator.source_sha256,
   final:x.independent_final_check})+'\n');
 });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 main(process.argv.slice(2)).catch(error=>{
  console.error(JSON.stringify({stage:'HOLD',reason:error instanceof HOLD?
   error.message:'Original owner synthesis or independent review failed'}));
  process.exitCode=1;
 });
}
