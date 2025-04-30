"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminTicketDebugPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    addLog(`Página carregada com ID: ${params.id}`)
    addLog(`Status da autenticação: ${status}`)

    if (status === "authenticated") {
      addLog(`Usuário: ${session?.user?.name || "Desconhecido"}`)
      addLog(`Função: ${session?.user?.role || "Desconhecida"}`)
    }

    if (status === "unauthenticated") {
      addLog("Usuário não autenticado, redirecionando...")
      router.push("/")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      addLog("Usuário não é admin, redirecionando...")
      router.push("/dashboard")
    }
  }, [params.id, status, session, router])

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
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-[500px]">
            {logs.map((log, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<div key={index}>{log}</div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
