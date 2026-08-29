<!-- docs-pair: spec; locale: zh-CN; mirror: SPEC.en.md -->

# MCP App Production Field Lab programme contract

[English](./SPEC.en.md)

## Value proposition

MCP App Production Field Lab 是一个面向 MCP server / MCP App 工程维护者的可执行实验室。它解决的不是“怎样写一篇 Canvas 教程”，而是把 source、resource delivery、browser host、package、activated runtime、tunnel、named host 与 owner acceptance 分成可复现、不可越级的 evidence boundaries。

这些事实最初主要通过 Refrain 的产品实现与部署过程被发现；如果只保留在产品代码、临时日志或 prose case study 中，其他 MCP App 很难复用，也很容易把 local success 误报成 production acceptance。Founding review 固定到 Refrain commit `3e25c4b61eacaad502b4942e285855a7c38871ca`，但不转移其 source 或 runtime authority。

核心 actions：

1. 运行一个无产品逻辑的 neutral MCP App specimen，并检查 exact tool/resource contract。
2. 在明确命名的 host capability profiles 中挂载 exact production resource，观察 UI lifecycle、optional host actions、network activity 与 failure provenance。
3. 用一份 canonical evidence policy 对 scenario set 和 receipts 做结构与跨字段语义校验，为 source、process、built package、activated runtime 以及后续 operator-owned host checks 保留 exact claim ceiling。

## 为什么必须是 MCP App

这个 repo 本身是 engineering field lab，不是把普通网站强行塞进 AI assistant。它必须包含真实 MCP App specimen，因为实验对象正是 MCP App 的 dual-consumer contract：

- model consumer 接收 tool description、text content 与 structured content；
- human consumer 在 sandboxed view 中接收同一调用的 component projection；
- host bridge、capability discovery、resource admission 与 cache identity 只有在真实 App lifecycle 中才可观察。

LLM/host 提供 intent routing、tool invocation 与 conversation context；specimen 提供 deterministic data、resource bytes、component behavior 与可验证 effects。任何与实验无关的生成、账户、OAuth 或 durable user state 均不属于本 repo。

## UI 概览

**First view**：一个紧凑的 Boundary Inspector，显示当前 scenario、resource URI/version、tool-result identity、host profile 与 capability discovery 状态；不伪装成 dashboard。

**Key interactions**：

- host 将 deterministic `inspect_boundary` tool result 投影给 view；
- view 区分 model-visible、component-visible 与 UI-only 数据；
- capability discovery 在完成前保持 `pending`，不会被短暂写成 `missing`；
- 只有 host 声明相应 capability 后，view 才显示 selection return、message 或 download probe；
- user-initiated request 的 in-flight 状态禁止重复触发，并暴露清楚的 busy/status semantics；
- capability 缺失、拒绝、取消、policy denial 与 technical failure 保持不同观察，不压成 generic error；
- production profile 禁止未声明的 external asset/network request。

**End state**：harness 生成 scenario-aware receipt，记录 observed evidence、artifact/resource identity、environment、claim ceiling 与仍未验证的更高层边界。Named-host 与 owner acceptance 必须由后续 operator-owned run 单独补充。

## Product context

- **Method authority**：MCP Server Engineering Field Guide release `2.0.1`，固定 commit `dcb2c61a060948f92d35918af43919bdfde8b01a`；本 repo 不复制其 protocol profiles、claim taxonomy 或通用 skill。
- **Founding target evidence**：Refrain commit `3e25c4b61eacaad502b4942e285855a7c38871ca`；Refrain 保留其产品、renderer、audio、deployment 与 current-state authority。
- **Workflow authority**：canonical Softpowers project；本 repo 不创建第二个通用 debugging/testing router。
- **Initial protocol profile**：`mcp-2026-07-28`，as assessed by Field Guide profile `2026-08-15`；host-specific compatibility observations 另行注明日期与环境。
- **Reachability**：specimen 默认 stdio/loopback；不包含 public origin、账户、OAuth 或 Refrain-operated backend。
- **Dependencies**：只保留 neutral MCP App 与真实 Chromium harness 所需的 pinned production/dev dependencies；不引入 Refrain renderer、audio engine 或 sound assets。
- **Privacy**：credentials、cookies、private host URLs、raw named-host logs 与未经清理的 screenshots 不进入 Git。Public-safe receipt 是 derived projection，不是 independent reproduction。
- **Publication**：repository `https://github.com/IndelibleVivi/mcp-app-production-fieldlab` 的状态是 `public-source`，没有 GitHub Release 或 package publication。Project-original functional material 使用 `SUL-1.0`；原创 documentation、diagrams 与 case-study expression 使用 `CC-BY-NC-SA-4.0`；`LICENSING.md` 是 exact path authority。后续 release、registry publication、license change 或 separate commercial permission 仍是独立 owner gates。

## Authority split

| Surface              | Owns                                                                                             | Does not own                                   |
| -------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Field Guide          | Stable method、dated protocol/integration profiles、evidence grammar、general skill              | Target runtime 或 named-host truth             |
| Production Field Lab | Neutral executable specimen、host harness、scenario policy/definitions、package/runtime receipts | Refrain product truth 或 universal host claims |
| Refrain              | Product source、exact renderer/resource、deployment 与 owner acceptance                          | General MCP engineering method                 |
| Softpowers           | General implementation/debug/verification workflow                                               | Field Lab scenarios 或 MCP protocol authority  |

## Initial complete outcome

首个 usable repository version 必须包含：

- 一个 deterministic MCP tool 与一个 explicit-version MCP App resource；
- exact self-contained production HTML resource；manifest closure 同时拒绝 static/dynamic chunk escape 与 unsafe path；
- real MCP client smoke，覆盖 discovery、tool call 与 resource read；
- Playwright host harness，至少有 portable/restricted/capability-enabled profiles；
- external network、missing capability、malformed/incorrect resource identity 的 negative-path tests；
- 单一 declarative evidence policy、scenario-set semantic validation、scenario-aware receipt validation 与 generated schema drift check；
- clean-source runtime package、release identity 与 process-level activation smoke；
- path-level `SUL-1.0` / `CC-BY-NC-SA-4.0` license map，且 runtime packaging 保留 required notices；
- 完整中文默认 + English mirrors、pair registry 与 bounded docs validator；
- credential-free、read-only GitHub Actions verification source；remote run 在真实完成前仍是 `not_verified`；
- package、loopback runtime、tunnel boundary 与 named-host acceptance 的 operator runbooks，且不假称后两项已经执行；
- pinned、public-safe 的 Refrain founding case study，无 copied product code 或 private runtime data；
- 返回 Field Guide 的 companion-version linkage，但不创建第二个 installable skill。

## Non-goals

- 另一个 MCP Field Guide 或通用 engineering skill。
- Generic hosted testing service、user account system、OAuth provider 或 production control plane。
- Refrain renderer、music schema、audio assets、deployment identity 或 private host config 的副本。
- 把 mock named host 写成 ChatGPT acceptance。
- 要求 private credentials、真实 production mutation 或 raw evidence upload 的 CI jobs。
- 自动 package/registry/release publication、deployment、tunnel activation 或 owner-acceptance claim。
- 用 docs validator 声称机器证明双语 prose 语义完全等价。

## Acceptance boundaries

Repository completion 可以在相关 checks 实际通过时，证明 source contract、process behavior、browser-harness behavior、clean-package identity 与 isolated candidate readback。它必须把 remote CI execution、operator-selected runtime、tunnel、named-host、owner observation 与 release publication 保持为 `not_verified`，直到各自 exact run 真实发生。

## UX flow

Inspect one boundary：

1. Model 用 declared scenario 与 opaque probe ID 调用 `inspect_boundary`。
2. Server 返回 deterministic text、structured content 与 component-only metadata，同时保持 projection boundaries。
3. Host 读取 exact versioned `ui://` resource，并挂载返回的 production HTML bytes。
4. View 显示当前 evidence ceiling，允许一个 local selection，只在 capability discovery 完成且相应能力可用后提供 host-mediated message/download actions。
5. Local harness 记录 handshake、action disposition、console/page failures、unexpected network、resource identity 与未证明的更高层 boundaries。

这里需要 UI，因为目标就是让 model-visible、component-visible、UI-only 与 host-capability projections 可以直接观察。View 是 evidence surface，不是第二个 runtime truth source。

## Tool and view contract

**View tool：`inspect_boundary`**

- **Input**：`{ scenario: "resource-delivery" | "optional-capability", probeId: string }`
- **Structured output**：deterministic `fieldlab-boundary-result@1` object，包含 cards、portable handoff data 与 process-level evidence ceiling。
- **Text output**：即使没有 UI 也有用的 compact model-readable summary。
- **Component-only metadata**：non-sensitive marker，用于证明 `_meta` 到达 component projection 且没有复制进 model-visible structured content。
- **Resource**：一个 explicit-version `ui://mcp-app-production-fieldlab/inspect-boundary/v1.html` document，MIME 为 `text/html;profile=mcp-app`。
- **Effects**：read-only server execution。Message/download requests 是 view 内独立的 user-initiated host effects。

不为 UI selection state 创建第二个 tool。Selection 保持 ephemeral；只有 user gesture 且 capability discovery 给出实际可用状态后，才会发出 host-mediated follow-up。
