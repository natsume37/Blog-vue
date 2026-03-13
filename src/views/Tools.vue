<template>
  <div class="tools-page min-h-screen bg-slate-50 pt-24 pb-16">
    <div class="tools-page__bg">
      <div class="tools-page__orb tools-page__orb-a"></div>
      <div class="tools-page__orb tools-page__orb-b"></div>
      <div class="tools-page__grid"></div>
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section class="tools-hero rounded-[32px] border border-white/70 bg-white/88 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-10">
        <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div class="space-y-6">
            <span class="tools-hero__eyebrow">Tool Wall</span>
            <div class="space-y-4">
              <h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                工具墙。
                <span class="block text-sky-600">把常用入口集中收好，打开就能用。</span>
              </h1>
              <p class="max-w-2xl text-base leading-8 text-slate-500 md:text-lg">
                这里收录我常用的网站工具、资讯入口和订阅源。它不是一页死链接，而是可持续维护的工具目录。
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <button class="tools-hero__button tools-hero__button-primary" @click="scrollToWall">
                浏览工具
              </button>
              <router-link class="tools-hero__button tools-hero__button-secondary" to="/news">
                打开 NewsNow
              </router-link>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="stat-card">
              <div class="stat-card__label">工具数量</div>
              <div class="stat-card__value">{{ toolItems.length }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">分类数量</div>
              <div class="stat-card__value">{{ categories.length - 1 }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-card__label">可订阅</div>
              <div class="stat-card__value">{{ subscribableCount }}</div>
            </div>
          </div>
        </div>
      </section>

      <section ref="wallSectionRef" class="mt-10">
        <div class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Directory</div>
            <h2 class="mt-2 text-3xl font-semibold text-slate-900">工具目录</h2>
            <p class="mt-2 text-sm leading-7 text-slate-500">
              可以按分类浏览，也可以直接点击卡片进入网站；如果配置了订阅地址，卡片会额外显示订阅按钮。
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in categories"
              :key="category"
              class="filter-pill"
              :class="category === activeCategory ? 'filter-pill-active' : 'filter-pill-default'"
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <div v-loading="loading" class="min-h-[220px]">
          <div v-if="filteredTools.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="tool in filteredTools"
              :key="tool.id"
              class="tool-card"
              :style="{ '--tool-accent': tool.site_color || '#0ea5e9' }"
            >
              <div class="tool-card__shine"></div>
              <div class="flex items-start gap-4">
                <img
                  :src="tool.logo || fallbackLogo"
                  :alt="tool.name"
                  class="h-14 w-14 rounded-2xl border border-slate-200 object-cover shadow-sm"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="truncate text-lg font-semibold text-slate-900">{{ tool.name }}</h3>
                    <span v-if="tool.badge" class="badge-pill">{{ tool.badge }}</span>
                    <span v-if="tool.is_featured" class="featured-pill">精选</span>
                  </div>
                  <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span class="rounded-full bg-slate-100 px-2.5 py-1">{{ tool.category || '推荐工具' }}</span>
                    <span>{{ tool.tool_type || 'website' }}</span>
                  </div>
                </div>
              </div>

              <p class="mt-5 min-h-[72px] text-sm leading-7 text-slate-500">
                {{ tool.description || '这个入口还没有填写简介，但已经收录进工具墙。' }}
              </p>

              <div v-if="splitTags(tool.tags).length" class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="tag in splitTags(tool.tags)"
                  :key="`${tool.id}-${tag}`"
                  class="tag-pill"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="mt-6 flex flex-wrap gap-3">
                <button class="tool-card__action tool-card__action-primary" @click="openTool(tool)">
                  立即打开
                </button>
                <button
                  v-if="tool.subscription_url"
                  class="tool-card__action tool-card__action-secondary"
                  @click="openSubscription(tool)"
                >
                  订阅
                </button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <div class="text-lg font-semibold text-slate-700">工具墙还是空的</div>
            <p class="mt-2 text-sm leading-7 text-slate-400">
              先去后台工具墙管理页加几条站点，这里就会自动展示。
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getToolItems } from '../api'
import { useSiteStore } from '../stores/site'

type ToolItem = {
  id: number
  name: string
  url: string
  logo?: string
  description?: string
  category?: string
  tool_type?: string
  badge?: string
  tags?: string
  site_color?: string
  subscription_url?: string
  open_mode?: 'new_tab' | 'same_tab'
  is_featured?: boolean
  created_at?: string
}

const siteStore = useSiteStore()
const loading = ref(false)
const toolItems = ref<ToolItem[]>([])
const activeCategory = ref('全部')
const wallSectionRef = ref<HTMLElement | null>(null)

const fallbackLogo = computed(() => siteStore.siteConfig.siteAvatar)

const categories = computed(() => {
  const values = new Set<string>(['全部'])
  toolItems.value.forEach((item) => {
    if (item.category?.trim()) {
      values.add(item.category.trim())
    }
  })
  return Array.from(values)
})

const filteredTools = computed(() => (
  activeCategory.value === '全部'
    ? toolItems.value
    : toolItems.value.filter(item => (item.category || '推荐工具') === activeCategory.value)
))

const subscribableCount = computed(() => toolItems.value.filter(item => Boolean(item.subscription_url)).length)

const fetchToolItems = async () => {
  loading.value = true
  try {
    const res: any = await getToolItems()
    if (res.code === 200) {
      toolItems.value = Array.isArray(res.data) ? res.data : []
      return
    }
    ElMessage.warning(res.msg || '获取工具墙失败')
  } catch (error) {
    console.error(error)
    ElMessage.warning('获取工具墙失败')
  } finally {
    loading.value = false
  }
}

const splitTags = (value?: string) => (
  (value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 4)
)

const openWithMode = (url?: string, openMode: ToolItem['open_mode'] = 'new_tab') => {
  if (!url) return
  if (openMode === 'same_tab') {
    window.location.assign(url)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

const openTool = (item: ToolItem) => {
  openWithMode(item.url, item.open_mode)
}

const openSubscription = (item: ToolItem) => {
  openWithMode(item.subscription_url, 'new_tab')
}

const scrollToWall = () => {
  wallSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  fetchToolItems()
})
</script>

<style scoped>
.tools-page {
  position: relative;
  overflow: hidden;
}

.tools-page__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tools-page__orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(80px);
  opacity: 0.5;
}

.tools-page__orb-a {
  top: 5rem;
  left: -4rem;
  width: 20rem;
  height: 20rem;
  background: rgba(14, 165, 233, 0.18);
}

.tools-page__orb-b {
  top: 18rem;
  right: -4rem;
  width: 22rem;
  height: 22rem;
  background: rgba(56, 189, 248, 0.14);
}

.tools-page__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.8), transparent);
}

.tools-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.08);
  color: #0369a1;
  padding: 0.55rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.tools-hero__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.9rem 1.35rem;
  font-size: 0.95rem;
  font-weight: 600;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.tools-hero__button:hover {
  transform: translateY(-1px);
}

.tools-hero__button-primary {
  background: linear-gradient(135deg, #0f172a, #0369a1);
  color: #fff;
  box-shadow: 0 16px 40px rgba(2, 132, 199, 0.22);
}

.tools-hero__button-secondary {
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.68);
  color: #0f172a;
}

.stat-card {
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  padding: 1.3rem 1.2rem;
}

.stat-card__label {
  color: #64748b;
  font-size: 0.8rem;
}

.stat-card__value {
  margin-top: 0.8rem;
  color: #0f172a;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
}

.filter-pill {
  border-radius: 999px;
  padding: 0.62rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.filter-pill-default {
  background: rgba(255, 255, 255, 0.75);
  color: #475569;
  border: 1px solid rgba(226, 232, 240, 0.9);
}

.filter-pill-active {
  background: #0f172a;
  color: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
}

.tool-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--tool-accent) 12%, transparent), transparent 30%),
    rgba(255, 255, 255, 0.92);
  padding: 1.45rem;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
}

.tool-card__shine {
  position: absolute;
  inset: auto -30% -55% auto;
  width: 12rem;
  height: 12rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tool-accent) 20%, transparent);
  filter: blur(48px);
  opacity: 0.55;
  pointer-events: none;
}

.badge-pill,
.featured-pill,
.tag-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
}

.badge-pill {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
  padding: 0.26rem 0.65rem;
}

.featured-pill {
  background: rgba(249, 115, 22, 0.12);
  color: #c2410c;
  padding: 0.26rem 0.65rem;
}

.tag-pill {
  background: rgba(14, 165, 233, 0.08);
  color: #0369a1;
  padding: 0.38rem 0.7rem;
}

.tool-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.72rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.tool-card__action:hover {
  transform: translateY(-1px);
}

.tool-card__action-primary {
  background: #0f172a;
  color: #fff;
}

.tool-card__action-primary:hover {
  background: color-mix(in srgb, var(--tool-accent) 78%, #0f172a);
}

.tool-card__action-secondary {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: rgba(248, 250, 252, 0.86);
  color: #0f172a;
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 16rem;
  border: 1px dashed rgba(148, 163, 184, 0.45);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  text-align: center;
  padding: 2rem;
}
</style>
