# Current state

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
- Method authority: MCP Server Engineering Field Guide `2.0.1`, pinned to commit `dcb2c61a060948f92d35918af43919bdfde8b01a`
- Founding observation: Refrain commit `3e25c4b61eacaad502b4942e285855a7c38871ca`

Field Guide remains unchanged while this Lab has no versioned public release. The public source repository alone does not establish a companion release; `FIELDLAB-REGISTER.json` remains the one-way method/provenance link.

## Implemented source surfaces

- one deterministic, read-only `inspect_boundary` tool;
- one explicit-version, self-contained MCP App resource;
- separate model/component shared output and component-only metadata;
- capability-gated message/download probes with portable fallback;
- receipt and scenario schemas with explicit method rungs and `not_proven`;
- seven boundary scenarios from local resource delivery through owner acceptance;
- declared local-host profiles and an observation ledger that explicitly sets `namedHostSimulation: false`;
- clean-package and isolated-runtime commands specified by the repository contract;
- layered SUL-1.0 / CC BY-NC-SA 4.0 licensing with private-source and third-party exclusions propagated into runtime candidates;
- operator runbooks and a pinned, public-safe Refrain mechanism case study.

## Evidence status

Fresh local verification was completed on 2026-08-29 for the source/process, declared local-browser, clean-package and isolated-runtime boundaries. The package/runtime proof is bound to the initial clean source commit `ed016da10d034160989066a69348914c14188da7`; the later current-state update is documentation-only and does not replace that candidate identity.

`npm run check` passed with:

- register validation;
- two generated-schema checks;
- seven scenario validations;
- TypeScript typecheck;
- nine unit tests;
- production build;
- real MCP client discovery, tool call and exact resource roundtrip.

The MCP process receipt is local-only at `tmp/receipts/mcp-resource-roundtrip.json`. It binds:

- resource: `ui://mcp-app-production-fieldlab/inspect-boundary/v1.html`
- MIME: `text/html;profile=mcp-app`
- bytes: `550779`
- SHA-256: `7638ebdc38857bc980a43a5740c7a49c29a61ddd12207c7baf2816491daa73b3`

The declared local-host matrix passed `4/4` Chromium tests across `restricted`, `capability-success` and `capability-rejected`. The final rerun recorded zero console errors, page errors and unexpected network requests. Visual QA found and fixed a UTF-8 HTTP projection defect before that rerun; its screenshot remains local-only. This evidence stops at the `process` ceiling and leaves named-host/owner claims unproven.

The clean committed-tree package and isolated readback then passed for the exact source commit above:

- candidate: `runtime-candidates/ed016da-fieldlab-v0.1.0` (ignored/local-only);
- file closure: `27` files;
- bundle digest: `sha256:98c9ad89b492afaa256895dd3cf5dc818c7b684a80b249bc5e08beed9d3cc594`;
- exact read-back resource SHA-256: `7638ebdc38857bc980a43a5740c7a49c29a61ddd12207c7baf2816491daa73b3`;
- validated receipt: `tmp/receipts/runtime.isolated-readback@1.json` (ignored/local-only);
- proof ceiling: `activated-runtime`, limited to the disposable isolated process.

The smoke verified candidate file bytes/digests, production dependency installation, same-origin `/healthz` release identity, MCP discovery, tool call, resource readback and component-only projection. It did not build or activate a container, install an operator service, select a production runtime, touch a tunnel, use a named host or request owner acceptance.

| Boundary                                        | Status         | Current claim                                                                         |
| ----------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| register/schema/scenario/source checks          | `verified`     | `npm run check` passed on 2026-08-29                                                  |
| production build + MCP resource roundtrip       | `verified`     | Fresh local process returned the exact self-contained resource bytes above            |
| local declared-host matrix                      | `verified`     | Process ceiling only; 4/4 cases passed with a clean browser observation ledger        |
| clean committed-tree runtime candidate          | `verified`     | Exact commit, 27-file closure and bundle digest recorded above                        |
| isolated candidate readback                     | `verified`     | Disposable candidate process reproduced health/tool/resource identities; ceiling only |
| operator-selected production runtime            | `not_verified` | No operator service installation or production selection was attempted                |
| tunnel configured-target authority / activation | `not_verified` | External gate; no credential/profile access, preflight or activation was attempted    |
| named-host acceptance                           | `not_verified` | External/account gate; no authenticated named-host exercise was attempted             |
| owner acceptance                                | `not_verified` | Owner-only gate; no owner observation was requested or recorded                       |

## Next safe closure sequence

1. Retain the ignored candidate and receipts as local evidence for source commit `ed016da10d034160989066a69348914c14188da7`.
2. Keep the public repository distinct from a GitHub Release, npm publication, separate commercial permission, or wider license; none of those later gates has been exercised.
3. Stop. Operator production selection, tunnel, named-host, owner acceptance, release publication and license changes require their own authorization.
