"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Paperclip, Send, X } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  getTicket,
  getTicketFollowups,
  addTicketFollowup,
  uploadDocument,
  linkDocumentToTicket,
  getUser,
  getGroups,
  mapGLPIStatusToString,
  mapGLPIPriorityToString,
  type GLPITicket,
  type GLPITicketFollowup,
  type GLPIUser,
  type GLPIGroup,
} from "@/lib/glpi-api"
import { useAuth } from "@/contexts/auth-context"

// Importe o novo componente
import { FileInput } from "@/components/file-input"

export default function TicketDetailContent({ ticketId }: { ticketId: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const numericTicketId = Number.parseInt(ticketId)

  const [ticket, setTicket] = useState<GLPITicket | null>(null)
  const [followups, setFollowups] = useState<Array<GLPITicketFollowup & { user?: GLPIUser }>>([])
  const [assignedUser, setAssignedUser] = useState<GLPIUser | null>(null)
  const [assignedGroup, setAssignedGroup] = useState<GLPIGroup | null>(null)
  const [newComment, setNewComment] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Verificar autenticação
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    loadTicketData()
  }, [user, router, numericTicketId])

  // Carregar dados do ticket
  async function loadTicketData() {
    try {
      const ticketData = await getTicket(numericTicketId)
      setTicket(ticketData)

      // Carregar informações de atribuição
      if (ticketData.users_id_assign) {
        try {
          const userData = await getUser(ticketData.users_id_assign)
          setAssignedUser(userData)
        } catch (error) {
          console.error("Erro ao carregar usuário atribuído:", error)
        }
      }

      if (ticketData.groups_id_assign) {
        try {
          const groupsData = await getGroups()
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          const group = groupsData.find((g: any) => g.id === ticketData.groups_id_assign)
          if (group) {
            setAssignedGroup(group)
          }
        } catch (error) {
          console.error("Erro ao carregar grupo atribuído:", error)
        }
      }

      // Carregar followups
      try {
        const followupsData = await getTicketFollowups(numericTicketId)

        // Verificar se followupsData é um array antes de chamar .map()
        if (Array.isArray(followupsData)) {
          // Para cada followup, carregar informações do usuário
          const followupsWithUsers = await Promise.all(
            followupsData.map(async (followup: GLPITicketFollowup) => {
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
        } else {
          console.error("followupsData não é um array:", followupsData)
          setFollowups([])
        }
      } catch (error) {
        console.error("Erro ao carregar followups:", error)
        setFollowups([])
      }
    } catch (error) {
      console.error("Erro ao carregar dados do ticket:", error)
      toast.error("Não foi possível carregar os detalhes do chamado.")
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar se a funcionalidade de resposta está implementada corretamente
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Adicionar followup
      const followupResult = await addTicketFollowup(
        numericTicketId,
        newComment,
        user?.id ? Number.parseInt(user.id) : 1, // ID do usuário atual
      )

      // Se tiver arquivo, fazer upload e vincular ao ticket
      if (file) {
        try {
          // Upload do documento
          const document = await uploadDocument(file, user?.id ? Number.parseInt(user.id) : 1)

          // Vincular documento ao ticket
          await linkDocumentToTicket(document.id, numericTicketId)

          toast.success("Arquivo anexado com sucesso!")
        } catch (uploadError) {
          console.error("Erro ao fazer upload do arquivo:", uploadError)
          toast.error("Não foi possível anexar o arquivo, mas o comentário foi adicionado.")
        }
      }

      toast.success("Seu comentário foi adicionado com sucesso.")

      // Limpar formulário
      setNewComment("")
      setFile(null)

      // Recarregar followups
      const followupsData = await getTicketFollowups(numericTicketId)

      // Verificar se followupsData é um array antes de chamar .map()
      if (Array.isArray(followupsData)) {
        const followupsWithUsers = await Promise.all(
          followupsData.map(async (followup: GLPITicketFollowup) => {
            try {
              const userData = await getUser(followup.users_id)
              return { ...followup, user: userData }
            } catch (error) {
              return followup
            }
          }),
        )
        setFollowups(followupsWithUsers)
      } else {
        console.error("followupsData não é um array:", followupsData)
        setFollowups([])
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error)
      toast.error("Não foi possível adicionar o comentário. Tente novamente mais tarde.")
    } finally {
      setIsSubmitting(false)
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

  // Função para mapear prioridade do GLPI para componente Badge
  const getPriorityBadge = (priority: number) => {
    const priorityString = mapGLPIPriorityToString(priority)

    switch (priorityString) {
      case "low":
        return <Badge variant="outline">Baixa</Badge>
      case "medium":
        return <Badge>Média</Badge>
      case "high":
        return <Badge variant="destructive">Alta</Badge>
      case "urgent":
      case "critical":
        return <Badge variant="destructive">Urgente</Badge>
      default:
        return <Badge variant="outline">Baixa</Badge>
    }
  }

  if (isLoading) {
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
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
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
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <ArrowLeft className="h-5 w-5" />
            Voltar para Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Chamado #{ticket.id}: {ticket.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="outline">Categoria {ticket.itilcategories_id}</Badge>
              {getPriorityBadge(ticket.priority)}
              {getStatusBadge(ticket.status)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Aberto em {formatDate(ticket.date_creation)}</p>

            {/* Mostrar informações de atribuição */}
            {(assignedUser || assignedGroup) && (
              <div className="mt-2">
                <p className="text-sm">
                  <span className="font-medium">Atribuído a: </span>
                  {assignedUser ? (
                    <span>{assignedUser.name}</span>
                  ) : assignedGroup ? (
                    <span>Grupo {assignedGroup.name}</span>
                  ) : (
                    <span>Não atribuído</span>
                  )}
                </p>
              </div>
            )}
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Descrição do Problema</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{ticket.content}</p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Histórico de Comunicação</CardTitle>
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
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={followup.user?.name || "Usuário"} />
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
                <div className="text-center py-6 text-muted-foreground">Nenhuma comunicação registrada.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adicionar Comentário</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmitComment}>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Digite seu comentário ou dúvida adicional..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
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
                  <p className="text-xs text-muted-foreground">Formatos aceitos: PDF, DOC, DOCX, JPG, PNG (máx. 5MB)</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="default" disabled={isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Enviando..." : "Enviar Comentário"}
                </Button>
              </CardFooter>
            </form>
          </Card>
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
