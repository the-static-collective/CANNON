# INSPAND-015 — Native checkpoint media crossing, not a fake performance receipt

This crossing addresses the exact RED contract from CANNON #85 / INSPAND-014. It uses **original owner native implementations** and a bounded intermediate format that both existing engines actually support.

## What the source-native route does

1. Check out original **PlayDeck** at exact commit `a7cf718421e767fd382a01894063c3eeba3d2930`, source-lock original Remotion `Root.tsx`, `PlaydeckComposition.tsx` and `package.json`; run original `npm run still:genesis` inside `packages/render-remotion`. It renders **frame 5256** of the original Genesis composition to a real PNG; retained file bytes are hashed. This is strictly a **checkpoint still**, not full-performance evidence and not a sealed PlayDeck `PerformanceReceipt`.
2. Check out original **Haunted Toaster** at exact commit `3652c2a96b6b287cda316d1c92daadf7c7417eaf` and check its original `render.cjs`, score generator and Dogram engine byte identity.
3. Create exactly 3 seconds of local synthetic WAV audio and analyze it through original Toaster `inspectAudio`. Derive an original Toaster `visualScore` and accepted `resolvedTimeline` from the observed duration, its original `wire-orchard.v3.json` constraints and `toaster-raster-4.json` renderer profile.
4. Invoke **original Toaster `renderVideo`**, with the **actual PlayDeck PNG as the `imagePath` input**. The original engine runs its real FFmpeg rendering, emits the native MP4 and its **own** full `full-measure.video-receipt.v1`, then original `writeReceipt` writes a `dogram.trace-source/v0` JSON sidecar.
5. Read and verify the original MP4 bytes, original audio bytes, original PlayDeck image bytes, native Toaster receipt, Dogram boundary/source identities, source Git commits and blob contents. A source image hash mismatch, fake receipt, revised original owner implementation or forged output causes a fail-closed verification error.
6. Retain all in a synthetic-only artifact bundle; no publication, owner rights grant, PlayDeck performance sealing, media licensing or model-generated code.

## Precisely what is now connected

**PlayDeck original Remotion checkpoint still → Toaster supported native image input → Toaster original scored video renderer → real Toaster MP4/video receipt/Dogram.**

This is a **genuine limited media handoff**, rather than the prior incorrect shortcut of telling Toaster that a PlayDeck performance receipt *is* a Toaster video receipt.

The same code deliberately refuses to mark that PlayDeck full performance is proved. The source audio is an explicitly synthetic three-second tone, not the original Genesis song. Full PlayDeck performance playback, renderer/audio synchronization across the two owners and licensed publication remain **unsolved**.

A successful original native rendering and Dogram trace would be valuable evidence for this *checkpoint-image handoff*, but would not prove general **PlayDeck video → Toaster video** migration or original PlayDeck full-performance receipt compatibility.

## Reproduction

```bash
node scripts/playdeck-toaster-native-checkpoint.mjs inspect

node scripts/playdeck-toaster-native-checkpoint.mjs build \
 --playdeck /path/to/pinned/playdeck \
 --toaster /path/to/pinned/the-haunted-toaster \
 --out /tmp/native-checkpoint \
 --authorize SYNTHETIC_TEST_ONLY

node scripts/playdeck-toaster-native-checkpoint.mjs verify \
 --playdeck /path/to/pinned/playdeck \
 --toaster /path/to/pinned/the-haunted-toaster \
 --out /tmp/native-checkpoint
```

Requires pinned original owner code, PlayDeck workspace dependencies, Remotion's Chromium runtime and original CDN media availability, FFmpeg, and original Toaster's native rendering dependencies. CI runs original owner tests, real rendering, receipt validation, forgery refusal and attaches binary media. Source asset CDN access and rights are external dependencies; a network or license failure does not count as successful native rendering.

The source is a **stacked draft**, not a deployment. The built proof must actually pass the hosted CI before status is changed from `NOT_YET_PROVEN` to `CHECKPOINT_HANDOFF_VERIFIED`.
