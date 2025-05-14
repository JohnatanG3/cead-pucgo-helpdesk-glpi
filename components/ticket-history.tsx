"use client"

import { useState, useEffect } from "react"
import { Clock, User, MessageSquare, FileText, Edit, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TicketHistoryEvent {
  id: string
  type: "creation" | "status_change" | "comment" | "attachment" | "assignment" | "edit"
  timestamp: Date
  user: {
    id: string
    name: string
  }
  details: {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any
  }
}

interface TicketHistoryProps {
  ticketId: string | number
  events?: TicketHistoryEvent[]
}

export function TicketHistory({ ticketId, events: initialEvents }: TicketHistoryProps) {
  const [events, setEvents] = useState<TicketHistoryEvent[]>(initialEvents || [])
  const [isLoading, setIsLoading] = useState(!initialEvents)

  useEffect(() => {
    if (!initialEvents) {
      // Simular carregamento de eventos do histórico
      setIsLoading(true)
      setTimeout(() => {
        // Dados simulados para demonstração
        const simulatedEvents: TicketHistoryEvent[] = [
          {
            id: "1",
            type: "creation",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
            user: { id: "1", name: "João Silva" },
            details: { title: "Problema com matrícula" },
          },
          {
            id: "2",
            type: "assignment",
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 dias atrás
            user: { id: "2", name: "Admin" },
            details: { assignedTo: "Maria Oliveira" },
          },
          {
            id: "3",
            type: "status_change",
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
            user: { id: "3", name: "Maria Oliveira" },
            details: { from: "new", to: "in_progress" },
          },
          {
            id: "4",
            type: "comment",
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias atrás
            user: { id: "3", name: "Maria Oliveira" },
            details: { content: "Estou analisando o problema" },
          },
          {
            id: "5",
            type: "attachment",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
            user: { id: "1", name: "João Silva" },
            details: { fileName: "comprovante.pdf" },
          },
          {
            id: "6",
            type: "status_change",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
            user: { id: "3", name: "Maria Oliveira" },
            details: { from: "in_progress", to: "resolved" },
          },
          {
            id: "7",
            type: "comment",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
            user: { id: "3", name: "Maria Oliveira" },
            details: { content: "Problema resolvido, matrícula regularizada" },
          },
        ]
        setEvents(simulatedEvents)
        setIsLoading(false)
      }, 1000)
    }
  }, [initialEvents])

  const getEventIcon = (type: string) => {
    switch (type) {
      case "creation":
        return <FileText className="h-4 w-4" />
      case "status_change":
        return <CheckCircle className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      case "attachment":
        return <FileText className="h-4 w-4" />
      case "assignment":
        return <User className="h-4 w-4" />
      case "edit":
        return <Edit className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getEventDescription = (event: TicketHistoryEvent) => {
    switch (event.type) {
      case "creation":
        return `Chamado criado: "${event.details.title}"`
      case "status_change":
        return `Status alterado de ${getStatusName(event.details.from)} para ${getStatusName(event.details.to)}`
      case "comment":
        return `Comentário: "${event.details.content.substring(0, 50)}${
          event.details.content.length > 50 ? "..." : ""
        }"`
      case "attachment":
        return `Arquivo anexado: ${event.details.fileName}`
      case "assignment":
        return `Atribuído para ${event.details.assignedTo}`
      case "edit":
        return "Chamado editado"
      default:
        return "Evento desconhecido"
    }
  }

  const getStatusName = (status: string) => {
    const statusMap: Record<string, string> = {
      new: "Novo",
      pending: "Pendente",
      in_progress: "Em andamento",
      resolved: "Resolvido",
      closed: "Fechado",
      rejected: "Rejeitado",
    }
    return statusMap[status] || status
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico do Chamado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Carregando histórico...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Histórico do Chamado
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <div className="relative space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="relative">
                {index !== 0 && (
                  // biome-ignore lint/style/useSelfClosingElements: <explanation>
<div className="absolute left-2.5 top-0 h-full w-px -translate-x-1/2 bg-muted-foreground/20"></div>
                )}
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
                      event.type === "status_change" && event.details.to === "resolved" && "bg-green-100",
                      event.type === "creation" && "bg-blue-100",
                      event.type !== "status_change" && event.type !== "creation" && "bg-gray-100",
                    )}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">{getEventDescription(event)}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{event.user.name}</span>
                        <span>•</span>
                        <span>{formatDate(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Nenhum histórico disponível para este chamado.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
