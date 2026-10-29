import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../creative/"+p,import.meta.url),"utf8"));
const source=read("reactor-book-sources.json"),orbit=read("reactor-creator-orbit.json");
test("three original owners are SHA pinned",()=>{
 assert.equal(source.authority,"HELD_SYNTHETIC_CROSSING_ONLY");
 assert.deepEqual(Object.keys(source.owners).sort(),["lemonpress","planz","workbench"]);
 for(const r of Object.values(source.owners)){
  assert.match(r.repo,/^the-static-collective\//);assert.match(r.commit,/^[0-9a-f]{40}$/);assert.ok(r.native.includes("."));
 }
});
test("eight new creators remain proposals not imaginary execution",()=>{
 assert.equal(orbit.status,"PROPOSAL_ONLY_NOT_EXECUTED");
 assert.ok(orbit.options.length >= 8);
 assert.equal(new Set(orbit.options.map(x=>x.owner)).size,orbit.options.length);
 assert.ok(orbit.options.every(x=>x.proposedCrossing&&x.gate));
 for(const name of ["Static Live","Static Field","STATIC OS","JAR;VIS MADDCL0WN"]) assert.ok(orbit.options.some(x=>x.owner===name));
});
test("native runner asserts zero external effect authority",()=>{
 const s=readFileSync(new URL("../scripts/reactor-book-crossing.mjs",import.meta.url),"utf8");
 for(const marker of ["CI_SCRIPTED_HOLD_ONLY","actualExternalHumanReview:false","actualMachineOrHardwareRun:false","projectOwnerAdmission:false","NATIVE_SOFTWARE_EXECUTED_BUT_ALL_EFFECTS_HELD"]) assert.ok(s.includes(marker),marker);
});
