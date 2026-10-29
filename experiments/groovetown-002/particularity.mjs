// GROOVETOWN-002: evidence-bounded output compiler. Fictional/local software only.
// This is a CANNON adapter, not a native Garden/reLATTE/planZ/Toaster integration.
import {createHash} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {makeTown, progress, report, confirm, music} from '../groovetown-001/groovetown.mjs';

const VERSION = 'GROOVETOWN-002/v1';
const REQUIRED = ['source', 'handoff', 'window', 'transport', 'contact'];
const labels = {source:'source of supplies',handoff:'handoff destination',window:'delivery window',transport:'transport arrangement',contact:'permissioned contact route'};
const canon = x => JSON.stringify(order(x));
const order = x => Array.isArray(x) ? x.map(order) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k=>[k,order(x[k])])) : x;
const hash = x => createHash('sha256').update(typeof x === 'string' ? x : canon(x)).digest('hex');
const insist = (v, reason) => {if (!v) throw new Error(reason)};
const clean = s => { insist(typeof s === 'string' && s.trim() && s.length <= 240, 'invalid text'); return s.trim(); };
const textFrom = (facts, key) => facts[key]?.value ?? null;

export function validateFacts(facts) {
  insist(facts && typeof facts === 'object' && !Array.isArray(facts), 'invalid facts');
  for (const [key, f] of Object.entries(facts)) {
    insist(/^[a-z][a-z0-9-]{0,39}$/.test(key), 'invalid fact key');
    insist(f && typeof f === 'object' && !Array.isArray(f), 'invalid fact');
    insist(f.visibility === 'SHARE' || f.visibility === 'PRIVATE' || f.visibility === 'NO_USE', 'missing visibility');
    insist(f.evidence === 'SYNTHETIC' || f.evidence === 'REPORTED' || f.evidence === 'REVIEWED', 'missing evidence classification');
    clean(f.value); clean(f.sourceId);
  }
  return true;
}

// Only owner-marked SHARE facts may enter any outward-facing proposal.
export function publicFacts(facts) {
  validateFacts(facts);
  return Object.fromEntries(Object.entries(facts).filter(([,v]) => v.visibility === 'SHARE').map(([k,v])=>[k,{value:v.value,evidence:v.evidence,sourceId:v.sourceId}]));
}

export function compile({town, needId, facts, motif = 'neighborly, spacious, off-screen-first'}) {
  const state = progress(town)[needId];
  insist(state, 'unknown need');
  motif = clean(motif);
  const safeFacts = publicFacts(facts);
  const known = Object.fromEntries(REQUIRED.filter(k=>textFrom(safeFacts,k)).map(k=>[k,textFrom(safeFacts,k)]));
  const missing = REQUIRED.filter(k=>!known[k]);
  const open = state.remaining > 0;
  const specificity = {provided: REQUIRED.length-missing.length, possible:REQUIRED.length, missing:missing.map(k=>labels[k])};
  const sourceReceipt = Object.fromEntries(Object.entries(safeFacts).map(([k,v])=>[k,{sourceId:v.sourceId,evidence:v.evidence,digest:hash(v)}]));
  const actionable = open && missing.length === 0;
  const quantity = `${state.remaining} ${state.item}`;
  const actionTitle = !open ? `Close out ${state.item} request (already confirmed in THIS ledger)` : known.source && known.handoff ? `Coordinate ${quantity}: ${known.source} → ${known.handoff}` : `Find missing arrangements for ${quantity}`;
  const status = !open ? 'NO_OPEN_NEED' : actionable ? 'READY_FOR_HUMAN_REVIEW' : 'HOLD_MISSING_CONTEXT';
  const steps = !open ? ['Inspect receipt history before closing the request; never import external credit.'] : [
    known.contact ? `Ask through ${known.contact} whether the source can provide ${quantity}; do not publish or send automatically.` : 'Ask a steward for an approved way to contact the source.',
    known.window ? `Confirm the handoff is possible during ${known.window}.` : 'Determine an actual pickup and handoff window.',
    known.transport ? `Confirm ${known.transport} is available and appropriate before proposing travel.` : 'Identify a safe, available transport arrangement.',
    known.handoff ? `After consent, hand off to ${known.handoff}; record a report with original evidence.` : 'Identify a permissioned handoff destination.',
    'Have a separate authorized reviewer inspect the evidence; do not equate a report with confirmation.'
  ];
  const action = {kind:'WORK_ORDER',status,title:actionTitle,needId,remaining:state.remaining,quantity:state.item,
    whatChanges:`${state.remaining} units outstanding → independently confirmed count, if a real handoff later occurs`,
    known, missing:specificity.missing, steps, provenance:sourceReceipt,
    humanGates:['Consent before contact or public sharing','Human review before acting','Independent confirmation before credit'],
    automation:'HOLD',fieldEvidence:'NOT_OBTAINED', syntheticExample:true};
  const question = !open ? 'No further delivery needed in this town ledger; inspect its receipts.' : missing.length ? `Who can establish ${missing.map(k=>labels[k]).join(', ')} for ${quantity}?` : `Who will independently review a handoff of ${quantity} before the ledger is credited?`;
  const invitation = !open ? 'Do not send a new request; the local ledger already says complete.' : `UNSENT DRAFT — Can someone help arrange ${quantity}${known.handoff ? ` for ${known.handoff}` : ''}${known.window ? ` during ${known.window}` : ''}? ${missing.length ? `We still need ${missing.map(k=>labels[k]).join(', ')}.` : `Potential supply: ${known.source}. Transport: ${known.transport}.`} Reply voluntarily; no assignment or implied commitment.`;
  const progressState = music(town);
  const score = {kind:'CREATIVE_BRIEF',state:progressState.state,notes:progressState.notes,
    motif,subject:state.item,localScene:{source:known.source??null,handoff:known.handoff??null,window:known.window??null,transport:known.transport??null},visualRule:open ? `Represent ${state.remaining} unresolved ${state.item} as open spaces; no person depicted without consent.` : `Represent locally confirmed resolution of ${state.item}, with the fictional/synthetic evidence label intact.`,
    sourceFields:['needId','remaining','motif','source','handoff','window','transport'],nativeMediaRendered:false};
  const handoff = {kind:'HELD_CROSSING',localDecision:'HOLD',origin:town.id,needId,subject:state.item,remaining:state.remaining,
    sourceReceipt,publicFieldValues:known,privateDataIncluded:false,originEventsImportedAsDeeds:false};
  const outcome = {kind:'OUTCOME_CHECK',initialRemaining:state.remaining,measure:'independently confirmed units in local ledger',
    targetRemaining:0,actualExternalDelivery:'NOT_OBSERVED',timeSaved:'NOT_MEASURED',
    reopenWhen:'Human-approved event source or changed local need',fieldProofRequired:true};
  const result = {version:VERSION,origin:town.id,sourceLedgerHash:hash(town.ledger),status,specificity,
    action,question,invitation,score,handoff,outcome};
  return {...result, digest:hash(result)};
}

function htmlEscape(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
export function formatCard(p) {
  const c=p.action;
  const rows=c.steps.map(x=>`<li>${htmlEscape(x)}</li>`).join('');
  const fields=Object.entries(c.known).map(([key,value])=>`<dt>${htmlEscape(labels[key])}</dt><dd>${htmlEscape(value)}</dd>`).join('');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Groovetown 002 — Particularity</title><style>body{max-width:850px;margin:2rem auto;padding:1rem;background:#111b24;color:#f0eddb;font:16px/1.6 system-ui}article{padding:1.3rem;border:1px solid #567;border-radius:14px;background:#1e3037}h1{line-height:1.1}h2{color:#e8c17d}dt{font-weight:bold}dd{margin-bottom:1em}code{overflow-wrap:anywhere}aside{border-left:4px solid #d09e5c;padding:1rem;background:#29393e}</style><h1>Groovetown / Particularity</h1><p>FICTIONAL LOCAL PROOF · UNSENT · NO REAL-WORLD CONFIRMATION</p><article><h2>${htmlEscape(c.title)}</h2><p><strong>${htmlEscape(c.status)}</strong> · ${p.specificity.provided}/${p.specificity.possible} relevant facts supplied</p><dl>${fields}</dl><h3>What a volunteer could actually do, after review</h3><ol>${rows}</ol><h3>Missing evidence</h3><p>${htmlEscape(c.missing.join('; ') || 'No required planning fields missing; human review still required.')}</p><h3>One high-value question</h3><p>${htmlEscape(p.question)}</p></article><h2>Unsent invitation</h2><aside>${htmlEscape(p.invitation)}</aside><h2>Creative expression</h2><p>${htmlEscape(p.score.visualRule)}</p><p>Field result: NOT OBSERVED. Music: NOT RENDERED by this compiler. Crossing: HOLD.</p><small>Digest: <code>${p.digest}</code></small></html>`;
}

export function demo(outDir){
  const town=makeTown({name:'Lantern Town (FICTIONAL TEST)',needs:[{id:'bread',item:'loaves of bread',quantity:2}]});
  // Source labels and providers are fictional, not actual organizations or verified offers.
  const fixture={
    source:{value:'Lantern Bakery counter (fictional)',visibility:'SHARE',evidence:'SYNTHETIC',sourceId:'fake-supplier-card-1'},
    handoff:{value:'Lantern Community Table (fictional)',visibility:'SHARE',evidence:'SYNTHETIC',sourceId:'fake-table-card-2'},
    window:{value:'Saturday, 2:00–3:00 p.m. (fictional)',visibility:'SHARE',evidence:'SYNTHETIC',sourceId:'fake-window-card-3'},
    transport:{value:'on-foot volunteer, only after acceptance (fictional)',visibility:'SHARE',evidence:'SYNTHETIC',sourceId:'fake-transport-card-4'},
    contact:{value:'opt-in community message board (fictional)',visibility:'SHARE',evidence:'SYNTHETIC',sourceId:'fake-channel-card-5'},
    privatephone:{value:'555-011-9999 SENSITIVE TEST',visibility:'PRIVATE',evidence:'SYNTHETIC',sourceId:'fake-private-6'},
  };
  const complete=compile({town,needId:'bread',facts:fixture});
  const sparse=compile({town,needId:'bread',facts:{source:fixture.source,privatephone:fixture.privatephone}});
  const {town:pending,reportId}=report(town,{need:'bread',quantity:2,actor:'fake-baker'});
  const finished=confirm(pending,{reportId,witness:'fake-independent-person',accepted:true});
  const closed=compile({town:finished,needId:'bread',facts:fixture});
  const artifacts={
    '01-reviewable-work-order.json':canon(complete)+'\n',
    '02-missing-context-HOLD.json':canon(sparse)+'\n',
    '03-confirmed-local-need-closed.json':canon(closed)+'\n',
    '04-invitation-unsent.txt':complete.invitation+'\n',
    '05-field-brief.html':formatCard(complete),
    '06-field-slip.json':canon({type:'UNFILLED_REPORT_AND_CONFIRM_SLIP',needId:'bread',target:2,reporter:null,witness:null,originalEvidence:null,
      receivedCount:null,recipientConsent:null,confirmation:null,credit:'NONE',status:'HOLD'})+'\n',
  };
  mkdirSync(outDir,{recursive:true});
  for(const [name,body]of Object.entries(artifacts))writeFileSync(join(outDir,name),body);
  const receipt={version:VERSION,synthetic:true,files:Object.fromEntries(Object.entries(artifacts).map(([k,v])=>[k,'sha256:'+hash(v)]))};
  writeFileSync(join(outDir,'receipt.json'),canon(receipt)+'\n');
  return receipt;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv[2]!=='demo'||!process.argv[3]){console.error('Usage: node particularity.mjs demo OUTPUT_DIRECTORY');process.exitCode=2;}
  else console.log(JSON.stringify(demo(process.argv[3]),null,2));
}