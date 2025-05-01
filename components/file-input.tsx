"use client"

import type React from "react"

import { Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface FileInputProps {
  id: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  accept?: string
  multiple?: boolean
  buttonText?: string
  selectedFiles?: File[]
  onRemove?: (index: number) => void
}

export function FileInput({
  id,
  onChange,
  disabled = false,
  accept = "*/*", // Aceitar qualquer tipo de arquivo por padrão
  multiple = false,
  buttonText = "Selecionar arquivo",
  selectedFiles = [],
  onRemove,
}: FileInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="default" // Botão azul como na versão anterior
          size="sm"
          onClick={() => document.getElementById(id)?.click()}
          disabled={disabled}
        >
          <Paperclip className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
        <input
          type="file"
          id={id}
          onChange={onChange}
          disabled={disabled}
          accept={accept}
          multiple={multiple}
          className="hidden"
        />
      </div>
    </div>
  )
}
