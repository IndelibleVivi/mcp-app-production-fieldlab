import { describe, expect, it } from "vitest";
import { parseReceipt } from "../../src/evidence/receipt.js";

function validReceipt() {
  return {
    format: "mcp-app-fieldlab-receipt@1" as const,
    generated_at: "2026-08-29T12:00:00.000Z",
    scenario: { id: "mcp-app.resource-roundtrip", revision: "1" },
    claim: {
      text: "The local MCP process returned one exact App resource.",
      status: "verified" as const,
      method_rung: "process" as const,
      proof_ceiling: "process" as const,
    },
    subject: {},
    environment: { class: "local-process" as const },
    observations: { resource_count: 1 },
    evidence_refs: ["local:tmp/receipts/mcp-resource-roundtrip.json"],
    limitations: [],
    not_proven: ["named-host admission", "owner acceptance"],
  };
}

describe("evidence receipt", () => {
  it("keeps observed status, capability disposition, and proof rung separate", () => {
    expect(
      parseReceipt({
        ...validReceipt(),
        capability: {
          discovery: "available",
          disposition: "rejected",
        },
        root_cause_confidence: "unknown",
      }),
    ).toMatchObject({
      claim: { status: "verified", method_rung: "process" },
      capability: { discovery: "available", disposition: "rejected" },
    });
  });

  it("requires a reason for missing observation and prevents rung inflation", () => {
    expect(() =>
      parseReceipt({
        ...validReceipt(),
        claim: {
          ...validReceipt().claim,
          status: "not_verified",
        },
      }),
    ).toThrow(/exact reason/);
    expect(() =>
      parseReceipt({
        ...validReceipt(),
        claim: {
          ...validReceipt().claim,
          method_rung: "named-host",
          proof_ceiling: "process",
        },
      }),
    ).toThrow(/cannot exceed/);
  });
});
