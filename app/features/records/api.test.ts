import { describe, expect, it } from 'vitest'

import { mapRemoteTimelineRecord } from './api'

describe('mapRemoteTimelineRecord', () => {
  it('maps reading wire fields and normalizes a completed status', () => {
    const record = mapRemoteTimelineRecord({
      id: 'reading:12',
      source_id: 12,
      kind: 'reading',
      title: '《小王子》读到 100%',
      summary: '重新读完',
      visibility: 'private',
      occurred_at: '2026-08-01T09:00:00',
      created_at: '2026-07-30T09:00:00',
      tags: ['文学'],
      detail: {
        book_title: '小王子',
        author: '圣埃克苏佩里',
        progress: 100,
        duration_seconds: 3720,
        status: '已读完',
      },
    })

    expect(record.kind).toBe('reading')
    if (record.kind !== 'reading') throw new Error('expected reading record')
    expect(record.detail.status).toBe('读完')
    expect(record.detail.durationMinutes).toBe(62)
    expect(record.occurredAt).toBe('2026-08-01T09:00:00')
  })

  it('maps movie status and optional director', () => {
    const record = mapRemoteTimelineRecord({
      id: 'movie:3',
      source_id: 3,
      kind: 'movie',
      title: '《花样年华》',
      summary: '看过',
      visibility: 'public',
      occurred_at: '2026-08-01T20:00:00',
      created_at: '2026-08-01T20:00:00',
      tags: [],
      detail: {
        movie_title: '花样年华',
        director: '',
        rating: 4.5,
        status: '已看完',
        duration_minutes: 98,
      },
    })

    expect(record.kind).toBe('movie')
    if (record.kind !== 'movie') throw new Error('expected movie record')
    expect(record.detail.status).toBe('看过')
    expect(record.detail.director).toBeUndefined()
    expect(record.visibility).toBe('public')
  })
})
