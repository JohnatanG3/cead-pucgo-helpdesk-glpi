type CacheItem<T> = {
	data: T
	expiry: number
  }
  
  class CacheManager {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private cache: Map<string, CacheItem<any>> = new Map()
  
	// Armazena um item no cache com tempo de expiração
	set<T>(key: string, data: T, ttlSeconds = 3600): void {
	  const expiry = Date.now() + ttlSeconds * 1000
	  this.cache.set(key, { data, expiry })
	}
  
	// Obtém um item do cache se ainda for válido
	get<T>(key: string): T | null {
	  const item = this.cache.get(key)
  
	  // Retorna null se o item não existir ou estiver expirado
	  if (!item || item.expiry < Date.now()) {
		if (item) this.cache.delete(key) // Remove itens expirados
		return null
	  }
  
	  return item.data as T
	}
  
	// Remove um item específico do cache
	invalidate(key: string): void {
	  this.cache.delete(key)
	}
  
	// Remove todos os itens que correspondem a um padrão
	invalidatePattern(pattern: RegExp): void {
	  for (const key of this.cache.keys()) {
		if (pattern.test(key)) {
		  this.cache.delete(key)
		}
	  }
	}
  
	// Limpa todo o cache
	clear(): void {
	  this.cache.clear()
	}
  }
  
  // Exporta uma instância única para uso em toda a aplicação
  export const cacheManager = new CacheManager()
  