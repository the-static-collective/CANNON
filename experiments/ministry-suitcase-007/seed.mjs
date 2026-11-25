// Mustard Seed: browser transport adapter for original Jubilee v0.1 envelopes.
// Synthetic fixed manifest only; public key possession does not prove real identity.
const ok=(v,m)=>{if(!v)throw Error(m)};
const enc=new TextEncoder(),hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))),unb64=s=>Uint8Array.from(atob(s),x=>x.charCodeAt(0));
const canonical=v=>{if(v===null||typeof v==='string'||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v))return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';ok(v&&Object.getPrototypeOf(v)===Object.prototype,'Not portable JSON');return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}'};
const hash=async v=>hex(await crypto.subtle.digest('SHA-256',enc.encode(canonical(v))));
const equal=(a,b)=>canonical(a)===canonical(b);
const pem=b=>'-----BEGIN PUBLIC KEY-----\n'+b64(b)+'\n-----END PUBLIC KEY-----\n';
async function publicKey(s){ok(typeof s==='string'&&/^-----BEGIN PUBLIC KEY-----\n[A-Za-z0-9+/=]{60}\n-----END PUBLIC KEY-----\n$/.test(s),'Invalid identity key');const k=await crypto.subtle.importKey('spki',unb64(s.split('\n')[1]),'Ed25519',true,['verify']);ok(pem(await crypto.subtle.exportKey('spki',k))===s,'Noncanonical key');return k}
const roles=['A','B','C'],reqs=[{id:'req-kits',resource:'learning_kits',quantity:1,unit:'lot',kind:'goods'},{id:'req-delivery',resource:'transport',quantity:1,unit:'trip',kind:'service'}];
const manifest={title:'Fictional learning kits',summary:'Training only: no actual request or delivery.',region:'remote',requirements:reqs};
const offerRole={ 'req-kits':'B','req-delivery':'C'};
async function signed(type,payload,keys){const content={version:'jubilee-portable/0.1',type,payload,publicKey:keys.publicKey};return {...content,signature:b64(await crypto.subtle.sign('Ed25519',keys.privateKey,enc.encode('JUBILEE-PORTABLE-V0.1\n'+canonical(content))))}}
async function verify(e){ok(e&&Object.keys(e).sort().join(',')==='payload,publicKey,signature,type,version'&&e.version==='jubilee-portable/0.1','Invalid envelope');const {signature,...content}=e;const raw=unb64(signature);ok(raw.length===64&&b64(raw)===signature,'Invalid signature encoding');ok(await crypto.subtle.verify('Ed25519',await publicKey(e.publicKey),raw,enc.encode('JUBILEE-PORTABLE-V0.1\n'+canonical(content))),'Invalid signature')}
async function makeNode(role){ok(roles.includes(role),'Invalid role');const pair=await crypto.subtle.generateKey('Ed25519',false,['sign','verify']);return {role,keys:{publicKey:pem(await crypto.subtle.exportKey('spki',pair.publicKey)),privateKey:pair.privateKey},roster:{},events:[]}}
async function trust(node,roster){ok(node.events.length===0,'Roster locked after first event');ok(roster&&Object.keys(roster).sort().join(',')==='A,B,C','Three keys required');for(const r of roles)await publicKey(roster[r]);ok(new Set(Object.values(roster)).size===3&&roster[node.role]===node.keys.publicKey,'Distinct keys and own role required');node.roster=structuredClone(roster)}
function ready(node){ok(Object.keys(node.roster).length===3,'Review and lock three public keys first')}
async function project(events,roster,authorize){let need=null,needHash=null;const slots={},seen=new Set();for(const e of events){await verify(e);const id=await hash(e);ok(!seen.has(id),'Duplicate history');seen.add(id);const actor=roles.find(r=>roster[r]===e.publicKey);ok(actor,'Unknown signer');const p=e.payload;
if(e.type==='need'){ok(actor==='A'&&!need,'Only one owner need');const expected={id:'mustard-'+(await hash(roster)).slice(0,24),revision:1,previousHash:null,status:'open',public:manifest};ok(equal(p,expected),'Manifest or revision mismatch');need=e;needHash=id;continue}
ok(need,'Missing origin need');
if(e.type==='offer'){const r=reqs.find(r=>r.id===p.requirementId);ok(r&&actor===offerRole[r.id]&&!slots[r.id],'Wrong role or duplicate offer');ok(equal(p,{id:'offer-'+r.id+'-'+need.payload.id,needId:need.payload.id,needHash,requirementId:r.id,region:'remote',quantity:1,unit:r.unit,kind:r.kind}),'Offer mismatch');slots[r.id]={offer:e,offerHash:id,status:'proposed',role:actor};continue}
const slot=Object.values(slots).find(s=>s.offerHash===p.offerHash);ok(slot,'Missing referenced offer');
const action=e.type==='report'?'report_complete':e.type==='decision'?({accepted:'accept',declined:'decline',confirmed:'confirm'})[p.stage]:null;ok(action,'Invalid action');
const d=authorize({action,currentStatus:slot.status,isOpenerOrSteward:actor==='A',isPledgeAuthor:actor===slot.role});ok(d.ok,'Full Measure refusal');
if(e.type==='report'){ok(actor===slot.role&&equal(p,{offerHash:slot.offerHash,acceptanceHash:slot.acceptanceHash,claim:'helper_reported_delivery'}),'Wrong report reference');if(slot.role==='C')ok(slots['req-kits']?.status==='confirmed','Kits must be confirmed first');slot.reportHash=id;slot.status='reported_complete'}
else{ok(actor==='A'&&equal(p,{offerHash:slot.offerHash,needHash,stage:p.stage,reportHash:action==='confirm'?slot.reportHash:null}),'Wrong decision reference');if(action==='accept')slot.acceptanceHash=id;slot.status=p.stage}
}
return {need,needHash,slots,confirmed:Object.values(slots).filter(s=>s.status==='confirmed').length}}
async function ingest(node,packet,authorize){ready(node);ok(packet?.schema==='mustard.public-history/v1'&&Object.keys(packet).sort().join(',')==='events,roster,schema'&&equal(packet.roster,node.roster)&&Array.isArray(packet.events)&&packet.events.length<=20,'Packet scope mismatch');const staged=structuredClone(node.events),seen=new Set(await Promise.all(staged.map(hash)));for(const e of packet.events){const h=await hash(e);if(seen.has(h))continue;staged.push(e);seen.add(h)}ok(staged.length<=20,'History too large');await project(staged,node.roster,authorize);node.events=staged;return staged.length}
const packet=node=>({schema:'mustard.public-history/v1',roster:structuredClone(node.roster),events:structuredClone(node.events)});
async function act(node,action,requirement,authorize){ready(node);const view=await project(node.events,node.roster,authorize);let type,p;
if(action==='need'){ok(node.role==='A'&&!view.need,'Owner only');type='need';p={id:'mustard-'+(await hash(node.roster)).slice(0,24),revision:1,previousHash:null,status:'open',public:manifest}}
else{ok(view.need,'Import the need first');const r=reqs.find(r=>r.id===requirement);ok(r,'Select requirement');const s=view.slots[r.id];
if(action==='offer'){ok(node.role===offerRole[r.id]&&!s,'Wrong role or existing offer');type='offer';p={id:'offer-'+r.id+'-'+view.need.payload.id,needId:view.need.payload.id,needHash:view.needHash,requirementId:r.id,region:'remote',quantity:1,unit:r.unit,kind:r.kind}}
else{ok(s,'Import offer first');if(action==='report_complete'){type='report';p={offerHash:s.offerHash,acceptanceHash:s.acceptanceHash,claim:'helper_reported_delivery'}}else{const stage=({accept:'accepted',decline:'declined',confirm:'confirmed'})[action];ok(stage,'Unknown action');type='decision';p={offerHash:s.offerHash,needHash:view.needHash,stage,reportHash:action==='confirm'?s.reportHash:null}}}}
const e=await signed(type,p,node.keys);await ingest(node,{...packet(node),events:[e]},authorize);return e}
export {makeNode,trust,act,ingest,packet,project,hash,canonical,signed,verify};
