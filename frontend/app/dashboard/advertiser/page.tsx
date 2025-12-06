"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { StatsCard } from "@/components/dashboard/stats-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchCampaigns, mistToSui } from "@/lib/api"
import { DollarSign, Eye, MousePointer, TrendingUp, Pause, Pencil } from "lucide-react"
import Link from "next/link"

export default function AdvertiserOverview() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
  })

  const campaigns = data?.campaigns ?? []
  const stats = data?.stats

  const aggregates = useMemo(() => {
    if (!stats) return { budget: 0, impressions: 0, clicks: 0, ctr: 0 }
    const budget = mistToSui(stats.totalDeposited)
    const impressions = stats.totalImpressions
    const clicks = stats.totalClicks
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
    return { budget, impressions, clicks, ctr }
  }, [stats])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Advertiser Overview</h1>
        <p className="text-muted-foreground mt-1">Track your campaign performance and spending</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Budget Locked"
          value={
            isLoading
              ? "Loading..."
              : `${aggregates.budget.toLocaleString(undefined, { maximumFractionDigits: 3 })} SUI`
          }
          icon={DollarSign}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Total Impressions"
          value={isLoading ? "Loading..." : aggregates.impressions.toLocaleString()}
          icon={Eye}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Total Clicks"
          value={isLoading ? "Loading..." : aggregates.clicks.toLocaleString()}
          icon={MousePointer}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Avg. CTR"
          value={isLoading ? "Loading..." : `${aggregates.ctr.toFixed(2)}%`}
          icon={TrendingUp}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Recent Campaigns Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your active and recent campaigns</CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/advertiser/create">Create Campaign</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isError && <p className="text-sm text-destructive">Failed to load campaigns.</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Spent / Budget</TableHead>
                <TableHead>Bid (CPC)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const spent = mistToSui(campaign.spentAmount);
                const budget = mistToSui(campaign.totalDeposited);
                const cpc = mistToSui(campaign.cpcBid);
                const displayName = campaign.name || campaign.id;
                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-medium">{displayName}</span>
                        <span className="text-xs text-muted-foreground font-mono">{campaign.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={campaign.status as any} />
                    </TableCell>
                    <TableCell>
                      {spent.toLocaleString(undefined, { maximumFractionDigits: 3 })} SUI /{" "}
                      {budget.toLocaleString(undefined, { maximumFractionDigits: 3 })} SUI
                    </TableCell>
                    <TableCell>{cpc.toFixed(4)} SUI</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pause className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No campaigns yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
