import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEMONPRESS,verifyPressDelivery,deliverToPress} from '../src/culture-delivery.mjs';
test('independent lemonPRESS original exact source has a fixed immutable pin',()=>{
 assert.equal(LEMONPRESS.commit,'f091e73d2f64b2237ee828010ae244b39e4070b8');
 assert.equal(LEMONPRESS.files.length,2);
 assert.ok(LEMONPRESS.files.includes('intake/held-culture.mjs'));
 const source=readFileSync(new URL('../src/culture-delivery.mjs',import.meta.url),'utf8');
 assert.match(source,/coldVerifyNative/);
 assert.match(source,/readSource/);
 assert.match(source,/receiver\.receiveLocal\(/);
 assert.match(source,/receiver\.coldVerifyLocal\(/);
 assert.doesNotMatch(source,/\bfetch\s*\(|https\.request\s*\(|spawn\s*\(|execSync\s*\(/);
});
test('unknown receiver disposition cannot dispatch',async()=>{
 const roots={webz:'/nothing',gro:'/nothing',press:'/nothing'};
 await assert.rejects(deliverToPress(roots,'/nothing','/nothing','ADMIT'),/UNKNOWN_RECEIVER_CHOICE/);
 await assert.rejects(verifyPressDelivery(roots,'/nothing','/nothing','PUBLISH'),/UNKNOWN_RECEIVER_CHOICE/);
});
test('an unconfigured original press donor fails closed before any file creation',async()=>{
 const roots={webz:'/nothing',gro:'/nothing',press:'/nothing'};
 await assert.rejects(deliverToPress(roots,'/nothing','/nothing','HOLD'));
});
