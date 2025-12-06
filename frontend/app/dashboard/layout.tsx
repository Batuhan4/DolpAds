"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { useApp } from "@/lib/context"
import { useSuiWallet } from "@/lib/sui-wallet-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role } = useApp()
  const { isConnected, connect } = useSuiWallet()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isConnected) {
      connect("Sui Wallet")
    }
  }, [isConnected, connect])

  useEffect(() => {
    if (pathname === "/dashboard") {
      router.replace(`/dashboard/${role}`)
    }
  }, [pathname, role, router])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
