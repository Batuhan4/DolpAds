import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "active" | "paused" | "pending" | "approved" | "ended"

const statusStyles: Record<Status, string> = {
  active: "bg-success/10 text-success border-success/20",
  approved: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  ended: "bg-muted text-muted-foreground border-border",
}

interface StatusBadgeProps {
  status: Status
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 capitalize", statusStyles[status])}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </Badge>
  )
}
