"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Download, Printer, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getTicketStats,
  getResolutionTimeReport,
  getSatisfactionReport,
  getCategories,
  type GLPICategory,
} from "@/lib/glpi-api"
import { useAuth } from "@/contexts/auth-context"
import { AppHeader } from "@/components/app-header"
import { ReportDashboard } from "@/components/reports/report-dashboard"
import { ResolutionTimeReport } from "@/components/reports/resolution-time-report"
import { CategoryDistributionReport } from "@/components/reports/category-distribution-report"
import { UserActivityReport } from "@/components/reports/user-activity-report"
import { ReportLoadingSkeleton } from "@/components/reports/report-loading-skeleton"

export default function ReportsPage() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [categories, setCategories] = useState<GLPICategory[]>([])
  const [stats, setStats] = useState<{
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    byCategory: Record<string, number>
    byAssignedGroup: Record<string, number>
    byAssignedUser: Record<string, number>
  } | null>(null)
  const [resolutionTimeData, setResolutionTimeData] = useState<{
    averageResolutionTime: number
    ticketsByResolutionTime: { id: number; name: string; resolutionTime: number }[]
  } | null>(null)
  const [satisfactionData, setSatisfactionData] = useState<{
    averageSatisfaction: number
    satisfactionByCategory: Record<string, number>
    satisfactionByTechnician: Record<string, number>
  } | null>(null)

  // Filtros para relatório de tempo de resolução
  const [resolutionFilters, setResolutionFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0], // 1 mês atrás
    endDate: new Date().toISOString().split("T")[0], // Hoje
    categoryId: "",
    priorityId: "",
  })

  // Verificar autenticação e permissão
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/")
      } else if (user.role !== "admin") {
        toast.error("Você não tem permissão para acessar esta página.")
        router.push("/dashboard")
      } else {
        // Carregar dados apenas se for admin
        loadReportData()
      }
    }
  }, [user, authLoading, router])

  // Carregar dados de relatório
  async function loadReportData() {
    try {
      setIsLoading(true)

      // Carregar categorias
      const categoriesData = await getCategories()
      setCategories(categoriesData)

      // Carregar estatísticas gerais
      const statsData = await getTicketStats()
      setStats(statsData)

      // Carregar dados de tempo de resolução
      const resolutionData = await getResolutionTimeReport({
        startDate: resolutionFilters.startDate,
        endDate: resolutionFilters.endDate,
        categoryId: resolutionFilters.categoryId ? Number(resolutionFilters.categoryId) : undefined,
        priorityId: resolutionFilters.priorityId ? Number(resolutionFilters.priorityId) : undefined,
      })
      setResolutionTimeData(resolutionData)

      // Carregar dados de satisfação
      const satisfactionData = await getSatisfactionReport()
      setSatisfactionData(satisfactionData)
    } catch (error) {
      console.error("Erro ao carregar dados de relatório:", error)
      toast.error("Não foi possível carregar os dados de relatório.")
    } finally {
      setIsLoading(false)
    }
  }

  // Atualizar relatório de tempo de resolução quando os filtros mudarem
  async function updateResolutionTimeReport() {
    try {
      setIsLoading(true)
      const resolutionData = await getResolutionTimeReport({
        startDate: resolutionFilters.startDate,
        endDate: resolutionFilters.endDate,
        categoryId: resolutionFilters.categoryId ? Number(resolutionFilters.categoryId) : undefined,
        priorityId: resolutionFilters.priorityId ? Number(resolutionFilters.priorityId) : undefined,
      })
      setResolutionTimeData(resolutionData)
    } catch (error) {
      console.error("Erro ao atualizar relatório de tempo de resolução:", error)
      toast.error("Não foi possível atualizar o relatório.")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para exportar dados para CSV
  function exportToCSV(data: any[], filename: string) {
    if (!data.length) return

    // Obter cabeçalhos
    const headers = Object.keys(data[0])

    // Criar conteúdo CSV
    const csvContent =
      headers.join(",") +
      "\n" +
      data
        .map((row) => {
          return headers
            .map((header) => {
              const cell = row[header]
              // Escapar aspas e adicionar aspas se necessário
              return typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell
            })
            .join(",")
        })
        .join("\n")

    // Criar blob e link para download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader isAdmin={true} />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Relatórios e Métricas</h1>
            <p className="text-muted-foreground">Visualize estatísticas e relatórios sobre os chamados do sistema.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="resolution-time">Tempo de Resolução</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="user-activity">Atividade de Usuários</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Suspense fallback={<ReportLoadingSkeleton title="Dashboard" />}>
              <ReportDashboard />
            </Suspense>
          </TabsContent>

          <TabsContent value="resolution-time">
            <Suspense fallback={<ReportLoadingSkeleton title="Tempo de Resolução" />}>
              <ResolutionTimeReport />
            </Suspense>
          </TabsContent>

          <TabsContent value="categories">
            <Suspense fallback={<ReportLoadingSkeleton title="Distribuição por Categorias" />}>
              <CategoryDistributionReport />
            </Suspense>
          </TabsContent>

          <TabsContent value="user-activity">
            <Suspense fallback={<ReportLoadingSkeleton title="Atividade de Usuários" />}>
              <UserActivityReport />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
