# BRANCH WORK 009 — GHoT performs one bounded hash, reLATTE returns a held receipt

**Status:** experimental, test-only. Built upon CANNON BRANCH-LOADOUT 008. No merges or real-world machine actuation.

The working seam:

1. **CANNON 008** re-reads two pinned Git entrypoints (planZ and CANNON) and cold-addresses its loadout report.
2. **GHoT** source at immutable commit e35dd470384d864b7b0b629a68dad570875a7df0 is independently Git-verified. Actual Python ghot/reference_node.py is invoked only with run system.hash and the loadout report SHA-256 in a CI-local directory. The built-in system.hash implementation produces and persists a real task and receipt.
3. **GHoT task binding** is checked against the exact CANNON report hash; the separately persisted receipt and stdout must agree. This GHoT receipt is *not signed*; its byte commitment alone cannot prove a real external actor.
4. **reLATTE** exact source at dcc8cdca84c440aa4294134f020fb7095bf87f24 receives the SHA-256 reference to that local GHoT receipt in a native **opaque-organ** request. Its real signing and file transport create a signed RECEIVE and receiver-local R3_HOLD.
5. **Independent cold replay** reloads CANNON source Git objects, checks GHoT task/receipt history, verifies reLATTE crossing and both signatures, opens the receiver journal, and verifies file transport.
6. An inspection summary contains only exact public Git source pins, digest commitments, receipt IDs, disposition and explicit non-claims; no private keys, filesystem paths or visitor inputs.

This is **real work locally in a disposable workflow**. It is *not* authorization for GHoT on another machine, identity verification of repository owners, operational reLATTE federation, or a public execution endpoint.

## Reproduce with opt-in local sources

Requirements: Node 24, Python 3, OpenSSL, Git, and installed dependencies for the pinned reLATTE checkout. Provide full local Git checkouts containing the commits listed in the CANNON 008 plan, plus GHoT and reLATTE checked out at the exact Git commits above.

    node --experimental-strip-types --test test/branch-crossing.test.mjs
    node --experimental-strip-types scripts/branch-crossing.mjs run examples/branch-loadout-008.plan.json /tmp/branch-work-roots-009.json /tmp/cannon-009-new
    node --experimental-strip-types scripts/branch-crossing.mjs verify examples/branch-loadout-008.plan.json /tmp/branch-work-roots-009.json /tmp/cannon-009-new

The checkout-roots file supplies an explicit map from four repository names to local full-checkout directories; see the CI workflow example. The run refuses an existing output directory; verify never re-executes the GHoT job. CI uses pinned source checkouts; the verifier refuses moved GHoT or reLATTE HEAD. Changing a donor source pin requires review.

**SOURCE AVAILABLE != EXECUTION GRANT. CI PROCESS != USER NODE. DONOR RECEIPT != SIGNED RECEIPT. RECEIVED != ADMITTED. HOLD != FAILURE.**
