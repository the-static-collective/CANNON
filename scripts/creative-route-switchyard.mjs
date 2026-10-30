#!/usr/bin/env node
/** INSPAND-018 / SWITCHYARD-001 — selectable existing original native
 * creative crossings. Selection != authorization; no auto-publishing. */
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {existsSync,lstatSync,realpathSync,readFileSync,writeFileSync,
 mkdtempSync,renameSync,rmSync} from "node:fs";
import {dirname,join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const CATALOG_FILE=join(ROOT,"registry/creative-route-switchyard-v1.json");
const CATALOG_RAW=readFileSync(CATALOG_FILE);
const C=JSON.parse(CATALOG_RAW);
const sha=x=>createHash("sha256").update(x).digest("hex");
const fmt=x=>JSON.stringify(x,null,2)+"\n";
function hold(x,m){if(!x)throw Error("HOLD_SWITCHYARD_"+m);}
function exec(bin,args,timeout=180000){
 try{return execFileSync(bin,args,{cwd:ROOT,encoding:"utf8",timeout,
  stdio:["ignore","pipe","pipe"],maxBuffer:16*1024*1024}).trim();}
 catch(e){throw Error("HOLD_SWITCHYARD_ORIGINAL_"+String(e.stderr||e.message).slice(0,850));}
}
function dir(p){const x=resolve(p);hold(existsSync(x)&&lstatSync(x).isDirectory()&&!lstatSync(x).isSymbolicLink(),"DIR");return realpathSync(x);}
function catalog(){
 hold(C.schema==="cannon.creative-route-catalog/v1"
  &&C.owner==="the-static-collective/CANNON"
  &&C.authority==="NONE"&&C.routes?.length===3&&C.stages?.length===4
  &&C.blockedFollowups?.length===4,"CATALOG");
 hold(C.routes.map(x=>x.id).join("|")==="CHECKPOINT_STILL|MOVING_EXCERPT|FULL_PERFORMANCE","ROUTES");
 for(const x of Object.values(C.policies))hold(x===true,"POLICY");
 return C;
}
function route(id){
 const r=catalog().routes.find(x=>x.id===id);hold(r,"UNREGISTERED_ROUTE");
 hold(r.originalCannonRunner.startsWith("scripts/playdeck-toaster-")
  &&r.originalSourceLock.startsWith("registry/playdeck-toaster-")
  &&r.artifactPort==="full-measure.video-receipt.v1"
  &&r.tracePort==="dogram.trace-source/v0"
  &&/^[a-f0-9]{40}$/.test(r.runnerGitBlob)
  &&/^[a-f0-9]{40}$/.test(r.sourceLockGitBlob),"SOURCE_ROUTE");
 return r;
}
function ownership(r){
 for(const [path,blob] of [[r.originalCannonRunner,r.runnerGitBlob],
  [r.originalSourceLock,r.sourceLockGitBlob]]){
  const bytes=readFileSync(join(ROOT,path));
  const actual=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
  hold(actual===blob&&exec("git",["--no-replace-objects","-C",ROOT,"rev-parse","HEAD:"+path])===blob,
   "CANNON_SOURCE_MODIFIED_"+path);
 }
 const o=JSON.parse(readFileSync(join(ROOT,r.originalSourceLock)));
 const owners=o.owners??o.originalOwners;
 hold(owners?.length===2&&owners[0].id==="playdeck"&&owners[1].id==="toaster","ORIGINAL_OWNERS");
 for(const owner of owners)
  hold(/^[a-f0-9]{40}$/.test(owner.commit)
   &&Object.keys(owner.files).length>0
   &&owner.repo.startsWith("the-static-collective/"),"OWNER_SOURCE_"+owner.id);
 return {catalogSha256:sha(CATALOG_RAW),owners:owners.map(o=>({id:o.id,
  repo:o.repo,commit:o.commit,sourceFiles:Object.keys(o.files).length})),
  originalRunnerBlob:r.runnerGitBlob,originalOwnerLockBlob:r.sourceLockGitBlob};
}
export function planRoute(id){
 const r=route(id),source=ownership(r);
 const stages=[
  {id:"PLAYDECK_SOURCE",owner:"the-static-collective/playdeck",
   outputPort:r.originalMediaInputPort,fullSourceOwnerSeal:r.fullPerformance},
  {id:"TOASTER_RENDER",owner:"the-static-collective/the-haunted-toaster",
   inputPort:r.toasterInputPort,outputPort:r.artifactPort},
  {id:"DOGRAM",owner:"the-static-collective/the-haunted-toaster",
   inputPort:r.artifactPort,outputPort:r.tracePort},
  {id:"CANNON_REVIEW",owner:"the-static-collective/CANNON",
   inputPort:r.tracePort,outputPort:"cannon.creative-route-review/v1"}
 ];
 const edges=[
  {from:"PLAYDECK_SOURCE",to:"TOASTER_RENDER",fromPort:r.originalMediaInputPort,
   toPort:r.toasterInputPort,verifiedOriginalAdapter:r.originalCannonRunner,
   automaticCast:false,sourceEvidence:r.sourceEvidence},
  {from:"TOASTER_RENDER",to:"DOGRAM",fromPort:r.artifactPort,
   toPort:r.artifactPort,verifiedOriginalAdapter:"ORIGINAL_TOASTER_RECEIPT",automaticCast:false},
  {from:"DOGRAM",to:"CANNON_REVIEW",fromPort:r.tracePort,
   toPort:r.tracePort,verifiedOriginalAdapter:"REVIEW_ONLY_POINTER",automaticCast:false}
 ];
 const body={schema:"cannon.creative-route-plan/v1",id:r.id,
  title:r.title,source,stages,edges,
  expectedOutput:r.nativeOutput,expectedProof:r.nativeProof,
  originalPlaydeckFullPerformance:r.fullPerformance,
  originalAudio:r.originalAudio,originalMotion:r.originalVideoMotion,
  evidence:r.sourceEvidence,downstreamHeld:catalog().blockedFollowups,
  rightsApproved:false,published:false,operatorAuthorization:null,
  result:"SELECTED_NOT_EXECUTED",authority:"NONE"};
 return {...body,planSha256:sha(fmt(body))};
}
export function inspectPlan(p){
 hold(p?.schema==="cannon.creative-route-plan/v1"&&typeof p.id==="string","PLAN");
 const expected=planRoute(p.id);
 hold(fmt(p)===fmt(expected),"PLAN_TAMPER");
 return expected;
}
function readPlan(file){return inspectPlan(JSON.parse(readFileSync(resolve(file),"utf8")));}
function sourceArgs(command,playdeck,toaster,out,authorize){
 const args=[command,"--playdeck",playdeck,"--toaster",toaster,"--out",out];
 if(command==="build"){
  hold(authorize==="SYNTHETIC_TEST_ONLY","AUTHORIZATION");args.push("--authorize",authorize);
 }else hold(!authorize,"VERIFIER_NO_AUTHORIZATION");
 return args;
}
function originalNative(r,command,playdeck,toaster,out,grant){
 const result=JSON.parse(exec(process.execPath,[join(ROOT,r.originalCannonRunner),
  ...sourceArgs(command,playdeck,toaster,out,grant)],command==="build"?7200000:600000));
 hold(typeof result.status==="string"&&
  (command==="build"?/REAL_PLAYDECK_STILL|GENUINE/.test(result.status):
   /VERIFIED|REPLAY/.test(result.status)),"ORIGINAL_RUNNER_"+command);
 return result;
}
function outputEvidence(r,path){
 const proofFile=join(path,r.nativeProof);
 const proof=JSON.parse(readFileSync(proofFile));
 const full=r.id==="FULL_PERFORMANCE";
 let sourceSha,outputSha;
 if(r.id==="CHECKPOINT_STILL"){
  hold(proof.schema==="cannon.playdeck-toaster-checkpoint-media-proof/v1"
   &&proof.bridge?.playdeckFullPerformance===false
   &&proof.bridge?.originalToasterGeneratedVideo===true,"CHECKPOINT");
  sourceSha=proof.sourceStill.sha256;outputSha=proof.toaster.sha256;
 }else{
  hold(proof.schema===(full?"cannon.playdeck-toaster-full-video-proof/v1":
   "cannon.playdeck-toaster-native-video-proof/v1")
   &&proof.bridge?.fullPlaydeckPerformance===full
   &&proof.bridge?.sealedPlaydeckReceipt===full
   &&proof.bridge?.nativeToasterReceipt===true
   &&proof.bridge?.nativeToasterDogram===true,"NATIVE_MEDIA_SCOPE");
  sourceSha=full?proof.originalPlaydeckFullSha256:proof.originalPlaydeckExcerptSha256;
  outputSha=proof.toasterGeneratedVideoSha256;
  if(full){
   const x=JSON.parse(readFileSync(join(path,"playdeck-original-full-proof.json")));
   hold(x.proof?.inheritable===true&&x.receipt?.phase==="rendered"
    &&x.proof.media.ffprobeActualFrames===x.proof.planFrameCount
    &&x.proof.mediaRightsVerified===false,"ORIGINAL_PLAYDECK_SEAL");
  }
 }
 const outSha=sha(readFileSync(join(path,r.nativeOutput)));
 hold(outSha===outputSha&&/^[0-9a-f]{64}$/.test(sourceSha),"NATIVE_VIDEO_HASH");
 return {originalNativeProofSha256:sha(readFileSync(proofFile)),
  sourceMediaSha256:sourceSha,toasterVideoSha256:outSha,
  outputFile:r.nativeOutput,fullPlaydeckPerformance:full,
  nativeReceiptType:"full-measure.video-receipt.v1",
  traceType:"dogram.trace-source/v0"};
}
function review(plan,receipt){
 const esc=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
 return '<!doctype html><html lang="en"><meta charset="utf-8"><title>Creative Switchyard</title>'+
  '<h1>Original native creative route: '+esc(plan.id)+'</h1>'+
  '<p>Source: '+esc(receipt.nativeEvidence.sourceMediaSha256)+'</p>'+
  '<p>Toaster: '+esc(receipt.nativeEvidence.toasterVideoSha256)+'</p>'+
  '<p>PlayDeck full-performance: '+receipt.nativeEvidence.fullPlaydeckPerformance+'</p>'+
  '<p>Review-only: no rights or publishing approval; downstream choices are held.</p></html>\n';
}
function argsFor(argv){
 const [mode,...rest]=argv;hold(["list","plan","run","verify"].includes(mode)&&rest.length%2===0,"USAGE");
 const options={};
 for(let i=0;i<rest.length;i+=2){
  const key=rest[i],value=rest[i+1];
  hold(["--route","--plan","--playdeck","--toaster","--out","--authorize"].includes(key)
   &&value&&!Object.hasOwn(options,key),"OPTION");options[key]=value;
 }
 const needed=mode==="list"?[]:mode==="plan"?["--route","--out"]:
  ["--plan","--playdeck","--toaster","--out"];
 hold(needed.every(k=>options[k])
  &&Object.keys(options).every(k=>needed.includes(k)||(mode==="run"&&k==="--authorize"))
  &&(mode!=="run"||options["--authorize"]==="SYNTHETIC_TEST_ONLY"),
  "REQUIRED_AND_AUTHORITY");
 return {mode,options};
}
export function run(argv){
 const {mode,options:o}=argsFor(argv);
 if(mode==="list")return {schema:catalog().schema,
  routes:catalog().routes.map(r=>({id:r.id,status:r.sourceStatus,
   fullPerformance:r.fullPerformance,sourceEvidence:r.sourceEvidence})),
  stages:4,executed:false,rightsApproved:false};
 if(mode==="plan"){
  const p=planRoute(o["--route"]),path=resolve(o["--out"]);
  dir(dirname(path));hold(!existsSync(path)&&path.endsWith(".json"),"PLAN_PATH");
  writeFileSync(path,fmt(p),{flag:"wx"});
  return {status:"PINNED_UNEXECUTED_PLAN",route:p.id,
   planSha256:p.planSha256,authorizationGranted:false};
 }
 const plan=readPlan(o["--plan"]),r=route(plan.id);
 const pd=dir(o["--playdeck"]),ht=dir(o["--toaster"]),out=resolve(o["--out"]);
 if(mode==="verify"){
  dir(out);
  const original=originalNative(r,"verify",pd,ht,join(out,"native"));
  const evidence=outputEvidence(r,join(out,"native"));
  const rec=JSON.parse(readFileSync(join(out,"switchyard-receipt.json")));
  const {receiptSha256,...body}=rec;
  hold(receiptSha256===sha(fmt(body))&&rec.originalPlanSha256===plan.planSha256
   &&rec.route===plan.id&&rec.published===false&&rec.rightsApproved===false
   &&rec.authorizedSyntheticOnly===true&&rec.generatedCodeExecuted===false
   &&fmt(rec.nativeEvidence)===fmt(evidence)
   &&readFileSync(join(out,"plan.json"),"utf8")===fmt(plan)
   &&readFileSync(join(out,"review.html"),"utf8")===review(plan,rec),
   "COLD_RECEIPT_OR_PLAN_TAMPER");
  return {status:"ORIGINAL_NATIVE_SWITCHYARD_COLD_VERIFIED",
   route:plan.id,originalStatus:original.status,videoSha256:evidence.toasterVideoSha256,
   receiptSha256,realWorldActions:0};
 }
 hold(!existsSync(out),"OUTPUT_EXISTS");
 const parent=dir(dirname(out)),temp=mkdtempSync(join(parent,".switchyard-"));
 try{
  const native=join(temp,"native");
  const built=originalNative(r,"build",pd,ht,native,o["--authorize"]);
  const verified=originalNative(r,"verify",pd,ht,native);
  const evidence=outputEvidence(r,native);
  const core={schema:"cannon.creative-route-run-receipt/v1",route:plan.id,
   originalPlanSha256:plan.planSha256,nativeEvidence:evidence,
   originalBuildStatus:built.status,originalVerificationStatus:verified.status,
   explicitRouteSelection:true,authorizedSyntheticOnly:true,
   modelSelectedRoute:false,generatedCodeExecuted:false,
   rightsApproved:false,published:false,realWorldActions:0,
   status:"NATIVE_ORIGINAL_SOURCE_REPLAYED"};
  const receipt={...core,receiptSha256:sha(fmt(core))};
  writeFileSync(join(temp,"switchyard-receipt.json"),fmt(receipt),{flag:"wx"});
  writeFileSync(join(temp,"plan.json"),fmt(plan),{flag:"wx"});
  writeFileSync(join(temp,"review.html"),review(plan,receipt),{flag:"wx"});
  renameSync(temp,out);
  return {status:"SWITCHYARD_NATIVE_ROUTE_EXECUTED_VERIFIED",route:plan.id,
   stages:4,originalOutput:r.nativeOutput,
   videoSha256:evidence.toasterVideoSha256,
   fullPerformance:r.fullPerformance,receiptSha256:receipt.receiptSha256,
   published:false};
 }finally{rmSync(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{console.log(fmt(run(process.argv.slice(2))))}
 catch(e){console.error(String(e.message??e).slice(0,1400));process.exitCode=2;}
}
