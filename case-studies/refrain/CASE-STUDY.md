<!-- docs-pair: refrain-case-study; locale: zh-CN; mirror: case-studies/refrain/CASE-STUDY.en.md -->

# Case study：Refrain MCP App production boundaries

[English](./CASE-STUDY.en.md)

这份 founding case study 从 [Refrain](https://github.com/IndelibleVivi/refrain) 的 reviewed commit [`3e25c4b61eacaad502b4942e285855a7c38871ca`](https://github.com/IndelibleVivi/refrain/commit/3e25c4b61eacaad502b4942e285855a7c38871ca) 抽取可迁移的 engineering mechanisms。它不复制 Refrain product code、renderer、audio behavior、fixtures、deployment configuration 或 private runtime facts。

## 可迁移的问题

一个 MCP App 会跨过多个可以独立失败的 planes：

1. model-visible tool schema/result；
2. MCP resource discovery 与 exact resource read；
3. iframe admission 与 App bridge lifecycle；
4. host CSP/transport topology 下的 external asset/network availability；
5. optional host capabilities 与 negative dispositions；
6. clean package identity 与 running-runtime readback；
7. tunnel target authority；
8. named-host behavior 与 owner acceptance。

Green source build 只覆盖这条链的前部。Refrain implementation 让这些分离变得具体，因为 resource delivery、browser-host behavior、package identity、activated runtime 与 real-host/owner acceptance 需要不同 proof。

## Reviewed source evidence

所有链接都固定到 reviewed commit：

| Refrain surface                                                                                                                                                                                     | Observed mechanism                                                                                                 | Field Lab extraction                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| [`packages/mcp-server/src/self-contained-view.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/packages/mcp-server/src/self-contained-view.ts)           | Exact versioned MCP App resource 组装为 inline built JS/CSS + explicit CSP 的 self-contained HTML                  | Neutral zero-external-asset specimen 与 byte-bound resource receipt                                |
| [`packages/mcp-server/src/server-factory.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/packages/mcp-server/src/server-factory.ts)                     | Tool metadata、resource registration 与 runtime release metadata 在 MCP boundary 相遇，但不是一个 identity         | 一个 neutral tool/resource pair，分离 structured output、`_meta` 与 release identity               |
| [`packages/mcp-server/src/self-contained-view.test.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/packages/mcp-server/src/self-contained-view.test.ts) | Self-contained resource behavior 独立于 target host 被测试                                                         | Host execution 前的 focused resource byte/metadata tests                                           |
| [`tests/mcp-host/mcp-host.pw.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/tests/mcp-host/mcp-host.pw.ts)                                             | Exact production App 在 declared profiles 的 Chromium 中执行，同时观察 console/page/network 与 capability outcomes | Generic `restricted`、`capability-success`、`capability-rejected` local profiles 与 bounded ledger |
| [`scripts/package-mcp-runtime.mjs`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/scripts/package-mcp-runtime.mjs)                                         | Dirty-tree refusal、detached clean worktree、runtime manifest、per-file identity 与 atomic candidate adoption      | Product-neutral clean-package scenario 与 release manifest                                         |
| [`packages/mcp-server/src/release-identity.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/packages/mcp-server/src/release-identity.ts)                 | Runtime identity 与 source/resource identity 分开读回                                                              | Same-origin health identity + exact MCP resource readback                                          |
| [`deploy/openai-tunnel/refrain-tunnel-preflight`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/deploy/openai-tunnel/refrain-tunnel-preflight)             | Tunnel target 来自同一 credential-bearing config；检查 exact loopback path 与 same-origin release health           | Configured-target-authority scenario，无 default external runner                                   |
| [`docs/TESTING.md`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/docs/TESTING.md)                                                                         | Source、browser host、package、activated runtime、remote/owner claims 被写成不同 evidence levels                   | Explicit six-rung receipt model 与 `not_proven` requirements                                       |

## 转化为 generic machinery 的机制

### 1. Exact resource roundtrip

可迁移的 unit 不是 screenshot 或 copied UI，而是：

```text
production build -> resource registration -> resources/list -> resources/read
-> exact HTML bytes -> iframe mount -> observation ledger
```

它在 named-host run 前定位 wrong URI/MIME/resource body，并检测 accidental external asset/chunk dependency。

### 2. Declared host profiles

有用的 local host harness 只声明可观察的 capability envelopes。它可以验证 unsupported actions 保持隐藏、supported request 成功，以及 advertised request 仍可能 rejected。它不能编码或声称 real host 的 account policy、cache、undocumented APIs 或 future behavior。

### 3. Identity-bearing clean candidate

Source revision、resource content、package files、scenario authority、bundle digest 与 running-process identity 保持分离。Package lane 拒绝 dirty source，在 clean detached worktree build；runtime smoke 随后针对 candidate 自己携带的 scenario 验证 packaged receipt，证明 candidate 而不是 developer checkout 能重现自己的 MCP contract。

### 4. Configured-target authority

Tunnel reachability 不只是“某个 port 回应”。Reviewed implementation 要求从 tunnel 使用的同一 operator-owned config 得到一个 exact loopback MCP URL；响应必须是 `2xx` 或 recognized `400`/`405`/`406`/`415`，而不是 generic `404`；same-origin release health 还必须一致。Tunnel activation 与 real-host discovery 继续是后续 gates。

### 5. Evidence ceiling

每个 scenario 都写明可以证明什么、什么仍在边界外。Local browser evidence 结束于 `process`；clean candidate 结束于 `artifact`；running isolated candidate 不暗示 operator production selection；任何 automated rung 都不能变成 owner acceptance。

## 有意留在 Refrain 的内容

- product naming、tool semantics 与 authored output；
- renderer 与 visual-language authority；
- music schemas、compilation、playback、audio assets 与 listening acceptance；
- target-specific service/container/tunnel configuration 与 live identities；
- named-host transcripts、screenshots、private URLs、credentials 与 account facts；
- product owner 的 visual、interaction 与 listening judgment。

Field Lab specimen 使用自己的 neutral UI、scenario data 与 independently written tests。Refrain 仍是 Refrain runtime/product claims 的唯一 authority。

## Resulting claim boundary

Field Lab 可以重现 reusable mechanics，但不能声称重现 Refrain。Local run 可以验证 Lab 自己 specimen 的 source/process/browser/package/isolated-runtime behavior。Refrain deployment、任何 named host 与 owner acceptance 都要求在各自 owning context 中取得 fresh evidence。

Source/rights boundary 见 [PROVENANCE.md](PROVENANCE.md)；本 case 如何接入 neutral Lab 见 [Architecture](../../docs/ARCHITECTURE.md)。
