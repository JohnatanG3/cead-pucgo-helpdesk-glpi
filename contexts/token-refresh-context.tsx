"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useTokenRefresh } from "@/hooks/use-token-refresh"

// Criar o contexto
const TokenRefreshContext = createContext<{ refreshing: boolean }>({
  refreshing: false,
})

// Hook personalizado para usar o contexto
export function useTokenRefreshContext() {
  return useContext(TokenRefreshContext)
}

// Componente provedor
export function TokenRefreshProvider({ children }: { children: ReactNode }) {
  // Usar o hook de renovação de token
  const { session } = useTokenRefresh()

  // Valor do contexto
  const value = {
    refreshing: false, // Podemos adicionar um estado para indicar quando está renovando
  }

  return <TokenRefreshContext.Provider value={value}>{children}</TokenRefreshContext.Provider>
}
