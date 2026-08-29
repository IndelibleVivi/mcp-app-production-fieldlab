import "../index.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  McpAppBridge,
  useDownload,
  useHostInfo,
  useLayout,
  useSendFollowUpMessage,
} from "skybridge/web";
import { useToolInfo } from "../helpers.js";

type ActionStatus =
  "idle" | "requesting" | "request-returned" | "rejected" | "failed";

interface ObservedHostCapabilities {
  downloadFile?: object;
  message?: {
    text?: object;
  };
}

type HostCapabilityState =
  | { status: "pending" }
  | { status: "ready"; value: ObservedHostCapabilities }
  | { status: "failed" };

function useHostCapabilities() {
  const [state, setState] = useState<HostCapabilityState>({
    status: "pending",
  });

  useEffect(() => {
    let active = true;
    void McpAppBridge.getInstance()
      .getApp()
      .then((app) => {
        if (active) {
          setState({
            status: "ready",
            value: app.getHostCapabilities() ?? {},
          });
        }
      })
      .catch(() => {
        if (active) setState({ status: "failed" });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

export default function InspectBoundaryView() {
  const info = useToolInfo<"inspect_boundary">();
  const host = useHostInfo();
  const layout = useLayout();
  const capabilityState = useHostCapabilities();
  const { download } = useDownload();
  const sendFollowUpMessage = useSendFollowUpMessage();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<ActionStatus>("idle");
  const [messageStatus, setMessageStatus] = useState<ActionStatus>("idle");
  const downloadInFlight = useRef(false);
  const messageInFlight = useRef(false);

  const output = info.isSuccess ? info.output : null;
  const componentOnly = info.isSuccess
    ? (info.responseMetadata.componentOnly as
        { marker?: string; purpose?: string } | undefined)
    : undefined;
  const handoff = useMemo(
    () =>
      output
        ? {
            format: output.portableHandoff.format,
            probeId: output.probeId,
            scenario: output.scenario,
            selectedCardId,
          }
        : null,
    [output, selectedCardId],
  );
  const handoffText = handoff ? `${JSON.stringify(handoff, null, 2)}\n` : "";
  const capabilities =
    capabilityState.status === "ready" ? capabilityState.value : null;
  const canDownload = Boolean(capabilities?.downloadFile);
  const canMessage = Boolean(capabilities?.message?.text);
  const downloadBusy = downloadStatus === "requesting";
  const messageBusy = messageStatus === "requesting";

  if (!info.isSuccess || !output) {
    return (
      <main className="fieldlab-shell">
        <section className="fieldlab-panel">
          <div className="fieldlab-content">Waiting for tool result…</div>
        </section>
      </main>
    );
  }

  const requestDownload = async () => {
    if (downloadInFlight.current) return;
    downloadInFlight.current = true;
    setDownloadStatus("requesting");
    try {
      const result = await download({
        contents: [
          {
            type: "resource",
            resource: {
              uri: "file:///fieldlab-handoff.json",
              mimeType: "application/json",
              text: handoffText,
            },
          },
        ],
      });
      setDownloadStatus(result.isError ? "rejected" : "request-returned");
    } catch {
      setDownloadStatus("failed");
    } finally {
      downloadInFlight.current = false;
    }
  };

  const requestMessage = async () => {
    if (messageInFlight.current) return;
    messageInFlight.current = true;
    setMessageStatus("requesting");
    try {
      await sendFollowUpMessage(
        `MCP App Production Field Lab selection:\n${handoffText}`,
      );
      setMessageStatus("request-returned");
    } catch {
      setMessageStatus("failed");
    } finally {
      messageInFlight.current = false;
    }
  };

  return (
    <main
      className="fieldlab-shell"
      style={{ maxHeight: layout.maxHeight }}
      data-llm={`Inspecting ${output.scenario}; selected ${selectedCardId ?? "none"}; evidence ceiling ${output.evidenceCeiling}.`}
    >
      <section className="fieldlab-panel" aria-label="Boundary Inspector">
        <header className="fieldlab-header">
          <div>
            <p className="fieldlab-kicker">Production Field Lab</p>
            <h1 className="fieldlab-title">Boundary Inspector</h1>
          </div>
          <span className="fieldlab-ceiling">
            ceiling · {output.evidenceCeiling}
          </span>
        </header>

        <dl className="fieldlab-meta">
          <div>
            <dt>probe</dt>
            <dd>{output.probeId}</dd>
          </div>
          <div>
            <dt>host</dt>
            <dd>{host.name ?? "negotiating"}</dd>
          </div>
          <div>
            <dt>component marker</dt>
            <dd>{componentOnly?.marker ?? "not delivered"}</dd>
          </div>
        </dl>

        <div className="fieldlab-content">
          {output.cards.map((card, index) => (
            <button
              className="fieldlab-card"
              type="button"
              key={card.id}
              aria-pressed={selectedCardId === card.id}
              onClick={() => setSelectedCardId(card.id)}
            >
              <span className="fieldlab-card-index">{index + 1}</span>
              <span>
                <strong>{card.label}</strong>
                <small>{card.projection}</small>
              </span>
            </button>
          ))}

          <div className="fieldlab-actions">
            {canMessage ? (
              <button
                className="fieldlab-action"
                type="button"
                aria-busy={messageBusy}
                disabled={messageBusy}
                onClick={() => void requestMessage()}
              >
                {messageBusy ? "Returning selection…" : "Return selection"}
              </button>
            ) : null}
            {canDownload ? (
              <button
                className="fieldlab-action secondary"
                type="button"
                aria-busy={downloadBusy}
                disabled={downloadBusy}
                onClick={() => void requestDownload()}
              >
                {downloadBusy ? "Exporting handoff…" : "Export handoff"}
              </button>
            ) : null}
          </div>

          {capabilityState.status === "pending" ? (
            <p
              className="fieldlab-fallback"
              data-testid="capability-pending"
              role="status"
              aria-live="polite"
            >
              Checking optional host actions. Portable handoff remains visible:{" "}
              <code>{JSON.stringify(handoff)}</code>
            </p>
          ) : capabilityState.status === "failed" ? (
            <p
              className="fieldlab-fallback"
              data-testid="capability-discovery-failed"
              role="status"
              aria-live="polite"
            >
              Optional host capability discovery failed. No host cause is
              inferred. Portable handoff remains visible:{" "}
              <code>{JSON.stringify(handoff)}</code>
            </p>
          ) : !canMessage || !canDownload ? (
            <p className="fieldlab-fallback" data-testid="portable-fallback">
              Optional host action unavailable. Portable handoff remains
              visible: <code>{JSON.stringify(handoff)}</code>
            </p>
          ) : null}

          {messageStatus !== "idle" || downloadStatus !== "idle" ? (
            <p
              className="fieldlab-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              message: {messageStatus}; download: {downloadStatus}. A returned
              request is not owner acceptance.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
