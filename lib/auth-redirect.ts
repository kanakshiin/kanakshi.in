export function sanitizeRedirectPath(value: string | null | undefined, fallback = "/account"): string {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  if (value.includes("://") || value.includes("\\") || value.startsWith("/admin")) {
    return fallback;
  }

  return value;
}
