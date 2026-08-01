const legacyApiBase = process.env.VITE_API_BASE_URL?.trim()
const publicApiBase = process.env.NUXT_PUBLIC_API_BASE?.trim() || legacyApiBase || '/api/v1'
const normalizedApiBase = publicApiBase.replace(/\/+$/, '')
const publicApiV2Base = process.env.NUXT_PUBLIC_API_V2_BASE?.trim()
  || (normalizedApiBase.endsWith('/v1')
    ? `${normalizedApiBase.slice(0, -3)}/v2`
    : `${normalizedApiBase}/v2`)

export default defineNuxtConfig({

  modules: ['@nuxt/ui', '@nuxt/eslint'],
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { name: 'theme-color', content: '#f6f6f3' },
        { name: 'color-scheme', content: 'light' },
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },

  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  runtimeConfig: {
    public: {
      apiV1Base: publicApiBase,
      apiV2Base: publicApiV2Base,
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || process.env.VITE_SITE_NAME || '日常',
    },
  },

  routeRules: {
    '/': { swr: 300 },
    '/workspace/**': { ssr: false },
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    devProxy: {
      '/api': {
        target: process.env.NUXT_API_PROXY_TARGET || 'http://127.0.0.1:8090/api',
        changeOrigin: true,
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },

  eslint: {
    config: {
      stylistic: {
        semi: false,
        quotes: 'single',
      },
    },
  },

  // API 代理占用 /api 前缀，因此把所有已知图标编入客户端，禁止运行时请求图标接口。
  icon: {
    provider: 'none',
    clientBundle: {
      scan: true,
      sizeLimitKb: 64,
      icons: [
        'lucide:arrow-left',
        'lucide:arrow-down',
        'lucide:arrow-right',
        'lucide:arrow-up-right',
        'lucide:book-open',
        'lucide:calendar-check',
        'lucide:calendar-days',
        'lucide:chart-no-axes-column-increasing',
        'lucide:chevron-down',
        'lucide:chevron-up',
        'lucide:circle-check',
        'lucide:clapperboard',
        'lucide:eye',
        'lucide:globe-2',
        'lucide:inbox',
        'lucide:list-tree',
        'lucide:lock',
        'lucide:lock-keyhole',
        'lucide:log-out',
        'lucide:menu',
        'lucide:moon-star',
        'lucide:notebook-pen',
        'lucide:pause',
        'lucide:play',
        'lucide:plus',
        'lucide:search',
        'lucide:shield-check',
        'lucide:sparkles',
        'lucide:square',
        'lucide:sun',
        'lucide:tags',
        'lucide:timer',
        'lucide:timer-reset',
        'lucide:x',
      ],
    },
  },
})
