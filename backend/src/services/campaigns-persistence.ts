import { WALRUS_CAMPAIGNS_BLOB_ID } from "../config.js";
import { Campaign } from "../types.js";
import { readStateFromWalrus } from "./state-reader.js";
import { saveState } from "./state-store.js";

let latestBlobId = WALRUS_CAMPAIGNS_BLOB_ID || "";

export async function loadCampaigns(): Promise<Campaign[]> {
  if (!latestBlobId) return [];
  try {
    return await readStateFromWalrus<Campaign[]>(latestBlobId);
  } catch {
    return [];
  }
}

export async function persistCampaigns(campaigns: Campaign[]) {
  const res = await saveState(campaigns, "campaigns.json");
  latestBlobId = res.walrus.blobId;
  return latestBlobId;
}

export function getLatestCampaignsBlobId() {
  return latestBlobId;
}

