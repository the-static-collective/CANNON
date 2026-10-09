# CANNON 005 — THE ADAPTER FORGE

**Candidate branch:** `experiment/adapter-forge-005`, stacked on `experiment/typed-compatibility-004`. Source repositories are never edited.

## Why the signature boundary matters

CANNON 004 found an actual source mismatch: the original STATIC OS fixture at
`7bc551610421bd60a8dbf624d93d7a6682ce3987` declares a `payload_refs[0].byte_length`;
reLATTE's `schemas/crossing-envelope-v0.schema.json` at
`dcc8cdca84c440aa4294134f020fb7095bf87f24` does not permit that extra nested property.

Merely deleting `byte_length` from the crossing and retaining the original `crossing_id` and `signing` values would be a false-authentication hazard. **The old signature no longer speaks for the edited bytes.** Nor may a source-only signature or a Git commit grant receiver authority.

## What 005 actually makes

- `cannon-adapt inspect` inspects two independently pinned Git JSON objects, checks the real incompatibility against CANNON 004, and returns a deterministic **non-authoritative adapter proposal**.
- The only permitted v0 transform is `EXTERNALIZE_FIELD` for an *undeclared* field within each `payload_refs[]` object, when the contract forbids additional properties. Rules are explicit, versioned, bounded and type-constrained.
- `cannon-adapt build` emits three independent items: `proposal.json` (unsigned incomplete envelope preview and full source/provenance/boundary information), `sidecar.json` (precise path, value, value digest and preservation reason for each externalized field), and `receipt.json` (content-addressed bindings).
- The candidate **removes inherited `crossing_id` and `signing` from the preview**. It becomes structurally incomplete at exactly those required fields; `HOLD_REISSUE_REQUIRED` is the expected result, not success/ADMIT.
- `cannon-adapt verify` cold-verifies by independently opening the exact original Git objects and byte-comparing all three output artifacts in another process. No original commits are altered and neither crossing identity nor a new signature is fabricated.

The `sidecar.json` preserves the original value and path. This avoids silent data loss in the *adapter record*, but the unsigned projection itself is intentionally missing both the externalized field and signed identity. **Preservation in the sidecar is not evidence that a receiver has accepted its semantics.**

## Real pinned demo

`examples/real-crossrepo-adapter.plan.json` declares the actual STATIC OS crossing fixture and reLATTE structural schema, with one explicit operation:

`/payload_refs/*/byte_length` → `PRESERVE_IN_SIDECAR`, only nonnegative safe integer, no authority.

A valid run must report:

- Before: `INCOMPATIBLE` because `/payload_refs/0/byte_length` is undeclared.
- After the projection: **still `INCOMPATIBLE`**, now **only** `/crossing_id` and `/signing` missing.
- Exactly one value externalized; source original byte hash and Git identity retained.
- Final disposition: `HOLD_REISSUE_REQUIRED`, `signature_inherited:false`, `reLATTE_crossing_created:false`, `permission_granted:false`, `executions:0`.

### Local invocation

Requires Node 24 and Git checkout roots containing those exact commits. Supply real absolute paths in `work/roots-005.json`:

`{"the-static-collective/static-os":"/absolute/path/to/static-os","the-static-collective/reLATTE":"/absolute/path/to/reLATTE"}`

```sh
node scripts/cannon-adapt.mjs inspect --plan examples/real-crossrepo-adapter.plan.json --roots work/roots-005.json
node scripts/cannon-adapt.mjs build --plan examples/real-crossrepo-adapter.plan.json --roots work/roots-005.json --out work/cannon-005
node scripts/cannon-adapt.mjs verify --plan examples/real-crossrepo-adapter.plan.json --roots work/roots-005.json --out work/cannon-005
node --test test/adapter-forge.test.mjs
```

The workflow fetches those two immutable source checkouts and checks the expected contrast, the signature boundary, and the cold replay. It uploads only nonsecret records.

## Nonclaims and hard gates

No universal schema coverage; CANNON 004 evaluates a conservative JSON Schema keyword subset and HOLDs unsupported features. No automatic adapter synthesis or executable bridge to arbitrary protocols. No proof of actual original ECDSA validity (the source's signature is not authenticated here), GitHub remote identity, legal rights, safe deployment, reLATTE crossing issuance or sovereign receiver ADMIT.

The next independently governed stage can use the proposal as **input to a new native reLATTE crossing issuance**, explicitly chosen and signed by an authorized actor. It must not reuse the old signature, the old crossing ID, or treat `HOLD` as approval.

**Laws:** `EXISTS != FITS`; `COMPATIBILITY PROJECTION != AUTHENTICATED CROSSING`; `EXTERNALIZED != DELETED FROM SOURCE`; `SIDECAR != RECEIVER ACCEPTANCE`; `REISSUE REQUIRED != AUTHORIZED REISSUE`; `HOLD != REJECTION`.
