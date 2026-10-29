import {hash,json,requireThat} from '../constellation/sources.mjs';
export const MISSIONS=['mit','voqal','garden','jubilee','commons'];
export const ACTIONS=['run','why','inspect','break','refuse','fork','swap','recombine'];
export function validateChallenge(r){
 requireThat(r&&Object.getPrototypeOf(r)===Object.prototype&&Object.keys(r).sort().join()===['schema','mission','action','authorized','receiver','variant','secondary','requestId'].sort().join(),'CHALLENGE_SHAPE');
 requireThat(r.schema==='arcade.challenge/v1'&&MISSIONS.includes(r.mission)&&ACTIONS.includes(r.action)&&['HOLD','REFUSE'].includes(r.receiver)&&['A','B','NO_POWER','NO_PROVIDER'].includes(r.variant)&&MISSIONS.includes(r.secondary)&&/^[a-z0-9-]{4,64}$/.test(r.requestId),'CHALLENGE_SCOPE');
 requireThat(r.authorized===true,'CONSENT_REQUIRED_LOCAL_FICTIONAL_ONLY');return r;
}
export function challenge(mission='mit',action='run',change={}){
 return validateChallenge({schema:'arcade.challenge/v1',mission,action,authorized:true,receiver:'HOLD',variant:'A',secondary:'jubilee',requestId:'baseline-'+mission,...change});
}
export function validateDag(plan){
 requireThat(plan?.schema==='arcade.dag/v1'&&Array.isArray(plan.nodes)&&plan.nodes.length>0&&plan.nodes.length<=128,'DAG_SHAPE');
 const byId=new Map();
 for(const n of plan.nodes){requireThat(/^[a-z0-9-]+$/.test(n.id)&&typeof n.owner==='string'&&typeof n.out==='string'&&Array.isArray(n.parents)&&Array.isArray(n.inputs)&&!byId.has(n.id),'DAG_NODE');byId.set(n.id,n)}
 const visits=new Set(),done=new Set();
 function walk(id){requireThat(!visits.has(id),'DAG_CYCLE');if(done.has(id))return;const n=byId.get(id);requireThat(!!n,'DAG_MISSING_PARENT');visits.add(id);
  requireThat(new Set(n.parents).size===n.parents.length&&n.inputs.length===n.parents.length,'DAG_MAPPING_COVERAGE');
  for(const p of n.parents){walk(p);const mapping=n.inputs.filter(x=>x.from===p);requireThat(mapping.length===1&&mapping[0].schema===byId.get(p).out,'DAG_WRONG_FIELD_MAPPING')}
  visits.delete(id);done.add(id);
 }
 for(const n of plan.nodes)walk(n.id);return plan;
}
function assertJson(value,seen=new Set(),path='$'){
 requireThat(value!==undefined&&['object','number','string','boolean'].includes(typeof value),'NON_JSON_NATIVE_OUTPUT:'+path);
 if(typeof value==='number')requireThat(Number.isFinite(value),'NON_JSON_NONFINITE');
 if(value&&typeof value==='object'){
  requireThat(!seen.has(value)&&(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype),'NON_JSON_NATIVE_OBJECT');seen.add(value);
  if(Array.isArray(value))requireThat(Object.keys(value).length===value.length,'NON_JSON_ARRAY_GAP');
  for(const [key,v] of Object.entries(value))assertJson(v,seen,path+'.'+key);seen.delete(value);
 }
}
export async function executeDag(plan,functions){
 validateDag(plan);const results={},stages=[];const pending=new Set(plan.nodes.map(n=>n.id));
 while(pending.size){
  const batch=plan.nodes.filter(n=>pending.has(n.id)&&n.parents.every(p=>Object.hasOwn(results,p)));
  requireThat(batch.length>0,'DAG_UNRESOLVED');
  const computed=await Promise.all(batch.map(async n=>{
   requireThat(typeof functions[n.id]==='function','DAG_EXECUTOR_MISSING');
   const inputs=Object.fromEntries(n.parents.map(p=>[p,results[p]]));
   const output=await functions[n.id](inputs);
   requireThat(output!==undefined,'NATIVE_OUTPUT_MISSING');
   assertJson(output,new Set(),n.id);const bytes=json(output); // Reject non-finite/undefined/native exotic values at adapter boundary elsewhere.
   return {n,output,record:{id:n.id,owner:n.owner,contract:n.out,parents:n.parents,inputs:n.inputs.map(m=>({...m,sha256:hash(json(results[m.from]))})),inputSha256:hash(json(inputs)),outputSha256:hash(bytes)}};
  }));
  for(const {n,output,record} of computed){results[n.id]=output;stages.push(record);pending.delete(n.id)}
 }
 return {schema:'arcade.execution-dag/v1',plan,results,stages};
}
