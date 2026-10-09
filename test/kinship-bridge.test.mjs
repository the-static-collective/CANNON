import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {validateBridge,signingBytes,checkAttestation,assessTerritories,composeBridge,emit,coldVerify} from '../src/kinship-bridge.mjs';

const lab=JSON.parse(readFileSync(new URL('../examples/kinship-bridge-007.lab.json',import.meta.url),'utf8'));
const scenario=JSON.parse(readFileSync(new URL('../examples/kinship-surplus-006.station.json',import.meta.url),'utf8'));
const planFixture=JSON.parse(readFileSync(new URL('../examples/kinship-surplus-006.plan.json',import.meta.url),'utf8'));
const fresh=()=>structuredClone(lab);
const git=(root,...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
function repoFixture(){
  const home=mkdtempSync(join(tmpdir(),'cannon-007-'));
  const plan=structuredClone(planFixture),roots={};
  plan.sources.forEach((s,i)=>{
    const dir=join(home,'repo'+i);mkdirSync(dir);
    git(dir,'init','-q');
    git(dir,'config','user.name','Lab');
    git(dir,'config','user.email','lab@example.invalid');
    git(dir,'remote','add','origin','https://github.com/'+s.repository+'.git');
    writeFileSync(join(dir,'README.md'),'# Lab '+s.repository+'\n');
    git(dir,'add','README.md');
    git(dir,'commit','-qm','original source');
    s.commit=git(dir,'rev-parse','HEAD');
    roots[s.repository]=dir;
  });
  return {home,plan,roots,scenario:structuredClone(scenario),cleanup:()=>rmSync(home,{recursive:true,force:true})};
}
function withFixture(fn){const f=repoFixture();try{return fn(f);}finally{f.cleanup();}}
function claim(value=fresh()){
  const pair=generateKeyPairSync('ed25519');
  value.mode='OWNER_CLAIMED_AGGREGATE';
  for(const t of value.territories)if(t.sessions_source==='LAB_FAKE'){
    t.sessions_source='NONE';t.weekly_sessions=null;
  }
  value.authorization={status:'DETACHED_ED25519',key_id:'station-key-lab',
    signature_base64:'A'.repeat(86)+'=='};
  value.authorization.signature_base64=sign(null,signingBytes(value),pair.privateKey).toString('base64');
  const pin={schema:'cannon.kinship-external-pin/v0',key_id:'station-key-lab',
    public_key_pem:pair.publicKey.export({type:'spki',format:'pem'})};
  return {value,pin};
}
test('unranked Ghana Kenya Uganda remain HOLD with independent unknowns, never declared reach',()=>{
  const a=fresh(),t=assessTerritories(a);
  assert.deepEqual(t.map(x=>x.country),['GH','KE','UG']);
  assert.ok(t.every(x=>x.status==='HOLD_EVIDENCE_GAPS'&&x.unknown_checks.length===9&&
    x.market_selected===false&&x.outreach_authorized===false));
});
test('all check claims passed means review ready, never permitted publication or outreach',()=>{
  const a=fresh();for(const k of Object.keys(a.territories[0].checks))a.territories[0].checks[k]='PASSED';
  const outcome=assessTerritories(a)[0];
  assert.equal(outcome.status,'REVIEW_READY_NO_DEPLOYMENT');
  assert.equal(outcome.broadcast_authorized,false);
  assert.equal(outcome.market_selected,false);
});
test('blocked stream and unknown rights remain separate outcomes',()=>{
  const a=fresh();a.territories[0].checks.stream_playback='BLOCKED';
  const t=assessTerritories(a)[0];
  assert.deepEqual(t.blocked_checks,['stream_playback']);
  assert.ok(t.unknown_checks.includes('stream_rights'));
});
test('financial aggregate fields are exact and integer cents, forbid tracking payloads',()=>{
  for(const modify of [
    v=>v.cash_snapshot.donor_list=['test@example.invalid'],
    v=>v.cash_snapshot.opening_unrestricted_cash_cents='1',
    v=>v.cash_snapshot.recurring_cash_expenses_cents=-1,
    v=>v.cash_snapshot.recurring_cash_expenses_cents=1.3,
    v=>v.cash_snapshot.pledges_cents=20000,
    v=>v.contacts=['someone'],
    v=>v.as_of_month='2025-02',
    v=>v.territories[0].device_ids=['secret'],
    v=>v.territories[0].checks.station_editorial_review='AUTO_APPROVED'
  ]){const a=fresh();modify(a);assert.throws(()=>validateBridge(a));}
});
test('monthly sessions require an explicit origin and prior aggregate privacy review',()=>{
  const a=fresh();a.territories[0].weekly_sessions=123;
  assert.throws(()=>validateBridge(a),/SESSION_ORIGIN_REQUIRED/);
  a.territories[0].sessions_source='LAB_FAKE';
  assert.throws(()=>validateBridge(a),/SESSION_PRIVACY_REVIEW_REQUIRED/);
  a.territories[0].checks.aggregate_privacy_review='PASSED';
  assert.doesNotThrow(()=>validateBridge(a));
  assert.equal(assessTerritories(a)[0].sessions_indicator,'DECLARED_AGGREGATE_ONLY');
});
test('app downloads and sessions cannot become budget money or verified unique listeners',()=>{
  withFixture(f=>{
    const a=fresh();a.territories[0].checks.aggregate_privacy_review='PASSED';
    a.territories[0].sessions_source='LAB_FAKE';a.territories[0].weekly_sessions=900000;
    const p=composeBridge(f.plan,f.roots,f.scenario,a);
    assert.equal(p.report.real_financial_surplus,'NOT_ESTABLISHED');
    assert.equal(p.report.actual_listener_reach,'NOT_ESTABLISHED');
    assert.equal(p.report.economic_projection.worlds[2].june_2027_recurring_margin_cents,70000);
    assert.equal(p.receipt.actual_financial_transactions,0);
  });
});
test('lab identity cannot be fabricated or supplied with an external signer',()=>{
  const a=fresh();
  a.authorization.status='DETACHED_ED25519';
  assert.throws(()=>validateBridge(a),/LAB_MUST_HAVE_NO_ATTESTATION/);
  assert.throws(()=>checkAttestation(fresh(),{fake:true}),/LAB_CANNOT_IMPLY_OWNER_PIN/);
});
test('non-lab aggregate claims require exact detached Ed25519 signature and matching external pin',()=>{
  const {value,pin}=claim();
  assert.equal(checkAttestation(value,pin).kind,'EXTERNAL_PIN_ED25519_VERIFIED');
  assert.equal(checkAttestation(value,pin).institutional_authority,'NOT_ESTABLISHED_BY_SIGNATURE');
  assert.throws(()=>checkAttestation(value),/EXTERNAL_PIN_REQUIRED/);
  const tampered=structuredClone(value);tampered.cash_snapshot.recurring_cash_expenses_cents++;
  assert.throws(()=>checkAttestation(tampered,pin),/SIGNATURE_INVALID/);
  const wrong=structuredClone(pin);wrong.key_id='impostor';
  assert.throws(()=>checkAttestation(value,wrong),/EXTERNAL_PIN_REQUIRED/);
});
test('a different but valid Ed25519 key cannot replace pinned signer',()=>{
  const {value,pin}=claim(),other=generateKeyPairSync('ed25519');
  pin.public_key_pem=other.publicKey.export({type:'spki',format:'pem'});
  assert.throws(()=>checkAttestation(value,pin),/SIGNATURE_INVALID/);
});
test('a valid detached signature cannot grant station authority, broadcasting or export by itself',()=>{
  withFixture(f=>{
    const {value,pin}=claim();
    const result=composeBridge(f.plan,f.roots,f.scenario,value,pin);
    assert.equal(result.report.station_financial_status,'SIGNED_SOURCE_CLAIM_UNAUDITED_NO_STATION_AUTHORITY');
    assert.equal(result.report.station_deployment,'NONE');
    assert.equal(result.receipt.station_authority,'NONE');
    assert.equal(result.receipt.stream_rebroadcast_authority,'NONE');
    const out=join(f.home,'real');
    assert.throws(()=>emit(f.plan,f.roots,f.scenario,value,pin,out),/PRIVATE_LOCAL_EXPORT_REQUIRED/);
    assert.equal(existsSync(out),false);
    emit(f.plan,f.roots,f.scenario,value,pin,out,true);
    assert.equal(coldVerify(f.plan,f.roots,f.scenario,value,pin,out).status,'KINSHIP_BRIDGE_007_COLD_REPLAY_VERIFIED');
  });
});
test('one synthetic sample crosses three independent original source Git objects and cold replays',()=>{
  withFixture(f=>{
    const out=join(f.home,'output');
    const receipt=emit(f.plan,f.roots,f.scenario,fresh(),null,out);
    assert.equal(receipt.disposition,'HOLD_HUMAN_STATION_AND_LOCAL_PARTNER_REVIEW');
    assert.equal(receipt.actual_outreach,0);
    assert.equal(coldVerify(f.plan,f.roots,f.scenario,fresh(),null,out).actual_outreach,0);
  });
});
test('altered output, station input, or source plan fails cold replay',()=>{
  withFixture(f=>{
    const out=join(f.home,'output'),a=fresh();
    emit(f.plan,f.roots,f.scenario,a,null,out);
    const p=join(out,'receipt.json');
    writeFileSync(p,'{"status":"DEPLOYED"}\n');
    assert.throws(()=>coldVerify(f.plan,f.roots,f.scenario,a,null,out),/COLD_REPLAY_MISMATCH/);
    const b=join(f.home,'another');
    emit(f.plan,f.roots,f.scenario,a,null,b);
    const changed=fresh();changed.cash_snapshot.recurring_unrestricted_income_cents=1300000;
    assert.throws(()=>coldVerify(f.plan,f.roots,f.scenario,changed,null,b),/COLD_REPLAY_MISMATCH/);
    const broken=structuredClone(f.plan);broken.sources[0].commit='f'.repeat(40);
    assert.throws(()=>coldVerify(broken,f.roots,f.scenario,a,null,b));
  });
});
test('non-Git and forged source identity cannot be accepted',()=>{
  withFixture(f=>{
    const t=structuredClone(f.roots);
    t['the-static-collective/static-live']=f.home;
    assert.throws(()=>composeBridge(f.plan,t,f.scenario,fresh()));
    const root=f.roots['the-static-collective/reLATTE'];
    git(root,'remote','set-url','origin','https://github.com/impostor/reLATTE.git');
    assert.throws(()=>composeBridge(f.plan,f.roots,f.scenario,fresh()),/DECLARED_GIT_ORIGIN_MISMATCH/);
  });
});
test('failed compose leaves no output and replay does not overwrite',()=>{
  withFixture(f=>{
    const out=join(f.home,'out'),a=fresh();
    const invalid=fresh();invalid.territories[1].country='GH';
    assert.throws(()=>emit(f.plan,f.roots,f.scenario,invalid,null,out));
    assert.equal(existsSync(out),false);
    emit(f.plan,f.roots,f.scenario,a,null,out);
    assert.throws(()=>emit(f.plan,f.roots,f.scenario,a,null,out),/OUTPUT_ALREADY_EXISTS/);
  });
});
