// GROOVETOWN-005 / Impossibility Foundry
// Synthetic bounded multi-input invention planner. No physical deployment or permissions.
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {sanitizeReactor,solveReciprocity,discoverMissingRoutes,fixture as fixture004} from '../groovetown-004/reciprocity.mjs';

export const VERSION='GROOVETOWN-005/v1';
const must=(condition,why)=>{if(!condition)throw Error(why)};
const ident=x=>must(typeof x==='string'&&/^[a-z][a-z0-9-]{1,45}$/.test(x),'invalid identifier');
const qty=x=>must(Number.isSafeInteger(x)&&x>0&&x<=10000,'invalid quantity');
const norm=x=>Array.isArray(x)?x.map(norm):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,norm(x[k])])):x;
const stringify=x=>JSON.stringify(norm(x));
const hash=x=>createHash('sha256').update(typeof x==='string'?x:stringify(x)).digest('hex');
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const key=(at,resource,unit)=>`${at}|${resource}|${unit}`;
const get=(state,at,resource,unit)=>state.inv[key(at,resource,unit)]??0;
function delta(inv,at,resource,unit,quantity){const k=key(at,resource,unit);const n=(inv[k]??0)+quantity;must(Number.isSafeInteger(n)&&n>=0&&n<=1000000,'inventory overflow or double-spend');inv[k]=n;}
function ownedFact(raw,kind){must(raw&&typeof raw==='object'&&!Array.isArray(raw),`invalid ${kind}`);for(const f of ['id','owner','sourceId'])ident(raw[f]);must(['SHARE','PRIVATE','NO_USE'].includes(raw.visibility),'visibility required');must(raw.authority==='PROPOSAL_ONLY'&&raw.evidence==='SYNTHETIC','not authorized as a real capability');}
function item(x){must(x&&typeof x==='object','invalid material');ident(x.resource);ident(x.unit);qty(x.quantity);return {resource:x.resource,unit:x.unit,quantity:x.quantity};}
const match=(a,b)=>a.from===b.from&&a.to===b.to&&a.resource===b.resource&&a.unit===b.unit;

export function sanitizeFoundry(raw,{allowNoRoute=false}={}){
  must(raw&&typeof raw==='object'&&!Array.isArray(raw),'invalid foundry');
  must(Array.isArray(raw.recipes)&&raw.recipes.length>0&&raw.recipes.length<=8,'recipes must be bounded');
  const base=sanitizeReactor(raw);
  const towns=new Set(base.towns.map(x=>x.id));
  const recipeIds=new Set([...base.routes,...base.processes,...base.supplies].map(x=>x.id));
  const visible=[];
  for(const r of raw.recipes){
    ownedFact(r,'recipe');
    if(r.visibility!=='SHARE')continue;
    must(!recipeIds.has(r.id),'duplicate recipe id');recipeIds.add(r.id);
    ident(r.at);must(towns.has(r.at)&&towns.has(r.owner),'recipe foreign town');
    must(Array.isArray(r.inputs)&&r.inputs.length>0&&r.inputs.length<=4,'recipe requires 1–4 actual inputs');
    const inputs=r.inputs.map(item);must(new Set(inputs.map(x=>key('',x.resource,x.unit))).size===inputs.length,'duplicate material requirement');
    qty(r.maxRuns);must(r.maxRuns<=3,'recipe bounded runs');
    must(r.output&&typeof r.output==='object','missing recipe output');
    let output;
    if(r.output.kind==='MATERIAL')output={kind:'MATERIAL',...item(r.output)};
    else if(r.output.kind==='ROUTE'){
      const v=r.output.route;ownedFact(v,'invented route');
      for(const f of ['from','to','resource','unit'])ident(v[f]);qty(v.capacity);
      must(towns.has(v.from)&&towns.has(v.to)&&towns.has(v.owner)&&v.from!==v.to,'invalid route towns');
      must(v.visibility==='SHARE'&&base.routes.every(x=>x.id!==v.id),'route duplicate or restricted');
      output={kind:'ROUTE',route:{id:v.id,owner:v.owner,sourceId:v.sourceId,evidence:v.evidence,visibility:v.visibility,authority:v.authority,
        from:v.from,to:v.to,resource:v.resource,unit:v.unit,capacity:v.capacity}};
    }else throw Error('unsupported recipe result');
    visible.push({id:r.id,owner:r.owner,at:r.at,sourceId:r.sourceId,evidence:r.evidence,visibility:r.visibility,authority:r.authority,inputs,output,maxRuns:r.maxRuns});
  }
  must(allowNoRoute||visible.some(x=>x.output.kind==='ROUTE'),'no shareable invented route');
  const invented=visible.filter(x=>x.output.kind==='ROUTE');
  const routeIds=new Set();
  for(const r of invented){must(!routeIds.has(r.output.route.id),'duplicate invented route');routeIds.add(r.output.route.id);}
  // The actual 004 missing-route discoverer must independently identify the proposed shape.
  const gap=discoverMissingRoutes({...raw,recipes:undefined},{limit:24});
  must((allowNoRoute&&invented.length===0)||gap.status==='CANDIDATE_GAPS_UNVERIFIED','no inferred missing route to invent');
  for(const r of invented){must(gap.candidates.some(x=>match(x.candidate,r.output.route)),'invented route was not independently identified as a gap');}
  return {version:VERSION,synthetic:true,base,recipes:visible.sort((a,b)=>a.id.localeCompare(b.id)),gapSource:gap.status,
    gapCandidates:gap.candidates.map(x=>({kind:x.kind,candidateShape:{from:x.candidate.from,to:x.candidate.to,resource:x.candidate.resource,unit:x.candidate.unit},incrementalGoals004:x.incrementalGoals})),
    evidence:'SYNTHETIC_PROPOSALS_ONLY'};
}

// This graph is a prerequisite EXPLANATION, not a substitute for the constrained solver.
// Circular or missing-material recipes remain diagnostic and never acquire capabilities.
export function dependencyGraph(model){
  must(model?.version===VERSION,'unsanitized foundry');
  const {recipes,base}=model;
  const nodes=recipes.map(r=>({id:r.id,owner:r.owner,kind:r.output.kind,at:r.at,
    needs:r.inputs.map(x=>({item:x,declaredSourceSupplyIds:base.supplies.filter(s=>s.resource===x.resource&&s.unit===x.unit).map(s=>s.id),
      possibleProducerRecipeIds:recipes.filter(p=>p.output.kind==='MATERIAL'&&p.output.resource===x.resource&&p.output.unit===x.unit).map(p=>p.id)}))}));
  const byId=new Map(nodes.map(x=>[x.id,x]));
  const cycles=new Set();
  const walk=(n,seen,path)=>{if(path.includes(n)){cycles.add([...path.slice(path.indexOf(n)),n].join(' → '));return;}if(seen.has(n))return;seen.add(n);for(const dep of byId.get(n)?.needs??[])for(const p of dep.possibleProducerRecipeIds)walk(p,seen,[...path,n]);};
  for(const n of nodes)walk(n.id,new Set(),[]);
  return {nodes,cycles:[...cycles].sort(),warning:'Graph only identifies possible upstream producers, not availability, scheduling, custody, transport, authority or safe engineering.'};
}

function initial(model){const inv={};for(const s of model.base.supplies)delta(inv,s.at,s.resource,s.unit,s.quantity);return {inv,used:{},done:[],grants:[],steps:[]};}
const stateId=x=>hash({inv:x.inv,used:x.used,done:x.done,grants:x.grants});
function extend(state,changes){return {...state,...changes};}
function actions(model,s){
  const result=[];const base=model.base;
  for(const g of base.goals){if(s.done.includes(g.id)||get(s,g.town,g.resource,g.unit)<g.quantity)continue;
    const inv={...s.inv};delta(inv,g.town,g.resource,g.unit,-g.quantity);
    result.push(extend(s,{inv,done:[...s.done,g.id].sort(),steps:[...s.steps,{kind:'GOAL',id:g.id,owner:g.town,sourceId:'declared-goal-'+g.id,quantity:g.quantity,unit:g.unit,resource:g.resource}]}));}
  for(const p of base.processes){const available=Math.min(Math.floor(get(s,p.at,p.input.resource,p.input.unit)/p.input.quantity),p.maxRuns-(s.used[p.id]??0));
    if(available<=0)continue;
    for(const count of new Set([available,1])){const inv={...s.inv},used={...s.used};delta(inv,p.at,p.input.resource,p.input.unit,-p.input.quantity*count);
      delta(inv,p.at,p.output.resource,p.output.unit,p.output.quantity*count);used[p.id]=(used[p.id]??0)+count;
      result.push(extend(s,{inv,used,steps:[...s.steps,{kind:'PROCESS',id:p.id,owner:p.owner,sourceId:p.sourceId,at:p.at,runs:count}]}));}}
  for(const route of [...base.routes,...model.recipes.filter(x=>x.output.kind==='ROUTE'&&s.grants.includes(x.output.route.id)).map(x=>x.output.route)]){
    const possible=Math.min(get(s,route.from,route.resource,route.unit),route.capacity-(s.used[route.id]??0));if(possible<=0)continue;
    for(const count of new Set([possible,1])){const inv={...s.inv},used={...s.used};delta(inv,route.from,route.resource,route.unit,-count);
      delta(inv,route.to,route.resource,route.unit,count);used[route.id]=(used[route.id]??0)+count;
      result.push(extend(s,{inv,used,steps:[...s.steps,{kind:'MOVE',id:route.id,owner:route.owner,sourceId:route.sourceId,from:route.from,to:route.to,resource:route.resource,unit:route.unit,quantity:count,
        invented:s.grants.includes(route.id)}]}));}}
  for(const r of model.recipes){const available=r.maxRuns-(s.used[r.id]??0);if(available<=0)continue;
    if(r.output.kind==='ROUTE'&&s.grants.includes(r.output.route.id))continue;
    const max=Math.min(available,...r.inputs.map(x=>Math.floor(get(s,r.at,x.resource,x.unit)/x.quantity)));
    if(max<=0)continue;
    for(const count of r.output.kind==='ROUTE'?[1]:[...new Set([max,1])]){
      const inv={...s.inv},used={...s.used};for(const x of r.inputs)delta(inv,r.at,x.resource,x.unit,-x.quantity*count);
      const grants=r.output.kind==='ROUTE'?[...s.grants,r.output.route.id].sort():s.grants;
      if(r.output.kind==='MATERIAL')delta(inv,r.at,r.output.resource,r.output.unit,r.output.quantity*count);
      used[r.id]=(used[r.id]??0)+count;
      result.push(extend(s,{inv,used,grants,steps:[...s.steps,{kind:'INVENT',id:r.id,owner:r.owner,sourceId:r.sourceId,at:r.at,runs:count,
        inputs:r.inputs.map(x=>({...x,quantity:x.quantity*count})),output:r.output.kind==='ROUTE'?{kind:'ROUTE',routeId:r.output.route.id,authority:'HYPOTHETICAL_ONLY'}:{...r.output,quantity:r.output.quantity*count}}]}));
    }
  }
  return result;
}

export function solveFoundry(model,{maxDepth=19,maxStates=65000}={}){
  must(model?.version===VERSION&&model?.base?.version==='GROOVETOWN-004/v1','unsanitized foundry model');
  must(Number.isSafeInteger(maxDepth)&&maxDepth>=1&&maxDepth<=32,'bad depth');
  must(Number.isSafeInteger(maxStates)&&maxStates>=1&&maxStates<=100000,'bad budget');
  const root=initial(model),queue=[root],seen=new Set([stateId(root)]);
  let best=root,explored=0,saturated=false,all=false,depthTruncated=false;
  const rank=x=>[x.done.length,new Set(x.done.map(g=>model.base.goals.find(y=>y.id===g).town)).size,-x.steps.length];
  const better=(x,y)=>{const a=rank(x),b=rank(y);for(let i=0;i<a.length;i++){if(a[i]!==b[i])return a[i]>b[i];}return false;};
  for(let head=0;head<queue.length;head++){
    if(explored>=maxStates){saturated=true;break;}
    const s=queue[head];explored++;if(better(s,best))best=s;
    if(s.done.length===model.base.goals.length){best=s;all=true;break;}
    if(s.steps.length>=maxDepth){if(actions(model,s).length>0)depthTruncated=true;continue;}
    for(const nxt of actions(model,s)){const h=stateId(nxt);if(seen.has(h))continue;seen.add(h);queue.push(nxt);}
  }
  const unresolved=saturated||depthTruncated;
  return {status:all?'ALL_GOALS_CONDITIONALLY_FEASIBLE':unresolved?'SEARCH_LIMIT_INCONCLUSIVE':best.done.length?'PARTIAL_GOALS_CONDITIONALLY_FEASIBLE':'NO_GOALS_IN_BOUNDED_MODEL',
    search:{explored,maxDepth,maxStates,exhaustive:!unresolved&&(!all||best.done.length===model.base.goals.length),saturated,depthTruncated},
    goalsMet:best.done.length,totalGoals:model.base.goals.length,
    outcomes:model.base.goals.map(g=>({goal:g.id,town:g.town,conditioniallyAchievable:best.done.includes(g.id),resource:g.resource,quantity:g.quantity,unit:g.unit})),
    steps:best.steps,activatedHypotheticalRoutes:best.grants,remainingStock:best.inv,
    evidence:'SYNTHETIC_MODEL_ONLY',physicalCredits:0};
}

function clone(x){return structuredClone(x);}
function removeOwnerOrId(raw,what){return {...raw,recipes:raw.recipes.filter(r=>r.id!==what),supplies:raw.supplies.filter(r=>r.id!==what),routes:raw.routes.filter(r=>r.id!==what)};}
function hasBuild(model,solution){return solution.steps.some(x=>x.kind==='INVENT'&&x.output.kind==='ROUTE');}
export function compileFoundry(raw,{maxDepth=19,maxStates=65000,ablateIds=[]}={}){
  const model=sanitizeFoundry(raw);
  // Existing owner 004 runs as the baseline oracle: without new invented capability.
  const baseline=solveReciprocity(model.base,{maxDepth:22,maxStates:50000});
  const full=solveFoundry(model,{maxDepth,maxStates});
  // The canonical input may include explicit supporting supply/transport capabilities.
  // They are declared, not inferred as existing operational capacity.
  must(Array.isArray(ablateIds)&&ablateIds.length<=6,'invalid ablation list');
  const declaredIds=new Set([...model.base.supplies,...model.base.routes,...model.recipes].map(x=>x.id));
  const controls={};
  for(const id of ablateIds){
    ident(id);must(declaredIds.has(id),'ablation not declared');
    const alternative=removeOwnerOrId(raw,id);
    controls[id]=solveFoundry(sanitizeFoundry(alternative,{allowNoRoute:true}),{maxDepth,maxStates});
  }
  // In each control, source privacy/authority rules are reapplied.
  const possible=baseline.search.exhaustive&&full.search.exhaustive;
  const deltaGoals=possible?full.goalsMet-baseline.goalsMet:null;
  const owners=[...new Set([...full.steps.map(x=>x.owner),...model.base.supplies.map(x=>x.owner),
    ...model.recipes.map(x=>x.owner),...model.recipes.filter(x=>x.output.kind==='ROUTE').map(x=>x.output.route.owner)])].sort();
  const producerIds=new Set(full.steps.filter(x=>x.kind==='INVENT').map(x=>x.id));
  const requirementChecks=model.recipes.map(r=>({recipeId:r.id,usedInSelectedPlan:producerIds.has(r.id),
    inputs:r.inputs,proposedResult:r.output,review:'NO_PHYSICAL_CONSTRUCTION_CONFIRMED'}));
  const proof={version:VERSION,scope:'SYNTHETIC_LOCAL_REPLAY_ONLY',modelDigest:hash(model),
    baseline004:{status:baseline.status,goalsMet:baseline.goalsMet,search:baseline.search},
    sharedLedger005:full,incrementalGoals:deltaGoals,
    necessity:{ablations:Object.fromEntries(Object.entries(controls).map(([id,x])=>[id,{status:x.status,goalsMet:x.goalsMet,search:x.search}])),
      interpretation:'Each removed capability is re-solved with the remaining shared inventory and source evidence; model claims only.'},
    recipes:requirementChecks,dependencyGraph:dependencyGraph(model),
    sourceGapDiscovery:model.gapCandidates,
    generatedQuestions:[...owners.map(owner=>({town:owner,status:'UNSENT_HOLD',question:`Would ${owner} voluntarily review the declared contributions, dependencies, risks, timing and returns?`,
      notClaimed:'NO_CONSENT_OR_PAYMENT_ESTABLISHED'})),
      {town:'engineering',status:'NOT_ESTABLISHED',question:'Is this hypothetical capability safe, physically possible, lawful and compatible with actual loads and routes?'},
      {town:'all',status:'FIELD_HOLD',question:'Who can independently verify actual inventory, resource custody, available personnel and completed work?'}],
    creativeBrief:{kind:'UNRENDERED',title:'The Wheel That Was Not There',
      score:full.steps.map((step,i)=>({beat:i+1,voice:step.owner,event:step.kind,source:step.sourceId})),soundFiles:0},
    authority:'HOLD_NO_AUTOMATIC_CREATION_OR_DISPATCH',valueClaims:'UNMEASURED',fairness:'NOT_ESTABLISHED',physicalCredits:0,
    warning:'Model arithmetic, not construction advice, provider consent, verified engineering or proof of safe operations.'};
  must(!hasBuild(model,full)||full.activatedHypotheticalRoutes.length>0,'invalid invention selected');
  return {...proof,hash:hash(proof)};
}

export function fixture(){
  const raw=fixture004();raw.routes=raw.routes.filter(x=>x.id!=='carrier-lamps');
  raw.goals.push({id:'desk-lamp-millford',town:'millford',resource:'working-lamp',unit:'piece',quantity:1,needId:'desk-lamp',displayItem:'desk lamp'});
  raw.supplies.find(x=>x.id==='lantern-broken-lamps').quantity=3;
  raw.processes.find(x=>x.id==='oven-repair').maxRuns=3;
  raw.routes.find(x=>x.id==='carrier-broken').capacity=3;
  const p=(id,owner,sourceId,parts)=>({id,owner,sourceId,evidence:'SYNTHETIC',visibility:'SHARE',authority:'PROPOSAL_ONLY',...parts});
  raw.supplies.push(p('wheel-stock','millford','toy-wheel-source',{at:'millford',resource:'wheel-blank',unit:'piece',quantity:2}));
  raw.supplies.push(p('cart-frame','ovenham','toy-frame-source',{at:'ovenham',resource:'cart-frame',unit:'piece',quantity:1}));
  raw.routes.push(p('carrier-wheelset','bridgeport','toy-wheelset-transfer',{from:'millford',to:'ovenham',resource:'wheelset',unit:'set',capacity:1}));
  raw.recipes=[
    p('recipe-wheels','millford','toy-build-wheels',{at:'millford',maxRuns:1,inputs:[{resource:'wheel-blank',unit:'piece',quantity:2}],output:{kind:'MATERIAL',resource:'wheelset',unit:'set',quantity:1}}),
    p('recipe-cart','ovenham','toy-build-cart',{at:'ovenham',maxRuns:1,inputs:[{resource:'wheelset',unit:'set',quantity:1},{resource:'cart-frame',unit:'piece',quantity:1}],
      output:{kind:'ROUTE',route:p('invented-lamp-route','bridgeport','hypothesis-built-carriage',{from:'ovenham',to:'millford',resource:'working-lamp',unit:'piece',capacity:3})}})
  ];
  return raw;
}

export function html(report,controls){
  const encode=x=>JSON.stringify(x).replace(/</g,'\\u003c');
  const views={built:{name:'Shared-ledger invention',result:report.sharedLedger005},noCart:{name:'Without cart assembly',result:controls.noCart},
    noWheels:{name:'Without wheel material',result:controls.noWheels},noRoute:{name:'Without wheel transport',result:controls.noRoute}};
  const cards=report.sharedLedger005.steps.map((s,i)=>`<li><b>${i+1} · ${esc(s.kind)}</b> <span>${esc(s.id)}</span> <small>${esc(s.owner)} · ${esc(s.sourceId)}</small></li>`).join('');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GROOVETOWN-005 · Impossibility Foundry</title><style>:root{color-scheme:dark}*{box-sizing:border-box}body{background:#10171d;color:#eee7da;margin:0;font:16px/1.55 system-ui}main{max-width:1080px;margin:auto;padding:2.5rem 1.2rem 5rem}h1{font-size:clamp(2.8rem,9vw,6.5rem);letter-spacing:-.06em;line-height:.93;margin:.5rem 0 1rem}h2{color:#b6e8da;margin-top:2.2rem}.tag{letter-spacing:.17em;font-size:.76rem;color:#f4d390;text-transform:uppercase}.lead{font-size:1.3rem;max-width:760px}aside,.box{background:#1b2a30;border:1px solid #46575b;padding:1rem 1.2rem;border-radius:14px;margin:.8rem 0}aside{border-left:5px solid #ffbc70}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.8rem}.count{font-size:3rem;font-weight:800;color:#f9d393}button{background:#304f50;color:#fff;border:1px solid #699d9c;padding:.7rem .9rem;margin:.25rem;border-radius:9px;font:inherit;cursor:pointer}button[aria-pressed=true]{background:#f9d393;color:#14151a}li{margin:.65rem 0}li span{margin-left:1rem}small{display:block;color:#a7c6c1}code{overflow-wrap:anywhere}footer{margin-top:3rem;color:#98b0b1}</style><main><div class="tag">CANNON / fiction only / 005</div><h1>THE<br>IMPOSSIBILITY<br>FOUNDRY.</h1><p class="lead">One missing transport capability blocks two separate needs. Instead of pretending it exists, a bounded solver tries to <em>invent</em> it from declared materials, fabrication stages and independent towns.</p><aside><strong>AN EXECUTABLE WHAT-IF, NOT A REAL INVENTION.</strong> No physical cart, real materials, consent, transportation, safety validation, engineering proof, money or delivered lamps. The resource model is a deliberately fictional toy.</aside><div class="grid"><article class="box"><small>Without new capability</small><div class="count">${esc(report.baseline004.goalsMet)} / 3</div><p>Declared goal possibilities</p></article><article class="box"><small>With recursively constructed route</small><div class="count">${esc(report.sharedLedger005.goalsMet)} / 3</div><p>Declared goal possibilities</p></article><article class="box"><small>Additional conditional goals</small><div class="count">${esc(report.incrementalGoals===null?'?':report.incrementalGoals)}</div><p>Requires proposed invention</p></article></div><h2>How the missing organ would emerge</h2><div class="box"><p><b>Wheel blanks (Millford)</b> → fabricate one wheelset → move to Ovenham → combine with a frame → propose a cart-supported transport capability → transport working lamps → address two town needs.</p><p>This causal chain is not assumed. Every stage is a searched and consumed state transition.</p></div><h2>Break the invention</h2><p>Buttons display independently recomputed solver results, not hypothetical text replacements.</p><div>${Object.entries(views).map(([id,v])=>`<button data-case="${id}" aria-pressed="${id==='built'}">${esc(v.name)}</button>`).join('')}</div><div class="box" id="current" aria-live="polite"></div><h2>The chosen conditional proof chain</h2><ol>${cards}</ol><h2>Remaining real-world gates</h2><div class="grid"><section class="box"><h3>Owner consent</h3><p>Every relevant owner receives an unsent review question. All hypothetical acceptances remain HOLD.</p></section><section class="box"><h3>Engineering and safety</h3><p>No simulation establishes load rating, permits, safe routes, food handling, or transport feasibility.</p></section><section class="box"><h3>Reciprocal fairness</h3><p>No provider compensation, benefit distribution, or actual voluntary return is established.</p></section></div><footer>Offline read-only interactive specimen. Deterministic report digest: <code>${esc(report.hash)}</code>. ZERO real-world execution or media render.</footer></main><script>const views=${encode(views)};const box=document.getElementById('current');for(const b of document.querySelectorAll('button[data-case]'))b.addEventListener('click',()=>{for(const x of document.querySelectorAll('button[data-case]'))x.setAttribute('aria-pressed',String(b===x));const v=views[b.dataset.case],r=v.result;box.replaceChildren();const h=document.createElement('h3'),p=document.createElement('p'),l=document.createElement('ol');h.textContent=v.name;p.textContent=r.goalsMet+' / '+r.totalGoals+' conditional goals · '+r.status+' · '+r.search.explored+' explored states';for(const s of r.steps){const li=document.createElement('li');li.textContent=s.kind+' — '+s.id+' — '+s.owner;l.appendChild(li)}box.append(h,p,l)});document.querySelector('[data-case="built"]').click();</script></html>`;
}

export function demo(dir){
  const raw=fixture(),report=compileFoundry(raw,{ablateIds:['recipe-cart','wheel-stock','carrier-wheelset']});
  const clean=sanitizeFoundry(raw);
  const remove=id=>solveFoundry(sanitizeFoundry(removeOwnerOrId(raw,id),{allowNoRoute:true}));
  const controls={noCart:remove('recipe-cart'),noWheels:remove('wheel-stock'),noRoute:remove('carrier-wheelset')};
  const outputs={
    '01-invention-report.json':stringify(report)+'\n',
    '02-admitted-synthetic-input.json':stringify(clean)+'\n',
    '03-materials-and-dependencies.json':stringify(report.dependencyGraph)+'\n',
    '04-necessity-ablations.json':stringify(controls)+'\n',
    '05-unsent-owner-questions.json':stringify(report.generatedQuestions)+'\n',
    '06-source-owned-004-baseline.json':stringify(report.baseline004)+'\n',
    'index.html':html(report,controls)
  };
  mkdirSync(dir,{recursive:true});for(const [filename,body] of Object.entries(outputs))writeFileSync(join(dir,filename),body);
  const receipt={version:VERSION,source:'EXPERIMENTAL_LOCAL_SOFTWARE',files:Object.fromEntries(Object.entries(outputs).map(([n,b])=>[n,'sha256:'+hash(b)]))};
  writeFileSync(join(dir,'receipt.json'),stringify(receipt)+'\n');return receipt;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv[2]!=='demo'||!process.argv[3]){console.error('Usage: node foundry.mjs demo OUT_DIR');process.exitCode=2;}
  else console.log(JSON.stringify(demo(process.argv[3]),null,2));
}
