#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {evaluate,emit,coldVerify} from '../src/typed-compatibility.mjs';
const [cmd,...args]=process.argv.slice(2);
function parse(a){const out={};for(let i=0;i<a.length;i+=2){if(!a[i]?.startsWith('--')||!a[i+1]||Object.hasOwn(out,a[i].slice(2)))throw Error('INVALID_ARGUMENTS');out[a[i].slice(2)]=a[i+1];}return out;}
try{
 if(!['check','build','verify'].includes(cmd))throw Error('EXPECTED_CHECK_BUILD_VERIFY');
 const a=parse(args);if(!a.plan||!a.roots||(cmd!=='check'&&!a.out))throw Error('REQUIRED_PLAN_ROOTS_AND_OUTPUT');
 const load=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
 const plan=load(a.plan),roots=load(a.roots);
 const result=cmd==='check'?evaluate(plan,roots).report:cmd==='build'?emit(plan,roots,resolve(a.out)):coldVerify(plan,roots,resolve(a.out));
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,350));process.exitCode=2;}
