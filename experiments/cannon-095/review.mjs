// CANNON-095: independently verify original GRAFT-030 image operator source,
// original MOTIF-006 PNG image-in provenance, and truly separate visual tests.
// No image is uploaded or passed to a remote inference model.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join,resolve} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

export const GRAFT_COMMIT='0347c492c5e517788c0cbd87ee6f57aef3ce2a81';
export const MOTIF_IMAGE_COMMIT='6abd24ad0cb04434b22a07f56b28c638a1bdd146';
export const GRAFT_PINS={
 'src/visual-grammar-030.mjs':'6a3731deaa6c715e5d32ffdcd36004cf01d54cdf',
 'test/visual-grammar-030.test.mjs':'80399d8f4a947a57e738feb490b5951906d9c01d'
};
export const MOTIF_PINS={
 'experiments/door-foundry-006/visual_in.py':'1feded3526746c2af30346acfba191487bc705d2'
};
export class HOLD extends Error {}
const check=(x,msg)=>{if(!x)throw new HOLD(msg)};
export const sha=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const blob=x=>createHash('sha1').update(Buffer.from('blob '+x.length+'\0')).update(x).digest('hex');

function run(bin,args,options={}){
 try {return execFileSync(bin,args,{encoding:'utf8',timeout:15000,
   maxBuffer:1_000_000,stdio:['pipe','pipe','pipe'],...options}).trim()}
 catch {throw new HOLD('Original source evidence replay failed')}
}
export function verifyGit(root,commit,pins){
 const path=resolve(root);
 check(run('git',['-C',path,'rev-parse','HEAD'])===commit,
   'Original owner commit changed');
 const verified=[];
 for(const [rel,expected] of Object.entries(pins).sort()){
  const contents=readFileSync(join(path,rel));
  check(blob(contents)===expected,'Original owner source was modified: '+rel);
  check(run('git',['-C',path,'rev-parse','HEAD:'+rel])===expected,
    'Original Git tree differs from current bytes: '+rel);
  verified.push({path:rel,git_blob_sha1:expected});
 }
 return verified;
}
const PYTHON_GAP=`
import json,sys
from pathlib import Path
sys.path.insert(0,str(Path(sys.argv[1])/'experiments'/'door-foundry-006'))
from visual_in import question
q=question(Path(sys.argv[2]).read_bytes(),Path(sys.argv[3]).read_bytes())
print(json.dumps(q,separators=(',',':')))
`;
function pixelGap(motifRoot,startPNG,goalPNG){
 const a=run('python',['-c',PYTHON_GAP,resolve(motifRoot),
   resolve(startPNG),resolve(goalPNG)]);
 let gap;try{gap=JSON.parse(a)}catch{throw new HOLD('Malformed original MOTIF PNG question')}
 return gap;
}
export function verifyImageGap(motifRoot,startPNG,goalPNG,gap){
 verifyGit(motifRoot,MOTIF_IMAGE_COMMIT,MOTIF_PINS);
 const a=readFileSync(startPNG),b=readFileSync(goalPNG);
 check(sha(a)===gap.start_png_sha256&&sha(b)===gap.goal_png_sha256,
   'Submitted raster bytes disagree with source digests');
 check(JSON.stringify(gap)===JSON.stringify(pixelGap(motifRoot,startPNG,goalPNG)),
   'Original MOTIF visual question does not replay from exact PNGs');
 return gap.content_sha256;
}
function independentReference(rows,delta){
 if(!Array.isArray(delta)||delta.length!==2||
   delta.some(x=>!Number.isInteger(x))||
   Math.abs(delta[0])+Math.abs(delta[1])!==1)return {status:'HOLD_BAD_FRAME_OR_ACTION',frame:null};
 const red=[];
 for(let y=0;y<rows.length;y++)for(let x=0;x<rows[y].length;x++)
   if(rows[y][x]==='R')red.push([x,y]);
 if(red.length!==4) return {status:'HOLD_NOT_ONE_2X2_OBJECT',frame:null};
 const cells=rows.map(x=>x.split(''));
 for(const [x,y] of red){
  const nx=x+delta[0],ny=y+delta[1];
  if(nx<0||ny<0||nx>=cells[0].length||ny>=cells.length)
   return {status:'HOLD_OUTSIDE_IMAGE',frame:null};
  if(rows[ny][nx]==='#')return {status:'HOLD_OBSTACLE',frame:null};
 }
 for(const [x,y] of red)cells[y][x]='.';
 for(const [x,y] of red)cells[y+delta[1]][x+delta[0]]='R';
 return {status:'PROPOSED_FRAME',frame:cells.map(row=>row.join(''))};
}
export function independentFixtures(owner){
 const f=(x,y,dx,dy,options={})=>({
   rows:owner.makeFrame(x,y,options),delta:[dx,dy]
 });
 return [
  f(2,2,1,0),f(6,4,-1,0),f(2,5,0,-1),
  f(0,0,0,1),f(6,0,-1,0),f(0,2,-1,0),
  f(1,2,1,0,{blocks:[[3,2]]}),f(3,3,0,2)
 ];
}
export async function review(graftRoot,motifRoot,start,goal,gap){
 const originalOwner=verifyGit(graftRoot,GRAFT_COMMIT,GRAFT_PINS);
 const originalReader=verifyGit(motifRoot,MOTIF_IMAGE_COMMIT,MOTIF_PINS);
 const gapSha=verifyImageGap(motifRoot,start,goal,gap);
 const graft=await import(pathToFileURL(resolve(graftRoot,'src/visual-grammar-030.mjs')).href);
 graft.validateGap(gap);
 const native=await graft.cultivate(gap,graft.fixtureCases());
 check(native.schema==='graft030.visual-grammar-evaluation.v0'&&
   native.status==='HELD_VISUAL_OPERATOR'&&
   native.chosen?.mode==='move'&&
   native.chosen?.network_authority==='NONE'&&
   native.chosen?.installed===false&&native.candidates_tried===3&&
   native.rejected.length===2&&
   native.external_actions===0&&native.live_requests===0,
   'Source native GRAFT visual synthesis was not uniquely demonstrated');
 const regenerated=graft.compileVariant(gap,native.chosen.mode);
 check(native.chosen.source===regenerated.source&&
   native.chosen.source_sha256===regenerated.source_sha256,
   'Source-owning GRAFT compiler does not reproduce selected program');
 const {execute}=await import('data:text/javascript;base64,'+
   Buffer.from(regenerated.source).toString('base64'));
 const unseen=independentFixtures(graft);
 const assessments=[];
 for(const input of unseen){
  const expected=independentReference(input.rows,input.delta);
  const actual=execute(input);
  assessments.push({status:actual.status,
    correct:actual.status===expected.status&&
      JSON.stringify(actual.frame)===JSON.stringify(expected.frame),
    expected_status:expected.status,
    source_pixels_preserved_for_absent_actions:expected.frame===null});
 }
 check(assessments.every(x=>x.correct),'Independently unseen image test failed');
 const body={
  schema:'cannon.visual-program-review.v0',
  status:'HOLD_VISUAL_SOURCE_NOT_ADMITTED',
  source_graft:{repo:'the-static-collective/GRAFT',commit:GRAFT_COMMIT,
    exact_git_blobs:originalOwner},
  source_motif_image_in:{repo:'the-static-collective/MOTIF',
    commit:MOTIF_IMAGE_COMMIT,exact_git_blobs:originalReader},
  original_png_evidence:{
    start_sha256:gap.start_png_sha256,
    target_sha256:gap.goal_png_sha256,
    motif_question_sha256:gapSha,
    visual_semantics:'THREE_COLOR_GRID_ONLY',
    image_uploads_to_remote_ai:0
  },
  source_owned_generated:{
    generator:'GRAFT_030_FINITE_VISUAL_TRANSITION_GRAMMAR',
    grammar:native.grammar,mode:native.chosen.mode,
    source:native.chosen.source,
    source_sha256:native.chosen.source_sha256,
    generated_source_replayed:true,
    code_installed:false,
    right_to_contact_apis:false
  },
  native_test_counts:{
    train:native.training_count,
    selection:native.selection_count,
    negative:native.negative_count,
    generated_candidates:native.candidates_tried,
    rejected_variants:native.rejected.length
  },
  independent_final:{
    n:assessments.length,correct:assessments.filter(x=>x.correct).length,
    results:assessments,
    never_used_to_select_source:true
  },
  fair_classical:{
    name:'EXACT_PIXEL_SHIFT_WITH_SAME_OBSTACLE_AND_ACTION_INFORMATION',
    correct:assessments.length,
    superior_to_classical:false,
    fixed_add_only_cannot_delete_old_red_pixels:true
  },
  authority:{
    signed:false,operator_admitted:false,external_actions:0,
    contacts:0,production_deployments:0,repository_writes:0
  }
 };
 return {...body,content_sha256:sha(body)};
}
async function main(args){
 if(args.length!==12||args[0]!=='--graft'||args[2]!=='--motif'||
  args[4]!=='--start'||args[6]!=='--goal'||
  args[8]!=='--gap'||args[10]!=='--out')
   throw new HOLD('CANNON review requires exact original source, real PNGs, gap, and output');
 const gap=JSON.parse(readFileSync(args[9],'utf8'));
 const result=await review(args[1],args[3],args[5],args[7],gap);
 writeFileSync(args[11],JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({status:result.status,
   new_source_sha256:result.source_owned_generated.source_sha256,
   independent_test_count:result.independent_final.n,
   independently_correct:result.independent_final.correct,
   classical_equal:!result.fair_classical.superior_to_classical}));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 main(process.argv.slice(2)).catch(error=>{
  console.error(JSON.stringify({stage:'HOLD',reason:error.message}));process.exitCode=1;
 });
}
