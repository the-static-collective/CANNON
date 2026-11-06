// CANNON-096: structurally independent source-dependency review for MOTIF-011.
// Recompute original source hashes, copied-report parentage, root-only exact
// Bayesian likelihoods and naive overcounting WITHOUT importing MOTIF Python.
// SHA proves content identity. Source independence and real observations remain
// explicitly NOT VERIFIED. All activity is synthetic, local, read-only.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const MOTIF_COMMIT='c41ff828e167a406fab25ef2b0a272be5e736ad2';
export const SOURCE_BLOB='62db5d24dc23e04e8070a78bb9234dc28ee60f03';
const IDS=['LEFT_PARTIAL','RIGHT_PARTIAL','LEFT_FULL','RIGHT_FULL'];
const ROOTS=['A','B','C','D'];
const PACKET='motif011.evidence-provenance-replay.v0';
export class HOLD extends Error{}
const ok=(condition,error)=>{if(!condition)throw new HOLD(error)};
export const sha=x=>createHash('sha256').update(
 typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
const gitBlob=x=>createHash('sha1').update(
 Buffer.from('blob '+x.length+'\0')).update(x).digest('hex');

function read(file){
 const bytes=readFileSync(file);
 ok(bytes.length>0&&bytes.length<1500000,'Oversized or missing source evidence');
 try {const result=JSON.parse(bytes.toString('utf8'));
   ok(result&&typeof result==='object'&&!Array.isArray(result),'Not an evidence object');
   return result;
 }catch(e){if(e instanceof HOLD)throw e;throw new HOLD('Evidence JSON malformed');}
}
function assertHash(x){
 ok(x&&typeof x==='object'&&typeof x.content_sha256==='string',
     'Missing source payload hash');
 const {content_sha256,...body}=x;
 ok(sha(body)===content_sha256,'Content checksum mismatch');
 return content_sha256;
}
export function verifyPinnedSource(root){
 const repo=resolve(root);
 let head;
 try{head=execFileSync('git',['-C',repo,'rev-parse','HEAD'],
     {encoding:'utf8',timeout:8000}).trim();}
 catch{throw new HOLD('Original MOTIF checkout unavailable')}
 ok(head===MOTIF_COMMIT,'MOTIF source owner changed');
 const path='experiments/door-foundry-011/source_graph.py';
 const blob=readFileSync(join(repo,path));
 ok(gitBlob(blob)===SOURCE_BLOB,'Source owning Python code bytes mismatch');
 const fromGit=execFileSync('git',['-C',repo,'rev-parse','HEAD:'+path],
     {encoding:'utf8',timeout:8000}).trim();
 ok(fromGit===SOURCE_BLOB,'Original MOTIF Git blob mismatch');
 return {repo:'the-static-collective/MOTIF',commit:MOTIF_COMMIT,
    source_path:path,source_git_blob_sha1:SOURCE_BLOB};
}
function gcd(a,b){while(b!==0n){const t=a%b;a=b;b=t}return a<0n?-a:a;}
export function F(num,den=1n){
 num=BigInt(num);den=BigInt(den);
 ok(den!==0n,'Zero rational divisor');
 if(den<0n){den=-den;num=-num}
 const g=gcd(num,den);
 return {n:num/g,d:den/g};
}
export function parseFraction(x){
 ok(typeof x==='string'&&/^(0|[1-9]\d*)(?:\/([1-9]\d*))?$/.test(x),
   'Unexpected serialized rational');
 const [a,b='1']=x.split('/');
 const f=F(a,b);
 ok(show(f)===x,'Non-canonical rational format');
 return f;
}
const show=x=>String(x.n)+(x.d===1n?'':'/'+String(x.d));
const plus=(a,b)=>F(a.n*b.d+b.n*a.d,a.d*b.d);
const times=(a,b)=>F(a.n*b.n,a.d*b.d);
const divide=(a,b)=>F(a.n*b.d,a.d*b.n);
const one=F(1),zero=F(0);
const equal=(a,b)=>a.n===b.n&&a.d===b.d;
const asNumber=x=>Number(x.n)/Number(x.d);
function norm(weights){
 const total=Object.values(weights).reduce(plus,zero);
 ok(total.n>0n,'No posterior mass');
 return Object.fromEntries(IDS.map(id=>[id,divide(weights[id],total)]));
}
function initial(){return {LEFT_PARTIAL:F(1,10),RIGHT_PARTIAL:F(1,10),
  LEFT_FULL:F(4,10),RIGHT_FULL:F(4,10)};}
function checkBelief(actual,expected){
 ok(actual&&Object.keys(actual).length===4&&
   IDS.every(id=>id in actual&&equal(parseFraction(actual[id]),expected[id])),
   'Posterior does not match independent CANNON Bayesian replay');
}
function likelihood(claim,id){
 const correct=(id.split('_')[1].toLowerCase()===claim);
 return correct?F(4,5):F(1,5);
}
function update(weights,claim){
 return norm(Object.fromEntries(IDS.map(id=>[
   id,times(weights[id],likelihood(claim,id))])));
}
function decision(weights){
 let best={action:'DECLARE_UNREACHABLE',loss:null};
 const options=['DECLARE_UNREACHABLE','PLAN_LEFT_TO_RIGHT','PLAN_RIGHT_TO_LEFT',
   'HOLD_NO_ACTION'];
 for(const action of options){
  let total=zero;
  for(const id of IDS){
   const [side,wall]=id.toLowerCase().split('_');
   const cost=action==='HOLD_NO_ACTION'?2:
     action==='DECLARE_UNREACHABLE'?(wall==='full'?0:5):
     (action==='PLAN_LEFT_TO_RIGHT'&&side==='left'&&wall==='partial')||
     (action==='PLAN_RIGHT_TO_LEFT'&&side==='right'&&wall==='partial')?0:10;
   total=plus(total,times(weights[id],F(cost)));
  }
  if(best.loss===null||asNumber(total)<asNumber(best.loss))
   best={action,loss:total};
 }
 return best;
}
export function verifyOriginalQuestion(dir){
 const source=read(join(dir,'active-question.json'));
 assertHash(source);
 ok(source.schema==='motif.active-visual-question.v0'&&
   source.status==='UNSENT_QUESTION_WITH_FOUR_IMAGE_HYPOTHESES'&&
   source.model==='FOUR_SYNTHETIC_WORLDS_NOT_OBSERVATIONS'&&
   source.custody?.question_sent===false&&
   source.custody?.actual_answer_observed===false&&
   source.custody?.current_world_identified===false&&
   source.custody?.physical_actions===0&&
   source.custody?.external_api_calls===0,'Original visual source was not held');
 const rows=source.visual_worlds;
 ok(Array.isArray(rows)&&rows.length===4,'Original four worlds missing');
 for(const id of IDS){
  const row=rows.find(x=>x.id===id);
  ok(row&&row.real_world_status==='UNKNOWN_NOT_OBSERVED'&&
    row.original_CANNON_review_is_code_only_for_new_images===true,
    'Original PNG is not declared synthetic');
  for(const kind of ['start','target']){
   const buf=readFileSync(join(dir,'worlds',id,kind+'.png'));
   ok(buf.length>8&&buf.subarray(0,8).equals(
     Buffer.from([137,80,78,71,13,10,26,10])),'Original image is not PNG');
   ok(sha(buf)===row[(kind==='start'?'start':'target')+'_png_sha256'],
     'Original PNG hash changed');
  }
 }
 return source;
}
function verifyRootSensor(sensor,origin,claim){
 assertHash(sensor);
 ok(sensor.schema==='motif010.evidence-event.v0'&&
    sensor.event_id==='SIM-00'+(ROOTS.indexOf(origin)+1)&&
    sensor.sequence===ROOTS.indexOf(origin)+1&&
    sensor.observed_attribute==='wall_extent'&&
    sensor.simulated_sensor_output===claim&&
    sensor.assumed_conditional_accuracy==='4/5'&&
    sensor.assumed_independent_given_world===true&&
    sensor.source==='SYNTHETIC_LOCAL_FIXTURE_NOT_A_REAL_OBSERVATION'&&
    sensor.real_human_answer===false&&
    sensor.physical_observation===false&&
    sensor.can_trigger_real_actions===false,
    'Source root has no independent original MOTIF-010 synthetic evidence');
}
export function verifyReplay(packet,source){
 assertHash(packet);
 ok(packet.schema===PACKET&&
   packet.status==='SYNTHETIC_DEPENDENCY_AWARE_BELIEF_REVISION_HELD'&&
   packet.original_009_source_sha256===source.content_sha256&&
   packet.assumptions?.source_roots_declared_by_simulator_not_authenticated===true&&
   packet.assumptions?.shared_unreported_upstream_sources_can_escape_detector===true&&
   packet.authority?.root_source_attestations_verified===false&&
   packet.authority?.real_human_reports_received===0&&
   packet.authority?.external_api_calls===0&&
   packet.authority?.real_world_actions===0&&
   packet.authority?.automatic_canon_admission===false,
   'Reviewer refuses invented witness authority');
 const pngs=Object.fromEntries(source.visual_worlds.map(x=>[x.id,x.start_png_sha256]));
 ok(IDS.every(id=>packet.original_png_world_hashes?.[id]===pngs[id]),
   'Original PNG world provenance mismatch');
 const reports=packet.steps;
 ok(Array.isArray(reports)&&reports.length===10&&
    packet.reports_seen===10&&
    packet.independent_roots_count===4&&
    packet.derived_retransmissions_ignored_as_new_likelihoods===6,
    'Unexpected report graph size');
 let grouped=initial(),naive=initial();
 let predecessor=source.content_sha256;
 const seen=new Map(),rootIDs=new Map(),roots=[],rootClaims=[];
 let copies=0;
 for(let i=0;i<reports.length;i++){
   const step=reports[i],rep=step.report,index=i+1;
   assertHash(step);assertHash(rep);
   ok(step.schema==='motif011.provenance-belief-step.v0'&&
     step.sequence===index&&step.previous_receipt_sha256===predecessor&&
     step.report_sha256===rep.content_sha256&&
     rep.schema==='motif011.provenance-report.v0'&&
     rep.sequence===index&&rep.report_id==='R'+String(index).padStart(3,'0')&&
     ROOTS.includes(rep.origin_id)&&
     rep.declared_source_id==='SIMULATED_SENSOR_'+rep.origin_id&&
     rep.claim_field==='wall_extent'&&
     ['full','partial'].includes(rep.claim_value)&&
     rep.assumed_root_reliability==='4/5'&&
     rep.synthetic_only==='SYNTHETIC_SOURCE_GRAPH_UNATTESTED'&&
     rep.actual_human_witness===false&&
     rep.source_independence_verified===false&&
     rep.real_effects_allowed===false&&
     step.source_origin_id===rep.origin_id&&
     step.dependency_parent===rep.parent_report_id&&
     step.report_sha256===rep.content_sha256&&
     step.human_observations===0&&step.physical_actions===0,
     'Original source graph edge, receipt or no-contact control failed');
   checkBelief(step.prior,grouped);
   const isRoot=rep.parent_report_id===null;
   ok(step.contributed_independent_factor===isRoot&&
      rep.claimed_independent_root===isRoot,
      'Reported copy cannot claim independent likelihood');
   if(isRoot){
     ok(!rootIDs.has(rep.origin_id),'Duplicate independently declared source origin');
     verifyRootSensor(rep.root_sensor_event,rep.origin_id,rep.claim_value);
     rootIDs.set(rep.origin_id,rep);
     roots.push(rep.report_id);
     rootClaims.push(rep.claim_value);
     grouped=update(grouped,rep.claim_value);
   }else{
     const ancestor=seen.get(rep.parent_report_id);
     ok(ancestor&&ancestor.origin_id===rep.origin_id&&
        ancestor.declared_source_id===rep.declared_source_id&&
        ancestor.claim_value===rep.claim_value&&
        rep.root_sensor_event===null&&rootIDs.has(rep.origin_id),
        'Missing/cross-origin parent, changed copy or fabricated sensor');
     copies++;
   }
   naive=update(naive,rep.claim_value);
   checkBelief(step.posterior,grouped);
   checkBelief(step.naive_as_if_independent_posterior,naive);
   ok(step.independent_source_count===rootIDs.size&&
      step.retransmission_count===copies&&
      step.only_structural_dependency_verified===true&&
      (step.next_question_proposed_but_unsent===null||
       ['ASK_WALL_EXTENT','ASK_START_SIDE','ASK_EXACT_SCENE'].includes(
        step.next_question_proposed_but_unsent)),
      'Wrong root/copy count or false answer');
   predecessor=step.content_sha256;
   seen.set(rep.report_id,rep);
 }
 ok(predecessor===packet.last_evidence_chain_sha256&&
    roots.join(',')==='R001,R008,R009,R010'&&
    packet.conflict_ledger?.independent_roots_contradict===true&&
    packet.conflict_ledger?.actual_independence_attested===false&&
    packet.conflict_ledger?.opposing_roots_preserved?.join(',')===roots.join(',')&&
    new Set(rootClaims).size===2,
    'Conflicting declared original sources not preserved');
 checkBelief(packet.original_priors,initial());
 checkBelief(packet.dependency_grouped_posterior,grouped);
 checkBelief(packet.naive_repeated_report_posterior,naive);
 const truth=packet.synthetic_truth_known_only_to_test_scorer;
 ok(IDS.includes(truth),'Truth must be known only to synthetic fixture evaluator');
 const target=truth.split('_')[1].toLowerCase();
 const prob=p=>IDS.reduce((sum,id)=>id.endsWith(target.toUpperCase())?
   plus(sum,p[id]):sum,zero);
 const baseP=prob(initial()),groupP=prob(grouped),naiveP=prob(naive);
 for(const [field,p] of [
    ['frozen_true_extent_probability',baseP],
    ['grouped_true_extent_probability',groupP],
    ['naive_true_extent_probability',naiveP]]){
   ok(Math.abs(packet.scoring[field]-asNumber(p))<1e-12,
      'Likelihood scoring does not match evidence');
 }
 const baseline=decision(initial()).action;
 const correct=decision(grouped).action;
 const wrong=decision(naive).action;
 ok(packet.decision.frozen===baseline&&
    packet.decision.source_grouped===correct&&
    packet.decision.naive_copy_counterexample===wrong&&
    packet.decision.real_actions_executed===false,
    'Action computation not independently consistent');
 return {truth,grouped_true_extent_probability:asNumber(groupP),
    naive_true_extent_probability:asNumber(naiveP),
    report_count:10,distinct_root_count:4,dependent_copies:6,
    conflicting_roots:roots,root_only_Bayes_independently_verified:true,
    source_identity_not_authenticated:true};
}
export function review(motifRoot,questionRoot,graphRoot){
 const source=verifyPinnedSource(motifRoot);
 const original=verifyOriginalQuestion(questionRoot);
 const rows=[];
 for(const id of IDS){
   const packet=read(join(graphRoot,id,'replay.json'));
   rows.push(verifyReplay(packet,original));
 }
 const benchmark=read(join(graphRoot,'benchmark.json'));
 assertHash(benchmark);
 ok(benchmark.schema==='motif011.source-dependence-benchmark.v0'&&
   benchmark.status==='HOLD_SYNTHETIC_REPORT_GRAPH_DEPENDENCY_TESTED'&&
   benchmark.cases?.length===4&&
   benchmark.grouped_beats_naive_in_all_designed_cases===true&&
   benchmark.matched_classical_root_collapse_baseline_exactly_equal===true&&
   benchmark.not_a_claim_of_independent_witness_authentication===true&&
   benchmark.not_generalized_real_world_accuracy===true&&
   benchmark.external_actions===0,'Benchmark must stay HELD');
 const body={
  schema:'cannon096.independent-provenance-review.v0',
  status:'HOLD_DEPENDENCY_STRUCTURE_VERIFIED_SOURCE_INDEPENDENCE_UNATTESTED',
  original_motif_source:source,
  original_009_png_question_sha256:original.content_sha256,
  independent_rational_replays:rows,
  original_benchmark_sha256:benchmark.content_sha256,
  report_groups_verified:4,
  copied_reports_checked:24,
  initial_four_png_worlds_byte_verified:true,
  independent_witness_identity_confirmed:false,
  Bayesian_superiority_over_classical_claimed:false,
  all_reported_sensor_evidence_synthetic:true,
  human_contacts:0,physical_actions:0,
  repository_writes:0,automatic_admission:false,
  externally_signed:false
 };
 return {...body,content_sha256:sha(body)};
}
async function main(args){
 if(args.length!==8||args[0]!=='--motif'||args[2]!=='--question'||
    args[4]!=='--ledger'||args[6]!=='--out')
   throw new HOLD('Expected original MOTIF checkout, PNG question, report ledger and output');
 const packet=review(args[1],args[3],args[5]);
 writeFileSync(args[7],JSON.stringify(packet,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({status:packet.status,
    source:packet.original_motif_source.commit,
    verified_cases:packet.report_groups_verified,
    grouped_sensor_receipts:packet.copied_reports_checked,
    authenticated_sources:0}));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 main(process.argv.slice(2)).catch(e=>{
  console.error(JSON.stringify({stage:'HOLD',reason:e.message}));
  process.exitCode=1;
 });
}
