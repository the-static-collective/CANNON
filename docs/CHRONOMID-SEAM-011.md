# CHRONOMID 011 — Excavating the Actual Middle

**Observed universe:** 98 repositories in the-static-collective on 2026-10-11, ordered by GitHub repository creation. The midpoint is SEAMforge (49/98; created 2026-08-07 18:16:30Z) and toaster-oracle (50/98; 2026-08-07 19:08:38Z).

This is not a ranking, a statement that those are the two most important repos, or permission to execute either. It is a genuine chronology-based starting point.

## What source programs actually contain

Original source byte pins:

- SEAMforge at 2188ffef41db27307083ea9c27751facf173ea07
  - src/types.ts: SeamCandidate, SliceReceipt, Incompatibility, ConservationReport; evidence vs inference vs proposal.
  - server.ts: Gemini-assisted evidence extraction and counterfactual simulation; fallback explicitly labeled PROPOSAL.
- toaster-oracle at 5997d1aacab0c913c7b0fb110369dc17b821db01
  - src/types.ts: CreativeProposal, requestedAxes, axis locks / burns and score/admission types.
  - src/lib/toasterValidator.ts: conversion into candidate visual score, heuristic refusal limits; random default seed and Date.now receipt ID/time.
- Native reLATTE R14 at dcc8cdca84c440aa4294134f020fb7095bf87f24.

All four exact original Git sources are checked independently using CANNON 003's real Git object verifier: commit/tree/blob IDs, blob SHA-256 and local configured Git origin. The read does not start SEAMforge, Oracle, Gemini or external APIs.

## First possible seam

**Oracle CreativeProposal -> SEAMforge evidence-tagged SeamCandidate -> reLATTE review HOLD.**

Information stays separate:
- observed original source field definitions and provenance;
- inferred compatibility (not treated as an observation);
- new proposed mapping, unavailable evidence, preserved vs transformed vs lost dimensions;
- refusal from Oracle simulator, if present, stays a *source claim*, not external admission.
- receiver-local HOLD remains its own distinct disposition.

The generated source-pinned dossier has schema cannon.chronomid-seam/v0 and includes fields recording not-run old servers, not-run Oracle validator, zero external actions, no owner authentication, and the proposed seam's required human gate checklist.

The dossier is embedded in native signed reLATTE opaque-organ crossing with separate signed RECEIVED and R3_HOLD. A cold replay checks the original Git objects again, the dossier digest, embedded source/proposal, native transport and receiver state.

## A useful found incompatibility: GHoT 030

Both chronological midpoint source snapshots are currently **main-only**, while GHoT 030's branch worker intentionally refuses branchHint=main. CHRONOMID 011 therefore produces **no GHoT ready-to-ACT candidate**, labels this as HOLD_MAIN_ONLY_SOURCE_HINT, and leaves this choice for an explicit future owner-local project branch or reviewed worker-policy evolution.

Faking a non-main branch hint to achieve READY would defeat our own law.

## What is still not built

This does not run the Oracle CreativeProposal -> VisualScoreCandidate adapter; it does not prove cross-app compatibility, artistically evaluate Oracle mutations, run an actual visual renderer, or make SEAMforge's AI interpret evidence.

The first useful follow-on would be an independent, **pure proposal-to-review adapter** using checked-in immutable fixtures, explicit caller supplied seed, and negative tests that refuse evidence-to-authority promotion. It could be branched into either project only after their owner contract is reviewed.

The neighboring chronological corridor is tranchNOSE (#48), founder-node (#52), Haunted Phonography (#54), and Autodiscography Vault (#55). Founder Node has real evidenced-adjacency logic and Phonography has real source/evidence/proposal provenance, so those are attractive second-pass candidates, but they are not silently included in this first two-project seam.

## Reproduce

Requires Node >=24, local source Git checkouts pinned to the exact commits above, and reLATTE's installed development dependencies.

    node scripts/chronomid-seam-011.mjs run roots.json /tmp/new-chronomid-011
    node scripts/chronomid-seam-011.mjs verify roots.json /tmp/new-chronomid-011

No source repo changes, branch merges or production deployments.

**CHRONOLOGY != RANK. SIMULATION ADMITTED != SYSTEM ADMITTED. PROPOSAL != EVIDENCE. HOLD != FAILURE. BRANCH != BACKLOG.**
