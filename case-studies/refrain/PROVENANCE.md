# Refrain case-study provenance

## Source record

| Field                | Value                                                 |
| -------------------- | ----------------------------------------------------- |
| Source repository    | `https://github.com/IndelibleVivi/refrain`            |
| Reviewed commit      | `3e25c4b61eacaad502b4942e285855a7c38871ca`            |
| Review date          | 2026-08-29                                            |
| Role                 | Founding observation for neutral mechanism extraction |
| Runtime relationship | None; Refrain is not a dependency of this Field Lab   |
| Rights effect        | No rights transfer or license inheritance             |

The exact source pin is also recorded in [`FIELDLAB-REGISTER.json`](../../FIELDLAB-REGISTER.json). Future changes in Refrain do not silently update this case study; a new review must name a new commit and revise the extraction record deliberately.

## Inspected public-safe surfaces

The case study relied on these paths at the pinned commit:

- `packages/mcp-server/src/self-contained-view.ts`
- `packages/mcp-server/src/self-contained-view.test.ts`
- `packages/mcp-server/src/server-factory.ts`
- `packages/mcp-server/src/release-identity.ts`
- `tests/mcp-host/mcp-host.pw.ts`
- `scripts/package-mcp-runtime.mjs`
- `deploy/openai-tunnel/refrain-tunnel-preflight`
- `docs/TESTING.md`

They support the factual mechanism map in [`CASE-STUDY.md`](CASE-STUDY.md): self-contained resource delivery, explicit local host profiles, clean candidate identity, configured tunnel target authority and evidence-ladder separation.

## Extraction boundary

The Field Lab independently implements a neutral specimen and generic observations. It does not copy or vendor:

- Refrain source files or code snippets;
- renderer components, visual composition or screenshots;
- music/AIR schemas, fixtures, compiled events or artifact payloads;
- audio engine, samples, soundpacks or listening decisions;
- service units, container images, credentials, tunnel IDs, ports, domains or private URLs;
- raw browser/host logs, conversations or owner acceptance material.

Only reusable engineering mechanisms, source-path citations and a pinned provenance fact are carried into this case study. Factual mechanism extraction does not transfer ownership, authorship, product authority or permission to redistribute source material.

## License boundary

This repository has no selected project-original public license. Refrain's repository status, dependency licenses or any third-party terms do not supply one. Publication and licensing require a separate rights review and owner choice for each governed material class.

If this Field Lab later becomes public:

1. re-check the cited source visibility and rights/provenance record;
2. verify that no copied product code, private evidence or machine-specific facts entered the tracked tree;
3. select explicit licenses by material and rights holder;
4. create the first public release;
5. only then consider a small companion link in Field Guide documentation.
