/**
 * Serviço para comunicação com a API do GLPI
 */

// Adicione esta classe de erro personalizada no início do arquivo
export class GLPIError extends Error {
	status: number;
	endpoint: string;

	constructor(message: string, status: number, endpoint: string) {
		super(message);
		this.name = "GLPIError";
		this.status = status;
		this.endpoint = endpoint;
	}
}

// Constantes para a API
const GLPI_API_URL =
	process.env.NEXT_PUBLIC_GLPI_API_URL ||
	"http://192.211.51.226:8686/apirest.php";
const GLPI_APP_TOKEN = process.env.GLPI_APP_TOKEN || "";
const GLPI_USER_TOKEN = process.env.GLPI_USER_TOKEN || "";

// Interface para o token de sessão
interface SessionToken {
	sessionToken: string;
	expiresAt: number;
}

// Cache para o token de sessão
let sessionTokenCache: SessionToken | null = null;

/**
 * Inicializa uma sessão com o GLPI
 */
export async function initSession(): Promise<string> {
	// Se já temos um token válido em cache, retorna ele
	if (sessionTokenCache && sessionTokenCache.expiresAt > Date.now()) {
		return sessionTokenCache.sessionToken;
	}

	try {
		// Em ambiente de desenvolvimento, simular um token de sessão
		if (process.env.NODE_ENV === "development") {
			const mockToken = `dev-session-token-${Date.now()}`;
			sessionTokenCache = {
				sessionToken: mockToken,
				expiresAt: Date.now() + 3600000, // 1 hora
			};
			return mockToken;
		}

		const response = await fetch(`${GLPI_API_URL}/initSession`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `user_token ${GLPI_USER_TOKEN}`,
				"App-Token": GLPI_APP_TOKEN,
			},
		});

		if (!response.ok) {
			throw new Error(`Erro ao iniciar sessão: ${response.statusText}`);
		}

		const data = await response.json();

		// Armazena o token em cache (válido por 1 hora)
		sessionTokenCache = {
			sessionToken: data.session_token,
			expiresAt: Date.now() + 3600000, // 1 hora
		};

		return data.session_token;
	} catch (error) {
		console.error("Erro ao iniciar sessão com GLPI:", error);

		// Em ambiente de desenvolvimento, retornar um token simulado
		if (process.env.NODE_ENV === "development") {
			const mockToken = `dev-session-token-${Date.now()}`;
			sessionTokenCache = {
				sessionToken: mockToken,
				expiresAt: Date.now() + 3600000, // 1 hora
			};
			return mockToken;
		}

		throw error;
	}
}

/**
 * Encerra uma sessão com o GLPI
 */
export async function killSession(sessionToken: string): Promise<void> {
	try {
		// Em ambiente de desenvolvimento, apenas limpar o cache
		if (process.env.NODE_ENV === "development") {
			sessionTokenCache = null;
			return;
		}

		await fetch(`${GLPI_API_URL}/killSession`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"Session-Token": sessionToken,
				"App-Token": GLPI_APP_TOKEN,
			},
		});

		// Limpa o cache
		sessionTokenCache = null;
	} catch (error) {
		console.error("Erro ao encerrar sessão com GLPI:", error);
	}
}

// Modifique a função fetchGLPI para usar o novo tratamento de erros
export async function fetchGLPI<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	try {
		// Em ambiente de desenvolvimento, retornar dados simulados
		if (process.env.NODE_ENV === "development") {
			return getMockData<T>(endpoint, options) as T;
		}

		const sessionToken = await initSession();

		const response = await fetch(`${GLPI_API_URL}/${endpoint}`, {
			...options,
			headers: {
				"Content-Type": "application/json",
				"Session-Token": sessionToken,
				"App-Token": GLPI_APP_TOKEN,
				...options.headers,
			},
		});

		if (!response.ok) {
			// Tentar obter detalhes do erro da resposta
			let errorDetails = "";
			try {
				const errorData = await response.json();
				errorDetails = errorData.message || JSON.stringify(errorData);
			} catch {
				errorDetails = response.statusText;
			}

			throw new GLPIError(
				`Erro na requisição: ${errorDetails}`,
				response.status,
				endpoint,
			);
		}

		return await response.json();
	} catch (error) {
		if (error instanceof GLPIError) {
			console.error(
				`Erro GLPI [${error.status}] em ${error.endpoint}:`,
				error.message,
			);
			throw error;
		}

		console.error(`Erro ao acessar ${endpoint}:`, error);
		throw new GLPIError(
			error instanceof Error ? error.message : "Erro desconhecido",
			500,
			endpoint,
		);
	}
}

// Função para obter dados simulados em ambiente de desenvolvimento
function getMockData<T>(endpoint: string, options: RequestInit = {}): T {
	// Extrair o tipo de endpoint (Ticket, User, etc.)
	const endpointType = endpoint.split("/")[0].split("?")[0];

	// Dados simulados para diferentes tipos de endpoints
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const mockData: Record<string, any> = {
		Ticket: [
			{
				id: 1,
				name: "Problema com matrícula de aluno",
				content:
					"Não consigo acessar o sistema de matrícula para o aluno João Silva.",
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
				content:
					"Disciplina de Cálculo II não aparece na grade do curso de Engenharia.",
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
				content:
					"Aluna Maria Souza precisa de regime especial por motivos de saúde.",
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
			},
			{
				id: 2,
				name: "Coordenador",
				firstname: "João",
				realname: "Silva",
				email: "coordenador@pucgoias.edu.br",
				phone: "(62) 3946-1001",
				entities_id: 1,
			},
			{
				id: 3,
				name: "Secretária",
				firstname: "Maria",
				realname: "Oliveira",
				email: "secretaria@pucgoias.edu.br",
				phone: "(62) 3946-1002",
				entities_id: 1,
			},
			{
				id: 4,
				name: "Técnico",
				firstname: "Pedro",
				realname: "Santos",
				email: "suporte@pucgoias.edu.br",
				phone: "(62) 3946-1003",
				entities_id: 1,
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
	};

	// Verificar se é uma operação POST
	if (options.method === "POST") {
		const body = options.body ? JSON.parse(options.body.toString()) : {};

		// Simular criação de um novo item
		if (endpointType === "Ticket") {
			return { id: Math.floor(Math.random() * 1000) + 10 } as T;
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else if (endpointType === "TicketFollowup") {
			return { id: Math.floor(Math.random() * 1000) + 10 } as T;
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else if (endpointType === "Document") {
			return {
				id: Math.floor(Math.random() * 1000) + 10,
				name: "documento.pdf",
			} as T;
		}
	}

	// Verificar se é uma operação GET para um item específico
	if (endpoint.includes("/") && !endpoint.endsWith("/")) {
		const parts = endpoint.split("/");
		const id = Number.parseInt(parts[1]);

		if (mockData[endpointType]) {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const item = mockData[endpointType].find((item: any) => item.id === id);
			return item as T;
		}
	}

	// Retornar lista de itens
	return (mockData[endpointType] || []) as T;
}

// Interfaces para os tipos de dados do GLPI
export interface GLPITicket {
	id: number;
	name: string;
	content: string;
	status: number;
	priority: number;
	date_creation: string;
	date_mod: string;
	entities_id: number;
	users_id_recipient: number;
	users_id_assign?: number; // Responsável individual (atribuído a)
	groups_id_assign?: number; // Grupo responsável
	time_to_resolve?: string;
	type: number;
	itilcategories_id: number;
	urgency: number;
	impact: number;
}

export interface GLPIUser {
	id: number;
	name: string;
	firstname: string;
	realname: string;
	email: string;
	phone: string;
	entities_id: number;
}

export interface GLPICategory {
	id: number;
	name: string;
	completename: string;
	comment: string;
	entities_id: number;
}

export interface GLPITicketFollowup {
	id: number;
	tickets_id: number;
	users_id: number;
	content: string;
	date_creation: string;
	date_mod: string;
}

export interface GLPIDocument {
	id: number;
	name: string;
	filename: string;
	filepath: string;
	mime: string;
	date_creation: string;
	users_id: number;
}

// Adicione esta interface para grupos
export interface GLPIGroup {
	id: number;
	name: string;
	comment?: string;
	entities_id: number;
}

// Importe o gerenciador de cache
import { cacheManager } from "./cache";

// Modifique a função getTickets para usar cache
export async function getTickets(
	params: Record<string, string> = {},
): Promise<GLPITicket[]> {
	const queryParams = new URLSearchParams(params).toString();
	const cacheKey = `tickets:${queryParams}`;

	// Tenta obter do cache primeiro
	const cachedData = cacheManager.get<GLPITicket[]>(cacheKey);
	if (cachedData) {
		return cachedData;
	}

	// Se não estiver em cache, busca da API
	const data = await fetchGLPI<GLPITicket[]>(`Ticket?${queryParams}`);

	// Armazena no cache por 5 minutos (300 segundos)
	cacheManager.set(cacheKey, data, 300);

	return data;
}

// Modifique a função createTicket para invalidar o cache
export async function createTicket(
	ticket: Partial<GLPITicket>,
): Promise<{ id: number }> {
	const result = await fetchGLPI<{ id: number }>("Ticket", {
		method: "POST",
		body: JSON.stringify(ticket),
	});

	// Invalida todos os caches relacionados a tickets
	cacheManager.invalidatePattern(/^tickets:/);

	return result;
}

export async function updateTicket(
	id: number,
	ticket: Partial<GLPITicket>,
): Promise<void> {
	await fetchGLPI(`Ticket/${id}`, {
		method: "PUT",
		body: JSON.stringify(ticket),
	});

	// Invalida todos os caches relacionados a tickets
	cacheManager.invalidatePattern(/^tickets:/);
}

// Funções para followups (comentários em tickets)
export async function getTicketFollowups(
	ticketId: number,
): Promise<GLPITicketFollowup[]> {
	return fetchGLPI<GLPITicketFollowup[]>(`Ticket/${ticketId}/TicketFollowup`);
}

export async function addTicketFollowup(
	ticketId: number,
	content: string,
	userId: number,
): Promise<{ id: number }> {
	return fetchGLPI<{ id: number }>("TicketFollowup", {
		method: "POST",
		body: JSON.stringify({
			tickets_id: ticketId,
			users_id: userId,
			content,
		}),
	});
}

// Funções para documentos (anexos)
export async function uploadDocument(
	file: File,
	userId: number,
): Promise<GLPIDocument> {
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
		};
	}

	// Criar um FormData para enviar o arquivo
	const formData = new FormData();
	formData.append(
		"uploadManifest",
		JSON.stringify({
			input: {
				name: file.name,
				_filename: [file.name],
			},
		}),
	);
	formData.append("filename[0]", file);

	// Obter o token de sessão
	const sessionToken = await initSession();

	// Enviar o arquivo
	const response = await fetch(`${GLPI_API_URL}/Document`, {
		method: "POST",
		headers: {
			"Session-Token": sessionToken,
			"App-Token": GLPI_APP_TOKEN,
		},
		body: formData,
	});

	if (!response.ok) {
		throw new Error(
			`Erro ao fazer upload do documento: ${response.statusText}`,
		);
	}

	return response.json();
}

export async function linkDocumentToTicket(
	documentId: number,
	ticketId: number,
): Promise<void> {
	await fetchGLPI("Document_Item", {
		method: "POST",
		body: JSON.stringify({
			documents_id: documentId,
			items_id: ticketId,
			itemtype: "Ticket",
		}),
	});
}

// Funções para usuários
export async function getUsers(
	params: Record<string, string> = {},
): Promise<GLPIUser[]> {
	const queryParams = new URLSearchParams(params).toString();
	return fetchGLPI<GLPIUser[]>(`User?${queryParams}`);
}

export async function getUser(id: number): Promise<GLPIUser> {
	return fetchGLPI<GLPIUser>(`User/${id}`);
}

// Funções para categorias
export async function getCategories(): Promise<GLPICategory[]> {
	return fetchGLPI<GLPICategory[]>("ITILCategory");
}

// Funções para gerenciar categorias (admin)
export async function createCategory(
	category: Partial<GLPICategory>,
): Promise<{ id: number }> {
	const result = await fetchGLPI<{ id: number }>("ITILCategory", {
		method: "POST",
		body: JSON.stringify(category),
	});

	// Invalida cache de categorias
	cacheManager.invalidatePattern(/^categories:/);

	return result;
}

export async function updateCategory(
	id: number,
	category: Partial<GLPICategory>,
): Promise<void> {
	await fetchGLPI(`ITILCategory/${id}`, {
		method: "PUT",
		body: JSON.stringify(category),
	});

	// Invalida cache de categorias
	cacheManager.invalidatePattern(/^categories:/);
}

export async function deleteCategory(id: number): Promise<void> {
	await fetchGLPI(`ITILCategory/${id}`, {
		method: "DELETE",
	});

	// Invalida cache de categorias
	cacheManager.invalidatePattern(/^categories:/);
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
	};
	return statusMap[status] || "pending";
}

export function mapGLPIPriorityToString(priority: number): string {
	const priorityMap: Record<number, string> = {
		1: "low",
		2: "medium",
		3: "high",
		4: "urgent",
		5: "critical",
	};
	return priorityMap[priority] || "medium";
}

export function mapStringToGLPIStatus(status: string): number {
	const statusMap: Record<string, number> = {
		new: 1,
		pending: 2,
		in_progress: 3,
		resolved: 4,
		closed: 5,
		rejected: 6,
	};
	return statusMap[status] || 2;
}

export function mapStringToGLPIPriority(priority: string): number {
	const priorityMap: Record<string, number> = {
		low: 1,
		medium: 2,
		high: 3,
		urgent: 4,
		critical: 5,
	};
	return priorityMap[priority] || 2;
}

export async function getTicket(id: number): Promise<GLPITicket> {
	return fetchGLPI<GLPITicket>(`Ticket/${id}`);
}

// Função para obter grupos
export async function getGroups(
	params: Record<string, string> = {},
): Promise<GLPIGroup[]> {
	const queryParams = new URLSearchParams(params).toString();
	const cacheKey = `groups:${queryParams}`;

	// Tenta obter do cache primeiro
	const cachedData = cacheManager.get<GLPIGroup[]>(cacheKey);
	if (cachedData) {
		return cachedData;
	}

	// Se não estiver em cache, busca da API
	const data = await fetchGLPI<GLPIGroup[]>(`Group?${queryParams}`);

	// Armazena no cache por 5 minutos (300 segundos)
	cacheManager.set(cacheKey, data, 300);

	return data;
}
