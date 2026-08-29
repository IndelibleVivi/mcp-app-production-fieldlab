import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  FIELDLAB_VIEW_MIME_TYPE,
  FIELDLAB_VIEW_URI,
} from "../../src/resource-contract.js";
import { loadSelfContainedFieldlabView } from "../../src/self-contained-view.js";

function specimenRoot(manifest: Record<string, unknown>): string {
  const root = mkdtempSync(path.join(tmpdir(), "fieldlab-view-"));
  const assets = path.join(root, "dist", "assets");
  mkdirSync(path.join(assets, ".vite"), { recursive: true });
  writeFileSync(
    path.join(assets, ".vite", "manifest.json"),
    JSON.stringify(manifest),
  );
  writeFileSync(
    path.join(assets, "view.js"),
    "document.title='Field Lab';/* </script> */",
  );
  writeFileSync(
    path.join(assets, "view.css"),
    ":root{color-scheme:light}/* </style> */",
  );
  return root;
}

describe("self-contained MCP App resource", () => {
  it("inlines exact bytes under one explicit resource contract", () => {
    const root = specimenRoot({
      "skybridge:view:inspect-boundary": { file: "view.js" },
      "style.css": { file: "view.css" },
    });
    try {
      const view = loadSelfContainedFieldlabView(root);
      expect(view.uri).toBe(FIELDLAB_VIEW_URI);
      expect(view.mimeType).toBe(FIELDLAB_VIEW_MIME_TYPE);
      expect(view.bytes).toBe(Buffer.byteLength(view.html));
      expect(view.html).toContain("window.skybridge");
      expect(view.html).toContain("<\\/script>");
      expect(view.html).toContain("<\\/style>");
      expect(view.meta).toMatchObject({
        ui: {
          csp: {
            resourceDomains: [],
            connectDomains: [],
            frameDomains: [],
            baseUriDomains: [],
          },
        },
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses dynamic chunks and paths outside the production asset root", () => {
    const dynamicRoot = specimenRoot({
      "skybridge:view:inspect-boundary": {
        file: "view.js",
        dynamicImports: ["lazy.js"],
      },
      "style.css": { file: "view.css" },
    });
    const unsafeRoot = specimenRoot({
      "skybridge:view:inspect-boundary": { file: "../view.js" },
      "style.css": { file: "view.css" },
    });
    try {
      expect(() => loadSelfContainedFieldlabView(dynamicRoot)).toThrow(
        /not self-contained/,
      );
      expect(() => loadSelfContainedFieldlabView(unsafeRoot)).toThrow(
        /unsafe path/,
      );
    } finally {
      rmSync(dynamicRoot, { recursive: true, force: true });
      rmSync(unsafeRoot, { recursive: true, force: true });
    }
  });
});
