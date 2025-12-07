import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "node:path";
import { PORT } from "./config.js";
import {
  hasCampaigns,
  listCampaigns,
  loadPersistedCampaigns,
  loadPersistedCounters,
  loadPersistedWebsites,
  seedCampaign,
} from "./db/memory.js";
import { adsRouter } from "./routes/ads.js";
import { campaignsRouter } from "./routes/campaigns.js";
import { claimRouter } from "./routes/claim.js";
import { websitesRouter } from "./routes/websites.js";
import { statusRouter } from "./routes/status.js";

const app = express();

// Allow cross-origin loader requests with credentials (sendBeacon includes cookies).
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
  }),
);
// Allow larger JSON payloads for creative uploads (default is 100kb).
app.use(express.json({ limit: "10mb" }));
// Also parse text/plain bodies (sendBeacon may send as text/plain)
app.use(express.text({ type: "text/plain" }));
app.use(morgan("dev"));
app.use(express.static(path.join(process.cwd(), "public")));

app.use("/api", adsRouter);
app.use("/api", campaignsRouter);
app.use("/api", claimRouter);
app.use("/api", websitesRouter);
app.use("/api", statusRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Restore campaigns, counters, websites snapshots from Walrus if configured.
void loadPersistedCampaigns().then(() => {
  console.log(`[startup] Loaded ${listCampaigns().length} campaigns from persistence`);
  if (!hasCampaigns()) {
    // Seed a demo campaign so /serve works out of the box.
    console.log("[startup] No campaigns found, seeding demo campaign");
    seedCampaign({
      name: "Demo Campaign",
      id: "demo-campaign",
      advertiserWallet: "0x_advertiser_demo",
      totalDeposited: 10_000_000,
      spentAmount: 0,
      cpcBid: 150_000,
      imageUrl: "https://dummyimage.com/728x90/134e4a/ffffff&text=DolpAds+Demo",
      targetUrl: "https://dolpads.com",
      status: "active",
    });
  }
});
void loadPersistedCounters();
void loadPersistedWebsites();

app.listen(PORT, () => {
  console.log(`DolpAds API listening on port ${PORT}`);
});

