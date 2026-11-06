// CANNON-097: independent source-pinned audit of MOTIF-012 latent-origin evidence.
// Model, hidden truths, priors, likelihoods, costs and reports are SYNTHETIC.
// Exact BigInt rational Bayes; no MOTIF application imports, no source identity
// attestation, no real human contact and no automatic admission.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyOriginalQuestion,sha as jsHash,HOLD} from '../cannon-096/review.mjs';

const MOTIF_COMMIT='cd4884af4cb456aeab07f8f5738d1df0f6d3c852';
const BLOBS={
 'experiments/door-foundry-012/hidden_source.py':'4e4ec27d4397fad59c0751e8e2e262893f176491',
 'experiments/door-foundry-012/test_hidden_source.py':'9eb5a1a86de039bea228270cabb4ad6496c0ead1'
};
const H=['ONE_ORIGIN','TWO_CLUSTERS','INDEPENDENT_FIVE'],K=[1,2,5];
const W=['LEFT_PARTIAL','RIGHT_PARTIAL','LEFT_FULL','RIGHT_FULL'];
const C={
 'SHARED_UPSTREAM_TOKEN':['9/10','1/20','1/1000'],
 'INDEPENDENT_CAPTURE_AUDIT':['1/1000','1/100','9/10'],
 'TWO_SEPARATE_UPSTREAM_RECEIPTS':['1/50','9/10','1/50'],
 'PHRASE_ONLY':['1/4','1/2','3/4'],
 'NO_CUE':['1','1','1']
};
const FIXTURES={
 HIDDEN_SHARED:['SHARED_UPSTREAM_TOKEN','ONE_ORIGIN'],
 INDEPENDENT_CONVERGENCE:['INDEPENDENT_CAPTURE_AUDIT','INDEPENDENT_FIVE'],
 TWO_ACTUAL_CLUSTERS:['TWO_SEPARATE_UPSTREAM_RECEIPTS','TWO_CLUSTERS'],
 SIMILAR_WORDING_ONLY:['PHRASE_ONLY',null],
 NO_ORIGIN_EVIDENCE:['NO_CUE',null]
};
const QUESTIONS={
 ASK_ORIGINAL_ARTIFACTS:{cost:'1/4',responses:{
   one_receipt:['17/20','1/25','1/50'],
   two_receipts:['1/25','41/50','3/100'],
   five_receipts:['1/50','1/25','17/20'],
   unavailable:['9/100','1/10','1/10']}},
 ASK_CAPTURE_PATHS:{cost:'3/20',responses:{
   shared:['4/5','11/20','1/10'],
   separate:['1/20','3/10','3/4'],
   unclear:['3/20','3/20','3/20']}}
};
const COSTS={GROUP_ONE:['0','3','6'],
 GROUP_TWO:['3','0','4'],COUNT_FIVE:['8','5','0'],
 HOLD_NO_ORIGIN_CLAIM:['6/5','6/5','6/5']};
const check=(v,m)=>{if(!v)throw new HOLD(m)};
const gitBlob=x=>createHash('sha1').update(
 Buffer.from('blob '+x.length+'\0')).update(x).digest('hex');
export function pinOriginal(root){
 const dir=resolve(root);
 let head;
 try{head=execFileSync('git',['-C',dir,'rev-parse','HEAD'],
    {encoding:'utf8',timeout:8000}).trim();}
 catch{throw new HOLD('Original source owner unavailable')}
 check(head===MOTIF_COMMIT,'MOTIF original owner revision changed');
 for(const [path,hash] of Object.entries(BLOBS)){
  const b=readFileSync(join(dir,path));
  check(gitBlob(b)===hash,'Source bytes changed');
  check(execFileSync('git',['-C',dir,'rev-parse','HEAD:'+path],
   {encoding:'utf8',timeout:8000}).trim()===hash,'Source Git identity changed');
 }
 return {commit:head,blobs:BLOBS};
}
function load(path){
 const bytes=readFileSync(path);
 check(bytes.length>0&&bytes.length<500000,'Evidence not within size budget');
 try{return JSON.parse(bytes.toString('utf8'))}
 catch{throw new HOLD('Malformed source evidence JSON')}
}
// Canonical Python JSON distinguishes 1.0 from 1. The inspector is independent
// standard-library code, not the MOTIF model being tested.
const PY_VERIFY=[
 'import hashlib,json,sys',
 'def verify(x):',
 ' if not isinstance(x,dict):raise ValueError("record missing")',
 ' b=dict(x);s=b.pop("content_sha256")',
 ' raw=json.dumps(b,separators=(",",":"),ensure_ascii=False,allow_nan=False)',
 ' if hashlib.sha256(raw.encode()).hexdigest()!=s:raise ValueError("receipt modified")',
 'for p in sys.argv[1:]:',
 ' with open(p,encoding="utf-8") as f:r=json.load(f)',
 ' if p.endswith("inference.json"):',
 '  verify(r["joint_cue_evidence"])',
 '  for x in r["new_simulated_reports"]:verify(x)',
 '  for x in r["evidence_ledger"]:verify(x)',
 ' verify(r)',
 'print("SOURCE_CANONICAL_PYTHON_HASHES_VALID")'
].join('\n');
function verifyCanonical(paths){
 try {
  const x=execFileSync('python',['-c',PY_VERIFY,...paths],
    {encoding:'utf8',timeout:15000}).trim();
  check(x==='SOURCE_CANONICAL_PYTHON_HASHES_VALID','Source hash verification failed');
 } catch(e){if(e instanceof HOLD)throw e;
  throw new HOLD('Original source receipts failed canonical byte review')}
}
function gcd(a,b){while(b){const t=a%b;a=b;b=t}return a<0n?-a:a}
const F=(a,b=1n)=>{a=BigInt(a);b=BigInt(b);
 check(b!==0n,'Zero denominator');if(b<0n){a=-a;b=-b}
 const d=gcd(a,b);return {n:a/d,d:b/d}};
const p=x=>{check(typeof x==='string'&&/^(?:0|[1-9]\d*)(?:\/[1-9]\d*)?$/.test(x),
 'Noncanonical rational');const [a,b='1']=x.split('/');
 const n=F(a,b);check(fmt(n)===x,'Rational not reduced');return n};
const fmt=x=>String(x.n)+(x.d===1n?'':'/'+String(x.d));
const add=(a,b)=>F(a.n*b.d+b.n*a.d,a.d*b.d);
const mul=(a,b)=>F(a.n*b.n,a.d*b.d);
const div=(a,b)=>F(a.n*b.d,a.d*b.n);
const power=(a,n)=>F(a.n**BigInt(n),a.d**BigInt(n));
const total=ls=>ls.reduce(add,F(0));
const normalize=ls=>{const den=total(ls);check(den.n>0n,'Zero Bayesian evidence');
 return ls.map(x=>div(x,den))};
const eq=(a,b)=>a.n===b.n&&a.d===b.d;
const number=x=>Number(x.n)/Number(x.d);
export function replayOrigin(cue){
 check(cue in C,'Unknown forensic evidence');
 const worlds=[F(1,10),F(1,10),F(4,10),F(4,10)];
 const probs=[];
 for(let i=0;i<3;i++)
  for(let j=0;j<4;j++){
   const measure=W[j].endsWith('FULL')?F(4,5):F(1,5);
   probs.push(mul(mul(mul(F(1,3),p(C[cue][i])),worlds[j]),power(measure,K[i])));
  }
 const joint=normalize(probs);
 return {
  h:H.map((_,i)=>total(joint.slice(i*4,i*4+4))),
  w:W.map((_,j)=>total([joint[j],joint[j+4],joint[j+8]]))
 };
}
function posterior(h,q,r){
 const x=QUESTIONS[q].responses[r];
 return normalize(h.map((v,i)=>mul(v,p(x[i]))));
}
function terminal(h){
 let best=null;
 for(const [action,costs] of Object.entries(COSTS)){
   const loss=total(h.map((v,i)=>mul(v,p(costs[i]))));
   if(best===null||number(loss)<number(best.loss))best={action,loss};
 }
 return best;
}
export function optimal(h,depth=2,remaining=Object.keys(QUESTIONS)){
 check(depth>=0&&depth<=2,'Question horizon exceeded');
 const baseline=terminal(h);
 let loss=baseline.loss,node={kind:'DECIDE',action:baseline.action};
 if(depth===0)return {loss,node};
 for(const q of remaining){
   let value=p(QUESTIONS[q].cost);
   const branches={};
   for(const r of Object.keys(QUESTIONS[q].responses)){
     const mass=total(h.map((v,i)=>mul(v,p(QUESTIONS[q].responses[r][i]))));
     const child=optimal(posterior(h,q,r),depth-1,remaining.filter(x=>x!==q));
     value=add(value,mul(mass,child.loss));branches[r]=child.node;
   }
   if(number(value)<number(loss)){
     loss=value;node={kind:'ASK',question_id:q,branches};
   }
 }
 return {loss,node};
}
function checkPolicy(actual,expected){
 check(actual.kind===expected.kind,'Decision about asking differs');
 if(expected.kind==='DECIDE')
   check(actual.action===expected.action,'Incorrect decision about source roots');
 else {
   check(actual.question_id===expected.question_id&&
     actual.sent_to_human===false,'Incorrect provenance question or fake human contact');
   for(const [r,child] of Object.entries(expected.branches))
     checkPolicy(actual.branches?.[r]?.policy||{},child);
 }
}
export function verifyCase(record,original,name){
 const test=FIXTURES[name];
 check(test&&record.fixture===name&&
    record.schema==='motif012.hidden-source-inference.v0'&&
    record.status==='HOLD_HIDDEN_SOURCE_HYPOTHESES_UNATTESTED'&&
    record.original_009_question_sha256===original.content_sha256&&
    record.synthetic_truth_for_evaluator_only===test[1]&&
    record.original_011_source_dependency_mechanism_replayed===true&&
    record.authority?.actual_people_identified===0&&
    record.authority?.real_reporters_contacted===0&&
    record.authority?.actual_question_sent===false&&
    record.authority?.external_source_verified===false&&
    record.authority?.original_witness_identity_authenticated===false&&
    record.authority?.real_world_images_observed===0&&
    record.authority?.external_api_calls===0&&
    record.authority?.actions_executed===0&&
    record.authority?.auto_admitted===false,
    'False source or observation authority');
 const e=record.joint_cue_evidence;
 check(e?.schema==='motif012.synthetic-joint-cue.v0'&&
  e.bundle===test[0]&&
  e.source==='SYNTHETIC_UNVERIFIED_JOINT_FORENSIC_FIXTURE'&&
  e.phrase_and_timestamp_independently_counted===false&&
  e.human_identity_confirmed===false&&
  e.real_observation===false&&
  e.external_authentication_performed===false&&
  H.every((h,i)=>e.joint_cue_likelihoods[h]===C[test[0]][i]),
  'Simulated cue authenticity or cue model changed');
 const reports=record.new_simulated_reports,steps=record.evidence_ledger;
 check(reports?.length===5&&steps?.length===5,'Five reports needed');
 let prev=original.content_sha256;
 for(let i=0;i<5;i++){
  const r=reports[i],s=steps[i];
  check(r.report_id==='SIMW-'+String(i+1).padStart(2,'0')&&
   r.claimed_origin_id==='DECLARED-'+String(i+1).padStart(2,'0')&&
   r.claims_independent_origin===true&&r.synthetic_claim==='full'&&
   r.peculiar_phrase_marker==='THE-QUIET-BLUE-LINE'&&
   r.simulated_publication_minute===601+i&&
   r.upstream_receipt_supplied===false&&
   r.synthetic_not_real_testimony===true&&
   r.real_witness_authenticated===false&&
   r.real_actions_allowed===false&&
   s.previous_sha256===prev&&s.report_sha256===r.content_sha256&&
   s.report.content_sha256===r.content_sha256&&
   s.sequence===i+1&&
   s.source_independence_remains_unverified===true&&
   s.physical_observation_count===0,
   'Report provenance chain or authority differs');
  prev=s.content_sha256;
 }
 check(prev===record.last_receipt_sha256,'Append-only chain modified');
 check(H.every(h=>record.prior_origin_hypotheses[h]==='1/3')&&
   H.every((h,i)=>record.closed_hypotheses[h]===K[i]),
   'Alternative source partition assumptions modified');
 const probs=replayOrigin(test[0]);
 for(let i=0;i<3;i++)
  check(eq(p(record.source_origin_posterior[H[i]]),probs.h[i]),
   'Independent exact-rational origin Bayes mismatch');
 for(let i=0;i<4;i++)
  check(eq(p(record.world_posterior[W[i]]),probs.w[i]),
   'Independent PNG world posterior mismatch');
 check(eq(p(record.posterior_wall_full),add(probs.w[2],probs.w[3])),
   'World likelihood mixture wrong');
 for(const [depth,key,policyKey] of [
   [0,'question_policy_no_ask_loss','no_decision_without_asking'],
   [1,'question_policy_up_to_one_loss',null],
   [2,'question_policy_up_to_two_loss','question_policy_up_to_two']]){
   const q=optimal(probs.h,depth);
   check(Math.abs(record[key]-number(q.loss))<1e-12,
    'Decision-aware question optimum differs from independent enumeration');
   if(policyKey)checkPolicy(record[policyKey],q.node);
 }
 if(name==='SIMILAR_WORDING_ONLY')
  check(record.no_decision_without_asking.action==='HOLD_NO_ORIGIN_CLAIM',
     'Same wording cannot certify source dependence');
 if(name==='INDEPENDENT_CONVERGENCE')
  check(number(probs.h[2])>.95&&
    record.no_decision_without_asking.action==='COUNT_FIVE',
    'False dismissal of genuinely independent but same-wording control');
 return {fixture:name,source_structure_behind_report_unattested:true,
   independently_checked_probabilities:Object.fromEntries(H.map((h,i)=>[h,fmt(probs.h[i])])),
   optimal_unsent_questions_independently_replayed:true,
   human_source_attestations:0};
}
export function review(motifDir,questionDir,hiddenDir){
 const originalSource=pinOriginal(motifDir);
 const originalQuestion=verifyOriginalQuestion(questionDir);
 const all=Object.keys(FIXTURES);
 verifyCanonical([...all.map(n=>join(hiddenDir,n,'inference.json')),
    join(hiddenDir,'benchmark.json')]);
 const packets=all.map(n=>verifyCase(load(join(hiddenDir,n,'inference.json')),
                                   originalQuestion,n));
 const summary=load(join(hiddenDir,'benchmark.json'));
 check(summary.schema==='motif012.hidden-source-benchmark.v0'&&
  summary.status==='HOLD_SYNTHETIC_LATENT_SOURCE_REASONING_ONLY'&&
  summary.cases?.length===5&&
  summary.independent_and_hidden_shared_controls_both_present===true&&
  summary.matched_classical_latent_model_and_question_tree_equal===true&&
  summary.same_wording_not_automatically_classified_as_copying===true&&
  summary.real_source_independence_proven===false&&
  summary.actual_world_observed===false&&
  summary.total_human_contacts===0&&summary.total_real_actions===0,
  'Original test benchmark authority expanded');
 const b={schema:'cannon097.hidden-origin-review.v0',
   status:'HOLD_LATENT_ORIGIN_MATH_REPLAYED_WITNESSES_UNAUTHENTICATED',
   original_source_owner:originalSource,
   original_four_png_worlds_sha256:originalQuestion.content_sha256,
   five_finite_synthetic_cases:packets,
   separate_exact_rational_source_model:true,
   separate_cost_sensitive_question_tree:true,
   original_source_is_hypothetical:true,
   actual_human_evidence_authenticated:false,
   external_source_independence_demonstrated:false,
   global_model_generalization_demonstrated:false,
   signed:false,people_contacted:0,physical_actions:0,
   source_deployments:0,code_admitted:false};
 return {...b,content_sha256:jsHash(b)};
}
function main(argv){
 check(argv.length===8&&argv[0]==='--motif'&&argv[2]==='--question'&&
  argv[4]==='--hidden'&&argv[6]==='--out','Malformed source review request');
 const x=review(argv[1],argv[3],argv[5]);
 writeFileSync(argv[7],JSON.stringify(x,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({status:x.status,original:x.original_source_owner.commit,
    synthetic_cases:x.five_finite_synthetic_cases.length,real_source_authentications:0}));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 try{main(process.argv.slice(2))}catch(e){
  console.error(JSON.stringify({stage:'HOLD',reason:e.message}));process.exitCode=1}
}
