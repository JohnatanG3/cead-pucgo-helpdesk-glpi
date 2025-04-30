"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getCategories,
  createTicket,
  uploadDocument,
  linkDocumentToTicket,
  getUsers,
  getGroups,
  type GLPITicket,
  type GLPICategory,
  type GLPIUser,
  type GLPIGroup,
  GLPIError,
} from "@/lib/glpi-api"
import { useAuth } from "@/contexts/auth-context"
import { FileAttachment } from "@/components/file-attachment"
import { RichTextEditor } from "@/components/rich-text-editor"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileInput } from "@/components/file-input"
// Importar as funções de validação
import { ticketSchema, validateData } from "@/lib/validation"

export default function AdminNewTicketPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [categories, setCategories] = useState<GLPICategory[]>([])
  const [technicians, setTechnicians] = useState<GLPIUser[]>([])
  const [groups, setGroups] = useState<GLPIGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Estado para erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  // Form state
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [assignmentType, setAssignmentType] = useState<"none" | "user" | "group">("none")
  const [assignedUser, setAssignedUser] = useState("")
  const [assignedGroup, setAssignedGroup] = useState("")

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
        loadData()
      }
    }
  }, [user, authLoading, router])

  // Carregar categorias, usuários e grupos
  async function loadData() {
    try {
      const [categoriesData, usersData, groupsData] = await Promise.all([
        getCategories(),
        getUsers({ is_active: "1" }),
        getGroups(),
      ])

      setCategories(categoriesData)
      setTechnicians(usersData)
      setGroups(groupsData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      if (error instanceof GLPIError) {
        toast.error(error.getUserFriendlyMessage())
      } else {
        toast.error("Não foi possível carregar as categorias.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()

    // Limpar erros de validação anteriores
    setValidationErrors({})

    // Validar dados do formulário
    const formData = {
      title,
      category,
      priority,
      description,
      assignmentType,
      assignedUser,
      assignedGroup,
    }

    const validationResult = validateData(ticketSchema, formData)

    if (!validationResult.success) {
      // Mostrar erros de validação
      setValidationErrors(validationResult.errors || {})

      // Mostrar toast com o primeiro erro
      const firstErrorField = Object.keys(validationResult.errors || {})[0]
      const firstError = validationResult.errors?.[firstErrorField]?.[0]
      if (firstError) {
        toast.error(firstError)
      }

      return
    }

    setIsSubmitting(true)

    try {
      // Mapear os valores para o formato do GLPI
      const newTicket: Partial<GLPITicket> = {
        name: title,
        content: description,
        itilcategories_id: Number.parseInt(category),
        priority: Number.parseInt(priority),
        // Outros campos necessários para o GLPI
        status: 1, // Novo
        type: 1, // Incidente
      }

      // Adicionar atribuição conforme selecionado
      if (assignmentType === "user" && assignedUser) {
        newTicket.users_id_assign = Number.parseInt(assignedUser)
      } else if (assignmentType === "group" && assignedGroup) {
        newTicket.groups_id_assign = Number.parseInt(assignedGroup)
      }

      const result = await createTicket(newTicket)
      const ticketId = result.id

      // Se tiver arquivos, fazer upload e vincular ao ticket
      if (files.length > 0) {
        try {
          // Upload de cada documento
          for (const file of files) {
            const document = await uploadDocument(file, 1) // 1 é o ID do usuário atual (simulado)
            await linkDocumentToTicket(document.id, ticketId)
          }

          toast.success(`${files.length} arquivo(s) anexado(s) com sucesso!`)
        } catch (uploadError) {
          console.error("Erro ao fazer upload dos arquivos:", uploadError)
          if (uploadError instanceof GLPIError) {
            toast.error(`Não foi possível anexar todos os arquivos: ${uploadError.getUserFriendlyMessage()}`)
          } else {
            toast.error("Não foi possível anexar todos os arquivos, mas o chamado foi criado.")
          }
        }
      }

      toast.success(`Chamado #${ticketId} criado com sucesso!`)

      // Redirecionar para a página do ticket
      router.push(`/admin/tickets/${ticketId}`)
    } catch (error) {
      console.error("Erro ao criar chamado:", error)
      if (error instanceof GLPIError) {
        toast.error(`Não foi possível criar o chamado: ${error.getUserFriendlyMessage()}`)
      } else {
        toast.error("Não foi possível criar o chamado. Tente novamente mais tarde.")
      }
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Converter FileList para array e adicionar aos arquivos existentes
      const newFiles = Array.from(e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...newFiles])

      // Limpar o input para permitir selecionar os mesmos arquivos novamente
      e.target.value = ""
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  // Handler para mudança de tipo de atribuição com tipagem correta
  const handleAssignmentTypeChange = (value: string) => {
    setAssignmentType(value as "none" | "user" | "group")
    // Limpar seleções anteriores
    if (value !== "user") setAssignedUser("")
    if (value !== "group") setAssignedGroup("")
  }

  // Função para verificar se um campo tem erro
  const hasError = (field: string): boolean => {
    return !!validationErrors[field]
  }

  // Função para obter a mensagem de erro de um campo
  const getErrorMessage = (field: string): string => {
    return validationErrors[field]?.[0] || ""
  }

  if (authLoading || isLoading) {
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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-cead-blue text-white">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <ArrowLeft className="h-5 w-5" />
            Voltar para Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Abrir Novo Chamado</h1>
            <p className="text-muted-foreground">Crie um novo chamado no sistema</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Chamado</CardTitle>
              <CardDescription>Preencha as informações abaixo para criar um novo chamado.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitTicket}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className={hasError("title") ? "text-destructive" : ""}>
                    Título do Chamado
                  </Label>
                  <Input
                    id="title"
                    placeholder="Resumo do problema"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                    className={hasError("title") ? "border-destructive" : ""}
                  />
                  {hasError("title") && <p className="text-xs text-destructive">{getErrorMessage("title")}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className={hasError("category") ? "text-destructive" : ""}>
                      Categoria
                    </Label>
                    <Select value={category} onValueChange={setCategory} disabled={isSubmitting} required>
                      <SelectTrigger className={hasError("category") ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasError("category") && <p className="text-xs text-destructive">{getErrorMessage("category")}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className={hasError("priority") ? "text-destructive" : ""}>
                      Prioridade
                    </Label>
                    <Select value={priority} onValueChange={setPriority} disabled={isSubmitting} required>
                      <SelectTrigger className={hasError("priority") ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          <div className="flex items-center">
                            <span className="priority-indicator priority-low" />
                            <span>Baixa</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="2">
                          <div className="flex items-center">
                            <span className="priority-indicator priority-medium" />
                            <span>Média</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="3">
                          <div className="flex items-center">
                            <span className="priority-indicator priority-high" />
                            <span>Alta</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="4">
                          <div className="flex items-center">
                            <span className="priority-indicator priority-urgent" />
                            <span>Urgente</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {hasError("priority") && <p className="text-xs text-destructive">{getErrorMessage("priority")}</p>}
                  </div>
                </div>

                {/* Seção de atribuição do chamado */}
                <div className="space-y-2">
                  <Label className={hasError("assignmentType") ? "text-destructive" : ""}>Atribuir chamado</Label>
                  <RadioGroup
                    value={assignmentType}
                    onValueChange={handleAssignmentTypeChange}
                    className={hasError("assignmentType") ? "border-destructive rounded p-2" : ""}
                  >
                    <RadioGroupItem value="none" id="assignment-none">
                      <Label htmlFor="assignment-none" className="ml-2 cursor-pointer">
                        Não atribuir (padrão)
                      </Label>
                    </RadioGroupItem>
                    <RadioGroupItem value="user" id="assignment-user">
                      <Label htmlFor="assignment-user" className="ml-2 cursor-pointer">
                        Atribuir a um técnico
                      </Label>
                    </RadioGroupItem>
                    <RadioGroupItem value="group" id="assignment-group">
                      <Label htmlFor="assignment-group" className="ml-2 cursor-pointer">
                        Atribuir a um grupo
                      </Label>
                    </RadioGroupItem>
                  </RadioGroup>
                  {hasError("assignmentType") && (
                    <p className="text-xs text-destructive">{getErrorMessage("assignmentType")}</p>
                  )}
                </div>

                {/* Mostrar seleção de técnico se "user" estiver selecionado */}
                {assignmentType === "user" && (
                  <div className="space-y-2">
                    <Label htmlFor="assigned-user" className={hasError("assignedUser") ? "text-destructive" : ""}>
                      Técnico responsável
                    </Label>
                    <Select
                      value={assignedUser}
                      onValueChange={setAssignedUser}
                      disabled={isSubmitting}
                      required={assignmentType === "user"}
                    >
                      <SelectTrigger className={hasError("assignedUser") ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione um técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasError("assignedUser") && (
                      <p className="text-xs text-destructive">{getErrorMessage("assignedUser")}</p>
                    )}
                  </div>
                )}

                {/* Mostrar seleção de grupo se "group" estiver selecionado */}
                {assignmentType === "group" && (
                  <div className="space-y-2">
                    <Label htmlFor="assigned-group" className={hasError("assignedGroup") ? "text-destructive" : ""}>
                      Grupo responsável
                    </Label>
                    <Select
                      value={assignedGroup}
                      onValueChange={setAssignedGroup}
                      disabled={isSubmitting}
                      required={assignmentType === "group"}
                    >
                      <SelectTrigger className={hasError("assignedGroup") ? "border-destructive" : ""}>
                        <SelectValue placeholder="Selecione um grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {hasError("assignedGroup") && (
                      <p className="text-xs text-destructive">{getErrorMessage("assignedGroup")}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="description" className={hasError("description") ? "text-destructive" : ""}>
                    Descrição
                  </Label>
                  <RichTextEditor
                    id="description"
                    name="description"
                    value={description}
                    onChange={setDescription}
                    placeholder="Descreva detalhadamente o problema ou solicitação"
                    minHeight="250px"
                    disabled={isSubmitting}
                    className={hasError("description") ? "border-destructive" : ""}
                  />
                  {hasError("description") && (
                    <p className="text-xs text-destructive">{getErrorMessage("description")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attachment">Anexos (opcional)</Label>
                  <FileInput
                    id="attachment"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                    multiple
                    selectedFiles={files}
                  />
                  {files.length > 0 && (
                    <div className="mt-2">
                      <FileAttachment files={files} onRemove={handleRemoveFile} />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formatos aceitos: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (máx. 5MB por arquivo)
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin")}
                  disabled={isSubmitting}
                  className="w-1/3"
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="default" disabled={isSubmitting} className="w-2/3">
                  {isSubmitting ? "Enviando..." : "Criar Chamado"}
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
