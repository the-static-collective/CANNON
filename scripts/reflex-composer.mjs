#!/usr/bin/env node
// INSPAND-004: real typed, replayable, human-gated composition.
// Two original reflexes execute in source order. The second reads the first's
// VERIFIED plan identity, not a separate guess or an invented interface.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,renameSync,rmSync,existsSync,realpathSync,lstatSync,readdirSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(import.meta.dirname,'..');
const REG=join(ROOT,'registry/reflex-compositions-v1.json');
const RUNNER=join(ROOT,'scripts/reflex-library.mjs');
const fixedId='plan-proof-to-pixels-and-print/v1';
const fixedIds=['film-press-synthetic-selection/v1','film-press-plan-shaped/v1'];
const sha=x=>createHash('sha256').update(x).digest('hex');
const encode=x=>JSON.stringify(x,null,2)+'\n';
function need(ok,label){if(!ok)throw Error('HOLD_COMPOSER_'+label);}
export function validateCompositionRegistry(data){
 need(data?.schema==='cannon.reflex-compositions/v1'&&data.authority==='REVIEW_ONLY_SYNTHETIC'
  &&data.executableRecipeCount===1&&data.recipes?.length===1,'REGISTRY');
 const r=data.recipes[0];
 need(r.id===fixedId&&r.status==='EXPLICIT_APPROVAL_REQUIRED'
  &&r.result==='cannon.reflex-composition/v1','RECIPE');
 need(r.stages?.length===2&&r.stages.every((s,i)=>s.id===(i===0?'SOURCE_PROOF':'VISUAL_STUDY')
  &&s.capability===fixedIds[i]&&s.inputPort==='planz.generated-plan/v1'
  &&s.outputPort==='cannon.reflex-memory/v1'),'STAGE_PORT');
 need(r.edges?.length===1&&r.edges[0].from==='SOURCE_PROOF'
  &&r.edges[0].to==='VISUAL_STUDY'
  &&r.edges[0].outputPort==='cannon.reflex-memory/v1'
  &&r.edges[0].field==='reusableRecipe.planId'
  &&r.edges[0].adapter==='VERIFIED_RECEIPT_PLAN_ID_V1'
  &&r.edges[0].inputPort==='planz.generated-plan/v1','UNVERIFIED_EDGE');
 need(r.constraints?.maxStages===2&&r.constraints.autonomy===false
  &&r.constraints.publish===false&&r.constraints.physical===false
  &&r.constraints.humanContact===false&&r.constraints.realWorldOutcomes===0
  &&r.constraints.timeSavedSeconds===null,'POLICY_PROMOTION');
 need(data.policies?.recipeDiscoveryDoesNotExecute===true
  &&data.policies.unknownInterfacesMustHold===true,'DISCOVERY_POLICY');
 return r;
}
export function handoffFromProof(memory,choice,requestedPlan){
 need(typeof requestedPlan==='string'&&/^plan-[a-f0-9]{24}$/.test(requestedPlan),'PLAN_ID');
 need(memory?.schema==='cannon.reflex-memory/v1'
  &&memory.status==='SOURCE_VERIFIED_EXECUTION_HELD'
  &&memory.publication===false&&memory.adoption===false
  &&memory.realWorldWitnesses===0&&memory.humanTimeSavedSeconds===null,'PROOF_AUTHORITY');
 need(choice?.schema==='cannon.reflex-choice/v1'
  &&choice.capabilityId===fixedIds[0]&&choice.planId===requestedPlan
  &&choice.humanKeep===false&&choice.publication===false
  &&choice.receiverAdmission===false,'PROOF_CHOICE');
 need(memory.reusableRecipe?.capabilityId===fixedIds[0]
  &&memory.reusableRecipe.planId===choice.planId
  &&memory.reusableRecipe.requiresExplicitNewAuthorization===true
  &&memory.reusableRecipe.ownerRunner==='scripts/inspand-reflex.mjs','PROOF_RECIPE');
 need(typeof memory.memorySha256==='string'&&/^[a-f0-9]{64}$/.test(memory.memorySha256),'PROOF_ID');
 const {memorySha256,...body}=memory;
 need(memory.memorySha256===sha(encode(body)),'PROOF_HASH');
 need(memory.choiceSha256===sha(encode(choice)),'CHOICE_HASH');
 const core={
  schema:'cannon.reflex-typed-handoff/v1',
  producer:{capabilityId:fixedIds[0],outputPort:'cannon.reflex-memory/v1',
    memorySha256:memory.memorySha256},
  adapter:'VERIFIED_RECEIPT_PLAN_ID_V1',
  field:'reusableRecipe.planId',
  boundPlanId:memory.reusableRecipe.planId,
  consumer:{capabilityId:fixedIds[1],inputPort:'planz.generated-plan/v1'},
  authority:'LOCAL_SYNTHETIC_ONLY',humanKeep:false,fieldWitness:false
 };
 return {...core,handoffSha256:sha(encode(core))};
}
function runNative(mode,id,plan,roots,planz,out){
 const args=[RUNNER,mode,'--capability',id,'--plan',plan,
  '--planz',planz,'--roots',roots,'--out',out];
 if(mode==='build')args.push('--authorize','SYNTHETIC_TEST_ONLY');
 let stdout;
 try{stdout=execFileSync(process.execPath,args,{cwd:ROOT,encoding:'utf8',
    timeout:300000,maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});}
 catch(e){throw Error('HOLD_COMPOSER_NATIVE_'+id+':'+String(e.stderr||e.message).slice(0,900));}
 const result=JSON.parse(stdout);
 need(result.capabilityId===id&&result.planId===plan&&result.authority==='LOCAL_SYNTHETIC_ONLY'
  &&result.humanTimeSavedSeconds===null,'NATIVE_RESULT');
 return result;
}
function readStage(dir){
 const memory=JSON.parse(readFileSync(join(dir,'library-memory.json'),'utf8'));
 const choice=JSON.parse(readFileSync(join(dir,'library-choice.json'),'utf8'));
 const cap=JSON.parse(readFileSync(join(dir,'library-capability.json'),'utf8'));
 const nativeCap=JSON.parse(readFileSync(join(dir,'native/capability.json'),'utf8'));
 need(cap?.id&&cap.owner==='CANNON'&&cap.runner==='scripts/inspand-reflex.mjs'&&cap.registrySha256,'CAPABILITY_SHAPE');
 need(nativeCap.schema==='cannon.inspand-capability/v1'&&nativeCap.id===cap.id,'NATIVE_CAPABILITY_ID');
 return {memory,choice,cap,nativeCap};
}
function escapeHTML(t){return String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
function composedPacket(recipe,registrySha,first,second,handoff){
 need(second.memory?.status==='SOURCE_VERIFIED_EXECUTION_HELD'
  &&second.choice?.capabilityId===fixedIds[1]
  &&second.choice.planId===handoff.boundPlanId
  &&second.memory.reusableRecipe?.planId===handoff.boundPlanId
  &&second.cap?.output?.planContentAffectsNativePixels===true
  &&second.nativeCap?.mediaInputsDerivedFromPlan===true,'SECOND_NOT_SHAPED');
 need(first.memory.observedOutputs?.nativeSilentVideoSha256
  &&second.memory.observedOutputs?.nativeSilentVideoSha256,'MISSING_OWNER_BYTES');
 need(first.memory.observedOutputs.nativeSilentVideoSha256!==second.memory.observedOutputs.nativeSilentVideoSha256,
  'NO_MATERIAL_COMPOSITION_DIFFERENCE');
 const core={
  schema:'cannon.reflex-composition/v1',recipe:recipe.id,registrySha256:registrySha,
  stages:[
   {id:'SOURCE_PROOF',capabilityId:fixedIds[0],memorySha256:first.memory.memorySha256,
    videoSha256:first.memory.observedOutputs.nativeSilentVideoSha256},
   {id:'VISUAL_STUDY',capabilityId:fixedIds[1],memorySha256:second.memory.memorySha256,
    videoSha256:second.memory.observedOutputs.nativeSilentVideoSha256}
  ],
  handoffSha256:handoff.handoffSha256,
  publication:false,realWorldOutcomes:0,humanKeep:false,measuredHumanTimeSavedSeconds:null,
  sourceAdmission:false,manufacturing:false
 };
 const receipt={...core,receiptSha256:sha(encode(core))};
 const proof={schema:'cannon.reflex-editorial-card/v1',kind:'PRINTABLE_REVIEW_CARD_NOT_OWNER_NATIVE_PRINT',
  recipe:recipe.id,sourcePlanId:handoff.boundPlanId,
  firstNativeVideoSha256:core.stages[0].videoSha256,
  secondNativeVideoSha256:core.stages[1].videoSha256,
  proofReceiptSha256:receipt.receiptSha256,
  authorization:'HOLD_NOT_PUBLISHABLE',humanStewards:0,
  sourceLinked:true,fieldOutcome:false};
 const html='<!doctype html><html lang="en"><meta charset="utf-8">'+
  '<title>INSPAND-004 | Review Only</title><h1>Plan → source proof → visual study</h1>'+
  '<p><strong>FICTIONAL SYNTHETIC SOFTWARE STUDY. NOT FOR RELEASE, MANUFACTURE OR REAL-WORLD CLAIMS.</strong></p>'+
  '<p>Selected original plan: <code>'+escapeHTML(proof.sourcePlanId)+'</code></p>'+
  '<p>Independent native source proof: <code>'+escapeHTML(proof.firstNativeVideoSha256)+'</code></p>'+
  '<p>Plan-shaped native visual: <code>'+escapeHTML(proof.secondNativeVideoSha256)+'</code></p>'+
  '<p>Joint receipt: <code>'+escapeHTML(proof.proofReceiptSha256)+'</code></p>'+
  '<p>CANNON editorial test page; not original lemonPRESS press-ready output.</p>\n';
 return {'recipe.json':recipe,'handoff.json':handoff,'receipt.json':receipt,
  'print/inspection-card.json':proof,'print/inspection-card.html':html};
}
function parse(args){
 const [mode,...remaining]=args;
 need(['list','build','verify'].includes(mode)&&remaining.length%2===0,'USAGE');
 const opts={};
 for(let i=0;i<remaining.length;i+=2){
  const k=remaining[i],v=remaining[i+1];
  need(['--recipe','--plan','--roots','--planz','--out','--authorize'].includes(k)
    &&v&&!Object.hasOwn(opts,k),'ARGS');
  opts[k]=v;
 }
 if(mode==='list')need(Object.keys(opts).length===0,'LIST_MUST_BE_READ_ONLY');
 else{
  for(const p of ['--recipe','--plan','--roots','--planz','--out'])need(opts[p],'MISSING_'+p);
  need(opts['--recipe']===fixedId,'UNKNOWN_RECIPE');
  need(mode==='build'?opts['--authorize']==='SYNTHETIC_TEST_ONLY':!opts['--authorize'],'AUTHORIZATION');
 }
 return {mode,opts};
}
export function run(args){
 const {mode,opts}=parse(args);
 const registryBytes=readFileSync(REG),registry=JSON.parse(registryBytes);
 const recipe=validateCompositionRegistry(registry);
 const registrySha=sha(registryBytes);
 if(mode==='list')return {schema:'cannon.reflex-composition-list/v1',authority:'NONE',
  registrySha256:registrySha,recipes:[{id:recipe.id,title:recipe.title,
  stages:recipe.stages,edges:recipe.edges,constraints:recipe.constraints}]};
 need(/^plan-[a-f0-9]{24}$/.test(opts['--plan']),'PLAN_ID');
 const out=resolve(opts['--out']),parent=realpathSync(dirname(out));
 need(out===join(parent,basename(out)),'OUTPUT_PATH');
 need(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()
  &&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const tmp=mkdtempSync(join(parent,'.reflex-compose-'));
 try{
  const destination=mode==='build'?join(tmp,'packet'):out;
  if(mode==='build')mkdirSync(destination);
  const stage1=join(destination,'source-proof'),stage2=join(destination,'visual-study');
  const planz=resolve(opts['--planz']),roots=resolve(opts['--roots']);
  runNative(mode,fixedIds[0],opts['--plan'],roots,planz,stage1);
  const first=readStage(stage1);
  const handoff=handoffFromProof(first.memory,first.choice,opts['--plan']);
  // The downstream plan ID is now sourced solely from the verified upstream
  // retained receipt; this is an actual typed and checked data/control edge.
  runNative(mode,fixedIds[1],handoff.boundPlanId,roots,planz,stage2);
  const second=readStage(stage2);
  const packet=composedPacket(recipe,registrySha,first,second,handoff);
  const expected=['recipe.json','handoff.json','receipt.json','print','source-proof','visual-study'];
  if(mode==='verify')need(readdirSync(destination).sort().join('|')===expected.sort().join('|'),'EXTRA_FILES');
  for(const [p,value] of Object.entries(packet)){
   const file=join(destination,p),bytes=typeof value==='string'?value:encode(value);
   if(mode==='build'){mkdirSync(dirname(file),{recursive:true});writeFileSync(file,bytes,{flag:'wx'});}
   else need(readFileSync(file,'utf8')===bytes,'TAMPER_'+p);
  }
  if(mode==='verify')need(readdirSync(join(destination,'print')).sort().join('|')===
   ['inspection-card.json','inspection-card.html'].sort().join('|'),'EXTRA_PRINT');
  if(mode==='build')renameSync(destination,out);
  return {status:mode==='build'?'TWO_NATIVE_CAPABILITIES_COMPOSED_HOLD':'TYPED_COLD_REPLAY_VERIFIED',
   recipeId:recipe.id,planId:handoff.boundPlanId,receiptSha256:packet['receipt.json'].receiptSha256,
   stages:2,derivedPrintOwner:'CANNON_EDITORIAL_ONLY',realWorldActions:0};
 }finally{rmSync(tmp,{force:true,recursive:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(encode(run(process.argv.slice(2))))}
 catch(e){console.error(String(e.message||e).slice(0,2000));process.exitCode=2}
}
