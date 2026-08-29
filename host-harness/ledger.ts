import type { CapabilityDisposition, LocalHostProfileId } from "./profiles.js";

export interface ResourceObservation {
  uri: string;
  mimeType: string;
  bytes: number;
  delivery: "exact-resources-read-bytes";
}

export interface InitializationObservation {
  method:
    | "host/transport-connected"
    | "ui/initialize"
    | "ui/notifications/initialized"
    | "host/tool-result-delivered";
}

export interface ProtocolRequestObservation {
  method: string;
  params?: unknown;
}

export interface CapabilityObservation {
  discovery: "missing" | "available";
  disposition: CapabilityDisposition;
}

export interface BrowserFailureObservation {
  message: string;
  source?: string;
  type?: string;
}

export interface NetworkObservation {
  method: string;
  resourceType: string;
  url: string;
}

export interface LocalHostObservationLedger {
  format: "mcp-app-fieldlab-host-ledger@1";
  profile: LocalHostProfileId;
  proofCeiling: "process";
  environment: "local-browser-harness";
  namedHostSimulation: false;
  resource: ResourceObservation;
  initialization: InitializationObservation[];
  requests: ProtocolRequestObservation[];
  capabilityDispositions: {
    message: CapabilityObservation;
    download: CapabilityObservation;
  };
  consoleErrors: BrowserFailureObservation[];
  pageErrors: BrowserFailureObservation[];
  unexpectedNetwork: NetworkObservation[];
  notProven: ["named-host", "owner-acceptance"];
}

export interface HarnessCase {
  input: {
    scenario: "resource-delivery" | "optional-capability";
    probeId: string;
  };
  result: Record<string, unknown>;
}

export interface BrowserHarnessBoot {
  resource: ResourceObservation;
  cases: Record<"resource-delivery" | "optional-capability", HarnessCase>;
}

declare global {
  interface Window {
    __MCP_APP_FIELDLAB_BOOT__?: string;
    __MCP_APP_FIELDLAB_HOST__?: {
      ledger: LocalHostObservationLedger;
      recordConsoleError(detail: BrowserFailureObservation): void;
      recordPageError(detail: BrowserFailureObservation): void;
      recordUnexpectedNetwork(detail: NetworkObservation): void;
    };
  }
}

export {};
