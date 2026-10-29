/** Pure local HTTP/interaction contract tests (stub composer).
 * Separate native CI test actually invokes the five exact Git donor checkouts.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createBootConsole} from '../src/boot-console.mjs';

async function start(t){
 const temp=mkdtempSync(join(tmpdir(),'cannon-first-boot-contract-'));
 const donorKeys=['staticos','webz','gro','ghot','jarvis'],roots={};
 for(const key of donorKeys){roots[key]=join(temp,key);mkdirSync(roots[key]);}
 const outputs=join(temp,'outputs');mkdirSync(outputs);
 let calls=0;
 const compose=async(_roots,out,request)=>{
  calls+=1;assert.equal(request.scenario,'FICTIONAL_A_B');
  mkdirSync(out);
  writeFileSync(join(out,'first-boot.html'),'<h1>HELLO, WORLD.</h1>');
  const receipt={schema:'cannon.genesis-boot-cross-branch/v1',
   disposition:'EXECUTED_ORIGINAL_SOURCE_CODE_HOLD_ONLY',
   receiptSha256:'sha256:fake-test-only',
   sampleType:'FICTIONAL_SITES_A_B_NOT_INDEPENDENT_HUMANS',
   evidence:{generatedHousePlans:2}};
  writeFileSync(join(out,'boot-receipt.json'),JSON.stringify(receipt));
  return receipt;
 };
 const verify=async(_roots,out)=>{
  const bytes=readFileSync(join(out,'first-boot.html'),'utf8');
  if(bytes!=='<h1>HELLO, WORLD.</h1>')throw Error('COLD_VERIFY_REFUSED');
  return {status:'CROSS_BRANCH_NATIVE_COLD_REPLAY_VERIFIED',sourceRepos:5,housePlans:2,noPhysicalActs:true};
 };
 const app=createBootConsole({roots,outParent:outputs,compose,verify});
 const url=await app.start(0);
 t.after(async()=>{await app.stop();rmSync(temp,{recursive:true,force:true})});
 const status=await (await fetch(url+'api/status')).json();
 return {url,nonce:status.nonce,outputs,calls:()=>calls};
}
function post(url,path,nonce,body,overrides={}){
 return fetch(url+path,{method:'POST',
  headers:{'Content-Type':'application/json','X-Genesis-Token':nonce,'Origin':url.slice(0,-1),
    ...overrides},
  body:JSON.stringify(body)});
}
test('boot console loads an actual local HTML + JS, no startup execution, prior crossing shelf',async t=>{
 const env=await start(t);
 const page=await fetch(env.url),source=await fetch(env.url+'first-boot.js');
 assert.equal(page.status,200);
 assert.match(await page.text(),/Hello, <em>world/);
 assert.match(await source.text(),/\/api\/compose/);
 assert.match(page.headers.get('content-security-policy'),/script-src 'self'/);
 const s=await (await fetch(env.url+'api/status')).json();
 assert.equal(s.physicalProof,'NONE');assert.equal(s.independentOperators,'NONE');
 assert.equal(s.bridgeShelf.length,4);
 assert.equal(s.history.length,0);assert.equal(env.calls(),0);
});
test('strict loopback, csrf and explicit review gate; executable request remains bounded',async t=>{
 const env=await start(t);
 const request={question:'Can the house help its neighbors?',acknowledgePublicSafe:true};
 assert.equal((await fetch(env.url+'api/status',{headers:{Host:'wrong.example'}})).status,403);
 assert.equal((await post(env.url,'api/compose','wrong',request)).status,403);
 assert.equal((await fetch(env.url+'api/compose',{method:'POST',body:JSON.stringify(request),
  headers:{'Content-Type':'application/json','X-Genesis-Token':env.nonce}})).status,403);
 assert.equal((await post(env.url,'api/compose',env.nonce,{...request,acknowledgePublicSafe:false})).status,422);
 assert.equal((await post(env.url,'api/compose',env.nonce,{...request,question:'a'.repeat(241)})).status,422);
 assert.equal(env.calls(),0);
 const response=await post(env.url,'api/compose',env.nonce,request);
 assert.equal(response.status,201);
 const created=await response.json();
 assert.match(created.id,/^genesis-/);
 assert.equal(env.calls(),1);
 assert.equal(created.generated,true);
 assert.equal((await fetch(env.url+created.links.firstBoot)).status,200);
 assert.equal((await fetch(env.url+'runs/../secrets')).status,404);
 assert.equal((await fetch(env.url+'runs/'+created.id+'/../../hosts')).status,404);
 const history=await (await fetch(env.url+'api/status')).json();
 assert.equal(history.history.length,1);assert.equal(history.history[0].simulated,true);
 const proof=await post(env.url,'api/verify',env.nonce,{id:created.id});
 assert.equal(proof.status,200);
 const result=await proof.json();assert.equal(result.fieldStatus,'NOT_WITNESSED');
 writeFileSync(join(env.outputs,created.id,'first-boot.html'),'TAMPERED');
 const failed=await post(env.url,'api/verify',env.nonce,{id:created.id});
 assert.equal(failed.status,422);
});
test('no arbitrary file paths, no unknown POST endpoint, no oversized structured payload',async t=>{
 const env=await start(t);
 const x=await fetch(env.url+'api/compose',{method:'POST',
  headers:{'Content-Type':'application/json','X-Genesis-Token':env.nonce,'Origin':env.url.slice(0,-1)},
  body:JSON.stringify({question:'hi',acknowledgePublicSafe:true,extra:'auto execute'})});
 assert.equal(x.status,422);
 const postNotAuthorized=await post(env.url,'api/execute',env.nonce,{command:'rm'});
 assert.equal(postNotAuthorized.status,405);
 assert.equal((await post(env.url,'api/verify',env.nonce,{id:'../other'})).status,422);
});
