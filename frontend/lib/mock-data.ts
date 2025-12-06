// Mock Campaigns for Advertisers
export const mockCampaigns = [
  {
    id: "1",
    name: "Sui Swap Launch",
    status: "active" as const,
    destinationUrl: "https://suiswap.io",
    category: "DeFi",
    budget: 5000,
    spent: 2340,
    impressions: 45230,
    clicks: 1205,
    ctr: 2.66,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Blue Move NFT",
    status: "active" as const,
    destinationUrl: "https://bluemove.net",
    category: "NFT",
    budget: 3000,
    spent: 1890,
    impressions: 32100,
    clicks: 890,
    ctr: 2.77,
    createdAt: "2024-01-18",
  },
  {
    id: "3",
    name: "Cetus Protocol",
    status: "paused" as const,
    destinationUrl: "https://cetus.zone",
    category: "DeFi",
    budget: 8000,
    spent: 4500,
    impressions: 78000,
    clicks: 2100,
    ctr: 2.69,
    createdAt: "2024-01-10",
  },
]

// Mock Websites for Publishers
export const mockWebsites = [
  {
    id: "1",
    name: "SuiNews",
    url: "https://suinews.com",
    category: "News",
    monthlyVisitors: 125000,
    status: "approved" as const,
    dailyImpressions: 4500,
  },
  {
    id: "2",
    name: "MoveDev Blog",
    url: "https://movedev.blog",
    category: "Developer",
    monthlyVisitors: 45000,
    status: "pending" as const,
    dailyImpressions: 1200,
  },
]

// Mock Analytics Data
export const mockAdvertiserAnalytics = {
  totalBudgetLocked: 16000,
  totalImpressions: 155330,
  totalClicks: 4195,
  avgCtr: 2.7,
  chartData: [
    { date: "Mon", impressions: 18500, clicks: 520 },
    { date: "Tue", impressions: 22100, clicks: 610 },
    { date: "Wed", impressions: 19800, clicks: 540 },
    { date: "Thu", impressions: 24200, clicks: 680 },
    { date: "Fri", impressions: 26100, clicks: 720 },
    { date: "Sat", impressions: 21500, clicks: 590 },
    { date: "Sun", impressions: 23130, clicks: 535 },
  ],
}

export const mockPublisherAnalytics = {
  availableToClaim: 1245.5,
  totalEarnings: 8920.75,
  totalAdViews: 892000,
  chartData: [
    { date: "Mon", revenue: 145 },
    { date: "Tue", revenue: 189 },
    { date: "Wed", revenue: 156 },
    { date: "Thu", revenue: 201 },
    { date: "Fri", revenue: 234 },
    { date: "Sat", revenue: 178 },
    { date: "Sun", revenue: 142 },
  ],
}

export type Campaign = (typeof mockCampaigns)[0]
export type Website = (typeof mockWebsites)[0]
