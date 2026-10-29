/** GENESIS BOOT 002 — local-first human-operated interactive porch.
 * Refers to original CANNON GENESIS-BOOT-001 engine (five source-owned Git repos).
 * Never runs third-party commands from browser input, never writes donor repos,
 * never binds to a public address and never claims actual human field evidence.
 */
import http from 'node:http';
import {randomBytes,randomUUID} from 'node:crypto';
import {existsSync,statSync,readFileSync,readdirSync,mkdirSync,rmSync,realpathSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildGenesisBoot,coldVerifyGenesisBoot,validateRequest} from './genesis-boot.mjs';

const ROOT=dirname(fileURLToPath(import.meta.url));
const UI=resolve(ROOT,'../ui/first-boot');
const ID=/^genesis-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const FILES=new Set([
 'first-boot.html','house-A.html','house-B.html','house-A.json','house-B.json',
 'jarvis-candidate.json','ghot-simulation.json','comic.html','field-card.md',
 'culture-receipt.json','boot-receipt.json','request.json'
]);
const SHELF=Object.freeze([
 {id:'genesis-native',title:'First boot / 6 original repositories',state:'EXECUTABLE_SOURCE_PINNED_SYNTHETIC',
  source:'https://github.com/the-static-collective/CANNON/pull/38',
  proof:'https://github.com/the-static-collective/CANNON/actions/runs/40867187466',
  note:'This console runs CANNON original donor code, creates real local files, and cold-verifies them. A/B are fictional site observations.'},
 {id:'warm-thread',title:'Warm Thread / refusal preserves previous work',state:'SEPARATE_PROVEN_NATIVE_CROSSING_NOT_RUN_HERE',
  source:'https://github.com/the-static-collective/CANNON/pull/32',
  proof:'https://github.com/the-static-collective/CANNON/actions/runs/39825842178',
  note:'GHoT → Full Measure → GHoT, then independent Garden and Band status; a refusal leaves one transport need open. Requires separately pinned donor checkouts.'},
 {id:'circulation',title:'Circulation / independent CARE HOLD and return',state:'SEPARATE_PROVEN_NATIVE_CROSSING_NOT_RUN_HERE',
  source:'https://github.com/the-static-collective/CANNON/pull/35',
  proof:'https://github.com/the-static-collective/CANNON/actions/runs/39832959648',
  note:'Native Free Graph, planZ and BananaSpork receiver carry fictional offers and HOLD independently. No real aid or authority.'},
 {id:'ghot-relatte',title:'GHoT + reLATTE / signed crossing research',state:'SEPARATE_PROVEN_NATIVE_CROSSING_NOT_RUN_HERE',
  source:'https://github.com/the-static-collective/CANNON/pull/36',
  proof:'https://github.com/the-static-collective/CANNON/actions/runs/39838625999',
  note:'Branch-native planZ/GHoT/reLATTE research tests. Not an active permission to operate household equipment.'}
]);
const mime={html:'text/html; charset=utf-8',json:'application/json; charset=utf-8',
 js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',md:'text/markdown; charset=utf-8'};
const pickType=file=>mime[file.split('.').pop()]??'application/octet-stream';
const json=x=>JSON.stringify(x)+'\n';
const requireBootId=id=>typeof id==='string'&&ID.test(id);
function safeHistory(dir){
 const found=[];
 for(const id of readdirSync(dir)){
  if(!requireBootId(id))continue;
  const full=join(dir,id);
  try{
   if(!statSync(full).isDirectory())continue;
   const path=join(full,'boot-receipt.json');
   if(!existsSync(path)||statSync(path).size>1500000)continue;
   const receipt=JSON.parse(readFileSync(path,'utf8'));
   if(receipt.schema!=='cannon.genesis-boot-cross-branch/v1'||!receipt.receiptSha256)continue;
   found.push({id,classification:receipt.disposition,simulated:receipt.sampleType==='FICTIONAL_SITES_A_B_NOT_INDEPENDENT_HUMANS'});
  }catch{} // Ignore unrecognized folders or incomplete runs: no proof is assumed.
 }
 return found.sort((a,b)=>b.id.localeCompare(a.id)).slice(0,30);
}
function send(res,code,body,type='application/json; charset=utf-8',csp=null){
 const headers={'Content-Type':type,'Content-Length':Buffer.byteLength(body),
  'Cache-Control':'no-store','Referrer-Policy':'no-referrer',
  'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY',
  'Cross-Origin-Resource-Policy':'same-origin',
  'Cross-Origin-Opener-Policy':'same-origin',
  'Content-Security-Policy':csp??"default-src 'none';base-uri 'none';form-action 'none';frame-ancestors 'none'"};
 res.writeHead(code,headers);res.end(body);
}
function limitedBody(req){
 return new Promise((accept,reject)=>{
  const chunks=[];let total=0;
  req.on('data',piece=>{total+=piece.length;if(total>1024){req.destroy();reject(Error('BODY_TOO_LARGE'));return;}chunks.push(piece)});
  req.on('end',()=>{try{accept(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch{reject(Error('BAD_JSON'))}});
  req.on('error',reject);
 });
}
export function createBootConsole({roots,outParent,compose=buildGenesisBoot,verify=coldVerifyGenesisBoot}){
 if(!roots||Object.keys(roots).sort().join()!==['ghot','gro','jarvis','staticos','webz'].sort().join())
  throw Error('FIVE_EXPLICIT_SOURCE_CHECKOUTS_REQUIRED');
 for(const root of Object.values(roots))if(typeof root!=='string'||!statSync(root).isDirectory())throw Error('MISSING_SOURCE_CHECKOUT');
 const dir=realpathSync(resolve(outParent));
 if(!statSync(dir).isDirectory())throw Error('OUTPUT_PARENT_MUST_EXIST');
 let csrf=randomBytes(24).toString('hex'),busy=false;
 const server=http.createServer(async(req,res)=>{
  const port=server.address()?.port;
  if(!port||req.headers.host!==`127.0.0.1:${port}`){
   send(res,403,json({error:'LOOPBACK_HOST_ONLY'}));return;
  }
  const url=req.url??'';
  const bare=(url.split('?')[0]||'');
  if(req.method==='GET'){
   if(bare==='/'){
    const text=readFileSync(join(UI,'index.html'),'utf8');
    send(res,200,text,mime.html,"default-src 'none';script-src 'self';connect-src 'self';style-src 'self';base-uri 'none';form-action 'none';frame-ancestors 'none'");return;
   }
   if(bare==='/first-boot.js'||bare==='/first-boot.css'){
    const file=bare.slice(1);
    send(res,200,readFileSync(join(UI,file),'utf8'),pickType(file));return;
   }
   if(bare==='/api/status'){
    send(res,200,json({schema:'cannon.first-boot-status/v1',
     mode:'LOCAL_ONLY_SOURCE_PINNED_HUMAN_REVIEW',running:busy,
     firstBoot:'EXPLORE_BUILD_WITNESS',nonce:csrf,
     physicalProof:'NONE',independentOperators:'NONE',
     bridgeShelf:SHELF,history:safeHistory(dir)}));return;
   }
   const m=/^\/runs\/([^/]+)\/([^/]+)$/.exec(bare);
   if(m){
    const [,id,file]=m;
    if(!requireBootId(id)||!FILES.has(file)||!existsSync(join(dir,id,file))){
     send(res,404,json({error:'NOT_FOUND'}));return;
    }
    const full=join(dir,id,file);
    if(!statSync(full).isFile()||statSync(full).size>1500000){
     send(res,404,json({error:'NOT_FOUND'}));return;
    }
    const csp=file.endsWith('.html')?"default-src 'none';style-src 'unsafe-inline';base-uri 'none';form-action 'none';frame-ancestors 'none'":null;
    send(res,200,readFileSync(full,'utf8'),pickType(file),csp);return;
   }
   send(res,404,json({error:'NOT_FOUND'}));return;
  }
  if(req.method==='POST'&&(bare==='/api/compose'||bare==='/api/verify')){
   const expected=`http://127.0.0.1:${port}`;
   if(req.headers.origin!==expected||
      req.headers['x-genesis-token']!==csrf||
      !/^application\/json(?:;|$)/i.test(req.headers['content-type']??'')){
    send(res,403,json({error:'LOCAL_OPERATOR_TOKEN_REQUIRED'}));return;
   }
   if(busy){send(res,409,json({error:'ANOTHER_LOCAL_TURN_IN_PROGRESS'}));return;}
   let body;
   try{body=await limitedBody(req);}catch{send(res,400,json({error:'INVALID_SMALL_JSON_REQUEST'}));return;}
   if(!body||typeof body!=='object'||Array.isArray(body)){
    send(res,400,json({error:'INVALID_REQUEST'}));return;
   }
   busy=true;
   try{
    if(bare==='/api/compose'){
     if(Object.keys(body).sort().join()!==['acknowledgePublicSafe','question'].sort().join()||
       body.acknowledgePublicSafe!==true)throw Error('PUBLIC_SAFE_OPERATOR_ACKNOWLEDGMENT_REQUIRED');
     const request=validateRequest({question:body.question,mission:'living-house',
       scenario:'FICTIONAL_A_B',mode:'OFFLINE_HOLD_ONLY'});
     const id=`genesis-${randomUUID()}`,out=join(dir,id);
     try{
      const receipt=await compose(roots,out,request);
      send(res,201,json({id,schema:receipt.schema,disposition:receipt.disposition,
        generated:receipt.evidence?.generatedHousePlans===2,
        links:{firstBoot:`/runs/${id}/first-boot.html`,
          A:`/runs/${id}/house-A.html`,B:`/runs/${id}/house-B.html`,
          comic:`/runs/${id}/comic.html`,receipt:`/runs/${id}/boot-receipt.json`},
        note:'Actual original code ran with fictional A/B survey only. No field observation or physical actuation.'}));
     }catch(e){if(existsSync(out))rmSync(out,{recursive:true,force:true});throw e;}
    }else{
     if(Object.keys(body).sort().join()!=='id'||!requireBootId(body.id)||
      !existsSync(join(dir,body.id,'boot-receipt.json')))throw Error('UNKNOWN_RUN_ID');
     const result=await verify(roots,join(dir,body.id));
     send(res,200,json({id:body.id,...result,fieldStatus:'NOT_WITNESSED'}));
    }
   }catch{
    send(res,422,json({error:'HOLD: source, contract, safety or cold verification gate refused. No claimed field result.'}));
   }finally{busy=false;}
   return;
  }
  send(res,405,json({error:'READ_ONLY_EXCEPT_EXPLICIT_LOCAL_COMPOSE_OR_VERIFY'}));
 });
 return {
  start:async(port=8766)=>{
   if(!Number.isInteger(port)||port<0||port>65535)throw Error('INVALID_PORT');
   await new Promise((accept,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',accept);});
   return `http://127.0.0.1:${server.address().port}/`;
  },
  stop:()=>new Promise((accept,reject)=>server.close(err=>err?reject(err):accept())),
  server,
  bridgeShelf:SHELF
 };
}
