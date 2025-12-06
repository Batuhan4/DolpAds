import { Campaign } from "../types.js";

export function pickCampaign(campaigns: Campaign[]) {
  if (campaigns.length === 0) return undefined;

  // Simple max bid selection for the MVP.
  return campaigns.reduce((best, current) =>
    current.cpcBid > best.cpcBid ? current : best,
  );
}

