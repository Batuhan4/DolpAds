import { WALRUS_AGGREGATOR_URL, WALRUS_DELETABLE, WALRUS_EPOCHS, WALRUS_MAX_UPLOAD_BYTES, WALRUS_PUBLISHER_URL, WALRUS_REQUEST_TIMEOUT_MS, WALRUS_RETRY_COUNT } from "../config.js";
import { WalrusStoreResult } from "../types.js";

interface WalrusStoreOptions {
  publisherUrl?: string;
  aggregatorUrl?: string;
  epochs?: number;
  deletable?: boolean;
  contentType?: string;
  fileName?: string;
}

interface WalrusStoreResponse {
  newlyCreated?: {
    blobObject?: {
      id?: string;
      blobId?: string;
      size?: number;
    };
  };
  alreadyCertified?: {
    blobId: string;
    blobObject?: {
      id?: string;
    };
    endEpoch?: number;
  };
}

const defaultHeaders = {
  "user-agent": "dolpads-backend/0.1",
};

function abortableTimeout(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(timer) };
}

async function fetchWithRetry(
  input: string,
  init: RequestInit,
  retries: number,
  timeoutMs: number,
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const { controller, clear } = abortableTimeout(timeoutMs);
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      clear();
      if (!response.ok) {
        lastError = new Error(`Walrus request failed (${response.status})`);
        continue;
      }
      return response;
    } catch (err) {
      clear();
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Walrus request failed");
}

function parseStoreResult(
  json: WalrusStoreResponse,
  aggregatorUrl: string,
): WalrusStoreResult {
  const created = json.newlyCreated?.blobObject;
  if (created?.blobId) {
    return {
      blobId: created.blobId,
      blobObjectId: created.id,
      size: created.size,
      aggregatorUrl: buildBlobUrl(created.blobId, aggregatorUrl),
    };
  }
  const existing = json.alreadyCertified;
  if (existing?.blobId) {
    return {
      blobId: existing.blobId,
      blobObjectId: existing.blobObject?.id,
      aggregatorUrl: buildBlobUrl(existing.blobId, aggregatorUrl),
    };
  }
  throw new Error("Unexpected Walrus response: missing blobId");
}

export function buildBlobUrl(blobId: string, aggregatorUrl = WALRUS_AGGREGATOR_URL) {
  return `${aggregatorUrl.replace(/\/$/, "")}/v1/blobs/${blobId}`;
}

function ensureSizeWithinLimit(bytes: Uint8Array, maxBytes: number) {
  if (bytes.byteLength > maxBytes) {
    throw new Error(`Payload exceeds WALRUS_MAX_UPLOAD_BYTES (${maxBytes} bytes)`);
  }
}

export async function storeBuffer(
  payload: Uint8Array,
  opts: WalrusStoreOptions = {},
): Promise<WalrusStoreResult> {
  ensureSizeWithinLimit(payload, WALRUS_MAX_UPLOAD_BYTES);

  const publisher = (opts.publisherUrl ?? WALRUS_PUBLISHER_URL).replace(/\/$/, "");
  const aggregator = opts.aggregatorUrl ?? WALRUS_AGGREGATOR_URL;
  const epochs = opts.epochs ?? WALRUS_EPOCHS;
  const deletable = opts.deletable ?? WALRUS_DELETABLE;

  const url = `${publisher}/v1/blobs?epochs=${epochs}&deletable=${deletable}`;
  const headers: Record<string, string> = {
    ...defaultHeaders,
    "content-type": opts.contentType ?? "application/octet-stream",
  };

  if (opts.fileName) {
    headers["x-file-name"] = opts.fileName;
  }

  const response = await fetchWithRetry(
    url,
    {
      method: "PUT",
      headers,
      body: payload instanceof Buffer ? payload : Buffer.from(payload),
    },
    WALRUS_RETRY_COUNT,
    WALRUS_REQUEST_TIMEOUT_MS,
  );

  const json = (await response.json()) as WalrusStoreResponse;
  return parseStoreResult(json, aggregator);
}

export async function storeJson(
  data: unknown,
  opts: WalrusStoreOptions = {},
): Promise<WalrusStoreResult> {
  const jsonString = JSON.stringify(data);
  return storeBuffer(new TextEncoder().encode(jsonString), {
    ...opts,
    contentType: "application/json",
    fileName: opts.fileName ?? "metadata.json",
  });
}

export async function storeFromUrl(
  remoteUrl: string,
  opts: WalrusStoreOptions = {},
): Promise<WalrusStoreResult> {
  const { controller, clear } = abortableTimeout(WALRUS_REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(remoteUrl, { signal: controller.signal });
    if (!resp.ok) {
      throw new Error(`Failed to download asset (${resp.status})`);
    }
    const arrayBuffer = await resp.arrayBuffer();
    const contentType = resp.headers.get("content-type") ?? undefined;
    const buffer = new Uint8Array(arrayBuffer);
    clear();
    return storeBuffer(buffer, { ...opts, contentType });
  } finally {
    clear();
  }
}

