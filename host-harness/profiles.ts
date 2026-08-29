export const LOCAL_HOST_PROFILE_IDS = [
  "restricted",
  "capability-success",
  "capability-rejected",
] as const;

export type LocalHostProfileId = (typeof LOCAL_HOST_PROFILE_IDS)[number];

export type CapabilityDisposition =
  "absent" | "not_attempted" | "success" | "rejected" | "technical_failure";

export interface LocalHostProfile {
  id: LocalHostProfileId;
  capabilities: LocalHostCapabilities;
  actionResponseDelayMs: number;
  downloadDisposition: Exclude<
    CapabilityDisposition,
    "absent" | "not_attempted" | "technical_failure"
  >;
}

export interface LocalHostCapabilities {
  downloadFile?: Record<string, never>;
  message?: {
    text?: Record<string, never>;
  };
  sandbox?: {
    csp?: {
      connectDomains?: string[];
      resourceDomains?: string[];
      frameDomains?: string[];
      baseUriDomains?: string[];
    };
  };
  updateModelContext?: Record<string, never>;
}

const sandboxCapabilities: LocalHostCapabilities = {
  updateModelContext: {},
  sandbox: {
    csp: {
      connectDomains: [],
      resourceDomains: [],
      frameDomains: [],
      baseUriDomains: [],
    },
  },
};

export const LOCAL_HOST_PROFILES: Record<LocalHostProfileId, LocalHostProfile> =
  {
    restricted: {
      id: "restricted",
      capabilities: sandboxCapabilities,
      actionResponseDelayMs: 0,
      downloadDisposition: "rejected",
    },
    "capability-success": {
      id: "capability-success",
      capabilities: {
        ...sandboxCapabilities,
        downloadFile: {},
        message: { text: {} },
      },
      actionResponseDelayMs: 150,
      downloadDisposition: "success",
    },
    "capability-rejected": {
      id: "capability-rejected",
      capabilities: {
        ...sandboxCapabilities,
        downloadFile: {},
        message: { text: {} },
      },
      actionResponseDelayMs: 150,
      downloadDisposition: "rejected",
    },
  };

export function isLocalHostProfileId(
  value: string | null,
): value is LocalHostProfileId {
  return LOCAL_HOST_PROFILE_IDS.some((profile) => profile === value);
}
