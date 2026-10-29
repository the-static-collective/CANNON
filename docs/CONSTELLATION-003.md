# CONSTELLATION-003: the verified machine makes creative offers

Stacks directly on CANNON #49 at `f99d4b0f74b117e0af034137d550e88aa3d01f26`. No ancestor or independent owner PR is merged. Reuses the actual original JAR;VIS and Static Live engines pinned by the subsequent [seven-engine research crossing #59](https://github.com/the-static-collective/CANNON/pull/59), observed at `ca00526787edecdcaaaa05647ae3f2dedcf0cce8`. It adds a new **executable data edge from the 22-owner stranger machine** to those creative engines, rather than duplicating the separate film/book pipelines.

## What runs

1. Snapshot the complete parent packet and independently re-execute its original native code through `arcade-machine.mjs verify`. Altered parent files refuse; the snapshot prevents changing inputs between verification and consumption.
2. Admit exact original JAR;VIS `1660e98a3e456e2a1fdfe098d1b3cd0277e5db32` and Static Live `38e67b2930cea09c3e01a05447a6e92a67c2468f` commit/tree/blob/working bytes, before importing their modules.
3. Map each verified scene's hash, selected public source owners, original graph reference and original effect refusals to a bounded question and answer. **This is a CANNON-authored adapter, not JAR factual reasoning about institutions.**
4. Execute original JAR `replaySlots` and `inspectSlots`: BIRTH, CONVERGE, STOMP, FRESH_BIRTH. Five baseline routes yield 20 actual native six-up families / 120 offers. All SCRAPEs are scripted samples, all KEEP counts zero.
5. Feed each family's exact digest and first creature title into original Static Live `compileStageProjection`, `renderSetlist`, `renderRouting`. Missing audio files remain absent. Original native missing-fallback refusal and forged JAR KEEP refusal run for every state.
6. Save native JSON, source-owned Markdown stage aids, map, human gates, complete retained parent machine, offline interactive inspection page and SHA-256 receipt. Another process reruns both parent and bridge and compares every output byte.

An original `arcade.challenge-receipt/v1` packet also works: actual recombination creates a different creative family from baseline. Receiver refusal, tamper refusal and unresolved branch selection stop the crossing. This does not let a creative transformation clear a prior HOLD.

**Counts:** inherited 22 distinct native donor repositories, 64 documentary owners / 69 participating public repositories remain unchanged. Both creative owners already belong to that union. A newer JAR source version is not an additional repository. This bridge does not claim to have executed all of #59, or the guest concourse.

## Run and independently replay

Requires the inherited Linux-x64 Node 24+ / Python runtime and pinned packages described in [CONSTELLATION-002.md](CONSTELLATION-002.md). All config paths must be absolute. No paid API or external dispatch.

```sh
node scripts/arcade-machine.mjs acquire --into /absolute/new-inputs
node scripts/arcade-machine.mjs build --config /absolute/new-inputs/config.json --out /absolute/machine --authorize LOCAL_FICTIONAL_ONLY

git clone --no-checkout https://github.com/the-static-collective/JAR-VIS.git /absolute/creative-jarvis
git -C /absolute/creative-jarvis checkout --detach 1660e98a3e456e2a1fdfe098d1b3cd0277e5db32
```

Create `/absolute/bridge-config.json` (Static Live is already acquired by the parent machine):

```json
{
  "schema": "cannon.creative-bridge-config/v1",
  "arcadeConfig": "/absolute/new-inputs/config.json",
  "parentPacket": "/absolute/machine",
  "jarvisRoot": "/absolute/creative-jarvis",
  "staticLiveRoot": "/absolute/new-inputs/native/staticlive"
}
```

Use the actual `nativeRoots.staticlive` path from the acquired config if it differs from this example.

```sh
node scripts/creative-bridge.mjs build --config /absolute/bridge-config.json --out /absolute/creative-machine --authorize LOCAL_FICTIONAL_ONLY
node scripts/creative-bridge.mjs verify --config /absolute/bridge-config.json --out /absolute/creative-machine
```

Open `creative-machine/first-boot.html`. Choose a route, inspect SCRAPE samples, focus each offer, download its exact native deck, inspect ancestry and missing-fallback refusal. The page inspects retained native output; it does not run Node inside the browser. Run a new real native challenge through the inherited loopback server or CLI, set `parentPacket` to that challenge packet, and build a fresh bridge output. The copied parent page remains a retained inspector; start its documented loopback server for fresh native actions.

## Checks and boundaries

`CREATIVE_BRIDGE_CONFIG=/absolute/bridge-config.json npm test` runs new original-source integration tests alongside the inherited suite. Set the inherited environment variables from `.github/workflows/creative-bridge-003.yml` to execute every integration gate without skips. Dedicated workflow acquires all sources, builds, runs complete tests, cold replays, and uploads the portable result.

The page is an inspector of source-owned payloads, not a copy of JAR's fifteen media renderers. No song, film, physical show, human KEEP, publisher approval, participant, institutional submission, rights transfer, contact or field outcome is claimed. Source verification demonstrates source bytes and software behavior, not owner identity or semantic truth. Native `playable` means declared capability coverage; there is no real performer or fallback audio here.
