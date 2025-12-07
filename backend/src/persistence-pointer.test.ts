import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;

let tmpDir: string;

async function importFresh<T>(specifier: string): Promise<T> {
  // Append a query param to bypass the ESM module cache.
  return (await import(`${specifier}?t=${Date.now()}`)) as T;
}

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dolp-walrus-"));
  const pointersPath = path.join(tmpDir, "pointers.json");
  const localStatePath = path.join(tmpDir, "state");
  process.env.WALRUS_POINTERS_PATH = pointersPath;
  process.env.LOCAL_STATE_DIR = localStatePath;
  process.env.WALRUS_CAMPAIGNS_BLOB_ID = "";
  process.env.WALRUS_COUNTERS_BLOB_ID = "";
  process.env.WALRUS_WEBSITES_BLOB_ID = "";
});

afterEach(async () => {
  globalThis.fetch = originalFetch;
  process.env.WALRUS_POINTERS_PATH = originalEnv.WALRUS_POINTERS_PATH;
  process.env.LOCAL_STATE_DIR = originalEnv.LOCAL_STATE_DIR;
  process.env.WALRUS_CAMPAIGNS_BLOB_ID = originalEnv.WALRUS_CAMPAIGNS_BLOB_ID;
  process.env.WALRUS_COUNTERS_BLOB_ID = originalEnv.WALRUS_COUNTERS_BLOB_ID;
  process.env.WALRUS_WEBSITES_BLOB_ID = originalEnv.WALRUS_WEBSITES_BLOB_ID;
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("walrus blob pointer persistence", () => {
  it("stores and retrieves blob ids locally", async () => {
    const { saveBlobPointer, loadBlobPointer } = await importFresh<typeof import("./services/blob-pointer-store.js")>(
      "./services/blob-pointer-store.js",
    );

    await saveBlobPointer("campaigns", "BLOB_123");
    const out = await loadBlobPointer("campaigns");

    assert.equal(out, "BLOB_123");
  });

  it("loadCampaigns bootstraps from cached pointer when env is empty", async () => {
    const pointerFile = process.env.WALRUS_POINTERS_PATH!;
    await fs.writeFile(pointerFile, JSON.stringify({ campaigns: "BOOT_BLOB" }), "utf8");

    const fakeCampaigns = [
      {
        name: "Persisted",
        id: "demo",
        advertiserWallet: "0xabc",
        totalDeposited: 100,
        spentAmount: 0,
        cpcBid: 1,
        imageUrl: "img",
        targetUrl: "url",
        status: "active" as const,
      },
    ];

    let requested = "";
    globalThis.fetch = (async (url: string | URL) => {
      requested = typeof url === "string" ? url : url.toString();
      return {
        ok: true,
        json: async () => fakeCampaigns,
      } as Response;
    }) as typeof fetch;

    const { loadCampaigns, getLatestCampaignsBlobId } = await importFresh<typeof import("./services/campaigns-persistence.js")>(
      "./services/campaigns-persistence.js",
    );

    const loaded = await loadCampaigns();

    assert.equal(loaded.length, 1);
    assert.ok(requested.includes("BOOT_BLOB"));
    assert.equal(getLatestCampaignsBlobId(), "BOOT_BLOB");
  });

  it("falls back to local file when Walrus is unavailable", async () => {
    globalThis.fetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;

    const { persistCampaigns, loadCampaigns, getLatestCampaignsBlobId } =
      await importFresh<typeof import("./services/campaigns-persistence.js")>("./services/campaigns-persistence.js");

    await persistCampaigns([
      {
        name: "Offline",
        id: "offline",
        advertiserWallet: "0xabc",
        totalDeposited: 100,
        spentAmount: 0,
        cpcBid: 1,
        imageUrl: "img",
        targetUrl: "url",
        status: "active",
      },
    ]);

    const blobId = getLatestCampaignsBlobId();
    assert.ok(blobId.startsWith("file:"));

    // Should read back from the local file.
    const loaded = await loadCampaigns();
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].id, "offline");
  });
});

