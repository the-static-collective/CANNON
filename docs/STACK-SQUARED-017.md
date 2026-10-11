# STACK² 017 — When the Lego floor comes alive

**Status:** experimental CANNON branch, no merge, canon selection or deployment. This is a narrow executable stack-composition *laboratory*, not a working generic donor-runtime composer.

## The first genuine crossing

Two existing independently pinned CANNON 008 source entries are retained **without merging their branches**:

1. `the-static-collective/planZ@e8111fdb64c5587b33aece0fed639ed3d03375ac` — `002/bin/sense-global.mjs`.
2. `the-static-collective/CANNON@aabd276e4edb2ae4229ccf94eed8a7f561b17a0a` — `scripts/conversation-collider-work.mjs`.

The original `branch-loadout-008.plan.json` supplies their branch hints, previous CI references, review gates, paths, and exact Git commits. The existing CANNON 008 `inspect()` **actually re-verifies** commit/tree/blob Git objects and SHA-256 from independent local checkouts. A checked local origin URL is not an authenticated GitHub signer or proof of permissions.

We then create *two CANNON-owned fixture Stack Cards*:

| Source card | Local-only fixture operation | Consumes | Produces |
| --- | --- | --- | --- |
| planZ source witness | `WRAP_SYNTHETIC` | `cannon.stack2.synthetic/v0` | `cannon.stack2.wrapped/v0` |
| CANNON source witness | `ADDRESS_WRAPPED` | `cannon.stack2.wrapped/v0` | `cannon.stack2.addressed/v0` |

**These operators are implemented in `src/stack-squared-017.mjs`, not in the original donor modules.** The trace demonstrates validated *fixture* ports, source-witness binding, exact intermediate SHA-256, deterministic result addressing, and cold replay. It does **not** prove planZ can actually communicate with the collider, and neither donor program runs.

## Reproduce — Node 24, Git

Provide independent, locally available repositories with the exact source commits (CI checks these out explicitly), and a trusted local JSON map of repository names to root paths:

```json
{
  "the-static-collective/planZ": "/absolute/path/to/planz",
  "the-static-collective/CANNON": "/absolute/path/to/cannon"
}
```

```sh
node --test test/stack-squared-017.test.mjs
node scripts/stack-squared-017.mjs run examples/stack-squared-017.plan.json examples/branch-loadout-008.plan.json /tmp/stack2-roots.json /tmp/stack2-017
node scripts/stack-squared-017.mjs verify examples/stack-squared-017.plan.json examples/branch-loadout-008.plan.json /tmp/stack2-roots.json /tmp/stack2-017
```

The destination must not already exist. Output is a single create-only `stack-squared-receipt.json`, including source witnesses, exact link, both stage digests, output address, receipt ID and explicit nonclaims. A cold verification independently re-reads pinned Git objects and recomputes the complete expected receipt. Any mutation or missing source refuses.

## Crucible: replace a piece without erasing its ancestry

The hostile tests replace one verified Git *source path* with a separate immutable original-source blob, recompute the fixture composition, and require a different receipt ID while retaining the same output port type. Other tests reject incompatible links, an unknown card, execution/authority fields, altered source pins, corrupted stored receipts, output overwrite and missing originals.

This is **fixture-level replaceability**, not proven runtime interchangeability. Replacing an actual program requires a separate donor-native integration test with actual source APIs and permission gates.

## STACK² promotion gates

- **STACK CARD ≠ RUNTIME CONTRACT.** A descriptor does not establish executable donor behavior.
- **SOURCE VERIFIED ≠ STACK EXECUTED.** Real Git objects are checked; donor programs are not run.
- **LOCAL TYPE LINK ≠ DONOR COMPATIBILITY.** Actual source/target APIs need direct independent proof.
- **RECEIPT HASH ≠ SIGNATURE.** No private key, owner trust, reLATTE authority or ADMIT issued.
- **SUBSTITUTION ≠ INTERCHANGEABILITY.** One fixture is replaceable under a narrow declared port only.
- **COMPOSITION ≠ SELECTION.** All authority stays with the actual operator and destination.
- **BRANCH ≠ BACKLOG.** Unmerged verified code remains inspectable and usable under its own constraints.

## Next native experiment

Connect two *real* donor-native stack outputs through typed interfaces, with separately witnessed native executions, a verified cross-stack handoff, and an explicit sovereign HOLD. Candidate owners: `planZ` discovery, `CANNON` source verification, `GHoT` owner-local worker, and `reLATTE` signed transit. No automatic ACT, KEEP, ADMIT, publishing, or merging.
