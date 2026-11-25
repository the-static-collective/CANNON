const Q=id=>document.getElementById(id),say=t=>Q('rhizome-status').textContent=t;
const siaDigest=async(domain,v)=>{const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(domain+'\0'+canonical(v)));return 'sha256:'+Array.from(new Uint8Array(h),x=>x.toString(16).padStart(2,'0')).join('')};
const rh=createRhizome({packet,project,hash,canonical,verify},authorizePledgeTransition,siaDigest);
let proposed=null;
const input=()=>{const t=Q('rhizome-input').value;if(t.length>60000)throw Error('Packet too large');return JSON.parse(t)};
const output=x=>Q('rhizome-output').value=JSON.stringify(x,null,2);
function rc(id,fn){Q(id).onclick=async()=>{if(busy)return;busy=true;try{await boot();requireRoot();await fn();await refresh()}catch(e){say('HOLD · '+String(e.message).slice(0,180))}finally{busy=false}}}
rc('rhizome-inventory',async()=>{output(await rh.inventory(node));say('Signed inventory ready; freshness unknown.')});
rc('rhizome-compare',async()=>{output(await rh.compare(packet(node),input()));say('Comparison only; no changes made.')});
rc('rhizome-delta',async()=>{output(await rh.delta(node,input()));say('Missing-record packet ready.')});
rc('rhizome-mirror',async()=>{const b=await rh.snapshot(node),m=await rh.mirror(b);output(b);say('Public mirror '+m.address)});
rc('rhizome-preview',async()=>{proposed=null;const x=input(),local=packet(node);let remote;if(x.schema==='rhizome.mirror/v1'){const m=await rh.mirror(x);remote={schema:'mustard.public-history/v1',roster:m.bundle.roster,events:m.bundle.events}}else{const r=await rh.recover(local,x);if(r.status!=='REMOTE_VALID'){output(r);say('HOLD · missing bytes');return}remote=r.packet}const r=await rh.reconcile(local,remote);output(r);if(r.status==='READY_FOR_REVIEW'){proposed=r.packet;say('Candidate only. Stage into Root inbox.')}else say('HOLD · conflicting histories; no winner.')});
rc('rhizome-stage',async()=>{if(!proposed)throw Error('No candidate');await api.stage(root,JSON.stringify(proposed),'rhizome-reconciliation.json');proposed=null;say('Held in Root inbox. No admission yet.')});
rc('rhizome-save',async()=>{const text=Q('rhizome-output').value;if(!text)throw Error('No output');const u=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='rhizome-public-exchange.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});
