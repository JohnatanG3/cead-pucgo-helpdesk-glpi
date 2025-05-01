"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, Clock, FileText, MessageSquare, User } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileInput } from "@/components/file-input"
import { PriorityIndicator } from "@/components/priority-indicator"
import { RichTextEditor } from "@/components/rich-text-editor"
import {
  addTicketFollowup,
  getTicketFollowups,
  updateTicket,
  uploadDocument,
  linkDocumentToTicket,
} from "@/lib/glpi-api"
import { useAuth } from "@/contexts/auth-context"

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function AdminTicketDetailContent({ ticket }: { ticket: any }) {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [followups, setFollowups] = useState<any[]>([])
  const [isLoadingFollowups, setIsLoadingFollowups] = useState(true)
  const [responseContent, setResponseContent] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status || 1)
  const [selectedPriority, setSelectedPriority] = useState(ticket?.priority || 3)

  // Carregar followups ao montar o componente
  useState(() => {
    if (ticket?.id) {
      loadFollowups()
    }
  })

  // Carregar followups do ticket
  async function loadFollowups() {
    try {
      setIsLoadingFollowups(true)
      const followupsData = await getTicketFollowups(ticket.id)
      setFollowups(followupsData)
    } catch (error) {
      console.error("Erro ao carregar followups:", error)
      toast.error("Não foi possível carregar as respostas do chamado.")
    } finally {
      setIsLoadingFollowups(false)
    }
  }

  // Enviar resposta
  async function handleSubmitResponse() {
    if (!responseContent.trim()) {
      toast.error("Por favor, digite uma resposta.")
      return
    }

    try {
      setIsSubmitting(true)

      // Adicionar followup
      await addTicketFollowup({
        tickets_id: ticket.id,
        content: responseContent,
        is_private: 0, // Público
      })

      // Fazer upload de cada arquivo, se houver
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            const document = await uploadDocument(file, user?.id ? Number.parseInt(user.id) : 1)
            await linkDocumentToTicket(document.id, ticket.id)
          } catch (error) {
            console.error("Erro ao fazer upload do arquivo:", error)
          }
        }
      }

      // Atualizar status e prioridade se necessário
      if (selectedStatus !== ticket.status || selectedPriority !== ticket.priority) {
        await updateTicket(ticket.id, {
          status: selectedStatus,
          priority: selectedPriority,
        })
      }

      toast.success("Resposta enviada com sucesso!")
      setResponseContent("")
      setSelectedFiles([])
      loadFollowups() // Recarregar followups
    } catch (error) {
      console.error("Erro ao enviar resposta:", error)
      toast.error("Não foi possível enviar a resposta.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Mapear status para texto
  const mapStatusToText = (status: number) => {
    switch (status) {
      case 1:
        return "Novo"
      case 2:
        return "Pendente"
      case 3:
        return "Em andamento"
      case 4:
        return "Resolvido"
      case 5:
        return "Fechado"
      case 6:
        return "Rejeitado"
      default:
        return "Desconhecido"
    }
  }

  // Mapear prioridade para texto
  const mapPriorityToText = (priority: number) => {
    switch (priority) {
      case 1:
        return "Muito baixa"
      case 2:
        return "Baixa"
      case 3:
        return "Média"
      case 4:
        return "Alta"
      case 5:
        return "Muito alta"
      default:
        return "Média"
    }
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Chamado não encontrado</h2>
          <p className="text-muted-foreground">O chamado solicitado não foi encontrado.</p>
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() => router.push("/admin")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Voltar para o Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-cead-blue text-white">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            {/* Logo usando o componente Image do Next.js */}
            <img src="/puc-goias.svg" alt="Logo PUC Goiás" className="h-8 w-8" />
            <span className="text-lg font-semibold">CEAD - PUC GO (Admin)</span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.name?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-flex">{user?.name || "Administrador"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Meus Chamados
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o Dashboard
            </Link>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Chamado #{ticket.id}</CardTitle>
                    <CardDescription>{ticket.name}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(ticket.date_creation)}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Usuário #{ticket.users_id_recipient}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h3 className="text-sm font-medium">Status</h3>
                      <div className="mt-1">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(Number(e.target.value))}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value={1}>Novo</option>
                          <option value={2}>Pendente</option>
                          <option value={3}>Em andamento</option>
                          <option value={4}>Resolvido</option>
                          <option value={5}>Fechado</option>
                        </select>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Status atual: {mapStatusToText(ticket.status)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Prioridade</h3>
                      <div className="mt-1">
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(Number(e.target.value))}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value={1}>Muito baixa</option>
                          <option value={2}>Baixa</option>
                          <option value={3}>Média</option>
                          <option value={4}>Alta</option>
                          <option value={5}>Muito alta</option>
                        </select>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Prioridade atual: <PriorityIndicator priority={ticket.priority} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">Categoria</h3>
                      <p className="mt-1 text-sm">Categoria #{ticket.itilcategories_id}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium mb-2">Descrição</h3>
                    <div
                      className="rounded-md border border-input bg-muted/40 p-4 text-sm"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                      dangerouslySetInnerHTML={{ __html: ticket.content }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Respostas</CardTitle>
                <CardDescription>Acompanhe todas as interações deste chamado</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="public">Públicas</TabsTrigger>
                    <TabsTrigger value="private">Privadas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="space-y-4">
                    {isLoadingFollowups ? (
                      <div className="text-center py-8">
                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Carregando respostas...</p>
                      </div>
                    ) : followups.length > 0 ? (
                      followups.map((followup) => (
                        <div key={followup.id} className="rounded-lg border p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {followup.users_id === ticket.users_id_recipient ? "US" : "AD"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {followup.users_id === ticket.users_id_recipient ? "Solicitante" : "Atendente"}
                                </p>
                                <p className="text-xs text-muted-foreground">{formatDate(followup.date_creation)}</p>
                              </div>
                            </div>
                            {followup.is_private ? (
                              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                                Privado
                              </span>
                            ) : null}
                          </div>
                          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
                          <div className="text-sm mt-2" dangerouslySetInnerHTML={{ __html: followup.content }} />
                          {followup.documents && followup.documents.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium mb-2">Anexos:</p>
                              <div className="flex flex-wrap gap-2">
                                {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
                                {followup.documents.map((doc: any) => (
                                  <a
                                    key={doc.id}
                                    href={doc.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                                  >
                                    <FileText className="h-3 w-3" />
                                    {doc.filename}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="mt-2 text-sm text-muted-foreground">Nenhuma resposta encontrada.</p>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="public" className="space-y-4">
                    {/* Conteúdo similar para respostas públicas */}
                    <p className="text-center text-muted-foreground py-4">
                      Selecione a aba "Todas" para ver todas as respostas.
                    </p>
                  </TabsContent>
                  <TabsContent value="private" className="space-y-4">
                    {/* Conteúdo similar para respostas privadas */}
                    <p className="text-center text-muted-foreground py-4">
                      Selecione a aba "Todas" para ver todas as respostas.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Adicionar Resposta</CardTitle>
                <CardDescription>Responda ao chamado e atualize seu status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <RichTextEditor
                      id="response-content"
                      name="response-content"
                      value={responseContent}
                      onChange={setResponseContent}
                      placeholder="Digite sua resposta aqui..."
                    />
                  </div>
                  <div>
                    <FileInput
                      id="attachment"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const newFiles = Array.from(e.target.files)
                          setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles])
                          e.target.value = ""
                        }
                      }}
                      buttonText="Anexar arquivos"
                      accept="*/*" // Aceita todos os tipos de arquivos
                      multiple
                      selectedFiles={selectedFiles}
                      onRemove={(index: number) => {
                        setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
                      }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/admin")}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmitResponse} disabled={isSubmitting || !responseContent.trim()}>
                  {isSubmitting ? "Enviando..." : "Enviar Resposta"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CEAD - Coordenação de Educação a Distância - PUC GO. Todos os direitos
            reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="/termo-de-uso" className="text-sm text-muted-foreground hover:underline">
              Termos de Uso
            </a>
            <a href="/politica-de-privacidade" className="text-sm text-muted-foreground hover:underline">
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
