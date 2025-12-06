"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { claimEarnings, fetchPublisherSummary, microsToDollars } from "@/lib/api"
import { Wallet, DollarSign, Clock, Loader2, PartyPopper } from "lucide-react"

const DEFAULT_CAMPAIGN_ID = process.env.NEXT_PUBLIC_CAMPAIGN_ID ?? "demo-campaign"

const payoutHistory = [
  { id: "1", date: "2025-01-05", amount: 520.0, status: "completed", txHash: "0x1a2b...3c4d" },
]

export default function PayoutsPage() {
  const account = useCurrentAccount()
  const [isClaiming, setIsClaiming] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["publisher-summary", account?.address],
    queryFn: () => fetchPublisherSummary(account!.address),
    enabled: !!account?.address,
  })

  const available = microsToDollars(data?.availableToClaim ?? 0)
  const totalEarnings = microsToDollars(data?.totalEarnings ?? 0)
  const totalClaimed = Math.max(0, totalEarnings - available)

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
        <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
        <p className="text-muted-foreground mt-1">View your earnings and claim your rewards</p>
      </div>

      {!account?.address && (
        <Card className="border-dashed">
          <CardContent className="py-6">
            <p className="text-sm text-muted-foreground">Connect a Sui wallet to view payouts.</p>
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
                  ${available.toLocaleString(undefined, { maximumFractionDigits: 2 })} has been withdrawn.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Available to Claim"
          value={
            isLoading
              ? "Loading..."
              : `$${available.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
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
                "Claim Now"
              )}
            </Button>
          }
        />
        <StatsCard
          title="Total Claimed"
          value={
            isLoading
              ? "Loading..."
              : `$${totalClaimed.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
          }
          icon={DollarSign}
        />
        <StatsCard title="Pending" value="$0.00" icon={Clock} description="No pending payouts" />
      </div>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your recent withdrawal transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isError && <p className="text-sm text-destructive mb-3">Failed to load payouts.</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutHistory.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>{payout.date}</TableCell>
                  <TableCell className="font-medium">${payout.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      Completed
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{payout.txHash}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
