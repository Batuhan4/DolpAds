import { WALRUS_CAMPAIGNS_BLOB_ID } from "../config.js";
import { Campaign } from "../types.js";
import { loadBlobPointer, saveBlobPointer } from "./blob-pointer-store.js";
import { filePointer, isFilePointer, loadLocalState, loadLocalStateByPath, pointerToPath, saveLocalState } from "./local-state.js";
import { readStateFromWalrus } from "./state-reader.js";
import { saveState } from "./state-store.js";

let latestBlobId = WALRUS_CAMPAIGNS_BLOB_ID || "";
let pointerLoading: Promise<string> | null = null;

async function ensureLatestBlobId() {
  if (latestBlobId) return latestBlobId;
  if (!pointerLoading) {
    pointerLoading = loadBlobPointer("campaigns");
  }
  const pointer = await pointerLoading;
  if (pointer) {
    latestBlobId = pointer;
  }
  return latestBlobId;
}

void ensureLatestBlobId();

export async function loadCampaigns(): Promise<Campaign[]> {
  // ALWAYS try local file first - it's the reliable source
  console.log("[campaigns-persistence] Checking local state first");
  const localCampaigns = await loadLocalState<Campaign[]>("campaigns.json");
  if (localCampaigns && localCampaigns.length > 0) {
    console.log(`[campaigns-persistence] Loaded ${localCampaigns.length} campaigns from local file`);
    return localCampaigns;
  }

  // Fallback to Walrus if local is empty
  await ensureLatestBlobId();
  if (!latestBlobId) {
    console.log("[campaigns-persistence] No blob pointer and no local state");
    return [];
  }

  if (isFilePointer(latestBlobId)) {
    console.log(`[campaigns-persistence] Loading from file pointer: ${latestBlobId}`);
    return (await loadLocalStateByPath<Campaign[]>(pointerToPath(latestBlobId))) ?? [];
  }

  try {
    console.log(`[campaigns-persistence] Trying Walrus blob: ${latestBlobId}`);
    const campaigns = await readStateFromWalrus<Campaign[]>(latestBlobId);
    if (campaigns && campaigns.length > 0) {
      // Save to local for future reliability
      await saveLocalState("campaigns.json", campaigns);
      console.log(`[campaigns-persistence] Synced ${campaigns.length} campaigns from Walrus to local`);
      return campaigns;
    }
    return [];
  } catch {
    console.log("[campaigns-persistence] Walrus failed, no campaigns found");
    return [];
  }
}

export async function persistCampaigns(campaigns: Campaign[]) {
  // ALWAYS save to local file first - this is reliable
  await saveLocalState("campaigns.json", campaigns);
  console.log(`[campaigns-persistence] Saved ${campaigns.length} campaigns to local file`);

  // Then try Walrus as backup (optional, don't fail if it doesn't work)
  try {
    const res = await saveState(campaigns, "campaigns.json");
    latestBlobId = res.walrus.blobId;
    await saveBlobPointer("campaigns", latestBlobId);
    console.log(`[campaigns-persistence] Also saved to Walrus: ${latestBlobId}`);
  } catch (err) {
    console.warn("[campaigns-persistence] Walrus backup failed (local file is safe)", err);
  }

  return latestBlobId;
}

export function getLatestCampaignsBlobId() {
  void ensureLatestBlobId();
  return latestBlobId;
}

