import { WALRUS_AGGREGATOR_URL, WALRUS_REQUEST_TIMEOUT_MS } from "../config.js";

function abortableTimeout(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timer) };
}

export async function readStateFromWalrus<T>(
  blobId: string,
  aggregatorUrl = WALRUS_AGGREGATOR_URL,
): Promise<T> {
  const url = `${aggregatorUrl.replace(/\/$/, "")}/v1/blobs/${blobId}`;
  const { controller, clear } = abortableTimeout(WALRUS_REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) throw new Error(`Failed to read Walrus blob ${blobId} (${resp.status})`);
    const json = (await resp.json()) as T;
    const itemCount = Array.isArray(json) ? json.length : "N/A";
    console.log(`[state-reader] Walrus blob ${blobId} returned ${itemCount} items`);
    return json;
  } finally {
    clear();
  }
}

