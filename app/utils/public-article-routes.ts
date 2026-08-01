import { toPublicAbsoluteUrl } from './public-seo'

interface PublicArticleListResponse {
  code: number
  data?: {
    records?: Array<{ id?: number }>
    total?: number
  } | null
}

function resolveApiBase(apiBase: string, siteUrl: string): string {
  const trimmedApiBase = apiBase.replace(/\/+$/, '')
  if (/^https?:\/\//i.test(trimmedApiBase)) return trimmedApiBase
  return toPublicAbsoluteUrl(siteUrl, trimmedApiBase).replace(/\/+$/, '')
}

/** 构建与站点地图共用，保证所有公开文章都有独立静态页面。 */
export async function fetchPublicArticleRoutes(
  apiBase: string,
  siteUrl: string,
): Promise<string[]> {
  const routes = new Set<string>()
  const pageSize = 100
  const maxPages = 500
  let current = 1
  let total = Number.POSITIVE_INFINITY

  while (current <= maxPages && routes.size < total) {
    const endpoint = new URL(`${resolveApiBase(apiBase, siteUrl)}/articles`)
    endpoint.searchParams.set('current', String(current))
    endpoint.searchParams.set('size', String(pageSize))
    endpoint.searchParams.set('include_protected', 'false')

    const response = await fetch(endpoint, {
      headers: { accept: 'application/json' },
    })
    if (!response.ok) {
      throw new Error(`公开文章列表请求失败：${response.status}`)
    }

    const payload = await response.json() as PublicArticleListResponse
    if (payload.code !== 200 || !payload.data) {
      throw new Error('公开文章列表返回了无效数据')
    }

    const records = Array.isArray(payload.data.records) ? payload.data.records : []
    total = Math.max(0, Number(payload.data.total) || 0)

    for (const article of records) {
      if (Number.isInteger(article.id) && article.id && article.id > 0) {
        routes.add(`/articles/${article.id}`)
      }
    }

    if (records.length < pageSize) break
    current += 1
  }

  return [...routes]
}
