#!/usr/bin/env node
// INSPAND-008: real CANNON interface contracts -> original Iron Lung
// 2×2 controlled model study. Never execute model-generated code or grants.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync,mkdirSync,mkdtempSync,rmSync,renameSync,existsSync,lstatSync,realpathSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readCatalog} from './reflex-library.mjs';
import {validateCompositionRegistry} from './reflex-composer.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const LOCK=JSON.parse(readFileSync(join(ROOT,'registry/iron-lung-contract-compiler-source-v1.json'),'utf8'));
const hash=x=>createHash('sha256').update(x).digest('hex');
const pretty=x=>JSON.stringify(x,null,2)+'\n';
function hold(x,why){if(!x)throw Error('HOLD_REAL_COMPASS_'+why);}
function exec(bin,args,cwd){
 try{return execFileSync(bin,args,{cwd,encoding:'utf8',timeout:720000,maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});}
 catch(e){throw Error('HOLD_REAL_COMPASS_ORIGINAL_'+String(e.stderr||e.message).slice(0,700));}
}
function dir(path){
 const abs=resolve(path);
 hold(existsSync(abs)&&lstatSync(abs).isDirectory()&&!lstatSync(abs).isSymbolicLink(),'DIR');
 return realpathSync(abs);
}
function git(cwd,...args){return exec('git',['--no-replace-objects','-C',cwd,...args],ROOT).trim();}
export function observeOriginal(owner){
 const folder=dir(owner);
 hold(LOCK?.schema==='cannon.contract-compass-owner-lock/v1'
  &&LOCK.owner==='the-static-collective/iron-lung'&&LOCK.humanAuthority===false
  &&LOCK.noAutoPromotion===true,'OWNER_IDENTITY');
 hold(git(folder,'rev-parse','HEAD')===LOCK.commit,'OWNER_COMMIT');
 hold(git(folder,'remote','get-url','origin').replace(/\.git$/,'')==='https://github.com/'+LOCK.owner,'OWNER_ORIGIN');
 hold(git(folder,'status','--porcelain','--untracked-files=normal').split('\n')
  .filter(Boolean).every(x=>x==='?? node_modules/'),'DIRTY_OWNER');
 for(const [name,blob] of Object.entries(LOCK.files)){
  hold(git(folder,'rev-parse','HEAD:'+name)===blob,'OWNER_GIT_BLOB_'+name);
  const live=readFileSync(join(folder,name));
  hold(createHash('sha1').update('blob '+live.length+'\0').update(live).digest('hex')===blob
    &&realpathSync(join(folder,name))===join(folder,name),'OWNER_DISK_'+name);
 }
 return {schema:'cannon.source-owner-observation/v1',repo:LOCK.owner,commit:LOCK.commit,
  model:LOCK.model,authority:'NONE'};
}
/** Ground truth comes DIRECTLY from the existing, constrained, original native
 * CANNON Reflex Composer registry + original Reflex Library. It is not guessed,
 * invented by the model, or hand-written into a new "example" file.
 */
export function extractActualContract(){
 const bytes=readFileSync(join(ROOT,'registry/reflex-compositions-v1.json'));
 const recipe=validateCompositionRegistry(JSON.parse(bytes));
 const {catalog,digest}=readCatalog();
 hold(recipe.stages.length===2&&recipe.edges.length===1,'SOURCE_RECIPE_SHAPE');
 const [first,second]=recipe.stages,edge=recipe.edges[0];
 const native1=catalog.capabilities.find(x=>x.id===first.capability);
 const native2=catalog.capabilities.find(x=>x.id===second.capability);
 hold(native1?.status==='SOURCE_NATIVE_REPLAYED'&&native2?.status==='SOURCE_NATIVE_REPLAYED'
   &&native1.input.type===first.inputPort&&native2.input.type===second.inputPort,'SOURCE_CAPABILITIES');
 hold(first.outputPort===edge.outputPort&&second.inputPort===edge.inputPort
  &&edge.from===first.id&&edge.to===second.id&&edge.field==='reusableRecipe.planId'
  &&edge.adapter==='VERIFIED_RECEIPT_PLAN_ID_V1','SOURCE_EDGE');
 const task={schema:'iron-lung/compass-real-contract/v1',
  sourceOwner:'the-static-collective/CANNON',sourceRegistrySha256:hash(bytes),
  sourceRecipeSha256:hash(JSON.stringify(recipe)),recipeId:recipe.id,
  producer:{stage:first.id,capability:first.capability,outputPort:first.outputPort},
  consumer:{stage:second.id,capability:second.capability,inputPort:second.inputPort},
  edge:{adapter:edge.adapter,field:edge.field,outputPort:edge.outputPort,inputPort:edge.inputPort},
  requiredAuthorization:recipe.inputs.operatorDecision,publishAllowed:recipe.constraints.publish,
  evidenceKind:'EXACT_SOURCE_CODE_CONTRACT_ONLY'};
 hold(task.requiredAuthorization==='SYNTHETIC_TEST_ONLY'&&task.publishAllowed===false,'NO_PROMOTION');
 return {task,source:{compositionRegistrySha256:hash(bytes),
  libraryRegistrySha256:digest,sourceRecipe:recipe.id,
  sourceFiles:['registry/reflex-compositions-v1.json','registry/reflex-library-v1.json'],
  sourceOwner:'the-static-collective/CANNON',
  nativeProducerOutputPort:native1.output.type,
  nativeConsumerOutputPort:native2.output.type,
  wrapperOutputPort:first.outputPort,
  observation:'Original Reflex Library native receipt and composed wrapper memory are DISTINCT contracts'}};
}
const safe=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;')
 .replaceAll('>','&gt;').replaceAll('"','&quot;');
function copiedPromptTrigram(answer,prompt){
 const tokens=x=>String(x).toLowerCase().match(/[a-z0-9_.\\/-]+/g)||[];
 const a=tokens(answer),p=tokens(prompt);
 if(a.length<3||p.length<3)return false;
 const known=new Set();
 for(let i=0;i<=p.length-3;i++)known.add(p.slice(i,i+3).join('|'));
 for(let i=0;i<=a.length-3;i++)if(known.has(a.slice(i,i+3).join('|')))return true;
 return false;
}
export function compareReport(packet,actual){
 hold(packet?.schema==='iron-lung/compass-real-comparison/v1'
  &&packet.totalCalls===36&&packet.steps?.length===36
  &&packet.automaticPromotions===0&&packet.sourceAdmission===false
  &&packet.humanPermission===false,'NO_AUTHORITY');
 const {receiptSha256,...body}=packet;
 hold(receiptSha256===hash(JSON.stringify(body)),'MODEL_RECEIPT');
 hold(JSON.stringify(packet.task)===JSON.stringify(actual.task),'REAL_CONTRACT_CHANGED');
 hold(packet.provider?.kind==='flan-t5'
  ?packet.provider.model===LOCK.model.name&&packet.provider.revision===LOCK.model.revision
  :packet.provider?.kind==='deterministic-fixture','MODEL_PIN');
 hold(JSON.stringify(packet.arms.map(x=>x.id))===JSON.stringify([
  'NEUTRAL_DYAD','YOU_DYAD','NEUTRAL_COMPILED','YOU_COMPILED']),'FOUR_ARMS');
 const methods=packet.arms.map(x=>({
  id:x.id,questions:x.questionCount,calls:x.requests,
  exactSourceValueAnswers:x.correctExact,echoesCompassHeader:x.echoCount,
  copiedSourcePromptFragments:packet.steps.filter(row=>
    row.arm===x.id&&copiedPromptTrigram(row.response,row.prompt)).length,
  unresolvedResponses:x.unansweredCount,responsesContainingYou:x.secondPersonResponseCount,
  answerQualityIndependentlyReviewed:false}));
 const core={
  schema:'cannon.real-compass-comparison/v1',
  ownerCommit:LOCK.commit,model:packet.provider,originalTaskSha256:packet.taskSha256,
  originalResponseReceiptSha256:packet.receiptSha256,
  comparison:'SAME_NINE_REQUESTS_PER_ARM__PROMPT_LENGTHS_NOT_EQUAL',
  sourceIsRealCannonSoftware:true,modelGeneratedNewAdapters:0,
  copiedGroundTruthDoesNotProveReasoning:true,
  methods,questionsPerArm:9,callTotal:36,
  authorizedNativeExecutions:0,actualPublication:false,autoSelectedWinner:false,
  newOwnerRights:false,measuredTimeSavedSeconds:null,
  interpretation:'EXACT_SOURCE_VALUE_RETRIEVAL_NOT_NOVEL_ADAPTER_DISCOVERY'
 };
 return {...core,reportSha256:hash(pretty(core))};
}
export function reviewPage(packet,report){
 const ids=['NEUTRAL_DYAD','YOU_DYAD','NEUTRAL_COMPILED','YOU_COMPILED'];
 const rows=[];
 for(let i=0;i<9;i++){
  const columns=ids.map((id,j)=>{
   const s=packet.steps[j*9+i];
   hold(s?.arm===id,'REVIEW_ARMS');
   return '<td><pre>'+safe(s.card)+'</pre><pre>'+safe(s.response)+'</pre></td>';
  }).join('');
  const e=packet.steps[i].expected;
  rows.push('<tr><td>'+i+'</td><td>'+safe(e)+'</td>'+columns+'</tr>');
 }
 return '<!doctype html><html lang="en"><meta charset="utf-8">'+
  '<title>INSPAND-008 | Actual CANNON source contract questions</title>'+
  '<h1>Actual ports. Actual adapter. Second-person test.</h1>'+
  '<p>Review-only. No generated answer runs or grants anything.</p>'+
  '<p>Each arm: nine original FLAN requests. Model receipts and source: '+
  safe(report.reportSha256)+'</p>'+
  '<table border="1"><tr><th>Stage</th><th>Exact source answer</th>'+
  ids.map(x=>'<th>'+safe(x)+'</th>').join('')+'</tr>'+
  rows.join('')+'</table></html>\n';
}
function options(argv){
 const [mode,...rest]=argv;hold(['inspect','build','verify'].includes(mode)&&rest.length%2===0,'CLI');
 const o={};for(let i=0;i<rest.length;i+=2){
  const k=rest[i],v=rest[i+1];
  hold(['--lung','--provider','--out','--authorize'].includes(k)&&v&&!Object.hasOwn(o,k),'FLAG');o[k]=v;
 }
 if(mode==='inspect')hold(Object.keys(o).length===0,'INSPECT_NO_EXECUTION');
 else{
  for(const x of ['--lung','--provider','--out'])hold(o[x],'MISSING_'+x);
  hold(['fixture','flan'].includes(o['--provider']),'MODEL_CHOICE');
  hold(mode==='build'?o['--authorize']==='SYNTHETIC_TEST_ONLY':!o['--authorize'],'HUMAN_GATE');
 }
 return {mode,o};
}
export function run(argv){
 const {mode,o}=options(argv),actual=extractActualContract();
 if(mode==='inspect')return {schema:'cannon.real-contract-inspection/v1',...actual,
  ownerSourceLock:LOCK.commit,execution:false};
 const observed=observeOriginal(o['--lung']),lung=dir(o['--lung']);
 const out=resolve(o['--out']),parent=dir(dirname(out));
 hold(out===join(parent,basename(out)),'OUTPUT_PATH');
 hold(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const temp=mkdtempSync(join(parent,'.real-compass-'));
 try{
  const destination=mode==='build'?join(temp,'packet'):out;
  if(mode==='build')mkdirSync(destination);
  const sourcePath=join(temp,'canonical-task.json');
  writeFileSync(sourcePath,pretty(actual.task),{flag:'wx'});
  const raw=exec('npm',['run','--silent','contract-compass','--','compare',
   '--provider',o['--provider'],'--task',sourcePath],lung);
  const comparison=JSON.parse(raw);
  const ownerPacket=join(temp,'owner-packet.json');
  writeFileSync(ownerPacket,pretty(comparison),{flag:'wx'});
  const verified=JSON.parse(exec('npm',['run','--silent','contract-compass','--',
   'verify','--file',ownerPacket],lung));
  hold(verified.status==='REAL_CONTRACT_PACKET_INSPECTED'
   &&verified.sha256===comparison.receiptSha256,'ORIGINAL_OWNER_REFUSED');
  const result=compareReport(comparison,actual);
  const files={'source-task.json':actual.task,'source-proof.json':actual.source,
   'source-owner.json':observed,'original-model.json':comparison,
   'report.json':result,'review.html':reviewPage(comparison,result)};
  for(const [file,value] of Object.entries(files)){
   const bytes=typeof value==='string'?value:pretty(value);
   if(mode==='build')writeFileSync(join(destination,file),bytes,{flag:'wx'});
   else hold(readFileSync(join(destination,file),'utf8')===bytes,'ALTERED_'+file);
  }
  if(mode==='verify')hold(readdirSync(destination).sort().join('|')===
   Object.keys(files).sort().join('|'),'EXTRA_OUTPUT');
  if(mode==='build')renameSync(destination,out);
  return {status:mode==='build'?'REAL_CONTRACT_MODEL_TEST_HELD':'REAL_CONTRACT_COLD_REPLAY_VERIFIED',
   model:o['--provider'],sourceRecipe:actual.task.recipeId,
   exactAnswerCounts:result.methods.map(x=>({id:x.id,count:x.exactSourceValueAnswers})),
   userAddressCounts:result.methods.map(x=>({id:x.id,count:x.responsesContainingYou})),
   totalCalls:36,reportSha256:result.reportSha256,realWorldActions:0};
 }finally{rmSync(temp,{force:true,recursive:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(pretty(run(process.argv.slice(2))))}
 catch(e){console.error(String(e.message||e).slice(0,1500));process.exitCode=2;}
}
