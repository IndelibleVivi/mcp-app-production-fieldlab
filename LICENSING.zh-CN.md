<!-- docs-pair: licensing-map; locale: zh-CN; mirror: LICENSING.md -->

# 许可说明

[English](./LICENSING.md)

> **仅供中文阅读便利。**本文件不是独立或同等效力的许可文本。若本文件与 `LICENSE`、`LICENSE-DOCUMENTATION.md` 或 governing English map `LICENSING.md` 有任何冲突，以这三份 governing singleton / map 为准。

MCP App Production Field Lab 在首次公开 source push 前选择了 layered licensing。此前 maintainer 没有进行公开分发，也没有作出公开许可授权。本 map 说明当前 repository paths 中 project-original material 分别适用哪一份公开许可。

Repository：`https://github.com/IndelibleVivi/mcp-app-production-fieldlab`

Publication state：`public-source`

Copyright (c) 2026 Faye (@IndelibleVivi)，限于她控制的 project-original material。Contributor 与 third-party rights 仍归各自权利人所有。

Created by Faye & Cove.

## 功能性材料：SUL-1.0

[Sustainable Use License v1.0](LICENSE) 适用于本项目原创的功能性材料，包括：

- `src/`、`host-harness/`、`scripts/`、`tests/`、`scenarios/`、`schemas/`、`deploy/` 与 `.github/workflows/`；
- `FIELDLAB-REGISTER.json`、`DOCS-REGISTER.json`、`package.json`、`package-lock.json`、`playwright.config.ts`、`tsconfig.json`、`tsconfig.check.json` 与 `vite.config.ts`；
- `scripts/validate-docs.mjs` 作为功能性 validation code；它所检查的 Markdown 文档仍属于 documentation；
- `.dockerignore`、`.gitignore`、`.prettierignore`，以及未来 project-original 的 build、CI、packaging 或 configuration files；
- 本文件没有明确分配给其他许可的其他 project-original 功能性文件。

SUL-1.0 允许 personal、non-commercial 与 internal business use。只有在免费且非商业的前提下，才允许向他人分发或提供。不得移除或遮蔽要求保留的许可、copyright 与其他 notices；修改后的副本必须标明经过修改。

SUL-1.0 是 source-available、use-restricted 的许可，不是 OSI open-source license。本 repository 不得被描述为 open source。

## 文档：CC BY-NC-SA 4.0

下列 documentation paths 中由本项目原创的表达适用 [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](LICENSE-DOCUMENTATION.md)：

License identifier：`CC-BY-NC-SA-4.0`。

- `README.md`、`README.en.md`、`SPEC.md`、`SPEC.en.md`、`AGENTS.md`、`LICENSE-DOCUMENTATION.md`、`LICENSING.md` 与 `LICENSING.zh-CN.md`；
- `docs/` 下 project-original 的文件，包括 Mermaid diagrams、其他 editable diagram sources 及其 rendered projections；
- `case-studies/` 下 project-original 的表达。

Creative Commons 许可不适用于上文已明确分配给 SUL-1.0 的 software、schemas、manifests、tests、fixtures、configuration 或其他材料。`LICENSE` 中的完整 SUL 文本与外部 Creative Commons legal code 继续受其各自 governing terms 约束，详见下文。

## Refrain provenance 边界

Refrain 是 founding case study 引用的 private source authority。这些 project licenses 只覆盖 Field Lab 独立编写的功能实现与原创文档表达，不授予 Refrain source、renderer、audio、fixtures、deployment configuration、runtime evidence、private links、trademarks 或其他相关权利人材料中的任何权利。

Source-path citations、repository links、commit identities 与 factual mechanism descriptions 用来保留 provenance；它们不复制、纳入或重新许可所引用的 source。

## Third-party materials 与 governing texts

任何 project-level license 都不会改变 third-party material 的 copyright、license 或 attribution。`package-lock.json` 中的 dependency names 与 license metadata 不会纳入或重新许可 dependencies 本身。Installed packages 继续受其各自条款约束。

本 Git repository 不 vendor `node_modules`、built third-party bundles、runtime candidates 或 container images。未来如果分发 bundled runtime、image、package 或 release，必须针对实际 third-party closure 重新审阅适用的 license-text、notice、attribution 与 source-offer obligations。

`LICENSE` 中完整的 Sustainable Use License text，以及 `LICENSE-DOCUMENTATION.md` 所链接的 Creative Commons legal code，继续受其各自 governing terms 约束。

## 另行许可

超出这些公开许可的权利，需要相关权利人另行作出书面约定。关于 Faye 控制的材料，可以通过 [@IndelibleVivi](https://github.com/IndelibleVivi) 联系她。本说明不向 third-party、private-source 或 external-contributor material 提供商业权利。
