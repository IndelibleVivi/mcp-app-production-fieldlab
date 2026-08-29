import { describe, expect, it } from "vitest";
import {
  parseReceipt,
  parseReceiptAgainstScenario,
  validateReceiptSetAgainstScenarios,
} from "../../src/evidence/receipt.js";
import type { FieldlabScenario } from "../../src/evidence/scenario.js";
import {
  FIELDLAB_VIEW_MIME_TYPE,
  FIELDLAB_VIEW_URI,
} from "../../src/resource-contract.js";

const SOURCE_REVISION = "1".repeat(40);
const BUNDLE_DIGEST = `sha256:${"2".repeat(64)}`;
const RESOURCE = {
  uri: FIELDLAB_VIEW_URI,
  mime_type: FIELDLAB_VIEW_MIME_TYPE,
  bytes: 42,
  sha256: "a".repeat(64),
};
const RESOURCE_EVIDENCE_REF = `resource:sha256:${RESOURCE.sha256}`;
const RUNTIME_IDENTITY = {
  sourceRevision: SOURCE_REVISION,
  bundleDigest: BUNDLE_DIGEST,
  fileCount: 30,
};

function resourceScenario(): FieldlabScenario {
  return {
    format: "mcp-app-fieldlab-scenario@1",
    id: "mcp-app.resource-roundtrip",
    revision: "1",
    boundary: "resource-admission",
    claim: "A fresh local process returns one exact App resource.",
    observable_input: ["production build output"],
    expected_observation: ["exact resource bytes"],
    exercise_surface: "local-process",
    proof_ceiling: "process",
    authorization_class: "ordinary-local",
    runner: "npm run test:mcp",
    prerequisite_receipts: [],
    not_proven: ["named-host admission"],
  };
}

function hostScenario(): FieldlabScenario {
  return {
    ...resourceScenario(),
    id: "mcp-app.host-profile-matrix",
    boundary: "optional-host-capability",
    exercise_surface: "local-browser-harness",
    runner: "npm run test:host",
  };
}

function packageScenario(): FieldlabScenario {
  return {
    ...resourceScenario(),
    id: "package.clean-revision",
    boundary: "artifact-runtime-identity",
    exercise_surface: "clean-package",
    proof_ceiling: "artifact",
    runner:
      "npm run package:runtime -- --out=runtime-candidates/fieldlab-v0.1.0",
  };
}

function runtimeScenario(): FieldlabScenario {
  return {
    ...resourceScenario(),
    id: "runtime.isolated-readback",
    boundary: "artifact-runtime-identity",
    exercise_surface: "isolated-runtime",
    proof_ceiling: "activated-runtime",
    runner:
      "npm run smoke:runtime -- --candidate=runtime-candidates/fieldlab-v0.1.0",
  };
}

function ownerScenario(): FieldlabScenario {
  return {
    ...resourceScenario(),
    id: "owner.acceptance",
    boundary: "owner-interaction",
    exercise_surface: "owner",
    proof_ceiling: "owner",
    authorization_class: "owner-only",
    runner: null,
  };
}

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
    subject: { resource: RESOURCE },
    environment: { class: "local-process" as const },
    observations: { resource_count: 1 },
    evidence_refs: [RESOURCE_EVIDENCE_REF],
    limitations: [],
    not_proven: ["named-host admission", "owner acceptance"],
  };
}

function validArtifactReceipt() {
  return {
    ...validReceipt(),
    scenario: { id: "package.clean-revision", revision: "1" },
    claim: {
      ...validReceipt().claim,
      method_rung: "artifact" as const,
      proof_ceiling: "artifact" as const,
    },
    subject: {
      source_revision: SOURCE_REVISION,
      source_dirty: false,
      bundle_digest: BUNDLE_DIGEST,
    },
    environment: { class: "clean-package" as const },
    observations: { file_count: 30 },
    evidence_refs: ["candidate:release.json"],
  };
}

function validRuntimeReceipt() {
  return {
    ...validArtifactReceipt(),
    scenario: { id: "runtime.isolated-readback", revision: "1" },
    claim: {
      ...validArtifactReceipt().claim,
      method_rung: "activated-runtime" as const,
      proof_ceiling: "activated-runtime" as const,
    },
    subject: {
      ...validArtifactReceipt().subject,
      resource: RESOURCE,
      runtime_identity: RUNTIME_IDENTITY,
    },
    environment: { class: "isolated-runtime" as const },
    observations: { health_identity_matched: true, resource_count: 1 },
    evidence_refs: ["candidate:release.json", RESOURCE_EVIDENCE_REF],
  };
}

describe("evidence receipt", () => {
  it("keeps observed status, capability disposition, proof rung, and cause separate", () => {
    expect(
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          scenario: {
            id: "mcp-app.host-profile-matrix",
            revision: "1",
          },
          environment: { class: "local-browser-harness" },
          capability: {
            discovery: "available",
            disposition: "rejected",
          },
          root_cause_confidence: "unknown",
        },
        hostScenario(),
      ),
    ).toMatchObject({
      claim: { status: "verified", method_rung: "process" },
      capability: { discovery: "available", disposition: "rejected" },
      root_cause_confidence: "unknown",
    });
  });

  it.each([
    ["missing", "absent"],
    ["denied", "policy_denied"],
    ["available", "cancelled"],
    ["available", "technical_failure"],
  ] as const)(
    "retains capability discovery %s and disposition %s as exact observations",
    (discovery, disposition) => {
      expect(
        parseReceiptAgainstScenario(
          {
            ...validReceipt(),
            scenario: {
              id: "mcp-app.host-profile-matrix",
              revision: "1",
            },
            environment: { class: "local-browser-harness" },
            capability: { discovery, disposition },
            root_cause_confidence: "probable",
          },
          hostScenario(),
        ),
      ).toMatchObject({
        claim: { status: "verified" },
        capability: { discovery, disposition },
        root_cause_confidence: "probable",
      });
    },
  );

  it("rejects a generic capability error instead of collapsing disposition", () => {
    expect(() =>
      parseReceipt({
        ...validReceipt(),
        capability: {
          discovery: "available",
          disposition: "error",
        },
      }),
    ).toThrow();
  });

  it("rejects illegal discovery/disposition pairings without inferring cause", () => {
    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          scenario: {
            id: "mcp-app.host-profile-matrix",
            revision: "1",
          },
          environment: { class: "local-browser-harness" },
          capability: {
            discovery: "missing",
            disposition: "rejected",
          },
          root_cause_confidence: "unknown",
        },
        hostScenario(),
      ),
    ).toThrow(/discovery missing.*disposition rejected/);
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
          status: "not_verified",
          not_verified_reason: "   ",
        },
      }),
    ).toThrow();
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

  it("rejects receipt scenario and environment mismatches", () => {
    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          scenario: { id: "another.scenario", revision: "1" },
        },
        resourceScenario(),
      ),
    ).toThrow(/scenario.*mcp-app\.resource-roundtrip@1/i);

    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          environment: { class: "clean-package" },
        },
        resourceScenario(),
      ),
    ).toThrow(/environment.*local-process/i);
  });

  it("rejects a receipt rung or ceiling above its scenario ceiling", () => {
    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          claim: {
            ...validReceipt().claim,
            method_rung: "artifact",
            proof_ceiling: "artifact",
          },
        },
        resourceScenario(),
      ),
    ).toThrow(/method_rung.*process/i);

    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          claim: {
            ...validReceipt().claim,
            proof_ceiling: "artifact",
          },
        },
        resourceScenario(),
      ),
    ).toThrow(/proof_ceiling.*process/i);
  });

  it("does not let a lower-rung verified receipt satisfy a higher-rung scenario claim", () => {
    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          claim: {
            ...validReceipt().claim,
            method_rung: "source",
          },
        },
        resourceScenario(),
      ),
    ).toThrow(/must reach.*process.*received source/);
  });

  it("requires attempted artifact and runtime receipts to bind their identities", () => {
    const artifactReceipt = {
      ...validReceipt(),
      scenario: { id: "package.clean-revision", revision: "1" },
      claim: {
        ...validReceipt().claim,
        method_rung: "artifact",
        proof_ceiling: "artifact",
      },
      subject: { source_revision: SOURCE_REVISION, source_dirty: false },
      environment: { class: "clean-package" },
    };
    expect(() =>
      parseReceiptAgainstScenario(artifactReceipt, packageScenario()),
    ).toThrow(/bundle_digest/);

    const { runtime_identity: _runtimeIdentity, ...runtimeSubject } =
      validRuntimeReceipt().subject;
    const runtimeReceipt = {
      ...validRuntimeReceipt(),
      subject: runtimeSubject,
    };
    expect(() =>
      parseReceiptAgainstScenario(runtimeReceipt, runtimeScenario()),
    ).toThrow(/runtime_identity/);

    expect(
      parseReceiptAgainstScenario(
        {
          ...artifactReceipt,
          subject: {
            source_revision: SOURCE_REVISION,
            source_dirty: false,
            bundle_digest: BUNDLE_DIGEST,
          },
        },
        packageScenario(),
      ),
    ).toMatchObject({ claim: { method_rung: "artifact" } });

    expect(
      parseReceiptAgainstScenario(
        {
          ...runtimeReceipt,
          subject: {
            ...runtimeReceipt.subject,
            runtime_identity: RUNTIME_IDENTITY,
          },
        },
        runtimeScenario(),
      ),
    ).toMatchObject({ claim: { method_rung: "activated-runtime" } });
  });

  it("closes artifact/runtime identity shape and exact joins", () => {
    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validArtifactReceipt(),
          subject: {
            ...validArtifactReceipt().subject,
            source_dirty: true,
          },
        },
        packageScenario(),
      ),
    ).toThrow(/source_dirty.*false/);

    const { source_revision: _sourceRevision, ...runtimeWithoutSource } =
      validRuntimeReceipt().subject;
    expect(() =>
      parseReceiptAgainstScenario(
        { ...validRuntimeReceipt(), subject: runtimeWithoutSource },
        runtimeScenario(),
      ),
    ).toThrow(/supplied.*runtime_identity.*source_revision/);

    expect(() =>
      parseReceipt({
        ...validRuntimeReceipt(),
        subject: {
          ...validRuntimeReceipt().subject,
          runtime_identity: {
            ...RUNTIME_IDENTITY,
            fileCount: 0,
          },
        },
      }),
    ).toThrow();

    expect(() =>
      parseReceipt({
        ...validRuntimeReceipt(),
        subject: {
          ...validRuntimeReceipt().subject,
          runtime_identity: {
            ...RUNTIME_IDENTITY,
            imageId: "unscoped-extra-identity",
          },
        },
      }),
    ).toThrow();

    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validRuntimeReceipt(),
          subject: {
            ...validRuntimeReceipt().subject,
            runtime_identity: {
              ...RUNTIME_IDENTITY,
              bundleDigest: `sha256:${"3".repeat(64)}`,
            },
          },
        },
        runtimeScenario(),
      ),
    ).toThrow(/runtime_identity\.bundleDigest.*subject\.bundle_digest/);

    const { resource: _resource, ...subjectWithoutResource } =
      validRuntimeReceipt().subject;
    expect(() =>
      parseReceiptAgainstScenario(
        { ...validRuntimeReceipt(), subject: subjectWithoutResource },
        runtimeScenario(),
      ),
    ).toThrow(/isolated-runtime.*subject\.resource/);
  });

  it("binds resource identity, evidence reference, and scenario not_proven", () => {
    expect(() =>
      parseReceipt({
        ...validReceipt(),
        subject: {
          resource: { ...RESOURCE, uri: "ui://another/resource.html" },
        },
      }),
    ).toThrow();
    expect(() =>
      parseReceipt({
        ...validReceipt(),
        subject: { resource: { ...RESOURCE, bytes: 0 } },
      }),
    ).toThrow();

    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          evidence_refs: [`resource:sha256:${"b".repeat(64)}`],
        },
        resourceScenario(),
      ),
    ).toThrow(/resource:sha256/);

    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          not_proven: ["owner acceptance"],
        },
        resourceScenario(),
      ),
    ).toThrow(/not_proven.*named-host admission/);
  });

  it("allows an honest not_verified external receipt without invented identities", () => {
    expect(
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          scenario: { id: "owner.acceptance", revision: "1" },
          claim: {
            ...validReceipt().claim,
            status: "not_verified",
            method_rung: "owner",
            proof_ceiling: "owner",
            not_verified_reason:
              "No owner observation was requested or recorded.",
          },
          subject: {},
          environment: { class: "owner-observation" },
          observations: {},
          evidence_refs: [],
        },
        ownerScenario(),
      ),
    ).toMatchObject({
      claim: { status: "not_verified" },
      subject: {},
    });
  });

  it("requires attempted claims to contain evidence and actual observations", () => {
    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          observations: {},
          evidence_refs: [],
        },
        resourceScenario(),
      ),
    ).toThrow(/evidence_refs|observations/);

    expect(() =>
      parseReceiptAgainstScenario(
        {
          ...validReceipt(),
          evidence_refs: ["   "],
        },
        resourceScenario(),
      ),
    ).toThrow();
  });

  it("validates prerequisite receipt presence, status, and subject joins", () => {
    const resource = resourceScenario();
    const package_ = {
      ...packageScenario(),
      prerequisite_receipts: ["mcp-app.resource-roundtrip@1"],
    };
    const runtime = {
      ...runtimeScenario(),
      prerequisite_receipts: ["package.clean-revision@1"],
    };
    const scenarios = [resource, package_, runtime];
    const receipts = [
      validReceipt(),
      validArtifactReceipt(),
      validRuntimeReceipt(),
    ];

    expect(
      validateReceiptSetAgainstScenarios(receipts, scenarios),
    ).toHaveLength(3);

    expect(() =>
      validateReceiptSetAgainstScenarios(
        [validReceipt(), validReceipt()],
        scenarios,
      ),
    ).toThrow(/Duplicate receipt scenario identity/);

    expect(() =>
      validateReceiptSetAgainstScenarios(
        [validReceipt(), validRuntimeReceipt()],
        scenarios,
      ),
    ).toThrow(/missing prerequisite receipt package\.clean-revision@1/);

    expect(() =>
      validateReceiptSetAgainstScenarios(
        [
          validReceipt(),
          {
            ...validArtifactReceipt(),
            claim: {
              ...validArtifactReceipt().claim,
              status: "not_verified",
              not_verified_reason: "No clean package was produced.",
            },
            subject: {},
            observations: {},
            evidence_refs: [],
          },
          validRuntimeReceipt(),
        ],
        scenarios,
      ),
    ).toThrow(
      /prerequisite receipt package\.clean-revision@1 must be verified/,
    );

    const mismatchedBundle = `sha256:${"3".repeat(64)}`;
    expect(() =>
      validateReceiptSetAgainstScenarios(
        [
          validReceipt(),
          validArtifactReceipt(),
          {
            ...validRuntimeReceipt(),
            subject: {
              ...validRuntimeReceipt().subject,
              bundle_digest: mismatchedBundle,
              runtime_identity: {
                ...RUNTIME_IDENTITY,
                bundleDigest: mismatchedBundle,
              },
            },
          },
        ],
        scenarios,
      ),
    ).toThrow(/bundle_digest.*prerequisite package\.clean-revision@1/);

    const mismatchedResource = {
      ...RESOURCE,
      sha256: "b".repeat(64),
    };
    expect(() =>
      validateReceiptSetAgainstScenarios(
        [
          validReceipt(),
          validArtifactReceipt(),
          {
            ...validRuntimeReceipt(),
            subject: {
              ...validRuntimeReceipt().subject,
              resource: mismatchedResource,
            },
            evidence_refs: [
              "candidate:release.json",
              `resource:sha256:${mismatchedResource.sha256}`,
            ],
          },
        ],
        scenarios,
      ),
    ).toThrow(/subject\.resource.*prerequisite mcp-app\.resource-roundtrip@1/);
  });
});
