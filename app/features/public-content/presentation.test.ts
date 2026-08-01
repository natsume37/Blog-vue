import { describe, expect, it } from 'vitest'

import { formatPublicDate, getArticleExcerpt, getPublicRecordDetail } from './presentation'

describe('public content presentation', () => {
  it('summarizes a reading record with author and progress', () => {
    expect(getPublicRecordDetail({
      id: 'reading:1',
      kind: 'reading',
      title: '《悉达多》读到 45%',
      summary: '',
      visibility: 'public',
      occurredAt: '2026-08-02T09:00:00+08:00',
      createdAt: '2026-08-02T09:00:00+08:00',
      tags: [],
      detail: {
        bookTitle: '悉达多',
        author: '赫尔曼·黑塞',
        progress: 45,
        durationMinutes: 30,
        status: '在读',
      },
    })).toBe('赫尔曼·黑塞 · 阅读进度 45%')
  })

  it('keeps public dates stable and trims article excerpts', () => {
    expect(formatPublicDate('2026-08-02T09:00:00+08:00')).toBe('2026.08.02')
    expect(getArticleExcerpt({
      id: 1,
      title: '测试文章',
      summary: '  这是一段\n 会被压缩的摘要。 ',
      cover: '',
      createTime: '2026-08-02 09:00:00',
      categoryName: '',
      viewCount: 0,
      commentCount: 0,
      likeCount: 0,
    })).toBe('这是一段 会被压缩的摘要。')
  })
})
