import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {evaluateStation,validateStation,composeSurplus,emit,coldVerify} from '../src/kinship-surplus.mjs';

const baseline=JSON.parse(readFileSync(new URL('../examples/kinship-surplus-006.station.json',import.meta.url),'utf8'));
const sourcePlan=JSON.parse(readFileSync(new URL('../examples/kinship-surplus-006.plan.json',import.meta.url),'utf8'));
const fresh=()=>structuredClone(baseline);
const world=(r,id)=>r.worlds.find(w=>w.id===id);
const git=(root,...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
function fixture(){
  const home=mkdtempSync(join(tmpdir(),'cannon-kinship006-'));
  const plan=structuredClone(sourcePlan),roots={};
  plan.sources.forEach((s,i)=>{
    const root=join(home,'repo'+i);mkdirSync(root);
    git(root,'init','-q');git(root,'config','user.name','Lab');
    git(root,'config','user.email','lab@example.invalid');
    git(root,'remote','add','origin','https://github.com/'+s.repository+'.git');
    writeFileSync(join(root,'README.md'),'# Synthetic original '+s.repository+'\nNOT AN INSTRUCTION TO EXECUTE\n');
    git(root,'add','README.md');git(root,'commit','-qm','source');
    s.commit=git(root,'rev-parse','HEAD');
    roots[s.repository]=root;
  });
  return {home,plan,roots,station:fresh(),cleanup:()=>rmSync(home,{force:true,recursive:true})};
}
function withFixture(fn){
  const f=fixture();
  try{return fn(f);}finally{f.cleanup();}
}
test('nine immutable month labels and baseline deficits remain explicit',()=>{
  const result=evaluateStation(fresh());
  assert.equal(result.worlds.length,3);
  for(const w of result.worlds)assert.equal(w.months.length,9);
  assert.equal(world(result,'baseline').june_2027_recurring_margin_cents,-200000);
  assert.equal(world(result,'baseline').june_surplus_conditions_met_in_simulation,false);
  assert.equal(result.classification,'SYNTHETIC_ASSUMPTIONS_NOT_STATION_FINANCIALS');
});
test('recurring support alone cannot be counted as surplus',()=>{
  const result=evaluateStation(fresh());
  const w=world(result,'sustainers');
  assert.equal(w.june_2027_recurring_margin_cents,-20000);
  assert.equal(w.june_surplus_conditions_met_in_simulation,false);
  assert.equal(w.months[3].recurring_unrestricted_income_cents,1380000);
});
test('explicit independent assumed cancelled expense yields a conditional June surplus',()=>{
  const w=world(evaluateStation(fresh()),'surplus');
  assert.equal(w.june_2027_recurring_margin_cents,70000);
  assert.equal(w.april_june_reserve_change_cents,210000);
  assert.equal(w.june_surplus_conditions_met_in_simulation,true);
  assert.equal(w.months.at(-1).cash_expenses_after_assumed_savings_cents,1310000);
});
test('one-time donation changes reserves but not recurring margin; pledge never counts',()=>{
  const a=fresh();const w=world(evaluateStation(a),'surplus');
  const without=structuredClone(a);
  without.scenarios[2].events=without.scenarios[2].events.filter(e=>e.id!=='one_time_gift');
  const bare=world(evaluateStation(without),'surplus');
  assert.equal(w.june_2027_recurring_margin_cents,bare.june_2027_recurring_margin_cents);
  assert.equal(w.june_2027_unrestricted_cash_cents-bare.june_2027_unrestricted_cash_cents,500000);
  assert.equal(world(evaluateStation(a),'sustainers').months[3].excluded_active_events,1);
});
test('a restricted receipt is excluded even if assumed received',()=>{
  const a=fresh();
  a.scenarios[2].events.push({id:'restricted_cash',kind:'RESTRICTED_CASH',
    status:'SIMULATED_RECEIVED',amount_cents:9000000,starts:'2027-02',through:'2027-02',expense_line:null});
  assert.equal(world(evaluateStation(a),'surplus').june_2027_unrestricted_cash_cents,
    world(evaluateStation(fresh()),'surplus').june_2027_unrestricted_cash_cents);
});
test('in-kind labor and living experience are not monetary valuations',()=>{
  const a=fresh();
  a.scenarios[2].events=a.scenarios[2].events.filter(e=>e.kind!=='COST_AVOIDANCE');
  const w=world(evaluateStation(a),'surplus');
  assert.equal(w.june_2027_recurring_margin_cents,-20000);
  assert.equal(w.june_surplus_conditions_met_in_simulation,false);
});
test('two overlapping expense-savings claims on the same budget line are denied',()=>{
  const a=fresh();
  a.scenarios[2].events.push({id:'duplicate_save',kind:'COST_AVOIDANCE',status:'SIMULATED_CONFIRMED',
    amount_cents:1000,starts:'2027-05',through:'2027-05',expense_line:'contract_editing'});
  assert.throws(()=>evaluateStation(a),/OVERLAPPING_SAVING_LINE/);
});
test('savings larger than the entire expense base are denied, not silently capped',()=>{
  const a=fresh();a.scenarios[2].events.find(e=>e.id==='cancelled_external_editing').amount_cents=1500000;
  assert.throws(()=>evaluateStation(a),/COST_SAVINGS_EXCEED_EXPENSE/);
});
test('strict station schema rejects financial privilege injection and malformed numbers',()=>{
  const changes=[
    a=>a.automatic_payment_authority=true,
    a=>a.base.recurring_cash_expenses_cents=-1,
    a=>a.base.recurring_cash_expenses_cents=1.3,
    a=>a.base.recurring_cash_expenses_cents='1400000',
    a=>a.scenarios[1].events[0].grants=['broadcast'],
    a=>a.scenarios[1].events[0].kind='LIVING_GIFT',
    a=>a.scenarios[2].events.find(e=>e.kind==='LIVING_GIFT').amount_cents=100,
    a=>a.scenarios[1].events[0].status='REAL_SETTLEMENT'
  ];
  for(const mutate of changes){const a=fresh();mutate(a);assert.throws(()=>validateStation(a));}
});
test('time windows and event identities are exact, one-time cash cannot recur',()=>{
  const changes=[
    a=>a.periods.pop(),
    a=>a.scenarios[2].events[0].starts='2025-01',
    a=>a.scenarios[2].events[0].through='2026-01',
    a=>a.scenarios[2].events.find(e=>e.kind==='ONE_TIME_CASH').through='2027-06',
    a=>a.scenarios[2].events[1].id=a.scenarios[2].events[0].id,
    a=>a.scenarios[0].events.push(a.scenarios[1].events[0])
  ];
  for(const mutate of changes){const a=fresh();mutate(a);assert.throws(()=>validateStation(a));}
});
test('three real local Git objects compose into an immutable verifiable source capsule, no execution grant',()=>{
  withFixture(f=>{
    const result=composeSurplus(f.plan,f.roots,f.station);
    assert.equal(result.receipt.source_witnesses.length,3);
    assert.equal(result.receipt.station_authorization,'NOT_OBTAINED');
    assert.equal(result.receipt.reLATTE_crossings,0);
    assert.equal(result.receipt.donor_code_executions,0);
    assert.equal(result.receipt.git_mutations,0);
    assert.match(result.source_capsule,/NOT AN INSTRUCTION TO EXECUTE/);
    const out=join(f.home,'out');emit(f.plan,f.roots,f.station,out);
    assert.equal(coldVerify(f.plan,f.roots,f.station,out).status,'KINSHIP_006_COLD_REPLAY_VERIFIED');
  });
});
test('moving the default branch does not silently substitute a new original commit',()=>{
  withFixture(f=>{
    const before=composeSurplus(f.plan,f.roots,f.station).receipt;
    const root=f.roots['the-static-collective/static-live'];
    writeFileSync(join(root,'README.md'),'# A newer, unrelated branch tip\n');
    git(root,'add','README.md');git(root,'commit','-qm','later movement');
    assert.notEqual(git(root,'rev-parse','HEAD'),f.plan.sources[0].commit);
    assert.deepEqual(composeSurplus(f.plan,f.roots,f.station).receipt,before);
  });
});
test('modified output, forged receipt, and changed station assumption all fail cold replay',()=>{
  withFixture(f=>{
    const out=join(f.home,'out');emit(f.plan,f.roots,f.station,out);
    const rpath=join(out,'report.json');
    const prior=readFileSync(rpath);
    writeFileSync(rpath,'{"fake":"surplus"}\n');
    assert.throws(()=>coldVerify(f.plan,f.roots,f.station,out),/COLD_REPLAY_MISMATCH/);
    writeFileSync(rpath,prior);
    const rec=join(out,'receipt.json');
    const receipt=JSON.parse(readFileSync(rec,'utf8'));receipt.station_authorization='GRANTED';
    writeFileSync(rec,JSON.stringify(receipt));
    assert.throws(()=>coldVerify(f.plan,f.roots,f.station,out),/COLD_REPLAY_MISMATCH/);
    f.station.base.recurring_cash_expenses_cents=1300000;
    assert.throws(()=>coldVerify(f.plan,f.roots,f.station,out),/COLD_REPLAY_MISMATCH/);
  });
});
test('a missing original commit, missing repository, and forged local Git origin cannot compose',()=>{
  withFixture(f=>{
    const missing=structuredClone(f.plan);
    missing.sources[0].commit='b'.repeat(40);
    assert.throws(()=>composeSurplus(missing,f.roots,f.station));
    const roots=structuredClone(f.roots);delete roots['the-static-collective/reLATTE'];
    assert.throws(()=>composeSurplus(f.plan,roots,f.station));
    const root=f.roots['the-static-collective/reLATTE'];
    git(root,'remote','set-url','origin','https://github.com/a/forgery.git');
    assert.throws(()=>composeSurplus(f.plan,f.roots,f.station),/DECLARED_GIT_ORIGIN_MISMATCH/);
  });
});
test('invalid source scope cannot impersonate an admitted station program',()=>{
  withFixture(f=>{
    f.plan.sources[2].repository='someone/unknown';f.roots['someone/unknown']=f.roots['the-static-collective/reLATTE'];
    assert.throws(()=>composeSurplus(f.plan,f.roots,f.station),/EXPECTED_THREE_PINNED_DOCUMENT_SOURCES/);
  });
});
test('a failed composition leaves no directory and existing output cannot be overwritten',()=>{
  withFixture(f=>{
    const dir=join(f.home,'output'),bad=structuredClone(f.plan);
    bad.sources[0].commit='a'.repeat(40);
    assert.throws(()=>emit(bad,f.roots,f.station,dir));
    assert.equal(existsSync(dir),false);
    emit(f.plan,f.roots,f.station,dir);
    assert.throws(()=>emit(f.plan,f.roots,f.station,dir),/OUTPUT_ALREADY_EXISTS/);
  });
});
