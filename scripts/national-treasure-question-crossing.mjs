#!/usr/bin/env node
/** INSPAND-011: Actual source-owned National Treasure Question Box
 * -> real CANNON truth-first compiler. It makes questions, NEVER answers.
 * Only the independently pinned National Treasure engine executes.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,renameSync,rmSync,existsSync,lstatSync,realpathSync,readdirSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {compileTruth,inspectTruth} from './truth-first-compiler.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const LOCK=JSON.parse(readFileSync(join(ROOT,'registry/national-treasure-question-source-lock-v1.json'),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const fmt=x=>JSON.stringify(x,null,2)+'\n';
function hold(x,why){if(!x)throw Error('HOLD_TREASURE_COMPASS_'+why);}
function cmd(program,args,options={}){
 try{return execFileSync(program,args,{encoding:'utf8',timeout:20000,stdio:['ignore','pipe','pipe'],maxBuffer:1024*1024,...options}).trim();}
 catch(e){throw Error('HOLD_TREASURE_COMPASS_GIT_'+String(e.stderr||e.message).slice(0,350));}
}
function secureDir(x){
 const path=resolve(x);hold(existsSync(path)&&lstatSync(path).isDirectory()
  &&!lstatSync(path).isSymbolicLink(),'DIR');
 return realpathSync(path);
}
function git(root,...args){return cmd('git',['--no-replace-objects','-C',root,...args]);}
export function inspectNationalTreasure(path){
 const root=secureDir(path);
 hold(LOCK?.schema==='cannon.original-question-box-lock/v1'
  &&LOCK.owner==='the-static-collective/national-treasure'
  &&LOCK.receiptSchema==='national-treasure.question-receipt/v0'
  &&LOCK.handoff==='RESEARCH_QUESTION_ONLY'&&!LOCK.answerAllowed&&!LOCK.modelUsed
  &&LOCK.authority==='NONE','OWNER_IDENTITY');
 hold(git(root,'rev-parse','HEAD')===LOCK.commit,'ORIGINAL_COMMIT');
 const origin=git(root,'remote','get-url','origin').replace(/\.git$/,'');
 hold(origin==='https://github.com/'+LOCK.owner,'OWNER_ORIGIN');
 hold(git(root,'status','--porcelain','--untracked-files=normal')==='','SOURCE_DIRTY');
 for(const [file,blob] of Object.entries(LOCK.files)){
  hold(git(root,'rev-parse','HEAD:'+file)===blob,'SOURCE_BLOB_'+file);
  const path=join(root,file),bytes=readFileSync(path);
  hold(realpathSync(path)===path,'SYMLINK_'+file);
  hold(createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')===blob,'LIVE_SOURCE_'+file);
 }
 return {schema:'cannon.treasure-original-source/v1',repository:LOCK.owner,
  commit:LOCK.commit,codeBlobs:LOCK.files,authority:'NONE',engine:'ACTUAL_ORIGINAL_SOURCE'};
}
const SOURCE_COMMIT='932c3400903123630d1dc6957ee38ae955944930';
export function sourceQuestionSeeds(){
 const compiled=compileTruth();
 inspectTruth(compiled);
 const adapted=compiled.decisions.find(x=>x.caseId==='ADAPTED');
 const direct=compiled.decisions.find(x=>x.caseId==='DIRECT_ONLY');
 hold(adapted?.status==='TESTABLE_WITH_OPERATOR_AUTHORIZATION'
  &&direct?.status==='HOLD_DIRECT_TYPE_MISMATCH'
  &&adapted.sourceCaseIsReal&&direct.counterfactual
  &&adapted.adapter==='VERIFIED_RECEIPT_PLAN_ID_V1','PROVENANCE_CASES');
 const sourceLocator='https://github.com/the-static-collective/CANNON/blob/'+SOURCE_COMMIT
  +'/registry/reflex-compositions-v1.json#sha256='+compiled.evidence.compositionSha256;
 const seeds=[
  {caseId:'REAL_REGISTERED_ADAPTER',
   sourceCase:'ORIGINAL_CANNON_SOURCE_REGISTRY',
   evidenceStatus:'PINNED_SOURCE_RECOVERABLE',
   engineInput:{
    clue:'CANNON SOURCE_PROOF outputs '+adapted.originalInterface.outputPort+
      ' while VISUAL_STUDY expects '+adapted.originalInterface.inputPort+'.',
    claim:'The original source registers '+adapted.adapter+
      ' and binds '+adapted.sourceReceiptField+' for a local synthetic software experiment only.',
    provenance_class:'primary',support_confidence:'possible',
    source_locator:sourceLocator,source_families:['the-static-collective/CANNON'],
    chronology:'',counterevidence:'',falsifier:'',competing_explanations:[]
   }},
  {caseId:'SYNTHETIC_ADAPTER_DISABLED',
   sourceCase:'DECLARED_COUNTERFACTUAL_NOT_ACTUAL_CANNON_STATE',
   evidenceStatus:'NO_ORIGINAL_SOURCE_OBJECT_FOR_HYPOTHETICAL_STATE',
   engineInput:{
    clue:'The known registered adapter is deliberately withheld in a hypothetical software test.',
    claim:'Without that adapter, mismatched original port types may prevent direct execution.',
    provenance_class:'speculation',support_confidence:'unsupported',
    source_locator:'',source_families:[],chronology:'',
    counterevidence:'',falsifier:'',competing_explanations:[]
   }}
 ];
 const output={schema:'cannon.treasure-compass-seeds/v1',
  originalTruthSha256:compiled.compilerSha256,
  exactCannonEvidence:compiled.evidence,
  sourceOwner:'the-static-collective/CANNON',
  sourceCommit:SOURCE_COMMIT,
  seeds,noPrivateRecordInputs:true,nonClaims:['The original adapter is not new.',
   'A proposed relationship is not an admission.',
   'The counterfactual is not the original software state.']};
 return {...output,seedsSha256:sha(fmt(output))};
}
export function validateOriginalQuestion(seed,receipt){
 hold(receipt?.schema==='national-treasure.question-receipt/v0'
  &&receipt.kind==='question_frontier'
  &&typeof receipt.question==='string'&&receipt.question.endsWith('?')
  &&!Object.hasOwn(receipt,'answer')&&!Object.hasOwn(receipt,'conclusion')
  &&!Object.hasOwn(receipt,'decision'),'ORIGINAL_NO_ANSWER');
 hold(receipt.input?.clue===seed.engineInput.clue&&receipt.input?.claim===seed.engineInput.claim
  &&receipt.evidence?.provenance_class===seed.engineInput.provenance_class
  &&receipt.evidence?.support_confidence===seed.engineInput.support_confidence
  &&receipt.evidence?.source_locator===seed.engineInput.source_locator,'PROVENANCE_NOT_PROMOTED');
 hold(receipt.non_claims?.length>=4,'ORIGINAL_NONCLAIMS');
 const expected=seed.caseId==='REAL_REGISTERED_ADAPTER'?'chronology':'source-object';
 hold(receipt.aperture?.id===expected,'REQUIRED_MISSING_APERTURE');
 return true;
}
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
 .replaceAll('>','&gt;').replaceAll('"','&quot;');
function reviewHTML(results){
 return '<!doctype html><html lang="en"><meta charset="utf-8">'+
  '<title>National Treasure × CANNON — Two Unanswered Doors</title>'+
  '<h1>The question is the artifact</h1>'+
  '<p>Original source-owned Question Box. These are NOT answers, approvals or established new relations.</p>'+
  results.map((item,i)=>'<section><h2>Door '+(i+1)+': '+escape(item.caseId)+'</h2>'+
   '<p>Source status: '+escape(item.evidenceStatus)+'</p>'+
   '<p>Missing: '+escape(item.receipt.aperture.missing)+'</p>'+
   '<blockquote>'+escape(item.receipt.question)+'</blockquote>'+
   '<p>Why: '+escape(item.receipt.aperture.reason)+'</p></section>').join('')+
  '</html>\n';
}
function opts(argv){
 const [mode,...rest]=argv;
 hold(['list','build','verify'].includes(mode)&&rest.length%2===0,'CLI');
 const parsed={};
 for(let i=0;i<rest.length;i+=2){
  const flag=rest[i],value=rest[i+1];
  hold(['--treasure','--out','--authorize'].includes(flag)&&value
   &&!Object.hasOwn(parsed,flag),'FLAG');parsed[flag]=value;
 }
 if(mode==='list')hold(Object.keys(parsed).length===0,'LIST_NO_TOOL_CALL');
 else{
  hold(parsed['--treasure']&&parsed['--out'],'REQUIRED');
  hold(mode==='build'?parsed['--authorize']==='SYNTHETIC_TEST_ONLY'
   :!parsed['--authorize'],'AUTHORITY');
 }
 return {mode,parsed};
}
export async function run(argv){
 const {mode,parsed}=opts(argv),seeds=sourceQuestionSeeds();
 if(mode==='list')return {schema:'cannon.treasure-questions-list/v1',
  cases:seeds.seeds.map(x=>({id:x.caseId,sourceStatus:x.evidenceStatus})),
  engineOwner:LOCK.owner,engineCommit:LOCK.commit,noAnswer:true,authority:'NONE'};
 const owner=inspectNationalTreasure(parsed['--treasure']);
 const path=join(secureDir(parsed['--treasure']),'tools/question-box/engine.mjs');
 const {buildQuestionFrontier}=await import(pathToFileURL(path).href);
 hold(typeof buildQuestionFrontier==='function','ORIGINAL_ENGINE_MISSING');
 const out=resolve(parsed['--out']),parent=secureDir(dirname(out));
 hold(join(parent,basename(out))===out,'OUTPUT_PATH');
 hold(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATUS');
 const temp=mkdtempSync(join(parent,'.treasure-questions-'));
 try{
  const destination=mode==='build'?join(temp,'packet'):out;
  if(mode==='build')mkdirSync(destination);
  const results=seeds.seeds.map(seed=>{
   const receipt=buildQuestionFrontier(seed.engineInput);
   validateOriginalQuestion(seed,receipt);
   return {caseId:seed.caseId,evidenceStatus:seed.evidenceStatus,
    receipt,originalReceiptSha256:sha(fmt(receipt))};
  });
  const core={schema:'cannon.national-treasure-questions-handoff/v1',
   originalQuestionBoxOwner:owner,sourceSeedsSha256:seeds.seedsSha256,
   questionCount:results.length,results,
   questionOnly:true,noAnswers:true,noAutomaticEvidencePromotion:true,
   originalAuthority:'NONE',sourceInterpretation:'UNCHANGED',nativeProgramsExecuted:0};
  const handoff={...core,handoffSha256:sha(fmt(core))};
  const files={'source-seeds.json':seeds,'original-owner.json':owner,
   'original-questions.json':results.map(x=>x.receipt),
   'handoff.json':handoff,'review.html':reviewHTML(results)};
  for(const [file,value] of Object.entries(files)){
   const bytes=typeof value==='string'?value:fmt(value);
   if(mode==='build')writeFileSync(join(destination,file),bytes,{flag:'wx'});
   else hold(readFileSync(join(destination,file),'utf8')===bytes,'COLD_TAMPER_'+file);
  }
  if(mode==='verify')hold(readdirSync(destination).sort().join('|')===
   Object.keys(files).sort().join('|'),'EXTRA_PACKET');
  if(mode==='build')renameSync(destination,out);
  return {status:mode==='build'?'ORIGINAL_QUESTION_BOX_TWO_HELD_DOORS':'QUESTION_BOX_COLD_REPLAY_VERIFIED',
   originalSource:owner.commit,receiptSha256:handoff.handoffSha256,
   questions:results.map(x=>({caseId:x.caseId,aperture:x.receipt.aperture.id,
    question:x.receipt.question})),answers:0,execution:0,authority:'NONE'};
 }finally{rmSync(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
 run(process.argv.slice(2)).then(x=>console.log(fmt(x)))
 .catch(e=>{console.error(String(e.message||e).slice(0,1200));process.exitCode=2;});
}
