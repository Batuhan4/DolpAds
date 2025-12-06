import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    description: "Publishers earn USDC. Advertisers reach Web3 audiences.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">How It Works</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Get started in minutes, not days</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item) => (
            <Card key={item.step} className="relative bg-card border-border">
              <CardHeader>
                <div className="text-5xl font-bold text-primary/20 mb-2">{item.step}</div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
