import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const outputDir = resolve('.output/public')
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://martin88.xyz').replace(/\/+$/, '')

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasCanonicalUrl(html, canonicalUrl) {
  const escapedUrl = escapeRegExp(canonicalUrl)
  const pattern = new RegExp(
    `<link\\b(?=[^>]*\\brel=["']canonical["'])(?=[^>]*\\bhref=["']${escapedUrl}["'])[^>]*>`,
    'i',
  )
  return pattern.test(html)
}

function hasRobotsMeta(html) {
  return /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i.test(html)
}

function hasRobotsDirective(html, directive) {
  const escapedDirective = escapeRegExp(directive)
  return (html.match(/<meta\b[^>]*>/gi) || []).some(tag => (
    /\bname=["']robots["']/i.test(tag)
    && new RegExp(`\\bcontent=["'][^"']*${escapedDirective}[^"']*["']`, 'i').test(tag)
  ))
}

function extractJsonLd(html) {
  const matches = html.matchAll(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi)
  return [...matches].map(([, content]) => JSON.parse(content))
}

async function readOutputFile(relativePath) {
  return readFile(resolve(outputDir, relativePath), 'utf8')
}

const [robots, sitemap, homepage, articlesPage, loginPage] = await Promise.all([
  readOutputFile('robots.txt'),
  readOutputFile('sitemap.xml'),
  readOutputFile('index.html'),
  readOutputFile('articles/index.html'),
  readOutputFile('login/index.html'),
])

assert(robots.includes('User-agent: *'), 'robots.txt 缺少 User-agent 规则')
assert(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`), 'robots.txt 未指向站点地图')
assert(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'sitemap.xml 格式无效')
assert(sitemap.includes(`<loc>${siteUrl}/</loc>`), 'sitemap.xml 缺少首页规范 URL')
assert(sitemap.includes(`<loc>${siteUrl}/articles</loc>`), 'sitemap.xml 缺少文章归档规范 URL')

for (const [name, html, canonical] of [
  ['首页', homepage, `${siteUrl}/`],
  ['文章归档', articlesPage, `${siteUrl}/articles`],
]) {
  assert(hasCanonicalUrl(html, canonical), `${name}缺少 canonical URL`)
  assert(hasRobotsMeta(html), `${name}缺少 robots 元数据`)
}

const homepageStructuredData = extractJsonLd(homepage)
assert(
  homepageStructuredData.some(item => item['@type'] === 'WebSite'),
  '首页缺少有效的 WebSite 结构化数据',
)
assert(hasRobotsDirective(loginPage, 'noindex, nofollow'), '登录页缺少 noindex 指令')
console.log('SEO static output check passed.')
