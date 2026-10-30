# INSPAND-017 — THE WHOLE BANANA (full-length Genesis)

**Scope:** full 266-second original PlayDeck temporal performance, source-owned full-performance media receipt with a real source-derived descendant, and full-length actual PlayDeck MP4/audio → Haunted Toaster Video Pantry → original foreign-material scorer → original Toaster native MP4/Dogram.

This follows INSPAND-016 (CANNON draft #87), which only qualified the first four moving seconds.

## Source-owning PlayDeck changes

Original PlayDeck branch `experiment/genesis-full-performance-receipt-001` adds **source-owner code** `packages/receipts/src/genesis-full-proof.ts`. It does not modify the old Genesis composer, Remotion source, or original `sealReceipt` rules.

- Run original `Genesis001` Remotion for **ALL frames**, no `--frames` range. Scale 0.25 renders at 320×180, which preserves **full temporal duration and original sound** but is *not* a full-resolution master.
- Original PlayDeck recomposes its actual Genesis plan (source deck, track, world rule, 24 fps, original source media) and expects `Math.ceil(plan.duration*24)` frames.
- FFprobe `-count_frames` verifies **actual frames equal complete source plan**, duration matches, 24 fps and original audio is present. It rejects truncated/short/silent or partial exports.
- Original source `projectReceipt` generates the actual receipt. Genesis has a real `freeze` descendant from `card-09`. The owner materializes the *one actual declared newCard ID* with original source-card asset/crop and explicitly empty permissions, marking that this is source-derived reuse, not a newly licensed artwork.
- **Original PlayDeck `sealReceipt`** only runs after full media proof and all descendants are materially resolved. Its own `assertValidReceipt` and `canInheritReceipt` must pass, and the output includes source media SHA-256, full-performance scope and explicit source-rights limits.
- No model is allowed to declare `rendered`, fabricate a CardSpec, or bypass descendant requirements. A reduced-resolution **whole-duration** video can satisfy the existing full-*performance* receipt rule if its actual frame count and audio pass; this does not make it a distribution master or grant publishing rights.

## Receiver: original Haunted Toaster

CANNON pins the complete original PlayDeck source-owning proof implementation and separately reviewed original Haunted Toaster fix at exact Git commits and blobs.

- Original `admitVideo(sourceMP4,{persist:false})` derives the original full-video SHA-256/specimen identity; no permanent user pantry mutation.
- The **original full source audio** (not a synthetic tone) is extracted for Toaster's native audio analyzer and score/timeline.
- Original `createForeignMaterialPlan` compiles the original source-bound `clip-luma-texture-v1` video digest, and original `renderVideo` renders the entire source duration through its scored native media renderer.
- Original Toaster issues its own `full-measure.video-receipt.v1`, independent output MP4 SHA-256 and `dogram.trace-source/v0`. These are **Toaster outputs**, not relabelled PlayDeck receipts.
- Independent re-verification checks **all full source media bytes, all audio, the original sealed source-owner receipt and descendant, original native Toaster receipt, foreign-material source identity and Dogram video-projection SHA-256**. A deliberately corrupted full source MP4 must fail.
- No code merges, publication, real-world activities or source-license/rights grants are asserted. The local `SYNTHETIC_TEST_ONLY` operator gate is required.

## Reproduction from pinned owners

```bash
# Original PlayDeck full media proof is source-owned:
npm --workspace @playdeck/receipts run test:full
npx --no-install remotion render src/index.ts Genesis001 /tmp/genesis-full.mp4 \
  --scale=0.25 --concurrency=3 --codec=h264 --crf=30
npm --workspace @playdeck/receipts run proof:full -- \
  --media /tmp/genesis-full.mp4 --out /tmp/genesis-full-proof.json

# Independent CANNON full original-owner media crossing:
node scripts/playdeck-toaster-full-banana.mjs inspect
node scripts/playdeck-toaster-full-banana.mjs build \
  --playdeck "$PINNED_PLAYDECK" --toaster "$PINNED_TOASTER" \
  --out /tmp/whole-banana --authorize SYNTHETIC_TEST_ONLY
node scripts/playdeck-toaster-full-banana.mjs verify \
  --playdeck "$PINNED_PLAYDECK" --toaster "$PINNED_TOASTER" \
  --out /tmp/whole-banana
```

### Current evidence threshold

The user-requested full result is only **VERIFIED** when **both original-owner source PR CI and CANNON full-native CI pass**, with original 266s PlayDeck video (every frame), PlayDeck source-owned rendered/sealed/inheritable receipt and materialized descendant, original full-length Haunted Toaster MP4, original native Toaster receipt and Dogram, and a cold tamper refusal.

If a renderer times out, no native Toaster output is produced, the original source seal refuses, or input media cannot be verified, the experiment must be reported as **not yet complete**. One green unit-test job, the earlier four-second video, or a spec for full performance do not by themselves meet this threshold.

The original Genesis content draws on externally hosted media; machine-valid source/render proof is not a legal rights or distribution determination.
