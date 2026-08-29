# Testing and evidence topology

Field Lab 测试的目标不是追求一个总的 green badge，而是把 failure 定位到正确 boundary，并阻止低层证据升级成高层 claim。Source、process、browser host、clean artifact、running candidate、tunnel、named host 与 owner 都有自己的 observation contract。

## Local prerequisites

- Node.js `>=22.23.1`
- exact `package-lock.json`
- Playwright Chromium（仅 `test:host` 需要）
- package lane 需要 clean committed Git revision 与一个尚不存在的 ignored output path

```bash
npm ci

# One-time browser download; this network action is separate from the tests.
npx playwright install chromium
```

Local test execution 本身不需要 private credentials、public origin、tunnel 或 named-host account。

## Command matrix

| Command                                               | Surface                                                                                | Maximum local claim                                            | Not proved                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| `npm run validate:register`                           | Field Guide pin、profile selection、publication state                                  | source                                                         | Profile correctness beyond the pinned authority; publication |
| `npm run validate:schemas`                            | generated schema matches source schema                                                 | source                                                         | Runtime serialization by itself                              |
| `npm run validate:scenarios`                          | scenario structure、authorization/runner invariants                                    | source                                                         | Scenario execution                                           |
| `npm run typecheck`                                   | TypeScript contracts                                                                   | source                                                         | Built or runtime behavior                                    |
| `npm run test`                                        | deterministic unit contracts                                                           | source/process only where a test starts an exact local process | Browser host、package、tunnel、named host                    |
| `npm run build`                                       | production server/view artifacts exist and manifest keys are present                   | artifact shape from current checkout                           | Clean revision、MCP readback、host mount                     |
| `npm run test:mcp`                                    | fresh production MCP process; tool/resource discovery, call and exact `resources/read` | process                                                        | Browser sandbox、clean package、tunnel、named host           |
| `npm run check`                                       | all rows above except browser host                                                     | process                                                        | `test:host` and every later rung                             |
| `npm run test:host`                                   | exact built resource under declared local profiles                                     | process                                                        | ChatGPT/named-host behavior、tunnel、owner acceptance        |
| `npm run package:runtime -- --out=<new-ignored-path>` | clean revision runtime candidate and release manifest                                  | artifact                                                       | Candidate execution、production selection                    |
| `npm run smoke:runtime -- --candidate=<path>`         | isolated candidate process + health/MCP/resource readback                              | activated process for that isolated candidate                  | Operator service selection、tunnel、named host、owner        |

Runbooks, scenario JSON and generated schemas are contracts, not receipts that a run happened.

## Scenario registry

| Scenario                               | Boundary                  | Runner / authorization               | Proof ceiling                                | Always remains outside                                   |
| -------------------------------------- | ------------------------- | ------------------------------------ | -------------------------------------------- | -------------------------------------------------------- |
| `mcp-app.resource-roundtrip@1`         | resource admission        | `npm run test:mcp` / ordinary local  | process                                      | clean package, tunnel, named host, owner                 |
| `mcp-app.host-profile-matrix@1`        | optional host capability  | `npm run test:host` / ordinary local | process                                      | ChatGPT policy/cache, tunnel, named host, owner          |
| `package.clean-revision@1`             | artifact/runtime identity | package command / ordinary local     | artifact                                     | running candidate, production selection, host            |
| `runtime.isolated-readback@1`          | artifact/runtime identity | runtime smoke / ordinary local       | activated-runtime for exact isolated process | operator service selection, tunnel, host, owner          |
| `tunnel.configured-target-authority@1` | tunnel target             | no runner / external side effect     | activated-runtime                            | tunnel activation, named-host discovery/admission, owner |
| `named-host.acceptance@1`              | named-host acceptance     | no runner / external side effect     | named-host                                   | other hosts/future behavior, owner acceptance            |
| `owner.acceptance@1`                   | owner interaction         | no runner / owner only               | owner                                        | later revision or another host                           |

The last three scenarios deliberately have `runner: null`. An agent must not turn their presence into authorization to access credentials, restart a service, deploy, create a host conversation or claim owner judgment.

## MCP process lane

`test:mcp` must use the production build, create a fresh loopback session through a real MCP client, and assert at least:

- `tools/list` contains exactly `inspect_boundary`;
- `resources/list` contains the exact versioned `ui://` URI;
- `tools/call` returns deterministic text and structured output;
- component-only marker remains in `_meta`, not duplicated into structured output;
- `resources/read` returns the declared MIME and exact self-contained HTML bytes;
- the resource byte count and SHA-256 bind the receipt to those bytes;
- named-host and owner claims remain in `not_proven`.

A route error, resource-discovery mismatch, wrong MIME, malformed tool result and incorrect resource bytes are separate failure classes. Do not repair one by widening acceptance for another.

## Browser host lane

```bash
npm run test:host
```

The local harness mounts the exact HTML returned through MCP resource read, then connects it through `AppBridge`/`PostMessageTransport`. It records:

- handshake and tool-result delivery;
- resource URI, MIME, bytes and delivery mode;
- protocol requests;
- message/download capability discovery and disposition;
- console errors, page errors and unexpected network.

| Profile               | Advertised envelope     | Expected observation                                                   |
| --------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `restricted`          | sandbox only            | unsupported actions are absent; portable handoff remains visible       |
| `capability-success`  | message text + download | user-initiated message/download requests return successfully           |
| `capability-rejected` | message text + download | advertised download is rejected and recorded as rejection, not absence |

This harness is intentionally **not** a ChatGPT simulator. A local profile is a declared test input, not an observation of any named host. It cannot reproduce host account/workspace policy, connector refresh, resource cache, undocumented APIs, tunnel reachability, or owner experience.

## Package and runtime lanes

Package/runtime checks must follow [package and loopback runbook](runbooks/package-and-loopback.md). Key invariants:

- package refuses dirty source and existing output;
- build occurs from the selected clean committed revision;
- `release.json` lists sorted relative paths, byte counts and SHA-256 values;
- bundle digest, source revision and resource bytes retain separate identities;
- runtime smoke uses a fresh isolated projection and loopback port;
- `/healthz` and the same-origin MCP endpoint agree on the selected candidate;
- smoke process is stopped without mutating an operator-selected live runtime.

If source/process checks pass but package creation fails, report an artifact-lane failure. If the package is valid but the process does not reproduce, report an isolated-runtime failure. Do not patch a live service to hide either one.

## Receipts and local artifacts

Machine-generated receipts use `mcp-app-fieldlab-receipt@1`. Raw receipts, traces, screenshots and runtime candidates are local-only/ignored. A shareable projection may include exact public-safe identities and observations, but must remove credentials, cookies, private URLs, conversations, account data and raw owner material.

Current local output locations are deliberately outside tracked authority:

| Lane                      | Local output                                             |
| ------------------------- | -------------------------------------------------------- |
| MCP resource roundtrip    | `tmp/receipts/mcp-resource-roundtrip.json`               |
| Browser host matrix       | Playwright attachments/traces under `test-results/host/` |
| Isolated runtime readback | `tmp/receipts/runtime.isolated-readback@1.json`          |

The commands' stdout also names the receipt/identity it produced. A path existing is not enough; parse the receipt and confirm its scenario revision, status, subject identity and `not_proven` before using it as evidence.

Receipt status meanings:

- `verified`: the exact claim was observed at its stated rung;
- `failed`: the required observation was attempted and contradicted or could not complete for an evidenced reason;
- `not_verified`: no qualifying observation exists yet; the receipt must name the exact `not_verified_reason`.

Capability discovery, invocation disposition and optional root-cause confidence are separate fields. For example, “download advertised, request rejected” is not “capability missing,” and neither result proves owner rejection or a confirmed cause.

## External acceptance

Tunnel, named-host and owner evidence must follow [tunnel and named-host runbook](runbooks/tunnel-and-named-host.md). Until those separately authorized runs exist, their status is `not_verified` even if every local lane is green.
