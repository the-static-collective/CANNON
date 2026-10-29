#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,renameSync,rmSync,existsSync,realpathSync,lstatSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
const ROOT=resolve(import.meta.dirname,'..');
const PLAN_PIN='64ed8a376acd63a5d630e1649b6001fb3b3251de';
const FILM_BLOB='f10db56426d67ba4cef51ef603cb26c9f5b3c124';
const PLAN_BLOBS={
 'reactor/recursive.mjs':'3d7c9fc075e4b1c81786b91645b6312e57b6bfce',
 'reactor/collide.mjs':'0a7a5d7447e4c914f65bd1b4212ba6485da21a49',
 'reactor/recipes-v0.json':'c87151a618c0ae238ba2c87dd99688ab23d0026b',
 'registry/conversation-plan-records-2026-10-16.jsonl':'7796c9f34e76bbeb9299c803b134a2ff086e90c8'
};
const hash=v=>createHash('sha256').update(v).digest('hex');
const canonical=v=>JSON.stringify(v,null,2)+'\n';
const need=(v,s)=>{if(!v)throw Error('HOLD_INSPAND_'+s);};
function command(exe,args,opts={}) {
 try {return execFileSync(exe,args,{encoding:'utf8',timeout:300000,maxBuffer:24*1024*1024,stdio:['ignore','pipe','pipe'],...opts}).trim();}
 catch(e){throw Error('HOLD_INSPAND_EXEC_'+String(e.stderr||e.message).slice(0,900));}
}
const git=(dir,...args)=>command('git',['-C',dir,...args]);
function verifyOwner(path) {
 const root=realpathSync(path);
 need(git(root,'rev-parse','HEAD')===PLAN_PIN,'PLANZ_COMMIT');
 need(/github\.com[:/]the-static-collective\/planZ(?:\.git)?$/.test(git(root,'remote','get-url','origin')),'PLANZ_ORIGIN');
 need(git(root,'status','--porcelain','--untracked-files=all')==='','PLANZ_DIRTY');
 for(const [p,s] of Object.entries(PLAN_BLOBS))need(git(root,'rev-parse','HEAD:'+p)===s,'PLANZ_BLOB_'+p);
 need(git(ROOT,'rev-parse','HEAD:scripts/film-press-crossing.mjs')===FILM_BLOB,'CANNON_NATIVE_BLOB');
 return root;
}
function objectAddress(o,prefix){
 need(typeof o?.id==='string','ADDRESS_MISSING');
 const {id,...payload}=o;
 need(id===prefix+'-'+hash(JSON.stringify(payload)).slice(0,24),'ADDRESS_FORGED');
}
export function validateManifest(m){
 need(m?.schema==='static-collective/planz-recursive-reactor/v1/manifest','MANIFEST_SCHEMA');
 const {manifestSha256,...body}=m;
 need(manifestSha256===hash(JSON.stringify(body)),'MANIFEST_DIGEST');
 need(m.parameters?.depth===1&&m.parameters?.crossLimit===0,'RECURSION_LIMITS');
 need(m.source?.evidenceLevel==='LOW/UNKNOWN conversation reconstruction','SOURCE_CONFIDENCE');
 const all=[...(m.roots||[]),...(m.cuts||[]),...(m.proposedPlans||[])];
 need(m.roots?.length===8&&m.cuts?.length===32&&m.proposedPlans?.length===8,'COUNT');
 need(new Set(all.map(o=>o.id)).size===all.length,'DUPLICATES');
 const byId=new Map(all.map(o=>[o.id,o]));
 for(const r of m.roots)objectAddress(r,'src');
 for(const c of m.cuts)objectAddress(c,'cut');
 for(const p of m.proposedPlans)objectAddress(p,'plan');
 for(const o of all){
  need(o.authority==='NONE'&&o.executed===false&&o.admitted===false&&o.published===false&&o.status==='PROPOSED_UNVERIFIED','AUTHORITY');
  need(o.sourceDigest===m.source.ancestorOutputSha256,'SOURCE_DIGEST');
 }
 for(const c of m.cuts)need(byId.has(c.parentId)&&c.generation===1,'CUT_PARENT');
 for(const p of m.proposedPlans){
  need(p.kind==='LENS_SYNTHESIS'&&p.generation===1&&p.parentIds?.length===1,'PROPOSAL_KIND');
  need(byId.has(p.parentIds[0])&&p.cutIds?.length===4,'PROPOSAL_PARENT');
  for(const id of p.cutIds)need(byId.get(id)?.parentId===p.parentIds[0],'CUT_LINK');
 }
 return m;
}
export function selectPlan(m,id,route='film-press-synthetic-selection/v1'){
 validateManifest(m);
 need(/^plan-[a-f0-9]{24}$/.test(id||''),'EXPLICIT_PLAN_ID');
 const plan=m.proposedPlans.find(p=>p.id===id);
 need(plan,'UNKNOWN_PLAN');
 const root=m.roots.find(r=>r.id===plan.parentIds[0]);
 need(
 route==='film-press-plan-shaped/v1'
 ? ['RHYTHM-MUTANT','ORCHARD-CINEMA'].includes(root?.chamberId)
 : root?.chamberId==='RHYTHM-MUTANT',
 'UNPROVEN_PLAN_ROUTE');
 return {plan,root};
}
function manifest(root){
 return validateManifest(JSON.parse(command(process.execPath,[join(root,'reactor/recursive.mjs'),
 '--depth','1','--cross-limit','0','--format','json'],{cwd:root})));
}
// Maps actual immutable plan fields into native Toaster seed and PlayDeck provenance.
// The native owner still makes its own original six sigils and physical pixels.
export function buildMediaBinding(m,plan){
 const {plan:selected,root}=selectPlan(m,plan.id,'film-press-plan-shaped/v1');
 const cuts=selected.cutIds.map(id=>m.cuts.find(c=>c.id===id));
 need(cuts.every(Boolean),'MISSING_CUT');
 const byLens=cuts.map(c=>({lens:c.lensId,pressure:c.pressureQuestion,stop:c.stopCondition}))
   .sort((a,b)=>a.lens.localeCompare(b.lens));
 need(byLens.map(x=>x.lens).join(',')==='ABSENCE,CARRIER,RECEIVER,TIME','FOUR_LENSES');
 const cues={sourceQuestion:root.question,sourceSmallestProof:root.smallestProof,
   selectedQuestion:selected.question,selectedSmallestProof:selected.smallestProof,
   lensQuestions:byLens};
 const core={
  schema:'cannon.inspand-plan-binding/v1',
  planId:selected.id,planSha256:hash(canonical(selected)),sourceRootId:root.id,
  sourceRootSha256:hash(canonical(root)),manifestSha256:m.manifestSha256,
  chamber:root.chamber,cuts:byLens.map(c=>c.lens),
  // Content is source-backed and deliberately deterministic, NOT semantic understanding.
  cues,algorithm:'SHA256_CANONICAL_PLAN_CUES_TO_NATIVE_SIGIL_SEED_V1',
  mediaAuthority:'SYNTHETIC_ONLY',ownerPermissions:'NONE'
 };
 // Use the original root chamber identity; no project name-based join.
 core.chamber=root.chamberId;
 const digest=hash(canonical(core));
 return {...core,digest,toasterSeed:'INSPAND_002_'+digest.slice(0,40)};
}
function packet(m,p,native,route,binding){
 const source={repo:'the-static-collective/planZ',commit:PLAN_PIN,
 manifest:m.manifestSha256,planId:p.id,planSha256:hash(canonical(p)),
 evidence:m.source.evidenceLevel};
 const shaped=route==='film-press-plan-shaped/v1';
 const capability={schema:'cannon.inspand-capability/v1',id:route,
 nativeRunner:'scripts/film-press-crossing.mjs',nativeRunnerBlob:FILM_BLOB,
 acceptedInput:shaped?'verifiable plan/cut questions and source ancestry':'operator-chosen held plan ID only',
 mediaInputsDerivedFromPlan:shaped,mediaTransform:shaped?'SHA256_OF_PLAN_FIELDS_TO_NATIVE_TOASTER_SEED':'NONE',
 nativeOwnerCodeModified:false,bindingDigest:binding?.digest??null,
 output:'original five-owner silent film software proof',publicationAuthority:false,
 measuredTimeSpentSeconds:null,measuredTimeSavedSeconds:null,
 status:shaped?'PROVENANCE_BOUND_DETERMINISTIC_CREATIVE_INPUT':'SELECTION_ONLY_NO_NATIVE_PLAN_MEDIA_ADAPTER'};
 const selection={schema:'cannon.inspand-selection/v1',source,route,
 mode:'SCRIPTABLE_SYNTHETIC_OPERATOR_CHOICE',authority:'LOCAL_FICTIONAL_SOFTWARE_ONLY',
 independentHumanKeep:false,planMaterialUsedAsMedia:false,
 nativeSeedDerivedFromPlan:shaped,sourceBindingDigest:binding?.digest??null};
 const core={schema:'cannon.inspand-receipt/v1',status:'COLD_REPLAYABLE_HOLD',
 selectionSha256:hash(canonical(selection)),capabilitySha256:hash(canonical(capability)),
 nativeReceiptId:native.receiptId,nativeReceiptSha256:hash(canonical(native)),
 nativeOwnerCommits:native.ownerCommits,
 nativeSilentVideoSha256:native.files?.['owners/blender-silent-study.mp4'],
 nativeToasterFamilyFileSha256:native.files?.['owners/toaster-family.json'],
 bindingDigest:binding?.digest??null,
 actualAudio:false,actualPublishing:false,actualHumanAcceptance:false,
 realWorldActions:0};
 const receipt={...core,receiptSha256:hash(canonical(core))};
 return {'planz-manifest.json':m,'selection.json':selection,'capability.json':capability,'receipt.json':receipt};
}
function options(args){
 const [mode,...rest]=args;
 need(['build','verify'].includes(mode)&&rest.length%2===0,'USAGE');
 const a={};
 for(let i=0;i<rest.length;i+=2){
  need(['--planz','--plan','--roots','--out','--route','--authorize'].includes(rest[i])&&!Object.hasOwn(a,rest[i])&&rest[i+1],'ARGS');
  a[rest[i]]=rest[i+1];
 }
 for(const p of ['--planz','--plan','--roots','--out','--route'])need(a[p],'MISSING_'+p);
 need(['film-press-synthetic-selection/v1','film-press-plan-shaped/v1'].includes(a['--route']),'ROUTE');
 need(mode==='build'?a['--authorize']==='SYNTHETIC_TEST_ONLY':!a['--authorize'],'AUTHORITY');
 return {mode,a};
}
function run(args){
 const {mode,a}=options(args),owner=verifyOwner(a['--planz']),m=manifest(owner);
 const {plan}=selectPlan(m,a['--plan'],a['--route']);
 const binding=a['--route']==='film-press-plan-shaped/v1'?buildMediaBinding(m,plan):null;
 const out=resolve(a['--out']),parent=realpathSync(dirname(out));
 need(out===join(parent,basename(out)),'OUTPUT_PATH');
 need(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()&&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const tmp=mkdtempSync(join(parent,'.inspand-'));
 try {
  const dir=mode==='build'?join(tmp,'packet'):out;
  if(mode==='build')mkdirSync(dir);
  const bindingFile=join(tmp,'plan-binding.json');
  if(binding)writeFileSync(bindingFile,canonical(binding),{flag:'wx'});
  const nativePath=join(dir,'native');
  command(process.execPath,[join(ROOT,'scripts/film-press-crossing.mjs'),mode,
   '--roots',resolve(a['--roots']),'--out',nativePath,
   ...(mode==='build'?['--authorize','SYNTHETIC_TEST_ONLY']:[]),
   ...(binding?['--plan-binding',bindingFile]:[])],{cwd:ROOT});
  const native=JSON.parse(readFileSync(join(nativePath,'receipt.json'),'utf8'));
  need(native.schema==='cannon.film-press-execution/v1'&&native.authority==='SILENT_SYNTHETIC_HOLD'
   &&native.realSongMaster===false&&native.blenderRenderedSilentVideo===true,'NATIVE_RESULT');
  need(binding?native.planBinding?.digest===binding.digest:!native.planBinding,'BINDING_NOT_CONSUMED');
  const files=packet(m,plan,native,a['--route'],binding);
  for(const [filename,v] of Object.entries(files)){
   const path=join(dir,filename);
   if(mode==='build')writeFileSync(path,canonical(v),{flag:'wx'});
   else need(readFileSync(path,'utf8')===canonical(v),'PACKET_TAMPER_'+filename);
  }
  if(mode==='build')renameSync(dir,out);
  console.log(canonical({status:mode==='build'?'NATIVE_SELECTION_RUN_HOLD':'NATIVE_SELECTION_REPLAY',
   planId:plan.id,receiptSha256:files['receipt.json'].receiptSha256,
   actualPlanToMediaAdapter:!!binding,realHumanApprovals:0}));
 }finally{rmSync(tmp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename)){
 try{run(process.argv.slice(2));}catch(e){console.error(String(e.message||e));process.exitCode=2;}
}
