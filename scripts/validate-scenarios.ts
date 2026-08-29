import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { scenarioSchema } from "../src/evidence/scenario.js";

const root = path.join(process.cwd(), "scenarios");
const files = (await readdir(root))
  .filter((file) => file.endsWith(".json"))
  .sort();
if (files.length === 0) throw new Error("No Field Lab scenarios were found.");

const identities = new Set<string>();
const scenarios = [];
for (const file of files) {
  const scenario = scenarioSchema.parse(
    JSON.parse(await readFile(path.join(root, file), "utf8")),
  );
  const identity = `${scenario.id}@${scenario.revision}`;
  if (identities.has(identity)) {
    throw new Error(`Duplicate scenario identity ${identity}.`);
  }
  identities.add(identity);
  scenarios.push(scenario);
  if (scenario.authorization_class !== "ordinary-local" && scenario.runner) {
    throw new Error(
      `${identity} must not expose an ordinary runnable command for an operator/external gate.`,
    );
  }
}

for (const scenario of scenarios) {
  for (const prerequisite of scenario.prerequisite_receipts) {
    if (!identities.has(prerequisite)) {
      throw new Error(
        `${scenario.id}@${scenario.revision} references unknown prerequisite ${prerequisite}.`,
      );
    }
  }
}

process.stdout.write(`validated ${files.length} scenarios\n`);
