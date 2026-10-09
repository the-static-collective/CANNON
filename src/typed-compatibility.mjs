/** CANNON 004: exact-source JSON Schema subset compatibility, WITHOUT executing input. */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {readSource} from './present-use.mjs';

export const PLAN_SCHEMA='cannon.typed-compatibility-plan/v0';
export const REPORT_SCHEMA='cannon.typed-compatibility-report/v0';
const ID=/^[a-z][a-z0-9_-]{0,63}$/;
const REPO=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SHA=/^[a-f0-9]{40}$/;
const KEYWORDS=new Set(['$schema','$id','title','description','type','const','enum','required','properties','additionalProperties','items','minItems','maxItems','uniqueItems','minLength','maxLength','minimum','maximum','format','default']);
const TYPES=new Set(['object','array','string','number','integer','boolean','null']);
const fail=(condition,code)=>{if(!condition)throw Error(code);};
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const keys=(v,allowed)=>obj(v)&&Object.keys(v).sort().join('|')===[...allowed].sort().join('|');
const hash=v=>'sha256:'+createHash('sha256').update(v).digest('hex');
function canonical(v){
 if(v===null||typeof v==='string'||typeof v==='boolean')return JSON.stringify(v);
 if(typeof v==='number'){fail(Number.isFinite(v),'NON_FINITE');return JSON.stringify(v);}
 if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
 fail(obj(v),'NON_JSON_VALUE');
 return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
}
const digest=v=>hash(canonical(v));
const ptr=(p,k)=>p+'/'+String(k).replace(/~/g,'~0').replace(/\//g,'~1');
const validPath=s=>typeof s==='string'&&s.length>0&&s.length<=239&&!s.startsWith('/')&&
 /^[A-Za-z0-9_.\/-]+$/.test(s)&&s.split('/').every(t=>t!=='.'&&t!=='..'&&t!=='');
export function validatePlan(plan){
 fail(keys(plan,['schema','goal','sources','checks']),'PLAN_FIELDS_INVALID');
 fail(plan.schema===PLAN_SCHEMA&&typeof plan.goal==='string'&&plan.goal.trim().length>0&&plan.goal.length<501,'PLAN_INVALID');
 fail(Array.isArray(plan.sources)&&plan.sources.length>=2&&plan.sources.length<=16,'SOURCES_INVALID');
 fail(Array.isArray(plan.checks)&&plan.checks.length>=1&&plan.checks.length<=32,'CHECKS_INVALID');
 const ids=new Set();
 for(const s of plan.sources){
  fail(keys(s,['id','repository','commit','path','media_type']),'SOURCE_FIELDS_INVALID');
  fail(typeof s.id==='string'&&ID.test(s.id)&&!ids.has(s.id)&&
    typeof s.repository==='string'&&REPO.test(s.repository)&&
    typeof s.commit==='string'&&SHA.test(s.commit)&&validPath(s.path)&&
    s.media_type==='application/json','SOURCE_INVALID');
  ids.add(s.id);
 }
 const checks=new Set();
 for(const c of plan.checks){
  fail(keys(c,['id','instance','contract']),'CHECK_FIELDS_INVALID');
  fail(typeof c.id==='string'&&ID.test(c.id)&&!checks.has(c.id)&&ids.has(c.instance)&&ids.has(c.contract)&&c.instance!==c.contract,'CHECK_INVALID');
  checks.add(c.id);
 }
 return plan;
}
const supportedFormat=(f)=>f==='date-time';
export function validateSubsetSchema(schema,depth=0){
 fail(depth<=32,'SCHEMA_DEPTH_UNSUPPORTED');
 fail(obj(schema),'SCHEMA_MUST_BE_OBJECT');
 for(const k of Object.keys(schema))fail(KEYWORDS.has(k),'UNSUPPORTED_SCHEMA_KEYWORD:'+k);
 if(Object.hasOwn(schema,'type')){
  const t=Array.isArray(schema.type)?schema.type:[schema.type];
  fail(t.length>0&&new Set(t).size===t.length&&t.every(x=>TYPES.has(x)),'UNSUPPORTED_TYPE');
 }
 if(Object.hasOwn(schema,'properties')){
  fail(obj(schema.properties)&&Object.keys(schema.properties).length<=128,'SCHEMA_PROPERTIES_INVALID');
  for(const v of Object.values(schema.properties))validateSubsetSchema(v,depth+1);
 }
 if(Object.hasOwn(schema,'items'))validateSubsetSchema(schema.items,depth+1);
 if(Object.hasOwn(schema,'additionalProperties'))fail(typeof schema.additionalProperties==='boolean','ADDITIONAL_PROPERTIES_POLICY_UNSUPPORTED');
 if(Object.hasOwn(schema,'required'))fail(Array.isArray(schema.required)&&schema.required.length<=128&&
   new Set(schema.required).size===schema.required.length&&schema.required.every(x=>typeof x==='string'),'REQUIRED_INVALID');
 if(Object.hasOwn(schema,'enum'))fail(Array.isArray(schema.enum)&&schema.enum.length>0&&schema.enum.length<=128,'ENUM_INVALID');
 if(Object.hasOwn(schema,'format'))fail(supportedFormat(schema.format),'UNSUPPORTED_FORMAT');
 for(const k of ['minLength','maxLength','minItems','maxItems']){
  if(Object.hasOwn(schema,k))fail(Number.isSafeInteger(schema[k])&&schema[k]>=0,'UNSUPPORTED_LIMIT:'+k);
 }
 for(const k of ['minimum','maximum'])if(Object.hasOwn(schema,k))fail(typeof schema[k]==='number'&&Number.isFinite(schema[k]),'UNSUPPORTED_LIMIT:'+k);
 if(Object.hasOwn(schema,'uniqueItems'))fail(typeof schema.uniqueItems==='boolean','UNSUPPORTED_UNIQUEITEMS');
 for(const k of ['$schema','$id','title','description'])if(Object.hasOwn(schema,k))fail(typeof schema[k]==='string','SCHEMA_METADATA_INVALID');
 return schema;
}
function isType(v,t){
 switch(t){
  case 'null':return v===null;
  case 'object':return obj(v);
  case 'array':return Array.isArray(v);
  case 'integer':return typeof v==='number'&&Number.isSafeInteger(v);
  case 'number':return typeof v==='number'&&Number.isFinite(v);
  default:return typeof v===t;
 }
}
function violation(out,path,keyword,detail){if(out.length<128)out.push({path,keyword,detail:String(detail).slice(0,160)});}
function compare(value,schema,path,out,depth=0){
 if(depth>32){violation(out,path,'depth','Maximum supported nesting exceeded');return;}
 if(Object.hasOwn(schema,'type')){
  const ts=Array.isArray(schema.type)?schema.type:[schema.type];
  if(!ts.some(t=>isType(value,t))){violation(out,path,'type',ts.join('|'));return;}
 }
 if(Object.hasOwn(schema,'const')&&canonical(value)!==canonical(schema.const))violation(out,path,'const','Exact value does not match');
 if(schema.enum&&!schema.enum.some(x=>canonical(value)===canonical(x)))violation(out,path,'enum','Value not in enumerated options');
 if(typeof value==='string'){
  if(Array.from(value).length<(schema.minLength??0))violation(out,path,'minLength',schema.minLength);
  if(schema.maxLength!==undefined&&Array.from(value).length>schema.maxLength)violation(out,path,'maxLength',schema.maxLength);
  if(schema.format==='date-time'&& !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(value))
   violation(out,path,'format','date-time syntax');
  else if(schema.format==='date-time'&&Number.isNaN(Date.parse(value)))violation(out,path,'format','invalid date-time');
 }
 if(typeof value==='number'){
  if(schema.minimum!==undefined&&value<schema.minimum)violation(out,path,'minimum',schema.minimum);
  if(schema.maximum!==undefined&&value>schema.maximum)violation(out,path,'maximum',schema.maximum);
 }
 if(obj(value)){
  for(const req of schema.required??[])if(!Object.hasOwn(value,req))violation(out,ptr(path,req),'required','Missing field');
  for(const [k,v] of Object.entries(value)){
   if(schema.properties&&Object.hasOwn(schema.properties,k))compare(v,schema.properties[k],ptr(path,k),out,depth+1);
   else if(schema.additionalProperties===false)violation(out,ptr(path,k),'additionalProperties','Undeclared field');
  }
 }
 if(Array.isArray(value)){
  if(value.length<(schema.minItems??0))violation(out,path,'minItems',schema.minItems);
  if(schema.maxItems!==undefined&&value.length>schema.maxItems)violation(out,path,'maxItems',schema.maxItems);
  if(schema.uniqueItems===true&&new Set(value.map(canonical)).size!==value.length)violation(out,path,'uniqueItems','Duplicate items');
  if(schema.items)for(let i=0;i<value.length;i++)compare(value[i],schema.items,ptr(path,i),out,depth+1);
 }
}
export function validateInstance(instance,schema){
 validateSubsetSchema(schema);
 const violations=[];compare(instance,schema,'',violations);
 return {status:violations.length?'INCOMPATIBLE':'STRUCTURALLY_COMPATIBLE',violations};
}
function loadSource(s,roots){
 const {witness,content}=readSource({...s,tags:[]},roots);
 const value=JSON.parse(content);
 return {witness,value};
}
export function evaluate(plan,roots){
 validatePlan(plan);
 const sources={};const contents={};
 for(const s of plan.sources){
  try{const v=loadSource(s,roots);sources[s.id]={status:'GIT_OBJECT_VERIFIED',witness:v.witness};contents[s.id]=v.value;}
  catch(e){sources[s.id]={status:'HOLD',reason:String(e.message).slice(0,160)};}
 }
 const checks=plan.checks.map(c=>{
  const a=sources[c.instance],b=sources[c.contract];
  if(a.status==='HOLD'||b.status==='HOLD')return {id:c.id,instance:c.instance,contract:c.contract,status:'HOLD',violations:[],reason:'SOURCE_UNAVAILABLE_OR_UNVERIFIABLE'};
  try{
   const result=validateInstance(contents[c.instance],contents[c.contract]);
   return {id:c.id,instance:c.instance,contract:c.contract,...result,reason:null};
  }catch(e){return {id:c.id,instance:c.instance,contract:c.contract,status:'HOLD',violations:[],reason:String(e.message).slice(0,160)};}
 });
 const reportBody={schema:REPORT_SCHEMA,goal:plan.goal,plan_digest:digest(plan),sources,checks,
  scope:'EXACT_GIT_JSON_BYTES_AND_DECLARED_SCHEMA_SUBSET',
  schema_subset:['type','const','enum','required','properties','additionalProperties','items','minItems','maxItems','uniqueItems','minLength','maxLength','minimum','maximum','format:date-time'],
  schema_semantics:'JSON_SCHEMA_DRAFT_2020_12_SUPPORTED_KEYWORDS_ONLY',
  remote_identity_verified:false,signatures_verified:false,operational_compatibility_verified:false,
  permission_granted:false,git_mutations:0,executions:0,canon_selection_required:false};
 const report={...reportBody,receipt_id:digest(reportBody)};
 return {report};
}
export function emit(plan,roots,out){
 const {report}=evaluate(plan,roots);
 fail(!existsSync(out),'OUTPUT_ALREADY_EXISTS');
 mkdirSync(out,{recursive:false,mode:0o700});
 writeFileSync(join(out,'compatibility.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
 return report;
}
export function coldVerify(plan,roots,out){
 const expected=evaluate(plan,roots).report;
 const actual=readFileSync(join(out,'compatibility.json'));
 fail(actual.equals(Buffer.from(JSON.stringify(expected,null,2)+'\n')),'COLD_REPLAY_MISMATCH');
 return {status:'COMPATIBILITY_COLD_REPLAY_VERIFIED',receipt_id:expected.receipt_id,
  checks:expected.checks.map(c=>({id:c.id,status:c.status})),
  execution_authority:'NONE',git_mutations:0};
}