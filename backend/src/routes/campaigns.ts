import { Router } from "express";
import { z } from "zod";
import { getCampaignStats, getPublisherSummary, listCampaigns } from "../db/memory.js";

export const campaignsRouter = Router();

campaignsRouter.get("/campaigns", (_req, res) => {
  const campaigns = listCampaigns();
  const stats = getCampaignStats();
  return res.json({ campaigns, stats });
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

