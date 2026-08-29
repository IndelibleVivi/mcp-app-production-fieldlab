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
  file?: string;
  dynamicImports?: string[];
}

interface ViewManifest {
  "skybridge:view:inspect-boundary"?: ViewManifestEntry;
  "style.css"?: ViewManifestEntry;
}

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

function requiredManifestFile(
  manifest: ViewManifest,
  key: keyof ViewManifest,
): string {
  const entry = manifest[key];
  const file = entry?.file;
  if (!file) {
    throw new Error(
      `The production MCP App manifest is missing ${JSON.stringify(key)}.`,
    );
  }
  if (
    path.isAbsolute(file) ||
    file.split(/[\\/]/).some((segment) => segment === "..")
  ) {
    throw new Error(
      `The production MCP App manifest contains an unsafe path for ${JSON.stringify(key)}.`,
    );
  }
  if (entry.dynamicImports && entry.dynamicImports.length > 0) {
    throw new Error(
      `The production MCP App entry ${JSON.stringify(key)} is not self-contained.`,
    );
  }
  return file;
}

export function loadSelfContainedFieldlabView(
  root = process.cwd(),
): SelfContainedFieldlabView {
  const assetsRoot = path.join(root, "dist", "assets");
  const manifest = JSON.parse(
    readFileSync(path.join(root, VIEW_MANIFEST_PATH), "utf8"),
  ) as ViewManifest;
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
