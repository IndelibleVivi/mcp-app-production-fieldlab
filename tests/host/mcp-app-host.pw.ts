import {
  expect,
  test,
  type BrowserContext,
  type FrameLocator,
  type Page,
} from "@playwright/test";
import type {
  BrowserFailureObservation,
  LocalHostObservationLedger,
  NetworkObservation,
} from "../../host-harness/ledger.js";
import {
  startLocalHostHarness,
  type LocalHostHarness,
} from "../../host-harness/start.js";
import type { LocalHostProfileId } from "../../host-harness/profiles.js";

interface BrowserObservation {
  consoleErrors: BrowserFailureObservation[];
  pageErrors: BrowserFailureObservation[];
  requests: NetworkObservation[];
  unexpectedNetwork: NetworkObservation[];
  reportedConsoleErrors: number;
  reportedPageErrors: number;
  reportedUnexpectedNetwork: number;
}

type FieldlabScenario = "resource-delivery" | "optional-capability";

const browserObservations = new WeakMap<Page, BrowserObservation>();
let harness: LocalHostHarness;

function browserObservation(page: Page): BrowserObservation {
  const observation = browserObservations.get(page);
  if (!observation) {
    throw new Error("Browser boundary observation was not initialized.");
  }
  return observation;
}

function isAllowedHarnessRequest(url: string): boolean {
  if (/^(?:about|blob|data):/.test(url)) return true;
  const parsed = new URL(url);
  return (
    parsed.origin === harness.origin &&
    (parsed.pathname === "/" || parsed.pathname === "/app")
  );
}

async function installBrowserBoundary(
  context: BrowserContext,
  page: Page,
): Promise<void> {
  const observation: BrowserObservation = {
    consoleErrors: [],
    pageErrors: [],
    requests: [],
    unexpectedNetwork: [],
    reportedConsoleErrors: 0,
    reportedPageErrors: 0,
    reportedUnexpectedNetwork: 0,
  };
  browserObservations.set(page, observation);

  await context.route("**/*", async (route) => {
    const request = route.request();
    const detail: NetworkObservation = {
      method: request.method(),
      resourceType: request.resourceType(),
      url: request.url(),
    };
    observation.requests.push(detail);
    if (isAllowedHarnessRequest(detail.url)) {
      await route.continue();
      return;
    }
    observation.unexpectedNetwork.push(detail);
    await route.abort("blockedbyclient");
  });

  page.on("console", (message) => {
    if (message.type() !== "error" && message.type() !== "warning") return;
    observation.consoleErrors.push({
      message: message.text(),
      type: message.type(),
    });
  });
  page.on("pageerror", (error) => {
    observation.pageErrors.push({
      message: error.stack ?? error.message,
      source: "playwright-pageerror",
    });
  });
}

async function syncBrowserObservation(page: Page): Promise<void> {
  const observation = browserObservation(page);
  const consoleErrors = observation.consoleErrors.slice(
    observation.reportedConsoleErrors,
  );
  const pageErrors = observation.pageErrors.slice(
    observation.reportedPageErrors,
  );
  const unexpectedNetwork = observation.unexpectedNetwork.slice(
    observation.reportedUnexpectedNetwork,
  );
  if (
    !consoleErrors.length &&
    !pageErrors.length &&
    !unexpectedNetwork.length
  ) {
    return;
  }
  if (page.isClosed()) return;
  await page.evaluate(
    ({ consoleErrors, pageErrors, unexpectedNetwork }) => {
      const host = window.__MCP_APP_FIELDLAB_HOST__;
      consoleErrors.forEach((detail) => host?.recordConsoleError(detail));
      pageErrors.forEach((detail) => host?.recordPageError(detail));
      unexpectedNetwork.forEach((detail) =>
        host?.recordUnexpectedNetwork(detail),
      );
    },
    { consoleErrors, pageErrors, unexpectedNetwork },
  );
  observation.reportedConsoleErrors += consoleErrors.length;
  observation.reportedPageErrors += pageErrors.length;
  observation.reportedUnexpectedNetwork += unexpectedNetwork.length;
}

async function readLedger(page: Page): Promise<LocalHostObservationLedger> {
  const text = await page.locator("#observation-ledger").textContent();
  if (!text) throw new Error("The in-page observation ledger is empty.");
  return JSON.parse(text) as LocalHostObservationLedger;
}

async function openProfile(
  page: Page,
  profile: LocalHostProfileId,
  scenario: FieldlabScenario,
): Promise<{ app: FrameLocator; ledger: LocalHostObservationLedger }> {
  await page.goto(harness.url(profile, scenario), {
    waitUntil: "domcontentloaded",
  });
  const app = page.frameLocator("#fieldlab-app");
  await expect(
    app.getByRole("heading", { name: "Boundary Inspector" }),
  ).toBeVisible();
  await expect
    .poll(async () => {
      const ledger = await readLedger(page);
      return ledger.initialization.map(({ method }) => method);
    })
    .toEqual(
      expect.arrayContaining([
        "host/transport-connected",
        "ui/initialize",
        "ui/notifications/initialized",
        "host/tool-result-delivered",
      ]),
    );
  return { app, ledger: await readLedger(page) };
}

function modelProjection(result: Record<string, unknown>): unknown {
  return {
    content: result.content,
    structuredContent: result.structuredContent,
  };
}

async function expectCleanProductionBoundary(page: Page): Promise<void> {
  await syncBrowserObservation(page);
  const observation = browserObservation(page);
  const ledger = await readLedger(page);
  expect(observation.unexpectedNetwork).toEqual([]);
  expect(observation.consoleErrors).toEqual([]);
  expect(observation.pageErrors).toEqual([]);
  expect(ledger.unexpectedNetwork).toEqual([]);
  expect(ledger.consoleErrors).toEqual([]);
  expect(ledger.pageErrors).toEqual([]);
}

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  harness = await startLocalHostHarness();
});

test.afterAll(async () => {
  await harness?.close();
});

test.beforeEach(async ({ context, page }) => {
  await installBrowserBoundary(context, page);
});

test.afterEach(async ({ page }, testInfo) => {
  await syncBrowserObservation(page).catch(() => {});
  let ledger: LocalHostObservationLedger | undefined;
  let ledgerReadError: string | undefined;
  try {
    ledger = await readLedger(page);
  } catch (error) {
    ledgerReadError = error instanceof Error ? error.message : String(error);
  }
  await testInfo.attach("local-host-observation", {
    body: JSON.stringify(
      {
        browser: browserObservations.get(page),
        ledger,
        ledgerReadError,
        resource: harness?.resource,
        serverOutput: harness?.serverOutput,
        proofCeiling: "process",
        environment: "local-browser-harness",
        notProven: ["named-host", "owner-acceptance"],
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});

test("mounts exact resources/read HTML and keeps the component-only marker out of model projection", async ({
  page,
}) => {
  const { app, ledger } = await openProfile(
    page,
    "restricted",
    "resource-delivery",
  );
  const result = harness.cases["resource-delivery"].result;
  const componentOnly = (
    result._meta as { componentOnly?: { marker?: string } } | undefined
  )?.componentOnly;

  expect(harness.resource).toMatchObject({
    uri: "ui://mcp-app-production-fieldlab/inspect-boundary/v1.html",
    mimeType: "text/html;profile=mcp-app",
    delivery: "exact-resources-read-bytes",
  });
  expect(harness.resource.bytes).toBeGreaterThan(0);
  expect(ledger.resource).toEqual(harness.resource);
  expect(ledger.proofCeiling).toBe("process");
  expect(ledger.environment).toBe("local-browser-harness");
  expect(ledger.namedHostSimulation).toBe(false);
  expect(ledger.notProven).toEqual(["named-host", "owner-acceptance"]);
  expect(JSON.stringify(modelProjection(result))).not.toContain(
    "component-only:resource-proof",
  );
  expect(componentOnly?.marker).toBe("component-only:resource-proof");
  await expect(app.getByText("component-only:resource-proof")).toBeVisible();
  await expect(app.getByText("resource-proof", { exact: true })).toBeVisible();
  await expectCleanProductionBoundary(page);
});

test("restricted profile withholds optional actions and preserves the portable fallback", async ({
  page,
}) => {
  const { app, ledger } = await openProfile(
    page,
    "restricted",
    "optional-capability",
  );

  await expect(
    app.getByRole("button", { name: "Return selection" }),
  ).toHaveCount(0);
  await expect(app.getByRole("button", { name: "Export handoff" })).toHaveCount(
    0,
  );
  await expect(app.getByTestId("portable-fallback")).toContainText(
    "Optional host action unavailable",
  );
  expect(ledger.capabilityDispositions).toEqual({
    message: { discovery: "missing", disposition: "absent" },
    download: { discovery: "missing", disposition: "absent" },
  });
  expect(ledger.capabilityDiscoveryTransitions).toEqual({
    message: ["pending", "missing"],
    download: ["pending", "missing"],
  });
  await expect(app.getByTestId("capability-pending")).toHaveCount(0);
  expect(
    ledger.requests
      .map(({ method }) => method)
      .filter(
        (method) => method === "ui/message" || method === "ui/download-file",
      ),
  ).toEqual([]);
  await expectCleanProductionBoundary(page);
});

test("capability-success advertises and accepts message and download requests", async ({
  page,
}) => {
  const { app } = await openProfile(
    page,
    "capability-success",
    "optional-capability",
  );

  const selectedCard = app.getByRole("button", {
    name: /Selection return requires/,
  });
  await selectedCard.focus();
  await selectedCard.press("Space");
  await expect(selectedCard).toHaveAttribute("aria-pressed", "true");

  const messageAction = app.getByRole("button", { name: "Return selection" });
  await messageAction.focus();
  await messageAction.press("Enter");
  await expect(
    app.getByRole("button", { name: "Returning selection…" }),
  ).toBeDisabled();
  await expect(
    app.getByRole("button", { name: "Returning selection…" }),
  ).toHaveAttribute("aria-busy", "true");

  const downloadAction = app.getByRole("button", { name: "Export handoff" });
  await downloadAction.click();
  await expect(
    app.getByRole("button", { name: "Exporting handoff…" }),
  ).toBeDisabled();
  await expect(app.locator(".fieldlab-status")).toContainText(
    "message: request-returned; download: request-returned",
  );
  await expect
    .poll(async () => (await readLedger(page)).capabilityDispositions)
    .toEqual({
      message: { discovery: "available", disposition: "success" },
      download: { discovery: "available", disposition: "success" },
    });
  expect((await readLedger(page)).capabilityDiscoveryTransitions).toEqual({
    message: ["pending", "available"],
    download: ["pending", "available"],
  });
  const ledger = await readLedger(page);
  expect(
    ledger.requests
      .map(({ method }) => method)
      .filter(
        (method) => method === "ui/message" || method === "ui/download-file",
      ),
  ).toEqual(["ui/message", "ui/download-file"]);
  await expectCleanProductionBoundary(page);
});

test("keeps critical identity and fallback content inside 320px and 390px viewports", async ({
  page,
}) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const { app } = await openProfile(
      page,
      "restricted",
      "optional-capability",
    );
    await expect(
      app.getByText("capability-proof", { exact: true }),
    ).toBeVisible();
    await expect(app.getByTestId("portable-fallback")).toBeVisible();
    expect(
      await app.locator("html").evaluate((node) => {
        const element = node as HTMLElement;
        return element.scrollWidth <= element.clientWidth;
      }),
    ).toBe(true);
    await expectCleanProductionBoundary(page);
  }
});

test("capability-rejected keeps download discovery separate from rejection", async ({
  page,
}) => {
  const { app } = await openProfile(
    page,
    "capability-rejected",
    "optional-capability",
  );

  await app.getByRole("button", { name: /Export requires/ }).click();
  await app.getByRole("button", { name: "Export handoff" }).click();
  await expect(app.locator(".fieldlab-status")).toContainText(
    "message: idle; download: rejected",
  );
  const ledger = await readLedger(page);
  expect(ledger.capabilityDispositions.download).toEqual({
    discovery: "available",
    disposition: "rejected",
  });
  expect(
    ledger.requests
      .map(({ method }) => method)
      .filter(
        (method) => method === "ui/message" || method === "ui/download-file",
      ),
  ).toEqual(["ui/download-file"]);
  await expectCleanProductionBoundary(page);
});
