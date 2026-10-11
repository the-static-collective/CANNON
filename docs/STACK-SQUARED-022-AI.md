# CANNON STACK² 022 — The Thinking Workbench carries a native receipt

**Status:** experimental, stacked on CANNON STACK² 018 (draft #25). No merge
or owner deployment. The source owner is GHoT, not CANNON.

## New relation

```
Human: explicit input and selected GHoT card(s)
     ↓
GHoT: exact PLAN → APPROVE → actual Instrument Rack dispatch
     ↓
GHoT: deterministic text processor ± local llama.cpp executor
     ↓
GHoT: signed reLATTE-shaped dispatch and execution receipts
     ↓
GHoT: portable packets + unsigned comparison (quality UNASSESSED)
     ↓
CANNON STACK² 022: independently pin actual GHoT Git commit and native source
     ↓
CANNON: invoke original GHoT packet signature verifier without rerunning work
     ↓
CANNON: local evidence-index witness with explicit HOLD / no receiver R3
```

CANNON does not implement a second LLM, impersonate an actual human operator,
merge the GHoT branch, guess adapter compatibility, or treat a receipt as true.
Native inference belongs to GHoT's source-owned Instrument Rack (PR #69
descendant). The native experiment branch is
`GHoT/experiment/ai-recomposition-001-thinking-workbench`.
CANNON's proposed typed Stack Card is a **non-executable evidence intake**.

## Exact source

The plan `examples/stack-squared-022-ai.plan.json` pins the original GHoT
commit `6194d91ba83bad63606f6f6741723007227518f2` and the native
verification entrypoint and imported core instrument files. Inspection checks
that the local checkout HEAD matches and that required files match their
original Git blob bytes. A separate native Python process verifies the
reLATTE-shaped signatures and packet bindings from original GHoT code.
CANNON does not infer signer authority from Git object possession.

## Reproduce

Run the native GHoT 001 `plan`, approved `run`, and `verify` sequence in its
[original experiment documentation](https://github.com/the-static-collective/GHoT/blob/experiment/ai-recomposition-001-thinking-workbench/docs/AI-RECOMPOSITION-001.md)
with a checkout at the pinned commit.

Then inside the CANNON repository:

```sh
node scripts/stack-squared-022-ai.mjs inspect \
 examples/stack-squared-022-ai.plan.json \
 /absolute/path/to/GHoT-pinned-checkout \
 /private/path/to/report.json /private/path/to/cannon-witness.json

node scripts/stack-squared-022-ai.mjs verify \
 examples/stack-squared-022-ai.plan.json \
 /absolute/path/to/GHoT-pinned-checkout \
 /private/path/to/report.json /private/path/to/cannon-witness.json
```

CANNON witness outputs contain only source identity, evidence digests,
capabilities, native signed receipt IDs, status, and explicit authority
nonclaims—not the underlying song text or the generated interpretation.
The **source report remains private**; never commit a personal report.

GitHub Actions demonstrates actual deterministic GHoT dispatch against its
exact pinned source, then CANNON independent signed evidence verification and
cold replay. Hosted CI does not execute a large language model; real model
processing remains an optional GHoT owner-host operation.

## Critical boundaries

- `CANNON SOURCE PIN != GHoT HUMAN APPROVAL`.
- `GHoT INSTRUMENT EXECUTED != CANNON EXECUTED IT`.
- `SIGNED GHOT DISPATCH != R3 RECEIVE`.
- `CANNON UNSIGNED WITNESS != reLATTE SIGNED RECEIVER HOLD`.
- `COMPARISON REPORT != PROOF OF MODEL QUALITY`.
- `PACKET != ADMISSION`.
- `BRANCH != INTEGRATION BY MERGE`.

This is an independently testable STACK² evidence link. The following
experiment should connect a signed native GHoT portable packet to the
**original reLATTE R14 receiver** and demand a real separately signed
RECEIVED / R3_HOLD. That third leg is intentionally **not** claimed in 022.
