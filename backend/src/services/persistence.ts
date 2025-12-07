import { WALRUS_COUNTERS_BLOB_ID } from "../config.js";
import { PersistedCounters } from "../types.js";
import { loadBlobPointer, saveBlobPointer } from "./blob-pointer-store.js";
import { filePointer, isFilePointer, loadLocalState, loadLocalStateByPath, pointerToPath, saveLocalState } from "./local-state.js";
import { saveState } from "./state-store.js";
import { readStateFromWalrus } from "./state-reader.js";

let latestBlobId = WALRUS_COUNTERS_BLOB_ID || "";
let onPersist: (() => Promise<void>) | null = null;
let pointerLoading: Promise<string> | null = null;

async function ensureLatestBlobId() {
  if (latestBlobId) return latestBlobId;
  if (!pointerLoading) {
    pointerLoading = loadBlobPointer("counters");
  }
  const pointer = await pointerLoading;
  if (pointer) {
    latestBlobId = pointer;
  }
  return latestBlobId;
}

void ensureLatestBlobId();

export async function persistCounters(snapshot: PersistedCounters) {
  try {
    const result = await saveState(snapshot, "counters.json");
    latestBlobId = result.walrus.blobId;
  } catch (err) {
    const filePath = await saveLocalState("counters.json", snapshot);
    latestBlobId = filePointer(filePath);
    console.warn("[persistence] Walrus store failed, fell back to local file", err);
  }
  await saveBlobPointer("counters", latestBlobId);
}

export async function loadCounters(): Promise<PersistedCounters | null> {
  await ensureLatestBlobId();
  if (!latestBlobId) return (await loadLocalState<PersistedCounters>("counters.json")) ?? null;

  if (isFilePointer(latestBlobId)) {
    return (await loadLocalStateByPath<PersistedCounters>(pointerToPath(latestBlobId))) ?? null;
  }

  try {
    const state = await readStateFromWalrus<PersistedCounters>(latestBlobId);
    return state;
  } catch {
    return (await loadLocalState<PersistedCounters>("counters.json")) ?? null;
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
  void ensureLatestBlobId();
  return latestBlobId;
}

export function getLatestCountersBlobId() {
  void ensureLatestBlobId();
  return latestBlobId;
}

