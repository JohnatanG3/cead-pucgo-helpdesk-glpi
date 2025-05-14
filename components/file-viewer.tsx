"use client"

import { useState } from "react"
import {
  File,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  FileIcon as FilePdf,
  FileCode,
  FileArchive,
  FileAudio,
  FileVideo,
  X,
  Download,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface FileViewerProps {
  file: {
    id: string | number
    name: string
    url: string
    mime: string
    size?: number
  }
  onDelete?: (id: string | number) => void
  isReadOnly?: boolean
  className?: string
}

export function FileViewer({ file, onDelete, isReadOnly = false, className }: FileViewerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getFileIcon = () => {
    const mime = file.mime.toLowerCase()

    if (mime.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (mime === "application/pdf") {
      return <FilePdf className="h-5 w-5" />
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv")) {
      return <FileSpreadsheet className="h-5 w-5" />
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (mime.includes("zip") || mime.includes("rar") || mime.includes("tar") || mime.includes("compressed")) {
      return <FileArchive className="h-5 w-5" />
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (mime.startsWith("audio/")) {
      return <FileAudio className="h-5 w-5" />
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (mime.startsWith("video/")) {
      return <FileVideo className="h-5 w-5" />
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (mime.includes("code") || mime.includes("javascript") || mime.includes("html") || mime.includes("css")) {
      return <FileCode className="h-5 w-5" />
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (mime.includes("text/")) {
      return <FileText className="h-5 w-5" />
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      return <File className="h-5 w-5" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Tamanho desconhecido"

    const units = ["B", "KB", "MB", "GB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const isViewable = () => {
    const mime = file.mime.toLowerCase()
    return mime.startsWith("image/") || mime === "application/pdf"
  }

  const renderFilePreview = () => {
    const mime = file.mime.toLowerCase()

    if (mime.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center p-4">
          <img
            src={file.url || "/placeholder.svg"}
            alt={file.name}
            className="max-h-[70vh] max-w-full object-contain"
          />
        </div>
      )
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else if (mime === "application/pdf") {
      return <iframe src={`${file.url}#toolbar=0`} className="h-[70vh] w-full" title={file.name} />
    // biome-ignore lint/style/noUselessElse: <explanation>
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 text-6xl text-muted-foreground">{getFileIcon()}</div>
          <p className="mb-2 text-lg font-medium">{file.name}</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Este tipo de arquivo não pode ser visualizado diretamente.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <a href={file.url} download={file.name}>
                <Download className="mr-2 h-4 w-4" />
                Baixar
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir
              </a>
            </Button>
          </div>
        </div>
      )
    }
  }

  return (
    <>
      <div className={cn("group flex items-center justify-between rounded-md border p-2 hover:bg-muted/50", className)}>
        <div className="flex items-center gap-2">
          {getFileIcon()}
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isViewable() && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(true)}>
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Visualizar</span>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
            <a href={file.url} download={file.name}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Baixar</span>
            </a>
          </Button>
          {!isReadOnly && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={() => onDelete(file.id)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getFileIcon()}
              <span className="truncate">{file.name}</span>
            </DialogTitle>
          </DialogHeader>
          {renderFilePreview()}
        </DialogContent>
      </Dialog>
    </>
  )
}
