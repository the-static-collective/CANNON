#!/usr/bin/env node
/**
 * STRANGER SOURCE LAB 002 — bounded, read-only public source byte crossings.
 *
 * This is an independent companion to CANNON #45, NOT a replacement for its
 * nine original native donor runs. A read original README is source-consumed,
 * never classified as "native code executed", partner acceptance, or field work.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const SHA = /^[0-9a-f]{40}$/;
const NAME = /^the-static-collective\/[A-Za-z0-9_.-]+$/;
const STAGES = [
  { id: "mit", title: "MIT · The Suitcase Builds the House", words: ["house","hardware","power","compute","material","machine","build","energy","physical","design"] },
  { id: "voqal", title: "Voqal · First Circle, No Contact", words: ["care","safety","trust","consent","receiver","witness","hold","review","relational","permission"] },
  { id: "garden", title: "The Garden · Food Crosses Localities", words: ["food","garden","community","offer","need","farmer","local","distribution","network","voluntary"] },
  { id: "jubilee", title: "Jubilee · Culture Becomes Invitation", words: ["music","song","video","film","culture","story","audio","festival","print","creative"] },
  { id: "commons", title: "Commons Machine · One Lever, Many Consequences", words: ["water","energy","power","pressure","capability","simulation","compute","physical","resource","thermal"] }
];
const sha256 = b => "sha256:" + createHash("sha256").update(b).digest("hex");
const json = o => JSON.stringify(o, null, 2) + "\n";
const cmd = (args, options = {}) => execFileSync("git", args, {
  encoding: options.encoding ?? "utf8", timeout: 40000, maxBuffer: 12 * 1024 * 1024,
  env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_CONFIG_NOSYSTEM: "1" },
  stdio: ["ignore", "pipe", "pipe"]
});
const safeRepo = r => { if (!NAME.test(r)) throw new Error("HOLD: invalid source name"); return r.split("/")[1]; };

export function eligible(atlas) {
  if (atlas.schema !== "constellation-atlas/v1" || !Array.isArray(atlas.repositories))
    throw new Error("HOLD: unexpected CANNON atlas schema");
  return atlas.repositories.filter(r => {
    return NAME.test(r.repository) && SHA.test(r.defaultHead) &&
      SHA.test(r.tree) && /^sha256:[0-9a-f]{64}$/.test(r.inspectedFiles?.["README.md"] || "");
  }).sort((a,b) => a.repository.localeCompare(b.repository, "en"));
}

function originOf(entry) { return "https://github.com/" + entry.repository + ".git"; }
function evidence(entry, root) {
  const expected = entry.defaultHead;
  const got = cmd(["-C", root, "rev-parse", "HEAD"]).trim();
  if (got !== expected) throw new Error("HOLD: wrong commit " + entry.repository);
  const tree = cmd(["-C", root, "rev-parse", "HEAD^{tree}"]).trim();
  if (tree !== entry.tree) throw new Error("HOLD: wrong source tree " + entry.repository);
  const remote = cmd(["-C", root, "remote", "get-url", "origin"]).trim();
  if (remote !== originOf(entry)) throw new Error("HOLD: wrong configured origin " + entry.repository);
  // Verify original object bytes, not edited working tree content.
  const bytes = cmd(["-C", root, "show", "HEAD:README.md"], {encoding: "buffer"});
  const actual = sha256(bytes);
  if (actual !== entry.inspectedFiles["README.md"]) throw new Error("HOLD: source bytes differ " + entry.repository);
  const text = bytes.toString("utf8");
  const headings = text.split(/\r?\n/).filter(s => /^#{1,3} /.test(s)).slice(0, 5)
    .map(s => s.replace(/^#+ /, "").trim().slice(0, 110));
  const terms = text.slice(0, 300000).toLowerCase();
  const affinity = Object.fromEntries(STAGES.map(s => [s.id, s.words.reduce((n,w) =>
    n + (terms.includes(w) ? 1 : 0), 0)]));
  return {
    repository: entry.repository, commit: got, tree, path: "README.md",
    sha256: actual, headings, affinity, byteLength: bytes.length,
    originalSourceCodeExecuted: false, fieldVerified: false,
    disposition: "SOURCE_BYTES_VERIFIED_READ_ONLY",
    reason: "Original project text read and scored; no owner-native code or external act was invoked."
  };
}

export function makePacket(atlas, roots, min = 50) {
  const candidates = eligible(atlas);
  if (!roots || roots.schema !== "stranger-roots/v1" || !Array.isArray(roots.entries))
    throw new Error("HOLD: root list not supplied");
  const byRepo = new Map(candidates.map(e => [e.repository,e]));
  const seen = new Set();
  const stations = [];
  for (const r of roots.entries) {
    if (!r || !NAME.test(r.repository) || typeof r.root !== "string" || seen.has(r.repository))
      throw new Error("HOLD: duplicate or unsafe source root");
    seen.add(r.repository);
    const entry = byRepo.get(r.repository);
    if (!entry || entry.defaultHead !== r.commit)
      throw new Error("HOLD: source not in pinned atlas: " + r.repository);
    stations.push(evidence(entry,resolve(r.root)));
  }
  stations.sort((a,b) => a.repository.localeCompare(b.repository, "en"));
  if (stations.length < min) throw new Error("HOLD: " + stations.length + " source bytes verified; need " + min);
  const missions = STAGES.map(stage => {
    const picks = [...stations].sort((a,b) => b.affinity[stage.id] - a.affinity[stage.id] ||
      a.repository.localeCompare(b.repository, "en")).slice(0, 16);
    return {
      id: stage.id, title: stage.title,
      status: "DOCUMENTARY_RESEARCH_NOT_NATIVE_EXECUTION",
      selected: picks.map(p => ({repository:p.repository, sourceSha256:p.sha256,
        evidenceScore:p.affinity[stage.id],
        disposition: p.affinity[stage.id] ? "INSPECT_CANDIDATE" : "HOLD_NO_MATCHING_SOURCE_SIGNAL"})),
      question: "What original project code, permission and independent evidence would make this road executable?"
    };
  });
  const selected = {
    schema: "stranger-source-lab/v1",
    source: "CANNON CONSTELLATION-001 read-only public atlas",
    boundary: "Original README text verified at exact immutable Git objects; no native owner functions were invoked by this script.",
    counts: {
      originalPublicRepoReadmesVerified: stations.length,
      ownerNativeRepositoriesExecutedByThisLab: 0,
      crossOwnerNativeTransformationsByThisLab: 0,
      externallyVerifiedFieldActs: 0
    },
    missions, stations
  };
  const files = {
    "stations.json": json(selected),
    "first-boot.html": renderHtml(selected),
    "source-lock.json": json(stations.map(s=>({repository:s.repository,commit:s.commit,tree:s.tree,path:s.path,sha256:s.sha256})))
  };
  const receipt = {
    schema: "stranger-source-receipt/v1",
    scope: "source-byte research and hypothetical missions only",
    sourceCount: stations.length,
    files: Object.fromEntries(Object.entries(files).map(([name,body])=>[name,sha256(Buffer.from(body))]))
  };
  files["receipt.json"] = json(receipt);
  return files;
}

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function renderHtml(packet) {
  const serialized = JSON.stringify(packet).replace(/</g, "\\u003c");
  return "<!doctype html>\n<html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
    "<title>STRANGER ARCADE · Source Lab</title><style>" +
    ":root{font-family:system-ui,sans-serif;color:#ebf0e6;background:#141c1c}body{max-width:1080px;margin:auto;padding:18px}h1{font-size:clamp(2rem,6vw,4rem);margin-bottom:0}small{color:#aac0b4}button{cursor:pointer;border:1px solid #86d8b1;padding:10px 15px;border-radius:6px;background:#234338;color:white;margin:5px}button:focus-visible,a:focus-visible{outline:3px solid #fff}a{color:#b4efcc}main{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}.box{border:1px solid #466757;background:#1d2826;padding:18px;border-radius:12px}li{line-height:1.8}.badge{background:#5b3d18;padding:5px;border-radius:5px}pre{white-space:pre-wrap;word-break:break-word} @media(max-width:660px){main{display:block}.box{margin-bottom:15px}}@media print{body{background:white;color:black}button{display:none}.box{background:white;color:black}a{color:black}}" +
    "</style><header><small>THE STATIC COLLECTIVE · READ-ONLY FIRST BOOT</small><h1>STRANGER ARCADE</h1>" +
    "<p>Try to break our ideas. Every result is inspectable, and a refusal is a valid outcome.</p><p><b>" +
    packet.counts.originalPublicRepoReadmesVerified + " exact original public README sources verified.</b> <span class=\"badge\">0 additional native runtimes executed here</span></p>" +
    "<p>This lab is an evidence-derived doorway into CANNON #45, not a 50-executable claim. It never contacts institutions or runs physical machinery.</p></header>" +
    "<nav id=\"missions\"></nav><main><section class=\"box\"><h2 id=\"title\"></h2><p id=\"question\"></p><h3>Source doors</h3><ol id=\"doors\"></ol></section>" +
    "<section class=\"box\"><h2>Stranger controls</h2><p id=\"state\" aria-live=\"polite\">Choose a mission.</p>" +
    "<button data-act=\"inspect\">INSPECT SOURCE</button><button data-act=\"why\">ASK WHY</button>" +
    "<button data-act=\"break\">BREAK IT</button><button data-act=\"refuse\">REFUSE</button>" +
    "<button data-act=\"revoke\">REVOKE</button><button data-act=\"fork\">FORK</button>" +
    "<button data-act=\"passport\">PRINT EVIDENCE</button><h3>Local decision trace</h3><pre id=\"trace\"></pre>" +
    "<p><small>Buttons produce local fictional inspection/decision traces only. No owner code is launched by the browser.</small></p></section></main>" +
    "<script>const packet=" + serialized + ";let mission=0,trace=[],revoked=false;" +
    "const byId=id=>document.getElementById(id);const stamp=(a)=>{trace.push({step:trace.length+1,mission:packet.missions[mission].id,decision:a});byId('trace').textContent=JSON.stringify(trace,null,2)};" +
    "function draw(){const m=packet.missions[mission];byId('title').textContent=m.title;byId('question').textContent=m.question;" +
    "const list=byId('doors');list.replaceChildren();m.selected.forEach(s=>{let li=document.createElement('li');let a=document.createElement('a');a.href='https://github.com/'+s.repository+'/tree/'+packet.stations.find(p=>p.repository===s.repository).commit;a.target='_blank';a.rel='noopener noreferrer';a.textContent=s.repository.split('/')[1];li.append(a,document.createTextNode(' · '+s.disposition+' · '+s.evidenceScore+' word signals'));list.append(li)});" +
    "byId('state').textContent=revoked?'LOCAL SESSION REVOKED · reload to begin anew':'Research lens only · no native action authorized';}" +
    "packet.missions.forEach((m,i)=>{let b=document.createElement('button');b.textContent=m.id.toUpperCase();b.onclick=()=>{mission=i;stamp('SELECTED '+m.id);draw()};byId('missions').append(b)});" +
    "document.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{let a=b.dataset.act;if(a==='passport'){window.print();return}if(revoked)return;" +
    "if(a==='revoke'){revoked=true;stamp('LOCAL VIEW REVOKED');draw();return}" +
    "if(a==='break')stamp('ADVERSARIAL CHALLENGE: HOLD — inspect exact donor outputs before claims');" +
    "else if(a==='refuse')stamp('RECEIVER-LOCAL REFUSE — no upstream authority transferred');" +
    "else if(a==='fork')stamp('FORK IDEA — unsigned local hypothesis only');" +
    "else if(a==='inspect')stamp('READ ONLY: '+packet.missions[mission].selected.length+' pinned candidate READMEs, no executable donor launched');" +
    "else stamp('WHY: source text signals are not proof of compatible interfaces; see CANNON #45 for actual native execution');draw()});draw();</script></html>\n";
}

function options(argv) {
  const out={command:argv[2]}; for(let i=3;i<argv.length;i+=2) {
    if(!argv[i].startsWith("--") || !argv[i+1]) throw new Error("expected --flag value");
    out[argv[i].slice(2)]=argv[i+1];
  } return out;
}
function required(o,k) { if (!o[k]) throw new Error("missing --" + k); return resolve(o[k]); }
export function acquire(atlas, into, limit = 64) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 80) throw new Error("HOLD: unsafe source limit");
  if (existsSync(into)) throw new Error("HOLD: acquisition destination already exists");
  mkdirSync(into,{recursive:true});
  const entries=[],held=[];
  for(const e of eligible(atlas).slice(0,limit)){
    const name=safeRepo(e.repository); const root=join(into,name);
    try {
      mkdirSync(root);cmd(["-C",root,"init","-q"]);cmd(["-C",root,"remote","add","origin",originOf(e)]);
      cmd(["-C",root,"fetch","--quiet","--depth=1","origin",e.defaultHead]);
      cmd(["-C",root,"checkout","-q","--detach","FETCH_HEAD"]);
      evidence(e,root);
      entries.push({repository:e.repository,commit:e.defaultHead,root});
    }catch(err){held.push({repository:e.repository,reason:"HOLD_FETCH_OR_SOURCE_VERIFICATION_FAILURE"});}
  }
  const roots={schema:"stranger-roots/v1",entries,held};
  writeFileSync(join(into,"roots.json"),json(roots));
  return roots;
}
export function writePackage(files,out,verify=false) {
  if(verify){
    for(const [name,bytes] of Object.entries(files)){
      if(!existsSync(join(out,name)) || readFileSync(join(out,name),"utf8")!==bytes)
        throw new Error("HOLD: independent byte replay differs at "+name);
    }
    return;
  }
  if(existsSync(out)) throw new Error("HOLD: output exists");
  mkdirSync(out,{recursive:true});
  try{for(const [name,bytes] of Object.entries(files))writeFileSync(join(out,name),bytes,{flag:"wx"});}
  catch(e){rmSync(out,{recursive:true,force:true});throw e;}
}
async function main(){
  const o=options(process.argv);
  const atlas=JSON.parse(readFileSync(resolve(o.atlas||"constellation/atlas.json"),"utf8"));
  if(o.command==="acquire"){
    const roots=acquire(atlas,required(o,"into"),Number(o.limit||64));
    console.log(json({acquired:roots.entries.length,held:roots.held.length,status:roots.entries.length>=50?"READY":"HOLD"}).trim());
    if(roots.entries.length<50)process.exitCode=2;return;
  }
  if(!["build","verify"].includes(o.command))throw new Error("usage: acquire|build|verify --atlas file --into dir or --roots file --out dir");
  const roots=JSON.parse(readFileSync(required(o,"roots"),"utf8"));
  const files=makePacket(atlas,roots,Number(o.min||50));
  writePackage(files,required(o,"out"),o.command==="verify");
  console.log(json({action:o.command,status:"SOURCE_READ_ONLY_VERIFIED",sources:roots.entries.length,
    nativeOwnersExecutedByThisLab:0,files:Object.keys(files)}).trim());
}
if(process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href)
  main().catch(err=>{console.error(String(err.message||err));process.exitCode=2});
