import { WALRUS_WEBSITES_BLOB_ID } from "../config.js";
import { Website } from "../types.js";
import { loadBlobPointer, saveBlobPointer } from "./blob-pointer-store.js";
import { filePointer, isFilePointer, loadLocalState, loadLocalStateByPath, pointerToPath, saveLocalState } from "./local-state.js";
import { readStateFromWalrus } from "./state-reader.js";
import { saveState } from "./state-store.js";

let latestBlobId = WALRUS_WEBSITES_BLOB_ID || "";
let pointerLoading: Promise<string> | null = null;

async function ensureLatestBlobId() {
  if (latestBlobId) return latestBlobId;
  if (!pointerLoading) {
    pointerLoading = loadBlobPointer("websites");
  }
  const pointer = await pointerLoading;
  if (pointer) {
    latestBlobId = pointer;
  }
  return latestBlobId;
}

void ensureLatestBlobId();

export async function loadWebsites(): Promise<Website[]> {
  await ensureLatestBlobId();
  if (!latestBlobId) return (await loadLocalState<Website[]>("websites.json")) ?? [];

  if (isFilePointer(latestBlobId)) {
    return (await loadLocalStateByPath<Website[]>(pointerToPath(latestBlobId))) ?? [];
  }

  try {
    return await readStateFromWalrus<Website[]>(latestBlobId);
  } catch {
    return (await loadLocalState<Website[]>("websites.json")) ?? [];
  }
}

export async function persistWebsites(websites: Website[]) {
  try {
    const res = await saveState(websites, "websites.json");
    latestBlobId = res.walrus.blobId;
  } catch (err) {
    const filePath = await saveLocalState("websites.json", websites);
    latestBlobId = filePointer(filePath);
    console.warn("[websites-persistence] Walrus store failed, fell back to local file", err);
  }
  await saveBlobPointer("websites", latestBlobId);
  return latestBlobId;
}

export function getLatestWebsitesBlobId() {
  void ensureLatestBlobId();
  return latestBlobId;
}

