import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { eligible, makePacket } from "../scripts/stranger-source-lab.mjs";

test("published atlas contains 50+ independently inspectable public readme pins", () => {
  const atlas=JSON.parse(readFileSync(new URL("../constellation/atlas.json",import.meta.url),"utf8"));
  const candidates=eligible(atlas);
  assert.ok(candidates.length>=50, "at least 50 candidate public sources");
  assert.ok(candidates.every(e=>e.repository.startsWith("the-static-collective/")));
  assert.ok(candidates.every(e=>e.inspectedFiles["README.md"].startsWith("sha256:")));
});

test("the source lab cannot claim verified crossings without actual source roots",()=>{
  const atlas=JSON.parse(readFileSync(new URL("../constellation/atlas.json",import.meta.url),"utf8"));
  assert.throws(()=>makePacket(atlas,{schema:"stranger-roots/v1",entries:[]}),/HOLD/);
  assert.throws(()=>makePacket(atlas,{schema:"bad",entries:[]}),/HOLD/);
  assert.throws(()=>makePacket(atlas,{schema:"stranger-roots/v1",entries:[{repository:"invalid/foreign",root:"/tmp"}]}),/HOLD/);
});