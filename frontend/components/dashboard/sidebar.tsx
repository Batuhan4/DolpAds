"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/context"
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Waves, LayoutDashboard, Megaphone, PlusCircle, ImageIcon, Globe, Code, Wallet, LogOut } from "lucide-react"

const advertiserLinks = [
  { href: "/dashboard/advertiser", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/advertiser/campaigns", label: "My Campaigns", icon: Megaphone },
  { href: "/dashboard/advertiser/create", label: "Create Campaign", icon: PlusCircle },
  { href: "/dashboard/advertiser/assets", label: "Asset Library", icon: ImageIcon },
]

const publisherLinks = [
  { href: "/dashboard/publisher", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/publisher/websites", label: "My Websites", icon: Globe },
  { href: "/dashboard/publisher/integration", label: "Widget Integration", icon: Code },
  { href: "/dashboard/publisher/payouts", label: "Payouts", icon: Wallet },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { role, setRole, wallet } = useApp()
  const currentAccount = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()

  useEffect(() => {
    if (pathname.includes("/dashboard/publisher")) {
      setRole("publisher")
    } else if (pathname.includes("/dashboard/advertiser")) {
      setRole("advertiser")
    }
  }, [pathname, setRole])

  const links = role === "advertiser" ? advertiserLinks : publisherLinks

  const handleRoleToggle = (checked: boolean) => {
    const newRole = checked ? "publisher" : "advertiser"
    setRole(newRole)
    router.push(`/dashboard/${newRole}`)
  }

  const handleDisconnect = () => {
    disconnect()
    router.push("/")
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Waves className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground">DolpAds</span>
        </Link>
      </div>

      {/* Role Switcher */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between rounded-lg bg-sidebar-accent p-3">
          <Label
            htmlFor="role-switch"
            className={cn(
              "text-sm cursor-pointer transition-colors",
              role === "advertiser" ? "text-sidebar-foreground font-medium" : "text-sidebar-foreground/60",
            )}
          >
            Advertiser
          </Label>
          <Switch id="role-switch" checked={role === "publisher"} onCheckedChange={handleRoleToggle} />
          <Label
            htmlFor="role-switch"
            className={cn(
              "text-sm cursor-pointer transition-colors",
              role === "publisher" ? "text-sidebar-foreground font-medium" : "text-sidebar-foreground/60",
            )}
          >
            Publisher
          </Label>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Wallet Info & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        {currentAccount && (
          <div className="rounded-lg bg-sidebar-accent p-3">
            <div className="text-xs text-sidebar-foreground/60 mb-1">Connected Wallet</div>
            <div className="text-sm font-mono text-sidebar-foreground truncate">
              {currentAccount.address.slice(0, 10)}...{currentAccount.address.slice(-4)}
            </div>
            <div className="text-sm text-sidebar-primary font-medium mt-1">{wallet.balance.toLocaleString()} USDC</div>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={handleDisconnect}
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    </aside>
  )
}
