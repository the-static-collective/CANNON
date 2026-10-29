# GROOVETOWN-002 — Particularity Engine

The first town could only say “Explore obtaining 2 loaves of bread.” This experiment turns a town-local outstanding need and explicitly supplied, visibility-labelled facts into a **work order, one next question, an unsent invitation, proof checklist, held crossing, creative brief, and field card**. It never fabricates missing names, hours, routes, people or real-world success.

## Run

Requires the sibling original `experiments/groovetown-001/groovetown.mjs` from its exact ancestral CANNON draft PR. Node 20+, zero dependencies:

```sh
node --test experiments/groovetown-001/groovetown.test.mjs experiments/groovetown-002/particularity.test.mjs
node experiments/groovetown-002/particularity.mjs demo /tmp/groovetown-002
# Open /tmp/groovetown-002/05-field-brief.html
```

The fixture supplies five **fictional** local constraints: a bakery, handoff location, time window, transport and a permissioned contact channel. Its name is not a real shop or pantry. The compiler produces a different, explicit `HOLD_MISSING_CONTEXT` output if information is absent; a town whose ledger already confirms the need produces `NO_OPEN_NEED`. Output is strictly from `visibility:SHARE` facts; `PRIVATE` and `NO_USE` evidence is excluded from public exports and their digests. All fictional data uses `SYNTHETIC` evidence labels.

## Why outputs become particular

`same need + different verified/supplied local constraints = different work order`. Each claim retains its source reference and SHA-256 digest. It gives the next safe action, blockers, an independent confirmation requirement and a testable measure. The creative brief is derived from *remaining local need*, not unbounded prompt randomness. If that changes, the creative instruction changes. Nothing is automatically sent, assigned, rewarded or executed. The local `READY_FOR_HUMAN_REVIEW` flag indicates planning-field completeness, **not verified capacity, permission or execution authority**.

## What this does not do

This is new CANNON-owned demonstration code; it does not execute native planZ, Garden, reLATTE, Haunted Toaster, Static Live, or creative model code. The `CREATIVE_BRIEF` is not rendered audio; the `HELD_CROSSING` is not a signed reLATTE transfer. No real humans, stores, recipient consents, deliveries, time savings, musical compositions, or approved publications are established. Human review and independent physical verification remain indispensable. Work remains in a draft review-only branch, without auto-merge or deployment.

## Next crossing

Use owner-native Garden Help Slips to supply source facts and identity/consent scopes. Pass the typed, receipt-backed work order to planZ for multiple approaches; ask JAR;VIS to transform those verified constraints into distinct opt-in outputs for volunteer, steward and donor. A real reLATTE receiver can separately ADMIT/HOLD/REFUSE the published facts, while private details never cross.