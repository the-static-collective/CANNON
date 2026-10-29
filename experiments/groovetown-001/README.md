# GROOVETOWN-001 — The Town That Plays Itself

**Experimental, fictional, local, independent. Not a real witnessing system.**

This proof composes five concepts into one runnable, zero-dependency Node kernel:

1. **Living Chord:** a simulated bread need produces a dissonant chord. An unconfirmed report changes nothing; a second *fictional* witness confirms it and a deterministic 2-second PCM WAV resolves.
2. **Dreaming Town:** the unmet need creates a *held* plan candidate (not executed), with source ledger hash.
3. **Haunted Post Office:** one Ed25519-signed test cartridge is offered to two towns; East admits and West refuses according to independently supplied local decisions. Tampered artifacts are refused.
4. **Reproductive Record:** a new town is seeded from the signed portable package, preserving origin digests but importing **zero** credit for local deeds.
5. **Wii Incident, display surface only:** a dependency-free standalone `index.html` supports a browser fallback when Web Audio is unavailable. **No Wii compatibility or hardware test has been performed.**

## Run

Requires Node 20+. No packages, network, secrets, account, or hardware.

```sh
node --test experiments/groovetown-001/groovetown.test.mjs
node experiments/groovetown-001/groovetown.mjs demo /tmp/groovetown-001
# Open /tmp/groovetown-001/index.html in a desktop or mobile browser.
# WAV files are playable in ordinary media players; JSON + receipt are inspectable.
```

Re-run to a fresh directory and verify that all emitted files match byte-for-byte. The receipt maps each emitted artifact to its SHA-256 digest. The Ed25519 test private key is **intentionally public inside the source**: it is a deterministic synthetic fixture, **not a valid owner/witness trust anchor**. Anyone can forge this demo issuer. No inference about actual human custody is permitted.

## Crossing and evidence boundaries

| Desired owner crossing | This experiment actually does | Next gate |
|---|---|---|
| Garden / Help Slip | Local fictional NEED → REPORT → separate CONFIRM fixture | Explicit owner schema, consent and verified physical source |
| reLATTE | Native Node Ed25519 demo signature + local HOLD / REFUSE / ADMIT interpreter | Source-owned reLATTE implementation and independent receiver keys |
| planZ | CANNON-owned, hash-linked `HELD_PLAN_CANDIDATE` | Call real planZ compiler at pinned source revision; no unattended execution |
| Haunted Toaster / Static Live | CANNON-owned generated WAV and static visual page | Native source-owned creative engines + permissions and assets |
| lemonPRESS / vinyl | Portable signed JSON seed and playable WAV | Physical record/needle media integrity + error correction; no manufacture |
| Wii / suitcase / GHoT | Static portable HTML fallback | Hardware verification, offline custody and runtime compatibility tests |

All sample agents and locations are explicitly fictional. Confirmation is a software rule, not evidence that bread was delivered. Signatures certify bytes under a key, not the truth of events. This branch changes no other source owner's code, no deployed service, and no permissions. A record-associated JSON seed is **not** a record groove data codec. No public release or real-world activation is authorized by this test.

Review-only draft, kept isolated from `main` and from other experimental branches. No auto-merge.