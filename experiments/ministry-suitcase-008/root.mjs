// Root System: recoverable fictional signing node and reviewed packet inbox.
// Donor primitives supplied explicitly by CANNON; no hosted services.
export function createRootAPI(seed,identity,fileport,Casework,memento,authorize){
 const check=(v,m)=>{if(!v)throw Error(m)},enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
 const clone=structuredClone,roles=['A','B','C'],maxPacket=60000,maxInbox=4;
 const pem=b=>'-----BEGIN PUBLIC KEY-----\n'+btoa(String.fromCharCode(...new Uint8Array(b)))+'\n-----END PUBLIC KEY-----\n';
 const exact=(o,ks)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join(',')===ks.slice().sort().join(',');
 const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
 const fingerprint=async s=>hex(await identity.sha256Bytes(s));
 async function create(role){
  check(roles.includes(role),'Invalid role');const pair=await crypto.subtle.generateKey('Ed25519',true,['sign','verify']);
  return {node:{role,keys:{publicKey:pem(await crypto.subtle.exportKey('spki',pair.publicKey)),privateKey:pair.privateKey},roster:{},events:[]},inbox:[],trace:[]};
 }
 async function parse(text){check(typeof text==='string'&&text.length<=maxPacket,'Packet too large');const value=await fileport.readObject(new Request('https://local.invalid/packet',{method:'POST',headers:{'Content-Type':'application/json'},body:text}),maxPacket);
  check(exact(value,['schema','roster','events'])&&value.schema==='mustard.public-history/v1'&&Array.isArray(value.events)&&value.events.length<=20,'Not a public history packet');return value}
 async function stage(root,text,name='packet.json'){
  check(root.inbox.length<maxInbox,'Inbox limit; remove reviewed packets first');const value=await parse(text),digest=await fileport.sha256(text);
  check(!root.inbox.some(x=>x.digest===digest),'Packet already staged');const id='packet-'+identity.randomSecret(12).toLowerCase().replace(/[^a-z0-9]/g,'x');
  const item={id,digest,name:fileport.cleanName(name)||'packet.json',text,state:'HELD'};
  const at=new Date().toISOString(),contact={schema:memento.UNDERSTORY_SCHEMA,id:id+'-contact',family:'contact',observer:'fictional-node-'+root.node.role,recorded_at:at,sensed_at:at,evidence_refs:['sha256:'+digest],occurrence_ref:'sha256:'+digest};
  const trace=[...root.trace,contact];memento.validateUnderstoryRecords(trace);
  root.inbox.push(item);root.trace=trace;return {id,digest,eventCount:value.events.length,state:'HELD'};
 }
 async function review(root,id,decision){
  const item=root.inbox.find(x=>x.id===id);check(item&&item.state==='HELD','No held packet');
  check(['ADMIT','REFUSE'].includes(decision),'Explicit review required');
  const value=await parse(item.text);check(await fileport.sha256(item.text)===item.digest,'Packet digest mismatch');
  const at=new Date().toISOString(),attention={schema:memento.UNDERSTORY_SCHEMA,id:id+'-attention',family:'attention',observer:'fictional-node-'+root.node.role,recorded_at:at,occurred_at:at,evidence_refs:['sha256:'+item.digest],contact_ref:id+'-contact',action:decision==='ADMIT'?'attended':'ignored'};
  const trace=[...root.trace,attention];memento.validateUnderstoryRecords(trace);
  if(decision==='ADMIT')await seed.ingest(root.node,value,authorize);
  item.state=decision==='ADMIT'?'ADMITTED':'REFUSED';root.trace=trace;return item.state;
 }
 function removeReviewed(root,id){const i=root.inbox.findIndex(x=>x.id===id&&x.state!=='HELD');check(i>=0,'Held packet must be reviewed');root.inbox.splice(i,1)}
 async function validate(root){
  const n=root.node;check(roles.includes(n.role),'Invalid role');check(exact(n.roster,[])||exact(n.roster,roles),'Invalid roster');
  if(Object.keys(n.roster).length){const test={...n,events:[]};await seed.trust(test,n.roster);await seed.project(n.events,n.roster,authorize)}else check(n.events.length===0,'Missing roster');
  const pub=await crypto.subtle.importKey('spki',Uint8Array.from(atob(n.keys.publicKey.split('\n')[1]),x=>x.charCodeAt(0)),'Ed25519',true,['verify']);
  check(pem(await crypto.subtle.exportKey('spki',pub))===n.keys.publicKey,'Noncanonical public key');
  const msg=enc.encode('MUSTARD-ROOT-KEY-CHECK-v1'),sig=await crypto.subtle.sign('Ed25519',n.keys.privateKey,msg);check(await crypto.subtle.verify('Ed25519',pub,sig,msg),'Private key mismatch');
  check(Array.isArray(root.inbox)&&root.inbox.length<=maxInbox&&Array.isArray(root.trace)&&root.trace.length<=200,'Invalid inbox');
  const validated=memento.validateUnderstoryRecords(root.trace);
  const ids=new Set(),digests=new Set();for(const x of root.inbox){
   check(exact(x,['id','digest','name','text','state'])&&/^packet-[a-z0-9]+$/.test(x.id)&&!ids.has(x.id)&&!digests.has(x.digest)&&['HELD','ADMITTED','REFUSED'].includes(x.state),'Invalid inbox item');ids.add(x.id);digests.add(x.digest);
   check(fileport.cleanName(x.name)===x.name&&await fileport.sha256(x.text)===x.digest,'Invalid packet metadata');await parse(x.text);
   const contact=validated.byId.get(x.id+'-contact');check(contact?.occurrence_ref==='sha256:'+x.digest&&contact.observer==='fictional-node-'+n.role,'Missing contact trace');
   const attention=validated.byId.get(x.id+'-attention');check(x.state==='HELD'?!attention:attention?.action===(x.state==='ADMITTED'?'attended':'ignored'),'Review trace mismatch');
  }
  return {role:n.role,fingerprint:await fingerprint(n.keys.publicKey),events:n.events.length,held:root.inbox.filter(x=>x.state==='HELD').length,traceCount:root.trace.length,admission:'none'};
 }
 async function backup(root,pass){
  await validate(root);
  const n=root.node,pkcs8=identity.b64url(new Uint8Array(await crypto.subtle.exportKey('pkcs8',n.keys.privateKey)));
  const data={schema:'mustard.root-state/v1',role:n.role,publicKey:n.keys.publicKey,pkcs8,roster:n.roster,events:n.events,inbox:root.inbox,trace:root.trace};
  const bytes=enc.encode(JSON.stringify(data));check(bytes.length<=400000,'Snapshot too large');
  let book=Casework.append(Casework.blank(),null,'case',{title:'Mustard Root private snapshot v1'}),id=book.events[0].id;
  for(let i=0;i<bytes.length;i+=1200)book=Casework.append(book,id,'source',{text:identity.b64url(bytes.slice(i,i+1200)),ref:'root-chunk-'+(i/1200)});
  return {schema:'mustard.root-encrypted/v1',cipher:await Casework.seal(book,pass)};
 }
 async function restore(envelope,pass){
  check(exact(envelope,['schema','cipher'])&&envelope.schema==='mustard.root-encrypted/v1','Wrong backup type');
  const book=await Casework.unseal(envelope.cipher,pass);check(book.events.length>=2&&book.events.length<=335&&book.events[0].kind==='case'&&book.events[0].data.title==='Mustard Root private snapshot v1','Wrong snapshot');
  const chunks=book.events.slice(1).map((e,i)=>{check(e.kind==='source'&&e.caseId===book.events[0].id&&e.data.ref==='root-chunk-'+i,'Snapshot chunk order');return identity.unb64url(e.data.text)});
  const bytes=new Uint8Array(chunks.reduce((s,b)=>s+b.length,0));let off=0;for(const b of chunks){bytes.set(b,off);off+=b.length}
  const data=JSON.parse(dec.decode(bytes));check(exact(data,['schema','role','publicKey','pkcs8','roster','events','inbox','trace'])&&data.schema==='mustard.root-state/v1'&&Array.isArray(data.events)&&data.events.length<=20,'Invalid snapshot shape');
  const privateKey=await crypto.subtle.importKey('pkcs8',identity.unb64url(data.pkcs8),'Ed25519',true,['sign']);
  const root={node:{role:data.role,keys:{publicKey:data.publicKey,privateKey},roster:data.roster,events:data.events},inbox:data.inbox,trace:data.trace};await validate(root);return root
 }
 return {create,stage,review,removeReviewed,validate,backup,restore,fingerprint};
}
