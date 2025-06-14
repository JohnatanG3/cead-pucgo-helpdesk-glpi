import { errorHandler } from "./error-handler"

// Interface para notificações
export interface Notification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: "info" | "warning" | "success" | "error"
  link?: string
  userId: string
  relatedItemId?: string
  relatedItemType?: string
}

// Cache local para notificações
let notificationsCache: Notification[] = []
let listeners: Array<(notifications: Notification[]) => void> = []

// Simular alguns dados para desenvolvimento
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Novo chamado atribuído",
    message: "Um novo chamado foi atribuído a você",
    timestamp: new Date().toISOString(),
    read: false,
    type: "info",
    userId: "1",
    link: "/admin/tickets/1",
  },
  {
    id: "2",
    title: "Chamado atualizado",
    message: "O chamado #2 foi atualizado por um administrador",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: true,
    type: "info",
    userId: "1",
    link: "/admin/tickets/2",
  },
  {
    id: "3",
    title: "Prazo expirando",
    message: "O prazo para resolução do chamado #3 está expirando",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    type: "warning",
    userId: "1",
    link: "/admin/tickets/3",
  },
]

// Inicializar o cache com dados simulados
notificationsCache = [...mockNotifications]

// Função para obter notificações do usuário atual
export function getNotifications(): Notification[] {
  return notificationsCache
}

// Função para obter notificações não lidas
export function getUnreadNotifications(): Notification[] {
  return notificationsCache.filter((notification) => !notification.read)
}

// Função para marcar uma notificação como lida
export function markAsRead(notificationId: string): boolean {
  const index = notificationsCache.findIndex((n) => n.id === notificationId)

  if (index !== -1) {
    notificationsCache[index] = {
      ...notificationsCache[index],
      read: true,
    }

    // Notificar todos os ouvintes
    notifyListeners()
    return true
  }
  return false
}

// Função para criar uma nova notificação
export function createNotification(
  title: string,
  message: string,
  type: "info" | "warning" | "success" | "error",
  userId = "1", // Para desenvolvimento
  options?: { link?: string; relatedItemId?: string; relatedItemType?: string },
): Notification {
  const newNotification: Notification = {
    id: Date.now().toString(),
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type,
    userId,
    ...options,
  }

  // Adicionar ao cache
  notificationsCache = [newNotification, ...notificationsCache]

  // Notificar todos os ouvintes
  notifyListeners()

  return newNotification
}

// Função para excluir uma notificação
export function deleteNotification(notificationId: string): boolean {
  const initialLength = notificationsCache.length
  notificationsCache = notificationsCache.filter((n) => n.id !== notificationId)

  // Se a quantidade mudou, houve alteração
  if (initialLength !== notificationsCache.length) {
    // Notificar todos os ouvintes
    notifyListeners()
    return true
  }
  return false
}

// Função para marcar todas as notificações como lidas
export function markAllAsRead(): boolean {
  if (notificationsCache.some((n) => !n.read)) {
    notificationsCache = notificationsCache.map((n) => ({ ...n, read: true }))

    // Notificar todos os ouvintes
    notifyListeners()
    return true
  }
  return false
}

// Função para assinar mudanças nas notificações
export function subscribe(listener: (notifications: Notification[]) => void): () => void {
  listeners.push(listener)

  // Retorna a função para cancelar a assinatura
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

// Função para notificar todos os ouvintes sobre mudanças
function notifyListeners(): void {
  listeners.forEach((listener) => {
    listener([...notificationsCache])
  })
}

// Função para tratar erros da API
export function handleApiError(error: unknown, message: string): void {
  // Criar uma notificação de erro para o usuário
  createNotification("Erro", message, "error")

  // Registrar o erro com o gerenciador de erros
  try {
    errorHandler(message, error)
  } catch (e) {
    // Apenas registrar, não relançar
    console.error("Erro ao processar erro da API:", e)
  }
}

// Exportar todas as funções como um objeto
export const notificationService = {
  getNotifications,
  getUnreadNotifications,
  markAsRead,
  createNotification,
  deleteNotification,
  markAllAsRead,
  subscribe,
  handleApiError,
}
