import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {renderDesk} from '../src/arcade/view.mjs';
function browserFixture(){
 const scene={stages:[],composition:{gates:[]},status:'FIXTURE'};
 const model={manifest:{coverage:{executingNativeDonorRepositories:22,verifiedSourceRepositories:64}},receipt:{receiptId:'fixture'},scenes:Object.fromEntries(['mit','voqal','garden','jubilee','commons'].map(m=>[m,scene])),gates:{}};
 const html=renderDesk(model),encoded=html.match(/<script id="machine-data" type="application\/json">([\s\S]*?)<\/script>/)[1],script=html.match(/<\/script><script>([\s\S]*?)<\/script>/)[1];
 const elements=new Map();
 const el=id=>{if(!elements.has(id))elements.set(id,{checked:false,disabled:false,value:({receiver:'HOLD',variant:'A',secondary:'jubilee'})[id],textContent:id==='machine-data'?encoded:'',classList:{toggle(){}},replaceChildren(){},append(){},addEventListener(type,f){this[type]=f}});return elements.get(id)};
 const door={...el('door'),dataset:{mission:'voqal'},setAttribute(){}};const action={...el('action'),dataset:{action:'run'}};
 let release;const calls=[];
 const context={document:{getElementById:el,querySelectorAll:s=>s==='.door'?[door]:s==='[data-action]'?[action]:[],createElement:()=>({append(){}})},location:{protocol:'http:'},fetch:(path,opts)=>{calls.push({path,body:JSON.parse(opts.body)});if(path==='/api/session')return new Promise(resolve=>{release=()=>resolve({ok:true,json:async()=>({id:'s-fixture',token:'test'})})});return Promise.resolve({ok:true,json:async()=>({status:'LOCAL_SOFTWARE_COMPLETE',receiptId:'fixture'})})},URL,Blob,setTimeout,window:{}};
 vm.createContext(context);vm.runInContext(script,context);el('authorize').checked=true;
 return {el,door,calls,release:()=>release(),run:()=>vm.runInContext("perform('run')",context)};
}
test('browser revoke remains usable while native session or computation is pending',async()=>{
 const f=browserFixture(),pending=f.run();assert.equal(f.el('revoke').disabled,false);f.release();await pending;
});
test('mission switch invalidates pending authorization before any native challenge dispatch',async()=>{
 const f=browserFixture(),pending=f.run();f.door.click();assert.equal(f.el('authorize').checked,false);f.release();await pending;assert.equal(f.calls.filter(c=>c.path==='/api/challenge').length,0);
});
test('revocation during session creation revokes the eventual session and dispatches no challenge',async()=>{
 const f=browserFixture(),pending=f.run();await f.el('revoke').click();f.release();await pending;assert.equal(f.calls.filter(c=>c.path==='/api/challenge').length,0);assert.equal(f.calls.filter(c=>c.path==='/api/revoke').length,1);assert.match(f.el('status').textContent,/REFUSE/);
});
test('changing a fixture choice invalidates the selected request before dispatch',async()=>{
 const f=browserFixture(),pending=f.run();f.el('variant').value='NO_POWER';f.el('variant').change?.();f.release();await pending;assert.equal(f.calls.filter(c=>c.path==='/api/challenge').length,0);
});
