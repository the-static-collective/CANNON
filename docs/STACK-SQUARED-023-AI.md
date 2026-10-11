# STACK² 023 — The Processing Parcel Reaches a Sovereign HOLD

**Status: experimental, branch-stacked, review-only.** This runs the ORIGINAL exact-pinned GHoT and reLATTE programs without merging donor branches, launching an LLM in CI, granting human owner authority, or deploying any worker.

## Executable route

1. Original GHoT AI RECOMPOSITION 001 deterministic processor executes through its existing native Instrument Rack, with signed execution receipt and portable evidence packet.
2. Original CANNON STACK² 022 independently verifies actual source files and invokes the original GHoT cryptographic verifier. Its output is an *unsigned* read-only witness.
3. STACK² 023 verifies the original reLATTE R14 commit and eight native source files at commit dcc8cdca84c440aa4294134f020fb7095bf87f24.
4. CANNON constructs a fixed receiver-local, HOLD-only request, embedding the full GHoT signed report and CANNON 022 witness as donor claims, binding their original bytes by SHA-256.
5. The original reLATTE R14 opaque-roundtrip CLI *actually signs* the crossing, makes a filesystem transport frame, and delivers to a separate receiver with local key and journal.
6. Receiver separately signs RECEIVED and R3_HOLD, with no ADMIT. An independent cold verifier checks the original input, signatures, signed claims, frame, journal, receiver restart state and redacted receipt summary.
7. Reverification does not invoke any GHoT processing or reLATTE new signing; it only inspects the existing objects.

This is a genuine native three-repository executed integration, **not** a claim of universal stacks or hardware inference. The GHoT local execution receipt is not the receiver's separately signed R3_HOLD.

## How to run

Requires Node 24, Python 3, Git, and local checked-out originals at exact commit pins. Install the original reLATTE Node dependencies without install scripts before invocation.

```sh
node --experimental-strip-types scripts/stack-squared-023-ai.mjs run \
  examples/stack-squared-023-ai.plan.json \
  /absolute/path/to/ghot-at-pinned-commit \
  /absolute/path/to/relatte-at-pinned-commit \
  /private/path/to/ghot-report.json \
  /private/new-output-directory \
  --approve-local-hold

node --experimental-strip-types scripts/stack-squared-023-ai.mjs verify \
  examples/stack-squared-023-ai.plan.json \
  /absolute/path/to/ghot-at-pinned-commit \
  /absolute/path/to/relatte-at-pinned-commit \
  /private/path/to/ghot-report.json \
  /private/new-output-directory
```

The first invocation requires affirmative approval and refuses an existing output directory. The output contains original GHoT report payloads, source evidence, crossing data, bundle, receiver journal and private keys. **Do not commit or share the private output directory or the original report.**

Only public-inspection.json is uploaded by the CI, containing digests and receipt identities but not prompt contents. Those identifiers still reveal relationships; redaction does not promise anonymity.

## Verification

Dedicated GitHub Actions runs the original GHoT deterministic organ (not live neural inference), original CANNON 022 independent source and signed packet inspection, and original reLATTE R14 signing and journal. It then reruns cold verification and rejects altered GHoT source bytes, report, receiver admission claims, request, signed crossing, signed RECEIVE and R3_HOLD, transport and journal.

The fixture receiver has a locally generated signing identity. A P-256 signature establishes cryptographic integrity relative to this key; it does not establish identity, human permission, archival truth, or institutional authority. The local store is not protected against deletion or rollback by its disk owner.

## Founding boundaries

- Execution is not a receipt.
- A signed GHoT receipt is not a receiver R3_HOLD.
- CANNON's witness is not a reLATTE signature.
- Received is not admitted.
- Hold is not owner ACT.
- Source Git SHA does not authenticate a human repository owner.
- A model's proposed interpretation is not verified fact.
- A signed crossing is not permission to publish a private prompt.
- Branch composition is not branch merging.

**Next seam:** Static Workbench presents the exact 023 receipt identities as typed cards with private source held on the owner machine. A browser may inspect; it may not silently dispatch a processing organ.
