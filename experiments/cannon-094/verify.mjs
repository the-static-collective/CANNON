// CANNON-094: independently inspect original MOTIF impossibility, invoke the
// unmerged ORIGINAL GRAFT-029 generator, test its actual new executable against
// unseen synthetic scenarios, and retain both fair classical controls + HOLD.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

export const GRAFT_COMMIT='5023b594b0daa4f0328d01643a7f258b71f60bb9';
export const MOTIF_ORIGINAL='5ee9207f04af2826750863526af7f92b31ef8578';
const DONOR={
 'src/missing-operator-forge-029.mjs':'3ce0366a26b927a63cf22f0e99a70e4f3db89258',
 'test/missing-operator-forge-029.test.mjs':'da6f79812975eef79b2aabde932051cd54f4ef45',
 'scripts/run-forge-029.mjs':'2db20583f51de006b4ef121459a1a0b73c29dfc2'
};
const MOTIF_BLOB='b9f1e7b7879a94f7ef3869bc305608c4d7fa8695';
export class HOLD extends Error {}
export const sha=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const gitBlob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const req=(x,msg)=>{if(!x)throw new HOLD(msg)};
function command(program,args,opts={}){
 try{return execFileSync(program,args,{encoding:'utf8',timeout:18000,
  maxBuffer:1_000_000,stdio:['pipe','pipe','pipe'],...opts}).trim()}
 catch {throw new HOLD('Original source-owner replay failed')}
}
export function checkSource(root,commit,pins){
 root=resolve(root);
 req(command('git',['-C',root,'rev-parse','HEAD'])===commit,'Git commit not pinned');
 const records=[];
 for(const [path,want] of Object.entries(pins).sort()){
  const data=readFileSync(join(root,path));
  req(gitBlob(data)===want,'Original source bytes mismatch: '+path);
  req(command('git',['-C',root,'rev-parse','HEAD:'+path])===want,
      'Exact owner Git tree disagrees: '+path);
  records.push({path,git_blob_sha1:want});
 }
 return records;
}
const PY_REPLAY=`
import json,sys
sys.path.insert(0,'experiments/002')
import motif002 as m
samples=json.loads(sys.stdin.read())
fixed=m.induce(m.lessons())
world=m.scene()
goal=('inspected','bike1')
adds=sorted({fact[0] for v in fixed.values() for fact in v.adds})
assert goal not in world
assert 'inspected' not in adds
assert not any(goal in future for _,_,future in m.possibilities(world,fixed))
cases=[]
for row in samples:
 before=frozenset(tuple(x) for x in row['world'])
 after=frozenset(set(before)|{('inspected',row['roles']['target'])})
 cases.append(m.Transition(before,after,'SYNTHETIC'))
learned=m.induce(cases)
held=set(m.scene())
success=any(goal in nxt for _,_,nxt in m.possibilities(frozenset(held),learned))
denied=frozenset(m.scene(permissions=False))
leak=any(('inspected','bike1') in nxt for _,_,nxt in m.possibilities(denied,learned))
print(json.dumps({'fixed_verb_count':len(fixed),
 'invariant_holds':True,'fixed_step8_reaches':goal in m.explore(world,fixed,steps=8)['final'],
 'same_labeled_examples_classical_verb_count':len(learned),
 'fair_classical_synthetic_goal_reached':success,
 'fair_classical_denied_permission_leak':leak}))
`;
export function originalControl(originalRoot,originalTrain){
 checkSource(originalRoot,MOTIF_ORIGINAL,{'experiments/002/motif002.py':MOTIF_BLOB});
 let x;
 try{x=JSON.parse(command('python',['-c',PY_REPLAY],
   {cwd:resolve(originalRoot),input:JSON.stringify(originalTrain)}));}
 catch{throw new HOLD('Original MOTIF classical control unavailable')}
 req(x.invariant_holds===true&&x.fixed_verb_count===2&&
   x.fixed_step8_reaches===false&&x.fair_classical_denied_permission_leak===false,
   'Original MOTIF reachability or consent control violated');
 return x;
}
export function proofCheck(gap){
 const {content_sha256,...body}=gap;
 req(gap.schema==='motif.missing-operator.v0'&&
    gap.status==='PROVEN_UNREACHABLE_UNDER_ORIGINAL_FIXED_VERBS'&&
    gap.scope==='CLOSED_SYNTHETIC_REWRITE_ONLY'&&
    gap.original_source_commit===MOTIF_ORIGINAL&&
    JSON.stringify(gap.requested_goal)===JSON.stringify(['inspected','bike1'])&&
    gap.requested_target_type==='bike'&&
    gap.proof?.source_git_blob_sha1===MOTIF_BLOB&&
    gap.proof?.original_verb_count===2&&
    gap.proof?.original_fixed_replay_reaches_goal===false&&
    gap.proof?.original_emitting_verbs?.length===0&&
    gap.permission_to_propose_local_code===true&&
    gap.permission_to_deploy===false&&gap.permission_to_contact===false,
    'Synthetic gap lacks independent proof markers');
 req(content_sha256===sha(body),'Original MOTIF question changed');
 return content_sha256;
}
const cases=()=>{
 const mk=(owner,actor,target,o={})=>{
  const w=[['person',owner],['person',actor],['bike',target]];
  if(o.broken!==false)w.push(['broken',target]);
  if(o.permit!==false)w.push(['permits',owner,o.wrong?'Other':actor,target]);
  return {world:w,roles:{owner,actor,target},
    expect:o.broken!==false&&o.permit!==false&&!o.wrong};
 };
 return [
  mk('Hal','Ian','cycleD'),mk('Pia','Quin','cycleE'),
  mk('Hal','Ian','cycleD',{permit:false}),
  mk('Pia','Quin','cycleE',{broken:false}),
  mk('Hal','Ian','cycleD',{wrong:true}),
  mk('Rob','Sue','cycleF',{broken:false,permit:false})
 ];
};
async function executeSource(source,request){
 const {execute}=await import('data:text/javascript;base64,'+
    Buffer.from(source).toString('base64'));
 return execute(request);
}
export async function review(graftRoot,motifRoot,gap){
 const src=checkSource(graftRoot,GRAFT_COMMIT,DONOR);
 const gapSha=proofCheck(gap);
 const owner=await import(pathToFileURL(resolve(graftRoot,'src/missing-operator-forge-029.mjs')).href);
 owner.validateGap(gap);
 const examples=owner.casesForSyntheticGraph();
 const classical=originalControl(motifRoot,examples.train);
 const native=await owner.cultivate(gap,examples);
 req(native.schema==='graft029.operator-synthesis-review/v0'&&
   native.status==='HELD_GENERATED_OPERATOR_FAMILY'&&
   native.variants_generated===3&&
   native.selected?.guard_contract?.join(',')==='broken,permits'&&
   native.external_actions===0&&native.auto_install===false&&
   native.source_owner_selected_canon===false,
   'Original GRAFT operator family not independently established');
 const rewritten=owner.compileVariant(gap,native.selected.guard_contract);
 req(rewritten.source===native.selected.source&&
   rewritten.source_sha256===native.selected.source_sha256&&
   rewritten.runner==='NO_IO_PURE_FUNCTION'&&rewritten.code_installed===false,
   'Original owner cannot regenerate generated operator');
 const independent=cases();
 const evaluated=await Promise.all(independent.map(async trial=>{
  const got=await executeSource(native.selected.source,{
   world:trial.world,roles:trial.roles
  });
  return {expect:trial.expect,
    predicted:got.status==='PROPOSED_SYNTHETIC_ADD',
    status:got.status,added:got.added,
    correct:trial.expect===(got.status==='PROPOSED_SYNTHETIC_ADD'),
    no_field_action_executed:true};
 }));
 req(evaluated.every(x=>x.correct)&&
   evaluated.every((x,i)=>x.expect?
    JSON.stringify(x.added)===JSON.stringify(['inspected',independent[i].roles.target]):
    x.added===null),
   'Unseen source-invention validation failed');
 const body={
   schema:'cannon.graft-new-operator-review.v0',
   status:'HOLD_GENERATED_OPERATOR_UNADMITTED',
   original_motif_gap_sha256:gapSha,
   source_owner:{repo:'the-static-collective/GRAFT',commit:GRAFT_COMMIT,
     verified_git_blobs:src,authority_from_sha:false},
   original_original_motif_commit:MOTIF_ORIGINAL,
   classical_reference:classical,
   generated:{
     grammar:native.generated_family,
     source:native.selected.source,
     source_sha256:native.selected.source_sha256,
     head_relation:native.selected.add_relation,
     required_guards:native.selected.guard_contract,
     genuine_original_graft_compiler:true,
     installed:false,
     executable_permissions:'NONE'
   },
   native_evidence:{
     original_graft_checksum:native.content_sha256,
     variants_generated:native.variants_generated,
     rejected:native.leaderboard.filter(x=>!x.held_validated).map(x=>({
       guards:x.guard_contract,failures:x.failures
     }))
   },
   independent_final:{
     n:independent.length,
     correct:evaluated.filter(x=>x.correct).length,
     positives:independent.filter(x=>x.expect).length,
     negatives:independent.filter(x=>!x.expect).length,
     details:evaluated
   },
   synthetic_original_fixed_grammar_unreachable:true,
   synthesized_extended_grammar_can_reach_goal:true,
   fair_classical_learner_can_receive_same_examples:true,
   superior_to_classical_not_claimed:true,
   no_observed_physical_inspection:true,
   consent_from_packet:false,
   signed:false,automatic_repo_writes:0,external_requests:0,
   operator_admitted:false
 };
 return {...body,content_sha256:sha(body)};
}
async function main(args){
 if(args.length!==8||args[0]!=='--graft'||args[2]!=='--original'||
     args[4]!=='--gap'||args[6]!=='--output')throw new HOLD('Invalid CLI options');
 const gap=JSON.parse(readFileSync(args[5],'utf8'));
 const pkt=await review(args[1],args[3],gap);
 writeFileSync(args[7],JSON.stringify(pkt,null,2)+'\n',{flag:'wx',mode:0o600});
 console.log(JSON.stringify({status:pkt.status,source:pkt.generated.source_sha256,
  independent:pkt.independent_final,
  original_fixed_reachable:false,
  fair_classical_also_learns:pkt.classical_reference.fair_classical_synthetic_goal_reached}));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 main(process.argv.slice(2)).catch(e=>{
  console.error(JSON.stringify({stage:'HOLD',reason:e.message}));process.exitCode=1;
 });
}
