import { spawn, spawnSync } from "node:child_process";
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
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const FORMAT = "mcp-app-fieldlab-runtime@1";
const EXPECTED_RESOURCE_URI =
  "ui://mcp-app-production-fieldlab/inspect-boundary/v1.html";
const EXPECTED_MIME_TYPE = "text/html;profile=mcp-app";
const CANONICAL_SUL_SHA256 =
  "c6d0dde0f0463c800e542d7d64237ffef37f43b17004975a558604f17b5d1af1";
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const REVISION_PATTERN = /^[a-f0-9]{40}$/;

function fail(message) {
  throw new Error(message);
}

function parseArguments(arguments_) {
  let candidate;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--candidate") {
      if (candidate !== undefined) {
        fail("--candidate may be supplied only once.");
      }
      const value = arguments_[index + 1];
      if (!value || value.startsWith("--")) {
        fail("--candidate requires an explicit directory path.");
      }
      candidate = value;
      index += 1;
      continue;
    }
    if (argument.startsWith("--candidate=")) {
      if (candidate !== undefined) {
        fail("--candidate may be supplied only once.");
      }
      candidate = argument.slice("--candidate=".length);
      if (!candidate) {
        fail("--candidate requires an explicit directory path.");
      }
      continue;
    }
    fail(`Unknown argument: ${argument}`);
  }
  if (candidate === undefined) {
    fail("Usage: npm run smoke:runtime -- --candidate=<runtime-directory>");
  }
  return { candidate };
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function comparePaths(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalFileListBytes(files) {
  return Buffer.from(`${JSON.stringify(files)}\n`, "utf8");
}

function safeRelativePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !path.isAbsolute(value) &&
    !value.split(/[\\/]/).includes("..") &&
    value.split(path.sep).join("/") === value
  );
}

function listedCandidateFiles(root, current = "") {
  const absolute = path.join(root, current);
  const stat = lstatSync(absolute);
  if (stat.isSymbolicLink()) fail(`Candidate contains a symlink: ${current}`);
  if (stat.isFile()) return [current.split(path.sep).join("/")];
  if (!stat.isDirectory()) {
    fail(`Candidate contains a non-regular filesystem entry: ${current}`);
  }
  return readdirSync(absolute, { withFileTypes: true })
    .sort((left, right) => comparePaths(left.name, right.name))
    .flatMap((entry) =>
      listedCandidateFiles(root, path.join(current, entry.name)),
    );
}

function parseAndVerifyRelease(candidateRoot) {
  const releasePath = path.join(candidateRoot, "release.json");
  if (!existsSync(releasePath)) fail("Candidate is missing release.json.");
  let release;
  try {
    release = JSON.parse(readFileSync(releasePath, "utf8"));
  } catch (error) {
    fail(
      `Candidate release.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (
    !release ||
    typeof release !== "object" ||
    release.format !== FORMAT ||
    release.sourceDirty !== false ||
    typeof release.sourceRevision !== "string" ||
    !REVISION_PATTERN.test(release.sourceRevision) ||
    typeof release.bundleDigest !== "string" ||
    !/^sha256:[a-f0-9]{64}$/.test(release.bundleDigest) ||
    !Array.isArray(release.files) ||
    release.files.length === 0
  ) {
    fail("Candidate release identity is invalid.");
  }
  if (
    JSON.stringify(Object.keys(release).sort(comparePaths)) !==
    JSON.stringify(
      ["format", "sourceRevision", "sourceDirty", "bundleDigest", "files"].sort(
        comparePaths,
      ),
    )
  ) {
    fail("Candidate release.json has an unexpected top-level field.");
  }

  const declaredPaths = [];
  for (const file of release.files) {
    if (
      !file ||
      typeof file !== "object" ||
      !safeRelativePath(file.path) ||
      !Number.isSafeInteger(file.bytes) ||
      file.bytes < 0 ||
      typeof file.sha256 !== "string" ||
      !SHA256_PATTERN.test(file.sha256)
    ) {
      fail("Candidate release file entry is invalid.");
    }
    if (
      JSON.stringify(Object.keys(file).sort(comparePaths)) !==
      JSON.stringify(["path", "bytes", "sha256"].sort(comparePaths))
    ) {
      fail("Candidate release file entry has an unexpected field.");
    }
    const bytes = readFileSync(path.join(candidateRoot, file.path));
    if (bytes.byteLength !== file.bytes || sha256(bytes) !== file.sha256) {
      fail(`Candidate file does not match release.json: ${file.path}`);
    }
    declaredPaths.push(file.path);
  }
  const observedPaths = listedCandidateFiles(candidateRoot)
    .filter((relativePath) => relativePath !== "release.json")
    .sort(comparePaths);
  const sortedDeclaredPaths = [...declaredPaths].sort(comparePaths);
  if (
    JSON.stringify(declaredPaths) !== JSON.stringify(sortedDeclaredPaths) ||
    new Set(declaredPaths).size !== declaredPaths.length ||
    JSON.stringify(declaredPaths) !== JSON.stringify(observedPaths)
  ) {
    fail("Candidate files do not match the exact sorted release file closure.");
  }
  const expectedBundleDigest = `sha256:${sha256(
    canonicalFileListBytes(release.files),
  )}`;
  if (release.bundleDigest !== expectedBundleDigest) {
    fail("Candidate bundleDigest does not match the canonical file list.");
  }
  for (const requiredPath of [
    "LICENSE",
    "LICENSE-DOCUMENTATION.md",
    "LICENSING.md",
  ]) {
    if (!declaredPaths.includes(requiredPath)) {
      fail(`Candidate is missing required licensing material: ${requiredPath}`);
    }
  }
  if (
    sha256(readFileSync(path.join(candidateRoot, "LICENSE"))) !==
    CANONICAL_SUL_SHA256
  ) {
    fail("Candidate LICENSE does not match the canonical SUL-1.0 text.");
  }
  const candidatePackage = JSON.parse(
    readFileSync(path.join(candidateRoot, "package.json"), "utf8"),
  );
  if (candidatePackage.license !== "SEE LICENSE IN LICENSING.md") {
    fail("Candidate package metadata does not point to LICENSING.md.");
  }
  return release;
}

function runInstall(runtimeRoot) {
  const result = spawnSync("npm", ["ci", "--omit=dev"], {
    cwd: runtimeRoot,
    env: {
      ...process.env,
      DO_NOT_TRACK: "1",
      SKYBRIDGE_TELEMETRY_DISABLED: "1",
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    fail(
      `Production dependency installation failed with exit code ${String(result.status)}:\n${`${result.stdout ?? ""}${result.stderr ?? ""}`.trim()}`,
    );
  }
}

async function availablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    fail("Could not allocate a loopback runtime port.");
  }
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

function appendBounded(chunks, chunk) {
  const currentBytes = chunks.reduce(
    (total, value) => total + Buffer.byteLength(value),
    0,
  );
  if (currentBytes >= 32_768) return;
  chunks.push(String(chunk).slice(0, 32_768 - currentBytes));
}

async function waitForHealth(url, child) {
  const deadline = Date.now() + 20_000;
  let lastError;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      fail(`Runtime exited before health readback (code ${child.exitCode}).`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return { response, body: await response.json() };
      lastError = new Error(`health returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  fail(
    `Runtime did not become healthy within 20 seconds${
      lastError instanceof Error ? `: ${lastError.message}` : "."
    }`,
  );
}

async function stopChild(child) {
  if (!child || child.exitCode !== null) return;
  child.kill("SIGTERM");
  const exited = await Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);
  if (!exited && child.exitCode === null) {
    child.kill("SIGKILL");
    await new Promise((resolve) => child.once("exit", resolve));
  }
}

function exactReleaseIdentity(release) {
  return {
    sourceRevision: release.sourceRevision,
    bundleDigest: release.bundleDigest,
    fileCount: release.files.length,
  };
}

function assertHealth(health, release) {
  const expectedIdentity = exactReleaseIdentity(release);
  if (
    !health ||
    typeof health !== "object" ||
    health.status !== "ok" ||
    health.server !== "MCP App Production Field Lab" ||
    JSON.stringify(health.release) !== JSON.stringify(expectedIdentity)
  ) {
    fail("Health readback did not expose the exact packaged release identity.");
  }
  return expectedIdentity;
}

async function verifyMcp(origin, release) {
  const client = new Client(
    { name: "fieldlab-isolated-runtime-smoke", version: "1" },
    { capabilities: { extensions: { "io.modelcontextprotocol/ui": {} } } },
  );
  let connected = false;
  try {
    await client.connect(
      new StreamableHTTPClientTransport(new URL(`${origin}/mcp`)),
    );
    connected = true;
    const tools = await client.listTools();
    if (
      tools.tools.length !== 1 ||
      tools.tools[0]?.name !== "inspect_boundary"
    ) {
      fail("Isolated runtime did not expose exactly inspect_boundary.");
    }
    const tool = tools.tools[0];
    const resourceUri = tool?._meta?.ui?.resourceUri;
    if (
      resourceUri !== EXPECTED_RESOURCE_URI ||
      tool?._meta?.["openai/outputTemplate"] !== EXPECTED_RESOURCE_URI
    ) {
      fail("Tool discovery did not bind the exact MCP App resource URI.");
    }

    const resources = await client.listResources();
    if (
      resources.resources.length !== 1 ||
      resources.resources[0]?.uri !== EXPECTED_RESOURCE_URI
    ) {
      fail(
        "Isolated runtime did not expose exactly one expected App resource.",
      );
    }
    const listedResource = resources.resources[0];
    const csp = listedResource?._meta?.ui?.csp;
    for (const field of [
      "resourceDomains",
      "connectDomains",
      "frameDomains",
      "baseUriDomains",
    ]) {
      if (!Array.isArray(csp?.[field]) || csp[field].length !== 0) {
        fail(`Packaged App resource declared unexpected ${field}.`);
      }
    }

    const resourceResult = await client.readResource({
      uri: EXPECTED_RESOURCE_URI,
    });
    if (resourceResult.contents.length !== 1) {
      fail("App resource readback did not return exactly one content item.");
    }
    const resourceContent = resourceResult.contents[0];
    if (
      resourceContent?.uri !== EXPECTED_RESOURCE_URI ||
      resourceContent?.mimeType !== EXPECTED_MIME_TYPE ||
      typeof resourceContent?.text !== "string"
    ) {
      fail("App resource readback did not return the exact HTML contract.");
    }
    const resourceBytes = Buffer.byteLength(resourceContent.text, "utf8");
    if (
      typeof listedResource.size !== "number" ||
      listedResource.size !== resourceBytes
    ) {
      fail("Resource discovery size did not match exact readback bytes.");
    }
    if (
      JSON.stringify(resourceContent._meta?.ui?.csp) !== JSON.stringify(csp)
    ) {
      fail("Resource discovery and readback disagree on the exact CSP.");
    }
    const outerMarkup = resourceContent.text
      .replace(/<style>[\s\S]*<\/style>/, "<style></style>")
      .replace(
        /<script type="module">[\s\S]*<\/script>/,
        '<script type="module"></script>',
      );
    if (
      /(?:src|href)=["']/i.test(outerMarkup) ||
      !resourceContent.text.includes(
        'window.skybridge = { hostType: "mcp-app" };',
      )
    ) {
      fail("Packaged MCP App HTML is not the expected self-contained view.");
    }

    const probeId = "isolated-runtime-readback";
    const toolResult = await client.callTool({
      name: "inspect_boundary",
      arguments: { scenario: "resource-delivery", probeId },
    });
    if (
      toolResult.structuredContent?.format !== "fieldlab-boundary-result@1" ||
      toolResult.structuredContent?.scenario !== "resource-delivery" ||
      toolResult.structuredContent?.probeId !== probeId ||
      toolResult.structuredContent?.evidenceCeiling !== "process"
    ) {
      fail("Tool call did not return the expected structured boundary result.");
    }
    const marker = `component-only:${probeId}`;
    if (
      toolResult._meta?.componentOnly?.marker !== marker ||
      JSON.stringify(toolResult.structuredContent).includes(marker)
    ) {
      fail("Component-only metadata crossed the model-visible projection.");
    }
    if (
      JSON.stringify(toolResult._meta?.["fieldlab/release"]) !==
      JSON.stringify(exactReleaseIdentity(release))
    ) {
      fail("Tool result did not carry the exact packaged release identity.");
    }

    return {
      toolCount: tools.tools.length,
      resourceCount: resources.resources.length,
      resource: {
        uri: EXPECTED_RESOURCE_URI,
        mime_type: EXPECTED_MIME_TYPE,
        bytes: resourceBytes,
        sha256: sha256(Buffer.from(resourceContent.text, "utf8")),
      },
      componentOnlyProjection: "preserved",
    };
  } finally {
    if (connected) await client.close();
  }
}

function makeReceipt(release, identity, observations) {
  return {
    format: "mcp-app-fieldlab-receipt@1",
    generated_at: new Date().toISOString(),
    scenario: { id: "runtime.isolated-readback", revision: "1" },
    claim: {
      text: "The exact clean runtime candidate installed production dependencies, started in a disposable local process, and reproduced its release and MCP App resource identities.",
      status: "verified",
      method_rung: "activated-runtime",
      proof_ceiling: "activated-runtime",
    },
    subject: {
      source_revision: release.sourceRevision,
      source_dirty: false,
      resource: observations.resource,
      bundle_digest: release.bundleDigest,
      runtime_identity: identity,
    },
    environment: { class: "isolated-runtime", host_profile: "loopback-node" },
    root_cause_confidence: "confirmed",
    observations: {
      production_dependency_install: "npm ci --omit=dev",
      health_release_identity: identity,
      tool_count: observations.toolCount,
      resource_count: observations.resourceCount,
      component_only_projection: observations.componentOnlyProjection,
    },
    evidence_refs: [
      "candidate:release.json",
      "runtime:/healthz",
      "runtime:MCP tools/list",
      "runtime:MCP resources/list",
      "runtime:MCP resources/read",
      "runtime:MCP tools/call",
    ],
    limitations: [
      "The runtime was activated only as a disposable local Node process.",
      "Dependency installation may use the configured npm registry or local npm cache.",
    ],
    not_proven: [
      "container activation",
      "installation into an operator service",
      "production runtime selection",
      "Secure MCP Tunnel target authority",
      "named-host behavior",
      "owner acceptance",
    ],
  };
}

function writeReceipt(repositoryRoot, receipt) {
  const receiptDirectory = path.join(repositoryRoot, "tmp", "receipts");
  mkdirSync(receiptDirectory, { recursive: true });
  const receiptPath = path.join(
    receiptDirectory,
    "runtime.isolated-readback@1.json",
  );
  const temporaryPath = `${receiptPath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(receipt, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  renameSync(temporaryPath, receiptPath);
  return receiptPath;
}

export async function runtimeSmoke(arguments_ = process.argv.slice(2)) {
  const { candidate: candidateArgument } = parseArguments(arguments_);
  const repositoryRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const candidateRoot = path.resolve(process.cwd(), candidateArgument);
  if (!existsSync(candidateRoot) || !lstatSync(candidateRoot).isDirectory()) {
    fail(`--candidate must name an existing directory: ${candidateRoot}`);
  }
  const release = parseAndVerifyRelease(candidateRoot);
  const runtimeRoot = mkdtempSync(
    path.join(tmpdir(), "mcp-app-fieldlab-runtime-smoke-"),
  );
  let child;
  let clientObservations;
  const stdout = [];
  const stderr = [];
  try {
    cpSync(candidateRoot, runtimeRoot, {
      recursive: true,
      force: false,
      errorOnExist: false,
    });
    runInstall(runtimeRoot);

    const port = await availablePort();
    const origin = `http://127.0.0.1:${port}`;
    const childEnvironment = {
      ...process.env,
      NODE_ENV: "production",
      __PORT: String(port),
      DO_NOT_TRACK: "1",
      SKYBRIDGE_TELEMETRY_DISABLED: "1",
    };
    delete childEnvironment.FIELDLAB_RELEASE_FILE;
    child = spawn(process.execPath, ["dist/__entry.js"], {
      cwd: runtimeRoot,
      env: childEnvironment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk) => appendBounded(stdout, chunk));
    child.stderr.on("data", (chunk) => appendBounded(stderr, chunk));

    const { body: health } = await waitForHealth(`${origin}/healthz`, child);
    const identity = assertHealth(health, release);
    clientObservations = await verifyMcp(origin, release);

    const candidateReceiptModule = await import(
      pathToFileURL(path.join(runtimeRoot, "dist", "evidence", "receipt.js"))
        .href
    );
    const receipt = makeReceipt(release, identity, clientObservations);
    const validatedReceipt = candidateReceiptModule.parseReceipt(receipt);
    const receiptPath = writeReceipt(repositoryRoot, validatedReceipt);

    process.stdout.write(
      `${JSON.stringify(
        {
          candidate: candidateRoot,
          sourceRevision: release.sourceRevision,
          bundleDigest: release.bundleDigest,
          resourceSha256: clientObservations.resource.sha256,
          receipt: path.relative(repositoryRoot, receiptPath),
          scenario: "runtime.isolated-readback@1",
          proofCeiling: "activated-runtime",
          notProven: receipt.not_proven,
        },
        null,
        2,
      )}\n`,
    );
  } catch (error) {
    const processOutput = `${stdout.join("")}${stderr.join("")}`.trim();
    if (processOutput !== "") {
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}\nRuntime output:\n${processOutput}`,
      );
    }
    throw error;
  } finally {
    await stopChild(child);
    rmSync(runtimeRoot, { recursive: true, force: true });
  }
}

const isMain =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    await runtimeSmoke();
  } catch (error) {
    process.stderr.write(
      `runtime-smoke: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  }
}
