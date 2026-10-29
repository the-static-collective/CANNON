#!/usr/bin/env node
// ONE-INVENTION-SEVEN-005: one PlanZ selection -> seven original owner-native
// software expressions -> seven independently held return questions.
import {readFileSync,writeFileSync,mkdirSync,readdirSync,realpathSync,lstatSync,existsSync,mkdtempSync,rmSync,renameSync} from "node:fs";
import {resolve,join,dirname,basename,relative} from "node:path";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {pathToFileURL} from "node:url";
const HERE=resolve(import.meta.dirname,".."), reg=JSON.parse(readFileSync(join(HERE,"creative/reactor-seven-sources.json")));
const refs=[...reg.priorNative,...reg.ownerNativeNew];
const need=(x,m)=>{if(!x)throw Error("HOLD_ONE_INVENTION_"+m)};
const sha=x=>createHash("sha256").update(x).digest("hex"),json=x=>JSON.stringify(x,null,2)+"\n";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const exe=(bin,args,o={})=>{try{return execFileSync(bin,args,{encoding:"utf8",maxBuffer:16000000,timeout:180000,stdio:["ignore","pipe","pipe"],...o}).trim();}catch(e){throw Error("OWNER_REFUSED_"+String(e.stderr||e.message).slice(0,1000));}};
function owner(root,ref){
 const p=realpathSync(root);
 need(exe("git",["-C",p,"rev-parse","HEAD"])===ref.sha,"PIN_"+ref.id);
 const url=exe("git",["-C",p,"remote","get-url","origin"]);
 need(url.endsWith("/"+ref.repo)||url.endsWith("/"+ref.repo+".git")||url.endsWith(":"+ref.repo+".git"),"ORIGIN_"+ref.id);
 const changed=exe("git",["-C",p,"status","--porcelain","--untracked-files=all"]).split("\n").filter(Boolean);
 need(changed.every(x=>x.startsWith("?? node_modules/")||x.startsWith("?? out/")),"DIRTY_"+ref.id);
 return p;
}
function contents(p,prefix=""){
 let files={};
 for(const item of readdirSync(p,{withFileTypes:true})){
  need(!item.isSymbolicLink(),"SYMLINK");
  const abs=join(p,item.name),name=prefix+item.name;
  if(item.isDirectory())Object.assign(files,contents(abs,name+"/"));
  else{need(item.isFile(),"NONFILE");files[name]=readFileSync(abs);}
 }
 return files;
}
function loadBook(dir,id){
 const r=read(join(dir,"receipt.json")),f=contents(dir);
 need(r.schema==="cannon.reactor-book-native-crossing/v1"&&r.selectedPlanId===id&&
 r.actualExternalHumanReview===false&&r.published===false,"BOOK_GATE");
 need(Object.keys(f).length===Object.keys(r.files).length+1,"BOOK_FILE_COUNT");
 for(const [name,digest] of Object.entries(r.files))need(f[name]&&sha(f[name])===digest,"BOOK_TAMPER_"+name);
 const m=JSON.parse(f["owners/planz-manifest.json"]),p=m.proposedPlans.find(x=>x.id===id);
 need(p&&p.kind==="LENS_SYNTHESIS"&&p.generation===1&&p.status==="PROPOSED_UNVERIFIED"&&
 !p.executed&&p.humanSelection==="NONE","PLAN_GATE");
 const b=JSON.parse(f["owners/workbench-native-review.json"]);
 need(b.selectedPlanId===id&&b.board.status==="candidate_with_gaps"&&
 Object.keys(b.sourceCutIds).length===4,"WORKBENCH_GATE");
 return {receipt:r,manifest:m,proposal:p,book:b};
}
function html(v){
 const esc=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
 const items=[
  ["01 / Haunted Toaster","Six real original source-native sigil proposals","../views/toaster.json"],
  ["02 / PlayDeck","The original logical scene compositor","../views/playdeck.json"],
  ["03 / Haunted Blender","Real silent, small mechanical film study","../views/study.mp4"],
  ["04 / Static Field","Original local playable composition proposal","../views/field.json"],
  ["05 / JAR;VIS","Original MADDCL0WN six-up creature family","../views/jarvis.json"],
  ["06 / Static Live","Original fictional stage-projection compiler","../views/stage.md"],
  ["07 / STATIC OS","Original portable proposal cartridge","../views/cartridge.gc1"]
 ];
 const cards=items.map(([title,desc,path],i)=>'<article><b>0'+(i+1)+'</b><h2>'+esc(title)+'</h2><p>'+esc(desc)+'</p>'+
  (i===2?'<video muted controls src="'+path+'" aria-label="Silent Blender study"></video>':'')+
  (i===4?'<p>'+esc(v.jar.family.creatures.map(x=>x.species).join(" / "))+'</p>':'')+
  '<a href="'+path+'">Inspect exact native output</a></article>').join("\n");
 return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>ONE INVENTION / SEVEN DREAMS · HELD</title><style>body{margin:0;background:#14252a;color:#f9e9cd;font:18px/1.5 Georgia;padding:5vw}h1{font-size:clamp(2.4rem,7vw,5rem);line-height:1.05;color:#f4c387}header{max-width:900px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}article{background:#294048;border:1px solid #b69971;padding:24px;min-height:240px}article b{font:42px monospace;color:#e4a87d}a{color:#b4ebdc}video{width:100%;image-rendering:pixelated;background:#080e0e}code{overflow-wrap:anywhere}footer{margin-top:2rem;border-top:1px solid #b69971;padding:2rem}</style>'+
 '<header><small>STATIC COLLECTIVE · CANNON · HELD MACHINE EXHIBITION</small><h1>ONE INVENTION.<br>SEVEN DIFFERENT DREAMS.</h1>'+
 '<p>One original PlanZ candidate, native Workbench source, seven distinct software expressions and seven return questions. This is not evidence of seven physical machines, a real concert, user media rights, a released publication, or a human creative KEEP.</p>'+
 '<p>Selected original plan: <code>'+esc(v.id)+'</code></p></header><main>'+cards+'</main><footer><p>All source-owner runtimes execute in read-only pinned checkouts. Connections between their APIs are explicitly authored by CANNON. The renderer is a fictional 3-second silent animation. The cartridge is not an actual Wii boot. Everything is HELD, NOT PUBLISHED.</p><a href="../lineage/return.json">Seven next experiments</a> · <a href="../receipt.json">Source/byte receipts</a></footer></html>\n';
}
async function build(bookDir,rootMap,id,tmp) {
 const book=loadBook(bookDir,id);
 const roots={};for(const r of refs)roots[r.id]=owner(rootMap[r.id],r);
 const seed=sha(json({id,planzManifest:book.manifest.manifestSha256,workbench:book.book.portableReviewSha256}));
 const rootSeed="INVENTION-005-"+seed.slice(0,30);
 const invention={schema:"cannon.one-invention/v1",selectedPlanId:id,seed,
  parentBookReceiptId:book.receipt.receiptId,sourcePlanZManifestSha256:book.manifest.manifestSha256,
  lensCutIds:book.book.sourceCutIds,workbenchGap:book.book.board.gaps[0],
  authority:"NONE",humanSelection:"SCRIPTED_CI_ONLY",executablePhysicalMachine:false};
 // Actual source-owner Haunted Toaster generation. It accepts a deterministic
 // rootSeed, but receives NO power to access/invoke the plan.
 const tScript=[
  "const fs=require('fs'),path=require('path');",
  "const base=path.join(process.cwd(),'src/full-measure/src/generation');",
  "const{createFreeSigilExpression}=require(path.join(base,'sigil-topology-expression.cjs'));",
  "const{generateSigilUtteranceFamily,replaySigilUtteranceFamily}=require(path.join(base,'sigil-utterance-family.cjs'));",
  "const parent=createFreeSigilExpression({primitives:['P8','PA']});",
  "const family=generateSigilUtteranceFamily({parentExpression:parent,rootSeed:process.env.INVENTION_SEED,count:6});",
  "if(family.utterances.length!==6||!replaySigilUtteranceFamily(family,{parentExpression:parent}).ok)throw Error('OWNER_FAILED');",
  "const x={schema:family.schema,familyHash:family.familyHash,seed:family.rootSeed,sourceKind:family.sourceKind,producedCount:family.producedCount,utterances:family.utterances.map(u=>({role:u.role,planHash:u.planHash,expressionHash:u.expressionHash,operation:u.operation}))};",
  "fs.writeFileSync(process.env.INVENTION_OUT,JSON.stringify(x,null,2)+'\\n');"
 ].join("\n");
 const toasterFile=join(tmp,"toaster.json");
 exe(process.execPath,["-e",tScript],{cwd:roots["haunted-toaster"],env:{...process.env,INVENTION_SEED:rootSeed,INVENTION_OUT:toasterFile}});
 const toaster=read(toasterFile);
 need(toaster.seed===rootSeed&&toaster.utterances.length===6,"TOASTER_SOURCE_PLAN");
 const deck={schemaVersion:"0.1",id:"cannon-"+seed.slice(0,18),title:"One invention / seven dreams",
  cards:toaster.utterances.map((x,i)=>({id:"sigil-"+(i+1),source:"sigil://"+x.planHash,
   traits:[x.role,"plan-"+seed.slice(0,10)],temperament:["proposal"],
   permissions:{flip:true,fold:true,fracture:true,portal:false,awaken:false}})),
  order:toaster.utterances.map((_,i)=>"sigil-"+(i+1)),
  metadata:{sourceFamilyHash:toaster.familyHash,selectedSourcePlanId:id,assetBinding:"logical-only"}};
 const deckFile=join(tmp,"deck.json"),planFile=join(tmp,"playdeck.json");
 writeFileSync(deckFile,json(deck));
 const track=join(HERE,"creative/film-press-synthetic-track.json"),
       world=join(HERE,"creative/film-press-synthetic-world.json"),
       lyrics=join(HERE,"creative/film-press-synthetic-lyrics.json");
 const pScript=[
  "import fs from 'node:fs';",
  "import{composeDeck,assertValidCompositionPlan}from './packages/composer/src/index.ts';",
  "const deck=JSON.parse(fs.readFileSync(process.env.ONE_DECK));",
  "const track=JSON.parse(fs.readFileSync(process.env.ONE_TRACK));",
  "const world=JSON.parse(fs.readFileSync(process.env.ONE_WORLD));",
  "const plan=composeDeck({deck,track,worldRule:world,options:{id:'invention-'+process.env.ONE_SEED,fps:24,width:96,height:64}});",
  "assertValidCompositionPlan(plan,deck);",
  "fs.writeFileSync(process.env.ONE_OUT,JSON.stringify(plan,null,2)+'\\n');"
 ].join("\n");
 exe(process.execPath,["--import","tsx","--input-type=module","-e",pScript],
   {cwd:roots.playdeck,env:{...process.env,ONE_DECK:deckFile,ONE_TRACK:track,ONE_WORLD:world,ONE_SEED:seed.slice(0,12),ONE_OUT:planFile}});
 const playdeck=read(planFile);
 need(playdeck.events.length>0&&playdeck.id.includes(seed.slice(0,12)),"PLAYDECK_NATIVE");
 const filmDir=join(tmp,"film");
 exe("python3",[join(HERE,"scripts/film-press-blender.py"),track,lyrics,toasterFile,planFile,filmDir],
  {cwd:roots["haunted-blender"],env:{...process.env,PYTHONPATH:roots["haunted-blender"]}});
 const film=read(join(filmDir,"study.json")),mp4=readFileSync(join(filmDir,"silent.mp4"));
 need(film.toasterFamilyHash===toaster.familyHash&&film.playdeckPlanId===playdeck.id&&
  sha(mp4)===film.sourceOwnedVideoSha256&&!film.masterAudioPresent&&!film.distributionAuthorized,"BLENDER_NATIVE");
 // Native Field: choose only amongst its known valid cards, index from actual plan digest.
 const fm=await import(pathToFileURL(join(roots["static-field"],"experiments/postemahhn-living-deck-001/composer.mjs")).href);
 const combos=[
  {firstId:"cicada",secondId:"radio",stickerId:"echo"},
  {firstId:"cup",secondId:"door",stickerId:"open"},
  {firstId:"radio",secondId:"door",stickerId:"grow"},
  {firstId:"cup",secondId:"radio",stickerId:"pour"}];
 const fieldChoice=combos[parseInt(seed.slice(0,2),16)%4],field=fm.compose(fieldChoice);
 const refused=fm.compose({firstId:"radio",secondId:"cicada",stickerId:"echo"});
 need(field.ok&&field.receipt.authority==="none"&&!field.receipt.acceptedIntoSharedWorld&&
  refused.ok===false&&refused.code==="missing-signal-adapter","FIELD_NATIVE");
 const jm=await import(pathToFileURL(join(roots.jarvis,"src/cabaret/slots.mjs")).href);
 const question="Can the proposed invention "+id+" become "+field.quest.title+"?";
 const answer="The Book records "+invention.workbenchGap.reason+". Static Field says: "+field.quest.objective+
  " This is only a software proposal, never a physically verified work or consent.";
 const jar=jm.replaySlots({question,answer,intents:[]});
 need(jar.question.includes(id)&&jar.question.includes(field.quest.title)&&
  jar.family.creatures.length===6&&jar.receipts.length===0&&!jar.externalDispatch,"JAR_NATIVE");
 const liveModule=await import(pathToFileURL(join(roots["static-live"],"src/compiler.js")).href);
 const aids=await import(pathToFileURL(join(roots["static-live"],"src/render-stage-aids.js")).href);
 const performance={version:"static-live.performance-packet/v0.1",
   song:{id:"fictional-"+seed.slice(0,12),title:jar.family.creatures[0].title,sourceReceipt:jar.family.familyDigest},
   tempo:{bpm:92,meter:"6/8"},landmarks:["folio","expressions","hold"],
   requiredCapabilities:["voice.live","drums.live"],
   stems:[{id:"synthetic-fallback-not-an-audio-file",kind:"fallback",coversCapability:"drums.live",path:"NO_MASTER/drums.wav",output:"foh"}],
   cues:{click:"NO_MASTER/click.wav",voice:"NO_MASTER/cues.wav"}};
 const config={id:"fictional",label:"Unverified roles",performers:[
  {id:"fictional-voice",label:"Not a real scheduled performer",capabilities:["voice.live"]}]};
 const live=liveModule.compileStageProjection(performance,config),
 negative=liveModule.compileStageProjection({...performance,stems:[]},config);
 need(live.playable&&!negative.playable&&negative.unresolvedCapabilities.includes("drums.live")&&
   live.song.sourceReceipt===jar.family.familyDigest,"LIVE_NATIVE");
 const focus=parseInt(seed.slice(2,4),16)%2===0?"Repair Lab":"Festival Table";
 const os=JSON.parse(exe("python3",["-B",join(HERE,"scripts/reactor-seven-os.py"),
   "--root",roots["static-os"],"--focus",focus]));
 need(os.nativeValidation.count===3&&!os.planZProvenanceEmbedded&&
  !os.physicalHardwareUsed&&os.focus===focus,"OS_NATIVE");
 const outputs=[
  ["Haunted Toaster",toaster.familyHash,sha(readFileSync(toasterFile)),"plan-derived deterministic source root seed"],
  ["PlayDeck",playdeck.id,sha(readFileSync(planFile)),"original Toaster children into typed logical cards"],
  ["Haunted Blender",film.sourceOwnedVideoSha256,sha(mp4),"original Toaster plus PlayDeck scene into silent film"],
  ["Static Field",field.receipt.id,sha(json(field)),"CANNON selected bounded authentic Field fixture by source digest"],
  ["JAR;VIS",jar.family.familyDigest,sha(json(jar)),"original plan identity plus native Field quest enter question"],
  ["Static Live",jar.family.familyDigest,sha(json(live)),"native JAR creature enters fictional stage packet"],
  ["STATIC OS",os.nativeValidation.last,sha(json(os)),"CANNON source-bound focus selects native cartridge chain"]
 ].map(([owner,ownerReceipt,payloadSha256,adapter])=>({
  schema:"cannon.invention-expression/v1",sourcePlanId:id,sourceManifest:book.manifest.manifestSha256,
  owner,ownerReceipt,payloadSha256,adapter,originalSoftwareExecuted:true,
  realHumanKeep:false,realWorldEffect:false,authority:"NONE"}));
 const nextQuestions={
  "Haunted Toaster":"Which sigil's declared ports can be checked against a second real capability owner?",
  "PlayDeck":"What independently owned media asset makes this logical scene truly renderable?",
  "Haunted Blender":"Can a rights-cleared source sound and approved visual score replace the silent demonstration?",
  "Static Field":"Which actually issued card and separately consenting receiver can replace these fixed test cards?",
  "JAR;VIS":"Which one offered creature does a real human KEEP, and what did they refuse?",
  "Static Live":"Which real musicians and masters are available rather than simply declared in a fictional packet?",
  "STATIC OS":"Can this cartridge be decoded on a real older device with independent evidence and no implied permission?"
 };
 const returnPlans=outputs.map(x=>{
  const proposal={schema:"cannon.machine-return-proposal/v1",originalPlanId:id,
   owner:x.owner,ownerOutputSha256:x.payloadSha256,originalBookReceiptId:book.receipt.receiptId,
   nextExperiment:nextQuestions[x.owner],humanReview:"NONE",
   authority:"NONE",status:"HELD_UNVALIDATED",sourceIsNativeSoftware:true,realWorldValidation:false};
  return {id:"return-"+sha(json(proposal)).slice(0,24),...proposal};
 });
 const returns={schema:"cannon.seven-ways-return-ledger/v1",
  sourcePlanId:id,originalBookReceiptId:book.receipt.receiptId,
  originalPlanZRecursionReexecutedWithReturns:false,sevenNewCandidatesHeld:true,
  candidates:returnPlans,explicitlyNoAutomaticSourceOwnerAdmission:true};
 const files={
  "invention/source.json":Buffer.from(json(invention)),
  "views/toaster.json":readFileSync(toasterFile),
  "views/deck.json":Buffer.from(json(deck)),
  "views/playdeck.json":readFileSync(planFile),
  "views/blender-study.json":readFileSync(join(filmDir,"study.json")),
  "views/study.mp4":mp4,
  "views/field.json":Buffer.from(json(field)),
  "views/field-refused.json":Buffer.from(json(refused)),
  "views/jarvis.json":Buffer.from(json(jar)),
  "views/stage-packet.json":Buffer.from(json(performance)),
  "views/stage-projection.json":Buffer.from(json(live)),
  "views/stage-negative.json":Buffer.from(json(negative)),
  "views/stage.md":Buffer.from(aids.renderSetlist(live)),
  "views/stage-routing.md":Buffer.from(aids.renderRouting(live)),
  "views/cartridge.json":Buffer.from(json(os)),
  "views/cartridge.gc1":Buffer.from(os.encoded+"\n"),
  "lineage/expressions.json":Buffer.from(json(outputs)),
  "lineage/return.json":Buffer.from(json(returns)),
  "lineage/original-planz-synthesis.json":Buffer.from(json(book.proposal)),
  "lineage/original-workbench-folios.json":Buffer.from(json(book.book)),
  "exhibit/index.html":Buffer.from(html({id,jar}))
 };
 for(const r of returnPlans)files["return-proposals/"+r.id+".json"]=Buffer.from(json(r));
 const hashes=Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,sha(v)]));
 const receipt={schema:"cannon.one-invention-seven-native/v1",sourcePlanId:id,sourceBookReceiptId:book.receipt.receiptId,
  sourcePlanZManifest:book.manifest.manifestSha256,seed,
  status:"SEVEN_NATIVE_CREATIVE_SOFTWARE_EXPRESSIONS_HELD",
  originalOwners:Object.fromEntries(refs.map(x=>[x.id,x.sha])),
  expressionCount:outputs.length,heldReturnQuestionCount:returnPlans.length,
  originalHumanSelections:0,stagedAudioAvailable:false,filmHasAudio:false,
  licensedPublicRelease:false,physicalMachineOperated:false,independentFieldTest:false,
  mappingsAreCannonAuthored:true,
  originalPlanZUpdated:false,files:hashes};
 files["receipt.json"]=Buffer.from(json({...receipt,receiptId:sha(json(receipt))}));
 return files;
}
async function main(){
 const [mode,...params]=process.argv.slice(2);
 need(["build","verify"].includes(mode)&&params.length%2===0,"USAGE");
 const a={};for(let i=0;i<params.length;i+=2){
  need(["--book","--roots","--plan-id","--out","--authorize"].includes(params[i])&&!Object.hasOwn(a,params[i])&&params[i+1],"ARGS");
  a[params[i]]=params[i+1];
 }
 need(a["--book"]&&a["--roots"]&&a["--plan-id"]&&a["--out"],"MISSING");
 need(/^plan-[a-f0-9]{24}$/.test(a["--plan-id"]),"PLAN_ID");
 need(mode==="build"?a["--authorize"]==="CI_SCRIPTED_HOLD_ONLY":!a["--authorize"],"AUTHORITY");
 const roots=read(resolve(a["--roots"]));
 need(JSON.stringify(Object.keys(roots).sort())===JSON.stringify(refs.map(x=>x.id).sort()),"OWNERS");
 const book=realpathSync(a["--book"]),out=resolve(a["--out"]),parent=realpathSync(dirname(out));
 need(lstatSync(book).isDirectory()&&join(parent,basename(out))===out,"OUT_PATH");
 for(const root of [book,...Object.values(roots).map(x=>realpathSync(x))]){
  const rel=relative(root,out);need(rel===".."||rel.startsWith("../")||rel.startsWith("..\\"),"DEST_INSIDE_SOURCE");
 }
 need(mode==="build"?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()&&!lstatSync(out).isSymbolicLink(),"OUTPUT_STATE");
 const tmp=mkdtempSync(join(parent,".one-seven-"));
 try{
  const files=await build(book,roots,a["--plan-id"],tmp);
  if(mode==="verify"){
   const previous=contents(out);
   need(JSON.stringify(Object.keys(previous).sort())===JSON.stringify(Object.keys(files).sort()),"FILE_SET");
   for(const [name,bytes] of Object.entries(files))need(bytes.equals(previous[name]),"TAMPER_"+name);
  }else{
   const packet=join(tmp,"packet");mkdirSync(packet);
   for(const [name,bytes] of Object.entries(files)){
    const dest=join(packet,name);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,bytes,{flag:"wx"});
   }
   renameSync(packet,out);
  }
  process.stdout.write(json({status:mode==="build"?"ONE_INVENTION_SEVEN_NATIVE":"ONE_INVENTION_SEVEN_COLD_REPLAY",
   sourcePlan:a["--plan-id"],nativeCreativeEngines:7,returnIdeas:7,files:Object.keys(files).length,
   actualPhysicalEffects:0}));
 }finally{rmSync(tmp,{force:true,recursive:true});}
}
main().catch(e=>{process.stderr.write(String(e.stack||e).slice(0,1600)+"\n");process.exitCode=2;});
