import { readFileSync } from "node:fs";
import path from "node:path";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const REVISION_PATTERN = /^[a-f0-9]{40}$/;

export interface RuntimeReleaseFile {
  path: string;
  bytes: number;
  sha256: string;
}

export interface RuntimeReleaseManifest {
  format: "mcp-app-fieldlab-runtime@1";
  sourceRevision: string;
  sourceDirty: false;
  bundleDigest: `sha256:${string}`;
  files: RuntimeReleaseFile[];
}

export interface RuntimeReleaseIdentity {
  sourceRevision: string;
  bundleDigest: `sha256:${string}`;
  fileCount: number;
}

function isSafeRelativePath(value: string): boolean {
  return (
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !value.split(/[\\/]/).includes("..")
  );
}

export function parseRuntimeReleaseManifest(
  value: unknown,
): RuntimeReleaseManifest {
  if (!value || typeof value !== "object") {
    throw new Error("Runtime release manifest must be an object.");
  }
  const candidate = value as Partial<RuntimeReleaseManifest>;
  if (
    candidate.format !== "mcp-app-fieldlab-runtime@1" ||
    candidate.sourceDirty !== false ||
    typeof candidate.sourceRevision !== "string" ||
    !REVISION_PATTERN.test(candidate.sourceRevision) ||
    typeof candidate.bundleDigest !== "string" ||
    !candidate.bundleDigest.startsWith("sha256:") ||
    !SHA256_PATTERN.test(candidate.bundleDigest.slice(7)) ||
    !Array.isArray(candidate.files) ||
    candidate.files.length === 0
  ) {
    throw new Error("Runtime release manifest identity is invalid.");
  }
  const paths = new Set<string>();
  for (const file of candidate.files) {
    if (
      !file ||
      typeof file !== "object" ||
      typeof file.path !== "string" ||
      !isSafeRelativePath(file.path) ||
      paths.has(file.path) ||
      !Number.isSafeInteger(file.bytes) ||
      file.bytes < 0 ||
      typeof file.sha256 !== "string" ||
      !SHA256_PATTERN.test(file.sha256)
    ) {
      throw new Error("Runtime release manifest file entry is invalid.");
    }
    paths.add(file.path);
  }
  return candidate as RuntimeReleaseManifest;
}

export function loadRuntimeReleaseIdentity(
  root = process.cwd(),
): RuntimeReleaseIdentity | undefined {
  const releasePath = process.env.FIELDLAB_RELEASE_FILE
    ? path.resolve(process.env.FIELDLAB_RELEASE_FILE)
    : path.join(root, "release.json");
  try {
    const release = parseRuntimeReleaseManifest(
      JSON.parse(readFileSync(releasePath, "utf8")),
    );
    return {
      sourceRevision: release.sourceRevision,
      bundleDigest: release.bundleDigest,
      fileCount: release.files.length,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return undefined;
    }
    throw error;
  }
}
