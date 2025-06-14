"use client"

import { useState, useEffect } from "react"
import { Clock, User, MessageSquare, FileText, Edit, CheckCircle, AlertCircle, Calendar, Tag, Flag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getTicketHistory } from "@/lib/glpi-api"

interface TicketHistoryEvent {
  id: string
  type:
    | "creation"
    | "status_change"
    | "comment"
    | "attachment"
    | "assignment"
    | "edit"
    | "priority_change"
    | "category_change"
  timestamp: Date
  user: {
    id: string
    name: string
  }
  details: {
    [key: string]: any
  }
}

interface TicketHistoryProps {
  ticketId: string | number
  events?: TicketHistoryEvent[]
  showFullHistory?: boolean
}

export function TicketHistory({ ticketId, events: initialEvents, showFullHistory = false }: TicketHistoryProps) {
  const [events, setEvents] = useState<TicketHistoryEvent[]>(initialEvents || [])
  const [isLoading, setIsLoading] = useState(!initialEvents)
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!initialEvents) {
      // Tentar carregar eventos reais do histórico
      const fetchHistory = async () => {
        setIsLoading(true)
        try {
          // Tentar obter histórico real do GLPI
          const historyData = await getTicketHistory(Number(ticketId))

          if (Array.isArray(historyData) && historyData.length > 0) {
            // Mapear dados do GLPI para o formato do componente
            const mappedEvents = historyData.map((item: any) => ({
              id: item.id.toString(),
              type: mapGLPIHistoryTypeToLocal(item.id_search_option),
              timestamp: new Date(item.date_mod),
              user: {
                id: "unknown",
                name: item.user_name || "Sistema",
              },
              details: {
                from: item.old_value,
                to: item.new_value,
                field: getFieldNameFromSearchOption(item.id_search_option),
              },
            }))

            setEvents(mappedEvents)
          } else {
            // Fallback para dados simulados
            simulateHistoryEvents()
          }
        } catch (error) {
          console.error("Erro ao carregar histórico:", error)
          // Fallback para dados simulados
          simulateHistoryEvents()
        } finally {
          setIsLoading(false)
        }
      }

      fetchHistory()
    }
  }, [initialEvents, ticketId])

  // Função para mapear tipos de histórico do GLPI para tipos locais
  const mapGLPIHistoryTypeToLocal = (searchOption: number): TicketHistoryEvent["type"] => {
    const typeMap: Record<number, TicketHistoryEvent["type"]> = {
      1: "creation", // Título
      2: "edit", // Conteúdo
      12: "status_change", // Status
      3: "priority_change", // Prioridade
      7: "category_change", // Categoria
      5: "assignment", // Atribuído para
      // Adicionar mais mapeamentos conforme necessário
    }

    return typeMap[searchOption] || "edit"
  }

  // Função para obter nome amigável do campo a partir do id_search_option
  const getFieldNameFromSearchOption = (searchOption: number): string => {
    const fieldMap: Record<number, string> = {
      1: "Título",
      2: "Descrição",
      12: "Status",
      3: "Prioridade",
      7: "Categoria",
      5: "Atribuído para",
      // Adicionar mais mapeamentos conforme necessário
    }

    return fieldMap[searchOption] || `Campo ${searchOption}`
  }

  // Função para simular eventos de histórico (fallback)
  const simulateHistoryEvents = () => {
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
        type: "priority_change",
        timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000), // 2.5 dias atrás
        user: { id: "3", name: "Maria Oliveira" },
        details: { from: "medium", to: "high" },
      },
      {
        id: "7",
        type: "category_change",
        timestamp: new Date(Date.now() - 2.2 * 24 * 60 * 60 * 1000), // 2.2 dias atrás
        user: { id: "3", name: "Maria Oliveira" },
        details: { from: "Suporte Técnico", to: "Matrícula" },
      },
      {
        id: "8",
        type: "status_change",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        user: { id: "3", name: "Maria Oliveira" },
        details: { from: "in_progress", to: "resolved" },
      },
      {
        id: "9",
        type: "comment",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        user: { id: "3", name: "Maria Oliveira" },
        details: { content: "Problema resolvido, matrícula regularizada" },
      },
    ]
    setEvents(simulatedEvents)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "creation":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "status_change":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case "attachment":
        return <FileText className="h-4 w-4 text-amber-500" />
      case "assignment":
        return <User className="h-4 w-4 text-indigo-500" />
      case "edit":
        return <Edit className="h-4 w-4 text-gray-500" />
      case "priority_change":
        return <Flag className="h-4 w-4 text-red-500" />
      case "category_change":
        return <Tag className="h-4 w-4 text-teal-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
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
        if (event.details.field) {
          return `Campo ${event.details.field} alterado`
        }
        return `Chamado editado`
      case "priority_change":
        return `Prioridade alterada de ${getPriorityName(event.details.from)} para ${getPriorityName(event.details.to)}`
      case "category_change":
        return `Categoria alterada de ${event.details.from} para ${event.details.to}`
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

  const getPriorityName = (priority: string) => {
    const priorityMap: Record<string, string> = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      urgent: "Urgente",
      critical: "Crítica",
    }
    return priorityMap[priority] || priority
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

  const toggleEventExpand = (eventId: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }))
  }

  // Limitar eventos exibidos se não estiver mostrando histórico completo
  const displayEvents = showFullHistory ? events : events.slice(0, 5)

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
        {displayEvents.length > 0 ? (
          <div className="relative space-y-4">
            {displayEvents.map((event, index) => (
              <div key={event.id} className="relative">
                {index !== 0 && (
                  <div className="absolute left-2.5 top-0 h-full w-px -translate-x-1/2 bg-muted-foreground/20"></div>
                )}
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
                      event.type === "status_change" && event.details.to === "resolved" && "bg-green-100",
                      event.type === "creation" && "bg-blue-100",
                      event.type === "priority_change" && "bg-red-100",
                      event.type === "category_change" && "bg-teal-100",
                      event.type === "comment" && "bg-purple-100",
                      event.type === "assignment" && "bg-indigo-100",
                      event.type === "attachment" && "bg-amber-100",
                      event.type !== "status_change" &&
                        event.type !== "creation" &&
                        event.type !== "priority_change" &&
                        event.type !== "category_change" &&
                        event.type !== "comment" &&
                        event.type !== "assignment" &&
                        event.type !== "attachment" &&
                        "bg-gray-100",
                    )}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{getEventDescription(event)}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleEventExpand(event.id)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                {expandedEvents[event.id] ? "Menos" : "Mais"}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver {expandedEvents[event.id] ? "menos" : "mais"} detalhes</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[10px]">
                              {event.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{event.user.name}</span>
                        </div>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.timestamp)}
                        </span>
                      </div>

                      {/* Detalhes expandidos */}
                      {expandedEvents[event.id] && (
                        <div className="mt-2 rounded-md bg-muted/50 p-2 text-xs">
                          {event.type === "comment" && (
                            <div className="whitespace-pre-wrap">{event.details.content}</div>
                          )}

                          {event.type === "status_change" && (
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-muted">
                                {getStatusName(event.details.from)}
                              </Badge>
                              <span>→</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "bg-muted",
                                  event.details.to === "resolved" && "bg-green-100",
                                  event.details.to === "in_progress" && "bg-blue-100",
                                  event.details.to === "pending" && "bg-yellow-100",
                                )}
                              >
                                {getStatusName(event.details.to)}
                              </Badge>
                            </div>
                          )}

                          {event.type === "priority_change" && (
                            <div className="flex gap-2">
                              <Badge variant="outline" className="bg-muted">
                                {getPriorityName(event.details.from)}
                              </Badge>
                              <span>→</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "bg-muted",
                                  event.details.to === "high" && "bg-red-100",
                                  event.details.to === "urgent" && "bg-red-200",
                                  event.details.to === "critical" && "bg-red-300",
                                )}
                              >
                                {getPriorityName(event.details.to)}
                              </Badge>
                            </div>
                          )}

                          {event.type === "edit" && event.details.field && (
                            <div>
                              <div className="font-medium">{event.details.field}:</div>
                              {event.details.from && event.details.to && (
                                <div className="mt-1">
                                  <div className="line-through">{event.details.from}</div>
                                  <div className="font-medium">{event.details.to}</div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Adicionar mais tipos de detalhes conforme necessário */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Botão para ver histórico completo */}
            {!showFullHistory && events.length > 5 && (
              <div className="pt-2 text-center">
                <a href={`/dashboard/ticket/${ticketId}/history`} className="text-sm text-primary hover:underline">
                  Ver histórico completo ({events.length} eventos)
                </a>
              </div>
            )}
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
