import { readFileSync } from "node:fs";
import path from "node:path";
import {
  FIELDLAB_VIEW_MIME_TYPE,
  FIELDLAB_VIEW_URI,
  fieldlabViewMeta,
} from "./resource-contract.js";

const VIEW_MANIFEST_PATH = path.join(
  "dist",
  "assets",
  ".vite",
  "manifest.json",
);

interface ViewManifestEntry {
  file?: unknown;
  imports?: unknown;
  dynamicImports?: unknown;
  css?: unknown;
  assets?: unknown;
}

type ViewManifestKey = "skybridge:view:inspect-boundary" | "style.css";

export interface SelfContainedFieldlabView {
  uri: typeof FIELDLAB_VIEW_URI;
  mimeType: typeof FIELDLAB_VIEW_MIME_TYPE;
  html: string;
  bytes: number;
  meta: Record<string, unknown>;
}

function escapeClosingTag(source: string, tag: "script" | "style"): string {
  return source.replace(new RegExp(`</${tag}`, "gi"), `<\\/${tag}`);
}

function requiredManifestFile(manifest: unknown, key: ViewManifestKey): string {
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    throw new Error("The production MCP App manifest must be an object.");
  }
  const entry = (manifest as Record<string, unknown>)[key] as
    ViewManifestEntry | undefined;
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    throw new Error(
      `The production MCP App manifest is missing ${JSON.stringify(key)}.`,
    );
  }
  const file = entry?.file;
  if (typeof file !== "string" || file.length === 0) {
    throw new Error(
      `The production MCP App manifest is missing ${JSON.stringify(key)}.`,
    );
  }
  if (
    path.posix.isAbsolute(file) ||
    path.win32.isAbsolute(file) ||
    file.split(/[\\/]/).some((segment) => segment === "..")
  ) {
    throw new Error(
      `The production MCP App manifest contains an unsafe path for ${JSON.stringify(key)}.`,
    );
  }
  for (const [field, label] of [
    ["imports", "static imports"],
    ["dynamicImports", "dynamic imports"],
    ["css", "external CSS assets"],
    ["assets", "external emitted assets"],
  ] as const) {
    const imports = entry[field];
    if (
      imports !== undefined &&
      (!Array.isArray(imports) ||
        imports.some((imported) => typeof imported !== "string"))
    ) {
      throw new Error(
        `The production MCP App entry ${JSON.stringify(key)} has malformed ${label}.`,
      );
    }
    if (Array.isArray(imports) && imports.length > 0) {
      throw new Error(
        `The production MCP App entry ${JSON.stringify(key)} retains ${label} and is not self-contained.`,
      );
    }
  }
  return file;
}

export function loadSelfContainedFieldlabView(
  root = process.cwd(),
): SelfContainedFieldlabView {
  const assetsRoot = path.join(root, "dist", "assets");
  const manifest = JSON.parse(
    readFileSync(path.join(root, VIEW_MANIFEST_PATH), "utf8"),
  ) as unknown;
  const script = readFileSync(
    path.join(
      assetsRoot,
      requiredManifestFile(manifest, "skybridge:view:inspect-boundary"),
    ),
    "utf8",
  );
  const style = readFileSync(
    path.join(assetsRoot, requiredManifestFile(manifest, "style.css")),
    "utf8",
  );
  const html = [
    '<div id="root"></div>',
    `<style>${escapeClosingTag(style, "style")}</style>`,
    '<script type="module">',
    'window.skybridge = { hostType: "mcp-app" };',
    escapeClosingTag(script, "script"),
    "</script>",
  ].join("\n");

  return {
    uri: FIELDLAB_VIEW_URI,
    mimeType: FIELDLAB_VIEW_MIME_TYPE,
    html,
    bytes: Buffer.byteLength(html),
    meta: fieldlabViewMeta(),
  };
}
