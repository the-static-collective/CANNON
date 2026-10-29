import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {buildEvidence,verifyFiles,digest} from '../src/creative-engine/core.mjs';
const owners=JSON.parse(readFileSync(new URL('../creative/owners.json',import.meta.url)));
const room=JSON.parse(readFileSync(new URL('../creative/room-intent.json',import.meta.url)));
const iron={schema:'iron-lung/first-breath-receipt/v0.1',spineStatus:'proposal_only',pneumaStatus:'interpretive',initialCirculation:'multiple_routes',offeredRouteIds:['a','b'],selectedRouteId:'a',descendantBraidId:'new',descendantParentId:'old'};
const stage={version:'static-live.stage-projection/v0.1',playable:true,unresolvedCapabilities:[]};
const aids={'stage/setlist.md':'stage','stage/routing.md':'routing'};
const make=(opts={})=>buildEvidence({owners,room,iron,stage,aids,...opts});
test('deterministic bounded receipt and separate private door',()=>{
 const a=make(),b=make();assert.deepEqual(a,b);assert.equal(a.receipt.originalNativeOwners,2);assert.equal(a.receipt.candidateCount,23);
 assert.equal(a.receipt.privateRoomExecuted,false);assert.equal(a.receipt.rightsVerified,false);
 assert.equal(a.receipt.fileSha256['room-bridge.json'],digest(a.files['room-bridge.json']));
});
test('no invented consent or publication',()=>{for(const change of [{participants:'human'},{semanticEffect:'admitted'},{rights:'LICENSED'},{transport:'SENT'},{published:true},{sourceOwnerExecuted:true}])assert.throws(()=>make({room:{...room,...change}}),/HOLD/)});
test('source ownership and source-native schemas fail closed',()=>{
 assert.throws(()=>make({iron:{...iron,spineStatus:'selected'}}),/IRON_NATIVE_PROPOSAL/);
 assert.throws(()=>make({stage:{playable:true}}),/STATIC_LIVE_NATIVE/);
 const altered=structuredClone(owners);altered.privateOwnerGate.status='EXECUTED';assert.throws(()=>make({owners:altered}),/PRIVATE_SOURCE/);
});
test('cold replay detects all byte changes',()=>{
 const files=make().files;assert.equal(verifyFiles(files,{...files}),true);
 assert.throws(()=>verifyFiles(files,{...files,extra:'a'}),/OUTPUT_FILE_SET/);
 assert.throws(()=>verifyFiles(files,{...files,'room-bridge.json':'forgery'}),/OUTPUT_BYTE_TAMPER/);
});
