import {createHash} from 'node:crypto';
import {readFileSync,realpathSync,statSync,existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
const ID='cannon.guest-concourse/v1';
const sha=v=>'sha256:'+createHash('sha256').update(v).digest('hex');
const hash=v=>sha(JSON.stringify(v));
const validSha=/^[a-f0-9]{40}$/;
function hold(message){throw Error('HOLD_'+message)}
function git(root,...argv){
 try{return execFileSync('git',['--no-replace-objects','-C',root,...argv],
  {encoding:'utf8',timeout:15000,maxBuffer:1_000_000,
   env:{...process.env,GIT_NO_REPLACE_OBJECTS:'1'}}).trim()}
 catch{hold('GIT_SOURCE_UNAVAILABLE')}
}
export function validateRegistry(registry){
 if(registry?.schema!=='cannon.guest-concourse-sources/v1'||registry.newGuestCount!==22||
   !Array.isArray(registry.guests)||registry.guests.length!==22)hold('REGISTRY_SHAPE');
 if(registry.parent?.inheritedDistinctNativeOwnerCount!==22)hold('INHERITED_NATIVE_COUNTER');
 const names=new Set(),ids=new Set();
 for(const guest of registry.guests){
  if(!/^guest-\d{2}$/.test(guest.guestId)||ids.has(guest.guestId))hold('GUEST_ID');
  if(!/^the-static-collective\/[a-zA-Z0-9_.-]+$/.test(guest.repository)||names.has(guest.repository))
   hold('DUPLICATE_OR_UNOWNED_SOURCE');
  if(!validSha.test(guest.commit)||guest.readme!=='README.md'||
    !['NATIVE_TEST','SOURCE_INSPECTION','CONCEPT_HOLD'].includes(guest.admission)||
    guest.nativeExecuted!==false||guest.externalAction!==false||
    guest.fieldWitness!==false||guest.rights!=='NOT_VERIFIED')
   hold('GUEST_AUTHORITY_MISMATCH');
  if(typeof guest.offer!=='string'||guest.offer.length>170||
    !/^[a-z]+$/.test(guest.department))hold('GUEST_OFFER_SHAPE');
  names.add(guest.repository);ids.add(guest.guestId);
 }
 if(names.size!==22||ids.size!==22)hold('GUEST_COUNT');
 return registry;
}
function checkedSource(guest,root){
 const real=realpathSync(resolve(root)),source=realpathSync(join(real,'.git'));
 if(!source||!statSync(real).isDirectory())hold('SOURCE_DIRECTORY');
 if(git(real,'rev-parse','HEAD')!==guest.commit)hold('SOURCE_COMMIT_MISMATCH_'+guest.guestId);
 const origin=git(real,'remote','get-url','origin')
  .replace(/\.git$/,'').replace(/\/$/,'')
  .replace(/^git@github.com:/,'https://github.com/');
 if(origin!=='https://github.com/'+guest.repository)hold('SOURCE_OWNER_MISMATCH_'+guest.guestId);
 const expectedBlob=git(real,'rev-parse','HEAD:'+guest.readme);
 const readmePath=join(real,guest.readme);
 if(!statSync(readmePath).isFile()||realpathSync(readmePath)!==readmePath)hold('README_NOT_PLAIN_SOURCE');
 const live=git(real,'hash-object',readmePath);
 if(live!==expectedBlob)hold('README_BYTES_MISMATCH_'+guest.guestId);
 const text=readFileSync(readmePath,'utf8');
 if(!text.trim()||text.length>500000)hold('README_SIZE');
 return {schema:'cannon.guest-source-observation/v1',
   guestId:guest.guestId,repository:guest.repository,commit:guest.commit,
   readmeBlob:expectedBlob,readmeSha256:sha(text),readmeBytes:Buffer.byteLength(text),
   inspectedAtRuntime:'EXACT_PINNED_SOURCE_BYTES_ONLY',
   ownerNativeExecuted:false,authenticatedHumanWitness:false,
   externalEffects:false};
}
export function makeGuestConcourse({registry,roots,question='How can these rooms help create a small fictional festival?'}={}){
 validateRegistry(registry);
 if(!roots||typeof roots!=='object'||Array.isArray(roots)||
    Object.keys(roots).sort().join('|')!==registry.guests.map(x=>x.guestId).sort().join('|'))
   hold('EXACT_22_SOURCE_ROOTS_REQUIRED');
 if(typeof question!=='string'||question.trim().length<10||question.length>250||
  /[\x00-\x1f]/.test(question))hold('PUBLIC_FICTIONAL_QUESTION_REQUIRED');
 const observations=registry.guests.map(guest=>checkedSource(guest,roots[guest.guestId]));
 const receipt=hash(observations);
 const tickets=registry.guests.map((guest,index)=>{
  const observation=observations[index];
  const row={
   schema:'cannon.guest-door-proposal/v1',
   guestId:guest.guestId,department:guest.department,
   sourceRepository:guest.repository,
   sourceCommit:guest.commit,
   sourceObservationDigest:hash(observation),
   offeredAction:guest.offer,
   requestedInput:question.trim(),
   offeringClass:guest.admission==='CONCEPT_HOLD'?'CONCEPT_ONLY':'SOURCE_OWNED_CANDIDATE',
   status:'HOLD_UNTIL_SOURCE_OWNER_ADMITS_EXECUTION',
   nativeExecuted:false,humanWitnessed:false,
   publicationAuthorized:false,paymentAuthorized:false,
   externalDispatch:false
  };
  return {...row,ticketDigest:hash(row)};
 });
 const departments=[...new Set(tickets.map(t=>t.department))].sort();
 const acts=departments.map(dept=>{
  const members=tickets.filter(t=>t.department===dept);
  const data={schema:'cannon.guest-act/v1',department:dept,
   memberTicketDigests:members.map(t=>t.ticketDigest),
   offeredLine:'A local fictional '+dept+' table: proposals are invitations, not outcomes.',
   humanSteward:'UNIDENTIFIED',venuePermission:'NOT_VERIFIED',status:'HOLD'};
  return {...data,actDigest:hash(data)};
 });
 const body={
  schema:ID,question:question.trim(),sourceObservationRoot:receipt,
  inheritedNativeOwnersReported:22,
  inheritedNativeOwnersReexecutedHere:0,
  newlyInspectedIndependentGuests:22,
  newlyExecutedNativeGuestsByThisBuild:0,
  newHumanWitnesses:0,
  participantsAuthenticated:0,
  status:'22_SOURCE_GUESTS_VERIFIED_22_EXECUTION_OFFERS_HELD',
  offers:tickets,acts,observations,
  authority:'SOURCE_INSPECTION_NOT_NATIVE_EXECUTION',
  sourceRightsVerified:false,
  realWorldPermission:false,
  externalDispatch:false,applicationsSubmitted:false
 };
 return {...body,packetDigest:hash(body)};
}
export function verifyConcourse({registry,roots,packet}){
 const replay=makeGuestConcourse({registry,roots,question:packet?.question});
 if(JSON.stringify(replay)!==JSON.stringify(packet))hold('COLD_REPLAY_MISMATCH');
 return {schema:'cannon.guest-concourse-verification/v1',
  verified:true,packetDigest:packet.packetDigest,sourceOwnerCount:22,
  nativeExecutionClaimCount:0,independentHumanWitnessCount:0,
  admission:'SOURCE_ONLY',externalDispatch:false};
}
