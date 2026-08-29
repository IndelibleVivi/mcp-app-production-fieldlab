import { z } from "zod";
import {
  FIELDLAB_VIEW_MIME_TYPE,
  FIELDLAB_VIEW_URI,
} from "../resource-contract.js";
import {
  assertReceiptSubjectIdentityJoin,
  assertReceiptScenarioPolicy,
  CAPABILITY_DISCOVERIES,
  CAPABILITY_DISPOSITIONS,
  compareMethodRungs,
  METHOD_RUNGS,
  RECEIPT_ENVIRONMENT_CLASSES,
  scenarioIdentity,
} from "./policy.js";
import {
  scenarioSchema,
  type FieldlabScenario,
  validateScenarioSet,
} from "./scenario.js";

export { METHOD_RUNGS } from "./policy.js";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const REVISION_PATTERN = /^[a-f0-9]{40}$/;
const BUNDLE_DIGEST_PATTERN = /^sha256:[a-f0-9]{64}$/;
const nonBlankString = z
  .string()
  .min(1)
  .refine((value) => value.trim().length > 0, {
    message: "String must contain non-whitespace content.",
  });

const runtimeIdentitySchema = z
  .object({
    sourceRevision: z.string().regex(REVISION_PATTERN),
    bundleDigest: z.string().regex(BUNDLE_DIGEST_PATTERN),
    fileCount: z.number().int().positive(),
  })
  .strict();

export const receiptSchema = z
  .object({
    format: z.literal("mcp-app-fieldlab-receipt@1"),
    generated_at: z.string().datetime({ offset: true }),
    scenario: z
      .object({
        id: z.string().min(1),
        revision: z.string().min(1),
      })
      .strict(),
    claim: z
      .object({
        text: z.string().min(1),
        status: z.enum(["verified", "failed", "not_verified"]),
        method_rung: z.enum(METHOD_RUNGS),
        proof_ceiling: z.enum(METHOD_RUNGS),
        not_verified_reason: nonBlankString.optional(),
      })
      .strict(),
    subject: z
      .object({
        source_revision: z.string().regex(REVISION_PATTERN).optional(),
        source_dirty: z.boolean().optional(),
        resource: z
          .object({
            uri: z.literal(FIELDLAB_VIEW_URI),
            mime_type: z.literal(FIELDLAB_VIEW_MIME_TYPE),
            bytes: z.number().int().positive(),
            sha256: z.string().regex(SHA256_PATTERN),
          })
          .strict()
          .optional(),
        bundle_digest: z.string().regex(BUNDLE_DIGEST_PATTERN).optional(),
        runtime_identity: runtimeIdentitySchema.optional(),
      })
      .strict(),
    environment: z
      .object({
        class: z.enum(RECEIPT_ENVIRONMENT_CLASSES),
        host_profile: z.string().min(1).optional(),
      })
      .strict(),
    capability: z
      .object({
        discovery: z.enum(CAPABILITY_DISCOVERIES),
        disposition: z.enum(CAPABILITY_DISPOSITIONS),
      })
      .strict()
      .optional(),
    root_cause_confidence: z
      .enum(["confirmed", "probable", "unknown"])
      .optional(),
    observations: z.record(z.string(), z.unknown()),
    evidence_refs: z.array(nonBlankString),
    limitations: z.array(z.string()),
    not_proven: z.array(z.string()).min(1),
    supersedes: z.array(z.string()).optional(),
  })
  .strict()
  .superRefine((receipt, context) => {
    if (
      compareMethodRungs(
        receipt.claim.method_rung,
        receipt.claim.proof_ceiling,
      ) > 0
    ) {
      context.addIssue({
        code: "custom",
        message: "method_rung cannot exceed proof_ceiling.",
        path: ["claim", "method_rung"],
      });
    }
    if (
      receipt.claim.status === "not_verified" &&
      receipt.claim.not_verified_reason === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "not_verified claims require an exact reason.",
        path: ["claim", "not_verified_reason"],
      });
    }
    if (
      receipt.claim.status !== "not_verified" &&
      receipt.claim.not_verified_reason !== undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "not_verified_reason is only valid for not_verified claims.",
        path: ["claim", "not_verified_reason"],
      });
    }
  });

export type FieldlabReceipt = z.infer<typeof receiptSchema>;

export function parseReceipt(value: unknown): FieldlabReceipt {
  return receiptSchema.parse(value);
}

export function parseReceiptAgainstScenario(
  value: unknown,
  scenarioValue: unknown,
): FieldlabReceipt {
  const receipt = parseReceipt(value);
  const scenario = scenarioSchema.parse(scenarioValue);
  assertReceiptScenarioPolicy(receipt, scenario);
  return receipt;
}

export function validateReceiptSetAgainstScenarios(
  receiptValues: readonly unknown[],
  scenarioValues: readonly unknown[],
): FieldlabReceipt[] {
  const scenarios = validateScenarioSet(scenarioValues);
  const scenariosByIdentity = new Map<string, FieldlabScenario>(
    scenarios.map((scenario) => [scenarioIdentity(scenario), scenario]),
  );
  const receiptsByIdentity = new Map<string, FieldlabReceipt>();
  const receipts: FieldlabReceipt[] = [];

  for (const value of receiptValues) {
    const receipt = parseReceipt(value);
    const identity = scenarioIdentity(receipt.scenario);
    const scenario = scenariosByIdentity.get(identity);
    if (!scenario) {
      throw new Error(`Receipt references unknown scenario ${identity}.`);
    }
    if (receiptsByIdentity.has(identity)) {
      throw new Error(`Duplicate receipt scenario identity ${identity}.`);
    }
    assertReceiptScenarioPolicy(receipt, scenario);
    receiptsByIdentity.set(identity, receipt);
    receipts.push(receipt);
  }

  for (const receipt of receipts) {
    if (receipt.claim.status === "not_verified") continue;
    const dependentIdentity = scenarioIdentity(receipt.scenario);
    const scenario = scenariosByIdentity.get(dependentIdentity)!;
    const prerequisiteClosure = new Set<string>();
    const collectPrerequisites = (identity: string): void => {
      const prerequisiteScenario = scenariosByIdentity.get(identity)!;
      for (const prerequisiteIdentity of prerequisiteScenario.prerequisite_receipts) {
        if (prerequisiteClosure.has(prerequisiteIdentity)) continue;
        prerequisiteClosure.add(prerequisiteIdentity);
        collectPrerequisites(prerequisiteIdentity);
      }
    };
    collectPrerequisites(scenarioIdentity(scenario));

    for (const prerequisiteIdentity of prerequisiteClosure) {
      const prerequisite = receiptsByIdentity.get(prerequisiteIdentity);
      if (!prerequisite) {
        throw new Error(
          `Attempted receipt ${dependentIdentity} is missing prerequisite receipt ${prerequisiteIdentity}.`,
        );
      }
      if (prerequisite.claim.status !== "verified") {
        throw new Error(
          `Attempted receipt ${dependentIdentity} prerequisite receipt ${prerequisiteIdentity} must be verified.`,
        );
      }
      assertReceiptSubjectIdentityJoin(
        prerequisite,
        receipt,
        prerequisiteIdentity,
      );
    }
  }

  return receipts;
}
