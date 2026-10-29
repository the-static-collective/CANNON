import {createHash} from 'node:crypto';
export const json=x=>JSON.stringify(x,null,2)+'\n';
export const digest=x=>'sha256:'+createHash('sha256').update(x).digest('hex');
export const hold=(ok,reason)=>{if(!ok)throw Error('HOLD / REFUSE: '+reason)};
export function buildEvidence({owners,room,iron,stage,aids}){
 hold(owners?.schema==='cannon.creative-owners/v1'&&owners.authority==='DISCOVERY_AND_EXPLICIT_ADAPTERS_ONLY','OWNER_REGISTRY');
 hold(owners.privateOwnerGate?.status==='NOT_EXECUTED_BY_PUBLIC_CANNON','PRIVATE_SOURCE_EXECUTION_NOT_AUTHORIZED');
 hold(room?.schema==='cannon.creative-room-intent/v1'&&room.mode==='FICTIONAL_LOCAL_ONLY','ROOM_INTENT');
 hold(room.participants==='NONE'&&room.semanticEffect==='none'&&room.rights==='NOT_ASSERTED'&&room.transport==='NONE'&&room.published===false&&room.sourceOwnerExecuted===false,'ROOM_AUTHORITY');
 hold(iron?.schema==='iron-lung/first-breath-receipt/v0.1'&&iron.spineStatus==='proposal_only'&&iron.pneumaStatus==='interpretive','IRON_NATIVE_PROPOSAL');
 hold(iron.initialCirculation==='multiple_routes'&&iron.descendantBraidId&&iron.descendantParentId&&iron.descendantBraidId!==iron.descendantParentId,'IRON_LINEAGE');
 hold(stage?.version==='static-live.stage-projection/v0.1'&&typeof stage.playable==='boolean'&&Array.isArray(stage.unresolvedCapabilities),'STATIC_LIVE_NATIVE');
 hold(typeof aids['stage/setlist.md']==='string'&&typeof aids['stage/routing.md']==='string','STAGE_AIDS');
 const bridge={schema:'cannon.creative-room-bridge/v1',intent:room,origin:'CANNON_SYNTHETIC_ONLY',relation:'NOT_A_ROOM_EVENT',sent:false,release:false,privateSourceExecuted:false,next:'GROOVE_ROOM_OWNER_LOCAL_EXPORT_AND_BAND_RUNTIME_AUTHORITY_GATE'};
 const lens={schema:'cannon.creative-lens/v1',nativeOwners:['iron-lung','static-live'],iron:{routes:iron.offeredRouteIds,selection:iron.selectedRouteId,status:iron.spineStatus},stage:{playable:stage.playable,unresolved:stage.unresolvedCapabilities},unexecutedCandidates:owners.discoveryOnly,privateRoom:'HOLD',humanParticipants:0,externalContacts:0};
 const files={'native/iron-lung.json':json(iron),'native/static-live.json':json(stage),...aids,'room-bridge.json':json(bridge),'creative-lens.json':json(lens),'owners.json':json(owners)};
 const body={schema:'cannon.creative-receipt/v1',kind:'UNSIGNED_LOCAL_SOFTWARE',sourceCommits:Object.fromEntries(Object.entries(owners.executed).map(([k,v])=>[k,v.commit])),fileSha256:Object.fromEntries(Object.entries(files).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,digest(v)])),originalNativeOwners:2,candidateCount:owners.discoveryOnly.length,privateRoomExecuted:false,fieldVerified:false,humanDeeds:0,rightsVerified:false,power:'UNKNOWN'};
 const receipt={...body,receiptId:digest(json(body))}; files['receipt.json']=json(receipt);
 return {files,receipt};
}
export function verifyFiles(expected,actual){
 hold(Object.keys(expected).sort().join('|')===Object.keys(actual).sort().join('|'),'OUTPUT_FILE_SET');
 for(const [name,bytes] of Object.entries(expected))hold(actual[name]===bytes,'OUTPUT_BYTE_TAMPER:'+name);
 return true;
}
