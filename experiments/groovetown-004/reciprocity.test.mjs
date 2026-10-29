import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {compileReactor,demo,discoverMissingRoutes,fixture,hypotheticalMissingOrgan,negotiate,sanitizeReactor,solveReciprocity,html} from './reciprocity.mjs';

const copy=x=>structuredClone(x);
const challenge=()=>compileReactor(fixture());

test('two separately reserved material goals achievable in one shared ledger',()=>{
  const p=challenge();assert.equal(p.outcome.status,'ALL_GOALS_CONDITIONALLY_FEASIBLE');
  assert.equal(p.outcome.goalsMet,2);assert.deepEqual(p.beneficiaryTowns,['lantern','millford']);
  assert.ok(p.outcome.steps.filter(x=>x.kind==='GOAL').length===2);
  assert.ok(p.outcome.steps.some(x=>x.kind==='PROCESS'&&x.id==='oven-repair'));
  assert.ok(p.outcome.steps.some(x=>x.kind==='PROCESS'&&x.id==='oven-bread'));
  assert.equal(p.physicalCredits,0);assert.equal(p.executionAuthority,'HOLD_ALL');
});

test('real counterfactual missing specific route removes only one benefit',()=>{
  const s=fixture();const r=solveReciprocity(sanitizeReactor({...s,routes:s.routes.filter(x=>x.id!=='carrier-lamps')}));
  assert.equal(r.goalsMet,1);assert.equal(r.outcomes.find(x=>x.id==='bread-for-lantern').conditionallyFulfilled,true);
  assert.equal(r.outcomes.find(x=>x.id==='lamps-for-millford').conditionallyFulfilled,false);
});

test('missing organ is only conditional and proves exactly one additional goal under added route',()=>{
  const s=fixture();const r=hypotheticalMissingOrgan(s,{removeRouteId:'carrier-lamps',candidateRoute:s.routes.find(x=>x.id==='carrier-lamps')});
  assert.equal(r.newlyPossibleGoalCount,1);assert.equal(r.before.goalsMet,1);
  assert.equal(r.ifHypotheticallyAdded.goalsMet,2);
  assert.equal(r.proposedCapability.status,'NOT_OFFERED_NOT_VERIFIED');
});

test('with carrier absent, neither resource can reach the target',()=>{
  const s=fixture();const r=solveReciprocity(sanitizeReactor({...s,routes:s.routes.filter(x=>x.owner!=='bridgeport')}));
  assert.equal(r.goalsMet,0);
});

test('tiny inventory cannot be double-spent on two distinct needs',()=>{
  const s=fixture();s.goals=[{id:'g1',town:'millford',resource:'flour',unit:'kg',quantity:6,needId:'flour-one',displayItem:'flour'},
    {id:'g2',town:'millford',resource:'flour',unit:'kg',quantity:6,needId:'flour-two',displayItem:'flour'}];
  const r=solveReciprocity(sanitizeReactor(s));
  assert.equal(r.goalsMet,1);assert.equal(r.outcomes.filter(x=>x.conditionallyFulfilled).length,1);
});

test('aggregate capacity enforced, reducing flour below 6 forbids full bread goal',()=>{
  const s=fixture();s.supplies[0].quantity=5;
  const r=solveReciprocity(sanitizeReactor(s));
  assert.equal(r.outcomes.find(x=>x.id==='bread-for-lantern').conditionallyFulfilled,false);
});

test('wrong unit on transport does not invent a compatible route',()=>{
  const s=fixture();s.routes.find(x=>x.id==='carrier-lamps').unit='kg';
  const r=solveReciprocity(sanitizeReactor(s));
  assert.equal(r.goalsMet,1);
});

test('private/NO_USE sources cannot change digest or user-visible outputs',()=>{
  const s=fixture();const baseline=compileReactor(s);
  s.supplies.push({id:'private-lamps',owner:'millford',sourceId:'secret-quantity',visibility:'PRIVATE',evidence:'SYNTHETIC',authority:'PROPOSAL_ONLY',at:'millford',resource:'working-lamp',unit:'piece',quantity:900});
  s.routes.push({id:'no-use-route',owner:'bridgeport',sourceId:'very-secret',visibility:'NO_USE',evidence:'SYNTHETIC',authority:'PROPOSAL_ONLY',from:'lantern',to:'millford',resource:'working-lamp',unit:'piece',capacity:900});
  const altered=compileReactor(s);
  assert.equal(altered.hash,baseline.hash);assert.ok(!JSON.stringify(altered).includes('secret-quantity'));
});

test('no fabricated completion or credit even with every synthetic YES',()=>{
  const p=challenge();const votes=Object.fromEntries(p.owners.map(t=>[t,'YES']));
  const v=negotiate(p,votes);assert.equal(v.status,'ALL_SYNTHETIC_YES_FIELD_HOLD');assert.equal(v.physicalCredits,0);
  assert.equal(v.authority,'NO_REAL_WORLD_COMMITMENT');
});

test('independent refusal stops unanimous status',()=>{
  const p=challenge();assert.equal(negotiate(p,{bridgeport:'NO'}).status,'REFUSED');
  assert.equal(negotiate(p,{bridgeport:'HOLD'}).status,'HOLD');
  assert.equal(negotiate(p,{}).status,'AWAITING_PARTNER_VOTES');
  assert.throws(()=>negotiate(p,{stranger:'YES'}),/invalid local decision/);
});

test('forged packet receipt is rejected before voting',()=>{
  const p=challenge();p.ownerInvitations[0].question='I secretly agree';
  assert.throws(()=>negotiate(p,{}),/plan receipt changed/);
});

test('owner benefits are not assumed just because they contributed',()=>{
  const p=challenge();assert.ok(p.distribution.participantsWithoutModeledBenefit.includes('bridgeport'));
  assert.ok(p.distribution.participantsWithoutModeledBenefit.includes('ovenham'));
  assert.equal(p.distribution.equity,'NOT_ESTABLISHED');assert.equal(p.distribution.allPartyNetBenefit,'NOT_PROVEN');
  for(const i of p.ownerInvitations)assert.equal(i.status,'UNSENT_HOLD');
});

test('Particularity compiler actually runs for both recipients and holds missing context',()=>{
  const p=challenge();assert.equal(p.localPurpose.length,2);
  for(const v of p.localPurpose){assert.ok(v.compiled?.specificity?.missing?.length);assert.notEqual(v.compiled.status,'READY_TO_EXECUTE');}
});

test('requires honestly declared hypothetical, not a silently injected real offer',()=>{
  const s=fixture();const hypothesis=copy(s.routes.find(x=>x.id==='carrier-lamps'));
  hypothesis.visibility='PRIVATE';
  assert.throws(()=>hypotheticalMissingOrgan(s,{removeRouteId:'carrier-lamps',candidateRoute:hypothesis}),/hypothesis not explicitly declared/);
});

test('strict foreign goal identifiers and duplicate goal names rejected',()=>{
  const s=fixture();s.goals.push(copy(s.goals[0]));
  assert.throws(()=>sanitizeReactor(s),/duplicate goal id/);
  const t=fixture();t.goals[0].town='imaginary';assert.throws(()=>sanitizeReactor(t),/goal town unknown/);
});

test('hard computation budget never pretends to establish infeasibility',()=>{
  const r=solveReciprocity(sanitizeReactor(fixture()),{maxStates:1});
  assert.equal(r.status,'SEARCH_LIMIT_INCONCLUSIVE');assert.equal(r.search.exhaustive,false);
});

test('HTML escapes public town names, no external resources, does not pretend media rendered',()=>{
  const p=challenge(),s=fixture();s.towns[0].name='<script>boom</script>';
  const changed=compileReactor(s);
  const gap=hypotheticalMissingOrgan(fixture(),{removeRouteId:'carrier-lamps',candidateRoute:fixture().routes.find(x=>x.id==='carrier-lamps')});
  const view=html(changed,gap,{noLamp:p.outcome,noCarrier:p.outcome});
  assert.ok(view.includes('&lt;script&gt;boom&lt;/script&gt;'));
  assert.ok(!view.includes('<script>boom</script>'));
  assert.ok(!view.includes('https://'));
});

test('deterministic independent cold builds, receipt exact output hashes',()=>{
  const a=mkdtempSync(join(tmpdir(),'reactor-a-')),b=mkdtempSync(join(tmpdir(),'reactor-b-'));
  try{
    assert.deepEqual(demo(a),demo(b));
    const files=readdirSync(a).sort();assert.deepEqual(files,readdirSync(b).sort());
    for(const f of files)assert.deepEqual(readFileSync(join(a,f)),readFileSync(join(b,f)));
  }finally{rmSync(a,{recursive:true,force:true});rmSync(b,{recursive:true,force:true});}
});


test('missing route is inferred from typed process output, not hardcoded missing ID',()=>{
  const s=fixture();s.routes=s.routes.filter(x=>x.id!=='carrier-lamps');
  const found=discoverMissingRoutes(s);
  assert.equal(found.status,'CANDIDATE_GAPS_UNVERIFIED');
  const candidate=found.candidates.find(x=>x.candidate.from==='ovenham'&&x.candidate.to==='millford'&&x.candidate.resource==='working-lamp');
  assert.ok(candidate);assert.equal(candidate.incrementalGoals,1);
  assert.equal(candidate.availableCustodian,'NOT_VERIFIED');
  assert.equal(candidate.candidate.authority,'PROPOSAL_ONLY');
});

test('inferred missing routes never consume private supplies as visible evidence',()=>{
  const s=fixture();s.routes=s.routes.filter(x=>x.id!=='carrier-lamps');
  s.supplies.push({id:'hidden-lamps',owner:'lantern',sourceId:'secret-lamps',visibility:'PRIVATE',evidence:'SYNTHETIC',authority:'PROPOSAL_ONLY',at:'ovenham',resource:'working-lamp',unit:'piece',quantity:2});
  const found=discoverMissingRoutes(s);
  assert.ok(!JSON.stringify(found).includes('secret-lamps'));
});
