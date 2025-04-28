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
  type GLPITicket,
  type GLPICategory,
} from "@/lib/glpi-api"
import { useAuth } from "@/contexts/auth-context"
import { FileAttachment } from "@/components/file-attachment"
import { RichTextEditor } from "@/components/rich-text-editor"

export default function AdminNewTicketPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [categories, setCategories] = useState<GLPICategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])

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
        loadCategories()
      }
    }
  }, [user, authLoading, router])

  // Carregar categorias
  async function loadCategories() {
    try {
      const categoriesData = await getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
      toast.error("Não foi possível carregar as categorias.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
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
          toast.error("Não foi possível anexar todos os arquivos, mas o chamado foi criado.")
        }
      }

      toast.success(`Chamado #${ticketId} criado com sucesso!`)

      // Redirecionar para a página do ticket
      router.push(`/admin/tickets/${ticketId}`)
    } catch (error) {
      console.error("Erro ao criar chamado:", error)
      toast.error("Não foi possível criar o chamado. Tente novamente mais tarde.")
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
                  <Label htmlFor="title">Título do Chamado</Label>
                  <Input
                    id="title"
                    placeholder="Resumo do problema"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={category} onValueChange={setCategory} disabled={isSubmitting} required>
                      <SelectTrigger>
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={priority} onValueChange={setPriority} disabled={isSubmitting} required>
                      <SelectTrigger>
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
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <RichTextEditor
                    id="description"
                    name="description"
                    value={description}
                    onChange={setDescription}
                    placeholder="Descreva detalhadamente o problema ou solicitação"
                    minHeight="250px"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attachment">Anexos (opcional)</Label>
                  <Input
                    id="attachment"
                    type="file"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                    className="file:bg-cead-blue file:text-white file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:cursor-pointer"
                    multiple
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
