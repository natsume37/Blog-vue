import { computed } from 'vue'

import {
  createFocusSession,
  createInitialWorkspaceState,
  createMovieRecord,
  createNoteRecord,
  createReadingRecord,
  filterRecords,
  finishFocusSession,
} from '~/features/records/domain'
import type {
  FocusCaptureInput,
  MovieCaptureInput,
  NoteCaptureInput,
  ReadingCaptureInput,
  RecordKind,
  TimelineRecord,
} from '~/features/records/types'

function isToday(isoValue: string): boolean {
  const value = new Date(isoValue)
  const today = new Date()
  return value.getFullYear() === today.getFullYear()
    && value.getMonth() === today.getMonth()
    && value.getDate() === today.getDate()
}

export function useWorkspace() {
  const state = useState('workspace-state', () => createInitialWorkspaceState(import.meta.dev))

  const visibleRecords = computed(() => filterRecords(
    state.value.records,
    state.value.activeFilter,
    state.value.search,
  ))
  const todayCount = computed(() => state.value.records.filter(record => isToday(record.occurredAt)).length)
  const todayFocusSeconds = computed(() => state.value.records
    .filter((record): record is Extract<TimelineRecord, { kind: 'focus' }> => record.kind === 'focus' && isToday(record.occurredAt))
    .reduce((total, record) => total + record.detail.durationSeconds, 0))
  const currentReading = computed(() => state.value.records.find(
    (record): record is Extract<TimelineRecord, { kind: 'reading' }> => record.kind === 'reading' && record.detail.status === '在读',
  ))

  function setActiveCapture(kind: RecordKind): void {
    state.value.activeCapture = kind
  }

  function setFilter(kind: RecordKind | 'all'): void {
    state.value.activeFilter = kind
  }

  function setSearch(value: string): void {
    state.value.search = value
  }

  function prependRecord(record: TimelineRecord): void {
    state.value.records = [record, ...state.value.records]
    state.value.activeFilter = 'all'
    state.value.search = ''
  }

  function addNote(input: NoteCaptureInput): TimelineRecord {
    const record = createNoteRecord(input)
    prependRecord(record)
    return record
  }

  function addReading(input: ReadingCaptureInput): TimelineRecord {
    const record = createReadingRecord(input)
    prependRecord(record)
    return record
  }

  function addMovie(input: MovieCaptureInput): TimelineRecord {
    const record = createMovieRecord(input)
    prependRecord(record)
    return record
  }

  function startFocus(input: FocusCaptureInput): void {
    state.value.activeFocus = createFocusSession(input)
  }

  function toggleFocus(): void {
    if (!state.value.activeFocus) return
    state.value.activeFocus.isRunning = !state.value.activeFocus.isRunning
  }

  function tickFocus(): void {
    if (!state.value.activeFocus?.isRunning) return
    state.value.activeFocus.elapsedSeconds += 1
  }

  function stopFocus(): Extract<TimelineRecord, { kind: 'focus' }> | null {
    if (!state.value.activeFocus) return null
    const record = finishFocusSession(state.value.activeFocus)
    state.value.activeFocus = null
    prependRecord(record)
    return record
  }

  function hydrateRecords(records: TimelineRecord[]): void {
    state.value.records = records
    state.value.hasHydrated = true
  }

  function mergeRecords(records: TimelineRecord[]): void {
    const byId = new Map(state.value.records.map(record => [record.id, record]))
    for (const record of records) byId.set(record.id, record)
    state.value.records = [...byId.values()]
  }

  function replaceRecord(localId: string, record: TimelineRecord): void {
    state.value.records = state.value.records
      .map(item => item.id === localId ? record : item)
  }

  return {
    state,
    visibleRecords,
    todayCount,
    todayFocusSeconds,
    currentReading,
    setActiveCapture,
    setFilter,
    setSearch,
    addNote,
    addReading,
    addMovie,
    startFocus,
    toggleFocus,
    tickFocus,
    stopFocus,
    hydrateRecords,
    mergeRecords,
    replaceRecord,
  }
}
