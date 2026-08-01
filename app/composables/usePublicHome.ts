import type { PublicHomeContent } from '~/features/public-content/types'

function emptyPublicHomeContent(): PublicHomeContent {
  return {
    records: [],
    articles: [],
    hasLoadFailure: false,
  }
}

export function usePublicHome() {
  const { listArticles, listTimeline } = usePublicContentApi()

  const homeContent = useAsyncData<PublicHomeContent>(
    'public-home-content',
    async () => {
      const [timelineResult, articlesResult] = await Promise.allSettled([
        listTimeline(12),
        listArticles({ current: 1, size: 4 }),
      ])

      return {
        records: timelineResult.status === 'fulfilled' ? timelineResult.value : [],
        articles: articlesResult.status === 'fulfilled' ? articlesResult.value.records : [],
        hasLoadFailure: timelineResult.status === 'rejected' || articlesResult.status === 'rejected',
      }
    },
    {
      // 预渲染把公开内容写入 HTML，供搜索引擎和分享卡片直接读取。
      default: emptyPublicHomeContent,
    },
  )

  onMounted(() => {
    // 静态版本仍在浏览器刷新一次，保持日常记录的即时性。
    homeContent.refresh()
  })

  return homeContent
}
