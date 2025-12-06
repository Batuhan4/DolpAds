import { Router } from "express";
import { z } from "zod";
import {
  getCampaignStats,
  getPublisherSummary,
  listCampaigns,
  registerCampaign,
} from "../db/memory.js";

export const campaignsRouter = Router();

campaignsRouter.get("/campaigns", (_req, res) => {
  const campaigns = listCampaigns();
  const stats = getCampaignStats();
  return res.json({ campaigns, stats });
});

const createCampaignBody = z.object({
  id: z.string().min(3),
  sui_object_id: z.string().min(3),
  advertiser_wallet: z.string().min(3),
  total_deposited: z.number().nonnegative(),
  cpc_bid: z.number().nonnegative(),
  image_url: z.string().url().optional(),
  target_url: z.string().url().optional(),
  status: z.enum(["pending", "active", "paused", "empty"]).optional(),
});

campaignsRouter.post("/campaigns", (req, res) => {
  const parsed = createCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const body = parsed.data;
  const record = registerCampaign({
    id: body.id,
    suiObjectId: body.sui_object_id,
    advertiserWallet: body.advertiser_wallet,
    totalDeposited: body.total_deposited,
    cpcBid: body.cpc_bid,
    imageUrl: body.image_url,
    targetUrl: body.target_url,
    status: body.status ?? "active",
  });

  return res.status(201).json(record);
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

