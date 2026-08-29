<!-- docs-pair: current-state; locale: en; mirror: docs/current-state.md -->

# Current state

[简体中文](./current-state.md)

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

The Field Guide remains unchanged while this Lab has no versioned public release. A public source repository is not a companion release; `FIELDLAB-REGISTER.json` remains the one-way method/provenance link.

## Implemented source surfaces

- one deterministic, read-only `inspect_boundary` tool;
- one explicit-version, self-contained MCP App resource whose build closure rejects static/dynamic chunk escape and unsafe asset paths;
- separate model/component-shared output and component-only metadata;
- one canonical declarative evidence policy, scenario prerequisite graph/ceiling validation, and exact scenario-aware receipt validation;
- capability-gated message/download probes: discovery preserves `pending`/terminal distinctions, in-flight actions are disabled with `aria-busy`, and bridge dispositions do not invent an unobserved host cause;
- receipt/scenario schemas preserving exact method rungs, subject identities, evidence references, distinct capability dispositions, and `not_proven`;
- seven boundary scenarios from local resource delivery through owner acceptance;
- declared local-host profiles and an observation ledger that explicitly sets `namedHostSimulation: false`;
- clean-package and isolated-runtime commands;
- layered `SUL-1.0` / `CC-BY-NC-SA-4.0` licensing with private-source/third-party exclusions propagated into runtime candidates;
- Chinese-default plus English-mirror documentation, `DOCS-REGISTER.json`, and a documentation validator limited to structure/shared facts;
- credential-free, read-only GitHub Actions workflow source; remote CI execution remains `not_verified` until a real remote run;
- operator runbooks and a pinned, public-safe Refrain mechanism case study.

## Evidence status

Fresh local verification completed on 2026-08-29 for the review-hardening source/process, declared local-browser, clean-package, and isolated-runtime boundaries. The current package/runtime proof is pinned to clean implementation commit `5eba892b6be5407b0ac4aa658f398f7b2eec5373`. This file is the subsequent evidence-only documentation update and does not change candidate identity. Earlier `dbab424...` and `ed016da...` candidates remain historical evidence only, not proof for the current revision.

On the clean commit, `npm run check` covered:

- register, layered-license, and bilingual-document validation;
- `2` generated-schema checks;
- `7` scenario validations;
- TypeScript typechecking;
- `40` unit tests across `7/7` test files;
- production build;
- real MCP client discovery, tool call, and exact resource roundtrip.

The fresh MCP process receipt is local-only at `tmp/receipts/mcp-resource-roundtrip.json` and binds:

- resource: `ui://mcp-app-production-fieldlab/inspect-boundary/v1.html`
- MIME: `text/html;profile=mcp-app`
- bytes: `552146`
- SHA-256: `13e0d52a1cf4b4239459065d508ab934a939ab199d44d943c4e5e543ec13ffb8`
- MCP initialize server version: `0.1.0-private.0`
- source revision: `5eba892b6be5407b0ac4aa658f398f7b2eec5373`
- source dirty: `false`

The browser-host lane passed an exact Playwright JSON attestation for `5/5` Chromium tests covering `restricted`, `capability-success`, `capability-rejected`, pending/terminal capability semantics, keyboard reachability, busy state, and 320px/390px overflow. The host receipt joins the clean source/resource identity above exactly, sets `namedHostSimulation: false`, and has ceiling=`process`.

The current clean committed-tree candidate and isolated readback are:

- candidate: `runtime-candidates/5eba892-fieldlab-review` (ignored/local-only)
- file closure: `43` files, including candidate-owned `scenarios/`, compiled evidence policy, `LICENSE`, `LICENSE-DOCUMENTATION.md`, and `LICENSING.md`
- bundle digest: `sha256:2e7dba961f82f120fdbdf68e440f5d64f7d0db89f566bf8ea0ff987026e2b014`
- canonical SUL-1.0 SHA-256: `c6d0dde0f0463c800e542d7d64237ffef37f43b17004975a558604f17b5d1af1`
- exact read-back resource bytes: `552146`
- exact read-back resource SHA-256: `13e0d52a1cf4b4239459065d508ab934a939ab199d44d943c4e5e543ec13ffb8`
- package receipt: `tmp/receipts/package.clean-revision@1.json` (ignored/local-only)
- validated receipt: `tmp/receipts/runtime.isolated-readback@1.json` (ignored/local-only)
- proof ceiling: `activated-runtime`, limited to the disposable isolated process

The fresh run verified the candidate file/digest closure, candidate-owned full scenario set, transitive joins across the four receipts, production dependency installation, same-origin `/healthz` release identity, package-authoritative MCP version, MCP discovery/tool call/resource readback, component-only projection, and successful child stop plus temporary-projection cleanup before persisting the runtime receipt.

| Boundary id                   | Status         | Current claim                                                                                 |
| ----------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| `source-checks`               | `verified`     | Clean commit `5eba892...` passed docs/schema/scenario/type/unit/build/MCP checks              |
| `resource-roundtrip`          | `verified`     | Fresh clean process returned the exact self-contained resource identity above                 |
| `local-host-matrix`           | `verified`     | Exact five-test Playwright attestation passed; ceiling=`process`                              |
| `clean-runtime-candidate`     | `verified`     | The `43`-file candidate and release manifest bind clean commit `5eba892...`                   |
| `isolated-runtime-readback`   | `verified`     | The same candidate reproduced in a disposable local process; ceiling=`activated-runtime`      |
| `remote-ci-execution`         | `not_verified` | Workflow source exists, but no qualifying remote GitHub Actions run was observed in this pass |
| `operator-production-runtime` | `not_verified` | No operator service installation or production selection was attempted                        |
| `tunnel`                      | `not_verified` | External gate; no credential/profile access or preflight/activation was attempted             |
| `named-host`                  | `not_verified` | External/account gate; no authenticated named-host exercise was attempted                     |
| `owner-acceptance`            | `not_verified` | Owner-only gate; no owner observation was requested or recorded                               |
| `release-publication`         | `not_verified` | No GitHub Release or registry/container publication was created                               |

## Remaining gates

This pass did not push. Workflow source exists, but remote GitHub Actions has not run. Remote CI, operator production selection, container activation/publication, tunnel, named host, owner acceptance, and GitHub/npm publication remain separate gates. Do not promote status without each gate's authorization and actual execution.
