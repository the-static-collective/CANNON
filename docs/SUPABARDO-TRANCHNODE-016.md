# CANNON 016 — SupaBardo is the world between worlds

**Stacked on 015. Original SupaBardo semantics are owned by Human-Witness, not CANNON.**

Human-Witness architecture source: commit `6c30bae1896db52bdb387d25b9ee577e0542e055`, `docs/superpowers/specs/2026-08-25-supabardo-crossing-field-design.md` — *Store the crossing, not the canon.*

Historical independent evidence source: `reLATTE` experiment `supabardo-independent-verifier-001`, pinned commit `65294f135260ee48b38829f698598dfe3478b0e7`. Its standard-library Python verifier validates domain-separated SHA-256 IDs, original signed P-256 crossing and receipt witnesses, disjoint signing identities, evidence sets, and bounded **SB-001 ADMIT**, **SB-002 HOLD**, **SB-003 FRESH_LOCAL_ADMIT** outcomes. SB-003's independent frozen archive is not falsely equated with the deleted live occurrence.

Modern TranchNode source: `feat/immutable-artifact-store-issue-6` commit `7fbb0c868befd5f6a7478bdd0447477a0e8e075e`. Original `FilesystemArtifactStore` stores and rereads frozen public fixture bytes, checks hashes on every get, confirms a repeated put is idempotent.

Project0 original continuity source: commit `08f892eb379ef538cce5b3ca081ecf683b448a4b`. The original continuity inspect/address functions distinguish recovered custody and preserved protocol from unresolved human identity and untransferred authority.

## Exact executable sequence

1. Independently read/verify original Human-Witness SupaBardo spec, original reLATTE Python proof module, original TranchNode store and Project0 continuity from exact pinned Git objects.
2. Copy exactly 22 **public frozen proof files** for SB-001, SB-002 and SB-003 into a disposable directory. Original independent Python verifier must validate their signatures and legal local outcomes.
3. Put all 22 exact original bytes through native TranchNode local CAS; confirm a second put of each creates no duplicate.
4. Delete the entire disposable staging directory, including all copied fixture files.
5. Reconstruct the 22 files **only from TranchNode CAS** into a different directory, with native read-time hash checks. Do not reuse the original source checkout to rebuild.
6. Re-run the **original independent Python verifier** against reconstructed bytes; require exactly the same three outcomes and evidence-set identities.
7. Copy those restored bytes into a deliberately corrupted adversarial fixture, mutate the signed SB-003 EXIT signature and require original Python verification refusal; delete adversarial area.
8. Build a genuine Project0 typed continuity witness. Preserved: custody and protocol. Transformed: archived narrative/story. Unresolved: identity and authority. It has zero portable authority effect and requires independent external admission.
9. Cold replay source pins, TranchNode reads and independent Python semantics. Upload only the public fixture manifest and bounded report.

## What this does not claim

Historical SB-001 and SB-002 already demonstrated real temporary Supabase schemas, bounded OPEN→EXIT, verified independent destination choice, and schema destruction. **CANNON 016 does not re-run, restore, unpause, or destroy any live Supabase project or schema.** It destroys only a newly created disposable fixture staging directory. Likewise, it does not delete a real predecessor's private signing key; that is a different SB-003 experimental witness. All historical claims retain their original source references and exact occurrence limitations.

No existing TranchNode repository is modified; no user content is read; no actual private song, personal file, Supabase credential, realtime channel or legal human act is examined. The original GitHub project may remain entirely paused/offline. This is a test of archive portability of *public signed historical proof fixtures*, not a live distributed crossing.

CANNON 015 continues to provide a separate **PRIVATE, owner-provided local archive import** path and deliberately does not publish archive contents or hashes to WEBZ. CANNON 016 must never permit a public proof fixture key to stand in for permission to publish a private legacy archive.

## Next potential interface (not implemented here)

SupaBardo could become the *nonfinal waiting state* between the CANNON 015 private asset-stewardship pipeline and an Abundent owner review. It would need explicit local consent, a recipient-world disposition, a bounded retention/deletion policy, a private-channel/RLS security proof if live Supabase is used, and no persistent SupaBardo organ. The public webZ /lineage page stays only a source-code archeology index until an authorized published artifact exists.

**OPEN != ADMITTED. EXIT != KEEP. TRANSIENT DEATH != HISTORY DEATH. ARK != INHERITED ADMISSION. PRIVATE CUSTODY != PUBLICATION.**
