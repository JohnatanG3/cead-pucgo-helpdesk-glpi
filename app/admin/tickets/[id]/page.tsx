"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ArrowLeft, Paperclip, X } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  getTicket,
  getTicketFollowups,
  addTicketFollowup,
  updateTicket,
  uploadDocument,
  linkDocumentToTicket,
  getUser,
  mapGLPIStatusToString,
  mapGLPIPriorityToString,
  mapStringToGLPIStatus,
  mapStringToGLPIPriority,
  type GLPITicket,
  type GLPITicketFollowup,
  type GLPIUser,
} from "@/lib/glpi-api"

// Importe o novo componente
import { FileInput } from "@/components/file-input"

export default function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const ticketId = Number.parseInt(params.id)

  const [ticket, setTicket] = useState<GLPITicket | null>(null)
  const [followups, setFollowups] = useState<Array<GLPITicketFollowup & { user?: GLPIUser }>>([])
  const [newResponse, setNewResponse] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Estado para os campos editáveis
  const [ticketStatus, setTicketStatus] = useState("")
  const [ticketPriority, setTicketPriority] = useState("")
  const [assignedTo, setAssignedTo] = useState("none")

  // Dados simulados do solicitante (em um sistema real, seriam obtidos da API)
  const requester = {
    name: "Carregando...",
    email: "Carregando...",
    department: "Carregando...",
    openTickets: 0,
  }

  // Verificar autenticação e permissão
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      toast.error("Você não tem permissão para acessar esta página.")
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Carregar dados do ticket
  useEffect(() => {
    async function loadTicketData() {
      try {
        const ticketData = await getTicket(ticketId)
        setTicket(ticketData)

        // Definir os estados iniciais com base no ticket
        setTicketStatus(mapGLPIStatusToString(ticketData.status))
        setTicketPriority(mapGLPIPriorityToString(ticketData.priority))

        // Carregar followups
        const followupsData = await getTicketFollowups(ticketId)

        // Para cada followup, carregar informações do usuário
        const followupsWithUsers = await Promise.all(
          followupsData.map(async (followup) => {
            try {
              const userData = await getUser(followup.users_id)
              return { ...followup, user: userData }
            } catch (error) {
              console.error(`Erro ao carregar usuário ${followup.users_id}:`, error)
              return followup
            }
          }),
        )

        setFollowups(followupsWithUsers)
      } catch (error) {
        console.error("Erro ao carregar dados do ticket:", error)
        toast.error("Não foi possível carregar os detalhes do chamado.")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated" && session?.user?.role === "admin" && ticketId) {
      loadTicketData()
    }
  }, [status, session, ticketId])

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Adicionar followup
      const followupResult = await addTicketFollowup(
        ticketId,
        newResponse,
        1, // ID do usuário atual (em um sistema real, seria obtido da sessão)
      )

      // Se tiver arquivo, fazer upload e vincular ao ticket
      if (file) {
        try {
          // Upload do documento
          const document = await uploadDocument(file, 1) // 1 é o ID do usuário atual (simulado)

          // Vincular documento ao ticket
          await linkDocumentToTicket(document.id, ticketId)

          toast.success("Arquivo anexado com sucesso!")
        } catch (uploadError) {
          console.error("Erro ao fazer upload do arquivo:", uploadError)
          toast.error("Não foi possível anexar o arquivo, mas a resposta foi enviada.")
        }
      }

      toast.success("Sua resposta foi enviada com sucesso.")

      // Limpar formulário
      setNewResponse("")
      setFile(null)

      // Recarregar followups
      const followupsData = await getTicketFollowups(ticketId)
      const followupsWithUsers = await Promise.all(
        followupsData.map(async (followup) => {
          try {
            const userData = await getUser(followup.users_id)
            return { ...followup, user: userData }
          } catch (error) {
            return followup
          }
        }),
      )
      setFollowups(followupsWithUsers)
    } catch (error) {
      console.error("Erro ao enviar resposta:", error)
      toast.error("Não foi possível enviar a resposta. Tente novamente mais tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveChanges = async () => {
    if (!ticket) return

    setIsSaving(true)

    try {
      // Mapear os valores para o formato do GLPI
      const updatedTicket: Partial<GLPITicket> = {
        status: mapStringToGLPIStatus(ticketStatus),
        priority: mapStringToGLPIPriority(ticketPriority),
        // Em um sistema real, você também atualizaria o campo de atribuição
      }

      await updateTicket(ticketId, updatedTicket)

      toast.success("As alterações no chamado foram salvas com sucesso.")

      // Atualizar o ticket local
      setTicket({
        ...ticket,
        ...updatedTicket,
      })
    } catch (error) {
      console.error("Erro ao salvar alterações:", error)
      toast.error("Não foi possível salvar as alterações. Tente novamente mais tarde.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // biome-ignore lint/complexity/useOptionalChain: <explanation>
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Função para mapear status do GLPI para componente Badge
  const getStatusBadge = (status: number) => {
    const statusString = mapGLPIStatusToString(status)

    switch (statusString) {
      case "new":
      case "pending":
        return <span className="status-badge status-pending">Pendente</span>
      case "in_progress":
        return <span className="status-badge status-in-progress">Em andamento</span>
      case "resolved":
      case "closed":
        return <span className="status-badge status-completed">Concluído</span>
      default:
        return <span className="status-badge status-pending">Pendente</span>
    }
  }

  if (status === "loading" || (isLoading && status === "authenticated")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold">Chamado não encontrado</p>
          <p className="mt-2 text-muted-foreground">
            O chamado solicitado não existe ou você não tem permissão para acessá-lo.
          </p>
          <Button className="mt-4" onClick={() => router.push("/admin")}>
            Voltar para Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <ArrowLeft className="h-5 w-5" />
            Voltar para Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Chamado #{ticket.id}: {ticket.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline">Categoria {ticket.itilcategories_id}</Badge>
              <Badge variant={ticketPriority === "high" || ticketPriority === "urgent" ? "destructive" : "outline"}>
                {ticketPriority === "low"
                  ? "Baixa"
                  : ticketPriority === "medium"
                    ? "Média"
                    : ticketPriority === "high"
                      ? "Alta"
                      : "Urgente"}
              </Badge>
              <Badge variant={ticketStatus === "in_progress" ? "default" : "outline"}>
                {ticketStatus === "new" || ticketStatus === "pending"
                  ? "Pendente"
                  : ticketStatus === "in_progress"
                    ? "Em andamento"
                    : "Resolvido"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Aberto por Usuário #{ticket.users_id_recipient} em {formatDate(ticket.date_creation)}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{ticket.content}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Interações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {followups.length > 0 ? (
                    followups.map((followup) => (
                      <div
                        key={followup.id}
                        className={`p-3 border rounded-lg ${followup.users_id !== ticket.users_id_recipient ? "bg-muted/50" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src="/placeholder.svg?height=32&width=32"
                              alt={followup.user?.name || "Usuário"}
                            />
                            <AvatarFallback>{followup.user?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {followup.user?.name || `Usuário #${followup.users_id}`}
                              {followup.users_id !== ticket.users_id_recipient && (
                                <span className="ml-2 text-xs text-muted-foreground">(Atendente)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(followup.date_creation)}</p>
                          </div>
                        </div>
                        <p className="mt-2">{followup.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">Nenhuma interação registrada.</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Responder</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmitResponse}>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Digite sua resposta..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      required
                      rows={4}
                      disabled={isSubmitting}
                    />
                    {/* Substitua o input de arquivo existente por: */}
                    <div className="space-y-2">
                      <FileInput
                        id="attachment"
                        onChange={handleFileChange}
                        disabled={isSubmitting}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        buttonText="Anexar arquivo"
                        selectedFiles={file ? [file] : []} // Convertendo o único arquivo em um array
                      />
                      {file && (
                        <div className="flex items-center gap-2 p-2 border rounded">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-6 w-6 p-0"
                            onClick={() => setFile(null)}
                          >
                            <span className="sr-only">Remover</span>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 5MB)
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                    <div className="flex gap-2">
                      <Button type="button" variant="secondary">
                        Salvar Rascunho
                      </Button>
                      <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando..." : "Enviar Resposta"}
                      </Button>
                    </div>
                  </CardFooter>
                </form>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Chamado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Select value={ticketStatus} onValueChange={setTicketStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Novo</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em andamento</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Prioridade:</span>
                    <Select value={ticketPriority} onValueChange={setTicketPriority}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Atribuído a:</span>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Atribuir para" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carlos">Carlos Santos</SelectItem>
                        <SelectItem value="ana">Ana Oliveira</SelectItem>
                        <SelectItem value="paulo">Paulo Mendes</SelectItem>
                        <SelectItem value="none">Não atribuído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-2">Informações do Solicitante</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">ID:</span> {ticket.users_id_recipient}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {requester.email}
                      </p>
                      <p>
                        <span className="font-medium">Departamento:</span> {requester.department}
                      </p>
                      <p>
                        <span className="font-medium">Chamados abertos:</span> {requester.openTickets}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveChanges} className="w-full" disabled={isSaving}>
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Exportar Chamado
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Agendar Acompanhamento
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Duplicar Chamado
                  </Button>
                  <Separator />
                  <Button variant="destructive" className="w-full justify-start">
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Arquivar Chamado
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CEAD - Coordenação de Educação a Distância - PUC GO. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
