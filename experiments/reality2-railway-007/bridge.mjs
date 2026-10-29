// Optional read-only crossing to CANNON-006: fail closed if its exact ancestry is absent.
// A missing source owner must never be silently replaced with a fabricated computation.
import {VERSION as GAME_VERSION} from './game.mjs';
export async function inventionSideQuest(){
  const base={schema:'reality2-railway-sidequest-v1',host:GAME_VERSION,banner:'THE TWO-TICKET PROBLEM',
    question:'Could one shared workshop platform open two separate delivery routes?',
    invite:'Discuss which shared capability could unblock multiple routes. This is optional game talk, not an authorized physical plan.',
    sourceEvidence:'NOT_YET_ATTESTED',
    limits:['No game consent or physical deed crosses.','No automatic outreach, NFT mint, manufacture or field execution.']};
  let native;
  try{ native=await import('../groovetown-006/ecosystem-core.mjs'); }
  catch(error){
    if(error?.code==='ERR_MODULE_NOT_FOUND' && /groovetown-005\/foundry\.mjs|groovetown-006\/ecosystem-core\.mjs/.test(String(error.message))){
      return {...base,status:'HOLD_SOURCE_ANCESTRY_MISSING',sourceOwner:'CANNON-GROOVETOWN-006 (unavailable exact dependency)',
       baselineConditionallyFeasible:null,combinedConditionallyFeasible:null,additionalBeyondStrongestSingle:null};
    }
    throw error;
  }
  const report=native.compare();
  const none=report.portfolios.find(x=>x.ids.length===0);
  const pair=report.portfolios.find(x=>x.ids.length===2);
  if(!report.conclusive||!none||!pair)return {...base,status:'HOLD_INCONCLUSIVE',sourceOwner:native.VERSION,
    baselineConditionallyFeasible:null,combinedConditionallyFeasible:null,additionalBeyondStrongestSingle:null};
  return {...base,status:'HYPOTHETICAL_SIDE_QUEST',sourceOwner:native.VERSION,sourceEvidence:'SYNTHETIC_COMPUTED',
    baselineConditionallyFeasible:none.goals,combinedConditionallyFeasible:pair.goals,
    additionalBeyondStrongestSingle:report.extraBeyondStrongestSingle};
}
if(process.argv[1]?.endsWith('/bridge.mjs'))console.log(JSON.stringify(await inventionSideQuest(),null,2));
