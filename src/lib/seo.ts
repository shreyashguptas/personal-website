export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    // Default sensibly: use canonical domain in production, localhost in dev
    if (process.env.NODE_ENV === "production") {
      return "https://shreyashg.com";
    }
    return "http://localhost:3000";
  }
  const withoutTrailingSlash = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  try {
    // Validate URL shape
    // eslint-disable-next-line no-new
    new URL(withoutTrailingSlash);
    return withoutTrailingSlash;
  } catch {
    // If invalid, fall back as above
    if (process.env.NODE_ENV === "production") {
      return "https://shreyashg.com";
    }
    return "http://localhost:3000";
  }
}

export function absoluteUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}


