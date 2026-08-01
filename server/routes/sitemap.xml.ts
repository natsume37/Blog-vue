import { fetchPublicArticleRoutes } from '~/utils/public-article-routes'
import {
  normalizePublicSiteUrl,
  toPublicAbsoluteUrl,
} from '~/utils/public-seo'

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, character => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '\'': '&apos;',
    '"': '&quot;',
  })[character] || character)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = normalizePublicSiteUrl(config.public.siteUrl)
  let articleRoutes: string[] = []

  try {
    articleRoutes = await fetchPublicArticleRoutes(config.public.apiV1Base, siteUrl)
  }
  catch (error) {
    console.warn('[seo] 无法读取公开文章，站点地图将仅包含固定页面。', error)
  }

  const urls = ['/', '/articles', ...articleRoutes]
    .map(path => `  <url><loc>${escapeXml(toPublicAbsoluteUrl(siteUrl, path))}</loc></url>`)
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=UTF-8')
  setHeader(event, 'cache-control', 'public, max-age=0, must-revalidate')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
})
