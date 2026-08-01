import type { RecordKind, TimelineRecord } from '~/features/records/types'
import type { PublicArticleSummary } from './types'

export interface PublicRecordMeta {
  label: string
  icon: string
  accent: string
}

export const publicRecordMeta: Record<RecordKind, PublicRecordMeta> = {
  note: {
    label: '笔记',
    icon: 'i-lucide-notebook-pen',
    accent: 'sage',
  },
  focus: {
    label: '专注',
    icon: 'i-lucide-timer',
    accent: 'ink',
  },
  reading: {
    label: '阅读',
    icon: 'i-lucide-book-open',
    accent: 'amber',
  },
  movie: {
    label: '电影',
    icon: 'i-lucide-clapperboard',
    accent: 'rose',
  },
}

function compactText(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim()
}

export function formatPublicDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未标注日期'

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}.${month}.${day}`
}

export function getPublicRecordDetail(record: TimelineRecord): string {
  switch (record.kind) {
    case 'note':
      return compactText(record.summary) || '日常片段'
    case 'focus': {
      const minutes = Math.max(0, Math.round(record.detail.durationSeconds / 60))
      return [record.detail.project, minutes ? `${minutes} 分钟专注` : '专注记录']
        .filter(Boolean)
        .join(' · ')
    }
    case 'reading':
      return [record.detail.author, `阅读进度 ${record.detail.progress}%`]
        .filter(Boolean)
        .join(' · ')
    case 'movie': {
      const rating = record.detail.rating > 0
        ? `评分 ${record.detail.rating.toFixed(record.detail.rating % 1 ? 1 : 0)}`
        : record.detail.status
      return [record.detail.director, rating].filter(Boolean).join(' · ')
    }
  }
}

export function getArticleExcerpt(article: PublicArticleSummary, length = 88): string {
  const text = compactText(article.summary)
  if (!text) return '一篇等待展开阅读的文章。'
  return text.length > length ? `${text.slice(0, length)}…` : text
}
