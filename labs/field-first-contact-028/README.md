# FIRST CONTACT / the card that comes back

An independent, **non-deployed** CANNON experiment: account-free participant choices + optional unsent JSON draft + professional 4-up or 9-up US Letter printable invitations. No live project backend, cross-device sync, consent capture, messaging, human verification or organization endorsement.

**Open locally:** from this directory run `python3 -m http.server 8000` and visit `http://127.0.0.1:8000`. A browser module may not load from `file://`. Nothing is submitted; the note is not kept on refresh unless the participant explicitly downloads it. The initial screen is comprehensible without seeing repository names.

**Print:** open "Field steward: prepare a paper proof" → choose 9-up or 4-up → click print. Unless the operator has served *this exact page* over HTTPS (or a private LAN address for a marked test), manually tried the page on a **different phone**, and checked the operator attestation, the printed proof carries **no scannable QR**. The browser cannot certify the check independently. On a real printed photo-paper sample, test cut alignment and scanning before any distribution.

**Privacy:** QR URLs contain a stable public project slug and one of three fixed options, never user text. The optional typed note remains unsent in memory until erased or downloaded deliberately. Enter no contact details, addresses or sensitive needs. This page is not a secure intake system.

**Tests:** `node --test core.test.mjs`.

**Full provenance, hard boundaries and physical-field protocol:** [STACK² 028 design](../../docs/STACK-SQUARED-028-FIRST-CONTACT-FIELD.md).

Only the QR library is vendored, using webZ's pinned MIT-licensed QRCode.js. The original copyright notice is in [vendor/LICENSE.qrcodejs.txt](./vendor/LICENSE.qrcodejs.txt).

**SCANNED ≠ CONSENTED · SAVED ≠ SENT · LOCAL DRAFT ≠ LIVE HELP CASE · CI ≠ PHYSICAL TEST.**
