import "server-only";
export interface NewsStore {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl: number): Promise<void>;
  take(key: string, limit: number, ttl: number): Promise<boolean>;
}
export function createMemoryStore(now = () => Date.now()): NewsStore {
  const items = new Map<string, { value: unknown; expires: number }>();
  function read(key: string) {
    const item = items.get(key);
    if (item && item.expires > now()) return item;
    items.delete(key);
    return null;
  }
  return {
    async get<T>(key: string) {
      return (read(key)?.value ?? null) as T | null;
    },
    async set(key, value, ttl) {
      if (items.size > 1000)
        for (const [k, v] of items) {
          if (v.expires <= now()) items.delete(k);
        }
      if (items.size >= 2000) items.delete(items.keys().next().value!);
      items.set(key, { value, expires: now() + ttl * 1000 });
    },
    async take(key, limit, ttl) {
      const item = read(key);
      const count = Number(item?.value || 0) + 1;
      items.set(key, {
        value: count,
        expires: item?.expires || now() + ttl * 1000,
      });
      return count <= limit;
    },
  };
}
export function createRedisStore(url: string, token: string): NewsStore {
  async function command(args: unknown[]) {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) throw new Error("Store unavailable");
    const data = await r.json();
    if (data.error) throw new Error("Store unavailable");
    return data.result;
  }
  return {
    async get<T>(key: string) {
      const value = await command(["GET", key]);
      return value ? (JSON.parse(value) as T) : null;
    },
    async set(key, value, ttl) {
      await command(["SET", key, JSON.stringify(value), "EX", ttl]);
    },
    async take(key, limit, ttl) {
      const count = await command([
        "EVAL",
        "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n",
        1,
        key,
        ttl,
      ]);
      return Number(count) <= limit;
    },
  };
}
const localStore = createMemoryStore();
export function getStore(): NewsStore {
  const url = process.env.UPSTASH_REDIS_REST_URL,
    token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token && url.startsWith("https://"))
    return createRedisStore(url, token);
  if (process.env.NODE_ENV === "production")
    throw new Error("Shared store configuration required");
  return localStore;
}
