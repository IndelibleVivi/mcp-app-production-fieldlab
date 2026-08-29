import { access } from "node:fs/promises";

const requiredFiles = [
  "dist/__entry.js",
  "dist/server.js",
  "dist/self-contained-view.js",
  "dist/assets/.vite/manifest.json",
];

for (const file of requiredFiles) {
  await access(file).catch(() => {
    throw new Error(
      `Skybridge exited without the required production artifact ${file}.`,
    );
  });
}

const { loadSelfContainedFieldlabView } =
  await import("../dist/self-contained-view.js");
loadSelfContainedFieldlabView(process.cwd());

process.stdout.write("validated production build artifacts\n");
