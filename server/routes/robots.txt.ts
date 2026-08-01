import { normalizePublicSiteUrl } from '~/utils/public-seo'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = normalizePublicSiteUrl(config.public.siteUrl)

  setHeader(event, 'content-type', 'text/plain; charset=UTF-8')
  setHeader(event, 'cache-control', 'public, max-age=0, must-revalidate')

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /login',
    'Disallow: /workspace',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
})
