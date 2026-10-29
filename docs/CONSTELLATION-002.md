# CONSTELLATION-002 — executable Stranger Arcade

Stacks directly on PR #47 at `c5031495424abcd6141d546a1f85a5e781539072`, retaining #45, #38, #37 and #5. The original nine native donor owners and the 64-source research lab are preserved unchanged inside the new packet.

## Operate the machine

Verified platform: Linux x86_64, Node 24+, Python 3.11+, Git and npm. Runtime package bytes are locked for this platform; other platforms are not claimed verified. Acquisition is explicit and uses public immutable source cuts. Build, challenge and verification require no network or private credentials after acquisition.

```sh
node scripts/arcade-machine.mjs acquire --into ../arcade-inputs
node scripts/arcade-machine.mjs build --config ../arcade-inputs/config.json --out ../arcade-output --authorize LOCAL_FICTIONAL_ONLY
node scripts/arcade-machine.mjs verify --config ../arcade-inputs/config.json --out ../arcade-output
node scripts/arcade-machine.mjs serve --config ../arcade-inputs/config.json --out ../arcade-output --sessions ../arcade-sessions --port 7792
```

Open http://127.0.0.1:7792/first-boot.html. Choose one of five missions and explicitly authorize a local fictional challenge. ASK WHY, INSPECT SOURCE, BREAK IT, REFUSE, FORK, SWAP DONOR and RECOMBINE execute actual original-owner transforms in fresh local processes and save independently verifiable result packets. REVOKE terminates local authorization, including in-flight computation; revocation and idempotency survive server restart. Standalone HTML supports inspection/printing and explicitly HOLDs unavailable native actions.

Challenge packets contain `request.json`, `result.json`, `result.html`, intermediate stage artifacts and a receipt. Verify any challenge using the same `verify --config ... --out CHALLENGE_DIRECTORY` command. Reusing an output directory is refused.

## Actual depth and evidence breadth

**22 distinct executing native donor repositories**, through 23 exact checkouts, plus CANNON. **64 original public document-source repositories** pass native Corpus OS exact selector/return verification and participate in native attributed graph computation. Their union is 69 distinct public repositories. These are separate counters; documents are never counted as native runtimes.

The nine inherited native owners remain STATIC OS, GHoT, WebZ, GrO, JAR;VIS, planZ, reLATTE, Full Measure and GRAFT. The thirteen new owners are Corpus OS, Project0, Free Graph, ALEX.2, LOADOUT, WORLDSEED, Band Runtime, Trust, Static Live, Playdeck, Haunted Toaster, STORYSHIP and TranchNode. Exact pins: `constellation/native-002.json` and the generated manifest. Playdeck and Free Graph deliberately use inspected nondefault experimental cuts.

Each mission has fourteen stages. Shared native source intake fans out into graph and disclosure evaluation, converges through attributable support, world construction, effect fences, protected silence and divergent perspective views, then produces capability coverage, timed card composition, a canonical visual-score timeline, branch replay and complete source-root closure. Exact input hashes and field mappings accompany every stage.

The five scenarios bind different original material: House A/B module holds; fictional First Circle return/check-ins and receiver outcomes; Garden food/resource gates and GrO's disputed counts; original cultural artifacts and invitation gates; GHoT consequence decisions plus unavailable power/providers. External and physical effects remain refused. Recombination consumes two actual mission source views and prior native composition hashes. Donor swap changes the card-field provider from WORLDSEED to Free Graph. Fork retains both branches as unresolved. BREAK IT changes a projection body and receives native TranchNode `RECEIPT_IDENTITY_MISMATCH`.

## Proof and limits

Whole native Git source trees and commit/tree/blob objects are checked; replacements and untracked runtime shadow inputs are refused. Runtime transpiler/canonicalizer bytes are pinned. Every retained packet byte is recomputed during cold verification, including the unchanged inherited packets. A second complete source acquisition successfully reproduced the machine locally.

Local validation before publication: original baseline 58/58; complete machine suite 66/66; after review fixes, core/native/UI suite 69/69 (server integration separately passed). Relevant unchanged owner suites passed, including Corpus intake22, Project0 admission/authority18, TranchNode closure8, Free Graph25, ALEX15, LOADOUT9, Band admission1, Trust view4, Static Live5, WORLDSEED11, STORYSHIP8, Toaster9 (including golden specimens), and Playdeck's original Genesis proof. Full owner applications, mobile/Electron packaging, production rendering and every historical source branch are not claimed tested. Hosted status must be read from PR checks.

Independent review found pending-session consent and busy-revocation UI bugs. Four regression tests now pass: capture/recheck authorized choices, invalidate changed selections, keep revoke available while busy, and revoke an eventual session if consent was cancelled during creation.

All institutional/locality/person scenarios are fictional. Retained receipts are unsigned software evidence, not authenticated human custody. Trust produces a structural view model, not authenticated testimony. Toaster generates an explicitly legacy-v1 score and canonical timeline, not measured audio, production render or KEEP. Source graph adjacency is declared citation traversal, not inferred genealogy or compatibility. Source rights, independent human replay, survivor-informed safeguarding/privacy review, physical bench permission and institutional review remain human gates. No merge, deployment, spending, outreach, private intake or physical actuation is authorized by this machine.

## Tests

```sh
# Point these at your acquired directories and built machine:
ARCADE_CONFIG=../arcade-inputs/config.json ARCADE_PACKET=../arcade-output \
CANNON002_SOURCE_ROOT=../arcade-inputs/inherited/staticos \
CANNON002_RELATTE_ROOT=../arcade-inputs/inherited/relatte \
CONSTELLATION_ROOTS=../arcade-inputs/inherited/roots.json npm test
```

The older canon test also needs the immutable STATIC OS object `7bc551610421bd60a8dbf624d93d7a6682ce3987` fetched without changing its checkout. The dedicated workflow does this and runs all required integrations with no optional skips. Source acquisition remains bounded to 64 documents plus the fixed native cuts; it reuses matching native checkouts where possible, but currently acquires shallow full source trees rather than compact extracts.
