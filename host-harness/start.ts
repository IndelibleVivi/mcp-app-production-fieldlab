import { spawn, type ChildProcess } from "node:child_process";
import { createServer as createHttpServer, type Server } from "node:http";
import { createServer as createNetServer } from "node:net";
import { resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { build as viteBuild, type Rollup } from "vite";
import type {
  BrowserHarnessBoot,
  HarnessCase,
  ResourceObservation,
} from "./ledger.js";
import { isLocalHostProfileId, type LocalHostProfileId } from "./profiles.js";

const FIELDLAB_RESOURCE_MIME = "text/html;profile=mcp-app";
const FIELDLAB_TOOL = "inspect_boundary";

type FieldlabScenario = "resource-delivery" | "optional-capability";

export interface LocalHostHarness {
  origin: string;
  mcpOrigin: string;
  resource: ResourceObservation;
  cases: Record<FieldlabScenario, HarnessCase>;
  serverOutput: { stdout: string[]; stderr: string[] };
  url(profile: LocalHostProfileId, scenario: FieldlabScenario): string;
  close(): Promise<void>;
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function availablePort(): Promise<number> {
  const server = createNetServer();
  await new Promise<void>((accept, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", accept);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not allocate a local field-lab port.");
  }
  await new Promise<void>((accept, reject) =>
    server.close((error) => (error ? reject(error) : accept())),
  );
  return address.port;
}

async function waitForServer(
  healthUrl: string,
  child: ChildProcess,
): Promise<void> {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `The production MCP server exited with code ${child.exitCode}.`,
      );
    }
    try {
      const response = await fetch(healthUrl);
      if (response.ok) return;
    } catch {
      // The bounded readiness loop owns this expected connection failure.
    }
    await new Promise((accept) => setTimeout(accept, 100));
  }
  throw new Error("The production MCP server did not become ready in 20s.");
}

async function closeChild(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await new Promise<void>((accept) => {
    const timer = setTimeout(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
    }, 5_000);
    child.once("exit", () => {
      clearTimeout(timer);
      accept();
    });
  });
}

async function closeHttpServer(server: Server | undefined): Promise<void> {
  if (!server) return;
  await new Promise<void>((accept, reject) =>
    server.close((error) => (error ? reject(error) : accept())),
  );
}

function escapeClosingScript(source: string): string {
  return source.replace(/<\/script/gi, "<\\/script");
}

async function bundleBrowserHost(root: string): Promise<string> {
  const result = await viteBuild({
    configFile: false,
    root,
    logLevel: "silent",
    build: {
      target: "es2022",
      minify: false,
      sourcemap: false,
      write: false,
      rollupOptions: {
        input: resolve(root, "host-harness/browser-host.ts"),
        output: {
          format: "es",
          inlineDynamicImports: true,
        },
      },
    },
  });
  const outputs = Array.isArray(result) ? result : [result];
  const chunks = outputs.flatMap((output) =>
    (output as Rollup.RollupOutput).output.filter(
      (item): item is Rollup.OutputChunk => item.type === "chunk",
    ),
  );
  const entry = chunks.find((chunk) => chunk.isEntry);
  if (!entry || chunks.length !== 1) {
    throw new Error(
      `Expected one self-contained local-host entry chunk, received ${chunks.length}.`,
    );
  }
  return entry.code;
}

function hostPageHtml(
  payload: BrowserHarnessBoot,
  browserHostCode: string,
): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MCP App Production Field Lab local host</title>
    <style>
      :root { color-scheme: light; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      * { box-sizing: border-box; }
      body { margin: 0; background: #e9e7e1; color: #20262b; }
      main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(20rem, 34rem); min-height: 100vh; }
      iframe { width: 100%; min-height: 100vh; border: 0; background: #f8f7f3; }
      aside { border-left: 1px solid #bcb8af; padding: 1rem; overflow: auto; }
      h1 { margin: 0 0 .75rem; font: 600 1rem/1.3 ui-sans-serif, system-ui, sans-serif; }
      p { margin: 0 0 1rem; color: #586169; font: .78rem/1.5 ui-sans-serif, system-ui, sans-serif; }
      pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font: .7rem/1.45 ui-monospace, monospace; }
      @media (max-width: 760px) {
        main { grid-template-columns: minmax(0, 1fr); }
        aside { border-left: 0; border-top: 1px solid #bcb8af; }
      }
    </style>
  </head>
  <body>
    <main>
      <iframe
        id="fieldlab-app"
        title="MCP App production field-lab specimen"
        sandbox="allow-scripts"
      ></iframe>
      <aside aria-label="Local browser observation ledger">
        <h1>Local host observation ledger</h1>
        <p>Proof ceiling: process / local-browser only. This is not a named-host simulator.</p>
        <pre id="observation-ledger">Starting local host…</pre>
      </aside>
    </main>
    <script>window.__MCP_APP_FIELDLAB_BOOT__ = ${JSON.stringify(encoded)};</script>
    <script type="module">${escapeClosingScript(browserHostCode)}</script>
  </body>
</html>`;
}

function toolResourceUri(tool: {
  _meta?: Record<string, unknown>;
}): string | undefined {
  const ui = tool._meta?.ui;
  if (!ui || typeof ui !== "object") return undefined;
  const resourceUri = (ui as Record<string, unknown>).resourceUri;
  return typeof resourceUri === "string" ? resourceUri : undefined;
}

function exactResourceContent(
  result: Awaited<ReturnType<Client["readResource"]>>,
  uri: string,
): { html: string; mimeType: string } {
  const matches = result.contents.filter(
    (content) =>
      "text" in content &&
      content.uri === uri &&
      content.mimeType === FIELDLAB_RESOURCE_MIME &&
      typeof content.text === "string",
  );
  const match = matches[0];
  if (
    matches.length !== 1 ||
    !match ||
    !("text" in match) ||
    typeof match.text !== "string"
  ) {
    throw new Error(
      `resources/read did not return one exact ${FIELDLAB_RESOURCE_MIME} document for ${uri}.`,
    );
  }
  return { html: match.text, mimeType: FIELDLAB_RESOURCE_MIME };
}

export async function startLocalHostHarness({
  root = process.cwd(),
}: {
  root?: string;
} = {}): Promise<LocalHostHarness> {
  const browserHostCode = await bundleBrowserHost(root);
  const mcpPort = await availablePort();
  const mcpOrigin = `http://127.0.0.1:${mcpPort}`;
  const serverOutput = { stdout: [] as string[], stderr: [] as string[] };
  const child = spawn(process.execPath, [resolve(root, "dist/__entry.js")], {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(mcpPort),
      __PORT: String(mcpPort),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => serverOutput.stdout.push(String(chunk)));
  child.stderr.on("data", (chunk) => serverOutput.stderr.push(String(chunk)));

  const client = new Client(
    { name: "mcp-app-production-fieldlab-local-harness", version: "1" },
    {
      capabilities: {
        extensions: {
          "io.modelcontextprotocol/ui": {
            mimeTypes: [FIELDLAB_RESOURCE_MIME],
          },
        },
      },
    },
  );
  let hostServer: Server | undefined;

  try {
    await waitForServer(`${mcpOrigin}/healthz`, child);
    await client.connect(
      new StreamableHTTPClientTransport(new URL(`${mcpOrigin}/mcp`)),
    );

    const listedTools = await client.listTools();
    if (
      listedTools.tools.length !== 1 ||
      listedTools.tools[0]?.name !== FIELDLAB_TOOL
    ) {
      throw new Error(
        `The production server must expose exactly ${FIELDLAB_TOOL}; observed ${listedTools.tools.map(({ name }) => name).join(", ") || "none"}.`,
      );
    }
    const resourceUri = toolResourceUri(listedTools.tools[0]);
    if (!resourceUri?.startsWith("ui://")) {
      throw new Error(
        `The ${FIELDLAB_TOOL} tool did not advertise one ui:// resource.`,
      );
    }

    const listedResources = await client.listResources();
    if (
      listedResources.resources.length !== 1 ||
      listedResources.resources[0]?.uri !== resourceUri ||
      listedResources.resources[0]?.mimeType !== FIELDLAB_RESOURCE_MIME
    ) {
      throw new Error(
        "The production server did not discover one exact tool-bound MCP App resource.",
      );
    }
    const readResult = await client.readResource({ uri: resourceUri });
    const exactResource = exactResourceContent(readResult, resourceUri);
    const resource: ResourceObservation = {
      uri: resourceUri,
      mimeType: exactResource.mimeType,
      bytes: Buffer.byteLength(exactResource.html),
      delivery: "exact-resources-read-bytes",
    };

    const caseInputs: Record<FieldlabScenario, HarnessCase["input"]> = {
      "resource-delivery": {
        scenario: "resource-delivery",
        probeId: "resource-proof",
      },
      "optional-capability": {
        scenario: "optional-capability",
        probeId: "capability-proof",
      },
    };
    const cases = {} as Record<FieldlabScenario, HarnessCase>;
    for (const scenario of Object.keys(caseInputs) as FieldlabScenario[]) {
      const input = caseInputs[scenario];
      const result = await client.callTool({
        name: FIELDLAB_TOOL,
        arguments: input,
      });
      if (result.isError) {
        throw new Error(`${FIELDLAB_TOOL} failed for ${scenario}.`);
      }
      cases[scenario] = {
        input,
        result: jsonClone(result) as Record<string, unknown>,
      };
    }

    const payload: BrowserHarnessBoot = { resource, cases };
    const pageHtml = hostPageHtml(payload, browserHostCode);
    hostServer = createHttpServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      if (url.pathname === "/") {
        response.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Length": Buffer.byteLength(pageHtml),
          "Cache-Control": "no-store",
        });
        response.end(pageHtml);
        return;
      }
      if (url.pathname === "/app") {
        response.writeHead(200, {
          "Content-Type": `${exactResource.mimeType}; charset=utf-8`,
          "Content-Length": resource.bytes,
          "Cache-Control": "no-store",
          "Content-Security-Policy":
            "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'",
          "X-Content-Type-Options": "nosniff",
        });
        response.end(exactResource.html);
        return;
      }
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
    });
    await new Promise<void>((accept, reject) => {
      hostServer?.once("error", reject);
      hostServer?.listen(0, "127.0.0.1", accept);
    });
    const address = hostServer.address();
    if (!address || typeof address === "string") {
      throw new Error("The local browser harness did not bind a port.");
    }
    const origin = `http://127.0.0.1:${address.port}`;

    return {
      origin,
      mcpOrigin,
      resource,
      cases,
      serverOutput,
      url(profile, scenario) {
        if (!isLocalHostProfileId(profile)) {
          throw new Error(`Unknown local host profile ${profile}.`);
        }
        const url = new URL(origin);
        url.searchParams.set("profile", profile);
        url.searchParams.set("scenario", scenario);
        return url.href;
      },
      async close() {
        await closeHttpServer(hostServer);
        await client.close().catch(() => {});
        await closeChild(child);
      },
    };
  } catch (error) {
    await closeHttpServer(hostServer).catch(() => {});
    await client.close().catch(() => {});
    await closeChild(child);
    throw error;
  }
}
