# FOUR-BRANCH SMASH 014 — Project0 × TranchNode × GHoT × reLATTE

Stacks on CANNON 013; no Project0 normative changes, no merging, no deployment.

## Original, separate source pins

- Project0 main: 08f892eb379ef538cce5b3ca081ecf683b448a4b (World Encounter 0.1, L-Branch 0.1, Continuity 0.1).
- TranchNode original feature branch feat/immutable-artifact-store-issue-6: 7fbb0c868befd5f6a7478bdd0447477a0e8e075e.
- GHoT 030 experiment/branch-native-owner-worker-030: b01758bee55d66d699160715ec377b45f7589707; uses only the original reference_node.py local system.hash capability. The signed ACT branch worker is NOT invoked.
- reLATTE R14: dcc8cdca84c440aa4294134f020fb7095bf87f24.
- Existing Founder Node 012 and Project0 013 chain stays pinned to their original source repos.

## Four real capabilities, four distinct semantics

1. Original Project0 World Encounter emits an addressed exchange envelope with verified SOURCE-BYTE status but epistemicKind=proposal. Native evaluateEncounter returns REFUSED with local refusal reason and inspectedObject=false. Source permission cannot enter destination context.
2. Original Project0 L-Branch runs deterministic finite propagation: inspect-address is a permitted internal computation with no authority required; attempt-effect requires a non-present grant and is REFUSED with reason LBRANCH_AUTHORITY_REQUIRED. No external job occurs, and outputRefs/step witnesses preserve the refusal.
3. Original Project0 Continuity preserves the evidence of local custody and the protocol while keeping authority and identity UNRESOLVED, with externalAdmissionRequired=true and portableEffect=none. A named addressed continuity claim is emitted with no identity fusion or permission transfer.
4. Original TranchNode FilesystemArtifactStore stores the exact original 013 witness bytes, verifies SHA256 on every returned read, provides idempotent create-if-absent identity, and stays local to an isolated GitHub Actions directory. Its sha256:<hex> address is not a Project0 semantic address.

GHoT's real reference_node system.hash hashes only the TranchNode artifact address string and creates a local task/receipt. That native receipt is NOT signed and is not a GHoT 030 ACT ticket. Native reLATTE R14 embeds the whole proposed crossing dossier in a signed opaque organ; receiver signs RECEIVED and R3_HOLD and preserves a durable local journal.

## Cold verification and hostile tests

- Reread all original pinned Git source objects; rebuild and execute native Project0 pure modules in their own checkout.
- Rehash Project0 source witness JSON bytes with original TranchNode local store; refuse missing or changed objects.
- Check GHoT system.hash against an independently calculated SHA256 and compare its original persisted task receipt.
- Verify native reLATTE R14 crossing, RECEIVED and HOLD signatures, file bundle and receiver journal.
- Refuse synthetic overlapping source/destination authority references, ungranted propagation, forged admission, tampered dossier and changed public inspection.

## Explicit nonclaims

- This does not sign GHoT hash receipts, ACT with the GHoT branch worker, or run an external donor application.
- This does not authenticate a human signer, establish real outside custody, prove source-world claims are true, or make Project0/TranchNode the other system's authority.
- Project0's local World Encounter refusal is distinct from reLATTE's receiver-local HOLD. A deterministic L-Branch eligibility check is not a permission for an external machine.
- No current user device or public website is changed. All local effects are in a disposable GitHub runner.

Use Node 24 with original Project0 built, original TranchNode tsx installed, Python cryptography for GHoT body key identity, and reLATTE dependencies. Supply roots.json containing the eight exact checkout locations.

    node scripts/project0-tranch-014.mjs design roots.json
    node scripts/project0-tranch-014.mjs run roots.json /tmp/empty-new-014
    node scripts/project0-tranch-014.mjs verify roots.json /tmp/empty-new-014

BRANCH != BACKLOG. CONTINUITY != AUTHORITY. CUSTODY != OWNERSHIP. OBSERVATION != EXECUTION. ENCOUNTER_REFUSED != RECEIVER_HOLD.
