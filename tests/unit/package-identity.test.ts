import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadPackageVersion } from "../../src/package-identity.js";

function packageRoot(manifest: unknown): string {
  const root = mkdtempSync(path.join(tmpdir(), "fieldlab-package-identity-"));
  writeFileSync(path.join(root, "package.json"), JSON.stringify(manifest));
  return root;
}

describe("runtime package version authority", () => {
  it("reads the exact version from the selected runtime root", () => {
    const root = packageRoot({ version: "7.8.9-candidate.3" });
    try {
      expect(loadPackageVersion(root)).toBe("7.8.9-candidate.3");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses a package manifest without one exact version", () => {
    const root = packageRoot({ name: "missing-version" });
    try {
      expect(() => loadPackageVersion(root)).toThrow(/package version/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
