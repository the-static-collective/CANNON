import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {makeTown, report, confirm, progress, music, proposals, makeCartridge, verifyCartridge, receive, rebirth, wav, demo, sha} from './groovetown.mjs';
const town = () => makeTown({name: 'Fictional Test', needs: [{id: 'bread', item: 'bread', quantity: 2}]});
const signed = () => makeCartridge(town());

test('a mere report is not a deed; only separate simulated witness resolution changes score', () => {
  const t = town(), r = report(t, {need:'bread', quantity:2, actor:'Alice'});
  assert.deepEqual(progress(t), progress(r.town));
  assert.deepEqual(music(t), music(r.town));
  assert.throws(() => confirm(r.town, {reportId:r.reportId, witness:'Alice', accepted:true}), /self-confirmation/);
  const done = confirm(r.town, {reportId:r.reportId, witness:'Bob', accepted:true});
  assert.equal(progress(done).bread.remaining, 0);
  assert.equal(music(done).state, 'RESOLVED');
  assert.notDeepEqual(music(t).notes, music(done).notes);
  assert.throws(() => confirm(done, {reportId:r.reportId, witness:'Carol', accepted:true}), /already decided/);
});

test('rejected reports leave dissonance, plans stay HOLD, malformed reports fail', () => {
  const t = town();
  assert.throws(() => report(t, {need:'bread', quantity:-5, actor:'A'}), /quantity/);
  assert.throws(() => report(t, {need:'unknown', quantity:2, actor:'A'}), /unknown/);
  const r = report(t, {need:'bread', quantity:2, actor:'Alice'});
  const denied = confirm(r.town, {reportId:r.reportId, witness:'Bob', accepted:false});
  assert.equal(progress(denied).bread.confirmed, 0);
  assert.equal(proposals(denied)[0].status, 'HOLD');
  assert.equal(proposals(denied)[0].autoExecute, false);
});

test('signed test cartridge rejects tamper, local hold, local refusal, untrusted issuer and duplicates', () => {
  const c = signed(), dest = town(), opts = {trustedPublicKeys:[c.publicKey]};
  assert.equal(verifyCartridge(c), true);
  assert.equal(receive(dest, c, opts).status, 'HOLD');
  assert.equal(receive(dest, c, {...opts, decision:'REFUSE'}).status, 'REFUSE');
  assert.equal(receive(dest, c, {decision:'ADMIT'}).reason, 'NO_LOCAL_TRUST');
  const accepted = receive(dest, c, {...opts, decision:'ADMIT'});
  assert.equal(accepted.status, 'ADMIT');
  assert.equal(receive(accepted.town, c, {...opts, decision:'ADMIT'}).reason, 'DUPLICATE');
  assert.equal(progress(accepted.town).bread.confirmed, 0);
  const forgery = structuredClone(c); forgery.payload.seed.needs[0].quantity = 999;
  assert.equal(verifyCartridge(forgery), false);
  assert.equal(receive(dest, forgery, {...opts,decision:'ADMIT'}).status, 'REFUSE');
  const forgedSig = structuredClone(c); forgedSig.signature = Buffer.from('no signature').toString('base64');
  assert.equal(verifyCartridge(forgedSig), false);
});

test('reborn town gets ancestry but zero inherited local deed credit', () => {
  const t = town(), r = report(t, {need:'bread',quantity:2,actor:'Alice'});
  const completed = confirm(r.town,{reportId:r.reportId,witness:'Bob',accepted:true});
  const c = makeCartridge(completed);
  const b = rebirth(c, 'Another Town');
  assert.equal(b.seed.ancestor.digest, c.digest);
  assert.equal(b.ledger.length, 0);
  assert.equal(progress(b).bread.confirmed, 0);
  assert.throws(()=>rebirth({...c, digest:'bad'},'Forgery'), /invalid cartridge/);
});

test('audio is real PCM WAV and changing chord changes sound bytes', () => {
  const a=wav([48,60,61,66]), b=wav([48,60,64,67]);
  assert.equal(a.subarray(0,4).toString(),'RIFF');
  assert.equal(a.subarray(8,12).toString(),'WAVE');
  assert.notEqual(sha(a),sha(b));
});

test('two completely independent demonstrations produce byte-identical receipt and files', () => {
  const a=mkdtempSync(join(tmpdir(),'groovetown-a-'));
  const b=mkdtempSync(join(tmpdir(),'groovetown-b-'));
  assert.deepEqual(demo(a),demo(b));
  const names=readdirSync(a);
  assert.deepEqual(names,readdirSync(b));
  for(const name of names) assert.deepEqual(readFileSync(join(a,name)),readFileSync(join(b,name)),name);
  const html=readFileSync(join(a,'index.html'),'utf8');
  assert.match(html,/EXPERIMENT \/ SYNTHETIC ONLY/);
  assert.match(html,/AudioCtx/);
  assert.doesNotMatch(html,/<script[^>]+src=/);
  const receipt=JSON.parse(readFileSync(join(a,'receipt.json'),'utf8'));
  for(const [name,digest] of Object.entries(receipt.filenames)) assert.equal(digest,'sha256:'+sha(readFileSync(join(a,name))));
});