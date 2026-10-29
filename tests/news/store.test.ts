import { expect, it, vi, afterEach } from "vitest";
import { createMemoryStore, createRedisStore } from "@/lib/news/store";
afterEach(() => vi.unstubAllGlobals());
it("expires cache values and restores request allowance after its window", async () => {
  let now = 0;
  const store = createMemoryStore(() => now);
  await store.set("news", { title: "Cached" }, 300);
  expect(await store.get("news")).toEqual({ title: "Cached" });
  expect(await store.take("client", 1, 60)).toBe(true);
  expect(await store.take("client", 1, 60)).toBe(false);
  now = 61000;
  expect(await store.take("client", 1, 60)).toBe(true);
  now = 300001;
  expect(await store.get("news")).toBeNull();
});
it("uses atomic shared counters and fails closed on Redis errors", async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(new Response(JSON.stringify({ result: 2 })))
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "service unavailable" })),
    );
  vi.stubGlobal("fetch", fetcher);
  const store = createRedisStore("https://redis.example", "token");
  expect(await store.take("limit", 1, 60)).toBe(false);
  expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))[0]).toBe("EVAL");
  await expect(store.get("news")).rejects.toThrow("Store unavailable");
});
