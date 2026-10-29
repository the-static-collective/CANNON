import test from 'node:test';
import assert from 'node:assert/strict';
import {readCatalog,discover,choose,makeWrapper,run} from '../scripts/reflex-library.mjs';
const {catalog,digest}=readCatalog();
test('exact two owner-scope capabilities are discoverable but never automatically selected',()=>{
 assert.equal(catalog.capabilities.length,2);
 const found=discover(catalog,'plan film visual replay');
 assert.equal(found.candidates.length,2);
 assert.equal(found.automaticallySelected,false);
 assert.equal(found.authority,'NONE');
 assert.equal(found.candidates[0].capabilityId,'film-press-plan-shaped/v1');
 assert.equal(found.candidates[0].measuredTimeSavedSeconds,null);
});
test('unrecognized requests produce zero machine-ready claims',()=>{
 const result=run(['discover','--need','housing meals']);
 assert.deepEqual(result.candidates,[]);
 assert.throws(()=>run(['discover','--need','']),/NEED_TEXT|BAD_FLAG/);
 assert.throws(()=>choose(catalog,'arbitrary-shell/v1'),/UNSUPPORTED_CAPABILITY/);
});
test('fixed runner cannot be replaced by arbitrary executable',()=>{
 const manipulated=structuredClone(catalog);
 manipulated.capabilities[0].runner='/bin/sh';
 assert.throws(()=>readCatalog(Buffer.from(JSON.stringify(manipulated))),/CAPABILITY_CONTRACT/);
 const promoted=structuredClone(catalog);
 promoted.capabilities[1].gates.publish=true;
 assert.throws(()=>readCatalog(Buffer.from(JSON.stringify(promoted))),/CAPABILITY_CONTRACT/);
 const bogus=structuredClone(catalog);
 bogus.capabilities[1].output.planContentAffectsNativePixels=false;
 assert.throws(()=>readCatalog(Buffer.from(JSON.stringify(bogus))),/PIXEL_CLAIM/);
});
test('local recipe memory binds selected owner, native execution and unknown time savings',()=>{
 const row=choose(catalog,'film-press-plan-shaped/v1'),plan='plan-'+'a'.repeat(24);
 const native={schema:'cannon.inspand-receipt/v1',status:'COLD_REPLAYABLE_HOLD',
  actualAudio:false,actualPublishing:false,actualHumanAcceptance:false,realWorldActions:0,
  receiptSha256:'b'.repeat(64),nativeSilentVideoSha256:'c'.repeat(64),
  nativeToasterFamilyFileSha256:'d'.repeat(64)};
 const packet=makeWrapper(catalog,digest,row,plan,native);
 assert.equal(packet['library-choice.json'].capabilityId,row.id);
 assert.equal(packet['library-memory.json'].humanTimeSavedSeconds,null);
 assert.equal(packet['library-memory.json'].reusableRecipe.requiresExplicitNewAuthorization,true);
 assert.equal(packet['library-memory.json'].observedOutputs.nativeSilentVideoSha256,'c'.repeat(64));
 native.actualPublishing=true;
 assert.throws(()=>makeWrapper(catalog,digest,row,plan,native),/NATIVE_RECEIPT_AUTHORITY/);
});
test('inspect and discover never grant execution or accept authorization',()=>{
 const list=run(['list']);
 assert.equal(list.authority,'NONE');
 assert.equal(list.capabilities.length,2);
 assert.throws(()=>run(['list','--authorize','SYNTHETIC_TEST_ONLY']),/LIST_IS_READ_ONLY/);
 assert.throws(()=>run(['discover','--need','film','--authorize','SYNTHETIC_TEST_ONLY']),/DISCOVER_IS_READ_ONLY/);
 assert.throws(()=>run(['build','--capability','film-press-plan-shaped/v1','--plan','plan-'+ 'a'.repeat(24),
 '--planz','x','--roots','y','--out','z']),/NO_PERMISSION/);
});
