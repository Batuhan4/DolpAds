import { Campaign } from "../types.js";

export function pickCampaign(campaigns: Campaign[]) {
  if (campaigns.length === 0) return undefined;

  // Weighted random by CPC bid with a slight boost for remaining budget.
  const weights = campaigns.map((c) => {
    const remaining = Math.max(0, c.totalDeposited - c.spentAmount);
    const bidWeight = Math.max(1, c.cpcBid);
    const budgetWeight = Math.max(1, Math.min(remaining, c.cpcBid * 10));
    return { campaign: c, weight: bidWeight + budgetWeight };
  });

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * totalWeight;
  for (const w of weights) {
    if (r < w.weight) return w.campaign;
    r -= w.weight;
  }
  return campaigns[0];
}

