import type {
  FocusRecord,
  MovieRecord,
  MovieStatus,
  NoteRecord,
  ReadingRecord,
  ReadingStatus,
  TimelineRecord,
} from './types'

interface RemoteTimelineRecordBase<K extends 'note' | 'focus' | 'reading' | 'movie', D> {
  id: string
  source_id: number
  kind: K
  title: string
  summary: string
  visibility: 'private' | 'public'
  occurred_at: string
  created_at: string
  tags: string[]
  detail: D
}

export type RemoteNoteRecord = RemoteTimelineRecordBase<'note', {
  content: string
  format: 'markdown' | string
}>

export type RemoteFocusRecord = RemoteTimelineRecordBase<'focus', {
  task: string
  project: string
  duration_seconds: number
  target_seconds: number
}>

export type RemoteReadingRecord = RemoteTimelineRecordBase<'reading', {
  book_title: string
  author: string
  progress: number
  duration_seconds: number
  status: string
}>

export type RemoteMovieRecord = RemoteTimelineRecordBase<'movie', {
  movie_title: string
  director: string
  rating: number
  status: string
  duration_minutes: number
}>

export type RemoteTimelineRecord = RemoteNoteRecord | RemoteFocusRecord | RemoteReadingRecord | RemoteMovieRecord

export interface RemoteTimelinePage {
  items: RemoteTimelineRecord[]
  next_cursor: string | null
  has_more: boolean
}

function normalizeReadingStatus(status: string, progress: number): ReadingStatus {
  if (progress >= 100 || ['已读完', '读完', '已读'].includes(status)) return '读完'
  if (progress > 0 || ['阅读中', '在读'].includes(status)) return '在读'
  return '想读'
}

function normalizeMovieStatus(status: string): MovieStatus {
  if (['已看完', '看过', '已看'].includes(status)) return '看过'
  if (['在看', '重看中'].includes(status)) return '在看'
  return '想看'
}

function mapReadingRecord(record: RemoteReadingRecord): ReadingRecord {
  return {
    id: record.id,
    kind: 'reading',
    title: record.title,
    summary: record.summary,
    visibility: record.visibility,
    occurredAt: record.occurred_at,
    createdAt: record.created_at,
    tags: record.tags,
    detail: {
      bookTitle: record.detail.book_title,
      author: record.detail.author || undefined,
      progress: record.detail.progress,
      durationMinutes: Math.max(0, Math.round(record.detail.duration_seconds / 60)),
      status: normalizeReadingStatus(record.detail.status, record.detail.progress),
    },
  }
}

function mapNoteRecord(record: RemoteNoteRecord): NoteRecord {
  return {
    id: record.id,
    kind: 'note',
    title: record.title,
    summary: record.summary,
    visibility: record.visibility,
    occurredAt: record.occurred_at,
    createdAt: record.created_at,
    tags: record.tags,
    detail: {
      content: record.detail.content,
      format: record.detail.format,
    },
  }
}

function mapFocusRecord(record: RemoteFocusRecord): FocusRecord {
  return {
    id: record.id,
    kind: 'focus',
    title: record.title,
    summary: record.summary,
    visibility: record.visibility,
    occurredAt: record.occurred_at,
    createdAt: record.created_at,
    tags: record.tags,
    detail: {
      task: record.detail.task,
      project: record.detail.project || undefined,
      durationSeconds: record.detail.duration_seconds,
      targetSeconds: record.detail.target_seconds,
    },
  }
}

function mapMovieRecord(record: RemoteMovieRecord): MovieRecord {
  return {
    id: record.id,
    kind: 'movie',
    title: record.title,
    summary: record.summary,
    visibility: record.visibility,
    occurredAt: record.occurred_at,
    createdAt: record.created_at,
    tags: record.tags,
    detail: {
      movieTitle: record.detail.movie_title,
      director: record.detail.director || undefined,
      rating: record.detail.rating,
      status: normalizeMovieStatus(record.detail.status),
    },
  }
}

export function mapRemoteTimelineRecord(record: RemoteTimelineRecord): TimelineRecord {
  switch (record.kind) {
    case 'note':
      return mapNoteRecord(record)
    case 'focus':
      return mapFocusRecord(record)
    case 'reading':
      return mapReadingRecord(record)
    case 'movie':
      return mapMovieRecord(record)
  }
}
