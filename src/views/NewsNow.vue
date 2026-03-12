<template>
  <div class="news-hub pb-20">
    <section class="news-hero relative mb-8 overflow-hidden">
      <div class="absolute inset-0 bg-gray-900">
        <img
          :src="siteStore.siteConfig.heroBgImage"
          alt="News Hero"
          fetchpriority="high"
          decoding="async"
          class="h-full w-full object-cover opacity-80 transition-transform duration-[2000ms]"
        />
      </div>
      <div class="news-hero__veil absolute inset-0"></div>
      <div class="news-hero__glow news-hero__glow--a"></div>
      <div class="news-hero__glow news-hero__glow--b"></div>
      <div class="relative mx-auto flex min-h-[360px] w-full max-w-[90rem] flex-col justify-end px-5 pb-10 pt-28 sm:px-6 lg:px-8 xl:px-10">
        <div class="max-w-4xl">
          <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-md">
            News Digest
          </div>
          <h1 class="mt-5 text-4xl font-bold tracking-[0.08em] text-white drop-shadow-2xl md:text-6xl font-serif">
            新闻也留在博客里读
          </h1>
          <p class="mt-5 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
            我们只接入实时新闻数据，不再把另一套页面生硬塞进来。栏目结构、配色、卡片和留白都沿用博客自己的语言，只把信息流内化成站内内容。
          </p>
          <div class="mt-6 flex flex-wrap gap-3 text-sm text-white/90">
            <div class="news-stat-pill">{{ groups.length }} 个来源</div>
            <div class="news-stat-pill">{{ totalHeadlines }} 条快讯</div>
            <div class="news-stat-pill">最近更新 {{ latestUpdateLabel }}</div>
          </div>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-[90rem] px-5 sm:px-6 lg:px-8 xl:px-10">
      <div class="flex flex-col gap-8 lg:flex-row">
        <aside class="w-full space-y-6 lg:w-[290px] lg:flex-shrink-0">
          <ProfileCard :stats="siteStats" />

          <UiCard class="panel-card relative overflow-hidden">
            <div class="mb-3 flex gap-1.5">
              <div class="h-3 w-3 rounded-full bg-red-400"></div>
              <div class="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div class="h-3 w-3 rounded-full bg-green-400"></div>
            </div>
            <h3 class="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <el-icon><Search /></el-icon>
              搜索新闻
            </h3>
            <div class="relative">
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="按标题筛选..."
                class="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-4 pr-10 text-sm transition-all focus:border-miyazaki-blue focus:bg-white focus:outline-none"
              />
              <div class="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-gray-400">
                <el-icon><Search /></el-icon>
              </div>
            </div>
          </UiCard>

          <UiCard class="panel-card relative overflow-hidden">
            <div class="mb-3 flex gap-1.5">
              <div class="h-3 w-3 rounded-full bg-red-400"></div>
              <div class="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div class="h-3 w-3 rounded-full bg-green-400"></div>
            </div>
            <h3 class="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <el-icon><CollectionTag /></el-icon>
              来源筛选
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                class="source-pill"
                :class="{ 'source-pill--active': selectedSourceId === 'all' }"
                @click="selectedSourceId = 'all'"
              >
                全部
              </button>
              <button
                v-for="group in groups"
                :key="group.sourceId"
                class="source-pill"
                :class="{ 'source-pill--active': selectedSourceId === group.sourceId }"
                @click="selectedSourceId = group.sourceId"
              >
                {{ group.sourceName }}
              </button>
            </div>
          </UiCard>

          <UiCard class="panel-card relative overflow-hidden">
            <div class="mb-3 flex gap-1.5">
              <div class="h-3 w-3 rounded-full bg-red-400"></div>
              <div class="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div class="h-3 w-3 rounded-full bg-green-400"></div>
            </div>
            <h3 class="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
              <el-icon><Reading /></el-icon>
              栏目说明
            </h3>
            <div class="space-y-3 text-sm leading-7 text-gray-500">
              <p>新闻栏目只保留信息，不引入外站页面壳，所以和博客主题会保持同一套视觉。</p>
              <p>点击标题会在新窗口打开原文，站内负责分栏、筛选和阅读入口。</p>
              <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
                数据源：NewsNow 实时聚合，页面由当前博客重新编排。
              </div>
            </div>
          </UiCard>
        </aside>

        <main class="min-w-0 flex-grow space-y-8">
          <section
            v-if="!pluginEnabled"
            class="rounded-[28px] border border-dashed border-slate-300 bg-white/90 px-6 py-10 text-center shadow-sm"
          >
            <div class="mx-auto max-w-2xl">
              <div class="text-lg font-semibold text-slate-900">新闻插件当前未启用</div>
              <p class="mt-3 text-sm leading-7 text-slate-500">
                请先在后台插件中心启用“NewsNow 实时新闻”，启用后首页导航会自动出现“博客 / 新闻”子菜单。
              </p>
              <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
                <el-button class="!rounded-full" @click="router.push('/')">回到博客首页</el-button>
                <el-button
                  v-if="userStore.isAdmin"
                  type="primary"
                  class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800"
                  @click="router.push('/admin/plugins')"
                >
                  打开插件中心
                </el-button>
              </div>
            </div>
          </section>

          <template v-else>
            <section v-if="loading" class="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div v-for="index in 6" :key="index" class="h-40 rounded-[24px] bg-white shadow-sm animate-pulse"></div>
            </section>

            <section
              v-else-if="errorMessage"
              class="rounded-[28px] border border-rose-200 bg-white px-6 py-8 shadow-sm"
            >
              <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div class="text-lg font-semibold text-slate-900">新闻流暂时不可用</div>
                  <p class="mt-2 text-sm leading-7 text-slate-500">{{ errorMessage }}</p>
                </div>
                <div class="flex flex-wrap gap-3">
                  <el-button class="!rounded-full" @click="loadNews()">重试</el-button>
                  <el-button
                    type="primary"
                    class="!rounded-full !border-none !bg-slate-900 hover:!bg-slate-800"
                    @click="openSourceFeed"
                  >
                    打开源站
                  </el-button>
                </div>
              </div>
            </section>

            <template v-else>
              <section class="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <article
                  v-for="headline in headlineBoard"
                  :key="headline.id"
                  class="headline-card group"
                  :data-tone="headline.sourceId"
                >
                  <div class="headline-card__inner">
                    <div class="flex items-center justify-between gap-3">
                      <div class="headline-badge">
                        {{ headline.sourceName }}
                      </div>
                      <div class="text-xs text-slate-400">
                        {{ formatRelativeTime(headline.publishedAt) }}
                      </div>
                    </div>
                    <h2 class="mt-5 text-xl font-semibold leading-8 text-slate-900 transition-colors duration-300 group-hover:text-miyazaki-blue">
                      {{ headline.title }}
                    </h2>
                    <p class="mt-3 text-sm leading-7 text-slate-500">
                      {{ headline.description }}
                    </p>
                    <div class="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                      <div class="text-xs uppercase tracking-[0.28em] text-slate-400">
                        {{ formatAbsoluteTime(headline.publishedAt) }}
                      </div>
                      <a
                        :href="headline.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="headline-link"
                      >
                        阅读原文
                        <el-icon><Right /></el-icon>
                      </a>
                    </div>
                  </div>
                </article>
              </section>

              <section
                v-for="group in filteredGroups"
                :key="group.sourceId"
                class="overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-sm"
                :data-tone="group.sourceId"
              >
                <div class="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div class="headline-badge">
                        {{ group.sourceName }}
                      </div>
                      <h3 class="mt-3 text-2xl font-semibold text-slate-900">{{ group.sourceName }}</h3>
                      <p class="mt-2 text-sm leading-7 text-slate-500">{{ group.description }}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span>{{ group.items.length }} 条快讯</span>
                      <a
                        :href="group.sourceUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="source-link"
                      >
                        打开来源站
                        <el-icon><TopRight /></el-icon>
                      </a>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 sm:p-6">
                  <a
                    v-for="item in group.items"
                    :key="`${group.sourceId}-${item.id}`"
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="news-brief group"
                    :data-tone="group.sourceId"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div class="text-sm font-semibold text-slate-500">{{ group.sourceName }}</div>
                      <div class="text-xs text-slate-400">{{ formatRelativeTime(item.publishedAt) }}</div>
                    </div>
                    <h4 class="mt-3 text-[17px] font-semibold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-miyazaki-blue">
                      {{ item.title }}
                    </h4>
                    <div class="mt-5 flex items-center justify-between gap-4 text-xs uppercase tracking-[0.24em] text-slate-400">
                      <span>{{ formatAbsoluteTime(item.publishedAt) }}</span>
                      <span class="flex items-center gap-1 tracking-normal text-slate-500 transition-colors duration-300 group-hover:text-slate-900">
                        原文
                        <el-icon><Right /></el-icon>
                      </span>
                    </div>
                  </a>
                </div>
              </section>

              <section
                v-if="!filteredGroups.length"
                class="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm"
              >
                <div class="text-lg font-semibold text-slate-900">没有匹配到相关新闻</div>
                <p class="mt-3 text-sm leading-7 text-slate-500">
                  换个关键词，或者切回“全部来源”看看最新快讯。
                </p>
              </section>
            </template>
          </template>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CollectionTag, Reading, Right, Search, TopRight } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getNewsNowRealtime, getSiteInfo } from '../api'
import ProfileCard from '../components/ProfileCard.vue'
import UiCard from '../components/UiCard.vue'
import { usePublicPluginStore, NEWSNOW_PLUGIN_ID } from '../stores/publicPlugins'
import { useSiteStore } from '../stores/site'
import { useUserStore } from '../stores/user'

type NewsNowItem = {
  id: string
  title: string
  url: string
  publishedAt?: number | null
}

type NewsNowGroup = {
  sourceId: string
  sourceName: string
  sourceUrl: string
  description: string
  status: string
  items: NewsNowItem[]
}

type NewsHeadline = NewsNowItem & {
  sourceId: string
  sourceName: string
  description: string
}

const router = useRouter()
const userStore = useUserStore()
const siteStore = useSiteStore()
const publicPluginStore = usePublicPluginStore()

const pluginEnabled = computed(() => publicPluginStore.hasPlugin(NEWSNOW_PLUGIN_ID))
const groups = ref<NewsNowGroup[]>([])
const loading = ref(false)
const errorMessage = ref('')
const searchKeyword = ref('')
const selectedSourceId = ref('all')
const siteStats = ref({
  articleCount: 0,
  tagCount: 0,
  viewCount: 0,
  runDays: 0,
})

const flattenedItems = computed<NewsHeadline[]>(() => (
  groups.value.flatMap((group) => (
    (group.items || []).map((item) => ({
      ...item,
      sourceId: group.sourceId,
      sourceName: group.sourceName,
      description: group.description,
    }))
  )).sort((left, right) => Number(right.publishedAt || 0) - Number(left.publishedAt || 0))
))

const keyword = computed(() => searchKeyword.value.trim().toLowerCase())
const filteredGroups = computed<NewsNowGroup[]>(() => {
  return groups.value
    .filter((group) => selectedSourceId.value === 'all' || group.sourceId === selectedSourceId.value)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!keyword.value) return true
        return item.title.toLowerCase().includes(keyword.value)
      }),
    }))
    .filter((group) => group.items.length > 0)
})

const headlineBoard = computed(() => {
  const sourceFiltered = selectedSourceId.value === 'all'
    ? flattenedItems.value
    : flattenedItems.value.filter((item) => item.sourceId === selectedSourceId.value)

  const keywordFiltered = keyword.value
    ? sourceFiltered.filter((item) => item.title.toLowerCase().includes(keyword.value))
    : sourceFiltered

  return keywordFiltered.slice(0, 6)
})

const totalHeadlines = computed(() => groups.value.reduce((total, group) => total + group.items.length, 0))
const latestTimestamp = computed(() => flattenedItems.value[0]?.publishedAt || null)
const latestUpdateLabel = computed(() => formatRelativeTime(latestTimestamp.value))

const openSourceFeed = () => {
  window.open('https://newsnow.busiyi.world/c/realtime', '_blank', 'noopener,noreferrer')
}

const formatRelativeTime = (timestamp?: number | null) => {
  if (!timestamp) return '刚刚'
  const diff = Date.now() - Number(timestamp)
  if (!Number.isFinite(diff) || diff <= 0) return '刚刚'

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} 分钟前`
  if (diff < day) return `${Math.max(1, Math.round(diff / hour))} 小时前`
  return `${Math.max(1, Math.round(diff / day))} 天前`
}

const formatAbsoluteTime = (timestamp?: number | null) => {
  if (!timestamp) return '刚刚更新'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

const loadSiteStats = async () => {
  try {
    const res: any = await getSiteInfo()
    if (res?.code === 200 && res.data) {
      siteStats.value = res.data
    }
  } catch (_error) {
    // Ignore site stats errors and keep defaults.
  }
}

const loadNews = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const res: any = await getNewsNowRealtime({ limit: 10 })
    if (res?.code === 200) {
      groups.value = Array.isArray(res.data) ? res.data : []
      return
    }
    groups.value = []
    errorMessage.value = res?.msg || '新闻源暂时不可用，请稍后再试。'
  } catch (_error) {
    groups.value = []
    errorMessage.value = '新闻源暂时不可用，请稍后再试。'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    publicPluginStore.ensureLoaded(),
    loadSiteStats(),
  ])
  if (pluginEnabled.value) {
    await loadNews()
  }
})
</script>

<style scoped>
.news-hub {
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.12), transparent 28%),
    radial-gradient(circle at 82% 12%, rgba(253, 186, 116, 0.14), transparent 24%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.92) 0%, rgba(249, 250, 251, 1) 20%, #f8fafc 100%);
}

.news-hero {
  min-height: 360px;
}

.news-hero__veil {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.38) 42%, rgba(248, 250, 252, 0.96) 100%);
}

.news-hero__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(24px);
  pointer-events: none;
}

.news-hero__glow--a {
  top: 72px;
  right: 10%;
  height: 140px;
  width: 140px;
  background: rgba(56, 189, 248, 0.26);
}

.news-hero__glow--b {
  left: 8%;
  top: 110px;
  height: 180px;
  width: 180px;
  background: rgba(251, 191, 36, 0.2);
}

.news-stat-pill {
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 0.55rem 0.95rem;
  backdrop-filter: blur(10px);
}

.panel-card {
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.source-pill {
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.48rem 0.85rem;
  transition: all 0.2s ease;
}

.source-pill:hover,
.source-pill--active {
  border-color: rgba(14, 165, 233, 0.3);
  background: rgba(14, 165, 233, 0.1);
  color: #0369a1;
}

.headline-card {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.82);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 1) 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.headline-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(56, 189, 248, 0.16), transparent 32%);
  opacity: 0.9;
  pointer-events: none;
}

.headline-card__inner {
  position: relative;
  z-index: 1;
  padding: 1.6rem;
}

.headline-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  background: #eff6ff;
  color: #0f766e;
  padding: 0.42rem 0.8rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.headline-link,
.source-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #0f172a;
  font-size: 0.86rem;
  font-weight: 600;
  transition: color 0.2s ease, transform 0.2s ease;
}

.headline-link:hover,
.source-link:hover {
  color: #0284c7;
  transform: translateX(2px);
}

.news-brief {
  position: relative;
  display: block;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 1) 100%);
  padding: 1.25rem 1.2rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.news-brief::before {
  content: "";
  position: absolute;
  left: 0;
  top: 18px;
  bottom: 18px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(14, 165, 233, 0.9), rgba(34, 197, 94, 0.85));
}

.news-brief:hover {
  transform: translateY(-3px);
  border-color: rgba(14, 165, 233, 0.22);
  box-shadow: 0 20px 35px rgba(15, 23, 42, 0.08);
}

[data-tone="zaobao"] .headline-badge,
.headline-card[data-tone="zaobao"] .headline-badge {
  background: rgba(254, 242, 242, 0.95);
  color: #b91c1c;
}

[data-tone="wallstreetcn-quick"] .headline-badge,
.headline-card[data-tone="wallstreetcn-quick"] .headline-badge {
  background: rgba(255, 247, 237, 0.96);
  color: #c2410c;
}

[data-tone="cls-telegraph"] .headline-badge,
.headline-card[data-tone="cls-telegraph"] .headline-badge {
  background: rgba(240, 253, 250, 0.96);
  color: #0f766e;
}

[data-tone="36kr-quick"] .headline-badge,
.headline-card[data-tone="36kr-quick"] .headline-badge {
  background: rgba(239, 246, 255, 0.96);
  color: #1d4ed8;
}

[data-tone="ithome"] .headline-badge,
.headline-card[data-tone="ithome"] .headline-badge {
  background: rgba(250, 245, 255, 0.96);
  color: #7c3aed;
}

[data-tone="gelonghui"] .headline-badge,
.headline-card[data-tone="gelonghui"] .headline-badge {
  background: rgba(254, 249, 195, 0.96);
  color: #a16207;
}

[data-tone="jin10"] .headline-badge,
.headline-card[data-tone="jin10"] .headline-badge {
  background: rgba(236, 253, 245, 0.96);
  color: #047857;
}

[data-tone="fastbull-express"] .headline-badge,
.headline-card[data-tone="fastbull-express"] .headline-badge {
  background: rgba(239, 246, 255, 0.96);
  color: #0369a1;
}

[data-tone="pcbeta-windows11"] .headline-badge,
.headline-card[data-tone="pcbeta-windows11"] .headline-badge {
  background: rgba(241, 245, 249, 0.98);
  color: #475569;
}

@media (max-width: 1024px) {
  .news-hero {
    min-height: 320px;
  }
}
</style>
