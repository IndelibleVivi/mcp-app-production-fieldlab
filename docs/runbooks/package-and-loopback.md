# Package and loopback runtime runbook

This runbook covers ordinary local work only: source/process verification, clean runtime packaging and an isolated loopback readback. It does not install or activate a production service, start a tunnel, touch an account, publish a remote, or create named-host/owner evidence.

## Preconditions

- Node.js satisfies `package.json` engines.
- Dependencies were installed from the exact lockfile with `npm ci`.
- Intended files are committed; `git status --short` is empty.
- The output path is ignored, specific to this run, and does not already exist.
- Playwright Chromium is installed only if the browser lane will run.

Do not use a workspace root, home directory, unresolved environment variable or broad glob as an output target.

## 1. Establish source/process evidence

```bash
git status --short --branch
npm run check

# If browser-host behavior is in scope:
npm run test:host
```

`npm run check` has a process ceiling; `test:host` remains a local declared-host ceiling. Do not continue to package if the selected source revision is dirty or these required checks are failing.

## 2. Create a clean candidate

Choose a new ignored output path:

```bash
npm run package:runtime -- --out=runtime-candidates/fieldlab-v0.1.0
```

The packager must:

1. refuse dirty source;
2. refuse an existing output path;
3. resolve the current committed revision;
4. build from a detached clean worktree using the pinned lockfile;
5. copy only the runtime roots declared by the package contract;
6. include the canonical SUL terms, documentation notice, and path map carried
   by the source revision;
7. calculate sorted per-file byte counts/SHA-256 values and one bundle digest;
8. write `release.json` with `sourceDirty: false`;
9. adopt the completed candidate atomically.

If any condition fails, retain the error and classify it at the artifact boundary. Do not copy compiled output from the developer checkout or edit the candidate in place.

## 3. Inspect artifact identity

The candidate must contain `release.json`. Inspect it without changing it:

```bash
node --input-type=module -e '
  import { readFile } from "node:fs/promises";
  const path = "runtime-candidates/fieldlab-v0.1.0/release.json";
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
- `LICENSE`, `LICENSE-DOCUMENTATION.md`, and `LICENSING.md` included in the
  exact file closure

This proves a candidate artifact exists; it does not prove the candidate executes.

## 4. Run isolated readback

```bash
npm run smoke:runtime -- --candidate=runtime-candidates/fieldlab-v0.1.0
```

The smoke must use a fresh temporary projection and unused loopback port, install production dependencies there, start the candidate rather than developer output, then verify:

- `/healthz` reports the expected source revision, bundle digest and file count;
- a fresh MCP initialize/list/call succeeds;
- the exact versioned resource is listed and read;
- resource MIME/bytes reproduce the specimen contract;
- the temporary process is stopped and the candidate remains unchanged.

The resulting claim is limited to the exact isolated candidate/process. It does not establish operator service installation, production selection, container/image activation, tunnel association, named-host admission or owner acceptance.

## 5. Preserve bounded evidence

Keep raw receipts, temporary installs, runtime candidates, Playwright output and screenshots in ignored/local-only paths. A receipt should record the scenario revision, source revision, bundle identity, resource identity, environment, exact observations, limitations and non-empty `not_proven`.

If a sanitized receipt is later prepared for sharing, it must exclude credentials, private URLs, account identifiers and raw host/owner material. Sanitization does not turn derived evidence into independent reproduction.

## Failure routing

| Observation                                         | Classify at                 | Do not claim                  |
| --------------------------------------------------- | --------------------------- | ----------------------------- |
| Type/build/unit failure                             | source/build                | package or runtime status     |
| Tool/resource discovery or readback mismatch        | local MCP process           | browser/host or deployment    |
| Iframe/bridge/capability/network failure            | declared local-host harness | ChatGPT/named-host behavior   |
| dirty-source or manifest failure                    | clean artifact              | runtime activation            |
| candidate starts but health/MCP identity mismatches | isolated runtime            | operator production selection |

After two failed repairs against the same apparent surface, re-check whether the failure actually belongs to route, resource admission, asset plane, bridge, capability, package identity or runtime identity before changing more code.
