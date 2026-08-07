import { Redis } from '@upstash/redis';

// Simple in-memory fallback TTL cache map when Upstash credentials are not set
class InMemoryFallbackCache {
  private store = new Map<string, { val: any; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.val as T;
  }

  async set(key: string, value: any, opts?: { ex?: number }): Promise<'OK'> {
    const ttlSeconds = opts?.ex ?? 300;
    this.store.set(key, {
      val: value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
  url && token && url.startsWith('http')
    ? new Redis({ url, token })
    : (new InMemoryFallbackCache() as any);

/**
 * Cache helper wrapper with TTL
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : (cached as T);
    }
  } catch (err) {
    console.warn('[Redis Cache GET Warning]:', err);
  }

  const fresh = await fetcher();

  try {
    const payload = typeof fresh === 'string' ? fresh : JSON.stringify(fresh);
    await redis.set(key, payload, { ex: ttlSeconds });
  } catch (err) {
    console.warn('[Redis Cache SET Warning]:', err);
  }

  return fresh;
}
