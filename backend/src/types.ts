export type CampaignStatus = "pending" | "active" | "paused" | "empty";

export interface Campaign {
  id: string;
  suiObjectId?: string;
  advertiserWallet: string;
  totalDeposited: number;
  spentAmount: number;
  cpcBid: number;
  imageUrl: string;
  targetUrl: string;
  status: CampaignStatus;
}

export interface PendingDelivery {
  trackingId: string;
  campaignId: string;
  publisherWallet: string;
  cpcBid: number;
}

export interface Impression {
  id: string;
  campaignId: string;
  publisherWallet: string;
  eventType: "view" | "click";
  cost: number;
  timestamp: Date;
  clientIp?: string;
}

export interface ClaimPayload {
  publisherAddress: string;
  amount: number;
  nonce: number;
  signature: string;
  adminPublicKey?: string;
}

