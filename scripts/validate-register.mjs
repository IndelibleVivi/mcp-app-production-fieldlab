import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const register = JSON.parse(await readFile("FIELDLAB-REGISTER.json", "utf8"));

if (register.schema_version !== 1) {
  throw new Error("Unsupported FIELDLAB-REGISTER schema version.");
}
if (register.fieldlab_version !== packageJson.version) {
  throw new Error(
    "FIELDLAB-REGISTER fieldlab_version must match package.json.",
  );
}
if (
  register.method_authority?.guide_release !== "2.0.1" ||
  register.method_authority?.repository !==
    "https://github.com/IndelibleVivi/mcp-server-engineering-field-guide" ||
  !/^[a-f0-9]{40}$/.test(register.method_authority?.git_commit ?? "")
) {
  throw new Error("Field Guide authority must pin an exact released commit.");
}
if (!Array.isArray(register.selected_profiles)) {
  throw new Error("selected_profiles must be an array.");
}
const ids = new Set();
for (const profile of register.selected_profiles) {
  if (
    !profile ||
    typeof profile.id !== "string" ||
    !["normative", "current-as-assessed", "moving-guidance"].includes(
      profile.status,
    ) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(profile.guide_assessed_at ?? "") ||
    ids.has(profile.id)
  ) {
    throw new Error("Selected profile entries must be unique and dated.");
  }
  ids.add(profile.id);
}
for (const required of [
  "json-rpc-2.0",
  "http-rfc9110-rfc9112",
  "mcp-2026-07-28",
  "mcp-apps-and-openai-hosts-2026-08-15",
]) {
  if (!ids.has(required))
    throw new Error(`Missing selected profile ${required}.`);
}
if (
  register.founding_observation?.repository !==
    "https://github.com/IndelibleVivi/refrain" ||
  !/^[a-f0-9]{40}$/.test(register.founding_observation?.reviewed_commit ?? "")
) {
  throw new Error("Founding observation must pin one exact Refrain commit.");
}
if (
  register.publication?.state !== "local-private" ||
  register.publication?.remote_configured !== false ||
  register.publication?.license_selected !== false
) {
  throw new Error("Initial publication boundary must remain local-private.");
}

process.stdout.write("validated FIELDLAB-REGISTER.json\n");
