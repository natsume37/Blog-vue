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

  return useAsyncData<PublicHomeContent>(
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
      // 主站是静态发布；在访客浏览器请求公开 API，避免构建产物把内容冻结。
      server: false,
      default: emptyPublicHomeContent,
    },
  )
}
