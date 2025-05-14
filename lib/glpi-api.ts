import { notificationService } from "./notification-service"
import { cacheManager } from "./cache-manager"
import { getSession } from "next-auth/react"

// Configuração base da API GLPI
const GLPI_API_URL = process.env.GLPI_API_URL || "https://glpi.pucgoias.edu.br/apirest.php"
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN || ""

// Interface para opções de fetch
interface FetchOptions extends RequestInit {
  useCache?: boolean
  cacheTTL?: number
}

/**
 * Função base para fazer requisições à API do GLPI
 */
async function fetchGLPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  try {
    // Verificar se devemos usar cache (padrão: true para GET, false para outros métodos)
    const useCache = options.useCache ?? (!options.method || options.method === "GET" ? true : false)
    const cacheTTL = options.cacheTTL || 300 // 5 minutos padrão

    // Construir a URL completa
    const url = endpoint.startsWith("http") ? endpoint : `${GLPI_API_URL}/${endpoint}`

    // Verificar cache para requisições GET
    const cacheKey = `glpi-api-${url}-${JSON.stringify(options.body || {})}`
    if (useCache) {
      const cachedData = cacheManager.get<T>(cacheKey)
      if (cachedData) {
        return cachedData
      }
    }

    // Obter sessão do usuário atual
    const session = await getSession()
    if (!session?.user?.glpiToken) {
      throw new Error("Usuário não autenticado ou sem token GLPI")
    }

    // Configurar headers
    const headers = new Headers(options.headers)
    headers.set("Content-Type", "application/json")
    headers.set("Session-Token", session.user.glpiToken)
    headers.set("App-Token", GLPI_APP_TOKEN)

    // Fazer a requisição
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
    }

    // Processar a resposta
    const data = (await response.json()) as T

    // Armazenar em cache se for uma requisição GET
    if (useCache) {
      cacheManager.set(cacheKey, data, cacheTTL)
    }

    return data
  } catch (error) {
    notificationService.handleApiError(error, `Erro ao acessar ${endpoint}`)
    throw error
  }
}

// Function to map GLPI status to string
export const mapGLPIStatusToString = (status: number): string => {
  switch (status) {
    case 1:
      return "new"
    case 2:
      return "pending"
    case 3:
      return "in_progress"
    case 4:
      return "resolved"
    case 5:
      return "closed"
    case 6:
      return "rejected"
    default:
      return "unknown"
  }
}

// Function to map GLPI priority to string
export const mapGLPIPriorityToString = (priority: number): string => {
  switch (priority) {
    case 1:
      return "low"
    case 2:
      return "medium"
    case 3:
      return "high"
    case 4:
      return "urgent"
    case 5:
      return "critical"
    default:
      return "unknown"
  }
}

/**
 * Função genérica para lidar com requisições à API do GLPI
 */
export async function handleApiRequest<T>(
  apiCall: () => Promise<T>,
  errorMessage: string,
  successNotification = false,
  successMessage = "",
): Promise<T> {
  try {
    const result = await apiCall()

    if (successNotification && successMessage) {
      notificationService.createNotification("Sucesso", successMessage, "success")
    }

    return result
  } catch (error) {
    notificationService.handleApiError(error, errorMessage)
    throw error
  }
}

/**
 * Obtém uma lista de chamados do GLPI
 */
export async function getTickets(params?: Record<string, string>): Promise<any[]> {
  let endpoint = `Ticket?expand_dropdowns=true`
  if (params) {
    endpoint += "&" + new URLSearchParams(params).toString()
  }
  return fetchGLPI<any[]>(endpoint)
}

/**
 * Obtém um chamado específico do GLPI pelo ID
 */
export async function getTicket(id: number): Promise<any> {
  return fetchGLPI<any>(`Ticket/${id}?expand_dropdowns=true`)
}

/**
 * Obtém um chamado específico do GLPI pelo ID
 */
export async function getTicketById(id: number): Promise<any> {
  return fetchGLPI<any>(`Ticket/${id}?expand_dropdowns=true`)
}

/**
 * Cria um novo chamado no GLPI
 */
export async function createTicket(ticketData: any): Promise<any> {
  return fetchGLPI<any>("Ticket", {
    method: "POST",
    body: JSON.stringify(ticketData),
  })
}

/**
 * Atualiza um chamado existente no GLPI
 */
export async function updateTicket(id: number, ticketData: any): Promise<void> {
  await fetchGLPI<void>(`Ticket/${id}`, {
    method: "PUT",
    body: JSON.stringify(ticketData),
  })
}

/**
 * Deleta um chamado existente no GLPI
 */
export async function deleteTicket(id: number): Promise<void> {
  await fetchGLPI<void>(`Ticket/${id}`, {
    method: "DELETE",
  })
}

/**
 * Obtém uma lista de usuários do GLPI
 */
export async function getUsers(params?: Record<string, string>): Promise<any[]> {
  let endpoint = `User?expand_dropdowns=true`
  if (params) {
    endpoint += "&" + new URLSearchParams(params).toString()
  }
  return fetchGLPI<any[]>(endpoint)
}

/**
 * Obtém um usuário específico do GLPI pelo ID
 */
export async function getUser(id: number): Promise<any> {
  return fetchGLPI<any>(`User/${id}`)
}

/**
 * Obtém uma lista de categorias do GLPI
 */
export async function getCategories(): Promise<any[]> {
  return fetchGLPI<any[]>("ITILCategory?range=0-999")
}

/**
 * Cria uma nova categoria no GLPI
 */
export async function createCategory(categoryData: any): Promise<any> {
  return fetchGLPI<any>("ITILCategory", {
    method: "POST",
    body: JSON.stringify(categoryData),
  })
}

/**
 * Atualiza uma categoria existente no GLPI
 */
export async function updateCategory(id: number, categoryData: any): Promise<void> {
  await fetchGLPI<void>(`ITILCategory/${id}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  })
}

/**
 * Deleta uma categoria existente no GLPI
 */
export async function deleteCategory(id: number): Promise<void> {
  await fetchGLPI<void>(`ITILCategory/${id}`, {
    method: "DELETE",
  })
}

/**
 * Obtém uma lista de grupos do GLPI
 */
export async function getGroups(): Promise<any[]> {
  return fetchGLPI<any[]>("Group?range=0-999")
}

/**
 * Obtém o histórico de um chamado
 */
export async function getTicketHistory(ticketId: number): Promise<any[]> {
  return fetchGLPI<any[]>(`Ticket/${ticketId}/ITILFollowup`)
}

/**
 * Adiciona um comentário a um chamado
 */
export async function addTicketFollowup(followupData: any): Promise<any> {
  return fetchGLPI<any>("ITILFollowup", {
    method: "POST",
    body: JSON.stringify(followupData),
  })
}

/**
 * Obtém os followups de um ticket
 */
export async function getTicketFollowups(ticketId: number): Promise<any[]> {
  return fetchGLPI<any[]>(`ITILFollowup?criteria[0][field]=tickets_id&criteria[0][value]=${ticketId}`)
}

/**
 * Upload de um documento para o GLPI
 */
export async function uploadDocument(file: File, userId: number): Promise<any> {
  const formData = new FormData()
  formData.append("upload[filename]", file)
  formData.append("upload[name]", file.name)

  return fetchGLPI<any>("Document", {
    method: "POST",
    body: formData,
  })
}

/**
 * Vincula um documento a um chamado
 */
export async function linkDocumentToTicket(documentId: number, ticketId: number): Promise<void> {
  const linkData = {
    input: [
      {
        itemtype: "Ticket",
        items_id: ticketId,
        documents_id: documentId,
      },
    ],
  }

  await fetchGLPI<void>("Document_Item", {
    method: "POST",
    body: JSON.stringify(linkData),
  })
}

/**
 * Obtém os documentos de um chamado
 */
export async function getTicketDocuments(ticketId: number): Promise<any[]> {
  return fetchGLPI<any[]>(
    `DocumentItem?criteria[0][field]=items_id&criteria[0][value]=${ticketId}&criteria[0][searchtype]=equals&criteria[1][field]=itemtype&criteria[1][value]=Ticket&criteria[1][searchtype]=equals&range=0-999`,
  )
}

/**
 * Deleta um documento
 */
export async function deleteDocument(documentId: number): Promise<void> {
  await fetchGLPI<void>(`Document/${documentId}`, {
    method: "DELETE",
  })
}

/**
 * Obtém estatísticas dos chamados
 */
export async function getTicketStats(): Promise<any> {
  return fetchGLPI<any>("getTicketStats")
}

/**
 * Obtém relatório de tempo de resolução
 */
export async function getResolutionTimeReport(params?: Record<string, any>): Promise<any> {
  let endpoint = `getResolutionTimeReport?`
  if (params) {
    endpoint += "&" + new URLSearchParams(params as Record<string, string>).toString()
  }
  return fetchGLPI<any>(endpoint)
}

/**
 * Obtém relatório de satisfação
 */
export async function getSatisfactionReport(): Promise<any> {
  return fetchGLPI<any>("getSatisfactionReport")
}

/**
 * Obtém tickets atribuidos a um grupo
 */
export async function getTicketsByGroup(groupId: number, params?: Record<string, string>): Promise<any[]> {
  let endpoint = `Ticket?criteria[0][field]=groups_id_assign&criteria[0][value]=${groupId}&criteria[0][searchtype]=equals&expand_dropdowns=true`
  if (params) {
    endpoint += "&" + new URLSearchParams(params).toString()
  }
  return fetchGLPI<any[]>(endpoint)
}

/**
 * Obtém tickets solicitados por um usuário
 */
export async function getTicketsRequestedByUser(userId: number, params?: Record<string, string>): Promise<any[]> {
  let endpoint = `Ticket?criteria[0][field]=users_id_recipient&criteria[0][value]=${userId}&criteria[0][searchtype]=equals&expand_dropdowns=true`
  if (params) {
    endpoint += "&" + new URLSearchParams(params).toString()
  }
  return fetchGLPI<any[]>(endpoint)
}

export interface GLPITicket {
  id: number
  name: string
  content: string
  status: number
  date_creation: string
  date_mod: string
  priority: number
  urgency: number
  impact: number
  itilcategories_id: number
  users_id_recipient: number
  requesttypes_id: number
  entities_id: number
  closedate?: string
  solvedate?: string
  time_to_resolve?: string
  global_validation?: number
  type?: number
  users_id_assign?: number
  groups_id_assign?: number
  [key: string]: any
}

export interface GLPIUser {
  id: number
  name: string
  firstname?: string
  realname?: string
  email?: string
  phone?: string
  mobile?: string
  locations_id?: number
  profiles_id?: number
  entities_id?: number
  is_active?: boolean
  [key: string]: any
}

export interface GLPIGroup {
  id: number
  name: string
  comment?: string
  completename?: string
  level?: number
  is_recursive?: boolean
  entities_id?: number
  is_task?: boolean
  [key: string]: any
}

export interface GLPICategory {
  id: number
  name: string
  completename?: string
  comment?: string
  level?: number
  ancestors_cache?: string
  sons_cache?: string
  entities_id?: number
  is_recursive?: boolean
  [key: string]: any
}

export interface GLPIAttachment {
  id: number
  name: string
  filename: string
  filepath: string
  mimetype: string
  filesize: number
  date_creation: string
  date_mod: string
  users_id: number
  tickets_id?: number
  [key: string]: any
}

export interface GLPITicketHistory {
  id: number
  itemtype: string
  items_id: number
  date_mod: string
  user_name: string
  id_search_option: number
  old_value: string
  new_value: string
  [key: string]: any
}

export interface GLPISession {
  session_token: string
  app_token?: string
  expires: number
}

export class GLPIError extends Error {
  statusCode: number
  message: string
  errorDetails?: any

  constructor(statusCode: number, message: string, errorDetails?: any) {
    super(message)
    this.name = "GLPIError"
    this.statusCode = statusCode
    this.message = message
    this.errorDetails = errorDetails
  }

  getUserFriendlyMessage(): string {
    return `Erro na API GLPI: ${this.message} (Código ${this.statusCode})`
  }
}

export interface GLPITicketFollowup {
  id: number
  tickets_id: number
  content: string
  is_private: number
  date_creation: string
  date_mod: string
  users_id: number
  [key: string]: any
}
