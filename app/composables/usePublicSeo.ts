import {
  normalizePublicSiteUrl,
  toPublicAbsoluteUrl,
} from '~/utils/public-seo'
import { toValue, type MaybeRefOrGetter } from 'vue'

type SeoValue = MaybeRefOrGetter<string | null | undefined>

interface PublicSeoOptions {
  title: SeoValue
  description: SeoValue
  path: SeoValue
  type?: 'website' | 'article'
  keywords?: SeoValue
  indexable?: MaybeRefOrGetter<boolean | null | undefined>
}

const indexRobots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
const noIndexRobots = 'noindex, nofollow'

export function usePublicSeo(options: PublicSeoOptions) {
  const config = useRuntimeConfig()
  const siteUrl = normalizePublicSiteUrl(config.public.siteUrl)
  const canonicalUrl = computed(() => toPublicAbsoluteUrl(siteUrl, toValue(options.path) || '/'))
  const title = computed(() => toValue(options.title) || config.public.siteName)
  const description = computed(() => toValue(options.description) || config.public.siteDescription)
  const keywords = computed(() => toValue(options.keywords) || undefined)
  const robots = computed(() => toValue(options.indexable) === false ? noIndexRobots : indexRobots)

  useSeoMeta({
    title: () => title.value,
    description: () => description.value,
    keywords: () => keywords.value,
    robots: () => robots.value,
    ogType: options.type || 'website',
    ogTitle: () => title.value,
    ogDescription: () => description.value,
    ogUrl: () => canonicalUrl.value,
    ogSiteName: config.public.siteName,
    ogLocale: 'zh_CN',
    twitterCard: 'summary',
    twitterTitle: () => title.value,
    twitterDescription: () => description.value,
  })

  useHead(() => ({
    link: [{
      key: 'canonical',
      rel: 'canonical',
      href: canonicalUrl.value,
    }],
  }))

  return {
    canonicalUrl,
    siteUrl,
  }
}
