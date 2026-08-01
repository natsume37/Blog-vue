import { describe, expect, it } from 'vitest'

import {
  createFocusSession,
  createMovieRecord,
  createNoteRecord,
  filterRecords,
  finishFocusSession,
  formatClock,
} from './domain'

describe('records domain', () => {
  it('creates a note from the first meaningful line', () => {
    const record = createNoteRecord(
      { content: '标题\n第二行内容', visibility: 'public' },
      new Date('2026-08-01T10:00:00.000Z'),
    )

    expect(record.title).toBe('标题')
    expect(record.summary).toBe('第二行内容')
    expect(record.visibility).toBe('public')
  })

  it('clamps movie ratings to the supported range', () => {
    const record = createMovieRecord({
      movieTitle: '测试电影',
      status: '看过',
      rating: 9,
      visibility: 'private',
    })

    expect(record.detail.rating).toBe(5)
  })

  it('turns a focus session into a private timeline record', () => {
    const session = createFocusSession({ task: '写测试', durationMinutes: 25 })
    session.elapsedSeconds = 125
    const record = finishFocusSession(session)

    expect(record.kind).toBe('focus')
    expect(record.visibility).toBe('private')
    expect(record.detail.durationSeconds).toBe(125)
  })

  it('filters by module and keyword', () => {
    const note = createNoteRecord({ content: '工作台设计', visibility: 'private' })
    const movie = createMovieRecord({
      movieTitle: '完美的日子',
      status: '看过',
      rating: 5,
      visibility: 'private',
    })

    expect(filterRecords([note, movie], 'movie', '完美')).toEqual([movie])
    expect(filterRecords([note, movie], 'note', '完美')).toEqual([])
  })

  it('formats elapsed time consistently', () => {
    expect(formatClock(3723)).toBe('01:02:03')
  })
})
