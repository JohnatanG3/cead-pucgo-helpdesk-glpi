"use client"

import * as React from "react"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

// Definir interfaces para as props
interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

interface RadioGroupItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  id?: string
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    // Criar um contexto para passar o valor e a função de mudança para os itens
    const contextValue = React.useMemo(() => ({ value, onValueChange }), [value, onValueChange])

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div ref={ref} className={cn("grid gap-2", className)} {...props} role="radiogroup">
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  },
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLDivElement, RadioGroupItemProps>(
  ({ className, value, id, children, ...props }, ref) => {
    // Usar o contexto para acessar o valor atual e a função de mudança
    const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext)

    // Determinar se este item está selecionado
    const isSelected = selectedValue === value

    // Função para lidar com o clique no item
    const handleClick = () => {
      if (onValueChange) {
        onValueChange(value)
      }
    }

    return (
      <div ref={ref} className={cn("flex items-center space-x-2", className)} onClick={handleClick} {...props}>
        {/* biome-ignore lint/a11y/useFocusableInteractive: <explanation> */}
        <div
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isSelected && "bg-cead-blue border-cead-blue", // Usar a cor azul CEAD quando selecionado
          )}
          // biome-ignore lint/a11y/useSemanticElements: <explanation>
          role="radio"
          aria-checked={isSelected}
          id={id}
        >
          {isSelected && (
            <div className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-current text-white" />
            </div>
          )}
        </div>
        {children}
      </div>
    )
  },
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
