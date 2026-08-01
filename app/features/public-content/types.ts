import type { TimelineRecord } from '~/features/records/types'

export interface PublicArticleSummary {
  id: number
  title: string
  summary: string
  cover: string
  createTime: string
  categoryName: string
  viewCount: number
  commentCount: number
  likeCount: number
}

export interface PublicArticleTag {
  id: number
  name: string
  color: string
}

export interface PublicArticleDetail extends PublicArticleSummary {
  slug?: string | null
  content: string
  createdAt?: string | null
  tags: PublicArticleTag[]
}

export interface PublicArticlePage {
  records: PublicArticleSummary[]
  total: number
  current: number
  size: number
}

export interface PublicHomeContent {
  records: TimelineRecord[]
  articles: PublicArticleSummary[]
  hasLoadFailure: boolean
}
