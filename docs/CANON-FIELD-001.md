# CANON FIELD 001 — Main Is Not Canon

## Proposition

A branch is an addressable line of Git history. **Canon is an independently owned selection of an exact commit for a named scope and track.** `main`, merge status, PR review, passing CI, and a recognizable branch name do not themselves confer canon. Original Git objects, branch names and other people's permissions stay untouched by this repository.

This is the first experimental, **dependency-free runnable specification** of that distinction. Its cryptography is real Node Ed25519 signing; the demo signer identities are ephemeral laboratory identities, **not signatures from actual Static Collective repository owners**.

| Track | Claims | Does not imply |
| --- | --- | --- |
| `historical` | This owner selected this exact snapshot for historical reference | Deployment or approved change |
| `experimental` | This owner selected this exact snapshot as an experimental reference | Merging to `main`, verified CI, runnable equipment |
| `operational` | This owner selected this exact snapshot for an operational canon view | Execution, environment grants, deploy approval, legal rights |

A selection record has `authority: "CANON_SELECTION_ONLY"` regardless of track. Physical and deployment permissions remain zero. **No branch, commit or PR is altered by signing or verifying a selection.**

## Admitted evidence and verifiable bounds

An owner signs a strict `cannon.canon-event/v1` envelope with:

- An externally trusted `owner_id` and Ed25519 public key.
- One owner-local `seq`, the exact hash of its preceding signed event, and an owner-declared timestamp.
- The explicit `scope` (example: `fabrication:design`) and track.
- An `ADMIT` or `WITHDRAW` operation, an exact 40-character Git commit SHA for `ADMIT`, a descriptive repository and a *non-authoritative* branch name hint.
- A `replaces` reference to the **currently active signed event** for that exact owner+scope+track, if any. No silent replacement; withdrawal must reference the active selection.
- An evidence-*claims* list, deliberately not called verified CI evidence. This can later be linked to external CI receipts and reLATTE custody proofs, but such proofs are **not implemented here**.
- An Ed25519 signature over canonical JSON fields (not Git commit signing and not native reLATTE R14 crossing signing).

The verifier never consults `main`, checks out branches, runs arbitrary code, makes network calls, or writes to another repo. It reconstructs the selected view from **only the histories and independently provided signer pins**. Every accepted event remains in the historical output after supersession/withdrawal. The active view contains independent selections and *surfaces conflicts* when two owners select the same scope/track; it doesn't silently elect a global ruler.

Git commit presence, repository ownership, remote permissions, CI pass claims, semantic compatibility, source custody and "latest branch tip" are **not** verified by 001. The source SHA is a required reference, not a claim that we downloaded and checked the Git object. Treat the canonical projection as verifiable *claims made by trusted signers*, not a source-code supply-chain certificate.

## Run the demonstration

From the `experiment/canon-field-001` checkout, with Node 24+:

```sh
npm test
node scripts/cannon.mjs demo work/canon-001
node scripts/cannon.mjs verify \
  work/canon-001/bundle.json \
  work/canon-001/lab-generated-pins.json
node scripts/cannon.mjs checkpoint \
  work/canon-001/bundle.json \
  work/canon-001/lab-generated-pins.json \
  work/observer-checkpoint.json
node scripts/cannon.mjs verify \
  work/canon-001/bundle.json \
  work/canon-001/lab-generated-pins.json \
  work/observer-checkpoint.json
```

The script requires a **new output directory** on each `demo` invocation, refuses automatic replacement and never retries into an existing occurrence. `verify` is entirely read-only. The demo signs three independent owner streams with ephemeral keys; it retains seven distinct signed events and projects four active canon selections with zero merges or effect grants:

1. Static OS owner admits an older design SHA, explicitly supersedes it with a newer exact SHA, and separately admits the earlier SHA as *historical* canon.
2. GHoT owner admits a witness SHA, explicitly withdraws it, and signs a fresh reference to it. Withdrawal never destroys the earlier record.
3. reLATTE owner independently selects a specific interface SHA. Neither previous repository owner can override it through CANNON.

The lab writes `lab-generated-pins.json` **alongside** the event bundle for demonstration only. In production those pins **must be obtained independently from the relevant owner**. Copying a bundle's self-declared pins back into the verifier cannot prove real-world signer identity.

### Signing one's own record

```sh
node scripts/cannon.mjs keygen /private/owner-keypair
# Construct an unsigned JSON event matching src/canon-field.mjs;
# insert the public-key.pem text in the public_key property.
node scripts/cannon.mjs sign \
  /private/unsigned-canon-event.json \
  /private/owner-keypair/private-key.pem \
  /private/signed-canon-event.json
```

Signing one envelope alone doesn't admit it into an externally trusted history. The event needs to be appended to that owner's hash-linked stream, distributed as a bundle, and verified against **independently selected public-key pins** and any previously accepted checkpoint. Protect the private key; never upload it to GitHub, CI artifacts or a public canon manifest.

## Rollback, forks and qualified trust

A verifier supplied with an externally retained `cannon.observer-checkpoint/v1` checks that each latest supplied owner history preserves the exact previously selected event prefix. It refuses:

- Truncated/replaced known history, equivocation or omission of a checkpointed owner;
- Broken sequence, broken previous hash, untrusted key, malformed signature, extra fields, clock regression;
- Quiet replacement of an active canon or withdrawal of a non-active referent;
- A changed target SHA, misleading branch hint or fabricated new authority attribute.

A signed latest history could still be selectively withheld if no independently pinned checkpoint says otherwise. There is no global "now," remote owner discovery, equivocation gossip, revocation of a compromised signer key, authoritative organization key ceremony, universal repository graph or remote trust bootstrap. **History truth is local to selected signed inputs and trusted checkpoints.**

## reLATTE connection (next seam, not faked in 001)

1. Each repo owner exports `ADMIT` / `WITHDRAW` envelopes as *proposals*, with exact source Git SHA and separately verifiable CI and lineage references.
2. Native reLATTE crossing syntax carries selected signed source evidence and an **independently admitted** receiving-node receipt. Owner authority stays with its signer, not with the transport or atlas.
3. A CANNON projection requests explicit source/receiver verification; a local owner either accepts a candidate into a scope or holds it.
4. Withdrawal, signer rotation, fork coexistence and cross-repo dependencies are observed and cold-replayed. A branch may survive unchanged while its active canon selection changes.
5. Operational effects (hardware, payments, deployment) **still need independent domain-local grants**.

**Scope law:** `MAIN != CANON`; `MERGED != ADMITTED`; `TESTED != SELECTED`; `SELECTION != EXECUTION`; `REVOKED_SELECTION != ERASED_HISTORY`; `SIGNED != SOURCE_VERIFIED`; `ONE_REPOSITORY != ONE_CANON`; `FORK != ERROR`.

## Next hardening gates

- Verify original Git object existence, immutable blobs and parent DAG under pinned source identity; distinguish reachable from merely present.
- Bind CI attestation to exact `repo/sha` and a trusted workflow/runner, rather than treating a URL as evidence.
- Sign an explicit owner policy and support audited key rotation/revocation.
- Durable, signed observer checkpoints and equivocation proofs across independent observers.
- Native reLATTE attachment and receiver-owned admission receipts.
- Cross-repository DAG of concurrently selected versions; flag missing or contradictory constraints while preserving independent histories.
