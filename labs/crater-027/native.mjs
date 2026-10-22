// CANNON STACK² 027 — THE WARM THREAD COMES HOME.
// Original GHoT -> original Full Measure -> original GHoT recomposition;
// a separately declared CANNON fixture enters original Garden + Band Runtime.
// These are *local fictional simulations*, never human acts or help delivery.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

export const SOURCES = Object.freeze([
  {key:"ghot",repo:"the-static-collective/GHoT",pr:33,commit:"3c8be40cbaef2f9c786e5424abf15d4b138d2966",
    files:["ghot/warm_thread.py","ghot/warm_thread_sim.py"]},
  {key:"full",repo:"the-static-collective/full-measure-world-layer",pr:50,commit:"553e97401a8483a0ee3c369fed9d3fb8f1c9058d",
    files:["experiments/warm-thread-world-001/warm-thread.mjs","experiments/warm-thread-world-001/residue-producer.mjs"]},
  {key:"band",repo:"the-static-collective/band-runtime",pr:25,commit:"f2c889df90905eda533fe6d978cd1a52c788a33e",
    files:["src/help-case/envelope.ts","src/help-case/receive.ts","src/help-case/events.ts",
      "src/help-case/projection.ts","src/help-case/statusPacket.ts"]},
  {key:"garden",repo:"the-static-collective/BananaSpork",pr:8,commit:"6738230a8557060dd59aabc19caf21826806d16f",
    files:["src/domain/hashes.ts","src/domain/help-slip/envelope.ts","src/domain/help-slip/holdStore.ts",
      "src/domain/help-slip/pour.ts"]}
]);
const sha = value => createHash("sha256").update(typeof value==="string"?value:JSON.stringify(value)).digest("hex");
const refuse = reason => { throw new Error("CRATER_027_REFUSED: " + reason); };
const must = (condition,reason) => { if (!condition) refuse(reason); };
const clone = value => structuredClone(value);
const CLOCK="2026-10-22T12:00:00.000Z";

export function verifySources(roots){
  must(roots && typeof roots==="object" && !Array.isArray(roots),"root map required");
  must(Object.keys(roots).length===4 && SOURCES.every(s=>Object.hasOwn(roots,s.key)),"four explicit owner roots required");
  const used=new Set();
  return SOURCES.map(source=>{
    must(typeof roots[source.key]==="string" && isAbsolute(roots[source.key]),"absolute checkout required");
    const dir=realpathSync(roots[source.key]);
    must(!used.has(dir),"source checkout reused as another owner"); used.add(dir);
    const head=execFileSync("git",["-C",dir,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
    must(head===source.commit,"source Git HEAD mismatch: "+source.key);
    const files=source.files.map(name=>{
      const path=realpathSync(join(dir,name));
      must(path.startsWith(dir+sep),"file escapes source");
      const observed=readFileSync(path);
      const gitBlob=execFileSync("git",["-C",dir,"show",head+":"+name],{maxBuffer:12*1024*1024});
      must(observed.equals(gitBlob),"source object drift: "+source.key+"/"+name);
      return {path:name,sha256:sha(observed.toString("utf8"))};
    });
    return {repo:source.repo,pr:source.pr,commit:head,originalGitObjectsMatch:true,files};
  });
}

function python(roots,command,residue){
  const args=[join(roots.ghot,"ghot/warm_thread.py"),command];
  const options={encoding:"utf8",maxBuffer:1024*1024};
  if(residue !== undefined) options.input=JSON.stringify(residue);
  return JSON.parse(execFileSync("python3",args,options));
}
const importer=(roots,key,source)=>import(pathToFileURL(join(roots[key],source)).href);

export async function runWarmThread(roots){
  const sourceChecks=verifySources(roots);
  const [world,bandReceive,bandEvent,bandProjection,bandStatus,gardenStore,gardenPour]=await Promise.all([
    importer(roots,"full","experiments/warm-thread-world-001/warm-thread.mjs"),
    importer(roots,"band","src/help-case/receive.ts"),
    importer(roots,"band","src/help-case/events.ts"),
    importer(roots,"band","src/help-case/projection.ts"),
    importer(roots,"band","src/help-case/statusPacket.ts"),
    importer(roots,"garden","src/domain/help-slip/holdStore.ts"),
    importer(roots,"garden","src/domain/help-slip/pour.ts")
  ]);

  // Real GHoT fixture-proposal producer. Its people and resources are not real.
  const proposal=python(roots,"proposal");
  must(proposal.format==="ghot.warm-thread-proposal" &&
    proposal.authority==="proposal-only" &&
    proposal.sourceVerification==="self-declared-inputs-unverified" &&
    proposal.privacy.exact_household_address==="withheld","GHoT proposal overclaimed");
  const proposalSha=sha(proposal);

  // Native Full Measure local world. Each finite fictional actor step has
  // its own fresh "ACT"; none licenses another actor's step.
  let state=world.openWarmThread(clone(proposal));
  must(state.ok && state.need.status==="open" && state.worldAuthority==="local-preview-only","Full Measure did not HOLD");
  const withoutPermission=world.attemptStep(state,"release-tree","alice","SUCCEEDED");
  must(!withoutPermission.ok && withoutPermission.code==="authorization-required","step auto-executed");
  const alice=world.authorizeStep(state,"release-tree","alice","ACT");
  must(alice.ok,"Alice local ACT required");
  must(world.authorizeStep(state,"release-tree","bob","ACT").code==="wrong-actor","Bob cannot authorize Alice");
  state=world.attemptStep(alice,"release-tree","alice","SUCCEEDED");
  must(state.ok && state.nextStep==="cut-tree","first step consequence missing");
  must(world.attemptStep(state,"cut-tree","bob","SUCCEEDED").code==="authorization-required",
    "first actor silently authorized second step");
  const bob=world.authorizeStep(state,"cut-tree","bob","ACT");
  must(bob.ok,"Bob exact ACT rejected");
  state=world.attemptStep(bob,"cut-tree","bob","SUCCEEDED");
  must(state.ok && state.resources.firewood.state==="cut-at-source","cut resource not preserved");

  must(world.refuseStep(state,"haul-load","alice").code==="wrong-actor","someone else refused for Cara");
  state=world.refuseStep(state,"haul-load","cara","truck unavailable after all");
  must(state.ok && state.phase==="held-residual" && state.need.status==="open" &&
    state.resources.firewood.state==="cut-at-source" &&
    state.resources.truck.loadsAvailable===1,"refusal changed legitimate prior consequence");
  must(world.authorizeStep(state,"accept-delivery","david","ACT").code==="held-residual",
    "refusal did not stop dependent steps");
  const residue=world.exportWarmThreadResidue(state);
  must(residue.format==="full-measure.warm-thread-residue" &&
    residue.unresolvedRelation==="haul-firewood" &&
    residue.remainingNeed.status==="open" &&
    residue.remainingNeed.exactAddress==="withheld-from-shared-state" &&
    residue.humanWorthJudgment===null && residue.score===null &&
    residue.authority==="observation-only" &&
    residue.sharedWorldChanged===false,"Full Measure residue overclaimed");
  assert.deepEqual(residue.completedSteps,["release-tree","cut-tree"]);
  const residueSha=sha(residue);

  // Original GHoT receiver recomposes the Full Measure residue via original
  // Python CLI. Replacement Erin is a CANDIDATE, not an authorized helper.
  const alternative=python(roots,"recompose",residue);
  must(alternative.format==="ghot.warm-thread-recomposition" &&
    alternative.status==="composable" &&
    alternative.authority==="proposal-only" &&
    alternative.parent_warm_thread_id===proposal.warm_thread_id &&
    alternative.preserved_completed_steps.join(",")==="release-tree,cut-tree" &&
    alternative.unresolved_relation==="haul-firewood" &&
    alternative.remaining_need.status==="open" &&
    alternative.steps.length===2 &&
    alternative.steps[0].actor==="erin" &&
    alternative.steps[0].authorization==="required-separately" &&
    alternative.steps[1].actor==="david" &&
    alternative.requested_effect.automatic_execution_requested===false,
    "GHoT recomposition invented authority or erased source consequence");
  const forged=clone(residue);
  forged.score=1;
  const rejected=spawnSync("python3",[join(roots.ghot,"ghot/warm_thread.py"),"recompose"],{
    input:JSON.stringify(forged),encoding:"utf8"
  });
  must(rejected.status!==0 && rejected.stderr.includes("WarmThreadError"),
    "original GHoT allowed score laundering");

  // Now a CANNON-authored FICTIONAL fixture request; it is NOT a GHoT,
  // Garden, Band, Full Measure or independently attested human source need.
  // The fixture creates a neutral transport-help case that can hold an
  // informational reference to the (fictional) refusal without becoming
  // recipient confirmation or a real physical service.
  const slip={
    schema:"fulfillment-envelope/v0",envelopeId:"fixture:warm-027",
    purpose:"Fictional warm-thread: one pickup load requires transport",
    createdAt:CLOCK,
    requirements:[{id:"fixture:haul-firewood",kind:"transport",
      description:"Transport one fictional load of cut firewood",quantity:1,unit:"load"}],
    source:{system:"CANNON-SYNTHETIC-FIXTURE"},
    disclosure:{includesOnlySelectedResiduals:true,omittedPrivateContext:true},status:"unmet"
  };
  const raw=JSON.stringify(slip),originalSlipSha=sha(slip);
  const held=new Map(),storage={
    getItem:k=>held.get(k)??null,setItem:(k,v)=>held.set(k,v),removeItem:k=>held.delete(k)
  };
  const shelf=new gardenStore.HelpSlipHoldStore(storage);
  const incoming=shelf.holdImportedHelpSlip(raw,{occurrenceId:"fixture:arrival-a",receivedAt:CLOCK});
  const repeated=shelf.holdImportedHelpSlip(raw,{occurrenceId:"fixture:arrival-b",receivedAt:CLOCK});
  must(incoming.disposition==="held" && incoming.caseCreated &&
    repeated.disposition==="held" && !repeated.caseCreated,"Garden duplicate demand");
  const readBack=new gardenStore.HelpSlipHoldStore(storage).listHeldHelpCases();
  must(readBack.length===1 && readBack[0].arrivals.length===2,"Garden shelf lost local history");
  const gardenCase=readBack[0];
  const preview=gardenPour.buildCampfirePourPreview(gardenCase,"fixture:haul-firewood",{
    circleId:"fixture:fictional-circle",circleLabel:"Fictional Circle"
  });
  must(preview.command.targetUnits===1 && preview.command.unitLabel==="load" &&
    gardenCase.requirementLinks.length===0,"Garden preview silently published");
  const gardenResidual=gardenPour.projectHelpSlipResidual(gardenCase,[]);
  must(gardenResidual.length===1 && gardenResidual[0].confirmedUnits===0 &&
    gardenResidual[0].confirmedResidual===1,"Garden unshared need falsely closed");

  // Band Runtime owns its own event history. Import the same fixture carrier
  // and record only a CANNON-transcribed, strictly bounded NOTE (not offer,
  // delivery or recipient confirmation). That is deliberately weaker than
  // the simulated FM local "SUCCEEDED" labels.
  const b1=bandReceive.receiveHelpSlip(raw,{
    occurrenceId:"fixture:band-a",receivedAt:CLOCK,carrier:"pasted_json"},[]);
  const b2=bandReceive.receiveHelpSlip(raw,{
    occurrenceId:"fixture:band-b",receivedAt:CLOCK,carrier:"pasted_json"},[b1.receipt]);
  must(b1.caseCreated && b1.heldCase && !b2.caseCreated &&
    b2.receipt.duplicateOfOccurrenceId==="fixture:band-a" &&
    b1.receipt.payloadHash===gardenCase.payloadHash,"native Band/Garden source custody diverged");
  const caseId=b1.heldCase.caseId;
  const note={
    eventId:"fixture:unverified-refusal-note",type:"case.note_recorded",
    caseId,requirementId:"fixture:haul-firewood",occurredAt:CLOCK,
    actorRef:"fixture:scenario-operator",
    note:"CANNON FICTIONAL PREVIEW ONLY: Full Measure reported haul-firewood refused; source remains unconfirmed."
  };
  bandEvent.validateHelpCaseEvent(note,{caseId,receives:[b1.receipt],priorEvents:[]});
  const status=bandStatus.buildHelpCaseStatusPacket(
    bandProjection.projectHelpCase(caseId,[b1.receipt,b2.receipt],[note]),CLOCK);
  const outcome=status.requirements[0];
  must(status.sourcePayloadHash===gardenCase.payloadHash &&
    outcome.requestedQuantity===1 &&
    outcome.confirmedReceivedQuantity===0 &&
    outcome.confirmedResidualQuantity===1 &&
    outcome.reportedDeliveredQuantity===undefined &&
    outcome.conservation.holds===true &&
    status.claims.projectionOnly===true,"Band treated proposal/refusal note as assistance");
  must(sha(slip)===originalSlipSha,"source fixture mutated");
  const badEvent={...note,eventId:"fixture:fake-delivery",type:"receipt.confirmed",
    quantity:1,unit:"load"};
  assert.throws(()=>bandEvent.validateHelpCaseEvent(badEvent,{
    caseId,receives:[b1.receipt],priorEvents:[note]}),/RECIPIENT_AUTHORITY_BASIS_REQUIRED/);

  // Even when the Full Measure LOCAL simulation takes all four successful
  // paths, its success cannot be converted into a Band recipient receipt.
  let alternateWorld=world.openWarmThread(clone(proposal));
  for(const [step,actor] of [["release-tree","alice"],["cut-tree","bob"],
      ["haul-load","cara"],["accept-delivery","david"]]){
    const permission=world.authorizeStep(alternateWorld,step,actor,"ACT");
    must(permission.ok,"full-world step needed independent fixture ACT: "+step);
    alternateWorld=world.attemptStep(permission,step,actor,"SUCCEEDED");
    must(alternateWorld.ok,"native full-world fixture action failed: "+step);
  }
  must(alternateWorld.phase==="completed" && alternateWorld.need.status==="met-for-this-load" &&
    outcome.confirmedReceivedQuantity===0 && outcome.confirmedResidualQuantity===1,
    "native simulation promoted itself to real help-case receipt");

  return {body:{
    schema:"cannon.stack2-027-warm-thread-return/v0",
    classification:"FOUR_ORIGINAL_DONOR_OFFLINE_FICTIONAL_PREVIEW_ONLY",
    originalSourceChecks:sourceChecks,
    ghot:{proposalSha256:proposalSha,threadId:proposal.warm_thread_id,
      sourceAuthority:"proposal-only",recomposedSha256:sha(alternative),
      replacementIsOnlyCandidate:true,releasedFutureAuthority:false},
    fullMeasure:{residueSha256:residueSha,phase:residue.phase,
      completedStepIds:residue.completedSteps,
      preservedFirewoodState:residue.resources.firewood.state,
      remainingNeedStatus:residue.remainingNeed.status,
      unresolvedRelation:residue.unresolvedRelation,
      lateStepRefused:true,humanWorthJudgment:null,
      allSucceededStillLocalPreview:true,sharedWorldChanged:false},
    garden:{sourceEnvelopeSha256:originalSlipSha,
      heldPayloadSha256:gardenCase.payloadHash,
      carrierArrivals:2,distinctDemands:1,sharedNeedsCreated:0,
      outstandingLoad:gardenResidual[0].confirmedResidual},
    band:{sourcePayloadSha256:status.sourcePayloadHash,
      reportType:"case.note_recorded",
      statusPacketSha256:sha(status),
      confirmedUnits:outcome.confirmedReceivedQuantity,
      residualUnits:outcome.confirmedResidualQuantity,
      conservation:outcome.conservation.holds,
      identityAuthority:"DECLARED_FIXTURE_ONLY"},
    reconciliation:{sameHeldNeedAsPacket:true,
      nativeFMResidueIsNotBandRecipientProof:true,
      originalHumanNeedNeverClaimed:true,
      candidateIsNotNewActorAuthorization:true,
      return:"CANNON_REVIEW_ONLY_NOT_GARDEN_WRITEBACK"},
    publicCard:{url:null,issued:false},
    physicalEffects:"NONE",actualPeople:false,actualDelivery:false,
    outsideOrganizationAuthority:"NONE"
  }};
}

async function main(args){
  must(args.length===3,"usage: node --import tsx native.mjs run|verify roots.json receipt.json");
  const [action,rootsFile,output]=args;
  must(["run","verify"].includes(action),"unsupported command");
  const result=await runWarmThread(JSON.parse(readFileSync(rootsFile,"utf8")));
  const receipt={...result,sha256:sha(result.body)};
  if(action==="run")
    writeFileSync(output,JSON.stringify(receipt,null,2)+"\n",{flag:"wx",mode:0o600});
  else assert.deepEqual(JSON.parse(readFileSync(output,"utf8")),receipt,"cold source-native return replay mismatch");
  console.log(JSON.stringify({action,status:"FOUR_DONOR_LOCAL_PREVIEW_ONLY",
    warm:receipt.body.fullMeasure.unresolvedRelation,
    remaining:receipt.body.band.residualUnits,
    candidateAuthorized:false,sha256:receipt.sha256}));
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
  main(process.argv.slice(2)).catch(error=>{console.error(error.stack||String(error));process.exitCode=1});
