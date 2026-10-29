import "server-only";
export function getNewsConfig() {
  return {
    mode: process.env.NEWS_MODE || "demo",
    key: process.env.GNEWS_API_KEY || "",
    country: process.env.NEWS_COUNTRY || "us",
    language: process.env.NEWS_LANGUAGE || "en",
    dailyBudget: Math.min(
      100000,
      Math.max(1, Number(process.env.NEWS_DAILY_BUDGET) || 90),
    ),
  };
}
