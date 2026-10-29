export function formatDate(value: string | null, now = Date.now()): string {
  if (!value || !Number.isFinite(Date.parse(value))) return "Date unavailable";
  const date = new Date(value);
  const minutes = Math.floor((now - date.getTime()) / 60000);
  if (minutes < 0)
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
