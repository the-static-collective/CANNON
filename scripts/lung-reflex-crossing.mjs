#!/usr/bin/env node
// INSPAND-005: source-verified Iron Lung nine-stage model proposals are read
// as UNTRUSTED exploratory material and crossed into native CANNON composer.
// Nothing in a model output can select a route or mint human authorization.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,renameSync,rmSync,existsSync,realpathSync,lstatSync,readdirSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readCatalog,discover} from './reflex-library.mjs';
import {validateCompositionRegistry} from './reflex-composer.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const LOCK=JSON.parse(readFileSync(join(ROOT,'registry/iron-lung-source-lock-v1.json'),'utf8'));
const RECIPE='plan-proof-to-pixels-and-print/v1';
const sha=x=>createHash('sha256').update(x).digest('hex');
const fmt=x=>JSON.stringify(x,null,2)+'\n';
function hold(ok,tag){if(!ok)throw Error('HOLD_LUNG_REFLEX_'+tag);}
function exec(program,args,options={}){
 try{return execFileSync(program,args,{encoding:'utf8',timeout:480000,maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe'],...options});}
 catch(e){throw Error('HOLD_LUNG_REFLEX_CHILD_'+String(e.stderr||e.message).slice(0,650));}
}
function git(root,...args){return exec('git',['--no-replace-objects','-C',root,...args]).trim();}
function rootDir(path){
 const abs=resolve(path);hold(existsSync(abs)&&lstatSync(abs).isDirectory()&&!lstatSync(abs).isSymbolicLink(),'ROOT_DIRECTORY');
 return realpathSync(abs);
}
export function inspectOriginalLung(path){
 hold(LOCK?.schema==='cannon.lung-source-lock/v1'&&LOCK.repository==='the-static-collective/iron-lung'
  &&LOCK.status==='SOURCE_PIN_ONLY_NO_HUMAN_AUTHORITY'
  &&LOCK.flan.model==='google/flan-t5-small','LOCK_SCHEMA');
 const dir=rootDir(path);
 hold(git(dir,'rev-parse','HEAD')===LOCK.commit,'LUNG_COMMIT');
 hold(git(dir,'remote','get-url','origin').replace(/\.git$/,'')==='https://github.com/'+LOCK.repository,'LUNG_ORIGIN');
 const changes=git(dir,'status','--porcelain','--untracked-files=normal').split('\n').filter(Boolean);
 hold(changes.every(x=>x==='?? node_modules/'),'LUNG_DIRTY');
 for(const [file,object] of Object.entries(LOCK.files)){
  hold(git(dir,'rev-parse','HEAD:'+file)===object,'LUNG_BLOB_'+file);
  // Binary Git blob and live working copy must match the reviewed source.
  const live=readFileSync(join(dir,file));
  const actual=createHash('sha1').update('blob '+live.length+'\0').update(live).digest('hex');
  hold(actual===object&&realpathSync(join(dir,file))===join(dir,file),'LUNG_WORKTREE_'+file);
 }
 return {schema:'cannon.lung-owner-observation/v1',repository:LOCK.repository,commit:LOCK.commit,
  lockedFiles:Object.keys(LOCK.files),flan:{...LOCK.flan},authority:'NONE'};
}
const phases=['SUBSTANCE','LINEAGE','AUTHORITY_REQUIREMENTS'];
const addr=[
 {aperture:'GAP',triad:'IDEA',braid:'substance'},
 {aperture:'CONTEXT',triad:'RELATION',braid:'lineage'},
 {aperture:'GAP',triad:'IDEA',braid:'authority'}
];
export function inspectLungField(field){
 hold(field?.schema==='iron-lung/triple-transfer-field/v1'
  &&field.status==='LUNG_POSSIBILITY_ONLY'&&field.authority==='NONE'
  &&field.admittedCandidateId===null&&field.descendantBraidId===null
  &&field.humanTimeSavedSeconds===null,'NOT_A_HELD_FIELD');
 const {fieldSha256,...body}=field;
 hold(fieldSha256===sha(JSON.stringify(body)),'FIELD_HASH');
 hold(field.depth===3&&field.steps?.length===9&&field.parentLinks?.length===8,'NINE_NESTED_STEPS');
 hold(typeof field.source?.rawTextSha256==='string'&&field.source.gapIds?.length>=2
  &&field.source.authorityStrandSha256&&field.source.braidSha256,'SOURCE_LINEAGE');
 hold(field.provider?.kind==='deterministic-fixture'
  ||(field.provider?.kind==='flan-t5'&&field.provider.model===LOCK.flan.model
     &&field.provider.revision===LOCK.flan.revision),'MODEL_IDENTITY');
 for(let i=0;i<9;i++){
  const s=field.steps[i],{id,...base}=s;
  hold(id==='breath-'+sha(JSON.stringify(base)).slice(0,24),'STEP_DIGEST');
  hold(s.breath===Math.floor(i/3)+1&&s.phase===phases[i%3]
   &&JSON.stringify(s.address)===JSON.stringify(addr[i%3]),'STAGE_ORDER');
  hold(s.parentStepId===(i?field.steps[i-1].id:null)
   &&s.sourceSha256===field.source.rawTextSha256,'SOURCE_CHAIN');
  hold(s.candidateSha256===sha(s.candidateText)&&s.status==='PROPOSAL_UNVERIFIED'
   &&s.actualAuthority==='NONE'&&s.humanKeep===false
   &&s.evidenceMinted===false&&s.lineageRewritten===false&&s.heartBeat===false,
   'PROPOSAL_ONLY');
  hold(JSON.stringify(s.provider)===JSON.stringify(field.provider),'PROVIDER_CHAIN');
 }
 hold(field.parentLinks.every((edge,i)=>edge.from===field.steps[i].id
  &&edge.to===field.steps[i+1].id),'LINK_RECORDS');
 return true;
}
export function derivePressure(field){
 inspectLungField(field);
 const {catalog,digest}=readCatalog();
 const lines=field.steps.map(step=>{
  // Each one of the nine actual owner-originated strings pressures the
  // literal, known CANNON registry; no generated text becomes an executable.
  const found=discover(catalog,step.candidateText.slice(0,280));
  return {stepId:step.id,breath:step.breath,phase:step.phase,
   candidateSha256:step.candidateSha256,
   matches:found.candidates.map(x=>({id:x.capabilityId,matchedTerms:x.matchedTerms,
    count:x.matchCount})),status:'SPECULATIVE_ONLY'};
 });
 const core={schema:'cannon.lung-reflex-pressure/v1',fieldSha256:field.fieldSha256,
  catalogSha256:digest,interpretation:'LITERAL_MATCH_EXPLORATION_ONLY',
  modelCanSelectRecipe:false,modelCanApprove:false,
  reviewItems:lines,matchedItems:lines.filter(x=>x.matches.length>0).length,
  modelTextAffectsNativeMedia:false,authority:'NONE'};
 return {...core,pressureSha256:sha(fmt(core))};
}
function ownerCli(dir,args){
 return exec('npm',['run','--silent','triple-transfer','--',...args],{cwd:dir});
}
function nativeComposer(mode,opts,dir){
 const argv=[join(ROOT,'scripts/reflex-composer.mjs'),mode,
  '--recipe',RECIPE,'--plan',opts['--plan'],
  '--planz',rootDir(opts['--planz']),'--roots',resolve(opts['--roots']),
  '--out',dir];
 if(mode==='build')argv.push('--authorize','SYNTHETIC_TEST_ONLY');
 const result=JSON.parse(exec(process.execPath,argv,{cwd:ROOT}));
 hold(result.recipeId===RECIPE&&result.stages===2&&result.realWorldActions===0,'COMPOSER_RESULT');
 return result;
}
function options(args){
 const [mode,...tail]=args;
 hold(['inspect','build','verify'].includes(mode)&&tail.length%2===0,'USAGE');
 const o={};
 for(let i=0;i<tail.length;i+=2){
  const flag=tail[i],value=tail[i+1];
  hold(['--lung','--provider','--source','--plan','--planz','--roots','--out','--authorize'].includes(flag)
   &&value&&!Object.hasOwn(o,flag),'OPTION');o[flag]=value;
 }
 hold(o['--lung'],'LUNG_REQUIRED');
 if(mode==='inspect')hold(Object.keys(o).length===1,'INSPECT_READ_ONLY');
 else{
  for(const flag of ['--provider','--source','--plan','--planz','--roots','--out'])hold(o[flag],'MISSING_'+flag);
  hold(['fixture','flan'].includes(o['--provider']),'PROVIDER_CHOICE');
  hold(/^plan-[a-f0-9]{24}$/.test(o['--plan']),'PLAN_ID');
  hold(mode==='build'?o['--authorize']==='SYNTHETIC_TEST_ONLY':!o['--authorize'],'EXPLICIT_GRANT');
 }
 return {mode,o};
}
function composedReceipt(source,pressure,native,plan){
 const core={schema:'cannon.lung-reflex-execution/v1',
  status:'SOURCE_OWNER_MODEL_PROPOSALS_PLUS_NATIVE_EXECUTION_HELD',
  lungOwnerCommit:source.commit,modelSource:source.flan,
  lungFieldSha256:pressure.fieldSha256,pressureSha256:pressure.pressureSha256,
  planId:plan,selectedNativeRecipe:RECIPE,selectionBasis:'OPERATOR_EXPLICIT_PREAUTHORIZED_TEST',
  nativeReceiptSha256:native.receiptSha256,
  upstreamModelSelectedPlan:false,upstreamModelChangedNativePixels:false,
  actualPublishing:false,independentHumanAcceptance:false,
  measuredTimeSavedSeconds:null,realWorldActions:0,authority:'LOCAL_SYNTHETIC_ONLY'};
 return {...core,receiptSha256:sha(fmt(core))};
}
export function run(args){
 const {mode,o}=options(args),lung=rootDir(o['--lung']),observed=inspectOriginalLung(lung);
 if(mode==='inspect')return observed;
 const recipe=validateCompositionRegistry(JSON.parse(readFileSync(join(ROOT,'registry/reflex-compositions-v1.json'))));
 hold(recipe.id===RECIPE,'UNMATCHED_COMPOSER');
 const out=resolve(o['--out']),parent=rootDir(dirname(out));
 hold(out===join(parent,basename(out)),'PATH');
 hold(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const tmp=mkdtempSync(join(parent,'.lung-reflex-'));
 try{
  const target=mode==='build'?join(tmp,'packet'):out;
  if(mode==='build')mkdirSync(target);
  const inputFile=resolve(o['--source']);
  hold(existsSync(inputFile)&&lstatSync(inputFile).isFile()&&!lstatSync(inputFile).isSymbolicLink(),'INPUT_FILE');
  const fieldText=ownerCli(lung,['--provider',o['--provider'],'--source',inputFile,'--depth','3']);
  const field=JSON.parse(fieldText);inspectLungField(field);
  // The original owner independently validates the new field packet.
  const generated=join(tmp,'regenerated.json');writeFileSync(generated,fmt(field),{flag:'wx'});
  const originalCheck=JSON.parse(ownerCli(lung,['--verify',generated]));
  hold(originalCheck.status==='TRIPLE_COLD_PACKET_VERIFIED'
   &&originalCheck.fieldSha256===field.fieldSha256&&originalCheck.steps===9,'OWNER_REJECTED');
  const pressure=derivePressure(field);
  const native=nativeComposer(mode,o,join(target,'native'));
  const receipt=composedReceipt(observed,pressure,native,o['--plan']);
  const files={'lung-field.json':field,'capability-pressure.json':pressure,
   'source-observation.json':observed,'receipt.json':receipt};
  if(mode==='verify')hold(readdirSync(target).sort().join('|')===
   ['lung-field.json','capability-pressure.json','source-observation.json','receipt.json','native'].sort().join('|'),
   'UNEXPECTED_FILES');
  for(const [filename,payload] of Object.entries(files)){
   if(mode==='build')writeFileSync(join(target,filename),fmt(payload),{flag:'wx'});
   else hold(readFileSync(join(target,filename),'utf8')===fmt(payload),'REPLAY_TAMPER_'+filename);
  }
  if(mode==='build')renameSync(target,out);
  return {status:mode==='build'?'LUNG_TO_REFLEX_EXECUTED_HOLD':'LUNG_TO_REFLEX_COLD_REPLAY',
   realIronLungProvider:field.provider.kind,actualModelSteps:field.steps.length,
   modelPressureMatches:pressure.matchedItems,planId:o['--plan'],
   receiptSha256:receipt.receiptSha256,nativeReceiptSha256:native.receiptSha256,
   independentHumanGrants:0};
 }finally{rmSync(tmp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(fmt(run(process.argv.slice(2))))}catch(e){console.error(String(e.message||e).slice(0,1700));process.exitCode=2}
}
