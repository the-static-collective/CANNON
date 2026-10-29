// GROOVETOWN-006 — source-owned bounded invention portfolio core.
// Synthetic fixture only; never dispatches, validates engineering or grants consent.
import {fixture as previous,sanitizeFoundry,solveFoundry} from '../groovetown-005/foundry.mjs';
import {pathToFileURL} from 'node:url';
export const VERSION='GROOVETOWN-006/core-v1';
const p=(id,props)=>({id,owner:'ovenham',at:'ovenham',sourceId:'hypothetical-'+id,evidence:'SYNTHETIC',visibility:'SHARE',authority:'PROPOSAL_ONLY',maxRuns:1,...props});
const route=(id,to,capacity)=>({id,owner:'bridgeport',sourceId:'hypothetical-'+id,evidence:'SYNTHETIC',visibility:'SHARE',authority:'PROPOSAL_ONLY',from:'ovenham',to,resource:'working-lamp',unit:'piece',capacity});
export function fixture(){
 const x=previous();
 x.goals.push({id:'lantern-repair-return',town:'lantern',resource:'working-lamp',unit:'piece',quantity:1,needId:'return-lamp',displayItem:'repaired lamp'});
 x.supplies.find(v=>v.id==='lantern-broken-lamps').quantity=4;
 x.processes.find(v=>v.id==='oven-repair').maxRuns=4;
 x.routes.find(v=>v.id==='carrier-broken').capacity=4;
 const platform=x.recipes.find(v=>v.id==='recipe-cart');
 platform.id='recipe-platform';platform.sourceId='hypothesis-shared-platform';
 platform.output={kind:'MATERIAL',resource:'dispatch-slot',unit:'token',quantity:2};
 x.recipes.push(p('recipe-outbound',{inputs:[{resource:'dispatch-slot',unit:'token',quantity:1}],output:{kind:'ROUTE',route:route('invented-lamp-route','millford',3)}}));
 x.recipes.push(p('recipe-return',{inputs:[{resource:'dispatch-slot',unit:'token',quantity:1}],output:{kind:'ROUTE',route:route('invented-return-route','lantern',1)}}));
 return x;
}
export function compare(raw=fixture(),{maxStates=65000,maxDepth=25}={}){
 if(!Number.isSafeInteger(maxStates)||maxStates<1||maxStates>100000)throw Error('invalid state budget');
 const admitted=sanitizeFoundry(raw,{allowNoRoute:true});
 const ids=admitted.recipes.filter(x=>x.output.kind==='ROUTE').map(x=>x.id).sort();
 if(ids.length<1||ids.length>3)throw Error('bounded to 1-3 proposed routes');
 const results=[];
 for(let mask=0;mask<2**ids.length;mask++){
  const allowed=ids.filter((_,i)=>mask&(1<<i));
  const scoped={...raw,recipes:raw.recipes.filter(x=>x.output?.kind!=='ROUTE'||allowed.includes(x.id))};
  const model=sanitizeFoundry(scoped,{allowNoRoute:true});
  const result=solveFoundry(model,{maxStates,maxDepth});
  results.push({ids:allowed,goals:result.goalsMet,status:result.status,
   steps:result.steps,activatedRoutes:result.activatedHypotheticalRoutes,search:result.search});
 }
 const conclusive=results.every(r=>r.status!=='SEARCH_LIMIT_INCONCLUSIVE');
 const strongestSingle=Math.max(0,...results.filter(r=>r.ids.length===1).map(r=>r.goals));
 const complete=results.at(-1);
 return {version:VERSION,synthetic:true,authority:'HOLD_NO_OPERATIONS',physicalCredits:0,
  portfolios:results,conclusive,extraBeyondStrongestSingle:conclusive?complete.goals-strongestSingle:null,
  disclaimer:'Model feasibility only; no evidence of engineering, real inventory, consent or fair returns.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(compare(),null,2));
