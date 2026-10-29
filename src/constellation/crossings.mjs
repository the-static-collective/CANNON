import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {SELECTION,hash,requireThat} from './sources.mjs';
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join()===keys.sort().join();
export function authorizeSimulation(request){
 requireThat(exact(request,['mission','localOnly','fictionalOnly','authorized','revoked','receiver']),'SIMULATION_REQUEST_SHAPE');
 requireThat(['mit','voqal','open'].includes(request.mission)&&request.localOnly===true&&request.fictionalOnly===true&&typeof request.authorized==='boolean'&&typeof request.revoked==='boolean'&&['HOLD','REFUSE'].includes(request.receiver),'SIMULATION_SCOPE_REFUSED');
 if(request.revoked||request.receiver==='REFUSE')return {status:'REFUSE',run:false,reason:'Local authorization revoked or receiver refused'};
 if(!request.authorized)return {status:'HOLD',run:false,reason:'Explicit local simulation authorization required'};
 return {status:'ADMIT_LOCAL_SIMULATION_ONLY',run:true,receiverStatus:'HOLD',fieldVerified:false};
}
export function checkCrossing(v){
 requireThat(exact(v,['schema','owner','pin','contract','status','evidence','fieldVerified','physicalActs','externalContacts','hardwarePower','computeClaim']),'CROSSING_SHAPE');
 requireThat(v.schema==='constellation.crossing/v1'&&/^the-static-collective\/[\w.-]+$/.test(v.owner)&&/^[a-f0-9]{40}$/.test(v.pin)&&typeof v.contract==='string'&&v.contract.length>0&&['HOLD','REFUSE','LOCAL_ARTIFACT'].includes(v.status)&&['SOFTWARE_EXECUTED','SIMULATED'].includes(v.evidence)&&v.fieldVerified===false&&v.physicalActs===0&&v.externalContacts===0&&v.hardwarePower==='UNKNOWN'&&v.computeClaim==='LOCAL_PROCESS_ONLY','CROSSING_FALSE_CLAIM_OR_SCOPE');
 return v;
}
export function crossing(id,contract,status='HOLD',evidence='SOFTWARE_EXECUTED'){
 const s=SELECTION.sources[id];
 return checkCrossing({schema:'constellation.crossing/v1',owner:s.repository,pin:s.commit,contract,status,evidence,fieldVerified:false,physicalActs:0,externalContacts:0,hardwarePower:'UNKNOWN',computeClaim:'LOCAL_PROCESS_ONLY'});
}
const native=(root,path)=>import(pathToFileURL(join(root,path)).href);
export async function composeCrossings(roots){
 const planz=await native(roots.planz,'scripts/validate-attention.mjs');
 const jar=await native(roots.jarvis,'src/planz-attention.mjs');
 const returns=await native(roots.jarvis,'src/planz-return.mjs');
 const rel=await native(roots.relatte,'src/planz-return.ts');
 const protocol=await native(roots.relatte,'src/protocol.ts');
 const {LocalReceiver}=await native(roots.relatte,'src/receiver.ts');
 const {sealEvidenceObservation}=await native(roots.relatte,'src/evidence-transit.ts');
 const fm=await native(roots.fullmeasure,'src/lib/commonsReturnLens.ts');
 const practice=await native(roots.stillhere,'experiments/still-here-seven-days/core.mjs');
 const graft=await native(roots.graft,'src/work-kit.mjs');
 const bytes=readFileSync(join(roots.planz,'public/attention-v1.json'));
 const feed=planz.validatePublicAttention(JSON.parse(bytes));
 const observed={schema:'jarvis.planz-attention-observation/v0',authority:'INDEX_ONLY',...jar.validatePlanZFeed(feed)};
 const matches=jar.findPlanAttention(observed,'safety review voluntary community shelter',3);
 requireThat(matches.length>0,'NO_SOURCE_OWNED_PLAN_GATE');
 const target=matches[0],at='2026-10-29T00:00:00.000Z';
 // This is a fictional software exercise, never a report of real community work.
 const packet=returns.makePlanReturn({id:'weave:00000000-0000-4000-8000-000000000001',planOrigin:{planId:target.id,issueUrl:target.source,edition:feed.edition,sourceSha256:hash(bytes).slice(7)},report:{outcome:'completed'},review:{decision:'accept-report'},capability:{status:'CANDIDATE_ONLY',verified:false}},'Fictional zero-contact software exercise: inspect an opt-in safety-review gate without names or outreach.',{redacted:true,at});
 rel.validatePlanReturnCandidate(packet);
 const observation=rel.adaptPlanReturnToEvidence(packet);
 requireThat(observation.evidence_level==='claim'&&rel.matchesPlanReturnPayload(observation,packet),'SOURCE_CLAIM_WAS_PROMOTED');
 const sandbox=mkdtempSync(join(tmpdir(),'constellation-relatte-'));
 const results=[];
 try{
  for(const choice of ['HOLD','REFUSE','ADMIT']){
   const receiver=await LocalReceiver.create(join(sandbox,choice),{world_id:'world:constellation-fictional-'+choice.toLowerCase(),receiver_particular:'particular:local-test-receiver',contract_ref:'contract:zero-contact-test/v1'});
   const source_keys=await protocol.generateP256KeyPair();
   const seen=new Set();let storageCalls=0;
   const route={destination:'planz:return-candidate-inbox',capability_ref:null,source_keys,receiver,received_at:()=>at,
    ...(choice==='HOLD'?{}:{evaluate:async()=>({disposition:choice,reason:'Fictional receiver-local policy; no field authority'})}),
    store:async(_o,c)=>{storageCalls++;const old=seen.has(c.event_id);seen.add(c.event_id);return {status:old?'already-stored':'stored',record_ref:'local:fictional-observation'}}};
   const signed=await sealEvidenceObservation(observation,route.destination,source_keys,null);
   requireThat(await protocol.verifyCrossingEnvelope(signed),'INVALID_LOCAL_CROSSING_SIGNATURE');
   requireThat(!await protocol.verifyCrossingEnvelope({...signed,capability_ref:'forged'}),'COUNTERFEIT_SIGNATURE_ACCEPTED');
   const first=await rel.transportPlanReturn(packet,route);
   const receive=receiver.getReceiveReceipt(first.crossing_id),disposition=receiver.getDispositionReceipt(first.crossing_id);
   requireThat(await protocol.verifyReceipt(receive)&&await protocol.verifyReceipt(disposition),'INVALID_LOCAL_RECEIPT_SIGNATURE');
   requireThat(choice==='ADMIT'||(disposition.semantic_effect==='none'&&seen.size===0),'REFUSAL_OR_HOLD_LAUNDERED');
   const before=receiver.journalLength();
   route.receiver=await LocalReceiver.open(join(sandbox,choice));
   const duplicate=await rel.transportPlanReturn(packet,route);
   requireThat(route.receiver.journalLength()===before,'DUPLICATE_RECEIPT_APPENDED');
   let revoked=null;
   if(choice==='ADMIT'){
    const calls=storageCalls;route.evaluate=async()=>({disposition:'HOLD',reason:'Fictional local grant revoked'});
    revoked=(await rel.transportPlanReturn(packet,route)).status;
    requireThat(revoked==='BLOCKED'&&storageCalls===calls&&seen.size===1,'REVOKED_POLICY_STORED');
   }
   results.push({receiverPolicy:choice,first:first.status,replay:duplicate.status,revoked,storedObservations:seen.size,duplicateAppended:false,signaturesVerified:true,counterfeitRefused:true,
    fullMeasure:fm.assessCommonsReturn(packet,first)});
  }
 }finally{rmSync(sandbox,{recursive:true,force:true})}
 let state=practice.fresh();state=practice.record(state,{area:'care',minutes:2,kind:'rested'});state=practice.record(state,{area:'commons',minutes:5,kind:'tended'});
 // Reuse GRAFT's pure renderer with truthful snapshot provenance. Never label
 // an offline atlas as a fresh live scout, or call its network scout.
 const printPlan={schema:'graft.useful-work-plan/v1',title:'First Circle / zero-contact review cards',question:'Could an independent reviewer inspect a fictional opt-in pathway?',focus:'general',observed_at:at,next_24h:'Inspect this fictional software packet locally. Any real review or distribution requires separate permission.',
  original_source_refs:[{title:'Source-owned planZ review gate',url:target.source,sha:SELECTION.sources.planz.commit}],authority:'none'};
 return {packet,observation,plans:{edition:feed.edition,sourceSha256:hash(bytes),matches},receiver:{schema:'constellation.receiver-exercise/v1',sample:'FICTIONAL_ZERO_CONTACT',ephemeralSignatures:'VERIFIED_DURING_EXECUTION_NOT_RETAINED',independentReplay:'RERUN_ORIGINAL_RECEIVER_AND_VERIFY_NEW_SIGNATURES',cases:results},practice:{schema:'constellation.still-here-exercise/v1',sample:'FICTIONAL_CHECK_INS',summary:practice.summary(state),deeds:0,realPeople:0},graftHtml:graft.printableHtml(printPlan),crossings:[crossing('planz','planz/public-attention-v1'),crossing('jarvis','planz.return-candidate/v0'),crossing('relatte','relatte.evidence-transit-result/v0'),crossing('fullmeasure','full-measure.commons-return-assessment/v0'),crossing('stillhere','still-here/private-practice-v1','HOLD','SIMULATED'),crossing('graft','graft.useful-work-plan/v1','LOCAL_ARTIFACT')]};
}
