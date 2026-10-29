// Read-only, source-owned crossing to original CANNON GROOVETOWN-006 core.
// This does not authenticate a real-world rail route or confer field authority.
import {compare, VERSION as SOURCE_VERSION} from '../groovetown-006/ecosystem-core.mjs';
import {VERSION as GAME_VERSION} from './game.mjs';
export function inventionSideQuest(){
 const report=compare();
 const none=report.portfolios.find(x=>x.ids.length===0);
 const pair=report.portfolios.find(x=>x.ids.length===2);
 const status=report.conclusive&&none&&pair?'HYPOTHETICAL_SIDE_QUEST':'HOLD_INCONCLUSIVE';
 return {schema:'reality2-railway-sidequest-v1',sourceOwner:SOURCE_VERSION,host:GAME_VERSION,
  status,sourceEvidence:'SYNTHETIC_COMPUTED',
  banner:'THE TWO-TICKET PROBLEM',
  question:'Could one shared workshop platform open two separate delivery routes?',
  baselineConditionallyFeasible:none?.goals??null,
  combinedConditionallyFeasible:pair?.goals??null,
  additionalBeyondStrongestSingle:report.extraBeyondStrongestSingle,
  invite:'Discuss which shared capability could unblock multiple routes. This is an optional game conversation, not a physical planning authorization.',
  limits:['The base and completed runs come from original CANNON 006 compare().','This party game does not modify the CANNON solver.','No field claims, real material stock, game permissions, or physical actions cross.']};
}
if(process.argv[1]?.endsWith('/bridge.mjs')) console.log(JSON.stringify(inventionSideQuest(),null,2));
