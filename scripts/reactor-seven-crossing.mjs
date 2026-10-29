#!/usr/bin/env node
// REACTOR-SEVEN-004: seven native source-owner creative runtimes in bounded held lanes.
import { createHash } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync, readdirSync, realpathSync, lstatSync, existsSync, mkdtempSync, rmSync, renameSync } from "node:fs";
import { resolve, join, dirname, basename, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT=resolve(import.meta.dirname,"..");
const sources=JSON.parse(readFileSync(join(ROOT,"creative/reactor-seven-sources.json"),"utf8"));
const sha=x=>createHash("sha256").update(x).digest("hex");
const json=x=>JSON.stringify(x,null,2)+"\n";
const need=(ok,why)=>{if(!ok)throw Error("HOLD_REACTOR_SEVEN_"+why)};
const run=(bin,args,options={})=>{
 try{return execFileSync(bin,args,{encoding:"utf8",stdio:["ignore","pipe","pipe"],timeout:180000,maxBuffer:16*1024*1024,...options}).trim();}
 catch(e){throw Error("NATIVE_ENGINE_REFUSED_"+String(e.stderr||e.message).slice(0,1200));}
};
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const native=(root,rel)=>import(pathToFileURL(join(root,rel)).href);
function trustOwner(root,owner){
 const path=realpathSync(root);
 need(run("git",["-C",path,"rev-parse","HEAD"])===owner.sha,"PIN_"+owner.id);
 const url=run("git",["-C",path,"remote","get-url","origin"]);
 need(url.endsWith("/"+owner.repo)||url.endsWith("/"+owner.repo+".git")||url.endsWith(":"+owner.repo+".git"),"ORIGIN_"+owner.id);
 need(run("git",["-C",path,"status","--porcelain","--untracked-files=all"])==="","DIRTY_"+owner.id);
 need(existsSync(join(path,owner.path)),"NATIVE_MODULE_"+owner.id);
 return {path,sha256:sha(readFileSync(join(path,owner.path)))};
}
function walk(dir,prefix=""){
 const out={};
 for(const e of readdirSync(dir,{withFileTypes:true})){
  need(!e.isSymbolicLink(),"SYMLINK_IN_PACKET");
  const abs=join(dir,e.name),name=prefix+e.name;
  if(e.isDirectory())Object.assign(out,walk(abs,name+"/"));
  else{need(e.isFile(),"NONFILE_IN_PACKET");out[name]=readFileSync(abs);}
 }
 return out;
}
function assertDigestFiles(dir,receipt){
 need(receipt && receipt.files && typeof receipt.files==="object","PARENT_RECEIPT");
 const files=walk(dir);
 need(Object.keys(files).length===Object.keys(receipt.files).length+1,"PARENT_FILE_COUNT");
 for(const [name,digest] of Object.entries(receipt.files)){
  need(Object.hasOwn(files,name)&&sha(files[name])===digest,"PARENT_FILE_HASH_"+name);
 }
 need(Object.keys(files).every(x=>x==="receipt.json"||Object.hasOwn(receipt.files,x)),"PARENT_EXTRA_FILE");
 return files;
}
function ensureParents(bookDir,filmDir){
 const book=read(join(bookDir,"receipt.json")),film=read(join(filmDir,"receipt.json"));
 const bFiles=assertDigestFiles(bookDir,book);
 const fFiles=assertDigestFiles(filmDir,film);
 need(book.schema==="cannon.reactor-book-native-crossing/v1"&&book.nativeOwnersExecuted.length===3 &&
   book.actualExternalHumanReview===false&&book.actualMachineOrHardwareRun===false&&book.published===false,"BOOK_SCOPE");
 need(book.nativeWorkbenchPortGapCount===1,"BOOK_NATIVE_GAP");
 need(film.schema==="cannon.film-press-execution/v1"&&film.authority==="SILENT_SYNTHETIC_HOLD"&&
   film.blenderRenderedSilentVideo===true&&film.realSongMaster===false&&film.songSynchronized===false&&
   film.publicReleases===0&&film.vinylRecordsPressed===0,"FILM_SCOPE");
 const nativeBook=JSON.parse(bFiles["owners/workbench-native-review.json"]);
 need(nativeBook.selectedPlanId===book.selectedPlanId&&nativeBook.board.status==="candidate_with_gaps"&&
   nativeBook.syntheticCounterexampleStatus==="synthetic_route_matched","BOOK_CONTENT");
 const toaster=JSON.parse(fFiles["owners/toaster-family.json"]);
 const playdeck=JSON.parse(fFiles["owners/playdeck-plan.json"]);
 const blender=JSON.parse(fFiles["owners/blender-study.json"]);
 need(toaster.utterances.length===6 && playdeck.id && playdeck.events?.length>0 &&
   blender.toasterFamilyHash===toaster.familyHash&&blender.playdeckPlanId===playdeck.id &&
   blender.realMusicVideo===false&&blender.masterAudioPresent===false,"FILM_THREE_NATIVE");
 need(sha(fFiles["owners/blender-silent-study.mp4"])===blender.sourceOwnedVideoSha256,"BLENDER_REAL_VIDEO_BYTES");
 for(const p of sources.priorNative){
  const k=p.id==="haunted-toaster"?"toaster":p.id==="haunted-blender"?"blender":"playdeck";
  need(film.ownerCommits[k]===p.sha,"FILM_OWNER_PIN_"+k);
 }
 return {book,film,bookFiles:bFiles,filmFiles:fFiles,nativeBook,toaster,playdeck,blender};
}
function exact(actual,expected){need(JSON.stringify(actual)===JSON.stringify(expected),"REPLAY_OUTPUT_DIFFERENT");}
async function produce(bookDir,filmDir,rootMap) {
 const parents=ensureParents(bookDir,filmDir);
 need(sources.status==="PROVISIONAL_EXPERIMENT_ONLY" && sources.ownerNativeNew.length===4 &&
  sources.priorNative.length===3,"SEVEN_SOURCE_REGISTRY");
 const owners={};for(const o of sources.ownerNativeNew)owners[o.id]=trustOwner(rootMap[o.id],o);
 const roots=Object.fromEntries(Object.entries(owners).map(([k,v])=>[k,v.path]));
 // FIRST NATIVE ADDITION: Static Field real local fixture card compositor, with refusal control.
 // Mapping from a Workbench held port gap to a fictional Cicada/RADIO experiment is
 // explicitly CANNON-authored. The Field owner did NOT infer semantics from planZ.
 const fieldMod=await native(roots["static-field"],sources.ownerNativeNew.find(x=>x.id==="static-field").path);
 const field=fieldMod.compose({firstId:"cicada",secondId:"radio",stickerId:"echo"});
 const backwards=fieldMod.compose({firstId:"radio",secondId:"cicada",stickerId:"echo"});
 need(field.ok&&field.receipt.authority==="none"&&field.receipt.acceptedIntoSharedWorld===false&&
  field.tool?.supported===true&&field.tool.patternHz.length===4,"FIELD_NATIVE_SUCCESS");
 need(backwards.ok===false && backwards.code==="missing-signal-adapter","FIELD_NATIVE_REFUSAL");
 // SECOND: actual JAR;VIS MADDCL0WN six-up. This question DOES depend on an
 // original Static Field output and the exact selected plan ID.
 const jarMod=await native(roots.jarvis,sources.ownerNativeNew.find(x=>x.id==="jarvis").path);
 const question=("Can the held Book of Machines plan "+parents.book.selectedPlanId+
   " inspire the Static Field quest "+field.quest.title+"?").slice(0,490);
 const answer="The original Field card compiler proposed "+field.quest.objective+
   " All external admissions and mechanical compatibility remain unverified.";
 const jar=jarMod.replaySlots({question,answer,intents:[]});
 need(jar.family.creatures.length===6&&new Set(jar.family.creatures.map(x=>x.renderer)).size===6 &&
   jar.question.includes(parents.book.selectedPlanId)&&jar.question.includes(field.quest.title)&&
   jar.sourceExecution.nativeCannon===false&&jar.externalDispatch===false&&jar.humanOutcomesVerified===false,"JAR_NATIVE_SIXUP");
 // THIRD: original Static Live stage compiler consumes one *actual* JAR creature
 // title as a fictional packet identity. No stems/audio or performers are supplied.
 const liveMod=await native(roots["static-live"],sources.ownerNativeNew.find(x=>x.id==="static-live").path);
 const first=jar.family.creatures[0];
 const packet={version:"static-live.performance-packet/v0.1",
   song:{id:"synthetic-"+first.id,title:first.title,sourceReceipt:jar.family.familyDigest},
   tempo:{bpm:92,meter:"6/8"},landmarks:["question","creative-offer","human-hold"],
   requiredCapabilities:["voice.live","drums.live"],
   stems:[{id:"fictional-drum-fallback",kind:"fallback",coversCapability:"drums.live",path:"NOT_PRESENT/fictional-drums.wav",output:"foh"}],
   cues:{click:"NOT_PRESENT/click.wav",voice:"NOT_PRESENT/cues.wav"}
 };
 const rig={id:"fictional-one-person",label:"Synthetic capability declaration only",
   performers:[{id:"fictional-voice",label:"Unverified performer role",capabilities:["voice.live"]}]};
 const live=liveMod.compileStageProjection(packet,rig);
 const broken=liveMod.compileStageProjection({...packet,stems:[]},rig);
 need(live.version==="static-live.stage-projection/v0.1"&&live.playable&&
   live.song.sourceReceipt===jar.family.familyDigest&&live.song.title===first.title&&
   live.fallbackCoverage[0]?.capability==="drums.live","LIVE_NATIVE_COMPILATION");
 need(broken.playable===false && broken.unresolvedCapabilities.join("|")==="drums.live","LIVE_NEGATIVE_CONTROL");
 const aids=await native(roots["static-live"],"src/render-stage-aids.js");
 const setlist=aids.renderSetlist(live),routing=aids.renderRouting(live);
 need(setlist.includes(first.title)&&routing.includes("fictional-drum-fallback"),"LIVE_NATIVE_STAGE_AIDS");
 // FOURTH: original STATIC OS 008 portable binary-text cartridge codec / lineage.
 // Its fixed statement does not include planZ source identity: CANNON's outer
 // receipt binds the two addresses without pretending that the OS encoded it.
 const cartridge=JSON.parse(run("python3",["-B",join(ROOT,"scripts/reactor-seven-os.py"),
   "--root",roots["static-os"],"--focus","Repair Lab"]));
 need(cartridge.schema==="cannon.native-static-os-cartridge-bridge/v1"&&
   cartridge.cards.length===3&&cartridge.nativeValidation.count===3&&
   cartridge.planZProvenanceEmbedded===false&&cartridge.physicalHardwareUsed===false,"OS_NATIVE_CARTRIDGE");
 const files={
  "native/static-field-composition.json":Buffer.from(json(field)),
  "native/static-field-refusal.json":Buffer.from(json(backwards)),
  "native/jarvis-six-up.json":Buffer.from(json(jar)),
  "native/static-live-packet.json":Buffer.from(json(packet)),
  "native/static-live-stage.json":Buffer.from(json(live)),
  "native/static-live-unplayable-control.json":Buffer.from(json(broken)),
  "native/static-live-setlist.md":Buffer.from(setlist),
  "native/static-live-routing.md":Buffer.from(routing),
  "native/static-os-cartridge.json":Buffer.from(json(cartridge)),
  "native/toaster-family.json":parents.filmFiles["owners/toaster-family.json"],
  "native/playdeck-plan.json":parents.filmFiles["owners/playdeck-plan.json"],
  "native/blender-study.json":parents.filmFiles["owners/blender-study.json"],
  "native/blender-silent-study.mp4":parents.filmFiles["owners/blender-silent-study.mp4"],
  "lineage/book-native-review.json":parents.bookFiles["owners/workbench-native-review.json"]
 };
 const edges=[
  {from:"Haunted Toaster",to:"PlayDeck",kind:"ORIGINAL_NATIVE_DATA",source:"CANNON FILM-PRESS-001"},
  {from:"PlayDeck",to:"Haunted Blender",kind:"ORIGINAL_NATIVE_DATA",source:"CANNON FILM-PRESS-001"},
  {from:"Static Field",to:"JAR;VIS",kind:"ADAPTER_AUTHORED_EXACT_OUTPUT_TO_QUESTION",source:"Field.quest.title and objective become JAR question and answer"},
  {from:"JAR;VIS",to:"Static Live",kind:"ADAPTER_AUTHORED_EXACT_OUTPUT_TO_PACKET",source:"JAR familyDigest and first creative title become Static Live fictional packet"},
  {from:"Book of Machines",to:"STATIC OS",kind:"CANNON_LINK_ONLY_NOT_NATIVE_PAYLOAD",source:"Separate PlanZ reference linked in CANNON receipt, not inside fixed OS statements"}
 ];
 const lineage={
   schema:"cannon.reactor-seven-composed-lines/v1",status:"SEVEN_REAL_OWNER_SOFTWARE_ENGINES_HELD",
   planzSelectedPlanId:parents.book.selectedPlanId,bookReceiptId:parents.book.receiptId,
   filmReceiptId:parents.film.receiptId,
   fields:{fieldId:field.receipt.id,jarFamilyDigest:jar.family.familyDigest,
     staticLiveSongSourceReceipt:live.song.sourceReceipt,staticOsLastCartridgeDigest:cartridge.nativeValidation.last,
     toasterFamilyHash:parents.toaster.familyHash,playdeckPlanId:parents.playdeck.id,
     silentBlenderVideoSha256:parents.blender.sourceOwnedVideoSha256},
   edges,scope:sources.claimLimits
 };
 files["lineage/crossing.json"]=Buffer.from(json(lineage));
 const hashList=Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)).map(([name,buf])=>[name,sha(buf)]));
 const body={
  schema:"cannon.reactor-seven-native-proof/v1",status:"SEVEN_ORIGINAL_CREATIVE_SOFTWARE_ENGINES_EXECUTED",
  selectedPlanId:parents.book.selectedPlanId,
  parentReceipts:{bookReceiptId:parents.book.receiptId,filmReceiptId:parents.film.receiptId},
  originalSourceOwners:[
   ...sources.priorNative.map(x=>({repo:x.repo,sha:x.sha,proof:"FILM_PRESS_NATIVE_EXECUTION"})),
   ...sources.ownerNativeNew.map(x=>({repo:x.repo,sha:x.sha,primaryModuleSha256:owners[x.id].sha256,proof:"SEVEN_NEW_NATIVE_MODULE_EXECUTION"}))
  ],
  witnessedOriginalNativeRuntimes:["Haunted Toaster","PlayDeck","Haunted Blender","Static Field","JAR;VIS","Static Live","STATIC OS"],
  producerPaths:{film:["Toaster > PlayDeck > Blender"],card:["Static Field > CANNON typed question > JAR;VIS > CANNON typed stage packet > Static Live"],offline:["STATIC OS isolated cartridge"],notOneContinuousPipeline:true},
  originalWorkbenchAndPlanZPreserved:true,
  nativeMediaFilePresent:true,silentVideoOnly:true,
  nativeFieldRefusalChecked:true,nativeLiveUnplayableControlChecked:true,
  nativeOsDecodeChecked:true,allAdditionalCreatorsNativeSeven:true,
  realHumanKeepCount:0,actualConcerts:0,physicalMachinesRun:0,publications:0,actualFilmMasterAudio:false,
  files:hashList};
 files["receipt.json"]=Buffer.from(json({...body,receiptId:sha(json(body))}));
 return files;
}
async function main(){
 const [mode,...argv]=process.argv.slice(2);
 need(["build","verify"].includes(mode)&&argv.length%2===0,"USAGE");
 const args={};
 for(let i=0;i<argv.length;i+=2){need(["--book","--film","--roots","--out","--authorize"].includes(argv[i])&&!Object.hasOwn(args,argv[i])&&argv[i+1],"ARGUMENT");args[argv[i]]=argv[i+1];}
 need(args["--book"]&&args["--film"]&&args["--roots"]&&args["--out"],"REQUIRED_INPUT");
 need(mode==="build"?args["--authorize"]==="CI_SCRIPTED_HOLD_ONLY":!args["--authorize"],"AUTHORIZATION");
 const roots=read(resolve(args["--roots"]));
 need(JSON.stringify(Object.keys(roots).sort())===JSON.stringify(sources.ownerNativeNew.map(x=>x.id).sort()),"ROOTS");
 const book=realpathSync(args["--book"]),film=realpathSync(args["--film"]),out=resolve(args["--out"]);
 need(lstatSync(book).isDirectory()&&lstatSync(film).isDirectory()&&!lstatSync(book).isSymbolicLink()&&!lstatSync(film).isSymbolicLink(),"SOURCE_DIR");
 const parent=realpathSync(dirname(out));
 need(join(parent,basename(out))===out,"OUTPUT_PATH");
 for(const p of [book,film,...Object.values(roots).map(v=>realpathSync(v))]){
  const rel=relative(p,out);need(rel===".."||rel.startsWith("../")||rel.startsWith("..\\"),"OUT_INSIDE_SOURCE");
 }
 need(mode==="build"?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()&&!lstatSync(out).isSymbolicLink(),"OUTPUT_STATE");
 const files=await produce(book,film,roots);
 if(mode==="verify"){
  const actual=walk(out);exact(Object.keys(actual).sort(),Object.keys(files).sort());
  for(const [path,buf] of Object.entries(files))need(buf.equals(actual[path]),"COLD_TAMPER_"+path);
 }else{
  const scratch=mkdtempSync(join(parent,".seven-"));
  try{
   const stage=join(scratch,"packet");mkdirSync(stage);
   for(const [path,buf] of Object.entries(files)){const abs=join(stage,path);mkdirSync(dirname(abs),{recursive:true});writeFileSync(abs,buf,{flag:"wx"});}
   renameSync(stage,out);
  }finally{rmSync(scratch,{recursive:true,force:true});}
 }
 process.stdout.write(json({status:mode==="build"?"SEVEN_NATIVE_SOFTWARE_ENGINES_HELD":"SEVEN_OWNER_COLD_REPLAY",
  ownerCount:7,fileCount:Object.keys(files).length,sourcePlanId:read(join(out,"receipt.json")).selectedPlanId,
  realHumans:0,realWorldMachineEffects:0}));
}
main().catch(e=>{process.stderr.write(String(e.message||e).slice(0,2000)+"\n");process.exitCode=2;});
