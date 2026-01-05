import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSiteConfig } from '../api'
import config from '../config' // Fallback

export const useSiteStore = defineStore('site', () => {
  const siteConfig = ref({
    siteName: config.site.name,
    siteDescription: config.site.description,
    siteAvatar: config.site.avatar,
    siteAuthor: config.site.author,
    heroTitle: config.hero.title,
    heroBgImage: config.hero.bgImage,
    heroSentences: config.hero.sentences,
    showNotice: config.modules.showNotice,
    noticeText: config.modules.noticeText,
    aboutContent: '',
    messageBoardBanners: [] as string[],
    danmakuSpeed: 10,
    danmakuOpacity: 0.7,
    danmakuFontSize: 14,
    danmakuInterval: 1200
  })

  const fetchConfig = async () => {
    try {
      const res: any = await getSiteConfig()
      if (res.code === 200) {
        siteConfig.value = res.data
      }
    } catch (error) {
      console.error('Failed to fetch site config', error)
    }
  }

  return {
    siteConfig,
    fetchConfig
  }
})
