export const FIELDLAB_VIEW_URI =
  "ui://mcp-app-production-fieldlab/inspect-boundary/v1.html";
export const FIELDLAB_VIEW_MIME_TYPE = "text/html;profile=mcp-app";
export const FIELDLAB_VIEW_DESCRIPTION =
  "Inspect one MCP App production boundary and its evidence ceiling.";

export function fieldlabViewMeta(): Record<string, unknown> {
  return {
    ui: {
      description: FIELDLAB_VIEW_DESCRIPTION,
      prefersBorder: false,
      csp: {
        resourceDomains: [],
        connectDomains: [],
        frameDomains: [],
        baseUriDomains: [],
      },
    },
    "openai/widgetDescription": FIELDLAB_VIEW_DESCRIPTION,
    "openai/widgetCSP": {
      connect_domains: [],
      resource_domains: [],
      frame_domains: [],
      redirect_domains: [],
    },
  };
}
