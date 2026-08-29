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

Fresh local verification completed on 2026-08-29 for source/process, declared local-browser, clean-package, and isolated-runtime boundaries. The current license-bearing package/runtime proof is pinned to clean source commit `dbab424196d4acd1eae1b73f7f26d7e0a9a43889`. The review-hardening source changes require a new candidate from the clean implementation commit that the root creates; this old identity must not be reused. The earlier 27-file candidate for `ed016da10d034160989066a69348914c14188da7` remains historical pre-license evidence only.

The recorded baseline `npm run check` covered:

- register and layered-license validation;
- `2` generated-schema checks;
- `7` scenario validations;
- TypeScript typechecking;
- `10` unit tests;
- production build;
- real MCP client discovery, tool call, and exact resource roundtrip.

The review-hardening change adds documentation/source semantic validation and focused unit coverage. The final test count must be updated from a fresh full check on the clean implementation commit, not from working-tree intent.

The baseline MCP process receipt is local-only at `tmp/receipts/mcp-resource-roundtrip.json` and binds:

- resource: `ui://mcp-app-production-fieldlab/inspect-boundary/v1.html`
- MIME: `text/html;profile=mcp-app`
- bytes: `550779`
- SHA-256: `7638ebdc38857bc980a43a5740c7a49c29a61ddd12207c7baf2816491daa73b3`

The review-hardening UI lane passed a fresh bounded local rerun of `5/5` Chromium tests across `restricted`, `capability-success`, and `capability-rejected`, adding assertions for pending/terminal capability semantics, keyboard reachability, busy state, and 320px/390px overflow. The ledger still requires zero unexpected network and leaves named-host/owner in `not_proven`. Its highest ceiling remains `process`.

The currently registered clean committed-tree package and isolated readback still belong to the pre-review source commit above:

- candidate: `runtime-candidates/dbab424-fieldlab-v0.1.0` (ignored/local-only)
- file closure: `30` files, including `LICENSE`, `LICENSE-DOCUMENTATION.md`, and `LICENSING.md` as digest-bound manifest members
- bundle digest: `sha256:228458dbb93a818f53cda77dc414cfa705a5df028902ed0c0790194e3c082c56`
- canonical SUL-1.0 SHA-256: `c6d0dde0f0463c800e542d7d64237ffef37f43b17004975a558604f17b5d1af1`
- exact read-back resource bytes: `550779`
- exact read-back resource SHA-256: `7638ebdc38857bc980a43a5740c7a49c29a61ddd12207c7baf2816491daa73b3`
- validated receipt: `tmp/receipts/runtime.isolated-readback@1.json` (ignored/local-only)
- proof ceiling: `activated-runtime`, limited to the disposable isolated process

That historical smoke verified candidate files/digests, production dependency installation, same-origin `/healthz` release identity, MCP discovery, tool call, resource readback, and component-only projection. Because the review-hardening source/package contract changes, a new clean committed revision must be packaged and smoked before replacing the candidate source revision, file count, bundle digest, resource bytes/hash, and receipt path here, in the Chinese mirror, and in `DOCS-REGISTER.json`.

| Boundary id                   | Status         | Current claim                                                                                   |
| ----------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `source-checks`               | `verified`     | Baseline local check passed; final review-hardening count awaits the clean implementation check |
| `resource-roundtrip`          | `verified`     | Baseline fresh local process returned the exact bytes above; new build identity awaits refresh  |
| `local-host-matrix`           | `verified`     | Fresh bounded review-hardening rerun `5/5`; ceiling=`process`                                   |
| `clean-runtime-candidate`     | `verified`     | Only the pre-review `dbab424...` candidate; new source cannot reuse this evidence               |
| `isolated-runtime-readback`   | `verified`     | Only the same pre-review disposable candidate process                                           |
| `remote-ci-execution`         | `not_verified` | Workflow source exists, but no qualifying remote GitHub Actions run was observed in this pass   |
| `operator-production-runtime` | `not_verified` | No operator service installation or production selection was attempted                          |
| `tunnel`                      | `not_verified` | External gate; no credential/profile access or preflight/activation was attempted               |
| `named-host`                  | `not_verified` | External/account gate; no authenticated named-host exercise was attempted                       |
| `owner-acceptance`            | `not_verified` | Owner-only gate; no owner observation was requested or recorded                                 |
| `release-publication`         | `not_verified` | No GitHub Release or registry/container publication was created                                 |

## Next safe closure sequence

1. Run final local checks over the complete review-hardening source/docs/tests/workflow diff and create clean implementation commit A.
2. Build a new ignored runtime candidate from commit A, run isolated smoke, and record the exact source revision, file count, bundle digest, resource bytes/hash, and receipt path. Do not reuse the `dbab424...` candidate.
3. Synchronize the exact current-state facts in this file, `current-state.md`, and `DOCS-REGISTER.json` as documentation-only commit B. Do not present commit B as the candidate identity.
4. Keep remote CI, operator production selection, tunnel, named host, owner acceptance, and release publication as separate gates. Do not promote status without each gate's authorization and actual execution.
