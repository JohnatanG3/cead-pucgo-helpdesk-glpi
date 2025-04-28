"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  buttonText?: string
  noFileText?: string
  className?: string
  buttonClassName?: string
  // Adicionando uma prop para receber os arquivos selecionados externamente
  selectedFiles?: File[]
}

export function FileInput({
  onChange,
  buttonText = "Selecionar arquivo",
  noFileText = "Nenhum arquivo selecionado",
  className,
  buttonClassName,
  multiple,
  accept,
  disabled,
  selectedFiles,
  ...props
}: FileInputProps) {
  const [fileNames, setFileNames] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Efeito para atualizar o texto quando os arquivos selecionados mudam externamente
  useEffect(() => {
    if (selectedFiles && selectedFiles.length > 0) {
      const names = selectedFiles.map((file) => file.name).join(", ")
      setFileNames(names)
    } else {
      setFileNames("")
    }
  }, [selectedFiles])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Atualizar o texto exibido com os nomes dos arquivos
      const names = Array.from(e.target.files)
        .map((file) => file.name)
        .join(", ")
      setFileNames(names)
    } else {
      setFileNames("")
    }

    // Chamar o onChange passado como prop
    if (onChange) {
      onChange(e)
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleButtonClick}
          className={cn(
            "bg-cead-blue text-white hover:bg-cead-light-blue",
            disabled && "opacity-50 cursor-not-allowed",
            buttonClassName,
          )}
          disabled={disabled}
        >
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
        <div className="flex-1 text-center text-sm text-muted-foreground border rounded-md p-2 truncate">
          {fileNames || noFileText}
        </div>
      </div>
      <input
        type="file"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        {...props}
      />
    </div>
  )
}
