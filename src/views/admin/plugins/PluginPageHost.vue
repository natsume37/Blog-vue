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
          <el-tag v-if="plugin?.builtin" effect="plain">内建</el-tag>
          <el-tag v-if="plugin?.installed" type="success" effect="plain">已安装</el-tag>
          <el-tag v-if="plugin?.enabled" type="warning" effect="plain">已启用</el-tag>
          <el-button class="!rounded-full" @click="router.push('/admin/plugins')">返回插件中心</el-button>
        </div>
      </div>
    </section>

    <component v-if="resolvedComponent" :is="resolvedComponent" />

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

watch(
  page,
  (nextPage) => {
    const loader = resolvePluginPageLoader(nextPage?.component)
    resolvedComponent.value = loader ? defineAsyncComponent(loader) : null
  },
  { immediate: true },
)

onMounted(() => {
  pluginStore.ensureCatalog().catch(() => {})
})
</script>
