import { mapRemoteTimelineRecord } from '~/features/records/api'
import type { RemoteTimelinePage } from '~/features/records/api'
import type { TimelineRecord } from '~/features/records/types'
import type { ApiResponse } from '~/types/api'
import type {
  PublicArticleDetail,
  PublicArticlePage,
} from '~/features/public-content/types'

function responseData<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (response.code !== 200 || response.data === null) {
    throw new Error(response.msg || fallbackMessage)
  }
  return response.data
}

function normalizePositiveInteger(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.max(1, Math.round(value))
}

function normalizePageSize(value: number, fallback: number): number {
  return Math.min(100, normalizePositiveInteger(value, fallback))
}

export function usePublicContentApi() {
  const config = useRuntimeConfig()

  // 公开页面不携带站长会话，避免在同一浏览器登录时意外渲染私有内容。
  const publicRequestOptions = {
    credentials: 'omit' as const,
    retry: 1,
    timeout: 8_000,
  }

  async function listTimeline(limit = 12): Promise<TimelineRecord[]> {
    const response = await $fetch<ApiResponse<RemoteTimelinePage>>('/records/timeline', {
      baseURL: config.public.apiV2Base,
      query: { limit: normalizePageSize(limit, 12) },
      ...publicRequestOptions,
    })
    const page = responseData(response, '公开记录暂时无法读取')
    return page.items
      .map(mapRemoteTimelineRecord)
      .filter(record => record.visibility === 'public')
  }

  async function listArticles(options: { current?: number, size?: number } = {}): Promise<PublicArticlePage> {
    const response = await $fetch<ApiResponse<PublicArticlePage>>('/articles', {
      baseURL: config.public.apiV1Base,
      query: {
        current: normalizePositiveInteger(options.current ?? 1, 1),
        size: normalizePageSize(options.size ?? 12, 12),
      },
      ...publicRequestOptions,
    })
    return responseData(response, '公开文章暂时无法读取')
  }

  async function getArticle(articleId: number): Promise<PublicArticleDetail> {
    if (!Number.isInteger(articleId) || articleId < 1) {
      throw new Error('文章地址无效')
    }

    const response = await $fetch<ApiResponse<PublicArticleDetail>>(`/articles/${articleId}`, {
      baseURL: config.public.apiV1Base,
      ...publicRequestOptions,
    })
    return responseData(response, '文章暂时无法读取')
  }

  return {
    listTimeline,
    listArticles,
    getArticle,
  }
}
