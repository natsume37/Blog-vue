import {
  archiveThemeOptions,
  archiveThemeStorageKey,
  defaultArchiveTheme,
  getArchiveThemeOption,
  isArchiveThemeId,
  type ArchiveThemeId,
} from '~/utils/archive-theme'

export function readStoredArchiveTheme(): ArchiveThemeId {
  if (!import.meta.client) return defaultArchiveTheme

  try {
    const savedTheme = window.localStorage.getItem(archiveThemeStorageKey)
    return isArchiveThemeId(savedTheme) ? savedTheme : defaultArchiveTheme
  }
  catch {
    return defaultArchiveTheme
  }
}

export function applyArchiveTheme(themeId: ArchiveThemeId): void {
  if (!import.meta.client) return

  const theme = getArchiveThemeOption(themeId)
  document.documentElement.dataset.archiveTheme = theme.id

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (themeColor) themeColor.content = theme.canvas
}

export function useArchiveTheme() {
  const theme = useState<ArchiveThemeId>('archive-theme', () => defaultArchiveTheme)

  onMounted(() => {
    // Nuxt 接管 head 后再同步一次，避免移动端地址栏回退到默认主题色。
    applyArchiveTheme(theme.value)
  })

  function setTheme(themeId: ArchiveThemeId): void {
    theme.value = themeId
    applyArchiveTheme(themeId)

    if (!import.meta.client) return

    try {
      window.localStorage.setItem(archiveThemeStorageKey, themeId)
    }
    catch {
      // 无痕模式等环境禁止持久化时，当前页面仍可正常切换主题。
    }
  }

  return {
    theme,
    themes: archiveThemeOptions,
    setTheme,
  }
}
