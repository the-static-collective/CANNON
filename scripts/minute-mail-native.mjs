#!/usr/bin/env node
// INSPAND-019: original BRIEF-OWNED new art; real Haunted Toaster render,
// native video receipt and Dogram, with original code and source hash guards.
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {readFileSync,writeFileSync,unlinkSync,existsSync,lstatSync,realpathSync,mkdtempSync,renameSync,rmSync} from "node:fs";
import {join,dirname,resolve,basename} from "node:path";
import {fileURLToPath} from "node:url";
import {createRequire} from "node:module";
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const LOCK=JSON.parse(readFileSync(join(ROOT,"registry/minute-mail-toaster-owner-v1.json")));
const sha=x=>createHash("sha256").update(x).digest("hex");
const js=x=>JSON.stringify(x,null,2)+"\n";
const hold=(ok,x)=>{if(!ok)throw Error("CANNON_MINUTE_HOLD_"+x)};
function cmd(bin,args,timeout=120000){
 try{return execFileSync(bin,args,{encoding:"utf8",timeout,maxBuffer:10*1024*1024,
  stdio:["ignore","pipe","pipe"]}).trim()}
 catch(e){throw Error("CANNON_MINUTE_CHILD_"+String(e.stderr||e.message).slice(0,900))}
}
function folder(p){const x=resolve(p);hold(existsSync(x)&&lstatSync(x).isDirectory()&&!lstatSync(x).isSymbolicLink(),"DIR");return realpathSync(x)}
function owner(root){
 hold(cmd("git",["-C",root,"rev-parse","HEAD"])===LOCK.commit,"ORIGINAL_COMMIT");
 hold(cmd("git",["-C",root,"remote","get-url","origin"]).replace(/\.git$/,"")==="https://github.com/"+LOCK.sourceRepo,"ORIGIN");
 hold(cmd("git",["-C",root,"status","--porcelain","--untracked-files=normal"])==="","DIRTY_OWNER");
 for(const [path,blob] of Object.entries(LOCK.files)){
  const bytes=readFileSync(join(root,path));
  const actual=createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
  hold(blob===actual&&cmd("git",["-C",root,"rev-parse","HEAD:"+path])===blob,"SOURCE_"+path);
 }
 return {repo:LOCK.sourceRepo,commit:LOCK.commit,files:LOCK.files};
}
function checkPlan(p){
 const {planSha256,...b}=p??{};
 hold(p?.schema==="planz.minute-mail-round/v1"&&[0,1].includes(p.round)
  &&p.stage===(p.round===0?"PROOF_FILM":"REVISED_FILM")
  &&p.targetOwner==="CANNON"&&p.status==="LOCAL_PROPOSED_NOT_AUTHORIZED"
  &&p.rightsGranted===false&&p.published===false
  &&planSha256===sha(JSON.stringify(b))
  &&Array.isArray(p.subtitleLines)&&p.subtitleLines.length>=3
  &&p.subtitleLines.length<=4&&p.subtitleLines.every(s=>typeof s==="string"
   &&s.length>0&&s.length<=42&&!/[\r\n\x00]/.test(s))
  &&p.shotSeconds===(p.round===0?6:10)
  &&(p.round===0?p.priorNativeArtifactSha256===null:
   /^[a-f0-9]{64}$/.test(p.priorNativeArtifactSha256)),"PLAN");
 return p;
}
export function storyboard(p){
 checkPlan(p);
 const b={schema:"cannon.minute-mail-storyboard/v1",
  originalPlanSha256:p.planSha256,seconds:p.shotSeconds,lines:p.subtitleLines,
  music:"TWO_ORIGINAL_SINE_VOICES",design:"MIDNIGHT_INK_AND_RETURNED_GOLD",
  originalVisualSource:true,genesisFramesUsed:false,rightsGranted:false};
 return {...b,storyboardSha256:sha(js(b))};
}
function sourceNative(toaster,out){
 const requireOwner=createRequire(join(toaster,"src/full-measure/src/render/dogram-trace.cjs"));
 const {isTraceableVideoReceipt,buildDogramTraceSource}=requireOwner(join(toaster,"src/full-measure/src/render/dogram-trace.cjs"));
 const receipt=JSON.parse(readFileSync(join(out,"minute-mail.video-receipt.json")));
 const dogram=JSON.parse(readFileSync(join(out,"minute-mail.dogram.json")));
 const image=readFileSync(join(out,"original-minute-postcard.png"));
 const audio=readFileSync(join(out,"original-minute-tones.wav"));
 const video=readFileSync(join(out,"minute-mail.mp4"));
 hold(receipt.schema==="full-measure.video-receipt.v1"
  &&receipt.validation?.accepted===true
  &&receipt.treatment.userImage==="original-minute-postcard.png"
  &&receipt.source.sha256===sha(audio)&&receipt.output.sha256===sha(video)
  &&isTraceableVideoReceipt(receipt)
  &&dogram.schema==="dogram.trace-source/v0"
  &&JSON.stringify(buildDogramTraceSource(receipt))===JSON.stringify(dogram)
  &&dogram.trace.VIDEO_PROJECTION.value===sha(video),"NATIVE_OUTPUT");
 return {sourceImageSha256:sha(image),sourceAudioSha256:sha(audio),
  videoSha256:sha(video),receiptSha256:sha(readFileSync(join(out,"minute-mail.video-receipt.json"))),
  dogramSha256:sha(readFileSync(join(out,"minute-mail.dogram.json"))),
  originalToasterAccepted:true};
}
async function build(p,toaster,out){
 const story=storyboard(p);
 writeFileSync(join(out,"original-plan.json"),js(p));
 writeFileSync(join(out,"storyboard.json"),js(story));
 writeFileSync(join(out,"postcard-lines.txt"),p.subtitleLines.join("\n")+"\n");
 const graphic=join(out,"original-minute-postcard.png");
 const font="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";
 // A multiline FFmpeg drawtext textfile rendered visible tofu boxes
 // for newline separators on the real original output. Give every line
 // its own bounded drawtext filter and no trailing newline instead.
 const lineFiles=p.subtitleLines.map((line,index)=>{
  const path=join(out,"line-"+index+".txt");writeFileSync(path,line);return path;
 });
 const filter="drawbox=x=42:y=40:w=556:h=280:color=0xBEA064@0.38:t=3,"+
  "drawbox=x=62:y=60:w=516:h=240:color=0x549B9B@0.26:t=2,"+
  lineFiles.map((path,i)=>"drawtext=fontfile="+font+":textfile="+path+
   ":fontcolor=0xF5E3BA:fontsize=24:x=(w-text_w)/2:y="+(104+i*55)).join(",");
 cmd("ffmpeg",["-y","-hide_banner","-loglevel","error","-f","lavfi",
  "-i","color=c=0x111D24:s=640x360:r=1:d=1","-vf",filter,
  "-frames:v","1",graphic],60000);
 for(const file of lineFiles)unlinkSync(file);
 hold(readFileSync(graphic).subarray(0,8).toString("hex")==="89504e470d0a1a0a","PNG");
 const audio=join(out,"original-minute-tones.wav");
 cmd("ffmpeg",["-y","-hide_banner","-loglevel","error",
  "-f","lavfi","-i","sine=frequency="+(p.round===0?196:220)+":duration="+p.shotSeconds+":sample_rate=48000",
  "-f","lavfi","-i","sine=frequency="+(p.round===0?294:330)+":duration="+p.shotSeconds+":sample_rate=48000",
  "-filter_complex","[0:a]volume=0.13[a];[1:a]volume=0.09[b];[a][b]amix=inputs=2:duration=shortest,afade=t=in:st=0:d=0.5,afade=t=out:st="+(p.shotSeconds-0.7)+":d=0.7[fin]",
  "-map","[fin]","-c:a","pcm_s16le",audio],60000);
 const base=join(toaster,"src/full-measure");
 const requireOwner=createRequire(join(base,"src/render/render.cjs"));
 const {renderVideo}=requireOwner(join(base,"src/render/render.cjs"));
 const {inspectAudio}=requireOwner(join(base,"src/render/analyze.cjs"));
 const gen=requireOwner(join(base,"src/generation/index.cjs"));
 const constraints=JSON.parse(readFileSync(join(base,"constraints/wire-orchard.v3.json")));
 const profile=JSON.parse(readFileSync(join(base,"profiles/toaster-raster-4.json")));
 const analysis=await inspectAudio(audio);
 hold(analysis.audio&&Math.abs(analysis.duration-p.shotSeconds)<0.2,"AUDIO_ANALYSIS");
 const fixture={schema:"haunted-toaster/audio-analysis-fixture/v1",
  durationSeconds:analysis.duration,
  sections:analysis.sections.map(s=>({startSeconds:s.start,endSeconds:s.end,energy:s.energy,label:s.label})),
  phrases:[],transients:[]};
 const score=gen.createVisualScore({seed:"NEW-MINUTE-POST-OFFICE:"+story.storyboardSha256,
  constraints,overrides:{topology:"circle",temporalDensity:"section"}}).score;
 const timeline=gen.resolve(fixture,score,constraints,profile);
 const result=await renderVideo({audioPath:audio,imagePath:graphic,
  outputPath:join(out,"minute-mail.mp4"),presetId:"wireOrchard",
  title:"The Lost Minute Post Office",artist:"The Static Collective",
  width:640,height:360,fps:12,encoderPreset:"ultrafast",crf:29,
  analysis,visualScore:score,resolvedTimeline:timeline});
 hold(result.receipt?.validation?.accepted===true,"RENDER");
 return sourceNative(toaster,out);
}
function verify(p,toaster,out){
 const body=JSON.parse(readFileSync(join(out,"native-proof.json")));
 const {proofSha256,...core}=body;
 hold(proofSha256===sha(js(core))
  &&js(storyboard(p))===readFileSync(join(out,"storyboard.json"),"utf8")
  &&js(p)===readFileSync(join(out,"original-plan.json"),"utf8")
  &&readFileSync(join(out,"postcard-lines.txt"),"utf8")===p.subtitleLines.join("\n")+"\n",
  "STORYBOARD_PROOF");
 const native=sourceNative(toaster,out);
 hold(js(native)===js(body.nativeMedia)
  &&body.originalSourceRightsGranted===false
  &&body.published===false&&body.genesisFramesUsed===false,"MEDIA_REPLAY");
 return {status:"MINUTE_ORIGINAL_COLD_VERIFIED",round:p.round,videoSha256:native.videoSha256};
}
export async function run(argv){
 const [mode,...args]=argv;hold(["inspect","build","verify"].includes(mode)&&args.length%2===0,"ARGS");
 const o={};for(let i=0;i<args.length;i+=2){hold(["--plan","--toaster","--out","--authorize"].includes(args[i])
  &&args[i+1]&&!Object.hasOwn(o,args[i]),"OPTIONS");o[args[i]]=args[i+1]}
 if(mode==="inspect"){hold(args.length===0,"INSPECT");return {newOriginalProject:true,genesisUsed:false,authorization:false}}
 hold(o["--plan"]&&o["--toaster"]&&o["--out"]
  &&(mode==="build"?o["--authorize"]==="SYNTHETIC_TEST_ONLY":!o["--authorize"]),"AUTH");
 const p=checkPlan(JSON.parse(readFileSync(resolve(o["--plan"]))));
 const toaster=folder(o["--toaster"]);const source=owner(toaster);
 if(mode==="verify")return verify(p,toaster,folder(o["--out"]));
 const dest=resolve(o["--out"]);hold(!existsSync(dest),"EXISTS");
 const parent=folder(dirname(dest)),tmp=mkdtempSync(join(parent,".minute-native-"));
 try{
  const native=await build(p,toaster,tmp);
  const b={schema:"cannon.minute-mail-native-proof/v1",round:p.round,
   originalPlanSha256:p.planSha256,originalOwner:source,nativeMedia:native,
   createdNewVisuals:true,genesisFramesUsed:false,published:false,
   originalSourceRightsGranted:false,operatorOnly:true};
  writeFileSync(join(tmp,"native-proof.json"),js({...b,proofSha256:sha(js(b))}),{flag:"wx"});
  verify(p,toaster,tmp);renameSync(tmp,dest);
  return {status:"NEW_ORIGINAL_TOASTER_FILM_VERIFIED",round:p.round,videoSha256:native.videoSha256};
 }finally{rmSync(tmp,{recursive:true,force:true})}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 run(process.argv.slice(2)).then(x=>console.log(js(x)))
  .catch(e=>{console.error(String(e.stack??e).slice(0,1600));process.exitCode=2});
}
