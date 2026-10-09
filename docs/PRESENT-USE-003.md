# PRESENT USE 003 — If it exists, it is fair game for present consideration

**Status: candidate, staged on `experiment/present-use-003`; no source branch mutation or canon selection.**

## Rule

- `EXISTS != CANON` / `CANON != ONLY_USABLE_SOURCE`.
- `DISCOVERABLE != VERIFIED` / `VERIFIED != COMPATIBLE`.
- `COMPOSABLE != EXECUTABLE` / `EXECUTION != AUTHORIZED`.
- `WITHDRAWN_SELECTION != ERASED_HISTORY`.
- Owner policy, privacy, IP rights, dependency conditions and device safety remain their own gates. A tag is only an index hint.

## What is actually implemented

- `now` scores an explicitly declared plan's source tags and attempts **read-only** Git inspection. It reports HOLD for missing/unverifiable objects, not "not existing".
- `build` composes 2–8 exact Git blob bytes into one Markdown capsule, without any branch, merge, owner signature, or canon-state prerequisite. The caller must supply an explicit repo-to-local-checkout path map separately, not as evidence.
- For every input: check local checkout root, original SHA-1 Git commit object bytes and hash, tree, blob object bytes and hash, declared `origin` *configuration*, and exact path. Record SHA-256 commitments to original bytes. No network authority or owner identity is inferred from the `origin` setting.
- Emit `composition.md` plus content-addressed `receipt.json`. Neither donor code nor Markdown is run as instructions.
- `verify` in a fresh process re-reads *original immutable objects*, deterministically recomposes, byte-compares artifact and receipt, and refuses tampering.
- Refuse invalid source paths, incompatible declared media types, missing Git objects, forged origin claim, mutated source hashes, non-UTF-8 text, duplicate source IDs, unsafe overwrites.

## Authentic Git demonstration (CI, not synthetic mock)

The [two-source plan](../examples/real-two-repo.plan.json) pins **STATIC OS** `7bc551610421bd60a8dbf624d93d7a6682ce3987` and **reLATTE** `dcc8cdca84c440aa4294134f020fb7095bf87f24`, selecting `README.md` from each. GitHub Actions checks out exactly these two real commits and cold verifies the combined dossier. No merge is performed and no claim of usable operating system or executable interoperability is made. Source copyrights and source license conditions are not changed by this demonstration.

Local usage: Node 24 + git, with full Git checkouts containing those commits:

```sh
cat > work/roots-003.json <<'JSON'
{
  "the-static-collective/static-os":"/absolute/path/to/static-os",
  "the-static-collective/reLATTE":"/absolute/path/to/reLATTE"
}
JSON
node scripts/cannon-now.mjs now --plan examples/real-two-repo.plan.json --roots work/roots-003.json --goal "design documentation"
node scripts/cannon-now.mjs build --plan examples/real-two-repo.plan.json --roots work/roots-003.json --out work/cannon-003
node scripts/cannon-now.mjs verify --plan examples/real-two-repo.plan.json --roots work/roots-003.json --out work/cannon-003
```

This v0 is a **real source-to-document composition primitive**, not a universal code composer or automatic running-world constructor. Future adapters may add JSON/schema/component compatibility, sandboxed execution, and reLATTE consequence crossings without promoting source selection into execution authority. To enter a separate owner-controlled runtime or external effect, use the applicable owner admission/permission gate.

## Adversarial expectations

An old branch/ref can move after the selected commit is recorded: the exact commit remains the input. A canon owner can select or withdraw another version: that is not an input to this source operation. A file changes only by pointing to a different Git commit; arbitrary replacement, SHA spoofing, invalid blob/type, source truncation, corrupted receipt, and output overwrite must fail. Local `.git/config` origin is only an asserted identifier, not cryptographic remote authentication.

## Next layer

001: independent canonical owner selection. 002: reLATTE authenticated crossing to receiver-owned HOLD. 003: **source visibility and bounded document composition independent of both selections**. Extending to operational execution requires independently established identity, rights, trustworthy build pipeline, compatibility proofs, and local authorization.
