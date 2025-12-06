import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  action?: React.ReactNode
  className?: string
}

export function StatsCard({ title, value, icon: Icon, description, trend, action, className }: StatsCardProps) {
  return (
    <Card className={cn("bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {trend && (
              <p className={cn("text-xs mt-1", trend.isPositive ? "text-success" : "text-destructive")}>
                {trend.isPositive ? "+" : "-"}
                {trend.value}% from last week
              </p>
            )}
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  )
}
