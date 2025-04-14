import { cn } from "@/lib/utils"

type PriorityLevel = "low" | "medium" | "high" | "urgent"

interface PriorityIndicatorProps {
  priority: PriorityLevel | number
  showLabel?: boolean
  className?: string
}

export function PriorityIndicator({ priority, showLabel = true, className }: PriorityIndicatorProps) {
  // Converter número para string se necessário
  let priorityLevel: PriorityLevel

  if (typeof priority === "number") {
    switch (priority) {
      case 1:
        priorityLevel = "low"
        break
      case 2:
        priorityLevel = "medium"
        break
      case 3:
        priorityLevel = "high"
        break
      case 4:
      case 5:
        priorityLevel = "urgent"
        break
      default:
        priorityLevel = "medium"
    }
  } else {
    priorityLevel = priority
  }

  // Mapear prioridade para rótulo
  const priorityLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
  }

  return (
    <div className={cn("flex items-center", className)}>
      <span className={cn("priority-indicator", `priority-${priorityLevel}`)} />
      {showLabel && <span className="text-sm">{priorityLabels[priorityLevel]}</span>}
    </div>
  )
}
