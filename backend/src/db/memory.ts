import { v4 as uuid } from "uuid";
import { enqueueImpression, getAuditLogPointer, getAuditQueueSize } from "../services/audit-log.js";
import { loadCounters, persistCounters, setPersistenceHook } from "../services/persistence.js";
import { loadWebsites, persistWebsites } from "../services/websites-persistence.js";
import { loadCampaigns, persistCampaigns } from "../services/campaigns-persistence.js";
import { Campaign, CampaignStatus, Impression, PendingDelivery, Website } from "../types.js";

const campaigns = new Map<string, Campaign>();
const deliveries = new Map<string, PendingDelivery>();
const impressions: Impression[] = [];
const publisherEarnings = new Map<string, number>();
const publisherClaimed = new Map<string, number>();
const publisherNonces = new Map<string, number>();
const websites = new Map<string, Website>();
// campaigns map already declared above

const defaultCampaignImage =
  "https://dummyimage.com/728x90/0f172a/ffffff&text=DolpAds+Leaderboard";

// Registers an on-chain campaign in the in-memory store (values in mist for SUI).
export function registerCampaign(input: {
  name?: string;
  id: string;
  suiObjectId?: string;
  advertiserWallet: string;
  totalDeposited: number;
  cpcBid: number;
  imageUrl?: string;
  targetUrl?: string;
  status?: CampaignStatus;
  walrusAggregator?: string;
  walrusCreativeBlobId?: string;
  walrusCreativeObjectId?: string;
  walrusMetadataBlobId?: string;
  walrusMetadataObjectId?: string;
  auditLog?: Campaign["auditLog"];
}) {
  const campaign: Campaign = {
    name: input.name?.trim() || input.id,
    id: input.id,
    suiObjectId: input.suiObjectId ?? input.id,
    advertiserWallet: input.advertiserWallet,
    totalDeposited: input.totalDeposited,
    spentAmount: 0,
    cpcBid: input.cpcBid,
    imageUrl: input.imageUrl ?? defaultCampaignImage,
    targetUrl: input.targetUrl ?? "https://dolpads.com",
    status: input.status ?? "active",
    walrusAggregator: input.walrusAggregator,
    walrusCreativeBlobId: input.walrusCreativeBlobId,
    walrusCreativeObjectId: input.walrusCreativeObjectId,
    walrusMetadataBlobId: input.walrusMetadataBlobId,
    walrusMetadataObjectId: input.walrusMetadataObjectId,
    auditLog: input.auditLog,
  };

  campaigns.set(campaign.id, campaign);
  void persistCampaignsSnapshot();
  persistCountersSnapshot();
  return campaign;
}

export function seedCampaign(input: Partial<Campaign> & { id?: string }) {
  const id = input.id ?? uuid();
  const merged: Campaign = {
    name: input.name?.trim() || id,
    id,
    suiObjectId: input.suiObjectId,
    advertiserWallet: input.advertiserWallet ?? "0x_advertiser",
    totalDeposited: input.totalDeposited ?? 5_000_000_000, // 5 SUI in mist
    spentAmount: input.spentAmount ?? 0,
    cpcBid: input.cpcBid ?? 100_000_000, // 0.1 SUI in mist
    imageUrl: input.imageUrl ?? defaultCampaignImage,
    targetUrl: input.targetUrl ?? "https://dolpads.com",
    status: input.status ?? "active",
    walrusAggregator: input.walrusAggregator,
    walrusCreativeBlobId: input.walrusCreativeBlobId,
    walrusCreativeObjectId: input.walrusCreativeObjectId,
    walrusMetadataBlobId: input.walrusMetadataBlobId,
    walrusMetadataObjectId: input.walrusMetadataObjectId,
    auditLog: input.auditLog,
  };

  campaigns.set(id, merged);
  void persistCampaignsSnapshot();
  persistCountersSnapshot();
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

  // Check if we already recorded this event type for this tracking ID
  // to prevent double-counting
  if (eventType === "view" && delivery.viewRecorded) return null;
  if (eventType === "click" && delivery.clickRecorded) return null;

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
  
  // Mark the event as recorded instead of deleting immediately
  if (eventType === "view") {
    delivery.viewRecorded = true;
  } else if (eventType === "click") {
    delivery.clickRecorded = true;
    // Only delete the delivery after click (user interaction complete)
    deliveries.delete(trackingId);
  }

  campaign.spentAmount += cost;
  if (campaign.spentAmount >= campaign.totalDeposited) {
    campaign.status = "empty";
  }

  const earned = publisherEarnings.get(delivery.publisherWallet) ?? 0;
  publisherEarnings.set(delivery.publisherWallet, earned + cost);

  enqueueImpression(impression);
  void persistCampaignsSnapshot();
  persistCountersSnapshot();

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
  persistCountersSnapshot();
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

export function hasCampaigns() {
  return campaigns.size > 0;
}

export function getCampaignStats() {
  const totalDeposited = [...campaigns.values()].reduce((sum, c) => sum + c.totalDeposited, 0);
  const totalSpent = [...campaigns.values()].reduce((sum, c) => sum + c.spentAmount, 0);
  const totalImpressions = impressions.length;
  const totalClicks = impressions.filter((i) => i.eventType === "click").length;
  const auditLog = getAuditLogPointer();
  return { totalDeposited, totalSpent, totalImpressions, totalClicks, auditLog, auditQueueSize: getAuditQueueSize() };
}

export function getPublisherSummary(publisher: string) {
  const { amount, nonce } = getClaimable(publisher);
  const totalEarnings = publisherEarnings.get(publisher) ?? 0;
  const totalAdViews = impressions.filter((i) => i.publisherWallet === publisher && i.eventType === "view").length;
  const totalClicks = impressions.filter((i) => i.publisherWallet === publisher && i.eventType === "click").length;
  return { availableToClaim: amount, nonce, totalEarnings, totalAdViews, totalClicks };
}

export function addWebsite(input: {
  publisherWallet: string;
  name: string;
  url: string;
  category: string;
  monthlyVisitors: number;
}) {
  const id = uuid();
  const record: Website = {
    id,
    publisherWallet: input.publisherWallet,
    name: input.name,
    url: input.url,
    category: input.category,
    monthlyVisitors: input.monthlyVisitors,
    status: "pending",
    dailyImpressions: 0,
  };
  websites.set(id, record);
  void persistWebsitesSnapshot();
  return record;
}

export function listWebsites(publisherWallet?: string) {
  const all = [...websites.values()];
  if (!publisherWallet) return all;
  return all.filter((w) => w.publisherWallet === publisherWallet);
}

function buildSnapshot() {
  const publishers: Record<string, { totalEarnings: number; totalAdViews: number; totalClicks: number; claimed: number; nonce: number }> = {};
  for (const [pub, earnings] of publisherEarnings.entries()) {
    publishers[pub] = {
      totalEarnings: earnings,
      totalAdViews: impressions.filter((i) => i.publisherWallet === pub && i.eventType === "view").length,
      totalClicks: impressions.filter((i) => i.publisherWallet === pub && i.eventType === "click").length,
      claimed: publisherClaimed.get(pub) ?? 0,
      nonce: publisherNonces.get(pub) ?? 0,
    };
  }

  const campaignsSnapshot: Record<string, { spentAmount: number; status: CampaignStatus }> = {};
  for (const [id, c] of campaigns.entries()) {
    campaignsSnapshot[id] = { spentAmount: c.spentAmount, status: c.status };
  }

  return {
    totalDeposited: [...campaigns.values()].reduce((sum, c) => sum + c.totalDeposited, 0),
    totalSpent: [...campaigns.values()].reduce((sum, c) => sum + c.spentAmount, 0),
    totalImpressions: impressions.length,
    totalClicks: impressions.filter((i) => i.eventType === "click").length,
    publishers,
    campaigns: campaignsSnapshot,
  };
}

async function persistCountersSnapshot() {
  const snapshot = buildSnapshot();
  await persistCounters(snapshot);
}

async function persistCampaignsSnapshot() {
  await persistCampaigns([...campaigns.values()]);
}

export async function loadPersistedCounters() {
  const state = await loadCounters();
  if (!state) return;
  for (const [id, c] of Object.entries(state.campaigns)) {
    const campaign = campaigns.get(id);
    if (campaign) {
      campaign.spentAmount = c.spentAmount;
      campaign.status = c.status;
    }
  }
  for (const [pub, data] of Object.entries(state.publishers)) {
    publisherEarnings.set(pub, data.totalEarnings);
    publisherClaimed.set(pub, data.claimed);
    publisherNonces.set(pub, data.nonce);
  }
}

setPersistenceHook(persistCountersSnapshot);

async function persistWebsitesSnapshot() {
  await persistWebsites([...websites.values()]);
}

export async function loadPersistedWebsites() {
  const loaded = await loadWebsites();
  for (const site of loaded) {
    websites.set(site.id, site);
  }
}

export async function loadPersistedCampaigns() {
  const loaded = await loadCampaigns();
  for (const c of loaded) {
    campaigns.set(c.id, c);
  }
}

