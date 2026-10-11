#!/usr/bin/env node
/** Synthetic CI ceremony only; NOT a human or machine owner's actual ACT.
 * CANNON ingestion is distinct and never issues or upgrades authority.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync,mkdirSync,writeFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {identifySources,ingest} from '../src/branch-signed-crossing-010.mjs';
import {jcs} from '../src/ghot-signed-030.mjs';
const assert=(yes,msg)=>{if(!yes)throw Error(msg)};
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const write=(p,x)=>writeFileSync(p,JSON.stringify(x,null,2)+'\n',{flag:'wx',mode:0o600});
try{
  // Guard against a test helper accidentally running on a user machine.
  assert(process.env.GITHUB_ACTIONS==='true'&&process.env.CANNON_010_TEST_ACT==='DISPOSABLE_CI_SANDBOX_ONLY',
    'LAB_ACT_REFUSED_OUTSIDE_EXPLICIT_CI_OPT_IN');
  const [planFile,rootsFile,outDir]=process.argv.slice(2);
  assert(planFile&&rootsFile&&outDir&&process.argv.length===5,'USAGE: lab plan.json roots.json fresh-output-dir');
  const plan=read(resolve(planFile)),roots=read(resolve(rootsFile)),out=resolve(outDir);
  assert(!existsSync(out)&&!existsSync(out+'-lab'),'LAB_OUTPUT_ALREADY_EXISTS');
  const src=identifySources(plan,roots);
  const home=join(out+'-lab','ghot-home');
  mkdirSync(home,{recursive:true,mode:0o700});
  const context=src.expectedContext;
  const candidate={schema:'ghot.branch-worker-candidate/v0',context};
  const policy={schema:'ghot.branch-worker-sources/v0',entries:[{
    context,checkout_root:resolve(roots['the-static-collective/planZ']),
    reviewed_for_local_read:true
  }]};
  write(join(out+'-lab','candidate.json'),candidate);
  mkdirSync(join(home,'branch-worker'),{recursive:true});
  write(join(home,'branch-worker','sources.json'),policy);
  const gh=join(src.ghRoot,'ghot/branch_worker.py');
  const env={...process.env,GHOT_HOME:home};
  const execute=args=>JSON.parse(execFileSync('python3',[gh,...args],{
    cwd:src.ghRoot,env,encoding:'utf8',timeout:35000,maxBuffer:3*1024*1024,
    stdio:['ignore','pipe','pipe']}));
  const preview=execute(['preview',join(out+'-lab','candidate.json')]);
  assert(preview.status==='READY'&&preview.execution_performed===false&&preview.act_authorized===false,'NOT_AN_INERT_READY_PREVIEW');
  const result=execute(['act',join(out+'-lab','candidate.json'),'--expected',preview.proposal_address,'--confirm','ACT']);
  assert(result.schema==='ghot.branch-worker-result/v0'&&result.verified_success===true&&result.operator_identity_proven===false,'GHOT_ACT_FAILED');
  const ticketPaths=readdirSync(join(home,'activation-tickets','tickets')).filter(x=>x.endsWith('.json'));
  assert(ticketPaths.length===1,'EXPECTED_EXACTLY_ONE_SIGNED_TICKET');
  const ticket=read(join(home,'activation-tickets','tickets',ticketPaths[0]));
  assert(ticket.ticket_id===result.ticket_id,'WRONG_TICKET_READ');
  const savedReceiptPaths=readdirSync(join(home,'activation-tickets','receipts')).filter(x=>x.endsWith('.json'));
  assert(savedReceiptPaths.length===1,'EXPECTED_EXACTLY_ONE_SIGNED_RECEIPT');
  const persistedReceipt=read(join(home,'activation-tickets','receipts',savedReceiptPaths[0]));
  assert(jcs(persistedReceipt)===jcs(result.execution_receipt),'GHOT_PERSISTED_RECEIPT_MISMATCH');
  assert(persistedReceipt.receipt_id===result.execution_receipt.receipt_id,'PERSISTED_RECEIPT_ID_CHANGED');
  const resultPaths=readdirSync(join(home,'activation-tickets','results')).filter(x=>x.endsWith('.json'));
  assert(resultPaths.length===1,'EXPECTED_EXACTLY_ONE_RESULT');
  const savedJob=read(join(home,'activation-tickets','results',resultPaths[0]));
  assert(jcs(savedJob)===jcs(result.job),'GHOT_PERSISTED_JOB_MISMATCH');
  const evidence={schema:'cannon.ghot-signed-source-evidence/v0',ticket,receipt:persistedReceipt,job:savedJob,context};
  write(join(out+'-lab','signed-ghot-evidence.json'),evidence);
  const proven=await ingest(plan,roots,evidence,out);
  assert(proven.status==='SIGNED_GHOT_TO_RELATTE_HOLD_COLD_VERIFIED','CROSSING_NOT_VERIFIED');
  console.log(JSON.stringify({schema:'cannon.signed-ghot-lab-result/v0',
    ghot_ticket_id:proven.summary.ghot_ticket_id,
    ghot_execution_receipt_id:proven.summary.ghot_execution_receipt_id,
    crossing_id:proven.summary.crossing_id,
    disposition:proven.summary.receiver_disposition,
    signatures_verified:proven.ghotSignedObjectsVerified+proven.relatteSignedObjectsVerified,
    synthetic_ci_act_only:true,owner_human_identity:false,
    donor_program_execution:false,external_effects:0},null,2));
}catch(error){console.error('HOLD:',String(error.message).slice(0,300));process.exitCode=2}
