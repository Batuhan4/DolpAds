"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { claimEarnings, fetchPublisherSummary, microsToDollars } from "@/lib/api"
import { DollarSign, Wallet, Eye, Loader2, PartyPopper } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const DEFAULT_CAMPAIGN_ID = process.env.NEXT_PUBLIC_CAMPAIGN_ID ?? "demo-campaign"

export default function PublisherOverview() {
  const account = useCurrentAccount()
  const [isClaiming, setIsClaiming] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["publisher-summary", account?.address],
    queryFn: () => fetchPublisherSummary(account!.address),
    enabled: !!account?.address,
  })

  const chartData = useMemo(() => {
    // Placeholder: mirror total earnings across a simple 7-day trend
    const revenue = microsToDollars(data?.totalEarnings ?? 0);
    return Array.from({ length: 7 }).map((_, idx) => ({
      date: `Day ${idx + 1}`,
      revenue: Math.max(0, revenue / 7),
    }));
  }, [data])

  const availableDollars = microsToDollars(data?.availableToClaim ?? 0)
  const totalEarnings = microsToDollars(data?.totalEarnings ?? 0)
  const totalAdViews = data?.totalAdViews ?? 0

  const handleClaim = async () => {
    if (!account?.address) return
    try {
      setIsClaiming(true)
      await claimEarnings(account.address, DEFAULT_CAMPAIGN_ID)
      setShowSuccess(true)
      await refetch()
      setTimeout(() => setShowSuccess(false), 3000)
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Publisher Overview</h1>
        <p className="text-muted-foreground mt-1">Track your earnings and ad performance</p>
      </div>

      {!account?.address && (
        <Card className="border-dashed">
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">Connect a Sui wallet to see your earnings.</p>
          </CardContent>
        </Card>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right-full">
          <Card className="border-success bg-success/10 shadow-lg">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <PartyPopper className="h-5 w-5 text-success" />
              <div>
                <p className="font-semibold text-success">Transaction Success!</p>
                <p className="text-sm text-muted-foreground">
                  ${availableDollars.toLocaleString(undefined, { maximumFractionDigits: 2 })} has been withdrawn.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Available to Claim"
          value={
            isLoading
              ? "Loading..."
              : `$${availableDollars.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          }
          icon={Wallet}
          className="border-primary/20 bg-primary/5"
          action={
            <Button size="sm" onClick={handleClaim} disabled={isClaiming || !account?.address} className="ml-4">
              {isClaiming ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Claiming...
                </>
              ) : (
                "Claim"
              )}
            </Button>
          }
        />
        <StatsCard
          title="Total Earnings (Lifetime)"
          value={
            isLoading
              ? "Loading..."
              : `$${totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          }
          icon={DollarSign}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Total Ad Views"
          value={isLoading ? "Loading..." : totalAdViews.toLocaleString()}
          icon={Eye}
          trend={{ value: 0, isPositive: true }}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue</CardTitle>
          <CardDescription>Your earnings over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {isError && <p className="text-sm text-destructive">Failed to load earnings.</p>}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
