# STRANGER ARCADE 002 — real source-door prototype and next native work

**Review-only; stack on CANNON #45.** Starting head: `32979819f5bf7e35dcb19d30fc8ffdeb8c81ccb1`, preserving original source-pinned Genesis/Constellation execution and PR ancestry #38 → #37 → #5. Issue: [CONSTELLATION-002 #46](https://github.com/the-static-collective/CANNON/issues/46).

## What is implemented in this early crossing

`scripts/stranger-source-lab.mjs` is a separate read-only **source byte research laboratory**. It reads the publicly committed CANNON `constellation/atlas.json`, picks public repos with previously inspected README SHA-256 and Git commit/tree pins (80 eligible at the Oct 29 observation), and can explicitly acquire up to 64 original public Git histories into a new external directory. It pins commit SHA, tree SHA, configured origin (not remote owner authentication), and original README blob bytes. Its build consumes those **original bytes** to compute five mission-specific source-affinity lenses, outputs deterministic source receipts, and generates a playful, offline, print-friendly first-boot desk with multiple local decisions.

Its public labels deliberately state **ZERO additional native donor runtimes executed**. It is not a 50+ native-code milestone; native 9-owner CANNON #45 remains separate and must not be weakened or relabeled. Source text resemblance is an inspectable research candidate, not runtime compatibility. No owner contacts, personal case material, outside institution submission, compute leasing, hardware action or monetary transfer.

## Run the source-lab (opt-in network acquisition)

Requirements: Git and Node 24+. Keep outputs **outside** all source trees; do not run `acquire` using a directory that exists.

```sh
# Start at this exact review branch, not main.
node scripts/stranger-source-lab.mjs acquire --into ../arcade-readme-donors --limit 64

# This build succeeds only if >= 50 original sources were fetched and verified.
node scripts/stranger-source-lab.mjs build --roots ../arcade-readme-donors/roots.json --out ../arcade-readme-output --min 50

# Independent, fresh-process reconstruction against exact Git objects + all emitted bytes:
node scripts/stranger-source-lab.mjs verify --roots ../arcade-readme-donors/roots.json --out ../arcade-readme-output --min 50
```

Open `../arcade-readme-output/first-boot.html`. Source acquisition can legitimately HOLD on missing/unreachable commits, GitHub connectivity, network policy, or changed configuration; when fewer than 50 verify, the builder fails closed. The default set is 64 selected from the 80 eligible public README source pins. Exact repository/commit/README hashes come from the previous dated atlas, not a claim that all these repos can be executed as code. Private names are not involved.

Artifacts: `source-lock.json` (exact roots by public address/pin/hash without local paths), `stations.json` (original README heading/word-affinity derivations and boundaries), `receipt.json` (all output bytes hashed), `first-boot.html` (five interactive research doors). A source-affinity score is an **evidence-derived suggestion**, not an assertion of valid interoperability or partner willingness.

## Visitor's five doors

1. **MIT** · The suitcase that helps design a house around it; prototype question, not actual fabrication.
2. **Voqal** · Zero-contact, fictional independent safety-review scenario; no intake or institutional agreement.
3. **Garden** · A possible local voluntary food network; no real resources or fulfilled needs.
4. **Jubilee** · Music and cultural artifacts as portable invitation proposals, not a real broadcast.
5. **Commons Machine** · Potential bounded energy/material/compute consequence routes; no hardware control.

Visitor controls: source inspection, ask why, deliberately challenge, local refusal, local revocation, hypothetical fork, and print. The browser edits only its own in-memory narrative. These buttons **do not run JAR;VIS or CANNON's native CLI**, cryptographically authorize field work, or simulate a completed human act. The original CANNON #45 native mission and JAR;VIS #28 runner remain separately reproducible and are the stronger technical proof.

## Required next work — Codex

This source lab is an immediate playable *scaffold*, not the desired final 50+ organ composition. Continue with #46 as an **implementation** task:

- Connect verified public source bytes to real source-owned capability adapters and bounded, typed edges, not keyword matching.
- Expand from CANNON #45's nine genuinely executed donor owners to as many safe original native donor codebases as possible; target 20+ while proving 50+ genuine source contributions. Do not count docs as executable donors.
- Reuse existing native CANNON #45 receipt/verification pipeline and JAR;VIS #28 operator; generate the five final executable challenge scenes *from the same actual receipts*.
- Produce at least one actual fan-out/fan-in, cross-owner composite route with independent cold replay, deliberate tamper/refusal and traceable intermediate hashes.
- Run actual 50+ source acquisition and native suites in CI where feasible; currently this new workflow verifies script syntax and fail-closed contracts but does **not** claim the 64-source network acquisition ran.
- Link the hosted artifact, full proof table, coverage counters, and external review gates. No main merge or production deployment.

**A good demo invites a stranger to challenge it. A valid receipt lets them demonstrate precisely why the claim survives—or doesn't.**
