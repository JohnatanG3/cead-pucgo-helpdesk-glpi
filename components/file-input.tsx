"use client"

import type React from "react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Paperclip } from "lucide-react"

interface FileInputProps {
  id: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  accept?: string
  multiple?: boolean
  selectedFiles?: File[]
  onRemove?: (index: number) => void
  buttonLabel?: string
  buttonClassName?: string
  buttonIcon?: React.ReactNode
}

export function FileInput({
  id,
  onChange,
  disabled = false,
  accept = "*/*",
  multiple = false,
  selectedFiles = [],
  onRemove,
  buttonLabel = "Selecionar arquivo",
  buttonClassName = "",
  buttonIcon = <Paperclip className="mr-2 h-4 w-4" />,
}: FileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={onChange}
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        className={`${buttonClassName || "bg-cead-blue text-white hover:bg-cead-blue/90"}`}
      >
        {buttonIcon}
        {buttonLabel}
      </Button>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Arquivos selecionados:</p>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<li key={index} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                {onRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remover arquivo</span>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
