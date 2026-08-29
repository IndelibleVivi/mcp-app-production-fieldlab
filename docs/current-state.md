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

2026-08-29 已对 review-hardening source/process、declared local-browser、clean-package 与 isolated-runtime boundaries 完成 fresh local verification。当前 package/runtime proof 固定到 clean implementation commit `5eba892b6be5407b0ac4aa658f398f7b2eec5373`。本文件是随后只记录证据的 documentation update，不改变 candidate identity。更早的 `dbab424...` 与 `ed016da...` candidates 只保留为 historical evidence，不是当前 revision 的 proof。

Clean commit 上的 `npm run check` 包含：

- register、layered-license 与 bilingual-doc validation；
- `2` 个 generated-schema checks；
- `7` 个 scenario validations；
- TypeScript typecheck；
- `40` 个 unit tests（`7/7` test files）；
- production build；
- real MCP client discovery、tool call 与 exact resource roundtrip。

Fresh MCP process receipt 位于 local-only 的 `tmp/receipts/mcp-resource-roundtrip.json`，绑定：

- resource: `ui://mcp-app-production-fieldlab/inspect-boundary/v1.html`
- MIME: `text/html;profile=mcp-app`
- bytes: `552146`
- SHA-256: `13e0d52a1cf4b4239459065d508ab934a939ab199d44d943c4e5e543ec13ffb8`
- MCP initialize server version: `0.1.0-private.0`
- source revision: `5eba892b6be5407b0ac4aa658f398f7b2eec5373`
- source dirty: `false`

Browser-host lane 通过 exact Playwright JSON attestation 的 `5/5` Chromium tests，覆盖 `restricted`、`capability-success`、`capability-rejected`、pending/terminal capability semantics、keyboard reachability、busy state 与 320px/390px overflow。Host receipt 与上述 clean source/resource identity exact join，`namedHostSimulation: false`，最高 ceiling=`process`。

当前 clean committed-tree candidate 与 isolated readback：

- candidate: `runtime-candidates/5eba892-fieldlab-review` (ignored/local-only)
- file closure: `43` files，包括 candidate-owned `scenarios/`、compiled evidence policy、`LICENSE`、`LICENSE-DOCUMENTATION.md` 与 `LICENSING.md`
- bundle digest: `sha256:2e7dba961f82f120fdbdf68e440f5d64f7d0db89f566bf8ea0ff987026e2b014`
- canonical SUL-1.0 SHA-256: `c6d0dde0f0463c800e542d7d64237ffef37f43b17004975a558604f17b5d1af1`
- exact read-back resource bytes: `552146`
- exact read-back resource SHA-256: `13e0d52a1cf4b4239459065d508ab934a939ab199d44d943c4e5e543ec13ffb8`
- package receipt: `tmp/receipts/package.clean-revision@1.json` (ignored/local-only)
- validated receipt: `tmp/receipts/runtime.isolated-readback@1.json` (ignored/local-only)
- proof ceiling: `activated-runtime`，仅限 disposable isolated process

Fresh run 已验证 candidate file/digest closure、candidate-owned full scenario set、四份 receipt 的 transitive prerequisite joins、production dependency install、same-origin `/healthz` release identity、package-authoritative MCP version、MCP discovery/tool call/resource readback、component-only projection，以及在 runtime receipt 落盘前完成 child stop 与 temporary projection cleanup。

公开发布后，GitHub Actions [`Verify` run 33260710317](https://github.com/IndelibleVivi/mcp-app-production-fieldlab/actions/runs/33260710317) 已在 commit `7305e1ddf4491dfa56fe8d653252a81bda0f6da5` 上完成并得到 `success`。`Source and process`、`Local browser host`、`Clean package and isolated runtime` 三个 jobs 全部通过，check-run annotation count 均为 `0`。该 run 验证的是 exact remote CI process 与它生成的 isolated candidate；它不证明 operator-selected production runtime、tunnel、named host 或 owner acceptance。

| Boundary id                   | Status         | Current claim                                                                  |
| ----------------------------- | -------------- | ------------------------------------------------------------------------------ |
| `source-checks`               | `verified`     | Clean commit `5eba892...` 通过 docs/schema/scenario/type/unit/build/MCP checks |
| `resource-roundtrip`          | `verified`     | Fresh clean process 返回上列 exact self-contained resource identity            |
| `local-host-matrix`           | `verified`     | Exact five-test Playwright attestation 通过；ceiling=`process`                 |
| `clean-runtime-candidate`     | `verified`     | `43`-file candidate 与 release manifest 绑定 clean commit `5eba892...`         |
| `isolated-runtime-readback`   | `verified`     | 同一 candidate 在 disposable local process 中复现；ceiling=`activated-runtime` |
| `remote-ci-execution`         | `verified`     | Run `33260710317` 在 commit `7305e1d...` 上三 job 全绿且零 annotations         |
| `operator-production-runtime` | `not_verified` | 未尝试 operator service installation 或 production selection                   |
| `tunnel`                      | `not_verified` | External gate；未访问 credential/profile，未运行 preflight/activation          |
| `named-host`                  | `not_verified` | External/account gate；未执行 authenticated named-host exercise                |
| `owner-acceptance`            | `not_verified` | Owner-only gate；未请求或记录 owner observation                                |
| `release-publication`         | `not_verified` | 未创建 GitHub Release，也未进行 registry/container publication                 |

## Remaining gates

Public `main` 已 push，remote CI 已按上列 run 验证。Operator production selection、container activation/publication、tunnel、named host、owner acceptance 与 GitHub/npm publication 继续是独立 gates；本轮均未执行。未经各自授权与实际 execution，不提升 status。
