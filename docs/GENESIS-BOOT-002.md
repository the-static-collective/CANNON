# GENESIS BOOT 002 — a real first-boot conversation with original open-PR code

**Status:** Interactive **localhost** first-boot experience, explicitly launched by an operator from CANNON's experimental branch. This is a native source-executing developer/field-bench application, **not** an installed Linux bootloader, autonomous city controller, actual house, unverified human witness or product onboarding.

> HELLO, WORLD. What shall we build together?

The actual same first-boot interface could be used in an MIT live software demo and as the future Suitcase first-launch page. The operator doesn't have to see six repositories. Their choices yield source-pinned, locally executed software and actual inspectable outputs, while each source remains independently owned.

## First boot as a finite interaction

**EXPLORE** — A simple six-surface house preview illustrates the potential local organs. No actual parts or ability are asserted.

**BUILD** — An operator types **one public-safe question**, checks an explicit review/retention statement and clicks to run. The local CANNON server reuses GENESIS BOOT 001's real multi-source execution to generate two **fictional**, different A/B site plans, source checks, printable work cards, a GHoT scenario simulation, a local WebZ/GrO comic and related receipts. No execution occurs when the page is merely opened. Every click produces a new local, create-only run directory.

**WITNESS** — The operator selects a saved run and clicks **Cold verify**. CANNON invokes the same original source functions in a new replay; exact output bytes, source pins and receipts are checked. An altered comic or work card refuses. It plainly reports **NO FIELD WITNESS**. Previous create-only runs remain inspectable across local process restarts.

**CROSSINGS** — A source-linked shelf of other independently tested CANNON programs. **Warm Thread is now a second opt-in executable lane** (original GHoT → Full Measure → GHoT, then original Garden and Band) when its four donor checkouts plus the original CANNON #32 runner are available at exact commit pins. Operator acknowledgement and a separate button are required. It produces a native receipt and printable fictional handoff, then supports cold replay/tamper refusal. The CARE return and planZ/GHoT/reLATTE crossings remain reference-only in this console; none is silently run or selected as canon.

## Startup from an independently reviewed source checkout matrix

Requires Node.js 24+, Python 3.11+ and Git, plus these **five separate original repo checkouts** at the exact commits declared in `src/genesis-boot.mjs`: STATIC OS, webZ, GrO, GHoT, JAR;VIS. Keep CANNON on `experiment/genesis-boot-002-interactive-porch`. These can all be experimentally unmerged and still run; `main` is not assumed authoritative.

At a directory that has the six independent repositories as siblings, first choose an existing local directory for create-only outputs:

```sh
mkdir -p local-results
node cannon/scripts/first-boot.mjs \
  --staticos staticos --webz webz --gro gro --ghot ghot --jarvis jarvis \
  --out-parent local-results --port 8766
```

Open `http://127.0.0.1:8766/` **on the same computer**. Nothing is sent to GitHub, OpenAI, the public Abundent domain or any external service by this program. The first boot uses local Python/Node.js only. Browsers with scripting disabled may inspect previously generated `first-boot.html` and house work cards; BUILD and WITNESS buttons require JavaScript. Speech input is **not implemented**, and text is the accessible primary interface. Stopping the server leaves the create-only local output directory unchanged.

## Optional second native crossing: Warm Thread

This is **not** required for the ordinary Living House boot. It is a second independently controlled experience that reuses the original CANNON STACK² 027 code rather than rewriting its Full Measure actor, Garden receiver, or Band residual logic.

Place five **additional distinct Git checkouts** next to CANNON: `cannon-warm` from original CANNON #32 at `ee461d7be29795907384c791be88c18e030e0222`, `ghot-warm` at `3c8be40cbaef2f9c786e5424abf15d4b138d2966`, `full` at `553e97401a8483a0ee3c369fed9d3fb8f1c9058d`, `band` at `f2c889df90905eda533fe6d978cd1a52c788a33e`, and `garden` at `6738230a8557060dd59aabc19caf21826806d16f`. These are independent source-owner histories, not replacements for our primary five checkouts.

Install Garden's pinned TypeScript runner in advance (this **setup** may require connectivity, unlike the actual boot execution):

```sh
npm ci --prefix garden --ignore-scripts --no-audit --no-fund
node cannon/scripts/first-boot.mjs \
  --staticos staticos --webz webz --gro gro --ghot ghot --jarvis jarvis \
  --out-parent local-results --port 8766 \
  --warm-cannon cannon-warm --warm-ghot ghot-warm --warm-full full \
  --warm-band band --warm-garden garden
```

Open `http://127.0.0.1:8766/`, scroll to **CROSSINGS**, explicitly acknowledge the fixture is fictional and click **Run original Warm Thread code**. The original GHoT/Full Measure/Garden/Band modules and original CANNON #32 coordinator run at fixed commit SHAs; no arbitrary user-supplied command executes. The original refusal preserves the first two simulated steps and an outstanding one-load transport need. No real assistance, steward identity, money, inventory, institutional enrollment, human confirmation or physical action occurs.

Outputs `warm-thread.html` and `warm-thread-receipt.json` are stored create-only. The same **WITNESS** selector can cold-replay the original programs, check the source and receipt, and refuse a modified output. This is a software verification, not actual witness testimony.

**Verified native GitHub Actions proof:** [run #40870396617](https://github.com/the-static-collective/CANNON/actions/runs/40870396617) succeeded with **eleven separately checked-out original repositories (including CANNON itself)**, original independent project tests, source-pinned original Living House A/B execution, original Warm Thread GHoT → Full Measure → Band/Garden crossing, cold replay of both, deliberate corruption rejection, and actual uploaded local HTML/JSON receipt artifacts.

The output directory is a *local artifact vault*, not a general network file server. A randomly generated run identifier appears in `/runs/<id>/...`. URL routes only expose a fixed allowlist of known, public-safe artifact names, and server binds to IPv4 loopback only. The service requires the exact 127.0.0.1 Host header; POST requires matching browser Origin and an in-memory random anti-CSRF token. It imposes bounded JSON requests, has no CORS, remote shell, login, uploads, microphones or service workers, and does not accept arbitrary filesystem path or project code selections from the browser.

**Security limitation:** This is a developer-lab HTTP server on loopback. It is not a hardened multi-user application, encrypted private messaging service, authenticated human-witness platform, or acceptable container for sensitive/private case records. Only operate trusted reviewed original code from the exact source pins; Git bytes do not prove licensing, developer identity or software safety. Keep private records outside its input and artifacts. Restarting the browser/server produces a new CSRF token.

## Actual test/field scope

### Software evidence obtained in CI

`GENESIS BOOT 002` GitHub Actions checks out original exact source commits, verifies pins, executes existing CANNON tests, original STATIC OS/GHoT/GrO branch-native tests, and launches **the actual localhost HTTP server**. It submits a public-safe question to `POST /api/compose` (explicit acknowledgement), checks generated HTML/artifacts and source receipts, uses `POST /api/verify` to cold replay, stops and restarts the server, recovers saved history, deliberately corrupts the generated comic, verifies refusal, restores and verifies again. It then uploads the actual generated house plan(s), comic, and receipts as an inspectable workflow artifact. The native test is skipped in generic `npm test` without the five explicitly provided baseline repositories. Dedicated CI runs it with those actual source checkouts **and** all five additional optional Warm Thread source checkouts. It separately verifies both original-code executions, restart persistence, refusal of forged outputs and exact-source byte equality.

### Physical/human evidence NOT claimed

No bootable OS image, no real solar measurements, no electronics touched, no actual home build, no second human steward, no signed reLATTE production session, no live Full Measure Deed, no permissions to use someone else's hardware or resources, no MIT selection. A/B are **two different synthetic surveys**, not an independent-participant test.

### Source crossings to consider next

- [CANNON STACK² 027 Warm Thread](https://github.com/the-static-collective/CANNON/pull/32) — **now available as a separate opt-in executable original-code crossing** through the exact pinned source program and four donors, with human refusal and one fictional unresolved transport need preserved. [Original separately green CI](https://github.com/the-static-collective/CANNON/actions/runs/39825842178). No actual human aid is claimed.
- [CANNON CIRCULATION 002](https://github.com/the-static-collective/CANNON/pull/35) — source-pinned native CARE receiver/local HOLD/return; [green native CI](https://github.com/the-static-collective/CANNON/actions/runs/39832959648). This is a candidate for the **Food** mission profile.
- [CANNON STACK² 018 native planZ × GHoT × reLATTE](https://github.com/the-static-collective/CANNON/actions/runs/39838625999) — a candidate for future authorized, separately keyed crossing, not a default enabled service.
- [CANNON GENESIS BOOT 001](https://github.com/the-static-collective/CANNON/pull/38) — the executable source substrate used by this console.

## Laws

`MAIN != CANON` · `CLICK != PHYSICAL ACTION` · `SIGNED != TRUE` · `REPLAY != FIELD WITNESS` · `A/B SOFTWARE TEST != TWO PEOPLE` · `HOLD != EXECUTION AUTHORITY` · `SPEECH != AUTOMATIC ACTUATION` · `DONOR BRANCH != MERGE REQUIREMENT`.

Next: manual physical bench with safe commercial power, measured sensors, two independent operators and actual separate signed receipts; then optionally add other source-owned crossings after pinned-adapter proof.
