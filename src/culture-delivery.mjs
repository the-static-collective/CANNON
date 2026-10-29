/** CANNON CULTURE FORGE 002 — original lemonPRESS receiver, no silent house publication.
 * Requires original CULTURE FORGE 001 cold replay, then exact source Git + live-byte witness
 * for the independent lemonPRESS receiver, then invokes only its owner-owned HOLD/REFUSE API.
 */
import {readSource} from './present-use.mjs';
import {coldVerifyNative} from './culture-forge.mjs';
import {readFileSync,realpathSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
export const LEMONPRESS={
 repository:'the-static-collective/lemonPRESS',
 commit:'f091e73d2f64b2237ee828010ae244b39e4070b8',
 files:['intake/held-culture.mjs','intake/held-culture-cli.mjs'],
 branchHint:'experiment/culture-forge-002-independent-hold',
 source:'https://github.com/the-static-collective/lemonPRESS/pull/57'
};
const sha=x=>'sha256:'+createHash('sha256').update(x).digest('hex');
function fail(x,m){if(!x)throw Error(m);}
function verifiedReceiver(root){
 const base=realpathSync(resolve(root));
 const proofs=LEMONPRESS.files.map(file=>{
  const p=readSource({id:'lemonpress',repository:LEMONPRESS.repository,commit:LEMONPRESS.commit,
   path:file,media_type:'text/javascript',tags:[]},{[LEMONPRESS.repository]:base});
  const absolute=join(base,file);
  fail(realpathSync(absolute)===absolute,'RECEIVER_SYMLINK_REFUSED');
  fail(sha(readFileSync(absolute))===p.witness.blob_sha256,'LEMONPRESS_EXECUTION_BYTES_DIFFER_FROM_GIT');
  return p.witness;
 });
 return {base,proofs};
}
async function prepare({webz,gro,press,forge}){
 const donor=await coldVerifyNative({webz,gro},forge);
 fail(donor.status==='NATIVE_COLD_REPLAY_VERIFIED','CANNON_ORIGINAL_REPLAY_FAILED');
 const native=verifiedReceiver(press);
 const receiver=await import(pathToFileURL(join(native.base,'intake/held-culture.mjs')).href);
 fail(typeof receiver.receiveLocal==='function'&&typeof receiver.coldVerifyLocal==='function','RECEIVER_API_MISSING');
 return {donor,native,receiver};
}
function checkResult(out,sourceReceiptId,expectedDecision){
 const candidate=JSON.parse(readFileSync(join(out,'candidate.json'),'utf8'));
 const receipt=JSON.parse(readFileSync(join(out,'hold-receipt.json'),'utf8'));
 fail(candidate.schema==='lemonpress/held-culture-candidate/v1','RECEIVER_CANDIDATE_WRONG');
 fail(candidate.decision===expectedDecision,'RECEIVER_DISPOSITION_WRONG');
 fail(candidate.workAdmission==='NONE'&&candidate.editionAdmission==='NONE'&&
 candidate.catalogRegistered===false&&candidate.published===false,'FALSE_HOUSE_ADMISSION');
 fail(candidate.license==='NOT_GRANTED'&&candidate.rights==='UNREVIEWED_NOT_TRANSFERRED','FALSE_ASSET_LICENSE');
 fail(receipt.sourceReceipt===sourceReceiptId&&receipt.publication===false&&receipt.admission===false,'SOURCE_OR_ADMISSION_MISMATCH');
 fail(receipt.financialEffects===0,'ILLEGAL_FINANCIAL_EFFECT');
 return {candidate,receipt};
}
export async function deliverToPress(roots,forge,out,choice='HOLD'){
 fail(choice==='HOLD'||choice==='REFUSE','UNKNOWN_RECEIVER_CHOICE');
 const prepared=await prepare({...roots,forge});
 const sourceReceipt=JSON.parse(readFileSync(join(forge,'receipt.json'),'utf8'));
 const original=prepared.receiver.receiveLocal(forge,out,choice);
 const checked=checkResult(out,sourceReceipt.receiptSha256,
  choice==='HOLD'?'HELD_FOR_EDITOR':'REFUSED_BY_RECEIVER');
 fail(original.receiptId===checked.receipt.receiptId,'RECEIVER_RECEIPT_CHANGED');
 const result=prepared.receiver.coldVerifyLocal(forge,out,choice);
 fail(result.status==='INDEPENDENT_RECEIVER_COLD_VERIFIED','RECEIVER_COLD_CHECK_FAILED');
 return {schema:'cannon.culture-delivery/v1',status:'INDEPENDENT_RECIPIENT_REVIEWED_HOLD_OR_REFUSE',
  sourceCannonReceipt:sourceReceipt.receiptSha256,sourceGitWits:prepared.native.proofs,
  receiverDecision:checked.candidate.decision,receiverReceipt:checked.receipt.receiptId,
  nativeCannonReplay:prepared.donor.status,nativeLemonPressReplay:result.status,
  admitted:false,editionPublished:false,pennyIssued:0,deedsAwarded:0,rightsGranted:false,
  executedOriginalLemonPress:true,actualReceivedFiles:result.verifiedFiles};
}
export async function verifyPressDelivery(roots,forge,out,choice='HOLD'){
 fail(choice==='HOLD'||choice==='REFUSE','UNKNOWN_RECEIVER_CHOICE');
 const prepared=await prepare({...roots,forge});
 const sourceReceipt=JSON.parse(readFileSync(join(forge,'receipt.json'),'utf8'));
 const witness=prepared.receiver.coldVerifyLocal(forge,out,choice);
 const checked=checkResult(out,sourceReceipt.receiptSha256,choice==='HOLD'?'HELD_FOR_EDITOR':'REFUSED_BY_RECEIVER');
 fail(witness.receiptId===checked.receipt.receiptId,'RECEIVER_COLD_ID_MISMATCH');
 return {schema:'cannon.culture-delivery-verification/v1',status:'NATIVE_PRESS_DELIVERY_COLD_VERIFIED',
  receiverDecision:checked.candidate.decision,verifiedFiles:witness.verifiedFiles,
  originalDonorRootsVerified:true,receiverSourcePinned:true,admission:false,pennyIssued:0};
}
