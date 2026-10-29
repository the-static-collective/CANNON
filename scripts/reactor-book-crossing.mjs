#!/usr/bin/env node
// REACTOR-BOOK-003: original planZ + original Workbench Book + original lemonPRESS.
// Synthetic fixtures and held proofs only. No source branch mutations, service, or hardware.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync, lstatSync, realpathSync, renameSync, rmSync, existsSync } from "node:fs";
import { resolve, join, dirname, relative, basename } from "node:path";
import { execFileSync } from "node:child_process";
const ROOT=resolve(import.meta.dirname,"..");
const source=JSON.parse(readFileSync(join(ROOT,"creative/reactor-book-sources.json"),"utf8"));
const orbit=JSON.parse(readFileSync(join(ROOT,"creative/reactor-creator-orbit.json"),"utf8"));
const digest=x=>createHash("sha256").update(x).digest("hex");
const serial=x=>JSON.stringify(x,null,2)+"\n";
const need=(v,m)=>{if(!v)throw Error("HOLD_REACTOR_BOOK_"+m);};
const exec=(program,args,opts={})=>{
 try{return execFileSync(program,args,{encoding:"utf8",stdio:["ignore","pipe","pipe"],timeout:120000,maxBuffer:16*1024*1024,...opts}).trim();}
 catch(e){throw Error("OWNER_EXEC_"+String(e.stderr||e.message).slice(0,1100));}
};
const owner=(name,path)=>{
 const expected=source.owners[name];const root=realpathSync(path);
 need(exec("git",["-C",root,"rev-parse","HEAD"])===expected.commit,"WRONG_SOURCE_"+name);
 const url=exec("git",["-C",root,"remote","get-url","origin"]);
 need(url.endsWith("/"+expected.repo) || url.endsWith("/"+expected.repo+".git") || url.endsWith(":"+expected.repo+".git"),"WRONG_ORIGIN_"+name);
 need(exec("git",["-C",root,"status","--porcelain","--untracked-files=all"])==="","DIRTY_"+name);
 return root;
};
const pathsOf=(dir,prefix="")=>{
 const ret={};
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  need(!entry.isSymbolicLink(),"SYMLINK");
  const full=join(dir,entry.name),name=prefix+entry.name;
  if(entry.isDirectory())Object.assign(ret,pathsOf(full,name+"/"));
  else{need(entry.isFile(),"FOREIGN_FILE");ret[name]=readFileSync(full);}
 }
 return ret;
};
const same=(a,b)=>{
 need(JSON.stringify(Object.keys(a).sort())===JSON.stringify(Object.keys(b).sort()),"FILE_LIST");
 for(const k of Object.keys(a))need(a[k].equals(b[k]),"TAMPER_"+k);
};
function produce(roots,planId,tmp) {
 const plans=join(tmp,"plans");mkdirSync(plans);
 const manifestText=exec(process.execPath,[join(roots.planz,"reactor/recursive.mjs"),"--depth","2","--cross-limit","4","--format","json","--out-dir",plans],{cwd:roots.planz});
 const manifest=JSON.parse(manifestText);
 const original={...manifest};delete original.manifestSha256;
 need(digest(JSON.stringify(original))===manifest.manifestSha256,"MANIFEST_DIGEST");
 need(manifest.schema==="static-collective/planz-recursive-reactor/v1/manifest" &&
    manifest.authority==="NONE" && manifest.executed===false && manifest.admitted===false,"PLAN_AUTHORITY");
 const proposal=manifest.proposedPlans.find(x=>x.id===planId);
 need(proposal && proposal.kind==="LENS_SYNTHESIS" && proposal.generation===1,"SELECTED_PLAN_NOT_APPROVED_FIXTURE");
 need(proposal.cutIds.length===4 && proposal.status==="PROPOSED_UNVERIFIED","PLAN_CUT_GATES");
 // Execute the original Workbench MADDLOOP/Book classes in a disposable SQLite lab.
 const manifestFile=join(tmp,"manifest.json");writeFileSync(manifestFile,manifestText+"\n");
 const workbenchFile=join(tmp,"workbench.json");
 const py=exec("python3",["-B",join(ROOT,"scripts/reactor-book-workbench.py"),
   "--manifest",manifestFile,"--plan-id",planId,"--scratch",join(tmp,"native-workbench-sqlite"),"--out",workbenchFile],
   {cwd:ROOT,env:{...process.env,PYTHONPATH:roots.workbench,PYTHONDONTWRITEBYTECODE:"1"}});
 const native=JSON.parse(readFileSync(workbenchFile,"utf8"));
 need(native.schema==="cannon.workbench-book-native-review/v1" &&
      native.selectedPlanId===planId && native.planZManifestSha256===manifest.manifestSha256,"WORKBENCH_SOURCE");
 need(native.board.status==="candidate_with_gaps" && native.board.gaps[0].reason==="concrete_lift_gap" &&
      native.syntheticCounterexampleStatus==="synthetic_route_matched" &&
      native.nativeSqliteFolioCount===5 && native.originalBoardReopened===true,"WORKBENCH_REAL_RUN");
 need(native.authority==="NONE" && native.humanSelected===false && native.externalEngineExecuted===false,"WORKBENCH_AUTHORITY");
 const portable={...native};delete portable.portableReviewSha256;
 // Python sorted-key canonical digest is checked by the native python source itself;
 // CANNON binds exact file bytes and owner SHA, not a signature or external proof.
 need(/^[a-f0-9]{64}$/.test(native.portableReviewSha256),"REVIEW_DIGEST");
 const packet={schema:"cannon.machine-folio-review/v1",source:{
     planzCommit:source.owners.planz.commit,planzManifestSha256:manifest.manifestSha256,
     workbenchCommit:source.owners.workbench.commit,selectedPlanId:planId,
     candidateDigest:native.portableReviewSha256
   },folios:native.folios,board:native.board,status:"HELD_CANDIDATE",
   authority:"NONE",executed:false,published:false,approved:false};
 const input=join(tmp,"lemon-input.json");writeFileSync(input,serial(packet));
 const press=join(tmp,"lemonpress");exec(process.execPath,[join(roots.lemonpress,"machine-book/edition.mjs"),
   "build","--in",input,"--out",press],{cwd:roots.lemonpress});
 exec(process.execPath,[join(roots.lemonpress,"machine-book/edition.mjs"),
   "verify","--in",input,"--out",press],{cwd:roots.lemonpress});
 const meta=JSON.parse(readFileSync(join(press,"edition.json"),"utf8"));
 need(meta.release==="HOLD_NOT_PUBLISHED" && !meta.machineExecuted && !meta.pressAuthorized,"PRESS_AUTHORITY");
 need(orbit.status==="PROPOSAL_ONLY_NOT_EXECUTED" && orbit.options.length>=5,"CREATOR_ORBIT");
 const files={
  "owners/planz-manifest.json":Buffer.from(manifestText+"\n"),
  "owners/workbench-native-review.json":readFileSync(workbenchFile),
  "handoff/lemonpress-packet.json":Buffer.from(serial(packet)),
  "creator-orbit/candidates.json":Buffer.from(serial(orbit))
 };
 for(const [name,buf] of Object.entries(pathsOf(plans)))files["owners/planz-cuts/"+name]=buf;
 for(const [name,buf] of Object.entries(pathsOf(press)))files["lemonpress/"+name]=buf;
 const fileHashes=Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,digest(v)]));
 const receipt={schema:"cannon.reactor-book-native-crossing/v1",status:"NATIVE_SOFTWARE_EXECUTED_BUT_ALL_EFFECTS_HELD",
   originalOwners:Object.fromEntries(Object.entries(source.owners).map(([k,v])=>[k,v.commit])),
   selectedPlanId:planId,selectionOrigin:"SCRIPTED_CI_FIXTURE_NOT_HUMAN_KEEP",
   planzManifestSha256:manifest.manifestSha256,workbenchReviewSha256:native.portableReviewSha256,
   nativeOwnersExecuted:["planZ recursive compiler","Static Workbench MADDLOOP and MachineBook","lemonPRESS machine-manuscript editor"],
   portableCutCount:manifest.cuts.length,proposedPlanCount:manifest.proposedPlans.length,
   nativeWorkbenchPortGapCount:native.board.gaps.length,syntheticRepairOnly:true,
   lemonpressState:meta.release,newCreativeOwnerCandidates:orbit.options.length,
   actualMachineOrHardwareRun:false,actualExternalHumanReview:false,projectOwnerAdmission:false,
   realFieldEvent:false,published:false,artistOrDistributionRights:false,
   files:fileHashes};
 files["receipt.json"]=Buffer.from(serial({...receipt,receiptId:digest(serial(receipt))}));
 return files;
}
try{
 const [mode,...args]=process.argv.slice(2);
 need(["list","build","verify"].includes(mode)&&args.length%2===0,"USAGE");
 const opts={};
 for(let i=0;i<args.length;i+=2){need(["--roots","--plan-id","--out","--authorize"].includes(args[i])&&!Object.hasOwn(opts,args[i])&&args[i+1],"ARGUMENT");opts[args[i]]=args[i+1];}
 need(opts["--roots"],"ROOTS");
 const r=JSON.parse(readFileSync(resolve(opts["--roots"]),"utf8"));
 need(JSON.stringify(Object.keys(r).sort())===JSON.stringify(Object.keys(source.owners).sort()),"ROOT_KEYS");
 const roots=Object.fromEntries(Object.entries(r).map(([k,v])=>[k,owner(k,v)]));
 if(mode==="list"){
  need(!opts["--out"]&&!opts["--plan-id"]&&!opts["--authorize"],"LIST_ARGS");
  const tmp=mkdtempSync("/tmp/cannon-reactor-list-");
  try{
   const manifest=JSON.parse(exec(process.execPath,[join(roots.planz,"reactor/recursive.mjs"),"--depth","2","--cross-limit","4","--format","json"],{cwd:roots.planz}));
   const candidates=manifest.proposedPlans.filter(x=>x.kind==="LENS_SYNTHESIS"&&x.generation===1).map(x=>({id:x.id,title:x.title,status:x.status}));
   process.stdout.write(serial({schema:"cannon.reactor-book-selection-menu/v1",status:"CI_SCRIPTED_CHOICE_ONLY",candidates}));
  }finally{rmSync(tmp,{force:true,recursive:true});}
 }else{
  need(opts["--plan-id"]&&/^plan-[a-f0-9]{24}$/.test(opts["--plan-id"]),"MISSING_EXPLICIT_PLAN_ID");
  need(opts["--out"] && (mode==="verify"?!opts["--authorize"]:opts["--authorize"]==="CI_SCRIPTED_HOLD_ONLY"),"AUTHORITY");
  const out=resolve(opts["--out"]);
  const parent=realpathSync(dirname(out));need(join(parent,basename(out))===out,"OUTPUT_PATH");
  for(const root of Object.values(roots)){
   const rel=relative(root,out);need(rel===".."||rel.startsWith("../")||rel.startsWith("..\\"),"INSIDE_OWNER");
  }
  need(mode==="build"?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()&&!lstatSync(out).isSymbolicLink(),"OUTPUT_STATE");
  const tmp=mkdtempSync(join(parent,".reactor-book-"));
  try{
   const files=produce(roots,opts["--plan-id"],tmp);
   if(mode==="verify")same(files,pathsOf(out));
   else{
    const stage=join(tmp,"packet");mkdirSync(stage);
    for(const [name,buffer] of Object.entries(files)){
     const path=join(stage,name);mkdirSync(dirname(path),{recursive:true});writeFileSync(path,buffer,{flag:"wx"});
    }
    renameSync(stage,out);
   }
   process.stdout.write(serial({status:mode==="build"?"THREE_OWNER_NATIVE_HELD_RUN":"THREE_OWNER_COLD_REPLAY",
     selectedPlanId:opts["--plan-id"],outputs:Object.keys(files).length,allExternalEffectsHeld:true}));
  }finally{rmSync(tmp,{recursive:true,force:true});}
 }
}catch(e){process.stderr.write(String(e.message||e).slice(0,2500)+"\n");process.exitCode=2;}
