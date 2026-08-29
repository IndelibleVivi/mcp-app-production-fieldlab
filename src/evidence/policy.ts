export const METHOD_RUNGS = [
  "source",
  "process",
  "artifact",
  "activated-runtime",
  "named-host",
  "owner",
] as const;

export type MethodRung = (typeof METHOD_RUNGS)[number];

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

export type ScenarioBoundary = (typeof SCENARIO_BOUNDARIES)[number];

export const EXERCISE_SURFACES = [
  "source-inspection",
  "local-process",
  "built-artifact",
  "local-browser-harness",
  "clean-package",
  "isolated-runtime",
  "activated-runtime",
  "named-host",
  "owner",
] as const;

export type ExerciseSurface = (typeof EXERCISE_SURFACES)[number];

export const RECEIPT_ENVIRONMENT_CLASSES = [
  "source-inspection",
  "local-process",
  "local-browser-harness",
  "clean-package",
  "isolated-runtime",
  "activated-runtime",
  "named-host",
  "owner-observation",
] as const;

export type ReceiptEnvironmentClass =
  (typeof RECEIPT_ENVIRONMENT_CLASSES)[number];

export const AUTHORIZATION_CLASSES = [
  "ordinary-local",
  "operator-local",
  "external-side-effect",
  "owner-only",
] as const;

export type AuthorizationClass = (typeof AUTHORIZATION_CLASSES)[number];

export const CAPABILITY_DISCOVERIES = [
  "missing",
  "available",
  "denied",
  "unknown",
] as const;

export type CapabilityDiscovery = (typeof CAPABILITY_DISCOVERIES)[number];

export const CAPABILITY_DISPOSITIONS = [
  "not_attempted",
  "absent",
  "success",
  "rejected",
  "cancelled",
  "policy_denied",
  "technical_failure",
  "unknown",
] as const;

export type CapabilityDisposition = (typeof CAPABILITY_DISPOSITIONS)[number];

/**
 * Discovery and invocation disposition remain separate observations. This
 * table only rejects contradictory pairs; it never infers claim status or
 * root cause.
 */
export const CAPABILITY_DISPOSITIONS_BY_DISCOVERY: Readonly<
  Record<CapabilityDiscovery, readonly CapabilityDisposition[]>
> = {
  missing: ["not_attempted", "absent"],
  available: [
    "not_attempted",
    "success",
    "rejected",
    "cancelled",
    "policy_denied",
    "technical_failure",
    "unknown",
  ],
  denied: ["not_attempted", "policy_denied", "unknown"],
  unknown: ["not_attempted", "technical_failure", "unknown"],
};

const METHOD_RUNG_ORDER = new Map<MethodRung, number>(
  METHOD_RUNGS.map((rung, index) => [rung, index]),
);

type RunnerRule =
  | { readonly kind: "exact"; readonly value: string }
  | { readonly kind: "runtime-candidate"; readonly prefix: string };

interface SurfacePolicy {
  readonly environment: ReceiptEnvironmentClass;
  readonly authorizationClasses: readonly AuthorizationClass[];
  readonly runnerRequired: boolean;
  readonly runnerRules: readonly RunnerRule[];
}

export const RECEIPT_ENVIRONMENT_POLICY: Readonly<
  Record<
    ReceiptEnvironmentClass,
    {
      readonly maxMethodRung: MethodRung;
      readonly attemptedReceiptRequiresHostProfile: boolean;
    }
  >
> = {
  "source-inspection": {
    maxMethodRung: "source",
    attemptedReceiptRequiresHostProfile: false,
  },
  "local-process": {
    maxMethodRung: "process",
    attemptedReceiptRequiresHostProfile: false,
  },
  "local-browser-harness": {
    maxMethodRung: "process",
    attemptedReceiptRequiresHostProfile: false,
  },
  "clean-package": {
    maxMethodRung: "artifact",
    attemptedReceiptRequiresHostProfile: false,
  },
  "isolated-runtime": {
    maxMethodRung: "activated-runtime",
    attemptedReceiptRequiresHostProfile: false,
  },
  "activated-runtime": {
    maxMethodRung: "activated-runtime",
    attemptedReceiptRequiresHostProfile: false,
  },
  "named-host": {
    maxMethodRung: "named-host",
    attemptedReceiptRequiresHostProfile: true,
  },
  "owner-observation": {
    maxMethodRung: "owner",
    attemptedReceiptRequiresHostProfile: true,
  },
};

/**
 * Canonical cross-field policy for scenario execution surfaces. Structural
 * schemas deliberately consume these enums but do not duplicate these
 * relationships.
 */
export const EXERCISE_SURFACE_POLICY: Readonly<
  Record<ExerciseSurface, SurfacePolicy>
> = {
  "source-inspection": {
    environment: "source-inspection",
    authorizationClasses: ["ordinary-local"],
    runnerRequired: false,
    runnerRules: [],
  },
  "local-process": {
    environment: "local-process",
    authorizationClasses: ["ordinary-local"],
    runnerRequired: true,
    runnerRules: [{ kind: "exact", value: "npm run test:mcp" }],
  },
  "built-artifact": {
    environment: "clean-package",
    authorizationClasses: ["ordinary-local"],
    runnerRequired: false,
    runnerRules: [],
  },
  "local-browser-harness": {
    environment: "local-browser-harness",
    authorizationClasses: ["ordinary-local"],
    runnerRequired: true,
    runnerRules: [{ kind: "exact", value: "npm run test:host" }],
  },
  "clean-package": {
    environment: "clean-package",
    authorizationClasses: ["ordinary-local"],
    runnerRequired: true,
    runnerRules: [
      {
        kind: "runtime-candidate",
        prefix: "npm run package:runtime -- --out=runtime-candidates/",
      },
    ],
  },
  "isolated-runtime": {
    environment: "isolated-runtime",
    authorizationClasses: ["ordinary-local"],
    runnerRequired: true,
    runnerRules: [
      {
        kind: "runtime-candidate",
        prefix: "npm run smoke:runtime -- --candidate=runtime-candidates/",
      },
    ],
  },
  "activated-runtime": {
    environment: "activated-runtime",
    authorizationClasses: ["operator-local", "external-side-effect"],
    runnerRequired: false,
    runnerRules: [],
  },
  "named-host": {
    environment: "named-host",
    authorizationClasses: ["external-side-effect"],
    runnerRequired: false,
    runnerRules: [],
  },
  owner: {
    environment: "owner-observation",
    authorizationClasses: ["owner-only"],
    runnerRequired: false,
    runnerRules: [],
  },
};

/** Exact boundary/surface relationships accepted by the current programme. */
export const BOUNDARY_EXERCISE_SURFACES: Readonly<
  Record<ScenarioBoundary, readonly ExerciseSurface[]>
> = {
  "transport-route": [
    "source-inspection",
    "local-process",
    "isolated-runtime",
    "activated-runtime",
  ],
  "resource-admission": [
    "source-inspection",
    "local-process",
    "local-browser-harness",
    "isolated-runtime",
    "activated-runtime",
  ],
  "asset-plane": [
    "source-inspection",
    "built-artifact",
    "local-browser-harness",
    "clean-package",
    "isolated-runtime",
    "activated-runtime",
  ],
  "host-bridge-envelope": ["source-inspection", "local-browser-harness"],
  "iframe-sandbox-policy": ["source-inspection", "local-browser-harness"],
  "optional-host-capability": ["source-inspection", "local-browser-harness"],
  "artifact-runtime-identity": [
    "source-inspection",
    "built-artifact",
    "clean-package",
    "isolated-runtime",
    "activated-runtime",
  ],
  "tunnel-target": ["activated-runtime"],
  "named-host-acceptance": ["named-host"],
  "owner-interaction": ["owner"],
};

interface ScenarioPolicyInput {
  readonly id: string;
  readonly revision: string;
  readonly boundary: ScenarioBoundary;
  readonly exercise_surface: ExerciseSurface;
  readonly proof_ceiling: MethodRung;
  readonly authorization_class: AuthorizationClass;
  readonly runner: string | null;
  readonly prerequisite_receipts: readonly string[];
  readonly not_proven: readonly string[];
}

interface RuntimeIdentityPolicyInput {
  readonly sourceRevision: string;
  readonly bundleDigest: string;
  readonly fileCount: number;
}

interface ReceiptPolicyInput {
  readonly scenario: { readonly id: string; readonly revision: string };
  readonly claim: {
    readonly status: "verified" | "failed" | "not_verified";
    readonly method_rung: MethodRung;
    readonly proof_ceiling: MethodRung;
  };
  readonly subject: {
    readonly source_revision?: string;
    readonly source_dirty?: boolean;
    readonly resource?: {
      readonly uri: string;
      readonly mime_type: string;
      readonly bytes: number;
      readonly sha256: string;
    };
    readonly bundle_digest?: string;
    readonly runtime_identity?: RuntimeIdentityPolicyInput;
  };
  readonly environment: {
    readonly class: ReceiptEnvironmentClass;
    readonly host_profile?: string;
  };
  readonly capability?: {
    readonly discovery: CapabilityDiscovery;
    readonly disposition: CapabilityDisposition;
  };
  readonly observations: Readonly<Record<string, unknown>>;
  readonly evidence_refs: readonly string[];
  readonly not_proven: readonly string[];
}

type SubjectIdentityField =
  "source_revision" | "resource" | "bundle_digest" | "runtime_identity";

export const METHOD_RUNG_SUBJECT_IDENTITIES: Readonly<
  Record<MethodRung, readonly SubjectIdentityField[]>
> = {
  source: ["source_revision"],
  process: [],
  artifact: ["source_revision", "bundle_digest"],
  "activated-runtime": ["source_revision", "bundle_digest", "runtime_identity"],
  "named-host": [
    "source_revision",
    "resource",
    "bundle_digest",
    "runtime_identity",
  ],
  owner: ["source_revision", "resource", "bundle_digest", "runtime_identity"],
};

export const BOUNDARY_RESOURCE_IDENTITY_FROM_RUNG: Readonly<
  Partial<Record<ScenarioBoundary, MethodRung>>
> = {
  "resource-admission": "process",
  "asset-plane": "process",
  "host-bridge-envelope": "process",
  "iframe-sandbox-policy": "process",
  "optional-host-capability": "process",
};

export const RECEIPT_SUBJECT_JOIN_FIELDS = [
  "source_revision",
  "resource",
  "bundle_digest",
  "runtime_identity",
] as const satisfies readonly SubjectIdentityField[];

export function compareMethodRungs(
  left: MethodRung,
  right: MethodRung,
): number {
  return METHOD_RUNG_ORDER.get(left)! - METHOD_RUNG_ORDER.get(right)!;
}

export function scenarioIdentity(
  scenario: Pick<ScenarioPolicyInput, "id" | "revision">,
): string {
  return `${scenario.id}@${scenario.revision}`;
}

function isSafeCandidateSuffix(value: string): boolean {
  return (
    value.length > 0 &&
    /^[A-Za-z0-9._/-]+$/.test(value) &&
    !value.startsWith("/") &&
    !value.endsWith("/") &&
    value.split("/").every((segment) => segment !== "" && segment !== "..")
  );
}

function runnerMatchesRule(runner: string, rule: RunnerRule): boolean {
  if (rule.kind === "exact") return runner === rule.value;
  return (
    runner.startsWith(rule.prefix) &&
    isSafeCandidateSuffix(runner.slice(rule.prefix.length))
  );
}

export function assertScenarioPolicy(scenario: ScenarioPolicyInput): void {
  const identity = scenarioIdentity(scenario);
  const allowedSurfaces = BOUNDARY_EXERCISE_SURFACES[scenario.boundary];
  if (!allowedSurfaces.includes(scenario.exercise_surface)) {
    throw new Error(
      `${identity} boundary ${scenario.boundary} does not allow exercise surface ${scenario.exercise_surface}.`,
    );
  }

  const surfacePolicy = EXERCISE_SURFACE_POLICY[scenario.exercise_surface];
  const maximumRung =
    RECEIPT_ENVIRONMENT_POLICY[surfacePolicy.environment].maxMethodRung;
  if (compareMethodRungs(scenario.proof_ceiling, maximumRung) > 0) {
    throw new Error(
      `${identity} exercise surface ${scenario.exercise_surface} and environment ${surfacePolicy.environment} have maximum proof ceiling ${maximumRung}, not ${scenario.proof_ceiling}.`,
    );
  }

  if (
    !surfacePolicy.authorizationClasses.includes(scenario.authorization_class)
  ) {
    throw new Error(
      `${identity} exercise surface ${scenario.exercise_surface} does not allow authorization class ${scenario.authorization_class}.`,
    );
  }

  if (scenario.authorization_class !== "ordinary-local") {
    if (scenario.runner !== null) {
      throw new Error(
        `${identity} authorization class ${scenario.authorization_class} requires runner: null.`,
      );
    }
    return;
  }

  if (surfacePolicy.runnerRequired && scenario.runner === null) {
    throw new Error(
      `${identity} ordinary-local exercise surface ${scenario.exercise_surface} requires a runner.`,
    );
  }
  if (
    scenario.runner !== null &&
    !surfacePolicy.runnerRules.some((rule) =>
      runnerMatchesRule(scenario.runner!, rule),
    )
  ) {
    throw new Error(
      `${identity} ordinary-local runner is outside the declared safe lane for ${scenario.exercise_surface}.`,
    );
  }
}

export function assertScenarioGraphPolicy(
  scenarios: readonly ScenarioPolicyInput[],
): void {
  const byIdentity = new Map<string, ScenarioPolicyInput>();
  for (const scenario of scenarios) {
    const identity = scenarioIdentity(scenario);
    if (byIdentity.has(identity)) {
      throw new Error(`Duplicate scenario identity ${identity}.`);
    }
    assertScenarioPolicy(scenario);
    byIdentity.set(identity, scenario);
  }

  for (const scenario of scenarios) {
    const dependentIdentity = scenarioIdentity(scenario);
    for (const prerequisiteIdentity of scenario.prerequisite_receipts) {
      const prerequisite = byIdentity.get(prerequisiteIdentity);
      if (!prerequisite) {
        throw new Error(
          `${dependentIdentity} references unknown prerequisite ${prerequisiteIdentity}.`,
        );
      }
      if (
        compareMethodRungs(prerequisite.proof_ceiling, scenario.proof_ceiling) >
        0
      ) {
        throw new Error(
          `Prerequisite ${prerequisiteIdentity} ceiling ${prerequisite.proof_ceiling} is above dependent ${dependentIdentity} ceiling ${scenario.proof_ceiling}.`,
        );
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (identity: string, path: readonly string[]): void => {
    if (visiting.has(identity)) {
      throw new Error(
        `Scenario prerequisite cycle: ${[...path, identity].join(" -> ")}.`,
      );
    }
    if (visited.has(identity)) return;
    visiting.add(identity);
    const scenario = byIdentity.get(identity)!;
    for (const prerequisite of scenario.prerequisite_receipts) {
      visit(prerequisite, [...path, identity]);
    }
    visiting.delete(identity);
    visited.add(identity);
  };

  for (const identity of byIdentity.keys()) visit(identity, []);
}

function requireSubjectField(
  receipt: ReceiptPolicyInput,
  field: SubjectIdentityField,
): void {
  const value = receipt.subject[field];
  if (
    value === undefined ||
    (field === "runtime_identity" && Object.keys(value).length === 0)
  ) {
    throw new Error(
      `Attempted ${receipt.claim.method_rung} receipt requires subject.${field}.`,
    );
  }
}

function exactResourceIdentity(
  left: NonNullable<ReceiptPolicyInput["subject"]["resource"]>,
  right: NonNullable<ReceiptPolicyInput["subject"]["resource"]>,
): boolean {
  return (
    left.uri === right.uri &&
    left.mime_type === right.mime_type &&
    left.bytes === right.bytes &&
    left.sha256 === right.sha256
  );
}

function exactRuntimeIdentity(
  left: RuntimeIdentityPolicyInput,
  right: RuntimeIdentityPolicyInput,
): boolean {
  return (
    left.sourceRevision === right.sourceRevision &&
    left.bundleDigest === right.bundleDigest &&
    left.fileCount === right.fileCount
  );
}

function subjectIdentityMatches(
  field: SubjectIdentityField,
  left: NonNullable<ReceiptPolicyInput["subject"][SubjectIdentityField]>,
  right: NonNullable<ReceiptPolicyInput["subject"][SubjectIdentityField]>,
): boolean {
  if (field === "resource") {
    return exactResourceIdentity(
      left as NonNullable<ReceiptPolicyInput["subject"]["resource"]>,
      right as NonNullable<ReceiptPolicyInput["subject"]["resource"]>,
    );
  }
  if (field === "runtime_identity") {
    return exactRuntimeIdentity(
      left as RuntimeIdentityPolicyInput,
      right as RuntimeIdentityPolicyInput,
    );
  }
  return left === right;
}

export function assertReceiptSubjectIdentityJoin(
  prerequisite: ReceiptPolicyInput,
  dependent: ReceiptPolicyInput,
  prerequisiteIdentity: string,
): void {
  for (const field of RECEIPT_SUBJECT_JOIN_FIELDS) {
    const prerequisiteValue = prerequisite.subject[field];
    const dependentValue = dependent.subject[field];
    if (
      prerequisiteValue !== undefined &&
      dependentValue !== undefined &&
      !subjectIdentityMatches(field, prerequisiteValue, dependentValue)
    ) {
      throw new Error(
        `Dependent receipt subject.${field} does not match prerequisite ${prerequisiteIdentity}.`,
      );
    }
  }
}

export function assertReceiptScenarioPolicy(
  receipt: ReceiptPolicyInput,
  scenario: ScenarioPolicyInput,
): void {
  assertScenarioPolicy(scenario);
  const expectedIdentity = scenarioIdentity(scenario);
  if (scenarioIdentity(receipt.scenario) !== expectedIdentity) {
    throw new Error(
      `Receipt scenario must match exact scenario ${expectedIdentity}.`,
    );
  }

  const surfacePolicy = EXERCISE_SURFACE_POLICY[scenario.exercise_surface];
  if (receipt.environment.class !== surfacePolicy.environment) {
    throw new Error(
      `Receipt environment must be ${surfacePolicy.environment} for scenario ${expectedIdentity}; received ${receipt.environment.class}.`,
    );
  }

  if (
    compareMethodRungs(receipt.claim.method_rung, scenario.proof_ceiling) > 0
  ) {
    throw new Error(
      `Receipt method_rung ${receipt.claim.method_rung} exceeds scenario ceiling ${scenario.proof_ceiling}.`,
    );
  }
  if (
    compareMethodRungs(receipt.claim.proof_ceiling, scenario.proof_ceiling) > 0
  ) {
    throw new Error(
      `Receipt proof_ceiling ${receipt.claim.proof_ceiling} exceeds scenario ceiling ${scenario.proof_ceiling}.`,
    );
  }
  if (
    receipt.claim.status === "verified" &&
    receipt.claim.method_rung !== scenario.proof_ceiling
  ) {
    throw new Error(
      `Verified receipt ${expectedIdentity} must reach its scenario claim rung ${scenario.proof_ceiling}; received ${receipt.claim.method_rung}.`,
    );
  }

  const missingNotProven = scenario.not_proven.filter(
    (claim) => !receipt.not_proven.includes(claim),
  );
  if (missingNotProven.length > 0) {
    throw new Error(
      `Receipt not_proven must include exact scenario entries: ${missingNotProven.join(
        ", ",
      )}.`,
    );
  }

  if (receipt.capability) {
    const allowedDispositions =
      CAPABILITY_DISPOSITIONS_BY_DISCOVERY[receipt.capability.discovery];
    if (!allowedDispositions.includes(receipt.capability.disposition)) {
      throw new Error(
        `Capability discovery ${receipt.capability.discovery} does not allow disposition ${receipt.capability.disposition}.`,
      );
    }
  }

  if (receipt.subject.runtime_identity) {
    if (!receipt.subject.source_revision || !receipt.subject.bundle_digest) {
      throw new Error(
        "A supplied subject.runtime_identity requires top-level subject.source_revision and subject.bundle_digest.",
      );
    }
    if (
      receipt.subject.runtime_identity.sourceRevision !==
      receipt.subject.source_revision
    ) {
      throw new Error(
        "subject.runtime_identity.sourceRevision must equal subject.source_revision.",
      );
    }
    if (
      receipt.subject.runtime_identity.bundleDigest !==
      receipt.subject.bundle_digest
    ) {
      throw new Error(
        "subject.runtime_identity.bundleDigest must equal subject.bundle_digest.",
      );
    }
  }

  if (receipt.claim.status === "not_verified") return;

  if (
    receipt.evidence_refs.length === 0 ||
    receipt.evidence_refs.some((reference) => reference.trim() === "")
  ) {
    throw new Error(
      "Attempted verified/failed receipts require non-empty evidence_refs.",
    );
  }
  if (Object.keys(receipt.observations).length === 0) {
    throw new Error(
      "Attempted verified/failed receipts require actual observations.",
    );
  }

  for (const field of METHOD_RUNG_SUBJECT_IDENTITIES[
    receipt.claim.method_rung
  ]) {
    requireSubjectField(receipt, field);
  }
  if (
    compareMethodRungs(receipt.claim.method_rung, "artifact") >= 0 &&
    receipt.subject.source_dirty !== false
  ) {
    throw new Error(
      "Attempted artifact-or-higher receipt requires subject.source_dirty: false.",
    );
  }
  const resourceIdentityRung =
    BOUNDARY_RESOURCE_IDENTITY_FROM_RUNG[scenario.boundary];
  if (
    resourceIdentityRung !== undefined &&
    compareMethodRungs(receipt.claim.method_rung, resourceIdentityRung) >= 0
  ) {
    requireSubjectField(receipt, "resource");
  }
  if (
    scenario.exercise_surface === "isolated-runtime" &&
    receipt.subject.resource === undefined
  ) {
    throw new Error(
      "Attempted isolated-runtime receipt requires exact subject.resource.",
    );
  }
  if (receipt.subject.resource) {
    const requiredReference = `resource:sha256:${receipt.subject.resource.sha256}`;
    if (!receipt.evidence_refs.includes(requiredReference)) {
      throw new Error(
        `Attempted resource receipt requires exact evidence ref ${requiredReference}.`,
      );
    }
  }
  if (
    RECEIPT_ENVIRONMENT_POLICY[receipt.environment.class]
      .attemptedReceiptRequiresHostProfile &&
    !receipt.environment.host_profile
  ) {
    throw new Error(
      `Attempted ${receipt.claim.method_rung} receipt requires environment.host_profile.`,
    );
  }
}
