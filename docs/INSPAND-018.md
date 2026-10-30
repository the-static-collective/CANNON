# INSPAND-018 — Creative Switchyard: select, compose, replay

The original PlayDeck → Haunted Toaster → Dogram media crossing is now packaged as **three explicitly selectable, independently source-proven routes** under one operator-controlled deterministic catalog. The goal is **reusability and typed composition of existing software**, not new media effects or unauthorized autonomy.

## What is genuinely selectable?

| Route | Original output | Evidence | Limitation |
| --- | --- | --- | --- |
| `CHECKPOINT_STILL` | Remotion source frame → native Haunted Toaster scored video + original Dogram | prior independently passed INSPAND-015 CI | One frame; source performance is not rendered or sealed. |
| `MOVING_EXCERPT` | Original four-second PlayDeck motion and audio → original Toaster VSPantry + foreign-material renderer → genuine video/Dogram | prior INSPAND-016 CI | First 96 frames only; PlayDeck receipt remains projected. |
| `FULL_PERFORMANCE` | Entire original Genesis temporal performance with verified 6,389-frame source-owner seal → full-duration original Toaster MP4 + Dogram | prior INSPAND-017 CI | Entire temporal sequence at reduced source 320×180; not a full-resolution master. Source rights remain unresolved. |

The source and receiver versions **differ** between routes. For the original image checkpoint Toaster is pinned to commit `3652c2a96b6b287cda316d1c92daadf7c7417eaf`, while the video assimilation routes require source-owner Toaster PR #363 at `a3ce7b1349a940325cb72362e818ce907a95f35c`. The full-performance route uses source-owning PlayDeck PR #4 at `2e410230ba2f230cd801f156ed2eecc2fd23b330`, whereas the two shorter routes use its earlier original `a7cf718421e767fd382a01894063c3eeba3d2930`. Changing the owner checkout **fails closed**.

## What is actually composed?

Each selection compiles into a four-stage, source-locked typed graph:

```text
PLAYDECK_SOURCE [original real bytes; original source full seal only when qualified]
      |
      | original proven checkpoint-image or VSPantry-video adapter
      v
TOASTER_RENDER [native video receipt issued ONLY by original Toaster]
      |
      | original full-measure.video-receipt.v1
      v
DOGRAM_TRACE [original dogram.trace-source/v0]
      |
      | held review pointer; no autonomous downstream use
      v
CANNON_REVIEW [receipt + independent cold media verification]
```

The first edge uses the **exact source-owning runner that was proven in its corresponding earlier experiment**. No broad claim is made that any PlayDeck composition, any external video, or a randomly named adapter can use this route. The catalog is scoped to the original **Genesis001** source. For the second and third edges the original video receipt and Dogram schema are explicit and independently witnessed.

Four downstream extensions (lemonPRESS, JAR;VIS, public web, and another Remotion composition) are **advertised as HOLD only**. A Dogram receipt does not establish licensed audio, permission to physically press vinyl, a model authority grant, or a general composition parser.

## Operator contract

```bash
# Nothing executes:
node scripts/creative-route-switchyard.mjs list

node scripts/creative-route-switchyard.mjs plan \
  --route MOVING_EXCERPT --out /tmp/creative-plan.json

# Executes ONLY the explicitly selected, pinned owner-native recipe:
node scripts/creative-route-switchyard.mjs run \
  --plan /tmp/creative-plan.json \
  --playdeck /path/to/exact-source-owner-playdeck \
  --toaster /path/to/exact-source-owner-toaster \
  --out /tmp/creative-result \
  --authorize SYNTHETIC_TEST_ONLY

# Separately reuses the ORIGINAL source-owner validator with no grant:
node scripts/creative-route-switchyard.mjs verify \
  --plan /tmp/creative-plan.json \
  --playdeck /path/to/exact-source-owner-playdeck \
  --toaster /path/to/exact-source-owner-toaster \
  --out /tmp/creative-result
```

`plan` contains the exact original owner Git commits, source file counts, original CANNON script and lock Git blob identities, the typed stage/edge graph, and a SHA-256 hash over the entire plan. It is neither a self-signed release nor a command grant. `run` demands a **separate** explicit operator authorization, invokes the exact previously proven source-owner script, calls the original validator again and stores native receipts. `verify` reconstructs the same plan, checks source bytes and native original owner cold verification, rehashes media and compares the user-facing review. Edited plan/proof/media fails closed.

## Verification and limits

Source test `test/creative-route-switchyard.test.mjs` checks all three routes, exact pinned source owners, the different PlayDeck full-performance evidence scope, all typed ports and stage boundaries, no accidental discovery execution, forced authorization and refusal of forged plans.

Hosted `.github/workflows/inspand-018.yml` compiles **all three real routes** and executes **two different choices**, `CHECKPOINT_STILL` and `MOVING_EXCERPT`, under the SAME new CLI, against source-owning code with original native MP4 and receipt validation. The **full-duration** recipe is selectable but not rerendered in this job because it was already separately replayed through source-owned full CI in INSPAND-017; rerendering 266 seconds for every catalog change would be wasteful. A user can explicitly run it by choosing `FULL_PERFORMANCE` and providing the matching owner checkouts and grant.

No merge, publication, user outreach, rights approval, full-resolution master, speed-up measurement, autonomous dispatch, or new artist license is claimed. This is a reusable **operator-selectable creative production switchyard**, not an autonomous generative engine.

## Next qualifying extensions

Future stages can become real only after source-owning executable tests and distinct rights review: independently prove the lemonPRESS audio-edition requirements; introduce a JAR;VIS **review ticket** rather than permission; or teach PlayDeck to compile an *explicit selected external plan* with original source-owned asset binding. Model text should never be permitted to silently mutate a typed source or grant publication.
