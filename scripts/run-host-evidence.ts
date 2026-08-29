import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LOCAL_HOST_PROFILE_IDS } from "../host-harness/profiles.js";
import { readGitSubject } from "../src/evidence/git-subject.js";
import { validateReceiptSetAgainstScenarios } from "../src/evidence/receipt.js";
import { loadSelfContainedFieldlabView } from "../src/self-contained-view.js";

export const REQUIRED_HOST_TESTS = [
  {
    id: "resource-mount",
    title:
      "mounts exact resources/read HTML and keeps the component-only marker out of model projection",
  },
  {
    id: "restricted-fallback",
    title:
      "restricted profile withholds optional actions and preserves the portable fallback",
  },
  {
    id: "capability-success",
    title:
      "capability-success advertises and accepts message and download requests",
  },
  {
    id: "narrow-viewports",
    title:
      "keeps critical identity and fallback content inside 320px and 390px viewports",
  },
  {
    id: "capability-rejection",
    title:
      "capability-rejected keeps download discovery separate from rejection",
  },
] as const;

export interface HostPlaywrightAttestation {
  format: "fieldlab-host-playwright-attestation@1";
  started_at: string;
  duration_ms: number;
  test_count: number;
  tests: Array<{
    id: (typeof REQUIRED_HOST_TESTS)[number]["id"];
    title: string;
    status: "passed";
  }>;
}

interface JsonReportSpec {
  title?: unknown;
  ok?: unknown;
  tests?: unknown;
}

function collectSpecs(value: unknown): JsonReportSpec[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const suite = value as Record<string, unknown>;
  const direct = Array.isArray(suite.specs)
    ? suite.specs.filter(
        (spec): spec is JsonReportSpec =>
          Boolean(spec) && typeof spec === "object" && !Array.isArray(spec),
      )
    : [];
  const nested = Array.isArray(suite.suites)
    ? suite.suites.flatMap((child) => collectSpecs(child))
    : [];
  return [...direct, ...nested];
}

function specPassed(spec: JsonReportSpec): boolean {
  if (
    spec.ok !== true ||
    !Array.isArray(spec.tests) ||
    spec.tests.length === 0
  ) {
    return false;
  }
  return spec.tests.every((test) => {
    if (!test || typeof test !== "object" || Array.isArray(test)) return false;
    const record = test as Record<string, unknown>;
    if (
      record.status !== "expected" ||
      record.expectedStatus !== "passed" ||
      !Array.isArray(record.results) ||
      record.results.length !== 1
    ) {
      return false;
    }
    const result = record.results[0];
    return (
      Boolean(result) &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      (result as Record<string, unknown>).status === "passed"
    );
  });
}

export function parseHostPlaywrightReport(
  value: unknown,
): HostPlaywrightAttestation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Playwright JSON report must be an object.");
  }
  const report = value as Record<string, unknown>;
  const stats =
    report.stats &&
    typeof report.stats === "object" &&
    !Array.isArray(report.stats)
      ? (report.stats as Record<string, unknown>)
      : undefined;
  if (
    !stats ||
    typeof stats.startTime !== "string" ||
    Number.isNaN(Date.parse(stats.startTime)) ||
    typeof stats.duration !== "number" ||
    !Number.isFinite(stats.duration) ||
    stats.duration < 0 ||
    stats.expected !== REQUIRED_HOST_TESTS.length ||
    stats.skipped !== 0 ||
    stats.unexpected !== 0 ||
    stats.flaky !== 0 ||
    !Array.isArray(report.errors) ||
    report.errors.length !== 0 ||
    !Array.isArray(report.suites)
  ) {
    throw new Error(
      "Playwright JSON report does not attest one clean expected host-suite run.",
    );
  }

  const specs = report.suites.flatMap((suite) => collectSpecs(suite));
  if (specs.length !== REQUIRED_HOST_TESTS.length) {
    throw new Error(
      `Playwright host suite must contain exactly ${REQUIRED_HOST_TESTS.length} specs.`,
    );
  }
  const specsByTitle = new Map(
    specs.map((spec) => [
      typeof spec.title === "string" ? spec.title : "",
      spec,
    ]),
  );
  if (specsByTitle.size !== specs.length) {
    throw new Error(
      "Playwright host suite contains a missing or duplicate title.",
    );
  }

  const tests = REQUIRED_HOST_TESTS.map((required) => {
    const spec = specsByTitle.get(required.title);
    if (!spec || !specPassed(spec)) {
      throw new Error(
        `Playwright host evidence is missing one clean pass for ${JSON.stringify(required.title)}.`,
      );
    }
    return { ...required, status: "passed" as const };
  });

  return {
    format: "fieldlab-host-playwright-attestation@1",
    started_at: stats.startTime,
    duration_ms: stats.duration,
    test_count: tests.length,
    tests,
  };
}

async function runPlaywrightJson(): Promise<unknown> {
  const executable = path.resolve(
    "node_modules",
    ".bin",
    process.platform === "win32" ? "playwright.cmd" : "playwright",
  );
  const child = spawn(executable, ["test", "--reporter=json"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "inherit"],
  });
  const stdout: Buffer[] = [];
  child.stdout.on("data", (chunk) => stdout.push(Buffer.from(chunk)));
  const exit = await new Promise<{
    code: number | null;
    signal: NodeJS.Signals | null;
  }>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
  const reportText = Buffer.concat(stdout).toString("utf8");
  if (exit.code !== 0) {
    process.stderr.write(reportText);
    throw new Error(
      `Playwright host suite failed (${exit.signal ? `signal ${exit.signal}` : `exit ${String(exit.code)}`}).`,
    );
  }
  try {
    return JSON.parse(reportText) as unknown;
  } catch (error) {
    throw new Error(
      `Playwright host suite returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function loadScenarioValues(): Promise<unknown[]> {
  const scenarioRoot = path.resolve("scenarios");
  return Promise.all(
    (await readdir(scenarioRoot))
      .filter((file) => file.endsWith(".json"))
      .sort()
      .map(async (file) =>
        JSON.parse(await readFile(path.join(scenarioRoot, file), "utf8")),
      ),
  );
}

export async function runHostEvidence(): Promise<void> {
  const attestation = parseHostPlaywrightReport(await runPlaywrightJson());
  const scenarioValues = await loadScenarioValues();
  const scenario = scenarioValues.find(
    (value) =>
      Boolean(value) &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      (value as Record<string, unknown>).id === "mcp-app.host-profile-matrix" &&
      (value as Record<string, unknown>).revision === "1",
  ) as { not_proven?: unknown } | undefined;
  if (!scenario || !Array.isArray(scenario.not_proven)) {
    throw new Error(
      "Scenario closure is missing mcp-app.host-profile-matrix@1.",
    );
  }

  const prerequisiteReceiptPath = path.resolve(
    "tmp",
    "receipts",
    "mcp-resource-roundtrip.json",
  );
  let prerequisiteReceipt: unknown;
  try {
    prerequisiteReceipt = JSON.parse(
      await readFile(prerequisiteReceiptPath, "utf8"),
    );
  } catch (error) {
    throw new Error(
      `Could not read prerequisite receipt tmp/receipts/mcp-resource-roundtrip.json; run npm run check before npm run test:host. ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const view = loadSelfContainedFieldlabView();
  const resourceSha256 = createHash("sha256").update(view.html).digest("hex");
  const receiptValue = {
    format: "mcp-app-fieldlab-receipt@1",
    generated_at: new Date().toISOString(),
    scenario: { id: "mcp-app.host-profile-matrix", revision: "1" },
    claim: {
      text: "The exact production App resource passed the declared local browser-host profile matrix.",
      status: "verified",
      method_rung: "process",
      proof_ceiling: "process",
    },
    subject: {
      ...readGitSubject(),
      resource: {
        uri: view.uri,
        mime_type: view.mimeType,
        bytes: view.bytes,
        sha256: resourceSha256,
      },
    },
    environment: { class: "local-browser-harness" },
    root_cause_confidence: "confirmed",
    observations: {
      profiles: LOCAL_HOST_PROFILE_IDS,
      named_host_simulation: false,
      playwright: attestation,
    },
    evidence_refs: [
      `resource:sha256:${resourceSha256}`,
      "playwright:tests/host/mcp-app-host.pw.ts",
    ],
    limitations: [
      "The profiles are declared local surrogates, not named-host simulations.",
      "A passing suite does not establish host policy, tunnel reachability, or owner acceptance.",
    ],
    not_proven: scenario.not_proven,
  };
  const validatedReceipts = validateReceiptSetAgainstScenarios(
    [prerequisiteReceipt, receiptValue],
    scenarioValues,
  );
  const receipt = validatedReceipts.find(
    (value) =>
      value.scenario.id === "mcp-app.host-profile-matrix" &&
      value.scenario.revision === "1",
  );
  if (!receipt) {
    throw new Error("Receipt-set validation returned no browser-host receipt.");
  }

  const receiptPath = path.resolve(
    "tmp",
    "receipts",
    "mcp-host-profile-matrix.json",
  );
  await mkdir(path.dirname(receiptPath), { recursive: true });
  const temporaryPath = `${receiptPath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  await rename(temporaryPath, receiptPath);

  process.stdout.write(
    `${JSON.stringify(
      {
        receipt: path.relative(process.cwd(), receiptPath),
        scenario: "mcp-app.host-profile-matrix@1",
        playwrightTests: attestation.test_count,
        resourceBytes: view.bytes,
        resourceSha256,
        proofCeiling: "process",
        namedHostSimulation: false,
      },
      null,
      2,
    )}\n`,
  );
}

const isMain =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    await runHostEvidence();
  } catch (error) {
    process.stderr.write(
      `run-host-evidence: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
