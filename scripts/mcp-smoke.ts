import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { parseReceipt } from "../src/evidence/receipt.js";
import {
  FIELDLAB_VIEW_MIME_TYPE,
  FIELDLAB_VIEW_URI,
} from "../src/resource-contract.js";

async function availablePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", resolve);
  });
  const address = probe.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not allocate a loopback MCP smoke port.");
  }
  await new Promise<void>((resolve, reject) => {
    probe.close((error) => (error ? reject(error) : resolve()));
  });
  return address.port;
}

async function waitForServer(
  healthUrl: string,
  child: ChildProcess,
  stderr: string[],
): Promise<void> {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `Production MCP process exited with ${child.exitCode}: ${stderr.join("")}`,
      );
    }
    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
    } catch {
      // The process has not bound its loopback port yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    "Production MCP process did not become healthy in 15 seconds.",
  );
}

function gitSubject(): { source_revision?: string; source_dirty: boolean } {
  const revision = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  });
  const status = spawnSync("git", ["status", "--porcelain"], {
    encoding: "utf8",
  });
  const sourceRevision = revision.status === 0 ? revision.stdout.trim() : "";
  return {
    ...(sourceRevision.match(/^[a-f0-9]{40}$/)
      ? { source_revision: sourceRevision }
      : {}),
    source_dirty: status.status !== 0 || status.stdout.trim().length > 0,
  };
}

function assertEmptyDomainList(
  value: unknown,
  field: string,
): asserts value is unknown[] {
  if (!Array.isArray(value) || value.length !== 0) {
    throw new Error(`The App resource declares unexpected ${field}.`);
  }
}

await access("dist/__entry.js").catch(() => {
  throw new Error("Missing production build; run npm run build first.");
});

const port = await availablePort();
const origin = `http://127.0.0.1:${port}`;
const stderr: string[] = [];
const child = spawn(process.execPath, [path.resolve("dist/__entry.js")], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: "production",
    __PORT: String(port),
  },
  stdio: ["ignore", "ignore", "pipe"],
});
child.stderr?.on("data", (chunk) => stderr.push(String(chunk)));

const client = new Client(
  { name: "mcp-app-production-fieldlab-smoke", version: "0.1.0" },
  { capabilities: { extensions: { "io.modelcontextprotocol/ui": {} } } },
);

try {
  await waitForServer(`${origin}/healthz`, child, stderr);
  const healthResponse = await fetch(`${origin}/healthz`);
  const health = (await healthResponse.json()) as Record<string, unknown>;
  if (
    healthResponse.status !== 200 ||
    health.status !== "ok" ||
    health.server !== "MCP App Production Field Lab"
  ) {
    throw new Error("The production health contract was unavailable.");
  }

  await client.connect(
    new StreamableHTTPClientTransport(new URL(`${origin}/mcp`)),
  );

  const tools = await client.listTools();
  if (tools.tools.length !== 1 || tools.tools[0]?.name !== "inspect_boundary") {
    throw new Error(
      `Expected exactly inspect_boundary; received ${tools.tools.map((tool) => tool.name).join(", ")}.`,
    );
  }
  const tool = tools.tools[0];
  if (
    tool._meta?.ui?.resourceUri !== FIELDLAB_VIEW_URI ||
    tool._meta?.["openai/outputTemplate"] !== FIELDLAB_VIEW_URI
  ) {
    throw new Error("The tool did not advertise the exact App resource URI.");
  }

  const result = await client.callTool({
    name: "inspect_boundary",
    arguments: {
      scenario: "resource-delivery",
      probeId: "mcp-smoke",
    },
  });
  const structured = result.structuredContent as
    Record<string, unknown> | undefined;
  if (
    structured?.format !== "fieldlab-boundary-result@1" ||
    structured.probeId !== "mcp-smoke" ||
    structured.evidenceCeiling !== "process"
  ) {
    throw new Error("The tool returned an unexpected structured projection.");
  }
  const marker = (
    result._meta?.componentOnly as Record<string, unknown> | undefined
  )?.marker;
  if (
    marker !== "component-only:mcp-smoke" ||
    JSON.stringify(structured).includes("component-only:mcp-smoke")
  ) {
    throw new Error(
      "Component-only metadata crossed the model-visible projection boundary.",
    );
  }

  const resources = await client.listResources();
  if (
    resources.resources.length !== 1 ||
    resources.resources[0]?.uri !== FIELDLAB_VIEW_URI
  ) {
    throw new Error("The server did not expose exactly one App resource.");
  }
  const listed = resources.resources[0];
  if (listed.mimeType !== FIELDLAB_VIEW_MIME_TYPE) {
    throw new Error("The listed App resource has the wrong MIME type.");
  }
  const csp = listed._meta?.ui?.csp as Record<string, unknown> | undefined;
  for (const field of [
    "resourceDomains",
    "connectDomains",
    "frameDomains",
    "baseUriDomains",
  ]) {
    assertEmptyDomainList(csp?.[field], `ui.csp.${field}`);
  }

  const read = await client.readResource({ uri: FIELDLAB_VIEW_URI });
  const content = read.contents.find(
    (item) => item.uri === FIELDLAB_VIEW_URI && "text" in item,
  );
  if (
    !content ||
    !("text" in content) ||
    content.mimeType !== FIELDLAB_VIEW_MIME_TYPE ||
    typeof content.text !== "string"
  ) {
    throw new Error("resources/read did not return the exact App HTML.");
  }
  const html = content.text;
  const bytes = Buffer.byteLength(html);
  if (listed.size !== bytes) {
    throw new Error("resources/list and resources/read disagree on byte size.");
  }
  const outerMarkup = html
    .replace(/<style>[\s\S]*<\/style>/, "<style></style>")
    .replace(
      /<script type="module">[\s\S]*<\/script>/,
      '<script type="module"></script>',
    );
  if (/(?:src|href)=["']/i.test(outerMarkup) || html.includes(origin)) {
    throw new Error("The production App resource retains an external asset.");
  }
  if (!html.includes('window.skybridge = { hostType: "mcp-app" };')) {
    throw new Error(
      "The production App resource omitted its MCP App bridge marker.",
    );
  }

  const resourceSha256 = createHash("sha256").update(html).digest("hex");
  const receipt = parseReceipt({
    format: "mcp-app-fieldlab-receipt@1",
    generated_at: new Date().toISOString(),
    scenario: { id: "mcp-app.resource-roundtrip", revision: "1" },
    claim: {
      text: "A fresh production MCP process exposed and returned one exact self-contained App resource.",
      status: "verified",
      method_rung: "process",
      proof_ceiling: "process",
    },
    subject: {
      ...gitSubject(),
      resource: {
        uri: FIELDLAB_VIEW_URI,
        mime_type: FIELDLAB_VIEW_MIME_TYPE,
        bytes,
        sha256: resourceSha256,
      },
    },
    environment: { class: "local-process" },
    capability: {
      discovery: "unknown",
      disposition: "not_attempted",
    },
    root_cause_confidence: "confirmed",
    observations: {
      transport: "streamable-http",
      tool_count: tools.tools.length,
      resource_count: resources.resources.length,
      component_only_marker_separated: true,
      external_asset_dependencies: 0,
    },
    evidence_refs: [`resource:sha256:${resourceSha256}`],
    limitations: [
      "The process ran on loopback from the developer build output.",
      "No declared browser host profile was exercised by this scenario.",
    ],
    not_proven: [
      "clean package identity",
      "selected production runtime",
      "Secure MCP Tunnel reachability",
      "named-host admission",
      "owner acceptance",
    ],
  });
  const receiptPath = path.resolve(
    "tmp",
    "receipts",
    "mcp-resource-roundtrip.json",
  );
  await mkdir(path.dirname(receiptPath), { recursive: true });
  await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);

  process.stdout.write(
    `${JSON.stringify(
      {
        transport: "streamable-http",
        tool: tool.name,
        resource: FIELDLAB_VIEW_URI,
        resourceBytes: bytes,
        resourceSha256,
        receipt: path.relative(process.cwd(), receiptPath),
        notProven: receipt.not_proven,
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await client.close().catch(() => undefined);
  child.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    if (child.exitCode !== null) resolve();
    else child.once("exit", () => resolve());
  });
  if (stderr.length > 0) process.stderr.write(stderr.join(""));
}
