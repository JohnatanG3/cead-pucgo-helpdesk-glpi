"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationRule {
  id: string
  message: string
  validate: (value: string) => boolean
}

interface RealTimeValidationProps {
  value: string
  rules: ValidationRule[]
  showValid?: boolean
  className?: string
}

export function RealTimeValidation({ value, rules, showValid = true, className }: RealTimeValidationProps) {
  const [validations, setValidations] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const newValidations: Record<string, boolean> = {}

    // biome-ignore lint/complexity/noForEach: <explanation>
    rules.forEach((rule) => {
      newValidations[rule.id] = rule.validate(value)
    })

    setValidations(newValidations)
  }, [value, rules])

  return (
    <div className={cn("mt-2 text-sm", className)}>
      {rules.map((rule) => {
        const isValid = validations[rule.id]

        // Se o campo estiver vazio, não mostrar validação
        if (value === "" && !showValid) return null

        // Se a regra for válida e não quisermos mostrar validações válidas, pular
        if (isValid && !showValid) return null

        return (
          <div
            key={rule.id}
            className={cn("flex items-center gap-2 mb-1", isValid ? "text-green-600" : "text-red-500")}
          >
            {isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{rule.message}</span>
          </div>
        )
      })}
    </div>
  )
}
