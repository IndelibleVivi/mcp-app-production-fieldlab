<!-- docs-pair: package-loopback-runbook; locale: en; mirror: docs/runbooks/package-and-loopback.md -->

# Package and loopback runtime runbook

[简体中文](./package-and-loopback.md)

This runbook covers ordinary local work only: source/process verification, clean runtime packaging, and isolated loopback readback. It does not install or activate a production service, start a tunnel, touch an account, publish a remote, or create named-host/owner evidence.

## Preconditions

- Node.js satisfies `package.json` engines.
- Dependencies were installed from the exact lockfile with `npm ci`.
- Intended files are committed and `git status --short` is empty; the resource/host receipts must then be generated fresh on that exact clean revision.
- The output path is ignored, specific to this run, and does not already exist.
- Playwright Chromium is installed only if the browser lane is in scope.

Do not use a workspace root, home directory, unresolved environment variable, or broad glob as an output target.

## 1. Establish source/process evidence

```bash
git status --short --branch
npm run check
npm run test:host
```

Both commands are package prerequisites rather than optional adjacent checks:

- the final `test:mcp` stage of `npm run check` writes `tmp/receipts/mcp-resource-roundtrip.json`;
- `npm run test:host` uses `scripts/run-host-evidence.ts` to consume the Playwright JSON report closure. It writes `tmp/receipts/mcp-host-profile-matrix.json` only after exactly five canonical tests each pass once, with zero skipped/unexpected/flaky/report errors, and the resource prerequisite receipt passes receipt-set validation. There is no standalone successful writer path.

Both receipts must be `verified`, with `method_rung` exactly reaching their scenario claim rung `process`, carry the same `subject.source_revision`, `subject.source_dirty: false`, and exact resource identity, and include their respective `resource:sha256:<subject.resource.sha256>` evidence reference. They remain ignored/local-only. Do not continue to package if the selected source revision is dirty, a receipt is stale/missing, or a required check fails.

## 2. Create a clean candidate

Choose a new ignored output path:

```bash
npm run package:runtime -- --out=runtime-candidates/fieldlab-review
```

The packager must:

1. refuse dirty source;
2. refuse an existing output path;
3. resolve the current committed revision;
4. build in a detached clean worktree using the pinned lockfile;
5. copy only the runtime roots declared by the package contract;
6. include the candidate's own exact scenario JSON authority under `scenarios/`;
7. include the canonical SUL terms, documentation notice, and path map carried by the source revision;
8. read the resource/host receipts from the local-only receipt directory and confirm they bind the exact clean revision;
9. use the staged candidate's own complete scenario set and compiled validators to validate the scenario graph, both prerequisite receipts, and the new `package.clean-revision@1` receipt;
10. calculate sorted per-file byte counts/SHA-256 values and one bundle digest, then write `release.json` with `sourceDirty: false`;
11. atomically adopt the completed candidate path and then atomically write the package receipt to `tmp/receipts/package.clean-revision@1.json`.

If any condition fails, retain the error and classify it at the artifact boundary. Do not copy compiled output from the developer checkout or edit the candidate in place.

## 3. Inspect artifact identity

The candidate must contain `release.json`. Inspect it without changing it:

```bash
node --input-type=module -e '
  import { readFile } from "node:fs/promises";
  const path = "runtime-candidates/fieldlab-review/release.json";
  const release = JSON.parse(await readFile(path, "utf8"));
  console.log({
    format: release.format,
    sourceRevision: release.sourceRevision,
    sourceDirty: release.sourceDirty,
    bundleDigest: release.bundleDigest,
    fileCount: release.files?.length
  });
'
```

Expected identity shape:

- `format`: `mcp-app-fieldlab-runtime@1`
- `sourceRevision`: exact 40-character commit id
- `sourceDirty`: `false`
- `bundleDigest`: `sha256:<64 hex>`
- non-empty, unique, safe relative file entries with exact byte/SHA-256 identities
- `LICENSE`, `LICENSE-DOCUMENTATION.md`, `LICENSING.md`, and `scenarios/` in the exact file closure
- `tmp/receipts/package.clean-revision@1.json` exists, joins both verified process receipts by `source_revision`, and binds `release.json` by `bundle_digest`

This proves that a candidate artifact exists; it does not prove that the candidate executes.

## 4. Run isolated readback

```bash
npm run smoke:runtime -- --candidate=runtime-candidates/fieldlab-review
```

The smoke must use a fresh temporary projection and unused loopback port, install production dependencies there, start the candidate rather than developer output, and then verify:

- exact candidate-file and manifest byte/digest identities;
- `/healthz` reports the expected source revision, bundle digest, and file count;
- a fresh MCP initialize reports the exact server version from the packaged `package.json` authority, and list/call succeeds;
- the exact versioned resource is listed/read and its MIME/bytes reproduce the specimen contract;
- resource, host, and package receipts are read from the repository's local-only receipt directory;
- the candidate runtime uses its own complete `scenarios/` and compiled receipt policy to validate the four-receipt set after adding `runtime.isolated-readback@1`, rather than reading authority from the developer checkout;
- the validator joins the runtime receipt against its complete transitive prerequisite closure: exact source revision plus bundle digest with package, and exact source revision plus resource (URI/MIME/bytes/SHA-256) with resource/host ancestors; even though package omits resource, the process ancestors constrain the runtime resource;
- the child stops successfully, the temporary runtime projection is cleaned up successfully, and the candidate remains unchanged; the runtime receipt is persisted only after all teardown conditions hold.

The resulting claim is limited to the exact isolated candidate/process. It does not establish operator service installation, production selection, container/image activation, tunnel association, named-host admission, or owner acceptance.

## 5. Preserve bounded evidence

Keep raw receipts, temporary installs, runtime candidates, Playwright output, and screenshots in ignored/local-only paths. A receipt should record scenario revision, source revision, bundle identity, resource identity, environment, exact observations, evidence references, limitations, and non-empty `not_proven`.

| Scenario receipt                | Path                                            |
| ------------------------------- | ----------------------------------------------- |
| `mcp-app.resource-roundtrip@1`  | `tmp/receipts/mcp-resource-roundtrip.json`      |
| `mcp-app.host-profile-matrix@1` | `tmp/receipts/mcp-host-profile-matrix.json`     |
| `package.clean-revision@1`      | `tmp/receipts/package.clean-revision@1.json`    |
| `runtime.isolated-readback@1`   | `tmp/receipts/runtime.isolated-readback@1.json` |

Every attempted receipt carrying `subject.resource` must also carry the exact `resource:sha256:<subject.resource.sha256>` evidence reference. For every attempted dependent, the validator collects its complete transitive prerequisite closure, requires every ancestor to be `verified`, and compares `source_revision`, exact `resource`, `bundle_digest`, and `runtime_identity` wherever each ancestor/dependent pair carries them. Package therefore compares clean source revision with its resource/host ancestors. Runtime compares source revision plus bundle digest with package and source revision plus complete resource identity with the transitive resource/host ancestors.

Public CI neither uploads nor shares these raw receipts across jobs. The `clean-package-runtime` job must therefore rerun `npm run check`, `npm run test:host`, package, and smoke sequentially in the same clean checkout/job. Workflow source does not prove a remote run occurred; remote CI execution remains `not_verified`.

If a sanitized receipt is later prepared for sharing, it must exclude credentials, private URLs, account identifiers, and raw host/owner material. Sanitization does not turn derived evidence into independent reproduction.

## Failure routing

| Observation                                                             | Classify at                 | Do not claim                  |
| ----------------------------------------------------------------------- | --------------------------- | ----------------------------- |
| Type/build/unit/docs-policy failure                                     | source/build                | package or runtime status     |
| Tool/resource discovery or readback mismatch                            | local MCP process           | browser/host or deployment    |
| Iframe/bridge/capability/network failure                                | declared local-host harness | ChatGPT/named-host behavior   |
| Dirty/stale prerequisite receipt, scenario closure, or manifest failure | clean artifact              | runtime activation            |
| Candidate starts but health/MCP/receipt mismatches                      | isolated runtime            | operator production selection |
| Child stop or temporary runtime cleanup fails                           | isolated runtime            | persisted runtime receipt     |

After two failed repairs against the same apparent surface, re-check whether the failure actually belongs to route, resource admission, asset plane, bridge, capability, package identity, scenario authority, or runtime identity before changing more code.
