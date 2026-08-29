<!-- docs-pair: current-state; locale: zh-CN; mirror: docs/current-state.en.md -->

# Current state

[English](./current-state.en.md)

Updated: 2026-08-29

## Classification

- Status: `public-source`
- Version: `0.1.0-private.0`
- Repository: `https://github.com/IndelibleVivi/mcp-app-production-fieldlab`
- Visibility: public
- Package publication: disabled by `package.json` `private: true`
- Functional license: `SUL-1.0` (source-available; use-restricted)
- Documentation license: `CC-BY-NC-SA-4.0`
- License map: `LICENSING.md`
- GitHub Release: none
- Method authority: MCP Server Engineering Field Guide `2.0.1`，固定 commit `dcb2c61a060948f92d35918af43919bdfde8b01a`
- Founding observation: Refrain commit `3e25c4b61eacaad502b4942e285855a7c38871ca`

Field Guide 在本 Lab 尚无 versioned public release 时保持不变。Public source repository 本身不构成 companion release；`FIELDLAB-REGISTER.json` 仍是单向 method/provenance link。

## Implemented source surfaces

- 一个 deterministic、read-only 的 `inspect_boundary` tool；
- 一个 explicit-version、self-contained MCP App resource，build closure 拒绝 static/dynamic chunk escape 与 unsafe asset path；
- 分离的 model/component shared output 与 component-only metadata；
- canonical declarative evidence policy、scenario prerequisite graph/ceiling validation 与 exact scenario-aware receipt validation；
- capability-gated message/download probes：discovery 保留 `pending`/terminal distinctions，in-flight actions disabled + `aria-busy`，bridge disposition 不猜测未观察到的 host cause；
- receipt/scenario schemas 保留 exact method rungs、subject identities、evidence refs、distinct capability dispositions 与 `not_proven`；
- 七个 boundary scenarios，从 local resource delivery 一直到 owner acceptance；
- declared local-host profiles 与 observation ledger，明确设置 `namedHostSimulation: false`；
- clean-package 与 isolated-runtime commands；
- layered `SUL-1.0` / `CC-BY-NC-SA-4.0` licensing，含 private-source/third-party exclusions，并传播到 runtime candidates；
- 中文默认 + English mirror documentation、`DOCS-REGISTER.json` 与只验证 structure/shared facts 的 docs validator；
- credential-free、read-only GitHub Actions workflow source；remote CI execution 在真实 remote run 前保持 `not_verified`；
- operator runbooks 与 pinned、public-safe 的 Refrain mechanism case study。

## Evidence status

2026-08-29 已对 source/process、declared local-browser、clean-package 与 isolated-runtime boundaries 完成 fresh local verification。当前 license-bearing package/runtime proof 固定到 clean source commit `dbab424196d4acd1eae1b73f7f26d7e0a9a43889`；review-hardening source changes 必须在 root 创建新的 clean implementation commit 后生成新 candidate，不能沿用这一旧 identity。早期 27-file candidate `ed016da10d034160989066a69348914c14188da7` 只保留为 pre-license historical evidence。

已记录的 baseline `npm run check` 包含：

- register 与 layered-license validation；
- `2` 个 generated-schema checks；
- `7` 个 scenario validations；
- TypeScript typecheck；
- `10` 个 unit tests；
- production build；
- real MCP client discovery、tool call 与 exact resource roundtrip。

Review-hardening change 增加 docs/source semantic validation 与 focused unit coverage；最终 test count 必须在 clean implementation commit 的 fresh full check 后更新，不从 working-tree intent 预写。

Baseline MCP process receipt 位于 local-only 的 `tmp/receipts/mcp-resource-roundtrip.json`，绑定：

- resource: `ui://mcp-app-production-fieldlab/inspect-boundary/v1.html`
- MIME: `text/html;profile=mcp-app`
- bytes: `550779`
- SHA-256: `7638ebdc38857bc980a43a5740c7a49c29a61ddd12207c7baf2816491daa73b3`

Review-hardening UI lane 的 fresh bounded local rerun 通过 `5/5` Chromium tests，覆盖 `restricted`、`capability-success`、`capability-rejected`，并新增 pending/terminal capability semantics、keyboard reachability、busy-state 与 320px/390px overflow assertions。Ledger 仍要求零 unexpected network，并将 named-host/owner 留在 `not_proven`。它的最高 ceiling 仍是 `process`。

当前已登记的 clean committed-tree package 与 isolated readback 仍属于上述 pre-review source commit：

- candidate: `runtime-candidates/dbab424-fieldlab-v0.1.0` (ignored/local-only)
- file closure: `30` files，包括作为 digest-bound manifest members 的 `LICENSE`、`LICENSE-DOCUMENTATION.md` 与 `LICENSING.md`
- bundle digest: `sha256:228458dbb93a818f53cda77dc414cfa705a5df028902ed0c0790194e3c082c56`
- canonical SUL-1.0 SHA-256: `c6d0dde0f0463c800e542d7d64237ffef37f43b17004975a558604f17b5d1af1`
- exact read-back resource bytes: `550779`
- exact read-back resource SHA-256: `7638ebdc38857bc980a43a5740c7a49c29a61ddd12207c7baf2816491daa73b3`
- validated receipt: `tmp/receipts/runtime.isolated-readback@1.json` (ignored/local-only)
- proof ceiling: `activated-runtime`，仅限 disposable isolated process

该 historical smoke 验证 candidate files/digests、production dependency install、same-origin `/healthz` release identity、MCP discovery、tool call、resource readback 与 component-only projection。Review-hardening source/package contract 发生变化后，必须从新的 clean committed revision 重新 package/smoke，再替换这里及 English mirror、`DOCS-REGISTER.json` 中的 candidate source revision、file count、bundle digest、resource bytes/hash 与 receipt path。

| Boundary id                   | Status         | Current claim                                                                              |
| ----------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `source-checks`               | `verified`     | Baseline local check 已通过；review-hardening final count 等待 clean implementation check  |
| `resource-roundtrip`          | `verified`     | Baseline fresh local process 返回上列 exact self-contained bytes；新 build identity 待刷新 |
| `local-host-matrix`           | `verified`     | Review-hardening bounded local rerun `5/5`；ceiling=`process`                              |
| `clean-runtime-candidate`     | `verified`     | 仅指 pre-review `dbab424...` candidate；新 source revision 不得复用该证据                  |
| `isolated-runtime-readback`   | `verified`     | 仅指同一 pre-review disposable candidate process                                           |
| `remote-ci-execution`         | `not_verified` | Workflow source 存在，但没有在本轮观察到 qualifying remote GitHub Actions run              |
| `operator-production-runtime` | `not_verified` | 未尝试 operator service installation 或 production selection                               |
| `tunnel`                      | `not_verified` | External gate；未访问 credential/profile，未运行 preflight/activation                      |
| `named-host`                  | `not_verified` | External/account gate；未执行 authenticated named-host exercise                            |
| `owner-acceptance`            | `not_verified` | Owner-only gate；未请求或记录 owner observation                                            |
| `release-publication`         | `not_verified` | 未创建 GitHub Release，也未进行 registry/container publication                             |

## Next safe closure sequence

1. 对完整 review-hardening source/docs/tests/workflow diff 运行 final local checks，并创建 clean implementation commit A。
2. 从 commit A 生成一个新的 ignored runtime candidate，运行 isolated smoke，记录 exact source revision、file count、bundle digest、resource bytes/hash 与 receipt path；不要沿用 `dbab424...` candidate。
3. 同步更新本文件、`current-state.en.md` 与 `DOCS-REGISTER.json` 的 exact current-state facts，作为 documentation-only commit B；不要把 commit B 冒充 candidate identity。
4. 保持 remote CI、operator production selection、tunnel、named host、owner acceptance 与 release publication 为独立 gates。未经各自授权与实际 execution，不提升 status。
