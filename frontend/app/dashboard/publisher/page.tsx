"use client"

import { useState } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockPublisherAnalytics } from "@/lib/mock-data"
import { DollarSign, Wallet, Eye, Loader2, PartyPopper } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function PublisherOverview() {
  const [isClaiming, setIsClaiming] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { availableToClaim, totalEarnings, totalAdViews, chartData } = mockPublisherAnalytics

  const handleClaim = async () => {
    setIsClaiming(true)
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setShowSuccess(true)
    setIsClaiming(false)

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Publisher Overview</h1>
        <p className="text-muted-foreground mt-1">Track your earnings and ad performance</p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right-full">
          <Card className="border-success bg-success/10 shadow-lg">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <PartyPopper className="h-5 w-5 text-success" />
              <div>
                <p className="font-semibold text-success">Transaction Success!</p>
                <p className="text-sm text-muted-foreground">
                  ${availableToClaim.toLocaleString()} USDC has been withdrawn to your wallet.
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
          value={`$${availableToClaim.toLocaleString()}`}
          icon={Wallet}
          className="border-primary/20 bg-primary/5"
          action={
            <Button size="sm" onClick={handleClaim} disabled={isClaiming} className="ml-4">
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
          value={`$${totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Total Ad Views"
          value={totalAdViews.toLocaleString()}
          icon={Eye}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue</CardTitle>
          <CardDescription>Your earnings over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
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
                  formatter={(value: number) => [`$${value}`, "Revenue"]}
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
