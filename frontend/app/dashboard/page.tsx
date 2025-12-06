"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useApp } from "@/lib/context"

export default function DashboardRedirect() {
  const router = useRouter()
  const { role } = useApp()

  useEffect(() => {
    router.replace(`/dashboard/${role}`)
  }, [role, router])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-muted-foreground">Redirecting...</div>
    </div>
  )
}
