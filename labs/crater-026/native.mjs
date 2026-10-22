// STACK² 026 — original donor-native care crossing, independent PLENTY possibility.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { isAbsolute, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

export const SOURCES=[
 {key:"nourish",repo:"the-static-collective/Nourish-Kids",commit:"beba8b81f9ec2d71ee9dac3e7a48fef667179df5",files:["src/data/reviewedRecipes.ts","src/fulfillment/evaluate.ts","src/fulfillment/envelope.ts","src/fulfillment/status.ts"]},
 {key:"band",repo:"the-static-collective/band-runtime",commit:"f2c889df90905eda533fe6d978cd1a52c788a33e",files:["src/help-case/envelope.ts","src/help-case/receive.ts","src/help-case/events.ts","src/help-case/projection.ts","src/help-case/statusPacket.ts"]},
 {key:"garden",repo:"the-static-collective/BananaSpork",commit:"6738230a8557060dd59aabc19caf21826806d16f",files:["src/domain/hashes.ts","src/domain/help-slip/envelope.ts","src/domain/help-slip/holdStore.ts","src/domain/help-slip/pour.ts"]},
 {key:"plenty",repo:"the-static-collective/full-measure-world-layer",commit:"fa44f99ea82137808c248fe0747e599142d5429f",files:["src/lib/plentySpecimen/index.ts","src/lib/plentySpecimen/types.ts"]}
];
const digest=x=>createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
const ensure=(v,m)=>{if(!v)throw Error("CRATER026_REFUSED: "+m)};
const clone=x=>structuredClone(x);
const now="2026-10-22T12:00:00.000Z";
export function verifySources(roots){
 ensure(roots&&typeof roots==="object"&&!Array.isArray(roots),"bad root map");
 ensure(Object.keys(roots).length===4&&SOURCES.every(s=>Object.hasOwn(roots,s.key)),"four original checkouts required");
 const used=new Set();
 return SOURCES.map(s=>{
  ensure(typeof roots[s.key]==="string"&&isAbsolute(roots[s.key]),"absolute checkout required");
  const root=realpathSync(roots[s.key]);
  ensure(!used.has(root),"source roots not independent");used.add(root);
  const head=execFileSync("git",["-C",root,"rev-parse","HEAD"],{encoding:"utf8"}).trim();
  ensure(head===s.commit,"Git commit mismatch: "+s.key);
  const files=s.files.map(path=>{
   const filename=realpathSync(join(root,path));
   ensure(filename.startsWith(root+sep),"source escaped root");
   const disk=readFileSync(filename);
   const original=execFileSync("git",["-C",root,"show",s.commit+":"+path],{maxBuffer:12*1024*1024});
   ensure(disk.equals(original),"changed native Git object: "+s.key+"/"+path);
   return {path,sha256:digest(disk.toString("utf8"))};
  });
  return {owner:s.repo,commit:head,sourceObjectsVerified:true,files};
 });
}
const load=(roots,key,path)=>import(pathToFileURL(join(roots[key],path)).href);
export async function runCare(roots){
 const verified=verifySources(roots);
 const [catalog,evaluator,envelopes,returner,receiver,eventer,projector,packetMaker,holds,pours,plenty]=await Promise.all([
  load(roots,"nourish","src/data/reviewedRecipes.ts"),load(roots,"nourish","src/fulfillment/evaluate.ts"),
  load(roots,"nourish","src/fulfillment/envelope.ts"),load(roots,"nourish","src/fulfillment/status.ts"),
  load(roots,"band","src/help-case/receive.ts"),load(roots,"band","src/help-case/events.ts"),
  load(roots,"band","src/help-case/projection.ts"),load(roots,"band","src/help-case/statusPacket.ts"),
  load(roots,"garden","src/domain/help-slip/holdStore.ts"),load(roots,"garden","src/domain/help-slip/pour.ts"),
  load(roots,"plenty","src/lib/plentySpecimen/index.ts")
 ]);
 const recipe=catalog.REVIEWED_RECIPES.find(x=>x.id==="staple-1-tomato-bean-rice-bowl");
 ensure(!!recipe,"source recipe missing");
 const evaluation=evaluator.evaluateRecipe(recipe,[
  {id:"ingredient:rice",kind:"ingredient",label:"Rice",quantity:0.5,unit:"cup",availability:"available",source:"user_declared"},
  {id:"ingredient:canned_beans",kind:"ingredient",label:"Canned beans",availability:"unavailable",source:"user_declared"}
 ]);
 ensure(evaluation.primaryStatus==="missing_requirements","evaluation unexpectedly met");
 const source=envelopes.createFulfillmentEnvelopeV0({
  recipe,evaluations:evaluation.evaluations,
  selectedRequirementIds:["ingredient:rice","ingredient:canned_beans"],
  envelopeId:"fixture:help-meal",createdAt:now
 });
 ensure(source.requirements.length===2&&source.requirements[0].quantity===0.5,"source envelope residual mismatch");
 const originalHash=digest(source),raw=JSON.stringify(source);
 const slots=new Map();
 const storage={getItem:k=>slots.get(k)??null,setItem:(k,v)=>slots.set(k,v),removeItem:k=>slots.delete(k)};
 const store=new holds.HelpSlipHoldStore(storage);
 const first=store.holdImportedHelpSlip(raw,{occurrenceId:"fixture:arrival-1",receivedAt:now});
 const again=store.holdImportedHelpSlip(raw,{occurrenceId:"fixture:arrival-2",receivedAt:now});
 ensure(first.disposition==="held"&&first.caseCreated&&again.disposition==="held"&&!again.caseCreated,"Garden duplicate handoff");
 const cases=new holds.HelpSlipHoldStore(storage).listHeldHelpCases();
 ensure(cases.length===1&&cases[0].arrivals.length===2,"Garden restart continuity");
 const garden=cases[0];
 const preview=pours.buildCampfirePourPreview(garden,"ingredient:rice",{circleId:"fixture:circle",circleLabel:"Fictional Circle"});
 ensure(preview.command.targetUnits===0.5&&preview.command.unitLabel==="cup"&&
  preview.omittedSourceFields.includes("fullPurpose")&&garden.requirementLinks.length===0,"Garden preview leaked, lost quantity, or shared");
 const r1=receiver.receiveHelpSlip(raw,{occurrenceId:"fixture:band-1",receivedAt:now,carrier:"pasted_json"},[]);
 const r2=receiver.receiveHelpSlip(raw,{occurrenceId:"fixture:band-2",receivedAt:now,carrier:"pasted_json"},[r1.receipt]);
 ensure(r1.caseCreated&&r1.heldCase&&!r2.caseCreated&&r2.receipt.duplicateOfOccurrenceId==="fixture:band-1","Band duplicate need");
 ensure(r1.receipt.payloadHash===garden.payloadHash,"Band/Garden canonical source mismatch");
 const id=r1.heldCase.caseId, requirementId="ingredient:rice";
 const event=(type,identifier,actor,qty)=>({
  eventId:identifier,type,caseId:id,requirementId,occurredAt:now,actorRef:actor,quantity:qty,unit:"cup",
  ...(type==="receipt.confirmed"?{authorityBasis:"local_operator_declared_recipient_scope"}:{})
 });
 const offered=event("offer.recorded","fixture:offer","fixture:helper",0.5);
 const reported=event("delivery.reported","fixture:report","fixture:helper",0.5);
 const confirmed=event("receipt.confirmed","fixture:confirm","fixture:recipient",0.25);
 const receives=[r1.receipt,r2.receipt];
 let prior=[];for(const next of [offered,reported,confirmed]){
  eventer.validateHelpCaseEvent(next,{caseId:id,receives,priorEvents:prior});prior=[...prior,next];
 }
 const reportOnly=packetMaker.buildHelpCaseStatusPacket(projector.projectHelpCase(id,receives,[offered,reported]),now);
 const reportReturn=returner.projectReturnedHelpStatus(source,reportOnly);
 ensure(reportReturn.status==="unresolved"&&reportReturn.requirements[0].residualQuantity===0.5,"report alone erased demand");
 const packet=packetMaker.buildHelpCaseStatusPacket(projector.projectHelpCase(id,receives,prior),now);
 const complete=returner.projectReturnedHelpStatus(source,packet);
 ensure(complete.status==="partially_resolved"&&complete.requirements[0].residualQuantity===0.25&&
  complete.requirements[1].residualQuantity===0.5,"partial consequences misprojected");
 ensure(digest(source)===originalHash&&complete.sourceEnvelopeUnchanged&&complete.authority==="projection-only","original modified or authority inflated");
 const bad=clone(packet);bad.requirements[0].confirmedResidualQuantity=0;
 assert.throws(()=>returner.projectReturnedHelpStatus(source,bad),/CONSERVATION_BREACH/);
 const drift=clone(packet);drift.requirements[0].unit="bag";
 assert.throws(()=>returner.projectReturnedHelpStatus(source,drift),/UNIT_MISMATCH/);
 const fake=clone(source);fake.status="fulfilled";
 ensure(store.holdImportedHelpSlip(JSON.stringify(fake),{occurrenceId:"fixture:bad",receivedAt:now}).disposition==="refused","unmet source boundary bypassed");
 assert.throws(()=>eventer.validateHelpCaseEvent({...confirmed,eventId:"fixture:bad-confirm",authorityBasis:"bogus"},{
  caseId:id,receives,priorEvents:[offered,reported]}),/RECIPIENT_AUTHORITY_BASIS_REQUIRED/);

 // Independent Full Measure native PLENTY: synthetic help reports and offers
 // cannot silently become real capacity or permission.
 const input={
  need:{needRef:"fixture:need-rice",capabilityRequirement:"provide-rice"},
  particulars:[1,2].map(i=>({particularRef:"fixture:helper-"+i,kind:"fictional",sourceRefs:["fixture:claim-"+i]})),
  capabilities:[1,2].map(i=>({
   capabilityRef:"fixture:cap-"+i,particularRef:"fixture:helper-"+i,capability:"provide-rice",
   evidenceClass:"declared",provenanceKind:"self-report",currentness:"unknown",availability:"unknown",
   access:"unknown",authority:"unknown",dependencyRefs:["fixture:shared-supply"],
   requiresCapabilityRefs:[],sourceRefs:["fixture:claim-"+i]
  })),
  candidatePaths:[1,2].map(i=>({pathRef:"fixture:path-"+i,needRef:"fixture:need-rice",
   capabilityRefs:["fixture:cap-"+i],dependencyRefs:["fixture:shared-supply"],
   satisfiesCapabilityRequirement:true,constraintResults:[]}))
 };
 const inputDigest=digest(input);
 const unknown=plenty.evaluatePlenty(input);
 ensure(unknown.disposition==="POSSIBILITIES_ONLY"&&unknown.viablePathCount===0&&unknown.independentPathCount===0,
  "unknown capabilities inflated");
 const denied=clone(input);Object.assign(denied.capabilities[0],{
  currentness:"current",availability:"available",access:"accessible",authority:"unauthorized"});
 const refused=plenty.evaluatePlenty(denied);
 ensure(refused.viablePathCount===0,"unauthorized capability counted");
 const shared=clone(input);
 for(const c of shared.capabilities)Object.assign(c,{
  currentness:"current",availability:"available",access:"accessible",authority:"authorized"});
 const correlated=plenty.evaluatePlenty(shared);
 ensure(correlated.viablePathCount===2&&correlated.independentPathCount===1&&
  correlated.disposition==="VIABLE_BUT_FRAGILE","shared supply inflated path independence");
 ensure(digest(input)===inputDigest,"PLENTY mutated claims");
 return {
  body:{
   schema:"cannon.stack2-026-care-plenty/v0",classification:"FOUR_ORIGINAL_DONOR_FIXTURE_ONLY",
   verifiedSourceObjects:verified,
   care:{
    recipeId:recipe.id,sourceEnvelopeSha256:originalHash,
    gardenPayloadHash:garden.payloadHash,gardenArrivals:2,gardenHeldCases:1,gardenPublishedNeeds:0,
    bandCaseId:id,reportedResidual:reportReturn.requirements[0].residualQuantity,
    simulatedConfirmedRice:packet.requirements[0].confirmedReceivedQuantity,
    returnedStatus:complete.status,returnedRiceResidual:complete.requirements[0].residualQuantity,
    returnedBeansResidual:complete.requirements[1].residualQuantity,
    nativeStatusPacketSha256:digest(packet),sourceUnchanged:true,
    realRecipientAuthentication:false,realDeliveryConfirmed:false
   },
   fullMeasure:{
    originalBranch:"PLENTY-001",fixtureInputSha256:inputDigest,
    unknownStatus:unknown.disposition,unknownViableCount:0,
    unauthorizedViableCount:refused.viablePathCount,
    correlatedViableCount:correlated.viablePathCount,
    correlatedIndependentCount:correlated.independentPathCount,
    realCapacityProved:false
   },
   publicReturn:{url:null,cardIssued:false,permission:"NONE"},
   realWorldEffects:"NONE",externalAuthority:"NONE"
  }
 };
}
async function main(args){
 ensure(args.length===3,"usage: native.mjs run|verify roots.json output.json");
 const [command,rootsFile,target]=args;ensure(["run","verify"].includes(command),"bad action");
 const result=await runCare(JSON.parse(readFileSync(rootsFile,"utf8")));
 const artifact={...result,sha256:digest(result.body)};
 if(command==="run")writeFileSync(target,JSON.stringify(artifact,null,2)+"\n",{flag:"wx",mode:0o600});
 else assert.deepEqual(JSON.parse(readFileSync(target,"utf8")),artifact,"cold replay mismatch");
 console.log(JSON.stringify({action:command,status:"FOUR_DONOR_NATIVE_FIXTURE_ONLY",
  return:artifact.body.care.returnedStatus,plenty:artifact.body.fullMeasure.unknownStatus,
  sha256:artifact.sha256}));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
 main(process.argv.slice(2)).catch(e=>{console.error(e.stack||String(e));process.exitCode=1});
