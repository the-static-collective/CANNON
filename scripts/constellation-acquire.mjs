#!/usr/bin/env node
/** Explicit acquisition only. Build/replay never clone, fetch or install. */
import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync,realpathSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SELECTION,checkSource} from '../src/constellation/sources.mjs';
const args=process.argv.slice(2);
try{
 if(args.length!==2||args[0]!=='--into')throw Error('USAGE: constellation-acquire.mjs --into NEW_DIRECTORY');
 const into=resolve(args[1]);if(existsSync(into))throw Error('ACQUISITION_DIRECTORY_EXISTS');mkdirSync(into,{mode:0o700});
 const roots={};
 for(const [id,s] of Object.entries(SELECTION.sources)){
  const dest=join(into,id);roots[id]=dest;
  execFileSync('git',['init','-q',dest],{stdio:'inherit'});
  execFileSync('git',['-C',dest,'remote','add','origin','https://github.com/'+s.repository+'.git'],{stdio:'inherit'});
  execFileSync('git',['-C',dest,'fetch','--depth=1','origin',s.commit],{stdio:'inherit',timeout:120000});
  execFileSync('git',['-C',dest,'checkout','--detach','FETCH_HEAD'],{stdio:'inherit'});checkSource(s,dest);
 }
 // Acquire only the exact runtime dependency, with lifecycle scripts disabled.
 // Installation is explicit here; neither build nor verifier can request it.
 execFileSync('npm',['install','--ignore-scripts','--omit=dev','--package-lock=false'],{cwd:roots.relatte,stdio:'inherit',timeout:120000});
 const manifest=join(into,'roots.json');writeFileSync(manifest,JSON.stringify(roots,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({status:'ACQUIRED_EXACT_PINS',roots:manifest,networkRequiredAfterAcquisition:false},null,2));
}catch(error){console.error('HOLD_ACQUISITION:',error.message);process.exitCode=2}
