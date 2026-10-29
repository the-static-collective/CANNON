import test from 'node:test';
import assert from 'node:assert/strict';
import {validateChallenge,validateDag,executeDag} from '../src/arcade/contracts.mjs';
const request={schema:'arcade.challenge/v1',mission:'garden',action:'run',authorized:true,receiver:'HOLD',variant:'A',secondary:'jubilee',requestId:'challenge-001'};
test('finite local request cannot inject arbitrary code, paths, contacts, grants or physical claims',()=>{
 assert.deepEqual(validateChallenge(request),request);
 for(const p of [{action:'shell'},{mission:'external'},{variant:'../../etc/passwd'},{contact:'person'},{physicalVerified:true},{authorized:'yes'},{requestId:'../../escape'}])assert.throws(()=>validateChallenge({...request,...p}));
});
test('denied consent, revoked sessions and receiver refusal cannot gain execution authority',()=>{
 assert.throws(()=>validateChallenge({...request,authorized:false}),/CONSENT/);
 assert.throws(()=>validateChallenge({...request,receiver:'ADMIT_FIELD'}));
});
const dag={schema:'arcade.dag/v1',nodes:[{id:'root',owner:'corpus',parents:[],out:'sources/v1',inputs:[]},{id:'policy',owner:'project0',parents:['root'],out:'policy/v1',inputs:[{from:'root',schema:'sources/v1'}]},{id:'graph',owner:'freegraph',parents:['root'],out:'graph/v1',inputs:[{from:'root',schema:'sources/v1'}]},{id:'join',owner:'tranch',parents:['policy','graph'],out:'closure/v1',inputs:[{from:'policy',schema:'policy/v1'},{from:'graph',schema:'graph/v1'}]}]};
test('typed DAG refuses cycles, missing edges, duplicate identities and wrong contract mappings',()=>{
 assert.equal(validateDag(dag),dag);
 for(const mutate of [d=>d.nodes[0].parents.push('join'),d=>d.nodes[2].inputs[0].schema='policy/v1',d=>d.nodes[2].parents.push('missing'),d=>d.nodes[3].id='root',d=>d.nodes[3].inputs.pop()]){const d=structuredClone(dag);mutate(d);assert.throws(()=>validateDag(d));}
});
test('actual fan-out/fan-in records intermediate bytes and refuses partial native stage errors',async()=>{
 const functions={root:()=>({records:['exact-source']}),policy:({root})=>({gate:root.records.length}),graph:({root})=>({nodes:root.records.map(id=>({id}))}),join:({policy,graph})=>({closed:policy.gate===graph.nodes.length})};
 const output=await executeDag(dag,functions);assert.equal(output.results.join.closed,true);
 assert.equal(output.stages.length,4);assert.match(output.stages[3].outputSha256,/^sha256:/);
 await assert.rejects(executeDag(dag,{...functions,graph:()=>{throw Error('PARTIAL_NATIVE_FAILURE')}}),/PARTIAL_NATIVE_FAILURE/);
});

test('a native stage may not silently serialize nonfinite or missing values as valid evidence',async()=>{
 const plan={schema:'arcade.dag/v1',nodes:[{id:'root',owner:'fixture',parents:[],out:'fixture/v1',inputs:[]}]};
 for(const output of [{count:Infinity},{count:NaN},{missing:undefined},new Date()])await assert.rejects(executeDag(plan,{root:()=>output}),/NON_JSON/);
});
test('cold packet verification refuses an added empty directory',async()=>{
 const {compareFiles}=await import('../src/arcade/packet.mjs');const {mkdtempSync,writeFileSync,mkdirSync,rmSync}=await import('node:fs');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const root=mkdtempSync(join(tmpdir(),'arcade-extra-dir-'));try{writeFileSync(join(root,'a.json'),'{}');mkdirSync(join(root,'unexpected'));assert.throws(()=>compareFiles(root,{'a.json':'{}'}),/FILE_SET/)}finally{rmSync(root,{recursive:true,force:true})}
});
