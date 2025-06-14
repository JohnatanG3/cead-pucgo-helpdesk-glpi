"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  // Efeito para lidar com a montagem do componente
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Renderiza apenas os filhos sem tema até que o componente seja montado no cliente
  // Isso evita incompatibilidades de hidratação
  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
