<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Calendar,
  Clock,
  CollectionTag,
  DataAnalysis,
  Film,
  Notebook,
  Reading,
  Refresh,
  Timer,
  TrendCharts,
} from '@element-plus/icons-vue'
import { getBookReadingTimeStats } from '../api'

type TimePoint = {
  timestamp: number
  date: string
  label: string
  read_seconds: number
  read_duration: string
}

type TimeCategory = {
  name: string
  parent_name: string
  reading_count: number
  read_seconds: number
  read_duration: string
  percent: number
}

type LongestBook = {
  source_id: string
  title: string
  author: string
  cover: string
  read_seconds: number
  read_duration: string
  tags: string[]
}

type BookTimeStats = {
  total_read_seconds: number
  total_read_duration: string
  day_average_seconds: number
  day_average_duration: string
  read_days: number
  active_days: number
  compare: number
  book_count: number
  note_count: number
  read_distribution_word: string
  last_sync_at?: string | null
  daily: TimePoint[]
  categories: TimeCategory[]
  longest_books: LongestBook[]
}

type ChartPoint = TimePoint & {
  height: number
  isPeak: boolean
}

const CACHE_KEY = 'book-reading-time-stats-cache'

const emptyStats: BookTimeStats = {
  total_read_seconds: 0,
  total_read_duration: '0分钟',
  day_average_seconds: 0,
  day_average_duration: '0分钟',
  read_days: 0,
  active_days: 0,
  compare: 0,
  book_count: 0,
  note_count: 0,
  read_distribution_word: '',
  last_sync_at: null,
  daily: [],
  categories: [],
  longest_books: [],
}

const routeLinks = [
  { label: '读书记录', to: '/records/books', icon: Reading },
  { label: '阅读时长', to: '/records/books/time', icon: DataAnalysis },
  { label: '电影记录', to: '/records/movies', icon: Film },
]

const stats = ref<BookTimeStats | null>(null)
const loading = ref(true)
const failed = ref(false)
const hasCache = ref(false)

const displayStats = computed(() => stats.value ?? emptyStats)
const isEmpty = computed(() => (
  !loading.value
  && !displayStats.value.total_read_seconds
  && displayStats.value.daily.length === 0
))
const lastSyncLabel = computed(() => formatDateTime(displayStats.value.last_sync_at))
const peakSeconds = computed(() => Math.max(1, ...displayStats.value.daily.map((item) => item.read_seconds)))
const chartPoints = computed<ChartPoint[]>(() => displayStats.value.daily.slice(-18).map((item) => {
  const height = item.read_seconds <= 0 ? 2 : Math.max(10, Math.round((item.read_seconds / peakSeconds.value) * 100))
  return {
    ...item,
    height,
    isPeak: item.read_seconds === peakSeconds.value,
  }
}))
const statCards = computed(() => [
  { label: '累计阅读', value: displayStats.value.total_read_duration, sub: '微信读书同步', icon: Timer },
  { label: '日均阅读', value: displayStats.value.day_average_duration, sub: '按阅读天数计算', icon: Clock },
  { label: '阅读天数', value: `${displayStats.value.read_days || displayStats.value.active_days}`, sub: '天', icon: Calendar },
  { label: '笔记数量', value: `${displayStats.value.note_count}`, sub: `${displayStats.value.book_count} 本公开书籍`, icon: Notebook },
])
const categoryCards = computed(() => displayStats.value.categories.slice(0, 6))
const longestBooks = computed(() => displayStats.value.longest_books.slice(0, 5))
const recentRows = computed(() => displayStats.value.daily.slice(-8).reverse())
const activePercent = computed(() => {
  const totalDays = displayStats.value.daily.length || displayStats.value.read_days
  if (!totalDays) return 0
  return Math.min(100, Math.round((displayStats.value.active_days / totalDays) * 100))
})
const compareLabel = computed(() => {
  const rawValue = Number(displayStats.value.compare || 0)
  if (!rawValue) return '暂无对比'
  const percent = Math.abs(rawValue) <= 1 ? Math.round(rawValue * 100) : Math.round(rawValue)
  return `${percent > 0 ? '+' : ''}${percent}%`
})

const readCachedStats = () => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object') return null
    return value as BookTimeStats
  } catch (_error) {
    return null
  }
}

const writeCachedStats = (value: BookTimeStats) => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(value))
  } catch (_error) {
    // 缓存失败不影响页面展示
  }
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '尚未同步'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '尚未同步'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const loadStats = async () => {
  loading.value = true
  failed.value = false
  try {
    const res: any = await getBookReadingTimeStats(true)
    if (res?.code === 200 && res.data) {
      stats.value = res.data as BookTimeStats
      hasCache.value = false
      writeCachedStats(stats.value)
    }
  } catch (_error) {
    failed.value = true
    const cached = readCachedStats()
    if (cached) {
      stats.value = cached
      hasCache.value = true
    }
  } finally {
    loading.value = false
  }
}

const barStyle = (point: ChartPoint) => ({
  height: `${point.height}%`,
})

const categoryStyle = (item: TimeCategory) => ({
  width: `${Math.min(100, Math.max(4, item.percent))}%`,
})

onMounted(() => {
  loadStats()
})
</script>

<template>
  <section class="time-page">
    <div class="time-shell">
      <aside class="time-sidebar" aria-label="读书记录导航">
        <div class="time-brand">
          <el-icon><Reading /></el-icon>
          <span>纸本书房</span>
        </div>

        <nav class="time-nav">
          <RouterLink
            v-for="link in routeLinks"
            :key="link.to"
            :to="link.to"
            class="time-nav__item"
            active-class="time-nav__item--active"
          >
            <el-icon><component :is="link.icon" /></el-icon>
            <span>{{ link.label }}</span>
          </RouterLink>
        </nav>

        <div class="time-sidebar__card">
          <span>活跃阅读</span>
          <strong>{{ displayStats.active_days }} 天</strong>
          <div class="time-sidebar__track" aria-hidden="true">
            <span :style="{ width: `${activePercent}%` }"></span>
          </div>
          <small>最近同步 {{ lastSyncLabel }}</small>
        </div>
      </aside>

      <main class="time-main">
        <header class="time-header">
          <div>
            <span class="time-eyebrow">
              <el-icon><DataAnalysis /></el-icon>
              Reading Time
            </span>
            <h1>阅读时长统计</h1>
            <p>从微信读书同步累计阅读、日均节奏、类别分布和最长阅读书籍，保留第一张设计稿里的温暖纸本书房气质。</p>
          </div>

          <div class="time-header__actions">
            <button class="time-refresh" type="button" :disabled="loading" @click="loadStats">
              <el-icon><Refresh /></el-icon>
              <span>{{ loading ? '刷新中' : '刷新' }}</span>
            </button>
            <RouterLink class="time-back" to="/records/books">
              <el-icon><Reading /></el-icon>
              <span>返回书架</span>
            </RouterLink>
          </div>
        </header>

        <div v-if="failed" class="time-warning">
          {{ hasCache ? '统计接口暂不可用，正在展示本机最近缓存。' : '统计接口暂不可用，当前没有可展示的阅读时长缓存。' }}
        </div>

        <section class="time-stats" aria-label="阅读时长概览">
          <article v-for="card in statCards" :key="card.label" class="time-stat">
            <el-icon><component :is="card.icon" /></el-icon>
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
            <small>{{ card.sub }}</small>
          </article>
        </section>

        <section class="time-grid">
          <article class="time-panel rhythm-panel">
            <div class="panel-heading">
              <div>
                <h2>每日阅读节奏</h2>
                <p>{{ displayStats.read_distribution_word || '按天展示最近阅读时长，峰值会以深绿突出。' }}</p>
              </div>
              <span>{{ compareLabel }}</span>
            </div>

            <div v-if="loading" class="time-placeholder">正在读取阅读时长...</div>
            <div v-else-if="isEmpty" class="time-placeholder">暂无阅读时长数据，等待下一次微信读书同步。</div>
            <div v-else class="time-chart" aria-label="每日阅读时长柱状图">
              <div v-for="point in chartPoints" :key="point.timestamp" class="time-chart__item">
                <span class="time-chart__value">{{ point.read_duration }}</span>
                <span class="time-chart__bar" :class="{ 'is-peak': point.isPeak }">
                  <span :style="barStyle(point)"></span>
                </span>
                <small>{{ point.label }}</small>
              </div>
            </div>
          </article>

          <aside class="time-panel focus-panel">
            <div class="panel-heading">
              <div>
                <h2>最长阅读书籍</h2>
                <p>只展示公开读书记录中的书籍。</p>
              </div>
            </div>

            <div v-if="loading" class="time-placeholder compact">正在整理书籍...</div>
            <div v-else-if="!longestBooks.length" class="time-placeholder compact">暂无可展示书籍</div>
            <div v-else class="longest-list">
              <article v-for="(book, index) in longestBooks" :key="book.source_id || book.title" class="longest-book">
                <span class="longest-book__cover" :style="book.cover ? { backgroundImage: `url(${book.cover})` } : undefined">
                  <span v-if="!book.cover">{{ index + 1 }}</span>
                </span>
                <span class="longest-book__body">
                  <strong>{{ book.title }}</strong>
                  <small>{{ book.author || '未知作者' }}</small>
                  <span>{{ book.read_duration }}</span>
                </span>
              </article>
            </div>
          </aside>
        </section>

        <section class="time-grid lower-grid">
          <article class="time-panel category-panel">
            <div class="panel-heading">
              <div>
                <h2>类别时间分布</h2>
                <p>按微信读书返回的偏好分类统计。</p>
              </div>
              <el-icon><CollectionTag /></el-icon>
            </div>

            <div v-if="loading" class="time-placeholder compact">正在读取分类...</div>
            <div v-else-if="!categoryCards.length" class="time-placeholder compact">暂无分类统计</div>
            <div v-else class="category-list">
              <article v-for="item in categoryCards" :key="`${item.parent_name}-${item.name}`" class="category-row">
                <div class="category-row__meta">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.read_duration }} · {{ item.reading_count }} 本</span>
                </div>
                <div class="category-row__track" aria-hidden="true">
                  <span :style="categoryStyle(item)"></span>
                </div>
                <small>{{ item.percent }}%</small>
              </article>
            </div>
          </article>

          <article class="time-panel recent-panel">
            <div class="panel-heading">
              <div>
                <h2>最近阅读日</h2>
                <p>最近有记录的阅读日期和时长。</p>
              </div>
              <el-icon><TrendCharts /></el-icon>
            </div>

            <div v-if="loading" class="time-placeholder compact">正在读取日期...</div>
            <div v-else-if="!recentRows.length" class="time-placeholder compact">暂无最近阅读日</div>
            <div v-else class="recent-list">
              <div v-for="row in recentRows" :key="row.timestamp" class="recent-row">
                <span>{{ row.date }}</span>
                <strong>{{ row.read_duration }}</strong>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  </section>
</template>

<style scoped>
.time-page {
  --paper: #fffaf0;
  --paper-strong: #fffdf8;
  --paper-soft: #f4ead9;
  --ink: #1c2723;
  --muted: #6f7a72;
  --line: rgba(44, 54, 48, 0.13);
  --green: #174f3b;
  --green-strong: #0f3b2c;
  --green-soft: #dfece2;
  --warm: #c8763d;
  --warm-soft: #f1dfc7;
  --shadow: 0 22px 62px rgba(40, 48, 39, 0.14);
  min-height: 100vh;
  padding: 6rem 1.5rem 3rem;
  color: var(--ink);
  background:
    repeating-linear-gradient(90deg, rgba(32, 44, 38, 0.018) 0 1px, transparent 1px 4px),
    linear-gradient(180deg, #f7efe2 0%, #f6f1e7 42%, #edf5ef 100%);
}

.time-shell {
  display: grid;
  grid-template-columns: 13rem minmax(0, 1fr);
  gap: 1rem;
  width: min(1500px, 100%);
  margin: 0 auto;
}

.time-sidebar,
.time-panel,
.time-stat,
.time-warning {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: color-mix(in srgb, var(--paper-strong) 92%, transparent);
  box-shadow: var(--shadow);
}

.time-sidebar {
  position: sticky;
  top: 5.5rem;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 7rem);
  padding: 1.15rem;
  color: rgba(255, 255, 255, 0.86);
  background:
    linear-gradient(180deg, rgba(31, 91, 67, 0.96), rgba(13, 54, 40, 0.98)),
    var(--green);
}

.time-brand,
.time-nav__item,
.time-header,
.time-header__actions,
.time-refresh,
.time-back,
.time-eyebrow,
.panel-heading,
.time-stat,
.longest-book,
.category-row,
.recent-row {
  display: flex;
  align-items: center;
}

.time-brand {
  gap: 0.65rem;
  min-height: 3.2rem;
  font-size: 1.05rem;
  font-weight: 900;
}

.time-brand .el-icon {
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 8px;
  color: var(--green);
  background: var(--paper);
}

.time-nav {
  display: grid;
  gap: 0.45rem;
  margin-top: 1.75rem;
}

.time-nav__item {
  gap: 0.65rem;
  min-height: 2.8rem;
  border-radius: 8px;
  padding: 0 0.85rem;
  color: rgba(255, 255, 255, 0.76);
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.time-nav__item span {
  white-space: nowrap;
}

.time-nav__item:hover,
.time-nav__item--active {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(2px);
}

.time-sidebar__card {
  margin-top: auto;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
}

.time-sidebar__card span,
.time-sidebar__card small {
  display: block;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.78rem;
  line-height: 1.6;
}

.time-sidebar__card strong {
  display: block;
  margin: 0.2rem 0 0.8rem;
  color: #fff;
  font-size: 1.85rem;
  line-height: 1;
}

.time-sidebar__track {
  height: 0.42rem;
  margin-bottom: 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  overflow: hidden;
}

.time-sidebar__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--warm-soft);
}

.time-main {
  min-width: 0;
}

.time-header {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.time-eyebrow {
  gap: 0.45rem;
  color: var(--green);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.time-header h1 {
  margin: 0.35rem 0 0.5rem;
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 6vw, 5.6rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.time-header p,
.panel-heading p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.time-header p {
  max-width: 44rem;
}

.time-header__actions {
  align-self: flex-end;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.time-refresh,
.time-back {
  gap: 0.45rem;
  min-height: 2.85rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0 1rem;
  color: var(--green-strong);
  background: var(--paper-strong);
  font-weight: 850;
  text-decoration: none;
  cursor: pointer;
}

.time-refresh:disabled {
  cursor: progress;
  opacity: 0.68;
}

.time-back {
  color: var(--paper);
  background: linear-gradient(135deg, var(--green), var(--green-strong));
}

.time-warning {
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  color: #8a4b20;
  background: #fff4df;
  box-shadow: none;
}

.time-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.time-stat {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-items: start;
  min-height: 8.6rem;
  padding: 1rem;
  box-shadow: none;
}

.time-stat .el-icon {
  flex: 0 0 auto;
  width: 2.45rem;
  height: 2.45rem;
  border-radius: 8px;
  color: var(--paper);
  background: linear-gradient(135deg, var(--green), var(--warm));
}

.time-stat span,
.time-stat small {
  margin-left: 0.75rem;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 750;
}

.time-stat strong {
  grid-column: 1 / -1;
  display: block;
  min-width: 0;
  margin: 1rem 0 0;
  font-size: clamp(1.55rem, 2.2vw, 2.2rem);
  line-height: 1.1;
}

.time-stat small {
  grid-column: 1 / -1;
  align-self: flex-end;
  margin: 0;
  text-align: left;
}

.time-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(20rem, 0.62fr);
  gap: 1rem;
}

.lower-grid {
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.55fr);
  margin-top: 1rem;
}

.time-panel {
  min-width: 0;
  padding: 1.1rem;
  overflow: hidden;
}

.panel-heading {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-heading h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 900;
}

.panel-heading > span,
.panel-heading > .el-icon {
  flex: 0 0 auto;
  border-radius: 8px;
  padding: 0.45rem 0.65rem;
  color: var(--green);
  background: var(--green-soft);
  font-size: 0.82rem;
  font-weight: 900;
}

.time-placeholder {
  display: grid;
  place-items: center;
  min-height: 24rem;
  border: 1px dashed color-mix(in srgb, var(--muted) 32%, transparent);
  border-radius: 8px;
  padding: 1rem;
  color: var(--muted);
  text-align: center;
  line-height: 1.7;
}

.time-placeholder.compact {
  min-height: 12rem;
}

.time-chart {
  display: grid;
  grid-template-columns: repeat(18, minmax(2.5rem, 1fr));
  gap: 0.55rem;
  min-height: 28rem;
  padding: 0.75rem 0.15rem 0;
  overflow-x: auto;
}

.time-chart__item {
  display: grid;
  grid-template-rows: 2.1rem minmax(14rem, 1fr) 1.5rem;
  gap: 0.45rem;
  align-items: end;
  min-width: 2.5rem;
  text-align: center;
}

.time-chart__value {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-chart__bar {
  position: relative;
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(223, 213, 195, 0.46), rgba(223, 213, 195, 0.18));
  overflow: hidden;
}

.time-chart__bar > span {
  display: block;
  width: 100%;
  border-radius: 8px 8px 0 0;
  background: linear-gradient(180deg, #2c785b, var(--green-strong));
}

.time-chart__bar.is-peak > span {
  background: linear-gradient(180deg, var(--warm), var(--green));
}

.time-chart__item small {
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 800;
}

.longest-list,
.category-list,
.recent-list {
  display: grid;
  gap: 0.7rem;
}

.longest-book {
  gap: 0.75rem;
  min-height: 5rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0.65rem;
  background: color-mix(in srgb, var(--paper) 72%, transparent);
}

.longest-book__cover {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 3.2rem;
  height: 4rem;
  border-radius: 6px;
  color: var(--paper);
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.18), transparent 24%),
    linear-gradient(135deg, var(--warm), var(--green));
  background-position: center;
  background-size: cover;
  font-weight: 900;
}

.longest-book__body {
  display: grid;
  gap: 0.18rem;
  min-width: 0;
}

.longest-book__body strong,
.category-row__meta strong {
  overflow: hidden;
  color: var(--ink);
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.longest-book__body small,
.category-row__meta span {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.longest-book__body > span {
  color: var(--green);
  font-weight: 900;
}

.category-row {
  display: grid;
  grid-template-columns: minmax(9rem, 0.45fr) minmax(0, 1fr) 3.2rem;
  gap: 0.8rem;
  min-height: 4rem;
  border-bottom: 1px solid var(--line);
}

.category-row:last-child {
  border-bottom: 0;
}

.category-row__meta {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.category-row__track {
  height: 0.56rem;
  border-radius: 999px;
  background: var(--warm-soft);
  overflow: hidden;
}

.category-row__track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--warm), var(--green));
}

.category-row small {
  color: var(--green);
  font-weight: 900;
  text-align: right;
}

.recent-row {
  justify-content: space-between;
  gap: 1rem;
  min-height: 2.65rem;
  border-bottom: 1px solid var(--line);
}

.recent-row:last-child {
  border-bottom: 0;
}

.recent-row span {
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 800;
}

.recent-row strong {
  color: var(--ink);
  font-weight: 900;
}

@media (max-width: 1180px) {
  .time-shell {
    grid-template-columns: 5rem minmax(0, 1fr);
  }

  .time-brand span,
  .time-nav__item span,
  .time-sidebar__card {
    display: none;
  }

  .time-sidebar {
    align-items: center;
    padding: 1rem 0.65rem;
  }

  .time-nav__item {
    justify-content: center;
    width: 3.25rem;
    height: 3.25rem;
    padding: 0;
  }
}

@media (max-width: 980px) {
  .time-page {
    padding: 5.5rem 1rem 2rem;
  }

  .time-shell,
  .time-grid,
  .lower-grid,
  .time-header {
    grid-template-columns: 1fr;
  }

  .time-header {
    display: grid;
  }

  .time-sidebar {
    position: static;
    flex-direction: row;
    justify-content: space-between;
    min-height: 0;
  }

  .time-brand span,
  .time-nav__item span {
    display: inline;
  }

  .time-nav {
    display: flex;
    margin-top: 0;
  }

  .time-nav__item {
    width: auto;
    height: 2.8rem;
    padding: 0 0.8rem;
  }

  .time-header__actions {
    justify-content: flex-start;
  }

  .time-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .time-header h1 {
    font-size: clamp(2.35rem, 12vw, 3rem);
    line-height: 1.04;
  }

  .time-sidebar {
    align-items: stretch;
    flex-direction: column;
  }

  .time-nav {
    overflow-x: auto;
  }

  .time-stats,
  .category-row {
    grid-template-columns: 1fr;
  }

  .time-refresh,
  .time-back {
    justify-content: center;
    width: 100%;
  }

  .time-chart {
    grid-template-columns: repeat(18, minmax(2.3rem, 1fr));
  }

  .time-chart__value {
    display: none;
  }
}
</style>
