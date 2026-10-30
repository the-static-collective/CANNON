#!/usr/bin/env node
/**
 * INSPAND-015: genuinely render one PlayDeck Remotion CHECKPOINT still,
 * send those verified image bytes to the ORIGINAL Toaster scored renderer,
 * verify its owner-issued MP4, video receipt and Dogram trace.
 *
 * This is a media checkpoint crossing, NOT a sealed full-performance
 * PlayDeck receipt or automatic conversion to Toaster's video receipt.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,statSync,existsSync,lstatSync,realpathSync,mkdirSync,mkdtempSync,renameSync,rmSync} from 'node:fs';
import {resolve,join,dirname,basename} from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const LOCK=JSON.parse(readFileSync(join(ROOT,'registry/playdeck-toaster-native-still-lock-v1.json'),'utf8'));
const hash=x=>createHash('sha256').update(x).digest('hex');
const json=x=>JSON.stringify(x,null,2)+'\n';
function hold(ok,why){if(!ok)throw Error('HOLD_PLAYDECK_TOASTER_NATIVE_'+why);}
function cmd(name,args,cwd,timeout=120000){
 try{return execFileSync(name,args,{cwd,encoding:'utf8',timeout,maxBuffer:4*1024*1024,stdio:['ignore','pipe','pipe']}).trim();}
 catch(e){throw Error('HOLD_PLAYDECK_TOASTER_COMMAND_'+String(e.stderr||e.message).slice(0,850));}
}
function folder(path){const p=resolve(path);hold(existsSync(p)&&lstatSync(p).isDirectory()&&!lstatSync(p).isSymbolicLink(),'SOURCE_ROOT');return realpathSync(p);}
const git=(root,...args)=>cmd('git',['--no-replace-objects','-C',root,...args],ROOT);
function original(id,root){
 const owner=LOCK.owners.find(x=>x.id===id);hold(owner,'UNKNOWN_OWNER');
 const path=folder(root);
 hold(git(path,'rev-parse','HEAD')===owner.commit,'PINNED_COMMIT_'+id);
 hold(git(path,'remote','get-url','origin').replace(/\.git$/,'')==='https://github.com/'+owner.repo,'PINNED_ORIGIN_'+id);
 const status=git(path,'status','--porcelain','--untracked-files=normal').split('\n').filter(Boolean);
 // Only original owner-produced local media and ignored dependency trees are permitted.
 hold(status.every(x=>x==='?? node_modules/'||x==='?? out/'||x==='?? packages/render-remotion/out/'),
  'ORIGINAL_WORKTREE_MODIFIED_'+id+'_'+status.join('|'));
 const files=Object.entries(owner.files).map(([rel,blob])=>{
  const bytes=readFileSync(join(path,rel));
  const actual=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  hold(git(path,'rev-parse','HEAD:'+rel)===blob&&actual===blob
   &&realpathSync(join(path,rel))===join(path,rel),'ORIGINAL_BYTES_'+rel);
  return {path:rel,blobSha1:actual,sha256:hash(bytes)};
 });
 return {schema:'cannon.original-native-media-owner/v1',repo:owner.repo,commit:owner.commit,
  files,independentSourceVerified:true,ownerPermissionsNotInferred:true};
}
export function gate(state){
 hold(state?.playdeckStillSha256&&/^[a-f0-9]{64}$/.test(state.playdeckStillSha256),
  'MISSING_GENUINE_PLAYDECK_MEDIA');
 hold(state.playdeckPhase==='checkpoint'&&state.playdeckFullPerformance===false,
  'DO_NOT_FAKE_RENDERED_PERFORMANCE');
 hold(state.toasterIssuedReceipt===true&&state.originalDogramAccepted===true
  &&state.outputHashVerified===true&&state.imageHashVerified===true,
  'NO_GUESSED_TOASTER_PROOFS');
 hold(state.authorizedOnlyForSynthetic&&state.noPublication,'NO_RELEASE');
 return {schema:'cannon.playdeck-toaster-checkpoint-bridge/v1',
  status:'ORIGINAL_NATIVE_CHECKPOINT_TO_GENUINE_TOASTER_RENDER',
  inputSha256:state.playdeckStillSha256,
  outputSha256:state.toasterVideoSha256,
  playdeckFullPerformance:false,
  newFullPerformanceReceipt:false,
  originalToasterGeneratedVideo:true,
  originalDogramAccepted:true,
  independentlyVerifiedMediaHashes:true,
  rightsTransferred:false,published:false,
  authority:'LOCAL_SYNTHETIC_ONLY',adapter:'PLAYDECK_STILL_TO_ORIGINAL_TOASTER_IMAGE_INPUT_V1'};
}
export async function buildNative(playdeckRoot,toasterRoot,output){
 const playdeck=original('playdeck',playdeckRoot),toaster=original('toaster',toasterRoot);
 const out=resolve(output);
 mkdirSync(out,{recursive:true});
 // Original source-owned PlayDeck Remotion renderer. Output is an actual
 // checkpoint STILL, never full-performance evidence.
 cmd('npm',['run','--silent','still:genesis'],join(playdeckRoot,'packages/render-remotion'),420000);
 const still=join(playdeckRoot,'packages/render-remotion/out/genesis-001.png');
 hold(existsSync(still)&&statSync(still).size>1000,'PLAYDECK_ORIGINAL_RENDER_MISSING');
 const bytes=readFileSync(still);
 hold(bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a','NOT_PNG');
 const stillHash=hash(bytes);
 const {copyFileSync}=await import('node:fs');
 const localStill=join(out,'original-playdeck-checkpoint.png');
 copyFileSync(still,localStill);
 const toasterSrc=join(toasterRoot,'src/full-measure/src/render/render.cjs');
 const originalRequire=createRequire(toasterSrc);
 const {renderVideo}=originalRequire(toasterSrc);
 const {inspectAudio}=originalRequire(join(toasterRoot,'src/full-measure/src/render/analyze.cjs'));
 const {buildDogramTraceSource}=originalRequire(join(toasterRoot,'src/full-measure/src/render/dogram-trace.cjs'));
 const generation=originalRequire(join(toasterRoot,'src/full-measure/src/generation/index.cjs'));
 const {resolveFfmpeg}=originalRequire(join(toasterRoot,'src/full-measure/src/render/tooling.cjs'));
 const sourceAudio=join(out,'original-toaster-synthetic-tone.wav');
 cmd(resolveFfmpeg(),['-y','-hide_banner','-loglevel','error',
  '-f','lavfi','-i','sine=frequency=220:duration=3:sample_rate=48000',
  '-c:a','pcm_s16le',sourceAudio],out,45000);
 const analysis=await inspectAudio(sourceAudio);
 hold(Math.abs(analysis.duration-3)<0.1&&analysis.audio,'ORIGINAL_AUDIO_PROBE');
 const scoreInput={
  schema:'haunted-toaster/audio-analysis-fixture/v1',
  durationSeconds:analysis.duration,
  sections:analysis.sections.map(x=>({startSeconds:x.start,endSeconds:x.end,
   energy:x.energy,label:x.label})),
  phrases:[],transients:[]
 };
 const base=join(toasterRoot,'src/full-measure');
 const constraints=JSON.parse(readFileSync(join(base,'constraints/wire-orchard.v3.json'),'utf8'));
 const profile=JSON.parse(readFileSync(join(base,'profiles/toaster-raster-4.json'),'utf8'));
 const score=generation.createVisualScore({seed:'cannon-playdeck-checkpoint:'+stillHash,
  constraints,overrides:{topology:'circle',temporalDensity:'section'}}).score;
 const timeline=generation.resolve(scoreInput,score,constraints,profile);
 const video=join(out,'original-toaster-from-playdeck.mp4');
 const result=await renderVideo({audioPath:sourceAudio,imagePath:localStill,
  outputPath:video,presetId:'wireOrchard',title:'PlayDeck checkpoint through Toaster',
  artist:'The Static Collective',width:640,height:360,fps:12,encoderPreset:'ultrafast',
  crf:29,analysis,visualScore:score,resolvedTimeline:timeline});
 const receipt=result.receipt;
 hold(receipt?.schema==='full-measure.video-receipt.v1'&&receipt.validation?.accepted===true
  &&receipt.treatment.userImage===basename(localStill)
  &&receipt.output.sha256===hash(readFileSync(video))
  &&receipt.source.sha256===hash(readFileSync(sourceAudio)),'REAL_TOASTER_MEDIA_EVIDENCE');
 const dogram=buildDogramTraceSource(receipt);
 const originalDogramPath=join(out,'original-toaster-from-playdeck.dogram.json');
 const diskDogram=JSON.parse(readFileSync(originalDogramPath,'utf8'));
 hold(JSON.stringify(dogram)===JSON.stringify(diskDogram)
  &&dogram.schema==='dogram.trace-source/v0'
  &&dogram.trace.VIDEO_PROJECTION.value===receipt.output.sha256
  &&dogram.authority_boundary==='comparison-only','ORIGINAL_DOGRAM_OWNER');
 const state={playdeckStillSha256:stillHash,playdeckPhase:'checkpoint',
  playdeckFullPerformance:false,toasterIssuedReceipt:true,originalDogramAccepted:true,
  outputHashVerified:true,imageHashVerified:hash(readFileSync(localStill))===stillHash,
  authorizedOnlyForSynthetic:true,noPublication:true,toasterVideoSha256:receipt.output.sha256};
 const bridge=gate(state);
 const evidence={schema:'cannon.playdeck-toaster-checkpoint-media-proof/v1',
  owners:[playdeck,toaster],sourceStill:{filename:basename(localStill),
   sha256:stillHash,sizeBytes:bytes.length,producer:'PlayDeck Remotion',
   originalComposition:'Genesis001',frame:5256,kind:'checkpoint-not-full-performance'},
  toaster:{video:basename(video),sha256:receipt.output.sha256,
   receipt:basename(result.receiptPath),
   dogram:basename(originalDogramPath),audio:basename(sourceAudio),
   sourceAudioSha256:receipt.source.sha256},
  bridge,originalDogramReceiptHash:dogram.receipt_hash,
  firstOriginalCrossing:true,fullPerformanceNotEstablished:true,
  originalToasterAudioIsSynthetic:true,externalActions:0,published:false};
 const record={...evidence,proofSha256:hash(json(evidence))};
 writeFileSync(join(out,'native-crossing-proof.json'),json(record),{flag:'wx'});
 return {record,video,still:localStill};
}
function verifyOutput(out,expected){
 const root=folder(out);
 const proof=JSON.parse(readFileSync(join(root,'native-crossing-proof.json'),'utf8'));
 const receipt=JSON.parse(readFileSync(join(root,'original-toaster-from-playdeck.video-receipt.json'),'utf8'));
 const dogram=JSON.parse(readFileSync(join(root,'original-toaster-from-playdeck.dogram.json'),'utf8'));
 const {proofSha256,...core}=proof;
 hold(proofSha256===hash(json(core)),'PROOF_HASH');
 hold(proof.bridge.status==='ORIGINAL_NATIVE_CHECKPOINT_TO_GENUINE_TOASTER_RENDER'
  &&!proof.bridge.playdeckFullPerformance&&!proof.bridge.published,'PROOF_LIMITS');
 const media=[
  ['original-playdeck-checkpoint.png',proof.sourceStill.sha256],
  [proof.toaster.video,proof.toaster.sha256],
  [proof.toaster.audio,proof.toaster.sourceAudioSha256]
 ];
 for(const [path,digest] of media){
  const bytes=readFileSync(join(root,path));
  hold(hash(bytes)===digest,'MEDIA_TAMPER_'+path);
 }
 hold(receipt.schema==='full-measure.video-receipt.v1'
  &&receipt.output.sha256===proof.toaster.sha256
  &&receipt.validation.accepted===true
  &&receipt.treatment.userImage==='original-playdeck-checkpoint.png'
  &&dogram.schema==='dogram.trace-source/v0'
  &&dogram.receipt_hash===proof.originalDogramReceiptHash
  &&dogram.trace.VIDEO_PROJECTION.value===proof.toaster.sha256
  &&expected==='NATIVE_APPROVED_FOR_LOCAL_SYNTHETIC','ORIGINAL_RECEIPT');
 return {status:'SOURCE_AND_MEDIA_HASHES_VERIFIED',originalVideo:true,
  genuineDogramSidecar:true,fullPlaydeckPerformance:false,
  sourceStillSha256:proof.sourceStill.sha256,videoSha256:proof.toaster.sha256,
  proofSha256};
}
function parse(args){
 const [mode,...rest]=args;
 hold(['inspect','build','verify'].includes(mode)&&rest.length%2===0,'USAGE');
 const opt={};for(let i=0;i<rest.length;i+=2){
  const flag=rest[i],val=rest[i+1];
  hold(['--playdeck','--toaster','--out','--authorize'].includes(flag)&&val
    &&!Object.hasOwn(opt,flag),'OPTIONS');opt[flag]=val;
 }
 if(mode==='inspect')hold(Object.keys(opt).length===0,'INSPECT_ONLY');
 else{
  for(const name of ['--playdeck','--toaster','--out'])hold(opt[name],'REQUIRED_'+name);
  hold(mode==='build'?opt['--authorize']==='SYNTHETIC_TEST_ONLY':!opt['--authorize'],
   'AUTHORIZATION');
 }
 return {mode,opt};
}
export async function run(argv){
 const {mode,opt}=parse(argv);
 if(mode==='inspect')return {schema:LOCK.schema,adapter:LOCK.adapterType,
  status:'NATIVE_CHECKPOINT_RENDER_TEST_NOT_YET_RUN',requiresOriginalMedia:true};
 const pd=location(opt['--playdeck']),ht=location(opt['--toaster']);
 if(mode==='verify'){
  const r=verifyOutput(opt['--out'],'NATIVE_APPROVED_FOR_LOCAL_SYNTHETIC');
  original('playdeck',pd);original('toaster',ht);
  return r;
 }
 const dest=resolve(opt['--out']);
 hold(!existsSync(dest),'OUTPUT_EXISTS');
 const parent=folder(dirname(dest));
 const temp=mkdtempSync(join(parent,'.native-checkpoint-'));
 try{
  const actual=await buildNative(pd,ht,temp);
  renameSync(temp,dest);
  return {status:'REAL_PLAYDECK_STILL_TO_GENUINE_TOASTER_VIDEO_AND_DOGRAM',
   sourceStillSha256:actual.record.sourceStill.sha256,
   genuineToasterVideoSha256:actual.record.toaster.sha256,
   proofSha256:actual.record.proofSha256,fullPerformance:false,
   physicalActions:0};
 }finally{rmSync(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 run(process.argv.slice(2)).then(x=>console.log(json(x)))
  .catch(e=>{console.error(String(e.stack||e).slice(0,2100));process.exitCode=2;});
}
