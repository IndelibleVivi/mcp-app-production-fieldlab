import { access, readFile } from "node:fs/promises";

const requiredFiles = [
  "dist/__entry.js",
  "dist/server.js",
  "dist/assets/.vite/manifest.json",
];

for (const file of requiredFiles) {
  await access(file).catch(() => {
    throw new Error(
      `Skybridge exited without the required production artifact ${file}.`,
    );
  });
}

const manifest = JSON.parse(
  await readFile("dist/assets/.vite/manifest.json", "utf8"),
);
for (const key of ["skybridge:view:inspect-boundary", "style.css"]) {
  if (typeof manifest[key]?.file !== "string") {
    throw new Error(`Production manifest is missing ${JSON.stringify(key)}.`);
  }
}

const viewEntry = manifest["skybridge:view:inspect-boundary"];
if (
  Array.isArray(viewEntry.dynamicImports) &&
  viewEntry.dynamicImports.length > 0
) {
  throw new Error(
    "The production App entry retains dynamic imports and is not self-contained.",
  );
}

process.stdout.write("validated production build artifacts\n");
