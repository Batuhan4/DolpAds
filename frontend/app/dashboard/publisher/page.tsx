"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useCurrentAccount, useSignAndExecuteTransaction, ConnectButton } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { claimEarnings, fetchPublisherSummary, fetchCampaigns, mistToSui } from "@/lib/api"
import { DollarSign, Wallet, Eye, Loader2, PartyPopper, MousePointerClick, TestTube2, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID
const ADMIN_CONFIG_ID = process.env.NEXT_PUBLIC_ADMIN_CONFIG_ID
// Demo publisher address - a valid 32-byte hex address for testing
const DEMO_PUBLISHER_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000001"

// Helper to convert base64 to bytes array for Move
const base64ToBytes = (b64: string): number[] => {
  try {
    const normalized = b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64.length / 4) * 4, "=")
    return Array.from(Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0)))
  } catch {
    return []
  }
}

// Check if a string looks like a valid Sui object ID (0x followed by 64 hex chars)
const isValidSuiObjectId = (id: string | undefined): boolean => {
  if (!id) return false
  return /^0x[a-fA-F0-9]{64}$/.test(id)
}

export default function PublisherOverview() {
  const account = useCurrentAccount()
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const [isClaiming, setIsClaiming] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [useDemoMode, setUseDemoMode] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claimedAmount, setClaimedAmount] = useState(0)

  // In demo mode, show demo earnings but use connected wallet for claims
  const displayAddress = useDemoMode ? DEMO_PUBLISHER_ADDRESS : account?.address

  // Fetch publisher summary
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["publisher-summary", displayAddress],
    queryFn: () => fetchPublisherSummary(displayAddress!),
    enabled: !!displayAddress,
    refetchInterval: 5000,
  })

  // Fetch campaigns to get valid campaign object IDs
  const { data: campaignsData } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
    staleTime: 30000,
  })

  // Get the first active campaign with a valid Sui object ID
  const activeCampaign = useMemo(() => {
    if (!campaignsData?.campaigns) return null
    return campaignsData.campaigns.find(
      c => c.status === "active" && isValidSuiObjectId(c.id)
    )
  }, [campaignsData])

  const chartData = useMemo(() => {
    const revenue = mistToSui(data?.totalEarnings ?? 0);
    return Array.from({ length: 7 }).map((_, idx) => ({
      date: `Day ${idx + 1}`,
      revenue: Math.max(0, revenue / 7),
    }));
  }, [data])

  const availableSui = mistToSui(data?.availableToClaim ?? 0)
  const totalEarnings = mistToSui(data?.totalEarnings ?? 0)
  const totalAdViews = data?.totalAdViews ?? 0
  const totalClicks = data?.totalClicks ?? 0

  const handleClaim = async () => {
    if (!displayAddress) return
    setClaimError(null)

    // Wallet must be connected for claims
    if (!account?.address) {
      setClaimError("Please connect your wallet to claim earnings.")
      return
    }

    // Check for required configuration
    if (!PACKAGE_ID) {
      setClaimError("Contract package ID not configured. Set NEXT_PUBLIC_PACKAGE_ID.")
      return
    }

    if (!ADMIN_CONFIG_ID || !isValidSuiObjectId(ADMIN_CONFIG_ID)) {
      setClaimError("Admin config not configured. Set NEXT_PUBLIC_ADMIN_CONFIG_ID.")
      return
    }

    // Need a valid campaign to claim from
    const campaignObjectId = activeCampaign?.id
    if (!campaignObjectId || !isValidSuiObjectId(campaignObjectId)) {
      setClaimError("No active campaign found with valid object ID. Create a campaign first.")
      return
    }

    try {
      setIsClaiming(true)

      // Step 1: Get signed claim from backend
      const claimData = await claimEarnings(displayAddress, campaignObjectId)
      
      if (claimData.amount <= 0) {
        setClaimError("No earnings available to claim.")
        return
      }

      // Step 2: Build on-chain transaction
      const tx = new Transaction()
      tx.setGasBudget(50_000_000)

      const signatureBytes = base64ToBytes(claimData.signature)

      // Call withdraw_earning on the smart contract
      tx.moveCall({
        target: `${PACKAGE_ID}::core::withdraw_earning`,
        arguments: [
          tx.object(campaignObjectId),  // campaign object
          tx.object(ADMIN_CONFIG_ID),   // admin config object
          tx.pure.u64(claimData.amount), // amount
          tx.pure.u64(claimData.nonce),  // nonce
          tx.pure.vector("u8", signatureBytes), // signature
        ],
      })

      // Step 3: Sign and execute - this opens wallet popup
      const result = await signAndExecuteTransaction({
        transaction: tx,
      })

      console.log("Claim transaction result:", result)

      // Success
      setClaimedAmount(claimData.amount)
      setShowSuccess(true)
      await refetch()
      setTimeout(() => setShowSuccess(false), 5000)

    } catch (err: any) {
      console.error("Claim error:", err)
      if (err?.message?.includes("rejected") || err?.message?.includes("cancelled")) {
        setClaimError("Transaction was cancelled.")
      } else {
        setClaimError(err?.message || "Failed to claim earnings.")
      }
    } finally {
      setIsClaiming(false)
    }
  }

  const formatSui = (value: number) => {
    if (value === 0) return "0 SUI"
    if (value < 0.001) return `${(value * 1000).toFixed(4)} mSUI`
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 4 })} SUI`
  }

  // Check if claiming is possible
  const canClaim = !!account?.address && 
    !!PACKAGE_ID && 
    !!ADMIN_CONFIG_ID && 
    isValidSuiObjectId(ADMIN_CONFIG_ID) &&
    !!activeCampaign &&
    availableSui > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Publisher Overview</h1>
          <p className="text-muted-foreground mt-1">Track your earnings and ad performance</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Demo Mode Toggle */}
          {useDemoMode ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setUseDemoMode(false)} 
              className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
            >
              <TestTube2 className="h-4 w-4" />
              Exit Demo
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setUseDemoMode(true)} 
              className="gap-2"
            >
              <TestTube2 className="h-4 w-4" />
              Demo Mode
            </Button>
          )}
          <ConnectButton />
        </div>
      </div>

      {/* Welcome Card */}
      {!useDemoMode && !account?.address && (
        <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="py-6 text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-primary/10">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Connect Wallet or Try Demo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use the buttons above to connect your wallet or explore demo mode.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Mode Info */}
      {useDemoMode && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <TestTube2 className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Demo Mode Active</p>
                  <p className="text-xs text-muted-foreground">
                    Showing earnings for demo address.
                    {!account?.address && <span className="text-amber-600 font-medium"> Connect wallet to claim!</span>}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {claimError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive flex-1">{claimError}</p>
            <Button variant="ghost" size="sm" onClick={() => setClaimError(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right-full">
          <Card className="border-green-500 bg-green-500/10 shadow-lg">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <PartyPopper className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold text-green-500">Claim Success!</p>
                <p className="text-sm text-muted-foreground">
                  {formatSui(mistToSui(claimedAmount))} has been withdrawn to your wallet.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats Cards */}
      {(!!displayAddress) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Available to Claim"
            value={isLoading ? "Loading..." : formatSui(availableSui)}
            icon={Wallet}
            className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5"
            action={
              <Button 
                size="sm" 
                onClick={handleClaim} 
                disabled={isClaiming || !canClaim} 
                className="ml-4"
                title={!canClaim ? "Connect wallet and ensure campaign exists" : ""}
              >
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
            title="Total Earnings"
            value={isLoading ? "Loading..." : formatSui(totalEarnings)}
            icon={DollarSign}
            className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"
          />
          <StatsCard
            title="Total Clicks"
            value={isLoading ? "Loading..." : totalClicks.toLocaleString()}
            icon={MousePointerClick}
            className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20"
          />
          <StatsCard
            title="Total Ad Views"
            value={isLoading ? "Loading..." : totalAdViews.toLocaleString()}
            icon={Eye}
            className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20"
          />
        </div>
      )}

      {/* Revenue Chart */}
      {(!!displayAddress) && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
            <CardDescription>Your earnings over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isError && <p className="text-sm text-destructive">Failed to load earnings.</p>}
            <div style={{ width: '100%', height: 320 }}>
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
                    formatter={(value: number) => [`${value.toFixed(6)} SUI`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium">Embed Ads</p>
                <p className="text-sm text-muted-foreground">Add the DolpAds script to your website</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium">Earn SUI</p>
                <p className="text-sm text-muted-foreground">Get paid for each ad click on your site</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium">Claim On-Chain</p>
                <p className="text-sm text-muted-foreground">Connect wallet & withdraw SUI</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
