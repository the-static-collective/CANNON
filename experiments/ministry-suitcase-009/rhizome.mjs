// Rhizome: signed inventories and reviewed reconciliation, synthetic 007 scope.
export function createRhizome(seed,authorize,digest){
 const ok=(v,m)=>{if(!v)throw Error(m)},enc=new TextEncoder(),roles=['A','B','C'];
 const exact=(o,ks)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join(',')===ks.slice().sort().join(',');
 const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))),raw=s=>Uint8Array.from(atob(s),x=>x.charCodeAt(0));
 const rosterId=r=>digest('sia/rhizome-roster/v1',r);
 async function inspect(p){
  ok(exact(p,['schema','roster','events'])&&p.schema==='mustard.public-history/v1'&&exact(p.roster,roles)&&new Set(Object.values(p.roster)).size===3&&Array.isArray(p.events)&&p.events.length<=20,'Packet scope');
  for(const key of Object.values(p.roster))await crypto.subtle.importKey('spki',raw(key.split('\n')[1]),'Ed25519',false,['verify']);
  await seed.project(p.events,p.roster,authorize);return {roster:await rosterId(p.roster),ids:await Promise.all(p.events.map(seed.hash))};
 }
 async function inventory(node){
  const p=seed.packet(node),v=await inspect(p);ok(node.roster[node.role]===node.keys.publicKey,'Signer role mismatch');
  const body={schema:'rhizome.inventory/v1',rosterId:v.roster,role:node.role,ids:v.ids};
  return {...body,signature:b64(await crypto.subtle.sign('Ed25519',node.keys.privateKey,enc.encode('RHIZOME-INVENTORY-v1\n'+seed.canonical(body))))};
 }
 async function verifyInventory(i,roster){
  ok(exact(i,['schema','rosterId','role','ids','signature'])&&i.schema==='rhizome.inventory/v1'&&roles.includes(i.role)&&i.rosterId===await rosterId(roster)&&Array.isArray(i.ids)&&i.ids.length<=20&&i.ids.every(x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x))&&new Set(i.ids).size===i.ids.length,'Inventory scope');
  const {signature,...body}=i,bytes=raw(signature);ok(bytes.length===64&&b64(bytes)===signature,'Signature encoding');
  const key=await crypto.subtle.importKey('spki',raw(roster[i.role].split('\n')[1]),'Ed25519',false,['verify']);
  ok(await crypto.subtle.verify('Ed25519',key,bytes,enc.encode('RHIZOME-INVENTORY-v1\n'+seed.canonical(body))),'Inventory signature invalid');return i;
 }
 async function compare(local,remote){const v=await inspect(local);await verifyInventory(remote,local.roster);return {missingHere:remote.ids.filter(x=>!v.ids.includes(x)),missingThere:v.ids.filter(x=>!remote.ids.includes(x)),freshness:'UNKNOWN',authority:'NONE'}}
 async function delta(node,peer){const p=seed.packet(node),inv=await inventory(node);await verifyInventory(peer,p.roster);const events=[];for(const e of p.events)if(!peer.ids.includes(await seed.hash(e)))events.push(e);return {schema:'rhizome.delta/v1',inventory:inv,events}}
 async function recover(local,d){
  await inspect(local);ok(exact(d,['schema','inventory','events'])&&d.schema==='rhizome.delta/v1'&&Array.isArray(d.events)&&d.events.length<=20,'Delta scope');
  const i=await verifyInventory(d.inventory,local.roster),by=new Map();for(const e of local.events)by.set(await seed.hash(e),e);
  const sent=new Set();for(const e of d.events){await seed.verify(e);const h=await seed.hash(e);ok(i.ids.includes(h)&&!sent.has(h),'Unlisted or duplicate delta event');sent.add(h);by.set(h,e)}
  const missing=i.ids.filter(h=>!by.has(h));if(missing.length)return {status:'HOLD_MISSING',missing};
  const packet={schema:'mustard.public-history/v1',roster:structuredClone(local.roster),events:i.ids.map(h=>by.get(h))};await inspect(packet);return {status:'REMOTE_VALID',packet};
 }
 async function reconcile(local,remote){
  const a=await inspect(local),b=await inspect(remote);ok(a.roster===b.roster,'Different roster');
  const by=new Map();for(const e of [...local.events,...remote.events])by.set(await seed.hash(e),e);
  ok(by.size<=20,'History bound');const pending=[...by].sort(([a],[b])=>a.localeCompare(b)),events=[];
  while(pending.length){let progress=false;for(let k=0;k<pending.length;k++){try{await seed.project([...events,pending[k][1]],local.roster,authorize)}catch{continue}
   events.push(pending[k][1]);pending.splice(k,1);progress=true;break}
   if(!progress)return {status:'HOLD_CONFLICT',localIds:a.ids,remoteIds:b.ids,unresolved:pending.map(x=>x[0]),authority:'NONE'}
  }
  const packet={schema:'mustard.public-history/v1',roster:structuredClone(local.roster),events};await inspect(packet);
  return {status:'READY_FOR_REVIEW',packet,added:events.length-a.ids.length,authority:'NONE'}
 }
 async function mirror(bundle){
  ok(exact(bundle,['schema','roster','inventory','events'])&&bundle.schema==='rhizome.mirror/v1','Mirror scope');
  const p={schema:'mustard.public-history/v1',roster:bundle.roster,events:bundle.events};
  const v=await inspect(p),i=await verifyInventory(bundle.inventory,p.roster);ok(seed.canonical(v.ids)===seed.canonical(i.ids),'Mirror incomplete');
  return {address:await digest('sia/rhizome-mirror/v1',bundle),bundle:structuredClone(bundle),authority:'NONE',freshness:'UNKNOWN'}
 }
 async function snapshot(node){const p=seed.packet(node);return {schema:'rhizome.mirror/v1',roster:p.roster,inventory:await inventory(node),events:p.events}}
 return {inspect,inventory,verifyInventory,compare,delta,recover,reconcile,mirror,snapshot};
}
