import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { validateScenarioSet } from "../src/evidence/scenario.js";

const root = path.join(process.cwd(), "scenarios");
const files = (await readdir(root))
  .filter((file) => file.endsWith(".json"))
  .sort();
if (files.length === 0) throw new Error("No Field Lab scenarios were found.");

const values = [];
for (const file of files) {
  values.push(JSON.parse(await readFile(path.join(root, file), "utf8")));
}
validateScenarioSet(values);

process.stdout.write(`validated ${files.length} scenarios\n`);
