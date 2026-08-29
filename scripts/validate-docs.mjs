import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const [docsRegister, fieldlabRegister] = await Promise.all([
  readJson("DOCS-REGISTER.json"),
  readJson("FIELDLAB-REGISTER.json"),
]);

if (docsRegister.schema_version !== 1) {
  throw new Error("Unsupported DOCS-REGISTER schema version.");
}
if (
  docsRegister.validator_scope !== "structural-and-registered-shared-facts-only"
) {
  throw new Error(
    "DOCS-REGISTER must keep the validator claim bounded to structure and registered shared facts.",
  );
}
if (docsRegister.canonical_locale !== "zh-CN") {
  throw new Error("The canonical documentation locale must remain zh-CN.");
}

const expectedFacts = {
  repository: fieldlabRegister.publication.repository,
  signature: "Created by Faye & Cove.",
  methodRelease: fieldlabRegister.method_authority.guide_release,
  methodCommit: fieldlabRegister.method_authority.git_commit,
  foundingCommit: fieldlabRegister.founding_observation.reviewed_commit,
  publicationState: fieldlabRegister.publication.state,
  functionalLicense: fieldlabRegister.publication.functional_license,
  documentationLicense: fieldlabRegister.publication.documentation_license,
};

for (const [label, actual, expected] of [
  ["repository", docsRegister.repository, expectedFacts.repository],
  ["signature", docsRegister.signature, expectedFacts.signature],
  [
    "method release",
    docsRegister.method_authority?.guide_release,
    expectedFacts.methodRelease,
  ],
  [
    "method commit",
    docsRegister.method_authority?.git_commit,
    expectedFacts.methodCommit,
  ],
  [
    "founding commit",
    docsRegister.founding_observation?.reviewed_commit,
    expectedFacts.foundingCommit,
  ],
  [
    "publication state",
    docsRegister.publication?.state,
    expectedFacts.publicationState,
  ],
  [
    "functional license",
    docsRegister.publication?.functional_license,
    expectedFacts.functionalLicense,
  ],
  [
    "documentation license",
    docsRegister.publication?.documentation_license,
    expectedFacts.documentationLicense,
  ],
]) {
  if (actual !== expected) {
    throw new Error(
      `DOCS-REGISTER ${label} must match FIELDLAB-REGISTER.json.`,
    );
  }
}

if (
  docsRegister.publication.github_release !==
    fieldlabRegister.publication.github_release ||
  docsRegister.publication.package_publication !==
    fieldlabRegister.publication.package_publication
) {
  throw new Error(
    "DOCS-REGISTER publication gates must match FIELDLAB-REGISTER.json.",
  );
}

const pairs = docsRegister.pairs;
const requiredPairs = new Map(
  [
    ["readme", "README.md", "README.en.md"],
    ["spec", "SPEC.md", "SPEC.en.md"],
    ["architecture", "docs/ARCHITECTURE.md", "docs/ARCHITECTURE.en.md"],
    ["testing", "docs/TESTING.md", "docs/TESTING.en.md"],
    ["current-state", "docs/current-state.md", "docs/current-state.en.md"],
    [
      "package-loopback-runbook",
      "docs/runbooks/package-and-loopback.md",
      "docs/runbooks/package-and-loopback.en.md",
    ],
    [
      "tunnel-named-host-runbook",
      "docs/runbooks/tunnel-and-named-host.md",
      "docs/runbooks/tunnel-and-named-host.en.md",
    ],
    [
      "refrain-case-study",
      "case-studies/refrain/CASE-STUDY.md",
      "case-studies/refrain/CASE-STUDY.en.md",
    ],
    [
      "refrain-provenance",
      "case-studies/refrain/PROVENANCE.md",
      "case-studies/refrain/PROVENANCE.en.md",
    ],
    ["licensing-map", "LICENSING.zh-CN.md", "LICENSING.md"],
  ].map(([id, zhCn, en]) => [id, { zhCn, en }]),
);
if (!Array.isArray(pairs) || pairs.length !== requiredPairs.size) {
  throw new Error(
    `DOCS-REGISTER must contain exactly ${requiredPairs.size} required documentation pairs.`,
  );
}

const pairIds = new Set();
const registeredPaths = new Set();
const documents = new Map();

const readDocument = async (file) => {
  if (!documents.has(file)) documents.set(file, await readFile(file, "utf8"));
  return documents.get(file);
};

const assertSafeMarkdownPath = (file) => {
  if (
    typeof file !== "string" ||
    file.length === 0 ||
    file.startsWith("/") ||
    file.split("/").includes("..") ||
    path.extname(file) !== ".md"
  ) {
    throw new Error(`Unsafe or non-Markdown documentation path: ${file}`);
  }
};

for (const pair of pairs) {
  if (
    !pair ||
    typeof pair.id !== "string" ||
    pair.id.length === 0 ||
    pairIds.has(pair.id)
  ) {
    throw new Error("Documentation pair ids must be non-empty and unique.");
  }
  pairIds.add(pair.id);
  const requiredPair = requiredPairs.get(pair.id);
  if (
    !requiredPair ||
    pair.zh_cn !== requiredPair.zhCn ||
    pair.en !== requiredPair.en ||
    (pair.id === "licensing-map"
      ? pair.governing_locale !== "en"
      : pair.governing_locale !== undefined)
  ) {
    throw new Error(
      `Documentation pair ${pair.id} does not match the required path/authority contract.`,
    );
  }

  for (const [locale, file, mirror, switchLabel] of [
    ["zh-CN", pair.zh_cn, pair.en, "English"],
    ["en", pair.en, pair.zh_cn, "简体中文"],
  ]) {
    assertSafeMarkdownPath(file);
    assertSafeMarkdownPath(mirror);
    if (registeredPaths.has(file)) {
      throw new Error(
        `Documentation path is registered more than once: ${file}`,
      );
    }
    registeredPaths.add(file);
    await stat(file);
    const content = await readDocument(file);
    const metadata = `<!-- docs-pair: ${pair.id}; locale: ${locale}; mirror: ${mirror} -->`;
    if (!content.includes(metadata)) {
      throw new Error(`${file} is missing exact pair metadata: ${metadata}`);
    }
    let relativeMirror = path
      .relative(path.dirname(file), mirror)
      .split(path.sep)
      .join("/");
    if (!relativeMirror.startsWith(".")) relativeMirror = `./${relativeMirror}`;
    if (!content.includes(`[${switchLabel}](${relativeMirror})`)) {
      throw new Error(
        `${file} is missing its reciprocal language switch to ${relativeMirror}.`,
      );
    }
  }
}

const pairById = new Map(pairs.map((pair) => [pair.id, pair]));
const expectedSharedFacts = new Map([
  [
    "repository",
    {
      value: expectedFacts.repository,
      pairIds: ["readme", "spec", "current-state", "licensing-map"],
    },
  ],
  [
    "method-release",
    {
      value: expectedFacts.methodRelease,
      pairIds: ["readme", "spec", "architecture", "current-state"],
    },
  ],
  [
    "method-commit",
    {
      value: expectedFacts.methodCommit,
      pairIds: ["readme", "spec", "current-state"],
    },
  ],
  [
    "founding-commit",
    {
      value: expectedFacts.foundingCommit,
      pairIds: [
        "spec",
        "current-state",
        "refrain-case-study",
        "refrain-provenance",
      ],
    },
  ],
  [
    "publication-state",
    {
      value: expectedFacts.publicationState,
      pairIds: ["readme", "spec", "current-state", "licensing-map"],
    },
  ],
  [
    "functional-license",
    {
      value: expectedFacts.functionalLicense,
      pairIds: [
        "readme",
        "spec",
        "current-state",
        "refrain-provenance",
        "licensing-map",
      ],
    },
  ],
  [
    "documentation-license",
    {
      value: expectedFacts.documentationLicense,
      pairIds: [
        "readme",
        "spec",
        "current-state",
        "refrain-provenance",
        "licensing-map",
      ],
    },
  ],
]);
const sharedFacts = docsRegister.shared_facts;
if (
  !Array.isArray(sharedFacts) ||
  sharedFacts.length !== expectedSharedFacts.size
) {
  throw new Error(
    `DOCS-REGISTER must contain exactly ${expectedSharedFacts.size} registered shared facts.`,
  );
}
const observedSharedFactIds = new Set();
for (const fact of sharedFacts) {
  if (
    !fact ||
    typeof fact.id !== "string" ||
    typeof fact.value !== "string" ||
    !Array.isArray(fact.pair_ids) ||
    observedSharedFactIds.has(fact.id)
  ) {
    throw new Error(
      "Shared fact records must have unique ids, exact values, and pair_ids.",
    );
  }
  observedSharedFactIds.add(fact.id);
  const expectedFact = expectedSharedFacts.get(fact.id);
  if (
    !expectedFact ||
    fact.value !== expectedFact.value ||
    JSON.stringify(fact.pair_ids) !== JSON.stringify(expectedFact.pairIds)
  ) {
    throw new Error(
      `Registered shared fact ${fact.id} does not match its exact authority and pair scope.`,
    );
  }
  for (const pairId of fact.pair_ids) {
    const pair = pairById.get(pairId);
    if (!pair)
      throw new Error(`Shared fact references unknown pair ${pairId}.`);
    for (const file of [pair.zh_cn, pair.en]) {
      if (!(await readDocument(file)).includes(fact.value)) {
        throw new Error(
          `${file} is missing registered shared fact ${fact.id}.`,
        );
      }
    }
  }
}

for (const readme of ["README.md", "README.en.md"]) {
  if (!(await readDocument(readme)).includes(expectedFacts.signature)) {
    throw new Error(`${readme} must contain the exact project signature.`);
  }
}
if (!(await readDocument("LICENSING.md")).includes(expectedFacts.signature)) {
  throw new Error("LICENSING.md must contain the exact project signature.");
}

const licensingZh = await readDocument("LICENSING.zh-CN.md");
for (const governing of [
  "LICENSE",
  "LICENSE-DOCUMENTATION.md",
  "LICENSING.md",
]) {
  if (!licensingZh.slice(0, 1200).includes(governing)) {
    throw new Error(
      `LICENSING.zh-CN.md must identify ${governing} as governing near the top.`,
    );
  }
}
if (!licensingZh.slice(0, 1200).includes("仅供中文阅读便利")) {
  throw new Error(
    "LICENSING.zh-CN.md must state that it is informative-only near the top.",
  );
}

for (const singleton of docsRegister.governing_singletons ?? []) {
  if (!["LICENSE", "LICENSE-DOCUMENTATION.md"].includes(singleton)) {
    throw new Error(`Unexpected governing singleton: ${singleton}`);
  }
  await stat(singleton);
}

const currentStatePair = pairById.get("current-state");
if (!currentStatePair) {
  throw new Error("DOCS-REGISTER must contain the current-state pair.");
}
const currentStateFacts = docsRegister.current_state;
for (const field of [
  "candidate_file_count",
  "resource_bytes",
  "check_schema_count",
  "check_scenario_count",
  "check_unit_tests",
]) {
  if (
    !Number.isSafeInteger(currentStateFacts[field]) ||
    currentStateFacts[field] <= 0
  ) {
    throw new Error(
      `DOCS-REGISTER current_state.${field} must be a positive integer.`,
    );
  }
}
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
for (const file of [currentStatePair.zh_cn, currentStatePair.en]) {
  const content = await readDocument(file);
  for (const [label, value] of [
    ["updated date", currentStateFacts.updated_at],
    ["candidate source revision", currentStateFacts.candidate_source_revision],
    ["candidate file count", `\`${currentStateFacts.candidate_file_count}\``],
    ["resource bytes", `\`${currentStateFacts.resource_bytes}\``],
    ["resource SHA-256", currentStateFacts.resource_sha256],
    ["bundle digest", currentStateFacts.bundle_digest],
    ["receipt path", currentStateFacts.receipt_path],
    ["schema count", `\`${currentStateFacts.check_schema_count}\``],
    ["scenario count", `\`${currentStateFacts.check_scenario_count}\``],
    ["unit test count", `\`${currentStateFacts.check_unit_tests}\``],
    ["remote CI execution", currentStateFacts.remote_ci_execution],
  ]) {
    if (typeof value !== "string" || !content.includes(value)) {
      throw new Error(`${file} is missing current-state ${label}.`);
    }
  }
  for (const boundary of currentStateFacts.boundary_statuses ?? []) {
    const rowPattern = new RegExp(
      `\\|\\s*\\\`${escapeRegex(boundary.id)}\\\`\\s*\\|\\s*\\\`${escapeRegex(boundary.status)}\\\`\\s*\\|`,
    );
    if (!rowPattern.test(content)) {
      throw new Error(
        `${file} is missing current-state boundary row ${boundary.id}=${boundary.status}.`,
      );
    }
  }
}

const licensingMap = await readDocument("LICENSING.md");
for (const required of [
  "README.en.md",
  "SPEC.en.md",
  "LICENSING.zh-CN.md",
  "docs/",
  "case-studies/",
  "DOCS-REGISTER.json",
  "scripts/validate-docs.mjs",
  ".github/workflows/",
]) {
  if (!licensingMap.includes(`\`${required}\``)) {
    throw new Error(
      `LICENSING.md is missing path classification for ${required}.`,
    );
  }
}

process.stdout.write(
  `validated ${pairs.length} documentation pairs and registered shared facts; semantic translation equivalence is not machine-verified\n`,
);
