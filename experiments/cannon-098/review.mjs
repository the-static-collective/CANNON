// CANNON-098 — independent bounded missing-world review.
// Verifies original MOTIF-009 PNG worlds, original MOTIF-013 source owner,
// original GRAFT-031 generator, re-generated local JS and a fully separate
// finite grid-reachability baseline. Never signs real observations or devices.
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {verifyOriginalQuestion,sha as digest} from '../cannon-096/review.mjs';

export class HOLD extends Error{}
const need=(x,why)=>{if(!x)throw new HOLD(why)};
const hash=x=>createHash('sha256').update(x).digest('hex');
const blob=x=>createHash('sha1').update(Buffer.from('blob '+x.length+'\0'))
  .update(x).digest('hex');
export const PINS={
 motif:{commit:'5c865c23d5ffac12f055b60b373f0c448ea62769',
  path:'experiments/door-foundry-013/missing_world.py',
  blob:'50b91b9b18865da56203d40aba35e0dd2bffaff8'},
 graft:{commit:'8a4e85e2de9bdfdf74cd5bebd95fbab7cf11ab36',
  path:'src/world-model-031.mjs',
  blob:'e2c3348b65c556fb1b6df123e0aa4e7d71eecad1'}
};
export function pin(root,key){
 need(key in PINS,'HOLD_UNKNOWN_SOURCE_OWNER');
 const d=resolve(root),target=PINS[key];
 const data=readFileSync(join(d,target.path));
 need(blob(data)===target.blob,'HOLD_SOURCE_ORIGINAL_BYTES_CHANGED');
 let head,tree;
 try{
  head=execFileSync('git',['-C',d,'rev-parse','HEAD'],
       {encoding:'utf8',timeout:8000}).trim();
  tree=execFileSync('git',['-C',d,'rev-parse','HEAD:'+target.path],
       {encoding:'utf8',timeout:8000}).trim();
 }catch{throw new HOLD('HOLD_SOURCE_GIT_PROVENANCE_UNAVAILABLE')}
 need(head===target.commit&&tree===target.blob,
      'HOLD_SOURCE_OWNER_GIT_IDENTITY_MISMATCH');
 return {owner:key,commit:head,blob:target.blob};
}
function load(path){
 const data=readFileSync(path);
 need(data.length<500000,'HOLD_TOO_LARGE_PACKET');
 try{return JSON.parse(data.toString('utf8'))}
 catch{throw new HOLD('HOLD_MALFORMED_JSON')}
}
function validateHash(record){
 need(record&&typeof record==='object'&&typeof record.content_sha256==='string',
      'HOLD_PACKET_HAS_NO_DIGEST');
 const {content_sha256,...core}=record;
 need(content_sha256===digest(core),'HOLD_PACKET_DIGEST_INCONSISTENT');
}
const SIG=Buffer.from([137,80,78,71,13,10,26,10]);
const COLORS={'.':'255,255,255','R':'220,40,50','#':'35,60,160'};
function crc32(data){
 let c=0xffffffff;
 for(const b of data){
   c^=b;
   for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);
 }
 return (c^0xffffffff)>>>0;
}
export function decodePNG(raw){
 need(Buffer.isBuffer(raw)&&raw.length>50&&raw.length<100000&&
   raw.subarray(0,8).equals(SIG),'HOLD_NOT_BOUNDED_PNG');
 let offset=8,width=0,height=0,idat=[],hasIhdr=false,ended=false;
 while(offset<raw.length){
  need(offset+12<=raw.length,'HOLD_MALFORMED_PNG_CHUNK');
  const size=raw.readUInt32BE(offset),type=raw.toString('ascii',offset+4,offset+8);
  need(size<=70000&&offset+12+size<=raw.length,'HOLD_PNG_CHUNK_TOO_LARGE');
  const chunk=raw.subarray(offset+8,offset+8+size);
  const check=Buffer.concat([Buffer.from(type,'ascii'),chunk]);
  need(crc32(check)===raw.readUInt32BE(offset+8+size),'HOLD_BAD_PNG_CRC');
  offset+=12+size;
  if(type==='IHDR'){
    need(!hasIhdr&&size===13,'HOLD_REPEAT_IMAGE_HEADER');
    width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);
    need(width===9&&height===8&&chunk[8]===8&&chunk[9]===2&&
      chunk[10]===0&&chunk[11]===0&&chunk[12]===0,
      'HOLD_UNKNOWN_PNG_PIXEL_FORMAT');
    hasIhdr=true;
  }else if(type==='IDAT')idat.push(chunk);
  else if(type==='IEND'){
    need(size===0&&offset===raw.length,'HOLD_TRAILING_PNG');
    ended=true;
  }else need(false,'HOLD_UNRECOGNIZED_PNG_CHUNK');
 }
 need(hasIhdr&&ended&&idat.length>0,'HOLD_PNG_INCOMPLETE');
 const decompressed=inflateSync(Buffer.concat(idat),{maxOutputLength:100000});
 need(decompressed.length===8*(9*3+1),'HOLD_PNG_SCANLINE_LENGTH');
 const map=Object.fromEntries(Object.entries(COLORS).map(([k,v])=>[v,k]));
 const rows=[];
 for(let y=0;y<8;y++){
  const offset=y*28;
  need(decompressed[offset]===0,'HOLD_UNSUPPORTED_PNG_SCANLINE_FILTER');
  let row='';
  for(let x=0;x<9;x++){
   const px=Array.from(decompressed.subarray(offset+1+x*3,offset+4+x*3)).join(',');
   need(px in map,'HOLD_PIXEL_OUTSIDE_RESTRICTED_PALETTE');
   row+=map[px];
  }
  rows.push(row);
 }
 return rows;
}
const cells=(rows,c)=>rows.flatMap((r,y)=>[...r].flatMap((v,x)=>v===c?[[x,y]]:[]));
const key=x=>x.join(',');
const startTopLeft=rows=>{
 const pts=cells(rows,'R');
 need(pts.length===4,'HOLD_RED_OBJECT_NOT_2X2');
 const x=Math.min(...pts.map(p=>p[0])),y=Math.min(...pts.map(p=>p[1]));
 need(pts.every(([px,py])=>px>=x&&px<=x+1&&py>=y&&py<=y+1),
  'HOLD_RED_MASS_SHAPE_CHANGED');
 return [x,y];
};
export function independentClosure(rows,goalRows){
 const blocks=new Set(cells(rows,'#').map(key));
 need(JSON.stringify(cells(rows,'#'))===JSON.stringify(cells(goalRows,'#')),
   'HOLD_OBSTACLES_CHANGE_DURING_MOVEMENT');
 const origin=startTopLeft(rows),target=startTopLeft(goalRows);
 const changes=[[0,-1],[-1,0],[1,0],[0,1]];
 const blocked=(x,y)=>x<0||y<0||x+1>=9||y+1>=8||
    [[x,y],[x+1,y],[x,y+1],[x+1,y+1]].some(p=>blocks.has(key(p)));
 const todo=[{position:origin,steps:[]}],seen=new Set([key(origin)]);
 while(todo.length){
   const now=todo.shift();
   if(key(now.position)===key(target))
      return {reachable:true,closed:true,shortest_moves:now.steps.length,
       moves:now.steps,visited_states:seen.size};
   for(const step of changes){
     const x=now.position[0]+step[0],y=now.position[1]+step[1],id=key([x,y]);
     if(blocked(x,y)||seen.has(id))continue;
     seen.add(id);
     todo.push({position:[x,y],steps:[...now.steps,step]});
   }
 }
 return {reachable:false,closed:true,shortest_moves:null,
   moves:[],visited_states:seen.size};
}
export async function review(motifDir,graftDir,originalDir,probeDir,answerDir){
 const owners={motif:pin(motifDir,'motif'),graft:pin(graftDir,'graft')};
 const source=verifyOriginalQuestion(originalDir);
 const question=load(join(probeDir,'missing-question.json'));
 const ticket=load(join(probeDir,'graft-ticket.json'));
 const result=load(join(probeDir,'graft-receipt.json'));
 const answer=load(join(answerDir,'held-new-model-answer.json'));
 for(const record of [question,ticket,result,answer])validateHash(record);
 need(question.schema==='motif013.missing-world-question.v0'&&
   question.status==='HOLD_ALL_ORIGINAL_FOUR_WORLDS_OUT_OF_SUPPORT'&&
   question.original_009_question_sha256===source.content_sha256&&
   question.synthetic_observation===true&&
   question.observation_is_from_actual_sensors===false&&
   question.real_world_input_received===false&&
   question.automatic_generated_operator_authorized===false&&
   question.missing_kind==='SYNTHETIC_EXTERNAL_ENVIRONMENT_STATE_UPDATE'&&
   question.authority?.external_requests===0&&
   question.authority?.real_environment_changed===false&&
   question.authority?.run_generated_operator_on_real_device===false&&
   question.authority?.deploy===false,
   'HOLD_MISSING_WORLD_PACKET_ASSERTS_AUTHORITY');
 const beforeBytes=readFileSync(join(probeDir,'before.png'));
 const afterBytes=readFileSync(join(probeDir,'outside.png'));
 const goalBytes=readFileSync(join(probeDir,'new-goal.png'));
 const originalBefore=readFileSync(join(originalDir,'worlds','LEFT_FULL','start.png'));
 need(beforeBytes.equals(originalBefore),'HOLD_BEFORE_IMAGE_NOT_SOURCE_OWNED');
 const a=decodePNG(beforeBytes),b=decodePNG(afterBytes),goal=decodePNG(goalBytes);
 need(hash(beforeBytes)===question.before_png_sha256&&
   hash(afterBytes)===question.outside_png_sha256&&
   hash(goalBytes)===question.new_model_goal_png_sha256&&
   JSON.stringify(a)===JSON.stringify(question.before_rows)&&
   JSON.stringify(b)===JSON.stringify(question.outside_rows)&&
   JSON.stringify(goal)===JSON.stringify(question.new_model_goal_rows),
   'HOLD_IMAGE_OR_TEXT_PROVENANCE_CHANGED');
 const oldBlue=cells(a,'#'),newBlue=cells(b,'#');
 need(oldBlue.length===8&&newBlue.length===6&&
   JSON.stringify(cells(a,'R'))===JSON.stringify(cells(b,'R'))&&
   JSON.stringify(oldBlue.filter(p=>!newBlue.some(z=>key(z)===key(p))))
      ===JSON.stringify([[4,3],[4,4]])&&
   JSON.stringify(cells(b,'#'))===JSON.stringify(cells(goal,'#')),
   'HOLD_NOT_AN_OUT_OF_SUPPORT_SYNTHETIC_IMAGE_TRANSITION');
 need(source.visual_worlds.every(w=>w.id in question.original_world_blue_counts)&&
   Object.values(question.original_world_blue_counts).every(n=>n===4||n===8),
   'HOLD_ORIGINAL_FOUR_WORLDS_WERE_REPLACED');
 need(JSON.stringify(ticket.before_rows)===JSON.stringify(a)&&
   JSON.stringify(ticket.after_rows)===JSON.stringify(b)&&
   ticket.blue_before===8&&ticket.blue_after===6&&
   ticket.status==='OLD_GRAMMAR_CANNOT_LOSE_BLUE_OBSTACLES'&&
   ticket.authority?.physical_actions===0&&ticket.authority?.auto_admit===false,
   'HOLD_GRAFT_TICKET_IS_NOT_SOURCE_PAIRED');
 const graft=await import(pathToFileURL(join(resolve(graftDir),'src','world-model-031.mjs')).href);
 const replayTicket=graft.makeTicket(a,b);
 need(JSON.stringify(ticket)===JSON.stringify(replayTicket),
   'HOLD_SOURCE_GENERATOR_CAN_NOT_REPLAY_GAP');
 const recomputed=await graft.cultivate(ticket,graft.fixtureSets());
 need(JSON.stringify(result)===JSON.stringify(recomputed)&&
   result.status==='HELD_NEW_EXTERNAL_EVENT_MODEL'&&
   result.candidate_count===3&&
   result.chosen?.mode==='open_observed_pair'&&
   result.chosen?.permission_to_operate_a_physical_gate===false&&
   result.chosen?.installed===false,
   'HOLD_GRAFT_MODEL_NOT_UNIQUE_OR_EXACT');
 const programSource=readFileSync(join(probeDir,'generated-environment.mjs'),'utf8');
 need(programSource===result.chosen.source&&
   hash(programSource)===result.chosen.source_sha256,
   'HOLD_NEW_GENERATED_PROGRAM_SOURCE_CHANGED');
 const run=await import('data:text/javascript;base64,'+
    Buffer.from(programSource,'utf8').toString('base64'));
 const predicted=run.execute({rows:a,event:'SIMULATED_ENVIRONMENT_GATE_OPEN'});
 const physical=run.execute({rows:a,event:'REAL_GATE_ACTION'});
 need(predicted.status==='PROPOSED_ENVIRONMENT_FRAME'&&
   JSON.stringify(predicted.frame)===JSON.stringify(b)&&
   physical.status==='HOLD_EVENT_NOT_SIMULATED',
   'HOLD_GENERATED_MODEL_ACTUALLY_FAILED_OR_ACTUATED');
 const origGoal=decodePNG(readFileSync(
   join(originalDir,'worlds','LEFT_FULL','target.png')));
 const old=independentClosure(a,origGoal);
 const modified=independentClosure(b,goal);
 need(old.closed&&!old.reachable&&modified.closed&&modified.reachable&&
   modified.shortest_moves>0&&
   answer.result_before_model_update?.reachable===false&&
   answer.result_before_model_update?.proof_complete===true&&
   answer.result_after_simulated_environment_event?.reachable===true&&
   answer.result_after_simulated_environment_event?.proof_complete===true&&
   JSON.stringify(answer.result_after_simulated_environment_event.hypothetical_steps)
    ===JSON.stringify(modified.moves),
   'HOLD_NATIVE_CLOSED_WORLD_LOGIC_DISAGREES_WITH_INDEPENDENT_GRAPH_SEARCH');
 need(answer.schema==='motif013.new-world-held-answer.v0'&&
   answer.status==='HOLD_NEW_MODEL_EXPLAINS_SYNTHETIC_OOD_EVENT_NOT_ADMITTED'&&
   answer.question_sha256===question.content_sha256&&
   answer.graft_owner_commit===PINS.graft.commit&&
   answer.new_graft_problem_sha256===ticket.content_sha256&&
   answer.new_graft_receipt_sha256===result.content_sha256&&
   answer.new_source_generated_sha256===result.chosen.source_sha256&&
   answer.old_world_model_contains_new_image===false&&
   answer.old_blue_mass_cannot_decrease===true&&
   answer.synthetic_environment_event_only===true&&
   answer.model_auto_admitted===false&&
   answer.current_physical_world_identified===false&&
   answer.source_authority?.external_api_calls===0&&
   answer.source_authority?.physical_events_triggered===0&&
   answer.source_authority?.new_source_installed===false,
   'HOLD_NEW_WORLD_ANSWER_PROMOTED_UNVERIFIED_RESULT');
 const core={schema:'cannon098.missing-world-review.v0',
   status:'HOLD_NEW_MODEL_BOUNDED_NOT_OBSERVED_OR_ADMITTED',
   original_motif_source:owners.motif,
   original_graft_source:owners.graft,
   original_four_png_model_source:source.content_sha256,
   missing_world_certificate:question.content_sha256,
   graft_new_source_receipt:result.content_sha256,
   generated_program_sha256:result.chosen.source_sha256,
   out_of_support_blue_change:'8_TO_6',
   independent_classical_closed_world_old:old,
   independent_classical_closed_world_after_synthetic_event:modified,
   old_source_family_invariant_verified:true,
   generated_js_recompiled_from_owner:true,
   source_families_tested:3,
   device_commands_executed:0,
   people_contacted:0,external_calls:0,
   external_observations_verified:false,
   physical_world_assessed:false,
   real_user_action_authorized:false,
   automatic_installation:false,canonical_admission:false,
   signed_by_external_witness:false,
   superiority_to_same_information_classical:false};
 return {...core,content_sha256:digest(core)};
}
function main(argv){
 need(argv.length===12&&argv[0]==='--motif'&&argv[2]==='--graft'&&
  argv[4]==='--question'&&argv[6]==='--probe'&&
  argv[8]==='--answer'&&argv[10]==='--out',
  'HOLD_MISSING_SOURCE_OWNERS_OR_ARTIFACTS');
 return review(argv[1],argv[3],argv[5],argv[7],argv[9])
  .then(r=>{
   writeFileSync(argv[11],JSON.stringify(r,null,2)+'\n',{flag:'wx',mode:0o600});
   console.log(JSON.stringify({status:r.status,
    original_motif:r.original_motif_source.commit,
    generated_model:r.generated_program_sha256,
    old_world_reachable:r.independent_classical_closed_world_old.reachable,
    new_world_reachable:r.independent_classical_closed_world_after_synthetic_event.reachable,
    real_effects:0},null,2));
  });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 main(process.argv.slice(2)).catch(e=>{
  console.error(JSON.stringify({status:'HOLD',reason:e.message}));process.exitCode=1;
 });
}
