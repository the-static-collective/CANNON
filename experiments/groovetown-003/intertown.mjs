// GROOVETOWN-003: source-labeled multilateral feasibility and purpose compiler.
// CANNON-authored, synthetic coordination model; no network, external consent, deed credit or native reLATTE calls.
import {createHash} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {makeTown} from '../groovetown-001/groovetown.mjs';
import {compile as compileLocalPurpose} from '../groovetown-002/particularity.mjs';

export const VERSION='GROOVETOWN-003/v1';
const sorted = x => Array.isArray(x) ? x.map(sorted) : x && typeof x==='object' ? Object.fromEntries(Object.keys(x).sort().map(k=>[k,sorted(x[k])])) : x;
const canonical=x=>JSON.stringify(sorted(x));
const sha=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:canonical(x)).digest('hex');
const ok=(b,msg)=>{if(!b)throw Error(msg)};
const label=s=>{ok(typeof s==='string'&&s.length>0&&s.length<150&&s.trim()===s,'invalid label');return s;};
const id=s=>{ok(typeof s==='string'&&/^[a-z][a-z0-9-]{1,45}$/.test(s),'invalid identifier');return s;};
const qty=n=>{ok(Number.isSafeInteger(n)&&n>0&&n<=100000,'invalid capacity');return n;};
const goodEvidence=new Set(['SYNTHETIC','REPORTED','REVIEWED']);
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const k=(town,resource,unit)=>`${town}|${resource}|${unit}`;
const get=(inv,town,resource,unit)=>inv[k(town,resource,unit)]??0;
const add=(inv,town,resource,unit,amount)=>{const key=k(town,resource,unit);inv[key]=(inv[key]??0)+amount;ok(inv[key]>=0&&Number.isSafeInteger(inv[key]),'inventory underflow/overflow');};

function validateEntry(e,kind,towns){
  ok(e&&typeof e==='object'&&!Array.isArray(e),'invalid entry');
  id(e.id); id(e.owner); ok(towns.has(e.owner),'unknown owner');
  id(e.sourceId);ok(e.visibility==='SHARE'||e.visibility==='PRIVATE'||e.visibility==='NO_USE','invalid visibility');
  ok(goodEvidence.has(e.evidence),'invalid evidence');
  ok(e.authority==='PROPOSAL_ONLY','missing proposal-only authority');
  if(kind==='SUPPLY'){
    id(e.at);ok(towns.has(e.at),'unknown supply location');id(e.resource);id(e.unit);qty(e.quantity);
  } else if(kind==='PROCESS'){
    id(e.at);ok(towns.has(e.at),'unknown workshop location');qty(e.maxRuns);
    for(const part of ['input','output']){const x=e[part];ok(x&&typeof x==='object','invalid transform');id(x.resource);id(x.unit);qty(x.quantity)}
  } else {
    id(e.from);id(e.to);ok(towns.has(e.from)&&towns.has(e.to)&&e.from!==e.to,'invalid route endpoints');
    id(e.resource);id(e.unit);qty(e.capacity);
  }
}
export function sanitizeScenario(input){
  ok(input&&typeof input==='object'&&!Array.isArray(input),'invalid scenario');
  ok(Array.isArray(input.towns)&&input.towns.length>=2&&input.towns.length<=16,'invalid towns');
  const towns=new Map();
  for(const town of input.towns){ok(town&&typeof town==='object','invalid town');id(town.id);label(town.name);ok(!towns.has(town.id),'duplicate town');towns.set(town.id,{id:town.id,name:town.name});}
  const target=input.target;
  ok(target&&typeof target==='object','invalid target');id(target.town);ok(towns.has(target.town),'unknown target town');
  id(target.resource);id(target.unit);id(target.needId);qty(target.quantity);label(target.displayItem);
  const out={version:VERSION,synthetic:true,towns:[...towns.values()].sort((a,b)=>a.id.localeCompare(b.id)),target:{town:target.town,resource:target.resource,unit:target.unit,needId:target.needId,quantity:target.quantity,displayItem:target.displayItem},supplies:[],processes:[],routes:[]};
  const seenIds=new Set();
  for(const [kind,list] of [['SUPPLY',input.supplies],['PROCESS',input.processes],['ROUTE',input.routes]]){
    ok(Array.isArray(list)&&list.length<=60,`invalid ${kind} list`);
    for(const entry of list){validateEntry(entry,kind,towns);ok(!seenIds.has(entry.id),'duplicate action ID');seenIds.add(entry.id);
      // Private and NO_USE evidence cannot shape the public model, result or output digest.
      if(entry.visibility==='SHARE'){
        const {id,owner,sourceId,evidence,visibility,authority}=entry;
        const base={id,owner,sourceId,evidence,visibility,authority};
        out[kind==='SUPPLY'?'supplies':kind==='PROCESS'?'processes':'routes'].push(kind==='SUPPLY'
          ? {...base,at:entry.at,resource:entry.resource,unit:entry.unit,quantity:entry.quantity}
          : kind==='PROCESS' ? {...base,at:entry.at,maxRuns:entry.maxRuns,input:{resource:entry.input.resource,unit:entry.input.unit,quantity:entry.input.quantity},output:{resource:entry.output.resource,unit:entry.output.unit,quantity:entry.output.quantity}}
          : {...base,from:entry.from,to:entry.to,resource:entry.resource,unit:entry.unit,capacity:entry.capacity});
      }
    }
  }
  for(const field of ['supplies','processes','routes'])out[field].sort((a,b)=>a.id.localeCompare(b.id));
  return out;
}

const initialInventory=s=>{const inv={};for(const item of s.supplies)add(inv,item.at,item.resource,item.unit,item.quantity);return inv;};
function nextStates(s,state,allowCrossings){
  const next=[];
  for(const p of s.processes){
    const n=Math.min(Math.floor(get(state.inventory,p.at,p.input.resource,p.input.unit)/p.input.quantity), p.maxRuns-(state.used[p.id]??0));
    if(n<=0)continue;
    // Bounded discrete candidate runs retain choices that may matter for capacities.
    for(const count of [...new Set([n,1])]){
      const inventory={...state.inventory},used={...state.used};
      add(inventory,p.at,p.input.resource,p.input.unit,-count*p.input.quantity);
      add(inventory,p.at,p.output.resource,p.output.unit,count*p.output.quantity);
      used[p.id]=(used[p.id]??0)+count;
      const step={kind:'PROCESS',id:p.id,owner:p.owner,at:p.at,runs:count,input:{...p.input,quantity:p.input.quantity*count},output:{...p.output,quantity:p.output.quantity*count},sourceId:p.sourceId,evidence:p.evidence};
      next.push({inventory,used,steps:[...state.steps,step]});
    }
  }
  if(allowCrossings){
    for(const r of s.routes){
      const n=Math.min(get(state.inventory,r.from,r.resource,r.unit), r.capacity-(state.used[r.id]??0));
      if(n<=0)continue;
      for(const amount of [...new Set([n,1])]){
        const inventory={...state.inventory},used={...state.used};
        add(inventory,r.from,r.resource,r.unit,-amount);
        add(inventory,r.to,r.resource,r.unit,amount);
        used[r.id]=(used[r.id]??0)+amount;
        const step={kind:'MOVE',id:r.id,owner:r.owner,from:r.from,to:r.to,resource:r.resource,unit:r.unit,quantity:amount,sourceId:r.sourceId,evidence:r.evidence};
        next.push({inventory,used,steps:[...state.steps,step]});
      }
    }
  }
  return next;
}

export function solveModel(s,{allowCrossings=true,maxDepth=8,maxStates=10000}={}){
  ok(s?.version===VERSION,'scenario not sanitized');
  const start={inventory:initialInventory(s),used:{},steps:[]};
  const enough=state=>get(state.inventory,s.target.town,s.target.resource,s.target.unit)>=s.target.quantity;
  if(enough(start))return {status:'MODEL_SATISFIED_WITHOUT_NEW_ACTIONS',steps:[],explored:1,inventory:start.inventory};
  const q=[start],visited=new Set([sha({i:start.inventory,u:start.used})]);
  for(let head=0;head<q.length&&head<maxStates;head++){
    const state=q[head];
    if(state.steps.length>=maxDepth)continue;
    for(const candidate of nextStates(s,state,allowCrossings)){
      const key=sha({i:candidate.inventory,u:candidate.used});if(visited.has(key))continue;visited.add(key);
      if(enough(candidate))return {status:'CONDITIONAL_CHAIN_FOUND',steps:candidate.steps,explored:head+1,inventory:candidate.inventory};
      if(q.length<maxStates)q.push(candidate);
    }
  }
  return {status:'NO_CHAIN_IN_DECLARED_MODEL',steps:[],explored:Math.min(q.length,maxStates),inventory:null};
}

export function compileIntertown(raw){
  const s=sanitizeScenario(raw);
  const result=solveModel(s);
  const solo=solveModel(s,{allowCrossings:false});
  const usedSupplies=s.supplies.filter(x=>result.steps.some(y=>y.kind==='MOVE'&&y.from===x.at&&y.resource===x.resource&&y.unit===x.unit));
  const supplyDependencies=usedSupplies.map(x=>({kind:'SUPPLY',id:x.id,owner:x.owner,at:x.at,resource:x.resource,unit:x.unit,quantity:x.quantity,sourceId:x.sourceId,evidence:x.evidence}));
  const proposedOperations=result.status==='CONDITIONAL_CHAIN_FOUND'?[...supplyDependencies,...result.steps,{kind:'RECIPIENT',id:'recipient-'+s.target.needId,owner:s.target.town,at:s.target.town,resource:s.target.resource,unit:s.target.unit,quantity:s.target.quantity,sourceId:'target-'+s.target.needId,evidence:'SYNTHETIC'}]:[];
  const owners=[...new Set(proposedOperations.map(x=>x.owner))].sort();
  const critical=[],counterfactuals={};
  if(result.status==='CONDITIONAL_CHAIN_FOUND')for(const owner of owners){
    const stripped={...s,supplies:s.supplies.filter(x=>x.owner!==owner),processes:s.processes.filter(x=>x.owner!==owner),routes:s.routes.filter(x=>x.owner!==owner)};
    const counter=solveModel(stripped);
    counterfactuals[owner]=counter.status;
    if(counter.status==='NO_CHAIN_IN_DECLARED_MODEL')critical.push(owner);
  }
  const ownerName=new Map(s.towns.map(t=>[t.id,t.name]));
  const invitations=owners.map(owner=>{
    const steps=proposedOperations.filter(x=>x.owner===owner);
    const details=steps.map(x=>x.kind==='PROCESS'
      ? `review ${x.runs} process runs at ${ownerName.get(x.at)}: ${x.input.quantity} ${x.input.unit} ${x.input.resource} → ${x.output.quantity} ${x.output.unit} ${x.output.resource}`
      : x.kind==='MOVE'?`review carriage of ${x.quantity} ${x.unit} ${x.resource} from ${ownerName.get(x.from)} to ${ownerName.get(x.to)}`
      : x.kind==='SUPPLY'?`review whether ${x.quantity} ${x.unit} ${x.resource} is available at ${ownerName.get(x.at)}`
      :`review receiving ${x.quantity} ${x.unit} ${x.resource} at ${ownerName.get(x.at)}, after delivery verification`);
    return {town:owner,townName:ownerName.get(owner),status:'UNSENT_UNACCEPTED',draft:`UNSENT / FICTIONAL — ${ownerName.get(owner)}: would you review a proposed contribution toward ${s.target.quantity} ${s.target.unit} ${s.target.resource} for ${ownerName.get(s.target.town)}?`,details,decisionRequired:'Independent local YES / NO / HOLD, after checking capacity, rights, safety and timing.'};
  });
  const stepStages=proposedOperations.map((x,i)=>({index:i+1,kind:x.kind,source:x.sourceId,
    purpose:x.kind==='MOVE'?`Transfer a proposed ${x.quantity} ${x.unit} ${x.resource} from ${ownerName.get(x.from)} to ${ownerName.get(x.to)}.`
      :x.kind==='PROCESS'?`Convert proposed inputs to ${x.output.quantity} ${x.output.unit} ${x.output.resource} at ${ownerName.get(x.at)}.`
      :x.kind==='SUPPLY'?`Ask ${ownerName.get(x.owner)} to review supplying ${x.quantity} ${x.unit} ${x.resource}.`
      :`Ask ${ownerName.get(x.owner)} to consider receiving ${x.quantity} ${x.unit} ${x.resource}.`,
    completed:false, credit:'NONE'}));
  const unresolved=['Confirm each listed offer is still available and authorized.','Obtain separate approval from every participating town or custodian.',
    'Agree on feasible pickup, processing and handoff windows; none supplied.',
    'Review appropriate handling, legal requirements, accessibility, and safety for the proposed goods.',
    'Obtain recipient acceptance and independent physical confirmation before any ledger credit.'];
  const packet={version:VERSION,synthetic:true,scenarioDigest:sha(s),target:s.target,
    verdict:result.status,executionAuthority:'HOLD_NO_APPROVALS',realWorldStatus:'NOT_ATTEMPTED',
    provenance:{claimCount:s.supplies.length+s.processes.length+s.routes.length,sourceIds:proposedOperations.map(x=>x.sourceId),fieldVerification:'NOT_OBTAINED'},
    emergence:{localTownCanMeetTargetInModel:solo.status!=='NO_CHAIN_IN_DECLARED_MODEL',
      networkUnlocksTargetInModel:solo.status==='NO_CHAIN_IN_DECLARED_MODEL'&&result.status==='CONDITIONAL_CHAIN_FOUND',
      essentialPartnersInThisModel:critical,withoutEachOwner:counterfactuals,scope:'Counterfactuals only under declared synthetic offers, processes, routes, units and capacities.'},
    steps:stepStages,proposedOperations,invitations,unresolved,
    audienceOutputs:{recipient:`PROPOSED ONLY: ${ownerName.get(s.target.town)} could receive ${s.target.quantity} ${s.target.unit} ${s.target.resource} after all gates.`,
      steward:`Review ${proposedOperations.length} proposed stages; request ${owners.length} independently authorized partner decisions; confirm safety and availability.`,
      witness:'No delivery has occurred; witness must be independent of the reporter and review original evidence.',
      creative:{kind:'UNRENDERED_SCORE_BRIEF',title:'The Four-Town Flour Fugue',
        stages:proposedOperations.map(x=>x.kind==='MOVE'?`footstep percussion: ${x.owner} carries ${x.resource} from ${x.from} → ${x.to}`:x.kind==='PROCESS'?`oven chord: ${x.input.resource} → ${x.output.resource}`:x.kind==='SUPPLY'?`supply bass: ${x.resource} held by ${x.owner}`:`unresolved arrival melody: ${x.owner}`),
        musicalEnd:'UNRESOLVED UNTIL INDEPENDENT LOCAL CONFIRMATION',realAudioRendered:false}},
    nextQuestion:result.status==='CONDITIONAL_CHAIN_FOUND'?`Will each of ${owners.map(x=>ownerName.get(x)).join(', ')} independently permit their stated contribution, and at what times?`:
      `Which missing SHARE-scoped resource, processing capacity, or authorized transport link would permit ${s.target.quantity} ${s.target.unit} ${s.target.resource} to reach ${ownerName.get(s.target.town)}?`,
    accounting:{mode:'HYPOTHETICAL_ONLY',delivered:0,credit:0,claimedTimeSavings:'NOT_MEASURED'}
  };
  // Invoke the actual GROOVETOWN-002 purpose compiler. Missing contact/window remain explicit HOLDs.
  const localTown=makeTown({name:`${ownerName.get(s.target.town)} (SYNTHETIC MODEL)`,needs:[{id:s.target.needId,item:s.target.displayItem,quantity:s.target.quantity}]});
  const firstSupply=usedSupplies[0];
  const fact=(value,sourceId)=>({value,visibility:'SHARE',evidence:'SYNTHETIC',sourceId});
  const localFacts={handoff:fact(`${ownerName.get(s.target.town)} (proposed destination)`,'model-target'),
    ...(firstSupply?{source:fact(`${ownerName.get(firstSupply.at)} proposed ${firstSupply.resource} supply`,firstSupply.sourceId)}:{}),
    ...(result.steps.some(x=>x.kind==='MOVE')?{transport:fact(`proposed ${result.steps.filter(x=>x.kind==='MOVE').length}-leg independent carriage chain`,'model-routes')}:{}),
  };
  packet.localPurpose=compileLocalPurpose({town:localTown,needId:s.target.needId,facts:localFacts});
  const final={...packet,hash:sha(packet)};
  return final;
}

export function openPledges(plan){
  ok(plan?.version===VERSION&&plan.hash===sha(Object.fromEntries(Object.entries(plan).filter(([k])=>k!=='hash'))),'invalid plan receipt');
  return {version:VERSION,planHash:plan.hash,owners:plan.invitations.map(x=>x.town),decisions:{},status:'AWAITING_INDEPENDENT_DECISIONS',scope:'SYNTHETIC_SIMULATION_ONLY',physicalCredit:0};
}
export function localDecision(agreement,owner,decision){
  ok(agreement?.scope==='SYNTHETIC_SIMULATION_ONLY','not a synthetic test agreement');id(owner);
  ok(agreement.owners.includes(owner),'decision from nonparticipant');
  ok(decision==='YES'||decision==='NO'||decision==='HOLD','invalid local decision');
  ok(agreement.decisions[owner]===undefined,'duplicate decision');
  const decisions={...agreement.decisions,[owner]:decision};
  const status=Object.values(decisions).includes('NO')?'REFUSED':Object.values(decisions).includes('HOLD')?'HOLD':
    agreement.owners.every(x=>decisions[x]==='YES')?'ALL_SYNTHETIC_PLEDGES_PRESENT_FIELD_HOLD':'AWAITING_INDEPENDENT_DECISIONS';
  return {...agreement,decisions,status,physicalCredit:0};
}
export function fixture(){
  const p=(id,owner,sourceId,fields)=>({id,owner,sourceId,visibility:'SHARE',evidence:'SYNTHETIC',authority:'PROPOSAL_ONLY',...fields});
  return {towns:[{id:'lantern',name:'Lantern Town'},{id:'millford',name:'Millford'},{id:'ovenham',name:'Ovenham'},{id:'bridgeport',name:'Bridgeport'}],
    target:{town:'lantern',resource:'bread',unit:'loaf',displayItem:'loaves of bread',quantity:12,needId:'bread'},
    supplies:[p('millford-flour','millford','synthetic-flour-card',{at:'millford',resource:'flour',unit:'kg',quantity:6})],
    processes:[p('ovenham-bake','ovenham','synthetic-oven-capability',{at:'ovenham',input:{resource:'flour',unit:'kg',quantity:1},output:{resource:'bread',unit:'loaf',quantity:2},maxRuns:6})],
    routes:[p('bridgeport-flour','bridgeport','synthetic-courier-flour',{from:'millford',to:'ovenham',resource:'flour',unit:'kg',capacity:6}),
      p('bridgeport-bread','bridgeport','synthetic-courier-bread',{from:'ovenham',to:'lantern',resource:'bread',unit:'loaf',capacity:12})]};
}
export function formatHtml(plan){
  const esc=escape;
  const headers=plan.proposedOperations.map((s,i)=>`<li><b>${i+1}. ${esc(s.kind)}</b> · ${esc(s.owner)} — ${esc(plan.steps[i].purpose)} <small>${esc(s.sourceId)}</small></li>`).join('');
  const cards=plan.invitations.map(x=>`<section><h3>${esc(x.townName)}</h3><p>${esc(x.draft)}</p><ul>${x.details.map(d=>`<li>${esc(d)}</li>`).join('')}</ul><b>HOLD — no invitation sent</b></section>`).join('');
  const qs=plan.unresolved.map(x=>`<li>${esc(x)}</li>`).join('');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Groovetown 003 — The Four-Town Flour Fugue</title><style>:root{color-scheme:dark}body{background:#0e1b22;color:#e9e8dc;font:16px/1.6 system-ui;max-width:940px;padding:2rem 1rem;margin:auto}h1{line-height:1.1;font-size:clamp(2rem,6vw,3.5rem)}h2{color:#f5c989}b,strong{color:#ffd897}section{border:1px solid #50616b;border-radius:12px;padding:1rem;background:#1c3037;margin:.7rem 0}ul,ol{padding-left:1.5rem}li{margin:.5rem 0}small{display:block;color:#aab9b9}aside{background:#433326;border-left:4px solid #ffbf77;padding:1rem}code{overflow-wrap:anywhere}button{background:#ffcf88;border:0;color:#111;font:inherit;font-weight:bold;border-radius:8px;padding:.6rem 1rem;margin:.4rem .3rem .4rem 0;cursor:pointer}button[aria-pressed=true]{background:#c7e4d3}</style><p>GROOVETOWN-003 / SYNTHETIC SCENARIO / NO REAL PARTICIPANTS</p><h1>The Four-Town<br>Flour Fugue</h1><p>One town has flour. Another has an oven. A third can offer carriage. A fourth needs bread. Together, their declared capabilities can form a chain that none can provide alone <em>under this model</em>.</p><aside><strong>CONDITIONAL PROPOSAL — HOLD</strong><br>No town has consented. No bread has been made or transported. No appointments have been arranged, and there is no field verification or signed cross-party custody.</aside><h2>What becomes possible?</h2><p id="verdict">${esc(plan.emergence.networkUnlocksTargetInModel?'No target-town-only solution in the declared model; one conditional multi-town plan found.':'No new multi-town unlock proven.')}</p><ol>${headers}</ol><h2>What does each town have to decide?</h2>${cards}<h2>What do we still not know?</h2><ul>${qs}</ul><h2>Experiment: remove a partner</h2><p>The compiler actually reruns feasibility with different inputs. This is not a claim about physical-world impossibility.</p><div><button id="baseline" aria-pressed="true">All proposed partners</button><button id="noBridge" aria-pressed="false">Remove Bridgeport</button><button id="noOven" aria-pressed="false">Remove Ovenham</button><button id="noMill" aria-pressed="false">Remove Millford</button></div><section id="counter"></section><h2>Purpose compiler's local output</h2><p>${esc(plan.localPurpose.action.title)}</p><p>Status: <b>${esc(plan.localPurpose.status)}</b>. Missing: ${esc(plan.localPurpose.specificity.missing.join(', '))}. No automatic outreach.</p><h2>Creative score (not rendered)</h2><p>The plan specifies a rhythm for each crossing and a chord for transformation. The final harmony remains unresolved until separately verified completion.</p><ol>${plan.audienceOutputs.creative.stages.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><small>SHA-256 plan receipt: <code>${esc(plan.hash)}</code></small><script>const choices=${JSON.stringify({baseline:['CONDITIONAL_CHAIN_FOUND','Four towns offer a conditional chain in this synthetic scenario.'],noBridge:[plan.emergence.withoutEachOwner?.bridgeport??'NOT_COMPUTED','Bridgeport-controlled routes removed.'],noOven:[plan.emergence.withoutEachOwner?.ovenham??'NOT_COMPUTED','Ovenham-controlled workshop removed.'],noMill:[plan.emergence.withoutEachOwner?.millford??'NOT_COMPUTED','Millford-controlled supply removed.']}).replace(/</g,'\\u003c')};const b=[...document.querySelectorAll('button')];for(const el of b){el.addEventListener('click',()=>{b.forEach(x=>x.setAttribute('aria-pressed',String(x===el)));const x=choices[el.id];document.getElementById('counter').textContent=x[0]+' — '+x[1]})}document.getElementById('baseline').click();</script></html>`;
}
export function demo(dir){
  const plan=compileIntertown(fixture());
  const agreement=openPledges(plan);
  const held=localDecision(agreement,'millford','YES');
  const refused=localDecision(held,'bridgeport','NO');
  const scenario=sanitizeScenario(fixture());
  const noBridge=solveModel({...scenario,routes:scenario.routes.filter(x=>x.owner!=='bridgeport')});
  const outputs={
    '01-conditional-network-plan.json':canonical(plan)+'\n',
    '02-share-only-scenario.json':canonical(scenario)+'\n',
    '03-negotiation-hold-and-refusal.json':canonical({initial:agreement,partial:held,refusal:refused})+'\n',
    '04-without-carrier.json':canonical(noBridge)+'\n',
    '05-unsent-invitations.json':canonical(plan.invitations)+'\n',
    '06-purpose-compiler-local-output.json':canonical(plan.localPurpose)+'\n',
    'index.html':formatHtml(plan),
  };
  mkdirSync(dir,{recursive:true});
  for(const [name,body]of Object.entries(outputs))writeFileSync(join(dir,name),body);
  const receipt={version:VERSION,synthetic:true,files:Object.fromEntries(Object.entries(outputs).map(([n,b])=>[n,'sha256:'+sha(b)]))};
  writeFileSync(join(dir,'receipt.json'),canonical(receipt)+'\n');
  return receipt;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv[2]!=='demo'||!process.argv[3]){console.error('Usage: node intertown.mjs demo OUTPUT_DIRECTORY');process.exitCode=2;}
  else console.log(JSON.stringify(demo(process.argv[3]),null,2));
}
