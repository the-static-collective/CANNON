# Implementation plan — STACK² 025 Community Breath Field
*Superpowers plan draft · 2026-10-22 · review required before further integration*

**Spec:** `docs/superpowers/specs/2026-10-22-stack-squared-025-community-breath-design.md`

**Execution posture:** native on isolated experimental branches; no live host or donor execution. The research code and materials already exist as an **unverified draft** in CANNON PR #29; this plan is the verification/repair and subsequent rollout sequence, not a declaration of completed work.

## Task 1 — Reconcile CANNON 024 ancestry
- Compare proposed head to `experiment/stack-squared-024-living-commons`, not `main`.
- Read the synthetic CARE/CULTURE fixture, source registry, and existing tests.
- Record inherited contracts and changed files in an evidence note.
- Command: `git diff --stat <024-base>..<025-head>`.
- Expected: only 025 docs, census, audit, field kit and tests; no main merge or donor edits.

## Task 2 — Run TDD on registry audit
- Inputs: `community-breath-census.json` and `source-registry.json`.
- Test fail-first: duplicate repository, person-data field, invented LIVE state, bad/missing pin, unapproved interface, broken organ order.
- Implementation target: `breath-audit.mjs:audit(census, sources)`.
- Command: `node --test test/stack-squared-025.test.mjs`.
- Expected: zero failures; reported `total=102`, `readmeInspectedOnly=26`, `metadataOnly=76`, `actualValidatedInteroperableAdapters=0`.
- Explicit check: a blob SHA is a blob address, not a commit SHA. Reconcile newest source commits only with owner consent.

## Task 3 — Photo-printable field kit
- Test fail-first: refuse non-synthetic projection or fake authorization; no hyperlinks, forms, remote fonts, scripts, accounts or QR that could falsely imply a service.
- Implementation target: `field-kit.mjs:renderFieldKit(projection,auditResult)`.
- Command: `node labs/living-commons-001/field-kit.mjs > neighbor-door-8x10.html`.
- Expected: one 8×10-inch sheet with six meaningful print cards; manually inspect browser print at actual size, photo crop and legibility.
- A separately rendered sample `Neighbor_Door_8x10_Print.pdf` exists as a conversation artifact; it is not an authoritative exported result of CANNON's Node CLI.

## Task 4 — Cold verification
- Command: `npm test` at the 025 branch head, then repeat from a fresh checkout with Node >= 24.
- Expected: all existing CANNON tests remain green; inspect actual output and record failures honestly.
- In this environment GitHub repository network cloning and CI runs are unavailable. **No green CI result is claimed.** Existing GitHub PR status showed zero check statuses at creation.

## Task 5 — Human field review
- For October 24 Greater Mankato meeting, seek organizer permission before using the cards.
- Test a voluntary interaction between two people without phones/accounts; ask no one to disclose private need details for a demo.
- Record only authorized non-identifying lessons. No Coalition adoption or individual partnership may be inferred.
- Gate: two people can state a seed and next step in <2 minutes on paper; field proof must be separately witnessed.

## Task 6 — One real owner-admitted crossing
- Pick **one** donor organ with a specific local maintainer and actual source-native contract; do not update 102 repos.
- Open a new bounded issue and own-repo branch. Require independent admission, tests, refusal path, privacy plan, cold replay and operator choice.
- First practical pilot could concern Waseca food and shared local supply; only if invited by an authorized participant.
- No funding, payment integration, messaging broadcast or public household-data recording here.

## Task 7 — Independent culture invitation
- One artist-selected track/seed may accompany a public invitation; preserve creation sources, per-contributor grants and editorial control.
- Never infer consent from care participants, use of source songs or a public Suno URL.
- An editorially approved story is not evidence of a confirmed help act.

## Review focus
- No bypass of source-native authority by CANNON, planZ or a venue.
- Registry freshness/staleness, branch-level evidence vs default branch, duplicate/case-folding of repo names.
- No automatic remote writes, execution, unauthorized QR addresses or private information.
- Distinct CARE and CULTURE permissions; no laundering simulation as real field proof.
- All tests observed live with exit code zero before any ready-for-review or merge request.

## Human handoff
The proposed source-of-truth split is **CANNON experimental composition / planZ roadmap / independent donor implementations / Abundent optional future porch**. Review the written design and this plan; confirm or correct that split before further implementation. Keep PR #29 and planZ PR #27 in DRAFT/HOLD meanwhile.
