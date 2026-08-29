# Current state

Updated: 2026-08-29

## Classification

- Status: `local-private`
- Version: `0.1.0-private.0`
- Remote: not configured
- Project-original license: not selected
- Public release: none
- Method authority: MCP Server Engineering Field Guide `2.0.1`, pinned to commit `dcb2c61a060948f92d35918af43919bdfde8b01a`
- Founding observation: Refrain commit `3e25c4b61eacaad502b4942e285855a7c38871ca`

Field Guide remains unchanged while this Lab has no public release. `FIELDLAB-REGISTER.json` is the one-way companion/version link.

## Implemented source surfaces

- one deterministic, read-only `inspect_boundary` tool;
- one explicit-version, self-contained MCP App resource;
- separate model/component shared output and component-only metadata;
- capability-gated message/download probes with portable fallback;
- receipt and scenario schemas with explicit method rungs and `not_proven`;
- seven boundary scenarios from local resource delivery through owner acceptance;
- declared local-host profiles and an observation ledger that explicitly sets `namedHostSimulation: false`;
- clean-package and isolated-runtime commands specified by the repository contract;
- operator runbooks and a pinned, public-safe Refrain mechanism case study.

## Evidence status

Fresh local verification was completed on 2026-08-29 for the source/process and declared local-browser boundaries. The repository has not yet made its initial clean commit, so clean-package and isolated-runtime claims remain `not_verified` for this repo revision. An independent worker temp snapshot is not accepted as this repository's package receipt.

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

| Boundary                                        | Status         | Current claim                                                                             |
| ----------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------- |
| register/schema/scenario/source checks          | `verified`     | `npm run check` passed on 2026-08-29                                                      |
| production build + MCP resource roundtrip       | `verified`     | Fresh local process returned the exact self-contained resource bytes above                |
| local declared-host matrix                      | `verified`     | Process ceiling only; 4/4 cases passed with a clean browser observation ledger            |
| clean committed-tree runtime candidate          | `not_verified` | No artifact receipt exists for this repo revision; initial clean commit is still required |
| isolated candidate readback                     | `not_verified` | No qualifying candidate for this repo revision has been executed                          |
| operator-selected production runtime            | `not_verified` | No operator service installation or production selection was attempted                    |
| tunnel configured-target authority / activation | `not_verified` | External gate; no credential/profile access, preflight or activation was attempted        |
| named-host acceptance                           | `not_verified` | External/account gate; no authenticated named-host exercise was attempted                 |
| owner acceptance                                | `not_verified` | Owner-only gate; no owner observation was requested or recorded                           |

## Next safe closure sequence

1. Commit the intended public-safe source/docs as one clean initial revision.
2. From that exact clean revision, create a new ignored runtime candidate and run isolated readback.
3. Update this file only from the repository's qualifying candidate/receipt evidence.
4. Stop. Operator production selection, tunnel, named-host, remote/publication and owner steps require their own authorization.
