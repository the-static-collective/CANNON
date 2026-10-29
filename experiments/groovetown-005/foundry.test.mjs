import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {compileFoundry,demo,dependencyGraph,fixture,html,sanitizeFoundry,solveFoundry} from './foundry.mjs';
import {solveReciprocity} from '../groovetown-004/reciprocity.mjs';
const cp=x=>structuredClone(x);
const no=(f,pr)=>pr.filter(x=>x.id!==f);

// The original 004 solver MUST remain an independent baseline oracle.
test('native 004 baseline finds only one of three goals without invented route',()=>{
  const s=sanitizeFoundry(fixture()),r=solveReciprocity(s.base,{maxDepth:22,maxStates:50000});
  assert.equal(r.goalsMet,1);assert.equal(r.search.exhaustive,true);
  assert.equal(r.outcomes.find(x=>x.id==='bread-for-lantern').conditionallyFulfilled,true);
});

test('a two-tier material invention + transport + capacity grant unlocks two extra needs',()=>{
  const r=compileFoundry(fixture());assert.equal(r.sharedLedger005.goalsMet,3);
  assert.equal(r.baseline004.goalsMet,1);assert.equal(r.incrementalGoals,2);
  assert.equal(r.sharedLedger005.activatedHypotheticalRoutes.length,1);
  assert.equal(r.authority,'HOLD_NO_AUTOMATIC_CREATION_OR_DISPATCH');assert.equal(r.physicalCredits,0);
});

test('the chosen causal proof actually consumes inputs before activating a route',()=>{
  const r=solveFoundry(sanitizeFoundry(fixture()));const steps=r.steps;
  const wheels=steps.findIndex(s=>s.id==='recipe-wheels');
  const move=steps.findIndex(s=>s.id==='carrier-wheelset');
  const cart=steps.findIndex(s=>s.id==='recipe-cart');
  const invented=steps.findIndex(s=>s.id==='invented-lamp-route');
  assert.ok(wheels>=0&&move>wheels&&cart>move&&invented>cart);
  assert.ok(steps.some(s=>s.kind==='GOAL'&&s.id==='desk-lamp-millford'));
  assert.ok(steps.some(s=>s.kind==='GOAL'&&s.id==='lamps-for-millford'));
});

test('removing assembly, source parts, or transport independently removes the two unlocks',()=>{
  const raw=fixture();
  for(const remove of ['recipe-cart','wheel-stock','carrier-wheelset']){
    const changed=cp(raw);changed.recipes=no(remove,changed.recipes);changed.supplies=no(remove,changed.supplies);changed.routes=no(remove,changed.routes);
    const r=solveFoundry(sanitizeFoundry(changed,{allowNoRoute:true}));
    assert.equal(r.goalsMet,1,`unexpected extra goal with ${remove} missing`);
    assert.equal(r.search.exhaustive,true);
  }
});

test('each material quantity is consumed only once; an incomplete wheelset cannot be invented',()=>{
  const s=fixture();s.supplies.find(x=>x.id==='wheel-stock').quantity=1;
  const r=solveFoundry(sanitizeFoundry(s));assert.equal(r.goalsMet,1);
  assert.ok(!r.steps.some(x=>x.id==='recipe-cart'));
});

test('source process or route capacity limits prevent convenience fabrication',()=>{
  const s=fixture();s.routes.find(x=>x.id==='carrier-wheelset').capacity=1;
  s.routes.find(x=>x.id==='carrier-wheelset').unit='piece';
  assert.equal(solveFoundry(sanitizeFoundry(s)).goalsMet,1);
});

test('invented route must match a missing shape independently inferred by original 004 owner',()=>{
  const s=fixture();s.recipes.find(x=>x.id==='recipe-cart').output.route.to='lantern';
  assert.throws(()=>sanitizeFoundry(s),/not independently identified/);
});

test('unbacked supernatural grants and zero-input inventions are refused',()=>{
  const s=fixture();s.recipes.find(x=>x.id==='recipe-cart').inputs=[];
  assert.throws(()=>sanitizeFoundry(s),/requires 1–4 actual inputs/);
  const t=fixture();t.recipes.find(x=>x.id==='recipe-cart').output.route.authority='EXECUTE';
  assert.throws(()=>sanitizeFoundry(t),/not authorized as a real capability/);
});

test('privacy restricted raw sources and recipes cannot alter published model digest',()=>{
  const s=fixture(),base=sanitizeFoundry(s);
  s.supplies.push({id:'hidden-stock',owner:'millford',at:'millford',resource:'wheel-blank',unit:'piece',quantity:800,
    sourceId:'secret-inventory',evidence:'SYNTHETIC',visibility:'PRIVATE',authority:'PROPOSAL_ONLY'});
  s.recipes.push({id:'hidden-recipe',owner:'millford',at:'millford',sourceId:'secret-method',
    evidence:'SYNTHETIC',visibility:'PRIVATE',authority:'PROPOSAL_ONLY',maxRuns:1,inputs:[],output:{kind:'ROUTE'}});
  const changed=sanitizeFoundry(s);
  assert.deepEqual(changed,base);
  assert.ok(!JSON.stringify(changed).includes('secret-'));
});

test('duplicate recipe identifiers and foreign owner are rejected',()=>{
  const s=fixture();s.recipes.push(cp(s.recipes[0]));assert.throws(()=>sanitizeFoundry(s),/duplicate recipe id/);
  const t=fixture();t.recipes[0].owner='nowhere';assert.throws(()=>sanitizeFoundry(t),/foreign town/);
});

test('graph identifies both production dependencies and does not claim engineering validity',()=>{
  const graph=dependencyGraph(sanitizeFoundry(fixture()));
  const cart=graph.nodes.find(x=>x.id==='recipe-cart');
  assert.ok(cart.needs.find(x=>x.item.resource==='wheelset').possibleProducerRecipeIds.includes('recipe-wheels'));
  assert.match(graph.warning,/not availability/);
});

test('cycles in a recipe dependency explanation are detected without fabricating inputs',()=>{
  const s=fixture();s.recipes[0].inputs=[{resource:'wheelset',unit:'set',quantity:1}];
  const m=sanitizeFoundry(s);const graph=dependencyGraph(m);
  assert.ok(graph.cycles.length>0);
  const r=solveFoundry(m);assert.equal(r.goalsMet,1);
});

test('hard search budget yields INCONCLUSIVE rather than an impossibility claim',()=>{
  const r=solveFoundry(sanitizeFoundry(fixture()),{maxStates:1});
  assert.equal(r.status,'SEARCH_LIMIT_INCONCLUSIVE');assert.equal(r.search.saturated,true);
});

test('depth limit yields INCONCLUSIVE rather than false negative',()=>{
  const r=solveFoundry(sanitizeFoundry(fixture()),{maxDepth:1});
  assert.equal(r.status,'SEARCH_LIMIT_INCONCLUSIVE');assert.equal(r.search.depthTruncated,true);
});

test('real-world decisions, compensation, credit and generated audio never inferred',()=>{
  const r=compileFoundry(fixture());
  assert.ok(r.generatedQuestions.every(x=>x.status!=='SENT'));
  assert.equal(r.creativeBrief.soundFiles,0);
  assert.equal(r.fairness,'NOT_ESTABLISHED');assert.equal(r.valueClaims,'UNMEASURED');
  assert.equal(r.physicalCredits,0);
});

test('display escapes untrusted material labels and never fetches external data',()=>{
  const r=compileFoundry(fixture()),simple={noCart:r.sharedLedger005,noWheels:r.sharedLedger005,noRoute:r.sharedLedger005};
  const view=html(r,simple);
  assert.ok(view.includes('ZERO real-world execution'));
  assert.ok(!view.includes('https://'));assert.ok(!view.includes('fetch('));
  const marker='<img src=x onerror=alert(1)>';
  const t=cp(r);t.sharedLedger005.steps[0].sourceId=marker;
  const contaminated=html(t,simple);
  assert.ok(contaminated.includes('&lt;img'));assert.ok(!contaminated.includes(marker));
});

test('independently invoked builds retain byte-identical receipts and all output files',()=>{
  const a=mkdtempSync(join(tmpdir(),'foundry-a-')),b=mkdtempSync(join(tmpdir(),'foundry-b-'));
  try{
    assert.deepEqual(demo(a),demo(b));const files=readdirSync(a).sort();
    assert.deepEqual(files,readdirSync(b).sort());
    for(const f of files)assert.deepEqual(readFileSync(join(a,f)),readFileSync(join(b,f)));
  }finally{rmSync(a,{recursive:true,force:true});rmSync(b,{recursive:true,force:true});}
});
