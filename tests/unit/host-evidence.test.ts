import { describe, expect, it } from "vitest";
import {
  parseHostPlaywrightReport,
  REQUIRED_HOST_TESTS,
} from "../../scripts/run-host-evidence.js";

function validReport(): Record<string, unknown> {
  return {
    stats: {
      startTime: "2026-08-29T15:06:26.643Z",
      duration: 8422.319,
      expected: REQUIRED_HOST_TESTS.length,
      skipped: 0,
      unexpected: 0,
      flaky: 0,
    },
    errors: [],
    suites: [
      {
        specs: REQUIRED_HOST_TESTS.map((test) => ({
          title: test.title,
          ok: true,
          tests: [
            {
              status: "expected",
              expectedStatus: "passed",
              results: [{ status: "passed", duration: 10 }],
            },
          ],
        })),
      },
    ],
  };
}

describe("browser-host evidence runner", () => {
  it("derives an attestation from the exact clean Playwright report closure", () => {
    expect(parseHostPlaywrightReport(validReport())).toMatchObject({
      format: "fieldlab-host-playwright-attestation@1",
      test_count: 5,
      tests: REQUIRED_HOST_TESTS.map((test) => ({
        ...test,
        status: "passed",
      })),
    });
  });

  it("rejects incomplete, failed, skipped, or flaky host suites", () => {
    const incomplete = validReport();
    (incomplete.suites as Array<{ specs: unknown[] }>)[0]?.specs.pop();
    expect(() => parseHostPlaywrightReport(incomplete)).toThrow(/exactly 5/);

    const failed = validReport();
    const failedSpec = (
      failed.suites as Array<{
        specs: Array<{ ok: boolean; tests: Array<{ results: unknown[] }> }>;
      }>
    )[0]?.specs[0];
    if (!failedSpec) throw new Error("Missing test fixture spec.");
    failedSpec.ok = false;
    failedSpec.tests[0]!.results = [{ status: "failed" }];
    expect(() => parseHostPlaywrightReport(failed)).toThrow(/clean pass/);

    for (const field of ["skipped", "flaky"] as const) {
      const report = validReport();
      (report.stats as Record<string, unknown>)[field] = 1;
      expect(() => parseHostPlaywrightReport(report)).toThrow(/clean expected/);
    }
  });
});
