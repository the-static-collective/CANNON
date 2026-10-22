# CANNON STACK² 028 — FIRST CONTACT FIELD DOOR
## The card that a person can actually understand

**2026-10-22 · user-approved independent experimental prototype · DRAFT/HOLD · not selected canon · not deployed**

**Parent:** [STACK² 027 Warm Thread](https://github.com/the-static-collective/CANNON/pull/32), exact base head `ee461d7be29795907384c791be88c18e030e0222`. This branch is stacked on an unmerged experiment, not on CANNON main or webZ production. The inherited original-donor care, culture, room and physical-logistics experiments remain distinct and unchanged.

## Why this exists

Technical continuity is irrelevant unless a person can understand the invitation and choose freely.

The field question is not whether the human will learn what GHoT, reLATTE, Band Runtime and PLENTY mean. It is whether **one paper card** can lead to **one understandable choice** without login, algorithmic ranking, implied institutional approval or a covert enrollment.

The new artifact is a local, independently inspectable, **static participant-facing webpage** at [labs/field-first-contact-028/index.html](../labs/field-first-contact-028/index.html). It requires no server, account, API keys, CRM, analytics, database or external service. For browser use, serve the directory as static files; browser file:// module loading varies and may be blocked.

## Four human doors

The first screen asks: **Where would you like to begin?**

1. **I might be able to help** — a conversation about possible capacity, not a commitment or work order.
2. **I have a question** — learn before consenting to further involvement.
3. **I have an idea or song** — a creative possibility requiring independent rights and editorial review before any publication.
4. **Just looking around** — an equally valid choice; no sign-up is expected.

Each door asks one plain-language follow-up. A visitor may type **one optional local note, max 180 characters**, with a clear warning not to enter contacts, addresses or sensitive details. The note exists only in current browser memory; it is **not** stored in localStorage, sent, sent to an AI model, put in a QR, emailed to a steward, or added to a public graph. The visitor can explicitly produce and export an **UNSENT_DEVICE_LOCAL_DRAFT** JSON file or erase it. Export does not grant help, membership, creative rights, editorial approval or public sharing. A printed card itself contains no personal response.

There is no real submission endpoint. The page says plainly: **talk directly to the person who shared the card** if a human conversation is desired. This is a field usability prototype, **not** an intake system. Someone could scan the page and leave without any result, which must remain valid.

## Printed physical interface: beautiful, but conservative

The same offline static page has a field-steward-only details pane for US Letter **4-up** larger cards and **9-up** photo-card-size cutouts. Green/cream typographic artwork contains the invitation, three nonprivate routes, and prominent no-account/no-obligation/prototype status. It uses the independently licensed QRCode.js source already vendored by webZ:

- Source: [webZ Field Cards PR #67](https://github.com/the-static-collective/webZ/pull/67), exact source commit `31f80398c937e5da289d517f50e01cf6470c7c6a`.
- Original vendor Git object SHA `993e88f396640f881b69f98db7a4d17401ef83ca`; license Git object `93c33233fa538ff9af27374eb13c6ea5147f7a3e`.
- The MIT copyright and permission notice is retained alongside the QR library.
- QR generation is browser-local and contains **only a stable public project code and predeclared door name**. No note, personal contact, consent, payment, private observation, uploaded file or individual identifier ever belongs in a QR.

**Critical address gate:** an actual scannable QR is withheld unless an operator explicitly supplies the precise *same-page* URL they are viewing, the page is delivered over HTTPS (or restricted private HTTP LAN for local testing), and the operator ticks a declaration that they tested the exact address on a **different device**. CANNON cannot independently observe this scan; even an operator-attested hosted preview remains **independent prototype / not endorsed**.

- A **file://** proof prints a visually useful card **without a QR**.
- A **localhost** URL cannot magically open this page on another phone. It is suitable only as a local test on the same machine. The browser gate requires a matching current page but does **not** prove cross-device reachability.
- A private LAN HTTP address may generate a QR for a supervised, explicitly marked **LOCAL NETWORK TEST ONLY** experiment; not for public distribution.
- A hosted HTTPS address can generate a QR only after same-page and operator-attestation gates, but this still does **not** prove a successful scan or approve publication.
- There is no hard-coded abundent.org path, invented preview host, fake partner account, arbitrary URL-redirect QR, or deployed CANNON frontend.

**Before giving any QR card to another person, manually test the exact hosted URL and printed QR on a separate phone, and obtain the actual steward's approval for any public dissemination.** Print appearance, photo-paper crop and QR quiet-zone/scannability on physical hardware have not been checked by GitHub CI. Start with cheap ordinary paper, then print photo cards only after hardware quality assurance.

## Test the static artifact locally

```sh
cd labs/field-first-contact-028
python3 -m http.server 8000
# Open http://127.0.0.1:8000 on the same device.
# Operator may prepare non-scannable print proofs there.
# For two-phone tests host over an actual reachable LAN IP,
# ensure both devices are on the same private network,
# and independently attest after scanning on the second phone.
```

**Do not copy a localhost print QR to physical outreach.** A scan from a second phone would reach that phone's localhost, not the computer serving the site.

Run native unit and source-surface tests from CANNON root:

```sh
node --test labs/field-first-contact-028/core.test.mjs
node --check labs/field-first-contact-028/app.mjs
```

The bounded [CI workflow](../.github/workflows/stack2-028-field-door.yml) uses Node 24, tests all pure return/QR/print contracts, serves the exact static directory on loopback, fetches required resources and checks syntax. It does **not** claim human usability, actual second-device scanning or printer proof. Its source pins are primarily the inherited CANNON branch and vendored original QR library; this is **not** a new donor-native care runtime.

## A usable two-person field protocol

**Roles:** one steward demonstrator; one consenting participant using their own device if desired. This is **not** a covert user study or Coalition-sanctioned experiment.

1. **Get permission** to show a *prototype*. Explicitly say it does not send anything, confirm help, publish songs or represent a Coalition or local organization.
2. **Hand over a printed prototype** only after hardware scan QA and any required venue/steward permission. Alternatively, show the page locally without distributing cards.
3. **Ask a neutral question:** “Looking at this card, what would you expect to happen if you scanned it?” Do not train the participant to say the desired answer.
4. **Allow an actual choice**, including leaving. Observe whether the person can identify that no account is needed and that nothing is actually submitted.
5. **Ask:** “After choosing that, did anything happen that you didn't expect?” and “Would a real project need some other way to reply?” These are design observations, **not** claims of help offered or community approval.
6. **Ask whether they want their response captured at all.** Default: take **no** identifying notes and do not export their typed text without separate consent. Never record bystanders, youths, contacts or confidential needs to test the prototype.
7. **Record the tech result separately:** host/URL verified or not, second-device tested or not, printed QR scanned or not, high contrast/readability, which door seemed understandable. Do not assign scores to people.

**Pass for the field UX experiment:** a genuinely consenting adult tester can understand the independent prototype, select or decline a door, and describe the non-submission boundary. If hardware scans fail, record that. If participants expect a live submission, record the misunderstanding and revise the copy rather than collecting data as if the service exists.

## Promotion gates

- **S0 — working local artifact:** pure contracts, account-free mobile page, attractive 4-/9-up sheets, no-response QR privacy, no effect. Evaluable by Node and static route CI.
- **S1 — hardware print and 2-device scan (NOT YET):** manual exact URL check; physical proof; separate phone scan on tested LAN or independent HTTPS host; print margins and camera QR reliability.
- **S2 — human comprehension (NOT YET):** opt-in participant exercise and ability to withdraw; assess whether the presentation makes its no-submit boundary unmistakable.
- **S3 — steward and rights review (NOT YET):** a real steward decides actual project question, optional return channel, protected contact route, permissions, nontracking privacy/retention, photo/music licensing, accessibility and withdrawal.
- **S4 — deliberate webZ/Abundent release (NOT YET):** reconcile with the exact webZ production ancestor (not main), manifest/route ownership, tests, deployment approval and real HTTP smoke tests before a public QR is issued.

Do not conflate green CI with real human comprehension. Do not auto-deploy or merge this field branch. Do not imply Coalition, Waseca food organizers, church, Kinship Radio, artists, recipients or volunteers asked for this tool. The date October 24, 2026 is an opportunity to *listen*, not proof of adoption.

**THE CARD IS AN INVITATION, NOT AN ORDER. · THE QR IS AN ADDRESS, NOT CONSENT. · THE CHOICE IS LOCAL, NOT A SUBMISSION. · THE PEOPLE DO THE WORK.**
