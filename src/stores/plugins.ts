import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as api from '../api'
import { builtinPluginCatalog, resolvePluginIcon } from '../plugins/registry'
import type {
  PluginAdminPage,
  PluginCompatibility,
  PluginDelivery,
  PluginManifest,
  PluginPublisher,
  PluginScreenshot,
} from '../types/plugins'

type PluginMenuItem = {
  path: string
  label: string
  icon: any
  order: number
  pluginId: string
}

const buildPluginPath = (pluginId: string, pageKey?: string) => {
  const suffix = pageKey ? `/${pageKey}` : ''
  return `/admin/plugins/${pluginId}${suffix}`
}

const normalizePublisher = (
  source: PluginManifest,
  fallback?: PluginManifest,
): PluginPublisher => ({
  name: source.publisher?.name || fallback?.publisher?.name || source.author || fallback?.author || '',
  url: source.publisher?.url || fallback?.publisher?.url || source.homepage || fallback?.homepage || '',
  verified: Boolean(source.publisher?.verified ?? fallback?.publisher?.verified ?? source.verified ?? fallback?.verified),
})

const normalizeCompatibility = (
  source: PluginManifest,
  fallback?: PluginManifest,
): PluginCompatibility => ({
  backend: source.compatibility?.backend || fallback?.compatibility?.backend || 'fastapi',
  frontend: source.compatibility?.frontend || fallback?.compatibility?.frontend || 'vue',
  min_app_version: source.compatibility?.min_app_version || fallback?.compatibility?.min_app_version || '1.0.0',
  max_app_version: source.compatibility?.max_app_version || fallback?.compatibility?.max_app_version || '',
})

const normalizeDelivery = (
  source: PluginManifest,
  fallback?: PluginManifest,
): PluginDelivery => ({
  type: source.delivery?.type || fallback?.delivery?.type || 'builtin',
  entry_mode: source.delivery?.entry_mode || fallback?.delivery?.entry_mode || 'local',
  install_strategy: source.delivery?.install_strategy || fallback?.delivery?.install_strategy || 'builtin-toggle',
  runtime_type: source.delivery?.runtime_type || fallback?.delivery?.runtime_type || 'builtin',
  entry_url: source.delivery?.entry_url || fallback?.delivery?.entry_url || '',
})

const normalizePages = (
  pages: PluginAdminPage[] | undefined,
  fallback: PluginAdminPage[] | undefined,
  pluginId: string,
): PluginAdminPage[] => {
  const target = Array.isArray(pages) && pages.length ? pages : (fallback || [])
  return target.map((page, index) => {
    const path = String(page.path || '').trim()
    const key = String(
      page.key ||
      (path ? path.split('/').filter(Boolean).pop() : '') ||
      (index === 0 ? 'settings' : `page-${index + 1}`)
    ).trim()

    return {
      ...page,
      key,
      label: String(page.label || page.menu_label || page.title || key),
      description: page.description || page.title || '',
      component: String(page.component || page.component_key || ''),
      icon: page.icon,
      menu: page.menu ?? true,
      order: page.order ?? (index + 1) * 10,
      default: page.default ?? index === 0,
      render_mode: page.render_mode || 'local',
      entry_url: page.entry_url || '',
      path: path || `/admin/plugins/${pluginId}/${key}`,
    }
  })
}

const normalizeScreenshots = (
  screenshots: PluginScreenshot[] | undefined,
  fallback: PluginScreenshot[] | undefined,
): PluginScreenshot[] => {
  const target = Array.isArray(screenshots) && screenshots.length ? screenshots : (fallback || [])
  return target
    .map((item) => ({
      label: String(item.label || '').trim(),
      url: String(item.url || '').trim(),
    }))
    .filter((item) => item.url)
}

const normalizePlugin = (
  source: Partial<PluginManifest>,
  fallback?: PluginManifest,
): PluginManifest => {
  const raw = source as PluginManifest
  const id = String(raw.id || raw.plugin_id || fallback?.id || '').trim()
  const docsUrl = raw.docsUrl || raw.docs_url || fallback?.docsUrl || fallback?.docs_url || ''
  const repoUrl = raw.repoUrl || raw.repo_url || fallback?.repoUrl || fallback?.repo_url || ''
  const supportUrl = raw.supportUrl || raw.support_url || fallback?.supportUrl || fallback?.support_url || ''
  const issuesUrl = raw.issuesUrl || raw.issues_url || fallback?.issuesUrl || fallback?.issues_url || ''
  const changelogUrl = raw.changelogUrl || raw.changelog_url || fallback?.changelogUrl || fallback?.changelog_url || ''
  const manifestUrl = raw.manifestUrl || raw.manifest_url || fallback?.manifestUrl || fallback?.manifest_url || ''
  const sourceRepo = raw.sourceRepo || raw.source_repo || fallback?.sourceRepo || fallback?.source_repo || ''
  const publishedAt = raw.publishedAt || raw.published_at || fallback?.publishedAt || fallback?.published_at || ''

  return {
    id,
    plugin_id: raw.plugin_id || fallback?.plugin_id,
    name: String(raw.name || fallback?.name || id),
    version: String(raw.version || fallback?.version || '0.0.0'),
    latest_version: String(raw.latest_version || raw.version || fallback?.latest_version || fallback?.version || '0.0.0'),
    installed_version: String(raw.installed_version || fallback?.installed_version || ''),
    description: raw.description ?? fallback?.description ?? '',
    summary: raw.summary ?? fallback?.summary ?? raw.description ?? fallback?.description ?? '',
    author: raw.author ?? fallback?.author ?? '',
    publisher: normalizePublisher(raw, fallback),
    icon: raw.icon || fallback?.icon || 'Grid',
    builtin: Boolean(raw.builtin ?? fallback?.builtin),
    marketplace: Boolean(raw.marketplace ?? fallback?.marketplace),
    official: Boolean(raw.official ?? fallback?.official),
    verified: Boolean(raw.verified ?? fallback?.verified),
    featured: Boolean(raw.featured ?? fallback?.featured),
    installed: Boolean(raw.installed ?? fallback?.installed),
    enabled: Boolean(raw.enabled ?? fallback?.enabled),
    installable: Boolean(raw.installable ?? fallback?.installable ?? true),
    activatable: Boolean(raw.activatable ?? fallback?.activatable ?? true),
    upgrade_available: Boolean(raw.upgrade_available ?? fallback?.upgrade_available),
    status: String(raw.status || fallback?.status || ''),
    category: String(raw.category || fallback?.category || ''),
    source: String(raw.source || fallback?.source || ''),
    homepage: raw.homepage ?? fallback?.homepage ?? '',
    docsUrl,
    docs_url: docsUrl,
    repoUrl,
    repo_url: repoUrl,
    supportUrl,
    support_url: supportUrl,
    issuesUrl,
    issues_url: issuesUrl,
    changelogUrl,
    changelog_url: changelogUrl,
    manifestUrl,
    manifest_url: manifestUrl,
    sourceRepo,
    source_repo: sourceRepo,
    license: raw.license ?? fallback?.license ?? '',
    pricing: raw.pricing ?? fallback?.pricing ?? 'free',
    publishedAt,
    published_at: publishedAt,
    auto_install: raw.auto_install ?? fallback?.auto_install ?? false,
    features: Array.isArray(raw.features) ? raw.features : (fallback?.features || []),
    keywords: Array.isArray(raw.keywords) ? raw.keywords : (fallback?.keywords || []),
    tags: Array.isArray(raw.tags) ? raw.tags : (fallback?.tags || []),
    capabilities: Array.isArray(raw.capabilities) ? raw.capabilities : (fallback?.capabilities || []),
    permissions: Array.isArray(raw.permissions) ? raw.permissions : (fallback?.permissions || []),
    compatibility: normalizeCompatibility(raw, fallback),
    delivery: normalizeDelivery(raw, fallback),
    screenshots: normalizeScreenshots(raw.screenshots, fallback?.screenshots),
    adminPages: normalizePages(raw.adminPages || raw.admin_pages, fallback?.adminPages, id),
    admin_pages: normalizePages(raw.adminPages || raw.admin_pages, fallback?.adminPages, id),
    actions: Array.isArray(raw.actions) ? raw.actions : (fallback?.actions || []),
    config: raw.config ?? fallback?.config ?? {},
    metadata: {
      ...(fallback?.metadata || {}),
      ...(raw.metadata || {}),
    },
  }
}

const mergeCatalog = (remotePlugins: Partial<PluginManifest>[]) => {
  const merged = new Map<string, PluginManifest>()

  builtinPluginCatalog.forEach((plugin) => {
    merged.set(plugin.id, normalizePlugin(plugin))
  })

  remotePlugins.forEach((plugin) => {
    const id = String(plugin.id || plugin.plugin_id || '').trim()
    if (!id) return
    merged.set(id, normalizePlugin(plugin, merged.get(id)))
  })

  return Array.from(merged.values()).sort((a, b) => {
    const featuredWeight = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    if (featuredWeight !== 0) return featuredWeight
    return a.name.localeCompare(b.name, 'zh-CN')
  })
}

export const usePluginStore = defineStore('plugins', () => {
  const catalog = ref<PluginManifest[]>(mergeCatalog([]))
  const loading = ref(false)
  const initialized = ref(false)
  const lastSyncedAt = ref('')

  const discoverPlugins = async () => {
    loading.value = true
    try {
      const responses: any[] = []

      try {
        responses.push(await api.getAdminPluginMarket())
      } catch (_marketError) {
        responses.push(await api.getAdminPluginCatalog())
      }

      const res = responses[0]
      if (res?.code === 200) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.plugins || [])
        catalog.value = mergeCatalog(Array.isArray(list) ? list : [])
        initialized.value = true
        lastSyncedAt.value = new Date().toISOString()
        return catalog.value
      }
      throw new Error(res.msg || '获取插件目录失败')
    } catch (error) {
      initialized.value = true
      catalog.value = mergeCatalog(catalog.value)
      throw error
    } finally {
      loading.value = false
    }
  }

  const ensureCatalog = async () => {
    if (initialized.value) return catalog.value
    try {
      return await discoverPlugins()
    } catch (_error) {
      return catalog.value
    }
  }

  const getPlugin = (pluginId: string) => catalog.value.find((item) => item.id === pluginId)

  const getPluginPage = (pluginId: string, pageKey?: string) => {
    const plugin = getPlugin(pluginId)
    if (!plugin) return undefined
    const pages = plugin.adminPages || []
    if (pageKey) {
      return pages.find((page) => page.key === pageKey)
    }
    return pages.find((page) => page.default) || pages[0]
  }

  const getPluginDefaultPath = (pluginId: string) => {
    const page = getPluginPage(pluginId)
    return page?.path || (page ? buildPluginPath(pluginId, page.key) : `/admin/plugins/${pluginId}`)
  }

  const installPlugin = async (pluginId: string) => {
    const res: any = await api.installAdminPlugin(pluginId)
    await discoverPlugins().catch(() => {})
    return res
  }

  const enablePlugin = async (pluginId: string) => {
    const res: any = await api.enableAdminPlugin(pluginId)
    await discoverPlugins().catch(() => {})
    return res
  }

  const disablePlugin = async (pluginId: string) => {
    const res: any = await api.disableAdminPlugin(pluginId)
    await discoverPlugins().catch(() => {})
    return res
  }

  const fetchPluginConfig = async (pluginId: string) => api.getAdminPluginConfig(pluginId)

  const updatePluginConfig = async (pluginId: string, payload: Record<string, any>) =>
    api.updateAdminPluginConfig(pluginId, payload)

  const callPluginAction = async (pluginId: string, action: string, payload: Record<string, any>) =>
    api.callAdminPluginAction(pluginId, action, payload)

  const pluginMenuItems = computed<PluginMenuItem[]>(() => {
    return catalog.value
      .filter((plugin) => plugin.enabled)
      .flatMap((plugin) =>
        (plugin.adminPages || [])
          .filter((page) => page.menu !== false && (page.render_mode || 'local') === 'local')
          .map((page) => ({
            path: page.path || buildPluginPath(plugin.id, page.key),
            label: page.label,
            icon: resolvePluginIcon(page.icon || plugin.icon),
            order: page.order || 1000,
            pluginId: plugin.id,
          })),
      )
      .sort((a, b) => a.order - b.order)
  })

  const installedPlugins = computed(() => catalog.value.filter((plugin) => plugin.installed))
  const enabledPluginIds = computed(() => new Set(catalog.value.filter((plugin) => plugin.enabled).map((plugin) => plugin.id)))

  const isPluginEnabled = (pluginId: string) => enabledPluginIds.value.has(pluginId)
  const isPluginInstalled = (pluginId: string) => Boolean(getPlugin(pluginId)?.installed)

  return {
    catalog,
    loading,
    initialized,
    lastSyncedAt,
    installedPlugins,
    pluginMenuItems,
    discoverPlugins,
    ensureCatalog,
    getPlugin,
    getPluginPage,
    getPluginDefaultPath,
    installPlugin,
    enablePlugin,
    disablePlugin,
    fetchPluginConfig,
    updatePluginConfig,
    callPluginAction,
    isPluginEnabled,
    isPluginInstalled,
  }
})
