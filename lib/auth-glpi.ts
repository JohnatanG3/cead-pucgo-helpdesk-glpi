// Arquivo para autenticação com GLPI
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
  refreshToken?: string // Adicionado token de atualização
  expiresAt?: number // Adicionado tempo de expiração
  error?: string
}

// Interface para os dados da sessão armazenados no cache
interface SessionData {
  valid: boolean
  expires?: number
  refreshToken?: string // Adicionado token de atualização
}

/**
 * Autentica um usuário no GLPI
 * @param username Nome de usuário ou email
 * @param password Senha do usuário
 * @returns Resultado da autenticação
 */
export async function authenticateWithGLPI(username: string, password: string): Promise<AuthResult> {
  try {
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

      // Gerar um token de atualização simulado
      const refreshToken = `dev-refresh-token-${Date.now()}`

      // Definir tempo de expiração (30 minutos a partir de agora)
      const expiresAt = Date.now() + 30 * 60 * 1000

      // Guardar o token em cache (simulando uma sessão real GLPI)
      const sessionData: SessionData = {
        valid: true,
        expires: expiresAt,
        refreshToken,
      }
      cacheManager.set(`glpi-session-${sessionToken}`, sessionData, 3600) // 1 hora

      return {
        success: true,
        sessionToken,
        refreshToken,
        expiresAt,
        user: {
          id: "1",
          name: friendlyName,
          email: username,
          role: isAdmin ? "admin" : "user",
          group_id: groupId,
        },
      }
    }

    // Em produção, implementar a lógica real de autenticação com o GLPI
    // Exemplo de como seria a implementação real:
    /*
    const response = await fetch(`${process.env.GLPI_API_URL}/initSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'App-Token': process.env.GLPI_APP_TOKEN || '',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || `Erro ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    // Obter informações do usuário
    const userResponse = await fetch(`${process.env.GLPI_API_URL}/getMyProfiles`, {
      headers: {
        'Session-Token': data.session_token,
        'App-Token': process.env.GLPI_APP_TOKEN || '',
      },
    });
    
    const userData = await userResponse.json();
    
    // Determinar o papel com base nos perfis do usuário
    const isAdmin = userData.myprofiles.some(p => 
      p.name.toLowerCase().includes('admin') || 
      p.name.toLowerCase().includes('super')
    );
    
    return {
      success: true,
      sessionToken: data.session_token,
      refreshToken: data.refresh_token, // Se disponível na API
      expiresAt: Date.now() + (data.expires_in || 1800) * 1000, // Converter segundos para milissegundos
      user: {
        id: userData.id.toString(),
        name: userData.name,
        email: userData.email || username,
        role: isAdmin ? 'admin' : 'user',
        group_id: userData.groups_id?.toString(),
      },
    };
    */

    // Por enquanto, retorna erro para forçar o uso do modo de desenvolvimento
    return {
      success: false,
      error: "Autenticação com GLPI não configurada em produção",
    }
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido na autenticação",
    }
  }
}

/**
 * Valida um token GLPI
 * @param token Token GLPI a ser validado
 * @returns true se o token for válido, false caso contrário
 */
export async function validateGLPIToken(token: string): Promise<boolean> {
  try {
    // Em desenvolvimento, verificar o token no cache
    if (process.env.NODE_ENV === "development") {
      const sessionData = cacheManager.get<SessionData>(`glpi-session-${token}`)

      // Verificar se o token existe e não expirou
      if (sessionData?.valid) {
        if (sessionData.expires && sessionData.expires > Date.now()) {
          return true
        }
        // Token expirado, mas tem refresh token
        return !!sessionData.refreshToken
      }
      return false
    }

    // Em produção, implementar verificação real com o GLPI
    /*
    const response = await fetch(`${process.env.GLPI_API_URL}/getMyProfiles`, {
      headers: {
        'Session-Token': token,
        'App-Token': process.env.GLPI_APP_TOKEN || '',
      },
    });
    
    return response.ok;
    */

    return false
  } catch (error) {
    console.error("Erro ao validar token:", error)
    return false
  }
}

/**
 * Renova um token GLPI
 * @param refreshToken Token de atualização
 * @returns Novo token GLPI ou null se não for possível renovar
 */
export async function renewGLPIToken(refreshToken: string): Promise<{
  sessionToken: string
  refreshToken: string
  expiresAt: number
} | null> {
  try {
    // Em desenvolvimento, apenas gerar um novo token
    if (process.env.NODE_ENV === "development") {
      // Gerar novos tokens
      const sessionToken = `dev-session-token-${Date.now()}`
      const newRefreshToken = `dev-refresh-token-${Date.now()}`
      const expiresAt = Date.now() + 30 * 60 * 1000 // 30 minutos

      // Guardar o token em cache
      const sessionData: SessionData = {
        valid: true,
        expires: expiresAt,
        refreshToken: newRefreshToken,
      }
      cacheManager.set(`glpi-session-${sessionToken}`, sessionData, 3600) // 1 hora

      return {
        sessionToken,
        refreshToken: newRefreshToken,
        expiresAt,
      }
    }

    // Em produção, implementar renovação real com o GLPI
    /*
    const response = await fetch(`${process.env.GLPI_API_URL}/refreshToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'App-Token': process.env.GLPI_APP_TOKEN || '',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      sessionToken: data.session_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in || 1800) * 1000,
    };
    */

    return null
  } catch (error) {
    console.error("Erro ao renovar token:", error)
    return null
  }
}

/**
 * Renova um token GLPI usando credenciais
 * @param username Nome de usuário ou email
 * @param password Senha do usuário
 * @returns Novo token GLPI ou null se não for possível renovar
 */
export async function renewGLPITokenWithCredentials(
  username: string,
  password: string,
): Promise<{
  sessionToken: string
  refreshToken: string
  expiresAt: number
} | null> {
  try {
    const result = await authenticateWithGLPI(username, password)

    if (result.success && result.sessionToken && result.refreshToken && result.expiresAt) {
      return {
        sessionToken: result.sessionToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      }
    }

    return null
  } catch (error) {
    console.error("Erro ao renovar token com credenciais:", error)
    return null
  }
}

// Exportar todas as funções em um objeto para facilitar importações
export const glpiAuth = {
  authenticate: authenticateWithGLPI,
  validateToken: validateGLPIToken,
  refreshToken: renewGLPIToken,
  refreshTokenWithCredentials: renewGLPITokenWithCredentials,
}
