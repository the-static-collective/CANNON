import {readSource} from '../../src/present-use.mjs';
import {readFileSync,writeFileSync,mkdirSync,realpathSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import * as seed from '../ministry-suitcase-007/seed.mjs';
import {createRootAPI} from './root.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const pins=[
  {
    "id": "identity",
    "root": "identity",
    "repo": "the-static-collective/staticID",
    "commit": "259787c50dc4cc2c5e7fb1defe09c9a3cd82c4a3",
    "path": "src/oidc.mjs",
    "blob": "89f1417067c3a7076595dec5c8d94fd0d2863f90"
  },
  {
    "id": "fileport",
    "root": "fileport",
    "repo": "the-static-collective/fileport",
    "commit": "c826d90975a6dd418140f9ff3a64d067897ca7f5",
    "path": "lib/core.js",
    "blob": "f217736bd4111b8d8eeea0f848f76cd329251898"
  },
  {
    "id": "memento",
    "root": "memento",
    "repo": "the-static-collective/MEMENTO",
    "commit": "e0c4b654555e1a214aae8ef4e458d96fea154d33",
    "path": "scripts/lib/understory.mjs",
    "blob": "9742f7a5fbaf93bdce03174ba9c3f40bab832d92"
  },
  {
    "id": "casework",
    "root": "common",
    "repo": "the-static-collective/Jubilee-treasury",
    "commit": "88453937380fdfa68670cc8521662dddc61c0068",
    "path": "ops/steward-desk-004/common-assets.mjs",
    "blob": "966e421ed68833a0ea1274c26f39c896b01036f8"
  },
  {
    "id": "full",
    "root": "full",
    "repo": "the-static-collective/full-measure-world-layer",
    "commit": "c9206d5055ad574a23acb2eceb5f8785a4ad64fe",
    "path": "src/lib/pledgeAuthority.ts",
    "blob": "f7af2434bfc6854932a70db1e598304110b48279"
  }
];
const source=pins.map(p=>{const root=realpathSync(resolve(p.root));const x=readSource({id:p.id,repository:p.repo,commit:p.commit,path:p.path,media_type:'text/plain',tags:[]},{[p.repo]:root});assert.equal(x.witness.blob,p.blob);assert.equal(x.witness.blob_sha256,'sha256:'+sha(readFileSync(join(root,p.path))));return {...p,...x}});
const get=id=>source.find(x=>x.id===id);
const load=id=>import(pathToFileURL(resolve(get(id).root,get(id).path)).href);
const identity=await load('identity'),fileport=await load('fileport'),memento=await load('memento'),assets=await load('casework');
const end='return {blank,append,projection,totals,seal,unseal,statuses};\n})();',stop=assets.SCRIPT.indexOf(end);assert(stop>=0);const core=assets.SCRIPT.slice(0,stop+end.length);
const Casework=new Function(core+'\nreturn Casework')();
const ts=createRequire(import.meta.url)(resolve(process.env.CANNON_TSC,'../../lib/typescript.js'));assert.equal(ts.version,'5.8.3');
const authJs=ts.transpileModule(get('full').content,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {authorizePledgeTransition:auth}=await import('data:text/javascript;base64,'+Buffer.from(authJs).toString('base64'));
const api=createRootAPI(seed,identity,fileport,Casework,memento,auth);
let [a,b,c]=await Promise.all(['A','B','C'].map(api.create)),roster={A:a.node.keys.publicKey,B:b.node.keys.publicKey,C:c.node.keys.publicKey};
for(const r of [a,b,c])await seed.trust(r.node,roster);
const pass='synthetic rehearsal only 008';
const act=(r,x,req)=>seed.act(r.node,x,req,auth);
const send=async(from,to,decision='ADMIT')=>{const text=JSON.stringify(seed.packet(from.node));const staged=await api.stage(to,text,'fixture/packet.json');const before=to.node.events.length;assert.equal(to.node.events.length,before);await api.review(to,staged.id,decision);if(decision==='REFUSE')assert.equal(to.node.events.length,before);api.removeReviewed(to,staged.id);return staged};
await act(a,'need');await send(a,b);await send(a,c);
await act(b,'offer','req-kits');await act(c,'offer','req-delivery');await send(b,a);await send(c,a);
await act(a,'accept','req-kits');await act(a,'accept','req-delivery');await send(a,b);await send(a,c);
const pending=await api.stage(b,JSON.stringify(seed.packet(a.node)),'pending.json');
const oldFingerprints=await Promise.all([a,b,c].map(async r=>(await api.validate(r)).fingerprint));
const backups=await Promise.all([a,b,c].map(r=>api.backup(r,pass)));
const keyBytes=identity.b64url(new Uint8Array(await crypto.subtle.exportKey('pkcs8',b.node.keys.privateKey)));
for(const envelope of backups){assert.equal(envelope.schema,'mustard.root-encrypted/v1');assert(!JSON.stringify(envelope).includes('pkcs8'));assert(!JSON.stringify(envelope).includes(keyBytes))}
await assert.rejects(()=>api.restore(backups[0],'incorrect passphrase 008'));
const altered=structuredClone(backups[0]);altered.cipher.ciphertext=(altered.cipher.ciphertext[0]==='0'?'1':'0')+altered.cipher.ciphertext.slice(1);
await assert.rejects(()=>api.restore(altered,pass));
// Restore serialized ciphertext into new objects; discard all former active roots.
[a,b,c]=await Promise.all(backups.map(x=>api.restore(JSON.parse(JSON.stringify(x)),pass)));
assert.deepEqual(await Promise.all([a,b,c].map(async r=>(await api.validate(r)).fingerprint)),oldFingerprints);
assert.equal(b.inbox[0].id,pending.id);assert.equal(b.inbox[0].state,'HELD');
const n=b.node.events.length;await api.review(b,pending.id,'ADMIT');assert.equal(b.node.events.length,n);api.removeReviewed(b,pending.id);
await act(b,'report_complete','req-kits');await send(b,a);
await assert.rejects(()=>act(b,'confirm','req-kits'));
await act(a,'confirm','req-kits');await send(a,c);await act(c,'report_complete','req-delivery');await send(c,a);await act(a,'confirm','req-delivery');await send(a,b);await send(a,c);
for(const r of [a,b,c])assert.equal((await seed.project(r.node.events,r.node.roster,auth)).confirmed,2);
const before=a.node.events.length,bad=seed.packet(b.node);bad.events[0].payload.public.title='tampered';
const stagedBad=await api.stage(a,JSON.stringify(bad),'bad.json');await assert.rejects(()=>api.review(a,stagedBad.id,'ADMIT'));assert.equal(a.node.events.length,before);assert.equal(a.inbox.find(x=>x.id===stagedBad.id).state,'HELD');await api.review(a,stagedBad.id,'REFUSE');assert.equal(a.node.events.length,before);
const saved=await api.backup(a,pass),restored=await api.restore(saved,pass);assert.equal(restored.inbox.find(x=>x.id===stagedBad.id).state,'REFUSED');assert.equal((await seed.project(restored.node.events,restored.node.roster,auth)).confirmed,2);
const keySwap=await api.create('A');keySwap.node.keys.publicKey=a.node.keys.publicKey;await assert.rejects(()=>api.validate(keySwap));
const trace=structuredClone(a.trace);trace.find(x=>x.family==='attention').contact_ref='missing';assert.throws(()=>memento.validateUnderstoryRecords(trace));
await assert.rejects(()=>api.stage(a,'x'.repeat(60001),'oversized.json'));
assert(!JSON.stringify(seed.packet(a.node)).includes('pkcs8'));
const checks={recoveredIndependentKeys:3,continuedAfterRestore:true,confirmedFixtureContributions:2,wrongPassphraseRefused:true,tamperedCiphertextRefused:true,publicKeySubstitutionRefused:true,heldInboxSurvivedRestore:true,duplicateHistoryIdempotent:true,invalidPacketHeldWithoutMutation:true,explicitRefusalPreserved:true,mementoBrokenTraceRefused:true,oversizePacketRefused:true,publicPacketExcludesPrivateKey:true,actualAid:0,authenticatedHumanDeeds:0};
const parent=resolve(process.argv[2]),out=resolve(process.argv[3]),parentHtml=readFileSync(join(parent,'index.html'),'utf8'),parentReceipt=JSON.parse(readFileSync(join(parent,'receipt.json'),'utf8'));assert.equal(sha(parentHtml),parentReceipt.html_sha256);
const result={schema:'cannon.root-system/v1',classification:'FICTIONAL_ONLY',authority:'NONE',sourceWitnesses:source.map(x=>x.witness),parent_receipt_sha256:sha(readFileSync(join(parent,'receipt.json'))),checks,randomKeysCiphertextAndTimestampsOmitted:true,donorBoundary:'StaticID primitives only; Fileport local parser only; EXODUS original casebook core; MEMENTO original validator with filesystem imports removed for browser'};
const raw=readFileSync(new URL('./root.mjs',import.meta.url),'utf8').replace('export function createRootAPI','function createRootAPI');
const browser=source.filter(x=>['identity','fileport','memento'].includes(x.id)).map(({id,blob,content})=>({id,blob,content}));
const js='const rootSources='+JSON.stringify(browser).replaceAll('<','\\u003c')+';\n'+core+'\n'+raw+'\n'+readFileSync(new URL('./ui.js',import.meta.url),'utf8');
assert(!/<\/script/i.test(js));
const panel='<section class="panel" style="max-width:1060px;margin:1rem auto"><h2>Root System 008 / جڑیں</h2><p>Fictional rehearsal only. Select a role in Mustard Seed, then create a recoverable node here instead of the session-only node. Use a unique long passphrase. Private signing keys are exportable in active memory and encrypted in backups. Never share a backup or use real identities. Do not run two copies of one identity. Save after changes; older backups can omit later actions.</p><button id="root-create">Create recoverable node</button><label>Private backup passphrase (at least 14 characters)<input id="root-pass" type="password" autocomplete="new-password"></label><button id="root-save">Download encrypted backup</button> <button id="root-checkpoint">Save encrypted browser checkpoint</button><label>Restore backup file (optional; otherwise selected role checkpoint)<input id="root-file" type="file" accept=".json,application/json"></label><button id="root-stage-restore">Verify backup without adopting</button> <button id="root-adopt">Explicitly resume verified node</button><h3>Portable packet inbox</h3><p>Select a public packet file or paste a packet into the Mustard Seed transfer box. Review held packets before admission. Backup includes held packets and observation traces.</p><input id="root-packet-file" type="file" accept=".json,application/json"><button id="root-stage">Hold incoming packet</button><label>Review packet<select id="root-inbox"></select></label><button id="root-admit">Verify and admit selected packet</button> <button id="root-refuse">Refuse selected packet</button> <button id="root-remove">Remove reviewed packet</button><p id="root-status" role="status">No recoverable node.</p><pre id="root-summary" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre></section>';
const marker='</script></body></html>',last=parentHtml.lastIndexOf(marker);assert(last>=0);const html=parentHtml.slice(0,last)+'\n'+js+'\n</script>'+panel+'</body></html>';assert(html.includes('root-create')&&html.includes("connect-src 'none'"));
mkdirSync(out);writeFileSync(join(out,'index.html'),html,{flag:'wx'});writeFileSync(join(out,'receipt.json'),JSON.stringify({...result,html_sha256:sha(html)},null,2)+'\n',{flag:'wx'});console.log('ROOT_SYSTEM_008_OK',sha(html));
