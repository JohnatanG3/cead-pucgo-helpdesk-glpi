import { authenticateUser, getUserById, type User } from "./database"

// Interface para o retorno da função de autenticação
export interface AuthResult {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    role: string
    department?: string
  }
  sessionToken?: string
  error?: string
}

/**
 * Autentica um usuário com o banco de dados local
 * @param email Email do usuário
 * @param password Senha do usuário
 * @returns Resultado da autenticação
 */
export async function authenticateWithDatabase(email: string, password: string): Promise<AuthResult> {
  try {
    console.log("AuthReal: Tentando autenticar usuário:", email)

    // Simula um pequeno atraso para parecer uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 300))

    const result = await authenticateUser(email, password)

    if (!result.success || !result.user) {
      console.log("AuthReal: Autenticação falhou:", result.error)
      return {
        success: false,
        error: result.error || "Credenciais inválidas",
      }
    }

    // Gerar token de sessão
    const sessionToken = `session-${Date.now()}-${result.user.id}`

    console.log("AuthReal: Usuário autenticado com sucesso:", {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
    })

    return {
      success: true,
      sessionToken,
      user: {
        id: result.user.id.toString(),
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        department: result.user.department,
      },
    }
  } catch (error) {
    console.error("AuthReal: Erro na autenticação:", error)
    return {
      success: false,
      error: "Erro interno do servidor",
    }
  }
}

/**
 * Valida um token de sessão
 * @param token Token de sessão
 * @returns true se válido, false caso contrário
 */
export async function validateSessionToken(token: string): Promise<boolean> {
  try {
    // Extrair ID do usuário do token
    const parts = token.split("-")
    if (parts.length !== 3 || parts[0] !== "session") {
      return false
    }

    const userId = Number.parseInt(parts[2])
    if (isNaN(userId)) {
      return false
    }

    // Verificar se usuário existe
    const user = getUserById(userId)
    return !!user
  } catch (error) {
    console.error("AuthReal: Erro ao validar token:", error)
    return false
  }
}

/**
 * Obtém usuário pelo token de sessão
 * @param token Token de sessão
 * @returns Usuário ou null
 */
export async function getUserBySessionToken(token: string): Promise<User | null> {
  try {
    const parts = token.split("-")
    if (parts.length !== 3 || parts[0] !== "session") {
      return null
    }

    const userId = Number.parseInt(parts[2])
    if (isNaN(userId)) {
      return null
    }

    return getUserById(userId)
  } catch (error) {
    console.error("AuthReal: Erro ao obter usuário por token:", error)
    return null
  }
}
