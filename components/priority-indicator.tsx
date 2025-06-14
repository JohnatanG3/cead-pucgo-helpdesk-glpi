export function PriorityIndicator({ priority }: { priority: number }) {
  let priorityClass = "priority-low"
  let priorityText = "Baixa"

  switch (priority) {
    case 1:
      priorityClass = "priority-low"
      priorityText = "Baixa"
      break
    case 2:
      priorityClass = "priority-medium"
      priorityText = "Média"
      break
    case 3:
      priorityClass = "priority-high"
      priorityText = "Alta"
      break
    case 4:
    case 5:
      priorityClass = "priority-urgent"
      priorityText = "Urgente"
      break
    default:
      priorityClass = "priority-low"
      priorityText = "Baixa"
  }

  return (
    <span className="flex items-center">
      <span className={`priority-indicator ${priorityClass}`} />
      <span>{priorityText}</span>
    </span>
  )
}
