import http from 'node:http';
import {readFileSync,writeFileSync,appendFileSync,mkdirSync,existsSync,readdirSync,lstatSync,realpathSync,rmSync} from 'node:fs';
import {resolve,join,dirname,relative,sep,isAbsolute} from 'node:path';
import {randomBytes} from 'node:crypto';
import {execFileSync,spawn} from 'node:child_process';
import {ROOT,hash,json,requireThat} from '../constellation/sources.mjs';
import {loadConfig,checkPackages} from './sources.mjs';
import {validateChallenge} from './contracts.mjs';
export async function serveMachine({configPath,packetPath,sessionsPath,port=7792}){
 requireThat(Number.isInteger(port)&&port>=0&&port<=65535,'INVALID_LOCAL_PORT');
 configPath=resolve(configPath);packetPath=realpathSync(resolve(packetPath));sessionsPath=resolve(sessionsPath);
 const config=loadConfig(configPath);checkPackages(config);
 for(const root of [...Object.values(config.nativeRoots),...Object.values(config.inheritedRoots),config.toolchain,ROOT,packetPath,...JSON.parse(readFileSync(config.documentRoots)).entries.map(e=>e.root)]){
  const rel=relative(realpathSync(root),sessionsPath);requireThat(rel!==''&&(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel)),'SESSIONS_INSIDE_SOURCE_OR_PACKET');
 }
 requireThat(realpathSync(dirname(sessionsPath))===dirname(sessionsPath),'SESSIONS_PARENT_SYMLINK');
 // A packet is verified by original-source recomputation before it may supply
 // browser code or evidence to this local operator endpoint.
 execFileSync(process.execPath,[join(ROOT,'scripts/arcade-machine.mjs'),'verify','--config',configPath,'--out',packetPath],{encoding:'utf8',timeout:180000,maxBuffer:1024*1024,stdio:['ignore','pipe','pipe']});
 if(!existsSync(sessionsPath))mkdirSync(sessionsPath,{mode:0o700});
 requireThat(lstatSync(sessionsPath).isDirectory()&&realpathSync(sessionsPath)===sessionsPath,'SESSIONS_SYMLINK');
 const journalPath=join(sessionsPath,'journal.jsonl');
 if(!existsSync(journalPath))writeFileSync(journalPath,'',{flag:'wx',mode:0o600});
 requireThat(lstatSync(journalPath).isFile()&&realpathSync(journalPath)===journalPath,'JOURNAL_SYMLINK');
 const sessions=new Map(),requests=new Map();let previous=null,sequence=0,active=null;
 function apply(e){
  const p=e.payload;
  if(e.kind==='SESSION'){requireThat(!sessions.has(p.id),'DUPLICATE_SESSION');sessions.set(p.id,{id:p.id,tokenHash:p.tokenHash,revoked:false})}
  else if(e.kind==='REVOKE'){requireThat(sessions.has(p.id),'REVOKE_UNKNOWN_SESSION');sessions.get(p.id).revoked=true}
  else if(e.kind==='REQUEST'){requireThat(!requests.has(p.requestId)&&sessions.has(p.sessionId),'DUPLICATE_OR_UNKNOWN_REQUEST');requests.set(p.requestId,{...p,state:'PENDING'})}
  else if(e.kind==='RESULT'){const request=requests.get(p.requestId);requireThat(request?.state==='PENDING','RESULT_WITHOUT_PENDING_REQUEST');Object.assign(request,p,{state:'COMPLETE'})}
  else if(e.kind==='FAIL'){const request=requests.get(p.requestId);requireThat(request?.state==='PENDING','FAIL_WITHOUT_PENDING_REQUEST');Object.assign(request,p,{state:'FAILED'})}
  else throw Error('UNKNOWN_JOURNAL_EVENT');
 }
 for(const line of readFileSync(journalPath,'utf8').split('\n').filter(Boolean)){
  const e=JSON.parse(line),{digest,...body}=e;requireThat(body.sequence===sequence+1&&body.previous===previous&&digest===hash(json(body)),'LOCAL_JOURNAL_CHAIN_MISMATCH');apply(e);sequence=e.sequence;previous=e.digest;
 }
 function record(kind,payload){const body={sequence:sequence+1,previous,kind,payload},e={...body,digest:hash(json(body))};appendFileSync(journalPath,json(e).replace(/\n\s*/g,'')+'\n',{mode:0o600});apply(e);sequence=e.sequence;previous=e.digest;return e}
 // Snapshot names and hashes only after the full cold verification. Static
 // routes never expose the config, tokens, source trees, or local journal.
 const packetFiles=new Map();
 function scan(dir,prefix=''){for(const e of readdirSync(dir,{withFileTypes:true})){const path=join(dir,e.name),name=prefix+e.name;requireThat(!e.isSymbolicLink()&&realpathSync(path)===path,'STATIC_PACKET_SYMLINK');if(e.isDirectory())scan(path,name+'/');else packetFiles.set(name,hash(readFileSync(path)))}}
 scan(packetPath);
 function checkedResult(id){
  const prior=requests.get(id);requireThat(prior?.state==='COMPLETE','NO_COMPLETE_RESULT');
  const root=join(sessionsPath,'runs',id),path=join(root,'receipt.json');
  requireThat(realpathSync(root)===root&&realpathSync(path)===path&&lstatSync(path).isFile(),'RESULT_EXPORT_SYMLINK');
  const receipt=JSON.parse(readFileSync(path)),{receiptId,...body}=receipt;
  requireThat(receiptId===prior.receiptId&&hash(json(body))===receiptId,'RESULT_RECEIPT_CHANGED');
  for(const [name,digest] of Object.entries(receipt.files)){
   requireThat(!name.startsWith('/')&&!name.split('/').includes('..'),'RESULT_PATH_INVALID');
   const file=join(root,name);requireThat(realpathSync(file)===file&&lstatSync(file).isFile()&&hash(readFileSync(file))===digest,'RESULT_BYTES_CHANGED');
  }
  return receipt;
 }
 const mime=p=>p.endsWith('.html')?'text/html; charset=utf-8':p.endsWith('.json')?'application/json; charset=utf-8':p.endsWith('.md')?'text/plain; charset=utf-8':'application/octet-stream';
 const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(json(value))};
 const readBody=async req=>{const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>8192)throw Error('BODY_TOO_LARGE');chunks.push(chunk)}return JSON.parse(Buffer.concat(chunks).toString('utf8'))};
 const runWorker=(requestFile,out,sessionId)=>new Promise((yes,no)=>{
  const child=spawn(process.execPath,[join(ROOT,'scripts/arcade-machine.mjs'),'challenge','--config',configPath,'--request',requestFile,'--out',out,'--authorize','LOCAL_FICTIONAL_ONLY'],{detached:process.platform!=='win32',stdio:['ignore','pipe','pipe'],env:{...process.env,ARCADE_NATIVE_CHILD:'0'}});
  const buffers={out:[],err:[]};let size=0;
  const stop=()=>{try{if(process.platform!=='win32')process.kill(-child.pid,'SIGTERM');else child.kill('SIGTERM')}catch{}};
  active={sessionId,stop};const timer=setTimeout(stop,180000);
  child.stdout.on('data',b=>{size+=b.length;if(size>4*1024*1024)stop();else buffers.out.push(b)});child.stderr.on('data',b=>{size+=b.length;if(size>4*1024*1024)stop();else buffers.err.push(b)});
  child.on('error',e=>{clearTimeout(timer);active=null;no(e)});
  child.on('close',code=>{clearTimeout(timer);active=null;if(code===0){try{yes(JSON.parse(Buffer.concat(buffers.out)))}catch(e){no(e)}}else no(Error('NATIVE_WORKER_REFUSED: '+Buffer.concat(buffers.err).toString('utf8').slice(0,1800)))});
 });
 const server=http.createServer(async(req,res)=>{
  const base='http://127.0.0.1:'+server.address().port;
  try{
   if(req.headers.host!==new URL(base).host)return send(res,403,{error:'LOOPBACK_HOST_REQUIRED'});
   const url=new URL(req.url,base);if(url.origin!==base)return send(res,403,{error:'LOCAL_ORIGIN_REQUIRED'});
   if(req.method==='GET'){
    let name=decodeURIComponent(url.pathname).replace(/^\//,'')||'first-boot.html';
    if(name.split('/').some(x=>x==='..'||x==='.')||name.includes('\\')||name.includes('\0'))return send(res,400,{error:'INVALID_PATH'});
    if(name.startsWith('runs/')){
     const parts=name.split('/');if(parts.length!==3||!['result.html','result.json','receipt.json','manifest.json'].includes(parts[2]))return send(res,404,{error:'NO_SUCH_EXPORT'});
     const r=requests.get(parts[1]);if(!r||r.state!=='COMPLETE')return send(res,404,{error:'NO_COMPLETE_RESULT'});
     checkedResult(r.requestId);const path=join(sessionsPath,'runs',r.requestId,parts[2]);if(realpathSync(path)!==path||!lstatSync(path).isFile())return send(res,403,{error:'EXPORT_SYMLINK'});
     const bytes=readFileSync(path);res.writeHead(200,{'content-type':mime(name),'cache-control':'no-store','x-content-type-options':'nosniff'});return res.end(bytes);
    }
    if(!packetFiles.has(name))return send(res,404,{error:'NO_SUCH_ARTIFACT'});
    const path=join(packetPath,name);if(realpathSync(path)!==path||!lstatSync(path).isFile())return send(res,403,{error:'ARTIFACT_SYMLINK'});
    const bytes=readFileSync(path);if(hash(bytes)!==packetFiles.get(name))return send(res,409,{error:'PACKET_CHANGED_SINCE_COLD_VERIFICATION'});
    res.writeHead(200,{'content-type':mime(name),'cache-control':'no-store','x-content-type-options':'nosniff'});return res.end(bytes);
   }
   if(req.method!=='POST')return send(res,405,{error:'METHOD_NOT_ALLOWED'});
   if(req.headers.origin!==base)return send(res,403,{error:'EXACT_LOCAL_ORIGIN_REQUIRED'});
   if(req.headers['content-type']!=='application/json')return send(res,415,{error:'JSON_REQUIRED'});
   const body=await readBody(req);
   if(url.pathname==='/api/session'){
    if(!body||Object.keys(body).sort().join()!=='authorized,scope'||body.authorized!==true||body.scope!=='LOCAL_FICTIONAL_ONLY')return send(res,400,{error:'EXPLICIT_LOCAL_FICTIONAL_SCOPE_REQUIRED'});
    const id='s-'+randomBytes(8).toString('hex'),token=randomBytes(32).toString('hex');record('SESSION',{id,tokenHash:hash(token),scope:body.scope});return send(res,200,{id,token,authority:'LOCAL_FICTIONAL_SOFTWARE_ONLY'});
   }
   const token=req.headers['x-arcade-token'];const session=typeof token==='string'?[...sessions.values()].find(s=>s.tokenHash===hash(token)):null;
   if(!session)return send(res,403,{error:'LOCAL_SESSION_TOKEN_REQUIRED'});
   if(url.pathname==='/api/revoke'){
    if(!body||Object.keys(body).length)return send(res,400,{error:'REVOKE_TAKES_NO_PAYLOAD'});
    if(!session.revoked)record('REVOKE',{id:session.id});if(active?.sessionId===session.id)active.stop();return send(res,200,{status:'REFUSE_SESSION_REVOKED',revoked:true});
   }
   if(session.revoked)return send(res,403,{error:'SESSION_PERMANENTLY_REVOKED'});
   if(url.pathname!=='/api/challenge')return send(res,404,{error:'NO_SUCH_LOCAL_ACTION'});
   validateChallenge(body);if(!body.requestId.startsWith(session.id+'-'))return send(res,400,{error:'REQUEST_ID_OUTSIDE_SESSION'});
   const digest=hash(json(body)),prior=requests.get(body.requestId);
   if(prior){
    if(prior.sessionId!==session.id||prior.requestSha256!==digest)return send(res,409,{error:'IDEMPOTENCY_REQUEST_CONFLICT'});
    if(prior.state!=='COMPLETE')return send(res,409,{error:'HOLD_PRIOR_ATTEMPT_INCOMPLETE_OR_FAILED'});
    checkedResult(body.requestId);return send(res,200,{...prior.response,idempotent:true});
   }
   if(active)return send(res,409,{error:'HOLD_ONE_NATIVE_WORKER_AT_A_TIME'});
   const requestDir=join(sessionsPath,'requests'),runDir=join(sessionsPath,'runs');mkdirSync(requestDir,{recursive:true,mode:0o700});mkdirSync(runDir,{recursive:true,mode:0o700});
   const requestFile=join(requestDir,body.requestId+'.json'),out=join(runDir,body.requestId);writeFileSync(requestFile,json(body),{flag:'wx',mode:0o600});
   record('REQUEST',{sessionId:session.id,requestId:body.requestId,requestSha256:digest});
   try{
    const result=await runWorker(requestFile,out,session.id);
    if(session.revoked){if(existsSync(out))rmSync(out,{recursive:true,force:true});record('FAIL',{requestId:body.requestId,reason:'SESSION_REVOKED_DURING_LOCAL_COMPUTE'});return send(res,403,{error:'SESSION_REVOKED_DURING_LOCAL_COMPUTE'})}
    const receipt=JSON.parse(readFileSync(join(out,'receipt.json')));requireThat(receipt.receiptId===result.receiptId&&receipt.requestSha256===digest,'WORKER_RECEIPT_MAPPING');
    const response={status:result.status,receiptId:result.receiptId,requestSha256:digest,artifactPath:'/runs/'+body.requestId,summary:result.summary,fieldVerified:false,externalContacts:0,physicalActs:0,idempotent:false};
    record('RESULT',{requestId:body.requestId,receiptId:receipt.receiptId,response});return send(res,200,response);
   }catch(e){if(existsSync(out))rmSync(out,{recursive:true,force:true});record('FAIL',{requestId:body.requestId,reason:String(e.message).slice(0,1200)});return send(res,session.revoked?403:422,{error:String(e.message)})}
  }catch(e){send(res,400,{error:String(e.message).slice(0,1800)})}
 });
 await new Promise((yes,no)=>{server.once('error',no);server.listen(port,'127.0.0.1',yes)});
 return {server,port:server.address().port,close:async()=>{if(active)active.stop();await new Promise((yes,no)=>server.close(e=>e?no(e):yes()))}};
}
