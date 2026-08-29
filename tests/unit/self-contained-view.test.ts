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

  it("refuses static and dynamic chunk dependencies", () => {
    const staticRoot = specimenRoot({
      "skybridge:view:inspect-boundary": {
        file: "view.js",
        imports: ["shared.js"],
      },
      "style.css": { file: "view.css" },
    });
    const dynamicRoot = specimenRoot({
      "skybridge:view:inspect-boundary": { file: "view.js" },
      "style.css": { file: "view.css", dynamicImports: ["lazy.css"] },
    });
    try {
      expect(() => loadSelfContainedFieldlabView(staticRoot)).toThrow(
        /static imports/,
      );
      expect(() => loadSelfContainedFieldlabView(dynamicRoot)).toThrow(
        /dynamic imports/,
      );
    } finally {
      rmSync(staticRoot, { recursive: true, force: true });
      rmSync(dynamicRoot, { recursive: true, force: true });
    }
  });

  it("refuses emitted assets that would escape the inline resource", () => {
    const cssRoot = specimenRoot({
      "skybridge:view:inspect-boundary": {
        file: "view.js",
        css: ["extra.css"],
      },
      "style.css": { file: "view.css" },
    });
    const assetRoot = specimenRoot({
      "skybridge:view:inspect-boundary": {
        file: "view.js",
        assets: ["icon.svg"],
      },
      "style.css": { file: "view.css" },
    });
    try {
      expect(() => loadSelfContainedFieldlabView(cssRoot)).toThrow(
        /external CSS assets/,
      );
      expect(() => loadSelfContainedFieldlabView(assetRoot)).toThrow(
        /external emitted assets/,
      );
    } finally {
      rmSync(cssRoot, { recursive: true, force: true });
      rmSync(assetRoot, { recursive: true, force: true });
    }
  });

  it("refuses absolute and traversal paths outside the production asset root", () => {
    const absoluteRoot = specimenRoot({
      "skybridge:view:inspect-boundary": { file: "/tmp/view.js" },
      "style.css": { file: "view.css" },
    });
    const traversalRoot = specimenRoot({
      "skybridge:view:inspect-boundary": { file: "../view.js" },
      "style.css": { file: "view.css" },
    });
    try {
      expect(() => loadSelfContainedFieldlabView(absoluteRoot)).toThrow(
        /unsafe path/,
      );
      expect(() => loadSelfContainedFieldlabView(traversalRoot)).toThrow(
        /unsafe path/,
      );
    } finally {
      rmSync(absoluteRoot, { recursive: true, force: true });
      rmSync(traversalRoot, { recursive: true, force: true });
    }
  });
});
