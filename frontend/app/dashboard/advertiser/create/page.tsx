"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Check, Upload, ArrowRight, ArrowLeft, Loader2, PartyPopper } from "lucide-react"
import { useRouter } from "next/navigation"

const steps = [
  { id: 1, name: "Campaign Details", description: "Basic information" },
  { id: 2, name: "Creative Upload", description: "Banner images" },
  { id: 3, name: "Budget & Funding", description: "Set your escrow" },
]

export default function CreateCampaignPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
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

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setShowSuccess(true)
    setIsSubmitting(false)
    setTimeout(() => {
      router.push("/dashboard/advertiser")
    }, 2000)
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
                  <Label htmlFor="budget">Total Budget (USDC)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="1000"
                    value={formData.budget}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBid">Max Bid (CPC/CPM)</Label>
                  <Input
                    id="maxBid"
                    name="maxBid"
                    type="number"
                    placeholder="0.50"
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
                    <span className="font-medium">{formData.budget ? `$${formData.budget} USDC` : "—"}</span>
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
              <Button onClick={handleSubmit} disabled={isSubmitting}>
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
