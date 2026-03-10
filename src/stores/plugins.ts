import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as api from '../api'
import { builtinPluginCatalog, resolvePluginIcon } from '../plugins/registry'
import type { PluginAdminPage, PluginManifest } from '../types/plugins'

type PluginMenuItem = {
  path: string
  label: string
  icon: any
  order: number
  pluginId: string
}

const normalizePages = (
  pages: PluginAdminPage[] | undefined,
  fallback: PluginAdminPage[] | undefined,
  pluginId: string,
) => {
  const target = Array.isArray(pages) && pages.length ? pages : (fallback || [])
  return target.map((page, index) => {
    const path = String(page.path || '').trim()
    const key = String(
      page.key ||
      (path ? path.split('/').filter(Boolean).pop() : '') ||
      (index === 0 ? 'settings' : `page-${index + 1}`)
    ).trim()

    return {
      key,
      label: String(page.label || page.menu_label || page.title || key),
      description: page.description || page.title || '',
      component: String(page.component || page.component_key || ''),
      icon: page.icon,
      menu: page.menu ?? true,
      order: page.order ?? (index + 1) * 10,
      default: page.default ?? index === 0,
      path: path || `/admin/plugins/${pluginId}/${key}`,
    }
  })
}

const normalizePlugin = (
  source: Partial<PluginManifest>,
  fallback?: PluginManifest,
): PluginManifest => {
  const id = String(source.id || source.plugin_id || fallback?.id || '').trim()

  return {
    id,
    name: String(source.name || fallback?.name || id),
    version: String(source.version || fallback?.version || '0.0.0'),
    description: source.description ?? fallback?.description ?? '',
    author: source.author ?? fallback?.author ?? '',
    icon: source.icon || fallback?.icon || 'Grid',
    builtin: Boolean(source.builtin ?? fallback?.builtin),
    installed: Boolean(source.installed ?? fallback?.installed),
    enabled: Boolean(source.enabled ?? fallback?.enabled),
    status: String(source.status || fallback?.status || ''),
    category: String(source.category || fallback?.category || ''),
    homepage: source.homepage ?? fallback?.homepage ?? '',
    docsUrl: source.docsUrl ?? fallback?.docsUrl ?? '',
    features: Array.isArray(source.features) ? source.features : (fallback?.features || []),
    source: source.source ?? fallback?.source ?? '',
    auto_install: source.auto_install ?? fallback?.auto_install ?? false,
    adminPages: normalizePages(source.adminPages || source.admin_pages, fallback?.adminPages, id),
    config: source.config ?? fallback?.config ?? {},
    metadata: {
      ...(fallback?.metadata || {}),
      ...(source.metadata || {}),
    },
  }
}

const mergeCatalog = (remotePlugins: Partial<PluginManifest>[]) => {
  const merged = new Map<string, PluginManifest>()

  builtinPluginCatalog.forEach((plugin) => {
    merged.set(plugin.id, normalizePlugin(plugin))
  })

  remotePlugins.forEach((plugin) => {
    const id = String(plugin.id || '').trim()
    if (!id) return
    merged.set(id, normalizePlugin(plugin, merged.get(id)))
  })

  return Array.from(merged.values()).sort((a, b) => {
    const left = a.name.toLowerCase()
    const right = b.name.toLowerCase()
    return left.localeCompare(right, 'zh-CN')
  })
}

const buildPluginPath = (pluginId: string, pageKey?: string) => {
  const suffix = pageKey ? `/${pageKey}` : ''
  return `/admin/plugins/${pluginId}${suffix}`
}

export const usePluginStore = defineStore('plugins', () => {
  const catalog = ref<PluginManifest[]>(mergeCatalog([]))
  const loading = ref(false)
  const initialized = ref(false)
  const lastSyncedAt = ref('')

  const discoverPlugins = async () => {
    loading.value = true
    try {
      const res: any = await api.getAdminPluginCatalog()
      if (res.code === 200) {
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

  const getPlugin = (pluginId: string) => {
    return catalog.value.find((item) => item.id === pluginId)
  }

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

  const fetchPluginConfig = async (pluginId: string) => {
    return api.getAdminPluginConfig(pluginId)
  }

  const updatePluginConfig = async (pluginId: string, payload: Record<string, any>) => {
    return api.updateAdminPluginConfig(pluginId, payload)
  }

  const callPluginAction = async (pluginId: string, action: string, payload: Record<string, any>) => {
    return api.callAdminPluginAction(pluginId, action, payload)
  }

  const pluginMenuItems = computed<PluginMenuItem[]>(() => {
    return catalog.value
      .filter((plugin) => plugin.enabled)
      .flatMap((plugin) =>
        (plugin.adminPages || [])
          .filter((page) => page.menu !== false)
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
