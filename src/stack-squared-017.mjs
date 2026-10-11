/** STACK² 017: source-pinned local composition laboratory.
 * The original programs are NEVER imported or executed here. Operators below
 * are CANNON-owned synthetic adapters, not assertions of donor compatibility.
 */
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {inspect,validate as validateLoadout} from './branch-loadout.mjs';

export const PLAN_SCHEMA='cannon.stack-squared-plan/v0';
export const RECEIPT_SCHEMA='cannon.stack-squared-receipt/v0';
const SYN='cannon.stack2.synthetic/v0';
const WRAP='cannon.stack2.wrapped/v0';
const ADDR='cannon.stack2.addressed/v0';
const fail=(ok,code)=>{if(!ok)throw Error(code);};
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const fields=(v,keys)=>obj(v)&&Object.keys(v).sort().join('|')===keys.slice().sort().join('|');
const canonical=v=>{
  if(v===null||typeof v==='string'||typeof v==='boolean')return JSON.stringify(v);
  if(typeof v==='number'){fail(Number.isSafeInteger(v),'UNSAFE_INTEGER');return JSON.stringify(v);}
  if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
  fail(obj(v),'NON_CANONICAL_VALUE');
  return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
};
const sha=v=>'sha256:'+createHash('sha256').update(canonical(v)).digest('hex');
export function validate(plan,loadout){
  validateLoadout(loadout);
  fail(fields(plan,['schema','goal','mode','cards','link','input']),'INVALID_PLAN_FIELDS');
  fail(plan.schema===PLAN_SCHEMA&&plan.mode==='LOCAL_FIXTURE_ONLY'&&
    typeof plan.goal==='string'&&plan.goal.trim().length>0&&plan.goal.length<=240,'INVALID_PLAN_MODE_OR_GOAL');
  fail(Array.isArray(plan.cards)&&plan.cards.length===2&&loadout.entries.length===2,'EXACTLY_TWO_STACK_CARDS_REQUIRED');
  const first=plan.cards[0],second=plan.cards[1];
  for(const card of plan.cards){
    fail(fields(card,['source_id','local_operator','consumes','produces']),'INVALID_STACK_CARD_FIELDS');
    fail(typeof card.source_id==='string'&&
      loadout.entries.some(e=>e.id===card.source_id),'UNSUPPORTED_SOURCE_ID');
  }
  fail(first.source_id!==second.source_id&&
    first.local_operator==='WRAP_SYNTHETIC'&&first.consumes===SYN&&first.produces===WRAP&&
    second.local_operator==='ADDRESS_WRAPPED'&&second.consumes===WRAP&&second.produces===ADDR,
    'INCOMPATIBLE_LOCAL_OPERATORS');
  fail(fields(plan.link,['from','to'])&&
    plan.link.from===first.source_id+':out'&&plan.link.to===second.source_id+':in',
    'UNBOUND_OR_INCOMPATIBLE_LINK');
  fail(fields(plan.input,['schema','text','iteration'])&&plan.input.schema===SYN&&
    typeof plan.input.text==='string'&&plan.input.text.length>0&&plan.input.text.length<=500&&
    !plan.input.text.includes('\0')&&Number.isSafeInteger(plan.input.iteration)&&
    plan.input.iteration>=0&&plan.input.iteration<=9999,'INVALID_SYNTHETIC_INPUT');
  return plan;
}
export function compose(plan,loadout,roots){
  validate(plan,loadout);
  // Original CANNON 008 reads and verifies exact local Git commit/tree/blob objects.
  const sourceReport=inspect(loadout,roots);
  const byId=new Map(sourceReport.entries.map(e=>[e.id,e]));
  const a=byId.get(plan.cards[0].source_id),b=byId.get(plan.cards[1].source_id);
  fail(a&&b&&a.source_status==='ORIGINAL_GIT_OBJECT_VERIFIED_LOCAL'&&
    b.source_status==='ORIGINAL_GIT_OBJECT_VERIFIED_LOCAL','SOURCE_NOT_VERIFIED');
  // The only executed operations are these two bounded, local CANNON fixtures.
  const first={schema:WRAP,card_id:a.id,original_source_sha256:a.source.blob_sha256,
    input_sha256:sha(plan.input),payload:plan.input};
  const second={schema:ADDR,card_id:b.id,original_source_sha256:b.source.blob_sha256,
    parent_sha256:sha(first),content_address:sha(first),text_codepoints:Array.from(plan.input.text).length};
  const body={schema:RECEIPT_SCHEMA,goal:plan.goal,plan_sha256:sha(plan),
    source_loadout_report_sha256:sourceReport.reportSha256,
    original_git_witnesses:[a.source,b.source],
    typed_link:{...plan.link,type:WRAP},
    local_operator_trace:[
      {card_id:a.id,operation:'WRAP_SYNTHETIC',input_sha256:sha(plan.input),output_sha256:sha(first)},
      {card_id:b.id,operation:'ADDRESS_WRAPPED',input_sha256:sha(first),output_sha256:sha(second)}
    ],
    result:second,status:'LOCAL_SYNTHETIC_COMPOSITION_ONLY',
    donor_programs_executed:0,executed_native_cannon_008_source_verifier:true,
    donor_runtime_compatibility_proven:false,external_identity_authenticated:false,
    signatures_created:0,owner_admitted:false,execution_authorized:false,
    real_world_effects:0,git_mutations:0,deployments:0,
    non_claims:['Source witnesses are real local Git checks, not a GitHub remote attestation',
      'Fixture adapters are CANNON-owned; no donor program ran',
      'Typed fixture link is not real donor API compatibility',
      'Content address is not a signature, permission, owner claim or admission',
      'Substitution changes provenance; it does not transfer execution authority']};
  return {...body,receipt_id:sha(body)};
}
export function emit(plan,loadout,roots,outDir){
  // Validate and execute in memory before touching output location.
  const receipt=compose(plan,loadout,roots);
  fail(!existsSync(outDir),'CREATE_ONLY_OUTPUT_EXISTS');
  mkdirSync(outDir,{recursive:false,mode:0o700});
  writeFileSync(join(outDir,'stack-squared-receipt.json'),JSON.stringify(receipt,null,2)+'\n',
    {flag:'wx',mode:0o600});
  return receipt;
}
export function coldVerify(plan,loadout,roots,outDir){
  const expected=compose(plan,loadout,roots);
  const actual=JSON.parse(readFileSync(join(outDir,'stack-squared-receipt.json'),'utf8'));
  fail(canonical(actual)===canonical(expected),'COLD_REPLAY_MISMATCH');
  return {status:'COLD_REPLAY_VERIFIED',receipt_id:expected.receipt_id,
    verified_git_sources:expected.original_git_witnesses.length,
    local_fixture_operations:2,donor_programs_executed:0,owner_admitted:false};
}
