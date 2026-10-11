/** CANNON 010 — independent, bounded verification of GHoT 030 BODY signatures.
 * No donor code imports. BODY signer consistency != owner identity.
 */
import {createHash,webcrypto} from 'node:crypto';

const TICKET_FIELDS=['kind','version','ticket_id','nonce','launch_id','descriptor','descriptor_address','proposal_address','destination','issued_at','ttl_seconds','one_operation','consent_mode','human_identity_proven','issuer_particular','signing'];
const RECEIPT_FIELDS=['kind','version','receipt_id','ticket_id','launch_id','destination','status','started_at','completed_at','proposal_address','execution_preflight_status','execution_preflight_proposal_address','result_address','error','ticket_spent','operation_attempted','success','issuer_particular','signing'];
const TICKET_BODY=TICKET_FIELDS.filter(x=>x!=='ticket_id'&&x!=='signing');
const RECEIPT_BODY=RECEIPT_FIELDS.filter(x=>x!=='receipt_id'&&x!=='signing');
const DESCRIPTOR_FIELDS=['kind','version','launch_id','label','source','destination','context','effect_if_executed','requirements','executes','permission_transfer','consent_granted'];
const JOB_FIELDS=['kind','version','repository','branch_hint','commit','path','blob_sha256','size_bytes','local_policy_sha256','source_read','donor_code_executed','permission_transferred','operation','done_locally','read_only_git','branch_program_executed','remote_effects'];
const CONTEXT_FIELDS=['repository','branchHint','commit','path','sha256'];
const SIGNING_FIELDS=['algorithm','public_key','signature','domain'];
const DEST_FIELDS=['app_id','owner_contract','operation'];
const assert=(yes,reason)=>{if(!yes)throw Error(reason)};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const exact=(x,keys)=>object(x)&&Object.keys(x).sort().join('|')===keys.slice().sort().join('|');
const requireExact=(x,keys,reason)=>assert(exact(x,keys),reason);
const hexd=(value,count)=>typeof value==='string'&&new RegExp('^[a-f0-9]{'+count+'}$').test(value);
const b64=(s,len)=>{assert(typeof s==='string'&&/^[A-Za-z0-9_-]+$/.test(s),'INVALID_BASE64URL');const b=Buffer.from(s,'base64url');assert(b.length===len&&b.toString('base64url')===s,'NONCANONICAL_BASE64URL');return b};
const sha=b=>createHash('sha256').update(b).digest('hex');
export function jcs(x,depth=0){
  assert(depth<35,'JCS_DEPTH');
  if(x===null||typeof x==='boolean')return JSON.stringify(x);
  if(typeof x==='number'){assert(Number.isSafeInteger(x),'JCS_UNSAFE_NUMBER');return JSON.stringify(x)}
  if(typeof x==='string'){assert(!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(x),'JCS_UNPAIRED_SURROGATE');return JSON.stringify(x)}
  if(Array.isArray(x)){assert(x.length<=1000,'JCS_ARRAY_LIMIT');return '['+x.map(v=>jcs(v,depth+1)).join(',')+']'}
  assert(object(x)&&Object.keys(x).length<=100,'JCS_INVALID_OBJECT');
  const keys=Object.keys(x).sort();
  // GHoT's bounded Python JCS orders ASCII keys; deny silent Unicode order divergence.
  assert(keys.every(k=>/^[\x20-\x7e]+$/.test(k)),'JCS_NONASCII_KEY');
  return '{'+keys.map(k=>JSON.stringify(k)+':'+jcs(x[k],depth+1)).join(',')+'}';
}
export const address=x=>'sha256:'+sha(Buffer.from(jcs(x)));
const domainHash=(prefix,x)=>sha(Buffer.concat([Buffer.from(prefix),Buffer.from(jcs(x))]));
function keyOf(signing,domain){
  requireExact(signing,SIGNING_FIELDS,'SIGNING_FIELDS_CHANGED');
  assert(signing.algorithm==='ECDSA-P256-SHA256'&&signing.domain===domain,'INVALID_SIGNING_DOMAIN');
  const pub=signing.public_key;
  requireExact(pub,['kty','crv','x','y'],'UNEXPECTED_PUBLIC_JWK');
  assert(pub.kty==='EC'&&pub.crv==='P-256','BAD_P256_PUBLIC_JWK');
  b64(pub.x,32);b64(pub.y,32);b64(signing.signature,64);
  return pub;
}
async function verifySignature(pub,bytes,signature){
  const key=await webcrypto.subtle.importKey('jwk',pub,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  return webcrypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,b64(signature,64),Buffer.from(bytes));
}
function bodyOf(value,fields,domain){
  const body=Object.fromEntries(fields.map(k=>[k,value[k]]));
  body.signing={algorithm:value.signing.algorithm,public_key:value.signing.public_key,domain};
  return body;
}
async function verifySigned(value,{fields,bodyFields,domain,idDomain,signatureDomain,idPrefix,idKey}){
  const kind=idKey==='ticket_id'?'TICKET':'RECEIPT';
  requireExact(value,fields,'SIGNED_'+kind+'_FIELDS_CHANGED');
  const pub=keyOf(value.signing,domain);
  assert(value.issuer_particular==='ghot-p256:'+sha(Buffer.from(jcs(pub))),'BODY_PARTICULAR_MISMATCH');
  const body=bodyOf(value,bodyFields,domain);
  const id=idPrefix+domainHash(idDomain,body);
  assert(value[idKey]===id,'SIGNED_'+kind+'_IDENTITY_MISMATCH');
  assert(await verifySignature(pub,Buffer.from(signatureDomain+jcs({[idKey]:id,...body})),value.signing.signature),'GHOT_SIGNATURE_INVALID');
  return pub;
}
function verifyDescriptor(descriptor,context){
  requireExact(descriptor,DESCRIPTOR_FIELDS,'UNEXPECTED_LAUNCH_FIELDS');
  assert(descriptor.kind==='ghot.launch.descriptor'&&descriptor.version==='0','INVALID_LAUNCH');
  assert(descriptor.executes===false&&descriptor.permission_transfer===false&&descriptor.consent_granted===false,'DESCRIPTOR_CLAIMS_AUTHORITY');
  assert(descriptor.label==='Inspect one exact locally held source file','UNEXPECTED_LAUNCH_LABEL');
  requireExact(descriptor.source,['surface_contract','source_id'],'LAUNCH_SOURCE_SCOPE');
  assert(descriptor.source.surface_contract==='ghot.branch-worker@0'&&descriptor.source.source_id===address(context),'WRONG_LAUNCH_SOURCE');
  assert(jcs(descriptor.context)===jcs(context),'LAUNCH_CONTEXT_MISMATCH');
  requireExact(descriptor.destination,DEST_FIELDS,'UNKNOWN_DESTINATION');
  assert(descriptor.destination.app_id==='branch-work'&&descriptor.destination.owner_contract==='ghot.branch-worker@0'&&descriptor.destination.operation==='hash-exact-source','UNAUTHORIZED_DESTINATION');
  requireExact(descriptor.requirements,['explicit_user_selection','destination_revalidation','execution_revalidation','consent_required_for_effectful_action'],'INVALID_LAUNCH_REQUIREMENTS');
  assert(Object.values(descriptor.requirements).every(x=>x===true),'BYPASSED_LAUNCH_GATES');
  assert(descriptor.effect_if_executed==='owner-local-source-hash','UNEXPECTED_EFFECT');
  const body=Object.fromEntries(DESCRIPTOR_FIELDS.filter(k=>k!=='launch_id').map(k=>[k,descriptor[k]]));
  assert(descriptor.launch_id==='ghot-launch-v0:'+domainHash('GHoT-LaunchDescriptor-v0|',body),'LAUNCH_ID_MISMATCH');
}
export async function verifySignedWorkerEvidence(evidence,expectedSource){
  requireExact(evidence,['schema','ticket','receipt','job','context'],'INVALID_EVIDENCE_FIELDS');
  assert(evidence.schema==='cannon.ghot-signed-source-evidence/v0','WRONG_EVIDENCE_SCHEMA');
  const {context,ticket,receipt,job}=evidence;
  requireExact(context,CONTEXT_FIELDS,'INVALID_WORK_CONTEXT');
  assert(context.repository==='the-static-collective/planZ'&&hexd(context.commit,40)&&hexd(context.sha256,64),'UNEXPECTED_SOURCE_IDENTITY');
  assert(typeof context.path==='string'&&/^[A-Za-z0-9_.\/-]+$/.test(context.path)&&context.path.split('/').every(x=>x&&x!=='.'&&x!=='..'),'BAD_CONTEXT_PATH');
  assert(context.branchHint==='experiment/fatherhand-grant-chain-residue-001','UNEXPECTED_BRANCH_HINT');
  assert(expectedSource&&context.repository===expectedSource.repository&&context.commit===expectedSource.commit&&context.path===expectedSource.path&&context.sha256===expectedSource.sha256,'ORIGINAL_GIT_SOURCE_NOT_BOUND');
  const pubTicket=await verifySigned(ticket,{
    fields:TICKET_FIELDS,bodyFields:TICKET_BODY,
    domain:'ghot.activation-ticket-signature/v0',idDomain:'GHoT-ActivationTicketId-v0|',signatureDomain:'GHoT-ActivationTicket-v0|',
    idPrefix:'ghot-activation-ticket-v0:',idKey:'ticket_id'});
  const pubReceipt=await verifySigned(receipt,{
    fields:RECEIPT_FIELDS,bodyFields:RECEIPT_BODY,
    domain:'ghot.activation-execution-receipt-signature/v0',idDomain:'GHoT-ActivationExecutionReceiptId-v0|',signatureDomain:'GHoT-ActivationExecutionReceipt-v0|',
    idPrefix:'ghot-activation-execution-receipt-v0:',idKey:'receipt_id'});
  assert(jcs(pubTicket)===jcs(pubReceipt),'GHOT_SIGNER_CHANGED');
  verifyDescriptor(ticket.descriptor,context);
  assert(ticket.descriptor_address===address(ticket.descriptor),'DESCRIPTOR_ADDRESS_CHANGED');
  assert(ticket.launch_id===ticket.descriptor.launch_id,'TICKET_LAUNCH_UNBOUND');
  assert(jcs(ticket.destination)===jcs(ticket.descriptor.destination),'TICKET_DESTINATION_UNBOUND');
  assert(ticket.one_operation===true&&ticket.consent_mode==='explicit-local-ACT'&&ticket.human_identity_proven===false,'ACT_OR_PERMISSION_CLAIM_INVALID');
  assert(Number.isInteger(ticket.ttl_seconds)&&ticket.ttl_seconds>0&&ticket.ttl_seconds<=600,'TTL_OUT_OF_BOUNDS');
  assert(typeof ticket.nonce==='string'&&ticket.nonce.startsWith('activation-'),'BAD_TICKET_NONCE');
  assert(/^sha256:[a-f0-9]{64}$/.test(ticket.proposal_address),'INVALID_PROPOSAL');
  assert(receipt.ticket_id===ticket.ticket_id&&receipt.launch_id===ticket.launch_id&&jcs(receipt.destination)===jcs(ticket.destination),'RECEIPT_TICKET_MISMATCH');
  assert(receipt.issuer_particular===ticket.issuer_particular,'DIFFERENT_BODY_SIGNER');
  assert(receipt.proposal_address===ticket.proposal_address&&receipt.execution_preflight_proposal_address===ticket.proposal_address&&receipt.execution_preflight_status==='ready','CHANGED_ACT_PROPOSAL');
  assert(receipt.ticket_spent===true&&receipt.operation_attempted===true&&receipt.success===true&&receipt.status==='EXECUTED'&&receipt.error===null,'GHOT_EXECUTION_NOT_SUCCESSFUL');
  const issued=Date.parse(ticket.issued_at),started=Date.parse(receipt.started_at),ended=Date.parse(receipt.completed_at);
  assert([issued,started,ended].every(Number.isFinite)&&started>=issued-5000&&started<=issued+ticket.ttl_seconds*1000&&ended>=started,'TICKET_EXPIRY_OR_TIMESTAMP_MISMATCH');
  requireExact(job,JOB_FIELDS,'UNEXPECTED_JOB_FIELDS');
  assert(job.kind==='ghot.branch-worker.source-observation'&&job.version==='0','UNKNOWN_JOB_KIND');
  assert(job.repository===context.repository&&job.commit===context.commit&&job.path===context.path&&job.branch_hint===context.branchHint&&job.blob_sha256===context.sha256,'JOB_SOURCE_CHANGED');
  assert(job.size_bytes>0&&Number.isSafeInteger(job.size_bytes)&&hexd(job.local_policy_sha256,64),'INVALID_JOB_WITNESS');
  assert(job.operation==='hash-exact-source'&&job.done_locally===true&&job.read_only_git===true&&job.source_read===true&&job.donor_code_executed===false&&job.permission_transferred===false&&job.branch_program_executed===false&&job.remote_effects===0,'UNDECLARED_EFFECT');
  assert(receipt.result_address===address(job),'SIGNED_JOB_RESULT_ADDRESS_MISMATCH');
  const evidenceDigest=address(evidence);
  return {schema:'cannon.ghot-signed-source-verification/v0',evidence_sha256:evidenceDigest,
    ticket_id:ticket.ticket_id,execution_receipt_id:receipt.receipt_id,source_git_commit:context.commit,source_sha256:context.sha256,
    source_path:context.path,body_signer_particular:ticket.issuer_particular,source_policy_sha256:job.local_policy_sha256,
    ticket_signature_verified:true,execution_receipt_signature_verified:true,same_body_signer:true,
    owner_identity_authenticated:false,operator_human_identity_proven:false,operation:'hash-exact-source',
    donor_program_executed:false,network_effects:0,execution_permission_exported:false};
}
