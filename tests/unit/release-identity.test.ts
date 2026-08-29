import { describe, expect, it } from "vitest";
import { parseRuntimeReleaseManifest } from "../../src/release-identity.js";

function validRelease() {
  return {
    format: "mcp-app-fieldlab-runtime@1" as const,
    sourceRevision: "1".repeat(40),
    sourceDirty: false as const,
    bundleDigest: `sha256:${"2".repeat(64)}`,
    files: [
      {
        path: "dist/__entry.js",
        bytes: 42,
        sha256: "3".repeat(64),
      },
    ],
  };
}

describe("runtime release identity", () => {
  it("accepts one clean digest-bearing manifest", () => {
    expect(parseRuntimeReleaseManifest(validRelease())).toEqual(validRelease());
  });

  it("refuses dirty, duplicate, and escaping file authorities", () => {
    expect(() =>
      parseRuntimeReleaseManifest({ ...validRelease(), sourceDirty: true }),
    ).toThrow(/identity is invalid/);
    expect(() =>
      parseRuntimeReleaseManifest({
        ...validRelease(),
        files: [validRelease().files[0], validRelease().files[0]],
      }),
    ).toThrow(/file entry is invalid/);
    expect(() =>
      parseRuntimeReleaseManifest({
        ...validRelease(),
        files: [{ ...validRelease().files[0], path: "../outside.js" }],
      }),
    ).toThrow(/file entry is invalid/);
  });
});
