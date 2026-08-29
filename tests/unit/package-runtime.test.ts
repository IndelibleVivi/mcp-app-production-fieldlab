import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error package-runtime is an executable ESM script with tested exports.
import * as packageRuntime from "../../scripts/package-runtime.mjs";

const {
  assertNoTrackedInstallProjection,
  canonicalFileListBytes,
  parsePackageArguments,
  RUNTIME_ROOTS,
  runtimeFileEntries,
} = packageRuntime;

const temporaryRoots: string[] = [];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("runtime package contract", () => {
  it("requires one explicit output and rejects unknown arguments", () => {
    expect(parsePackageArguments(["--out=tmp/candidate"])).toEqual({
      output: "tmp/candidate",
    });
    expect(() => parsePackageArguments([])).toThrow(/--out/);
    expect(() => parsePackageArguments(["--out=one", "--out=two"])).toThrow(
      /only once/,
    );
    expect(() => parsePackageArguments(["--force"])).toThrow(
      /Unknown argument/,
    );
  });

  it("builds a stable sorted file list without release.json", () => {
    const root = mkdtempSync(path.join(tmpdir(), "fieldlab-package-test-"));
    temporaryRoots.push(root);
    mkdirSync(path.join(root, "dist"));
    writeFileSync(path.join(root, "z.txt"), "z");
    writeFileSync(path.join(root, "dist", "a.txt"), "alpha");
    writeFileSync(path.join(root, "release.json"), "ignored");

    const entries = runtimeFileEntries(root) as Array<{
      path: string;
      bytes: number;
      sha256: string;
    }>;
    expect(entries.map((entry) => entry.path)).toEqual(["dist/a.txt", "z.txt"]);
    expect(entries[0]).toMatchObject({ bytes: 5 });
    expect(entries[0]?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(canonicalFileListBytes(entries).toString("utf8")).toBe(
      `${JSON.stringify(entries)}\n`,
    );
  });

  it("refuses a tracked install projection before npm ci", () => {
    const root = mkdtempSync(path.join(tmpdir(), "fieldlab-package-test-"));
    temporaryRoots.push(root);
    expect(() => assertNoTrackedInstallProjection(root)).not.toThrow();
    mkdirSync(path.join(root, "node_modules"));
    expect(() => assertNoTrackedInstallProjection(root)).toThrow(
      /committed revision contains node_modules/,
    );
  });

  it("carries the complete layered license boundary into runtime artifacts", () => {
    for (const requiredPath of [
      "LICENSE",
      "LICENSE-DOCUMENTATION.md",
      "LICENSING.md",
    ]) {
      expect(RUNTIME_ROOTS).toContain(requiredPath);
    }

    const dockerfile = readFileSync("deploy/runtime/Dockerfile", "utf8");
    expect(dockerfile).toContain(
      "COPY LICENSE LICENSE-DOCUMENTATION.md LICENSING.md ./",
    );
  });
});
