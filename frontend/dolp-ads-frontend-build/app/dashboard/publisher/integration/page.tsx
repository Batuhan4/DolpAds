"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/context"
import { Copy, Check, FileCode, ArrowRight } from "lucide-react"

export default function IntegrationPage() {
  const { wallet } = useApp()
  const [copied, setCopied] = useState(false)

  const integrationCode = `<script src="https://cdn.dolpads.com/loader.js" data-publisher-id="${wallet.address || "YOUR_WALLET_ADDRESS"}"></script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(integrationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Widget Integration</h1>
        <p className="text-muted-foreground mt-1">Add the DolpAds widget to your website in one line of code</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Integration Code
          </CardTitle>
          <CardDescription>
            {"Copy this code and paste it into the <head> of your website to start displaying ads."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Code Block */}
          <div className="relative">
            <pre className="bg-sidebar text-sidebar-foreground rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{integrationCode}</code>
            </pre>
            <Button size="sm" variant="secondary" className="absolute top-2 right-2 gap-2" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Visual Aid */}
          <div className="rounded-lg border border-border p-6 bg-muted/30">
            <h4 className="font-medium text-foreground mb-4">Where to paste the code:</h4>
            <div className="bg-sidebar text-sidebar-foreground rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <div className="text-muted-foreground">{"<!DOCTYPE html>"}</div>
              <div className="text-muted-foreground">{"<html>"}</div>
              <div className="text-muted-foreground pl-4">{"<head>"}</div>
              <div className="text-muted-foreground pl-8">{"<title>My Website</title>"}</div>
              <div className="pl-8 text-primary flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-accent" />
                {'<script src="https://cdn.dolpads.com/loader.js" ... ></script>'}
              </div>
              <div className="text-muted-foreground pl-4">{"</head>"}</div>
              <div className="text-muted-foreground pl-4">{"<body>...</body>"}</div>
              <div className="text-muted-foreground">{"</html>"}</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Automatic Ad Placement</h4>
                <p className="text-sm text-muted-foreground">
                  Once installed, our script automatically detects optimal ad placements on your page.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h4 className="font-medium mb-2">Instant Payouts</h4>
                <p className="text-sm text-muted-foreground">
                  Earnings are calculated in real-time and available to claim directly to your wallet.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
