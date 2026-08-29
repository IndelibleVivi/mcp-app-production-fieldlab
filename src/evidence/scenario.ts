import { z } from "zod";
import { METHOD_RUNGS } from "./receipt.js";

export const SCENARIO_BOUNDARIES = [
  "transport-route",
  "resource-admission",
  "asset-plane",
  "host-bridge-envelope",
  "iframe-sandbox-policy",
  "optional-host-capability",
  "artifact-runtime-identity",
  "tunnel-target",
  "named-host-acceptance",
  "owner-interaction",
] as const;

export const scenarioSchema = z
  .object({
    format: z.literal("mcp-app-fieldlab-scenario@1"),
    id: z.string().regex(/^[a-z0-9][a-z0-9.-]+$/),
    revision: z.string().regex(/^[1-9][0-9]*$/),
    boundary: z.enum(SCENARIO_BOUNDARIES),
    claim: z.string().min(1),
    observable_input: z.array(z.string().min(1)).min(1),
    expected_observation: z.array(z.string().min(1)).min(1),
    exercise_surface: z.enum([
      "source-inspection",
      "local-process",
      "built-artifact",
      "local-browser-harness",
      "clean-package",
      "isolated-runtime",
      "activated-runtime",
      "named-host",
      "owner",
    ]),
    proof_ceiling: z.enum(METHOD_RUNGS),
    authorization_class: z.enum([
      "ordinary-local",
      "operator-local",
      "external-side-effect",
      "owner-only",
    ]),
    runner: z.string().min(1).nullable(),
    prerequisite_receipts: z.array(z.string()),
    not_proven: z.array(z.string().min(1)).min(1),
  })
  .strict();

export type FieldlabScenario = z.infer<typeof scenarioSchema>;
