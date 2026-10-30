# INSPAND-014 — PlayDeck → Haunted Toaster: original-source RED-first gateway

**Status:** source-bounded engineering experiment. **Previous research:** CANNON INSPAND-013 PR #84, which identified this exact proposed edge as `HOLD_MISSING_RECEIPT_TRANSLATOR`. This PR attempts a real native compatibility test, not an AI-generated interface guess.

## The critical finding

An existing PlayDeck `PerformanceReceipt` (version `0.1`) is **not** a Haunted Toaster `full-measure.video-receipt.v1`.

We execute the **original** PlayDeck `receipt:genesis` owner script on its exact pinned source. That source makes a real Genesis composition, creates a `projected` receipt, calls its original `assertValidReceipt`, and confirms `canInheritReceipt` is **false** until full-performance evidence exists. The generated source receipt is retained unchanged with SHA-256. This is an actual owner-generated projected receipt, not a fabricated example.

We execute the actual original Haunted Toaster `isTraceableVideoReceipt` and `buildDogramTraceSource` functions from its own pinned `dogram-trace.cjs`, supplying the PlayDeck-produced original receipt. The test **must fail** with `INVALID_DOGRAM_TRACE_RECEIPT`. Merely assigning `schema: full-measure.video-receipt.v1` also **must fail**; schema-renaming is not compatibility, proof, or a verified adapter.

The hosted workflow explicitly runs a **RED** compatibility command that exits nonzero if the original Toaster refuses the foreign PlayDeck receipt. The workflow tests that this red outcome actually happened, then treats it as a valid, documented evidence result rather than faking a green interoperability implementation. A separate **GREEN held gateway** creates the content-addressed source evidence and explicit adapter specification.

## Original source owners and typed contracts

- **PlayDeck** pinned at `a7cf718421e767fd382a01894063c3eeba3d2930`, original `packages/core/src/PerformanceReceipt.ts`, `packages/receipts/src/genesis-proof.ts`, `validateReceipt.ts`, `sealReceipt.ts`. A genuine rendered and inheritable PlayDeck receipt must have a full-performance evidence record plus resolved descendants; a projected receipt is not a completed render.
- **Haunted Toaster** pinned at `3652c2a96b6b287cda316d1c92daadf7c7417eaf`, original `src/full-measure/src/render/dogram-trace.cjs` and `tests/dogram-trace.test.cjs`. Its Dogram source requires *real* original source `sha256`, `canonicalExecution.scoreAddress`, `canonicalExecution.timelineHash`, `render.visualCompiler.graphSha256`, `render.transportEncoding`, and `output.sha256`. These values are not inferable from a PlayDeck composition receipt and **must not be invented**.
- **National Treasure**, previously locked at `d6ff149a7a2d59dcb41c2c61606204b20b56a2fa`, runs the original `buildQuestionFrontier` over the missing *relationship*, not the known source endpoints. It returns a new `source-object` question with provenance `speculation`, support `unsupported` and no fabricated relation source locator.

The original owner identities, commits and exact file Git blob hashes are checked before any import or execution. The PlayDeck owner project itself performs native receipt validation; the CANNON adapter checker never certifies that an unrelated fake receipt is rendered.

## What would qualify a future working adapter?

A valid route would be a new owner-reviewed **render-intent → actual native render → verified Toaster receipt** path, **not** `PlayDeckReceipt as ToasterVideoReceipt`.

1. Obtain a real PlayDeck rendered output with independently verifiable media bytes and source rights, then correctly seal a `PerformanceReceipt` with `full-performance` evidence and resolved descendants under original PlayDeck validators.
2. Specify how the selected original PlayDeck output becomes a legitimate Haunted Toaster **render input**, including actual media transport, selected original score/seed and timeline. This stage is a *candidate interface*, not currently proven.
3. Execute the original Toaster rendering pipeline on that real input and obtain an **owner-issued** `full-measure.video-receipt.v1` with original source, score, timeline, visual compiler, encoding and output-content proofs.
4. Have the **original Toaster** `buildDogramTraceSource` accept that genuine Toaster receipt and build a `dogram.trace-source/v0`.
5. Run independent source-locked replay, deliberate incompatible-input tests, explicit rights and operator approvals, no auto-publication or credential grants. Only then should the CANNON interface registry status change from **HOLD** to separately **REPLAYED**.

**This PR does not claim those steps occurred.** It establishes the non-trivial boundary with genuine source implementations and produces an auditable, typed work package to test next. It does not write a Toaster video, adapt a PlayDeck performance, generate media, publish or claim a new working crossing.

## Operator commands

```bash
node scripts/playdeck-toaster-red-gate.mjs inspect

# Needs exact pinned owner checkouts with PlayDeck dependencies installed:
node scripts/playdeck-toaster-red-gate.mjs red \
  --playdeck "$PINNED_PLAYDECK" --toaster "$PINNED_TOASTER"
# Expected: nonzero, with EXPECTED_RED_ORIGINAL_TOASTER_REJECTS_PLAYDECK_PERFORMANCE_RECEIPT

node scripts/playdeck-toaster-red-gate.mjs build \
  --playdeck "$PINNED_PLAYDECK" --toaster "$PINNED_TOASTER" \
  --treasure "$PINNED_NATIONAL_TREASURE" \
  --out /tmp/inspand014 --authorize SYNTHETIC_TEST_ONLY

node scripts/playdeck-toaster-red-gate.mjs verify \
  --playdeck "$PINNED_PLAYDECK" --toaster "$PINNED_TOASTER" \
  --treasure "$PINNED_NATIONAL_TREASURE" --out /tmp/inspand014
```

Artifacts: `playdeck-projected-receipt.json` (unchanged owner receipt), `interface-spec.json` (source-bound missing fields and proposed stages, all held), `next-question.json` (actual NT unanswered question), `test-receipt.json` (actual native negative result + owner byte identities), `review.html` (escaped reader).

**Important scope limit:** A GREEN CI job means the source-owned RED rejection was correctly observed, the held specification is reproducible, and tampering is rejected. It does **not** mean the two native media systems can now communicate.
