import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { audit } from '../labs/living-commons-001/breath-audit.mjs';
import { renderFieldKit } from '../labs/living-commons-001/field-kit.mjs';
import { inspect } from '../labs/living-commons-001/engine.mjs';
const base=new URL('../labs/living-commons-001/',import.meta.url);
const load=name=>JSON.parse(readFileSync(new URL(name,base),'utf8'));
const census=load('community-breath-census.json');
const registry=load('source-registry.json');
const scene=load('fictional-case.json');
const clone=value=>structuredClone(value);

test('025: inventory counts describe observations, not readiness',()=>{
 const a=audit(census,registry);
 assert.equal(a.inventory.total,102);
 assert.equal(a.inventory.readmeInspectedOnly,26);
 assert.equal(a.inventory.metadataOnly,76);
 assert.equal(a.inventory.listed,100);
 assert.equal(a.inventory.additionalDirectReads,2);
 assert.equal(a.sourceRegistry.potentialDirectedPairs,64);
 assert.equal(a.sourceRegistry.actualValidatedInteroperableAdapters,0);
 assert.equal(a.operationalReady,'NOT_ASSESSED');
 assert.equal(a.communityAuthorized,false);
 assert.equal(a.permitsPublication,false);
});
test('025: duplicate projects cannot masquerade as distinct community donors',()=>{
 const x=clone(census);x.repositories.push(clone(x.repositories[0]));
 assert.throws(()=>audit(x,registry),/duplicate repository/);
});
test('025: any unsolicited personal or live-status field is rejected',()=>{
 const x=clone(census);x.repositories[0].contact='private@example.test';
 assert.throws(()=>audit(x,registry),/personal-data-shaped field/);
 const y=clone(census);y.repositories[0].observation='LIVE_DEPLOYED';
 assert.throws(()=>audit(y,registry),/no inferred runtime/);
});
test('025: a README does not turn unknown deployment into truth',()=>{
 const x=clone(census);const k=x.repositories.findIndex(r=>r.observation==='METADATA_ONLY');
 x.repositories[k].observation='README_INSPECTED_ONLY';
 assert.throws(()=>audit(x,registry),/README evidence/);
});
test('025: source interface cannot silently become authorized',()=>{
 const x=clone(registry);x.organs[0].interface='LIVE';
 assert.throws(()=>audit(census,x),/no live adapter/);
});
test('025: printable sheet needs no invented QR, endpoint, network or signup',()=>{
 const html=renderFieldKit(inspect(scene,registry),audit(census,registry));
 assert.match(html,/@page\{size:8in 10in/);
 assert.equal((html.match(/<section class="card"/g)||[]).length,6);
 assert.ok(!/<a\s|https?:\/\/|<script|<form|<img/i.test(html));
 assert.match(html,/Silence is not consent/);
 assert.match(html,/No account, scan, app or QR required/);
});
test('025: fake operational authorization refuses printing',()=>{
 const x=audit(census,registry);x.communityAuthorized=true;
 assert.throws(()=>renderFieldKit(inspect(scene,registry),x),/synthetic non-operational/);
});
test('024 + 025: care receipt never licenses culture',()=>{
 const p=inspect(scene,registry);
 assert.equal(p.care.status,'CONFIRMED_FIXTURE');
 assert.equal(p.culture.status,'EDITORIAL_REVIEW_ELIGIBLE_FIXTURE');
 assert.equal(p.currentSeparation.careConfirmationDoesNotLicenseMusic,true);
 assert.equal(p.physicalEffect,'NONE');
});
