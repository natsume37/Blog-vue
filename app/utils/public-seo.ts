export const defaultPublicSiteUrl = 'https://martin88.xyz'

export function normalizePublicSiteUrl(value: string | undefined | null): string {
  const candidate = value?.trim() || defaultPublicSiteUrl

  try {
    const url = new URL(candidate)
    const pathname = url.pathname.replace(/\/+$/, '')
    return `${url.origin}${pathname}`
  }
  catch {
    return defaultPublicSiteUrl
  }
}

export function toPublicAbsoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return new URL(path, `${normalizePublicSiteUrl(siteUrl)}/`).toString()
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
