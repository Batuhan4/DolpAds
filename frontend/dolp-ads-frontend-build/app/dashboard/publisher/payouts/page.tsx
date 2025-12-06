"use client"

import { useState } from "react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { mockPublisherAnalytics } from "@/lib/mock-data"
import { Wallet, DollarSign, Clock, Loader2, PartyPopper } from "lucide-react"

const payoutHistory = [
  { id: "1", date: "2025-01-05", amount: 520.0, status: "completed", txHash: "0x1a2b...3c4d" },
  { id: "2", date: "2025-01-01", amount: 380.25, status: "completed", txHash: "0x5e6f...7g8h" },
  { id: "3", date: "2024-12-25", amount: 445.5, status: "completed", txHash: "0x9i0j...1k2l" },
  { id: "4", date: "2024-12-20", amount: 290.0, status: "completed", txHash: "0x3m4n...5o6p" },
]

export default function PayoutsPage() {
  const [isClaiming, setIsClaiming] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { availableToClaim, totalEarnings } = mockPublisherAnalytics

  const handleClaim = async () => {
    setIsClaiming(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setShowSuccess(true)
    setIsClaiming(false)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
        <p className="text-muted-foreground mt-1">View your earnings and claim your rewards</p>
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

      {/* Stats */}
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
                "Claim Now"
              )}
            </Button>
          }
        />
        <StatsCard
          title="Total Claimed"
          value={`$${(totalEarnings - availableToClaim).toLocaleString()}`}
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
