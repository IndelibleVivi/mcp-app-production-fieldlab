import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  type FieldlabScenario,
  validateScenarioSet,
} from "../../src/evidence/scenario.js";

function scenario(overrides: Partial<FieldlabScenario> = {}): FieldlabScenario {
  return {
    format: "mcp-app-fieldlab-scenario@1",
    id: "mcp-app.resource-roundtrip",
    revision: "1",
    boundary: "resource-admission",
    claim: "One exact resource is returned by a fresh local process.",
    observable_input: ["fresh local process"],
    expected_observation: ["exact resource bytes"],
    exercise_surface: "local-process",
    proof_ceiling: "process",
    authorization_class: "ordinary-local",
    runner: "npm run test:mcp",
    prerequisite_receipts: [],
    not_proven: ["named-host admission"],
    ...overrides,
  };
}

function currentScenarios(): unknown[] {
  const root = path.resolve("scenarios");
  return readdirSync(root)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(path.join(root, file), "utf8")));
}

describe("evidence scenario policy", () => {
  it("accepts the current seven scenarios without changing their semantics", () => {
    expect(validateScenarioSet(currentScenarios())).toHaveLength(7);
  });

  it("rejects duplicate identities and unknown prerequisite identities", () => {
    expect(() => validateScenarioSet([scenario(), scenario()])).toThrow(
      /Duplicate scenario identity mcp-app\.resource-roundtrip@1/,
    );
    expect(() =>
      validateScenarioSet([
        scenario({ prerequisite_receipts: ["missing.scenario@1"] }),
      ]),
    ).toThrow(/unknown prerequisite missing\.scenario@1/);
  });

  it("rejects a local-process scenario with an owner proof ceiling", () => {
    expect(() =>
      validateScenarioSet([scenario({ proof_ceiling: "owner" })]),
    ).toThrow(/local-process.*process/);
  });

  it("rejects an illegal boundary and exercise-surface pairing", () => {
    expect(() =>
      validateScenarioSet([
        scenario({
          boundary: "owner-interaction",
          exercise_surface: "local-process",
        }),
      ]),
    ).toThrow(/owner-interaction.*local-process/);
  });

  it("rejects a non-ordinary gate that exposes a runner", () => {
    expect(() =>
      validateScenarioSet([
        scenario({
          id: "named-host.acceptance",
          boundary: "named-host-acceptance",
          exercise_surface: "named-host",
          proof_ceiling: "named-host",
          authorization_class: "external-side-effect",
          runner: "npm run test:named-host",
        }),
      ]),
    ).toThrow(/external-side-effect.*runner: null/);
  });

  it("rejects prerequisite cycles", () => {
    const first = scenario({
      id: "cycle.first",
      prerequisite_receipts: ["cycle.second@1"],
    });
    const second = scenario({
      id: "cycle.second",
      prerequisite_receipts: ["cycle.first@1"],
    });

    expect(() => validateScenarioSet([first, second])).toThrow(
      /prerequisite cycle/i,
    );
  });

  it("rejects a prerequisite whose ceiling is above its dependent", () => {
    const prerequisite = scenario({
      id: "owner.prerequisite",
      boundary: "owner-interaction",
      exercise_surface: "owner",
      proof_ceiling: "owner",
      authorization_class: "owner-only",
      runner: null,
    });
    const dependent = scenario({
      id: "process.dependent",
      prerequisite_receipts: ["owner.prerequisite@1"],
    });

    expect(() => validateScenarioSet([prerequisite, dependent])).toThrow(
      /owner\.prerequisite@1.*owner.*process\.dependent@1.*process/,
    );
  });

  it("rejects an ordinary-local runner outside the declared safe lane", () => {
    expect(() =>
      validateScenarioSet([scenario({ runner: "npm run deploy" })]),
    ).toThrow(/ordinary-local runner/);
  });
});
