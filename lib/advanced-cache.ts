/**
 * Sistema de cache avançado com suporte a TTL, invalidação por padrão e persistência
 */

type CacheItem<T> = {
  value: T
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Tempo de vida em segundos
  persist?: boolean // Se deve persistir no localStorage
}

class AdvancedCache {
  private cache: Map<string, CacheItem<any>> = new Map()
  private defaultTTL = 300 // 5 minutos em segundos
  private persistenceEnabled: boolean = typeof window !== "undefined"

  constructor() {
    this.loadFromStorage()

    // Configurar limpeza periódica
    if (typeof window !== "undefined") {
      setInterval(() => this.cleanExpired(), 60000) // Limpar a cada minuto
    }
  }

  /**
   * Define um item no cache
   */
  set<T>(key: string, value: T, options?: CacheOptions): void {
    const ttl = options?.ttl ?? this.defaultTTL
    const persist = options?.persist ?? false

    const expiresAt = Date.now() + ttl * 1000

    this.cache.set(key, { value, expiresAt })

    if (persist && this.persistenceEnabled) {
      this.saveToStorage()
    }
  }

  /**
   * Obtém um item do cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Verificar se o item expirou
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  /**
   * Verifica se um item existe no cache e não expirou
   */
  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    // Verificar se o item expirou
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Remove um item do cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key)

    if (result && this.persistenceEnabled) {
      this.saveToStorage()
    }

    return result
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear()

    if (this.persistenceEnabled) {
      localStorage.removeItem("app_cache")
    }
  }

  /**
   * Invalida itens do cache com base em um padrão regex
   */
  invalidatePattern(pattern: RegExp): number {
    let count = 0

    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        count++
      }
    }

    if (count > 0 && this.persistenceEnabled) {
      this.saveToStorage()
    }

    return count
  }

  /**
   * Obtém um item do cache ou executa uma função para obtê-lo
   */
  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cachedItem = this.get<T>(key)

    if (cachedItem !== null) {
      return cachedItem
    }

    try {
      const value = await fetchFn()
      this.set(key, value, options)
      return value
    } catch (error) {
      console.error(`Erro ao buscar dados para a chave ${key}:`, error)
      throw error
    }
  }

  /**
   * Remove itens expirados do cache
   */
  private cleanExpired(): void {
    let hasDeleted = false

    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < Date.now()) {
        this.cache.delete(key)
        hasDeleted = true
      }
    }

    if (hasDeleted && this.persistenceEnabled) {
      this.saveToStorage()
    }
  }

  /**
   * Salva o cache no localStorage
   */
  private saveToStorage(): void {
    if (!this.persistenceEnabled) return

    try {
      const serialized: Record<string, CacheItem<any>> = {}

      for (const [key, item] of this.cache.entries()) {
        // Só persistir itens que não expiraram
        if (item.expiresAt > Date.now()) {
          serialized[key] = item
        }
      }

      localStorage.setItem("app_cache", JSON.stringify(serialized))
    } catch (error) {
      console.error("Erro ao salvar cache no localStorage:", error)
    }
  }

  /**
   * Carrega o cache do localStorage
   */
  private loadFromStorage(): void {
    if (!this.persistenceEnabled) return

    try {
      const serialized = localStorage.getItem("app_cache")

      if (serialized) {
        const data = JSON.parse(serialized) as Record<string, CacheItem<any>>

        for (const [key, item] of Object.entries(data)) {
          // Só carregar itens que não expiraram
          if (item.expiresAt > Date.now()) {
            this.cache.set(key, item)
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar cache do localStorage:", error)
    }
  }
}

// Exportar uma instância única para uso em toda a aplicação
export const advancedCache = new AdvancedCache()
