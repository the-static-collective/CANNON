/** CANNON KINSHIP BRIDGE 007
 * Offline: owner-local aggregate financial input and non-personal African listening
 * readiness observations. Source composition delegates to CANNON 006 -> 003.
 * External Ed25519 pins prove signing key continuity, never station authorization.
 */
import {createHash,createPublicKey,verify as cryptoVerify} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {composeSurplus} from './kinship-surplus.mjs';

export const BRIDGE_SCHEMA='cannon.kinship-bridge-007/v0';
const fail=(b,c)=>{if(!b)throw Error(c);};
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const fields=(v,ks)=>obj(v)&&Object.keys(v).sort().join('|')===[...ks].sort().join('|');
const safeMoney=x=>Number.isSafeInteger(x)&&x>=0&&x<=100_000_000_000;
const count=x=>Number.isSafeInteger(x)&&x>=0&&x<=100_000_000;
const sha=x=>'sha256:'+createHash('sha256').update(x).digest('hex');
function canonical(v){
  if(v===null||typeof v==='string'||typeof v==='boolean')return JSON.stringify(v);
  if(typeof v==='number'){fail(Number.isSafeInteger(v),'NON_INTEGER_NUMBER');return JSON.stringify(v);}
  if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';
  fail(obj(v),'INVALID_JSON');
  return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
}
const digest=x=>sha(Buffer.from(canonical(x)));
const STATES=new Set(['UNKNOWN','PASSED','BLOCKED']);
const CHECKS=['android_store','ios_store','stream_playback','data_affordability','locally_reviewed_material','local_partner_opt_in','stream_rights','station_editorial_review','aggregate_privacy_review'];
const keyId=/^[a-z][a-z0-9_-]{1,63}$/;
export function validateBridge(input){
  fail(fields(input,['schema','label','mode','as_of_month','cash_snapshot','territories','authorization']),
    'BRIDGE_FIELDS_INVALID');
  fail(input.schema===BRIDGE_SCHEMA&&typeof input.label==='string'&&
    input.label.trim().length>0&&input.label.length<=120&&
    ['LAB_SYNTHETIC','OWNER_CLAIMED_AGGREGATE'].includes(input.mode)&&
    input.as_of_month==='2026-10','INVALID_BRIDGE_METADATA');
  fail(fields(input.cash_snapshot,[
    'recurring_unrestricted_income_cents','recurring_cash_expenses_cents','opening_unrestricted_cash_cents'
  ])&&Object.values(input.cash_snapshot).every(safeMoney),'INVALID_AGGREGATE_CASH');
  fail(Array.isArray(input.territories)&&input.territories.length>=1&&input.territories.length<=6,
    'INVALID_TERRITORIES');
  const seen=new Set();
  for(const territory of input.territories){
    fail(fields(territory,['country','checks','weekly_sessions','sessions_source']),'TERRITORY_FIELDS_INVALID');
    fail(typeof territory.country==='string'&&/^[A-Z]{2}$/.test(territory.country)&&
      !seen.has(territory.country),'INVALID_OR_DUPLICATE_COUNTRY');
    seen.add(territory.country);
    fail(fields(territory.checks,CHECKS)&&Object.values(territory.checks).every(x=>STATES.has(x)),
      'INVALID_TERRITORY_CHECKS');
    fail(territory.weekly_sessions===null||count(territory.weekly_sessions),'INVALID_AGGREGATE_SESSIONS');
    fail(['NONE','LAB_FAKE','OWNER_AGGREGATE_CLAIM'].includes(territory.sessions_source),
      'INVALID_SESSION_SOURCE');
    fail((territory.weekly_sessions===null)===(territory.sessions_source==='NONE'),
      'SESSION_ORIGIN_REQUIRED');
    fail(input.mode==='LAB_SYNTHETIC'
      ? territory.sessions_source!=='OWNER_AGGREGATE_CLAIM'
      : territory.sessions_source!=='LAB_FAKE','SESSION_MODE_MISMATCH');
    fail(territory.weekly_sessions===null||
      territory.checks.aggregate_privacy_review==='PASSED','SESSION_PRIVACY_REVIEW_REQUIRED');
  }
  fail(fields(input.authorization,['status','key_id','signature_base64']),'INVALID_AUTH_FIELDS');
  if(input.mode==='LAB_SYNTHETIC'){
    fail(input.authorization.status==='NONE'&&input.authorization.key_id===null&&
      input.authorization.signature_base64===null,'LAB_MUST_HAVE_NO_ATTESTATION');
  }else{
    fail(input.authorization.status==='DETACHED_ED25519'&&
      typeof input.authorization.key_id==='string'&&keyId.test(input.authorization.key_id)&&
      typeof input.authorization.signature_base64==='string'&&
      /^[A-Za-z0-9+/]{86}==$/.test(input.authorization.signature_base64),
      'OWNER_AGGREGATE_REQUIRES_ED25519_ATTESTATION');
  }
  return input;
}
export function signingBytes(input){
  validateBridge(input);
  const payload=structuredClone(input);delete payload.authorization;
  return Buffer.from('cannon.kinship-bridge-007/v0\n'+canonical(payload),'utf8');
}
export function checkAttestation(input,externalPin=null){
  validateBridge(input);
  if(input.mode==='LAB_SYNTHETIC'){
    fail(externalPin===null,'LAB_CANNOT_IMPLY_OWNER_PIN');
    return {kind:'LAB_NO_IDENTITY_ATTESTATION',institutional_authority:'NONE'};
  }
  fail(fields(externalPin,['schema','key_id','public_key_pem']) &&
    externalPin.schema==='cannon.kinship-external-pin/v0'&&
    externalPin.key_id===input.authorization.key_id&&
    typeof externalPin.public_key_pem==='string'&&
    externalPin.public_key_pem.length<2000,'EXTERNAL_PIN_REQUIRED');
  let key;
  try{key=createPublicKey(externalPin.public_key_pem);}
  catch{throw Error('INVALID_ED25519_PUBLIC_PIN');}
  fail(key.asymmetricKeyType==='ed25519','ED25519_KEY_REQUIRED');
  const sig=Buffer.from(input.authorization.signature_base64,'base64');
  fail(sig.length===64&&sig.toString('base64')===input.authorization.signature_base64,
    'NONCANONICAL_SIGNATURE');
  fail(cryptoVerify(null,signingBytes(input),key,sig),'SIGNATURE_INVALID');
  return {kind:'EXTERNAL_PIN_ED25519_VERIFIED',signer_key_id:externalPin.key_id,
    public_key_sha256:sha(Buffer.from(key.export({type:'spki',format:'der'}))),
    institutional_authority:'NOT_ESTABLISHED_BY_SIGNATURE'};
}
export function assessTerritories(input){
  validateBridge(input);
  return input.territories.map(t=>{
    const unknown=CHECKS.filter(k=>t.checks[k]==='UNKNOWN');
    const blocked=CHECKS.filter(k=>t.checks[k]==='BLOCKED');
    const complete=unknown.length===0&&blocked.length===0;
    return {country:t.country,unverified_check_claims:t.checks,
      unknown_checks:unknown,blocked_checks:blocked,
      sessions_indicator:t.weekly_sessions===null?'NO_ELIGIBLE_AGGREGATE':'DECLARED_AGGREGATE_ONLY',
      declared_weekly_sessions:t.weekly_sessions,
      // Readiness is not an instruction to expand, publish, contact, or copy media.
      status:complete?'REVIEW_READY_NO_DEPLOYMENT':'HOLD_EVIDENCE_GAPS',
      outreach_authorized:false,broadcast_authorized:false,market_selected:false};
  });
}
export function composeBridge(plan,roots,scenario,input,externalPin=null){
  const attestation=checkAttestation(input,externalPin);
  const approvedScenario=structuredClone(scenario);
  fail(approvedScenario?.base&&obj(approvedScenario.base),'006_SCENARIO_REQUIRED');
  approvedScenario.base=structuredClone(input.cash_snapshot);
  approvedScenario.label=input.mode==='LAB_SYNTHETIC'
    ?'LAB — NOT KINSHIP FINANCIALS'
    :'OWNER-PROVIDED AGGREGATE CLAIM — NOT AUDITED OR APPROVED';
  const c=composeSurplus(plan,roots,approvedScenario,input);
  const markets=assessTerritories(input);
  const report={schema:'cannon.kinship-bridge-007-report/v0',
    version:'007',mode:input.mode,as_of_month:input.as_of_month,
    station_financial_status:input.mode==='LAB_SYNTHETIC'
      ?'SYNTHETIC_FINANCIAL_INPUTS'
      :'SIGNED_SOURCE_CLAIM_UNAUDITED_NO_STATION_AUTHORITY',
    attestation,source_receipt_id:c.receipt.source_receipt_id,
    economic_projection:c.report,territories:markets,
    market_ranking:'NONE',marketing_execution:'NONE',content_republication:'NONE',
    station_editorial_permission:'NOT_OBTAINED',station_deployment:'NONE',
    live_stream_test:'NOT_PERFORMED_BY_THIS_TOOL',
    data_analytics_access:'NONE',actual_listener_reach:'NOT_ESTABLISHED',
    real_financial_surplus:'NOT_ESTABLISHED'};
  const body={schema:'cannon.kinship-bridge-007-receipt/v0',mode:input.mode,
    station_input_digest:digest(input),aggregate_cents_digest:digest(input.cash_snapshot),
    original_scenario_digest:digest(scenario),
    source_receipt_id:c.receipt.source_receipt_id,source_capsule_sha256:sha(Buffer.from(c.source_capsule)),
    report_digest:digest(report),
    disposition:'HOLD_HUMAN_STATION_AND_LOCAL_PARTNER_REVIEW',
    no_donor_identity_data:true,station_authority:'NONE',stream_rebroadcast_authority:'NONE',
    content_replication:0,actual_financial_transactions:0,actual_outreach:0,
    actual_reLATTE_crossings:0,git_mutations:0};
  const receipt={...body,receipt_id:digest(body)};
  return {report,receipt,source_capsule:c.source_capsule};
}
export function emit(plan,roots,scenario,input,externalPin,out,privateLocal=false){
  const result=composeBridge(plan,roots,scenario,input,externalPin);
  fail(input.mode==='LAB_SYNTHETIC'||privateLocal===true,'PRIVATE_LOCAL_EXPORT_REQUIRED');
  fail(!existsSync(out),'OUTPUT_ALREADY_EXISTS');
  mkdirSync(out,{recursive:false,mode:0o700});
  for(const [f,s] of [
    ['report.json',JSON.stringify(result.report,null,2)+'\n'],
    ['receipt.json',JSON.stringify(result.receipt,null,2)+'\n'],
    ['source-capsule.md',result.source_capsule]
  ])writeFileSync(join(out,f),s,{flag:'wx',mode:0o600});
  return result.receipt;
}
export function coldVerify(plan,roots,scenario,input,externalPin,out){
  const r=composeBridge(plan,roots,scenario,input,externalPin);
  for(const [f,s] of [
    ['report.json',JSON.stringify(r.report,null,2)+'\n'],
    ['receipt.json',JSON.stringify(r.receipt,null,2)+'\n'],
    ['source-capsule.md',r.source_capsule]
  ])fail(readFileSync(join(out,f)).equals(Buffer.from(s)),'COLD_REPLAY_MISMATCH:'+f);
  return {status:'KINSHIP_BRIDGE_007_COLD_REPLAY_VERIFIED',
    receipt_id:r.receipt.receipt_id,mode:input.mode,
    countries:r.report.territories.map(x=>x.country),
    actual_outreach:0,station_adoption:false};
}
