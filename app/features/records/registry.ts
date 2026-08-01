import type { RecordKind } from './types'

export interface RecordModuleDefinition {
  kind: RecordKind
  label: string
  shortLabel: string
  icon: string
  color: string
  description: string
}

export const recordModules = [
  {
    kind: 'note',
    label: '随手笔记',
    shortLabel: '笔记',
    icon: 'i-lucide-notebook-pen',
    color: '#60776b',
    description: '写下一段想法、待办或灵感',
  },
  {
    kind: 'focus',
    label: '开始专注',
    shortLabel: '专注',
    icon: 'i-lucide-timer',
    color: '#8a694b',
    description: '为眼前的任务留出完整时间',
  },
  {
    kind: 'reading',
    label: '阅读进度',
    shortLabel: '阅读',
    icon: 'i-lucide-book-open',
    color: '#62728a',
    description: '记录进度、时长和当下感受',
  },
  {
    kind: 'movie',
    label: '电影记录',
    shortLabel: '电影',
    icon: 'i-lucide-clapperboard',
    color: '#8a5d61',
    description: '保存观影状态、评分和短记',
  },
] as const satisfies readonly RecordModuleDefinition[]

export function getRecordModule(kind: RecordKind): RecordModuleDefinition {
  const module = recordModules.find(item => item.kind === kind)

  // RecordKind 与注册表同源；这里保留显式失败，避免新增模块时静默降级。
  if (!module) {
    throw new Error(`Unknown record module: ${kind}`)
  }

  return module
}
