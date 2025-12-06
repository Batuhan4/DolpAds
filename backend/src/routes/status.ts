import { Router } from "express";
import { getLatestCampaignsBlobId } from "../services/campaigns-persistence.js";
import { getLatestCountersBlobId } from "../services/persistence.js";
import { getAuditLogPointer } from "../services/audit-log.js";
import { getLatestWebsitesBlobId } from "../services/websites-persistence.js";
import { listCampaigns } from "../db/memory.js";

export const statusRouter = Router();

statusRouter.get("/status", (_req, res) => {
  const audit = getAuditLogPointer();
  return res.json({
    campaignsBlobId: getLatestCampaignsBlobId(),
    countersBlobId: getLatestCountersBlobId(),
    websitesBlobId: getLatestWebsitesBlobId(),
    auditLog: audit,
    campaignsCount: listCampaigns().length,
  });
});

