# CIRCULATION-003 — The human field gate (source-first, HOLD-only)

**22 October 2026 · preparatory branch · DRAFT/HOLD.** Prepared for potential independent use at the October 24, 2026 Greater Mankato Coalition of Care co-design gathering. No partner affiliation, sponsor endorsement, conversation outcome, or live system is asserted.

## Problem and invariant

CIRCULATION-001 proved fictional circulation through CANNON, native Free Graph and planZ. CIRCULATION-002 added a first source-native BananaSpork receiver, still using simulated human choices. **CIRCULATION-003 prepares a strictly bounded way to carry an actual human-permitted public question into later work, without pretending the permission is proven by a browser checkbox.**

The project's real beginning is a voluntary **encounter**, not an identity system:

1. Card freely offered. Participation declined? Nothing collected.
2. Conversation occurs. No names, private stories, contacts, addresses or affiliations captured in this tool.
3. The question's actual speaker/authorship is established *in the human interaction*; specific final **public-safe wording** is reviewed together and explicitly permitted.
4. An operator **self-attests** this permission in the offline webZ question press; the software *cannot verify that attestation.*
5. An optional exported `circulation.field-question/v0` candidate remains `UNPUBLISHED_CANDIDATE`, with no recipient or required action. No automatic contact, Help Slip, Campfire, publication or archival enrollment.
6. CANNON's separate `field_gate.py` rechecks the serialized packet and creates an immutable, exact-content-addressed **`HOLD_UNPUBLISHED`** receipt. It records only that validation ran, not that a real human was met.
7. A future source-owner reviewer decides whether the public question is lawful to retain. Only after that does another receiving world get a separate right to consider an invitation, **never automatic admission**.

**No trusted signature or authenticated statement is present in CIRCULATION-003.** A valid hash proves only consistency of submitted candidate bytes. If an operator lies in a checked box, software cannot cure that.

## Packet contract

The source-owner's [webZ PR #71](https://github.com/the-static-collective/webZ/pull/71) authors a human-facing, offline static HTML/JS page. `packet.mjs` computes `sha256(CIRCULATION-003-FIELD-QUESTION| + canonical(sorted-keys JSON body))` and refuses unauthorized fields.

The CANNON code owns its own independent Python validator in `labs/circulation-003/field_gate.py`. It validates the complete exact field set, the fixed date/event ID, public question length/shape, self-attestation labels and all false authority flags, then independently recomputes SHA-256. It does **not** import the JS source module at runtime.

The generated hold packet `cannon.circulation-field-hold/v0` has an independent domain-separated hash, exact original source packet ID, no human attestation, no recipient admission, no real-world service, no rights grants and next gate `HUMAN_PRIVACY_AND_SOURCE_PERMISSION_REVIEW_THEN_SEPARATE_RECEIVER_CHOICE`.

No `fulfillment-envelope/v0`, Free Graph `constitutes`, planner job or automatic BananaSpork receiver input is created. There is no subscriber list, payment, location data, remote logging or online submission.

## CI and replay

The CANNON workflow pins **the exact webZ field page source** and executes its `prepareFieldQuestion` in Node with a strictly fictional witness statement. It uses a **different language** to validate that exact emitted packet and issue/verify a source-native HOLD. Five Python adversarial tests cover changed bytes, fake affiliation, false consent labels, private contact shapes, output overwrite, and altered hold state.

```sh
python labs/circulation-003/field_gate.py validate fictional-question.json
python labs/circulation-003/field_gate.py hold fictional-question.json --output source-hold.json
python labs/circulation-003/field_gate.py verify-hold fictional-question.json --output source-hold.json
```

The CLI cannot create actual permission, and source packet files should never be automatically uploaded to GitHub, published on Abundent or converted into receiving-project commands. The rehearsal uses only fictional inputs.

## Paper-first, October 24 acceptance

[webZ field-kit route](https://github.com/the-static-collective/webZ/pull/71): eight questions (OFFER, NEED, BUILD, QUESTION repeated) on one 8×10 sheet, readable and independently usable on physical paper. The browser's only optional side work is locally preparing a **single public-safe question** after separate permission and privacy attestation.

A successful meeting can end with **zero** digital records if that is what people choose. Up to three willing conversations are a useful target, not a quota. Before a future 004 genuine receiving-world route, demand source-human explicit permission, independent receiving-owner choice and an actual safe retention/withdrawal procedure.

**A CARD ≠ CONTACT DATA. A CONVERSATION ≠ PERMISSION TO PUBLISH. A HASH ≠ AN ATTESTATION. A HOLD ≠ AN ADOPTION.**
