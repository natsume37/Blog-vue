export type ArchiveThemeId = 'paper' | 'mist' | 'warm' | 'night'

export interface ArchiveThemeOption {
  id: ArchiveThemeId
  label: string
  canvas: string
}

export const archiveThemeStorageKey = 'martin-blog:archive-theme'
export const defaultArchiveTheme: ArchiveThemeId = 'paper'

export const archiveThemeOptions: readonly ArchiveThemeOption[] = [
  { id: 'paper', label: '纸页', canvas: '#f6f6f3' },
  { id: 'mist', label: '雾蓝', canvas: '#f3f6f7' },
  { id: 'warm', label: '暖灰', canvas: '#f7f1e8' },
  { id: 'night', label: '夜墨', canvas: '#151817' },
]

export function isArchiveThemeId(value: unknown): value is ArchiveThemeId {
  return typeof value === 'string' && archiveThemeOptions.some(theme => theme.id === value)
}

export function getArchiveThemeOption(themeId: ArchiveThemeId): ArchiveThemeOption {
  return archiveThemeOptions.find(theme => theme.id === themeId) || archiveThemeOptions[0]
}
