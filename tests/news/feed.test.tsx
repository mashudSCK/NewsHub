import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi, afterEach } from "vitest";
import { useNewsFeed } from "@/hooks/useNewsFeed";
afterEach(() => vi.unstubAllGlobals());
it("uses the server-rendered edition without duplicating its request, and refreshes on demand", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      new Response(
        JSON.stringify({ articles: [], mode: "demo", fetchedAt: "" }),
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  const initialData = {
    articles: [{ title: "Initial edition" }],
    mode: "demo",
    fetchedAt: "2026-10-29T08:00:00Z",
  };
  const { result } = renderHook(() =>
    useNewsFeed({ initialData: initialData as any }),
  );
  expect(result.current.articles[0]?.title).toBe("Initial edition");
  expect(fetcher).not.toHaveBeenCalled();
  act(() => result.current.retry());
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
});
it("ignores superseded search responses even if cancellation is too late", async () => {
  const pending: Array<(r: Response) => void> = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(() => new Promise((resolve) => pending.push(resolve))),
  );
  const { result, rerender } = renderHook(
    ({ query }) => useNewsFeed({ query }),
    { initialProps: { query: "first" } },
  );
  expect(result.current.status).toBe("loading");
  rerender({ query: "second" });
  await act(async () =>
    pending[1](
      new Response(
        JSON.stringify({ articles: [{ title: "Second" }], mode: "demo" }),
      ),
    ),
  );
  await waitFor(() => expect(result.current.articles[0]?.title).toBe("Second"));
  await act(async () =>
    pending[0](
      new Response(
        JSON.stringify({ articles: [{ title: "First" }], mode: "demo" }),
      ),
    ),
  );
  expect(result.current.articles[0]?.title).toBe("Second");
});
it("keeps successful content visible when a refresh fails", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ articles: [{ title: "Saved result" }], mode: "demo" }),
      ),
    )
    .mockRejectedValueOnce(new Error("Offline"));
  vi.stubGlobal("fetch", fetcher);
  const { result } = renderHook(() => useNewsFeed({ query: "climate" }));
  await waitFor(() => expect(result.current.status).toBe("success"));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.articles[0].title).toBe("Saved result");
});
