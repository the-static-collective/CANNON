# KINSHIP BRIDGE 007 — The Signal Has Relatives

**Development specimen / HOLD.** No Kinship permission, Africa partner, station financial documents, music rights, app-store country availability, stream operation in Africa, or real listener numbers have been supplied. Do not describe this as a station partnership or campaign. The web presence verifies that Kinship operates an app; worldwide availability and data affordability remain unanswered.

## What 007 does today
CANNON 007 builds on 006: an *offline* adapter for owner-supplied, non-personal cash aggregates; three independently sourced, unranked hypotheses for exploring Kinship listening in Ghana (GH), Kenya (KE), and Uganda (UG); a fail-closed readiness checklist; source-pinned CANNON document composition; deterministic 006 economic counterfactuals; and cold replay.

### Discovery hypothesis: human connection before market sizing
1. Confirm by testing with volunteer local collaborators whether Play/App Store installation actually works in the country; do not mistake a US store listing for global installability.
2. Verify at least two real listening sessions on ordinary local devices/networks with consent. Investigate data usage, bitrate, latency, dropout, and audience costs; no stream URL rehosting.
3. Ask a locally based, willing collaborator whether the English-language format is actually useful. Let that person propose alternative time, formats and languages without demanding a new identity, claiming Christian community representation, or appropriating their story.
4. Ask Kinship and its streaming vendor about distribution regions, stream concurrency, licensing and podcast/music redistribution before sharing/republishing clips; online streaming ≠ licensed rebroadcast or reuse.
5. Any creative asset, localized text, introduction, community audio postcard, translated transcript or on-air use requires exact rights, individual consent and Kinship editorial permission; protect children and third parties.
6. Record privacy-acceptable aggregate **sessions**, not unique people, installs, believers, donors or conversions. Unknown data remains unknown. Privacy review precedes even aggregates.
7. Evaluate genuine traction and costs before a second country. African-based partners own their opt-in participation; they are not ranked as marketing targets.

**Africa is not one market.** GH/KE/UG are provisional **unranked exploration candidates**, not a determined audience or automatically selected launch location. The actual first pilot place should follow a trusted, willing local relationship.

### Public channel facts
- https://kinshipradio.org/main/ confirms official Android/iOS app claim.
- https://play.google.com/store/apps/details?id=com.onseeker.kinshipradio lists Invubu as developer. Listing download counts are global lifetime indicators, **not country-specific listeners**.
- https://apps.apple.com/au/app/kinship-radio/id708391233
- GSMA Mobile Economy Africa 2026: https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-economy/africa/ — affordability/access barriers argue for measuring data cost and avoiding autoplay.
- https://kinshipradio.org/main/giving links to Kinship's own giving. Never substitute a new payment endpoint.

### Finance adapter
There are two explicitly different input modes:
- **LAB_SYNTHETIC** (included fixture): zero identities, no signature, hypothetical cash. The output is safe to run in public CI.
- **OWNER_CLAIMED_AGGREGATE**: strictly three aggregate unrestricted cash fields in integer cents, no personal donor files. Requires a detached Ed25519 signature over the canonical snapshot + all readiness data and an *independently supplied* public-key pin. Matching signatures prove only that the claim was signed by the pinned key — NOT that the key belongs to Kinship, figures are audited, or the signer can authorize publication or outreach. No station records available as of 007.

Treat real owner-local files as confidential. Create them only on an authorized station-controlled machine. Never commit or upload them to GitHub, chat, or unapproved services. CLI will refuse exporting non-lab data without explicit \`--privacy local-only-confirmed\`. The output is mode 0700/files 0600. These permissions do not establish network or device security.

Generate a detached signature in an authorized offline workflow only. Signing message is UTF-8 \`cannon.kinship-bridge-007/v0\n\` followed by recursively key-sorted JSON of the input **without** its \`authorization\` object. A valid pin JSON has fields \`schema:"cannon.kinship-external-pin/v0"\`, \`key_id\`, and \`public_key_pem\`. Do not commit a station public pin to an experimental public repository without station consent. Key ownership requires out-of-band vetting.

No CANNON 007 output declares financial surplus real; projection relies on editable 006 hypothetical *future* events even if historical cash inputs were owner-provided. The owner cannot gain signature authority by editing a field or presenting a source manifest.

### Local commands (Node 24+, Git)

Pin checkout roots in local untracked \`work/roots-006.json\` following [006](KINSHIP-SURPLUS-006.md). These must contain the exact original commits specified in \`examples/kinship-surplus-006.plan.json\`:

\`\`\`sh
npm test
node scripts/cannon-bridge.mjs inspect --plan examples/kinship-surplus-006.plan.json --roots work/roots-006.json --scenario examples/kinship-surplus-006.station.json --input examples/kinship-bridge-007.lab.json
node scripts/cannon-bridge.mjs build --plan examples/kinship-surplus-006.plan.json --roots work/roots-006.json --scenario examples/kinship-surplus-006.station.json --input examples/kinship-bridge-007.lab.json --out work/kinship-bridge-007
node scripts/cannon-bridge.mjs verify --plan examples/kinship-surplus-006.plan.json --roots work/roots-006.json --scenario examples/kinship-surplus-006.station.json --input examples/kinship-bridge-007.lab.json --out work/kinship-bridge-007
\`\`\`

For a separately authorized owner-provided snapshot, additionally supply \`--pin /secure/path/public-pin.json\` and for local output \`--privacy local-only-confirmed\`. CLI prints only the hold status, country checklist and receipt hash during inspection.

### Acceptance gates
- No private/identifying, source-platform-donor, IP/device, or person-level field can enter a v0 aggregate contract.
- Invalid signer, absent external pin, altered cash amount, key substitution and forged signed approvals fail closed.
- No store availability, streams, media rights, local partners, local translations or station authorizations are inferred from an app's existence.
- Missing and blocked evidence remain distinct. All-passed only means *review-ready, not launch-authorized*.
- Economic simulation never equates listener sessions, media witnesses, shares, pledges, volunteer labor or installations with unrestricted received cash.
- Exact three-repository Git source composition and cold replay of outputs.
- No live stream, device probes, emails, messages, location targeting, advertising, payments, rights grants, station CRM, donor data or real reLATTE crossing.

**INVITATION != PARTNERSHIP. APP LISTING != GLOBAL AVAILABILITY. STREAM != RIGHTS. DOWNLOAD != LISTEN. SESSIONS != PEOPLE. LISTENERS != REVENUE. SIGNATURE != STATION AUTHORITY.**
