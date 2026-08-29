<!-- docs-pair: licensing-map; locale: en; mirror: LICENSING.zh-CN.md -->

# Licensing

[简体中文](./LICENSING.zh-CN.md)

MCP App Production Field Lab uses layered licensing selected before its first
public-source push. There was no earlier public distribution or public license
grant by the maintainer. This map determines which public license applies to
project-original material in current repository paths.

Repository: `https://github.com/IndelibleVivi/mcp-app-production-fieldlab`

Publication state: `public-source`

Copyright (c) 2026 Faye (@IndelibleVivi) for project-original material she controls.
Contributor and third-party rights remain with their respective rights holders.

Created by Faye & Cove.

## Functional materials: SUL-1.0

The [Sustainable Use License v1.0](LICENSE) applies to the project's original
functional materials, including:

- `src/`, `host-harness/`, `scripts/`, `tests/`, `scenarios/`, `schemas/`,
  `deploy/`, and `.github/workflows/`;
- `FIELDLAB-REGISTER.json`, `DOCS-REGISTER.json`, `package.json`, `package-lock.json`,
  `playwright.config.ts`, `tsconfig.json`, `tsconfig.check.json`, and
  `vite.config.ts`;
- `scripts/validate-docs.mjs` as functional validation code, notwithstanding
  that the Markdown documents it checks are documentation;
- `.dockerignore`, `.gitignore`, `.prettierignore`, and future project-original
  build, CI, packaging, or configuration files; and
- any other project-original functional file not explicitly assigned another
  license in this document.

SUL-1.0 permits personal, non-commercial, and internal business use. It permits
free redistribution or provision to others only for non-commercial purposes.
Required licensing, copyright, and other notices may not be removed or
obscured, and modified copies must identify that they were modified.

SUL-1.0 is source-available and use-restricted. It is not an OSI open-source
license, and this repository must not be described as open source.

## Documentation: CC BY-NC-SA 4.0

The project's original expression in the following documentation paths is
licensed under
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](LICENSE-DOCUMENTATION.md):

License identifier: `CC-BY-NC-SA-4.0`.

- `README.md`, `README.en.md`, `SPEC.md`, `SPEC.en.md`, `AGENTS.md`,
  `LICENSE-DOCUMENTATION.md`, `LICENSING.md`, and `LICENSING.zh-CN.md`;
- project-original files under `docs/`, including Mermaid diagrams and other
  editable diagram sources or rendered projections; and
- project-original expression under `case-studies/`.

The Creative Commons license does not apply to software, schemas, manifests,
tests, fixtures, configuration, or other materials specifically assigned
SUL-1.0 above. The complete SUL text in `LICENSE` and the external Creative
Commons legal code remain under their own governing terms, as stated below.

## Refrain provenance boundary

Refrain is a private source authority cited by the founding case study. These
project licenses cover only the Field Lab's independently written functional
implementation and original documentary expression. They do not grant any
rights in Refrain source, renderer, audio, fixtures, deployment configuration,
runtime evidence, private links, trademarks, or other material owned by its
relevant rights holders.

Source-path citations, repository links, commit identities, and factual
mechanism descriptions preserve provenance; they do not copy, incorporate, or
relicense the cited source.

## Third-party materials and governing texts

No project-level license changes the copyright, license, or attribution of
third-party material. Dependency names and license metadata in
`package-lock.json` do not incorporate or relicense the dependencies
themselves. Installed packages remain governed by their own terms.

This Git repository does not vendor `node_modules`, built third-party bundles,
runtime candidates, or container images. A future distribution of a bundled
runtime, image, package, or release requires a fresh review of the actual
third-party closure and any applicable license-text, notice, attribution, and
source-offer duties.

The complete Sustainable Use License text in `LICENSE` and the Creative
Commons legal code linked from `LICENSE-DOCUMENTATION.md` remain under their
own governing terms.

## Separate permissions

Rights outside these public licenses require a separate written agreement from
the relevant rights holder. Faye can be contacted through
[@IndelibleVivi](https://github.com/IndelibleVivi) regarding material she
controls. This statement does not offer commercial rights in third-party,
private-source, or external-contributor material.
