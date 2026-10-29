/** Real integration test. Fails unless original donor Git checkouts are available.
 * Native CANNON source verification still checks exact original objects and live bytes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {createBootConsole} from '../src/boot-console.mjs';
const keys=['staticos','webz','gro','ghot','jarvis'];
const roots=Object.fromEntries(keys.map(x=>[x,process.env['GENESIS_'+x.toUpperCase()]]));
const outParent=process.env.GENESIS_OUTPUT_PARENT;
function post(url,path,nonce,body){return fetch(url+path,{method:'POST',headers:{
  'Content-Type':'application/json','Origin':url.slice(0,-1),'X-Genesis-Token':nonce
 },body:JSON.stringify(body)});}
test('actual local browser boot triggers original independent donor code, survives restart, and refuses forged result', {skip:!outParent}, async t=>{
 for(const k of keys)assert.ok(roots[k]&&existsSync(roots[k]),'REQUIRED_REAL_GIT_CHECKOUT_'+k);
 assert.ok(outParent,'OUTPUT_PARENT_REQUIRED');
 mkdirSync(outParent,{recursive:true});
 const app=createBootConsole({roots,outParent});
 let url=await app.start(0),st=await (await fetch(url+'api/status')).json();
 assert.equal(st.history.length,0);
 const question='Can a community house start from a Suitcase?';
 const res=await post(url,'api/compose',st.nonce,{question,acknowledgePublicSafe:true});
 assert.equal(res.status,201); // no mocked substitution
 // response body already consumed by assertion on failure? avoid calling res.json twice
 const result=await res.json();
 assert.equal(result.generated,true);
 const id=result.id;
 assert.match(await (await fetch(new URL(result.links.firstBoot,url))).text(),/What shall we build together/);
 assert.match(await (await fetch(new URL(result.links.comic,url))).text(),/A Room That Remembers/);
 const evidence=JSON.parse(readFileSync(join(outParent,id,'boot-receipt.json'),'utf8'));
 assert.equal(evidence.evidence.originalSourceCodeInvoked,true);
 assert.equal(evidence.evidence.physicalTestsCompleted,0);
 assert.equal(evidence.evidence.independentHumanStewards,0);
 assert.notEqual(evidence.results.A.planSha256,evidence.results.B.planSha256);
 const verified=await post(url,'api/verify',st.nonce,{id});
 assert.equal(verified.status,200);
 const outcome=await verified.json();
 assert.equal(outcome.status,'CROSS_BRANCH_NATIVE_COLD_REPLAY_VERIFIED');
 assert.equal(outcome.fieldStatus,'NOT_WITNESSED');
 await app.stop();
 const second=createBootConsole({roots,outParent});
 t.after(()=>second.stop());
 url=await second.start(0);st=await (await fetch(url+'api/status')).json();
 assert.ok(st.history.some(r=>r.id===id),'PERSISTENT_HISTORY_NOT_LOADED');
 const comic=join(outParent,id,'comic.html'),bytes=readFileSync(comic,'utf8');
 writeFileSync(comic,bytes+'\\nTAMPER');
 const tamper=await post(url,'api/verify',st.nonce,{id});
 assert.equal(tamper.status,422);
 writeFileSync(comic,bytes);
 const restored=await post(url,'api/verify',st.nonce,{id});
 assert.equal(restored.status,200);
});
