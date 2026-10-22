# CANNON STACK² 027 — THE WARM THREAD COMES HOME

**2026-10-22 · human-approved native experiment · DRAFT / HOLD · not canon · not deployed**

Parent: [STACK² 026 Care Return × PLENTY](https://github.com/the-static-collective/CANNON/pull/31). This is a child of the *unmerged* STACK² 026 branch. No donor repo is modified or merged. This project extends the chain 024 (two fictional currents) → 025 (original native card/quest/room) → 026 (original care status and PLENTY) with a distinctly scoped new **physical-logistics refusal** route.

## What is new and truly native

Four original source-owned implementations are checked out as separate exact Git objects, then run through their existing functions:

| Source | Exact pinned commit | Original program role |
|---|---|---|
| [GHoT Warm Thread #33](https://github.com/the-static-collective/GHoT/pull/33) | `3c8be40cbaef2f9c786e5424abf15d4b138d2966` | Python **proposal** producer, and later original **recompose** receiver |
| [Full Measure Warm Thread #50](https://github.com/the-static-collective/full-measure-world-layer/pull/50) | `553e97401a8483a0ee3c369fed9d3fb8f1c9058d` | Original actor-scoped local ACT / REFUSE, finite consequence, and unresolved residue |
| [Band Runtime return #25](https://github.com/the-static-collective/band-runtime/pull/25) | `f2c889df90905eda533fe6d978cd1a52c788a33e` | Original RECEIVE, note validation, unchanged requirement projection and conserved status |
| [BananaSpork Garden return #8](https://github.com/the-static-collective/BananaSpork/pull/8) | `6738230a8557060dd59aabc19caf21826806d16f` | Original device-local HOLD, duplicate carriage, restart reconstitution and unshared POUR preview |

Exact HEAD and required file Git-blob bytes are verified **before importing donor code**, and source owners remain unchanged. Pinning Git bytes is not authentication of real people, consent, institutional permission or real-world acts.

## The scenario (entirely fictional)

Original GHoT composes a fictional path:

- Alice has a fallen tree and may choose to release it;
- Bob has a declared 45 minutes of wood-cutting capacity;
- Cara has one truck load of declared hauling capacity;
- David needs one load for home heat.

The original Full Measure receiver opens the GHoT proposal as a local **world preview only**. In the explicit simulated path:

1. Alice separately ACTs, then a local source-state transition succeeds.
2. Bob cannot inherit Alice's authority. Bob separately ACTs; the cutting operation succeeds in the local simulation. Cut firewood now exists **in the simulated world only**.
3. Cara chooses REFUSE when the hauling step arrives. Wrong-actor refusal is rejected.
4. The Full Measure original residue preserves the earlier simulated steps, unhauled cut firewood, truck capacity not consumed, David's unresolved need, and the `haul-firewood` gap. No person is scored or judged.
5. The original **GHoT** recompose command consumes that exact Full Measure residue. It proposes another fictional actor (Erin) for hauling while preserving the previous steps. Erin's proposal is NOT authorization. The existing original GHoT code refuses score-tainted recomposition input.

These are **original GHoT → original Full Measure → original GHoT functions**, not duplicated CANNON reimplementations.

### The Garden / Band seam is deliberately narrower

CANNON independently constructs a **clearly source-labeled fictional Help Slip** with one fictional transport requirement: one `load` of cut firewood. It is **NOT** a GHoT-authored, Nourish-Kids-authored or real person's private request. This is the boundary at which a future explicit, source-owned adapter would need to bind independently authorized need identity and lineage.

Garden's **original** HOLD accepts this synthetic slip twice yet retains one local case and two arrival occurrences; a fresh store object reconstructs that history. Its native POUR preview is not published, and a native Garden residual calculation leaves one load unresolved.

Band Runtime independently receives the same original fixture bytes, detects repeat carriage, and validates **one CANNON-transcribed informational note** about the Full Measure refusal. This note is **not** a transport offer, authorization, delivery report or recipient confirmation. Band's native status packet preserves one full outstanding load with zero confirmed units and correct conservation.

CANNON checks that the independently produced Band and Garden residuals both remain `1 load`. It creates **only a CANNON-held inspection**, not an automatic Garden writeback. There is no source-native GHoT→Band authorization adapter, no independently confirmed matching real-world need and no source-owned actual field receipt.

## Important counterexample: a successful *simulation* is not confirmed help

The experiment also plays an alternate **entirely local** Full Measure simulation where Alice, Bob, Cara and David each supply a separate simulated ACT and all four steps succeed.

Full Measure can then legitimately say that its *local fictional preview* reached `met-for-this-load`.

**Band Runtime still reports zero confirmed real assistance.** It is never given a recipient-authorized actual occurrence based on the fictional scene. Nothing in the chain silently treats the local preview's outcome as a human witness.

```text
           GHoT ORIGINAL
           candidate offer
                 |
            FULL MEASURE
        Alice ACT → Bob ACT
                 |
             Cara REFUSE
                 |
          HELD RESIDUE:
       firewood cut at source
       haul unresolved / need open
                 |
          GHoT RECOMPOSE
         Erin is a candidate
        NOT an assigned helper
                 |
        CANNON fixture bridge
       (separate, transparent)
                 |
       GARDEN local HOLD x2
       one demand / no sharing
                 |
       BAND event: NOTE only
       confirmed = 0 / need = 1
                 |
          CANNON INSPECTION
       no recipient or website
```

## Hostile and recovery checks

- Reject **wrong actor** ACT and wrong actor refusal; every action requires its own independently declared step authority within the fixture.
- Refuse downstream step execution after Cara's refusal, while preserving earlier simulated resource consequences.
- Reject GHoT recompose input containing a score; refuse any attempt to turn refusal into personal deficiency.
- Garden rejects a fabricated source envelope asserting it is already fulfilled; duplicate carrier cannot double the underlying need.
- Band rejects `receipt.confirmed` without its declared recipient authority basis; importantly, even a correctly shaped basis would only be a **test fixture**, not actual recipient authentication.
- Playing a separate successful local Full Measure outcome does **not** create a Band confirmation or erase the outstanding Help Slip.
- Reject wrong Git SHA, changed original source bytes, swapped source roots, extra roots and held receipt tampering on cold replay.
- Keep the receipt **create-only**; never overwrite original held evidence.

## Verification and local reproduction

Files: [native original-donor coordinator](../labs/crater-027/native.mjs), [hostile contract tests](../labs/crater-027/native.test.mjs), [exact-SHA CI](../.github/workflows/stack2-027-warm-thread.yml).

GitHub Actions independently checks out the four exact source commits, installs the existing Garden's `tsx` dependency without running package scripts, runs original GHoT Python simulation tests and original Full Measure tests, then runs the four-donor CANNON test and independent cold reproduction.

For a local run, check out the exact four commits into separate directories, install Garden's Node dependencies and set the environment variables `CRATER_GHOT`, `CRATER_FULL`, `CRATER_BAND`, `CRATER_GARDEN`, and `CRATER_TSX_CLI` (Garden's installed tsx CLI). Provide the four absolute checkout directories in a private `roots.json` with keys `ghot`, `full`, `band`, `garden`.

```sh
node "$CRATER_TSX_CLI" --test labs/crater-027/native.test.mjs
node "$CRATER_TSX_CLI" labs/crater-027/native.mjs run /private/roots.json /private/new-receipt.json
node "$CRATER_TSX_CLI" labs/crater-027/native.mjs verify /private/roots.json /private/new-receipt.json
```

An E2 native software test passes **only after** CI completes on the exact final PR head. Other inherited STACK² experiments have distinct proofs; success here does not retroactively validate them for live human use. Retain DRAFT/HOLD even after green CI.

## Why this is relevant to community care

Care is not a single transaction. A multi-person resource chain can progress partially, with one member exercising a perfectly legitimate right to decline. Preserving both the earlier useful work and the remaining unresolved need allows others to propose a continuation without coercing or penalizing the person who refused.

But a project can only be useful in an actual community when participants themselves authorize their own roles, needs, contact disclosures, handoffs and public records. The October 24 Coalition of Care gathering is an opportunity for listening, not an assumed partner pilot. The Coalition, Katie Boone, Deb Groebner, Real Life Covenant, Kinship, or any other outside party has not authorized this prototype.

**HAVE ≠ ACCESS · CAPACITY ≠ OBLIGATION · STEP ACT ≠ FUTURE ACT · LOCAL CONSEQUENCE ≠ FIELD EVIDENCE · REFUSAL ≠ DEFECT · NOTE ≠ DELIVERY · HELD STATUS ≠ PUBLICATION · RETURN ≠ RETROACTIVE AUTHORITY.**
