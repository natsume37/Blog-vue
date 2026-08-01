import {
  applyArchiveTheme,
  readStoredArchiveTheme,
} from '~/composables/useArchiveTheme'
import {
  archiveThemeStorageKey,
  defaultArchiveTheme,
  isArchiveThemeId,
  type ArchiveThemeId,
} from '~/utils/archive-theme'

export default defineNuxtPlugin(() => {
  const theme = useState<ArchiveThemeId>('archive-theme', () => defaultArchiveTheme)
  const initialTheme = readStoredArchiveTheme()

  theme.value = initialTheme
  applyArchiveTheme(initialTheme)

  window.addEventListener('storage', (event) => {
    if (event.key !== archiveThemeStorageKey) return

    const nextTheme = isArchiveThemeId(event.newValue)
      ? event.newValue
      : defaultArchiveTheme

    theme.value = nextTheme
    applyArchiveTheme(nextTheme)
  })
})
