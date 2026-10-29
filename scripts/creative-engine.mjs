#!/usr/bin/env node
import {readFileSync,writeFileSync,existsSync,realpathSync,readdirSync,mkdirSync,lstatSync,renameSync,rmSync,mkdtempSync} from 'node:fs';
import {join,resolve,relative,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {buildEvidence,hold,verifyFiles} from '../src/creative-engine/core.mjs';
const BASE=resolve(import.meta.dirname,'..');
const owners=JSON.parse(readFileSync(join(BASE,'creative/owners.json')));
const room=JSON.parse(readFileSync(join(BASE,'creative/room-intent.json')));
const exec=(bin,args,opts={})=>execFileSync(bin,args,{encoding:'utf8',timeout:90000,maxBuffer:4000000,stdio:['ignore','pipe','pipe'],...opts}).trim();
function checkSource(name,path){
 const spec=owners.executed[name];hold(path&&existsSync(path),'SOURCE_MISSING:'+name);
 const root=realpathSync(path);
 hold(exec('git',['-C',root,'rev-parse','HEAD'])===spec.commit,'PIN_MISMATCH:'+name);
 const origin=exec('git',['-C',root,'remote','get-url','origin']);
 hold(origin.endsWith('/'+spec.repository+'.git')||origin.endsWith('/'+spec.repository)||origin.endsWith(':'+spec.repository+'.git'),'ORIGIN_MISMATCH:'+name);
 const dirt=exec('git',['-C',root,'status','--porcelain','--untracked-files=all']).split('\n').filter(Boolean);
 hold(dirt.every(l=>l.startsWith('?? node_modules/')),'SOURCE_DIRTY:'+name);
 return root;
}
function tree(dir,prefix=''){
 const out={};
 for(const x of readdirSync(dir,{withFileTypes:true})){
  const path=join(dir,x.name),key=prefix+x.name;
  hold(!x.isSymbolicLink(),'OUTPUT_SYMLINK');
  if(x.isDirectory())Object.assign(out,tree(path,key+'/'));
  else {hold(x.isFile(),'OUTPUT_TYPE');out[key]=readFileSync(path,'utf8')}
 }
 return out;
}
function prepare(roots,temp){
 const ironRoot=checkSource('ironlung',roots.ironlung),liveRoot=checkSource('staticlive',roots.staticlive);
 const iron=JSON.parse(exec('npm',['run','first-breath','--silent'],{cwd:ironRoot}));
 const stageDir=join(temp,'stage-tmp');mkdirSync(stageDir);
 exec(process.execPath,['src/cli.js','compile','fixtures/live-001/song.json','fixtures/live-001/configurations/sc2.json','--out',stageDir],{cwd:liveRoot});
 const stage=JSON.parse(readFileSync(join(stageDir,'projection.json')));
 const aids={'stage/setlist.md':readFileSync(join(stageDir,'setlist.md'),'utf8'),'stage/routing.md':readFileSync(join(stageDir,'routing.md'),'utf8')};
 return buildEvidence({owners,room,iron,stage,aids});
}
function main(){
 const [mode,...a]=process.argv.slice(2);
 hold(['build','verify'].includes(mode)&&a.length%2===0,'USAGE');
 const opts={};for(let i=0;i<a.length;i+=2){hold(['--roots','--out','--authorize'].includes(a[i])&&!Object.hasOwn(opts,a[i])&&a[i+1],'FLAGS');opts[a[i]]=a[i+1]}
 hold(opts['--roots']&&opts['--out'],'MISSING_ARGS');
 hold(mode==='build'?opts['--authorize']==='LOCAL_FICTIONAL_ONLY':!opts['--authorize'],'AUTHORIZATION_BOUNDARY');
 const roots=JSON.parse(readFileSync(resolve(opts['--roots']),'utf8'));
 hold(Object.keys(roots).sort().join(',')==='ironlung,staticlive','ROOT_ALLOWLIST');
 const out=resolve(opts['--out']),parent=realpathSync(dirname(out));
 hold(join(parent,out.split('/').at(-1))===out,'OUTPUT_PARENT_SYMLINK');
 for(const p of Object.values(roots)){const r=relative(realpathSync(p),out);hold(r!==''&&(r==='..'||r.startsWith('../')||r.startsWith('..\\')),'OUTPUT_INSIDE_SOURCE')}
 hold(mode==='build'?!existsSync(out):existsSync(out)&&lstatSync(out).isDirectory()&&!lstatSync(out).isSymbolicLink(),'OUTPUT_STATE');
 const tmp=mkdtempSync(join(parent,'.creative-001-'));
 try{
  const {files,receipt}=prepare(roots,tmp);
  if(mode==='verify')verifyFiles(files,tree(out));
  else{
   for(const [p,bytes] of Object.entries(files)){const dest=join(tmp,'packet',p);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,bytes,{flag:'wx'})}
   renameSync(join(tmp,'packet'),out);
  }
  console.log(JSON.stringify({status:mode==='build'?'TWO_NATIVE_OWNERS_EXECUTED':'FRESH_PROCESS_BYTE_REPLAY_VERIFIED',receiptId:receipt.receiptId,privateRoomExecuted:false,fieldVerified:false},null,2));
 }finally{rmSync(tmp,{recursive:true,force:true})}
}
try{main()}catch(e){console.error('HOLD / REFUSE:',String(e.stderr||e.message).slice(0,800));process.exitCode=2}
