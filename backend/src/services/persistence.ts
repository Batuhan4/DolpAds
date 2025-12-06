import { WALRUS_COUNTERS_BLOB_ID } from "../config.js";
import { PersistedCounters } from "../types.js";
import { saveState } from "./state-store.js";
import { readStateFromWalrus } from "./state-reader.js";

let latestBlobId = WALRUS_COUNTERS_BLOB_ID || "";
let onPersist: (() => Promise<void>) | null = null;

export async function persistCounters(snapshot: PersistedCounters) {
  const result = await saveState(snapshot, "counters.json");
  latestBlobId = result.walrus.blobId;
}

export async function loadCounters(): Promise<PersistedCounters | null> {
  if (!latestBlobId) return null;
  try {
    const state = await readStateFromWalrus<PersistedCounters>(latestBlobId);
    return state;
  } catch {
    return null;
  }
}

export function setPersistenceHook(fn: () => Promise<void>) {
  onPersist = fn;
}

// Exposed for tests / manual trigger.
export async function flushPersistence() {
  if (onPersist) {
    await onPersist();
  }
  return latestBlobId;
}

export function getLatestCountersBlobId() {
  return latestBlobId;
}

