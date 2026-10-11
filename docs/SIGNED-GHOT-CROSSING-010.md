# CANNON 010 — Signed GHoT 030 receipt across reLATTE R14

This experimental branch is stacked on CANNON 009. GHoT 030 and reLATTE R14 remain separate histories; the bridge checks original source at exact pinned commits. It neither merges nor selects project canon.

## Actual sequence

1. Re-check original Git objects for the planZ capability and original source modules of GHoT 030 and reLATTE R14.
2. GHoT 030 produces one native BODY-signed activation ticket and BODY-signed execution receipt by its existing 027/028 owner-local preview, explicit ACT, atomic one-use claim and destination revalidation.
3. CANNON 010 **ingests** signed evidence; ingestion has no ACT function, no donor import, and no remote worker activation. An independent Node/WebCrypto checker reconstructs the GHoT identity domains, validates both P-256 signatures, matches the BODY signer, checks the one-operation limits, ticket-to-receipt binding, execution preflight proposal, signed job result address and original Git source digest.
4. The full signed GHoT ticket, signed execution receipt and source-hash result are embedded directly in a native reLATTE opaque-organ crossing extension, not merely referenced by an unavailable local-file pointer. The crossing also binds the JCS SHA-256 address of that evidence.
5. Native reLATTE R14 file transport delivers to a sovereign local receiver. The receiver signs RECEIVED and separately signs its own R3_HOLD.
6. A separate cold replay opens the original source Git objects, independently verifies both GHoT signatures and three reLATTE signatures, checks signed donor evidence inside the crossing, the file-bundle crossing ID, durable local receiver journal and final public witness.

## What this does not prove

The BODY P-256 public key shows possession of an **untrusted local signing key**, not independently trusted owner identity. A valid GHoT ticket cannot grant its rights to a new receiver or prove who typed ACT. The local source policy is reviewed by the operator on their own machine; CANNON does not manufacture that approval.

CI runs a synthetic ACT only inside an explicitly gated disposable GitHub Actions runner. This is a demonstration of the mechanism, not a grant on the user's machine or a remote executor.

The controlled GHoT operation is only hash-exact-source. It hashes locally held original Git file bytes and does not run donor branch code, execute a shell, access hardware or publish anything. The received evidence stays HOLD; no ADMIT is inferred.

The native signed crossing preserves GHoT's signed claims as opaque data without elevating them to new reLATTE authority. Different signers are allowed to have different trust roots; no federated owner trust is invented.

## Owner-local operation

GHoT 030 remains the operator entrypoint. It accepts an explicit, locally configured source allowlist and candidate, produces a read-only preview with exact proposal address and requires a human ACT before its one permitted read-only operation.

The resulting ticket, execution receipt, local job result and selected source context may be assembled into a JSON object with schema cannon.ghot-signed-source-evidence/v0. CANNON 010 ingests it separately:

    node scripts/branch-signed-crossing-010.mjs ingest examples/branch-loadout-008.plan.json roots.json signed-ghot-evidence.json fresh-dir
    node scripts/branch-signed-crossing-010.mjs verify examples/branch-loadout-008.plan.json roots.json fresh-dir

There is **no ACT argument** on either ingestion command.

## CI reproduction

The test-only tool scripts/branch-signed-lab-010.mjs requires both GITHUB_ACTIONS=true and CANNON_010_TEST_ACT=DISPOSABLE_CI_SANDBOX_ONLY. It sets up an isolated policy/preview, runs the actual GHoT signed activation with synthetic ACT, then feeds the signed object to the exact CANNON ingestion pathway.

After execution the CI artifact contains portable-signed-evidence.json (GHoT signed ticket, execution receipt, actual result, native reLATTE crossing and both signed receiver receipts) and public-inspection.json (a narrow readable projection). No private keys or private checkout paths are uploaded.

## Distinctions

BRANCH != BACKLOG
LOCAL POLICY != ACT
BODY SIGNATURE != TRUSTED HUMAN IDENTITY
SIGNED SUCCESS != ADMISSION
TRANSPORT != AUTHORITY
RECEIVE != HOLD != ADMIT
WORKER CAPABILITY != REMOTE EXECUTION PERMISSION
