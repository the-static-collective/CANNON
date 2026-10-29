import test from 'node:test';
import assert from 'node:assert/strict';
import {makePublicOffer,NEXT_DONORS,DEFAULT_PLAN} from '../src/culture-return-005.mjs';
const signed=()=>({schema:'cannon.culture-sovereign-return/v1',
 status:'SIGNED_RECEIVED_AND_RECEIVER_LOCAL_HOLD',signedObjectsVerified:3,
 recipientAdmission:false,senderEffects:0,actualHumanDeeds:0,pennyIssued:0,
 publicEditions:0,nftMinted:0,originalCultureReceipt:'sha256:'+'a'.repeat(64),
 originalPressReceipt:'sha256:'+'b'.repeat(64),ghotReceipt:'ghot-original-receipt-123',
 crossing:'relatte-original-crossing-123',received:'relatte-received-123',
 held:'relatte-held-123'});
const review=()=>({schema:'cannon.culture-use-review/v1',
 receiptId:'sha256:'+'a'.repeat(64),independentPressReceipt:'sha256:'+'b'.repeat(64),
 originalComicSha256:'sha256:'+'c'.repeat(64),authenticatedHumanDeeds:0,
 actualUseConfirmed:false,rightsToPublishVerified:false,pennyWorld:{issuedUnits:0}});
test('signed culture and real file hash become a bounded candidate only',()=>{
 const x=makePublicOffer(signed(),review());
 assert.equal(x.source.comicSha256,review().originalComicSha256);
 assert.equal(x.truth.fictional,true);assert.equal(x.truth.fieldUseVerified,false);
 assert.equal(x.effects.pennyIssued,0);
 assert.equal(x.identity,makePublicOffer(signed(),review()).identity);
 assert.equal(DEFAULT_PLAN,'ATLAS-BRIDGE-002');
 assert.equal(Object.keys(NEXT_DONORS).length,3);
});
test('fake participant, rights, money, admission and mismatched lineage fail',()=>{
 for(const mutate of [
  (s,r)=>s.recipientAdmission=true,
  (s,r)=>s.pennyIssued=5,
  (s,r)=>r.rightsToPublishVerified=true,
  (s,r)=>r.originalComicSha256='absent',
  (s,r)=>r.receiptId='wrong',
  (s,r)=>s.signedObjectsVerified=0
 ]){const s=signed(),r=review();mutate(s,r);assert.throws(()=>makePublicOffer(s,r));}
});
