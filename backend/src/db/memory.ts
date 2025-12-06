import { v4 as uuid } from "uuid";
import { Campaign, CampaignStatus, Impression, PendingDelivery } from "../types.js";

const campaigns = new Map<string, Campaign>();
const deliveries = new Map<string, PendingDelivery>();
const impressions: Impression[] = [];
const publisherEarnings = new Map<string, number>();
const publisherClaimed = new Map<string, number>();
const publisherNonces = new Map<string, number>();

const defaultCampaignImage =
  "https://dummyimage.com/728x90/0f172a/ffffff&text=DolpAds+Leaderboard";

export function seedCampaign(input: Partial<Campaign> & { id?: string }) {
  const id = input.id ?? uuid();
  const merged: Campaign = {
    id,
    suiObjectId: input.suiObjectId,
    advertiserWallet: input.advertiserWallet ?? "0x_advertiser",
    totalDeposited: input.totalDeposited ?? 5_000_000, // micro USDC
    spentAmount: input.spentAmount ?? 0,
    cpcBid: input.cpcBid ?? 100_000, // 0.1 USDC in micros
    imageUrl: input.imageUrl ?? defaultCampaignImage,
    targetUrl: input.targetUrl ?? "https://dolpads.com",
    status: input.status ?? "active",
  };

  campaigns.set(id, merged);
  return merged;
}

export function getActiveCampaigns() {
  return [...campaigns.values()].filter(
    (c) => c.status === "active" && remainingBudget(c) > c.cpcBid,
  );
}

export function createDelivery(
  campaignId: string,
  publisherWallet: string,
): PendingDelivery | null {
  const campaign = campaigns.get(campaignId);
  if (!campaign || campaign.status !== "active") return null;

  const trackingId = uuid();
  const delivery: PendingDelivery = {
    trackingId,
    campaignId,
    publisherWallet,
    cpcBid: campaign.cpcBid,
  };
  deliveries.set(trackingId, delivery);
  return delivery;
}

export function recordImpression(
  trackingId: string,
  eventType: Impression["eventType"],
  clientIp?: string,
): Impression | null {
  const delivery = deliveries.get(trackingId);
  if (!delivery) return null;

  const campaign = campaigns.get(delivery.campaignId);
  if (!campaign) return null;

  const cost = eventType === "click" ? delivery.cpcBid : Math.floor(delivery.cpcBid / 10);
  const now = new Date();

  const impression: Impression = {
    id: uuid(),
    campaignId: delivery.campaignId,
    publisherWallet: delivery.publisherWallet,
    eventType,
    cost,
    timestamp: now,
    clientIp,
  };

  impressions.push(impression);
  deliveries.delete(trackingId);

  campaign.spentAmount += cost;
  if (campaign.spentAmount >= campaign.totalDeposited) {
    campaign.status = "empty";
  }

  const earned = publisherEarnings.get(delivery.publisherWallet) ?? 0;
  publisherEarnings.set(delivery.publisherWallet, earned + cost);

  return impression;
}

export function getClaimable(publisherAddress: string) {
  const earned = publisherEarnings.get(publisherAddress) ?? 0;
  const claimed = publisherClaimed.get(publisherAddress) ?? 0;
  const pending = Math.max(0, earned - claimed);
  const nonce = publisherNonces.get(publisherAddress) ?? 0;
  return { amount: pending, nonce };
}

export function markClaimed(publisherAddress: string, amount: number) {
  const claimed = publisherClaimed.get(publisherAddress) ?? 0;
  publisherClaimed.set(publisherAddress, claimed + amount);

  const nonce = publisherNonces.get(publisherAddress) ?? 0;
  publisherNonces.set(publisherAddress, nonce + 1);
}

export function remainingBudget(campaign: Campaign) {
  return campaign.totalDeposited - campaign.spentAmount;
}

export function getCampaign(id: string) {
  return campaigns.get(id);
}

export function listCampaigns() {
  return [...campaigns.values()];
}

export function getCampaignStats() {
  const totalDeposited = [...campaigns.values()].reduce((sum, c) => sum + c.totalDeposited, 0);
  const totalSpent = [...campaigns.values()].reduce((sum, c) => sum + c.spentAmount, 0);
  const totalImpressions = impressions.length;
  const totalClicks = impressions.filter((i) => i.eventType === "click").length;
  return { totalDeposited, totalSpent, totalImpressions, totalClicks };
}

export function getPublisherSummary(publisher: string) {
  const { amount, nonce } = getClaimable(publisher);
  const totalEarnings = publisherEarnings.get(publisher) ?? 0;
  const totalAdViews = impressions.filter((i) => i.publisherWallet === publisher && i.eventType === "view").length;
  const totalClicks = impressions.filter((i) => i.publisherWallet === publisher && i.eventType === "click").length;
  return { availableToClaim: amount, nonce, totalEarnings, totalAdViews, totalClicks };
}

