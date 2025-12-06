import { AuditLogPointer, Impression } from "../types.js";
import { storeBuffer } from "./walrus.js";

const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 10_000;

let buffer: Impression[] = [];
let flushing = false;
let totalRecords = 0;
let lastPointer: AuditLogPointer | undefined;
let flushTimer: NodeJS.Timeout | undefined;

function serializeImpression(impression: Impression) {
  return {
    id: impression.id,
    campaignId: impression.campaignId,
    publisherWallet: impression.publisherWallet,
    eventType: impression.eventType,
    cost: impression.cost,
    timestamp: impression.timestamp instanceof Date ? impression.timestamp.toISOString() : impression.timestamp,
    clientIp: impression.clientIp,
  };
}

async function flush() {
  if (flushing) return;
  if (buffer.length === 0) return;
  flushing = true;
  const batch = buffer;
  buffer = [];
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = undefined;
  }

  try {
    const payload = batch.map(serializeImpression).map((row) => JSON.stringify(row)).join("\n");
    const result = await storeBuffer(new TextEncoder().encode(payload), {
      contentType: "application/json",
      fileName: `impressions-${Date.now()}.jsonl`,
    });
    totalRecords += batch.length;
    lastPointer = {
      patchId: result.blobId,
      blobObjectId: result.blobObjectId,
      updatedAt: new Date(),
      totalRecords,
    };
  } catch (err) {
    // Put the batch back so we can retry later.
    buffer = [...batch, ...buffer];
    console.error("[audit-log] flush failed", err);
  } finally {
    flushing = false;
  }
}

export function enqueueImpression(impression: Impression) {
  buffer.push(impression);
  if (buffer.length >= BATCH_SIZE) {
    void flush();
    return;
  }
  if (!flushTimer) {
    flushTimer = setTimeout(() => {
      flushTimer = undefined;
      void flush();
    }, FLUSH_INTERVAL_MS);
  }
}

export async function flushAuditLogs() {
  await flush();
}

export function getAuditLogPointer(): AuditLogPointer | undefined {
  return lastPointer;
}

export function getAuditQueueSize() {
  return buffer.length;
}

