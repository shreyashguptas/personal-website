export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    // Diagnostic: warn at build/runtime if base URL is missing
    console.warn(
      "[SEO] NEXT_PUBLIC_SITE_URL is not set; defaulting to http://localhost:3000. This will produce incorrect canonicals/OG URLs in production."
    );
    return "http://localhost:3000";
  }
  const withoutTrailingSlash = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  try {
    // Validate URL shape
    // eslint-disable-next-line no-new
    new URL(withoutTrailingSlash);
    return withoutTrailingSlash;
  } catch {
    console.warn(
      `[SEO] NEXT_PUBLIC_SITE_URL is invalid (\"${raw}\"); defaulting to http://localhost:3000.`
    );
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


