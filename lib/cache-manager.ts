/**
 * Gerenciador de cache simples para desenvolvimento
 * Em produção, seria substituído por Redis ou outro sistema de cache
 */

// Tipo para o cache
type CacheData = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  value: any
  expires: number | null
}

// Cache em memória
const memoryCache = new Map<string, CacheData>()

/**
 * Armazena um valor no cache
 * @param key Chave do cache
 * @param value Valor a ser armazenado
 * @param ttl Tempo de vida em segundos (0 para não expirar)
 */
function set<T>(key: string, value: T, ttl = 0): void {
  const expires = ttl > 0 ? Date.now() + ttl * 1000 : null
  memoryCache.set(key, { value, expires })
}

/**
 * Recupera um valor do cache
 * @param key Chave do cache
 * @returns Valor armazenado ou undefined se não existir ou estiver expirado
 */
function get<T>(key: string): T | undefined {
  const data = memoryCache.get(key)

  // Se não existe ou está expirado
  if (!data || (data.expires && data.expires < Date.now())) {
    memoryCache.delete(key) // Limpa entradas expiradas
    return undefined
  }

  return data.value as T
}

/**
 * Remove um valor do cache
 * @param key Chave do cache
 */
function del(key: string): void {
  memoryCache.delete(key)
}

/**
 * Limpa todo o cache
 */
function clear(): void {
  memoryCache.clear()
}

// Exporta o gerenciador de cache
export const cacheManager = {
  set,
  get,
  del,
  clear,
}
