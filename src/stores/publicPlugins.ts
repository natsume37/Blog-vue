import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getPublicPlugins } from '../api'

export const NEWSNOW_PLUGIN_ID = 'newsnow-realtime'

export const usePublicPluginStore = defineStore('publicPlugins', () => {
  const enabledPluginIds = ref<string[]>([])
  const initialized = ref(false)
  const loading = ref(false)

  const fetchPublicPlugins = async () => {
    loading.value = true
    try {
      const res: any = await getPublicPlugins()
      if (res?.code === 200) {
        enabledPluginIds.value = Array.isArray(res.data) ? res.data.map((item: any) => String(item).trim()).filter(Boolean) : []
        initialized.value = true
        return enabledPluginIds.value
      }
      throw new Error(res?.msg || '获取公共插件状态失败')
    } catch (error) {
      initialized.value = true
      enabledPluginIds.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  const ensureLoaded = async () => {
    if (initialized.value) return enabledPluginIds.value
    try {
      return await fetchPublicPlugins()
    } catch (_error) {
      return enabledPluginIds.value
    }
  }

  const enabledPluginIdSet = computed(() => new Set(enabledPluginIds.value))
  const hasPlugin = (pluginId: string) => enabledPluginIdSet.value.has(pluginId)

  return {
    enabledPluginIds,
    initialized,
    loading,
    fetchPublicPlugins,
    ensureLoaded,
    hasPlugin,
  }
})
