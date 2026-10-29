#!/usr/bin/env node
/**
 * INSPAND-010 — source-first typed hypothesis compiler.
 * Answers questions about interfaces by examining original CANNON source,
 * never by asking a weak language model to guess exact tokens.
 *
 * A composed receipt proves an authorized local synthetic software experiment;
 * it does not constitute a real-world action, adoption, release or rights.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,renameSync,rmSync,existsSync,lstatSync,realpathSync,readdirSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {extractActualContract} from './real-contract-compass.mjs';
import {validateCompositionRegistry} from './reflex-composer.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const sha=x=>createHash('sha256').update(x).digest('hex');
const encode=x=>JSON.stringify(x,null,2)+'\n';
function requireTrue(ok,label){if(!ok)throw Error('HOLD_TRUTH_COMPILER_'+label);}
const noHeaders=/^(?:FACT|IDEA|RELATION|SOURCE|ADAPTER|ASK)\s/;
const count=line=>line.trim().split(/\s+/).filter(Boolean).length;
const parentDir=path=>{
 const d=resolve(path);requireTrue(existsSync(d)&&lstatSync(d).isDirectory()
  &&!lstatSync(d).isSymbolicLink(),'DIRECTORY');
 return realpathSync(d);
};
const oneLine=(text)=>{requireTrue(typeof text==='string'&&!/\s/.test(text),'IDENTIFIER');return text;};

/** This is an intentionally tiny and strict typed compiler.
 * No model-produced schema, adapter IDs or code are accepted.
 */
export function compileTruth(){
 const actual=extractActualContract();
 const task=actual.task;
 const catalog=JSON.parse(readFileSync(join(ROOT,'registry/reflex-library-v1.json'),'utf8'));
 const raw=readFileSync(join(ROOT,'registry/reflex-compositions-v1.json'));
 const registry=JSON.parse(raw);
 const recipe=validateCompositionRegistry(registry);
 requireTrue(catalog.schema==='cannon.reflex-library/v1'&&catalog.authority==='EXPERIMENT_HOLD','CATALOG');
 requireTrue(recipe.id===task.recipeId&&recipe.edges.length===1
  &&recipe.stages.length===2,'SOURCE_RECIPE');
 const [producer,consumer]=recipe.stages;
 const edge=recipe.edges[0];
 const knownProducer=catalog.capabilities.find(x=>x.id===producer.capability);
 const knownConsumer=catalog.capabilities.find(x=>x.id===consumer.capability);
 requireTrue(knownProducer?.status==='SOURCE_NATIVE_REPLAYED'
  &&knownConsumer?.status==='SOURCE_NATIVE_REPLAYED','SOURCE_CAPABILITIES');
 requireTrue(producer.outputPort===task.producer.outputPort&&consumer.inputPort===task.consumer.inputPort
  &&edge.adapter===task.edge.adapter&&edge.field===task.edge.field,'CONTRACT_BOUND');
 requireTrue(producer.outputPort!==consumer.inputPort,'DIRECT_MISMATCH_EXPECTED');
 requireTrue(task.producer.outputPort==='cannon.reflex-memory/v1'
  &&task.consumer.inputPort==='planz.generated-plan/v1'
  &&task.edge.adapter==='VERIFIED_RECEIPT_PLAN_ID_V1'
  &&task.edge.field==='reusableRecipe.planId','EXACT_REGISTERED_ADAPTER');
 const owner=readFileSync(join(ROOT,'scripts/reflex-composer.mjs'),'utf8');
 requireTrue(owner.includes('export function handoffFromProof(')
  &&owner.includes("memory.reusableRecipe.planId===choice.planId")
  &&owner.includes("field:'reusableRecipe.planId'")
  &&owner.includes("adapter:'VERIFIED_RECEIPT_PLAN_ID_V1'"),'SOURCE_CODE_ADAPTER');
 const evidence={
  schema:'cannon.truth-compass-evidence/v1',
  sourceOwner:'the-static-collective/CANNON',
  sourceFiles:['registry/reflex-library-v1.json',
   'registry/reflex-compositions-v1.json','scripts/reflex-composer.mjs'],
  compositionSha256:sha(raw),
  catalogSha256:sha(readFileSync(join(ROOT,'registry/reflex-library-v1.json'))),
  ownerRunnerSha256:sha(owner),
  originalRecipeId:recipe.id,
  nativeProducerReceiptType:knownProducer.output.type,
  wrapperProducerType:producer.outputPort,
  receiverRequiredType:consumer.inputPort,
  originalSourceVerified:true
 };
 // Meaning-bearing dyad statements, NOT labels pretending to contain facts.
 const card=[
  oneLine(producer.id)+' produces',
  oneLine(producer.outputPort)+' memory',
  oneLine(consumer.id)+' expects',
  oneLine(consumer.inputPort)+' input',
  'These ports','cannot connect',
  'A bridge','could translate',
  oneLine(edge.adapter)+' connects',
  oneLine(edge.field)+' identity',
  'Source verifies','that bridge',
  'You inspect','the crossing'
 ];
 requireTrue(card.every(s=>count(s)>=2&&count(s)<=3&&!noHeaders.test(s)),'MEANING_CARDS');
 const decisions=['ADAPTED','DIRECT_ONLY'].map(caseId=>{
  const adapted=caseId==='ADAPTED';
  const core={
   schema:'cannon.truth-compass-decision/v1',caseId,
   originalInterface:{producer:producer.capability,outputPort:producer.outputPort,
    consumer:consumer.capability,inputPort:consumer.inputPort},
   sourceEvidenceSha256:sha(encode(evidence)),
   directPortMatch:false,
   adapterAvailableForThisCase:adapted,
   adapter:adapted?edge.adapter:null,
   sourceReceiptField:adapted?edge.field:null,
   status:adapted?'TESTABLE_WITH_OPERATOR_AUTHORIZATION':'HOLD_DIRECT_TYPE_MISMATCH',
   testMayProceed:adapted,
   onlyPermittedAuthorization:adapted?'SYNTHETIC_TEST_ONLY':null,
   sourceCaseIsReal:adapted,
   counterfactual:!adapted,
   newModelExecutable:null,
   nativeExecuted:false,
   noHumanApprovalInferred:true
  };
  return {...core,decisionSha256:sha(encode(core))};
 });
 const core={schema:'cannon.truth-first-compiler/v1',
  kind:'DETERMINISTIC_SOURCE_CONTRACT_NOT_MODEL_INFERENCE',
  evidence,dyadLines:card,decisions,
  generatedSoftwareCapabilities:0,automaticallySelectedActions:0,
  publisherPermission:false,modelAuthority:'NONE'};
 return {...core,compilerSha256:sha(encode(core))};
}
export function inspectTruth(packet){
 requireTrue(packet?.schema==='cannon.truth-first-compiler/v1'
  &&packet.kind==='DETERMINISTIC_SOURCE_CONTRACT_NOT_MODEL_INFERENCE'
  &&packet.generatedSoftwareCapabilities===0
  &&packet.automaticallySelectedActions===0&&!packet.publisherPermission
  &&packet.modelAuthority==='NONE','UNTRUSTED_TRUTH');
 const {compilerSha256,...core}=packet;
 requireTrue(compilerSha256===sha(encode(core)),'COMPILER_HASH');
 const canonical=compileTruth();
 requireTrue(encode(packet)===encode(canonical),'SOURCE_CONTRACT_CHANGED');
 return true;
}
function executable(mode,opts,nativeOut){
 const argv=[join(ROOT,'scripts/reflex-composer.mjs'),mode,
  '--recipe','plan-proof-to-pixels-and-print/v1',
  '--plan',opts['--plan'],'--planz',parentDir(opts['--planz']),
  '--roots',resolve(opts['--roots']),'--out',nativeOut];
 if(mode==='build')argv.push('--authorize','SYNTHETIC_TEST_ONLY');
 let result;
 try{
  result=JSON.parse(execFileSync(process.execPath,argv,{cwd:ROOT,
   encoding:'utf8',timeout:420000,stdio:['ignore','pipe','pipe'],maxBuffer:10*1024*1024}));
 }catch(e){throw Error('HOLD_TRUTH_COMPILER_NATIVE_'+String(e.stderr||e.message).slice(0,600));}
 requireTrue(result.stages===2&&result.realWorldActions===0
  &&result.recipeId==='plan-proof-to-pixels-and-print/v1'
  &&result.planId===opts['--plan'],'NATIVE_RESULT');
 return result;
}
function nativeReceipt(dir,truth,native,plan){
 const typed=JSON.parse(readFileSync(join(dir,'handoff.json'),'utf8'));
 const receipt=JSON.parse(readFileSync(join(dir,'receipt.json'),'utf8'));
 const expected=truth.decisions[0];
 requireTrue(typed.adapter===expected.adapter&&typed.field===expected.sourceReceiptField
  &&typed.producer.outputPort===expected.originalInterface.outputPort
  &&typed.consumer.inputPort===expected.originalInterface.inputPort
  &&typed.boundPlanId===plan&&typed.authority==='LOCAL_SYNTHETIC_ONLY'
  &&typed.humanKeep===false&&typed.fieldWitness===false,'NATIVE_TYPED_HANDOFF');
 requireTrue(receipt.receiptSha256===native.receiptSha256&&receipt.stages.length===2
  &&receipt.handoffSha256===typed.handoffSha256
  &&receipt.publication===false&&receipt.sourceAdmission===false
  &&receipt.realWorldOutcomes===0,'NATIVE_EVIDENCE');
 const core={
  schema:'cannon.truth-first-native-proof/v1',
  sourceCompilerSha256:truth.compilerSha256,
  originalRecipeId:'plan-proof-to-pixels-and-print/v1',
  originalHandoffSha256:typed.handoffSha256,
  originalNativeReceiptSha256:receipt.receiptSha256,
  originalNativeMediaSha256:receipt.stages.map(x=>x.videoSha256),
  testOnly:true,explicitOperatorAuthorization:true,
  authorizedCase:'ADAPTED',
  directOnlyCase:'HOLD_DIRECT_TYPE_MISMATCH',
  generatedProgramExecuted:false,
  selfIssuedRights:false,publication:false,realWorldOutcomes:0,
  measuredTimeSavedSeconds:null
 };
 return {...core,proofSha256:sha(encode(core))};
}
function parse(args){
 const [mode,...rest]=args;requireTrue(['inspect','build','verify'].includes(mode)&&rest.length%2===0,'USAGE');
 const opts={};
 for(let i=0;i<rest.length;i+=2){
  const k=rest[i],v=rest[i+1];
  requireTrue(['--plan','--planz','--roots','--out','--authorize','--case'].includes(k)
   &&v&&!Object.hasOwn(opts,k),'FLAG');opts[k]=v;
 }
 if(mode==='inspect')requireTrue(Object.keys(opts).length===0,'READ_ONLY');
 else{
  for(const key of ['--plan','--planz','--roots','--out','--case'])
   requireTrue(opts[key],'MISSING_'+key);
  requireTrue(opts['--case']==='ADAPTED','NO_UNADAPTED_EXECUTION');
  requireTrue(/^plan-[a-f0-9]{24}$/.test(opts['--plan']),'PLAN_ID');
  requireTrue(mode==='build'?opts['--authorize']==='SYNTHETIC_TEST_ONLY':!opts['--authorize'],'AUTHORIZATION');
 }
 return {mode,opts};
}
export function run(args){
 const {mode,opts}=parse(args),truth=compileTruth();
 if(mode==='inspect')return truth;
 const out=resolve(opts['--out']),parent=parentDir(dirname(out));
 requireTrue(out===join(parent,basename(out)),'OUTPUT_PATH');
 requireTrue(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATUS');
 const tmp=mkdtempSync(join(parent,'.truth-first-'));
 try{
  const target=mode==='build'?join(tmp,'packet'):out;
  if(mode==='build')mkdirSync(target);
  const nativeDir=join(target,'native-composition');
  const result=executable(mode,opts,nativeDir);
  const proof=nativeReceipt(nativeDir,truth,result,opts['--plan']);
  const files={'typed-truth.json':truth,
   'native-proof.json':proof,
   'review.txt':[
    'SOURCE VERIFIED — NOT MODEL GUESSED',
    ...truth.dyadLines,
    'Direct type check: HOLD_DIRECT_TYPE_MISMATCH',
    'Existing original adapter: TESTABLE_WITH_OPERATOR_AUTHORIZATION',
    'Original owner-native two-stage receipt: '+result.receiptSha256,
    'Only synthetic test authorized. No publication, human assent, or real-world outcome.',
    ''
   ].join('\n')};
  for(const [file,payload] of Object.entries(files)){
   const bytes=typeof payload==='string'?payload:encode(payload);
   if(mode==='build')writeFileSync(join(target,file),bytes,{flag:'wx'});
   else requireTrue(readFileSync(join(target,file),'utf8')===bytes,'REPLAY_'+file);
  }
  if(mode==='verify')requireTrue(readdirSync(target).sort().join('|')===
   [...Object.keys(files),'native-composition'].sort().join('|'),'EXTRA_OUTPUT');
  if(mode==='build')renameSync(target,out);
  return {status:mode==='build'?'TRUTH_FIRST_NATIVE_COMPOSITION_HELD':'TRUTH_FIRST_FULL_COLD_REPLAY',
   compilerSha256:truth.compilerSha256,
   nativeReceiptSha256:result.receiptSha256,
   knownAdapter:truth.decisions[0].adapter,
   directOnly:truth.decisions[1].status,
   verifiedOriginalNativeStages:2,realWorldActions:0,autoGeneratedExecutableCount:0};
 }finally{rmSync(tmp,{force:true,recursive:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(encode(run(process.argv.slice(2))))}
 catch(e){console.error(String(e.message||e).slice(0,1300));process.exitCode=2;}
}
