// GROOVETOWN-004: bounded multi-beneficiary reciprocal planning and missing-organ discovery.
// Synthetic conditional software only; cannot authorize or record any outside-world action.
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {sanitizeScenario} from '../groovetown-003/intertown.mjs';
import {makeTown} from '../groovetown-001/groovetown.mjs';
import {compile as particularize} from '../groovetown-002/particularity.mjs';

export const VERSION='GROOVETOWN-004/v1';
const check=(x,message)=>{if(!x)throw Error(message)};
const id=x=>check(typeof x==='string'&&/^[a-z][a-z0-9-]{1,45}$/.test(x),'invalid id');
const amount=x=>check(Number.isSafeInteger(x)&&x>0&&x<=10000,'invalid quantity');
const norm=x=>Array.isArray(x)?x.map(norm):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,norm(x[k])])):x;
const serial=x=>JSON.stringify(norm(x));
const digest=x=>createHash('sha256').update(typeof x==='string'?x:serial(x)).digest('hex');
const e=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const key=(town,resource,unit)=>`${town}|${resource}|${unit}`;
const stock=(inv,town,resource,unit)=>inv[key(town,resource,unit)]??0;
const put=(inv,town,resource,unit,delta)=>{const k=key(town,resource,unit);const next=(inv[k]??0)+delta;check(Number.isSafeInteger(next)&&next>=0,'inventory underflow/overflow');inv[k]=next;};

export function sanitizeReactor(raw){
  check(raw&&typeof raw==='object'&&!Array.isArray(raw),'invalid reactor input');
  check(Array.isArray(raw.goals)&&raw.goals.length>=2&&raw.goals.length<=4,'need 2–4 declared goals');
  const ids=new Set();const townIds=new Set(raw.towns?.map(t=>t.id));
  const goals=raw.goals.map(g=>{
    check(g&&typeof g==='object','invalid goal');
    for(const f of ['id','town','resource','unit','needId'])id(g[f]);
    check(!ids.has(g.id),'duplicate goal id'); ids.add(g.id);
    check(townIds.has(g.town),'goal town unknown');amount(g.quantity);
    check(typeof g.displayItem==='string'&&g.displayItem.length<150&&g.displayItem.trim().length>0,'invalid displayItem');
    return {id:g.id,town:g.town,resource:g.resource,unit:g.unit,quantity:g.quantity,needId:g.needId,displayItem:g.displayItem};
  }).sort((a,b)=>a.id.localeCompare(b.id));
  // 003 supplies exhaustive owner/source/visibility checks and removes restricted claims.
  // Its required single target is present only to validate the model; our solver uses all goals.
  const first=goals[0];
  const base=sanitizeScenario({...raw,target:{town:first.town,resource:first.resource,unit:first.unit,quantity:first.quantity,needId:first.needId,displayItem:first.displayItem}});
  return {version:VERSION,synthetic:true,towns:base.towns,goals,supplies:base.supplies,processes:base.processes,routes:base.routes};
}

function startState(s){const inventory={};for(const x of s.supplies)put(inventory,x.at,x.resource,x.unit,x.quantity);return {inventory,used:{},done:[],steps:[]};}
const stateHash=s=>digest({inventory:s.inventory,used:s.used,done:s.done});
function possibilities(s,state){
  const out=[];
  // Claiming a fulfilled need consumes/reserves the inventory, preventing reuse for a second goal.
  for(const g of s.goals){
    if(state.done.includes(g.id)||stock(state.inventory,g.town,g.resource,g.unit)<g.quantity)continue;
    const inventory={...state.inventory};put(inventory,g.town,g.resource,g.unit,-g.quantity);
    out.push({inventory,used:state.used,done:[...state.done,g.id].sort(),steps:[...state.steps,{kind:'GOAL',id:g.id,owner:g.town,quantity:g.quantity,resource:g.resource,unit:g.unit,town:g.town,sourceId:'declared-goal-'+g.id}]});
  }
  // Exact single-input transformations from original 003: no inferred yields.
  for(const p of s.processes){
    const n=Math.min(Math.floor(stock(state.inventory,p.at,p.input.resource,p.input.unit)/p.input.quantity),p.maxRuns-(state.used[p.id]??0));
    if(n<=0)continue;
    for(const count of [...new Set([n,1])]){
      const inventory={...state.inventory},used={...state.used};
      put(inventory,p.at,p.input.resource,p.input.unit,-p.input.quantity*count);
      put(inventory,p.at,p.output.resource,p.output.unit,p.output.quantity*count);
      used[p.id]=(used[p.id]??0)+count;
      out.push({inventory,used,done:state.done,steps:[...state.steps,{kind:'PROCESS',id:p.id,owner:p.owner,at:p.at,runs:count,input:{...p.input,quantity:p.input.quantity*count},output:{...p.output,quantity:p.output.quantity*count},sourceId:p.sourceId}]});
    }
  }
  for(const r of s.routes){
    const n=Math.min(stock(state.inventory,r.from,r.resource,r.unit),r.capacity-(state.used[r.id]??0));
    if(n<=0)continue;
    for(const count of [...new Set([n,1])]){
      const inventory={...state.inventory},used={...state.used};
      put(inventory,r.from,r.resource,r.unit,-count);put(inventory,r.to,r.resource,r.unit,count);
      used[r.id]=(used[r.id]??0)+count;
      out.push({inventory,used,done:state.done,steps:[...state.steps,{kind:'MOVE',id:r.id,owner:r.owner,from:r.from,to:r.to,resource:r.resource,unit:r.unit,quantity:count,sourceId:r.sourceId}]});
    }
  }
  return out;
}

export function solveReciprocity(s,{maxDepth=13,maxStates=35000}={}){
  check(s?.version===VERSION&&Array.isArray(s.goals),'unsanitized reactor model');
  check(Number.isSafeInteger(maxDepth)&&maxDepth>0&&maxDepth<=30,'bad depth');
  check(Number.isSafeInteger(maxStates)&&maxStates>0&&maxStates<=100000,'bad states');
  const root=startState(s);const queue=[root];const seen=new Set([stateHash(root)]);
  let best=root, explored=0, complete=false;
  const score=x=>{const recipients=new Set(x.done.map(goal=>s.goals.find(g=>g.id===goal).town)).size;return [x.done.length,recipients,-x.steps.length]};
  const better=(a,b)=>{const x=score(a),y=score(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]>y[i];return false;};
  let saturated=false;
  for(let head=0;head<queue.length;head++){
    if(explored>=maxStates){saturated=true;break;}
    const cur=queue[head];explored++;
    if(better(cur,best))best=cur;
    if(cur.done.length===s.goals.length){best=cur;complete=true;break;}
    if(cur.steps.length>=maxDepth)continue;
    for(const state of possibilities(s,cur)){
      const h=stateHash(state);if(seen.has(h))continue;
      seen.add(h);queue.push(state);
    }
  }
  const outcomes=s.goals.map(g=>({id:g.id,town:g.town,resource:g.resource,unit:g.unit,required:g.quantity,conditionallyFulfilled:best.done.includes(g.id)}));
  const benefitingTowns=[...new Set(outcomes.filter(x=>x.conditionallyFulfilled).map(x=>x.town))].sort();
  return {status:complete?'ALL_GOALS_CONDITIONALLY_FEASIBLE':saturated?'SEARCH_LIMIT_INCONCLUSIVE':best.done.length?'PARTIAL_GOALS_CONDITIONALLY_FEASIBLE':'NO_GOALS_IN_BOUNDED_MODEL',
    search:{maxDepth,maxStates,explored,exhaustive:!saturated,optimalityProven:!saturated&&complete},
    goalsMet:best.done.length,totalGoals:s.goals.length,benefitingTowns,outcomes,steps:best.steps,remainingStock:best.inventory};
}

function assertOwned(s,step){
  if(step.kind==='GOAL')return s.goals.some(x=>x.id===step.id&&x.town===step.owner);
  const xs=step.kind==='PROCESS'?s.processes:s.routes;
  return xs.some(x=>x.id===step.id&&x.owner===step.owner&&x.sourceId===step.sourceId);
}
export function compileReactor(raw){
  const s=sanitizeReactor(raw);
  const solution=solveReciprocity(s);
  for(const step of solution.steps)check(assertOwned(s,step),'step no longer sourced');
  const claimedSupplyOwners=new Set();
  for(const st of solution.steps){
    if(st.kind==='MOVE')for(const p of s.supplies){if(p.at===st.from&&p.resource===st.resource&&p.unit===st.unit)claimedSupplyOwners.add(p.owner);}
    if(st.kind==='PROCESS')for(const p of s.supplies){if(p.at===st.at&&p.resource===st.input.resource&&p.unit===st.input.unit)claimedSupplyOwners.add(p.owner);}
  }
  // Conservatively request consent from EVERY declared supply owner, including
  // owners whose exact lots cannot be attributed by this aggregated inventory model.
  const owners=[...new Set([...solution.steps.map(x=>x.owner),...claimedSupplyOwners,...s.supplies.map(x=>x.owner)])].sort();
  const beneficiaryTowns=solution.benefitingTowns;
  const unreturned=owners.filter(x=>!beneficiaryTowns.includes(x));
  const names=new Map(s.towns.map(x=>[x.id,x.name]));
  const workOrders=solution.steps.map((x,i)=>({stage:i+1,town:x.owner,townName:names.get(x.owner),kind:x.kind,
    action:x.kind==='GOAL'?`Reserve ${x.quantity} ${x.unit} ${x.resource} for ${names.get(x.town)}'s declared need.`:
      x.kind==='PROCESS'?`Review ${x.runs} process runs at ${names.get(x.at)}: ${x.input.quantity} ${x.input.unit} ${x.input.resource} into ${x.output.quantity} ${x.output.unit} ${x.output.resource}.`:
      `Review moving ${x.quantity} ${x.unit} ${x.resource} from ${names.get(x.from)} to ${names.get(x.to)}.`,
    sourceId:x.sourceId,authorization:'HOLD',physicalResult:'NONE'}));
  const ownerInvitations=owners.map(owner=>({owner,name:names.get(owner),status:'UNSENT_HOLD',
    proposedActions:workOrders.filter(w=>w.town===owner),
    question:unreturned.includes(owner)?`What benefit, payment, reciprocal offer or other voluntary terms would make this worthwhile for ${names.get(owner)}?`:
      `Does ${names.get(owner)} wish to review these conditional contributions and proposed benefits?`,
    rightToRefuse:true}));
  const localPurpose=solution.outcomes.filter(g=>g.conditionallyFulfilled).map(g=>{
    const town=makeTown({name:names.get(g.town)+' (FICTIONAL)',needs:[{id:s.goals.find(x=>x.id===g.id).needId,item:s.goals.find(x=>x.id===g.id).displayItem,quantity:g.required}]});
    const facts={handoff:{value:`proposed receipt in ${names.get(g.town)}`,visibility:'SHARE',evidence:'SYNTHETIC',sourceId:'town-'+g.town}};
    return {goalId:g.id,compiled:particularize({town,needId:s.goals.find(x=>x.id===g.id).needId,facts})};
  });
  const packet={version:VERSION,modelDigest:digest(s),model:'SYNTHETIC_DECLARED',executionAuthority:'HOLD_ALL',physicalCredits:0,
    outcome:solution,sourceClaims:solution.steps.map(x=>x.sourceId),owners,beneficiaryTowns,
    distribution:{benefitsDeclaredFor:beneficiaryTowns,participantsWithoutModeledBenefit:unreturned,
      equity:'NOT_ESTABLISHED',valueOfContributions:'UNMEASURED',allPartyNetBenefit:'NOT_PROVEN'},
    workOrders,ownerInvitations,localPurpose,
    nextQuestions:[...unreturned.map(x=>`What voluntary return or recognition would ${names.get(x)} require?`),
      'Which contributed capacities are genuinely available, and under whose authority?',
      'What compatible pickup, handoff and process windows are available?',
      'Can each party independently accept, refuse or revise the proposal?',
      'Which safe custody, verification and outcome records are required?'],
    creativeBrief:{kind:'UNRENDERED_EVENT_SCORE',title:'The Reciprocity Fugue',motifs:workOrders.map(w=>({town:w.town,kind:w.kind,text:w.action})),resolution:'HOLD UNTIL REAL INDEPENDENTLY VERIFIED OUTCOMES',actualAudio:false},
    fieldStatus:'ZERO_REAL_PARTICIPANTS_ZERO_REAL_WORK'};
  return {...packet,hash:digest(packet)};
}

export function negotiate(plan,decisions={}){
  check(plan?.version===VERSION&&digest(Object.fromEntries(Object.entries(plan).filter(([k])=>k!=='hash')))===plan.hash,'plan receipt changed');
  check(decisions&&typeof decisions==='object'&&!Array.isArray(decisions),'invalid decisions');
  for(const [town,vote] of Object.entries(decisions))check(plan.owners.includes(town)&&['YES','NO','HOLD'].includes(vote),'invalid local decision');
  const values=Object.values(decisions);
  return {planHash:plan.hash,synthetic:true,localVotes:decisions,
    status:values.includes('NO')?'REFUSED':values.includes('HOLD')?'HOLD':plan.owners.every(x=>decisions[x]==='YES')?'ALL_SYNTHETIC_YES_FIELD_HOLD':'AWAITING_PARTNER_VOTES',
    physicalCredits:0,authority:'NO_REAL_WORLD_COMMITMENT'};
}

export function hypotheticalMissingOrgan(raw,{removeRouteId,candidateRoute}){
  const scope=sanitizeReactor(raw);
  id(removeRouteId);
  check(scope.routes.some(r=>r.id===removeRouteId),'missing route cannot be removed');
  const stripped={...raw,routes:raw.routes.filter(x=>x.id!==removeRouteId)};
  const before=compileReactor(stripped);
  // Candidate is an explicit *what-if*, not an offer, and is never promoted to operational stock.
  check(candidateRoute&&candidateRoute.id===removeRouteId,'candidate must replace exact missing route');
  check(candidateRoute.authority==='PROPOSAL_ONLY'&&candidateRoute.evidence==='SYNTHETIC'&&candidateRoute.visibility==='SHARE','hypothesis not explicitly declared');
  const after=compileReactor({...stripped,routes:[...stripped.routes,candidateRoute]});
  return {kind:'UNVERIFIED_MISSING_ORGAN_HYPOTHESIS',removed:removeRouteId,sourceId:candidateRoute.sourceId,
    before:{status:before.outcome.status,goalsMet:before.outcome.goalsMet,steps:before.outcome.steps},
    ifHypotheticallyAdded:{status:after.outcome.status,goalsMet:after.outcome.goalsMet,steps:after.outcome.steps},
    newlyPossibleGoalCount:Math.max(0,after.outcome.goalsMet-before.outcome.goalsMet),
    proposedCapability:{kind:'TRANSPORT_LINK',owner:candidateRoute.owner,from:candidateRoute.from,to:candidateRoute.to,
      resource:candidateRoute.resource,unit:candidateRoute.unit,capacity:candidateRoute.capacity,status:'NOT_OFFERED_NOT_VERIFIED'},
    nextAction:'Ask potential custodians whether any authorized capability could satisfy this link. Do not invent a provider.',
    authority:'HOLD_NO_INVITATION_SENT_NO_COST_ESTIMATE'};
}

// Propose missing *route shapes* from declared supply/process output locations to
// genuinely unmet destinations. The named carrier is only a hypothetical test
// custodian, never an observed offer. A positive counterfactual is NOT a booking.
export function discoverMissingRoutes(raw,{limit=8}={}){
  check(Number.isSafeInteger(limit)&&limit>0&&limit<=24,'invalid hypothesis limit');
  const s=sanitizeReactor(raw);
  const baseline=solveReciprocity(s);
  const carriers=[...new Set(s.routes.map(r=>r.owner))].sort();
  if(!carriers.length)return {baselineGoalsMet:baseline.goalsMet,candidates:[],status:'NO_DECLARED_ROUTE_CUSTODIAN_TO_QUERY'};
  const goals=s.goals.filter(g=>!baseline.outcomes.find(x=>x.id===g.id)?.conditionallyFulfilled);
  const sources=[...s.supplies.map(x=>({at:x.at,resource:x.resource,unit:x.unit,sourceId:x.sourceId})),
    ...s.processes.map(x=>({at:x.at,resource:x.output.resource,unit:x.output.unit,sourceId:x.sourceId}))];
  const routes=[];const seen=new Set();
  for(const goal of goals)for(const x of sources){
    if(x.at===goal.town||x.resource!==goal.resource||x.unit!==goal.unit)continue;
    if(s.routes.some(r=>r.from===x.at&&r.to===goal.town&&r.resource===goal.resource&&r.unit===goal.unit))continue;
    const identity=`${x.at}|${goal.town}|${goal.resource}|${goal.unit}`;
    if(seen.has(identity))continue;seen.add(identity);
    const proposal={id:`hypo-${digest(identity).slice(0,14)}`,owner:carriers[0],sourceId:`hypothesis-${digest(x.sourceId+identity).slice(0,16)}`,
      evidence:'SYNTHETIC',visibility:'SHARE',authority:'PROPOSAL_ONLY',
      from:x.at,to:goal.town,resource:goal.resource,unit:goal.unit,capacity:goal.quantity};
    const augmented=sanitizeReactor({...raw,routes:[...raw.routes,proposal]});
    const effect=solveReciprocity(augmented);
    routes.push({goalId:goal.id,kind:'MISSING_TRANSPORT_LINK_HYPOTHESIS',
      candidate:proposal,availableCustodian:'NOT_VERIFIED',availableCapacity:'NOT_VERIFIED',
      proposedCarrierQuestion:`Would ${carriers[0]} or another authorized carrier consider this route and quantity?`,
      inputProvenance:x.sourceId,goalsMetBefore:baseline.goalsMet,goalsMetWithHypothesis:effect.goalsMet,
      incrementalGoals:Math.max(0,effect.goalsMet-baseline.goalsMet),
      proofStatus:effect.status,physicalActions:'NONE',authority:'HOLD'});
  }
  routes.sort((a,b)=>b.incrementalGoals-a.incrementalGoals||a.candidate.id.localeCompare(b.candidate.id));
  return {baselineGoalsMet:baseline.goalsMet,candidates:routes.slice(0,limit),
    status:routes.length?'CANDIDATE_GAPS_UNVERIFIED':'NO_DIRECT_ROUTE_CANDIDATE_FROM_DECLARED_OUTPUTS',
    note:'A route hypothesis is not an existing carrier offer. Other missing capacity types are not considered by this first enumerator.'};
}

export function fixture(){
  const p=(id,owner,sourceId,attrs)=>({id,owner,sourceId,evidence:'SYNTHETIC',visibility:'SHARE',authority:'PROPOSAL_ONLY',...attrs});
  const base={towns:[{id:'millford',name:'Millford'},{id:'ovenham',name:'Ovenham'},{id:'lantern',name:'Lantern Town'},{id:'bridgeport',name:'Bridgeport'}],
    goals:[{id:'bread-for-lantern',town:'lantern',resource:'bread',unit:'loaf',quantity:12,needId:'bread',displayItem:'bread loaves'},
      {id:'lamps-for-millford',town:'millford',resource:'working-lamp',unit:'piece',quantity:2,needId:'lamps',displayItem:'working lamps'}],
    supplies:[p('mill-flour','millford','synthetic-flour',{at:'millford',resource:'flour',unit:'kg',quantity:6}),
      p('lantern-broken-lamps','lantern','synthetic-repair-stock',{at:'lantern',resource:'broken-lamp',unit:'piece',quantity:2})],
    processes:[p('oven-bread','ovenham','synthetic-baking',{at:'ovenham',input:{resource:'flour',unit:'kg',quantity:1},output:{resource:'bread',unit:'loaf',quantity:2},maxRuns:6}),
      p('oven-repair','ovenham','synthetic-repair',{at:'ovenham',input:{resource:'broken-lamp',unit:'piece',quantity:1},output:{resource:'working-lamp',unit:'piece',quantity:1},maxRuns:2})],
    routes:[p('carrier-flour','bridgeport','synthetic-route-flour',{from:'millford',to:'ovenham',resource:'flour',unit:'kg',capacity:6}),
      p('carrier-bread','bridgeport','synthetic-route-bread',{from:'ovenham',to:'lantern',resource:'bread',unit:'loaf',capacity:12}),
      p('carrier-broken','bridgeport','synthetic-route-broken',{from:'lantern',to:'ovenham',resource:'broken-lamp',unit:'piece',capacity:2}),
      p('carrier-lamps','bridgeport','synthetic-route-lamps',{from:'ovenham',to:'millford',resource:'working-lamp',unit:'piece',capacity:2})]};
  return base;
}

export function html(main,gap,checks){
  const show=x=>e(x);
  const names={millford:'Millford',ovenham:'Ovenham',lantern:'Lantern Town',bridgeport:'Bridgeport'};
  const selected={all:{label:'Full declared network',outcome:main.outcome},missing:{label:'One transport link removed',outcome:checks.noLamp},noCarrier:{label:'All Bridgeport links removed',outcome:checks.noCarrier}};
  const model=JSON.stringify(selected).replace(/</g,'\\u003c');
  const problem=JSON.stringify(gap).replace(/</g,'\\u003c');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GROOVETOWN-004 • The Reciprocity Reactor</title><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#101820;color:#e8eee9;font:16px/1.55 system-ui}main{max-width:1050px;margin:auto;padding:3rem 1.2rem 5rem}h1{font-size:clamp(2.7rem,9vw,5.8rem);line-height:.97;letter-spacing:-.045em;margin:.45rem 0}h2{color:#bce9dd;font-size:1.4rem}h3{margin:.2rem 0;font-size:1.05rem}.eyebrow{color:#fcd48b;text-transform:uppercase;letter-spacing:.15em;font-size:.78rem;font-weight:700}.lead{font-size:1.22rem;max-width:740px}aside,.card{background:#1b2b32;border:1px solid #39505a;border-radius:13px;padding:1.1rem;margin:.65rem 0}aside{border-left:4px solid #efb66b}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.8rem}.card small{color:#a1c0bb}.stat{font-size:2.4rem;font-weight:750;color:#fbd791}button{border:1px solid #6ba99c;background:#21483f;color:#e3f6f1;font:inherit;padding:.7rem 1.05rem;border-radius:10px;margin:.3rem .35rem .3rem 0;cursor:pointer}button[aria-pressed="true"]{background:#fbd791;color:#151c20;border-color:#fbd791}ol{padding-left:1.4rem}li{margin:.6rem 0}code{word-break:break-word;color:#c7e5ef}mark{background:#fbd791;color:#172322;padding:.15rem .3rem;border-radius:5px}footer{margin-top:2rem;color:#9bacac}</style><main><span class="eyebrow">CANNON · Experimental field • 004</span><h1>The Reciprocity<br>Reactor.</h1><p class="lead">Two towns have complementary needs. Two others offer capabilities. Their proposed resources move through a shared, finite inventory—and <em>both</em> receiving towns can benefit in the declared mathematical model.</p><aside><strong>FICTIONAL CONDITIONAL MODEL · NOTHING DISPATCHED.</strong> Synthetic contributors, quantities, and processes. No recorded real consent, field verification, payments, deliveries or net-benefit measurements. A feasible plan is not a commitment.</aside><section class="grid"><div class="card"><small>Distinct goals</small><div class="stat">2</div><p>Food and repair</p></div><div class="card"><small>Potential beneficiaries</small><div class="stat">2</div><p>Lantern Town + Millford</p></div><div class="card"><small>Participating town roles</small><div class="stat">4</div><p>Including transport + workshop</p></div></section><h2>Try subtracting an organ</h2><p>Each button switches between separately computed model results, rather than changing the displayed text arbitrarily.</p><div><button data-plan="all" aria-pressed="true">All contributions</button><button data-plan="missing" aria-pressed="false">Remove lamp delivery</button><button data-plan="noCarrier" aria-pressed="false">Remove carrier</button></div><section class="card" aria-live="polite" id="result"></section><h2>The missing-organ discovery</h2><div class="card"><h3>Repair the missing capability, not the relationship</h3><p>When the final lamp route is absent, this solver can ask what capability would complete the plan, then independently test a <strong>hypothetical</strong> restoration.</p><p><mark>${show(gap.newlyPossibleGoalCount)} additional goal becomes conditionally reachable</mark> when the explicit proposed route is added to this fictional model.</p><p>Owner: ${show(names[gap.proposedCapability.owner]??gap.proposedCapability.owner)} · ${show(names[gap.proposedCapability.from]??gap.proposedCapability.from)} → ${show(names[gap.proposedCapability.to]??gap.proposedCapability.to)} · ${show(gap.proposedCapability.capacity)} ${show(gap.proposedCapability.unit)} ${show(gap.proposedCapability.resource)}.</p><p><strong>Not an actual offer.</strong> We must ask whether anyone could supply that capability, and on what terms.</p></div><h2>What each town actually gets</h2><div class="grid">${main.outcome.outcomes.map(g=>`<article class="card"><h3>${show(names[g.town]??g.town)}</h3><p>${show(g.required)} ${show(g.unit)} ${show(g.resource)}</p><strong>${g.conditionallyFulfilled?'CONDITIONAL POSSIBILITY':'UNMET IN MODEL'}</strong></article>`).join('')}</div><h2>Who still needs a fair deal?</h2><p>Benefit accounting is not the same thing as equitable compensation. This model identifies the towns providing services without a modeled material benefit; the reactor must ask them what return they would voluntarily accept.</p><div class="grid">${main.ownerInvitations.map(x=>`<article class="card"><h3>${show(x.name)}</h3><p>${show(x.question)}</p><small>UNSENT · independently governed</small></article>`).join('')}</div><h2>Verified compiler boundaries</h2><ol><li>Raw private/NO_USE claims are discarded before the planning model.</li><li>One unified inventory prevents reusing the same materials to satisfy different goals.</li><li>Transport and process capacities are consumed during search.</li><li>All local YES votes still mean HOLD until real independent authorization and outcome evidence.</li><li>The creative score is a declared brief, not an audio/video rendering.</li></ol><footer>SHA-256 packet: <code>${show(main.hash)}</code><br>This page is offline, read-only, and uses no network calls.</footer></main><script>const cases=${model};const gap=${problem};const result=document.getElementById('result');document.querySelectorAll('button[data-plan]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('button[data-plan]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const pick=cases[button.dataset.plan];const s=pick.outcome;const h=document.createElement('h3');h.textContent=pick.label;const p=document.createElement('p');p.textContent=s.goalsMet+' of '+s.totalGoals+' declared goals provisionally achievable · '+s.status;const ol=document.createElement('ol');for(const step of s.steps){const li=document.createElement('li');li.textContent=step.kind+' — '+step.owner+' — '+(step.resource??step.input?.resource??'')+' ('+step.sourceId+')';ol.appendChild(li)}result.replaceChildren(h,p,ol)}));document.querySelector('[data-plan="all"]').click();</script></html>`;
}

export function demo(directory){
  const raw=fixture();const main=compileReactor(raw);
  const noLampRaw={...raw,routes:raw.routes.filter(x=>x.id!=='carrier-lamps')};
  const noLamp=solveReciprocity(sanitizeReactor(noLampRaw));
  const noCarrier=solveReciprocity(sanitizeReactor({...raw,routes:raw.routes.filter(x=>x.owner!=='bridgeport')}));
  const missing=hypotheticalMissingOrgan(raw,{removeRouteId:'carrier-lamps',candidateRoute:raw.routes.find(x=>x.id==='carrier-lamps')});
  const inferredGaps=discoverMissingRoutes(noLampRaw);
  const allYes=negotiate(main,Object.fromEntries(main.owners.map(x=>[x,'YES'])));
  const refused=negotiate(main,{bridgeport:'NO'});
  const publicModel=sanitizeReactor(raw);
  const outputs={
    '01-reciprocity-plan.json':serial(main)+'\n',
    '02-public-claims-only.json':serial(publicModel)+'\n',
    '03-missing-organ-experiment.json':serial(missing)+'\n',
    '03b-inferred-route-hypotheses.json':serial(inferredGaps)+'\n',
    '04-all-yes-still-held.json':serial(allYes)+'\n',
    '05-refusal.json':serial(refused)+'\n',
    '06-counterfactuals.json':serial({withoutLastLampLink:noLamp,withoutCarrier:noCarrier})+'\n',
    '07-review-only-unsent-briefs.json':serial(main.ownerInvitations)+'\n',
    'index.html':html(main,missing,{noLamp,noCarrier})
  };
  mkdirSync(directory,{recursive:true});for(const [name,data] of Object.entries(outputs))writeFileSync(join(directory,name),data);
  const receipt={version:VERSION,synthetic:true,files:Object.fromEntries(Object.entries(outputs).map(([x,y])=>[x,'sha256:'+digest(y)]))};
  writeFileSync(join(directory,'receipt.json'),serial(receipt)+'\n');return receipt;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv[2]!=='demo'||!process.argv[3]){console.error('Usage: node reciprocity.mjs demo OUTPUT_DIRECTORY');process.exitCode=2;}
  else console.log(JSON.stringify(demo(process.argv[3]),null,2));
}
