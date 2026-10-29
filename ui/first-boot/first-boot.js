// No third-party scripts, analytics or network calls. All operations are to 127.0.0.1.
const byId=id=>document.getElementById(id);
const result=(id,message,isError=false)=>{
 const el=byId(id);el.hidden=false;el.classList.toggle('error',isError);
 el.replaceChildren();
 const p=document.createElement('p');p.textContent=message;el.append(p);
 return el;
};
const api=async(path,body,nonce)=>{
 const response=await fetch(path,{
  method:body?'POST':'GET',cache:'no-store',credentials:'omit',
  headers:body?{'Content-Type':'application/json','X-Genesis-Token':nonce}:{},
  ...(body?{body:JSON.stringify(body)}:{})
 });
 const out=await response.json();
 if(!response.ok)throw Error(out.error||'LOCAL_GATE_REFUSED');
 return out;
};
let nonce=null;
function addLink(parent,label,url){
 const a=document.createElement('a');a.href=url;a.textContent=label;
 parent.append(a);
}
function showRuns(history){
 const select=byId('runs'),chosen=select.value;
 select.replaceChildren();
 const empty=document.createElement('option');empty.value='';empty.textContent='Select a saved local experiment';select.append(empty);
 for(const entry of history){
  const opt=document.createElement('option');opt.value=entry.id;
  opt.textContent=entry.id+' · '+(entry.kind==='WARM_THREAD'?'FICTIONAL WARM THREAD':(entry.simulated?'FICTIONAL A/B':'UNKNOWN'));
  select.append(opt);
 }
 if(history.some(x=>x.id===chosen))select.value=chosen;
 byId('verify-button').disabled=!select.value;
}
function showShelf(shelf){
 const el=byId('crossing-shelf');el.replaceChildren();
 for(const item of shelf){
  const section=document.createElement('article');section.className='crossing';
  const h=document.createElement('h3');h.textContent=item.title;section.append(h);
  const status=document.createElement('p');status.className='tag';status.textContent=item.state;section.append(status);
  const p=document.createElement('p');p.textContent=item.note;section.append(p);
  addLink(section,'Source PR →',item.source);addLink(section,'Evidence →',item.proof);
  el.append(section);
 }
}
async function refresh(){
 const state=await api('/api/status');
 nonce=state.nonce;
 showRuns(state.history);showShelf(state.bridgeShelf);
 byId('warm-action').hidden=!state.warmAvailable;
 byId('status').textContent='LOCAL ORGAN / READY · NO FIELD CLAIM';
 return state;
}
byId('runs').addEventListener('change',()=>{byId('verify-button').disabled=!byId('runs').value;});
byId('build-form').addEventListener('submit',async(event)=>{
 event.preventDefault();
 const button=byId('build-button');
 if(button.disabled)return;
 button.disabled=true;
 result('build-result','Verifying exact source pins and executing reviewed local code. This is a software experiment.');
 try{
  const response=await api('/api/compose',{
   question:byId('question').value,acknowledgePublicSafe:byId('public-safe').checked
  },nonce);
  const block=result('build-result','Original source execution produced two distinctly held Living House plans and a cultural artifact.');
  const links=document.createElement('div');links.className='links';
  for(const [key,url] of Object.entries(response.links))addLink(links,({
   firstBoot:'Open generated first-boot exhibit',A:'House A',B:'House B',
   comic:'Printable comic',receipt:'Evidence receipt'
  })[key]??key,url);
  block.append(links);
  await refresh();byId('runs').value=response.id;byId('verify-button').disabled=false;
 }catch(error){result('build-result','HOLD: '+error.message,true);}
 finally{button.disabled=false;}
});
byId('verify-button').addEventListener('click',async()=>{
 const id=byId('runs').value;
 if(!id)return;
 const btn=byId('verify-button');btn.disabled=true;
 result('witness-result','Re-running original donor code and comparing every output byte...');
 try{
  const reply=await api('/api/verify',{id},nonce);
  const details=reply.status==='WARM_SOURCE_NATIVE_COLD_REPLAY_VERIFIED'?
   '. '+reply.originalDonorRepos+' original donor programs, real deliveries: ZERO, '+
   'fictional outstanding load: '+reply.remainingFictionalLoad+'.':
   '. '+reply.sourceRepos+' source repositories, '+reply.housePlans+
   ' synthetic house plans; physical acts: NONE; owner canon selected: NO.';
  const box=result('witness-result',reply.status+details);
  const p=document.createElement('p');p.textContent='FIELD WITNESS: '+reply.fieldStatus;
  box.append(p);
 }catch(error){result('witness-result','REFUSED: '+error.message,true);}
 finally{btn.disabled=false;}
});
byId('warm-run-button').addEventListener('click',async()=>{
 const button=byId('warm-run-button');if(button.disabled)return;
 button.disabled=true;
 result('warm-result','Re-executing the original pinned GHoT, Full Measure, Garden and Band crossing...');
 try{
  const generated=await api('/api/warm',{acknowledgeFictional:byId('warm-ack').checked},nonce);
  const block=result('warm-result','Original native Warm Thread completed. Refusal preserved, need unresolved; zero real delivery.');
  const links=document.createElement('div');links.className='links';
  addLink(links,'View the fictional Warm Thread',generated.links.warm);
  addLink(links,'Review original donor receipt',generated.links.receipt);
  block.append(links);await refresh();byId('runs').value=generated.id;byId('verify-button').disabled=false;
 }catch(error){result('warm-result','HOLD: '+error.message,true);}
 finally{button.disabled=false;}
});
refresh().catch(err=>{
 byId('status').textContent='LOCAL SERVER NOT READY';
 result('build-result','Local-only first boot could not load: '+err.message,true);
});
