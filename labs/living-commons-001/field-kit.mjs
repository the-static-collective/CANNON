// STACK² 025 — photo-printable paper-first conversational field kit.
// Offline, fictional, no collection, deployment, QR, or simulated authorization.
import {readFileSync} from 'node:fs';
import {inspect} from './engine.mjs';
import {audit} from './breath-audit.mjs';
const here=new URL('./',import.meta.url);
const cards=[
 ['01 / OFFER','Something I can share','A skill, tool, place, hour, harvest, ride, listening ear or creative gift.','What would make offering this easy?','No promise until I choose to give it.'],
 ['02 / NEED','One small thing that could help','Describe a bounded practical need, not a person’s private history.','What is the smallest useful next step?','An ask is not an assignment.'],
 ['03 / BUILD','A thing we could make together','A shared table, local food link, project, performance or new doorway.','Who wants to explore it voluntarily?','A possibility is not a partnership.'],
 ['04 / CONNECT','Who knows a way?','A voluntary human introduction can be more useful than a database.','Who should be asked before making an introduction?','No automatic introductions.'],
 ['05 / STEWARD','Consent is the hinge','Ask who may see this, who owns the next action, and what must remain private.','Is the answer YES, NO, or HOLD?','Silence is not consent.'],
 ['06 / RETURN','Leave a door, not a demand','Agree on one human-readable next step, a way to decline, and a time to revisit.','How can both people find this again?','No account, scan, app or QR required.']
];
export function renderFieldKit(projection,result){
 if(projection?.classification!=='SYNTHETIC_INSPECTION_ONLY'||result?.schema!=='cannon.community-breath-audit/v0'||
    result?.liveOperations!==false||result?.communityAuthorized!==false||result?.operationalReady!=='NOT_ASSESSED')
   throw Error('FIELD_KIT_REFUSED: synthetic non-operational input required');
 const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const body=cards.map(c=>`<section class="card" aria-label="${esc(c[0])}">
 <div class="header"><span class="mark">✳</span> THE NEIGHBOR DOOR <small>${esc(c[0])}</small></div>
 <h2>${esc(c[1])}</h2><p>${esc(c[2])}</p><h3>${esc(c[3])}</h3>
 <div class="line"></div><div class="line"></div>
 <footer><span>${esc(c[4])}</span><b>⊙</b></footer></section>`).join('');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Living Commons | Paper-first cards</title>
<style>
@page{size:8in 10in;margin:0}*{box-sizing:border-box}
html,body{margin:0;background:#d0c6ab}body{font-family:Georgia,'Times New Roman',serif}
.sheet{width:8in;height:10in;margin:auto;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);background:#efe8d6;overflow:hidden}
.card{position:relative;overflow:hidden;padding:.30in .25in .2in .28in;color:#183c33;border:.7px dashed #786b4b;
 background:radial-gradient(circle at 104% -4%,#e0c588a0 0 14%,transparent 37%),linear-gradient(145deg,#e7dfc7 0%,#f8f0d9 47%,#e3ddc7 100%)}
.card:before{content:"";position:absolute;inset:8px;border:1px solid #8d7955;pointer-events:none}
.card:after{content:"";position:absolute;bottom:-.8in;right:-.5in;width:1.75in;height:1.75in;border:2px solid #c3a97666;border-radius:50%;box-shadow:0 0 0 11px #b8976333,0 0 0 23px #8f9b6a22}
.header{font:600 8px Arial,sans-serif;letter-spacing:1.2px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #bdab7d;padding-bottom:10px}
.mark{font-size:17px;color:#a68c48}.header small{font-size:7px;letter-spacing:.3px;color:#6e683f}
h2{margin:19px 0 8px;font-size:20px;line-height:1.1;letter-spacing:-.3px}p{font-size:10.5px;line-height:1.4;min-height:41px;margin:8px 0}
h3{font-style:italic;font-size:11px;font-weight:400;color:#6f6947;margin:13px 0 0}
.line{height:19px;border-bottom:1px solid #b5a8838e}
footer{position:absolute;bottom:.2in;left:.28in;right:.24in;display:flex;align-items:center;justify-content:space-between;gap:9px;font:7px Arial,sans-serif;letter-spacing:.23px}
footer b{font-size:19px;color:#a68c48}
@media screen{.sheet{box-shadow:0 5px 50px #293d33aa;margin:24px auto}}
@media print{html,body{background:white}.sheet{margin:0;print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style></head><body><main class="sheet" aria-label="Six cards on eight by ten inch sheet">${body}</main></body></html>`;
}
function main(){
 const c=JSON.parse(readFileSync(new URL('./fictional-case.json',here),'utf8'));
 const r=JSON.parse(readFileSync(new URL('./source-registry.json',here),'utf8'));
 const a=JSON.parse(readFileSync(new URL('./community-breath-census.json',here),'utf8'));
 process.stdout.write(renderFieldKit(inspect(c,r),audit(a,r)));
}
if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
 try{main()}catch(e){console.error(e.message);process.exitCode=1}
}
