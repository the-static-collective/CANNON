# CANNON STACK² 025 — FIRST CONTACT: THE CARD THAT COMES BACK

**2026-10-22 · human-approved experimental crater · DRAFT / HOLD · not canon · not deployed**

**Parent:** [STACK² 024 Living Commons](https://github.com/the-static-collective/CANNON/pull/28). This branch is stacked on the **unmerged** 024 experiment. It does not change or merge any donor source.

## What really executes

Three **original source-owned** JavaScript interfaces are independently imported and run:

1. [Static Field Living Deck PR #12](https://github.com/the-static-collective/static-field/pull/12) — original producer composes the **fictional** Cicada on the Porch → ECHO → Porch Radio cards into a real JSON *proposal*.
2. [Full Measure Living Deck Quest PR #48](https://github.com/the-static-collective/full-measure-world-layer/pull/48) — original receiver independently validates source proposal, plays INSPECT → JOIN → ATTEMPT → REPORT locally, and produces an unconfirmed guest-room request. REPORT does not create a Deed, actual pledge, verified assistance, or live Project.
3. [ROroomOM Living Deck Room PR #3](https://github.com/the-static-collective/ROroomOM/pull/3) — original receiver independently validates the source cards, quest history and permissions, plays INSPECT → ATTEMPT → LEAVE → RETURN, and exports a held room-local receipt.

Every donor checkout must have its exact original commit HEAD and each imported source file must byte-match the Git object at that commit before the first import. The native CANNON code **does not clone a new donor algorithm**, invoke an external service, merge source projects, or claim an institution's consent.

| Donor | Exact PR-head SHA | Code executed |
|---|---|---|
| Static Field | 80b08f7a45f6957239582091536ea9528df7a1b7 | composer.mjs, source-design.mjs, browser-handoff.mjs |
| Full Measure | 60cf0fc697b8b83d89e364d7dbbfe6001f560f6d | quest.mjs |
| ROroomOM | f7372b6b5dd18bbce8a850100742521495b0a814 | room.mjs |

Source-code integrity in a pinned test checkout is **not** owner identity, authenticated human permission, source-card issuance, story rights, or third-party certification.

### Actual native path

    Static Field original code: Cicada + ECHO + Radio
                  |
           unverified proposal
                  |
    Full Measure original quest: INSPECT, JOIN, ATTEMPT, REPORT
                  |
        local unconfirmed room request
                  |
    ROroomOM original receiver: independently replay & validate
                  |
       INSPECT, ATTEMPT, LEAVE, RETURN
                  |
            HELD LOCAL RECEIPT
                  |
    CANNON source-and-receipt inspection
                  |
      PUBLIC RETURN CARD: NOT ISSUED

The inherited STACK² 024 CARE/CULTURE synthetic fixture is separately inspected, preserving its own decision and consent refusals. **CANNON's fictional confirmed care record is never presented as a native donor's observed activity.** The executed three-repository route is a card/quest/guest-room software rehearsal, not a live assistance system or permissioned music release.

## Files

- [Original-donor native orchestrator](../labs/crater-025/native.mjs) — three pinned original sources, native execution, original-donor rejection tests, local inspectable receipt, create-only run and independent cold verify.
- [Adversarial contract tests](../labs/crater-025/native.test.mjs) — source pin mismatches, native source processing, rights/current separation, tampering and replay.
- [Source-pinned CI](../.github/workflows/stack2-025-first-contact.yml) — exact Git checkout SHA for all three independent donors, actual independent donor regression suites, CANNON native tests and cold replay.

The local test needs Node 24 and Git. It does not require paid infrastructure, private keys, the user's Suno account, real contacts or a cloud database. Use three independent source checkouts at the exact commits above.

Write a private local roots.json containing absolute paths under **static-field**, **full-measure**, and **roroomom**.

Run from the CANNON repository root:

    export CRATER_STATIC_FIELD=/absolute/path/to/static-field
    export CRATER_FULL_MEASURE=/absolute/path/to/full-measure
    export CRATER_ROROOMOM=/absolute/path/to/roroomom
    node --test labs/crater-025/native.test.mjs
    node labs/crater-025/native.mjs run /private/roots.json /private/new-crater-receipt.json
    node labs/crater-025/native.mjs verify /private/roots.json /private/new-crater-receipt.json

The output contains source-file digests, handoff digests, local state labels, a segregated synthetic STACK² 024 fixture digest and NO actual person, phone, account, address, raw song, real help case, issued card or published URL. Run is create-only; verify deterministically reruns pure donor preview functions and refuses altered receipts. **SHA-256 is an integrity check, not a signature or institutional trust.**

## Mandatory hostile refusals

- Wrong ECHO card ordering: the **original Static Field** producer refuses.
- Forged issued-card receipt: the **original Full Measure and ROroomOM** receivers refuse.
- Forged Full Measure pledge confirmation: the **original ROroomOM** refuses.
- Misordered quest actions and altered source-card pairing: ROroomOM refuses.
- Destination permission escalated from preview-only to admit: ROroomOM refuses.
- Missing/changed pinned Git object or swapped donor checkout: CANNON refuses before import.
- Overwrite of the create-only receipt or corrupted claimed confirmation: CANNON refuses cold verify.
- Independent synthetic music withdrawal and care dispute are checked under the inherited STACK² 024 code, without mislabeling a donor's quest as actual care.

## What this does NOT prove

**No paper was printed, QR scanned, real physical card issued, two phones connected, assistance offered or delivered, human identity verified, track licensed, song published, partner approved or multiuser database deployed.** The PostEmahh'n cards are design-backed fixtures, not authenticated source-issued cards. A Full Measure local report never grants a Deed. A ROroomOM guest room is not the authorized Room 005/006. A signed or hashed code record is not real-world testimony.

The target [October 24 Coalition of Care gathering](https://sites.google.com/view/coalitionofcare/event) is an opportunity to **listen and ask**. Katie Boone, Deb Groebner, the Coalition, Waseca food organizers, Kinship Radio and other named institutions have not requested, approved, adopted or authorized this work.

## Recruitment ledger: source-owned next seams, not yet integrated

**Care lane:** Nourish-Kids → Band Runtime → BananaSpork/Garden, including a native fulfillment envelope, report-vs-confirmation distinction and source status return. Begin fictional and offline; no live Supabase mutation.

**Physical lane:** lemonPRESS / GHoT POSTAL-CORPS, for optional approved paper print, actual QR hardware trial, carrier consent and recoverable local return. Source of an image or QR does not prove physical custody.

**Music/story lane:** SIA → Story DNA → Static Live, with independently obtained rights and local editorial approval. A melody is not a food-delivery receipt; confirmed aid is not permission to narrate someone's life.

**Relationship lane:** Free Graph / GOATnote, allowing human-specified, separately attributable relations and temporal interpretation; no automatic people scores, identity graph or covert attendance.

**Public return:** webZ / Abundent after independent review, real HTTP smoke checks, host-owned opt-in and privacy/withdrawal policy. webZ main is not presumed equal to its deployed production lineage.

## Review and acceptance

**E1:** STACK² 024 synthetic two-current architecture and adversarial tests — independently reviewed in its own PR.
**E2:** STACK² 025 original three-donor programs on exact independently checked-out Git SHAs, source-byte identity, native source/recipient handoff, held local room return, adversarial refusal and cold replay. This PR's GitHub Actions result must be checked at the exact head before announcing success.
**E3/E4:** owner-authenticated source card, source-owned person consent, real two-phone interaction, physical/food handling, published website and verified community participation — NOT PERFORMED.

**THE CARD MAY OPEN THE DOOR. IT CANNOT MAKE SOMEONE WALK THROUGH.**

**SOURCE PIN ≠ PERMISSION · LOCAL REPORT ≠ CONFIRMED ACT · NATIVE EXECUTION ≠ HUMAN CONSENT · HELD ROOM RETURN ≠ PUBLICATION · STORY ≠ HELP RECEIPT · BRANCH ≠ CANON.**
