# TYPED COMPATIBILITY 004 — discovery is not interoperability

**Candidate branch:** `experiment/typed-compatibility-004`, stacked on PRESENT USE 003. The source repositories remain untouched.

## Real pinned Git experiment

1. STATIC OS commit `7bc551610421bd60a8dbf624d93d7a6682ce3987`: `fixtures/bardo-boot-witness-001/crossing.json`
2. reLATTE commit `dcc8cdca84c440aa4294134f020fb7095bf87f24`: `schemas/crossing-envelope-v0.schema.json`
3. The same reLATTE commit: `fixtures/genesis-signed-crossing.json`

A read-only structural check compares the immutable STATIC OS crossing fixture against the actual reLATTE envelope schema. **Expected result: INCOMPATIBLE**, at `/payload_refs/0/byte_length`. This field survives in the STATIC OS fixture but the reLATTE contract's nested `additionalProperties:false` forbids it. No implicit dropping of evidence or mutation of a signed crossing.

The independent original reLATTE reference crossing satisfies its own pinned schema's supported validation keywords: **STRUCTURALLY_COMPATIBLE**. This is a baseline, not a native receiver ADMIT, valid ECDSA signature verification, or proof of semantic equivalence.

## How to run

Requires Node 24 and Git checkouts containing the exact commits. Write a local `work/roots-004.json` using absolute checkout paths:

```json
{
  "the-static-collective/static-os": "/absolute/path/to/static-os",
  "the-static-collective/reLATTE": "/absolute/path/to/reLATTE"
}
```

```sh
node scripts/cannon-fit.mjs check --plan examples/real-crossrepo-fit.plan.json --roots work/roots-004.json
node scripts/cannon-fit.mjs build --plan examples/real-crossrepo-fit.plan.json --roots work/roots-004.json --out work/cannon-004
node scripts/cannon-fit.mjs verify --plan examples/real-crossrepo-fit.plan.json --roots work/roots-004.json --out work/cannon-004
node --test test/typed-compatibility.test.mjs
```

`check` observes only. `build` creates a standalone JSON compatibility receipt; `verify` cold-reopens all original Git sources in a separate process and compares the exact report bytes and IDs. The report distinguishes `STRUCTURALLY_COMPATIBLE`, `INCOMPATIBLE` (with precise JSON Pointer failures), and `HOLD` (missing/unverified data or unsupported schema features).

## Supported schema vocabulary and limits

This is a conservative, dependency-free **subset** of JSON Schema validation, not a full Draft 2020-12 engine. Supported validation keywords: `type` including union, `const`, `enum`, `required`, `properties`, boolean `additionalProperties`, `items` as one schema, `minItems`, `maxItems`, `uniqueItems`, `minLength`, `maxLength`, `minimum`, `maximum`, and restricted `format:date-time`. `$schema`, `$id`, `title`, `description`, and `default` are annotations. Unsupported keywords (e.g. `$ref`, `allOf`, `pattern`) trigger HOLD. Calendar/format checking is bounded and should not be mistaken for full RFC 3339 conformance.

The existing CANNON 003 source reader verifies locally observed original Git commit/blob bytes, exact commit SHA, tree and SHA-256 commitments. Its remote `origin` check is **local Git config only**; this experiment does not attest GitHub ownership, trusted keys or CI signing. JSON payloads are never executed.

**Hard boundaries:** no donor edits, no branch merges, no source authority claims, no independent cryptographic signature validation, no receiver-local admission, no device/software deployment permission. A structural match **does not prove** semantic correctness, safe runtime behavior or legal reuse.

## Laws

- EXISTS != FITS
- STRUCTURAL FIT != SEMANTIC FIT
- VERIFIED GIT OBJECT != VERIFIED SIGNATURE
- SOURCE RELATION != AUTOMATIC ADMISSION
- UNRECOGNIZED FIELD != DISCARDABLE FIELD
- HOLD != NONEXISTENCE

## Next experiment

Declare explicit, versioned, loss-accounting projections that can translate an observed incompatible source to a fresh candidate **without** pretending that original signatures or authority transfer. Enter reLATTE only through a separately authenticated crossing and receiver-owned policy.
