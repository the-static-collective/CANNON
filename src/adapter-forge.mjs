/** CANNON 005 — loss-accounted adapter proposal, not a signed crossing.
 * Original Git objects remain untouched. Projected data cannot inherit
 * an original crossing_id or signing block from a changed source envelope.
 */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {readSource} from './present-use.mjs';
import {validatePlan as validate004,validateSubsetSchema,validateInstance} from './typed-compatibility.mjs';

export const PLAN_SCHEMA='cannon.adapter-forge-plan/v0';
const ID=/^[a-z][a-z0-9_-]{0,63}$/;
const FIELD=/^[A-Za-z_][A-Za-z0-9_]{0,63}$/;
const fail=(condition,reason)=>{if(!condition)throw Error(reason);};
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const fields=(x,required)=>isObject(x)&&Object.keys(x).sort().join('|')===[...required].sort().join('|');
const hash=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
function canonical(v){
 if(v===null||typeof v==='string'||typeof v==='boolean')return JSON.stringify(v);
 if(typeof v==='number'){fail(Number.isFinite(v),'NONFINITE_NUMBER');return JSON.stringify(v);}
 if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
 fail(isObject(v),'NON_JSON_VALUE');
 return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
}
const digest=v=>hash(Buffer.from(canonical(v),'utf8'));
const pointerEscape=s=>String(s).replace(/~/g,'~0').replace(/\//g,'~1');
const clone=x=>JSON.parse(JSON.stringify(x));
function ruleField(r){
 const match=/^\/payload_refs\/\*\/([A-Za-z_][A-Za-z0-9_]*)$/.exec(r.pointer);
 fail(match&&FIELD.test(match[1]),'UNSUPPORTED_POINTER_PATTERN');
 fail(!['address','role','media_type'].includes(match[1]),'DECLARED_PAYLOAD_FIELD_CANNOT_BE_EXTERNALIZED');
 return match[1];
}
export function validateForgePlan(plan){
 fail(fields(plan,['schema','goal','sources','adapter']),'FORGE_PLAN_FIELDS_INVALID');
 fail(plan.schema===PLAN_SCHEMA,'FORGE_PLAN_SCHEMA_INVALID');
 fail(fields(plan.adapter,['id','instance','contract','mode','rules']),'ADAPTER_FIELDS_INVALID');
 const a=plan.adapter;
 fail(typeof a.id==='string'&&ID.test(a.id)&&a.mode==='PROPOSAL_ONLY'&&
   Array.isArray(a.rules)&&a.rules.length>=1&&a.rules.length<=8,'ADAPTER_POLICY_INVALID');
 const ruleIds=new Set(),fieldNames=new Set();
 for(const r of a.rules){
  fail(fields(r,['id','op','pointer','accepted_type','disposition','rationale']),'RULE_FIELDS_INVALID');
  fail(typeof r.id==='string'&&ID.test(r.id)&&!ruleIds.has(r.id)&&r.op==='EXTERNALIZE_FIELD'&&
    r.accepted_type==='safe_nonnegative_integer'&&r.disposition==='PRESERVE_IN_SIDECAR'&&
    typeof r.rationale==='string'&&r.rationale.trim().length>=12&&r.rationale.length<=300,'RULE_POLICY_INVALID');
  const key=ruleField(r);
  fail(!fieldNames.has(key),'DUPLICATE_RULE_POINTER');
  fieldNames.add(key);ruleIds.add(r.id);
 }
 validate004({schema:'cannon.typed-compatibility-plan/v0',goal:plan.goal,sources:plan.sources,
   checks:[{id:a.id,instance:a.instance,contract:a.contract}]});
 return plan;
}
function sourceMap(plan,roots){
 const found={};const contents={};
 for(const s of plan.sources){
  try{
   const {witness,content}=readSource({...s,tags:[]},roots);
   const value=JSON.parse(content);
   found[s.id]={status:'VERIFIED_LOCAL_GIT_SOURCE',witness};
   contents[s.id]=value;
  }catch(e){found[s.id]={status:'HOLD',reason:String(e.message).slice(0,160)};}
 }
 return {found,contents};
}
function missingIdentityOnly(result){
 return result.status==='INCOMPATIBLE' && result.violations.length===2 &&
   result.violations.every(v=>v.keyword==='required'&&
     ['/signing','/crossing_id'].includes(v.path));
}
export function forge(plan,roots){
 validateForgePlan(plan);
 const {found,contents}=sourceMap(plan,roots),a=plan.adapter;
 const source=found[a.instance],contract=found[a.contract];
 const base={schema:'cannon.adapter-proposal/v0',adapter_id:a.id,goal:plan.goal,
   plan_digest:digest(plan),sources:found,original_compatibility:null,
   transformed_compatibility:null,proposal_only:true,permission_granted:false,
   original_signed_object_modified:false,signature_inherited:false,
   reLATTE_crossing_created:false,receiver_disposition:'NONE',
   git_mutations:0,executions:0,canon_selection_required:false};
 const sidecar={schema:'cannon.adapter-sidecar/v0',adapter_id:a.id,
   original_commit:source.witness?.commit??null,
   original_blob_sha256:source.witness?.blob_sha256??null,
   entries:[],interpretation:'EXTERNALIZED_FROM_PREVIEW_NOT_DELETED_FROM_GIT'};
 let status='HOLD';
 let reason='SOURCE_UNVERIFIABLE';
 let unsignedPreview=null;
 if(source.status==='VERIFIED_LOCAL_GIT_SOURCE'&&contract.status==='VERIFIED_LOCAL_GIT_SOURCE'){
  try{
   const original=contents[a.instance],schema=contents[a.contract];
   fail(isObject(original)&&isObject(schema),'SOURCE_JSON_OBJECT_REQUIRED');
   validateSubsetSchema(schema);
   const before=validateInstance(original,schema);
   base.original_compatibility=before;
   fail(before.status==='INCOMPATIBLE','SOURCE_NOT_INCOMPATIBLE');
   const props=schema.properties?.payload_refs?.items?.properties;
   const item=schema.properties?.payload_refs?.items;
   fail(isObject(props)&&item?.additionalProperties===false,'CONTRACT_NOT_CLOSED_PAYLOAD_ITEMS');
   fail(Array.isArray(original.payload_refs)&&original.payload_refs.length<=256,'SOURCE_PAYLOAD_REFS_INVALID');
   fail(Object.hasOwn(original,'signing')&&Object.hasOwn(original,'crossing_id'),'SOURCE_NOT_SIGNED_ENVELOPE');
   const proposed=clone(original);
   for(const rule of a.rules){
    const field=ruleField(rule);
    fail(!Object.hasOwn(props,field),'CANNOT_EXTERNALIZE_CONTRACT_FIELD');
    let count=0;
    for(let i=0;i<proposed.payload_refs.length;i++){
     const target=proposed.payload_refs[i];
     fail(isObject(target),'PAYLOAD_ENTRY_NOT_OBJECT');
     if(!Object.hasOwn(target,field))continue;
     const path='/payload_refs/'+i+'/'+pointerEscape(field);
     fail(before.violations.some(v=>v.path===path&&v.keyword==='additionalProperties'),
       'FIELD_WAS_NOT_DOCUMENTED_INCOMPATIBILITY');
     const value=target[field];
     fail(Number.isSafeInteger(value)&&value>=0,'UNSUPPORTED_FIELD_VALUE');
     sidecar.entries.push({rule_id:rule.id,pointer:path,value,value_sha256:digest(value),
       disposition:'PRESERVED_IN_SIDECAR',rationale:rule.rationale});
     delete target[field];count++;
    }
    fail(count>0,'RULE_DID_NOT_MATCH_SOURCE');
   }
   const covered=new Set(sidecar.entries.map(e=>e.pointer));
   fail(before.violations.every(v=>covered.has(v.path)&&v.keyword==='additionalProperties'),
     'UNHANDLED_OR_NONLOSSLESS_INCOMPATIBILITY');
   // A derivative MUST NOT retain the old source crossing ID or signature.
   delete proposed.crossing_id;
   delete proposed.signing;
   const after=validateInstance(proposed,schema);
   base.transformed_compatibility=after;
   fail(missingIdentityOnly(after),'OTHER_SCHEMA_INCOMPATIBILITIES_REMAIN');
   unsignedPreview=proposed;
   status='HOLD_REISSUE_REQUIRED';
   reason='STRUCTURAL_FIELDS_TRANSLATED_BUT_FRESH_CROSSING_ID_AND_SIGNATURE_REQUIRED';
  }catch(e){status='HOLD';reason=String(e.message).slice(0,160);}
 }
 const proposal={...base,status,reason,adapter_rules:a.rules,preview:unsignedPreview,
   preview_kind:'UNSIGNED_INCOMPLETE_ENVELOPE_NOT_TRANSPORTABLE',
   integrity_note:'All copied data is untrusted until a separate authorized reissuer recomputes crossing identity and signs new bytes.'};
 const ledger={...sidecar,proposal_digest:digest(proposal)};
 const body={schema:'cannon.adapter-forge-receipt/v0',status,reason,
  proposal_sha256:digest(proposal),sidecar_sha256:digest(ledger),
  original_source_binding:source.witness??null,target_schema_binding:contract.witness??null,
  externalized_entries:ledger.entries.length,
  signature_inherited:false,crossing_created:false,execution_authority:'NONE',
  source_mutations:0,canon_selection_required:false};
 const receipt={...body,receipt_id:digest(body)};
 return {proposal,ledger,receipt};
}
export function emit(plan,roots,out){
 const result=forge(plan,roots);
 fail(result.proposal.status==='HOLD_REISSUE_REQUIRED','NO_VERIFIED_ADAPTER_CANDIDATE');
 fail(!existsSync(out),'OUTPUT_ALREADY_EXISTS');
 mkdirSync(out,{recursive:false,mode:0o700});
 for(const [name,data] of [['proposal.json',result.proposal],['sidecar.json',result.ledger],['receipt.json',result.receipt]]){
  writeFileSync(join(out,name),JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});
 }
 return result.receipt;
}
export function coldVerify(plan,roots,out){
 const expected=forge(plan,roots);
 fail(expected.proposal.status==='HOLD_REISSUE_REQUIRED','SOURCE_NO_LONGER_VERIFIES');
 for(const [name,data] of [['proposal.json',expected.proposal],['sidecar.json',expected.ledger],['receipt.json',expected.receipt]]){
  const actual=readFileSync(join(out,name));
  fail(actual.equals(Buffer.from(JSON.stringify(data,null,2)+'\n')),'COLD_REPLAY_MISMATCH:'+name);
 }
 return {status:'ADAPTER_PROPOSAL_COLD_REPLAY_VERIFIED',receipt_id:expected.receipt.receipt_id,
  externalized_entries:expected.ledger.entries.length,adapted_envelope_signatures:0,
  source_mutations:0,authority:'NONE',disposition:'HOLD_REISSUE_REQUIRED'};
}