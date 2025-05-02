"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  validate?: (value: string) => string | null
  className?: string
  disabled?: boolean
}

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  minLength,
  maxLength,
  pattern,
  validate,
  className,
  disabled = false,
}: FormFieldProps) {
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  // Validar o campo quando o valor mudar e o campo já tiver sido tocado
  useEffect(() => {
    if (!touched) return

    // Validações padrão
    if (required && !value.trim()) {
      setError(`${label} é obrigatório`)
      return
    }

    if (minLength && value.length < minLength) {
      setError(`${label} deve ter pelo menos ${minLength} caracteres`)
      return
    }

    if (maxLength && value.length > maxLength) {
      setError(`${label} deve ter no máximo ${maxLength} caracteres`)
      return
    }

    if (pattern && !new RegExp(pattern).test(value)) {
      setError(`${label} está em formato inválido`)
      return
    }

    // Validação personalizada
    if (validate) {
      const customError = validate(value)
      if (customError) {
        setError(customError)
        return
      }
    }

    setError(null)
  }, [value, touched, label, required, minLength, maxLength, pattern, validate])

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className={error ? "text-destructive" : ""}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        className={error ? "border-destructive" : ""}
        disabled={disabled}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
