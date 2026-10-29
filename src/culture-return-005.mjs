/** Culture Forge 005: real signed-return evidence -> planZ -> GRAFT -> JAR;VIS.
 * Native source-owner receivers, immutable Git cuts. Every proposed next step stays HOLD.
 */
import {readSource} from './present-use.mjs';
import {verify as verifySignedReturn} from './culture-sovereign-004.mjs';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,realpathSync,mkdirSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const sha=x=>'sha256:'+createHash('sha256').update(x).digest('hex');
const json=x=>JSON.stringify(x,null,2)+'\n';
const read=x=>JSON.parse(readFileSync(x,'utf8'));
const fail=(p,reason)=>{if(!p)throw Error('CULTURE_RETURN_005_HOLD: '+reason)};
export const NEXT_DONORS={
 planz:{repo:'the-static-collective/planZ',commit:'ca050aeb94dfe73a719513cb5cb8dad58ab2783a',
  paths:['scripts/triage-culture.mjs','scripts/validate-attention.mjs','public/attention-v1.json']},
 graft:{repo:'the-static-collective/GRAFT',commit:'78976228eba243acb489c0aa9c501128904fbda6',
  paths:['src/culture-nursery.mjs','candidate-registry.json']},
 jarvis:{repo:'the-static-collective/JAR-VIS',commit:'98388d1bef8e876a5a72e7c20fe6d81d481caae2',
  paths:['src/culture-return.mjs','src/planz-attention.mjs']}
};
export const DEFAULT_PLAN='ATLAS-BRIDGE-002';
function original(root,cut){
 const dir=realpathSync(resolve(root));
 return {dir,gitWitnesses:cut.paths.map(path=>{
  const witness=readSource({id:'cultural-return',repository:cut.repo,commit:cut.commit,
   path,media_type:'text/plain',tags:[]},{[cut.repo]:dir}).witness;
  const live=join(dir,path);
  fail(realpathSync(live)===live&&sha(readFileSync(live))===witness.blob_sha256,'DONOR_SOURCE_BYTES_MISMATCH');
  return witness;
 })};
}
export function makePublicOffer(signed,review){
 fail(signed?.schema==='cannon.culture-sovereign-return/v1'&&
  signed.status==='SIGNED_RECEIVED_AND_RECEIVER_LOCAL_HOLD'&&signed.signedObjectsVerified===3&&
  signed.recipientAdmission===false&&signed.senderEffects===0&&
  signed.actualHumanDeeds===0&&signed.pennyIssued===0&&signed.publicEditions===0&&signed.nftMinted===0,
  'SIGNED_CROSSING_UNVERIFIED_OR_AUTHORITY_ESCALATED');
 fail(review?.schema==='cannon.culture-use-review/v1'&&
  review.receiptId===signed.originalCultureReceipt&&
  review.independentPressReceipt===signed.originalPressReceipt&&
  /^sha256:[a-f0-9]{64}$/.test(review.originalComicSha256)&&
  review.authenticatedHumanDeeds===0&&review.actualUseConfirmed===false&&
  review.rightsToPublishVerified===false&&review.pennyWorld?.issuedUnits===0,
  'SOURCE_CULTURAL_USE_NOT_HELD');
 const body={schema:'cannon.culture-reuse-offer/v1',
  source:{cultureReceipt:signed.originalCultureReceipt,comicSha256:review.originalComicSha256,
   pressReceipt:signed.originalPressReceipt,ghotReceipt:signed.ghotReceipt,
   crossing:signed.crossing,received:signed.received,held:signed.held},
  proposal:{kind:'REUSABLE_CULTURAL_METHOD_CANDIDATE',title:'A Room That Remembers',
   candidateMethod:'Use six public-safe illustrated panels to explain how a local method can be independently adapted.',
   suggestedUse:'Ask one willing source owner and one receiving steward whether to review a printable learning card.'},
  truth:{fictional:true,humanAuthenticated:false,fieldUseVerified:false,
   licensedEdition:false,ownerCanonSelected:false,sourceSignatureIndependentlyVerified:false},
  effects:{pennyIssued:0,humanDeeds:0,externalPayments:0,nftsMinted:0,automaticActions:0}};
 return {...body,identity:sha(Buffer.from('CULTURE_RETURN_005|'+JSON.stringify(body)))};
}
async function replay(roots,forge,held,useDir,sovereign,planId){
 fail(planId===DEFAULT_PLAN,'PLAN_SELECTION_NOT_ALLOWLISTED_FOR_SPECIMEN');
 const signed=await verifySignedReturn(roots,forge,held,useDir,sovereign);
 const review=read(join(useDir,'review.json'));
 const offer=makePublicOffer(signed,review);
 const z=original(roots.planz,NEXT_DONORS.planz);
 const g=original(roots.graft,NEXT_DONORS.graft);
 const j=original(roots.jarvis,NEXT_DONORS.jarvis);
 const {triageCultureOffer}=await import(pathToFileURL(join(z.dir,'scripts/triage-culture.mjs')).href);
 const {proposeCultureGraft}=await import(pathToFileURL(join(g.dir,'src/culture-nursery.mjs')).href);
 const {attendCultureReturn}=await import(pathToFileURL(join(j.dir,'src/culture-return.mjs')).href);
 const feed=read(join(z.dir,'public/attention-v1.json'));
 const registry=read(join(g.dir,'candidate-registry.json'));
 const plan=triageCultureOffer(offer,feed,planId);
 const nursery=proposeCultureGraft(offer,plan,registry);
 const attention=attendCultureReturn(offer,plan,nursery,feed);
 fail(plan.disposition==='HOLD_FOR_PLAN_OWNER_REVIEW'&&plan.planUpdated===false&&
  nursery.branchCreated===false&&nursery.codeImported===false&&
  attention.localTaskCreated===false&&attention.externalMessageSent===false&&
  attention.canonSelected===false&&attention.pennyIssued===0,'RECEIVER_POLICY_LAUNDERED');
 const summary={schema:'cannon.culture-return-replay/v1',
  upstreamSource:'NATIVE_COLD_VERIFIED_SIGNED_RELATTE',
  originalComicSha256:review.originalComicSha256,
  threeIndependentSourceCuts:{planZ:NEXT_DONORS.planz.commit,
   GRAFT:NEXT_DONORS.graft.commit,JARVIS:NEXT_DONORS.jarvis.commit},
  originalGitWitnesses:{planZ:z.gitWitnesses,GRAFT:g.gitWitnesses,JARVIS:j.gitWitnesses},
  sourceOffer:offer.identity,planTriage:plan.triageId,nurseryCandidate:nursery.candidateId,
  returnedAttention:attention.attentionId,
  planChoice:'EXPLICIT_TEST_RECIPE_NOT_AUTOMATIC_MATCH',
  state:'CLOSED_LOOP_PROPOSAL_HELD_NOT_APPLIED',
  fieldWorkConfirmed:false,actualReceiverAdmission:false,workIssued:0,moneyIssued:0,
  branchCreated:false,planUpdated:false,externalCommunication:false,
  nextHumanGate:plan.ownerGate};
 return {files:{'culture-offer.json':offer,'planz-hold.json':plan,
  'graft-nursery.json':nursery,'jarvis-attention.json':attention,'return-receipt.json':summary},summary};
}
export async function runReturn(roots,forge,held,useDir,sovereign,out,planId=DEFAULT_PLAN){
 fail(!existsSync(out),'OUTPUT_ALREADY_EXISTS');
 const {files,summary}=await replay(roots,forge,held,useDir,sovereign,planId);
 mkdirSync(out,{mode:0o700});
 for(const [name,data] of Object.entries(files))writeFileSync(join(out,name),json(data),{flag:'wx',mode:0o600});
 writeFileSync(join(out,'selection.json'),json({planId}),{flag:'wx',mode:0o600});
 return {state:summary.state,plan:planId,attention:summary.returnedAttention,actualEffects:0};
}
export async function verifyReturn(roots,forge,held,useDir,sovereign,out){
 const selection=read(join(out,'selection.json'));
 fail(Object.keys(selection).sort().join()==='planId','OPERATOR_SELECTION_CHANGED');
 const {files,summary}=await replay(roots,forge,held,useDir,sovereign,selection.planId);
 for(const [name,source] of Object.entries({...files,'selection.json':selection}))
  fail(readFileSync(join(out,name)).equals(Buffer.from(json(source))),'RETURN_COLD_REPLAY_MISMATCH_'+name);
 return {state:'CLOSED_LOOP_COLD_VERIFIED',attention:summary.returnedAttention,sourceDonors:3,
  originalSourceFiles:summary.originalGitWitnesses.planZ.length+
   summary.originalGitWitnesses.GRAFT.length+summary.originalGitWitnesses.JARVIS.length,
  realFieldVerified:false,branchCreated:false,planUpdated:false,pennyIssued:0};
}
