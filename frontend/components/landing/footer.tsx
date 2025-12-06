import { Waves } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Waves className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">DolpAds</span>
          </div>

          <nav className="flex items-center gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Twitter
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Telegram
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Discord
            </Link>
          </nav>

          <div className="text-sm text-muted-foreground">© 2025 DolpAds. Built on Sui.</div>
        </div>
      </div>
    </footer>
  )
}
