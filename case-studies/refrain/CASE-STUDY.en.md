<!-- docs-pair: refrain-case-study; locale: en; mirror: case-studies/refrain/CASE-STUDY.md -->

# Case study: Refrain MCP App production boundaries

[简体中文](./CASE-STUDY.md)

This founding case study extracts reusable engineering mechanisms from [Refrain](https://github.com/IndelibleVivi/refrain) at reviewed commit [`3e25c4b61eacaad502b4942e285855a7c38871ca`](https://github.com/IndelibleVivi/refrain/commit/3e25c4b61eacaad502b4942e285855a7c38871ca). It does not reproduce Refrain product code, renderer, audio behavior, fixtures, deployment configuration, or private runtime facts.

## The transferable problem

An MCP App crosses several planes that can fail independently:

1. model-visible tool schema/result;
2. MCP resource discovery and exact resource read;
3. iframe admission and App bridge lifecycle;
4. external asset/network availability under host CSP and transport topology;
5. optional host capabilities and negative dispositions;
6. clean package identity and running-runtime readback;
7. tunnel target authority;
8. named-host behavior and owner acceptance.

A green source build covers only the first part of that chain. Refrain's implementation made the separations concrete because resource delivery, browser-host behavior, package identity, activated runtime, and real-host/owner acceptance require different proof.

## Reviewed source evidence

All links are pinned to the reviewed commit:

| Refrain surface                                                                                                                                                                                     | Mechanism observed                                                                                                                | Field Lab extraction                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`packages/mcp-server/src/self-contained-view.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/packages/mcp-server/src/self-contained-view.ts)           | Exact versioned MCP App resource assembled as self-contained HTML with inline built JS/CSS and explicit CSP                       | Neutral zero-external-asset specimen and byte-bound resource receipt                                       |
| [`packages/mcp-server/src/server-factory.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/packages/mcp-server/src/server-factory.ts)                     | Tool metadata, resource registration, and runtime release metadata meet at the MCP boundary without becoming one identity         | One neutral tool/resource pair with distinct structured output, `_meta`, and release identity              |
| [`packages/mcp-server/src/self-contained-view.test.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/packages/mcp-server/src/self-contained-view.test.ts) | Self-contained resource behavior is tested independently from the target host                                                     | Focused resource-byte/metadata tests before host execution                                                 |
| [`tests/mcp-host/mcp-host.pw.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/tests/mcp-host/mcp-host.pw.ts)                                             | Exact production App executes in Chromium under declared profiles while console/page/network and capability outcomes are observed | Generic `restricted`, `capability-success`, and `capability-rejected` local profiles with a bounded ledger |
| [`scripts/package-mcp-runtime.mjs`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/scripts/package-mcp-runtime.mjs)                                         | Dirty-tree refusal, detached clean worktree, runtime manifest, per-file identity, and atomic candidate adoption                   | Product-neutral clean-package scenario and release manifest                                                |
| [`packages/mcp-server/src/release-identity.ts`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/packages/mcp-server/src/release-identity.ts)                 | Runtime identity is read back separately from source/resource identity                                                            | Same-origin health identity plus exact MCP resource readback                                               |
| [`deploy/openai-tunnel/refrain-tunnel-preflight`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/deploy/openai-tunnel/refrain-tunnel-preflight)             | Tunnel target comes from the same credential-bearing config; exact loopback path and same-origin release health are checked       | Configured-target-authority scenario with no default external runner                                       |
| [`docs/TESTING.md`](https://github.com/IndelibleVivi/refrain/blob/3e25c4b61eacaad502b4942e285855a7c38871ca/docs/TESTING.md)                                                                         | Source, browser host, package, activated runtime, and remote/owner claims are documented as separate evidence levels              | Explicit six-rung receipt model and `not_proven` requirements                                              |

## What became generic machinery

### 1. Exact resource roundtrip

The transferable unit is not a screenshot or a copied UI. It is the chain:

```text
production build -> resource registration -> resources/list -> resources/read
-> exact HTML bytes -> iframe mount -> observation ledger
```

This localizes a wrong URI/MIME/resource body before a named-host run and detects accidental external asset or chunk dependency.

### 2. Declared host profiles

A useful local host harness declares only observable capability envelopes. It can test that unsupported actions remain hidden, supported requests succeed, and advertised requests can still be rejected. It cannot encode or claim a real host's account policy, cache, undocumented APIs, or future behavior.

### 3. Identity-bearing clean candidate

Source revision, resource content, package files, scenario authority, bundle digest, and running-process identity remain separate. The package lane refuses dirty source and builds in a clean detached worktree. Runtime smoke then validates the packaged receipt against the scenario carried by the candidate itself, proving that the candidate rather than the developer checkout can reproduce its MCP contract.

### 4. Configured-target authority

Tunnel reachability is not merely “some port answered.” The reviewed implementation requires one exact loopback MCP URL from the same operator-owned configuration used by the tunnel, a `2xx` or recognized `400`/`405`/`406`/`415` protocol response rather than a generic `404`, and matching same-origin release health. Tunnel activation and real-host discovery remain later gates.

### 5. Evidence ceiling

Every scenario names what it can prove and what remains outside. Local browser evidence ends at `process`; a clean candidate ends at `artifact`; a running isolated candidate does not imply operator production selection; and no automated rung becomes owner acceptance.

## What deliberately stayed in Refrain

- product naming, tool semantics, and authored output;
- renderer and visual-language authority;
- music schemas, compilation, playback, audio assets, and listening acceptance;
- target-specific service/container/tunnel configuration and live identities;
- named-host transcripts, screenshots, private URLs, credentials, and account facts;
- product-owner visual, interaction, and listening judgment.

The Field Lab specimen uses its own neutral UI, scenario data, and independently written tests. Refrain remains the only authority for Refrain runtime/product claims.

## Resulting claim boundary

The Field Lab can reproduce reusable mechanics without claiming to reproduce Refrain. A local run may verify source/process/browser/package/isolated-runtime behavior for the Lab's own specimen. Refrain deployment, any named host, and owner acceptance require fresh evidence in their owning context.

See [PROVENANCE.en.md](PROVENANCE.en.md) for the source/rights boundary and [Architecture](../../docs/ARCHITECTURE.en.md) for how this case connects to the neutral Lab.
