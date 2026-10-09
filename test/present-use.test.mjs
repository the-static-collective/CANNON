import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync,writeFileSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {validatePlan,readSource,compose,emit,coldVerify,now,PLAN_SCHEMA} from '../src/present-use.mjs';

const git=(dir,...args)=>execFileSync('git',['-C',dir,...args],{encoding:'utf8'}).trim();
function fixture() {
  const home=mkdtempSync(join(tmpdir(),'cannon003-'));
  const repos=['lab/source-a','lab/source-b'];
  const roots={}; const sources=[];
  repos.forEach((repo,i)=>{
    const root=join(home,'repo'+i);mkdirSync(root);
    git(root,'init','-q');
    git(root,'config','user.email','test@example.invalid');
    git(root,'config','user.name','CANNON lab');
    git(root,'remote','add','origin',`https://github.com/${repo}.git`);
    writeFileSync(join(root,'README.md'),`# ${repo}\n\nIndependent proof ${i}\n`);
    git(root,'add','README.md');git(root,'commit','-qm','lab source');
    const commit=git(root,'rev-parse','HEAD');
    roots[repo]=root;
    sources.push({id:'source-'+i,repository:repo,commit,path:'README.md',
      media_type:'text/markdown',tags:['lab','design',i===0?'first':'second']});
  });
  const plan={schema:PLAN_SCHEMA,goal:'lab design',assembly:'markdown-capsule-v0',sources};
  return {home,roots,plan,cleanup:()=>rmSync(home,{recursive:true,force:true})};
}
function change(f, fn) {try{fn(f);}finally{f.cleanup();}}

test('cross-repository genuine Git blobs produce independent deterministic artifact and fresh-process-equivalent replay',()=>{
  const f=fixture();change(f,()=>{
    const out=join(f.home,'out');
    const result=emit(f.plan,f.roots,out);
    assert.equal(result.sources.length,2);
    assert.equal(result.canon_selection_required,false);
    assert.equal(result.permission_granted,false);
    assert.equal(result.git_mutations,0);
    assert.match(readFileSync(join(out,'composition.md'),'utf8'),/Independent proof 1/);
    assert.equal(coldVerify(f.plan,f.roots,out).status,'COLD_REPLAY_VERIFIED');
    assert.deepEqual(compose(f.plan,f.roots).receipt,result);
  });
});

test('moving branch tip leaves earlier exact commit eligible; NO main requirement',()=>{
  const f=fixture();change(f,()=>{
    const before=compose(f.plan,f.roots).receipt;
    const root=f.roots['lab/source-a'];
    writeFileSync(join(root,'README.md'),'# replacement on branch\n');
    git(root,'add','README.md');git(root,'commit','-qm','branch moved');
    assert.notEqual(git(root,'rev-parse','HEAD'),f.plan.sources[0].commit);
    assert.deepEqual(compose(f.plan,f.roots).receipt,before);
  });
});

test('advisory availability reports HOLD rather than concealing a source',()=>{
  const f=fixture();change(f,()=>{
    const good=now(f.plan,f.roots,'design');
    assert.equal(good.composition_available,true);
    assert.equal(good.candidates.length,2);
    assert.equal(good.candidates[0].status,'VERIFIED_DOCUMENT_SOURCE');
    const withheld=now(f.plan,{'lab/source-a':f.roots['lab/source-a']},'design');
    assert.equal(withheld.composition_available,false);
    assert.equal(withheld.candidates.filter(c=>c.status==='HOLD').length,1);
  });
});

test('reject missing original commit, changed source SHA and forged origin',()=>{
  const f=fixture();change(f,()=>{
    const wrong=structuredClone(f.plan);wrong.sources[0].commit='1'.repeat(40);
    assert.throws(()=>compose(wrong,f.roots));
    const forged=structuredClone(f.plan);forged.sources[0].repository='imposter/repo';
    assert.throws(()=>compose(forged,{...f.roots,'imposter/repo':f.roots['lab/source-a']}),/DECLARED_GIT_ORIGIN_MISMATCH/);
    const replaced=structuredClone(f.plan);replaced.sources[0].path='not-there.md';
    assert.throws(()=>compose(replaced,f.roots));
  });
});

test('tampered artifact and receipt cannot pass cold replay',()=>{
  const f=fixture();change(f,()=>{
    const out=join(f.home,'out');emit(f.plan,f.roots,out);
    const artifact=join(out,'composition.md'),rec=join(out,'receipt.json');
    const pristine=readFileSync(artifact);
    writeFileSync(artifact,'# forged\n');
    assert.throws(()=>coldVerify(f.plan,f.roots,out),/COMPOSED_ARTIFACT_MISMATCH/);
    writeFileSync(artifact,pristine);
    const receipt=JSON.parse(readFileSync(rec));receipt.permission_granted=true;
    writeFileSync(rec,JSON.stringify(receipt));
    assert.throws(()=>coldVerify(f.plan,f.roots,out),/RECEIPT_REPLAY_MISMATCH/);
  });
});

test('failure never writes output and existing output cannot be overwritten',()=>{
  const f=fixture();change(f,()=>{
    const out=join(f.home,'out');
    const changed=structuredClone(f.plan);changed.sources[1].commit='b'.repeat(40);
    assert.throws(()=>emit(changed,f.roots,out));
    assert.equal(existsSync(out),false);
    emit(f.plan,f.roots,out);
    assert.throws(()=>emit(f.plan,f.roots,out),/OUTPUT_ALREADY_EXISTS/);
  });
});

test('strict plan refuses traversal, duplicates, undeclared formats, prototype-free extras, and single-source false composition',()=>{
  const f=fixture();change(f,()=>{
    const bads=[];
    let p=structuredClone(f.plan);p.sources[0].path='../private';bads.push(p);
    p=structuredClone(f.plan);p.sources[1].id=p.sources[0].id;bads.push(p);
    p=structuredClone(f.plan);p.sources[0].media_type='text/javascript';bads.push(p);
    p=structuredClone(f.plan);p.sources[0].authority='RUN_ANYTHING';bads.push(p);
    p=structuredClone(f.plan);p.sources.pop();bads.push(p);
    p=structuredClone(f.plan);p.canon='true';bads.push(p);
    for(const b of bads)assert.throws(()=>validatePlan(b));
  });
});

test('missing permission to claim deployment: no authority or execution admission fields exist',()=>{
  const f=fixture();change(f,()=>{
    const {receipt}=compose(f.plan,f.roots);
    assert.equal(receipt.permission_granted,false);
    assert.equal(receipt.deployments,0);
    assert.equal(receipt.remote_owner_authenticated,false);
    assert.ok(!Object.hasOwn(receipt,'grants'));
  });
});
