# CANNON 008 — Branch loadout; available source, not admitted execution

A branch can contain tested, valuable, standalone code without being merged. This experimental loadout uses CANNON's pre-existing readSource exact-Git-object verifier to establish which declared source files really exist at pinned commits. It never imports donor code or executes the declared entrypoint.

**BRANCH != BACKLOG. UNMERGED != UNFINISHED. VERIFIED_SOURCE != VERIFIED_RUNTIME. TESTED != DEPLOYED. CANON != ONLY_AVAILABLE_SOURCE. LOADOUT != PERMISSION.**

## Working boundary

- Human-selected loadout manifest (no generated plan inference);
- two original Git commits and source blobs, not branch tips;
- original Git object hashes, declared local origin config, SHA-256 byte witness;
- proposed Node runtime and argv shown, never executed;
- independent source-local CI URLs and explicit unresolved gates;
- deterministic receipt with cold replay against the original Git objects;
- no deployment, ownership claim, Git mutation, CANNON canon selection or machine execution.

## Reproduce (Node 24 + git)

Check out full independent Git repositories containing the pinned commits in examples/branch-loadout-008.plan.json, and supply paths separately:

    cat > /tmp/branch-roots-008.json <<'JSON'
    {"the-static-collective/planZ":"/absolute/path/to/planZ","the-static-collective/CANNON":"/absolute/path/to/CANNON"}
    JSON
    node --test test/branch-loadout.test.mjs
    node scripts/branch-loadout.mjs inspect examples/branch-loadout-008.plan.json /tmp/branch-roots-008.json /tmp/branch-loadout-008.json
    node scripts/branch-loadout.mjs verify examples/branch-loadout-008.plan.json /tmp/branch-roots-008.json /tmp/branch-loadout-008.json

The runner must be a clean local environment. This specimen does not install dependencies, check the application semantics, fetch CI attestations, bind a real owner signer, or grant rights.

## Integration seams

- planZ 004 catalogs pin-qualified branch-capability candidates without imposing plan dispositions.
- CANNON 008 verifies **original source bytes** for explicitly chosen candidates.
- reLATTE can carry the resulting bounded source evidence only under a separately authorized crossing.
- GHoT or another owner-local runner can execute after environment checks, explicit human selection, and runtime/rights gates.
- webZ/Abundent can show a dated projection and offer direct source/test links; it must not claim a live API or act on a button click.

A successful loadout says: "these exact source objects exist locally and their bytes have been verified." It does not say they are safe, compatible, licensed for every purpose, admitted, or deployed.
