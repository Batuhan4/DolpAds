import { Router } from "express";
import { z } from "zod";
import { addWebsite, listWebsites } from "../db/memory.js";

export const websitesRouter = Router();

const createBody = z.object({
  publisher_wallet: z.string().min(3),
  name: z.string().min(1),
  url: z.string().url(),
  category: z.string().min(1),
  monthly_visitors: z.number().nonnegative(),
});

websitesRouter.get("/websites", (req, res) => {
  const publisher = typeof req.query.publisher_wallet === "string" ? req.query.publisher_wallet : undefined;
  const records = listWebsites(publisher);
  res.json({ websites: records });
});

websitesRouter.post("/websites", (req, res) => {
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const record = addWebsite({
    publisherWallet: parsed.data.publisher_wallet,
    name: parsed.data.name,
    url: parsed.data.url,
    category: parsed.data.category,
    monthlyVisitors: parsed.data.monthly_visitors,
  });
  return res.status(201).json(record);
});

