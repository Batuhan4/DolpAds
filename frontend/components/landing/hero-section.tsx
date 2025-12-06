"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Waves } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { useEffect, useState } from "react"
import Link from "next/link"

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, startOnMount: boolean = true) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!startOnMount) return
    
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration, startOnMount])
  
  return count
}

export function HeroSection() {
  const router = useRouter()
  const account = useCurrentAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLaunchApp = () => {
    router.push("/dashboard/advertiser")
  }

  // Animated stats
  const adSpend = useCountUp(2.4, 2000, mounted)
  const publishers = useCountUp(150, 2000, mounted)
  const uptime = useCountUp(99.9, 2500, mounted)

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orb - top right */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl animate-float-slow" />
        
        {/* Medium orb - left side */}
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-tr from-accent/15 to-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Small accent orb - bottom */}
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-t from-primary/10 to-transparent rounded-full blur-2xl animate-pulse-glow" />
        
        {/* Tiny floating particles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/30 rounded-full blur-sm animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-accent/40 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-5 h-5 bg-primary/25 rounded-full blur-sm animate-float-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-accent/35 rounded-full blur-sm animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto relative z-10 px-4 py-20 text-center">
        {/* Badge - animated */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
          <Waves className="h-4 w-4 animate-bounce-subtle" />
          <span>Built on Sui Blockchain</span>
        </div>

        {/* Main headline with gradient animation */}
        <h1 className="animate-fade-in-up delay-200 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto text-balance">
          The Set-it-and-Forget-it{" "}
          <span className="animate-gradient-text">Web3 Ad Network</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-300 mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          On-chain transparency. Off-chain speed. Built on Sui.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up delay-400 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {account ? (
            <Button 
              size="lg" 
              className="gap-2 h-12 px-8 text-base group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25" 
              onClick={handleLaunchApp}
            >
              Launch App
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          ) : (
            <ConnectWalletButton size="lg" className="gap-2 h-12 px-8 text-base transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25" />
          )}
          <Button 
            size="lg" 
            variant="outline" 
            className="h-12 px-8 text-base border-primary text-primary bg-primary/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-primary/20 hover:text-primary"
            asChild
          >
            <Link href="/docs">Read Docs</Link>
          </Button>
        </div>

        {/* Animated Stats */}
        <div className="animate-fade-in-up delay-500 mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {[
            { value: `$${adSpend.toFixed(1)}M+`, label: "Ad Spend Processed" },
            { value: `${publishers}+`, label: "Active Publishers" },
            { value: "<200ms", label: "Ad Load Time" },
            { value: `${uptime.toFixed(1)}%`, label: "Uptime" },
          ].map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center group"
              style={{ animationDelay: `${600 + index * 100}ms` }}
            >
              <div className="text-2xl md:text-3xl font-bold text-foreground transition-colors group-hover:text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
