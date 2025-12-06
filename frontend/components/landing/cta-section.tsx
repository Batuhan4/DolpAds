"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"

export function CTASection() {
  const router = useRouter()
  const account = useCurrentAccount()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLaunchApp = () => {
    router.push("/dashboard/advertiser")
  }

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div 
          className={`max-w-3xl mx-auto text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6 backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <Sparkles className="h-4 w-4" />
            <span>Start Earning Today</span>
          </div>

          {/* Headline */}
          <h2 
            className={`text-3xl md:text-5xl font-bold text-foreground mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '200ms' }}
          >
            Ready to Transform Your{" "}
            <span className="animate-gradient-text">Web3 Advertising</span>?
          </h2>

          {/* Subheadline */}
          <p 
            className={`text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '300ms' }}
          >
            Join hundreds of publishers and advertisers already using DolpAds. 
            No fees, no middlemen, just transparent on-chain advertising.
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '400ms' }}
          >
            {account ? (
              <Button 
                size="lg" 
                className="gap-2 h-14 px-10 text-lg group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30" 
                onClick={handleLaunchApp}
              >
                Get Started Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            ) : (
              <ConnectWalletButton 
                size="lg" 
                className="gap-2 h-14 px-10 text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30" 
              />
            )}
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-10 text-lg border-primary text-primary bg-primary/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-primary/20 hover:text-primary"
              asChild
            >
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div 
            className={`mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Live on Sui Mainnet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span>Simple 10% Fee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
