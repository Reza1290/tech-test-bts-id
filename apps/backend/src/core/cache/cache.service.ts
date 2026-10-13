import { env } from "../config/env";
import { logger } from "../logger/logger";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private readonly store: Map<string, CacheEntry<unknown>> = new Map();
  private readonly defaultTtlMs: number;

  constructor(defaultTtlSeconds: number = env.CACHE_TTL_SECONDS) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
  }

  public get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.store.delete(key);
      logger.debug({ key }, "Cache expired and removed");
      return undefined;
    }

    return entry.value as T;
  }

  public set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttlMs = ttlSeconds !== undefined ? ttlSeconds * 1000 : this.defaultTtlMs;
    const expiresAt = Date.now() + ttlMs;

    this.store.set(key, { value, expiresAt });
    logger.debug({ key, ttlMs }, "Cache set");
  }

  public has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  public del(key: string): boolean {
    const existed = this.store.delete(key);
    if (existed) {
      logger.debug({ key }, "Cache key deleted");
    }
    return existed;
  }

  public deletePattern(prefixOrPattern: string | RegExp): number {
    let deletedCount = 0;
    const regex = typeof prefixOrPattern === "string"
      ? new RegExp(`^${prefixOrPattern}`)
      : prefixOrPattern;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.debug({ pattern: String(prefixOrPattern), deletedCount }, "Cache pattern invalidated");
    }

    return deletedCount;
  }

  public clear(): void {
    this.store.clear();
    logger.debug("Cache completely cleared");
  }

  public size(): number {
    return this.store.size;
  }
}

export const cacheService = new CacheService();
