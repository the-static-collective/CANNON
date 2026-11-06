# CANNON-097 — Independent Review of MOTIF's Hidden Common-Source Model

**Status: HELD.** This experiment independently recomputes the five source-origin scenarios of [MOTIF-012](https://github.com/the-static-collective/MOTIF/tree/experiment/door-foundry-012-hidden-source) from its original, unmerged, source-pinned executable Python outputs.

## What is checked independently

- Verifies **MOTIF-012 source owner commit `cd4884af4cb456aeab07f8f5738d1df0f6d3c852`** and the exact Git blob IDs of `hidden_source.py` and `test_hidden_source.py`.
- Reads the four original MOTIF-009 binary PNG world files and their SHA-256 receipts through prior independent CANNON-096 functionality.
- Checks **Python-canonical JSON hashes independently through the Python standard library**, without importing MOTIF's inference implementation. This is necessary to preserve number distinctions in source JSON.
- Recomputes the full **3 latent source-partitions × 4 original PNG-world possibilities** as exact BigInt rational probabilities in JavaScript, without calling MOTIF's Bayesian solver.
- Independently replays each 0/1/2-question optimum and each branch under the declared synthetic question-response likelihoods and costs, without importing MOTIF's question solver.
- Refuses reports that suddenly claim actual witness identity, unseen upstream receipts, authenticated external evidence, changed latent probabilities, altered source ancestry, or false question-deployment authority.
- Checks **both directions**: a synthetic shared-origin scenario and a synthetic genuinely independent scenario whose five authors nevertheless have identical wording and near-identical report times. It also checks a two-upstream-cluster fixture and two explicitly inconclusive cases.
- Records a separate unsigned **CANNON HOLD** receipt listing five finite scenarios, original-source identity and constraints.

## What this does *not* establish

All clues and fixtures are constructed by the experimenter. The cue likelihoods are hand-assigned, not calibrated. No real source identity has been authenticated; the presence of identical prose is not evidence of hidden copying by itself. **A high posterior is a conditional result of a closed, fictional one/two/five-source hypothesis model**, not confirmation of an actual conspiracy or independent human witness.

The original GRAFT/CANNON visual program source remains experimental. No external API call, human contact, real image observation, production deployment, automatic code admission or physical action occurs.

This reviewer is deliberately mathematically *equivalent* to the same-data classical finite Bayesian and decision-tree computation. It is not an intelligence-performance improvement over classical probability theory.

## Evidence and reproduction

The separate `.github/workflows/cannon-097.yml` checks out all relevant immutable source owners, regenerates MOTIF's original PNG images, runs original GRAFT-030 owner tests and CANNON-095 code review, executes the original MOTIF-009 image world program and the original MOTIF-012 Python emitter, then calls **CANNON-097**:

```sh
node --test experiments/cannon-097/test-review.mjs
node experiments/cannon-097/review.mjs \
  --motif motif-source \
  --question original-question \
  --hidden hidden-source-results \
  --out evidence/cannon-097-review.json
```

The independent test suite contains **14 tests**, including false-origin and forged-human-authority negatives. The output `cannon097.hidden-origin-review.v0` has status `HOLD_LATENT_ORIGIN_MATH_REPLAYED_WITNESSES_UNAUTHENTICATED`.

The standalone original-source CI archive contains the original question packet, all five synthetic source scenarios and a held CANNON review. MOTIF-012 can consume this reviewer as a pinned read-only dependency in its own workflow.

**Source checksum ≠ actual witness identity. Simulated provenance ≠ observed truth. Mathematical agreement ≠ permission to act.**
