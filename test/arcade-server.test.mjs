import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {serveMachine} from '../src/arcade/server.mjs';
const configPath=process.env.ARCADE_CONFIG,packetPath=process.env.ARCADE_PACKET;
test('loopback machine has origin/token gates, real native challenge, durable idempotency and restart-safe revocation', {skip:!configPath||!packetPath?'Acquired ARCADE_CONFIG and built ARCADE_PACKET required':false},async()=>{
 const home=mkdtempSync(join(tmpdir(),'arcade-server-'));let service;
 try{
  service=await serveMachine({configPath,packetPath,sessionsPath:join(home,'sessions'),port:0});const base='http://127.0.0.1:'+service.port;
  assert.equal(service.server.address().address,'127.0.0.1');
  const post=(url,data,token,origin=base)=>fetch(base+url,{method:'POST',headers:{origin,'content-type':'application/json',...(token?{'x-arcade-token':token}:{})},body:JSON.stringify(data)});
  assert.equal((await post('/api/session',{authorized:true,scope:'LOCAL_FICTIONAL_ONLY'},null,'https://other.example')).status,403);
  assert.equal((await post('/api/session',{authorized:false,scope:'LOCAL_FICTIONAL_ONLY'})).status,400);
  const a=await post('/api/session',{authorized:true,scope:'LOCAL_FICTIONAL_ONLY'}),session=await a.json();assert.equal(a.status,200);
  const request={schema:'arcade.challenge/v1',mission:'commons',action:'run',authorized:true,receiver:'HOLD',variant:'NO_POWER',secondary:'jubilee',requestId:session.id+'-one'};
  assert.equal((await post('/api/challenge',request,'wrong')).status,403);
  const first=await post('/api/challenge',request,session.token),result=await first.json();assert.equal(first.status,200);assert.equal(result.status,'HOLD_UNAVAILABLE_POWER');
  const duplicate=await post('/api/challenge',request,session.token);assert.equal((await duplicate.json()).receiptId,result.receiptId);
  assert.equal((await post('/api/challenge',{...request,variant:'B'},session.token)).status,409);
  assert.equal((await post('/api/revoke',{},session.token)).status,200);
  assert.equal((await post('/api/challenge',{...request,requestId:session.id+'-two'},session.token)).status,403);
  await service.close();service=await serveMachine({configPath,packetPath,sessionsPath:join(home,'sessions'),port:0});
  const base2='http://127.0.0.1:'+service.port;
  const r=await fetch(base2+'/api/challenge',{method:'POST',headers:{origin:base2,'content-type':'application/json','x-arcade-token':session.token},body:JSON.stringify({...request,requestId:session.id+'-three'})});assert.equal(r.status,403);
  const journal=readFileSync(join(home,'sessions/journal.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.equal(journal.filter(e=>e.kind==='RESULT').length,1);assert.equal(journal.filter(e=>e.kind==='REVOKE').length,1);
 }finally{if(service)await service.close();rmSync(home,{recursive:true,force:true})}
});
