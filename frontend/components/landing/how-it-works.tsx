"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"

const steps = [
  {
    step: "01",
    title: "Connect Wallet",
    description: "Link your Sui wallet to get started. No email, no password needed.",
  },
  {
    step: "02",
    title: "Create or Integrate",
    description: "Advertisers create campaigns. Publishers add one line of code.",
  },
  {
    step: "03",
    title: "Earn or Reach",
    description: "Publishers earn SUI. Advertisers reach Web3 audiences.",
  },
]

export function HowItWorks() {
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
    <section ref={sectionRef} className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            How It <span className="animate-gradient-text">Works</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Get started in minutes, not days</p>
        </div>

        {/* Steps with connecting line */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting line - visible on md+ screens */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2 z-0" />
          
          {/* Animated progress line */}
          <div 
            className={`hidden md:block absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary to-accent -translate-y-1/2 z-0 transition-all duration-1000 ease-out ${isVisible ? 'w-full' : 'w-0'}`}
            style={{ transitionDelay: '500ms' }}
          />

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((item, index) => (
              <div 
                key={item.step}
                className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: isVisible ? `${300 + index * 200}ms` : '0ms' }}
              >
                <Card className="relative bg-card border-border card-hover-lift group overflow-hidden">
                  {/* Glow effect on number */}
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
                  
                  <CardHeader className="relative">
                    {/* Step number with glow */}
                    <div className="relative inline-block">
                      <div className="text-6xl font-bold bg-gradient-to-br from-primary/30 to-accent/20 bg-clip-text text-transparent mb-2 transition-all duration-300 group-hover:from-primary/50 group-hover:to-accent/40">
                        {item.step}
                      </div>
                      {/* Pulse ring on hover */}
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping bg-primary/10 transition-opacity duration-300" style={{ animationDuration: '1.5s' }} />
                    </div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardContent>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover:via-primary/50 transition-all duration-500" />
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
