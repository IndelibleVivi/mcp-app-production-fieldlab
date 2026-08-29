# MCP App Production Field Lab agent contract

Read `SPEC.md`, `README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, and `docs/current-state.md` before changing programme order, trust boundaries, public claims, or scenario semantics.

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
- `scripts/package-runtime.mjs`: clean committed-tree package candidate. It must refuse dirty source and existing outputs.
- `docs/runbooks/`: operator procedures and exact evidence ceilings. A runbook never proves that its procedure ran.
- `tmp/`, `runtime-candidates/`, Playwright traces, screenshots, and raw receipts are local-only and ignored.

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
- This repository has no project-original public license. Do not add one or inherit another repository's terms without owner confirmation and a provenance review.

## Verification

For shared contract changes run `npm run check` and `npm run test:host`. Packaging or release-identity changes additionally require a clean committed-tree `npm run package:runtime -- --out=<new ignored path>` followed by `npm run smoke:runtime -- --candidate=<that path>`. Tunnel, named-host, and owner claims require their separate authorized runbooks and fresh receipts.
