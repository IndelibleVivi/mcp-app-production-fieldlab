<!-- docs-pair: package-loopback-runbook; locale: zh-CN; mirror: docs/runbooks/package-and-loopback.en.md -->

# Package 与 loopback runtime runbook

[English](./package-and-loopback.en.md)

本 runbook 只覆盖 ordinary local work：source/process verification、clean runtime packaging 与 isolated loopback readback。它不安装或激活 production service，不启动 tunnel，不接触账户，不发布 remote，也不产生 named-host/owner evidence。

## Preconditions

- Node.js 满足 `package.json` engines。
- Dependencies 已通过 exact lockfile 执行 `npm ci`。
- Intended files 已 commit，`git status --short` 为空；后续 resource/host receipts 必须在这个 exact clean revision 上 fresh 生成。
- Output path 被 ignored、只用于这一次 run，且当前不存在。
- 仅在 browser lane 在 scope 时安装 Playwright Chromium。

不要把 workspace root、home directory、unresolved environment variable 或 broad glob 作为 output target。

## 1. 建立 source/process evidence

```bash
git status --short --branch
npm run check
npm run test:host
```

这两个命令都是 package prerequisites，而不是可选的相邻检查：

- `npm run check` 的 `test:mcp` 末段写 `tmp/receipts/mcp-resource-roundtrip.json`；
- `npm run test:host` 通过 `scripts/run-host-evidence.ts` 消费 Playwright JSON report closure；只有 exact five canonical tests 全部各通过一次、zero skipped/unexpected/flaky/report errors，且 resource prerequisite receipt 一起通过 receipt-set validation 后，才写 `tmp/receipts/mcp-host-profile-matrix.json`。没有 standalone successful writer path。

两份 receipts 必须为 `verified`，其 `method_rung` 必须精确达到各自 scenario claim rung `process`，并拥有相同 `subject.source_revision`、`subject.source_dirty: false` 与 exact resource identity，分别带 `resource:sha256:<subject.resource.sha256>` evidence ref。它们都保持 ignored/local-only。Selected source revision dirty、receipt stale/missing 或 required checks failing 时不得继续 package。

## 2. 创建 clean candidate

选择新的 ignored output path：

```bash
npm run package:runtime -- --out=runtime-candidates/fieldlab-review
```

Packager 必须：

1. 拒绝 dirty source；
2. 拒绝 existing output path；
3. 解析 current committed revision；
4. 用 pinned lockfile 在 detached clean worktree 内 build；
5. 只复制 package contract 声明的 runtime roots；
6. 包含 `scenarios/` 下 candidate 自己的 exact scenario JSON authority；
7. 包含 source revision 携带的 canonical SUL terms、documentation notice 与 path map；
8. 从 local-only receipt directory 读取 resource/host receipts，并确认它们绑定 exact clean revision；
9. 使用 staged candidate 自己的完整 scenario set 与 compiled validators 验证 scenario graph、两份 prerequisite receipts 和新 `package.clean-revision@1` receipt；
10. 计算 sorted per-file byte counts/SHA-256 与一个 bundle digest，并写入 `sourceDirty: false` 的 `release.json`；
11. 原子采用 completed candidate path 后，将 package receipt 原子写入 `tmp/receipts/package.clean-revision@1.json`。

任何条件失败都应保留 error，并在 artifact boundary 分类。不要从 developer checkout 复制 compiled output，也不要原地修改 candidate。

## 3. 检查 artifact identity

Candidate 必须含 `release.json`。以下命令只读检查：

```bash
node --input-type=module -e '
  import { readFile } from "node:fs/promises";
  const path = "runtime-candidates/fieldlab-review/release.json";
  const release = JSON.parse(await readFile(path, "utf8"));
  console.log({
    format: release.format,
    sourceRevision: release.sourceRevision,
    sourceDirty: release.sourceDirty,
    bundleDigest: release.bundleDigest,
    fileCount: release.files?.length
  });
'
```

Expected identity shape：

- `format`: `mcp-app-fieldlab-runtime@1`
- `sourceRevision`: exact 40-character commit id
- `sourceDirty`: `false`
- `bundleDigest`: `sha256:<64 hex>`
- non-empty、unique、safe relative file entries，带 exact byte/SHA-256 identities
- `LICENSE`、`LICENSE-DOCUMENTATION.md`、`LICENSING.md` 与 `scenarios/` 进入 exact file closure
- `tmp/receipts/package.clean-revision@1.json` 存在，并以 `source_revision` 连接两份 verified process receipts、以 `bundle_digest` 绑定 `release.json`

这证明 candidate artifact 存在，不证明 candidate 可以执行。

## 4. 运行 isolated readback

```bash
npm run smoke:runtime -- --candidate=runtime-candidates/fieldlab-review
```

Smoke 必须使用 fresh temporary projection 与 unused loopback port，在其中安装 production dependencies，启动 candidate 而不是 developer output，然后验证：

- candidate files 与 manifest 的 exact byte/digest identities；
- `/healthz` 报告 expected source revision、bundle digest 与 file count；
- fresh MCP initialize 报告 packaged `package.json` authority 的 exact server version，且 list/call 成功；
- exact versioned resource 被 listed/read，resource MIME/bytes 重现 specimen contract；
- 从 repository local-only receipt directory 读取 resource、host 与 package receipts；
- candidate runtime 使用自己的完整 `scenarios/` 与 compiled receipt policy，加入 `runtime.isolated-readback@1` 后验证 four-receipt set，而不是回读 developer checkout authority；
- validator 对 runtime receipt 的完整 transitive prerequisite closure 执行 joins：与 package 共享 exact source revision + bundle digest，并与 resource/host ancestors 共享 exact source revision + resource（URI/MIME/bytes/SHA-256）；即使 package omits resource，runtime resource 仍受 process ancestors 约束；
- child 已成功停止、temporary runtime projection 已成功清理、candidate 未改变；只有这些 teardown conditions 都成立后才持久化 runtime receipt。

结果只覆盖 exact isolated candidate/process。它不建立 operator service installation、production selection、container/image activation、tunnel association、named-host admission 或 owner acceptance。

## 5. 保存 bounded evidence

Raw receipts、temporary installs、runtime candidates、Playwright output 与 screenshots 留在 ignored/local-only paths。Receipt 应记录 scenario revision、source revision、bundle identity、resource identity、environment、exact observations、evidence refs、limitations 与非空 `not_proven`。

| Scenario receipt                | Path                                            |
| ------------------------------- | ----------------------------------------------- |
| `mcp-app.resource-roundtrip@1`  | `tmp/receipts/mcp-resource-roundtrip.json`      |
| `mcp-app.host-profile-matrix@1` | `tmp/receipts/mcp-host-profile-matrix.json`     |
| `package.clean-revision@1`      | `tmp/receipts/package.clean-revision@1.json`    |
| `runtime.isolated-readback@1`   | `tmp/receipts/runtime.isolated-readback@1.json` |

Every attempted receipt carrying `subject.resource` 必须同时有 exact `resource:sha256:<subject.resource.sha256>` evidence ref。对每份 attempted dependent，validator 收集完整 transitive prerequisite closure，要求所有 ancestors 为 `verified`，并对每个 ancestor/dependent pair 比较双方都携带的 `source_revision`、exact `resource`、`bundle_digest`、`runtime_identity`。因此 package 与 resource/host ancestors 比较 clean source revision；runtime 与 package 比较 source revision + bundle digest，同时与 transitive resource/host ancestors 比较 source revision + complete resource identity。

Public CI 不上传或跨 jobs 共享这些 raw receipts。因此 `clean-package-runtime` job 必须在同一个 clean checkout/job 内顺序重跑 `npm run check`、`npm run test:host`、package 与 smoke。Workflow source 存在不证明 remote run 已发生；remote CI execution 继续是 `not_verified`。

若以后准备 shareable sanitized receipt，必须移除 credentials、private URLs、account identifiers 与 raw host/owner material。Sanitization 不会把 derived evidence 变成 independent reproduction。

## Failure routing

| Observation                                                            | Classify at                 | Do not claim                  |
| ---------------------------------------------------------------------- | --------------------------- | ----------------------------- |
| Type/build/unit/docs-policy failure                                    | source/build                | package 或 runtime status     |
| Tool/resource discovery 或 readback mismatch                           | local MCP process           | browser/host 或 deployment    |
| Iframe/bridge/capability/network failure                               | declared local-host harness | ChatGPT/named-host behavior   |
| dirty/stale prerequisite receipt、scenario closure 或 manifest failure | clean artifact              | runtime activation            |
| candidate starts but health/MCP/receipt mismatch                       | isolated runtime            | operator production selection |
| child stop 或 temporary runtime cleanup 失败                           | isolated runtime            | persisted runtime receipt     |

同一个 apparent surface 连续两次 repair 失败后，应重新判断真实 failure 属于 route、resource admission、asset plane、bridge、capability、package identity、scenario authority 还是 runtime identity，再继续修改。
