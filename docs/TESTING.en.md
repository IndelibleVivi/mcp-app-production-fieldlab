<!-- docs-pair: testing; locale: en; mirror: docs/TESTING.md -->

# Testing and evidence topology

[简体中文](./TESTING.md)

Field Lab testing does not pursue one undifferentiated green badge. It localizes failures to the correct boundary and prevents lower-level evidence from promoting a higher-level claim. Source, process, browser host, clean artifact, running candidate, remote CI, tunnel, named host, and owner each have their own observation contract.

## Local prerequisites

- Node.js `>=22.23.1`
- the exact `package-lock.json`
- Playwright Chromium (required only for `test:host`)
- a clean committed Git revision and a new ignored output path for the package lane

```bash
npm ci

# One-time browser download; this network action is separate from the tests.
npx playwright install chromium
```

Local test execution requires no private credential, public origin, tunnel, or named-host account.

## Command matrix

| Command                                               | Surface                                                                                                   | Maximum local claim                                            | Not proved                                                    |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| `npm run validate:register`                           | Field Guide pin, profile selection, publication/license state, and package version                        | source                                                         | Profile correctness beyond pinned authority; publication      |
| `npm run validate:licensing`                          | Canonical SUL text, CC notice, path map, first-public boundary, and package metadata                      | source                                                         | Rights ownership beyond repository evidence; legal compliance |
| `npm run validate:docs`                               | Paired paths, metadata, language switches, and registered shared facts                                    | source                                                         | Full semantic translation equivalence                         |
| `npm run validate:schemas`                            | Generated schema matches source schema                                                                    | source                                                         | Runtime serialization by itself                               |
| `npm run validate:scenarios`                          | Scenario structure, policy mapping, prerequisite graph/ceilings, authorization/runner invariants          | source                                                         | Scenario execution                                            |
| `npm run typecheck`                                   | TypeScript contracts                                                                                      | source                                                         | Built or runtime behavior                                     |
| `npm run test`                                        | Deterministic unit, policy, receipt, and identity contracts                                               | source/process only where a test starts an exact local process | Browser host, package, tunnel, or named host                  |
| `npm run build`                                       | Production server/view artifacts and self-contained manifest closure                                      | artifact shape from current checkout                           | Clean revision, MCP readback, or host mount                   |
| `npm run test:mcp`                                    | Fresh MCP process, exact `resources/read`, and resource receipt                                           | process                                                        | Browser sandbox, clean package, tunnel, or named host         |
| `npm run check`                                       | Source/process rows above; writes `mcp-resource-roundtrip.json`                                           | process                                                        | `test:host` and every later rung                              |
| `npm run test:host`                                   | Exact five-test Playwright JSON closure; writes host-profile receipt                                      | process                                                        | ChatGPT/named-host behavior, tunnel, or owner acceptance      |
| `npm run package:runtime -- --out=<new-ignored-path>` | Requires clean resource/host receipts; validates candidate-owned prerequisite set; writes package receipt | artifact                                                       | Candidate execution or production selection                   |
| `npm run smoke:runtime -- --candidate=<path>`         | Isolated health/MCP/resource readback and four-receipt chain                                              | activated-runtime for that exact isolated process              | Operator service selection, tunnel, named host, or owner      |

Runbooks, scenario JSON, workflow source, and generated schemas are contracts, not receipts proving that a run occurred.

## Scenario registry and semantic policy

`src/evidence/policy.ts` is the single authority for boundary/surface/environment/rung/authorization/runner relationships. Scenario-set validation checks exact `id@revision` uniqueness, prerequisite existence, cycles, ceiling inversions, and legal runner combinations. Receipt validation then checks the exact scenario against environment, status, rung, observations, evidence references, and subject identities.

| Scenario                               | Boundary                  | Runner / authorization               | Proof ceiling                                | Always remains outside                                   |
| -------------------------------------- | ------------------------- | ------------------------------------ | -------------------------------------------- | -------------------------------------------------------- |
| `mcp-app.resource-roundtrip@1`         | resource admission        | `npm run test:mcp` / ordinary local  | process                                      | clean package, tunnel, named host, owner                 |
| `mcp-app.host-profile-matrix@1`        | optional host capability  | `npm run test:host` / ordinary local | process                                      | ChatGPT policy/cache, tunnel, named host, owner          |
| `package.clean-revision@1`             | artifact/runtime identity | package command / ordinary local     | artifact                                     | running candidate, production selection, host            |
| `runtime.isolated-readback@1`          | artifact/runtime identity | runtime smoke / ordinary local       | activated-runtime for exact isolated process | operator service selection, tunnel, host, owner          |
| `tunnel.configured-target-authority@1` | tunnel target             | no runner / external side effect     | activated-runtime                            | tunnel activation, named-host discovery/admission, owner |
| `named-host.acceptance@1`              | named-host acceptance     | no runner / external side effect     | named-host                                   | other hosts/future behavior, owner acceptance            |
| `owner.acceptance@1`                   | owner interaction         | no runner / owner only               | owner                                        | later revision or another host                           |

The last three scenarios deliberately retain `runner: null`. An agent must not turn their presence into authorization to access credentials, restart a service, deploy, create a host conversation, or claim owner judgment. A `not_verified` receipt need not fabricate an external identity that does not yet exist. Once status is an attempted `verified` or `failed`, the receipt must carry real observations/evidence references and the subject identities required at that rung. A `verified` receipt's `method_rung` must exactly equal the scenario's declared claim rung / `proof_ceiling`; evidence one rung below cannot fill that gap with verified status.

## Receipt chain and joins

The current four-receipt chain is written entirely to ignored/local-only paths. Every attempted dependent receipt requires every receipt in its complete transitive prerequisite closure to exist with status `verified`:

| Scenario receipt                | Writer command               | Local-only path                                 | Direct prerequisites                                                        |
| ------------------------------- | ---------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| `mcp-app.resource-roundtrip@1`  | `npm run check` → `test:mcp` | `tmp/receipts/mcp-resource-roundtrip.json`      | none                                                                        |
| `mcp-app.host-profile-matrix@1` | `npm run test:host`          | `tmp/receipts/mcp-host-profile-matrix.json`     | `mcp-app.resource-roundtrip@1`                                              |
| `package.clean-revision@1`      | `npm run package:runtime`    | `tmp/receipts/package.clean-revision@1.json`    | resource roundtrip + host profile matrix                                    |
| `runtime.isolated-readback@1`   | `npm run smoke:runtime`      | `tmp/receipts/runtime.isolated-readback@1.json` | package receipt; validator also reads the prior three as a four-receipt set |

For every attempted dependent, the validator collects the complete transitive ancestor closure and compares every ancestor receipt with the dependent. Join fields are `source_revision`, exact `resource`, `bundle_digest`, and `runtime_identity`; for each ancestor/dependent pair, every field carried by both is compared. Exact resource identity comprises URI, MIME, bytes, and SHA-256. Every attempted receipt carrying a resource must also include a `resource:sha256:<subject.resource.sha256>` evidence reference. In the current graph, package joins its resource/host ancestors by clean source revision. Runtime joins package by source revision plus bundle digest and also joins the transitive resource/host ancestors by source revision plus exact resource. The runtime resource must therefore match both process receipts even though the package receipt omits resource.

All four receipts must bind the same clean committed revision. The package command additionally requires the resource/host receipts to carry `subject.source_dirty: false`. Raw receipts, runtime candidates, traces, and screenshots do not enter Git and are not public artifacts.

## MCP process lane

`test:mcp` must use the production build, create a fresh loopback session through a real MCP client, and assert at least:

- `tools/list` contains only `inspect_boundary`;
- `resources/list` contains the exact versioned `ui://` URI;
- `tools/call` returns deterministic text and structured output;
- the component-only marker remains in `_meta`, not duplicated into structured output;
- `resources/read` returns the declared MIME and exact self-contained HTML bytes;
- resource byte count and SHA-256 bind the receipt to those bytes;
- the receipt passes exact scenario-aware validation;
- the receipt is written to `tmp/receipts/mcp-resource-roundtrip.json`, with the exact resource SHA bound by a `resource:sha256:<sha256>` evidence reference;
- named-host and owner claims remain in `not_proven`.

A route error, resource-discovery mismatch, wrong MIME, malformed tool result, and incorrect resource bytes are separate failure classes. Do not repair one by widening another boundary's acceptance.

## Browser host lane

```bash
npm run test:host
```

`npm run test:host` builds first, then uses `scripts/run-host-evidence.ts` to launch Playwright with `--reporter=json`. There is no standalone writer that can bypass JSON attestation and turn an ordinary successful test exit directly into a receipt. The runner continues only when the report closure has exactly five required tests, each canonical title exactly once, expected/pass status with exactly one passed result, `skipped=0`, `unexpected=0`, `flaky=0`, and report `errors=[]`.

The local harness mounts the exact HTML returned through MCP resource read and connects it with `AppBridge` / `PostMessageTransport`. The validated Playwright attestation and ledger observations enter the host receipt:

- handshake and tool-result delivery;
- resource URI, MIME, bytes, and delivery mode;
- protocol requests;
- message/download capability transitions from `pending` to a terminal state;
- exact request dispositions, console errors, page errors, and unexpected network.

| Profile               | Advertised envelope     | Expected observation                                                                                |
| --------------------- | ----------------------- | --------------------------------------------------------------------------------------------------- |
| `restricted`          | sandbox only            | Discovery is `pending` until completion, then capability is missing; portable handoff stays visible |
| `capability-success`  | message text + download | User-initiated message/download succeeds; in-flight control is disabled and busy                    |
| `capability-rejected` | message text + download | Advertised download is `rejected`; message records only returned/failed without inventing a cause   |

Focused checks also cover keyboard reachability, `aria-live` / `aria-busy` semantics, and the absence of critical identity, fallback, or action clipping at 320px and 390px. The current bounded local rerun is `5/5` Chromium tests; it is still not named-host evidence.

The harness is intentionally not a ChatGPT simulator. A local profile is a declared test input, not an observation of any named host. It cannot reproduce host account/workspace policy, connector refresh, resource cache, undocumented APIs, tunnel reachability, or owner experience.

## Package and runtime lanes

Package/runtime checks must follow the [package and loopback runbook](runbooks/package-and-loopback.en.md). Key invariants:

- the packager refuses dirty source and an existing output;
- packaging requires `npm run check` and `npm run test:host` to produce verified resource/host receipts on the same clean committed revision;
- the build occurs from the selected clean committed revision;
- the candidate and Dockerfile retain `LICENSE`, `LICENSE-DOCUMENTATION.md`, and `LICENSING.md`;
- `release.json` lists sorted relative paths, byte counts, and SHA-256 values;
- the staged candidate uses its own complete `scenarios/` plus compiled validators to validate the scenario set and resource/host prerequisite set, then writes `package.clean-revision@1.json`;
- bundle digest, source revision, package version, and resource bytes remain distinct identities;
- runtime smoke uses a fresh isolated projection and loopback port;
- `/healthz` and the same-origin MCP endpoint agree on the selected candidate identity;
- runtime smoke reads the resource/host/package receipts and adds/validates `runtime.isolated-readback@1` under candidate-owned scenario authority as a four-receipt set;
- runtime smoke joins the runtime receipt against package and every transitive resource/host ancestor;
- the smoke process stops and the temporary runtime projection is cleaned up; the runtime receipt is persisted only after both steps succeed, without mutating an operator-selected live runtime.

If source/process checks pass but package creation fails, report an artifact-lane failure. If the package is valid but its process does not reproduce, report an isolated-runtime failure. Do not hot-patch a live service to conceal either defect.

## Public credential-free CI

`.github/workflows/verify.yml` defines only read-only public witness lanes: `source-process`, `browser-host`, and `clean-package-runtime`. It reads no secrets, publishes no package/image/release, runs no tunnel/named-host/owner scenario, and uploads no raw Playwright/private evidence. Because receipts are ignored/local-only and are not shared as artifacts across jobs or runs, `clean-package-runtime` must rerun `npm run check` and `npm run test:host` in the same clean checkout/job before package and smoke. Every job summary must name its proof ceiling and the higher `not_verified` boundaries.

Workflow source existing locally does not mean GitHub Actions ran it. Remote CI execution remains `not_verified` until a remote run actually completes and is inspected; there is no preemptive green-badge claim.

## Receipts and local artifacts

Machine-generated receipts use `mcp-app-fieldlab-receipt@1`. Raw receipts, traces, screenshots, and runtime candidates are local-only/ignored. A shareable projection may include exact public-safe identities and observations, but it must remove credentials, cookies, private URLs, conversations, account data, and raw owner material.

| Lane                      | Local output                                    |
| ------------------------- | ----------------------------------------------- |
| MCP resource roundtrip    | `tmp/receipts/mcp-resource-roundtrip.json`      |
| Browser host matrix       | `tmp/receipts/mcp-host-profile-matrix.json`     |
| Clean runtime candidate   | `tmp/receipts/package.clean-revision@1.json`    |
| Isolated runtime readback | `tmp/receipts/runtime.isolated-readback@1.json` |

Playwright attachments/traces remain separately ignored under `test-results/host/`. The receipt cites the focused test path/resource identity without embedding or uploading a raw trace.

The existence of a path is insufficient. Parse the receipt and confirm the exact scenario revision, status, subject identity, observations/evidence references, and `not_proven`.

Status semantics:

- `verified`: the exact claim was observed and `method_rung` exactly reaches the scenario claim rung / `proof_ceiling`;
- `failed`: the required observation was attempted and contradicted or could not complete for an evidenced reason;
- `not_verified`: no qualifying observation exists yet; the receipt must name the exact `not_verified_reason`.

Capability discovery, invocation disposition, and root-cause confidence remain separate fields. “Download advertised, request rejected” is not “capability missing,” and neither observation proves owner rejection or a confirmed cause.

## External acceptance

Tunnel, named-host, and owner evidence must follow the [tunnel and named-host runbook](runbooks/tunnel-and-named-host.en.md). Until each separately authorized run actually occurs, its status remains `not_verified` even if every local lane is green.
