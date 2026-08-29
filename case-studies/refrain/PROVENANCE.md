<!-- docs-pair: refrain-provenance; locale: zh-CN; mirror: case-studies/refrain/PROVENANCE.en.md -->

# Refrain case-study provenance

[English](./PROVENANCE.en.md)

## Source record

| Field                | Value                                                 |
| -------------------- | ----------------------------------------------------- |
| Source repository    | `https://github.com/IndelibleVivi/refrain`            |
| Source visibility    | Private；links 需要 repository access                 |
| Reviewed commit      | `3e25c4b61eacaad502b4942e285855a7c38871ca`            |
| Review date          | 2026-08-29                                            |
| Role                 | Founding observation for neutral mechanism extraction |
| Runtime relationship | None；Refrain 不是 Field Lab dependency               |
| Rights effect        | 无 rights transfer 或 license inheritance             |

Exact source pin 也记录于 [`FIELDLAB-REGISTER.json`](../../FIELDLAB-REGISTER.json)。Refrain 后续变化不会静默更新本 case study；new review 必须明确 new commit，并 deliberate revision extraction record。

## Inspected private-source surfaces

Field Lab 首次 public-source publication 前重新确认 Refrain 仍是 private。下列 paths 为已有权限的 readers 保留 exact provenance；本 repository 只发布 independently written mechanism extraction，不重新分发任何 cited source bytes：

- `packages/mcp-server/src/self-contained-view.ts`
- `packages/mcp-server/src/self-contained-view.test.ts`
- `packages/mcp-server/src/server-factory.ts`
- `packages/mcp-server/src/release-identity.ts`
- `tests/mcp-host/mcp-host.pw.ts`
- `scripts/package-mcp-runtime.mjs`
- `deploy/openai-tunnel/refrain-tunnel-preflight`
- `docs/TESTING.md`

这些 paths 支持 [`CASE-STUDY.md`](CASE-STUDY.md) 中的 factual mechanism map：self-contained resource delivery、explicit local host profiles、clean candidate identity、configured tunnel target authority 与 evidence-ladder separation。

## Extraction boundary

Field Lab 独立实现 neutral specimen 与 generic observations，不复制或 vendor：

- Refrain source files 或 code snippets；
- renderer components、visual composition 或 screenshots；
- music/AIR schemas、fixtures、compiled events 或 artifact payloads；
- audio engine、samples、soundpacks 或 listening decisions；
- service units、container images、credentials、tunnel IDs、ports、domains 或 private URLs；
- raw browser/host logs、conversations 或 owner acceptance material。

进入 case study 的只有 reusable engineering mechanisms、source-path citations 与 pinned provenance fact。Factual mechanism extraction 不转移 ownership、authorship、product authority 或 source redistribution permission。

## License boundary

Field Lab 的 project-original functional materials 使用 `SUL-1.0`；project-original documentation、diagrams 与 case-study expression 使用 `CC-BY-NC-SA-4.0`，exact path map 见 [`LICENSING.md`](../../LICENSING.md)。这些 grants 只覆盖 relevant Field Lab licensors 控制的 rights，不许可或改变 private Refrain source、cited paths、product assets、runtime evidence、trademarks、dependency material 或其他 third-party rights 的状态。

对本 Field Lab 已授权的 public-source publication：

1. cited source visibility 与 rights/provenance record 已重新检查；
2. tracked tree 必须没有 copied product code、private evidence 与 machine-specific facts；
3. layered Field Lab licenses 不得被表述为对 Refrain/third-party material 的 grant；
4. 后续 license change 或 separate commercial permission 必须按 material 与 rights holder 重新选择；
5. 只有 later versioned public release 才可能支持在 Field Guide docs 中加入小型 companion link。
