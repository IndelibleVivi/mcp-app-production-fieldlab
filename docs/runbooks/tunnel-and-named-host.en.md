<!-- docs-pair: tunnel-named-host-runbook; locale: en; mirror: docs/runbooks/tunnel-and-named-host.md -->

# Tunnel and named-host acceptance runbook

[简体中文](./tunnel-and-named-host.md)

This document defines external evidence contracts. It is **not** an executable default and does not authorize credential access, tunnel/service changes, deployment, authenticated host interaction, or owner acceptance. The corresponding scenarios retain `runner: null`.

The current status of tunnel, named host, and owner is `not_verified`.

## Gates and required authority

| Gate                        | Minimum authority                                                                      | Side effects                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Configured-target preflight | Operator explicitly authorizes the selected credential/profile and target              | Reads private config; may contact the exact loopback runtime                  |
| Runtime/tunnel activation   | Operator explicitly authorizes the exact immutable candidate and service/tunnel action | May start/restart services and change live traffic                            |
| Named-host exercise         | Explicit authorization for the named account/host and fresh task/conversation          | Account interaction, connector discovery/cache effects, possible private logs |
| Owner acceptance            | Owner deliberately observes and records the exact interaction                          | Human judgment; may contain private acceptance material                       |

Authorization for one row does not authorize later rows. A successful local package or isolated smoke authorizes none of them.

## 1. Freeze the selected subject

Before any external action, record outside Git:

- exact source revision;
- exact runtime candidate/bundle digest and, when applicable, immutable image/service identity;
- exact MCP endpoint path and same-origin health endpoint;
- exact tunnel profile selected by the operator;
- intended named host/account/workspace and date;
- rollback target and stop condition.

If any value is ambiguous, stop. Do not infer a port, host alias, credential file, or active service from an example.

## 2. Configured-target authority

The preflight must derive its MCP target from the same credential-bearing configuration that the tunnel process will use. It must not accept a second target environment variable or hard-coded fallback.

Required observations:

- exactly one MCP server URL is configured;
- the target is loopback HTTP with the exact MCP path;
- credentials/query/fragment data are absent from the target URL;
- under the initially pinned profile, the route returns 2xx or one of the recognized protocol statuses `400`, `405`, `406`, `415`, never a generic `404`;
- the same-origin health endpoint reports the operator-selected runtime identity;
- no alternate port or configuration source silently wins.

A later protocol/profile revision must review this accepted-status set explicitly. Do not widen it because an unexpected response happens to be reachable.

Passing the preflight can verify configured-target authority for that exact config/runtime pair. It does not prove that the tunnel process is running, public reachability, named-host discovery/resource admission, or owner acceptance.

## 3. Activation

Only after explicit authorization:

1. snapshot the currently selected immutable runtime and tunnel state;
2. activate the exact preflighted runtime using the target project's operator-owned procedure;
3. re-read health and MCP resource identity from the selected live origin;
4. start/restart only the specifically authorized tunnel/service;
5. rerun configured-target preflight against the same profile;
6. on mismatch, stop and use the predeclared rollback path.

Do not put credentials, private URLs, service logs, or target-specific IDs in this repository. A target project owns its deployment commands and rollback truth; this Field Lab owns only the neutral evidence shape.

## 4. Fresh named-host exercise

Use a newly authorized task/conversation so stale discovery or cached resource state can be distinguished from the selected revision. Record privately:

- named host, account/workspace context, and observation time;
- selected source/bundle/runtime/resource identities;
- whether tool discovery found the intended tool;
- whether resource admission mounted the exact versioned bytes rather than an older projection;
- observed capability discovery and exact disposition, such as `success`, `rejected`, `cancelled`, `policy_denied`, or `technical_failure`;
- console/UI evidence needed to support the bounded claim;
- every higher or adjacent claim still unproven.

A local `restricted` or `capability-success` profile is not named-host evidence. Likewise, a named host succeeding once does not establish other hosts/accounts, future cache/policy behavior, or undocumented API stability.

## 5. Owner acceptance

Owner acceptance is a separate deliberate observation after named-host evidence exists. The owner must be able to identify:

- exact revision/runtime and named-host surface;
- required visible interactions and negative/fallback behavior;
- acceptance criteria being judged;
- accepted, rejected, or deferred disposition.

Automation cannot upgrade a named-host receipt to owner acceptance. Keep raw owner notes/screenshots outside Git unless the owner separately authorizes and sanitizes a public projection.

## Receipt disposition

Until an authorized step actually runs, write `not_verified` with the exact `not_verified_reason`; do not manufacture a failed or verified receipt from a runbook. When an attempt runs:

- `verified` means the exact stated claim was observed;
- `failed` means an attempted required observation contradicted or could not complete for an evidenced reason;
- capability result remains separate from overall claim status;
- every receipt names one method rung and keeps `not_proven` non-empty.

Current repository truth:

| Boundary                       | Status         |
| ------------------------------ | -------------- |
| configured-target/tunnel       | `not_verified` |
| operator-selected live runtime | `not_verified` |
| named host                     | `not_verified` |
| owner acceptance               | `not_verified` |
