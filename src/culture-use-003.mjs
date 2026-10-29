import {readSource} from './present-use.mjs';
import {verifyPressDelivery} from './culture-delivery.mjs';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
const sha=x=>'sha256:'+createHash('sha256').update(x).digest('hex');
const fail=(x,m)=>{if(!x)throw Error(m)};
const read=x=>JSON.parse(readFileSync(x,'utf8'));
const emit=x=>JSON.stringify(x,null,2)+'\n';
export const DONORS={
 fm:{repo:'the-static-collective/full-measure-world-layer',sha:'c9206d5055ad574a23acb2eceb5f8785a4ad64fe',
 files:['src/lib/pledgeAuthority.ts','src/lib/fullMeasure.ts','src/types.ts']},
 penny:{repo:'the-static-collective/Jubilee-treasury',sha:'a36777cb87bcfb6b7706b910ba18c4c4b24c73a3',
 files:['src/penny-work-matter-014.mjs']}
};
function sourceWitness(entry,root){
 const dir=realpathSync(resolve(root));
 return entry.files.map(path=>{
  const w=readSource({id:'donor',repository:entry.repo,commit:entry.sha,path,
   media_type:'text/plain',tags:[]},{[entry.repo]:dir}).witness;
  const file=join(dir,path);
  fail(realpathSync(file)===file&&sha(readFileSync(file))===w.blob_sha256,'SOURCE_BYTES_CHANGED');
  return w;
 });
}
export function fixture(source,variant='confirmed'){
 fail(['confirmed','reported','self-confirmed','foreign-confirmed'].includes(variant),'UNKNOWN_SCENARIO');
 const {candidate,holdReceipt}=source;
 fail(candidate?.decision==='HELD_FOR_EDITOR'&&candidate.license==='NOT_GRANTED'&&
  candidate.workAdmission==='NONE'&&candidate.published===false,'SOURCE_NOT_HELD');
 fail(holdReceipt?.disposition==='HELD_FOR_EDITOR','PRESS_RECEIPT_MISSING');
 const comic=candidate.works.find(w=>w.path==='comic.html');
 fail(comic&&/^sha256:[0-9a-f]{64}$/.test(comic.sha256),'SOURCE_COMIC_MISSING');
 const maker='person-synthetic-maker003',steward='person-synthetic-steward003';
 const kind=['pledge.proposed','pledge.accepted','pledge.reported_complete','pledge.confirmed'];
 const roles=[maker,steward,maker,variant==='self-confirmed'?maker:variant==='foreign-confirmed'?'person-unrecognized':steward];
 const times=['2026-10-29T11:00:00.000Z','2026-10-29T11:01:00.000Z','2026-10-29T11:02:00.000Z','2026-10-29T11:03:00.000Z'];
 const events=kind.slice(0,variant==='reported'?3:4).map((eventType,i)=>({
  id:'event-culture-use-'+i,aggregateType:'pledge',aggregateId:'pledge-culture-use',
  circleId:'circle-culture-use',eventType,actorId:roles[i],createdAt:times[i],
  payload:{projectId:'project-culture-use',pledgeId:'pledge-culture-use',
   sourceComicSha256:comic.sha256,pledgedBy:maker}
 }));
 const confirmed=events.length===4;
 const project={id:'project-culture-use',openedBy:steward,circleId:'circle-culture-use',status:'active'};
 const pledge={id:'pledge-culture-use',projectId:project.id,pledgedBy:maker,status:confirmed?'confirmed':'reported_complete',
  acceptedAt:times[1],reportedCompleteAt:times[2],confirmedAt:confirmed?times[3]:null};
 return {comic,pressReceipt:holdReceipt.receiptId,events,project,pledge,roles:{maker,steward},scenario:variant};
}
export function verifyFixture(f,authorize){
 const expected=['pledge.proposed','pledge.accepted','pledge.reported_complete','pledge.confirmed'];
 const actions=['','accept','report_complete','confirm'];
 const statuses=['','proposed','accepted','reported_complete'];
 fail(f.events.length>=3&&f.events.length<=4,'UNBOUNDED_EVENTS');
 for(let i=0;i<f.events.length;i++){
  const e=f.events[i],role=i===0||i===2?f.roles.maker:f.roles.steward;
  fail(e.eventType===expected[i]&&e.actorId===role&&e.id==='event-culture-use-'+i,
   'LOCAL_ROLE_OR_ORDER_INVALID');
  fail(e.payload.sourceComicSha256===f.comic.sha256&&e.aggregateId===f.pledge.id&&
   e.payload.projectId===f.project.id&&e.payload.pledgedBy===f.pledge.pledgedBy,'SOURCE_BINDING_CHANGED');
  if(i>0){
   fail(e.createdAt>f.events[i-1].createdAt,'NONMONOTONIC_EVENTS');
   const accepted=authorize({action:actions[i],currentStatus:statuses[i],
    isOpenerOrSteward:e.actorId===f.roles.steward,isPledgeAuthor:e.actorId===f.roles.maker});
   fail(accepted.ok===true,'NATIVE_FULL_MEASURE_REFUSED');
  }
 }
 fail(f.pledge.status===(f.events.length===4?'confirmed':'reported_complete'),'PLEDGE_STATUS_CONTRADICTION');
 fail(f.pledge.acceptedAt===f.events[1].createdAt&&f.pledge.reportedCompleteAt===f.events[2].createdAt&&
  f.pledge.confirmedAt===(f.events.length===4?f.events[3].createdAt:null),'TIMESTAMP_CONTRADICTION');
 return true;
}
export async function compute(roots,forge,held,variant='confirmed'){
 const pressProof=await verifyPressDelivery({webz:roots.webz,gro:roots.gro,press:roots.press},forge,held,'HOLD');
 fail(pressProof.status==='NATIVE_PRESS_DELIVERY_COLD_VERIFIED','PRESS_NOT_COLD_VERIFIED');
 const source={candidate:read(join(held,'candidate.json')),holdReceipt:read(join(held,'hold-receipt.json'))};
 const f=fixture(source,variant);
 const witnesses={fm:sourceWitness(DONORS.fm,roots.fm),penny:sourceWitness(DONORS.penny,roots.penny)};
 const authority=await import(pathToFileURL(join(resolve(roots.fm),'src/lib/pledgeAuthority.ts')).href);
 const sheetModule=await import(pathToFileURL(join(resolve(roots.fm),'src/lib/fullMeasure.ts')).href);
 const penny=await import(pathToFileURL(join(resolve(roots.penny),'src/penny-work-matter-014.mjs')).href);
 verifyFixture(f,authority.authorizePledgeTransition);
 const sheet=sheetModule.buildFullMeasureSheet({userId:f.roles.maker,offers:[],
  projects:[{...f.project,pledges:[f.pledge]}],events:f.events,receipts:[],capacities:[]});
 const count=sheet.measures.find(m=>m.key==='deed')?.value;
 fail(count===(f.events.length===4?1:0),'SOURCE_DEED_PROJECTION_MISMATCH');
 const keys=Array.from({length:5},()=>penny.newKeys());
 const policy=penny.createWorld({stewardPublicKey:keys[0].publicKey,workWitnessPublicKey:keys[1].publicKey,
  boxes:[{boxId:'box-culture-003',custodianPublicKey:keys[2].publicKey,
   counterPublicKey:keys[3].publicKey,backingTermsRef:'terms-no-physical-backing'}],
  holders:[{holderId:'node:culture-003',publicKey:keys[4].publicKey}]});
 const money=penny.inspectWorld(policy);
 fail(policy.events.length===0&&money.sourceEventCount===0&&money.workProducedPending===0&&
  money.outstandingPennyUnits===0&&money.boxBookCoinCount===0,'PENNY_NONZERO');
 const body={schema:'cannon.culture-use-review/v1',sourceGitWitnesses:witnesses,
  actualOriginalDonorsExecuted:['FullMeasure.authorizePledgeTransition','FullMeasure.buildFullMeasureSheet',
    'PENNY.newKeys','PENNY.createWorld','PENNY.inspectWorld'],
  originalComicSha256:f.comic.sha256,independentPressReceipt:f.pressReceipt,
  eventDigest:sha(Buffer.from(JSON.stringify(f.events))),scenario:variant,
  localFixtureDeeds:count,authenticatedHumanDeeds:0,actualUseConfirmed:false,rightsToPublishVerified:false,
  pennyReview:count===1?'HOLD_FOR_INDEPENDENT_WORK_WITNESS':'HOLD_UNCONFIRMED_REPORT',
  pennyWorld:{events:0,workPending:0,backingCoins:0,issuedUnits:0},
  physicalCopiesDelivered:0,actualNewCapacity:0,licensedAssets:0,tokenMints:0,
  next:['Human-authenticated local witness','Specific rights and license','Separate recipient confirmation',
    'Source-owned PENNY work witness and physical backing','Separate receiver-local reLATTE judgment']};
 return {...body,receiptId:sha(Buffer.from(JSON.stringify(body)))};
}
export async function build(roots,forge,held,out,variant){
 const record=await compute(roots,forge,held,variant);
 fail(!existsSync(out),'OUTPUT_EXISTS');mkdirSync(out,{mode:0o700});
 writeFileSync(join(out,'review.json'),emit(record),{flag:'wx'});
 writeFileSync(join(out,'variant.json'),emit({variant}),{flag:'wx'});
 return {status:'NATIVE_SOURCE_CHAIN_VALID',reviewId:record.receiptId,
  localFixtureDeeds:record.localFixtureDeeds,authenticatedHumanDeeds:0,pennyIssued:0};
}
export async function verify(roots,forge,held,out){
 const v=read(join(out,'variant.json'));
 fail(Object.keys(v).length===1,'EXTRA_VARIANT_FIELDS');
 const record=await compute(roots,forge,held,v.variant);
 fail(readFileSync(join(out,'review.json')).equals(Buffer.from(emit(record))),'REVIEW_COLD_REPLAY_MISMATCH');
 return {status:'NATIVE_CULTURE_REVIEW_COLD_REPLAYED',reviewId:record.receiptId,
  humanWitnessAuthenticated:false,pennyIssued:0};
}
