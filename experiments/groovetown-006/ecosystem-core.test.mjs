import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture,compare} from './ecosystem-core.mjs';
test('no invention, each singly, and together use original 005 bounded solver',()=>{
 const r=compare();assert.equal(r.conclusive,true);assert.deepEqual(r.portfolios.map(x=>x.goals),[1,3,2,4]);
 assert.equal(r.extraBeyondStrongestSingle,1);assert.equal(r.physicalCredits,0);
});
test('shared platform is consumed once and gives two distinct route opportunities',()=>{
 const r=compare();const steps=r.portfolios.at(-1).steps;
 assert.equal(steps.filter(x=>x.kind==='INVENT'&&x.id==='recipe-platform').length,1);
 assert.equal(steps.filter(x=>x.kind==='INVENT'&&x.id==='recipe-return').length,1);
 assert.equal(steps.filter(x=>x.kind==='INVENT'&&x.id==='recipe-outbound').length,1);
});
test('one slot cannot be duplicated across two invented routes',()=>{
 const s=fixture();s.recipes.find(x=>x.id==='recipe-platform').output.quantity=1;
 const r=compare(s);assert.equal(r.portfolios.at(-1).goals,3);
});
test('outside authority is rejected',()=>{
 const s=fixture();s.recipes.find(x=>x.id==='recipe-outbound').authority='ACTUAL_DEPLOYMENT';
 assert.throws(()=>compare(s),/authorized|authority/i);
});
test('strict bounds refuse falsely conclusive rankings',()=>{
 const r=compare(fixture(),{maxStates:10});
 assert.equal(r.conclusive,false);assert.equal(r.extraBeyondStrongestSingle,null);
});
