"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"

export default function AdminTicketDebugPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  useEffect(() => {
    // Adicionar um pequeno atraso para garantir que os logs sejam exibidos
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    addLog(`Página carregada com ID: ${params.id}`)

    if (user) {
      addLog(`Usuário: ${user.name || user.email || "Desconhecido"}`)
      addLog(`Função: ${user.role || "Desconhecida"}`)

      if (user.role !== "admin") {
        addLog("Usuário não é admin, redirecionando em 3 segundos...")
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      }
    } else {
      addLog("Aguardando informações do usuário...")
    }

    // Adicionar mais logs de depuração
    addLog(`URL: ${window.location.href}`)
    addLog(`User Agent: ${navigator.userAgent}`)

    // Simular carregamento de dados do ticket
    addLog("Carregando dados do ticket...")
    setTimeout(() => {
      addLog(`Dados do ticket ${params.id} carregados com sucesso`)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.id, user, router])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Depuração do Ticket #{params.id}</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs de Depuração</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-[500px]">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
