type CacheEntry = { at: number; value: unknown };

const cache = new Map<string, CacheEntry>();

export const serverEnv = (name: string): string =>
  typeof process === "undefined" ? "" : process.env[name] ?? "";

export async function cachedJson<T>(
  key: string,
  url: string,
  ttlMs = 10 * 60 * 1000,
  init?: RequestInit,
): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;

  const response = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (!response.ok) {
    throw new Error(`Upstream request failed (${response.status} ${response.statusText})`);
  }
  const value = (await response.json()) as T;
  cache.set(key, { at: Date.now(), value });
  return value;
}
