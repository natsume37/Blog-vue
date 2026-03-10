<template>
  <div class="plugin-center space-y-6">
    <section class="plugin-hero rounded-[28px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-7">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Plugin Market</div>
          <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">插件中心</h2>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            从 GitHub 市场目录发现插件，查看版本、来源、权限和交付方式，再决定安装、启用或跳转到远程入口。
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            {{ installedCount }} 已安装 / {{ enabledCount }} 已启用
          </div>
          <el-button
            :loading="pluginStore.loading"
            class="!rounded-full !border-slate-200 !px-5 hover:!border-sky-200 hover:!text-sky-700"
            @click="handleDiscover"
          >
            同步市场
          </el-button>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-4">
        <article class="overview-card">
          <div class="overview-card__label">市场条目</div>
          <div class="overview-card__value">{{ marketCount }}</div>
          <p class="overview-card__hint">远程市场 manifest 与本地内建插件会统一展示。</p>
        </article>
        <article class="overview-card">
          <div class="overview-card__label">已安装</div>
          <div class="overview-card__value">{{ installedCount }}</div>
          <p class="overview-card__hint">这些插件已写入站点生命周期，部分支持启停切换。</p>
        </article>
        <article class="overview-card">
          <div class="overview-card__label">远程交付</div>
          <div class="overview-card__value">{{ remoteEntryCount }}</div>
          <p class="overview-card__hint">这类插件页面不在主站内打包，通常通过 iframe 或外链承载。</p>
        </article>
        <article class="overview-card">
          <div class="overview-card__label">最近同步</div>
          <div class="overview-card__value text-lg">{{ lastSyncedLabel }}</div>
          <p class="overview-card__hint">失败时会自动回退到本地 catalog，避免后台入口消失。</p>
        </article>
      </div>
    </section>

    <section class="flex flex-wrap gap-3">
      <button
        v-for="filter in filters"
        :key="filter.key"
        type="button"
        class="market-filter"
        :class="{ 'market-filter--active': activeFilter === filter.key }"
        @click="activeFilter = filter.key"
      >
        <span>{{ filter.label }}</span>
        <span class="market-filter__count">{{ filter.count }}</span>
      </button>
    </section>

    <section v-if="filteredPlugins.length" class="space-y-4">
      <article
        v-for="plugin in filteredPlugins"
        :key="plugin.id"
        class="plugin-card rounded-[24px] border border-slate-200/80 bg-white/94 p-6 shadow-[0_14px_36px_rgba(15,23,42,0.05)]"
      >
        <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-start gap-4">
              <div class="plugin-card__icon">
                <el-icon><component :is="resolvePluginIcon(plugin.icon)" /></el-icon>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-xl font-semibold text-slate-900">{{ plugin.name }}</h3>
                  <el-tag size="small" effect="plain">v{{ plugin.latest_version || plugin.version }}</el-tag>
                  <el-tag
                    size="small"
                    effect="plain"
                    :type="statusTagType(plugin.status)"
                  >
                    {{ statusLabel(plugin.status) }}
                  </el-tag>
                  <el-tag v-if="plugin.official" size="small" type="info" effect="plain">官方</el-tag>
                  <el-tag v-if="plugin.verified" size="small" type="success" effect="plain">已验证</el-tag>
                  <el-tag v-if="plugin.builtin" size="small" effect="plain">内建</el-tag>
                  <el-tag v-if="plugin.marketplace" size="small" effect="plain">市场</el-tag>
                  <el-tag v-if="plugin.upgrade_available" size="small" type="danger" effect="plain">可更新</el-tag>
                </div>

                <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                  {{ plugin.summary || plugin.description || '暂无描述。' }}
                </p>

                <div class="plugin-meta mt-4 grid gap-3 lg:grid-cols-3">
                  <div class="plugin-meta__item">
                    <div class="plugin-meta__label">发布者</div>
                    <div class="plugin-meta__value">
                      {{ plugin.publisher?.name || plugin.author || '未知' }}
                    </div>
                    <div class="plugin-meta__sub">{{ plugin.source_repo || plugin.source || '未声明来源' }}</div>
                  </div>
                  <div class="plugin-meta__item">
                    <div class="plugin-meta__label">兼容性</div>
                    <div class="plugin-meta__value">
                      B: {{ plugin.compatibility?.backend || '未声明' }}
                    </div>
                    <div class="plugin-meta__sub">
                      F: {{ plugin.compatibility?.frontend || '未声明' }}
                    </div>
                  </div>
                  <div class="plugin-meta__item">
                    <div class="plugin-meta__label">交付方式</div>
                    <div class="plugin-meta__value">
                      {{ deliveryLabel(plugin) }}
                    </div>
                    <div class="plugin-meta__sub">
                      {{ installStrategyLabel(plugin) }}
                    </div>
                  </div>
                </div>

                <div v-if="plugin.installed_version || plugin.license || plugin.publishedAt || plugin.published_at" class="mt-4 flex flex-wrap gap-2">
                  <span v-if="plugin.installed_version" class="meta-pill">已装 {{ plugin.installed_version }}</span>
                  <span v-if="plugin.license" class="meta-pill">{{ plugin.license }}</span>
                  <span v-if="plugin.pricing" class="meta-pill">{{ plugin.pricing }}</span>
                  <span v-if="plugin.publishedAt || plugin.published_at" class="meta-pill">
                    发布于 {{ formatDate(plugin.publishedAt || plugin.published_at) }}
                  </span>
                </div>

                <div v-if="plugin.features?.length" class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="feature in plugin.features"
                    :key="feature"
                    class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500"
                  >
                    {{ feature }}
                  </span>
                </div>

                <div v-if="plugin.permissions?.length" class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="permission in plugin.permissions"
                    :key="permission"
                    class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700"
                  >
                    {{ permission }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 xl:max-w-[16rem] xl:justify-end">
            <el-button
              v-if="plugin.installed && plugin.adminPages?.length"
              class="!rounded-full"
              @click="openPluginPage(plugin.id)"
            >
              打开插件页
            </el-button>
            <el-button
              v-if="plugin.docsUrl || plugin.docs_url"
              class="!rounded-full"
              @click="openLink(plugin.docsUrl || plugin.docs_url)"
            >
              文档
            </el-button>
            <el-button
              v-if="plugin.repoUrl || plugin.repo_url"
              class="!rounded-full"
              @click="openLink(plugin.repoUrl || plugin.repo_url)"
            >
              仓库
            </el-button>

            <el-button
              v-if="!plugin.installed && plugin.installable"
              type="primary"
              class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800"
              @click="handleInstall(plugin.id)"
            >
              安装插件
            </el-button>

            <el-button
              v-else-if="plugin.installed && plugin.activatable && plugin.enabled"
              class="!rounded-full !border-amber-200 !bg-amber-50 !text-amber-700 hover:!border-amber-300 hover:!bg-amber-100"
              @click="handleDisable(plugin.id)"
            >
              停用
            </el-button>

            <el-button
              v-else-if="plugin.installed && plugin.activatable"
              type="primary"
              class="!rounded-full !border-sky-200 !bg-sky-50 !text-sky-700 hover:!border-sky-300 hover:!bg-sky-100"
              @click="handleEnable(plugin.id)"
            >
              启用
            </el-button>

            <el-button
              v-else-if="plugin.delivery?.entry_url"
              class="!rounded-full"
              type="primary"
              plain
              @click="openLink(plugin.delivery.entry_url)"
            >
              打开入口
            </el-button>
          </div>
        </div>
      </article>
    </section>

    <section
      v-else
      class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500"
    >
      当前筛选条件下没有插件条目。
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { resolvePluginIcon } from '../../../plugins/registry'
import { usePluginStore } from '../../../stores/plugins'
import type { PluginManifest } from '../../../types/plugins'

const router = useRouter()
const pluginStore = usePluginStore()
const activeFilter = ref<'all' | 'installed' | 'market' | 'remote'>('all')

const installedCount = computed(() => pluginStore.catalog.filter((plugin) => plugin.installed).length)
const enabledCount = computed(() => pluginStore.catalog.filter((plugin) => plugin.enabled).length)
const marketCount = computed(() => pluginStore.catalog.filter((plugin) => plugin.marketplace || plugin.builtin).length)
const remoteEntryCount = computed(() =>
  pluginStore.catalog.filter((plugin) => (plugin.delivery?.entry_mode || 'local') !== 'local').length,
)
const lastSyncedLabel = computed(() => {
  if (!pluginStore.lastSyncedAt) return '尚未同步'
  return new Date(pluginStore.lastSyncedAt).toLocaleString('zh-CN')
})

const filters = computed(() => [
  { key: 'all' as const, label: '全部', count: pluginStore.catalog.length },
  { key: 'installed' as const, label: '已安装', count: installedCount.value },
  { key: 'market' as const, label: '市场条目', count: marketCount.value },
  { key: 'remote' as const, label: '远程交付', count: remoteEntryCount.value },
])

const filteredPlugins = computed(() => {
  switch (activeFilter.value) {
    case 'installed':
      return pluginStore.catalog.filter((plugin) => plugin.installed)
    case 'market':
      return pluginStore.catalog.filter((plugin) => plugin.marketplace || plugin.builtin)
    case 'remote':
      return pluginStore.catalog.filter((plugin) => (plugin.delivery?.entry_mode || 'local') !== 'local')
    default:
      return pluginStore.catalog
  }
})

const statusTagType = (status?: string) => {
  switch (status) {
    case 'enabled':
      return 'warning'
    case 'installed':
      return 'success'
    case 'update-available':
      return 'danger'
    case 'incompatible':
      return 'danger'
    default:
      return 'info'
  }
}

const statusLabel = (status?: string) => {
  switch (status) {
    case 'enabled':
      return '已启用'
    case 'installed':
      return '已安装'
    case 'update-available':
      return '可更新'
    case 'incompatible':
      return '不兼容'
    default:
      return '可发现'
  }
}

const deliveryLabel = (plugin: PluginManifest) => {
  const mode = plugin.delivery?.entry_mode || 'local'
  if (mode === 'iframe') return 'Iframe 嵌入'
  if (mode === 'external') return '外部页面'
  return plugin.builtin ? '本地页面' : '市场清单'
}

const installStrategyLabel = (plugin: PluginManifest) => {
  const strategy = plugin.delivery?.install_strategy || 'manual'
  switch (strategy) {
    case 'builtin-toggle':
      return '站内安装并启停'
    case 'manual':
      return '查看文档后手动接入'
    default:
      return strategy
  }
}

const formatDate = (value?: string) => {
  if (!value) return '未知时间'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('zh-CN')
}

const openLink = (url?: string) => {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const handleDiscover = async () => {
  try {
    await pluginStore.discoverPlugins()
    ElMessage.success('插件市场已同步')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '同步插件市场失败')
  }
}

const handleInstall = async (pluginId: string) => {
  try {
    const res: any = await pluginStore.installPlugin(pluginId)
    if (res.code === 200) {
      ElMessage.success(res.msg || '插件安装成功')
      return
    }
    ElMessage.error(res.msg || '插件安装失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '插件安装失败')
  }
}

const handleEnable = async (pluginId: string) => {
  try {
    const res: any = await pluginStore.enablePlugin(pluginId)
    if (res.code === 200) {
      ElMessage.success(res.msg || '插件已启用')
      return
    }
    ElMessage.error(res.msg || '插件启用失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '插件启用失败')
  }
}

const handleDisable = async (pluginId: string) => {
  try {
    const res: any = await pluginStore.disablePlugin(pluginId)
    if (res.code === 200) {
      ElMessage.success(res.msg || '插件已停用')
      return
    }
    ElMessage.error(res.msg || '插件停用失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '插件停用失败')
  }
}

const openPluginPage = (pluginId: string) => {
  router.push(pluginStore.getPluginDefaultPath(pluginId))
}

onMounted(() => {
  pluginStore.ensureCatalog().catch(() => {})
})
</script>

<style scoped>
.plugin-center {
  --plugin-border: rgba(226, 232, 240, 0.9);
}

.plugin-hero {
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 30%),
    radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.06), transparent 32%),
    rgba(255, 255, 255, 0.94);
}

.overview-card {
  border-radius: 22px;
  border: 1px solid var(--plugin-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  padding: 1rem 1.1rem;
}

.overview-card__label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #94a3b8;
}

.overview-card__value {
  margin-top: 0.85rem;
  font-size: 1.9rem;
  font-weight: 700;
  color: #0f172a;
}

.overview-card__hint {
  margin-top: 0.55rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #64748b;
}

.market-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(203, 213, 225, 0.9);
  background: rgba(248, 250, 252, 0.9);
  padding: 0.7rem 1rem;
  font-size: 0.92rem;
  color: #475569;
  transition: all 0.2s ease;
}

.market-filter--active {
  border-color: rgba(14, 165, 233, 0.32);
  background: rgba(224, 242, 254, 0.85);
  color: #0c4a6e;
}

.market-filter__count {
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  padding: 0.18rem 0.55rem;
  font-size: 0.8rem;
}

.plugin-card__icon {
  display: inline-flex;
  height: 52px;
  width: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: #eff6ff;
  color: #0369a1;
  font-size: 1.3rem;
}

.plugin-meta__item {
  border-radius: 18px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  background: rgba(248, 250, 252, 0.72);
  padding: 0.85rem 1rem;
}

.plugin-meta__label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #94a3b8;
}

.plugin-meta__value {
  margin-top: 0.45rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
}

.plugin-meta__sub {
  margin-top: 0.25rem;
  font-size: 0.82rem;
  color: #64748b;
  word-break: break-word;
}

.meta-pill {
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.9);
  padding: 0.4rem 0.8rem;
  font-size: 0.78rem;
  color: #475569;
}
</style>
