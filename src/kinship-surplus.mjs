/** KINSHIP SURPLUS 006 — public synthetic financial worlds over exact CANNON 003 source receipts.
 * No donor code is run; no rights, station authority, or reLATTE crossing are granted.
 */
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {compose as composeSources} from './present-use.mjs';

export const STATION_SCHEMA='cannon.kinship-station-simulation/v0';
export const REPORT_SCHEMA='cannon.kinship-surplus-report/v0';
const fail=(ok,why)=>{if(!ok)throw Error(why);};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const exact=(x,ks)=>obj(x)&&Object.keys(x).sort().join('|')===[...ks].sort().join('|');
const money=x=>Number.isSafeInteger(x)&&x>=0&&x<=100_000_000_000;
const sha=x=>'sha256:'+createHash('sha256').update(x).digest('hex');
function canonical(x){
  if(x===null||typeof x==='string'||typeof x==='boolean')return JSON.stringify(x);
  if(typeof x==='number'){fail(Number.isSafeInteger(x),'NON_INTEGER');return JSON.stringify(x);}
  if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';
  fail(obj(x),'INVALID_JSON');
  return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
}
const digest=x=>sha(Buffer.from(canonical(x)));
const periodKeys=Array.from({length:9},(_,i)=> {
  const d=new Date(Date.UTC(2026,9+i,1));
  return d.toISOString().slice(0,7);
});
const kinds={
  RECURRING_CASH:new Set(['SIMULATED_RECEIVED','PROPOSED']),
  ONE_TIME_CASH:new Set(['SIMULATED_RECEIVED','PROPOSED']),
  RESTRICTED_CASH:new Set(['SIMULATED_RECEIVED','PROPOSED']),
  COST_AVOIDANCE:new Set(['SIMULATED_CONFIRMED','PROPOSED']),
  PLEDGE:new Set(['PROPOSED','HELD']),
  IN_KIND:new Set(['SIMULATED_OFFERED','PROPOSED']),
  LIVING_GIFT:new Set(['REVIEW_ONLY','WITHDRAWN'])
};
const sourceRepos=new Set([
  'the-static-collective/static-live',
  'the-static-collective/Jubilee-treasury',
  'the-static-collective/reLATTE'
]);
export function validateStation(input){
  fail(exact(input,['schema','label','periods','base','scenarios']),'INVALID_STATION_FIELDS');
  fail(input.schema===STATION_SCHEMA && typeof input.label==='string' &&
    input.label.length>0&&input.label.length<=120,'INVALID_STATION_SCHEMA');
  fail(Array.isArray(input.periods)&&canonical(input.periods)===canonical(periodKeys),
    'INVALID_PERIODS_EXPECT_OCT_2026_TO_JUN_2027');
  fail(exact(input.base,['recurring_unrestricted_income_cents','recurring_cash_expenses_cents','opening_unrestricted_cash_cents'])&&
    Object.values(input.base).every(money),'INVALID_BASE_FINANCES');
  fail(Array.isArray(input.scenarios)&&input.scenarios.length===3,'THREE_WORLDS_REQUIRED');
  const ids=new Set();
  for(const scenario of input.scenarios){
    fail(exact(scenario,['id','events'])&&['baseline','sustainers','surplus'].includes(scenario.id)&&
      !ids.has(scenario.id)&&Array.isArray(scenario.events)&&scenario.events.length<=32,'INVALID_SCENARIO');
    ids.add(scenario.id);
    const seen=new Set();
    for(const event of scenario.events){
      fail(exact(event,['id','kind','status','amount_cents','starts','through','expense_line']),
        'INVALID_EVENT_FIELDS');
      fail(typeof event.id==='string'&&/^[a-z][a-z0-9_-]{0,63}$/.test(event.id)&&!seen.has(event.id),
        'INVALID_EVENT_ID');
      seen.add(event.id);
      fail(Object.hasOwn(kinds,event.kind)&&kinds[event.kind].has(event.status) &&
        money(event.amount_cents),'INVALID_EVENT_TYPE_STATUS_AMOUNT');
      const a=periodKeys.indexOf(event.starts),b=periodKeys.indexOf(event.through);
      fail(a>=0&&b>=a,'INVALID_EVENT_WINDOW');
      fail(event.kind==='COST_AVOIDANCE'
        ?typeof event.expense_line==='string'&&/^[a-z][a-z0-9_-]{0,63}$/.test(event.expense_line)
        :event.expense_line===null,'INVALID_EXPENSE_LINE');
      fail(event.kind!=='ONE_TIME_CASH'||a===b,'ONE_TIME_CASH_CANNOT_RECUR');
      fail(event.kind!=='LIVING_GIFT'||event.amount_cents===0,'LIVING_GIFT_NOT_MONEY');
    }
    // Independently corroborated expense cancellation can only be entered once
    // against a budget line in an overlapping month.
    const savings=scenario.events.filter(e=>e.kind==='COST_AVOIDANCE');
    for(let i=0;i<savings.length;i++)for(let j=i+1;j<savings.length;j++){
      const a=savings[i],b=savings[j];
      const overlap=periodKeys.indexOf(a.starts)<=periodKeys.indexOf(b.through)&&
        periodKeys.indexOf(b.starts)<=periodKeys.indexOf(a.through);
      fail(!(a.expense_line===b.expense_line&&overlap),'OVERLAPPING_SAVING_LINE');
    }
  }
  fail(ids.size===3&&ids.has('baseline')&&ids.has('sustainers')&&ids.has('surplus'),'MISSING_WORLD');
  fail(input.scenarios.find(x=>x.id==='baseline').events.length===0,'BASELINE_MUST_BE_UNMODIFIED');
  return input;
}
function active(e,period){return e.starts<=period&&period<=e.through;}
export function evaluateStation(input){
  validateStation(input);
  const worlds=input.scenarios.map(scenario=>{
    let reserve=input.base.opening_unrestricted_cash_cents;
    const months=input.periods.map(period=>{
      const opening=reserve;
      let recurring=0,oneTime=0,saved=0,excludedCount=0;
      const counted=[];
      for(const e of scenario.events.filter(e=>active(e,period))){
        if(e.kind==='RECURRING_CASH'&&e.status==='SIMULATED_RECEIVED'){
          recurring+=e.amount_cents;counted.push(e.id);
        }else if(e.kind==='ONE_TIME_CASH'&&e.status==='SIMULATED_RECEIVED'){
          oneTime+=e.amount_cents;counted.push(e.id);
        }else if(e.kind==='COST_AVOIDANCE'&&e.status==='SIMULATED_CONFIRMED'){
          saved+=e.amount_cents;counted.push(e.id);
        }else excludedCount++;
      }
      const base=input.base;
      fail(saved<=base.recurring_cash_expenses_cents,'COST_SAVINGS_EXCEED_EXPENSE');
      const expenses=base.recurring_cash_expenses_cents-saved;
      const income=base.recurring_unrestricted_income_cents+recurring;
      const margin=income-expenses;
      reserve=opening+margin+oneTime;
      // Negative cash is a failure condition; not silently converted into financing.
      fail(Number.isSafeInteger(reserve),'RESERVE_OVERFLOW');
      return {period,opening_unrestricted_cash_cents:opening,
        recurring_unrestricted_income_cents:income,
        cash_expenses_after_assumed_savings_cents:expenses,
        recurring_operating_margin_cents:margin,one_time_unrestricted_receipts_cents:oneTime,
        closing_unrestricted_cash_cents:reserve,simulated_counted_event_ids:counted,
        excluded_active_events:excludedCount};
    });
    const q2=months.slice(-3);
    const growth=q2[2].closing_unrestricted_cash_cents-q2[0].opening_unrestricted_cash_cents;
    const target=q2.every(m=>m.recurring_operating_margin_cents>0)&&growth>0&&
      q2.every(m=>m.closing_unrestricted_cash_cents>=0);
    return {id:scenario.id,months,
      june_2027_recurring_margin_cents:months.at(-1).recurring_operating_margin_cents,
      april_june_reserve_change_cents:growth,
      june_2027_unrestricted_cash_cents:reserve,
      june_surplus_conditions_met_in_simulation:target};
  });
  return {schema:REPORT_SCHEMA,station_label:input.label,periods:input.periods,
    classification:'SYNTHETIC_ASSUMPTIONS_NOT_STATION_FINANCIALS',
    all_event_confirmations:'LAB_ONLY_NOT_REAL_WORLD_VERIFICATION',
    unknown_station_accounts:true,worlds,decision_authority:'STATION_ONLY',
    actual_donations:0,actual_station_actions:0,actual_reLATTE_crossings:0};
}
export function composeSurplus(plan,roots,input){
  fail(obj(plan)&&Array.isArray(plan.sources)&&plan.sources.length===3&&
    new Set(plan.sources.map(s=>s.repository)).size===3&&
    plan.sources.every(s=>sourceRepos.has(s.repository)&&s.path==='README.md'&&s.media_type==='text/markdown'),
    'EXPECTED_THREE_PINNED_DOCUMENT_SOURCES');
  const report=evaluateStation(input);
  const source=composeSources(plan,roots); // CANNON 003 exact original Git blob verification
  const receiptBody={schema:'cannon.kinship-surplus-receipt/v0',
    station_assumptions_sha256:digest(input),report_sha256:digest(report),
    source_receipt_id:source.receipt.receipt_id,source_capsule_sha256:sha(Buffer.from(source.composed)),
    source_witnesses:source.receipt.sources,
    disposition:'HOLD_STATION_REVIEW',simulation_only:true,
    cross_repo_compatibility:'NOT_CLAIMED_OR_EXECUTED',
    donor_code_executions:0,financial_transactions:0,git_mutations:0,
    station_authorization:'NOT_OBTAINED',editorial_authorization:'NOT_OBTAINED',
    consent_assertions:'NONE',reLATTE_crossings:0};
  const receipt={...receiptBody,receipt_id:digest(receiptBody)};
  return {report,source_capsule:source.composed,receipt};
}
export function emit(plan,roots,input,out){
  const result=composeSurplus(plan,roots,input);
  fail(!existsSync(out),'OUTPUT_ALREADY_EXISTS');
  mkdirSync(out,{recursive:false,mode:0o700});
  writeFileSync(join(out,'report.json'),JSON.stringify(result.report,null,2)+'\n',{flag:'wx',mode:0o600});
  writeFileSync(join(out,'receipt.json'),JSON.stringify(result.receipt,null,2)+'\n',{flag:'wx',mode:0o600});
  writeFileSync(join(out,'source-capsule.md'),result.source_capsule,{flag:'wx',mode:0o600});
  return result.receipt;
}
export function coldVerify(plan,roots,input,out){
  const result=composeSurplus(plan,roots,input);
  const files=[['report.json',JSON.stringify(result.report,null,2)+'\n'],
    ['receipt.json',JSON.stringify(result.receipt,null,2)+'\n'],
    ['source-capsule.md',result.source_capsule]];
  for(const [name,expected] of files)
    fail(readFileSync(join(out,name)).equals(Buffer.from(expected)),'COLD_REPLAY_MISMATCH:'+name);
  return {status:'KINSHIP_006_COLD_REPLAY_VERIFIED',receipt_id:result.receipt.receipt_id,
    june_surplus_worlds:result.report.worlds.filter(w=>w.june_surplus_conditions_met_in_simulation).map(w=>w.id),
    actual_station_effects:0,authority:'NONE'};
}
