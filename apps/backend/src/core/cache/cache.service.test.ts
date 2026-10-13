import { describe, it, expect, beforeEach, vi } from "vitest";
import { CacheService } from "./cache.service";

describe("CacheService", () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService(60);
  });

  it("should store and retrieve value", () => {
    cache.set("test-key", { id: 1, name: "Item" });
    const result = cache.get<{ id: number; name: string }>("test-key");
    expect(result).toEqual({ id: 1, name: "Item" });
  });

  it("should return undefined for non-existent key", () => {
    expect(cache.get("not-found")).toBeUndefined();
  });

  it("should expire items after TTL", () => {
    vi.useFakeTimers();
    cache.set("temp", "value", 1); // 1 second TTL

    expect(cache.get("temp")).toBe("value");

    vi.advanceTimersByTime(1100);

    expect(cache.get("temp")).toBeUndefined();
    vi.useRealTimers();
  });

  it("should delete specific key", () => {
    cache.set("k1", "v1");
    expect(cache.has("k1")).toBe(true);

    const deleted = cache.del("k1");
    expect(deleted).toBe(true);
    expect(cache.has("k1")).toBe(false);
  });

  it("should invalidate keys matching prefix pattern", () => {
    cache.set("products:list:1", [1, 2]);
    cache.set("products:list:2", [3, 4]);
    cache.set("products:item:1", { id: 1 });
    cache.set("users:1", { id: 1 });

    const deleted = cache.deletePattern("products:");
    expect(deleted).toBe(3);
    expect(cache.get("products:list:1")).toBeUndefined();
    expect(cache.get("products:item:1")).toBeUndefined();
    expect(cache.get("users:1")).toBeDefined();
  });

  it("should clear all items", () => {
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get("a")).toBeUndefined();
  });
});
