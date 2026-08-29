import { readFileSync } from "node:fs";
import path from "node:path";

export function loadPackageVersion(root = process.cwd()): string {
  const manifestPath = path.join(root, "package.json");
  let manifest: unknown;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;
  } catch {
    throw new Error(
      "The selected runtime root does not contain a readable package manifest.",
    );
  }
  const version =
    manifest && typeof manifest === "object" && !Array.isArray(manifest)
      ? (manifest as Record<string, unknown>).version
      : undefined;
  if (
    typeof version !== "string" ||
    version.length === 0 ||
    version.trim() !== version
  ) {
    throw new Error(
      "The selected runtime package manifest has no exact package version.",
    );
  }
  return version;
}
