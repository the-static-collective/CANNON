# INSPAND-016 — Actual moving-video crossing: original PlayDeck → original Haunted Toaster → Dogram

**Stacked on** INSPAND-015 (CANNON draft PR #86), which proved an original Remotion **still** → original Toaster native image render. This experiment adds the missing distinction: **moving video and actual source audio** enter Haunted Toaster's native **video-source pantry**, rather than using a static PNG.

## Proven original Toaster pixel-range fix

The real video crossing exposed a native failure: foreign video processing yielded `yuvj420p` while the original Toaster Witness Window requires `yuv420p`. Changing transport encoders did not solve it. We patched the **original Toaster owner**, not a local copy: [Toaster draft PR #363](https://github.com/the-static-collective/the-haunted-toaster/pull/363), which adds limited-range normalization before final output. Original Toaster native tests and an FFmpeg regression are GREEN. This CANNON implementation pins the owner fix at `a3ce7b1349a940325cb72362e818ce907a95f35c`; it does not relax original receipt verification. Neither PR is merged or deployed.

## Actual original native capabilities

**Source owner PlayDeck**, pinned at commit `a7cf718421e767fd382a01894063c3eeba3d2930`:

- Run original `npm run receipt:genesis`, preserving its existing `projected` receipt. This is not sealed.
- Run original Remotion composition `Genesis001`, frames **0–95** at source 24 fps and scale 0.25, via original `npx remotion render`. This yields the first **4 seconds** of the original 266.2-second Genesis composition, with real moving frame content and audio, as an MP4.
- Verify bytes, original audio/video streams and source content SHA-256.

**Receiver owner Haunted Toaster**, pinned at commit `3652c2a96b6b287cda316d1c92daadf7c7417eaf`:

- Execute original `admitVideo(video,{persist:false})`; derive real `haunted-toaster/video-source/v1` specimen identity from the PlayDeck MP4 bytes and FFprobe observation. Does not mutate a user's local pantry catalog.
- Extract PlayDeck's original **rendered audio** into PCM WAV for the Toaster renderer; no substitute synthetic tone is introduced.
- Use original `inspectAudio`, `createVisualScore`, `resolve`, `createForeignMaterialPlan` and **original native `renderVideo({video:binding,...})`**. The foreign video runs through Toaster's source-owned FFmpeg digestion pipeline using operator `clip-luma-texture-v1`, rather than converting PlayDeck receipts into a fraudulent native schema.
- Original Toaster produces its own native MP4 and `full-measure.video-receipt.v1`; original `writeReceipt` emits `dogram.trace-source/v0`. Every binding must match the observed original PlayDeck source hash, foreign-material plan and rendered output SHA-256.
- The original `buildDogramTraceSource` reproduces the stored Dogram sidecar. Independent cold verification re-reads original MP4s, original source audio, native Toaster video receipt and Dogram bytes, and refuses tampered source media.

**What is not achieved:** this is the first four seconds of the original PlayDeck performance, **not the complete 266-second performance**. The PlayDeck receipt remains projected and non-inheritable. The Toaster receipt is a genuine result of Toaster's rendering, not a PlayDeck receipt. No copyright license, artist permission or right to publish is inferred. No software automatically merges, deploys, shares media or acts physically. This is explicitly an authorized local synthetic software experiment with actual owner media code.

## Reproduction

```bash
node scripts/playdeck-toaster-native-video.mjs inspect
node scripts/playdeck-toaster-native-video.mjs build \
  --playdeck "$EXACT_ORIGINAL_PLAYDECK" --toaster "$EXACT_ORIGINAL_TOASTER" \
  --out /tmp/inspand016 --authorize SYNTHETIC_TEST_ONLY
node scripts/playdeck-toaster-native-video.mjs verify \
  --playdeck "$EXACT_ORIGINAL_PLAYDECK" --toaster "$EXACT_ORIGINAL_TOASTER" \
  --out /tmp/inspand016
```

The hosted workflow checks exact owner Git commit and original Git blobs, runs original VSPantry/Dogram/PlayDeck receipt tests, renders original Remotion frames, runs original video-source and scored rendering, verifies identity and tests a deliberately modified PlayDeck source MP4 is rejected.

**Artifact contents:** `original-playdeck-excerpt.mp4` (real 4s moving and original audio), `original-playdeck-audio.wav` (extracted original audio), `original-toaster-digested-playdeck.mp4` (genuine native Toaster foreign-material output), native Toaster video receipt and Dogram, `playdeck-projected-receipt.json`, `native-video-proof.json`.

### Remaining genuine full-performance objective

To establish a **full PlayDeck performance crossing** in the future: render **all** 266.2 seconds, verify every frame and source rights, attach source-owned full-performance evidence and resolve all descendants through original `sealReceipt` + `assertValidReceipt`, and then admit the entire video into original Toaster foreign-material processing with a matching original full-length audio/score/timeline. Do not imply this bounded local excerpt already proves those conditions.

## Evidence threshold

The result is **verified only if hosted native CI is actually green and the artifact contains two different original-owner videos, source-owned genuine receipts and Dogram**. A red source error, CDN availability problem, native FFmpeg failure or missing media evidence must remain a failed test, not a semantic success.
