import { mapRemoteTimelineRecord } from '~/features/records/api'
import type { RemoteTimelinePage } from '~/features/records/api'
import type {
  MovieCaptureInput,
  NoteCaptureInput,
  ReadingCaptureInput,
  TimelineRecord,
} from '~/features/records/types'
import type { ApiResponse } from '~/types/api'

export function useRecordsApi() {
  const pendingStorageKey = 'daily-workspace-pending-records-v1'
  const config = useRuntimeConfig()
  const workspace = useWorkspace()
  const loading = useState('records-api-loading', () => false)
  const initialized = useState('records-api-initialized', () => false)
  const nextCursor = useState<string | null>('records-api-next-cursor', () => null)
  const hasMore = useState('records-api-has-more', () => false)
  const error = useState<string | null>('records-api-error', () => null)
  const pendingCount = useState('records-api-pending-count', () => 0)

  function isTimelineRecord(value: unknown): value is TimelineRecord {
    if (!value || typeof value !== 'object') return false
    const candidate = value as { id?: unknown, kind?: unknown }
    return typeof candidate.id === 'string'
      && ['note', 'focus', 'reading', 'movie'].includes(String(candidate.kind))
  }

  function readPendingRecords(): TimelineRecord[] {
    if (import.meta.server) return []
    try {
      const raw = localStorage.getItem(pendingStorageKey)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.filter(isTimelineRecord) : []
    }
    catch {
      return []
    }
  }

  function writePendingRecords(records: TimelineRecord[]): void {
    pendingCount.value = records.length
    if (import.meta.server) return
    try {
      if (records.length) localStorage.setItem(pendingStorageKey, JSON.stringify(records))
      else localStorage.removeItem(pendingStorageKey)
    }
    catch {
      // 本地存储不可用时，记录仍保留在当前内存状态。
    }
  }

  async function loadPage(cursor: string | null): Promise<void> {
    if (loading.value) return

    loading.value = true
    error.value = null
    try {
      const response = await $fetch<ApiResponse<RemoteTimelinePage>>('/records/timeline', {
        baseURL: config.public.apiV2Base,
        credentials: 'include',
        query: {
          limit: 40,
          ...(cursor ? { cursor } : {}),
        },
      })
      if (response.code !== 200 || !response.data) {
        throw new Error(response.msg || '时间流读取失败')
      }

      workspace.mergeRecords(response.data.items.map(mapRemoteTimelineRecord))
      nextCursor.value = response.data.next_cursor
      hasMore.value = response.data.has_more
      initialized.value = true
    }
    catch {
      error.value = '服务端记录暂时无法读取，本机记录仍可正常使用'
    }
    finally {
      loading.value = false
    }
  }

  async function syncLatest(): Promise<void> {
    await loadPage(null)
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || !nextCursor.value) return
    await loadPage(nextCursor.value)
  }

  async function create(path: string, body: Record<string, unknown>): Promise<TimelineRecord> {
    const response = await $fetch<ApiResponse<NonNullable<RemoteTimelinePage['items'][number]>>>('/records/' + path, {
      method: 'POST',
      baseURL: config.public.apiV2Base,
      credentials: 'include',
      body,
    })
    if ((response.code !== 200 && response.code !== 201) || !response.data) {
      throw new Error(response.msg || '记录保存失败')
    }
    return mapRemoteTimelineRecord(response.data)
  }

  function recordRequest(record: TimelineRecord): { path: string, body: Record<string, unknown> } {
    switch (record.kind) {
      case 'note':
        return {
          path: 'notes',
          body: {
            content: record.detail.content,
            format: record.detail.format,
            visibility: record.visibility,
            occurred_at: record.occurredAt,
            tags: record.tags,
            source_key: record.id,
          },
        }
      case 'focus':
        return {
          path: 'focus',
          body: {
            task: record.detail.task,
            project: record.detail.project || '',
            duration_seconds: record.detail.durationSeconds,
            target_seconds: record.detail.targetSeconds || 0,
            started_at: record.occurredAt,
            ended_at: record.createdAt,
            occurred_at: record.occurredAt,
            tags: record.tags,
            source_key: record.id,
          },
        }
      case 'reading':
        return {
          path: 'reading',
          body: {
            book_title: record.detail.bookTitle,
            author: record.detail.author || '',
            progress: record.detail.progress,
            duration_minutes: record.detail.durationMinutes,
            status: record.detail.status,
            note: record.summary,
            visibility: record.visibility,
            occurred_at: record.occurredAt,
            tags: record.tags,
            source_key: record.id,
          },
        }
      case 'movie':
        return {
          path: 'movies',
          body: {
            movie_title: record.detail.movieTitle,
            director: record.detail.director || '',
            rating: record.detail.rating,
            status: record.detail.status,
            note: record.summary,
            visibility: record.visibility,
            occurred_at: record.occurredAt,
            tags: record.tags,
            source_key: record.id,
          },
        }
    }
  }

  async function syncRecord(record: TimelineRecord): Promise<TimelineRecord> {
    const request = recordRequest(record)
    return create(request.path, request.body)
  }

  function queueLocalRecord(record: TimelineRecord): void {
    const records = readPendingRecords().filter(item => item.id !== record.id)
    writePendingRecords([...records, record])
  }

  async function flushPending(): Promise<void> {
    const pending = readPendingRecords()
    pendingCount.value = pending.length
    for (const localRecord of pending) {
      try {
        const remoteRecord = await syncRecord(localRecord)
        workspace.replaceRecord(localRecord.id, remoteRecord)
        writePendingRecords(readPendingRecords().filter(item => item.id !== localRecord.id))
      }
      catch {
        // 服务端不可用时保留队列，下一次进入工作台再尝试。
        break
      }
    }
  }

  async function bootstrap(): Promise<void> {
    await syncLatest()
    await flushPending()
  }

  async function createNote(input: NoteCaptureInput): Promise<TimelineRecord> {
    return create('notes', {
      content: input.content,
      visibility: input.visibility,
      format: 'markdown',
    })
  }

  async function createFocus(record: Extract<TimelineRecord, { kind: 'focus' }>): Promise<TimelineRecord> {
    return syncRecord(record)
  }

  async function createReading(input: ReadingCaptureInput): Promise<TimelineRecord> {
    return create('reading', {
      book_title: input.bookTitle,
      author: input.author || '',
      progress: input.progress,
      duration_minutes: input.durationMinutes,
      status: input.status,
      note: input.note || '',
      visibility: input.visibility,
    })
  }

  async function createMovie(input: MovieCaptureInput): Promise<TimelineRecord> {
    return create('movies', {
      movie_title: input.movieTitle,
      director: input.director || '',
      rating: input.rating,
      status: input.status,
      note: input.note || '',
      visibility: input.visibility,
    })
  }

  return {
    loading,
    initialized,
    nextCursor,
    hasMore,
    error,
    pendingCount,
    syncLatest,
    loadMore,
    bootstrap,
    queueLocalRecord,
    flushPending,
    createNote,
    createFocus,
    createReading,
    createMovie,
  }
}
