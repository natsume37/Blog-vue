<template>
  <div class="space-y-6">
    <section class="rounded-[26px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.26em] text-sky-600">Plugin Page</div>
          <h2 class="mt-2 text-2xl font-semibold text-slate-900">
            {{ page?.label || plugin?.name || '插件页面' }}
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            {{ page?.description || plugin?.description || '当前插件未提供额外说明。' }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <el-tag v-if="plugin?.latest_version || plugin?.version" effect="plain">
            {{ plugin?.latest_version || plugin?.version }}
          </el-tag>
          <el-tag v-if="plugin?.verified" type="success" effect="plain">已验证</el-tag>
          <el-tag v-if="plugin?.builtin" effect="plain">内建</el-tag>
          <el-tag v-if="plugin?.installed" type="success" effect="plain">已安装</el-tag>
          <el-tag v-if="plugin?.enabled" type="warning" effect="plain">已启用</el-tag>
          <el-tag v-if="page?.render_mode === 'iframe'" type="info" effect="plain">Iframe</el-tag>
          <el-tag v-if="page?.render_mode === 'external'" type="info" effect="plain">外部页面</el-tag>
          <el-tag v-if="page?.render_mode === 'script'" type="info" effect="plain">JS Script</el-tag>
          <el-tag v-if="page?.layout" effect="plain">{{ layoutLabel }}</el-tag>
          <el-button
            v-if="externalEntryUrl"
            class="!rounded-full"
            type="primary"
            plain
            @click="openExternalEntry"
          >
            打开外部入口
          </el-button>
          <el-button class="!rounded-full" @click="router.push('/admin/plugins')">返回插件中心</el-button>
        </div>
      </div>
    </section>

    <section
      v-if="isIframePage && externalEntryUrl"
      class="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
    >
      <div class="flex items-center justify-between border-b border-slate-200/80 px-5 py-3">
        <div class="text-sm font-medium text-slate-700">远程插件页面</div>
        <el-button class="!rounded-full" size="small" @click="openExternalEntry">新窗口打开</el-button>
      </div>
      <iframe :src="externalEntryUrl" class="plugin-iframe" title="Plugin Remote Page" />
    </section>

    <section
      v-else-if="isScriptPage"
      class="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
      :class="scriptHostClass"
    >
      <div class="flex items-center justify-between border-b border-slate-200/80 px-5 py-3">
        <div>
          <div class="text-sm font-medium text-slate-700">远程脚本插件页面</div>
          <div class="text-xs text-slate-400">通过统一桥接接口访问本站插件配置和动作能力。</div>
        </div>
        <el-button
          v-if="scriptEntryUrl"
          class="!rounded-full"
          size="small"
          @click="openScriptEntry"
        >
          打开脚本地址
        </el-button>
      </div>
      <div v-if="scriptError" class="border-b border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
        {{ scriptError }}
      </div>
      <div
        ref="scriptMountRef"
        class="plugin-script-host"
        :class="pageLayout === 'fullscreen' ? 'plugin-script-host--fullscreen' : ''"
      />
    </section>

    <section
      v-else-if="isExternalPage && externalEntryUrl"
      class="rounded-[24px] border border-slate-200/80 bg-white/94 px-6 py-8 shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
    >
      <div class="mx-auto max-w-2xl text-center">
        <div class="text-lg font-semibold text-slate-900">该插件页面由外部站点提供</div>
        <p class="mt-3 text-sm leading-7 text-slate-500">
          当前市场条目没有本地 Vue 实现，插件中心将保留路由壳并把你跳转到提供方页面。
        </p>
        <div class="mt-5 flex flex-wrap items-center justify-center gap-3">
          <el-button type="primary" class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800" @click="openExternalEntry">
            立即打开
          </el-button>
          <el-button v-if="plugin?.docsUrl || plugin?.docs_url" class="!rounded-full" @click="openDocs">
            查看文档
          </el-button>
        </div>
      </div>
    </section>

    <component v-else-if="resolvedComponent" :is="resolvedComponent" />

    <section
      v-else
      class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500"
    >
      找不到这个插件页面的前端实现。请先确认插件 manifest 中的页面定义和本地组件注册表一致。
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../../../api/request'
import { apiConfig } from '../../../config'
import { resolvePluginPageLoader } from '../../../plugins/registry'
import { usePluginStore } from '../../../stores/plugins'

const route = useRoute()
const router = useRouter()
const pluginStore = usePluginStore()
const resolvedComponent = shallowRef<any>(null)
const scriptMountRef = ref<HTMLElement | null>(null)
const scriptError = ref('')
const scriptCleanupRef = shallowRef<null | (() => void | Promise<void>)>(null)
let scriptLoadToken = 0

const pluginId = computed(() => String(route.params.pluginKey || '').trim())
const pageKey = computed(() => {
  const raw = route.params.pageKey
  return typeof raw === 'string' ? raw : undefined
})

const plugin = computed(() => pluginStore.getPlugin(pluginId.value))
const page = computed(() => pluginStore.getPluginPage(pluginId.value, pageKey.value))
const externalEntryUrl = computed(() => page.value?.entry_url || plugin.value?.delivery?.entry_url || '')
const scriptEntryUrl = computed(() => page.value?.script_url || page.value?.entry_url || plugin.value?.delivery?.entry_url || '')
const isIframePage = computed(() => (page.value?.render_mode || plugin.value?.delivery?.entry_mode) === 'iframe')
const isExternalPage = computed(() => (page.value?.render_mode || plugin.value?.delivery?.entry_mode) === 'external')
const isScriptPage = computed(() => (page.value?.render_mode || plugin.value?.delivery?.entry_mode) === 'script')
const pageLayout = computed(() => page.value?.layout || 'panel')
const scriptHostClass = computed(() => ({
  'plugin-host--workspace': pageLayout.value === 'workspace',
  'plugin-host--fullscreen': pageLayout.value === 'fullscreen',
}))
const layoutLabel = computed(() => {
  if (pageLayout.value === 'workspace') return 'Workspace'
  if (pageLayout.value === 'fullscreen') return 'Fullscreen'
  return 'Panel'
})

watch(
  pluginId,
  (nextPluginId) => {
    if (nextPluginId !== 'ai-image-studio') return
    router.replace('/admin/plugins/ai-assistant/images')
  },
  { immediate: true },
)

const openExternalEntry = () => {
  if (!externalEntryUrl.value) return
  window.open(externalEntryUrl.value, '_blank', 'noopener,noreferrer')
}

const openScriptEntry = () => {
  if (!scriptEntryUrl.value) return
  window.open(scriptEntryUrl.value, '_blank', 'noopener,noreferrer')
}

const openDocs = () => {
  const url = plugin.value?.docsUrl || plugin.value?.docs_url
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const cleanupScriptPage = async () => {
  if (!scriptCleanupRef.value) return
  const cleanup = scriptCleanupRef.value
  scriptCleanupRef.value = null
  await cleanup()
}

const createScriptBridge = () => ({
  plugin: plugin.value,
  page: page.value,
  apiBaseUrl: apiConfig.baseURL,
  siteOrigin: window.location.origin,
  request: async (input: string | Record<string, any>, init: Record<string, any> = {}) => {
    if (typeof input === 'string') {
      return request({
        url: input,
        method: String(init.method || 'get').toLowerCase(),
        data: init.data ?? init.body,
        params: init.params,
        headers: init.headers,
        timeout: init.timeout,
      })
    }
    return request(input as any)
  },
  getSettings: async () => {
    const res: any = await pluginStore.fetchPluginConfig(pluginId.value)
    return res.data?.values || res.data || {}
  },
  saveSettings: async (values: Record<string, any>) => {
    const res: any = await pluginStore.updatePluginConfig(pluginId.value, values)
    return res.data?.values || res.data || {}
  },
  callAction: async (action: string, payload: Record<string, any> = {}) => {
    const res: any = await pluginStore.callPluginAction(pluginId.value, action, payload)
    return res.data?.result || res.data || res
  },
  navigate: (path: string) => router.push(path),
  open: (url: string) => window.open(url, '_blank', 'noopener,noreferrer'),
  message: {
    success: (message: string) => ElMessage.success(message),
    error: (message: string) => ElMessage.error(message),
    warning: (message: string) => ElMessage.warning(message),
    info: (message: string) => ElMessage.info(message),
  },
})

const mountScriptPage = async () => {
  if (!isScriptPage.value) {
    scriptError.value = ''
    await cleanupScriptPage()
    return
  }

  const url = scriptEntryUrl.value
  if (!url) {
    scriptError.value = '脚本插件页面缺少 script_url 或 entry_url。'
    await cleanupScriptPage()
    return
  }

  scriptLoadToken += 1
  const loadToken = scriptLoadToken
  scriptError.value = ''
  await cleanupScriptPage()
  await nextTick()
  if (!scriptMountRef.value) return

  try {
    const module: any = await import(/* @vite-ignore */ url)
    if (loadToken !== scriptLoadToken) return
    const mount =
      (typeof module?.mount === 'function' && module.mount) ||
      (typeof module?.default === 'function' && module.default) ||
      (typeof module?.default?.mount === 'function' && module.default.mount)
    if (typeof mount !== 'function') {
      throw new Error('脚本插件没有导出可调用的 mount(container, context) 方法')
    }

    const result = await mount(scriptMountRef.value, createScriptBridge())
    if (typeof result === 'function') {
      scriptCleanupRef.value = result
      return
    }
    if (typeof result?.unmount === 'function') {
      scriptCleanupRef.value = result.unmount
      return
    }
    const moduleUnmount =
      (typeof module?.unmount === 'function' && module.unmount) ||
      (typeof module?.default?.unmount === 'function' && module.default.unmount)
    if (typeof moduleUnmount === 'function') {
      scriptCleanupRef.value = () => moduleUnmount(scriptMountRef.value, createScriptBridge())
    }
  } catch (error: any) {
    scriptError.value = error?.message || '脚本插件加载失败'
  }
}

watch(
  page,
  async (nextPage) => {
    const mode = nextPage?.render_mode || 'local'
    if (mode !== 'local') {
      resolvedComponent.value = null
    } else {
      const loader = resolvePluginPageLoader(nextPage?.component)
      resolvedComponent.value = loader ? defineAsyncComponent(loader) : null
    }
    await mountScriptPage()
  },
  { immediate: true },
)

onMounted(() => {
  pluginStore.ensureCatalog().catch(() => {})
})

onBeforeUnmount(() => {
  cleanupScriptPage().catch(() => {})
})
</script>

<style scoped>
.plugin-iframe {
  display: block;
  min-height: 72vh;
  width: 100%;
  border: 0;
  background: #f8fafc;
}

.plugin-script-host {
  min-height: 40rem;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(255, 255, 255, 0.98));
}

.plugin-script-host--fullscreen {
  min-height: 72vh;
}

.plugin-host--workspace .plugin-script-host {
  min-height: 52rem;
}

.plugin-host--fullscreen .plugin-script-host {
  min-height: 78vh;
}
</style>
