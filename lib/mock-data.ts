// Mock data para simulação local

// Definindo uma interface local para documentos
interface MockDocument {
  id: number
  name: string
  filename: string
  filepath: string
  mimetype: string
  filesize: number
  date_creation: string
  date_mod: string
  users_id: number
  tickets_id?: number // Opcional aqui
}

// Usuários simulados
export const mockUsers = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@pucgoias.edu.br",
    password: "admin123",
    role: "admin",
    group_id: "1",
  },
  {
    id: "2",
    name: "Usuário Comum",
    email: "usuario@pucgoias.edu.br",
    password: "user123",
    role: "user",
    group_id: "2",
  },
  {
    id: "3",
    name: "Suporte Técnico",
    email: "suporte@pucgoias.edu.br",
    password: "suporte123",
    role: "support",
    group_id: "3",
  },
]

// Grupos simulados
export const mockGroups = [
  { id: 1, name: "Administradores", completename: "Administradores" },
  { id: 2, name: "Coordenadores", completename: "Coordenadores" },
  { id: 3, name: "Suporte Técnico", completename: "Suporte Técnico" },
  { id: 4, name: "Professores", completename: "Professores" },
]

// Categorias simuladas - APENAS as três definidas
export const mockCategories = [
  { id: 1, name: "Programação Acadêmica", completename: "Programação Acadêmica" },
  { id: 2, name: "Matrícula Aluno", completename: "Matrícula Aluno" },
  { id: 3, name: "Regime de Acompanhamento", completename: "Regime de Acompanhamento" },
]

// Chamados simulados
export const mockTickets = [
  {
    id: 1,
    name: "Problema com matrícula em disciplina",
    content: "Não consigo me matricular na disciplina de Cálculo I. O sistema apresenta erro.",
    status: 1, // Novo
    date_creation: "2023-11-15T10:30:00",
    date_mod: "2023-11-15T10:30:00",
    priority: 3, // Alta
    urgency: 3,
    impact: 3,
    itilcategories_id: 2, // Matrícula Aluno
    users_id_recipient: 2, // Usuário comum
    requesttypes_id: 1,
    entities_id: 1,
  },
  {
    id: 2,
    name: "Dúvida sobre programação acadêmica",
    content: "Preciso de informações sobre a grade curricular do meu curso.",
    status: 2, // Pendente
    date_creation: "2023-11-14T14:45:00",
    date_mod: "2023-11-14T15:20:00",
    priority: 2, // Média
    urgency: 2,
    impact: 2,
    itilcategories_id: 1, // Programação Acadêmica
    users_id_recipient: 2, // Usuário comum
    requesttypes_id: 1,
    entities_id: 1,
  },
  {
    id: 3,
    name: "Solicitação de regime de acompanhamento",
    content: "Gostaria de solicitar regime especial de acompanhamento devido a questões de saúde.",
    status: 3, // Em andamento
    date_creation: "2023-11-13T09:15:00",
    date_mod: "2023-11-13T11:30:00",
    priority: 2, // Média
    urgency: 2,
    impact: 2,
    itilcategories_id: 3, // Regime de Acompanhamento
    users_id_recipient: 2, // Usuário comum
    users_id_assign: 3, // Suporte técnico
    requesttypes_id: 1,
    entities_id: 1,
  },
  {
    id: 4,
    name: "Problema na matrícula online",
    content: "O sistema de matrícula online não está funcionando corretamente.",
    status: 4, // Resolvido
    date_creation: "2023-11-10T16:20:00",
    date_mod: "2023-11-12T10:15:00",
    closedate: "2023-11-12T10:15:00",
    priority: 4, // Urgente
    urgency: 4,
    impact: 4,
    itilcategories_id: 2, // Matrícula Aluno
    users_id_recipient: 2, // Usuário comum
    users_id_assign: 3, // Suporte técnico
    requesttypes_id: 1,
    entities_id: 1,
  },
  {
    id: 5,
    name: "Informações sobre programação de aulas",
    content: "Preciso saber sobre mudanças na programação das aulas do próximo semestre.",
    status: 1, // Novo
    date_creation: "2023-11-15T09:00:00",
    date_mod: "2023-11-15T09:00:00",
    priority: 1, // Baixa
    urgency: 1,
    impact: 1,
    itilcategories_id: 1, // Programação Acadêmica
    users_id_recipient: 2, // Usuário comum
    requesttypes_id: 1,
    entities_id: 1,
  },
]

// Histórico de chamados simulado
export const mockTicketHistory = [
  {
    id: 1,
    itemtype: "Ticket",
    items_id: 3,
    date_mod: "2023-11-13T09:15:00",
    user_name: "Usuário Comum",
    id_search_option: 1,
    old_value: "",
    new_value: "Criação do chamado",
  },
  {
    id: 2,
    itemtype: "Ticket",
    items_id: 3,
    date_mod: "2023-11-13T10:30:00",
    user_name: "Administrador",
    id_search_option: 12,
    old_value: "1",
    new_value: "3",
    field: "status",
  },
  {
    id: 3,
    itemtype: "Ticket",
    items_id: 3,
    date_mod: "2023-11-13T11:30:00",
    user_name: "Suporte Técnico",
    id_search_option: 5,
    old_value: "",
    new_value: "Atribuído ao suporte técnico",
    field: "assign",
  },
]

// Followups simulados
export const mockFollowups = [
  {
    id: 1,
    tickets_id: 3,
    content: "Gostaria de solicitar regime especial de acompanhamento devido a questões de saúde.",
    is_private: 0,
    date_creation: "2023-11-13T10:45:00",
    date_mod: "2023-11-13T10:45:00",
    users_id: 3,
    user_name: "Suporte Técnico",
  },
  {
    id: 2,
    tickets_id: 3,
    content: "Analisando a solicitação para regime especial de acompanhamento.",
    is_private: 0,
    date_creation: "2023-11-13T11:30:00",
    date_mod: "2023-11-13T11:30:00",
    users_id: 3,
    user_name: "Suporte Técnico",
  },
  {
    id: 3,
    tickets_id: 4,
    content: "Problema identificado no sistema de matrícula online. Estamos trabalhando na correção.",
    is_private: 0,
    date_creation: "2023-11-11T09:20:00",
    date_mod: "2023-11-11T09:20:00",
    users_id: 3,
    user_name: "Suporte Técnico",
  },
  {
    id: 4,
    tickets_id: 4,
    content: "Sistema de matrícula online corrigido e funcionando normalmente.",
    is_private: 0,
    date_creation: "2023-11-12T10:15:00",
    date_mod: "2023-11-12T10:15:00",
    users_id: 3,
    user_name: "Suporte Técnico",
  },
]

// Documentos simulados
export const mockDocuments: MockDocument[] = [
  {
    id: 1,
    name: "declaracao_matricula.pdf",
    filename: "declaracao_matricula.pdf",
    filepath: "/uploads/declaracao_matricula.pdf",
    mimetype: "application/pdf",
    filesize: 307200,
    date_creation: "2023-11-15T10:30:00",
    date_mod: "2023-11-15T10:30:00",
    users_id: 2,
    tickets_id: 1,
  },
  {
    id: 2,
    name: "grade_curricular.pdf",
    filename: "grade_curricular.pdf",
    filepath: "/uploads/grade_curricular.pdf",
    mimetype: "application/pdf",
    filesize: 614400,
    date_creation: "2023-11-14T14:45:00",
    date_mod: "2023-11-14T14:45:00",
    users_id: 2,
    tickets_id: 2,
  },
]

// Estatísticas simuladas
export const mockStats = {
  total: 5,
  new: 2,
  pending: 1,
  in_progress: 1,
  resolved: 1,
  closed: 0,
  by_category: [
    { category: "Programação Acadêmica", count: 2 },
    { category: "Matrícula Aluno", count: 2 },
    { category: "Regime de Acompanhamento", count: 1 },
  ],
  by_priority: [
    { priority: "Baixa", count: 1 },
    { priority: "Média", count: 2 },
    { priority: "Alta", count: 1 },
    { priority: "Urgente", count: 1 },
  ],
}

// Função para gerar um ID único
export function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString()
}

// Função para obter data atual formatada
export function getCurrentDate() {
  return new Date().toISOString()
}

// Armazenamento local para dados simulados que podem ser modificados durante a execução
let localTickets = [...mockTickets]
let localFollowups = [...mockFollowups]
let localDocuments: MockDocument[] = [...mockDocuments]
let nextTicketId = mockTickets.length + 1
let nextFollowupId = mockFollowups.length + 1
let nextDocumentId = mockDocuments.length + 1

// Funções para manipular dados simulados
export const mockDataService = {
  // Tickets
  getTickets: (filters = {}) => {
    return [...localTickets]
  },

  getTicketById: (id: number) => {
    return localTickets.find((ticket) => ticket.id === id)
  },

  createTicket: (ticketData: any) => {
    const newTicket = {
      ...ticketData,
      id: nextTicketId++,
      date_creation: getCurrentDate(),
      date_mod: getCurrentDate(),
      status: 1, // Novo
    }
    localTickets.push(newTicket)
    return newTicket
  },

  updateTicket: (id: number, ticketData: any) => {
    const index = localTickets.findIndex((ticket) => ticket.id === id)
    if (index !== -1) {
      localTickets[index] = {
        ...localTickets[index],
        ...ticketData,
        date_mod: getCurrentDate(),
      }
      return localTickets[index]
    }
    return null
  },

  // Followups
  getTicketFollowups: (ticketId: number) => {
    return localFollowups.filter((followup) => followup.tickets_id === ticketId)
  },

  addTicketFollowup: (followupData: any) => {
    const newFollowup = {
      ...followupData,
      id: nextFollowupId++,
      date_creation: getCurrentDate(),
      date_mod: getCurrentDate(),
    }
    localFollowups.push(newFollowup)
    return newFollowup
  },

  // Documents
  uploadDocument: (file: any, userId: number): MockDocument => {
    const newDocument: MockDocument = {
      id: nextDocumentId++,
      name: file.name,
      filename: file.name,
      filepath: `/uploads/${file.name}`,
      mimetype: file.type,
      filesize: file.size,
      date_creation: getCurrentDate(),
      date_mod: getCurrentDate(),
      users_id: userId,
      // Não definimos tickets_id aqui, será definido depois
    }
    localDocuments.push(newDocument)
    return newDocument
  },

  linkDocumentToTicket: (documentId: number, ticketId: number) => {
    const index = localDocuments.findIndex((doc) => doc.id === documentId)
    if (index !== -1) {
      localDocuments[index].tickets_id = ticketId
      return true
    }
    return false
  },

  getTicketDocuments: (ticketId: number) => {
    return localDocuments.filter((doc) => doc.tickets_id === ticketId)
  },

  // Reset data (útil para testes)
  resetData: () => {
    localTickets = [...mockTickets]
    localFollowups = [...mockFollowups]
    localDocuments = [...mockDocuments]
    nextTicketId = mockTickets.length + 1
    nextFollowupId = mockFollowups.length + 1
    nextDocumentId = mockDocuments.length + 1
  },
}
