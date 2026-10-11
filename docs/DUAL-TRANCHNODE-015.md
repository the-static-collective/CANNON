# Two TranchNodes, two different jobs — CANNON 015

Stacked experiment on CANNON 014, **not** a release or a merge. Original repositories remain unchanged.

## Historical identification

- **tranchNode-v1**: `the-static-collective/tranchNode-v1` at exact main commit `c1ab651e55f85d9f13551c89c1de39097d6b16a4`. Historical offline-first Autodiscography / digital porch application. It includes Codex albums/branching ideas/porch nodes, Song and SongAnnotation records, and a Supabase-backed transient SeedPacket feature. The original README uses the word immutable, but the implementation has updateable local JSON fallback and editable data: do **not** treat that local JSON as a write-once verifiable artifact store. The original README is not independent authentication of stored records or user identity.
- **TranchNode**: `the-static-collective/tranchnode` on existing feature branch `feat/immutable-artifact-store-issue-6` at commit `7fbb0c868befd5f6a7478bdd0447477a0e8e075e`. The actual native FilesystemArtifactStore stores exact SHA256-addressed bytes once and checks digests when reading them back.
- **Project0**: original continuity lane grammar `p0.continuity/0.1` at commit `08f892eb379ef538cce5b3ca081ecf683b448a4b`. Authoritative determination stays independent.
- **reLATTE R14**: original signed receiver at commit `dcc8cdca84c440aa4294134f020fb7095bf87f24`.

## What is implemented

CANNON reads and Git-object-verifies the original `src/types.ts`, `src/lib/autodiscographyHive.ts`, and `src/data.ts` historical sources without launching the old app or copying its source content to the public proof. It confirms that the original types declare songs, annotations, Codex/porch nodes, and that hive source includes `validatePacket` and all four TAO labels.

An operator can supply a **local** private JSON export using `cannon.tranchnode-v1-local-export/v0`: bounded `codex.albums`, `codex.branching_ideas`, `codex.porch_nodes`, songs, annotations, and seed observations. This is a *new, explicit CANNON import vocabulary*, not a claim that the old app already exported that exact schema. All songs and the archive must be PRIVATE. An annotation without an existing song, duplicate ID, oversized value, or an unrecognized disclosure mode is rejected. Real private material remains available only on the operator's machine; no API access or credentials are requested.

Original TranchNode's immutable store takes the exact original JSON file bytes. A second put of the same bytes must return `created:false`; cold replay verifies those same bytes. No normalized-title/lyrics deduplication stands in for exact-byte identity. Project0's genuine continuity functions record original schema as preserved, custody as transformed, and historical story, identity and authority as unresolved. No new identity or permission is inferred.

Native reLATTE R14 packages a **locally held** opaque organ request containing provenance/custody metadata and private content hash, but **not** the private material. It produces signed RECEIVED and R3_HOLD and stores the result in the private local output directory. This metadata is **not** public; even content hashes can fingerprint private material.

An independent `webz.tranchnode-lineage-source-index/v0` public-code index is generated with only Git source pins and abstract field names/TAO modes, without content hashes, actual collection sizes, texts, filenames, or claims of access. This public index can be safely inspected as a draft public *capability map*, not a published private archive.

## Pilot commands

Requires Node >=24 and the exact pinned repository checkouts, with original Project0 built and original TranchNode/reLATTE local dependencies installed. Supply `roots.json` mapping repo names to exact local Git folders.

```bash
node scripts/tranchnode-dual-015.mjs inspect roots.json /path/to/explicit-local-export.json
node scripts/tranchnode-dual-015.mjs run roots.json /path/to/explicit-local-export.json /path/to/new-private-output
node scripts/tranchnode-dual-015.mjs verify roots.json /path/to/explicit-local-export.json /path/to/new-private-output
```

CI uses ONLY `fixtures/synthetic-legacy-autodisco-015.json`, containing invented text, and runs real native TranchNode stores and local reLATTE signatures. No actual archive, Suno account, Supabase tenant, or client browser is queried. Only the generic source-code index is uploaded by CI.

## Boundaries

- An original public repository is **not** proof that every app datum belongs on a public website.
- A historical schema is **not** proof of record authorship, accuracy, creation date, or completeness.
- A song checksum normalized by title/lyrics is **not** an immutable source-blob address. Many different byte histories can share a normalized song key.
- Private custody can be **materialized** without requiring public publication or execution.
- An old foreign-seed packet is **not** a license to share its content, even when tagged OBSERVED.
- Public WEBZ code index **does not** claim any real owner collection was imported.
- The real GHoT code and worker are **not** invoked in this step; their previous CANNON 014 experiment remains separate.

**HISTORICAL APP != IMMUTABLE STORE. SOURCE STRUCTURE != SOURCE TRUTH. PRIVATE CUSTODY != PUBLIC RELEASE. RECONSTITUTION != RESTORATION OF AUTHORITY.**
