import { McpServer } from "skybridge/server";
import { z } from "zod";
import {
  FIELDLAB_VIEW_DESCRIPTION,
  FIELDLAB_VIEW_URI,
} from "./resource-contract.js";
import { loadRuntimeReleaseIdentity } from "./release-identity.js";
import { loadSelfContainedFieldlabView } from "./self-contained-view.js";

interface HealthResponse {
  status(code: number): HealthResponse;
  json(value: unknown): void;
}

const scenarioSchema = z.enum(["resource-delivery", "optional-capability"]);
const probeIdSchema = z
  .string()
  .min(1)
  .max(48)
  .regex(/^[a-z0-9][a-z0-9._-]*$/);

const server = new McpServer(
  {
    name: "MCP App Production Field Lab",
    version: "0.1.0-private.0",
  },
  { capabilities: {} },
);

const release = loadRuntimeReleaseIdentity();
const productionView =
  process.env.NODE_ENV === "production"
    ? loadSelfContainedFieldlabView(process.cwd())
    : undefined;

server.express.get("/healthz", (_request: unknown, response: HealthResponse) =>
  response.status(200).json({
    status: "ok",
    server: "MCP App Production Field Lab",
    release: release ?? null,
  }),
);

if (productionView) {
  server.registerResource(
    "inspect-boundary",
    productionView.uri,
    {
      description: FIELDLAB_VIEW_DESCRIPTION,
      mimeType: productionView.mimeType,
      size: productionView.bytes,
      _meta: productionView.meta,
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: productionView.mimeType,
          text: productionView.html,
          _meta: productionView.meta,
        },
      ],
    }),
  );
}

const app = server.registerTool(
  {
    name: "inspect_boundary",
    title: "Inspect an MCP App boundary",
    description:
      "Return one deterministic MCP App boundary specimen. Use it to inspect model-visible, component-visible, component-only, resource-delivery, and optional host-capability projections without claiming named-host acceptance.",
    inputSchema: {
      scenario: scenarioSchema,
      probeId: probeIdSchema,
    },
    outputSchema: {
      format: z.literal("fieldlab-boundary-result@1"),
      scenario: scenarioSchema,
      probeId: probeIdSchema,
      evidenceCeiling: z.literal("process"),
      cards: z.array(
        z
          .object({
            id: z.string(),
            label: z.string(),
            projection: z.enum([
              "model-and-component",
              "component-only-marker",
              "host-capability",
            ]),
          })
          .strict(),
      ),
      portableHandoff: z
        .object({
          format: z.literal("fieldlab-handoff@1"),
          selectedCardId: z.string().nullable(),
        })
        .strict(),
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
    ...(productionView
      ? {}
      : {
          view: {
            component: "inspect-boundary" as const,
            description: FIELDLAB_VIEW_DESCRIPTION,
            prefersBorder: false,
            csp: {
              resourceDomains: [],
              connectDomains: [],
              frameDomains: [],
              redirectDomains: [],
            },
          },
        }),
    _meta: {
      ui: {
        visibility: ["model"],
        ...(productionView ? { resourceUri: FIELDLAB_VIEW_URI } : {}),
      },
      ...(productionView ? { "openai/outputTemplate": FIELDLAB_VIEW_URI } : {}),
      "openai/toolInvocation/invoking": "Inspecting the boundary…",
      "openai/toolInvocation/invoked": "Boundary specimen ready",
      securitySchemes: [{ type: "noauth" }],
    },
    securitySchemes: [{ type: "noauth" }],
  },
  async ({ scenario, probeId }) => {
    const cards =
      scenario === "resource-delivery"
        ? [
            {
              id: "model-component",
              label: "Structured content reaches model and component",
              projection: "model-and-component" as const,
            },
            {
              id: "component-marker",
              label: "Component-only metadata remains outside model output",
              projection: "component-only-marker" as const,
            },
          ]
        : [
            {
              id: "message-capability",
              label: "Selection return requires advertised message capability",
              projection: "host-capability" as const,
            },
            {
              id: "download-capability",
              label: "Export requires advertised download capability",
              projection: "host-capability" as const,
            },
          ];
    const structuredContent = {
      format: "fieldlab-boundary-result@1" as const,
      scenario,
      probeId,
      evidenceCeiling: "process" as const,
      cards,
      portableHandoff: {
        format: "fieldlab-handoff@1" as const,
        selectedCardId: null,
      },
    };
    return {
      structuredContent,
      content: [
        {
          type: "text" as const,
          text: `Boundary specimen ${probeId} is ready for ${scenario}. This source/process observation does not prove named-host or owner acceptance.`,
        },
      ],
      _meta: {
        componentOnly: {
          marker: `component-only:${probeId}`,
          purpose:
            "Prove component delivery without duplicating this marker into model-visible structured content.",
        },
        ...(release ? { "fieldlab/release": release } : {}),
      },
    };
  },
);

export type AppType = typeof app;
export default await app.run();
