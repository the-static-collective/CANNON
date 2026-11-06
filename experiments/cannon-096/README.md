# CANNON-096 — Source Origins, Not Repeated Witness Echoes

**HOLD** independent evidence-review experiment. CANNON independently examines the original, unmerged [MOTIF-011](https://github.com/the-static-collective/MOTIF/tree/experiment/door-foundry-011-evidence-dependency-frontier) source at immutable commit `c41ff828e167a406fab25ef2b0a272be5e736ad2`, verifies its exact Git blob, checks source-owned original MOTIF-009 four PNG world files against retained byte hashes, and replays MOTIF-011's original source-generated synthetic provenance-graph receipts. This is independent executable **math validation**, not an attestation that any witness exists.

## What is independently checked

- Original four binary PNGs and held source-model uncertainty. The original GRAFT-030 generated visual operator was already code-reviewed by original CANNON-095. A content hash only establishes content identity.
- Ten report receipts per scenario: one initial declared sensor root, six explicit source-derived retransmissions, three differently declared sensor roots. All source roots and their duplicate descendants are **simulated**.
- Every parent pointer must reference a previously seen same-origin report, without a changed claim or invented new physical measurement. No duplicate source root, changed upstream, missing parent, falsely independent copy, or fabricated human observation is admitted.
- **Independent exact-rational Bayesian implementation in JavaScript** reconstructs posterior likelihoods from the four declared source roots **once each**. A deliberately incorrect baseline treats all ten reports as independent. Every intermediate posterior, root/copy counter, report chain and final decision is checked.
- Contradictory source roots are **preserved**; their disagreement is not erased by selecting the more frequently repeated claim.
- SHA256 validation of all original Python receipt records is independently performed through Python's **standard library JSON serializer**, not the original MOTIF application code. This matters: Python distinguishes `1.0` from `1` for canonical JSON hashing; JavaScript's default parser does not. The JS Bayesian code itself uses exact rational arithmetic, with no import of MOTIF's Bayesian implementation.
- Six independent source-dependence copies are ignored as **new likelihood factors**, not suppressed from the append-only record. The CANNON held receipt records four test worlds, 24 copies inspected, original source pins, and explicitly unsigned no-authority fields.

## Limits

Declared root identifiers such as `SIMULATED_SENSOR_A` are **not independently authenticated witnesses**. A malicious adversary could give the same actual source four invented identities. This experiment detects **declared structural dependency**, not covert source coordination, real-world source credibility, deception, calibration, or whether the source is even a real person. Its synthetic 80% conditional root accuracy is an authored probability, not measured reliability.

Synthetic gains arise because the source graph was explicitly designed with one mistaken root echoed six times and three differently declared, correct independent roots. No claim of real-world generalization, independence or superiority to a same-data classical source-collapsed Bayesian calculation is warranted. No network access, people contact, real observations, deployment, code admission or repository changes occur during experiment execution.

The reviewer emits `cannon096.independent-provenance-review.v0` at status `HOLD_DEPENDENCY_STRUCTURE_VERIFIED_SOURCE_INDEPENDENCE_UNATTESTED`; it is **not** a signature, authentication or canonical promotion.

## Reproduction

The dedicated `.github/workflows/cannon-096.yml` checks out all four original source owners at immutable commits (MOTIF-011, MOTIF-006, GRAFT-030, CANNON-095), produces **original source-native real PNG artifacts**, runs original MOTIF-011 to generate genuine synthetic source-graph evidence, and then independently evaluates every packet from CANNON's own code, with adversarial alteration tests.

```sh
node --test experiments/cannon-096/test-review.mjs

node experiments/cannon-096/review.mjs \
  --motif motif-source \
  --question original-question \
  --ledger source-graph \
  --out evidence/cannon-096-review.json
```

The separate MOTIF-011 workflow can consume the new CANNON reviewer **read-only at the exact reviewer Git commit**, preserving CANNON's independent code and experimental branch custody. No automatic merge or authority transfer.
