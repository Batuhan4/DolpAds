"use client"

import { useApp } from "@/lib/context"
import { Badge } from "@/components/ui/badge"
import { Wallet, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: { label: string; href?: string }[] = []

  if (segments[0] === "dashboard") {
    breadcrumbs.push({ label: "Dashboard", href: "/dashboard/advertiser" })

    if (segments[1] === "advertiser") {
      breadcrumbs.push({ label: "Advertiser", href: "/dashboard/advertiser" })
      if (segments[2] === "campaigns") {
        breadcrumbs.push({ label: "My Campaigns" })
      } else if (segments[2] === "create") {
        breadcrumbs.push({ label: "Create Campaign" })
      } else if (segments[2] === "assets") {
        breadcrumbs.push({ label: "Asset Library" })
      }
    } else if (segments[1] === "publisher") {
      breadcrumbs.push({ label: "Publisher", href: "/dashboard/publisher" })
      if (segments[2] === "websites") {
        breadcrumbs.push({ label: "My Websites" })
      } else if (segments[2] === "integration") {
        breadcrumbs.push({ label: "Widget Integration" })
      } else if (segments[2] === "payouts") {
        breadcrumbs.push({ label: "Payouts" })
      }
    }
  }

  return breadcrumbs
}

export function Topbar() {
  const pathname = usePathname()
  const { wallet } = useApp()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6">
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
              {index < breadcrumbs.length - 1 && crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {wallet.isConnected && (
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-2 px-3 py-1.5">
            <Wallet className="h-3.5 w-3.5" />
            <span className="font-mono text-xs">{wallet.address}</span>
          </Badge>
          <Badge className="bg-primary text-primary-foreground px-3 py-1.5">
            {wallet.balance.toLocaleString()} SUI
          </Badge>
        </div>
      )}
    </header>
  )
}
