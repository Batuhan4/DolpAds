"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Waves } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

export function HeroSection() {
  const router = useRouter()
  const account = useCurrentAccount()

  const handleLaunchApp = () => {
    router.push("/dashboard/advertiser")
  }

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary mb-8">
          <Waves className="h-4 w-4" />
          <span>Built on Sui Blockchain</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto text-balance">
          The Set-it-and-Forget-it <span className="text-primary">Web3 Ad Network</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          On-chain transparency. Off-chain speed. Built on Sui.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {account ? (
            <Button size="lg" className="gap-2 h-12 px-8 text-base" onClick={handleLaunchApp}>
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <ConnectWalletButton size="lg" className="gap-2 h-12 px-8 text-base" />
          )}
          <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent">
            Read Docs
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { value: "$2.4M+", label: "Ad Spend Processed" },
            { value: "150+", label: "Active Publishers" },
            { value: "<200ms", label: "Ad Load Time" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
