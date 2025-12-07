"use client"

import type React from "react"

import { useState } from "react"
import { useCurrentAccount, useCurrentWallet, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCampaignRecord } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Check, Upload, ArrowRight, ArrowLeft, Loader2, PartyPopper } from "lucide-react"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, name: "Campaign Details", description: "Basic information" },
  { id: 2, name: "Creative Upload", description: "Banner images" },
  { id: 3, name: "Budget & Funding", description: "Set your escrow" },
]
const defaultBannerUrl = "https://dummyimage.com/728x90/0f172a/ffffff&text=DolpAds+Leaderboard"

const base64ToHex = (b64: string) => {
  try {
    // normalize base64url -> base64 and pad
    const normalized = b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64.length / 4) * 4, "=")
    return Array.from(Uint8Array.from(atob(normalized), (c) => c.charCodeAt(0)))
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  } catch (_err) {
    return undefined
  }
}

const extractCampaignId = (resp: any) => {
  if (!resp) return undefined

  const fromChanges = resp.objectChanges?.find(
    (change: any) =>
      change.type === "created" &&
      "objectType" in change &&
      typeof change.objectType === "string" &&
      change.objectType.includes("::core::Campaign"),
  ) as { objectId?: string } | undefined

  const fromShared = resp.effects?.created?.find((c: any) => {
    const owner = c?.owner
    if (!owner) return false
    if (typeof owner === "object" && "Shared" in owner) return true
    if (typeof owner === "string" && owner.toLowerCase().includes("shared")) return true
    return false
  }) as { reference?: { objectId?: string } } | undefined

  const fromEvent = resp.events?.find(
    (e: any) =>
      typeof e.type === "string" &&
      e.type.includes("::core::CampaignFunded") &&
      e.parsedJson?.campaign_id,
  ) as { parsedJson?: { campaign_id?: string } } | undefined

  const eventIdHex = fromEvent?.parsedJson?.campaign_id ? base64ToHex(fromEvent.parsedJson.campaign_id) : undefined
  const eventId = eventIdHex ? `0x${eventIdHex}` : undefined

  return fromChanges?.objectId ?? fromShared?.reference?.objectId ?? eventId
}

export default function CreateCampaignPage() {
  const router = useRouter()
  const account = useCurrentAccount()
  const currentWallet = useCurrentWallet()
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const client = useSuiClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    destinationUrl: "",
    category: "",
    altText: "",
    hoverText: "",
    budget: "",
    maxBid: "",
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID
  const fallbackCreativeUrl =
    process.env.NEXT_PUBLIC_DEFAULT_CREATIVE_URL ?? defaultBannerUrl

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const toMist = (value: string) => {
    const num = Number(value)
    if (!Number.isFinite(num) || num <= 0) return null
    return BigInt(Math.floor(num * 1_000_000_000))
  }

  const handleSubmit = async () => {
    if (!packageId) {
      setError("NEXT_PUBLIC_PACKAGE_ID is not set. Add it to your env.")
      return
    }
    if (!account?.address) {
      setError("Connect your Sui wallet to create a campaign.")
      return
    }
    const expectedNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK as string | undefined)?.toLowerCase() ?? "testnet"
    const walletChain = currentWallet?.chain?.id?.toLowerCase() // e.g., "sui:testnet"
    const walletNetworkMatches =
      !walletChain || // some wallets omit id; don't block in that case
      walletChain === expectedNetwork ||
      walletChain.endsWith(`:${expectedNetwork}`) ||
      walletChain.includes(expectedNetwork)
    if (!walletNetworkMatches) {
      setError(
        `Wallet is on ${walletChain ?? "unknown"}; switch to ${expectedNetwork} in your wallet and retry.`,
      )
      return
    }

    const budgetMist = toMist(formData.budget)
    if (budgetMist === null) {
      setError("Enter a valid budget in SUI.")
      return
    }

    const parsedBid = toMist(formData.maxBid)
    const fallbackBid = budgetMist / 100n
    const cpcBidMist = parsedBid && parsedBid > 0n ? parsedBid : fallbackBid > 0n ? fallbackBid : 1n
    const campaignName = formData.name.trim() || "Untitled Campaign"

    setIsSubmitting(true)
    setError(null)
    try {
      const tx = new Transaction()
      tx.setGasBudget(50_000_000)
      const [budgetCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(budgetMist)])
      tx.moveCall({
        target: `${packageId}::core::create_campaign`,
        arguments: [budgetCoin],
      })

      const result = await signAndExecuteTransaction({
        transaction: tx,
        options: { showEffects: true, showObjectChanges: true, showEvents: true },
      })

      console.log("CreateCampaign TX result", {
        digest: (result as any)?.digest,
        objectChanges: result.objectChanges,
        effects: result.effects,
        events: result.events,
      })

      let campaignId = extractCampaignId(result)

      // Fallback 1: fetch full tx data via RPC (poll) if not present in wallet response
      if (!campaignId) {
        const digest = (result as any)?.digest
        if (digest) {
          // Wait for transaction to be indexed before polling
          await new Promise((r) => setTimeout(r, 2000))
          const maxAttempts = 8
          const delayMs = 1000
          for (let i = 0; i < maxAttempts && !campaignId; i++) {
            try {
              const rpcResult = await client.getTransactionBlock({
                digest,
                options: { showEffects: true, showEvents: true, showObjectChanges: true },
              })
              console.log("CreateCampaign RPC fetch", { attempt: i + 1, rpcResult })
              campaignId = extractCampaignId(rpcResult)
              if (campaignId) break
            } catch (rpcErr) {
              console.log("CreateCampaign RPC fetch failed", { attempt: i + 1, error: rpcErr })
            }
            await new Promise((r) => setTimeout(r, delayMs))
          }
        }
      }

      if (!campaignId) {
        const digest = (result as any)?.digest ?? "unknown"
        throw new Error(`Could not find campaign object id from transaction. Digest: ${digest}`)
      }

      let creativeBase64: string | undefined
      let creativeMime: string | undefined

      if (uploadedFile) {
        const buffer = await uploadedFile.arrayBuffer()
        creativeBase64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        creativeMime = uploadedFile.type || "image/png"
      }

      await createCampaignRecord({
        name: campaignName,
        id: campaignId,
        suiObjectId: campaignId,
        advertiserWallet: account.address,
        totalDeposited: Number(budgetMist),
        cpcBid: Number(cpcBidMist),
        imageUrl: fallbackCreativeUrl,
        targetUrl: formData.destinationUrl || "https://dolpads.com",
        status: "active",
        creativeBase64,
        creativeMimeType: creativeMime,
        creativeUrl: creativeBase64 ? undefined : fallbackCreativeUrl,
        metadata: {
          name: campaignName,
          category: formData.category,
          target_url: formData.destinationUrl || "https://dolpads.com",
          cpc_bid: Number(cpcBidMist),
          budget_mist: Number(budgetMist),
        },
      })

      setShowSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/advertiser/campaigns")
      }, 1500)
    } catch (err: any) {
      setError(err?.message ?? "Failed to create campaign. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const estimatedReach = formData.budget ? Math.floor(Number(formData.budget) * 15) : 0

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
        <p className="text-muted-foreground mt-1">Set up a new advertising campaign in 3 easy steps</p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-right-full">
          <Card className="border-success bg-success/10 shadow-lg">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <PartyPopper className="h-5 w-5 text-success" />
              <div>
                <p className="font-semibold text-success">Transaction Success!</p>
                <p className="text-sm text-muted-foreground">Campaign "{formData.name}" is now live!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step Indicator */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => (
            <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "flex-1 pr-8" : "")}>
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <div className="ml-4 hidden sm:block">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {stepIdx !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-5 top-5 -ml-px mt-0.5 h-0.5 w-full",
                    currentStep > step.id ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter the basic details for your campaign"}
            {currentStep === 2 && "Upload your banner creative"}
            {currentStep === 3 && "Set your budget and lock funds in escrow"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Campaign Details */}
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Summer NFT Launch"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinationUrl">Destination URL</Label>
                <Input
                  id="destinationUrl"
                  name="destinationUrl"
                  placeholder="https://your-project.com"
                  value={formData.destinationUrl}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defi">DeFi</SelectItem>
                    <SelectItem value="nft">NFT</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="dao">DAO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 2: Creative Upload */}
          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label>Banner Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="banner-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="banner-upload" className="cursor-pointer">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    {uploadedFile ? (
                      <p className="text-sm text-foreground font-medium">{uploadedFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">
                          Drag and drop your banner here, or <span className="text-primary">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF up to 2MB. Recommended: 728x90
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="altText">Alt Text</Label>
                  <Input
                    id="altText"
                    name="altText"
                    placeholder="Describe your banner"
                    value={formData.altText}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hoverText">Hover Text</Label>
                  <Input
                    id="hoverText"
                    name="hoverText"
                    placeholder="Text shown on hover"
                    value={formData.hoverText}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {/* Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="bg-muted rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                  {uploadedFile ? (
                    <img
                      src={URL.createObjectURL(uploadedFile) || "/placeholder.svg"}
                      alt="Banner preview"
                      className="max-h-24 object-contain"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Upload a banner to see preview</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Budget & Funding */}
          {currentStep === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="budget">Total Budget (SUI)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                  placeholder="5"
                    value={formData.budget}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                <Label htmlFor="maxBid">Max Bid (SUI per click)</Label>
                  <Input
                    id="maxBid"
                    name="maxBid"
                    type="number"
                  placeholder="0.1"
                    value={formData.maxBid}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Summary Card */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Campaign Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Campaign Name</span>
                    <span className="font-medium">{formData.name || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium capitalize">{formData.category || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="font-medium">{formData.budget ? `${formData.budget} SUI` : "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Reach</span>
                    <span className="font-medium text-primary">
                      {estimatedReach > 0 ? `~${estimatedReach.toLocaleString()} impressions` : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || !account?.address}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Lock Funds & Launch</>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
