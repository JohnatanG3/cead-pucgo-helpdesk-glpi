// Este arquivo é opcional e só será usado em produção se você configurar o Redis
// Para usar, instale o pacote redis: npm install redis

// Interface para o token de sessão
interface SessionToken {
  sessionToken: string
  expiresAt: number
}

// Tipo para o cliente Redis
type RedisClientType = any // Substituir por tipo real quando o pacote redis estiver instalado

// Verificar se estamos em ambiente de servidor
const isServer = typeof window === "undefined"

// Criar cliente Redis apenas no servidor
let redisClient: RedisClientType | null = null

// Função para inicializar o cliente Redis
export async function initRedisClient(): Promise<boolean> {
  if (!isServer || !process.env.REDIS_URL) return false

  try {
    // Importação dinâmica para evitar erros quando o pacote não está instalado
    const { createClient } = await import("redis").catch(() => {
      console.warn("Pacote redis não instalado. Usando armazenamento em memória.")
      return { createClient: null }
    })

    if (!createClient) return false

    redisClient = createClient({
      url: process.env.REDIS_URL,
    })

    // Conectar ao Redis
    await redisClient.connect().catch((error: Error) => {
      console.error("Erro ao conectar ao Redis:", error)
      redisClient = null
    })

    // Lidar com erros de conexão
    redisClient.on("error", (error: Error) => {
      console.error("Erro no cliente Redis:", error)
    })

    console.log("Cliente Redis inicializado")
    return true
  } catch (error) {
    console.error("Erro ao inicializar cliente Redis:", error)
    redisClient = null
    return false
  }
}

/**
 * Obtém um token de sessão do Redis
 */
export async function getTokenFromRedis(key: string): Promise<SessionToken | null> {
  if (!redisClient) return null

  try {
    const tokenData = await redisClient.get(`glpi:${key}`)
    if (!tokenData) return null

    return JSON.parse(tokenData)
  } catch (error) {
    console.error("Erro ao obter token do Redis:", error)
    return null
  }
}

/**
 * Salva um token de sessão no Redis
 */
export async function saveTokenToRedis(key: string, token: SessionToken): Promise<void> {
  if (!redisClient) return

  try {
    // Calcular TTL em segundos
    const ttl = Math.floor((token.expiresAt - Date.now()) / 1000)

    // Não salvar se o token já expirou
    if (ttl <= 0) return

    await redisClient.set(`glpi:${key}`, JSON.stringify(token), { EX: ttl })
  } catch (error) {
    console.error("Erro ao salvar token no Redis:", error)
  }
}

/**
 * Remove um token de sessão do Redis
 */
export async function removeTokenFromRedis(key: string): Promise<void> {
  if (!redisClient) return

  try {
    await redisClient.del(`glpi:${key}`)
  } catch (error) {
    console.error("Erro ao remover token do Redis:", error)
  }
}

/**
 * Verifica se o Redis está disponível
 */
export function isRedisAvailable(): boolean {
  return !!redisClient
}

// Inicializar Redis se estiver em ambiente de servidor
if (isServer && process.env.REDIS_URL) {
  initRedisClient().then((success) => {
    if (success) {
      // Garantir que o cliente Redis seja fechado quando a aplicação for encerrada
      process.on("SIGINT", async () => {
        try {
          if (redisClient) {
            await redisClient.quit()
            console.log("Cliente Redis desconectado")
          }
        } catch (error) {
          console.error("Erro ao desconectar cliente Redis:", error)
        }
        process.exit(0)
      })
    }
  })
}
