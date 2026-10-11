/** CANNON 008: an exact-source branch loadout. Does not run donor code. */
import {createHash} from 'node:crypto';
import {readSource} from './present-use.mjs';
const PLAN='cannon.branch-loadout-plan/v0';
const REPORT='cannon.branch-loadout-report/v0';
const fail=(ok,why)=>{if(!ok)throw Error(why);};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const exact=(x,keys)=>obj(x)&&Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
const canonical=x=>{if(x===null||typeof x==='string'||typeof x==='boolean')return JSON.stringify(x);
if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';
fail(obj(x),'NOT_CANONICAL_JSON');return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';};
const digest=x=>createHash('sha256').update(canonical(x)).digest('hex');
const safePath=p=>typeof p==='string'&&p.length>0&&p.length<220&&/^[A-Za-z0-9_.\/-]+$/.test(p)&&!p.startsWith('/')&&p.split('/').every(x=>x&&x!=='.'&&x!=='..');
export function validate(plan){
  fail(exact(plan,['schema','purpose','entries']),'INVALID_PLAN_FIELDS');
  fail(plan.schema===PLAN&&typeof plan.purpose==='string'&&plan.purpose.trim().length>0&&plan.purpose.length<=240,'INVALID_PURPOSE');
  fail(Array.isArray(plan.entries)&&plan.entries.length>0&&plan.entries.length<=32,'INVALID_LOADOUT_SIZE');
  const ids=new Set();
  for(const e of plan.entries){
    fail(exact(e,['id','repository','branchHint','commit','path','runtime','argv','evidenceUrl','gates']),'INVALID_ENTRY_FIELDS');
    fail(typeof e.id==='string'&&/^[a-z][a-z0-9-]{1,79}$/.test(e.id)&&!ids.has(e.id),'INVALID_OR_DUPLICATE_ENTRY');
    ids.add(e.id);
    fail(typeof e.repository==='string'&&/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(e.repository),'INVALID_REPO');
    fail(typeof e.commit==='string'&&/^[a-f0-9]{40}$/.test(e.commit),'INVALID_PIN');
    fail(typeof e.branchHint==='string'&&e.branchHint!=='main'&&/^[A-Za-z0-9_.\/-]{1,160}$/.test(e.branchHint),'INVALID_BRANCH_HINT');
    fail(safePath(e.path)&&['NODE_22','NODE_24'].includes(e.runtime),'INVALID_PATH_OR_RUNTIME');
    fail(Array.isArray(e.argv)&&e.argv.length<=12&&e.argv.every(s=>typeof s==='string'&&/^[A-Za-z0-9_./:@=-]{1,120}$/.test(s)),'INVALID_ARGV_DECLARATION');
    fail(typeof e.evidenceUrl==='string'&&e.evidenceUrl.startsWith('https://github.com/'+e.repository+'/actions/runs/')&&/\/[0-9]+$/.test(e.evidenceUrl),'INVALID_EVIDENCE_REFERENCE');
    fail(Array.isArray(e.gates)&&e.gates.length>0&&e.gates.length<=12&&e.gates.every(s=>typeof s==='string'&&s.trim().length>0&&s.length<=240),'MISSING_REVIEW_GATES');
  }
  return plan;
}
export function inspect(plan,roots){
  validate(plan);
  const entries=plan.entries.map(e=>{
    const verified=readSource({id:e.id,repository:e.repository,commit:e.commit,path:e.path,media_type:'text/plain',tags:[]},roots);
    return {
      id:e.id,source:verified.witness,branchHint:e.branchHint,runtime:e.runtime,
      entrypoint:e.path,declaredArgs:e.argv,evidenceUrl:e.evidenceUrl,
      gates:e.gates,source_status:'ORIGINAL_GIT_OBJECT_VERIFIED_LOCAL',
      ci_reverified:false,signer_authenticated:false,dependencies_installed:false,
      runnable_checked:false,execution_authorized:false,
    };
  });
  const body={schema:REPORT,purpose:plan.purpose,planSha256:digest(plan),entries,
    status:'SOURCE_VERIFIED_REVIEW_REQUIRED',canon_selected:false,
    receiver_admitted:false,rights_established:false,donor_executions:0,
    git_mutations:0,deployments:0,
    nonClaims:['Local Git remote configuration is not GitHub owner authentication','Existing CI URLs are observations, not runner attestations','No donor CLI is executed','No rights, key trust, runtime permission or release are implied']};
  return {...body,reportSha256:digest(body)};
}
export function verify(plan,roots,report){
  const expected=inspect(plan,roots);
  fail(canonical(report)===canonical(expected),'REPLAY_OR_SOURCE_MISMATCH');
  return {status:'COLD_REPLAY_VERIFIED',reportSha256:expected.reportSha256,
    sourceCount:expected.entries.length,executions:0};
}
