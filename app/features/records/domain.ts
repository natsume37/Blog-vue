import type {
  FocusCaptureInput,
  FocusRecord,
  FocusSession,
  MovieCaptureInput,
  MovieRecord,
  NoteCaptureInput,
  NoteRecord,
  ReadingCaptureInput,
  ReadingRecord,
  RecordKind,
  TimelineRecord,
  WorkspaceState,
} from './types'

function createId(prefix: RecordKind | 'session'): string {
  const suffix = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${suffix}`
}

function localTime(hours: number, minutes: number): string {
  const value = new Date()
  value.setHours(hours, minutes, 0, 0)
  return value.toISOString()
}

export function createNoteRecord(input: NoteCaptureInput, now = new Date()): NoteRecord {
  const content = input.content.trim()
  const [firstLine = '未命名笔记', ...rest] = content.split('\n').filter(Boolean)

  return {
    id: createId('note'),
    kind: 'note',
    title: firstLine.slice(0, 56),
    summary: rest.join(' ').slice(0, 140),
    visibility: input.visibility,
    occurredAt: now.toISOString(),
    createdAt: now.toISOString(),
    tags: [],
    detail: { content, format: 'markdown' },
  }
}

export function createReadingRecord(input: ReadingCaptureInput, now = new Date()): ReadingRecord {
  const progress = Math.min(100, Math.max(0, Math.round(input.progress)))
  const durationMinutes = Math.max(1, Math.round(input.durationMinutes))

  return {
    id: createId('reading'),
    kind: 'reading',
    title: `《${input.bookTitle.trim()}》读到 ${progress}%`,
    summary: input.note?.trim() || `本次阅读 ${durationMinutes} 分钟。`,
    visibility: input.visibility,
    occurredAt: now.toISOString(),
    createdAt: now.toISOString(),
    tags: [],
    detail: {
      bookTitle: input.bookTitle.trim(),
      author: input.author?.trim(),
      progress,
      durationMinutes,
      status: input.status,
    },
  }
}

export function createMovieRecord(input: MovieCaptureInput, now = new Date()): MovieRecord {
  const rating = Math.min(5, Math.max(0, input.rating))

  return {
    id: createId('movie'),
    kind: 'movie',
    title: `《${input.movieTitle.trim()}》`,
    summary: input.note?.trim() || `${input.status}${rating ? ` · ${rating} 星` : ''}`,
    visibility: input.visibility,
    occurredAt: now.toISOString(),
    createdAt: now.toISOString(),
    tags: [],
    detail: {
      movieTitle: input.movieTitle.trim(),
      director: input.director?.trim(),
      rating,
      status: input.status,
    },
  }
}

export function createFocusSession(input: FocusCaptureInput, now = new Date()): FocusSession {
  return {
    id: createId('session'),
    task: input.task.trim(),
    project: input.project?.trim(),
    targetSeconds: Math.max(0, Math.round(input.durationMinutes * 60)),
    elapsedSeconds: 0,
    startedAt: now.toISOString(),
    isRunning: true,
  }
}

export function finishFocusSession(session: FocusSession, now = new Date()): FocusRecord {
  const durationSeconds = Math.max(1, session.elapsedSeconds)
  const durationMinutes = Math.max(1, Math.round(durationSeconds / 60))

  return {
    id: createId('focus'),
    kind: 'focus',
    title: session.task,
    summary: `完成一次 ${durationMinutes} 分钟的专注`,
    visibility: 'private',
    occurredAt: session.startedAt,
    createdAt: now.toISOString(),
    tags: session.project ? [session.project] : [],
    detail: {
      task: session.task,
      durationSeconds,
      targetSeconds: session.targetSeconds,
      project: session.project,
    },
  }
}

export function filterRecords(
  records: TimelineRecord[],
  kind: RecordKind | 'all',
  search: string,
): TimelineRecord[] {
  const keyword = search.trim().toLocaleLowerCase('zh-CN')

  return records
    .filter(record => kind === 'all' || record.kind === kind)
    .filter((record) => {
      if (!keyword) return true
      return [record.title, record.summary, ...record.tags]
        .join(' ')
        .toLocaleLowerCase('zh-CN')
        .includes(keyword)
    })
    .toSorted((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))
}

export function formatClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60
  return [hours, minutes, seconds].map(value => String(value).padStart(2, '0')).join(':')
}

export function createInitialWorkspaceState(withDemoRecords = true): WorkspaceState {
  const demoRecords: TimelineRecord[] = [
    {
      id: 'demo-note',
      kind: 'note',
      title: '把个人空间做成可以长期使用的系统',
      summary: '功能应该围绕每天真实发生的记录生长，而不是堆成一个展示型首页。',
      visibility: 'private',
      occurredAt: localTime(10, 42),
      createdAt: localTime(10, 42),
      tags: ['产品思考'],
      detail: {
        content: '把个人空间做成可以长期使用的系统\n功能应该围绕每天真实发生的记录生长，而不是堆成一个展示型首页。',
        format: 'markdown',
      },
    },
    {
      id: 'demo-focus',
      kind: 'focus',
      title: '梳理个人数字空间的信息架构',
      summary: '完成一次 45 分钟的专注',
      visibility: 'private',
      occurredAt: localTime(9, 32),
      createdAt: localTime(10, 17),
      tags: ['个人数字空间'],
      detail: {
        task: '梳理个人数字空间的信息架构',
        durationSeconds: 2700,
        project: '个人数字空间',
      },
    },
    {
      id: 'demo-reading',
      kind: 'reading',
      title: '《创造的秩序》读到 42%',
      summary: '好的秩序让重要的事更容易发生。',
      visibility: 'public',
      occurredAt: localTime(8, 18),
      createdAt: localTime(8, 18),
      tags: ['设计'],
      detail: {
        bookTitle: '创造的秩序',
        author: '未知作者',
        progress: 42,
        durationMinutes: 28,
        status: '在读',
      },
    },
    {
      id: 'demo-movie',
      kind: 'movie',
      title: '《完美的日子》',
      summary: '平静不是没有变化，而是愿意认真看见每一次重复。',
      visibility: 'private',
      occurredAt: localTime(0, 12),
      createdAt: localTime(0, 12),
      tags: ['生活'],
      detail: {
        movieTitle: '完美的日子',
        director: '维姆·文德斯',
        rating: 5,
        status: '看过',
      },
    },
  ]

  return {
    activeCapture: 'note',
    activeFilter: 'all',
    search: '',
    records: withDemoRecords ? demoRecords : [],
    activeFocus: null,
    hasHydrated: false,
  }
}
