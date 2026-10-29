import test from 'node:test';
import assert from 'node:assert/strict';
import {makeZine,verifyNativeSources,composeNative,SCHEMA} from '../src/culture-forge.mjs';
import {readFileSync} from 'node:fs';
test('actual six-panel authored output escapes arbitrary input and is print-ready',()=>{
 const sample={schema:'abundent.matter-idea-craft/v1',economicProjection:{material:{recognizedSpendable:0},penny:{issued:0}},
  lawfulCrossings:{fullMeasure:{deeds:0}}};
 const grO={schema:'gro.mattercraft-field-projection/v0',observations:{recognizedSpendableQuantity:0,discrepancy:'COUNTS_DISAGREE_HOLD'}};
 const html=makeZine('<script>alert(1)</script> & neighbors',sample,grO);
 assert.equal((html.match(/class="panel"/g)||[]).length,6);
 assert.ok(html.includes('@media print'));assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>alert(1)</script>'));
 assert.match(html,/No GrO trace|PENNY/);
});
test('fabricated rights or economics cannot appear as success',()=>{
 const w={schema:'abundent.matter-idea-craft/v1',economicProjection:{material:{recognizedSpendable:1},penny:{issued:0}},
  lawfulCrossings:{fullMeasure:{deeds:0}}};
 const g={schema:'gro.mattercraft-field-projection/v0',observations:{recognizedSpendableQuantity:0,discrepancy:'COUNTS_DISAGREE_HOLD'}};
 assert.throws(()=>makeZine('Idea',w,g),/FAKE_MATERIAL_INVENTORY/);
 w.economicProjection.material.recognizedSpendable=0;w.economicProjection.penny.issued=1;
 assert.throws(()=>makeZine('Idea',w,g),/FAKE_PENNY_ISSUANCE/);
 w.economicProjection.penny.issued=0;g.observations.discrepancy='CLAIMS_AGREE_BUT_UNVERIFIED';
 assert.throws(()=>makeZine('Idea',w,g),/DISPUTE_WAS_LAUNDERED/);
});
test('the donor source verifier refuses unconfigured or forged roots',()=>{
 assert.throws(()=>verifyNativeSources({webz:'/tmp'}),/REQUIRE_TWO_INDEPENDENT_ORIGINAL_REPOS/);
 assert.throws(()=>verifyNativeSources({webz:'/tmp',gro:'/tmp'}));
});
test('runtime includes exact original Git pins and creates no automatic external action',()=>{
 const src=readFileSync(new URL('../src/culture-forge.mjs',import.meta.url),'utf8');
 assert.match(src,/83b35070d8d56155156655279bfdcf50aa77794f/);
 assert.match(src,/9e6361105aae335ccb0657092809eef43e7ab4da/);
 assert.match(src,/composeMatterIdeaCraft/);
 assert.match(src,/projectMattercraftEncounter/);
 assert.equal(SCHEMA,'cannon.culture-forge-receipt/v1');
 assert.doesNotMatch(src,/\bfetch\s*\(|https\.request\s*\(|spawn\s*\(|execSync\s*\(/);
});
