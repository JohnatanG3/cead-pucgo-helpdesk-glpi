/**
 * Serviço para comunicação com a API do GLPI
 */

// Adicione esta classe de erro personalizada no início do arquivo
export class GLPIError extends Error {
	status: number
	endpoint: string
	errorType: "auth" | "network" | "validation" | "server" | "unknown"
  
	constructor(message: string, status: number, endpoint: string) {
	  super(message)
	  this.name = "GLPIError"
	  this.status = status
	  this.endpoint = endpoint
  
	  // Determinar o tipo de erro com base no status
	  if (status === 401 || status === 403) {
		this.errorType = "auth"
	  } else if (status >= 400 && status < 500) {
		this.errorType = "validation"
	  } else if (status >= 500) {
		this.errorType = "server"
	  } else {
		this.errorType = "unknown"
	  }
	}
  
	// Método para obter mensagem amigável ao usuário
	getUserFriendlyMessage(): string {
	  switch (this.errorType) {
		case "auth":
		  return "Erro de autenticação. Por favor, faça login novamente."
		case "validation":
		  return "Os dados fornecidos são inválidos. Verifique e tente novamente."
		case "server":
		  return "Erro no servidor. Por favor, tente novamente mais tarde."
		case "network":
		  return "Erro de conexão. Verifique sua internet e tente novamente."
		default:
		  return "Ocorreu um erro inesperado. Por favor, tente novamente."
	  }
	}
  }
  
  // Constantes para a API
  const GLPI_API_URL = process.env.NEXT_PUBLIC_GLPI_API_URL || "http://192.211.51.226:8686/apirest.php"
  const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN || ""
  const GLPI_USER_TOKEN = process.env.GLPI_USER_TOKEN || ""
  
  // Constantes para a gestão de sessão
  const SESSION_TOKEN_EXPIRY = 3600000 // 1 hora em milissegundos
  const TOKEN_RENEWAL_THRESHOLD = 300000 // 5 minutos em milissegundos
  
  // Interface para o token de sessão
  interface SessionToken {
	sessionToken: string
	expiresAt: number
  }
  
  // Cache para o token de sessão
  let sessionTokenCache: SessionToken | null = null
  let renewalTimeout: NodeJS.Timeout | null = null
  
  // Função para verificar se estamos em ambiente de servidor
  const isServer = typeof window === "undefined"
  
  /**
   * Inicializa uma sessão com o GLPI
   */
  export async function initSession(): Promise<string> {
	// Se já temos um token válido em cache, retorna ele
	if (sessionTokenCache && sessionTokenCache.expiresAt > Date.now() + TOKEN_RENEWAL_THRESHOLD) {
	  return sessionTokenCache.sessionToken
	}
  
	// Se o token está próximo de expirar, renova-o
	if (sessionTokenCache && sessionTokenCache.expiresAt > Date.now()) {
	  // Agenda a renovação do token
	  scheduleTokenRenewal()
	  return sessionTokenCache.sessionToken
	}
  
	try {
	  // Em ambiente de desenvolvimento, simular um token de sessão
	  if (process.env.NODE_ENV === "development") {
		const mockToken = `dev-session-token-${Date.now()}`
		sessionTokenCache = {
		  sessionToken: mockToken,
		  expiresAt: Date.now() + SESSION_TOKEN_EXPIRY,
		}
  
		// Agenda a renovação do token
		scheduleTokenRenewal()
  
		return mockToken
	  }
  
	  const response = await fetch(`${GLPI_API_URL}/initSession`, {
		method: "GET",
		headers: {
		  "Content-Type": "application/json",
		  Authorization: `user_token ${GLPI_USER_TOKEN}`,
		  "App-Token": GLPI_APP_TOKEN,
		},
	  })
  
	  if (!response.ok) {
		throw new Error(`Erro ao iniciar sessão: ${response.statusText}`)
	  }
  
	  const data = await response.json()
  
	  // Armazena o token em cache
	  sessionTokenCache = {
		sessionToken: data.session_token,
		expiresAt: Date.now() + SESSION_TOKEN_EXPIRY,
	  }
  
	  // Agenda a renovação do token
	  scheduleTokenRenewal()
  
	  return data.session_token
	} catch (error) {
	  console.error("Erro ao iniciar sessão com GLPI:", error)
  
	  // Em ambiente de desenvolvimento, retornar um token simulado
	  if (process.env.NODE_ENV === "development") {
		const mockToken = `dev-session-token-${Date.now()}`
		sessionTokenCache = {
		  sessionToken: mockToken,
		  expiresAt: Date.now() + SESSION_TOKEN_EXPIRY,
		}
		return mockToken
	  }
  
	  throw error
	}
  }
  
  /**
   * Agenda a renovação do token antes que ele expire
   */
  function scheduleTokenRenewal() {
	// Só executa no servidor
	if (!isServer) return
  
	// Limpa qualquer timeout existente
	if (renewalTimeout) {
	  clearTimeout(renewalTimeout)
	  renewalTimeout = null
	}
  
	// Se não há token em cache, não faz nada
	if (!sessionTokenCache) {
	  return
	}
  
	// Calcula o tempo até a renovação (5 minutos antes de expirar)
	const timeUntilRenewal = sessionTokenCache.expiresAt - Date.now() - TOKEN_RENEWAL_THRESHOLD
  
	// Se já passou do tempo de renovação, renova imediatamente
	if (timeUntilRenewal <= 0) {
	  renewToken()
	  return
	}
  
	// Agenda a renovação
	renewalTimeout = setTimeout(() => {
	  renewToken()
	}, timeUntilRenewal)
  }
  
  /**
   * Renova o token de sessão
   */
  async function renewToken() {
	try {
	  // Em ambiente de desenvolvimento, simular renovação
	  if (process.env.NODE_ENV === "development") {
		console.log("Renovando token de sessão (simulado)")
		if (sessionTokenCache) {
		  sessionTokenCache.expiresAt = Date.now() + SESSION_TOKEN_EXPIRY
		  scheduleTokenRenewal()
		}
		return
	  }
  
	  // Se não há token em cache, inicia uma nova sessão
	  if (!sessionTokenCache) {
		await initSession()
		return
	  }
  
	  console.log("Renovando token de sessão")
  
	  // Faz a requisição para renovar o token
	  const response = await fetch(`${GLPI_API_URL}/session`, {
		method: "GET",
		headers: {
		  "Content-Type": "application/json",
		  "Session-Token": sessionTokenCache.sessionToken,
		  "App-Token": GLPI_APP_TOKEN,
		},
	  })
  
	  if (!response.ok) {
		// Se falhar, inicia uma nova sessão
		console.warn("Falha ao renovar token, iniciando nova sessão")
		sessionTokenCache = null
		await initSession()
		return
	  }
  
	  // Atualiza o tempo de expiração
	  if (sessionTokenCache) {
		sessionTokenCache.expiresAt = Date.now() + SESSION_TOKEN_EXPIRY
		scheduleTokenRenewal()
	  }
	} catch (error) {
	  console.error("Erro ao renovar token:", error)
	  // Em caso de erro, tenta iniciar uma nova sessão
	  sessionTokenCache = null
	  await initSession()
	}
  }
  
  /**
   * Encerra uma sessão com o GLPI
   */
  export async function killSession(sessionToken: string): Promise<void> {
	try {
	  // Limpar o timeout de renovação
	  if (renewalTimeout) {
		clearTimeout(renewalTimeout)
		renewalTimeout = null
	  }
  
	  // Em ambiente de desenvolvimento, apenas limpar o cache
	  if (process.env.NODE_ENV === "development") {
		sessionTokenCache = null
		return
	  }
  
	  await fetch(`${GLPI_API_URL}/killSession`, {
		method: "GET",
		headers: {
		  "Content-Type": "application/json",
		  "Session-Token": sessionToken,
		  "App-Token": GLPI_APP_TOKEN,
		},
	  })
  
	  // Limpa o cache
	  sessionTokenCache = null
	} catch (error) {
	  console.error("Erro ao encerrar sessão com GLPI:", error)
	}
  }
  
  /**
   * Função para fazer requisições com retry
   */
  async function fetchWithRetry<T>(url: string, options: RequestInit = {}, maxRetries = 3): Promise<T> {
	let retries = 0
  
	while (retries < maxRetries) {
	  try {
		const response = await fetch(url, options)
  
		if (!response.ok) {
		  // Se for um erro 5xx, tenta novamente
		  if (response.status >= 500) {
			retries++
			// Espera exponencial antes de tentar novamente
			// biome-ignore lint/style/useExponentiationOperator: <explanation>
						await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
			continue
		  }
  
		  // Para outros erros, lança exceção
		  let errorDetails = ""
		  try {
			const errorData = await response.json()
			errorDetails = errorData.message || JSON.stringify(errorData)
		  } catch {
			errorDetails = response.statusText
		  }
  
		  throw new GLPIError(`Erro na requisição: ${errorDetails}`, response.status, url)
		}
  
		return await response.json()
	  } catch (error) {
		// Se for o último retry ou não for um erro de rede, lança a exceção
		if (retries >= maxRetries - 1 || !(error instanceof TypeError)) {
		  if (error instanceof TypeError) {
			// Erro de rede
			throw new GLPIError("Erro de conexão com o servidor", 0, url)
		  }
		  throw error
		}
  
		retries++
		// Espera exponencial antes de tentar novamente
		// biome-ignore lint/style/useExponentiationOperator: <explanation>
				await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
	  }
	}
  
	// Nunca deve chegar aqui, mas TypeScript exige um retorno
	throw new Error("Número máximo de tentativas excedido")
  }
  
  // Modifique a função fetchGLPI para usar o novo tratamento de erros e retries
  export async function fetchGLPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	try {
	  // Em ambiente de desenvolvimento, retornar dados simulados
	  if (process.env.NODE_ENV === "development") {
		return getMockData<T>(endpoint, options) as T
	  }
  
	  const sessionToken = await initSession()
	  const fullUrl = `${GLPI_API_URL}/${endpoint}`
  
	  return await fetchWithRetry<T>(fullUrl, {
		...options,
		headers: {
		  "Content-Type": "application/json",
		  "Session-Token": sessionToken,
		  "App-Token": GLPI_APP_TOKEN,
		  ...options.headers,
		},
	  })
	} catch (error) {
	  if (error instanceof GLPIError) {
		console.error(`Erro GLPI [${error.status}] em ${error.endpoint}:`, error.message)
		throw error
	  }
  
	  console.error(`Erro ao acessar ${endpoint}:`, error)
	  throw new GLPIError(error instanceof Error ? error.message : "Erro desconhecido", 500, endpoint)
	}
  }
  
  // Função para obter dados simulados em ambiente de desenvolvimento
  function getMockData<T>(endpoint: string, options: RequestInit = {}): T {
	// Extrair o tipo de endpoint (Ticket, User, etc.)
	const endpointType = endpoint.split("/")[0].split("?")[0]
  
	// Dados simulados para diferentes tipos de endpoints
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
  		const mockData: Record<string, any> = {
	  Ticket: [
		{
		  id: 1,
		  name: "Problema com matrícula de aluno",
		  content: "Não consigo acessar o sistema de matrícula para o aluno João Silva.",
		  status: 1,
		  priority: 2,
		  date_creation: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 dias atrás
		  date_mod: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
		  entities_id: 1,
		  users_id_recipient: 1,
		  users_id_assign: 2,
		  groups_id_assign: null,
		  type: 1,
		  itilcategories_id: 1,
		  urgency: 2,
		  impact: 2,
		},
		{
		  id: 2,
		  name: "Erro na programação acadêmica",
		  content: "Disciplina de Cálculo II não aparece na grade do curso de Engenharia.",
		  status: 3,
		  priority: 3,
		  date_creation: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 dias atrás
		  date_mod: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 dia atrás
		  entities_id: 1,
		  users_id_recipient: 1,
		  users_id_assign: null,
		  groups_id_assign: 1,
		  type: 1,
		  itilcategories_id: 2,
		  urgency: 3,
		  impact: 3,
		},
		{
		  id: 3,
		  name: "Solicitação de regime de acompanhamento",
		  content: "Aluna Maria Souza precisa de regime especial por motivos de saúde.",
		  status: 4,
		  priority: 1,
		  date_creation: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 dias atrás
		  date_mod: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 dias atrás
		  entities_id: 1,
		  users_id_recipient: 1,
		  users_id_assign: 3,
		  groups_id_assign: null,
		  type: 1,
		  itilcategories_id: 3,
		  urgency: 1,
		  impact: 1,
		},
	  ],
	  ITILCategory: [
		{
		  id: 1,
		  name: "Matrícula aluno",
		  completename: "Matrícula aluno",
		  comment: "Problemas relacionados à matrícula de alunos",
		  entities_id: 1,
		},
		{
		  id: 2,
		  name: "Programação acadêmica",
		  completename: "Programação acadêmica",
		  comment: "Questões sobre a programação de disciplinas e cursos",
		  entities_id: 1,
		},
		{
		  id: 3,
		  name: "Regime de acompanhamento",
		  completename: "Regime de acompanhamento",
		  comment: "Solicitações de regime especial de acompanhamento",
		  entities_id: 1,
		},
	  ],
	  User: [
		{
		  id: 1,
		  name: "Admin",
		  firstname: "Admin",
		  realname: "Administrador",
		  email: "admin@pucgoias.edu.br",
		  phone: "(62) 3946-1000",
		  entities_id: 1,
		  group_id: 3, // Adicionado group_id para o usuário
		},
		{
		  id: 2,
		  name: "Coordenador",
		  firstname: "João",
		  realname: "Silva",
		  email: "coordenador@pucgoias.edu.br",
		  phone: "(62) 3946-1001",
		  entities_id: 1,
		  group_id: 3, // Adicionado group_id para o usuário
		},
		{
		  id: 3,
		  name: "Secretária",
		  firstname: "Maria",
		  realname: "Oliveira",
		  email: "secretaria@pucgoias.edu.br",
		  phone: "(62) 3946-1002",
		  entities_id: 1,
		  group_id: 1, // Adicionado group_id para o usuário
		},
		{
		  id: 4,
		  name: "Técnico",
		  firstname: "Pedro",
		  realname: "Santos",
		  email: "suporte@pucgoias.edu.br",
		  phone: "(62) 3946-1003",
		  entities_id: 1,
		  group_id: 2, // Adicionado group_id para o usuário
		},
	  ],
	  // Adicionar dados simulados para grupos
	  Group: [
		{
		  id: 1,
		  name: "Secretaria Acadêmica",
		  comment: "Grupo da secretaria acadêmica",
		  entities_id: 1,
		},
		{
		  id: 2,
		  name: "Suporte Técnico",
		  comment: "Equipe de suporte técnico",
		  entities_id: 1,
		},
		{
		  id: 3,
		  name: "Coordenação de Cursos",
		  comment: "Coordenadores de cursos",
		  entities_id: 1,
		},
	  ],
	  TicketFollowup: [
		{
		  id: 1,
		  tickets_id: 1,
		  users_id: 2,
		  content: "Verificando o problema de matrícula.",
		  date_creation: new Date(Date.now() - 86400000).toISOString(),
		  date_mod: new Date(Date.now() - 86400000).toISOString(),
		},
		{
		  id: 2,
		  tickets_id: 1,
		  users_id: 1,
		  content: "Obrigado pelo retorno, aguardo solução.",
		  date_creation: new Date(Date.now() - 86400000 / 2).toISOString(),
		  date_mod: new Date(Date.now() - 86400000 / 2).toISOString(),
		},
	  ],
	}
  
	// Verificar se é uma operação POST
	if (options.method === "POST") {
	  const body = options.body ? JSON.parse(options.body.toString()) : {}
  
	  // Simular criação de um novo item
	  if (endpointType === "Ticket") {
		return { id: Math.floor(Math.random() * 1000) + 10 } as T
	  // biome-ignore lint/style/noUselessElse: <explanation>
	  } else if (endpointType === "TicketFollowup") {
		return { id: Math.floor(Math.random() * 1000) + 10 } as T
	  // biome-ignore lint/style/noUselessElse: <explanation>
	  } else if (endpointType === "Document") {
		return { id: Math.floor(Math.random() * 1000) + 10, name: "documento.pdf" } as T
	  }
	}
  
	// Verificar se é uma operação GET para um item específico
	if (endpoint.includes("/") && !endpoint.endsWith("/")) {
	  const parts = endpoint.split("/")
	  const id = Number.parseInt(parts[1])
  
	  if (mockData[endpointType]) {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const item = mockData[endpointType].find((item: any) => item.id === id)
		return item as T
	  }
	}
  
	// Retornar lista de itens
	return (mockData[endpointType] || []) as T
  }
  
  // Interfaces para os tipos de dados do GLPI
  export interface GLPITicket {
	id: number
	name: string
	content: string
	status: number
	priority: number
	date_creation: string
	date_mod: string
	entities_id: number
	users_id_recipient: number
	users_id_assign?: number // Responsável individual (atribuído a)
	groups_id_assign?: number // Grupo responsável
	time_to_resolve?: string
	type: number
	itilcategories_id: number
	urgency: number
	impact: number
  }
  
  export interface GLPIUser {
	id: number
	name: string
	firstname: string
	realname: string
	email: string
	phone: string
	entities_id: number
	group_id?: number // Adicionado group_id para o usuário
  }
  
  export interface GLPICategory {
	id: number
	name: string
	completename: string
	comment: string
	entities_id: number
  }
  
  export interface GLPITicketFollowup {
	id: number
	tickets_id: number
	users_id: number
	content: string
	date_creation: string
	date_mod?: string // Tornando opcional
  }
  
  export interface GLPIDocument {
	id: number
	name: string
	filename: string
	filepath: string
	mime: string
	date_creation: string
	users_id: number
  }
  
  // Adicione esta interface para grupos
  export interface GLPIGroup {
	id: number
	name: string
	comment?: string
	entities_id: number
  }
  
  // Importe o gerenciador de cache
  import { cacheManager } from "./cache"
  
  // Modifique a função getTickets para usar cache
  export async function getTickets(params: Record<string, string> = {}): Promise<GLPITicket[]> {
	const queryParams = new URLSearchParams(params).toString()
	const cacheKey = `tickets:${queryParams}`
  
	// Tenta obter do cache primeiro
	const cachedData = cacheManager.get<GLPITicket[]>(cacheKey)
	if (cachedData) {
	  return cachedData
	}
  
	// Se não estiver em cache, busca da API
	const data = await fetchGLPI<GLPITicket[]>(`Ticket?${queryParams}`)
  
	// Armazena no cache por 5 minutos (300 segundos)
	cacheManager.set(cacheKey, data, 300)
  
	return data
  }
  
  // Modifique a função createTicket para invalidar o cache
  export async function createTicket(ticket: Partial<GLPITicket>): Promise<{ id: number }> {
	const result = await fetchGLPI<{ id: number }>("Ticket", {
	  method: "POST",
	  body: JSON.stringify(ticket),
	})
  
	// Invalida todos os caches relacionados a tickets
	cacheManager.invalidatePattern(/^tickets:/)
  
	return result
  }
  
  export async function updateTicket(id: number, ticket: Partial<GLPITicket>): Promise<void> {
	await fetchGLPI(`Ticket/${id}`, {
	  method: "PUT",
	  body: JSON.stringify(ticket),
	})
  
	// Invalida todos os caches relacionados a tickets
	cacheManager.invalidatePattern(/^tickets:/)
  }
  
  // Funções para followups (comentários em tickets)
  export async function getTicketFollowups(ticketId: number): Promise<GLPITicketFollowup[]> {
	try {
	  // Em ambiente de desenvolvimento, sempre retornar dados simulados
	  // Alterado para sempre usar dados simulados em desenvolvimento
	  if (process.env.NODE_ENV === "development" || process.env.USE_MOCK_DATA === "true") {
		// Retornar dados simulados
		return [
		  {
			id: 1,
			tickets_id: ticketId,
			users_id: 1,
			content: `Este é um followup simulado para o ticket #${ticketId}`,
			date_creation: new Date().toISOString(),
			date_mod: new Date().toISOString(), // Adicionado date_mod
		  },
		  {
			id: 2,
			tickets_id: ticketId,
			users_id: 2,
			content: `Este é outro followup simulado para o ticket #${ticketId}`,
			date_creation: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
			date_mod: new Date(Date.now() - 86400000).toISOString(), // Adicionado date_mod
		  },
		]
	  }
  
	  // Fazer a requisição para a API do GLPI
	  const sessionToken = await initSession()
	  const response = await fetch(`${GLPI_API_URL}/Ticket/${ticketId}/TicketFollowup`, {
		headers: {
		  "Content-Type": "application/json",
		  "App-Token": GLPI_APP_TOKEN,
		  "Session-Token": sessionToken,
		},
	  })
  
	  if (!response.ok) {
		console.error(`Erro ao obter followups do ticket ${ticketId}: ${response.statusText}`)
		return [] // Retornar array vazio em caso de erro
	  }
  
	  const data = await response.json()
  
	  // Garantir que estamos retornando um array
	  if (Array.isArray(data)) {
		return data
	  // biome-ignore lint/style/noUselessElse: <explanation>
	  } else if (data && typeof data === "object") {
		// Se for um objeto único, converter para array
		return [data]
	  // biome-ignore lint/style/noUselessElse: <explanation>
	  } else {
		console.error("Formato de dados inesperado:", data)
		return []
	  }
	} catch (error) {
	  console.error(`Erro ao obter followups do ticket ${ticketId}:`, error)
	  return [] // Retornar array vazio em caso de erro
	}
  }
  
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    export async function addTicketFollowup(followup: any): Promise<{ id: number }> {
	return fetchGLPI<{ id: number }>("TicketFollowup", {
	  method: "POST",
	  body: JSON.stringify(followup),
	})
  }
  
  // Funções para documentos (anexos)
  export async function uploadDocument(file: File, userId: number): Promise<GLPIDocument> {
	// Em ambiente de desenvolvimento, simular upload
	if (process.env.NODE_ENV === "development") {
	  return {
		id: Math.floor(Math.random() * 1000) + 10,
		name: file.name,
		filename: file.name,
		// biome-ignore lint/style/useTemplate: <explanation>
		filepath: "/uploads/" + file.name,
		mime: file.type,
		date_creation: new Date().toISOString(),
		users_id: userId,
	  }
	}
  
	// Criar um FormData para enviar o arquivo
	const formData = new FormData()
	formData.append(
	  "uploadManifest",
	  JSON.stringify({
		input: {
		  name: file.name,
		  _filename: [file.name],
		},
	  }),
	)
	formData.append("filename[0]", file)
  
	// Obter o token de sessão
	const sessionToken = await initSession()
  
	// Enviar o arquivo
	const response = await fetch(`${GLPI_API_URL}/Document`, {
	  method: "POST",
	  headers: {
		"Session-Token": sessionToken,
		"App-Token": GLPI_APP_TOKEN,
	  },
	  body: formData,
	})
  
	if (!response.ok) {
	  throw new GLPIError(`Erro ao fazer upload do documento: ${response.statusText}`, response.status, "Document")
	}
  
	return response.json()
  }
  
  export async function linkDocumentToTicket(documentId: number, ticketId: number): Promise<void> {
	await fetchGLPI("Document_Item", {
	  method: "POST",
	  body: JSON.stringify({
		documents_id: documentId,
		items_id: ticketId,
		itemtype: "Ticket",
	  }),
	})
  }
  
  // Funções para usuários
  export async function getUsers(params: Record<string, string> = {}): Promise<GLPIUser[]> {
	const queryParams = new URLSearchParams(params).toString()
	return fetchGLPI<GLPIUser[]>(`User?${queryParams}`)
  }
  
  export async function getUser(id: number): Promise<GLPIUser> {
	return fetchGLPI<GLPIUser>(`User/${id}`)
  }
  
  // Funções para categorias
  export async function getCategories(): Promise<GLPICategory[]> {
	return fetchGLPI<GLPICategory[]>("ITILCategory")
  }
  
  // Funções para gerenciar categorias (admin)
  export async function createCategory(category: Partial<GLPICategory>): Promise<{ id: number }> {
	const result = await fetchGLPI<{ id: number }>("ITILCategory", {
	  method: "POST",
	  body: JSON.stringify(category),
	})
  
	// Invalida cache de categorias
	cacheManager.invalidatePattern(/^categories:/)
  
	return result
  }
  
  export async function updateCategory(id: number, category: Partial<GLPICategory>): Promise<void> {
	await fetchGLPI(`ITILCategory/${id}`, {
	  method: "PUT",
	  body: JSON.stringify(category),
	})
  
	// Invalida cache de categorias
	cacheManager.invalidatePattern(/^categories:/)
  }
  
  export async function deleteCategory(id: number): Promise<void> {
	await fetchGLPI(`ITILCategory/${id}`, {
	  method: "DELETE",
	})
  
	// Invalida cache de categorias
	cacheManager.invalidatePattern(/^categories:/)
  }
  
  // Funções de utilidade para mapear valores do GLPI
  export function mapGLPIStatusToString(status: number): string {
	const statusMap: Record<number, string> = {
	  1: "new",
	  2: "pending",
	  3: "in_progress",
	  4: "resolved",
	  5: "closed",
	  6: "rejected",
	}
	return statusMap[status] || "pending"
  }
  
  // Adicione ou atualize esta função no arquivo
  export function mapGLPIPriorityToString(priority: number): "low" | "medium" | "high" | "urgent" {
	switch (priority) {
	  case 1:
		return "low"
	  case 2:
		return "medium"
	  case 3:
		return "high"
	  case 4:
	  case 5:
		return "urgent"
	  default:
		return "medium"
	}
  }
  
  export function mapStringToGLPIStatus(status: string): number {
	const statusMap: Record<string, number> = {
	  new: 1,
	  pending: 2,
	  in_progress: 3,
	  resolved: 4,
	  closed: 5,
	  rejected: 6,
	}
	return statusMap[status] || 2
  }
  
  export function mapStringToGLPIPriority(priority: string): number {
	const priorityMap: Record<string, number> = {
	  low: 1,
	  medium: 2,
	  high: 3,
	  urgent: 4,
	  critical: 5,
	}
	return priorityMap[priority] || 2
  }
  
  // Altere a função getTicketById para getTicket
  export async function getTicket(id: number): Promise<GLPITicket> {
	return fetchGLPI<GLPITicket>(`Ticket/${id}`)
  }
  
  // Remova ou comente a função getTicketById se ela existir
  // export async function getTicketById(id: number): Promise<GLPITicket> {
  //   return fetchGLPI<GLPITicket>(`Ticket/${id}`)
  // }
  
  export async function getTicketById(id: number): Promise<GLPITicket> {
	return fetchGLPI<GLPITicket>(`Ticket/${id}`)
  }
  
  // Função para obter grupos
  export async function getGroups(params: Record<string, string> = {}): Promise<GLPIGroup[]> {
	const queryParams = new URLSearchParams(params).toString()
	const cacheKey = `groups:${queryParams}`
  
	// Tenta obter do cache primeiro
	const cachedData = cacheManager.get<GLPIGroup[]>(cacheKey)
	if (cachedData) {
	  return cachedData
	}
  
	// Se não estiver em cache, busca da API
	const data = await fetchGLPI<GLPIGroup[]>(`Group?${queryParams}`)
  
	// Armazena no cache por 5 minutos (300 segundos)
	cacheManager.set(cacheKey, data, 300)
  
	return data
  }
  
  /**
   * Obtém todos os chamados de um grupo específico
   */
  export async function getTicketsByGroup(groupId: number, params: Record<string, string> = {}): Promise<GLPITicket[]> {
	const queryParams = new URLSearchParams({
	  ...params,
	  "criteria[0][field]": "8", // Campo groups_id_assign
	  "criteria[0][searchtype]": "equals",
	  "criteria[0][value]": groupId.toString(),
	}).toString()
  
	const cacheKey = `tickets:group:${groupId}:${queryParams}`
  
	// Tenta obter do cache primeiro
	const cachedData = cacheManager.get<GLPITicket[]>(cacheKey)
	if (cachedData) {
	  return cachedData
	}
  
	// Se não estiver em cache, busca da API
	const data = await fetchGLPI<GLPITicket[]>(`Ticket?${queryParams}`)
  
	// Armazena no cache por 5 minutos (300 segundos)
	cacheManager.set(cacheKey, data, 300)
  
	return data
  }
  
  /**
   * Obtém todos os chamados de um usuário específico
   */
  export async function getTicketsByUser(userId: number, params: Record<string, string> = {}): Promise<GLPITicket[]> {
	const queryParams = new URLSearchParams({
	  ...params,
	  "criteria[0][field]": "4", // Campo users_id_assign
	  "criteria[0][searchtype]": "equals",
	  "criteria[0][value]": userId.toString(),
	}).toString()
  
	const cacheKey = `tickets:user:${userId}:${queryParams}`
  
	// Tenta obter do cache primeiro
	const cachedData = cacheManager.get<GLPITicket[]>(cacheKey)
	if (cachedData) {
	  return cachedData
	}
  
	// Se não estiver em cache, busca da API
	const data = await fetchGLPI<GLPITicket[]>(`Ticket?${queryParams}`)
  
	// Armazena no cache por 5 minutos (300 segundos)
	cacheManager.set(cacheKey, data, 300)
  
	return data
  }
  
  /**
   * Obtém todos os chamados solicitados por um usuário específico
   */
  export async function getTicketsRequestedByUser(
	userId: number,
	params: Record<string, string> = {},
  ): Promise<GLPITicket[]> {
	const queryParams = new URLSearchParams({
	  ...params,
	  "criteria[0][field]": "71", // Campo users_id_recipient
	  "criteria[0][searchtype]": "equals",
	  "criteria[0][value]": userId.toString(),
	}).toString()
  
	const cacheKey = `tickets:requested:${userId}:${queryParams}`
  
	// Tenta obter do cache primeiro
	const cachedData = cacheManager.get<GLPITicket[]>(cacheKey)
	if (cachedData) {
	  return cachedData
	}
  
	// Se não estiver em cache, busca da API
	const data = await fetchGLPI<GLPITicket[]>(`Ticket?${queryParams}`)
  
	// Armazena no cache por 5 minutos (300 segundos)
	cacheManager.set(cacheKey, data, 300)
  
	return data
  }
  
  /**
   * Obtém estatísticas de chamados
   */
  export async function getTicketStats(): Promise<{
	total: number
	byStatus: Record<string, number>
	byPriority: Record<string, number>
	byCategory: Record<string, number>
	byAssignedGroup: Record<string, number>
	byAssignedUser: Record<string, number>
  }> {
	// Em ambiente de desenvolvimento, retornar dados simulados
	if (process.env.NODE_ENV === "development") {
	  return {
		total: 42,
		byStatus: {
		  new: 10,
		  pending: 15,
		  in_progress: 8,
		  resolved: 5,
		  closed: 4,
		},
		byPriority: {
		  low: 12,
		  medium: 18,
		  high: 8,
		  urgent: 4,
		},
		byCategory: {
		  "1": 15, // Matrícula aluno
		  "2": 12, // Programação acadêmica
		  "3": 15, // Regime de acompanhamento
		},
		byAssignedGroup: {
		  "1": 20, // Secretaria Acadêmica
		  "2": 12, // Suporte Técnico
		  "3": 10, // Coordenação de Cursos
		},
		byAssignedUser: {
		  "1": 8, // Admin
		  "2": 12, // Coordenador
		  "3": 10, // Secretária
		  "4": 12, // Técnico
		},
	  }
	}
  
	// Em produção, buscar da API
	// Nota: O GLPI tem endpoints específicos para estatísticas, mas vamos simular aqui
	// com múltiplas consultas
  
	const [allTickets, categories, users, groups] = await Promise.all([
	  getTickets({ limit: "9999" }),
	  getCategories(),
	  getUsers(),
	  getGroups(),
	])
  
	// Processar os dados para gerar estatísticas
	const stats = {
	  total: allTickets.length,
	  byStatus: {} as Record<string, number>,
	  byPriority: {} as Record<string, number>,
	  byCategory: {} as Record<string, number>,
	  byAssignedGroup: {} as Record<string, number>,
	  byAssignedUser: {} as Record<string, number>,
	}
  
	// Contar por status
	// biome-ignore lint/complexity/noForEach: <explanation>
  		allTickets.forEach((ticket) => {
	  const status = mapGLPIStatusToString(ticket.status)
	  stats.byStatus[status] = (stats.byStatus[status] || 0) + 1
  
	  const priority = mapGLPIPriorityToString(ticket.priority)
	  stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1
  
	  const categoryId = ticket.itilcategories_id.toString()
	  stats.byCategory[categoryId] = (stats.byCategory[categoryId] || 0) + 1
  
	  if (ticket.groups_id_assign) {
		const groupId = ticket.groups_id_assign.toString()
		stats.byAssignedGroup[groupId] = (stats.byAssignedGroup[groupId] || 0) + 1
	  }
  
	  if (ticket.users_id_assign) {
		const userId = ticket.users_id_assign.toString()
		stats.byAssignedUser[userId] = (stats.byAssignedUser[userId] || 0) + 1
	  }
	})
  
	return stats
  }
  
  /**
   * Obtém dados para relatório de tempo médio de resolução
   */
  export async function getResolutionTimeReport(params: {
	startDate?: string
	endDate?: string
	categoryId?: number
	priorityId?: number
  }): Promise<{
	averageResolutionTime: number // em horas
	ticketsByResolutionTime: { id: number; name: string; resolutionTime: number }[]
  }> {
	// Em ambiente de desenvolvimento, retornar dados simulados
	if (process.env.NODE_ENV === "development") {
	  return {
		averageResolutionTime: 24.5, // 24.5 horas em média
		ticketsByResolutionTime: [
		  { id: 1, name: "Problema com matrícula de aluno", resolutionTime: 12.3 },
		  { id: 2, name: "Erro na programação acadêmica", resolutionTime: 36.7 },
		  { id: 3, name: "Solicitação de regime de acompanhamento", resolutionTime: 24.5 },
		],
	  }
	}
  
	// Em produção, buscar da API
	// Construir os critérios de busca
	const criteria: Record<string, string> = {
	  "criteria[0][field]": "30", // Campo date_mod (data de modificação)
	  "criteria[0][searchtype]": "morethan",
	  "criteria[0][value]": params.startDate || "2023-01-01",
	}
  
	if (params.endDate) {
	  criteria["criteria[1][link]"] = "AND"
	  criteria["criteria[1][field]"] = "30" // Campo date_mod
	  criteria["criteria[1][searchtype]"] = "lessthan"
	  criteria["criteria[1][value]"] = params.endDate
	}
  
	if (params.categoryId) {
	  const nextIndex = Object.keys(criteria).length / 3
	  criteria[`criteria[${nextIndex}][link]`] = "AND"
	  criteria[`criteria[${nextIndex}][field]`] = "7" // Campo itilcategories_id
	  criteria[`criteria[${nextIndex}][searchtype]`] = "equals"
	  criteria[`criteria[${nextIndex}][value]`] = params.categoryId.toString()
	}
  
	if (params.priorityId) {
	  const nextIndex = Object.keys(criteria).length / 3
	  criteria[`criteria[${nextIndex}][link]`] = "AND"
	  criteria[`criteria[${nextIndex}][field]`] = "3" // Campo priority
	  criteria[`criteria[${nextIndex}][searchtype]`] = "equals"
	  criteria[`criteria[${nextIndex}][value]`] = params.priorityId.toString()
	}
  
	// Adicionar critério para tickets resolvidos ou fechados
	const nextIndex = Object.keys(criteria).length / 3
	criteria[`criteria[${nextIndex}][link]`] = "AND"
	criteria[`criteria[${nextIndex}][field]`] = "12" // Campo status
	criteria[`criteria[${nextIndex}][searchtype]`] = "equals"
	criteria[`criteria[${nextIndex}][value]`] = "4,5" // Resolvido ou fechado
  
	const resolvedTickets = await getTickets(criteria)
  
	// Calcular tempo de resolução para cada ticket
	const ticketsWithResolutionTime = resolvedTickets.map((ticket) => {
	  const creationDate = new Date(ticket.date_creation)
	  const resolutionDate = new Date(ticket.date_mod)
	  const resolutionTimeMs = resolutionDate.getTime() - creationDate.getTime()
	  const resolutionTimeHours = resolutionTimeMs / (1000 * 60 * 60) // Converter para horas
  
	  return {
		id: ticket.id,
		name: ticket.name,
		resolutionTime: resolutionTimeHours,
	  }
	})
  
	// Calcular tempo médio de resolução
	const totalResolutionTime = ticketsWithResolutionTime.reduce((sum, ticket) => sum + ticket.resolutionTime, 0)
	const averageResolutionTime =
	  ticketsWithResolutionTime.length > 0 ? totalResolutionTime / ticketsWithResolutionTime.length : 0
  
	return {
	  averageResolutionTime,
	  ticketsByResolutionTime: ticketsWithResolutionTime,
	}
  }
  
  /**
   * Obtém dados para relatório de satisfação do usuário
   * Nota: Esta é uma função simulada, pois o GLPI pode não ter esta funcionalidade diretamente
   */
  export async function getSatisfactionReport(): Promise<{
	averageSatisfaction: number // 0-5
	satisfactionByCategory: Record<string, number>
	satisfactionByTechnician: Record<string, number>
  }> {
	// Em ambiente de desenvolvimento, retornar dados simulados
	if (process.env.NODE_ENV === "development") {
	  return {
		averageSatisfaction: 4.2,
		satisfactionByCategory: {
		  "1": 4.5, // Matrícula aluno
		  "2": 3.8, // Programação acadêmica
		  "3": 4.3, // Regime de acompanhamento
		},
		satisfactionByTechnician: {
		  "1": 4.7, // Admin
		  "2": 4.0, // Coordenador
		  "3": 4.2, // Secretária
		  "4": 3.9, // Técnico
		},
	  }
	}
  
	// Em produção, buscar da API
	// Nota: Esta é uma implementação simulada, você precisaria adaptar para a API real do GLPI
  
	return {
	  averageSatisfaction: 4.2,
	  satisfactionByCategory: {
		"1": 4.5,
		"2": 3.8,
		"3": 4.3,
	  },
	  satisfactionByTechnician: {
		"1": 4.7,
		"2": 4.0,
		"3": 4.2,
		"4": 3.9,
	  },
	}
  }
  