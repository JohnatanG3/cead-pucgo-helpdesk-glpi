import {
	isRedisAvailable,
	getTokenFromRedis,
	saveTokenToRedis,
	removeTokenFromRedis,
} from "./redis-client";

type CacheItem<T> = {
	data: T;
	expiry: number;
};

// Cache em memória para quando o Redis não estiver disponível
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const memoryCache: Record<string, any> = {};

class CacheManager {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	private cache: Map<string, CacheItem<any>> = new Map();

	// Armazena um item no cache com tempo de expiração
	set<T>(key: string, data: T, ttlSeconds = 3600): void {
		const expiry = Date.now() + ttlSeconds * 1000;
		this.cache.set(key, { data, expiry });
	}

	// Obtém um item do cache se ainda for válido
	get<T>(key: string): T | null {
		const item = this.cache.get(key);

		// Retorna null se o item não existir ou estiver expirado
		if (!item || item.expiry < Date.now()) {
			if (item) this.cache.delete(key); // Remove itens expirados
			return null;
		}

		return item.data as T;
	}

	// Remove um item específico do cache
	invalidate(key: string): void {
		this.cache.delete(key);
	}

	// Remove todos os itens que correspondem a um padrão
	invalidatePattern(pattern: RegExp): void {
		for (const key of this.cache.keys()) {
			if (pattern.test(key)) {
				this.cache.delete(key);
			}
		}
	}

	// Limpa todo o cache
	clear(): void {
		this.cache.clear();
	}
}

// Exporta uma instância única para uso em toda a aplicação
export const cacheManager = new CacheManager();

/**
 * Obtém um valor do cache
 */
export async function getCachedValue<T>(key: string): Promise<T | null> {
	// Tentar obter do Redis primeiro, se disponível
	if (isRedisAvailable()) {
		const value = await getTokenFromRedis(key);
		return value as unknown as T;
	}

	// Fallback para cache em memória
	return memoryCache[key] || null;
}

/**
 * Salva um valor no cache
 */
export async function setCachedValue<T>(
	key: string,
	value: T,
	expiresAt?: number,
): Promise<void> {
	// Se expiresAt não for fornecido, definir para 1 hora no futuro
	const expiry = expiresAt || Date.now() + 60 * 60 * 1000;

	// Salvar no Redis se disponível
	if (isRedisAvailable()) {
		await saveTokenToRedis(key, {
			sessionToken: JSON.stringify(value),
			expiresAt: expiry,
		});
		return;
	}

	// Fallback para cache em memória
	memoryCache[key] = {
		value,
		expiresAt: expiry,
	};

	// Configurar limpeza automática para cache em memória
	setTimeout(() => {
		if (memoryCache[key]?.expiresAt === expiry) {
			delete memoryCache[key];
		}
	}, expiry - Date.now());
}

/**
 * Remove um valor do cache
 */
export async function removeCachedValue(key: string): Promise<void> {
	// Remover do Redis se disponível
	if (isRedisAvailable()) {
		await removeTokenFromRedis(key);
		return;
	}

	// Fallback para cache em memória
	delete memoryCache[key];
}

/**
 * Limpa todo o cache
 */
export async function clearCache(): Promise<void> {
	// Não é possível limpar todo o Redis facilmente, então apenas limpar o cache em memória
	// biome-ignore lint/complexity/noForEach: <explanation>
	Object.keys(memoryCache).forEach((key) => {
		delete memoryCache[key];
	});
}
