import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const FORMAT = "mcp-app-fieldlab-runtime@1";
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const REVISION_PATTERN = /^[a-f0-9]{40}$/;
const RUNTIME_ROOTS = ["dist", "package.json", "package-lock.json"];

function fail(message) {
  throw new Error(message);
}

export function parsePackageArguments(arguments_) {
  let output;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--out") {
      if (output !== undefined) fail("--out may be supplied only once.");
      const value = arguments_[index + 1];
      if (!value || value.startsWith("--")) {
        fail("--out requires an explicit directory path.");
      }
      output = value;
      index += 1;
      continue;
    }
    if (argument.startsWith("--out=")) {
      if (output !== undefined) fail("--out may be supplied only once.");
      output = argument.slice("--out=".length);
      if (!output) fail("--out requires an explicit directory path.");
      continue;
    }
    fail(`Unknown argument: ${argument}`);
  }
  if (output === undefined) {
    fail("Usage: npm run package:runtime -- --out=<new-directory>");
  }
  return { output };
}

function command(commandName, arguments_, options = {}) {
  const result = spawnSync(commandName, arguments_, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = options.capture
      ? `\n${`${result.stdout ?? ""}${result.stderr ?? ""}`.trim()}`
      : "";
    fail(
      `${commandName} ${arguments_.join(" ")} failed with exit code ${String(result.status)}.${detail}`,
    );
  }
  return options.capture ? String(result.stdout).trim() : "";
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function comparePaths(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function canonicalFileListBytes(files) {
  return Buffer.from(`${JSON.stringify(files)}\n`, "utf8");
}

function collectRelativeFiles(root, current = "") {
  const absolute = path.join(root, current);
  const stat = lstatSync(absolute);
  if (stat.isSymbolicLink()) {
    fail(`Runtime bundles may not contain symbolic links: ${current}`);
  }
  if (stat.isFile()) return [current.split(path.sep).join("/")];
  if (!stat.isDirectory()) {
    fail(
      `Runtime bundles may contain only regular files and directories: ${current}`,
    );
  }
  return readdirSync(absolute, { withFileTypes: true })
    .sort((left, right) => comparePaths(left.name, right.name))
    .flatMap((entry) =>
      collectRelativeFiles(root, path.join(current, entry.name)),
    );
}

export function runtimeFileEntries(root) {
  return collectRelativeFiles(root)
    .filter((relativePath) => relativePath !== "release.json")
    .sort(comparePaths)
    .map((relativePath) => {
      const bytes = readFileSync(path.join(root, relativePath));
      return {
        path: relativePath,
        bytes: bytes.byteLength,
        sha256: sha256(bytes),
      };
    });
}

function resolveRepositoryRoot() {
  const scriptRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const repositoryRoot = command(
    "git",
    ["-C", scriptRoot, "rev-parse", "--show-toplevel"],
    { capture: true },
  );
  if (path.resolve(repositoryRoot) !== scriptRoot) {
    fail("Packaging must run from the Field Lab repository root.");
  }
  return scriptRoot;
}

function assertSafeNewOutput(repositoryRoot, requestedOutput) {
  const output = path.resolve(process.cwd(), requestedOutput);
  const relativeFromOutputToRepository = path.relative(output, repositoryRoot);
  if (
    output === repositoryRoot ||
    (!relativeFromOutputToRepository.startsWith("..") &&
      !path.isAbsolute(relativeFromOutputToRepository))
  ) {
    fail("--out must not be the repository root or one of its parents.");
  }
  const gitDirectory = path.join(repositoryRoot, ".git");
  const relativeToGit = path.relative(gitDirectory, output);
  if (
    relativeToGit === "" ||
    (!relativeToGit.startsWith("..") && !path.isAbsolute(relativeToGit))
  ) {
    fail("--out must not be inside .git.");
  }
  if (existsSync(output)) {
    fail(`Refusing to overwrite existing output: ${output}`);
  }
  return output;
}

function sourceRevision(repositoryRoot) {
  let revision;
  try {
    revision = command(
      "git",
      ["-C", repositoryRoot, "rev-parse", "--verify", "HEAD^{commit}"],
      { capture: true },
    );
  } catch {
    fail(
      "Runtime packaging requires HEAD to resolve to one committed revision.",
    );
  }
  if (!REVISION_PATTERN.test(revision)) {
    fail("HEAD does not resolve to one complete Git commit.");
  }
  return revision;
}

function assertClean(repositoryRoot) {
  const status = command(
    "git",
    ["-C", repositoryRoot, "status", "--porcelain=v1", "--untracked-files=all"],
    { capture: true },
  );
  if (status !== "") {
    fail(
      "Runtime packaging requires a completely clean committed tree, including no untracked files.",
    );
  }
}

function writeReleaseManifest(stagingRoot, revision) {
  const files = runtimeFileEntries(stagingRoot);
  if (files.length === 0) fail("The runtime candidate contains no files.");
  const digest = sha256(canonicalFileListBytes(files));
  if (!SHA256_PATTERN.test(digest)) fail("Could not derive a bundle digest.");
  const manifest = {
    format: FORMAT,
    sourceRevision: revision,
    sourceDirty: false,
    bundleDigest: `sha256:${digest}`,
    files,
  };
  writeFileSync(
    path.join(stagingRoot, "release.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { encoding: "utf8", flag: "wx" },
  );
  return manifest;
}

function copyRuntimeRoots(worktreeRoot, stagingRoot) {
  for (const relativePath of RUNTIME_ROOTS) {
    const source = path.join(worktreeRoot, relativePath);
    if (!existsSync(source)) {
      fail(
        `Required runtime root is missing after the clean build: ${relativePath}`,
      );
    }
    cpSync(source, path.join(stagingRoot, relativePath), {
      recursive: true,
      force: false,
      errorOnExist: true,
    });
  }
  const dockerfileSource = path.join(
    worktreeRoot,
    "deploy",
    "runtime",
    "Dockerfile",
  );
  if (!existsSync(dockerfileSource)) {
    fail("Required runtime Dockerfile is missing: deploy/runtime/Dockerfile");
  }
  cpSync(dockerfileSource, path.join(stagingRoot, "Dockerfile"), {
    force: false,
    errorOnExist: true,
  });
}

export function assertNoTrackedInstallProjection(worktreeRoot) {
  if (readdirSync(worktreeRoot).includes("node_modules")) {
    fail(
      "The committed revision contains node_modules; refusing to let npm ci remove or follow a tracked install projection.",
    );
  }
}

export function packageRuntime(arguments_ = process.argv.slice(2)) {
  const { output: requestedOutput } = parsePackageArguments(arguments_);
  const repositoryRoot = resolveRepositoryRoot();
  const output = assertSafeNewOutput(repositoryRoot, requestedOutput);
  const revision = sourceRevision(repositoryRoot);
  assertClean(repositoryRoot);

  const outputParent = path.dirname(output);
  mkdirSync(outputParent, { recursive: true });
  const stagingRoot = mkdtempSync(
    path.join(outputParent, ".mcp-app-fieldlab-runtime-"),
  );
  const worktreeParent = mkdtempSync(
    path.join(tmpdir(), "mcp-app-fieldlab-worktree-"),
  );
  const worktreeRoot = path.join(worktreeParent, "checkout");
  let worktreeAdded = false;
  let adopted = false;
  try {
    command("git", [
      "-C",
      repositoryRoot,
      "worktree",
      "add",
      "--detach",
      worktreeRoot,
      revision,
    ]);
    worktreeAdded = true;
    assertNoTrackedInstallProjection(worktreeRoot);
    const buildEnvironment = {
      ...process.env,
      DO_NOT_TRACK: "1",
      SKYBRIDGE_TELEMETRY_DISABLED: "1",
    };
    command("npm", ["ci"], { cwd: worktreeRoot, env: buildEnvironment });
    command("npm", ["run", "build"], {
      cwd: worktreeRoot,
      env: buildEnvironment,
    });
    copyRuntimeRoots(worktreeRoot, stagingRoot);
    const manifest = writeReleaseManifest(stagingRoot, revision);

    if (existsSync(output)) {
      fail(
        `Output appeared during packaging; refusing to replace it: ${output}`,
      );
    }
    renameSync(stagingRoot, output);
    adopted = true;
    process.stdout.write(
      `${JSON.stringify(
        {
          output,
          sourceRevision: manifest.sourceRevision,
          bundleDigest: manifest.bundleDigest,
          fileCount: manifest.files.length,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    if (worktreeAdded) {
      const removal = spawnSync(
        "git",
        ["-C", repositoryRoot, "worktree", "remove", "--force", worktreeRoot],
        { encoding: "utf8", stdio: "pipe" },
      );
      if (removal.status !== 0) {
        process.stderr.write(
          `Warning: could not remove temporary worktree ${worktreeRoot}: ${String(removal.stderr ?? "").trim()}\n`,
        );
      }
    }
    if (existsSync(worktreeParent)) {
      rmSync(worktreeParent, { recursive: true, force: true });
    }
    if (!adopted && existsSync(stagingRoot)) {
      rmSync(stagingRoot, { recursive: true, force: true });
    }
  }
}

const isMain =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    packageRuntime();
  } catch (error) {
    process.stderr.write(
      `package-runtime: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
