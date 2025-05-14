"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTicketStats } from "@/lib/glpi-api"
import { LoadingSpinner } from "@/components/loading-spinner"

interface MetricsDashboardProps {
  className?: string
}

export function MetricsDashboard({ className }: MetricsDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [stats, setStats] = useState<any>(null)
  const [timeRange, setTimeRange] = useState("month")

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Carregar estatísticas gerais
        const statsData = await getTicketStats()
        setStats(statsData)
      } catch (error) {
        console.error("Erro ao carregar dados de métricas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [timeRange])

  const formatStatusData = () => {
    if (!stats) return []

    return Object.entries(stats.byStatus || {}).map(([status, count]) => ({
      name: getStatusName(status),
      value: count as number,
    }))
  }

  const formatPriorityData = () => {
    if (!stats) return []

    return Object.entries(stats.byPriority || {}).map(([priority, count]) => ({
      name: getPriorityName(priority),
      value: count as number,
    }))
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
    }
    return priorityMap[priority] || priority
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Métricas do Sistema</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent className="flex h-80 items-center justify-center">
          <LoadingSpinner size="lg" text="Carregando métricas..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Métricas do Sistema</CardTitle>
            <CardDescription>Análise de desempenho e estatísticas</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="priority">Prioridade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Chamados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Em Aberto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(stats?.byStatus?.new || 0) +
                      (stats?.byStatus?.pending || 0) +
                      (stats?.byStatus?.in_progress || 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.byStatus?.resolved || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio de Resolução</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.averageResolutionTime ? `${stats.averageResolutionTime.toFixed(1)}h` : "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumo visual simplificado */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chamados por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formatStatusData().map((item, index) => (
                      <div key={`status-${item.name}`} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getStatusColor(item.name) }}
                          ></div>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chamados por Prioridade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {formatPriorityData().map((item) => (
                      <div key={`priority-${item.name}`} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: getPriorityColor(item.name) }}
                          ></div>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Análise detalhada dos chamados por status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formatStatusData().map((item) => (
                    <div key={`status-detail-${item.name}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span>{item.name}</span>
                        <span className="font-medium">
                          {item.value} chamados ({calculatePercentage(item.value, stats?.total)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${calculatePercentage(item.value, stats?.total)}%`,
                            backgroundColor: getStatusColor(item.name),
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="priority">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Prioridade</CardTitle>
                <CardDescription>Análise detalhada dos chamados por prioridade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formatPriorityData().map((item) => (
                    <div key={`priority-detail-${item.name}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span>{item.name}</span>
                        <span className="font-medium">
                          {item.value} chamados ({calculatePercentage(item.value, stats?.total)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${calculatePercentage(item.value, stats?.total)}%`,
                            backgroundColor: getPriorityColor(item.name),
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Funções auxiliares para cores
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Novo: "#3b82f6", // blue
    Pendente: "#f59e0b", // amber
    "Em andamento": "#8b5cf6", // violet
    Resolvido: "#10b981", // emerald
    Fechado: "#6b7280", // gray
    Rejeitado: "#ef4444", // red
  }
  return colors[status] || "#6b7280"
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    Baixa: "#22c55e", // green
    Média: "#f59e0b", // amber
    Alta: "#f97316", // orange
    Urgente: "#ef4444", // red
  }
  return colors[priority] || "#6b7280"
}

function calculatePercentage(value: number, total?: number): number {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}
