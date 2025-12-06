import { Router } from "express";
import { z } from "zod";
import { getClaimable, markClaimed } from "../db/memory.js";
import { buildClaimMessage, signClaim } from "../services/signing.js";

export const claimRouter = Router();

const claimBody = z.object({
  publisher_address: z.string().min(3),
  campaign_id: z.string().min(3),
});

claimRouter.post("/claim", (req, res) => {
  const parsed = claimBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const publisher = parsed.data.publisher_address;
  const campaignId = parsed.data.campaign_id;
  const { amount, nonce } = getClaimable(publisher);
  if (amount <= 0) {
    return res.status(200).json({ amount: 0, nonce, message: "No pending earnings" });
  }

  const message = buildClaimMessage(publisher, amount, nonce, campaignId);
  const { signature, adminPublicKey } = signClaim(message);

  markClaimed(publisher, amount);

  return res.json({
    amount,
    nonce,
    signature,
    admin_public_key: adminPublicKey,
    campaign_id: campaignId,
  });
});

