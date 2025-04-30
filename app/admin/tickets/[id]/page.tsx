"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

import { getTicket } from "@/lib/glpi-api"
import { useAuth } from "@/contexts/auth-context"
import { AdminTicketDetailContent } from "./admin-ticket-detail-content"

export default function AdminTicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [ticket, setTicket] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeoutOccurred, setTimeoutOccurred] = useState(false)

  // Verificar autenticação e permissão
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    console.log("AdminTicketDetailPage - Verificando autenticação", { user, authLoading })

    if (!authLoading) {
      if (!user) {
        console.log("AdminTicketDetailPage - Usuário não autenticado, redirecionando para login")
        router.push("/")
      } else if (user.role !== "admin") {
        console.log("AdminTicketDetailPage - Usuário não é admin, redirecionando para dashboard")
        toast.error("Você não tem permissão para acessar esta página.")
        router.push("/dashboard")
      } else {
        console.log("AdminTicketDetailPage - Usuário autenticado como admin, carregando ticket")
        loadTicket()
      }
    }
  }, [user, authLoading, router, id])

  // Timeout para evitar carregamento infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Timeout ao carregar ticket")
        setTimeoutOccurred(true)
        setIsLoading(false)
      }
    }, 10000) // 10 segundos de timeout

    return () => clearTimeout(timer)
  }, [isLoading])

  // Carregar dados do ticket
  async function loadTicket() {
    if (!id) return

    try {
      console.log(`AdminTicketDetailPage - Carregando ticket ID: ${id}`)
      setIsLoading(true)
      const ticketId = Array.isArray(id) ? id[0] : id

      // Usar Promise.race para adicionar um timeout
      const ticketData = await Promise.race([
        getTicket(Number(ticketId)),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout ao carregar ticket")), 8000)),
      ])

      if (!ticketData) {
        console.error(`AdminTicketDetailPage - Ticket não encontrado: ${ticketId}`)
        setError("Chamado não encontrado.")
        toast.error("Chamado não encontrado.")
      } else {
        console.log("AdminTicketDetailPage - Ticket carregado com sucesso:", ticketData)
        setTicket(ticketData)
      }
    } catch (error) {
      console.error("AdminTicketDetailPage - Erro ao carregar ticket:", error)
      setError("Erro ao carregar dados do chamado.")
      toast.error("Erro ao carregar dados do chamado.")
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || (isLoading && !timeoutOccurred)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => {
              setIsLoading(false)
              setTimeoutOccurred(true)
            }}
          >
            Forçar carregamento
          </button>
        </div>
      </div>
    )
  }

  if (error || timeoutOccurred) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{timeoutOccurred ? "Tempo limite excedido" : "Erro"}</h2>
          <p className="text-muted-foreground">
            {timeoutOccurred
              ? "O carregamento do chamado demorou muito tempo. Verifique sua conexão ou tente novamente mais tarde."
              : error}
          </p>
          <div className="mt-4 flex gap-4 justify-center">
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Voltar para o Dashboard
            </button>
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button
              onClick={() => {
                setIsLoading(true)
                setTimeoutOccurred(false)
                setError(null)
                loadTicket()
              }}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <AdminTicketDetailContent ticket={ticket} />
}
