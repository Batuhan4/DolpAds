"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { 
  Check, 
  Copy, 
  RefreshCw, 
  Settings, 
  Eye, 
  Code2, 
  Zap, 
  ArrowLeft,
  Terminal,
  Globe,
  Layers,
  MousePointerClick
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const defaultApiBase = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000"
const defaultPublisher = "0x0000000000000000000000000000000000000000000000000000000000000001"

export default function DebugPage() {
  const [publisher, setPublisher] = useState(defaultPublisher)
  const [slotSize, setSlotSize] = useState("leaderboard")
  const [apiBase, setApiBase] = useState(defaultApiBase)
  const [copied, setCopied] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [scriptKey, setScriptKey] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const normalizedApiBase = useMemo(() => {
    const trimmed = apiBase.trim() || defaultApiBase
    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed
  }, [apiBase])

  const embedSnippet = useMemo(
    () =>
      `<div class="dolp-ad-slot" data-slot="${slotSize}"></div>
<script src="${normalizedApiBase}/loader.js" data-publisher="${publisher}" data-api="${normalizedApiBase}"></script>`,
    [normalizedApiBase, publisher, slotSize],
  )

  // Inject the loader.js script manually - this is how a real publisher would use it
  useEffect(() => {
    if (!containerRef.current) return

    // Clear any existing content
    containerRef.current.innerHTML = ''

    // Create the ad slot div (just like a publisher would)
    const adSlot = document.createElement('div')
    adSlot.className = 'dolp-ad-slot'
    adSlot.setAttribute('data-slot', slotSize || 'leaderboard')
    adSlot.style.minHeight = '90px'
    adSlot.style.display = 'flex'
    adSlot.style.alignItems = 'center'
    adSlot.style.justifyContent = 'center'
    adSlot.innerHTML = '<span style="color: #888; font-size: 14px;">Loading ad via loader.js...</span>'
    containerRef.current.appendChild(adSlot)

    // Create and inject the script tag (just like a publisher would paste it)
    const script = document.createElement('script')
    script.src = `${normalizedApiBase}/loader.js`
    script.setAttribute('data-publisher', publisher || defaultPublisher)
    script.setAttribute('data-api', normalizedApiBase)
    
    // Append script to the container so it runs in context
    containerRef.current.appendChild(script)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [normalizedApiBase, publisher, slotSize, scriptKey])

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore clipboard errors in non-browser environments
    }
  }

  const reloadAd = () => {
    setIsReloading(true)
    // Increment scriptKey to force useEffect to re-run and reload the script
    setScriptKey(k => k + 1)
    setTimeout(() => setIsReloading(false), 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse-glow delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Header section */}
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-50" />
              <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
                <Terminal className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                Debug Console
              </h1>
              <p className="text-muted-foreground mt-1">
                Test and preview your ad integrations in real-time
              </p>
            </div>
          </div>
          
          {/* Quick stats / info bar */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>Live Reload</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
              <Globe className="h-3.5 w-3.5 text-accent" />
              <span>Local Testing</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Multi-size Support</span>
            </div>
          </div>
        </div>

        {/* Configuration Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm shadow-xl animate-fade-in-up delay-100 card-hover-lift gradient-border-hover">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Configuration</CardTitle>
                <CardDescription>Configure your test environment settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative space-y-6">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="publisher" className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  Publisher ID
                </Label>
                <Input 
                  id="publisher" 
                  value={publisher} 
                  onChange={(e) => setPublisher(e.target.value)} 
                  className="bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                  placeholder="0x0000...0001"
                />
                <p className="text-xs text-muted-foreground">Earnings credited to this wallet</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slot" className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full" />
                  Slot Size
                </Label>
                <Input
                  id="slot"
                  value={slotSize}
                  onChange={(e) => setSlotSize(e.target.value)}
                  placeholder="leaderboard"
                  className="bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all"
                />
                <p className="text-xs text-muted-foreground">e.g., leaderboard, banner, sidebar</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api" className="text-sm font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  API Base URL
                </Label>
                <Input
                  id="api"
                  value={apiBase}
                  onChange={(e) => setApiBase(e.target.value)}
                  placeholder="http://localhost:4000"
                  className="bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Your backend server address</p>
              </div>
            </div>

            {/* Embed snippet section */}
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                Embed Snippet
              </Label>
              <div className="relative group">
                <pre className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm overflow-x-auto font-mono text-foreground/80 leading-relaxed">
                  <code>{embedSnippet}</code>
                </pre>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    type="button" 
                    onClick={copySnippet} 
                    size="sm"
                    variant="secondary"
                    className="h-8 px-3 bg-background/80 backdrop-blur-sm"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  type="button" 
                  onClick={copySnippet} 
                  variant="outline"
                  className="gap-2 border-border/50 hover:bg-primary/5 hover:border-primary/50 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy snippet
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  onClick={reloadAd}
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all"
                  disabled={isReloading}
                >
                  <RefreshCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
                  {isReloading ? 'Reloading...' : 'Reload Banner'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview Card */}
        <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm shadow-xl animate-fade-in-up delay-200 card-hover-lift gradient-border-hover">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
                  <Eye className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl">Live Preview</CardTitle>
                  <CardDescription>Real-time banner rendering via loader.js</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Using loader.js
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Click instruction */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-primary/10 border border-green-500/20">
              <MousePointerClick className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">👆 Click the banner below!</p>
                <p className="text-xs text-muted-foreground">Each click earns SUI for the publisher wallet and opens the advertiser&apos;s site</p>
              </div>
            </div>

            {/* This is WHERE the loader.js injects the ad - just like a real publisher site */}
            <div className="rounded-xl border-2 border-dashed border-border/50 bg-gradient-to-br from-muted/20 to-muted/5 p-4 transition-all hover:border-primary/30 relative z-10">
              <div
                ref={containerRef}
                className="min-h-[100px] rounded-lg bg-background/50 overflow-hidden cursor-pointer relative z-20"
                style={{ pointerEvents: 'auto' }}
              >
                {/* loader.js will inject content here */}
              </div>
            </div>
            
            {/* Info box */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 rounded-lg">
                <Terminal className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">How it works</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The banner is loaded by <code className="px-1 py-0.5 bg-muted rounded font-mono">loader.js</code> from the backend.
                  When clicked, it opens the advertiser&apos;s URL and tracks the click via <code className="px-1 py-0.5 bg-muted rounded font-mono">/api/track</code>.
                  The publisher (<code className="px-1 py-0.5 bg-muted rounded font-mono">{publisher}</code>) earns SUI for each click.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer tips */}
        <div className="flex items-center justify-center pt-4 animate-fade-in delay-300">
          <p className="text-xs text-muted-foreground text-center max-w-md">
            💡 <strong>Tip:</strong> Use the browser&apos;s developer tools to monitor network requests and debug any integration issues.
          </p>
        </div>
      </div>
    </div>
  )
}
