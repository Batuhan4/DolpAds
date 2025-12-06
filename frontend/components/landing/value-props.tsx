"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Megaphone, Globe, Zap } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const props = [
  {
    icon: Megaphone,
    title: "For Advertisers",
    description: "Pay only for valid engagement. Transparent on-chain escrow ensures your budget is protected.",
  },
  {
    icon: Globe,
    title: "For Publishers",
    description: "One line of code to monetize your dApp. Instant payouts directly to your wallet.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Hybrid architecture ensures ads load in <200ms. Web2 speed with Web3 trust.",
  },
]

export function ValueProps() {
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
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="py-24 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section header with animation */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Why Choose <span className="animate-gradient-text">DolpAds</span>?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            The best of Web2 performance with Web3 transparency
          </p>
        </div>

        {/* Cards with staggered animation */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {props.map((prop, index) => (
            <Card 
              key={prop.title} 
              className={`
                bg-card border-border card-hover-lift gradient-border-hover
                transition-all duration-700
                ${isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-12'
                }
              `}
              style={{ 
                transitionDelay: isVisible ? `${index * 150}ms` : '0ms'
              }}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-4 group icon-hover-glow cursor-pointer transition-all duration-300 hover:from-primary/30 hover:to-accent/20">
                  <prop.icon className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <CardTitle className="text-xl font-semibold">{prop.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{prop.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
