/**
 * VOQAL SELF-APPLICATION 001.
 * The verified cultural/proposal machine prepares a grant draft for a human.
 * It never claims that software is the applicant, that a survivor service exists,
 * or that a grant submission or partner consent occurred.
 */
import {createHash} from 'node:crypto';
const h=v=>'sha256:'+createHash('sha256').update(v).digest('hex');
const fail=(ok,code)=>{if(!ok)throw Error('VOQAL_HOLD:'+code)};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const GRANT=Object.freeze({
  name:'Voqal Partners Fellowship 2027',
  source:'https://voqalpartners.org/fellowship/',
  guide:'https://voqalpartners.org/wp-content/uploads/2026/08/FellowshipApplicationGuide_2026.pdf',
  application:'https://voqalpartners.org/fellowship/',
  closes:'2026-10-31T22:59:00-05:00',
  fundingUsd:30000,
  sixMonths:'April–September 2027'
});
export const BUDGET=Object.freeze([
 ['Applicant time and living support',12000,'Preserve six months for careful listening, development and stewardship.'],
 ['Compensated survivor/community reviewers',6000,'Pay people with lived experience and independent accountability.'],
 ['Qualified safeguarding/facilitation consultation',3500,'Obtain responsible design and training before any contact pilot.'],
 ['Accessibility and accommodations',2500,'Paper/phone options, accessible formats, interpretation as needed.'],
 ['Print and offline tools',1800,'Account-free, private-first invitations and review materials.'],
 ['Local travel and meeting space',1700,'Willing-host listening sessions and supervised, bounded testing.'],
 ['Legal, insurance and privacy consultation',1500,'Check scope, risk, confidentiality and independent governance.'],
 ['Basic equipment and minimal hosting',1000,'Minimal replaceable tools rather than platform dependence.']
]);
export const FIELDS=Object.freeze({
 title:{limit:200,text:'Still Here — The First Circle Foundry'},
 overview:{limit:750,text:'Still Here — The First Circle Foundry asks how people cut off from trusted networks can form new, independently governed circles of practical support. Beginning with isolated adults, especially fathers affected by relationship abuse and family separation, we will co-design a need-first, testimony-optional first contact with paid survivor advisors and qualified safeguarding reviewers. Through paper, phone and optional offline tools, we will test voluntary introductions to existing resources, real refusal and withdrawal, and independently reviewed outcomes. The long-term goal is a reproducible founding method communities can own, change, and carry forward without our permission or dependence on a platform.'},
 impact:{limit:10000,text:'Collective liberation means removing the hidden prerequisite of already belonging to a trusted network. A person facing isolation, unstable housing or relationship abuse should be able to reach a safe next human step without handing over their story to a platform, a gatekeeper or an unqualified group. The people affected must be able to redesign the doorway, refuse participation, withdraw, and retain independent control of any practice they choose to use. This challenges centralized authority, compulsory disclosure and the habit of treating professional polish as more important than lived expertise. Disability access, racial and economic inequity, and different experiences of coercion need independent paid critique; my own perspective is not universal. In twenty years, I hope groups can inherit a practical method for forming their first voluntary circle without needing my software, permission or organization. Success also includes an independently justified decision not to launch a risky service.'},
 summary:{limit:7500,text:'April: listen to independent survivor and safeguarding advisers; map existing qualified services, disability access needs, data risks and stop rules. May: co-design one testimony-optional first-contact path through paper, phone or optional digital tools, with explicit refusal and withdrawal. June: only if qualified safeguarding, host authority and informed consent exist, try one bounded, facilitated introduction or navigation step; otherwise run synthetic exercises and document the HOLD. July: commission separate safety, privacy and accessibility review. August: revise optional founding and invitation tools, keeping low-tech alternatives equal. September: offer any approved method for independent critique or adoption and report failures as clearly as useful outcomes. Small listening tables and practical meetings are the funded center; festivals, branches and large platforms are potential future forms, not promised activities or service outcomes. This six-month project does not offer therapy, legal representation, confidential case intake or automated survivor matching.'},
 resources:{limit:5000,text:'I need coaches and compensated people with relevant lived experience to test my assumptions, plus qualified safeguarding, accessibility, facilitation, privacy and governance expertise. I have built open-source instruments for human-controlled proposals and verification, but software cannot appoint trusted reviewers or create a safe first relationship. Funding would primarily protect focused time and pay human participants, reviewers, travel, meetings, access accommodations and competent safety advice. I want to learn how to recruit independent reviewers without manufacturing consent, how to stop an unsafe experiment, and how to transfer useful methods without transferring founding authority.'},
 lineage:{limit:5000,text:'[APPLICANT PRIVATE REVIEW REQUIRED: Explain, in your own words, the lived experience behind the first-contact question, who actually supported you, and whose legacy you intend to honor. Do not copy unreviewed personal, family, legal or survivor details from public source code. The public prototype demonstrates a technical possibility; it does not substitute for this answer.]'},
 ai:{limit:5000,text:'Yes. Generative AI helped research published fellowship requirements, organize drafts, and build and test open-source software. In an intentionally self-referential demonstration, the software was used to generate this review-only application packet from its own independently replayed technical evidence. I will check and approve each first-person claim myself. AI may assist with accessible drafts and bounded local tooling; it will not judge abuse reports, choose trustworthy people, determine legal rights, authenticate participant consent or publish private survivor data. A human can refuse every suggested step. The source-linked demonstration is real software execution using fictional cases, not evidence of a safe operating support group or independent community approval.'},
 coaching:{limit:1500,text:'[APPLICANT PRIVATE REVIEW REQUIRED: Confirm whether you have had formal coaching and answer truthfully. I would value a coach who challenges technical assumptions, tests survivor-centered safeguards and helps translate independent prototyping into accountable, genuinely shared human governance. I want to know when to refuse a pilot or adapt a proven existing practice instead.]'},
 supporting:{limit:500,text:'https://github.com/the-static-collective/CANNON/pull/45 · https://github.com/the-static-collective/webZ/pull/195 · https://github.com/the-static-collective/webZ/pull/196 — technical prototypes only; no field outcome, partner or endorsed survivor service.'},
 anything:{limit:2500,text:'The intentionally odd thing about this application is that a reproducible software system produced a draft about the social problem it cannot solve by itself: how a person with no trusted network finds the first safe human. The evidence bundle shows exact-source software integration, the right to refuse and independently held proposals. It does not show real trust, participant benefit, a licensed service or an organization’s approval. That gap is precisely what the fellowship could fund people, not machines, to investigate. An honest HOLD can be the right result.'}
});
export function validateFields(fields=FIELDS){
 for(const [name,{limit,text}] of Object.entries(fields)){
  fail(typeof text==='string'&&text.length>0&&text.length<=limit,'CHARACTER_LIMIT_'+name);
  fail(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text),'CONTROL_CHARACTER_'+name);
 }
 fail(BUDGET.reduce((n,row)=>n+row[1],0)===GRANT.fundingUsd,'BUDGET_UNBALANCED');
 return true;
}
const idCheck=x=>typeof x==='string'&&/^sha256:[a-f0-9]{64}$/.test(x);
export function verifyConstellationEvidence(receipt,manifest,brief,manifestBytes,briefBytes){
 fail(receipt?.schema==='constellation.receipt/v1'&&receipt.status==='ORIGINAL_SOURCE_SOFTWARE_EXECUTED','NO_ORIGINAL_EXECUTION');
 fail(idCheck(receipt.receiptId)&&receipt.sourceRepositories===9&&receipt.donorCheckouts===10,'RECEIPT_ORIGIN');
 fail(receipt.fieldVerified===false&&receipt.physicalActs===0&&receipt.externalContacts===0&&receipt.humanDeeds===0&&receipt.ownerCanonSelected===false,'FALSE_FIELD_AUTHORITY');
 fail(manifest?.schema==='constellation.manifest/v1'&&manifest.authority==='LOCAL_FICTIONAL_SOFTWARE_ONLY','MANIFEST_AUTHORITY');
 fail(receipt.manifestSha256===h(manifestBytes)&&receipt.coreFiles?.['manifest.json']===h(manifestBytes),'SOURCE_BYTES_MISMATCH');
 fail(brief.startsWith('<!doctype html>')||brief.startsWith('<!DOCTYPE html>'),'BRIEF_NOT_HTML');
 return true;
}
function markdown(fields,receipt){
 const lines=['# Still Here — The First Circle Foundry','',
 '**VOQAL 2027 — SELF-REFERENTIAL APPLICATION DRAFT / NOT SUBMITTED / APPLICANT APPROVAL REQUIRED**','',
 'Grant: '+GRANT.name+' · Due Saturday October 31, 2026, 10:59 p.m. Central · Individual award $30,000.','',
 '## Why this packet is unusual','',
 'The proof-producing system generated a draft about its own limit: building a safe first human relationship. The software evidence is technical; a real person, independent safeguarding and community permission remain the proposed fellowship work.','',
 '## Copy-ready portal fields (each subject to applicant review)',''];
 for(const [name,{limit,text}] of Object.entries(fields))
  lines.push('', '### '+name+' ('+text.length+' / '+limit+' characters)','',text);
 lines.push('','### Suggested program area','', 'Other (community power and survivor-led first contact); applicant to choose.','','## Proposed $30,000 allocation','',
 '| Use | USD | Purpose |','| --- | ---: | --- |',...BUDGET.map(([name,amount,why])=>`| ${name} | $${amount.toLocaleString('en-US')} | ${why} |`),
 '| **TOTAL** | **$30,000** | Planning allocation, not granted funding |','','## Public technical evidence','',
 '- Exact source execution: https://github.com/the-static-collective/CANNON/pull/45',
 '- Relational inheritance without automatic authority: https://github.com/the-static-collective/webZ/pull/196',
 '- Original Voqal human-first candidate: https://github.com/the-static-collective/webZ/pull/195',
 '- This evidence chain source receipt: '+receipt.receiptId,
 '','## Applicant-only final gates','',
 '- Choose final project framing, program area, pronouns, eligibility and six-month availability.',
 '- Privately revise lived experience and coaching responses. No personal/legal/child details belong in public repository output.',
 '- Check $30,000 budget against official template; upload through own account.',
 '- Verify public technical links open and all status claims remain correct.',
 '- Submit personally using https://voqalpartners.org/fellowship/ before deadline; preserve official confirmation privately.',
 '- NO submission, email, grant request, survivor intake, partner contact or consent was created by this build.',
 '');return lines.join('\n');
}
function html(fields,receipt){
 let section='';
 for(const [name,{text,limit}] of Object.entries(fields))
  section+='<section><h2>'+esc(name)+' <small>'+text.length+'/'+limit+'</small></h2><p>'+esc(text)+'</p></section>';
 const budget=BUDGET.map(([name,n,why])=>'<tr><td>'+esc(name)+'</td><td>$'+n.toLocaleString('en-US')+'</td><td>'+esc(why)+'</td></tr>').join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Still Here — Voqal self-application</title><style>
 :root{font-family:system-ui,sans-serif;background:#f2eee4;color:#1d302b}body{max-width:960px;margin:auto;padding:24px;line-height:1.6}h1{font:clamp(2rem,5vw,4rem) Georgia,serif;line-height:1.1}h2{font:1.5rem Georgia,serif;border-bottom:1px solid #9caa9c;padding-bottom:6px}section,header{background:#fffdf7;padding:20px 25px;margin:12px 0;border:1px solid #acbdb3;border-radius:10px}small{font:0.8rem system-ui;color:#546961} .warn{border-left:6px solid #865b32;padding:12px;background:#f9e9ce}table{border-collapse:collapse;width:100%}th,td{padding:8px;border:1px solid #acbdb3;text-align:left}button,a.action{display:inline-block;border:0;background:#234b40;color:white;padding:10px 16px;text-decoration:none;border-radius:8px;margin:4px;cursor:pointer}@media print{body{max-width:none;padding:0;background:white}button,.action{display:none!important}section{break-inside:avoid;border:1px solid #999;margin:8px 0}h1{font-size:26pt}}
 </style></head><body><header><p class="warn"><strong>DRAFT ONLY — NOT SUBMITTED.</strong> Voqal funds an individual, not an autonomous software applicant. First-person sections require personal approval.</p><h1>The machine applies for the people it cannot replace.</h1><p><strong>Still Here — The First Circle Foundry</strong> · Proposed 2027 Voqal Partners Fellowship.</p><p>Verified source experiment: <code>${esc(receipt.receiptId)}</code></p><p><a class="action" href="https://voqalpartners.org/fellowship/">Go to official Voqal application page</a><button onclick="window.print()">Print this application review</button></p></header><main>${section}<section><h2>Working budget — $30,000</h2><table><thead><tr><th>Purpose</th><th>USD</th><th>Reason</th></tr></thead><tbody>${budget}</tbody></table></section><section><h2>Source evidence and boundaries</h2><p><a href="https://github.com/the-static-collective/CANNON/pull/45">Original multi-repository executable proof</a>; <a href="https://github.com/the-static-collective/webZ/pull/196">inheritance without central authority</a>; <a href="https://github.com/the-static-collective/webZ/pull/195">human-first Voqal candidate</a>.</p><p>Claims: 9 independently owned donor repositories, 10 exact checkouts, fictional case, zero verified human outcomes, no external application or contact.</p><p>Deadline: Saturday October 31, 2026, 10:59 p.m. Central. Applicant must personally verify eligibility, budget and all statements, and submit through Voqal's portal.</p></section></main></body></html>\n`;
}
export function composeApplication(receipt,manifest,brief,manifestBytes,briefBytes,fields=FIELDS){
 validateFields(fields);verifyConstellationEvidence(receipt,manifest,brief,manifestBytes,briefBytes);
 const md=markdown(fields,receipt),page=html(fields,receipt);
 const csv='Use,USD,Purpose\n'+BUDGET.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n')+'\n';
 const form={schema:'voqal.self-application-review/v1',
  applicationStatus:'NOT_SUBMITTED_APPLICANT_REVIEW_ONLY',
  organization:'Voqal Partners',cohort:2027,applicantType:'INDIVIDUAL_HUMAN',
  programSource:GRANT.source,deadline:GRANT.closes,
  title:FIELDS.title.text,programArea:'Other — applicant must select',
  fields:Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,{text:v.text,length:v.text.length,limit:v.limit,approved:false}])),
  budget:BUDGET.map(([category,usd,purpose])=>({category,usd,purpose})),
  sourceReceipt:receipt.receiptId,sourceManifestSha256:h(manifestBytes),
  engineeringEvidence:'ORIGINAL_EXECUTED_SYNTHETIC_CASE_NOT_A_FIELD_SERVICE',
  humanRequirements:['Approve every first-person claim','Confirm eligibility and 2027 availability',
   'Review lived history and coaching privately','Upload budget using actual portal requirements',
   'Submit application personally and retain real confirmation'],
  authority:{submission:false,applicantApproved:false,grantAwarded:false,partnersEnrolled:false,
   humanWitnessed:false,licensedService:false,survivorIntake:false,pennyIssued:0}};
 const outputs={'application-review.md':md,'application-review.html':page,'budget.csv':csv,'form-copy.json':JSON.stringify(form,null,2)+'\n'};
 const body={schema:'voqal.self-application-receipt/v1',proofSource:receipt.receiptId,
  inputs:{manifest:h(manifestBytes),originalVoqalBrief:h(briefBytes)},
  artifacts:Object.fromEntries(Object.entries(outputs).map(([name,body])=>[name,h(body)])),
  status:'HOLD_FOR_INDIVIDUAL_APPLICANT_REVIEW',
  externalSubmissions:0,externalMessages:0,privateCaseFactsImported:0};
 return {outputs:{...outputs,'self-application-receipt.json':JSON.stringify({...body,receiptId:h(JSON.stringify(body))},null,2)+'\n'},form};
}
