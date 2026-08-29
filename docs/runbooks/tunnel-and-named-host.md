<!-- docs-pair: tunnel-named-host-runbook; locale: zh-CN; mirror: docs/runbooks/tunnel-and-named-host.en.md -->

# Tunnel 与 named-host acceptance runbook

[English](./tunnel-and-named-host.en.md)

本文定义 external evidence contracts。它**不是** executable default，也不授权访问 credentials、修改 tunnel/service、deployment、authenticated host interaction 或 owner acceptance。相应 scenarios 保持 `runner: null`。

Tunnel、named host 与 owner 的当前状态都是 `not_verified`。

## Gates 与 required authority

| Gate                        | Minimum authority                                                    | Side effects                                                                  |
| --------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Configured-target preflight | Operator 明确授权使用 selected credential/profile 与 target          | 读取 private config；可能联系 exact loopback runtime                          |
| Runtime/tunnel activation   | Operator 明确授权 exact immutable candidate 与 service/tunnel action | 可能启动/重启 services 并改变 live traffic                                    |
| Named-host exercise         | 明确授权 named account/host 与 fresh task/conversation               | Account interaction、connector discovery/cache effects、possible private logs |
| Owner acceptance            | Owner deliberate observation，并记录 exact interaction               | Human judgment；可能包含 private acceptance material                          |

授权一行不等于授权后续行。Local package 或 isolated smoke 成功不会授权其中任何 gate。

## 1. Freeze selected subject

在任何 external action 前，于 Git 外记录：

- exact source revision；
- exact runtime candidate/bundle digest，以及适用时 immutable image/service identity；
- exact MCP endpoint path 与 same-origin health endpoint；
- operator 选择的 exact tunnel profile；
- intended named host/account/workspace 与日期；
- rollback target 与 stop condition。

任一值不明确就停止。不要从 example 推断 port、host alias、credential file 或 active service。

## 2. Configured-target authority

Preflight 必须从 tunnel process 将使用的同一 credential-bearing configuration 推导 MCP target，不能接受第二个 target environment variable 或 hard-coded fallback。

Required observations：

- exactly one MCP server URL 被配置；
- target 是带 exact MCP path 的 loopback HTTP；
- target URL 不含 credentials/query/fragment data；
- 在初始 pinned profile 下，route 返回 2xx 或 recognized protocol status `400`、`405`、`406`、`415`，不能是 generic `404`；
- same-origin health endpoint 报告 operator-selected runtime identity；
- alternate port 或其他 config source 没有静默胜出。

后续 protocol/profile revision 必须显式审阅 accepted-status set；不能因为 unexpected response 恰好可达就放宽它。

通过 preflight 可以验证 exact config/runtime pair 的 configured-target authority，但不证明 tunnel process 正在运行、public reachability、named-host discovery/resource admission 或 owner acceptance。

## 3. Activation

只有在 explicit authorization 之后：

1. snapshot 当前 selected immutable runtime 与 tunnel state；
2. 用 target project 的 operator-owned procedure 激活 exact preflighted runtime；
3. 从 selected live origin 重新读取 health 与 MCP resource identity；
4. 只启动/重启明确授权的 tunnel/service；
5. 对同一 profile 重新运行 configured-target preflight；
6. 发生 mismatch 时停止，并使用预先声明的 rollback path。

不要把 credentials、private URLs、service logs 或 target-specific IDs 放进本 repository。Target project 拥有 deployment commands 与 rollback truth；Field Lab 只拥有 neutral evidence shape。

## 4. Fresh named-host exercise

使用新授权的 task/conversation，使 stale discovery 或 cached resource state 可以和 selected revision 区分。私下记录：

- named host、account/workspace context 与 observation time；
- selected source/bundle/runtime/resource identities；
- tool discovery 是否找到 intended tool；
- resource admission 是否挂载 exact versioned bytes，而不是 older projection；
- capability discovery 与 exact disposition（如 `success`、`rejected`、`cancelled`、`policy_denied`、`technical_failure`）；
- 支持 bounded claim 所需的 console/UI evidence；
- 所有仍未证明的 higher/adjacent claims。

Local `restricted` 或 `capability-success` profile 不是 named-host evidence。同样，named host 一次成功不建立其他 hosts/accounts、future cache/policy behavior 或 undocumented API stability。

## 5. Owner acceptance

Owner acceptance 是 named-host evidence 之后独立的 deliberate observation。Owner 必须能识别：

- exact revision/runtime 与 named-host surface；
- required visible interactions 与 negative/fallback behavior；
- 正在判断的 acceptance criteria；
- accepted、rejected 或 deferred disposition。

Automation 不能把 named-host receipt 升级成 owner acceptance。Raw owner notes/screenshots 留在 Git 外，除非 owner 另行授权并清理 public projection。

## Receipt disposition

在 authorized step 实际运行前，写 `not_verified` 与 exact `not_verified_reason`；不要根据 runbook 伪造 failed 或 verified receipt。一旦 attempted run 发生：

- `verified` 表示 exact stated claim 被观察；
- `failed` 表示 attempted required observation 出现有 evidence 的矛盾或无法完成；
- capability result 与 overall claim status 分开；
- 每份 receipt 只命名一个 method rung，并保持 `not_proven` 非空。

当前 repository truth：

| Boundary                       | Status         |
| ------------------------------ | -------------- |
| configured-target/tunnel       | `not_verified` |
| operator-selected live runtime | `not_verified` |
| named host                     | `not_verified` |
| owner acceptance               | `not_verified` |
