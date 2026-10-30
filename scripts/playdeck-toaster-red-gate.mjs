#!/usr/bin/env node
/**
 * INSPAND-014 — PlayDeck -> Haunted Toaster/Dogram: an executable RED
 * compatibility test and a source-proved, review-only render-intent envelope.
 *
 * PlayDeck receipt != Toaster video receipt. An adapter would need to run
 * native Toaster rendering and receive actual owner-issued video evidence;
 * no field rename or guessed hashes can do that.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,lstatSync,realpathSync,mkdirSync,mkdtempSync,renameSync,rmSync,readdirSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {inspectNationalTreasure} from './national-treasure-question-crossing.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const LOCK=JSON.parse(readFileSync(join(ROOT,'registry/playdeck-toaster-red-lock-v1.json'),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
const stable=x=>JSON.stringify(x,null,2)+'\n';
const check=(x,label)=>{if(!x)throw Error('HOLD_PLAYDECK_TOASTER_'+label);};
function exec(bin,args,cwd){
 try{return execFileSync(bin,args,{cwd,encoding:'utf8',maxBuffer:8*1024*1024,timeout:120000,stdio:['ignore','pipe','pipe']}).trim();}
 catch(e){throw Error('HOLD_PLAYDECK_TOASTER_CHILD_'+String(e.stderr||e.message).slice(0,450));}
}
function location(path){
 const p=resolve(path);
 check(existsSync(p)&&lstatSync(p).isDirectory()&&!lstatSync(p).isSymbolicLink(),'ROOT_DIR');
 return realpathSync(p);
}
function ownerGit(root,...args){return exec('git',['--no-replace-objects','-C',root,...args],ROOT);}
export function inspectOriginalOwner(record,path){
 const root=location(path);
 check(ownerGit(root,'rev-parse','HEAD')===record.commit,'GIT_COMMIT_'+record.id);
 check(ownerGit(root,'remote','get-url','origin').replace(/\.git$/,'')===
  'https://github.com/'+record.repo,'GIT_ORIGIN_'+record.id);
 const status=ownerGit(root,'status','--porcelain','--untracked-files=normal').split('\n').filter(Boolean);
 check(status.every(s=>s==='?? node_modules/'||s==='?? out/'),'SOURCE_MODIFIED_'+record.id);
 const files=record.files.map(entry=>{
  const file=join(root,entry.path),bytes=readFileSync(file);
  check(realpathSync(file)===file,'SYMLINK_'+entry.path);
  const actual=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  check(ownerGit(root,'rev-parse','HEAD:'+entry.path)===entry.blob&&actual===entry.blob,
   'OWNER_BLOB_'+entry.path);
  return {path:entry.path,gitBlob:actual,sha256:sha(bytes)};
 });
 return {schema:'cannon.pinned-original-owner/v1',repository:record.repo,
  commit:record.commit,files,sourceCleanOrGeneratedOutput:true};
}
function checkSchemaRoots(){
 check(LOCK.schema==='cannon.playdeck-toaster-original-lock/v1'
  &&LOCK.owners.length===2&&LOCK.authority==='NONE'
  &&LOCK.compatibilityStatus==='NOT_YET_PROVEN','SOURCE_LOCK');
 const [playdeck,toaster]=LOCK.owners;
 check(playdeck.id==='playdeck'&&toaster.id==='toaster','LOCK_OWNERS');
 return {playdeck,toaster};
}
function originalEvidence(playdeckRoot,toasterRoot){
 const {playdeck,toaster}=checkSchemaRoots();
 const ownerPlaydeck=inspectOriginalOwner(playdeck,playdeckRoot);
 const ownerToaster=inspectOriginalOwner(toaster,toasterRoot);
 // Executes original PlayDeck source-owned projection + assertValidReceipt.
 const nativeStdout=exec('npm',['run','--silent','receipt:genesis'],playdeckRoot);
 const native=JSON.parse(nativeStdout.split('\n').at(-1));
 const path=join(playdeckRoot,'out/genesis-001-receipt.projected.json');
 const bytes=readFileSync(path);
 const receipt=JSON.parse(bytes);
 check(receipt.schemaVersion==='0.1'&&receipt.phase==='projected'
  &&native.phase==='projected'&&native.inheritable===false
  &&receipt.source?.planId==='genesis-001-composed'
  &&receipt.id==='genesis-001-receipt'&&receipt.events?.length>0
  &&receipt.carry?.held?.includes('card-09')&&(!receipt.evidence||receipt.evidence.length===0),
   'ORIGINAL_PLAYDECK_PROJECTED_ONLY');
 check(native.events===receipt.events.length,'ORIGINAL_RECEIPT_GENERATOR');
 // Execute the actual pinned Haunted Toaster source owner, not a local imitation.
 const source=join(toasterRoot,'src/full-measure/src/render/dogram-trace.cjs');
 const sourceRequire=createRequire(source);
 const {isTraceableVideoReceipt,buildDogramTraceSource}=
  sourceRequire(source);
 check(typeof isTraceableVideoReceipt==='function'
  &&typeof buildDogramTraceSource==='function','ACTUAL_TOASTER_API');
 const directlyAccepted=isTraceableVideoReceipt(receipt);
 const renamedAccepted=isTraceableVideoReceipt({...receipt,schema:'full-measure.video-receipt.v1'});
 let originalErrorCode=null;
 try{buildDogramTraceSource(receipt);}
 catch(e){originalErrorCode=e.code??e.name;}
 check(!directlyAccepted&&!renamedAccepted&&originalErrorCode==='INVALID_DOGRAM_TRACE_RECEIPT',
  'RED_REQUIRED_NATIVE_REJECTION');
 return {ownerPlaydeck,ownerToaster,receipt,receiptSha256:sha(bytes),native,
  directlyAccepted,renamedAccepted,originalErrorCode};
}
export function buildIntent(evidence){
 const r=evidence.receipt;
 check(r?.phase==='projected'&&r.schemaVersion==='0.1'
  &&evidence.directlyAccepted===false&&evidence.renamedAccepted===false
  &&evidence.originalErrorCode==='INVALID_DOGRAM_TRACE_RECEIPT','NO_BYPASS');
 const fields=[
  'source.sha256',
  'canonicalExecution.scoreAddress',
  'canonicalExecution.timelineHash',
  'render.visualCompiler.graphSha256',
  'render.transportEncoding',
  'output.sha256'
 ];
 const spec={
  schema:'cannon.playdeck-to-toaster-handoff-spec/v1',
  state:'HOLD_REQUIRES_ORIGINAL_TOASTER_RENDER',
  sourceProducer:'the-static-collective/playdeck',
  sourceConsumer:'the-static-collective/the-haunted-toaster',
  sourcePlaydeckReceiptSchema:'playdeck.PerformanceReceipt/v0.1',
  requiredToasterReceiptSchema:'full-measure.video-receipt.v1',
  originalPlaydeckReceiptId:r.id,
  originalPlaydeckReceiptSha256:evidence.receiptSha256,
  producerPhase:r.phase,producerCanInherit:false,
  originalPlanId:r.source.planId,
  sourceEvents:r.events.length,
  sourceHeldCards:[...r.carry.held],
  nativeToasterDogramRequires:fields,
  nativeDirectCastAccepted:false,
  renamedReceiptAccepted:false,
  originalToasterError:evidence.originalErrorCode,
  neededIndependentEvidence:[
   'A real PlayDeck full-performance render with independently verifiable media bytes and correct source rights',
   'Original PlayDeck receipt sealed with full-performance evidence and resolved descendants, not merely changed phase string',
   'An owner-approved Toaster render input and deterministic timeline that actually interprets the selected PlayDeck output',
   'Original Toaster-generated full-measure.video-receipt.v1 bound to real source, timeline, compiler, transport, and video output hashes',
   'Original Toaster buildDogramTraceSource acceptance of its own genuine receipt; do not cast PlayDeck fields into that type',
   'Independent cold replay under pinned owners, distinct operator approval, no automatic publication or new rights'
  ],
  bridgeImplemented:false,modelProducedRenderer:false,
  mediaBytesTransferred:false,realToasterVideoRendered:false,
  ownerApprovedAdapter:false,humanReleaseGrant:false,published:false,
  authority:'NONE'
 };
 return {...spec,specSha256:sha(stable(spec))};
}
export function nextQuestion(spec,buildOriginalQuestion){
 const input={
  clue:'PlayDeck projected receipt cannot be used as a genuine Haunted Toaster video receipt.',
  claim:'A source-owner-generated render and bound timeline would be required to build the actual missing adapter.',
  provenance_class:'speculation',support_confidence:'unsupported',
  source_locator:'',source_families:[],
  chronology:'',counterevidence:'',falsifier:'',competing_explanations:[]
 };
 const receipt=buildOriginalQuestion(input);
 check(receipt?.schema==='national-treasure.question-receipt/v0'
  &&receipt.aperture?.id==='source-object'
  &&receipt.evidence?.source_locator===''&&receipt.evidence.provenance_class==='speculation'
  &&receipt.evidence.support_confidence==='unsupported'
  &&!Object.hasOwn(receipt,'answer')&&!Object.hasOwn(receipt,'conclusion'),
  'QUESTION_NOT_VERDICT');
 return {schema:'cannon.playdeck-to-toaster-question/v1',
  originalQuestion:receipt,originalQuestionSha256:sha(JSON.stringify(receipt)),
  proposedInterfaceSpecSha256:spec.specSha256,
  nextStage:'REQUIRE_VERIFIABLE_NATIVE_TOASTER_RENDER_NOT_MODEL_GUESS',
  testFirst:'ORIGINAL_TOASTER_REJECTS_PLAYDECK_RECEIPT',
  status:'UNANSWERED',authority:'NONE'};
}
export function reviewPage(spec,question){
 const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;');
 return '<!doctype html><html lang="en"><meta charset="utf-8">'+
 '<title>INSPAND-014 | PlayDeck → Haunted Toaster original contract test</title>'+
 '<h1>Adapter hypothesis meets original software contracts</h1>'+
 '<p><strong>RED is the expected correct result:</strong> a PlayDeck projected receipt is NOT a Haunted Toaster video receipt.</p>'+
 '<p>Original PlayDeck receipt: '+escape(spec.originalPlaydeckReceiptId)+
 '</p><p>Original source error: '+escape(spec.originalToasterError)+'</p>'+
 '<h2>Missing native evidence</h2><ol>'+spec.neededIndependentEvidence.map(x=>
 '<li>'+escape(x)+'</li>').join('')+'</ol>'+
 '<h2>Original National Treasure unanswered question</h2><blockquote>'+
 escape(question.originalQuestion.question)+'</blockquote>'+
 '<p>Nothing here is a native Toaster render, an adapter, source-owner approval or release permission.</p></html>\n';
}
function parse(argv){
 const [mode,...flags]=argv;
 check(['inspect','red','build','verify'].includes(mode)&&flags.length%2===0,'USAGE');
 const opts={};
 for(let i=0;i<flags.length;i+=2){
  const k=flags[i],v=flags[i+1];
  check(['--playdeck','--toaster','--treasure','--out','--authorize'].includes(k)
   &&v&&!Object.hasOwn(opts,k),'FLAG');opts[k]=v;
 }
 if(mode==='inspect')check(Object.keys(opts).length===0,'INSPECT_READ_ONLY');
 else{
  for(const k of ['--playdeck','--toaster'])check(opts[k],'OWNER_'+k);
  if(mode==='red')check(!opts['--out']&&!opts['--treasure']&&!opts['--authorize'],'RED_NO_OUTPUT');
  else{
   for(const k of ['--out','--treasure'])check(opts[k],'REQUIRED_'+k);
   check(mode==='build'?opts['--authorize']==='SYNTHETIC_TEST_ONLY':!opts['--authorize'],
    'LOCAL_AUTHORIZATION');
  }
 }
 return {mode,opts};
}
export async function run(argv){
 const {mode,opts}=parse(argv);
 if(mode==='inspect')return {schema:LOCK.schema,
  producer:LOCK.owners[0].repo,consumer:LOCK.owners[1].repo,
  status:'HOLD_MISSING_RENDER_EVIDENCE',operation:'READ_ONLY'};
 const evidence=originalEvidence(location(opts['--playdeck']),location(opts['--toaster']));
 if(mode==='red'){
  // This command must fail in CI: proves the actual original Dogram validator
  // refuses PlayDeck receipts and field-rename attempts.
  throw Error('EXPECTED_RED_ORIGINAL_TOASTER_REJECTS_PLAYDECK_PERFORMANCE_RECEIPT');
 }
 const ownerQuestion=inspectNationalTreasure(opts['--treasure']);
 const {buildQuestionFrontier}=await import(pathToFileURL(join(location(opts['--treasure']),
  'tools/question-box/engine.mjs')).href);
 const spec=buildIntent(evidence);
 const question=nextQuestion(spec,buildQuestionFrontier);
 const core={schema:'cannon.playdeck-toaster-red-experiment/v1',
  status:'ORIGINAL_OWNER_INCOMPATIBILITY_PROVEN__ADAPTER_NOT_IMPLEMENTED',
  originalOwners:[evidence.ownerPlaydeck,evidence.ownerToaster],
  originalNationalTreasureSource:ownerQuestion,
  playdeckReceiptSha256:evidence.receiptSha256,
  nativePlaydeckProofExecuted:true,
  toasterOriginalDogramTestWasRed:true,
  directCastRejected:true,schemaRenameRejected:true,
  adapterStatus:'HOLD_NOT_CONNECTED',newNativeVideoEvidence:null,
  generatedCodeExecuted:false,sourceOwnerApproval:false,externalActions:0};
 const report={...core,receiptSha256:sha(stable(core))};
 const files={'playdeck-projected-receipt.json':evidence.receipt,
  'interface-spec.json':spec,'next-question.json':question,
  'test-receipt.json':report,'review.html':reviewPage(spec,question)};
 const out=resolve(opts['--out']),parent=location(dirname(out));
 check(join(parent,basename(out))===out,'OUTPUT_PARENT');
 check(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const tmp=mkdtempSync(join(parent,'.red-adapter-'));
 try{
  const dest=mode==='build'?join(tmp,'packet'):out;
  if(mode==='build')mkdirSync(dest);
  for(const [name,value] of Object.entries(files)){
   const bytes=typeof value==='string'?value:stable(value);
   if(mode==='build')writeFileSync(join(dest,name),bytes,{flag:'wx'});
   else check(readFileSync(join(dest,name),'utf8')===bytes,'COLD_TAMPER_'+name);
  }
  if(mode==='verify')check(readdirSync(dest).sort().join('|')===
   Object.keys(files).sort().join('|'),'EXTRA_FILES');
  if(mode==='build')renameSync(dest,out);
  return {status:mode==='build'?'RED_ORIGINAL_OWNER_EXPECTED__SPEC_HELD':'RED_OWNER_AND_SPEC_COLD_REPLAY',
   adapterImplemented:false,originalPlaydeckReceiptPhase:'projected',
   originalToasterRejectsPlaydeck:true,sourceOwnerQuestion:question.originalQuestion.aperture.id,
   sourceReceiptSha256:evidence.receiptSha256,reportSha256:report.receiptSha256,
   originalNativeVideoCreated:false,realWorldActions:0};
 }finally{rmSync(tmp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 run(process.argv.slice(2)).then(r=>console.log(stable(r)))
  .catch(e=>{console.error(String(e.message||e));process.exitCode=2;});
}
