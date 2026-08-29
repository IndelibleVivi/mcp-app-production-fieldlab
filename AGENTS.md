# MCP App Production Field Lab agent contract

Read `SPEC.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/current-state.md`, and `DOCS-REGISTER.json` before changing programme order, trust boundaries, public claims, scenario semantics, or shared bilingual facts.

## Authority

- This repository executes neutral MCP App production scenarios and records bounded evidence. It does not own general repository-work methods, MCP protocol interpretation, named-host policy, or target-product runtime truth.
- MCP Server Engineering Field Guide is the method/profile authority. Pin its released repository identity and commit in `FIELDLAB-REGISTER.json`; do not copy its profiles or create a second MCP reasoning skill here.
- Softpowers owns general implementation, debugging, and verification workflow. This repo supplies domain-specific executable seams and receipts, not another workflow router.
- Refrain is the founding evidence source, not a runtime dependency. Keep Refrain product code, fixtures, renderer, audio, deployment configuration, and owner acceptance in Refrain.

## Canonical paths

- `src/server.ts`: one neutral tool and its exact production resource registration.
- `src/resource-contract.ts` and `src/self-contained-view.ts`: resource URI, MIME, metadata, and exact JS/CSS inlining contract.
- `src/views/inspect-boundary.tsx`: the neutral dual-consumer UI; optional host actions are capability-gated.
- `host-harness/`: declared local host profiles and observation ledger. It is not a ChatGPT emulator and cannot issue named-host receipts.
- `scenarios/`: versioned domain scenarios. Keep scenario boundaries specific; do not group route, admission, asset, bridge, sandbox, capability, runtime, tunnel, named-host, and owner failures because they look alike in the UI.
- `schemas/`: scenario and receipt structural contracts. Status is `verified`, `failed`, or `not_verified`; capability disposition and causal confidence remain separate dimensions.
- `scripts/package-runtime.mjs`: clean committed-tree package candidate. It must refuse dirty source and existing outputs, and every candidate/image must carry the complete layered license boundary.
- `docs/runbooks/`: operator procedures and exact evidence ceilings. A runbook never proves that its procedure ran.
- `DOCS-REGISTER.json` and `scripts/validate-docs.mjs`: the bilingual pair topology and structural/shared-fact synchronization check. They do not prove semantic translation equivalence.
- `tmp/`, `runtime-candidates/`, Playwright traces, screenshots, and raw receipts are local-only and ignored.

## Paired documentation

- Chinese (`zh-CN`) is the canonical/default public documentation locale. Every pair in `DOCS-REGISTER.json` must retain exact invisible pair metadata and reciprocal language switches.
- Edit both members of an affected pair in the same change. Keep identifiers, commands, URIs, MIME values, release/commit identities, hashes, proof ceilings, status vocabulary, publication state, and license names factually synchronized; write natural independent prose rather than mechanical line-by-line translation.
- `AGENTS.md` remains a singleton agent contract. `LICENSE` and `LICENSE-DOCUMENTATION.md` remain governing singletons. `LICENSING.md` is the governing English path map; `LICENSING.zh-CN.md` is informative only and must say so near its top.
- When candidate or evidence facts change, update both `docs/current-state.md` and `docs/current-state.en.md` together, then update the registered current-state facts in `DOCS-REGISTER.json`. Until a remote workflow actually completes, remote CI execution remains `not_verified`.

## Evidence boundaries

- Keep source, process, artifact, activated runtime, named host, and owner observation distinct. Each receipt has one `method_rung` and explicit `not_proven` claims.
- A local host surrogate reproduces only declared observable envelopes. It does not reproduce host account policy, discovery cache, undocumented APIs, tunnel state, or owner acceptance.
- Record exact resource URI and resource content identity separately from source, package, image, and activated-runtime identity.
- Missing observation is `not_verified`, not a failure. A sanitized receipt remains derived evidence, not independent reproduction.
- Do not calculate a digest unless it binds exact bytes to a package, resource, or runtime identity decision.

## External gates

- Ordinary checks may build, run loopback processes, launch the bundled Playwright Chromium, and create ignored local candidates.
- Tunnel starts, authenticated named-host exercises, deployments, restarts, account changes, remote publication, and owner-acceptance recording require exact authorization for that external action.
- Credentials, cookies, private URLs, raw host conversations, private logs, and owner-only acceptance material stay outside Git.

## Replacement and dependencies

- Keep one canonical implementation per behavior. Remove superseded helpers, flags, scenarios, tests, and docs when no evidenced caller needs them.
- Pin dependencies used by evidence-bearing lanes. Do not add frameworks, hosted services, or compatibility paths without a current scenario that needs them.
- This repository uses the path-level license map in `LICENSING.md`: SUL-1.0 for project-original functional materials and CC BY-NC-SA 4.0 for project-original documentation, diagrams, and case-study expression. Preserve private Refrain exclusions, third-party terms, and governing license texts. Do not widen, replace, or inherit terms without owner confirmation and a provenance review.

## Verification

For shared contract changes run `npm run check` and `npm run test:host`. `npm run check` includes the bilingual structural/shared-fact validator; it does not certify translation semantics. Packaging or release-identity changes additionally require a clean committed-tree `npm run package:runtime -- --out=<new ignored path>` followed by `npm run smoke:runtime -- --candidate=<that path>`. Tunnel, named-host, and owner claims require their separate authorized runbooks and fresh receipts.
