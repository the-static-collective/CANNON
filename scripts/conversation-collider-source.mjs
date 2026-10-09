#!/usr/bin/env node
/**
 * CONVERSATION COLLIDER 002 — pinned-source interface discovery.
 * Parses data from exact, read-only Git objects; never executes donor content.
 * A declared schema identity creates a question, not permission or admission.
 */
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readSource} from '../src/present-use.mjs';
import {validateInstance, validateSubsetSchema} from '../src/typed-compatibility.mjs';

export const PLAN_SCHEMA='cannon.conversation-collider-source-map/v1';
export const REPORT_SCHEMA='cannon.conversation-collider-source-report/v1';
const ID=/^[a-z][a-z0-9-]{0,63}$/;
const REPO=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SHA=/^[0-9a-f]{40}$/;
const PATH=/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/;
const CONTRACT=/^[a-z][a-z0-9_.\/-]{2,120}$/;
const assert=(value,code)=>{if(!value)throw Error(code);};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const keys=(o,expected)=>object(o)&&Object.keys(o).sort().join('|')===expected.slice().sort().join('|');
const canonical=v=>{
 if(v===null||typeof v==='string'||typeof v==='boolean')return JSON.stringify(v);
 if(typeof v==='number'){assert(Number.isSafeInteger(v),'UNSAFE_NUMBER');return JSON.stringify(v);}
 if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
 assert(object(v),'NON_JSON_VALUE');
 return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
};
const digest=v=>'sha256:'+createHash('sha256').update(canonical(v)).digest('hex');
export function validateSourceMap(plan) {
 assert(keys(plan,['schema','sources'])&&plan.schema===PLAN_SCHEMA,'SOURCE_MAP_INVALID');
 assert(Array.isArray(plan.sources)&&plan.sources.length>=2&&plan.sources.length<=12,'SOURCE_COUNT_INVALID');
 const seen=new Set();let instances=0,contracts=0;
 for(const s of plan.sources) {
  assert(keys(s,['id','role','repository','commit','path']),'SOURCE_FIELDS_INVALID');
  assert(typeof s.id==='string'&&ID.test(s.id)&&!seen.has(s.id),'SOURCE_ID_INVALID_OR_DUPLICATE');
  seen.add(s.id);
  assert(['INSTANCE','JSON_SCHEMA_CONTRACT'].includes(s.role),'SOURCE_ROLE_INVALID');
  instances+=s.role==='INSTANCE';contracts+=s.role==='JSON_SCHEMA_CONTRACT';
  assert(typeof s.repository==='string'&&REPO.test(s.repository) &&
    typeof s.commit==='string'&&SHA.test(s.commit) &&
    typeof s.path==='string'&&s.path.length<=239&&PATH.test(s.path) &&
    s.path.split('/').every(p=>p!=='.'&&p!=='..'),'SOURCE_PIN_INVALID');
 }
 assert(instances>0&&contracts>0,'BOTH_SOURCE_ROLES_REQUIRED');
 return plan;
}
function inspect(s,roots){
 const base={id:s.id,role:s.role,repository:s.repository,commit:s.commit,path:s.path};
 try {
  const {witness,content}=readSource({...s,media_type:'application/json',tags:[]},roots);
  const value=JSON.parse(content);
  assert(object(value),'SOURCE_NOT_OBJECT');
  let declaration;
  if(s.role==='JSON_SCHEMA_CONTRACT') {
   validateSubsetSchema(value);
   declaration=value.properties?.schema?.const;
  } else declaration=value.schema;
  assert(typeof declaration==='string'&&CONTRACT.test(declaration),'TYPED_CONTRACT_NOT_EXTRACTABLE');
  return {...base,status:'GIT_OBJECT_VERIFIED',declared_contract:declaration,witness,value};
 } catch(e) {
  return {...base,status:'HOLD',reason:String(e.message).slice(0,160)};
 }
}
export function evaluateSourceMap(plan,roots) {
 validateSourceMap(plan);
 assert(object(roots),'ROOTS_OBJECT_REQUIRED');
 const observed=plan.sources.map(s=>inspect(s,roots)).sort((a,b)=>a.id.localeCompare(b.id,'en'));
 const ready=observed.filter(s=>s.status==='GIT_OBJECT_VERIFIED');
 const candidates=[];
 for(const consumer of ready.filter(s=>s.role==='INSTANCE')){
  for(const provider of ready.filter(s=>s.role==='JSON_SCHEMA_CONTRACT')){
   if(provider.declared_contract!==consumer.declared_contract)continue;
   const fit=validateInstance(consumer.value,provider.value);
   candidates.push({
    instance:consumer.id,contract:provider.id,
    declared_contract:consumer.declared_contract,
    source_relationship:consumer.repository===provider.repository?'SAME_REPOSITORY_BASELINE':'CROSS_REPOSITORY',
    structural_status:fit.status,violations:fit.violations,
    disposition:fit.status==='STRUCTURALLY_COMPATIBLE'
      ?'CANDIDATE_REQUIRES_SEMANTIC_RIGHTS_AND_RECEIVER_REVIEW':'INCOMPATIBLE_HOLD',
    source_integrity:'EXACT_LOCAL_GIT_COMMIT_AND_BLOB_REHASHED',
    remote_owner_authenticated:false,signatures_verified:false,
    permission_granted:false
   });
  }
 }
 candidates.sort((a,b)=>a.instance.localeCompare(b.instance,'en')||a.contract.localeCompare(b.contract,'en'));
 const linked=new Set(candidates.flatMap(c=>[c.instance,c.contract]));
 const sources=observed.map(({value,...summary})=>summary);
 const reportBody={
  schema:REPORT_SCHEMA,
  plan_sha256:digest(plan),
  sources,candidates,
  unmatched:sources.filter(s=>!linked.has(s.id)).map(s=>({id:s.id,status:s.status})),
  discovered_from:'ACTUAL_PINNED_JSON_SOURCE_FIELDS',
  matching_rule:'INSTANCE.schema_EQUALS_SCHEMA.properties.schema.const',
  source_integrity_scope:'LOCAL_GIT_OBJECTS_OR_HOLD_NOT_REMOTE_OWNER_ATTESTATION',
  semantic_compatibility_verified:false,
  rights_verified:false,canon_selected:false,receiver_admitted:false,executions:0,git_mutations:0,
  authority:'PROPOSAL_ONLY_NO_EXECUTION',
  limitations:[
   'Only original pinned Git JSON objects are inspected; no conversation text or private accounts are read.',
   'An exact schema label identifies a test opportunity, not compatibility or proof of author identity.',
   'Structural validation uses the strictly bounded existing CANNON 004 JSON Schema subset.',
   'Signatures and destination admission require separate native verification and permission.'
  ]
 };
 return {...reportBody,receipt_sha256:digest(reportBody)};
}
export function coldVerifySourceMap(plan,roots,report) {
 assert(canonical(evaluateSourceMap(plan,roots))===canonical(report),'COLD_SOURCE_REPLAY_MISMATCH');
 return {status:'PINNED_SOURCE_COLLIDER_COLD_REPLAY_VERIFIED',receipt_sha256:report.receipt_sha256,
  candidates:report.candidates.map(c=>({instance:c.instance,contract:c.contract,structural_status:c.structural_status})),
  execution_authority:'NONE'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  const [cmd,...args]=process.argv.slice(2);
  assert(['scan','verify'].includes(cmd),'EXPECTED_SCAN_OR_VERIFY');
  assert(args.length%2===0,'INVALID_ARGUMENTS');
  const options={};
  for(let i=0;i<args.length;i+=2){
   const key=args[i],val=args[i+1];
   assert(['--plan','--roots','--out'].includes(key)&&typeof val==='string'&&val.length>0&&!Object.hasOwn(options,key),'INVALID_ARGUMENTS');
   options[key]=val;
  }
  assert(options['--plan']&&options['--roots']&&(cmd==='scan'||options['--out']),'MISSING_REQUIRED_ARGUMENTS');
  const load=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
  const plan=load(options['--plan']),roots=load(options['--roots']);
  if(cmd==='scan'){
   const report=evaluateSourceMap(plan,roots);
   if(options['--out'])writeFileSync(resolve(options['--out']),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
   console.log(JSON.stringify(report,null,2));
  }else{
   const result=coldVerifySourceMap(plan,roots,load(options['--out']));
   console.log(JSON.stringify(result,null,2));
  }
 }catch(e){console.error('HOLD:',String(e.message).slice(0,350));process.exitCode=2;}
}
