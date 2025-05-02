import { AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type ErrorSeverity = "info" | "warning" | "error" | "fatal"

interface ErrorMessageProps {
  message: string
  details?: string
  severity?: ErrorSeverity
  className?: string
}

export function ErrorMessage({ message, details, severity = "error", className }: ErrorMessageProps) {
  const getIcon = () => {
    switch (severity) {
      case "info":
        return <Info className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      case "fatal":
        return <XCircle className="h-4 w-4" />
    }
  }

  const getSeverityClass = () => {
    switch (severity) {
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "warning":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "error":
        return "bg-red-50 text-red-700 border-red-200"
      case "fatal":
        return "bg-red-100 text-red-900 border-red-300"
    }
  }

  return (
    <div className={cn("flex items-start gap-2 rounded-md border p-3 text-sm", getSeverityClass(), className)}>
      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
      <div>
        <p className="font-medium">{message}</p>
        {details && <p className="mt-1 text-xs opacity-90">{details}</p>}
      </div>
    </div>
  )
}
