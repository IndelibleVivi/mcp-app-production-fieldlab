import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { format } from "prettier";
import { z } from "zod";
import { receiptSchema } from "../src/evidence/receipt.js";
import { scenarioSchema } from "../src/evidence/scenario.js";

const root = process.cwd();
const check = process.argv.slice(2).includes("--check");
const schemas = [
  {
    path: "schemas/evidence-receipt.schema.json",
    id: "https://fieldlab.invalid/schemas/evidence-receipt@1",
    schema: receiptSchema,
  },
  {
    path: "schemas/scenario.schema.json",
    id: "https://fieldlab.invalid/schemas/scenario@1",
    schema: scenarioSchema,
  },
];

for (const entry of schemas) {
  const generated = z.toJSONSchema(entry.schema, {
    target: "draft-2020-12",
    unrepresentable: "throw",
  });
  const text = await format(
    JSON.stringify(
      {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        $id: entry.id,
        ...generated,
      },
      null,
      2,
    ),
    {
      parser: "json",
    },
  );
  const destination = path.join(root, entry.path);
  if (check) {
    const current = await readFile(destination, "utf8").catch(() => "");
    if (current !== text) {
      throw new Error(`${entry.path} is stale; run npm run schemas:write.`);
    }
  } else {
    await writeFile(destination, text);
  }
}

process.stdout.write(
  `${check ? "validated" : "generated"} ${schemas.length} schemas\n`,
);
