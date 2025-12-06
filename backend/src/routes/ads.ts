import { Router } from "express";
import { z } from "zod";
import {
  createDelivery,
  getActiveCampaigns,
  recordImpression,
  remainingBudget,
} from "../db/memory.js";
import { pickCampaign } from "../services/selection.js";

export const adsRouter = Router();

const serveQuery = z.object({
  publisher_address: z.string().min(3),
  slot_size: z.string().optional(),
});

const ipBuckets: Map<string, { count: number; expires: number }> = new Map();
const BUCKET_TTL_MS = 60_000;
const BUCKET_LIMIT = 120; // per IP per minute

function checkRateLimit(ip?: string) {
  if (!ip) return true;
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || bucket.expires < now) {
    ipBuckets.set(ip, { count: 1, expires: now + BUCKET_TTL_MS });
    return true;
  }
  if (bucket.count >= BUCKET_LIMIT) return false;
  bucket.count += 1;
  return true;
}

adsRouter.get("/serve", (req, res) => {
  const parsed = serveQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const campaigns = getActiveCampaigns();
  const selected = pickCampaign(campaigns);
  if (!selected) {
    return res.status(204).send();
  }

  const delivery = createDelivery(selected.id, parsed.data.publisher_address);
  if (!delivery) {
    return res.status(503).json({ error: "No eligible campaigns" });
  }

  return res.json({
    ad_id: selected.id,
    image_url: selected.imageUrl,
    click_url: selected.targetUrl,
    tracking_id: delivery.trackingId,
    remaining_budget: remainingBudget(selected),
  });
});

const trackBody = z.object({
  tracking_id: z.string(),
  type: z.enum(["view", "click"]),
});

adsRouter.post("/track", (req, res) => {
  if (!checkRateLimit(req.ip)) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const parsed = trackBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const result = recordImpression(
    parsed.data.tracking_id,
    parsed.data.type,
    req.ip,
  );

  if (!result) {
    return res.status(404).json({ error: "Unknown tracking_id" });
  }

  return res.json({
    status: "ok",
    cost: result.cost,
    campaign_id: result.campaignId,
    publisher_wallet: result.publisherWallet,
  });
});

