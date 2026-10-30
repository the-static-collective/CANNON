#!/usr/bin/env node
/** INSPAND-013: inspect REAL independent owner source contracts; ask actual
 * National Treasure questions about SIX concrete possible crossings. Original
 * Iron Lung explores the questions but CANNOT create adapters or evidence.
 * No execution of speculative cross-owner interfaces.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,readdirSync,mkdtempSync,mkdirSync,rmSync,renameSync,existsSync,lstatSync,realpathSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
import {compileTruth} from './truth-first-compiler.mjs';
import {inspectNationalTreasure} from './national-treasure-question-crossing.mjs';

const ROOT=resolve(import.meta.dirname,'..');
const LOCK=JSON.parse(readFileSync(join(ROOT,'registry/multi-repo-question-field-v1.json'),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const fmt=x=>JSON.stringify(x,null,2)+'\n';
const hold=(v,s)=>{if(!v)throw Error('HOLD_INTERFACE_FIELD_'+s);};
function call(bin,args,opts={}){
 try{return execFileSync(bin,args,{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],
   timeout:600000,maxBuffer:16*1024*1024,...opts}).trim();}
 catch(e){throw Error('HOLD_INTERFACE_FIELD_ORIGINAL_'+String(e.stderr||e.message).slice(0,550));}
}
function directory(s){
 const p=resolve(s);hold(existsSync(p)&&lstatSync(p).isDirectory()&&!lstatSync(p).isSymbolicLink(),'DIRECTORY');
 return realpathSync(p);
}
const git=(root,...a)=>call('git',['--no-replace-objects','-C',root,...a]);
function verifyRepo(owner,root){
 hold(git(root,'rev-parse','HEAD')===owner.commit,'COMMIT_'+owner.id);
 hold(git(root,'remote','get-url','origin').replace(/\.git$/,'')==='https://github.com/'+owner.repo,'ORIGIN_'+owner.id);
 hold(git(root,'status','--porcelain','--untracked-files=normal').split('\n').filter(Boolean)
  .every(x=>x==='?? node_modules/'),'DIRTY_'+owner.id);
 const files=owner.files.map(spec=>{
  const path=join(root,spec.path),bytes=readFileSync(path);
  hold(realpathSync(path)===path,'SYMLINK_'+spec.path);
  const blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  hold(blob===spec.blob&&git(root,'rev-parse','HEAD:'+spec.path)===spec.blob,'BLOB_'+spec.path);
  const source=bytes.toString('utf8');
  hold(spec.must.every(token=>source.includes(token)),'CONTRACT_'+spec.path);
  return {path:spec.path,gitBlob:blob,sha256:sha(bytes),observedTokens:[...spec.must],
   locator:'https://github.com/'+owner.repo+'/blob/'+owner.commit+'/'+spec.path};
 });
 return {repo:owner.repo,commit:owner.commit,files,sourceVerified:true,
  ancestryClaim:'NO_CROSS_REPO_HISTORY_ESTABLISHED'};
}
export function inspectOwnerField(roots){
 hold(LOCK.schema==='cannon.interface-field-source-lock/v1'
  &&LOCK.status==='EXPLORE_HELD'&&LOCK.authority==='NONE'
  &&LOCK.owners.length===4&&LOCK.edges.length===6
  &&Object.values(LOCK.policies).every(x=>x===true||x===false),'REGISTRY');
 const owners=LOCK.owners.map(owner=>{
  hold(typeof roots[owner.id]==='string','MISSING_CHECKOUT_'+owner.id);
  return {id:owner.id,...verifyRepo(owner,directory(roots[owner.id]))};
 });
 const canonical=compileTruth();
 hold(canonical.evidence.originalSourceVerified&&canonical.decisions[0].adapter==='VERIFIED_RECEIPT_PLAN_ID_V1'
  &&canonical.decisions[1].status==='HOLD_DIRECT_TYPE_MISMATCH','NATIVE_CANNON');
 const lines=canonical.dyadLines;
 hold(lines.some(x=>x.includes('VERIFIED_RECEIPT_PLAN_ID_V1')),'CANNON_CONTRACT');
 return {schema:'cannon.verified-interface-inventory/v1',owners,
  cannon:{owner:'the-static-collective/CANNON',truthSha256:canonical.compilerSha256,
   realAdapter:canonical.decisions[0].adapter,
   directOnly:canonical.decisions[1].status},
  interfaces:LOCK.edges.map(e=>({...e,automaticCompatibility:false,
   directMatch:e.fromType===e.toType,adapterAuthority:'NONE'})),
  sourceAccessIsNotReceiverConsent:true,
  crossRepoRuns:0,unknownBindingsAreHeld:true};
}
function seedFor(edge,inventory){
 const endpoint=inventory.owners.filter(x=>[edge.from,edge.to].includes(x.id));
 const native=edge.knownNative===true;
 // A locator for endpoint code must NOT masquerade as a source for an unproven TRANSPORT.
 const locator=native?'https://github.com/the-static-collective/CANNON/blob/'+
  '932c3400903123630d1dc6957ee38ae955944930/registry/reflex-compositions-v1.json':'';
 return {
  clue:edge.from+' '+edge.fromType+' → '+edge.to+' '+edge.toType,
  claim:edge.claim,
  provenance_class:native?'primary':'speculation',
  support_confidence:native?'possible':'unsupported',
  source_locator:locator,
  source_families:native?['the-static-collective/CANNON']:[],
  chronology:'',counterevidence:'',falsifier:'',competing_explanations:[]
 };
}
function guardReceipt(seed,receipt,edge){
 hold(receipt?.schema==='national-treasure.question-receipt/v0'
  &&receipt.kind==='question_frontier'&&receipt.question.endsWith('?')
  &&!Object.hasOwn(receipt,'answer')&&!Object.hasOwn(receipt,'conclusion')
  &&receipt.evidence.provenance_class===seed.provenance_class
  &&receipt.evidence.support_confidence===seed.support_confidence
  &&receipt.evidence.source_locator===seed.source_locator,'NO_PROMOTION_'+edge.id);
 hold(receipt.aperture.id===(edge.knownNative?'chronology':'source-object'),'EVIDENCE_FRONTIER_'+edge.id);
}
export function buildQuestions(inventory,original){
 hold(inventory.interfaces?.length===6,'INVENTORY');
 const entries=inventory.interfaces.map(edge=>{
  const seed=seedFor(edge,inventory),question=original(seed);
  guardReceipt(seed,question,edge);
  return {id:edge.id,edgeSha256:sha(fmt(edge)),endpoints:[edge.from,edge.to],
   sourceCase:edge.sourceCase,kind:edge.kind,knownNative:edge.knownNative,
   endpointEvidence:inventory.owners.filter(x=>[edge.from,edge.to].includes(x.id))
    .flatMap(x=>x.files.map(f=>f.locator)),
   seed,question,questionSha256:sha(JSON.stringify(question)),status:'UNANSWERED_HELD'};
 });
 return {schema:'cannon.interface-question-field/v1',entries,
  originalQuestionOwner:'the-static-collective/national-treasure',
  namedCases:entries.length,sourceVerificationPassed:true,
  independentlyProvenNewBridges:0,originalNativeAdapterCount:1,
  modelMayAdmitAnswers:false,executorSelected:false};
}
const INITIAL_SOURCE='932c3400903123630d1dc6957ee38ae955944930';
export function updateQuestions(initial,original,sourceDate){
 hold(initial.entries?.length===6,'INITIAL');
 hold(sourceDate?.commit===INITIAL_SOURCE&&sourceDate.scope==='OBSERVED_SINGLE_COMMIT_NOT_EARLIEST_HISTORY','DATE_LIMIT');
 return initial.entries.map(item=>{
  const input=structuredClone(item.seed);
  if(item.knownNative){
   input.chronology='CANNON source commit '+INITIAL_SOURCE+' observed at '+sourceDate.date+
    '; source observation only; not proven earliest appearance or independent witness.';
  }else{
   hold(input.source_locator===''&&input.provenance_class==='speculation','UNKNOWN_STAYS_UNKNOWN');
  }
  const next=original(input);
  hold(next?.schema==='national-treasure.question-receipt/v0'
   &&!Object.hasOwn(next,'answer')
   &&next.aperture.id===(item.knownNative?'counterevidence':'source-object')
   &&next.evidence.provenance_class===input.provenance_class
   &&next.evidence.support_confidence===input.support_confidence
   &&next.evidence.source_locator===input.source_locator,'NEXT_QUESTION_'+item.id);
  return {edgeId:item.id,previousSha256:item.questionSha256,
   newQuestion:next,newSha256:sha(JSON.stringify(next)),
   originalAperture:item.question.aperture.id,nextAperture:next.aperture.id,
   sourceFactsAdded:item.knownNative?['single dated original CANNON commit observation']:[],
   modelInfluencedNextQuestion:false,unanswered:true};
 });
}
function parse(argv){
 const [mode,...rest]=argv;
 hold(['list','build','verify'].includes(mode)&&rest.length%2===0,'USAGE');
 const opts={};
 for(let i=0;i<rest.length;i+=2){
  const k=rest[i],v=rest[i+1];hold(['--owners','--treasure','--out','--authorize'].includes(k)
   &&v&&!Object.hasOwn(opts,k),'FLAGS');opts[k]=v;
 }
 if(mode==='list')hold(Object.keys(opts).length===0,'LIST_READ_ONLY');
 else{
  for(const key of ['--owners','--treasure','--out'])hold(opts[key],'REQUIRED_'+key);
  hold(mode==='build'?opts['--authorize']==='SYNTHETIC_TEST_ONLY':!opts['--authorize'],'AUTHORIZE');
 }
 return {mode,opts};
}
const escape=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function html(cards,follow){
 return '<!doctype html><html lang="en"><meta charset="utf-8"><title>INSPAND-013 Interface Question Field</title>'+
  '<h1>Six crossings, five original software owners</h1>'+
  '<p>Source identity is proved, cross-repository compatibility is NOT. None of these questions is an answer.</p>'+
  cards.entries.map((x,i)=>'<section><h2>'+escape(x.id)+'</h2><p>'+escape(x.seed.clue)+'</p>'+
   '<p>Known boundary: '+escape(x.kind)+'</p>'+
   '<p>Question 1: '+escape(x.question.question)+'</p>'+
   '<p>Question 2: '+escape(follow[i].newQuestion.question)+'</p>'+
   '<p>Next: '+escape(follow[i].nextAperture)+'</p></section>').join('')+'</html>\n';
}
export async function run(argv){
 const {mode,opts}=parse(argv);
 if(mode==='list')return {schema:LOCK.schema,
  owners:LOCK.owners.map(x=>x.id),edges:LOCK.edges.map(x=>({id:x.id,case:x.kind})),
  noRuntimeExecuted:true};
 const roots=JSON.parse(readFileSync(resolve(opts['--owners']),'utf8'));
 const owner=inspectNationalTreasure(opts['--treasure']);
 const {buildQuestionFrontier}=await import(pathToFileURL(
  join(directory(opts['--treasure']),'tools/question-box/engine.mjs')).href);
 const inventory=inspectOwnerField(roots);
 const cards=buildQuestions(inventory,buildQuestionFrontier);
 const stamp=git(ROOT,'show','-s','--format=%cI',INITIAL_SOURCE);
 const date={commit:INITIAL_SOURCE,date:new Date(stamp).toISOString(),
  scope:'OBSERVED_SINGLE_COMMIT_NOT_EARLIEST_HISTORY'};
 const follow=updateQuestions(cards,buildQuestionFrontier,date);
 const base={schema:'cannon.cross-repo-question-cycle/v1',
  sourceOwnerRefs:inventory.owners.map(x=>({repo:x.repo,commit:x.commit})),
  originalQuestionOwnerCommit:owner.commit,sourceCommit:date,
  initialQuestionDigests:cards.entries.map(x=>x.questionSha256),
  subsequentQuestionDigests:follow.map(x=>x.newSha256),
  initialApertures:cards.entries.map(x=>x.question.aperture.id),
  laterApertures:follow.map(x=>x.nextAperture),
  actualOriginalQuestionExecutions:12,
  sourceOwnerInterfaceCount:5,proposedCrossRepoEdges:6,
  previouslyTestedCannonRoute:1,verifiedNewCrossRepoAdapters:0,
  modelGeneratedFacts:0,modelAuthorizedExecution:false,realWorldActions:0,
  scope:'SOURCE_EVIDENCE_ONLY_NO_CROSS_OWNER_EXECUTION'};
 const report={...base,reportSha256:sha(fmt(base))};
 const files={'inventory.json':inventory,'original-owner.json':owner,'questions.json':cards,
  'followup-questions.json':follow,'research-cycle.json':report,'review.html':html(cards,follow)};
 const out=resolve(opts['--out']),parent=directory(dirname(out));
 hold(join(parent,basename(out))===out,'OUTPUT_PATH');
 hold(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const temp=mkdtempSync(join(parent,'.field-'));
 try{
  const target=mode==='build'?join(temp,'packet'):out;
  if(mode==='build')mkdirSync(target);
  for(const [file,value] of Object.entries(files)){
   const bytes=typeof value==='string'?value:fmt(value);
   if(mode==='build')writeFileSync(join(target,file),bytes,{flag:'wx'});
   else hold(readFileSync(join(target,file),'utf8')===bytes,'FORGERY_'+file);
  }
  if(mode==='verify')hold(readdirSync(target).sort().join('|')===
   Object.keys(files).sort().join('|'),'EXTRA_PACKET');
  if(mode==='build')renameSync(target,out);
  return {status:mode==='build'?'SIX_SOURCE_GROUNDED_QUESTIONS_HELD':'MULTIREPO_QUESTIONS_COLD_REPLAY',
   owners:5,edges:6,questions:12,initial:report.initialApertures,followup:report.laterApertures,
   newVerifiedAdapters:0,reportSha256:report.reportSha256};
 }finally{rmSync(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
 run(process.argv.slice(2)).then(x=>console.log(fmt(x)))
 .catch(e=>{console.error(String(e.message||e).slice(0,900));process.exitCode=2;});
}
