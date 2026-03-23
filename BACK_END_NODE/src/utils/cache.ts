const cache = new Map<string, { data: any; expiry: number }>();
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Generic in-memory cache helper
 */
export const getCached = async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = DEFAULT_TTL
): Promise<T> => {
    const cached = cache.get(key);
    if (cached && cached.expiry > Date.now()) {
        return cached.data;
    }
    const data = await fetcher();
    cache.set(key, { data, expiry: Date.now() + ttl });
    return data;
};

/**
 * Clear the cache or a specific key
 */
export const clearCache = (key?: string) => {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
};
