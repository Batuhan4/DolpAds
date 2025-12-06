const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }
  return res.json() as Promise<T>;
}

export async function fetchCampaigns() {
  const res = await fetch(`${API_BASE}/api/campaigns`, { cache: "no-store" });
  return handleResponse<{
    campaigns: Array<{
      id: string;
      advertiserWallet: string;
      totalDeposited: number;
      spentAmount: number;
      cpcBid: number;
      imageUrl: string;
      targetUrl: string;
      status: string;
    }>;
    stats: { totalDeposited: number; totalSpent: number; totalImpressions: number; totalClicks: number };
  }>(res);
}

export async function fetchPublisherSummary(publisher: string) {
  const res = await fetch(
    `${API_BASE}/api/publisher/summary?publisher_address=${encodeURIComponent(publisher)}`,
    { cache: "no-store" },
  );
  return handleResponse<{
    availableToClaim: number;
    nonce: number;
    totalEarnings: number;
    totalAdViews: number;
    totalClicks: number;
  }>(res);
}

export async function claimEarnings(publisher: string, campaignId: string) {
  const res = await fetch(`${API_BASE}/api/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publisher_address: publisher, campaign_id: campaignId }),
  });
  return handleResponse<{
    amount: number;
    nonce: number;
    signature: string;
    admin_public_key?: string;
    campaign_id: string;
  }>(res);
}

export function microsToDollars(amount: number) {
  return amount / 1_000_000;
}

