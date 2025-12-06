import { WALRUS_WEBSITES_BLOB_ID } from "../config.js";
import { Website } from "../types.js";
import { readStateFromWalrus } from "./state-reader.js";
import { saveState } from "./state-store.js";

let latestBlobId = WALRUS_WEBSITES_BLOB_ID || "";

export async function loadWebsites(): Promise<Website[]> {
  if (!latestBlobId) return [];
  try {
    return await readStateFromWalrus<Website[]>(latestBlobId);
  } catch {
    return [];
  }
}

export async function persistWebsites(websites: Website[]) {
  const res = await saveState(websites, "websites.json");
  latestBlobId = res.walrus.blobId;
  return latestBlobId;
}

export function getLatestWebsitesBlobId() {
  return latestBlobId;
}

