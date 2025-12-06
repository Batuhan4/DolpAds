import type { Components } from "react-markdown"
import type { Metadata } from "next"
import ReactMarkdown from "react-markdown"

import { Footer } from "@/components/landing/footer"
import { Navbar } from "@/components/landing/navbar"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "DolpAds Docs",
  description:
    "Product guide for advertisers and publishers using DolpAds' hybrid Web3 ad network.",
}

type DocSection = {
  id: string
  title: string
  body: string
}

const sections: DocSection[] = [
  {
    id: "overview",
    title: "DolpAds in 30 seconds",
    body: `DolpAds is the "set it and forget it" Web3 ad network on Sui. Advertisers lock budget on-chain for trust, while ads render off-chain in <200ms for speed. Publishers drop in one snippet and start earning transparently.`,
  },
  {
    id: "advertiser-quickstart",
    title: "Advertiser quickstart",
    body: `1. Connect a Sui wallet in the dashboard.\n2. Create a campaign: name, destination URL, category (DeFi/NFT/Gaming), and bid (CPC/CPM).\n3. Upload your creative (banner) to IPFS/S3 via the UI.\n4. Fund the campaign: deposit SUI into the DolpAds escrow contract.\n5. Launch: ads start serving to matched publishers; track clicks/impressions in real time.\n\n**What you get:** on-chain budget custody, transparent payouts, and a fast off-chain ad server.`,
  },
  {
    id: "publisher-quickstart",
    title: "Publisher quickstart",
    body: `1. Register your site (auto-approve in hackathon mode).\n2. Copy the universal loader and place it in your <head>.\n3. Add ad slots where you want banners to appear.\n4. Earn per impression/click; claim with a signed payout transaction.\n\n**One-line loader + slot:**\n\n\`\`\`html\n<!-- DolpAds Global Site Tag -->\n<script src="https://cdn.dolpads.com/loader.js" data-publisher-id="0x123..."></script>\n<div class="dolp-ad-slot" data-format="leaderboard"></div>\n\`\`\`\n\nThe loader fetches the best-paying creative from the DolpAds backend, injects it, and records impressions server-side.`,
  },
  {
    id: "architecture",
    title: "Hybrid architecture: trust + speed",
    body: `- **On-chain escrow:** Advertiser budgets live in \`dolpads::escrow\` on Sui; every payout is verifiable.\n- **Off-chain ad server:** Sub-200ms selection from active campaigns with budget.\n- **Oracle-backed payouts:** Backend signs publisher claims (impressions/clicks) so the contract releases earnings only for valid traffic.\n- **Indexer:** Listens to chain events to mark campaigns active once funded.\n- **Storage:** Walrus/content-addressed blobs for creatives, plus in-memory cache for hot selection.`,
  },
  {
    id: "analytics-optimization",
    title: "Analytics & optimization",
    body: `- Live dashboard: spend, clicks, CTR, and earnings per site.\n- Targeting: simple categories (DeFi, NFT, Gaming) with more granular filters planned.\n- Roadmap: on-chain referral links (Phase 2) and embedded swap / action ads (Phase 3) for deeper attribution and revenue sharing.`,
  },
  {
    id: "payouts",
    title: "Payouts, security, and compliance",
    body: `- Publishers claim via \`withdraw_earnings\`, gated by a backend signature to prevent fraud.\n- Advertiser spend and publisher earnings remain auditable on-chain.\n- Whitelisting: advertisers may require approval; publishers are auto-approved during hackathons for speed.\n- Transparency goal: every SUI that leaves escrow is tied to verified delivery events.`,
  },
  {
    id: "support",
    title: "Support and next steps",
    body: `- Need faster onboarding? Ping the team for accelerated whitelisting.\n- Want to test? Start with a small SUI deposit and a single leaderboard banner.\n- Integration time target: < 2 minutes from snippet paste to first render.\n- Follow feature rollouts and playbooks inspired by modern Web3 ad stacks like AdToken's onboarding flows (role-based signup, wallet-first identity).\n`,
  },
]

const markdownComponents: Components = {
  h1: ({ node: _node, ...props }) => (
    <h1 className="text-3xl font-bold text-foreground tracking-tight" {...props} />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2 className="mt-10 text-2xl font-semibold text-foreground leading-tight" {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 className="mt-8 text-xl font-semibold text-foreground leading-snug" {...props} />
  ),
  h4: ({ node: _node, ...props }) => (
    <h4 className="mt-6 text-lg font-semibold text-foreground" {...props} />
  ),
  p: ({ node: _node, ...props }) => (
    <p className="text-muted-foreground leading-relaxed" {...props} />
  ),
  ul: ({ node: _node, ...props }) => (
    <ul className="list-disc space-y-2 pl-6 text-muted-foreground" {...props} />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol className="list-decimal space-y-2 pl-6 text-muted-foreground" {...props} />
  ),
  li: ({ node: _node, ...props }) => <li className="leading-relaxed" {...props} />,
  strong: ({ node: _node, ...props }) => (
    <strong className="text-foreground font-semibold" {...props} />
  ),
  code: ({ node, className: _className, children, ...props }) => {
    // react-markdown v9 removes the inline flag; infer inline vs block.
    const isInline =
      node?.position?.start.line === node?.position?.end.line && !String(children).includes("\n")

    if (isInline) {
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
          {...props}
        >
          {children}
        </code>
      )
    }

    return (
      <pre className="my-4 overflow-x-auto rounded-lg bg-muted p-4">
        <code className="font-mono text-sm text-foreground" {...props}>
          {children}
        </code>
      </pre>
    )
  },
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      className="border-l-4 border-primary/60 bg-secondary/60 px-4 py-2 text-muted-foreground"
      {...props}
    />
  ),
  hr: ({ node: _node, ...props }) => <hr className="my-10 border-border" {...props} />,
}

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pb-16 pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Product docs</p>
            <h1 className="text-4xl font-semibold leading-tight">DolpAds Product Guide</h1>
            <p className="text-muted-foreground">
              Get live in minutes as an advertiser or publisher. Built for on-chain trust and
              off-chain speed—no PDFs, no PRD dumps, just the playbooks you need.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
            <Card className="sticky top-28 hidden h-fit border bg-card/90 p-4 lg:block">
              <p className="text-xs uppercase text-muted-foreground">On this page</p>
              <div className="mt-3 flex flex-col gap-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </Card>

            <div className="space-y-6">
              {sections.map((section) => (
                <Card
                  key={section.id}
                  id={section.id}
                  className="border bg-card p-6 shadow-sm"
                  style={{ scrollMarginTop: "6rem" }}
                >
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
                    <ReactMarkdown components={markdownComponents}>{section.body}</ReactMarkdown>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

