"use client"

import { Button } from "@/components/ui/button"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { Waves } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCurrentAccount } from "@mysten/dapp-kit"

export function Navbar() {
  const router = useRouter()
  const account = useCurrentAccount()

  const handleLaunchApp = () => {
    router.push("/dashboard/advertiser")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Waves className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">DolpAds</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {account ? (
            <>
              <ConnectWalletButton variant="outline" size="sm" />
              <Button onClick={handleLaunchApp}>Launch App</Button>
            </>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </div>
    </header>
  )
}
