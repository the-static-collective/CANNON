# CANON CROSSING 002 — Canon selected here, carried by reLATTE, admitted only there

**Experiment branch:** `experiment/canon-crossing-002` on CANNON. Stacked on CANON FIELD 001, not merged to `main`.

The 001 owner-selected canon signing system and the existing independently implemented **native reLATTE R14** `runOpaqueOrganRoundTrip` now communicate through a locally verified immutable Git object witness. The actual source and receiver do not need a Git merge.

## Proven flow

```text
Independent CANNON owner keys -> selected signed owner history
    -> exact owner+scope+track and active selected event
    -> local pinned Git SHA 40 / commit bytes / tree hash / declared remote
    -> native reLATTE OpaqueOrganSpec v0 (source identity in signed donor_claims)
    -> native ECDSA P-256 signed CrossingEnvelopeV0
    -> real native file bundle / re-read / sovereign LocalReceiver RECEIVED
    -> separately signed receiver-local R3_HOLD
    -> fresh process verifies original Git object, CANNON signatures,
       reLATTE crossing+receipts, original source binding, and receiver
       local journal, without executing native effects
```

No CANNON event can create a Git object or modify a branch. `main` remains a bootstrap address; all 001 historical, experimental and operational tracks remain **`CANON_SELECTION_ONLY`**.

### Native source witness

The proof requires the **actual Git object** corresponding to the CANNON selected exact SHA, not only an issue, diff, PR description, GitHub search hit or mock data. It executes read-only local `git` commands, without shell strings:

- Check remote `origin` is syntactically exactly the selected `owner/repo` GitHub address (a local config check, **not remote cryptographic authentication**);
- Confirm `SHA^{commit}` resolves to exactly the supplied full SHA, and local object format is SHA-1;
- Read the original commit object with `git cat-file commit SHA`, bound size, independently SHA-256 hash its bytes, and obtain the exact Git tree SHA;
- Bind that witness, the selected `owner/scope/track`, selection event hash, owner frontier, and hashes of the supplied owner history and trust-pin configuration into the native reLATTE organ `donor_claims` and `payload_refs`.

The original Git commit may be present on an inaccessible branch; this does not assert `main` reachability or global latest. Local Git commit integrity and declared source origin do not prove the repository owner's real-world identity, authenticated remote GitHub transport, an approved release, or a trustworthy execution environment.

### Native reLATTE bridge

This uses unchanged pinned reLATTE **main** SHA `dcc8cdca84c440aa4294134f020fb7095bf87f24`, calling its actual `runOpaqueOrganRoundTrip`. It generates the source crossing signature (ECDSA P-256), transports an envelope through real file-bundle serialization, and creates a **different** receiver-owned signed `RECEIVED` and `R3_HOLD` receipt. `LocalReceiver.open` cold-replays its durable journal. Only a reference to the CANNON payload travels in the crossing: the whole history is supplied separately for cold verification; **no opaque bytes are falsely claimed to be physically sent**.

The receiver's local HOLD disposition is explicitly selected by the invoking operator in the lab. It does **not** constitute autonomous approval from a remote entity. `ADMIT` is deliberately disabled for this version; an explicit independent receiver policy and reviewer signoff would be required to interpret it as approval.

The independently supplied CANNON owner public-key pins must be established outside the bundle. In the executable lab, the ephemeral keys and P-256 crossing/receiver keys are emitted as **clearly labeled self-described laboratory pins** for verifiable cryptographic consistency, not proof of real Static Collective owner authorization or independent machine-identity trust.

### Run in a pinned workspace

Requires Node 24, `git`, a preexisting full Git checkout of `the-static-collective/static-os` at or containing `7bc551610421bd60a8dbf624d93d7a6682ce3987` and the independently pinned reLATTE donor checkout with its dependencies installed via `npm install --ignore-scripts` (that donor snapshot has no lockfile).

```sh
CANNON002_SOURCE_ROOT="$PWD/external/static-os" \
CANNON002_RELATTE_ROOT="$PWD/external/reLATTE" \
  node --experimental-strip-types --test test/canon-field.test.mjs test/canon-crossing.test.mjs

node --experimental-strip-types scripts/canon-crossing.mjs run \
  --source "$PWD/external/static-os" \
  --relatte "$PWD/external/reLATTE" \
  --out "$PWD/work/native-canon-002" \
  --at 2026-10-08T22:14:00.000Z

node --experimental-strip-types scripts/canon-crossing.mjs verify \
  --source "$PWD/external/static-os" \
  --relatte "$PWD/external/reLATTE" \
  --out "$PWD/work/native-canon-002" \
  --at 2026-10-08T22:14:00.000Z \
  --bundle "$PWD/work/native-canon-002/lab-owner-bundle.json" \
  --pins "$PWD/work/native-canon-002/lab-owner-pins.json" \
  --native-pins "$PWD/work/native-canon-002/lab-native-signer-pins.json"
```

Both commands default to a synthetic `static-os-owner` experimental selection if no owner bundle/pins are explicitly supplied. To use non-lab owner material, pass separately authenticated `--bundle /path/bundle.json --pins /path/externally-trusted-pins.json`, plus `--owner`, `--scope` and `--track` as needed. Never treat a lab-generated signing identity as an actual owner's approval.

`run` refuses an existing output root. Cold `verify` recomputes owner signature validity, selected identity, original Git object, signed native CrossingEnvelopeV0, both actual receipt signatures and binding to the selected source; it reopens the receiver journal and compares its independently replayed state. It rejects altered source selection, external key substitution, incorrect P-256 signer pin, changed Git target and tampered receiver disposition.

**No Git merge, checkout mutation, push, hardware start, deployment, treasury money, physical custody or CANNON canonical authority transfer takes place.** No source branch is deleted or altered.

### Remaining hard gates

This is a real native local crossing and source Git verification, **not a live hosted reLATTE transport, nor a production trust system**. The next layer should provide external repository owner identity binding, trusted CI attestation to `repo+SHA`, independently pinned receiver policy/trust, durable external checkpoints and source-history transfer, publisher key rotation/revocation, and an explicit dependency-compatible multi-repository atlas.

**Laws:** `MAIN != CANON`, `OWNER CLAIM != VERIFIED GIT OBJECT`, `COMMIT PRESENT != GLOBAL RELEASE`, `NATIVE CROSSING != CANON ADMISSION`, `RECEIVED != ADMITTED`, `HOLD != REJECTION`, `SIGNED != REAL-WORLD OWNER IDENTITY`, `SELECTION != EXECUTION`.
