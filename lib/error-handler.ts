// Sistema de gerenciamento de erros para a aplicação

// Tipos de erros que podem ocorrer na aplicação
export type ErrorType =
  | "auth"
  | "network"
  | "validation"
  | "server"
  | "permission"
  | "not_found"
  | "timeout"
  | "unknown"

// Interface para erros da aplicação
export interface AppError {
  message: string
  type: ErrorType
  originalError?: Error
  context?: Record<string, unknown>
  timestamp: Date
  code?: string
}

// Classe para erros da aplicação
export class ApplicationError extends Error {
  type: ErrorType
  context?: Record<string, unknown>
  timestamp: Date
  code?: string

  constructor(message: string, type: ErrorType = "unknown", context?: Record<string, unknown>, code?: string) {
    super(message)
    this.name = "ApplicationError"
    this.type = type
    this.context = context
    this.timestamp = new Date()
    this.code = code
  }

  // Método para obter mensagem amigável ao usuário
  getUserFriendlyMessage(): string {
    switch (this.type) {
      case "auth":
        return "Erro de autenticação. Por favor, faça login novamente."
      case "network":
        return "Erro de conexão. Verifique sua internet e tente novamente."
      case "validation":
        return "Os dados fornecidos são inválidos. Verifique e tente novamente."
      case "server":
        return "Erro no servidor. Por favor, tente novamente mais tarde."
      case "permission":
        return "Você não tem permissão para realizar esta ação."
      case "not_found":
        return "O recurso solicitado não foi encontrado."
      case "timeout":
        return "A operação excedeu o tempo limite. Tente novamente."
      default:
        return this.message || "Ocorreu um erro inesperado. Por favor, tente novamente."
    }
  }
}

// Função para converter erros genéricos em ApplicationError
export function normalizeError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error
  }

  if (error instanceof Error) {
    // Detectar erros de rede
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return new ApplicationError("Erro de conexão com o servidor", "network", { originalMessage: error.message })
    }

    // Detectar erros de parsing JSON
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return new ApplicationError("Erro ao processar resposta do servidor", "server", {
        originalMessage: error.message,
      })
    }

    return new ApplicationError(error.message, "unknown", { originalError: error })
  }

  return new ApplicationError(typeof error === "string" ? error : "Erro desconhecido", "unknown", {
    originalError: error,
  })
}

// Função para registrar erros no console
export function logError(error: ApplicationError): void {
  console.error(`[${error.type.toUpperCase()}] ${error.message}`, {
    error: error,
    context: error.context,
    timestamp: error.timestamp,
    stack: error.stack,
  })
}

// Função principal para lidar com erros
export function errorHandler(message: string, error: unknown): never {
  const appError = normalizeError(error)
  appError.message = message ? `${message}: ${appError.message}` : appError.message

  // Registrar erro
  logError(appError)

  // Relançar o erro para tratamento superior
  throw appError
}

// Exportar a função principal como padrão
export default errorHandler
