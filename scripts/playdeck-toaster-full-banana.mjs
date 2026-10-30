#!/usr/bin/env node
/**
 * INSPAND-017: COMPLETE original PlayDeck Genesis frames and audio
 * -> original Haunted Toaster VSPantry admission (without persistence)
 * -> original foreign-material video digestion / native score renderer
 * -> original native MP4, video receipt, Dogram trace.
 *
 * All original frames, independently checked and sealed by original PlayDeck
 * source-owner receipt code. Reduced 0.25 resolution is explicit.
 */
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,renameSync,rmSync,
  existsSync,statSync,lstatSync,realpathSync,copyFileSync} from "node:fs";
import {resolve,join,dirname,basename} from "node:path";
import {createRequire} from "node:module";
import {fileURLToPath} from "node:url";

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const LOCK=JSON.parse(readFileSync(join(ROOT,"registry/playdeck-toaster-full-lock-v1.json"),"utf8"));
const sha=data=>createHash("sha256").update(data).digest("hex");
const asJSON=x=>JSON.stringify(x,null,2)+"\n";
function hold(x,reason){if(!x)throw Error("HOLD_NATIVE_VIDEO_CROSSING_"+reason);}
function cmd(bin,args,cwd,timeout=120000){
 try{return execFileSync(bin,args,{cwd,encoding:"utf8",stdio:["ignore","pipe","pipe"],
  timeout,maxBuffer:10*1024*1024}).trim();}
 catch(e){throw Error("HOLD_NATIVE_VIDEO_COMMAND_"+String(e.stderr||e.message).slice(0,1200));}
}
function folder(input){const p=resolve(input);hold(existsSync(p)&&lstatSync(p).isDirectory()&&!lstatSync(p).isSymbolicLink(),"FOLDER");return realpathSync(p);}
const git=(path,...args)=>cmd("git",["--no-replace-objects","-C",path,...args],ROOT,20000);
function owner(id,path){
 hold(LOCK.schema==="cannon.playdeck-toaster-full-performance-lock/v1"
  &&LOCK.safety.publish===false&&LOCK.safety.sealOnlyByOriginalPlaydeck===true,"LOCK");
 const source=LOCK.originalOwners.find(o=>o.id===id);
 hold(source,"ORIGINAL_OWNER_"+id);
 const root=folder(path);
 hold(git(root,"rev-parse","HEAD")===source.commit,"ORIGINAL_COMMIT_"+id);
 hold(git(root,"remote","get-url","origin").replace(/\.git$/,"")===
  "https://github.com/"+source.repo,"ORIGINAL_REMOTE_"+id);
 const changes=git(root,"status","--porcelain","--untracked-files=normal").split("\n").filter(Boolean);
 hold(changes.every(x=>x==="?? node_modules/"||x==="?? out/"||x==="?? packages/render-remotion/out/"),
  "CHANGED_ORIGINAL_OWNER_"+id+"_"+changes.join("~"));
 const files=Object.entries(source.files).map(([file,blob])=>{
  const data=readFileSync(join(root,file));
  const liveHash=createHash("sha1").update("blob "+data.length+"\0").update(data).digest("hex");
  hold(git(root,"rev-parse","HEAD:"+file)===blob
   &&liveHash===blob&&realpathSync(join(root,file))===join(root,file),"SOURCE_BYTES_"+file);
  return {file,gitBlob:blob,sha256:sha(data)};
 });
 return {schema:"cannon.original-owner-observation/v1",id,repo:source.repo,commit:source.commit,files};
}
export function describeBoundary(e){
 hold(e.originalPlaydeckFull===true&&e.fullPlaydeckPerformance===true
  &&e.sealedPlaydeckReceipt===true&&e.sourceFullProofVerified===true,
  "ORIGINAL_PLAYDECK_FULL_PROOF_REQUIRED");
 hold(e.playdeckVideoSha256&&/^[0-9a-f]{64}$/.test(e.playdeckVideoSha256)
  &&e.toasterInputSha256===e.playdeckVideoSha256,"SOURCE_VIDEO_BINDING");
 hold(e.nativeVideoAdmitted===true&&e.foreignMaterialWasCompiled===true
  &&e.originalToasterIssuedReceipt===true&&e.originalDogramGenerated===true,
  "MISSING_NATIVE_EVIDENCE");
 hold(e.originalAudioUsed===true&&e.realWorldActions===0&&e.published===false
  &&e.operatorAuthorizedSynthetic===true,"NO_EXTERNAL_AUTHORITY");
 return {schema:"cannon.playdeck-toaster-native-video-bridge/v1",
  status:"ORIGINAL_NATIVE_FULL_VIDEO_TO_FOREIGN_MATERIAL_TO_DOGRAM",
  nativeVideoSourceSha256:e.playdeckVideoSha256,
  nativeToasterOutputSha256:e.toasterOutputSha256,
  fullPlaydeckPerformance:true,sealedPlaydeckReceipt:true,
  nativeToasterReceipt:true,nativeToasterDogram:true,
  externalPublishing:false,rightsGranted:false,
  adapterScope:"ORIGINAL_PLAYDECK_FULL_GENESIS_VIDEO_AS_TOASTER_FOREIGN_MATERIAL",
  approval:"LOCAL_SYNTHETIC_ONLY"};
}
function spec(){
 return {schema:"cannon.native-video-run-spec/v1",
  originalPlaydeckComposition:"Genesis001",originalPlaydeckFrameRange:"ALL",
  originalPlaydeckNativeFps:24,expectedFramesFromOriginalPlaydeckReceipt:true,
  originalPlaydeckFullDurationSeconds:266.2,
  originalPlaydeckScope:"ALL_ORIGINAL_GENESIS_FRAMES_REDUCED_RESOLUTION",
  toasterForeignMaterialOperator:"clip-luma-texture-v1",
  toasterAudioSource:"THE_ORIGINAL_PLAYDECK_RENDERED_CLIP",
  nativeToasterOutput:"MP4_WITH_ORIGINAL_VIDEO_RECEIPT_AND_DOGRAM",
  localSyntheticOnly:true,rightsNotInferred:true};
}
export async function generate(playdeckRoot,toasterRoot,dir){
 const observedPlaydeck=owner("playdeck",playdeckRoot);
 const observedToaster=owner("toaster",toasterRoot);
 const runSpec=spec();
 mkdirSync(dir,{recursive:true});
 // Original PlayDeck renders and independently seals its own complete source media;
 // CANNON never issues a PlayDeck receipt or creates a descendant CardSpec.
 cmd("npm",["run","--silent","receipt:genesis"],playdeckRoot,45000);
 const originalProjected=JSON.parse(readFileSync(join(playdeckRoot,"out/genesis-001-receipt.projected.json"),"utf8"));
 hold(originalProjected.phase==="projected"&&originalProjected.id==="genesis-001-receipt"
  &&originalProjected.events.length===14,"PLAYDECK_ORIGINAL_PROJECTED");
 const sourceClip=join(dir,"original-playdeck-full.mp4");
 const renderer=join(playdeckRoot,"packages/render-remotion");
 cmd("npx",["--no-install","remotion","render","src/index.ts","Genesis001",sourceClip,
  "--scale=0.25","--concurrency=2","--codec=h264","--crf=29"],
  renderer,7200000);
 const sourceBytes=readFileSync(sourceClip);
 hold(sourceBytes.length>10000,"ORIGINAL_REMOTION_EMPTY");
 const sourceHash=sha(sourceBytes);
 // This executable is original PlayDeck SOURCE-OWNED code, and asserts every
 // native frame exists before the original owner seals its typed receipt.
 const fullOwnerProof=join(dir,"playdeck-original-full-proof.json");
 cmd("npm",["--workspace","@playdeck/receipts","run","proof:full","--",
  "--media",sourceClip,"--out",fullOwnerProof],playdeckRoot,180000);
 const ownerProof=JSON.parse(readFileSync(fullOwnerProof,"utf8"));
 hold(ownerProof.proof?.schema==="playdeck.full-genesis-proof/v1"
  &&ownerProof.proof.media?.originalMediaSha256===sourceHash
  &&ownerProof.proof.media?.ffprobeActualFrames===ownerProof.proof.planFrameCount
  &&ownerProof.proof.media?.actualFullDurationWitnessed===true
  &&ownerProof.proof.inheritable===true
  &&ownerProof.proof.mediaRightsVerified===false
  &&ownerProof.proof.publishingAuthorized===false
  &&ownerProof.receipt?.phase==="rendered"
  &&ownerProof.receipt.metadata?.sealed===true
  &&ownerProof.receipt.evidence?.some(x=>x.scope==="full-performance"
    &&x.sha256===sourceHash)
  &&ownerProof.receipt.carry?.newCardSpecs?.length===1
  &&ownerProof.receipt.carry.newCardSpecs[0].id===ownerProof.receipt.carry.newCards[0],
  "ORIGINAL_PLAYDECK_FULL_SEAL_NOT_PROVEN");
 const toasterBase=join(toasterRoot,"src/full-measure");
 const requireOwner=createRequire(join(toasterBase,"src/render/render.cjs"));
 const {probeMedia,inspectAudio}=requireOwner(join(toasterBase,"src/render/analyze.cjs"));
 const {resolveFfmpeg}=requireOwner(join(toasterBase,"src/render/tooling.cjs"));
 const {admitVideo}=requireOwner(join(toasterBase,"src/video-pantry/admit.cjs"));
 const {createForeignMaterialPlan}=requireOwner(join(toasterBase,"src/render/foreign-material.cjs"));
 const {renderVideo}=requireOwner(join(toasterBase,"src/render/render.cjs"));
 const generation=requireOwner(join(toasterBase,"src/generation/index.cjs"));
 const {isTraceableVideoReceipt,buildDogramTraceSource}=requireOwner(join(toasterBase,"src/render/dogram-trace.cjs"));
 const inputProbe=await probeMedia(sourceClip);
 hold(inputProbe.video&&inputProbe.audio&&inputProbe.duration>265&&inputProbe.duration<268,
  "SOURCE_VIDEO_AUDIO_REQUIRED");
 const admitted=await admitVideo(sourceClip,{persist:false});
 const binding=admitted.binding;
 hold(binding.schema==="haunted-toaster/video-source/v1"
  &&binding.sourceSha256===sourceHash
  &&binding.byteLength===sourceBytes.length&&binding.persisted===false,
  "ORIGINAL_PANTRY_BOUNDARY");
 const originalAudio=join(dir,"original-playdeck-audio.wav");
 cmd(resolveFfmpeg(),["-y","-hide_banner","-loglevel","error",
  "-i",sourceClip,"-map","0:a:0","-vn","-c:a","pcm_s16le","-ar","48000",
  "-ac","2",originalAudio],dir,90000);
 const analysis=await inspectAudio(originalAudio);
 hold(Math.abs(analysis.duration-inputProbe.duration)<0.35&&analysis.audio&&analysis.duration>265,
  "REAL_SOURCE_AUDIO");
 const audioFixture={
  schema:"haunted-toaster/audio-analysis-fixture/v1",
  durationSeconds:analysis.duration,
  sections:analysis.sections.map(s=>({startSeconds:s.start,endSeconds:s.end,
   energy:s.energy,label:s.label})),phrases:[],transients:[]
 };
 const constraints=JSON.parse(readFileSync(join(toasterBase,"constraints/wire-orchard.v3.json"),"utf8"));
 const profile=JSON.parse(readFileSync(join(toasterBase,"profiles/toaster-raster-4.json"),"utf8"));
 const score=generation.createVisualScore({seed:"native-playdeck-videosource:"+sourceHash,
  constraints,overrides:{topology:"circle",temporalDensity:"section"}}).score;
 const timeline=generation.resolve(audioFixture,score,constraints,profile);
 const planned=createForeignMaterialPlan({videoBinding:binding,timeline,analysisDurationSeconds:analysis.duration});
 hold(planned.sourceSha256===sourceHash
  &&planned.assimilationPolicy.operatorId==="clip-luma-texture-v1"
  &&planned.frameReservoir.representativeFrames.length>=3,"NATIVE_FOREIGN_PLAN");
 const toasterVideo=join(dir,"original-toaster-digested-playdeck.mp4");
 const result=await renderVideo({audioPath:originalAudio,outputPath:toasterVideo,
  presetId:"wireOrchard",title:"PlayDeck moving footage digested by Haunted Toaster",
  artist:"The Static Collective",width:640,height:360,fps:12,crf:29,
  encoderPreset:"ultrafast",analysis,visualScore:score,
  resolvedTimeline:timeline,video:binding});
 const receipt=result.receipt;
 const receiptFile=join(dir,"original-toaster-digested-playdeck.video-receipt.json");
 const dogramFile=join(dir,"original-toaster-digested-playdeck.dogram.json");
 const dogram=JSON.parse(readFileSync(dogramFile,"utf8"));
 const recomputed=buildDogramTraceSource(receipt);
 const outputSha=sha(readFileSync(toasterVideo));
 const foreign=receipt.treatment?.foreignVisualMaterial;
 hold(receipt.schema==="full-measure.video-receipt.v1"
  &&receipt.validation?.accepted===true
  &&receipt.output.sha256===outputSha
  &&receipt.source.sha256===sha(readFileSync(originalAudio))
  &&foreign?.sourceSha256===sourceHash
  &&foreign?.sourceSpecimenId===binding.specimenId
  &&foreign?.compiledOperator?.planHash===planned.planHash
  &&receipt.render?.visualCompiler?.foreignMaterial?.sourceSpecimenId===binding.specimenId
  &&isTraceableVideoReceipt(receipt)&&JSON.stringify(dogram)===JSON.stringify(recomputed)
  &&dogram.trace.VIDEO_PROJECTION.value===outputSha,"ORIGINAL_VIDEO_DIGEST_AND_DOGRAM");
 const gateState={originalPlaydeckFull:true,fullPlaydeckPerformance:true,
  sealedPlaydeckReceipt:true,sourceFullProofVerified:true,
  playdeckVideoSha256:sourceHash,
  toasterInputSha256:foreign.sourceSha256,nativeVideoAdmitted:true,
  foreignMaterialWasCompiled:true,originalToasterIssuedReceipt:true,
  originalDogramGenerated:true,originalAudioUsed:true,realWorldActions:0,
  published:false,operatorAuthorizedSynthetic:true,toasterOutputSha256:outputSha};
 const bridge=describeBoundary(gateState);
 const recordCore={schema:"cannon.playdeck-toaster-full-video-proof/v1",
  runSpec,ownerObservations:[observedPlaydeck,observedToaster],
  originalPlaydeckProjectedReceipt:originalProjected.id,
  originalPlaydeckReceiptPhase:originalProjected.phase,
  originalPlaydeckFullSha256:sourceHash,
  originalPlaydeckFullBytes:sourceBytes.length,
  originalPlaydeckSealedReceiptSha256:ownerProof.proof.sealedReceiptSha256,
  originalPlaydeckOwnerProofSha256:ownerProof.proof.proofSha256,
  originalPlaydeckFrames:ownerProof.proof.planFrameCount,
  originalPlaydeckFullDurationVerified:true,
  originalPlaydeckDurationSeconds:inputProbe.duration,
  originalPlaydeckVideoProbe:inputProbe.video,
  originalPlaydeckAudioProbe:inputProbe.audio,
  originalAudioSha256:receipt.source.sha256,
  toasterPantrySpecimenId:binding.specimenId,
  toasterForeignPlanHash:planned.planHash,
  toasterGeneratedVideoSha256:outputSha,
  toasterVideoReceiptSha256:sha(readFileSync(receiptFile)),
  toasterDogramSha256:sha(readFileSync(dogramFile)),
  originalDogramReceiptHash:dogram.receipt_hash,
  bridge,rightsUnproven:true,published:false};
 const proof={...recordCore,proofSha256:sha(asJSON(recordCore))};
 writeFileSync(join(dir,"native-video-proof.json"),asJSON(proof),{flag:"wx"});
 writeFileSync(join(dir,"playdeck-projected-receipt.json"),asJSON(originalProjected),{flag:"wx"});
 return {proof,sourceClip,toasterVideo};
}
export async function verifyNative(out,playdeckRoot,toasterRoot){
 const dir=folder(out);
 const owners=[owner("playdeck",playdeckRoot),owner("toaster",toasterRoot)];
 const proof=JSON.parse(readFileSync(join(dir,"native-video-proof.json"),"utf8"));
 const {proofSha256,...core}=proof;
 hold(sha(asJSON(core))===proofSha256&&JSON.stringify(owners)===
  JSON.stringify(proof.ownerObservations),"PROOF_SOURCE_LOCK");
 const source=readFileSync(join(dir,"original-playdeck-full.mp4"));
 const audio=readFileSync(join(dir,"original-playdeck-audio.wav"));
 const output=readFileSync(join(dir,"original-toaster-digested-playdeck.mp4"));
 const receiptBytes=readFileSync(join(dir,"original-toaster-digested-playdeck.video-receipt.json"));
 const dogramBytes=readFileSync(join(dir,"original-toaster-digested-playdeck.dogram.json"));
 const receipt=JSON.parse(receiptBytes),dogram=JSON.parse(dogramBytes);
 const native=JSON.parse(readFileSync(join(dir,"playdeck-projected-receipt.json"),"utf8"));
 const ownerFull=JSON.parse(readFileSync(join(dir,"playdeck-original-full-proof.json"),"utf8"));
 const ownerCore=ownerFull.proof;const {proofSha256:ownerHash,...ownerBody}=ownerCore;
 hold(ownerHash===sha(asJSON(ownerBody))
  &&ownerCore.media.originalMediaSha256===sha(source)
  &&ownerCore.media.ffprobeActualFrames===ownerCore.planFrameCount
  &&ownerFull.receipt?.phase==="rendered"
  &&ownerFull.receipt.evidence?.some(x=>x.scope==="full-performance"&&x.sha256===sha(source))
  &&sha(asJSON(ownerFull.receipt))===proof.originalPlaydeckSealedReceiptSha256
  &&ownerCore.proofSha256===proof.originalPlaydeckOwnerProofSha256
  &&ownerCore.mediaRightsVerified===false,"ORIGINAL_OWNER_SEAL_REPLAY");
 hold(sha(source)===proof.originalPlaydeckFullSha256
  &&source.length===proof.originalPlaydeckFullBytes
  &&sha(audio)===proof.originalAudioSha256
  &&sha(output)===proof.toasterGeneratedVideoSha256
  &&sha(receiptBytes)===proof.toasterVideoReceiptSha256
  &&sha(dogramBytes)===proof.toasterDogramSha256
  &&receipt.output.sha256===sha(output)
  &&receipt.source.sha256===sha(audio)
  &&receipt.treatment.foreignVisualMaterial.sourceSha256===sha(source)
  &&receipt.treatment.foreignVisualMaterial.compiledOperator.planHash===proof.toasterForeignPlanHash
  &&dogram.trace.VIDEO_PROJECTION.value===sha(output)
  &&dogram.receipt_hash===proof.originalDogramReceiptHash
  &&native.id===proof.originalPlaydeckProjectedReceipt&&native.phase==="projected"
  &&proof.bridge.fullPlaydeckPerformance===true
  &&proof.bridge.sealedPlaydeckReceipt===true
  &&proof.bridge.externalPublishing===false,"COLD_BYTES_OR_SCOPE_TAMPER");
 const toasterBase=join(toasterRoot,"src/full-measure");
 const requireOwner=createRequire(join(toasterBase,"src/render/dogram-trace.cjs"));
 const {buildDogramTraceSource,isTraceableVideoReceipt}=
  requireOwner(join(toasterBase,"src/render/dogram-trace.cjs"));
 hold(isTraceableVideoReceipt(receipt)
  &&JSON.stringify(buildDogramTraceSource(receipt))===JSON.stringify(dogram),
  "NOT_AN_ORIGINAL_DOGRAM");
 return {status:"ORIGINAL_VIDEO_TO_VIDEO_AND_DOGRAM_VERIFIED",
  sourceVideoSha256:proof.originalPlaydeckExcerptSha256,
  outputSha256:proof.toasterGeneratedVideoSha256,
  proofSha256:proof.proofSha256,fullPlaydeckPerformance:true,
  crossRepositoryVideoMotion:true};
}
function parse(argv){
 const [mode,...flags]=argv;
 hold(["inspect","build","verify"].includes(mode)&&flags.length%2===0,"CLI");
 const opts={};for(let k=0;k<flags.length;k+=2){
  const key=flags[k],v=flags[k+1];
  hold(["--playdeck","--toaster","--out","--authorize"].includes(key)
    &&v&&!Object.hasOwn(opts,key),"FLAGS");opts[key]=v;
 }
 if(mode==="inspect")hold(Object.keys(opts).length===0,"READONLY");
 else {
  for(const name of ["--playdeck","--toaster","--out"])hold(opts[name],"REQUIRED_"+name);
  hold(mode==="build"?opts["--authorize"]==="SYNTHETIC_TEST_ONLY":
   !opts["--authorize"],"AUTHORIZATION");
 }
 return {mode,opts};
}
export async function run(argv){
 const {mode,opts}=parse(argv);
 if(mode==="inspect")return {schema:LOCK.schema,
  expectedMode:"ORIGINAL_COMPLETE_GENESIS_VIDEO",
  originalPlaydeckSealMustBeVerified:true,
  progress:"NOT_EXECUTED"};
 const playdeck=folder(opts["--playdeck"]),toaster=folder(opts["--toaster"]);
 if(mode==="verify")return verifyNative(opts["--out"],playdeck,toaster);
 const out=resolve(opts["--out"]);
 hold(!existsSync(out),"OUTPUT_ALREADY_EXISTS");
 const parent=folder(dirname(out));
 const temp=mkdtempSync(join(parent,".native-full-banana-"));
 try{
  const built=await generate(playdeck,toaster,temp);
  renameSync(temp,out);
  return {status:"GENUINE_FULL_PLAYDECK_PERFORMANCE_TO_NATIVE_TOASTER_VIDEO_AND_DOGRAM",
   originalPlaydeckSha256:built.proof.originalPlaydeckFullSha256,
   originalToasterSha256:built.proof.toasterGeneratedVideoSha256,
   proofSha256:built.proof.proofSha256,fullPerformance:true,publication:false};
 }finally{rmSync(temp,{force:true,recursive:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 run(process.argv.slice(2)).then(x=>console.log(asJSON(x)))
  .catch(e=>{console.error(String(e.stack||e).slice(0,2300));process.exitCode=2;});
}
