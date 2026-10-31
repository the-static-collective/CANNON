import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const html=readFileSync(new URL('../examples/first-knock-001.html',import.meta.url),'utf8');
const digest=x=>createHash('sha256').update(x).digest('hex');
const knownFixture='b503785d416c0b0bf28cd2a200d739aa90c625e01c2dcbbdf4c86e039f3a5c5e';
function browser(){
  const handlers={}, els={};let printed=0,downloads=0,validity='';
  for(const id of ['knock-form','sentence','card','actions','card-kind','card-message','print','save']){
    els[id]={hidden:true,textContent:'',value:'',classList:{add(c){this.last=c}},
      addEventListener(k,fn){handlers[id+':'+k]=fn},scrollIntoView(){},
      setCustomValidity(x){validity=x},reportValidity(){}};
  }
  els['knock-form'].querySelector=()=>({value:'NEED'});
  const doc={getElementById:id=>els[id],createElement:()=>({click(){downloads++}})};
  const URL={createObjectURL:()=> 'blob:local',revokeObjectURL:()=>{}};
  const script=html.split('<script>')[1]?.split('</script>')[0];
  assert.ok(script,'inline offline script exists');
  vm.runInNewContext(script,{document:doc,URL,Blob,setTimeout:fn=>fn(),window:{print(){printed++}}});
  return {els,handlers,metrics:()=>({printed,downloads,validity})};
}
test('exact source fixture remains reproducible',()=>assert.equal(digest(html),knownFixture));
test('no external resources, telemetry, network fetch, or claim of contact',()=>{
  assert.match(html,/Nothing gets sent/);
  assert.match(html,/DRAFT — READY FOR A HUMAN/);
  assert.doesNotMatch(html,/<script\s+src|<iframe|<link\s+rel="stylesheet"|fetch\(|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage/i);
});
test('one real human input creates a visible unsent card, with no contact',()=>{
  const b=browser();b.els.sentence.value='Can somebody bring two chairs?';
  b.handlers['knock-form:submit']({preventDefault(){}});
  assert.equal(b.els['card-message'].textContent,'Can somebody bring two chairs?');
  assert.equal(b.els['card-kind'].textContent,'NEED');
  assert.equal(b.els.card.classList.last,'visible');
  assert.equal(b.els.actions.hidden,false);
  assert.equal(b.metrics().printed,0);
  b.handlers['print:click']();b.handlers['save:click']();
  assert.equal(b.metrics().printed,1);assert.equal(b.metrics().downloads,1);
});
test('untrusted text becomes textContent and control characters refuse',()=>{
  const b=browser();b.els.sentence.value='<img src=x onerror=alert(1)>';
  b.handlers['knock-form:submit']({preventDefault(){}});
  assert.equal(b.els['card-message'].textContent,'<img src=x onerror=alert(1)>');
  b.els.sentence.value='line1\nline2';
  b.handlers['knock-form:submit']({preventDefault(){}});
  assert.match(b.metrics().validity,/without control characters/);
});
