"use client"
import { X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileAttachmentProps {
  file: File | null
  onRemove: () => void
  className?: string
}

export function FileAttachment({ file, onRemove, className }: FileAttachmentProps) {
  if (!file) return null

  // Determinar o ícone com base no tipo de arquivo
  const getFileIcon = () => {
    const fileType = file.type.split("/")[0]

    switch (fileType) {
      case "image":
        return (
          <img
            src={URL.createObjectURL(file) || "/placeholder.svg"}
            alt={file.name}
            className="h-8 w-8 object-cover rounded"
          />
        )
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className={cn("flex items-center gap-2 p-2 border rounded bg-muted/30", className)}>
      {getFileIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={onRemove}>
        <X className="h-4 w-4" />
        <span className="sr-only">Remover arquivo</span>
      </Button>
    </div>
  )
}
