import { z } from "zod";

export const METHOD_RUNGS = [
  "source",
  "process",
  "artifact",
  "activated-runtime",
  "named-host",
  "owner",
] as const;

const METHOD_RUNG_ORDER = new Map(
  METHOD_RUNGS.map((rung, index) => [rung, index] as const),
);

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
        not_verified_reason: z.string().min(1).optional(),
      })
      .strict(),
    subject: z
      .object({
        source_revision: z
          .string()
          .regex(/^[a-f0-9]{40}$/)
          .optional(),
        source_dirty: z.boolean().optional(),
        resource: z
          .object({
            uri: z.string().startsWith("ui://"),
            mime_type: z.literal("text/html;profile=mcp-app"),
            bytes: z.number().int().nonnegative(),
            sha256: z.string().regex(/^[a-f0-9]{64}$/),
          })
          .strict()
          .optional(),
        bundle_digest: z
          .string()
          .regex(/^sha256:[a-f0-9]{64}$/)
          .optional(),
        runtime_identity: z.record(z.string(), z.unknown()).optional(),
      })
      .strict(),
    environment: z
      .object({
        class: z.enum([
          "source-inspection",
          "local-process",
          "local-browser-harness",
          "clean-package",
          "isolated-runtime",
          "activated-runtime",
          "named-host",
          "owner-observation",
        ]),
        host_profile: z.string().min(1).optional(),
      })
      .strict(),
    capability: z
      .object({
        discovery: z.enum(["missing", "available", "denied", "unknown"]),
        disposition: z.enum([
          "not_attempted",
          "absent",
          "success",
          "rejected",
          "cancelled",
          "policy_denied",
          "technical_failure",
          "unknown",
        ]),
      })
      .strict()
      .optional(),
    root_cause_confidence: z
      .enum(["confirmed", "probable", "unknown"])
      .optional(),
    observations: z.record(z.string(), z.unknown()),
    evidence_refs: z.array(z.string()),
    limitations: z.array(z.string()),
    not_proven: z.array(z.string()).min(1),
    supersedes: z.array(z.string()).optional(),
  })
  .strict()
  .superRefine((receipt, context) => {
    const rung = METHOD_RUNG_ORDER.get(receipt.claim.method_rung);
    const ceiling = METHOD_RUNG_ORDER.get(receipt.claim.proof_ceiling);
    if (rung === undefined || ceiling === undefined || rung > ceiling) {
      context.addIssue({
        code: "custom",
        message: "method_rung cannot exceed proof_ceiling.",
        path: ["claim", "method_rung"],
      });
    }
    if (
      receipt.claim.status === "not_verified" &&
      !receipt.claim.not_verified_reason
    ) {
      context.addIssue({
        code: "custom",
        message: "not_verified claims require an exact reason.",
        path: ["claim", "not_verified_reason"],
      });
    }
    if (
      receipt.claim.status !== "not_verified" &&
      receipt.claim.not_verified_reason
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
