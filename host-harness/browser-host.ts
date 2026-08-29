import {
  AppBridge,
  PostMessageTransport,
} from "@modelcontextprotocol/ext-apps/app-bridge";
import type {
  BrowserFailureObservation,
  BrowserHarnessBoot,
  LocalHostObservationLedger,
  NetworkObservation,
} from "./ledger.js";
import { isLocalHostProfileId, LOCAL_HOST_PROFILES } from "./profiles.js";

function decodeBootPayload(): BrowserHarnessBoot {
  const encoded = window.__MCP_APP_FIELDLAB_BOOT__;
  if (!encoded) throw new Error("The local host boot payload is missing.");
  const bytes = Uint8Array.from(atob(encoded), (character) =>
    character.charCodeAt(0),
  );
  return JSON.parse(new TextDecoder().decode(bytes)) as BrowserHarnessBoot;
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function renderLedger(ledger: LocalHostObservationLedger): void {
  const node = document.querySelector<HTMLElement>("#observation-ledger");
  if (!node) throw new Error("The observation ledger element is missing.");
  node.textContent = JSON.stringify(ledger, null, 2);
}

async function wait(milliseconds: number): Promise<void> {
  if (milliseconds <= 0) return;
  await new Promise((accept) => setTimeout(accept, milliseconds));
}

async function start(): Promise<void> {
  const payload = decodeBootPayload();
  const query = new URLSearchParams(window.location.search);
  const profileId = query.get("profile");
  const scenario = query.get("scenario") ?? "resource-delivery";
  if (!isLocalHostProfileId(profileId)) {
    throw new Error(`Unknown local host profile ${JSON.stringify(profileId)}.`);
  }
  if (scenario !== "resource-delivery" && scenario !== "optional-capability") {
    throw new Error(`Unknown field-lab scenario ${JSON.stringify(scenario)}.`);
  }

  const profile = LOCAL_HOST_PROFILES[profileId];
  const selectedCase = payload.cases[scenario];
  const frame = document.querySelector<HTMLIFrameElement>("#fieldlab-app");
  if (!frame?.contentWindow) {
    throw new Error("The local host App iframe is unavailable.");
  }

  const ledger: LocalHostObservationLedger = {
    format: "mcp-app-fieldlab-host-ledger@1",
    profile: profileId,
    proofCeiling: "process",
    environment: "local-browser-harness",
    namedHostSimulation: false,
    resource: payload.resource,
    initialization: [],
    requests: [],
    capabilityDispositions: {
      message: {
        discovery: "pending",
        disposition: "not_attempted",
      },
      download: {
        discovery: "pending",
        disposition: "not_attempted",
      },
    },
    capabilityDiscoveryTransitions: {
      message: ["pending"],
      download: ["pending"],
    },
    consoleErrors: [],
    pageErrors: [],
    unexpectedNetwork: [],
    notProven: ["named-host", "owner-acceptance"],
  };
  const refresh = () => renderLedger(ledger);

  window.__MCP_APP_FIELDLAB_HOST__ = {
    ledger,
    recordConsoleError(detail: BrowserFailureObservation) {
      ledger.consoleErrors.push(jsonClone(detail));
      refresh();
    },
    recordPageError(detail: BrowserFailureObservation) {
      ledger.pageErrors.push(jsonClone(detail));
      refresh();
    },
    recordUnexpectedNetwork(detail: NetworkObservation) {
      ledger.unexpectedNetwork.push(jsonClone(detail));
      refresh();
    },
  };

  window.addEventListener("message", (event) => {
    if (event.source !== frame.contentWindow) return;
    const message = event.data as
      | { id?: unknown; jsonrpc?: unknown; method?: unknown; params?: unknown }
      | undefined;
    if (
      !message ||
      message.jsonrpc !== "2.0" ||
      typeof message.method !== "string"
    ) {
      return;
    }
    if (message.method === "ui/initialize") {
      ledger.initialization.push({ method: "ui/initialize" });
    } else if (message.method === "ui/notifications/initialized") {
      ledger.initialization.push({
        method: "ui/notifications/initialized",
      });
    }
    if (
      Object.prototype.hasOwnProperty.call(message, "id") &&
      message.method !== "ui/initialize"
    ) {
      ledger.requests.push({
        method: message.method,
        ...(message.params === undefined
          ? {}
          : { params: jsonClone(message.params) }),
      });
    }
    refresh();
  });

  const bridge = new AppBridge(
    null,
    {
      name: "mcp-app-production-fieldlab-local-harness",
      version: "1",
    },
    profile.capabilities,
    {
      hostContext: {
        theme: "light",
        locale: "en-SG",
        timeZone: "Asia/Singapore",
        platform: "web",
        displayMode: "inline",
        containerDimensions: { width: 900, maxHeight: 900 },
      },
    },
  );

  if (profile.capabilities.message) {
    bridge.onmessage = async () => {
      await wait(profile.actionResponseDelayMs);
      ledger.capabilityDispositions.message.disposition = "success";
      refresh();
      return {};
    };
  }
  if (profile.capabilities.downloadFile) {
    bridge.ondownloadfile = async () => {
      await wait(profile.actionResponseDelayMs);
      ledger.capabilityDispositions.download.disposition =
        profile.downloadDisposition;
      refresh();
      return profile.downloadDisposition === "rejected"
        ? { isError: true }
        : {};
    };
  }
  bridge.onupdatemodelcontext = async () => ({});

  let initialized = false;
  bridge.oninitialized = () => {
    if (initialized) return;
    initialized = true;
    void (async () => {
      const messageDiscovery = profile.capabilities.message
        ? "available"
        : "missing";
      const downloadDiscovery = profile.capabilities.downloadFile
        ? "available"
        : "missing";
      ledger.capabilityDispositions.message = {
        discovery: messageDiscovery,
        disposition: profile.capabilities.message ? "not_attempted" : "absent",
      };
      ledger.capabilityDispositions.download = {
        discovery: downloadDiscovery,
        disposition: profile.capabilities.downloadFile
          ? "not_attempted"
          : "absent",
      };
      ledger.capabilityDiscoveryTransitions.message.push(messageDiscovery);
      ledger.capabilityDiscoveryTransitions.download.push(downloadDiscovery);
      refresh();
      await bridge.sendToolInput({ arguments: selectedCase.input });
      await bridge.sendToolResult(selectedCase.result);
      ledger.initialization.push({ method: "host/tool-result-delivered" });
      refresh();
    })().catch((error: unknown) => {
      ledger.pageErrors.push({
        message: error instanceof Error ? error.message : String(error),
        source: "host/tool-result-delivery",
      });
      refresh();
    });
  };

  const transport = new PostMessageTransport(
    frame.contentWindow,
    frame.contentWindow,
  );
  await bridge.connect(transport);
  ledger.initialization.push({ method: "host/transport-connected" });
  refresh();
  frame.src = "/app";
}

void start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const node = document.querySelector<HTMLElement>("#observation-ledger");
  if (node) node.textContent = JSON.stringify({ fatal: message }, null, 2);
  console.error(error);
});
