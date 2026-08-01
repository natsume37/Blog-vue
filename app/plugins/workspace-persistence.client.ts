import { watch } from 'vue'

import { recordKinds } from '~/features/records/types'
import type { TimelineRecord } from '~/features/records/types'

const STORAGE_KEY = 'daily-workspace-records-v1'

function isTimelineRecord(value: unknown): value is TimelineRecord {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>

  return typeof candidate.id === 'string'
    && typeof candidate.title === 'string'
    && typeof candidate.summary === 'string'
    && typeof candidate.occurredAt === 'string'
    && typeof candidate.createdAt === 'string'
    && (candidate.visibility === 'private' || candidate.visibility === 'public')
    && typeof candidate.kind === 'string'
    && recordKinds.includes(candidate.kind as typeof recordKinds[number])
    && Array.isArray(candidate.tags)
    && candidate.detail !== null
    && typeof candidate.detail === 'object'
}

export default defineNuxtPlugin(() => {
  const workspace = useWorkspace()
  const recordsApi = useRecordsApi()

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isTimelineRecord)) {
        workspace.hydrateRecords(parsed)
      }
    }
  }
  catch {
    // 本地缓存损坏不应阻止工作台启动，后续服务端同步会覆盖它。
  }

  workspace.state.value.hasHydrated = true

  watch(
    () => workspace.state.value.records,
    (records) => {
      try {
        // 服务端记录每次启动都会刷新；这里只保存尚未接入数据库的本机记录。
        const localRecords = records.filter(record => !record.id.includes(':'))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localRecords))
      }
      catch {
        // 浏览器禁用存储时继续使用内存状态。
      }
    },
    { deep: true },
  )

  if (!recordsApi.initialized.value) void recordsApi.bootstrap()
})
