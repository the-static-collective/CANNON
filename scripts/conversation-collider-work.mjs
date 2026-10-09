#!/usr/bin/env node
/**
 * CANNON CONVERSATION COLLIDER 003 — source-pinned useful-work seams.
 * Read-only original Git evidence. No execution of the source Python,
 * no scanning of local devices, no stage, printer or network commands.
 */
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readSource} from '../src/present-use.mjs';
export const PLAN_SCHEMA='cannon.conversation-collider-work-plan/v1';
export const REPORT_SCHEMA='cannon.conversation-collider-work-report/v1';
const ROLES=['GHOT_PANTRY','GHOT_BUILTINS','LIVE_PACKET','PRINTER_TECH_REGISTRY'];
const ROLES_REPOSITORIES={
 GHOT_PANTRY:'the-static-collective/GHoT',
 GHOT_BUILTINS:'the-static-collective/GHoT',
 LIVE_PACKET:'the-static-collective/static-live',
 PRINTER_TECH_REGISTRY:'the-static-collective/static-os'
};
const PATHS={
 GHOT_PANTRY:'ghot/executor_pantry.py',
 GHOT_BUILTINS:'ghot/reference_node.py',
 LIVE_PACKET:'fixtures/live-001/song.json',
 PRINTER_TECH_REGISTRY:'fixtures/printer-field-012/technology-registry.json'
};
const SHA=/^[0-9a-f]{40}$/;
const CAP=/^[a-z][a-z0-9._-]{2,119}$/;
const fail=(v,msg)=>{if(!v)throw Error(msg);};
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const fields=(v,expected)=>obj(v)&&Object.keys(v).sort().join('|')===expected.slice().sort().join('|');
const canonical=v=>{
 if(v===null||typeof v==='boolean'||typeof v==='string')return JSON.stringify(v);
 if(typeof v==='number'){fail(Number.isSafeInteger(v),'NON_INTEGER_JSON');return JSON.stringify(v);}
 if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
 fail(obj(v),'INVALID_JSON');
 return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
};
const digest=v=>'sha256:'+createHash('sha256').update(canonical(v)).digest('hex');
const sorted=a=>a.slice().sort((a,b)=>a.localeCompare(b,'en'));
const distinct=(v,why)=>{fail(new Set(v).size===v.length,why);return sorted(v);};
function strings(list,pattern,where,max=128){
 fail(Array.isArray(list)&&list.length<=max&&list.every(x=>typeof x==='string'&&pattern.test(x)),where);
 return distinct(list,where+'_DUPLICATE');
}
export function validatePlan(plan){
 fail(fields(plan,['schema','sources'])&&plan.schema===PLAN_SCHEMA,'INVALID_PLAN');
 fail(Array.isArray(plan.sources)&&plan.sources.length===ROLES.length,'EXACT_FOUR_SOURCES_REQUIRED');
 const roles=[];
 for(const s of plan.sources){
  fail(fields(s,['role','repository','commit','path']),'INVALID_SOURCE_FIELDS');
  fail(ROLES.includes(s.role),'INVALID_SOURCE_ROLE');roles.push(s.role);
  fail(s.repository===ROLES_REPOSITORIES[s.role]&&s.path===PATHS[s.role]&&
    typeof s.commit==='string'&&SHA.test(s.commit),'SOURCE_PIN_OR_REPOSITORY_INVALID');
 }
 distinct(roles,'DUPLICATE_ROLES');
 return plan;
}
function pythonLiteralList(s,where){
 const v=s.trim();
 fail(/^"(?:[a-z][a-z0-9._-]{2,119})"(?:\s*,\s*"(?:[a-z][a-z0-9._-]{2,119})")*\s*,?$/.test(v),where+'_UNSUPPORTED_PYTHON_SYNTAX');
 const names=[...v.matchAll(/"([a-z][a-z0-9._-]{2,119})"/g)].map(x=>x[1]);
 return strings(names,CAP,where);
}
function extractPantry(src){
 const region=src.match(/EXECUTORS:\s*dict[^\n]*=\s*\{([\s\S]*?)\n\}\s*\n/);
 fail(region,'GHOT_EXECUTOR_REGISTRY_MISSING');
 const found=[...region[1].matchAll(/"capabilities":\s*\[([^\]\r\n]*)\]/g)].map(x=>pythonLiteralList(x[1],'EXECUTOR_CAPABILITIES'));
 fail(found.length>=2&&found.length<=32,'GHOT_EXECUTOR_SHAPE_UNKNOWN');
 const caps=found.flat();
 fail(caps.includes('media.probe'),'GHOT_MEDIA_PROBE_NOT_DECLARED');
 return strings(caps,CAP,'PANTRY_CAPABILITIES');
}
function extractBuiltins(src){
 const area=src.match(/def _base_offers\([\s\S]*?(?=\ndef body_identity\()/);
 fail(area&&area[0].includes('"kind": "ghot.offer"')&&area[0].includes('"available": True'),'GHOT_BUILTIN_SHAPE_UNKNOWN');
 const body=area[0].match(/for capability in \[([^\]]+)\]/);
 fail(body,'GHOT_BUILTIN_LIST_MISSING');
 return pythonLiteralList(body[1],'GHOT_BUILTINS');
}
function extractLive(src){
 const packet=JSON.parse(src);
 fail(obj(packet)&&packet.version==='static-live.performance-packet/v0.1','LIVE_PACKET_VERSION_UNKNOWN');
 const required=strings(packet.requiredCapabilities,CAP,'LIVE_CAPABILITIES');
 fail(required.length>0,'LIVE_REQUIRED_CAPABILITIES_ABSENT');
 fail(Array.isArray(packet.stems)&&packet.stems.length<=64,'LIVE_STEMS_UNSUPPORTED');
 const stems=packet.stems.map(s=>{
  fail(obj(s)&&typeof s.id==='string'&&/^[a-z0-9-]{2,80}$/.test(s.id)&&
    typeof s.path==='string'&&/^[a-zA-Z0-9_./-]{1,180}$/.test(s.path)&&
    !s.path.startsWith('/')&&!s.path.split('/').includes('..')&&
    (s.kind==='always'||s.kind==='fallback'),'INVALID_STEM');
  if(s.kind==='fallback')fail(required.includes(s.coversCapability),'UNDECLARED_FALLBACK_CAPABILITY');
  return {id:s.id,kind:s.kind,path:s.path,capability:s.kind==='fallback'?s.coversCapability:null};
 });
 distinct(stems.map(s=>s.id),'DUPLICATE_STEM_ID');
 return {requiredCapabilities:required,stems:stems.sort((a,b)=>a.id.localeCompare(b.id,'en')),
  requiredIsHumanStageContext:true};
}
function extractPrinter(src){
 const registry=JSON.parse(src);
 fail(obj(registry)&&registry.schema==='static-os.print-technology-registry/v0'&&
   registry.purpose==='OPEN_WORLD_MACHINE_DISCOVERY_NOT_HARDWARE_AUTHORITY'&&
   registry.machine_execution_enabled===false&&registry.supported_printer_count_claim===0,
   'PRINTER_REGISTRY_NOT_HARDWARE_HELD');
 fail(Array.isArray(registry.families)&&registry.families.length>0&&registry.families.length<=30,'PRINTER_FAMILIES_INVALID');
 const families=registry.families.map(p=>{
  fail(obj(p)&&typeof p.id==='string'&&/^[A-Z_]{2,40}$/.test(p.id)&&
    typeof p.required_bridge==='string'&&/^[a-z0-9-]{5,140}$/.test(p.required_bridge)&&
    p.physical_execution_verified===false &&
    (p.reference_adapter===null||p.reference_adapter==='VIRTUAL_PRUSASLICER_011'),
    'PRINTER_FAMILY_CLAIMS_PHYSICAL_READINESS');
  return {family:p.id,required_bridge:p.required_bridge,
    reference_adapter:p.reference_adapter,physical_execution_verified:false,
    status:'HOLD_PHYSICAL_PROFILE_AND_OPERATOR_PERMISSION'};
 });
 distinct(families.map(f=>f.family),'DUPLICATE_PRINT_FAMILY');
 return families.sort((a,b)=>a.family.localeCompare(b.family,'en'));
}
function extract(role,content){
 if(role==='GHOT_PANTRY')return extractPantry(content);
 if(role==='GHOT_BUILTINS')return extractBuiltins(content);
 if(role==='LIVE_PACKET')return extractLive(content);
 if(role==='PRINTER_TECH_REGISTRY')return extractPrinter(content);
 throw Error('UNKNOWN_SOURCE_ROLE');
}
function inspectSource(s,roots){
 const original={...s};
 try{
  const {witness,content}=readSource({
   id:s.role.toLowerCase().replaceAll('_','-'),repository:s.repository,commit:s.commit,
   path:s.path,media_type:s.path.endsWith('.json')?'application/json':'text/x-python',tags:[]
  },roots);
  return { ...original,status:'GIT_OBJECT_VERIFIED',witness,value:extract(s.role,content)};
 }catch(e){return {...original,status:'HOLD',reason:String(e.message).slice(0,150)};}
}
export function evaluate(plan,roots){
 validatePlan(plan);fail(obj(roots),'INVALID_ROOTS');
 const observed=plan.sources.map(s=>inspectSource(s,roots)).sort((a,b)=>a.role.localeCompare(b.role,'en'));
 const byRole=Object.fromEntries(observed.map(s=>[s.role,s]));
 const ready=r=>byRole[r].status==='GIT_OBJECT_VERIFIED';
 const pantry=ready('GHOT_PANTRY')?byRole.GHOT_PANTRY.value:[];
 const builtin=ready('GHOT_BUILTINS')?byRole.GHOT_BUILTINS.value:[];
 const declaredCapabilities=distinct([...new Set([...pantry,...builtin])],'GHOT_CAPABILITIES');
 const live=ready('LIVE_PACKET')?byRole.LIVE_PACKET.value:null;
 const printers=ready('PRINTER_TECH_REGISTRY')?byRole.PRINTER_TECH_REGISTRY.value:null;
 const potentialMediaPaths=live?sorted(live.stems.filter(x=>/\.(wav|aiff|flac|mp3|ogg)$/i.test(x.path)).map(x=>x.path)):[];
 const conditionalMediaCandidate=ready('GHOT_PANTRY')&&ready('LIVE_PACKET')&&
   declaredCapabilities.includes('media.probe')&&potentialMediaPaths.length>0
   ?[{producer_role:'GHOT_PANTRY',consumer_role:'LIVE_PACKET',capability:'media.probe',
      proposal:'INSPECT_SOURCE_DECLARED_AUDIO_FILES',
      candidate_assets:potentialMediaPaths,
      disposition:'HOLD_FILE_EXISTENCE_EXECUTOR_POWER_RIGHTS',
      declared_offer_not_live_device:true,
      input_file_bytes_verified:false,executor_available_now:false,
      application_integration_verified:false}]:[];
 const stage=live?live.requiredCapabilities.map(capability=>({
   capability,status:declaredCapabilities.includes(capability)
    ?'HOLD_SEMANTICS_MUST_NOT_ASSUME_HUMAN_PERFORMANCE'
    :'NO_MATCH_HUMAN_STAGE_CAPABILITY',
   is_human_stage_context:true,ghot_is_live_performer:false
 })):[];
 const sourceSummaries=observed.map(({value,...s})=>s);
 const body={
  schema:REPORT_SCHEMA,plan_sha256:digest(plan),
  sources:sourceSummaries,
  ghot_declared_capabilities:declaredCapabilities,
  ghot_offers_status:ready('GHOT_PANTRY')&&ready('GHOT_BUILTINS')?'SOURCE_DECLARED_ONLY_NOT_PROBED_NOW':'INCOMPLETE_SOURCE_HOLD',
  static_live_required_stage_capabilities:stage,
  conditional_media_inspections:conditionalMediaCandidate,
  printer_technology_field:printers,
  physical_printer_count_verified:0,
  physical_printer_execution_authorized:false,
  missing_source_roles:sourceSummaries.filter(s=>s.status==='HOLD').map(s=>s.role),
  decision:'DISCOVERY_ONLY_NO_MACHINE_OR_PERFORMANCE_AUTHORITY',
  source_integrity:'PINNED_LOCAL_GIT_SHA1_OBJECTS_AND_SHA256_BLOB_WITNESSES',
  actual_executor_presence_tested:false,
  actual_media_bytes_tested:false,
  source_owner_identity_authenticated:false,
  sender_or_receiver_rights_verified:false,
  physical_parts_created:0,executions:0,git_mutations:0,
  limitations:[
   'A Python code declaration is not proof any executor is installed or available now.',
   'A live-performance capability belongs to real humans or declared fallback stems, not to a generic compute node.',
   'A stem path in a performance packet is not proof media bytes exist or may be used.',
   'An open-world printer technology registry is not a hardware inventory, machine control interface or granted print right.'
  ]
 };
 return {...body,receipt_sha256:digest(body)};
}
export function coldVerify(plan,roots,expected){
 fail(canonical(evaluate(plan,roots))===canonical(expected),'COLD_SOURCE_REPLAY_MISMATCH');
 return {status:'WORK_COLLIDER_003_COLD_SOURCE_REPLAY_VERIFIED',
  receipt_sha256:expected.receipt_sha256,
  media_candidates:expected.conditional_media_inspections.length,
  authority:'NONE'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  const [cmd,...args]=process.argv.slice(2);
  fail(['scan','verify'].includes(cmd)&&args.length%2===0,'EXPECTED_SCAN_OR_VERIFY');
  const opts={};
  for(let i=0;i<args.length;i+=2){
   fail(['--plan','--roots','--out'].includes(args[i])&&args[i+1]&&!Object.hasOwn(opts,args[i]),'INVALID_ARGUMENTS');
   opts[args[i]]=args[i+1];
  }
  fail(opts['--plan']&&opts['--roots']&&(cmd==='scan'||opts['--out']),'MISSING_ARGUMENTS');
  const read=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
  const plan=read(opts['--plan']),roots=read(opts['--roots']);
  if(cmd==='scan'){
   const r=evaluate(plan,roots);
   if(opts['--out'])writeFileSync(resolve(opts['--out']),JSON.stringify(r,null,2)+'\n',{flag:'wx',mode:0o600});
   console.log(JSON.stringify(r,null,2));
  }else console.log(JSON.stringify(coldVerify(plan,roots,read(opts['--out'])),null,2));
 }catch(e){console.error('HOLD:',String(e.message).slice(0,350));process.exitCode=2;}
}
