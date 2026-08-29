import { z } from "zod";
import {
  assertScenarioGraphPolicy,
  AUTHORIZATION_CLASSES,
  EXERCISE_SURFACES,
  METHOD_RUNGS,
  SCENARIO_BOUNDARIES,
} from "./policy.js";

export { SCENARIO_BOUNDARIES } from "./policy.js";

export const scenarioSchema = z
  .object({
    format: z.literal("mcp-app-fieldlab-scenario@1"),
    id: z.string().regex(/^[a-z0-9][a-z0-9.-]+$/),
    revision: z.string().regex(/^[1-9][0-9]*$/),
    boundary: z.enum(SCENARIO_BOUNDARIES),
    claim: z.string().min(1),
    observable_input: z.array(z.string().min(1)).min(1),
    expected_observation: z.array(z.string().min(1)).min(1),
    exercise_surface: z.enum(EXERCISE_SURFACES),
    proof_ceiling: z.enum(METHOD_RUNGS),
    authorization_class: z.enum(AUTHORIZATION_CLASSES),
    runner: z.string().min(1).nullable(),
    prerequisite_receipts: z.array(z.string()),
    not_proven: z.array(z.string().min(1)).min(1),
  })
  .strict();

export type FieldlabScenario = z.infer<typeof scenarioSchema>;

export function validateScenarioSet(
  values: readonly unknown[],
): FieldlabScenario[] {
  const scenarios = values.map((value) => scenarioSchema.parse(value));
  assertScenarioGraphPolicy(scenarios);
  return scenarios;
}
