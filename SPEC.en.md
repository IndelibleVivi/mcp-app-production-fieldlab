<!-- docs-pair: spec; locale: en; mirror: SPEC.md -->

# MCP App Production Field Lab programme contract

[简体中文](./SPEC.md)

## Value proposition

MCP App Production Field Lab is an executable laboratory for MCP server and MCP App maintainers. It is not another Canvas tutorial. It makes source, resource delivery, browser host, package, activated runtime, tunnel, named host, and owner acceptance into reproducible evidence boundaries that cannot silently promote one another.

These facts were first exposed mainly through Refrain's product implementation and deployment work. If they remained only in product code, temporary logs, or a prose case study, they would be difficult for another MCP App to reuse and easy to misstate as production acceptance. The founding review is pinned to Refrain commit `3e25c4b61eacaad502b4942e285855a7c38871ca`, without transferring its source or runtime authority.

Core actions:

1. Run a product-neutral MCP App specimen and inspect its exact tool/resource contract.
2. Mount the exact production resource under named host-capability profiles and observe UI lifecycle, optional host actions, network activity, and failure provenance.
3. Use one canonical evidence policy to validate scenario sets and receipts structurally and across fields, preserving exact claim ceilings for source, process, built package, activated runtime, and later operator-owned host checks.

## Why an MCP App is required

This repository is an engineering field lab, not a conventional website forced into an AI assistant. It needs a real MCP App specimen because the subject is the MCP App dual-consumer contract:

- the model consumer receives the tool description, text content, and structured content;
- the human consumer receives a component projection of the same call in a sandboxed view;
- host bridge behavior, capability discovery, resource admission, and cache identity become observable only inside a real App lifecycle.

The LLM/host supplies intent routing, tool invocation, and conversation context. The specimen supplies deterministic data, resource bytes, component behavior, and verifiable effects. Generation, accounts, OAuth, or durable user state unrelated to the experiment are outside this repository.

## UI overview

**First view:** a compact Boundary Inspector showing the current scenario, resource URI/version, tool-result identity, host profile, and capability-discovery state. It does not present itself as a dashboard.

**Key interactions:**

- the host projects a deterministic `inspect_boundary` tool result into the view;
- the view distinguishes model-visible, component-visible, and UI-only data;
- capability discovery remains `pending` until it completes and is never temporarily described as `missing`;
- selection return, message, or download probes appear only after the host advertises the corresponding capability;
- an in-flight user-initiated request cannot be triggered twice and exposes clear busy/status semantics;
- capability absence, rejection, cancellation, policy denial, and technical failure remain distinct observations;
- the production profile forbids undeclared external asset/network requests.

**End state:** the harness produces a scenario-aware receipt recording observed evidence, artifact/resource identity, environment, claim ceiling, and every higher boundary still unverified. Named-host and owner acceptance require separate operator-owned runs.

## Product context

- **Method authority:** MCP Server Engineering Field Guide release `2.0.1`, pinned to commit `dcb2c61a060948f92d35918af43919bdfde8b01a`. This repository does not copy its protocol profiles, claim taxonomy, or general-purpose skill.
- **Founding target evidence:** Refrain commit `3e25c4b61eacaad502b4942e285855a7c38871ca`. Refrain retains product, renderer, audio, deployment, and current-state authority.
- **Workflow authority:** the canonical Softpowers project. This repository does not create a second general debugging/testing router.
- **Initial protocol profile:** `mcp-2026-07-28`, as assessed by Field Guide profile `2026-08-15`; host-specific compatibility observations name their own date and environment.
- **Reachability:** the specimen defaults to stdio/loopback. It includes no public origin, account, OAuth, or Refrain-operated backend.
- **Dependencies:** only pinned production/dev dependencies needed for the neutral MCP App and real Chromium harness. Refrain's renderer, audio engine, and sound assets are absent.
- **Privacy:** credentials, cookies, private host URLs, raw named-host logs, and unsanitized screenshots do not enter Git. A public-safe receipt is a derived projection, not independent reproduction.
- **Publication:** repository `https://github.com/IndelibleVivi/mcp-app-production-fieldlab` is `public-source`, with no GitHub Release or package publication. Project-original functional material uses `SUL-1.0`; original documentation, diagrams, and case-study expression use `CC-BY-NC-SA-4.0`; `LICENSING.md` is the exact path authority. Later release, registry publication, license changes, or separate commercial permission remain independent owner gates.

## Authority split

| Surface              | Owns                                                                                             | Does not own                                   |
| -------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Field Guide          | Stable methods, dated protocol/integration profiles, evidence grammar, and general skill         | Target runtime or named-host truth             |
| Production Field Lab | Neutral executable specimen, host harness, scenario policy/definitions, package/runtime receipts | Refrain product truth or universal host claims |
| Refrain              | Product source, exact renderer/resource, deployment, and owner acceptance                        | General MCP engineering method                 |
| Softpowers           | General implementation/debug/verification workflow                                               | Field Lab scenarios or MCP protocol authority  |

## Initial complete outcome

The first usable repository version must include:

- one deterministic MCP tool and one explicit-version MCP App resource;
- an exact self-contained production HTML resource whose manifest closure rejects static/dynamic chunk escape and unsafe paths;
- a real MCP client smoke covering discovery, tool call, and resource read;
- a Playwright host harness with at least portable, restricted, and capability-enabled profiles;
- negative-path tests for external network, missing capability, and malformed/incorrect resource identity;
- one declarative evidence policy, semantic scenario-set validation, scenario-aware receipt validation, and generated-schema drift checking;
- a clean-source runtime package, release identity, and process-level activation smoke;
- a path-level `SUL-1.0` / `CC-BY-NC-SA-4.0` license map whose required notices survive runtime packaging;
- complete Chinese-default and English-mirror documentation, a pair registry, and a bounded documentation validator;
- credential-free, read-only GitHub Actions verification source; remote execution remains `not_verified` until it actually runs;
- operator runbooks for package, loopback runtime, tunnel boundary, and named-host acceptance, without pretending the last two have run;
- a pinned, public-safe Refrain founding case study containing no copied product code or private runtime data;
- companion-version linkage back to the Field Guide without a second installable skill.

## Non-goals

- Another MCP Field Guide or general engineering skill.
- A generic hosted testing service, user account system, OAuth provider, or production control plane.
- A copy of Refrain's renderer, music schema, audio assets, deployment identity, or private host configuration.
- A mock named host presented as ChatGPT acceptance.
- CI jobs that require private credentials, real production mutation, or raw-evidence upload.
- Automatic package/registry/release publication, deployment, tunnel activation, or owner-acceptance claims.
- A documentation validator that claims machines have proven full semantic equivalence between bilingual prose.

## Acceptance boundaries

When the relevant checks actually pass, repository completion may prove the source contract, process behavior, browser-harness behavior, clean-package identity, and isolated-candidate readback. It must keep remote CI execution, operator-selected runtime, tunnel, named host, owner observation, and release publication at `not_verified` until each exact run has actually occurred.

## UX flow

Inspect one boundary:

1. The model invokes `inspect_boundary` with a declared scenario and opaque probe ID.
2. The server returns deterministic text, structured content, and component-only metadata while preserving their projection boundaries.
3. The host reads the exact versioned `ui://` resource and mounts the returned production HTML bytes.
4. The view shows the current evidence ceiling, allows one local selection, and offers host-mediated message/download actions only after capability discovery completes and reports that capability as available.
5. The local harness records handshake, action disposition, console/page failures, unexpected network, resource identity, and unproven higher boundaries.

The UI is necessary because the purpose is to make model-visible, component-visible, UI-only, and host-capability projections directly observable. The view is an evidence surface, not a second runtime truth source.

## Tool and view contract

**View tool: `inspect_boundary`**

- **Input:** `{ scenario: "resource-delivery" | "optional-capability", probeId: string }`
- **Structured output:** a deterministic `fieldlab-boundary-result@1` object with cards, portable handoff data, and the process-level evidence ceiling.
- **Text output:** a compact model-readable summary that remains useful without a UI.
- **Component-only metadata:** a non-sensitive marker proving that `_meta` reaches the component projection without being duplicated into model-visible structured content.
- **Resource:** one explicit-version `ui://mcp-app-production-fieldlab/inspect-boundary/v1.html` document with MIME `text/html;profile=mcp-app`.
- **Effects:** read-only server execution. Message/download requests are separate user-initiated host effects inside the view.

No second tool is created for UI selection state. Selection remains ephemeral. A host-mediated follow-up is issued only after a user gesture and capability discovery reports the corresponding capability as available.
