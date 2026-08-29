<!-- docs-pair: testing; locale: zh-CN; mirror: docs/TESTING.en.md -->

# Testing 与 evidence topology

[English](./TESTING.en.md)

Field Lab 测试的目标不是追求一个总的 green badge，而是把 failure 定位到正确 boundary，并阻止低层证据升级成高层 claim。Source、process、browser host、clean artifact、running candidate、remote CI、tunnel、named host 与 owner 都有各自的 observation contract。

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

| Command                                               | Surface                                                                                          | Maximum local claim                                            | Not proved                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------- |
| `npm run validate:register`                           | Field Guide pin、profile selection、publication/license state 与 package version                 | source                                                         | Profile correctness beyond pinned authority；publication      |
| `npm run validate:licensing`                          | canonical SUL text、CC notice、path map、first-public boundary 与 package metadata               | source                                                         | Rights ownership beyond repository evidence；legal compliance |
| `npm run validate:docs`                               | paired paths、metadata、language switches 与 registered shared facts                             | source                                                         | Full semantic translation equivalence                         |
| `npm run validate:schemas`                            | generated schema 与 source schema 一致                                                           | source                                                         | Runtime serialization by itself                               |
| `npm run validate:scenarios`                          | scenario structure、policy mapping、prerequisite graph/ceilings、authorization/runner invariants | source                                                         | Scenario execution                                            |
| `npm run typecheck`                                   | TypeScript contracts                                                                             | source                                                         | Built/runtime behavior                                        |
| `npm run test`                                        | deterministic unit、policy、receipt、identity contracts                                          | source/process only where a test starts an exact local process | Browser host、package、tunnel、named host                     |
| `npm run build`                                       | production server/view artifacts 与 self-contained manifest closure                              | artifact shape from current checkout                           | Clean revision、MCP readback、host mount                      |
| `npm run test:mcp`                                    | fresh MCP process、exact `resources/read` 与 resource receipt                                    | process                                                        | Browser sandbox、clean package、tunnel、named host            |
| `npm run check`                                       | 上述 source/process rows；写 `mcp-resource-roundtrip.json`                                       | process                                                        | `test:host` 与所有更高 rungs                                  |
| `npm run test:host`                                   | exact five-test Playwright JSON closure；写 host-profile receipt                                 | process                                                        | ChatGPT/named-host behavior、tunnel、owner acceptance         |
| `npm run package:runtime -- --out=<new-ignored-path>` | 要求 clean resource/host receipts；验证 candidate-owned prerequisite set；写 package receipt     | artifact                                                       | Candidate execution、production selection                     |
| `npm run smoke:runtime -- --candidate=<path>`         | isolated health/MCP/resource readback 与 four-receipt chain                                      | activated-runtime for that isolated process                    | Operator service selection、tunnel、named host、owner         |

Runbooks、scenario JSON、workflow source 与 generated schemas 都是 contracts，不是某次 run 已经发生的 receipts。

## Scenario registry 与 semantic policy

`src/evidence/policy.ts` 是 boundary/surface/environment/rung/authorization/runner 的单一 authority。Scenario-set validation 检查 exact `id@revision` uniqueness、prerequisite existence、cycle、ceiling inversion 与 legal runner combinations；receipt validation 再把 exact scenario 与 environment、status、rung、observations、evidence refs、subject identities 交叉验证。

| Scenario                               | Boundary                  | Runner / authorization               | Proof ceiling                                | Always remains outside                                   |
| -------------------------------------- | ------------------------- | ------------------------------------ | -------------------------------------------- | -------------------------------------------------------- |
| `mcp-app.resource-roundtrip@1`         | resource admission        | `npm run test:mcp` / ordinary local  | process                                      | clean package、tunnel、named host、owner                 |
| `mcp-app.host-profile-matrix@1`        | optional host capability  | `npm run test:host` / ordinary local | process                                      | ChatGPT policy/cache、tunnel、named host、owner          |
| `package.clean-revision@1`             | artifact/runtime identity | package command / ordinary local     | artifact                                     | running candidate、production selection、host            |
| `runtime.isolated-readback@1`          | artifact/runtime identity | runtime smoke / ordinary local       | activated-runtime for exact isolated process | operator service selection、tunnel、host、owner          |
| `tunnel.configured-target-authority@1` | tunnel target             | no runner / external side effect     | activated-runtime                            | tunnel activation、named-host discovery/admission、owner |
| `named-host.acceptance@1`              | named-host acceptance     | no runner / external side effect     | named-host                                   | other hosts/future behavior、owner acceptance            |
| `owner.acceptance@1`                   | owner interaction         | no runner / owner only               | owner                                        | later revision 或 another host                           |

后三个 scenarios 保持 `runner: null`。Agent 不得因为它们存在就访问 credentials、重启 service、部署、创建 host conversation 或声称 owner judgment。`not_verified` receipt 不需要伪造尚不存在的 external identity；一旦 status 是 attempted `verified` / `failed`，则必须带真实 observation/evidence refs 以及该 rung 所需的 subject identities。`verified` receipt 的 `method_rung` 必须精确等于 scenario 声明的 claim rung / `proof_ceiling`；低一层的 evidence 不能用 verified status 填补差距。

## Receipt chain 与 joins

以下 four-receipt chain 全部写入 ignored/local-only paths。每个 attempted dependent receipt 都要求完整 transitive prerequisite closure 中的 receipts 存在且为 `verified`：

| Scenario receipt                | Writer command               | Local-only path                                 | Direct prerequisites                                                   |
| ------------------------------- | ---------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- |
| `mcp-app.resource-roundtrip@1`  | `npm run check` → `test:mcp` | `tmp/receipts/mcp-resource-roundtrip.json`      | none                                                                   |
| `mcp-app.host-profile-matrix@1` | `npm run test:host`          | `tmp/receipts/mcp-host-profile-matrix.json`     | `mcp-app.resource-roundtrip@1`                                         |
| `package.clean-revision@1`      | `npm run package:runtime`    | `tmp/receipts/package.clean-revision@1.json`    | resource roundtrip + host profile matrix                               |
| `runtime.isolated-readback@1`   | `npm run smoke:runtime`      | `tmp/receipts/runtime.isolated-readback@1.json` | package receipt；validator 同时读取此前三份以验证完整 four-receipt set |

Validator 对每份 attempted dependent 收集完整 transitive ancestor closure，并将每一份 ancestor receipt 与 dependent 比较。Join fields 是 `source_revision`、exact `resource`、`bundle_digest`、`runtime_identity`；对每个 ancestor/dependent pair，比较双方都实际携带的全部字段。Exact resource identity 包含 URI、MIME、bytes、SHA-256；每份携带 resource 的 attempted receipt 还必须含 `resource:sha256:<subject.resource.sha256>` evidence ref。当前 graph 中，package 与 resource/host ancestors 通过 clean source revision join；runtime 与 package 通过 source revision + bundle digest join，同时与 transitive resource/host ancestors 通过 source revision + exact resource join。因此，即使 package receipt 不携带 resource，runtime resource 仍必须和 resource/host receipts 完全一致。

四份 receipt 必须绑定同一 clean committed revision。Package command 额外要求 resource/host receipts 的 `subject.source_dirty` 为 `false`。Raw receipts、runtime candidates、traces 与 screenshots 均不进入 Git，也不成为 public artifacts。

## MCP process lane

`test:mcp` 必须使用 production build，通过 real MCP client 创建 fresh loopback session，并至少断言：

- `tools/list` 只包含 `inspect_boundary`；
- `resources/list` 包含 exact versioned `ui://` URI；
- `tools/call` 返回 deterministic text 与 structured output；
- component-only marker 留在 `_meta`，不复制进 structured output；
- `resources/read` 返回 declared MIME 与 exact self-contained HTML bytes；
- resource byte count 与 SHA-256 把 receipt 绑定到这些 bytes；
- receipt 通过 exact scenario-aware validation；
- receipt 写入 `tmp/receipts/mcp-resource-roundtrip.json`，并以 `resource:sha256:<sha256>` evidence ref 绑定 exact resource SHA；
- named-host 与 owner claims 留在 `not_proven`。

Route error、resource-discovery mismatch、wrong MIME、malformed tool result 与 incorrect resource bytes 是不同 failure classes。不能通过放宽另一个 boundary 的 acceptance 来“修复”。

## Browser host lane

```bash
npm run test:host
```

`npm run test:host` 先 build，再通过 `scripts/run-host-evidence.ts` 启动 Playwright `--reporter=json`。不存在可以绕开 JSON attestation、直接把普通 test exit 写成成功 receipt 的 standalone writer。Runner 只在 report closure 满足以下条件后继续：exact five required tests、canonical titles 全部且仅出现一次、每项 expected/pass 且只有一个 passed result、`skipped=0`、`unexpected=0`、`flaky=0`、report `errors=[]`。

Local harness 挂载通过 MCP resource read 得到的 exact HTML，再由 `AppBridge` / `PostMessageTransport` 连接。经验证的 Playwright attestation 连同 ledger observation 写入 host receipt：

- handshake 与 tool-result delivery；
- resource URI、MIME、bytes 与 delivery mode；
- protocol requests；
- message/download capability 从 `pending` 到 terminal state 的 transition；
- exact request disposition、console errors、page errors 与 unexpected network。

| Profile               | Advertised envelope     | Expected observation                                                                 |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `restricted`          | sandbox only            | discovery 完成前为 `pending`；完成后 capability missing；portable handoff 仍可见     |
| `capability-success`  | message text + download | user-initiated message/download requests 成功；in-flight control disabled + busy     |
| `capability-rejected` | message text + download | advertised download 为 `rejected`；message 只记录 returned/failed，不推测 host cause |

Focused checks 还覆盖 keyboard reachability、`aria-live` / `aria-busy` semantics，以及 320px/390px viewport 下无关键 identity、fallback 或 action 水平截断。当前 bounded local rerun 为 `5/5` Chromium tests；它仍不是 named-host evidence。

Harness 明确不是 ChatGPT simulator。Local profile 是 declared test input，不是任何 named host 的 observation，不能复现 host account/workspace policy、connector refresh、resource cache、undocumented APIs、tunnel reachability 或 owner experience。

## Package 与 runtime lanes

Package/runtime checks 必须遵循 [package 与 loopback runbook](runbooks/package-and-loopback.md)。关键 invariants：

- package 拒绝 dirty source 与 existing output；
- package 要求先在同一 clean committed revision 上运行 `npm run check` 与 `npm run test:host`，生成 verified resource/host receipts；
- build 从 selected clean committed revision 发生；
- candidate 与 Dockerfile 保留 `LICENSE`、`LICENSE-DOCUMENTATION.md` 与 `LICENSING.md`；
- `release.json` 列出 sorted relative paths、byte counts 与 SHA-256；
- staged candidate 使用自身完整 `scenarios/` 与 compiled validators 验证 scenario set、resource/host prerequisite set，并写 `package.clean-revision@1.json`；
- bundle digest、source revision、package version 与 resource bytes 保持 distinct identities；
- runtime smoke 使用 fresh isolated projection 与 loopback port；
- `/healthz` 与 same-origin MCP endpoint 对 selected candidate identity 一致；
- runtime smoke 读取 resource/host/package receipts，在 candidate-owned scenario authority 下加入并验证 `runtime.isolated-readback@1`，形成 four-receipt set；
- runtime smoke 对 runtime receipt 与 package 及所有 transitive resource/host ancestors 执行 identity joins；
- smoke process 被停止，temporary runtime projection 被清理，且只有这两步都成功后才持久化 runtime receipt；operator-selected live runtime 不被改变。

如果 source/process checks 通过但 package creation 失败，报告 artifact-lane failure。如果 package 有效但 process 无法复现，报告 isolated-runtime failure。不要热改 live service 来掩盖任一问题。

## Public credential-free CI

`.github/workflows/verify.yml` 只定义 read-only public witness lanes：`source-process`、`browser-host` 与 `clean-package-runtime`。它不读取 secrets，不 publish package/image/release，不运行 tunnel、named-host 或 owner scenarios，也不上传 raw Playwright/private evidence。因为 receipts 是 ignored/local-only，且不作为 artifacts 在 jobs/runs 间共享，`clean-package-runtime` 必须在同一个 clean checkout/job 内重跑 `npm run check` 与 `npm run test:host`，再 package/smoke。Job summary 必须写出 proof ceiling 与更高层 `not_verified` boundaries。

Workflow source 在本地存在不等于 GitHub Actions 已执行。除非 remote run 真实完成并被检查，remote CI execution 保持 `not_verified`；不得预写绿色 badge claim。

## Receipts 与 local artifacts

Machine-generated receipts 使用 `mcp-app-fieldlab-receipt@1`。Raw receipts、traces、screenshots 与 runtime candidates 都是 local-only/ignored。Shareable projection 可以包含 exact public-safe identities 与 observations，但必须移除 credentials、cookies、private URLs、conversations、account data 与 raw owner material。

| Lane                      | Local output                                    |
| ------------------------- | ----------------------------------------------- |
| MCP resource roundtrip    | `tmp/receipts/mcp-resource-roundtrip.json`      |
| Browser host matrix       | `tmp/receipts/mcp-host-profile-matrix.json`     |
| Clean runtime candidate   | `tmp/receipts/package.clean-revision@1.json`    |
| Isolated runtime readback | `tmp/receipts/runtime.isolated-readback@1.json` |

Playwright attachments/traces 另行 ignored 于 `test-results/host/`；receipt 只引用 focused test path/resource identity，不内嵌或上传 raw trace。

Path 存在不够；必须 parse receipt 并确认 exact scenario revision、status、subject identity、observations/evidence refs 与 `not_proven`。

Status semantics：

- `verified`：exact claim 已被观察，且 `method_rung` 精确达到 scenario claim rung / `proof_ceiling`；
- `failed`：required observation 被 attempted，并因有 evidence 的矛盾或失败无法完成；
- `not_verified`：尚无 qualifying observation，必须给出 exact `not_verified_reason`。

Capability discovery、invocation disposition 与 root-cause confidence 是独立字段。例如，“download advertised, request rejected”不是“capability missing”，也不证明 owner rejection 或 confirmed cause。

## External acceptance

Tunnel、named-host 与 owner evidence 必须遵循 [tunnel 与 named-host runbook](runbooks/tunnel-and-named-host.md)。在各自 separately authorized run 真正发生前，它们保持 `not_verified`，即使每个 local lane 都是绿色。
