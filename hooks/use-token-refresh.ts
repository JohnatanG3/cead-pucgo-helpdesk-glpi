"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useRef } from "react"

/**
 * Hook para gerenciar a renovação automática de token
 * Monitora a sessão e força um refresh quando o token está prestes a expirar
 */
export function useTokenRefresh() {
  const { data: session, update } = useSession()
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Limpar timeout anterior se existir
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }

    // Se não houver sessão, não fazer nada
    if (!session) return

    // Verificar se há erro na sessão
    if (session.error === "RefreshAccessTokenError") {
      console.error("Erro ao renovar token, fazendo logout...")
      signOut({ callbackUrl: "/?error=session_expired" })
      return
    }

    // Calcular quando o token expira
    const expiresAt = session.expires ? new Date(session.expires).getTime() : null

    if (expiresAt) {
      // Calcular tempo até a expiração (em ms)
      const timeUntilExpiry = expiresAt - Date.now()

      // Se o token já expirou, fazer logout
      if (timeUntilExpiry <= 0) {
        console.error("Token expirado, fazendo logout...")
        signOut({ callbackUrl: "/?error=session_expired" })
        return
      }

      // Definir timeout para atualizar a sessão 1 minuto antes da expiração
      const refreshTime = Math.max(0, timeUntilExpiry - 60 * 1000)

      console.log(`Token expira em ${Math.round(timeUntilExpiry / 1000 / 60)} minutos, 
                  agendando refresh para ${Math.round(refreshTime / 1000 / 60)} minutos`)

      refreshTimeoutRef.current = setTimeout(async () => {
        console.log("Atualizando sessão...")
        await update() // Força o NextAuth a verificar e atualizar a sessão
      }, refreshTime)
    }

    // Cleanup ao desmontar
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [session, update])

  return { session }
}
