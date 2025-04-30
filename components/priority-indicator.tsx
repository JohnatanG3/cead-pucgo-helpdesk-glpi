import { cn } from "@/lib/utils"

type PriorityLevel = "low" | "medium" | "high" | "urgent"

interface PriorityIndicatorProps {
  priority: PriorityLevel | number | string
  showLabel?: boolean
  className?: string
}

export function PriorityIndicator({ priority, showLabel = true, className }: PriorityIndicatorProps) {
  // Converter número ou string para PriorityLevel
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
  } else if (typeof priority === "string") {
    // Verificar se a string já é uma PriorityLevel válida
    if (["low", "medium", "high", "urgent"].includes(priority)) {
      priorityLevel = priority as PriorityLevel
    } else {
      // Tentar converter string para número e depois para PriorityLevel
      const numPriority = Number.parseInt(priority)
      // biome-ignore lint/suspicious/noGlobalIsNan: <explanation>
      if (!isNaN(numPriority)) {
        switch (numPriority) {
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
        // Fallback para prioridade média se não conseguir converter
        priorityLevel = "medium"
      }
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
