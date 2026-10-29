# CONSTELLATION-001 — many owners, one independently replayable experiment

This review-only experiment starts **directly at CANNON #38's actual head `bb57e71151bca1eb245abfc82cf74047e9105169`**, retaining #37 and #5 as Git ancestors. It calls the original Genesis composition; it does not replace or flatten the prior implementations.

## Run it

Requirements: Git, Node 24+, Python 3.11+, npm. GitHub/network access is needed to obtain public exact commits and reLATTE's one runtime dependency. Neither build nor verifier performs discovery, downloads, installs or external writes. No private credentials are required once acquired.

From this exact CANNON review branch/commit:

```sh
# Explicit one-time acquisition. Choose a new directory outside all source roots.
node scripts/constellation-acquire.mjs --into ../constellation-donors

# One build command: this explicit authorization is for fictional local software only.
node scripts/constellation.mjs build --roots ../constellation-donors/roots.json --out ../constellation-output --authorize LOCAL_FICTIONAL_ONLY

# One independent, fresh-process cold-verification command.
node scripts/constellation.mjs verify --roots ../constellation-donors/roots.json --out ../constellation-output
```

Open `../constellation-output/first-boot.html` locally. If a browser's policy blocks `file:` pages, use a loopback-only static server: `python3 -m http.server 8765 --bind 127.0.0.1 --directory ../constellation-output`, then open `http://127.0.0.1:8765/first-boot.html`. This is a local preview, not a production deployment. Browser controls select the presentation and run a fictional narrative from the already computed source receipts. **Original Node/Python donor execution happens in the CLI build; the browser does not run those runtimes.**

The offline desk has MIT, Voqal and other-institution presentations, explicit local authorization, receiver refusal, a one-session revoke control, exact receipt inspection, JSON evidence download, a public atlas explorer and print controls. Revocation is terminal until the page is reloaded; it is a local demonstration, not an authenticated revocation system. It stores no visitor input and exposes no personal-data fields.

For an independent clean checkout, clone the exact CANNON contribution commit separately, acquire the exact donors there, and run its `verify` against an unchanged copy of the packet. `manifest.json` and `source-selection.json` retain the original exact owner pins. A verifier does not trust the stored `proof-report.json`: it checks source objects/bytes and recomputes **every retained packet byte**. Clean checkout reproduction is automated in the mission's recorded local validation; the hosted workflow checks fresh acquisition and fresh processes.

If a checkout, pin, dependency or required runtime is absent, the command exits 2 with HOLD/REFUSE and no successful packet. Re-run acquisition in a new directory after resolving network access; never substitute a moving `main`. Existing output is refused. A source-stage error happens before output creation; an output write error removes the directory created by that attempt. Source roots are read-only and cannot contain output directories.

## Genuine depth and honest breadth

The committed `constellation/atlas.json` records **89 public repositories and 1,084 open PR heads**, including source owners, current-at-observation default pins, important unmerged branch pins, contract/test/instruction paths, inspected public-document hashes, authority boundaries and owner-local adapter suggestions. It is a dated read-only observation, not runtime compatibility or permission. Authenticated enumeration also found 18 private repositories; only their aggregate count is exported. Private names, heads, source and records stay outside the shareable packet. The atlas is intentionally not called a 100-repo executable runtime.

```sh
# Deterministically replay the committed discovery fixture without any network.
python3 scripts/constellation-discover.py --offline constellation/atlas.json --out ../atlas-replayed.json
# Optional explicit fresh read-only discovery, requiring gh and authentication.
python3 scripts/constellation-discover.py --out ../atlas-new-observation.json
```

Contract and test paths are discoverability candidates, not assertions those interfaces work. PR state and default heads can move after the observation. Per-repository suggestions are unsent links to issue templates; no owner is contacted.

**Ten exact donor checkouts / nine independent donor repositories execute, plus CANNON:**

| Owner | Original executed seam | Retained boundary |
|---|---|---|
| STATIC OS #91 | HOUSE-SEED compose, verify, render for distinct fictional A/B inventories | no house, OS image, measured power or hardware |
| GHoT #129 | Commons Machine synthetic graph | source-owned HOLD and REFUSE, no dispatch |
| WebZ | HARMONY catalog + craft/culture functions via inherited Culture Forge | no live receiving account or assets |
| GrO #32 | original Mattercraft field and material dispute | zero recognized spendable stock, no PENNY |
| JAR;VIS | HARMONY attention, planZ feed/attention and redacted fictional return | no real work completion or source-owner approval |
| planZ | original public-index validation and source-owned unresolved gates | lexical attention, not plan execution |
| reLATTE | original candidate validation, evidence adaptation, signed local receiver HOLD/REFUSE/observation ADMIT and replay | disposable test identities; no cross-party authority |
| Full Measure | original Commons Return Lens | zero Deeds, harvests and capacities, even on ADMIT |
| Full Measure #56 | original STILL HERE private-practice functions from a second source cut | two fictional check-ins, no real people or benefit |
| GRAFT exact nondefault branch | original printable work-kit renderer | no live scout substituted; no communication/distribution permission |

Exact owner commits are in `constellation/sources.json`, `manifest.json` and the generated repository integration map. No source is pasted into CANNON. Whole tracked trees and the exact installed `json-canonicalize@3.0.1` package bytes are checked before composition; inherited narrower source witnesses are preserved inside Genesis receipts. Git origin is checked as local configuration, not remote owner authentication. Source safety/licensing still needs human review. Discovery never launches arbitrary PR code.

## Shared evidence and three presentations

- **MIT:** NEED → DESIGN → PERMISSION → simulated ASSEMBLY → INSPECTION → actual software CAPABILITY → NEXT NEED. The original two blueprints remain source-owned; unknown power and missing solar-controller gates survive.
- **Voqal:** zero-contact First Circle simulation. Fixed fictional practice, real source-owned plan gates, a fictional JAR;VIS return as a reLATTE **claim**, independent local receiver outcomes and no human credit. This software has not been reviewed/endorsed by survivors or Voqal; “survivor-informed” is a required independent design-review gate, not a credential earned here.
- **Open doorway:** three printable briefs and GRAFT question cards reuse the **same execution receipt** and source pins. No application, partnership, funding or external submission is implied.

`receipt.json` is a deterministic **unsigned software-result receipt**. `receiver-exercise.json` records reproducible semantic results. reLATTE creates real local P-256 crossings and receipts, verifies signatures and counterfeit refusal, exercises receiver restart/idempotency/revocation, then destroys its temporary keys and signed receipts. Cold replay repeats that experiment and compares deterministic retained results. **The packet does not contain retained signed reLATTE transcripts or independent human signatures.** No simulated policy is relabeled as real independent custody.

Stable artifacts include `manifest.json`, `receipt.json`, `proof-report.json`, `first-boot.html`, all original Genesis receipts/plans, `crossings.json`, `receiver-exercise.json`, `planz-return.json`, `relatte-observation.json`, printable `mit-brief.html`, `voqal-brief.html`, `open-brief.html`, GRAFT review cards, a repository integration map and machine-readable human gates. The browser's evidence JSON contains receipts, atlas, pins and fictional outcomes; retain the **whole output directory** for full byte verification and every rendered page.

## Validation

```sh
# Required native integration (does not silently skip missing donors):
CONSTELLATION_ROOTS=../constellation-donors/roots.json node --test test/constellation*.test.mjs

# Complete inherited + new CANNON suite; the older original source commit
# must be locally acquired too, without changing the STATIC OS checkout:
git -C ../constellation-donors/staticos fetch --depth=1 origin 7bc551610421bd60a8dbf624d93d7a6682ce3987
CANNON002_SOURCE_ROOT=../constellation-donors/staticos CANNON002_RELATTE_ROOT=../constellation-donors/relatte CONSTELLATION_ROOTS=../constellation-donors/roots.json npm test
```

Tests exercise transitive byte mutation, missing/invalid/stale pins and eligible unmerged commits, forged origin, counterfeit artifacts/claims, extra files, denied/revoked authorization, receiver refusal, duplicate idempotency, partial native process failure, output reuse, false hardware/physical/field claims and unavailable-power boundaries. Complete original source-owner suites and narrower relevant suites are named in `.github/workflows/constellation-001.yml`. GRAFT's historical six-organ suites require additional donors not executed by this renderer seam; only its work-kit suite is claimed.

No physical hardware/energy availability is inferred from successful local compute. “UNKNOWN” power is retained; no unlimited or free compute claim exists. `next-human-gates.json` and `NEXT-HUMAN-GATES.md` identify independent replay, owner rights, safety/privacy review, separately authorized bench work and optional institutional sharing.

The separately owned JAR;VIS contribution pins this CANNON implementation commit and provides `inspect`, explicit local `build` and cold `verify` commands. No owner results are rewritten as field verified, and no external operation is dispatched.
