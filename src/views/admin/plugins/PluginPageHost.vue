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
import { computed, defineAsyncComponent, onMounted, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resolvePluginPageLoader } from '../../../plugins/registry'
import { usePluginStore } from '../../../stores/plugins'

const route = useRoute()
const router = useRouter()
const pluginStore = usePluginStore()
const resolvedComponent = shallowRef<any>(null)

const pluginId = computed(() => String(route.params.pluginKey || '').trim())
const pageKey = computed(() => {
  const raw = route.params.pageKey
  return typeof raw === 'string' ? raw : undefined
})

const plugin = computed(() => pluginStore.getPlugin(pluginId.value))
const page = computed(() => pluginStore.getPluginPage(pluginId.value, pageKey.value))
const externalEntryUrl = computed(() => page.value?.entry_url || plugin.value?.delivery?.entry_url || '')
const isIframePage = computed(() => (page.value?.render_mode || plugin.value?.delivery?.entry_mode) === 'iframe')
const isExternalPage = computed(() => (page.value?.render_mode || plugin.value?.delivery?.entry_mode) === 'external')

const openExternalEntry = () => {
  if (!externalEntryUrl.value) return
  window.open(externalEntryUrl.value, '_blank', 'noopener,noreferrer')
}

const openDocs = () => {
  const url = plugin.value?.docsUrl || plugin.value?.docs_url
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

watch(
  page,
  (nextPage) => {
    if ((nextPage?.render_mode || 'local') !== 'local') {
      resolvedComponent.value = null
      return
    }
    const loader = resolvePluginPageLoader(nextPage?.component)
    resolvedComponent.value = loader ? defineAsyncComponent(loader) : null
  },
  { immediate: true },
)

onMounted(() => {
  pluginStore.ensureCatalog().catch(() => {})
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
</style>
