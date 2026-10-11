# STACK² 018 — Native Lego Floor: planZ → CANNON → GHoT → reLATTE

**Experimental branch stacked on unmerged STACK² 017.** No main merge, production deployment, owner ACT, creative KEEP, canon selection or recipient ADMIT.

## What actually runs

1. CANNON 008 performs its **original strict Git-object source verification** over exact independent planZ and historical CANNON commits, plus CANNON 018 independently verifies original planZ SENSE source, engine and original public registry commit/tree/blob; GHoT system.hash program and reLATTE R14 original code are also pinned, read and checked.
2. Native planZ \`002/bin/sense-global.mjs\` **actually runs** over *two selected, real, independently source-verified records* from original planZ \`registry/seed-plan-records.jsonl\`: \`PLZ-TRANCH-ROOM-001\` and \`PLZ-HUMAN-SUPABARDO-001\`. Their original values are retained; input file paths in the native output are the local specimen paths. Its result remains **two unauthoritative mutation candidates**.
3. Native original GHoT \`ghot/reference_node.py run system.hash\` **actually runs** with the SHA-256 of the exact complete native planZ JSON output. A task and receipt are durably stored in an isolated disposable local \`GHOT_HOME\`. CANNON independently recomputes the expected output and verifies persisted receipt bindings. This is a plain local hash, **not executing proposed plans** and not a GHoT 030 signed ACT.
4. Native original reLATTE \`scripts/opaque-roundtrip.ts\` actually creates a P-256 signed crossing **containing the exact planZ output, all five Git source witnesses, and GHoT task/receipt**, carries it through a file bundle, and obtains a distinct receiver-signed \`RECEIVED\` and \`R3_HOLD\` in an independent durable local receiving world. **No ADMIT.**
5. A separate cold verification reruns original planZ source code with the same two source records and paths; checks exact native PlanZ JSON, original Git witnesses, original local GHoT task and persisted receipt, reconstructed crossing request, reLATTE crossing/receipt signatures, signed embedded donor claims, file transport and receiver-held journal. Tampering or a changed source fails.

## Reviewable result

Run creates only a local \`OUTPUT\` directory containing:
- \`original-records.json\`, original Git source witnesses and CANNON 008 loadout report;
- two exact source-derived JSONL files, PlanZ output and native GHoT task and receipt;
- reLATTE crossing request, file transport, native signed result, sovereign receiver journal;
- \`public-inspection.json\`, a redacted proof containing no keys or source-record details beyond public IDs.

**Two native donor programs were executed**, not just fixture adapters; reLATTE is a third original runtime. This is the first narrow native connection, **not** a universal stack runtime, a production deployment, or a user-machine execution grant.

## Reproduce

Check out at exact commits:

| Owner | Commit | Native surface |
|---|---|---|
| planZ | \`e8111fdb64c5587b33aece0fed639ed3d03375ac\` | \`002/bin/sense-global.mjs\`, \`002/src/senses-engine.mjs\`, original registry |
| CANNON | this 018 branch, including Git ancestry for historical \`aabd276e4edb2ae4229ccf94eed8a7f561b17a0a\` | \`src/branch-loadout.mjs\`, STACK² 018 code |
| GHoT | \`e35dd470384d864b7b0b629a68dad570875a7df0\` | \`ghot/reference_node.py\`, \`system.hash\` |
| reLATTE | \`dcc8cdca84c440aa4294134f020fb7095bf87f24\` | R14 \`opaque-roundtrip.ts\` signed RECEIVE/HOLD |

With Node 24, Python 3, Git and the reLATTE npm dependencies installed, create \`/tmp/stack2-018-roots.json\` with exact checkout paths under \`the-static-collective/planZ\`, \`the-static-collective/CANNON\`, \`the-static-collective/GHoT\`, and \`the-static-collective/reLATTE\`.

\`\`\`sh
node scripts/stack-squared-018.mjs run \
  examples/stack-squared-018.plan.json \
  examples/branch-loadout-008.plan.json \
  /tmp/stack2-018-roots.json /tmp/stack2-native-018

node scripts/stack-squared-018.mjs verify \
  examples/stack-squared-018.plan.json \
  examples/branch-loadout-008.plan.json \
  /tmp/stack2-018-roots.json /tmp/stack2-native-018
\`\`\`

Run and verify produce different local operations: run executes one local PlanZ SENSE + one GHoT hash + one reLATTE crossing; verify reruns only local PlanZ SENSE and **does not re-execute GHoT or issue new signed receipts**. The sample CI does the original execution in its isolated GitHub runner, not on an operator's real system.

## Boundaries and next steps

- **PLANZ PROPOSAL ≠ GHoT EXECUTION REQUEST.** Only an exact SHA of the native result is hashed; the mutation proposal is not executed.
- **SOURCE PIN ≠ OWNER IDENTITY.** Local Git remote configuration and immutable SHA1 Git blobs are evidence, not rights or signer trust.
- **HASH RECEIPT ≠ SIGNED ACT.** GHoT's normal local task receipt is unsigned; reLATTE signs a carrying crossing and destination HOLD.
- **NATIVE CROSSING ≠ ADMIT.** Receiving a signed byte-bound representation does not import authority.
- **TWO REAL ORGANS ≠ UNIVERSAL INTEROPERABILITY.** This is one tightly bounded, manually authored composition recipe.
- **SUBSTITUTION REQUIRES NEW RECEIPT.** 017 already proves fixture-level replacement; next step must demonstrate native adapter replacement and local policy gates.

Follow-up experiment: STACK² 019 with independently signed GHoT 030 one-use ticket and explicit owner-local grant, plus a Workbench preview that can display typed, provenance-bound Stack Cards without permission to run automatically.
