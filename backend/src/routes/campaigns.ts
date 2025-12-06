import { Router } from "express";
import { z } from "zod";
import {
  getCampaignStats,
  getPublisherSummary,
  listCampaigns,
  registerCampaign,
} from "../db/memory.js";
import { getLatestCampaignsBlobId, persistCampaigns } from "../services/campaigns-persistence.js";
import { flushPersistence } from "../services/persistence.js";
import { storeBuffer, storeFromUrl, storeJson } from "../services/walrus.js";

export const campaignsRouter = Router();

const listQuery = z.object({
  advertiser_wallet: z.string().optional(),
  publisher_wallet: z.string().optional(),
});

campaignsRouter.get("/campaigns", (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const campaigns = listCampaigns();
  const filtered = campaigns.filter((c) => {
    if (parsed.data.advertiser_wallet && c.advertiserWallet !== parsed.data.advertiser_wallet) return false;
    // Optionally filter by publisher wallet if needed (not used in registry yet).
    return true;
  });
  const stats = getCampaignStats();
  return res.json({ campaigns: filtered, stats });
});

const createCampaignBody = z.object({
  name: z.string().min(1).optional(),
  id: z.string().min(3),
  sui_object_id: z.string().min(3),
  advertiser_wallet: z.string().min(3),
  total_deposited: z.number().nonnegative(),
  cpc_bid: z.number().nonnegative(),
  image_url: z.string().url().optional(),
  target_url: z.string().url().optional(),
  status: z.enum(["pending", "active", "paused", "empty"]).optional(),
  creative_base64: z.string().optional(),
  creative_mime_type: z.string().optional(),
  creative_url: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  walrus_aggregator_url: z.string().url().optional(),
});

campaignsRouter.post("/campaigns", async (req, res) => {
  const parsed = createCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const body = parsed.data;

  try {
    let walrusAggregator: string | undefined = body.walrus_aggregator_url;
    let imageUrl = body.image_url;
    let walrusCreativeBlobId: string | undefined;
    let walrusCreativeObjectId: string | undefined;

    if (body.creative_base64) {
      const buffer = Buffer.from(body.creative_base64, "base64");
      const creative = await storeBuffer(buffer, {
        contentType: body.creative_mime_type ?? "application/octet-stream",
        aggregatorUrl: walrusAggregator,
      });
      walrusAggregator = creative.aggregatorUrl.split("/v1/blobs/")[0];
      walrusCreativeBlobId = creative.blobId;
      walrusCreativeObjectId = creative.blobObjectId;
      imageUrl = creative.aggregatorUrl;
    } else if (body.creative_url) {
      const creative = await storeFromUrl(body.creative_url, {
        aggregatorUrl: walrusAggregator,
      });
      walrusAggregator = creative.aggregatorUrl.split("/v1/blobs/")[0];
      walrusCreativeBlobId = creative.blobId;
      walrusCreativeObjectId = creative.blobObjectId;
      imageUrl = creative.aggregatorUrl;
    }

    const metadataPayload =
      body.metadata ??
      {
        id: body.id,
        advertiser_wallet: body.advertiser_wallet,
        target_url: body.target_url,
        cpc_bid: body.cpc_bid,
        created_at: new Date().toISOString(),
      };

    const metadata = await storeJson(metadataPayload, {
      aggregatorUrl: walrusAggregator,
      fileName: "campaign.json",
    });
    walrusAggregator = metadata.aggregatorUrl.split("/v1/blobs/")[0];

    const record = registerCampaign({
      name: body.name,
      id: body.id,
      suiObjectId: body.sui_object_id,
      advertiserWallet: body.advertiser_wallet,
      totalDeposited: body.total_deposited,
      cpcBid: body.cpc_bid,
      imageUrl,
      targetUrl: body.target_url,
      status: body.status ?? "active",
      walrusAggregator,
      walrusCreativeBlobId,
      walrusCreativeObjectId,
      walrusMetadataBlobId: metadata.blobId,
      walrusMetadataObjectId: metadata.blobObjectId,
    });

    return res.status(201).json(record);
  } catch (err) {
    console.error("[campaigns] failed to store assets on Walrus", err);
    return res.status(500).json({ error: "Failed to store assets on Walrus" });
  }
});

// Manual flush endpoint (optional): captures a snapshot of counters to Walrus.
campaignsRouter.post("/campaigns/flush", async (_req, res) => {
  try {
    const blobId = await flushPersistence();
    return res.json({ blobId });
  } catch (err) {
    console.error("[campaigns] failed to flush persistence", err);
    return res.status(500).json({ error: "Failed to flush persistence" });
  }
});

// Manual snapshot campaigns → Walrus
campaignsRouter.post("/campaigns/snapshot", async (_req, res) => {
  try {
    const campaigns = listCampaigns();
    const blobId = await persistCampaigns(campaigns);
    return res.json({ blobId });
  } catch (err) {
    console.error("[campaigns] failed to snapshot campaigns", err);
    return res.status(500).json({ error: "Failed to snapshot campaigns" });
  }
});

// Status endpoint for latest campaign snapshot
campaignsRouter.get("/campaigns/status", (_req, res) => {
  return res.json({ campaignsBlobId: getLatestCampaignsBlobId() });
});

const publisherQuery = z.object({
  publisher_address: z.string().min(3),
});

campaignsRouter.get("/publisher/summary", (req, res) => {
  const parsed = publisherQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const summary = getPublisherSummary(parsed.data.publisher_address);
  return res.json(summary);
});

