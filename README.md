<!-- docs-pair: readme; locale: zh-CN; mirror: README.en.md -->

# MCP App Production Field Lab

[English](./README.en.md)

MCP App Production Field Lab 是一个可执行、可复现、claim-bounded 的工程实验室。它把 MCP App 从 source、local process、exact resource delivery、browser host、clean package、activated runtime，一直到 tunnel、named host 与 owner acceptance 的边界逐层拆开验证，避免把“本地能打开”误写成“真实 host 已接受”。

当前状态是 **`public-source` / source-available / unreleased package**：source repository 公开于 [`IndelibleVivi/mcp-app-production-fieldlab`](https://github.com/IndelibleVivi/mcp-app-production-fieldlab)，但没有 GitHub Release 或 registry publication。Project-original functional materials 使用 `SUL-1.0`；原创 documentation、diagrams 与 case-study expression 使用 `CC-BY-NC-SA-4.0`。这不是 OSI open source。`package.json` 保持 `private: true`，用于阻止误发 npm。仓库里的 tunnel、named-host 与 owner scenarios 是 operator runbooks 和 evidence contracts，不代表这些外部步骤已经运行。

## 为什么单独成 repo

现有 Field Guide 与这个 Field Lab 解决不同问题：

| Surface                                                                                                           | Authority                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [MCP Server Engineering Field Guide](https://github.com/IndelibleVivi/mcp-server-engineering-field-guide) `2.0.1` | 稳定方法、dated protocol/integration profiles、evidence grammar 与通用 MCP engineering skill                                      |
| 本 Field Lab                                                                                                      | neutral executable specimen、declared local-host profiles、scenario definitions、package/runtime observations 与 bounded receipts |
| Softpowers                                                                                                        | 通用 implementation、debugging、verification workflow                                                                             |
| [Refrain](https://github.com/IndelibleVivi/refrain)（private source authority；link 需要访问权限）                | founding case 的 product source、renderer、deployment、runtime 与 owner truth                                                     |

版本连接只通过 [`FIELDLAB-REGISTER.json`](FIELDLAB-REGISTER.json) 单向固定：Field Guide release `2.0.1` 固定到 commit `dcb2c61a060948f92d35918af43919bdfde8b01a`。Field Lab 不复制 Field Guide profiles，不创建第二个通用 skill，也不把 Refrain 变成 runtime dependency。Field Guide 会保持不变，直到真正的 public Field Lab release 存在，再决定是否加入 companion discoverability link。

## Specimen contract

实验室只提供一个 deterministic、read-only 的 tool/view specimen：

- tool：`inspect_boundary`
- resource：`ui://mcp-app-production-fieldlab/inspect-boundary/v1.html`
- MIME：`text/html;profile=mcp-app`
- output：model-readable text、model/component shared `structuredContent`，以及不进入 model-visible structured output 的 component-only `_meta`
- UI effects：selection 保持 view-local；message/download 必须经过 user gesture 与 advertised host capability
- production App document：JS/CSS 全部 inline；build closure 拒绝 static/dynamic chunk escape，不依赖 external asset/network fetch

这个 UI 是 evidence surface，不是产品 dashboard。它让 model-visible、component-visible、component-only 与 host-capability projections 的差异可以直接观察。

## 快速开始

要求 Node.js `>=22.23.1`。

```bash
npm ci
npm run check
```

`npm run check` 覆盖 register、layered licensing、双语文档结构/shared facts、schema/scenario semantics、typecheck、unit tests、production build，以及真实 MCP client 的 loopback roundtrip。`validate:docs` 只证明 pair topology 与已登记事实同步，不声称机器能够证明翻译语义完全等价。

浏览器 host lane 另行运行：

```bash
# 首次安装 Playwright Chromium；这是一次独立的网络操作。
npx playwright install chromium

npm run test:host
```

`test:host` 使用 exact built MCP resource 和三个明确声明的 local profiles：`restricted`、`capability-success`、`capability-rejected`。它是 local surrogate，不是 ChatGPT emulator。

Clean package 与 isolated runtime proof 必须从 clean committed revision 开始，并使用一个尚不存在的 ignored output path：

```bash
npm run package:runtime -- --out=runtime-candidates/fieldlab-review
npm run smoke:runtime -- --candidate=runtime-candidates/fieldlab-review
```

完整前提、检查点与 claim ceiling 见 [package 与 loopback runbook](docs/runbooks/package-and-loopback.md)。Tunnel 与真实 host 不提供可误触发的默认 runner；见 [tunnel 与 named-host runbook](docs/runbooks/tunnel-and-named-host.md)。

## Evidence ladder

每份 receipt 只有一个 `method_rung`，并显式记录 `not_proven`。低层证据不会自动升级高层 claim。

| Rung                | 可以证明                                                                                                   | 仍不能证明                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `source`            | schema、contract 与 source-level invariants                                                                | process behavior、built bytes、host behavior |
| `process`           | fresh local MCP roundtrip 与 declared local-browser behavior                                               | clean-package identity、tunnel、named host   |
| `artifact`          | clean committed revision 对应的 runtime files与 bundle identity                                            | candidate 已启动、production 已选择          |
| `activated-runtime` | exact candidate/process 的 identity readback；若另有 operator activation receipt，则仅限该次被选择 runtime | tunnel、host admission、owner acceptance     |
| `named-host`        | 某一明确 host/account/date 上的 fresh discovery、resource admission 与 observed dispositions               | 其他 host、未来 policy/cache、owner judgment |
| `owner`             | owner 对 exact revision 与 exact host interaction 的 deliberate acceptance/rejection                       | 后续 revision 或其他环境                     |

`not_verified` 表示尚未获得 qualifying observation，不等于 failure。Capability discovery、request disposition 与 root-cause confidence 也是独立维度；`pending`、`missing`、`denied`、`rejected`、`cancelled`、`policy_denied` 与 `technical_failure` 不能压缩成同一个 generic error。

## Repository map

| Path                                                           | Role                                                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [`SPEC.md`](SPEC.md)                                           | programme contract、non-goals 与 acceptance boundaries                                  |
| [`FIELDLAB-REGISTER.json`](FIELDLAB-REGISTER.json)             | Field Guide version pin、selected profiles、founding provenance 与 publication state    |
| [`DOCS-REGISTER.json`](DOCS-REGISTER.json)                     | 中文/English pairs、registered shared facts 与 current-state sync contract              |
| [`LICENSING.md`](LICENSING.md)                                 | governing functional/docs path map、private-source 与 third-party exclusions            |
| [`src/`](src)                                                  | neutral server、exact resource contract、view 与 evidence policy/schema                 |
| [`host-harness/`](host-harness)                                | declared local profiles 与 observable ledger；不模拟 named host                         |
| [`scenarios/`](scenarios)                                      | versioned scenario contracts 与各自的 authorization class                               |
| [`schemas/`](schemas)                                          | generated scenario/receipt JSON Schemas                                                 |
| [`docs/TESTING.md`](docs/TESTING.md)                           | command topology、scenario matrix 与 failure localization                               |
| [`docs/runbooks/`](docs/runbooks)                              | operator procedures；runbook 本身不是执行证据                                           |
| [`case-studies/refrain/`](case-studies/refrain)                | pinned、public-safe mechanism extraction；无产品代码或 runtime authority transfer       |
| [`.github/workflows/verify.yml`](.github/workflows/verify.yml) | credential-free public witness source；remote execution 必须由实际 Actions run 另行证明 |

Raw receipts、Playwright traces/screenshots、credentials、cookies、private URLs 与 unsanitized named-host evidence 必须留在 ignored/local-only locations。Sanitized receipt 是 derived projection，不是 independent reproduction。

## Publication and rights

本 repo 使用 path-level layered licensing：

- project-original functional materials 使用 [SUL-1.0](LICENSE)。它允许 personal、non-commercial 与 internal business use；只允许免费且非商业地向他人分发或提供，不允许收费分发、商业性对外提供或收费托管；
- project-original documentation、diagrams 与 case-study expression 使用 [CC BY-NC-SA 4.0](LICENSE-DOCUMENTATION.md)，其 identifier 为 `CC-BY-NC-SA-4.0`，要求 attribution、NonCommercial 与 ShareAlike；
- exact path scope、private Refrain provenance 与 third-party exclusions 见 governing English map [LICENSING.md](LICENSING.md)；[中文许可说明](LICENSING.zh-CN.md)只供阅读便利。

不要从 Field Guide、private Refrain source 或依赖包的 license 推导额外授权。GitHub source visibility、GitHub Release、npm publication 与另行商业许可仍是不同边界。

由 Faye & Cove 共同创作。

Created by Faye & Cove.
