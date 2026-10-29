#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateRegistry,makeGuestConcourse,verifyConcourse} from '../src/concourse/guest-dealer.mjs';
const base=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const registry=validateRegistry(JSON.parse(readFileSync(join(base,'constellation/guests-003.json'),'utf8')));
function runGit(args){
 return execFileSync('git',args,{timeout:90000,encoding:'utf8',
  env:{...process.env,GIT_TERMINAL_PROMPT:'0',GIT_NO_REPLACE_OBJECTS:'1'},
  maxBuffer:2_000_000}).trim()
}
function options(argv){
 const [action,...rest]=argv,flags={};
 if(!['acquire','build','verify'].includes(action)||rest.length%2)throw Error('HOLD_COMMAND');
 for(let i=0;i<rest.length;i+=2){
  if(!['--into','--sources','--out'].includes(rest[i])||!rest[i+1]||Object.hasOwn(flags,rest[i]))
   throw Error('HOLD_FLAGS');
  flags[rest[i]]=resolve(rest[i+1]);
 }
 const expected=action==='acquire'?['--into']:['--sources','--out'];
 if(Object.keys(flags).sort().join('|')!==expected.sort().join('|'))throw Error('HOLD_ACTION_FLAGS');
 return {action,flags};
}
function acquire(out){
 if(existsSync(out))throw Error('HOLD_DESTINATION_ALREADY_EXISTS');
 mkdirSync(out,{recursive:true,mode:0o700});
 const roots={};
 for(const g of registry.guests){
  const dir=join(out,g.guestId),url='https://github.com/'+g.repository+'.git';
  runGit(['clone','--no-tags','--filter=blob:none','--depth','1',url,dir]);
  if(runGit(['-C',dir,'rev-parse','HEAD'])!==g.commit){
   runGit(['-C',dir,'fetch','--no-tags','--depth','1','origin',g.commit]);
   runGit(['-C',dir,'checkout','--detach',g.commit]);
  }
  if(runGit(['-C',dir,'rev-parse','HEAD'])!==g.commit)
   throw Error('HOLD_WRONG_SOURCE_'+g.guestId);
  roots[g.guestId]=realpathSync(dir);
  process.stderr.write(g.guestId+' '+g.repository+' OK\n');
 }
 writeFileSync(join(out,'sources.json'),JSON.stringify(roots,null,2)+'\n',{flag:'wx'});
 return {status:'ACQUIRED_EXACT_22_PUBLIC_SOURCES',sources:join(out,'sources.json')};
}
function build(flags){
 const roots=JSON.parse(readFileSync(flags['--sources'],'utf8'));
 const packet=makeGuestConcourse({registry,roots});
 if(existsSync(flags['--out']))throw Error('HOLD_REUSE_OUTPUT');
 mkdirSync(flags['--out'],{recursive:false,mode:0o700});
 writeFileSync(join(flags['--out'],'packet.json'),JSON.stringify(packet,null,2)+'\n',{flag:'wx'});
 writeFileSync(join(flags['--out'],'index.html'),renderShow(packet),{flag:'wx'});
 return {status:packet.status,sourceCount:22,packetDigest:packet.packetDigest,
  html:join(flags['--out'],'index.html'),nativeExecutionCount:0};
}
function renderShow(p){
 const safe=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const cards=p.offers.map(x=>'<article><small>'+x.guestId+' / '+safe(x.department)+'</small><h2>'+safe(x.sourceRepository.split('/')[1])+'</h2><p>'+safe(x.offeredAction)+'</p><code>'+x.sourceCommit.slice(0,12)+'</code><div class="held">HOLD FOR SOURCE OWNER</div></article>').join('');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>22 MORE DOORS</title><style>'+
 'body{margin:0;background:#101729;color:#f7eac9;font:16px/1.5 system-ui;background-image:radial-gradient(ellipse at 70% 0%,#31395e,transparent 42%)}main{max-width:1250px;margin:auto;padding:40px 22px}h1{font:900 clamp(49px,8vw,105px)/.9 Georgia,serif;letter-spacing:-.06em}h1 em{color:#c6ffa2;font-style:normal}h2{font:700 23px Georgia,serif;margin:10px 0}p{color:#b9c8c7}section{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}article{border:1px solid #708d98;padding:22px;background:#18283d;border-radius:12px;display:flex;flex-direction:column;min-height:220px}article p{flex:1}small{color:#c8ffa6;font:800 12px monospace}code{color:#ffbed6}a{color:#c6ffa2}.held{font:700 11px monospace;color:#ffbc95;margin-top:16px}.alert{border:2px dashed #efa8aa;background:#26263c;padding:18px;max-width:900px;margin:30px 0;color:#f2d9cd}@media(max-width:900px){section{grid-template-columns:repeat(2,1fr)}}@media(max-width:570px){section{grid-template-columns:1fr}}'+
 '</style></head><body><main><small>CANNON / CONSTELLATION 003 / LOCAL SOURCE-CONCOURSE</small><h1>TWENTY-TWO<br><em>MORE DOORS.</em></h1><p>22 inherited native owners and 22 new exact-source guests. Every new door has an inspectable provenance receipt and an intentionally held offer. The same machine can later cross each guest through its actual owner runtime.</p><div class="alert">22 NEW SOURCE CUTS INSPECTED. ZERO NEW NATIVE EXECUTIONS CLAIMED BY THIS SOURCE INSPECTION. NO PARTICIPANT, VENUE, RIGHTS, MONEY, PARTNER OR PUBLISHING PERMISSION.</div><section>'+cards+'</section><p><a href="packet.json" download>DOWNLOAD THE REPLAYABLE 22-GUEST SOURCE PACKET</a></p></main></body></html>';
}
function verify(flags){
 const roots=JSON.parse(readFileSync(flags['--sources'],'utf8'));
 const packet=JSON.parse(readFileSync(join(flags['--out'],'packet.json'),'utf8'));
 return verifyConcourse({registry,roots,packet});
}
try{
 const {action,flags}=options(process.argv.slice(2));
 console.log(JSON.stringify(action==='acquire'?acquire(flags['--into']):action==='build'?build(flags):verify(flags),null,2));
}catch(e){console.error('HOLD:',String(e.message).slice(0,800));process.exitCode=2}
