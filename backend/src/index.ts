import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "node:path";
import { PORT } from "./config.js";
import { seedCampaign } from "./db/memory.js";
import { adsRouter } from "./routes/ads.js";
import { campaignsRouter } from "./routes/campaigns.js";
import { claimRouter } from "./routes/claim.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api", adsRouter);
app.use("/api", campaignsRouter);
app.use("/api", claimRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Seed a demo campaign so /serve works out of the box.
seedCampaign({
  id: "demo-campaign",
  advertiserWallet: "0x_advertiser_demo",
  totalDeposited: 10_000_000,
  spentAmount: 0,
  cpcBid: 150_000,
  imageUrl: "https://dummyimage.com/728x90/134e4a/ffffff&text=DolpAds+Demo",
  targetUrl: "https://dolpads.com",
  status: "active",
});

app.listen(PORT, () => {
  console.log(`DolpAds API listening on port ${PORT}`);
});

