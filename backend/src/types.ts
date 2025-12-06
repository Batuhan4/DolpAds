export type CampaignStatus = "pending" | "active" | "paused" | "empty";

export interface Campaign {
  name: string;
  id: string;
  suiObjectId?: string;
  advertiserWallet: string;
  totalDeposited: number;
  spentAmount: number;
  cpcBid: number;
  imageUrl: string;
  targetUrl: string;
  status: CampaignStatus;
  walrusAggregator?: string;
  walrusCreativeBlobId?: string;
  walrusCreativeObjectId?: string;
  walrusMetadataBlobId?: string;
  walrusMetadataObjectId?: string;
  auditLog?: AuditLogPointer;
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

export interface WalrusStoreResult {
  blobId: string;
  blobObjectId?: string;
  size?: number;
  aggregatorUrl: string;
}

export interface AuditLogPointer {
  patchId?: string;
  blobObjectId?: string;
  updatedAt?: Date;
  totalRecords?: number;
}

export interface PersistedCounters {
  totalDeposited: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  publishers: Record<
    string,
    {
      totalEarnings: number;
      totalAdViews: number;
      totalClicks: number;
      claimed: number;
      nonce: number;
    }
  >;
  campaigns: Record<
    string,
    {
      spentAmount: number;
      status: CampaignStatus;
    }
  >;
}

export interface Website {
  id: string;
  publisherWallet: string;
  name: string;
  url: string;
  category: string;
  monthlyVisitors: number;
  status: "pending" | "approved" | "rejected";
  dailyImpressions: number;
}

