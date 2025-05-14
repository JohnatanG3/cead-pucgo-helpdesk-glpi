// Arquivo simplificado para autenticação em desenvolvimento
import { getNameFromEmail } from "./utils"
import { cacheManager } from "./cache-manager"

// Interface para o retorno da função de autenticação
export interface AuthResult {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    role: string
    group_id?: string
  }
  sessionToken?: string
  error?: string
}

// Interface para os dados da sessão armazenados no cache
interface SessionData {
  valid: boolean
  expires?: number
}

/**
 * Autentica um usuário no GLPI
 * @param username Nome de usuário ou email
 * @param password Senha do usuário
 * @returns Resultado da autenticação
 */
export async function authenticateWithGLPI(username: string, password: string): Promise<AuthResult> {
  // Simula um atraso de rede
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Em ambiente de desenvolvimento, aceita qualquer credencial com regras simples
  if (process.env.NODE_ENV === "development") {
    // Verifica se o email tem formato válido
    if (!username.includes("@")) {
      return {
        success: false,
        error: "Email inválido",
      }
    }

    // Verifica se a senha tem pelo menos 4 caracteres (regra simples para teste)
    if (password.length < 4) {
      return {
        success: false,
        error: "Senha deve ter pelo menos 4 caracteres",
      }
    }

    // Determina o papel do usuário com base no email
    const isAdmin = username.includes("admin") || username.includes("suporte")

    // Gera um nome amigável a partir do email
    const friendlyName = getNameFromEmail(username)

    // Atribui um grupo para usuários de suporte
    const groupId = username.includes("suporte") ? "1" : undefined

    // Gerar um token de sessão simulado
    const sessionToken = `dev-session-token-${Date.now()}`

    // Guardar o token em cache (simulando uma sessão real GLPI)
    const sessionData: SessionData = { valid: true, expires: Date.now() + 3600000 }
    cacheManager.set(`glpi-session-${sessionToken}`, sessionData, 3600) // 1 hora

    return {
      success: true,
      sessionToken,
      user: {
        id: "1",
        name: friendlyName,
        email: username,
        role: isAdmin ? "admin" : "user",
        group_id: groupId,
      },
    }
  }

  // Em produção, implementaria a lógica real de autenticação com o GLPI
  // Por enquanto, retorna erro para forçar o uso do modo de desenvolvimento
  return {
    success: false,
    error: "Autenticação com GLPI não configurada em produção",
  }
}

/**
 * Valida um token GLPI
 * @param token Token GLPI a ser validado
 * @returns true se o token for válido, false caso contrário
 */
export async function validateGLPIToken(token: string): Promise<boolean> {
  // Em desenvolvimento, verificar o token no cache
  if (process.env.NODE_ENV === "development") {
    const sessionData = cacheManager.get<SessionData>(`glpi-session-${token}`)
    return !!sessionData?.valid
  }

  // Em produção, implementar verificação real com o GLPI
  return false
}

/**
 * Renova um token GLPI
 * @param username Nome de usuário ou email
 * @param password Senha do usuário
 * @returns Novo token GLPI ou null se não for possível renovar
 */
export async function renewGLPIToken(username: string, password: string): Promise<string | null> {
  // Em desenvolvimento, apenas gerar um novo token
  if (process.env.NODE_ENV === "development") {
    const result = await authenticateWithGLPI(username, password)
    return result.sessionToken || null
  }

  // Em produção, implementar renovação real com o GLPI
  return null
}

// Exportar todas as funções em um objeto para facilitar importações
export const glpiAuth = {
  authenticate: authenticateWithGLPI,
  validateToken: validateGLPIToken,
  refreshToken: renewGLPIToken,
}
