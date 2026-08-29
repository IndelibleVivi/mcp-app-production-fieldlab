import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const CANONICAL_SUL_SHA256 =
  "c6d0dde0f0463c800e542d7d64237ffef37f43b17004975a558604f17b5d1af1";

const [licenseBytes, documentationLicense, licensingMap] = await Promise.all([
  readFile("LICENSE"),
  readFile("LICENSE-DOCUMENTATION.md", "utf8"),
  readFile("LICENSING.md", "utf8"),
]);
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const packageLock = JSON.parse(await readFile("package-lock.json", "utf8"));

const licenseDigest = createHash("sha256").update(licenseBytes).digest("hex");
if (licenseDigest !== CANONICAL_SUL_SHA256) {
  throw new Error("LICENSE must match the pinned canonical SUL-1.0 text.");
}

if (packageJson.license !== "SEE LICENSE IN LICENSING.md") {
  throw new Error("package.json must point to the layered licensing map.");
}
if (packageLock.packages?.[""]?.license !== packageJson.license) {
  throw new Error(
    "package-lock.json root license metadata must match package.json.",
  );
}

for (const required of [
  "https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode",
  "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  "LICENSING.md",
]) {
  if (!documentationLicense.includes(required)) {
    throw new Error(`LICENSE-DOCUMENTATION.md is missing ${required}.`);
  }
}

for (const required of [
  "Functional materials: SUL-1.0",
  "Documentation: CC BY-NC-SA 4.0",
  "Refrain provenance boundary",
  "Third-party materials and governing texts",
]) {
  if (!licensingMap.includes(required)) {
    throw new Error(`LICENSING.md is missing ${required}.`);
  }
}

const functionalSection = licensingMap.split(
  "## Documentation: CC BY-NC-SA 4.0",
)[0];
const documentationSection = licensingMap.split(
  "## Documentation: CC BY-NC-SA 4.0",
)[1];
for (const documentationPath of [
  "README.md",
  "SPEC.md",
  "AGENTS.md",
  "docs/",
  "case-studies/",
]) {
  if (
    functionalSection.includes(`\`${documentationPath}\``) ||
    !documentationSection?.includes(`\`${documentationPath}\``)
  ) {
    throw new Error(
      `${documentationPath} must remain in the CC BY-NC-SA documentation scope.`,
    );
  }
}
for (const functionalPath of [
  "src/",
  "host-harness/",
  "scripts/",
  "tests/",
  "scenarios/",
  "schemas/",
  "deploy/",
  "FIELDLAB-REGISTER.json",
  "package.json",
  "package-lock.json",
  "playwright.config.ts",
  "tsconfig.json",
  "tsconfig.check.json",
  "vite.config.ts",
  ".dockerignore",
  ".gitignore",
  ".prettierignore",
]) {
  if (!functionalSection.includes(`\`${functionalPath}\``)) {
    throw new Error(`${functionalPath} is missing from the SUL-1.0 scope.`);
  }
}

process.stdout.write("validated layered licensing boundary\n");
