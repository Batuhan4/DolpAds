import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Megaphone, Globe, Zap } from "lucide-react"

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
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Why Choose DolpAds?</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            The best of Web2 performance with Web3 transparency
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {props.map((prop) => (
            <Card key={prop.title} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <prop.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{prop.title}</CardTitle>
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
