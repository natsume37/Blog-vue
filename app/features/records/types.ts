export const recordKinds = ['note', 'focus', 'reading', 'movie'] as const

export type RecordKind = typeof recordKinds[number]
export type RecordVisibility = 'private' | 'public'
export type ReadingStatus = '想读' | '在读' | '读完'
export type MovieStatus = '想看' | '在看' | '看过'

interface BaseRecord<K extends RecordKind, D> {
  id: string
  kind: K
  title: string
  summary: string
  visibility: RecordVisibility
  occurredAt: string
  createdAt: string
  tags: string[]
  detail: D
}

export type NoteRecord = BaseRecord<'note', {
  content: string
  format: 'markdown'
}>

export type FocusRecord = BaseRecord<'focus', {
  task: string
  durationSeconds: number
  targetSeconds?: number
  project?: string
}>

export type ReadingRecord = BaseRecord<'reading', {
  bookTitle: string
  author?: string
  progress: number
  durationMinutes: number
  status: ReadingStatus
}>

export type MovieRecord = BaseRecord<'movie', {
  movieTitle: string
  director?: string
  rating: number
  status: MovieStatus
}>

export type TimelineRecord = NoteRecord | FocusRecord | ReadingRecord | MovieRecord

export interface NoteCaptureInput {
  content: string
  visibility: RecordVisibility
}

export interface FocusCaptureInput {
  task: string
  durationMinutes: number
  project?: string
}

export interface ReadingCaptureInput {
  bookTitle: string
  author?: string
  progress: number
  durationMinutes: number
  status: ReadingStatus
  note?: string
  visibility: RecordVisibility
}

export interface MovieCaptureInput {
  movieTitle: string
  director?: string
  rating: number
  status: MovieStatus
  note?: string
  visibility: RecordVisibility
}

export interface FocusSession {
  id: string
  task: string
  project?: string
  targetSeconds: number
  elapsedSeconds: number
  startedAt: string
  isRunning: boolean
}

export interface WorkspaceState {
  activeCapture: RecordKind
  activeFilter: RecordKind | 'all'
  search: string
  records: TimelineRecord[]
  activeFocus: FocusSession | null
  hasHydrated: boolean
}
