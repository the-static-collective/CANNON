// GROOVETOWN-001 — synthetic proof kernel, not a real-world witness service.
// No outside data, network, database, paid service, or dependency is used.
import {createHash, createPrivateKey, createPublicKey, sign, verify} from 'node:crypto';
import {writeFileSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

export const VERSION = 'GROOVETOWN-001/v1';
const DEMO_KEY = `-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEILcm0yz1ERaald/h1CWnrp73NUe8eT6DUijunJeJcT24\n-----END PRIVATE KEY-----`;
const canonical = x => JSON.stringify(sort(x));
function sort(x) {
  if (Array.isArray(x)) return x.map(sort);
  if (x && typeof x === 'object') return Object.fromEntries(Object.keys(x).sort().map(k => [k, sort(x[k])]));
  return x;
}
export const sha = x => createHash('sha256').update(typeof x === 'string' || Buffer.isBuffer(x) ? x : canonical(x)).digest('hex');
const clone = x => structuredClone(x);
const check = (ok, why) => { if (!ok) throw new Error(why); };

export function makeTown({name, needs, ancestor = null}) {
  check(typeof name === 'string' && name.length > 0 && name.length < 100, 'invalid town name');
  check(Array.isArray(needs) && needs.length > 0 && needs.length < 100, 'invalid needs');
  const seen = new Set();
  for (const n of needs) {
    check(typeof n.id === 'string' && /^[a-z0-9-]{2,40}$/.test(n.id) && !seen.has(n.id), 'invalid or duplicate need');
    check(typeof n.item === 'string' && n.item.length > 0 && n.item.length < 100, 'invalid item');
    check(Number.isSafeInteger(n.quantity) && n.quantity > 0 && n.quantity < 100000, 'invalid quantity');
    seen.add(n.id);
  }
  const seed = {name, needs: clone(needs), ancestor};
  return {version: VERSION, id: sha(seed).slice(0,20), seed, ledger: [], inbox: []};
}

export function report(town, {need, quantity, actor}) {
  check(town.version === VERSION, 'wrong version');
  check(town.seed.needs.some(n => n.id === need), 'unknown need');
  check(Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 100000, 'invalid quantity');
  check(typeof actor === 'string' && actor.trim().length > 0, 'missing reporter');
  const nonce = town.ledger.filter(e => e.kind === 'REPORT').length;
  const event = {kind: 'REPORT', need, quantity, actor, nonce, evidence: 'SYNTHETIC_ONLY'};
  const id = sha({townId: town.id, event});
  const next = clone(town);
  next.ledger.push({...event, id});
  return {town: next, reportId: id};
}

export function confirm(town, {reportId, witness, accepted}) {
  const claim = town.ledger.find(e => e.kind === 'REPORT' && e.id === reportId);
  check(claim, 'unknown report');
  check(typeof witness === 'string' && witness.trim().length > 0, 'missing witness');
  check(claim.actor !== witness, 'self-confirmation refused');
  check(typeof accepted === 'boolean', 'explicit decision required');
  check(!town.ledger.some(e => e.kind === 'CONFIRM' && e.reportId === reportId), 'report already decided');
  const event = {kind: 'CONFIRM', reportId, witness, accepted, evidence: 'SYNTHETIC_ONLY'};
  const next = clone(town);
  next.ledger.push({...event, id: sha({townId: town.id, event})});
  return next;
}

export function progress(town) {
  const result = {};
  for (const need of town.seed.needs) {
    const accepted = new Set(town.ledger.filter(e => e.kind === 'CONFIRM' && e.accepted).map(e => e.reportId));
    const quantity = town.ledger.filter(e => e.kind === 'REPORT' && e.need === need.id && accepted.has(e.id)).reduce((a, e) => a + e.quantity, 0);
    result[need.id] = {item: need.item, needed: need.quantity, confirmed: Math.min(quantity, need.quantity), remaining: Math.max(0, need.quantity - quantity)};
  }
  return result;
}

export function music(town) {
  const rows = Object.values(progress(town));
  const remaining = rows.reduce((a, b) => a + b.remaining, 0);
  const confirmed = rows.reduce((a, b) => a + b.confirmed, 0);
  // Dissonance resolves only after a separate synthetic witness accepts a report.
  const notes = remaining === 0 ? [48, 60, 64, 67] : confirmed > 0 ? [48, 60, 63, 67] : [48, 60, 61, 66];
  return {state: remaining === 0 ? 'RESOLVED' : confirmed > 0 ? 'MOVING' : 'UNRESOLVED', notes, remaining, confirmed};
}

export function proposals(town) {
  return Object.entries(progress(town)).filter(([, v]) => v.remaining > 0).map(([need, v]) => ({
    id: sha({town: town.id, need, remaining: v.remaining}).slice(0,20),
    type: 'HELD_PLAN_CANDIDATE', need, title: `Explore obtaining ${v.remaining} ${v.item}`,
    status: 'HOLD', autoExecute: false,
    evidence: 'synthetic-local-only', source: {town: town.id, ledgerHash: sha(town.ledger)}
  }));
}

export function makeCartridge(town, issuer = 'fictional-mailperson') {
  const key = createPrivateKey(DEMO_KEY);
  const publicKey = createPublicKey(key).export({type: 'spki', format: 'pem'}).toString();
  const payload = {
    version: VERSION, kind: 'PORTABLE_SEED',
    synthetic: true, issuer, origin: town.id, seed: town.seed,
    historyHash: sha(town.ledger), // History is referenced, never imported as local confirmation.
    music: music(town), sourceStatus: 'UNVERIFIED_PHYSICAL_EVENTS',
  };
  const signature = sign(null, Buffer.from(canonical(payload)), key).toString('base64');
  return {payload, digest: sha(payload), publicKey, signature, trust: 'DEMO_TEST_KEY_ONLY'};
}

export function verifyCartridge(cartridge) {
  try {
    if (cartridge.trust !== 'DEMO_TEST_KEY_ONLY' || cartridge.payload?.version !== VERSION || cartridge.payload?.synthetic !== true) return false;
    if (sha(cartridge.payload) !== cartridge.digest) return false;
    return verify(null, Buffer.from(canonical(cartridge.payload)), createPublicKey(cartridge.publicKey), Buffer.from(cartridge.signature, 'base64'));
  } catch { return false; }
}

export function receive(town, cartridge, {decision = 'HOLD', trustedPublicKeys = []} = {}) {
  if (!verifyCartridge(cartridge)) return {status: 'REFUSE', reason: 'INVALID_SIGNATURE_OR_PAYLOAD', town};
  if (!trustedPublicKeys.includes(cartridge.publicKey)) return {status: 'REFUSE', reason: 'NO_LOCAL_TRUST', town};
  if (decision !== 'ADMIT' && decision !== 'REFUSE') return {status: 'HOLD', reason: 'LOCAL_DECISION_REQUIRED', town};
  if (decision === 'REFUSE') return {status: 'REFUSE', reason: 'LOCAL_POLICY', town};
  if (town.inbox.some(x => x.digest === cartridge.digest)) return {status: 'HOLD', reason: 'DUPLICATE', town};
  const next = clone(town);
  next.inbox.push({digest: cartridge.digest, origin: cartridge.payload.origin, status: 'ADMIT', evidence: 'SYNTHETIC_EXTERNAL_STORY_ONLY'});
  return {status: 'ADMIT', reason: 'LOCAL_DECISION', town: next};
}

export function rebirth(cartridge, name) {
  check(verifyCartridge(cartridge), 'invalid cartridge');
  return makeTown({name, needs: cartridge.payload.seed.needs, ancestor: {origin: cartridge.payload.origin, digest: cartridge.digest}});
}

export function wav(notes) {
  const sampleRate = 16000, seconds = 2, count = sampleRate * seconds;
  const out = Buffer.alloc(44 + count * 2);
  out.write('RIFF', 0); out.writeUInt32LE(out.length - 8, 4);
  out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(sampleRate, 24); out.writeUInt32LE(sampleRate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate, envelope = Math.min(1, t * 10) * Math.min(1, (seconds - t) * 3);
    const y = notes.reduce((s, midi) => s + Math.sin(2 * Math.PI * 440 * 2 ** ((midi - 69) / 12) * t), 0) / notes.length;
    out.writeInt16LE(Math.round(13000 * envelope * y), 44 + i * 2);
  }
  return out;
}

function viewHtml(before, after, cartridge, east, west, born, plans) {
  const data = JSON.stringify({before: music(before), after: music(after), beforeProgress: progress(before), afterProgress: progress(after), cartridgeDigest: cartridge.digest, east, west, born, plans})
    .replace(/</g, '\\u003c');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Groovetown 001 — The Town That Plays Itself</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{background:#111820;color:#f0eadb;font:16px/1.55 system-ui,sans-serif;max-width:900px;margin:0 auto;padding:25px}h1{font-size:clamp(2rem,6vw,4rem);line-height:1.1;margin-bottom:0}h2{color:#fbc98a}small,.sub{color:#acb8bd}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin:24px 0}.card{background:#202e39;border:1px solid #485764;border-radius:12px;padding:18px}button{border:0;border-radius:8px;padding:12px 15px;background:#d9a759;color:#121619;font-weight:700;cursor:pointer}button:hover{background:#efca89}code{overflow-wrap:anywhere}strong{color:#ffdc9e}.seal{padding:12px;border-left:5px solid #d9a759;background:#28343a}li{margin:5px 0}</style></head><body>
<p class="sub">EXPERIMENT / SYNTHETIC ONLY / OFFLINE DEMONSTRATION</p><h1>THE TOWN THAT<br>PLAYS ITSELF.</h1><p>One invented bread delivery changes a town's musical harmony only after a second invented witness confirms it. Two receiver towns make independent decisions. A signed test cartridge seeds a third town without inheriting anybody else's accomplishments.</p>
<div class="cards"><section class="card"><h2>Before</h2><p id="before"></p><button id="playBefore">Hear dissonance</button></section><section class="card"><h2>After</h2><p id="after"></p><button id="playAfter">Hear resolution</button></section></div>
<h2>The Haunted Post Office</h2><div class="cards"><div class="card"><strong>East Town</strong><p id="east"></p></div><div class="card"><strong>West Town</strong><p id="west"></p></div></div>
<h2>The reproductive record</h2><p>Portable seed digest: <code id="digest"></code></p><p id="born"></p>
<h2>New quests (not executed)</h2><ul id="plans"></ul><p class="seal">No actual bread was delivered; no human witnessed anything; no physical record was pressed; no Wii hardware was tested; no outside integrations were executed. This HTML is a source-owned, locally runnable CANNON experiment adapter, not a native reLATTE, planZ, Haunted Toaster or lemonPRESS run.</p>
<script id="fixture" type="application/json">${data}</script><script>
(function(){var x=JSON.parse(document.getElementById('fixture').textContent);var e=function(id,t){document.getElementById(id).textContent=t;};
e('before',x.before.state+' — '+x.before.remaining+' still needed');e('after',x.after.state+' — '+x.after.confirmed+' confirmed (synthetic)');e('east',x.east.status+' / '+x.east.reason);e('west',x.west.status+' / '+x.west.reason);e('digest',x.cartridgeDigest);e('born',x.born.seed.name+' inherits only a seed, never local deed credit. New ledger length: '+x.born.ledger.length+'.');
var u=document.getElementById('plans');x.plans.forEach(function(p){var li=document.createElement('li');li.textContent=p.title+' — HOLD';u.appendChild(li);});
var AudioCtx=window.AudioContext||window.webkitAudioContext;function play(notes){if(!AudioCtx){alert('Audio unavailable on this browser. Chord notes: '+notes.join(', '));return;}var c=new AudioCtx();notes.forEach(function(n){var o=c.createOscillator(),g=c.createGain();o.frequency.value=440*Math.pow(2,(n-69)/12);g.gain.value=.07;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+1.5);});setTimeout(function(){c.close();},1800);}
document.getElementById('playBefore').onclick=function(){play(x.before.notes)};document.getElementById('playAfter').onclick=function(){play(x.after.notes)};
})();</script></body></html>`;
}

export function demo(outdir) {
  const before = makeTown({name: 'Waseca (FICTIONAL TEST)', needs: [{id: 'bread', item: 'loaves of bread', quantity: 2}]});
  const {town: pending, reportId} = report(before, {need: 'bread', quantity: 2, actor: 'fictional-baker'});
  const after = confirm(pending, {reportId, witness: 'fictional-mailperson', accepted: true});
  const cartridge = makeCartridge(after);
  const east = makeTown({name: 'East Town', needs: before.seed.needs});
  const west = makeTown({name: 'West Town', needs: before.seed.needs});
  const allow = {trustedPublicKeys: [cartridge.publicKey]};
  const eastDecision = receive(east, cartridge, {...allow, decision: 'ADMIT'});
  const westDecision = receive(west, cartridge, {...allow, decision: 'REFUSE'});
  const born = rebirth(cartridge, 'Mankato (FICTIONAL TEST)');
  const plans = proposals(before);
  const packet = {version: VERSION, before: progress(before), pending: progress(pending), after: progress(after), beforeMusic: music(before), pendingMusic: music(pending), afterMusic: music(after), east: {status: eastDecision.status, reason: eastDecision.reason}, west: {status: westDecision.status, reason: westDecision.reason}, born, plans};
  mkdirSync(outdir, {recursive: true});
  const artifacts = {
    '01-town-before.json': canonical(before)+'\n',
    '02-town-after.json': canonical(after)+'\n',
    '03-held-plans.json': canonical(plans)+'\n',
    '04-signed-cartridge.json': canonical(cartridge)+'\n',
    '05-two-receivers.json': canonical({east: eastDecision, west: westDecision})+'\n',
    '06-reborn-town.json': canonical(born)+'\n',
    '07-before.wav': wav(music(before).notes),
    '08-after.wav': wav(music(after).notes),
    'index.html': viewHtml(before, after, cartridge, packet.east, packet.west, born, plans),
    'packet.json': canonical(packet)+'\n',
  };
  for (const [name, data] of Object.entries(artifacts)) writeFileSync(join(outdir, name), data);
  const receipt = {version: VERSION, trust: 'DEMO_TEST_KEY_ONLY', filenames: Object.fromEntries(Object.entries(artifacts).map(([name, data]) => [name, 'sha256:'+sha(data)]))};
  writeFileSync(join(outdir, 'receipt.json'), canonical(receipt)+'\n');
  return receipt;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] !== 'demo' || !process.argv[3]) { console.error('Usage: node groovetown.mjs demo OUTPUT_DIR'); process.exitCode = 2; }
  else console.log(JSON.stringify(demo(process.argv[3]), null, 2));
}