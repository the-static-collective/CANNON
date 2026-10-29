#!/usr/bin/env node
// INSPAND-003. A local registry is not permission. Execution is deliberately
// delegated to the separately source-verified original INSPAND runner.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync,realpathSync,existsSync,lstatSync,mkdtempSync,mkdirSync,renameSync,rmSync} from 'node:fs';
import {join,resolve,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(import.meta.dirname,'..');
const REG=join(ROOT,'registry/reflex-library-v1.json');
const sha=v=>createHash('sha256').update(v).digest('hex');
const pretty=x=>JSON.stringify(x,null,2)+'\n';
function must(ok,reason){if(!ok)throw Error('HOLD_REFLEX_LIBRARY_'+reason)}
const fixedRoutes=new Set(['film-press-synthetic-selection/v1','film-press-plan-shaped/v1']);
const fixedRunner='scripts/inspand-reflex.mjs';
export function readCatalog(bytes=readFileSync(REG)){
 const catalog=JSON.parse(bytes.toString('utf8'));
 must(catalog.schema==='cannon.reflex-library/v1'&&catalog.origin==='the-static-collective/CANNON'&&catalog.authority==='EXPERIMENT_HOLD','CATALOG_ID');
 must(Array.isArray(catalog.capabilities)&&catalog.capabilities.length===2,'CAPABILITY_SET');
 must(new Set(catalog.capabilities.map(x=>x.id)).size===2,'CAPABILITY_DUPLICATE');
 must(catalog.capabilities.every(x=>fixedRoutes.has(x.id)&&x.runner===fixedRunner&&x.owner==='CANNON'
  &&x.status==='SOURCE_NATIVE_REPLAYED'&&x.risk==='SYNTHETIC_ONLY'&&x.gates?.buildAuthorization==='SYNTHETIC_TEST_ONLY'
  &&x.gates?.publish===false&&x.gates?.physical===false&&x.gates?.humanKeep===false
  &&x.cost?.timeSavedSeconds===null&&x.cost?.computeExpenseUsd===null
  &&x.input?.requiredChoice===true&&x.output?.type==='cannon.inspand-receipt/v1'
  &&x.discover?.recommendation==='TEST_FIXTURE_ONLY','CAPABILITY_CONTRACT');
 must(catalog.policies?.discoveryIsApproval===false&&catalog.policies?.selectionIsExecution===false
 &&catalog.policies?.executionIsPublication===false&&catalog.policies?.allOutputsHeld===true,'POLICY');
 const expected={'film-press-synthetic-selection/v1':false,'film-press-plan-shaped/v1':true};
 must(catalog.capabilities.every(x=>x.output.planContentAffectsNativePixels===expected[x.id]),'PIXEL_CLAIM');
 return {catalog,digest:sha(bytes)};
}
export function discover(catalog,need){
 must(typeof need==='string'&&need.length>0&&need.length<=280,'NEED_TEXT');
 const tokens=[...new Set(need.toLowerCase().match(/[a-z0-9]+/g)||[])];
 return {
  schema:'cannon.reflex-discovery/v1',question:need,
  interpretation:'LITERAL_TOKEN_MATCH_NOT_MODEL_OR_PROOF',
  authority:'NONE',automaticallySelected:false,
  candidates:catalog.capabilities.map(x=>{
   const matched=x.discover.terms.filter(t=>tokens.includes(t));
   return {capabilityId:x.id,title:x.title,matchedTerms:matched,matchCount:matched.length,
    status:x.status,risk:x.risk,unmetGate:'EXPLICIT_OPERATOR_CHOICE_AND_LOCAL_SYNTHETIC_AUTHORIZATION',
    measuredTimeSavedSeconds:null};
  }).filter(x=>x.matchCount).sort((a,b)=>b.matchCount-a.matchCount||a.capabilityId.localeCompare(b.capabilityId))
 };
}
export function choose(catalog,id){
 must(typeof id==='string'&&fixedRoutes.has(id),'UNSUPPORTED_CAPABILITY');
 const row=catalog.capabilities.find(x=>x.id===id);
 must(row&&row.runner===fixedRunner,'MISSING_CAPABILITY');
 return row;
}
function parse(args){
 const [mode,...tail]=args;
 must(['list','discover','build','verify'].includes(mode)&&tail.length%2===0,'USAGE');
 const opts={};
 for(let i=0;i<tail.length;i+=2) {
  const key=tail[i],value=tail[i+1];
  must(['--need','--capability','--plan','--planz','--roots','--out','--authorize'].includes(key)
   &&!Object.hasOwn(opts,key)&&value,'BAD_FLAG');
  opts[key]=value;
 }
 if(mode==='list')must(Object.keys(opts).length===0,'LIST_IS_READ_ONLY');
 if(mode==='discover')must(Object.keys(opts).length===1&&opts['--need'],'DISCOVER_IS_READ_ONLY');
 if(['build','verify'].includes(mode)){
  for(const p of ['--capability','--plan','--planz','--roots','--out'])must(opts[p],'MISSING_'+p);
  must(mode==='build'?opts['--authorize']==='SYNTHETIC_TEST_ONLY':!opts['--authorize'],'NO_PERMISSION');
  must(!opts['--need'],'EXECUTION_USES_EXPLICIT_CHOICE_NOT_DISCOVERY');
 }
 return {mode,opts};
}
function rootPath(s){const abs=resolve(s);must(existsSync(abs)&&lstatSync(abs).isDirectory()&&!lstatSync(abs).isSymbolicLink(),'ROOT_TYPE');return realpathSync(abs)}
function selectedCatalog(catalog,row,digest,plan){
 const chosen={schema:'cannon.reflex-choice/v1',librarySha256:digest,capabilityId:row.id,
  planId:plan,owner:'CANNON',mode:'LOCAL_SYNTHETIC_OPERATOR_CHOICE',
  humanKeep:false,publication:false,receiverAdmission:false};
 const capability={...row,registrySha256:digest,selectionSha256:sha(pretty(chosen))};
 return {chosen,capability};
}
export function makeWrapper(catalog,digest,row,plan,native){
 must(native.schema==='cannon.inspand-receipt/v1'&&native.status==='COLD_REPLAYABLE_HOLD'
  &&native.actualAudio===false&&native.actualPublishing===false&&native.actualHumanAcceptance===false
  &&native.realWorldActions===0,'NATIVE_RECEIPT_AUTHORITY');
 const {chosen,capability}=selectedCatalog(catalog,row,digest,plan);
 const core={schema:'cannon.reflex-memory/v1',status:'SOURCE_VERIFIED_EXECUTION_HELD',
  registrySha256:digest,choiceSha256:sha(pretty(chosen)),capabilitySha256:sha(pretty(capability)),
  nativeReceiptSha256:sha(pretty(native)),nativeReceiptId:native.receiptSha256,
  reusableRecipe:{capabilityId:row.id,planId:plan,sourcePlan:row.sourcePlan,
    ownerRunner:row.runner,requiresExplicitNewAuthorization:true},
  observedOutputs:{nativeSilentVideoSha256:native.nativeSilentVideoSha256,
    nativeToasterFamilySha256:native.nativeToasterFamilyFileSha256},
  humanTimeSavedSeconds:null,realWorldWitnesses:0,publication:false,adoption:false};
 const memory={...core,memorySha256:sha(pretty(core))};
 return {'library-choice.json':chosen,'library-capability.json':capability,'library-memory.json':memory};
}
function execute(mode,opts,catalog,digest){
 const capability=choose(catalog,opts['--capability']);
 must(/^plan-[a-f0-9]{24}$/.test(opts['--plan']),'PLAN_ID');
 const planZ=rootPath(opts['--planz']),roots=resolve(opts['--roots']);
 must(existsSync(roots)&&lstatSync(roots).isFile()&&!lstatSync(roots).isSymbolicLink(),'ROOT_MAP');
 const out=resolve(opts['--out']),parent=rootPath(dirname(out));
 must(out===join(parent,basename(out)),'OUTPUT_PATH');
 must(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()&&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const tmp=mkdtempSync(join(parent,'.reflex-library-'));
 try {
  const target=mode==='build'?join(tmp,'packet'):out;
  if(mode==='build')mkdirSync(target);
  const sub=join(target,'native');
  const argv=[join(ROOT,fixedRunner),mode,'--planz',planZ,
   '--plan',opts['--plan'],'--roots',roots,'--out',sub,'--route',capability.id];
  if(mode==='build')argv.push('--authorize','SYNTHETIC_TEST_ONLY');
  const result=JSON.parse(execFileSync(process.execPath,argv,{encoding:'utf8',
   timeout:300000,maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']}));
  must(result.planId===opts['--plan']&&result.realHumanApprovals===0,'NATIVE_RESULT');
  const native=JSON.parse(readFileSync(join(sub,'receipt.json'),'utf8'));
  must(native.nativeSilentVideoSha256===JSON.parse(readFileSync(join(sub,'native/receipt.json'))).files['owners/blender-silent-study.mp4'],'NATIVE_VIDEO_TRACE');
  const files=makeWrapper(catalog,digest,capability,opts['--plan'],native);
  if(mode==='verify')must(readdirSync(target).sort().join(',')===
   ['library-capability.json','library-choice.json','library-memory.json','native'].sort().join(','),'EXTRA_WRAPPER_FILES');
  for(const [name,value] of Object.entries(files)){
   if(mode==='build')writeFileSync(join(target,name),pretty(value),{flag:'wx'});
   else must(readFileSync(join(target,name),'utf8')===pretty(value),'TAMPER_'+name);
  }
  if(mode==='build')renameSync(target,out);
  return {status:mode==='build'?'REUSABLE_SYNTHETIC_CAPABILITY_HELD':'REFLEX_COLD_REPLAY_VERIFIED',
   capabilityId:capability.id,planId:opts['--plan'],memorySha256:files['library-memory.json'].memorySha256,
   videoSha256:native.nativeSilentVideoSha256,authority:'LOCAL_SYNTHETIC_ONLY',
   reuseRequiresNewChoice:true,humanTimeSavedSeconds:null};
 }finally{rmSync(tmp,{recursive:true,force:true})}
}
export function run(args){
 const {mode,opts}=parse(args),{catalog,digest}=readCatalog();
 if(mode==='list')return {schema:'cannon.reflex-list/v1',registrySha256:digest,
  authority:'NONE',capabilities:catalog.capabilities.map(x=>({id:x.id,title:x.title,status:x.status,
   input:x.input,output:x.output,gates:x.gates,cost:x.cost}))};
 if(mode==='discover')return {...discover(catalog,opts['--need']),registrySha256:digest};
 return execute(mode,opts,catalog,digest);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(pretty(run(process.argv.slice(2))))}
 catch(e){console.error(String(e.message||e).slice(0,1800));process.exitCode=2}
}
