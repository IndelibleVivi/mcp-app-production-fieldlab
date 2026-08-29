# MCP App Production Field Lab

## Value Proposition

MCP App Production Field Lab 是一个面向 MCP server / MCP App 工程维护者的可执行实验室。它解决的问题不是“怎样写一篇 Canvas 教程”，而是把 source、resource delivery、browser host、package、activated runtime、tunnel、named host 与 owner acceptance 分成可复现、不可越级的 evidence boundaries。

当前这些事实主要通过 Refrain 的产品实现与部署过程被发现；如果只保留在产品代码、临时日志或 prose case study 中，其他 MCP App 很难复用，也很容易把 local success 误报成 production acceptance。

**Core actions**:

1. 运行一个无产品逻辑的 neutral MCP App specimen，并检查 exact tool/resource contract。
2. 在明确命名的 host capability profiles 中挂载 exact production resource，观察 UI lifecycle、optional host actions、network activity 与 failure provenance。
3. 为 source、process、built package、activated runtime 和后续 operator-owned host checks 生成分层 evidence receipts；低层证据不得自动提升高层 claim。

## Why an MCP App?

这个 repo 本身是 engineering field lab，不是把普通网站强行塞进 AI assistant。它必须包含一个真实 MCP App specimen，因为实验对象正是 MCP App 的 dual-consumer contract：

- model consumer 接收 tool description、text content 与 structured content；
- human consumer 在 sandboxed view 中接收同一调用的 component projection；
- host bridge、capability discovery、resource admission 与 cache identity 只有在真实 App lifecycle 中才可观察。

LLM/host 提供 intent routing、tool invocation 与 conversation context；specimen 提供 deterministic data、resource bytes、component behavior 与可验证 effects。任何与实验无关的生成、账户、OAuth 或 durable user state 均不属于本 repo。

## UI Overview

**First view**: 一个紧凑的 Boundary Inspector，显示当前 scenario、resource URI/version、tool-result identity、host profile 与已观察 capability；不伪装成 dashboard。

**Key interactions**:

- host 将 deterministic `inspect_boundary` tool result 投影给 view；
- view 显示 model-visible、component-visible 与 UI-only 数据的区别；
- 当 host 声明相应 capability 时，view 才显示 selection return、copy 或 download probe；
- capability 缺失、拒绝、取消与 policy denial 保持为不同观察，不压成一个 generic error；
- production profile 禁止未声明的 external asset/network request。

**End state**: harness 生成一份 scenario receipt，记录 observed evidence、artifact/resource identity、environment、claim ceiling 与仍未验证的更高层边界。Named-host 与 owner acceptance 必须由后续 operator-owned run 单独补充。

## Product Context

- **Method authority**: MCP Server Engineering Field Guide，exact release/commit 由 `FIELDLAB-REGISTER.json` 固定；本 repo 不复制其 protocol profiles、claim taxonomy 或通用 skill。
- **Founding target evidence**: Refrain，reviewed commit 同样由 register 固定；Refrain 保留其产品、renderer、audio、deployment 与 current-state authority。
- **Workflow authority**: canonical Softpowers project；本 repo 不创建第二个通用 debugging/testing router。
- **Initial protocol profile**: `mcp-2026-07-28`, as assessed by Field Guide profile `2026-08-15`；host-specific compatibility observations另行注明日期与环境。
- **Reachability**: specimen 默认 stdio/loopback；不包含 public origin、账户、OAuth 或 Refrain-operated backend。
- **Dependencies**: 只保留运行 neutral MCP App 和真实 Chromium harness 所需的 pinned production/dev dependencies；不引入 Refrain product renderer、audio engine 或 sound assets。
- **Privacy**: credentials、cookies、private host URLs、raw named-host logs 与未经清理的 screenshots 不进入 Git。Public-safe receipt 是 derived projection，不是 independent reproduction。
- **Publication**: source repository 在 owner 明确授权后公开于 `https://github.com/IndelibleVivi/mcp-app-production-fieldlab`。当前没有 GitHub Release、package publication 或 project-original public license；公开可见不构成一般 reuse grant，后续 release、registry publication 与 license selection 仍是独立 owner gates。

## Authority Split

| Surface              | Owns                                                                                      | Does not own                                   |
| -------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Field Guide          | Stable method, dated protocol/integration profiles, evidence grammar, general skill       | Target runtime or named-host truth             |
| Production Field Lab | Neutral executable specimen, host harness, scenario definitions, package/runtime receipts | Refrain product truth or universal host claims |
| Refrain              | Product source, exact renderer/resource, deployment and owner acceptance                  | General MCP engineering method                 |
| Softpowers           | General implementation/debug/verification workflow                                        | Field Lab scenarios or MCP protocol authority  |

## Initial Complete Outcome

The first usable repository version must include:

- one deterministic MCP tool and one explicit-version MCP App resource;
- an exact self-contained production HTML resource with no external asset dependency;
- a real MCP client smoke covering discovery, tool call and resource read;
- a Playwright host harness with at least portable, restricted and capability-enabled profiles;
- negative-path tests for external network, missing capability and malformed/incorrect resource identity;
- a versioned evidence-receipt schema and generated local receipts whose claim ceilings are explicit;
- a clean-source runtime package with release identity and a process-level activation smoke;
- operator runbooks for package, loopback runtime, tunnel boundary and named-host acceptance, without pretending the latter two were executed;
- a Refrain founding case study that cites exact source evidence but contains no copied product code or private runtime data;
- companion-version linkage back to the Field Guide without a second installable skill.

## Non-Goals

- Another MCP Field Guide or another general engineering skill.
- A generic hosted testing service, user account system, OAuth provider or production control plane.
- A copy of Refrain's renderer, music schema, audio assets, deployment identity or private host configuration.
- A mock named host presented as ChatGPT acceptance.
- CI jobs requiring private credentials or real production mutation.
- Automatic package/registry/release publication, deployment, tunnel activation or owner-acceptance claims.

## Acceptance Boundaries

Repository completion may prove source contract, process behavior, browser harness behavior and clean-package activation when those checks run successfully. It must report tunnel, named-host and owner-observed behavior as `not_verified` until their exact operator-owned runs occur.

## UX Flow

Inspect one boundary:

1. The model invokes `inspect_boundary` with a declared scenario and opaque probe ID.
2. The server returns deterministic text, structured content, and component-only metadata while preserving their projection boundaries.
3. The host reads the tool's exact versioned `ui://` resource and mounts the returned production HTML bytes.
4. The view shows the current evidence ceiling, allows one local selection, and exposes host-mediated message/download actions only when the corresponding capability was advertised.
5. The local harness records handshake, action disposition, console/page failures, unexpected network, resource identity, and unproven higher boundaries.

The flow needs UI because its purpose is to make model-visible, component-visible, UI-only, and host-capability projections directly inspectable. The view is an evidence surface, not a second source of runtime truth.

## Tool and View Contract

**View tool: `inspect_boundary`**

- **Input**: `{ scenario: "resource-delivery" | "optional-capability", probeId: string }`
- **Structured output**: a deterministic `fieldlab-boundary-result@1` object with cards, portable handoff data, and the process-level evidence ceiling.
- **Text output**: a compact model-readable summary that remains useful when no UI is available.
- **Component-only metadata**: a non-sensitive marker proving that `_meta` reaches the component projection without being duplicated into model-visible structured content.
- **Resource**: one explicit-version `ui://mcp-app-production-fieldlab/inspect-boundary/v1.html` document with MIME `text/html;profile=mcp-app`.
- **Effects**: read-only server execution. Message/download requests are separate user-initiated host effects inside the view.

No second tool is created for UI selection state. Selection stays ephemeral in the view; a host-mediated follow-up is issued only after a user gesture and capability discovery.
