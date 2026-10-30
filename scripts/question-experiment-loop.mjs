#!/usr/bin/env node
/** INSPAND-012: source-backed research cycle.
 * Original National Treasure question -> original Iron Lung held exploration
 * -> independently authorized CANNON native proof -> original National Treasure
 * next unanswered question. Model text never controls the execution.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,renameSync,rmSync,existsSync,lstatSync,realpathSync,readdirSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {compileTruth,inspectTruth} from './truth-first-compiler.mjs';
import {inspectNationalTreasure,sourceQuestionSeeds,validateOriginalQuestion}
 from './national-treasure-question-crossing.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const LOCK=JSON.parse(readFileSync(join(ROOT,'registry/iron-lung-investigation-source-lock-v1.json'),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const fmt=x=>JSON.stringify(x,null,2)+'\n';
function hold(x,why){if(!x)throw Error('HOLD_RESEARCH_LOOP_'+why);}
function cmd(program,args,opts={}){
 try{return execFileSync(program,args,{encoding:'utf8',timeout:720000,maxBuffer:16*1024*1024,
  stdio:['ignore','pipe','pipe'],...opts}).trim();}
 catch(e){throw Error('HOLD_RESEARCH_LOOP_SUBPROCESS_'+String(e.stderr||e.message).slice(0,700));}
}
function dir(path){
 const abs=resolve(path);
 hold(existsSync(abs)&&lstatSync(abs).isDirectory()&&!lstatSync(abs).isSymbolicLink(),'DIR');
 return realpathSync(abs);
}
function git(root,...args){return cmd('git',['--no-replace-objects','-C',root,...args]);}
export function inspectIronLung(root){
 const path=dir(root);
 hold(LOCK?.schema==='cannon.original-question-investigation-source-lock/v1'
  &&LOCK.owner==='the-static-collective/iron-lung'
  &&LOCK.authority==='NONE'&&LOCK.nativeExecutionPolicy==='NEVER_ON_GENERATED_TEXT'
  &&LOCK.questionReceiptSchema==='national-treasure.question-receipt/v0'
  &&LOCK.maxModelCalls===18,'OWNER_LOCK');
 hold(git(path,'rev-parse','HEAD')===LOCK.commit
  &&git(path,'remote','get-url','origin').replace(/\.git$/,'')==='https://github.com/'+LOCK.owner,
  'OWNER_COMMIT');
 const status=git(path,'status','--porcelain','--untracked-files=normal').split('\n').filter(Boolean);
 hold(status.every(x=>x==='?? node_modules/'),'DIRTY_ORIGINAL_OWNER');
 for(const [file,blob] of Object.entries(LOCK.files)){
  hold(git(path,'rev-parse','HEAD:'+file)===blob,'ORIGINAL_BLOB_'+file);
  const live=readFileSync(join(path,file));
  hold(realpathSync(join(path,file))===join(path,file)
   &&createHash('sha1').update('blob '+live.length+'\0').update(live).digest('hex')===blob,
   'ORIGINAL_WORKTREE_'+file);
 }
 return {schema:'cannon.iron-lung-source-observation/v1',owner:LOCK.owner,
  commit:LOCK.commit,model:LOCK.model,authority:'NONE'};
}
export function initialQuestions(originalBuilder){
 const seeds=sourceQuestionSeeds(),truth=compileTruth();
 inspectTruth(truth);
 hold(seeds.originalTruthSha256===truth.compilerSha256&&seeds.seeds.length===2,'CANNON_SOURCE');
 const items=seeds.seeds.map(seed=>{
  const receipt=originalBuilder(seed.engineInput);
  validateOriginalQuestion(seed,receipt);
  return {id:seed.caseId,sourceStatus:seed.evidenceStatus,
   receipt,receiptSha256:sha(JSON.stringify(receipt))};
 });
 return {seeds,truth,items};
}
const COMMIT='932c3400903123630d1dc6957ee38ae955944930';
const SOURCE_DATE='2026-10-29T19:38:37.000Z';
function inspectSourceCommit(){
 const actual=git(ROOT,'show','-s','--format=%cI',COMMIT);
 hold(new Date(actual).toISOString()===SOURCE_DATE,'SOURCE_CHRONOLOGY');
 return {commit:COMMIT,observedAt:SOURCE_DATE,
  scope:'FIRST_INSPECTED_COMMIT_DATE_NOT_EARLIEST_APPEARANCE',
  verifiedBy:'LOCAL_GIT_COMMITTER_METADATA'};
}
export function feedbackQuestions(sourceItems,truth,nativeProof,originalBuilder,dateEvidence){
 hold(sourceItems.length===2&&sourceItems[0].id==='REAL_REGISTERED_ADAPTER'
  &&sourceItems[1].id==='SYNTHETIC_ADAPTER_DISABLED','TWO_SOURCE_CASES');
 hold(nativeProof?.schema==='cannon.truth-first-native-proof/v1'
  &&nativeProof.sourceCompilerSha256===truth.compilerSha256
  &&nativeProof.originalNativeMediaSha256?.length===2
  &&nativeProof.realWorldOutcomes===0&&nativeProof.publication===false
  &&nativeProof.authorizedCase==='ADAPTED'
  &&nativeProof.directOnlyCase==='HOLD_DIRECT_TYPE_MISMATCH','NATIVE_PROOF');
 hold(dateEvidence?.commit===COMMIT&&dateEvidence.observedAt===SOURCE_DATE
  &&dateEvidence.scope==='FIRST_INSPECTED_COMMIT_DATE_NOT_EARLIEST_APPEARANCE','DATE_SCOPE');
 return sourceItems.map((item,i)=>{
  const input={...sourceQuestionSeeds().seeds[i].engineInput};
  if(i===0){
   // A source commit date is an observed chronological anchor, NOT proof of
   // historical first appearance or an independent second source family.
   input.chronology='Inspected CANNON source commit '+dateEvidence.commit+
    ' has committer time '+dateEvidence.observedAt+
    '; this is one dated source observation, not proven earliest origin.';
  }else{
   // Synthetic adapter removal is not historical evidence. A successful real
   // adapter test must not give the imagined direct-only state a source.
   hold(input.source_locator===''&&input.chronology==='','NO_INVENTED_COUNTERFACTUAL');
  }
  const receipt=originalBuilder(input);
  hold(receipt?.schema==='national-treasure.question-receipt/v0'
   &&!Object.hasOwn(receipt,'answer')&&!Object.hasOwn(receipt,'conclusion')
   &&receipt.evidence.source_locator===input.source_locator
   &&receipt.evidence.provenance_class===input.provenance_class
   &&receipt.evidence.support_confidence===input.support_confidence,'ORIGINAL_QUESTION_ONLY');
  const expected=i===0?'counterevidence':'source-object';
  hold(receipt.aperture?.id===expected,'NEXT_UNRESOLVED_APERTURE');
  return {id:item.id,sourceQuestionSha256:item.receiptSha256,
   nativeProofSha256:i===0?nativeProof.proofSha256:null,
   nextQuestion:receipt,nextQuestionSha256:sha(JSON.stringify(receipt)),
   result:'STILL_UNANSWERED',authority:'NONE'};
 });
}
export function assessInvestigation(input,originalQuestion,model){
 hold(model?.schema==='iron-lung/question-investigation/v1'
  &&model.outputKind==='REVIEW_ONLY_SPECULATION'
  &&model.selectedAnswer===null&&!model.modelCanExecute
  &&!model.modelCanAdvanceQuestion&&model.authority==='NONE'
  &&model.steps?.length===9&&model.requests===9,'NO_MODEL_CONTROL');
 const {investigationSha256,...body}=model;
 hold(investigationSha256===sha(JSON.stringify(body)),'MODEL_HASH');
 hold(model.originalQuestionSha256===originalQuestion.receiptSha256
  &&model.source?.originalQuestionSha256===originalQuestion.receiptSha256
  &&model.source?.caseId===originalQuestion.id
  &&JSON.stringify(model.source.originalQuestion)===JSON.stringify(originalQuestion.receipt),
  'INPUT_BINDING');
 hold(model.provider?.kind==='flan-t5'
   ?model.provider.model===LOCK.model.name&&model.provider.revision===LOCK.model.revision
   :model.provider?.kind==='deterministic-fixture','MODEL_ID');
 hold(model.steps.every(s=>s.authority==='NONE'&&s.status==='POSSIBILITY_UNVERIFIED'
  &&s.executed===false&&s.factAdmitted===false&&s.ownerApproval===false),'NO_MODEL_PROMOTION');
 return {schema:'cannon.question-possibilities/v1',caseId:originalQuestion.id,
  originalQuestionSha256:originalQuestion.receiptSha256,
  investigationSha256:model.investigationSha256,
  proposals:9,modelWasOperator:false,modelSelectedNativeRoute:false,
  modelEstablishedFact:false,modelAuthoredNextQuestion:false,
  result:'HELD_MODEL_TEXT_NOT_EXECUTED'};
}
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
 .replaceAll('>','&gt;').replaceAll('"','&quot;');
export function reviewHTML(initial,observations,next,summary){
 const sections=initial.map((i,k)=>{
  const x=next[k];
  return '<section><h2>'+escape(i.id)+'</h2><p>Original question: '+escape(i.receipt.question)+'</p>'+
    '<p>Missing aperture: '+escape(i.receipt.aperture.id)+'</p>'+
    '<p>Iron Lung: nine unverified model possibilities, retained, NEVER executed.</p>'+
    '<p>Actual native test: '+(k===0?'original authorized source adapter proved locally':'direct-only test HELD')+'</p>'+
    '<p>Next question: '+escape(x.nextQuestion.question)+'</p>'+
    '<p>Next missing aperture: '+escape(x.nextQuestion.aperture.id)+'</p></section>';
 });
 return '<!doctype html><html lang="en"><meta charset="utf-8">'+
  '<title>INSPAND-012 Original-source question cycle</title>'+
  '<h1>Question → Possibilities → Experiment → Evidence → Better Question</h1>'+
  '<p>Original NT Question Box and Iron Lung source owned independently. CANNON controls executable facts.</p>'+
  '<p>HELD: no model text became evidence, native software, human permission, or the next question.</p>'+
  '<p>Cycle receipt: '+escape(summary.cycleSha256)+'</p>'+sections.join('')+'</html>\n';
}
function options(argv){
 const [mode,...rest]=argv;
 hold(['inspect','build','verify'].includes(mode)&&rest.length%2===0,'USAGE');
 const opts={};
 for(let i=0;i<rest.length;i+=2){
  const key=rest[i],val=rest[i+1];
  hold(['--treasure','--lung','--provider','--native','--plan','--planz','--roots',
   '--out','--authorize'].includes(key)&&val&&!Object.hasOwn(opts,key),'OPTION');
  opts[key]=val;
 }
 if(mode==='inspect')hold(Object.keys(opts).length===0,'INSPECT_READ_ONLY');
 else{
  for(const k of ['--treasure','--lung','--provider','--native',
   '--plan','--planz','--roots','--out'])hold(opts[k],'REQUIRED_'+k);
  hold(['fixture','flan'].includes(opts['--provider']),'PROVIDER');
  hold(/^plan-[a-f0-9]{24}$/.test(opts['--plan']),'PLAN');
  hold(mode==='build'?opts['--authorize']==='SYNTHETIC_TEST_ONLY':!opts['--authorize'],
   'OPERATOR_AUTHORIZATION');
 }
 return {mode,opts};
}
export async function run(argv){
 const {mode,opts}=options(argv);
 if(mode==='inspect'){
  const seeds=sourceQuestionSeeds();
  return {schema:'cannon.research-cycle-inspection/v1',
   originalSource:true,questionOwner:'the-static-collective/national-treasure',
   investigationOwner:LOCK.owner,sourceSeedIds:seeds.seeds.map(x=>x.caseId),
   status:'READ_ONLY',humanAuthorization:false};
 }
 const treasureObservation=inspectNationalTreasure(opts['--treasure']);
 const lungObservation=inspectIronLung(opts['--lung']);
 const {buildQuestionFrontier}=await import(pathToFileURL(
  join(dir(opts['--treasure']),'tools/question-box/engine.mjs')).href);
 hold(typeof buildQuestionFrontier==='function','ORIGINAL_QUESTION_ENGINE');
 const {seeds,truth,items}=initialQuestions(buildQuestionFrontier);
 const dateEvidence=inspectSourceCommit();
 const native=dir(opts['--native']);
 hold(native===resolve(opts['--native']),'NATIVE_ROOT');
 const evidence=JSON.parse(readFileSync(join(native,'native-proof.json'),'utf8'));
 hold(evidence.sourceCompilerSha256===truth.compilerSha256
  &&evidence.originalRecipeId==='plan-proof-to-pixels-and-print/v1'
  &&evidence.originalNativeMediaSha256?.length===2
  &&evidence.explicitOperatorAuthorization===true
  &&evidence.generatedProgramExecuted===false&&evidence.publication===false,'EXISTING_NATIVE_PROOF');
 // Verify entire original native composition and independently recompute receipts
 // BEFORE accepting it as evidence, never based on model-generated text.
 const argvNative=[join(ROOT,'scripts/truth-first-compiler.mjs'),'verify','--case','ADAPTED',
  '--plan',opts['--plan'],'--planz',opts['--planz'],'--roots',opts['--roots'],'--out',native];
 const verified=JSON.parse(cmd(process.execPath,argvNative,{cwd:ROOT,timeout:600000}));
 hold(verified.status==='TRUTH_FIRST_FULL_COLD_REPLAY'
  &&verified.nativeReceiptSha256===evidence.originalNativeReceiptSha256,'NATIVE_COLD_REPLAY');
 const out=resolve(opts['--out']),parent=dir(dirname(out));
 hold(out===join(parent,basename(out)),'OUTPUT_PATH');
 hold(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATUS');
 const temp=mkdtempSync(join(parent,'.research-loop-'));
 try{
  const dest=mode==='build'?join(temp,'packet'):out;
  if(mode==='build')mkdirSync(dest);
  const evaluations=[],modelRecords=[];
  for(const item of items){
   const original={
    schema:'iron-lung/national-treasure-question-seed/v1',
    caseId:item.id,sourceStatus:item.sourceStatus,
    originalQuestion:item.receipt,originalQuestionSha256:item.receiptSha256,
    authority:'NONE',answerEstablished:false,inputFromOriginalQuestionBox:true};
   const seedFile=join(temp,item.id+'.json');
   writeFileSync(seedFile,fmt(original),{flag:'wx'});
   const model=JSON.parse(cmd('npm',['run','--silent','nt-investigation','--',
    'explore','--provider',opts['--provider'],'--seed',seedFile],
    {cwd:dir(opts['--lung']),timeout:600000}));
   const output=join(temp,item.id+'-output.json');
   writeFileSync(output,fmt(model),{flag:'wx'});
   const lungVerified=JSON.parse(cmd('npm',['run','--silent','nt-investigation','--',
    'verify','--file',output],{cwd:dir(opts['--lung']),timeout:600000}));
   hold(lungVerified.status==='ORIGINAL_IRON_LUNG_HELD_QUESTION_VERIFIED'
    &&lungVerified.resultSha256===model.investigationSha256,'ORIGINAL_LUNG_VERIFY');
   const review=assessInvestigation(original,item,model);
   evaluations.push(review);modelRecords.push(model);
  }
  const followup=feedbackQuestions(items,truth,evidence,buildQuestionFrontier,dateEvidence);
  const core={
   schema:'cannon.question-experiment-question-cycle/v1',
   status:'SOURCE_NATIVE_SYNTHETIC_EVIDENCE_WITH_MODEL_HELD',
   originalNationalTreasure:treasureObservation,
   originalIronLung:lungObservation,
   initialReceipts:items.map(x=>({id:x.id,sha256:x.receiptSha256,aperture:x.receipt.aperture.id})),
   investigationEvaluations:evaluations,
   actualNativeProofSha256:evidence.proofSha256,
   sourceCommitEvidence:dateEvidence,
   nextQuestions:followup.map(x=>({id:x.id,aperture:x.nextQuestion.aperture.id,
    receiptSha256:x.nextQuestionSha256})),
   actualNativeExecutedSeparatelyWithExplicitGrant:true,
   investigationModelSelectedExecution:false,investigationModelProvidedSourceEvidence:false,
   investigationModelAuthoredNextQuestion:false,
   independentHumanApprovalClaimed:false,
   modelCallCount:18,realWorldActions:0,publication:false,
   provenanceNotPromoted:true};
  const summary={...core,cycleSha256:sha(fmt(core))};
  const files={
   'original-source-seeds.json':seeds,
   'original-source-truth.json':truth,
   'original-native-proof.json':evidence,
   'first-questions.json':items.map(x=>x.receipt),
   'iron-lung-investigations.json':modelRecords,
   'held-possibilities.json':evaluations,
   'observed-commit.json':dateEvidence,
   'next-questions.json':followup.map(x=>x.nextQuestion),
   'cycle-receipt.json':summary,
   'review.html':reviewHTML(items,evaluations,followup,summary)
  };
  for(const [file,value] of Object.entries(files)){
   const bytes=typeof value==='string'?value:fmt(value);
   if(mode==='build')writeFileSync(join(dest,file),bytes,{flag:'wx'});
   else hold(readFileSync(join(dest,file),'utf8')===bytes,'COLD_TAMPER_'+file);
  }
  if(mode==='verify')hold(readdirSync(dest).sort().join('|')===
   Object.keys(files).sort().join('|'),'OUTPUT_EXTRA_FILES');
  if(mode==='build')renameSync(dest,out);
  return {status:mode==='build'?'RESEARCH_LOOP_COMPLETED_HELD':'RESEARCH_LOOP_COLD_REPLAY',
   questionApertures:items.map(x=>x.receipt.aperture.id),
   nextQuestionApertures:followup.map(x=>x.nextQuestion.aperture.id),
   originalModelCalls:18,originalNativeReceiptSha256:verified.nativeReceiptSha256,
   cycleSha256:summary.cycleSha256,
   modelAdmittedFacts:0,modelTriggeredNativeActions:0,
   realWorldActions:0};
 }finally{rmSync(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
 run(process.argv.slice(2)).then(x=>console.log(fmt(x)))
  .catch(e=>{console.error(String(e.message||e).slice(0,1200));process.exitCode=2;});
}
