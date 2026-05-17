<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  Clock,
  CollectionTag,
  DataAnalysis,
  EditPen,
  Film,
  Finished,
  Notebook,
  Plus,
  Reading,
  Search,
  StarFilled,
  Tickets,
  Timer,
  TrendCharts,
  VideoPlay,
  View,
} from '@element-plus/icons-vue'
import { getBookRecords, getBookRecordStats, getWeReadSyncStatus, syncWeReadRecords } from '../api'
import { useUserStore } from '../stores/user'

type RecordKind = 'books' | 'movies'

type RecordItem = {
  id?: number
  title: string
  creator: string
  status: string
  format: string
  progress: number
  rating: number
  date: string
  duration: string
  paceLabel: string
  note: string
  tags: string[]
  color: string
  accent: string
  cover?: string
}

type BookStats = {
  monthly_count: number
  completion_rate: number
  note_count: number
  average_rating: number
  read_duration: string
  last_sync_at?: string | null
}

type SyncStatus = {
  configured: boolean
  enabled: boolean
  status: string
  message?: string
  last_error?: string
  last_success_at?: string | null
  books_synced?: number
  notes_synced?: number
}

const props = defineProps<{
  kind: RecordKind
}>()

const userStore = useUserStore()
const selectedIndex = ref(0)
const activeStatus = ref('全部')
const searchKeyword = ref('')
const bookApiRecords = ref<RecordItem[]>([])
const bookStats = ref<BookStats | null>(null)
const bookLoading = ref(false)
const bookApiLoaded = ref(false)
const syncLoading = ref(false)
const syncStatus = ref<SyncStatus | null>(null)

const bookRecords: RecordItem[] = [
  {
    title: '明亮的夜晚',
    creator: '崔恩荣',
    status: '阅读中',
    format: '纸书',
    progress: 68,
    rating: 4.5,
    date: '2026.05.16',
    duration: '12h 30m',
    paceLabel: '本周 164 页',
    note: '把家族记忆写得轻而准，适合做一篇关于女性叙事的长笔记。',
    tags: ['文学', '女性叙事', '摘抄多'],
    color: '#c66b3d',
    accent: '#224c4a',
  },
  {
    title: '纳瓦尔宝典',
    creator: 'Eric Jorgenson',
    status: '待读',
    format: '电子书',
    progress: 18,
    rating: 4,
    date: '2026.05.11',
    duration: '2h 15m',
    paceLabel: '标注 23 条',
    note: '先扫过财富与判断力章节，后续拆成主题卡片。',
    tags: ['商业', '方法论', '卡片'],
    color: '#2f6c8f',
    accent: '#d79a43',
  },
  {
    title: '置身事内',
    creator: '兰小欢',
    status: '已读完',
    format: '精装',
    progress: 100,
    rating: 5,
    date: '2026.05.02',
    duration: '9h 45m',
    paceLabel: '复盘 3 次',
    note: '地方财政和土地金融部分可补一张知识地图。',
    tags: ['经济', '中国', '复盘'],
    color: '#4b6f44',
    accent: '#18231f',
  },
  {
    title: '深入理解计算机系统',
    creator: 'Randal E. Bryant',
    status: '暂停',
    format: '技术书',
    progress: 42,
    rating: 4.5,
    date: '2026.04.28',
    duration: '18h 20m',
    paceLabel: '练习 12 题',
    note: '缓存章节需要结合代码实验重读，不适合碎片时间推进。',
    tags: ['技术', '系统', '练习'],
    color: '#6a5a8a',
    accent: '#111827',
  },
]

const movieRecords: RecordItem[] = [
  {
    title: 'Perfect Days',
    creator: 'Wim Wenders',
    status: '已看完',
    format: '影院',
    progress: 100,
    rating: 4.5,
    date: '2026.05.15',
    duration: '124 min',
    paceLabel: '二刷清单',
    note: '日常动作的重复感很克制，适合写一篇关于生活秩序的短评。',
    tags: ['剧情', '日本', '摄影'],
    color: '#2f5d7c',
    accent: '#d6a35d',
  },
  {
    title: '沙丘 2',
    creator: 'Denis Villeneuve',
    status: '想看',
    format: 'IMAX',
    progress: 0,
    rating: 0,
    date: '2026.05.18',
    duration: '166 min',
    paceLabel: '排片提醒',
    note: '先补原著设定和第一部视觉笔记，再决定是否写长评。',
    tags: ['科幻', '视觉', '待购票'],
    color: '#b66a2f',
    accent: '#203441',
  },
  {
    title: '坠落的审判',
    creator: 'Justine Triet',
    status: '已看完',
    format: '流媒体',
    progress: 100,
    rating: 5,
    date: '2026.05.09',
    duration: '151 min',
    paceLabel: '笔记 1,820 字',
    note: '法庭叙事与亲密关系的边界很值得拆镜头。',
    tags: ['悬疑', '法庭', '长评'],
    color: '#7b3449',
    accent: '#152029',
  },
  {
    title: '花样年华',
    creator: '王家卫',
    status: '重看中',
    format: '蓝光',
    progress: 56,
    rating: 5,
    date: '2026.04.30',
    duration: '98 min',
    paceLabel: '镜头标注 17 条',
    note: '把门框、走廊、慢动作剪成一组视觉索引。',
    tags: ['爱情', '摄影', '重看'],
    color: '#8f2d2d',
    accent: '#1e1613',
  },
]

const emptyRecord: RecordItem = {
  title: '暂无记录',
  creator: '等待同步',
  status: '待读',
  format: '微信读书',
  progress: 0,
  rating: 0,
  date: '-',
  duration: '0分钟',
  paceLabel: '暂无同步数据',
  note: '配置微信读书 API Key 后，可手动同步或等待定时任务刷新。',
  tags: ['微信读书'],
  color: '#2f6c8f',
  accent: '#224c4a',
}

const activeBookRecords = computed(() => {
  if (!bookApiLoaded.value) return bookRecords
  return bookApiRecords.value
})

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const formatSyncTime = (value?: string | null) => {
  if (!value) return '尚未同步'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '尚未同步'
  return `${formatDate(value)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const transformBookRecord = (item: any): RecordItem => ({
  id: Number(item.id),
  title: String(item.title || '未命名书籍'),
  creator: String(item.author || '未知作者'),
  status: String(item.status || '待读'),
  format: String(item.format || '微信读书'),
  progress: Number(item.progress || 0),
  rating: Number(item.rating || 0),
  date: formatDate(item.last_read_at || item.synced_at),
  duration: String(item.read_duration || '0分钟'),
  paceLabel: `${Number(item.note_count || 0)} 条笔记 · ${String(item.read_duration || '0分钟')}`,
  note: String(item.note_summary || item.category || '暂无公开笔记摘要'),
  tags: Array.isArray(item.tags) && item.tags.length ? item.tags.map(String) : ['微信读书'],
  color: String(item.color || '#2f6c8f'),
  accent: String(item.accent || '#224c4a'),
  cover: String(item.cover || ''),
})

const config = computed(() => {
  if (props.kind === 'books') {
    const stats = bookStats.value
    return {
      eyebrow: 'Reading Log',
      title: '读书记录',
      subtitle: '把书架、进度、摘抄和复盘放在同一个工作台里。',
      icon: Reading,
      secondaryIcon: Notebook,
      actionLabel: '添加书籍',
      searchPlaceholder: '搜索书名 / 作者 / 标签',
      navLabel: '书架',
      paletteClass: 'books',
      insightTitle: '阅读节奏',
      detailTitle: '阅读档案',
      progressLabel: '阅读进度',
      durationLabel: '累计阅读',
      records: activeBookRecords.value,
      statuses: ['全部', '阅读中', '待读', '已读完', '暂停'],
      stats: [
        { label: '本月阅读', value: String(stats?.monthly_count ?? 9), suffix: '本', icon: Reading },
        { label: '完成率', value: String(stats?.completion_rate ?? 72), suffix: '%', icon: Finished },
        { label: '笔记', value: String(stats?.note_count ?? 186), suffix: '条', icon: EditPen },
      ],
    }
  }

  return {
    eyebrow: 'Cinema Log',
    title: '电影记录',
    subtitle: '把想看、已看、重看和影评沉淀成一个可检索片库。',
    icon: Film,
    secondaryIcon: Tickets,
    actionLabel: '添加影片',
    searchPlaceholder: '搜索片名 / 导演 / 标签',
    navLabel: '片库',
    paletteClass: 'movies',
    insightTitle: '观影节奏',
    detailTitle: '影片档案',
    progressLabel: '观看进度',
    durationLabel: '片长 / 累计',
    records: movieRecords,
    statuses: ['全部', '已看完', '想看', '重看中'],
    stats: [
      { label: '本月观影', value: '14', suffix: '部', icon: VideoPlay },
      { label: '平均评分', value: '4.6', suffix: '/5', icon: StarFilled },
      { label: '长评', value: '7', suffix: '篇', icon: EditPen },
    ],
  }
})

const filteredRecords = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  return config.value.records.filter((item) => {
    const statusMatched = activeStatus.value === '全部' || item.status === activeStatus.value
    const keywordMatched = !keyword || [item.title, item.creator, item.format, ...item.tags]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
    return statusMatched && keywordMatched
  })
})

const selectedRecord = computed<RecordItem>(() => {
  const fallback = config.value.records[0] ?? emptyRecord
  return filteredRecords.value[selectedIndex.value] ?? filteredRecords.value[0] ?? fallback
})

const averageRating = computed(() => {
  const rated = config.value.records.filter((item) => item.rating > 0)
  if (!rated.length) return '0.0'
  const average = rated.reduce((sum, item) => sum + item.rating, 0) / rated.length
  return average.toFixed(1)
})

const completionCount = computed(() => config.value.records.filter((item) => item.progress === 100).length)

const routeLinks = [
  { label: '读书', to: '/records/books', icon: Reading },
  { label: '时长', to: '/records/books/time', icon: DataAnalysis },
  { label: '电影', to: '/records/movies', icon: Film },
]

const loadBookRecords = async () => {
  if (props.kind !== 'books') return
  bookLoading.value = true
  try {
    const [recordsResRaw, statsResRaw] = await Promise.all([
      getBookRecords({}, true),
      getBookRecordStats(true),
    ])
    const recordsRes: any = recordsResRaw
    const statsRes: any = statsResRaw
    if (recordsRes?.code === 200 && Array.isArray(recordsRes.data)) {
      bookApiRecords.value = recordsRes.data.map(transformBookRecord)
      bookApiLoaded.value = true
    }
    if (statsRes?.code === 200 && statsRes.data) {
      bookStats.value = statsRes.data
    }
  } catch (_error) {
    bookApiLoaded.value = false
  } finally {
    bookLoading.value = false
  }

  if (userStore.isAdmin) {
    try {
      const statusRes: any = await getWeReadSyncStatus(true)
      if (statusRes?.code === 200) {
        syncStatus.value = statusRes.data
      }
    } catch (_error) {
      syncStatus.value = null
    }
  }
}

const handleSyncWeRead = async () => {
  if (!userStore.isAdmin || props.kind !== 'books') return
  syncLoading.value = true
  try {
    const res: any = await syncWeReadRecords()
    if (res?.code === 200) {
      const status = res.data?.status
      if (status === 'success') {
        ElMessage.success(res.msg || '微信读书同步完成')
      } else {
        ElMessage.warning(res.msg || '微信读书同步未完成')
      }
      await loadBookRecords()
    }
  } catch (_error) {
    ElMessage.error('微信读书同步失败')
  } finally {
    syncLoading.value = false
  }
}

onMounted(() => {
  loadBookRecords()
})

watch(() => props.kind, () => {
  activeStatus.value = '全部'
  selectedIndex.value = 0
  searchKeyword.value = ''
  loadBookRecords()
})

watch([activeStatus, searchKeyword], () => {
  selectedIndex.value = 0
})
</script>

<template>
  <section class="record-page" :class="`record-page--${config.paletteClass}`">
    <div class="record-shell">
      <aside class="record-sidebar" aria-label="记录类型">
        <div class="brand-mark">
          <el-icon><component :is="config.icon" /></el-icon>
        </div>

        <nav class="record-nav">
          <RouterLink
            v-for="link in routeLinks"
            :key="link.to"
            :to="link.to"
            class="record-nav__item"
            active-class="record-nav__item--active"
          >
            <el-icon><component :is="link.icon" /></el-icon>
            <span>{{ link.label }}</span>
          </RouterLink>
        </nav>

        <div class="record-sidebar__meter">
          <span>完成</span>
          <strong>{{ completionCount }}/{{ config.records.length }}</strong>
        </div>
      </aside>

      <main class="record-main">
        <header class="record-header">
          <div class="record-heading">
            <span class="record-eyebrow">
              <el-icon><component :is="config.secondaryIcon" /></el-icon>
              {{ config.eyebrow }}
            </span>
            <h1>{{ config.title }}</h1>
            <p>{{ config.subtitle }}</p>
          </div>

          <div class="record-action-stack">
            <div class="record-actions">
              <label class="record-search">
                <el-icon><Search /></el-icon>
                <input v-model="searchKeyword" type="search" :placeholder="config.searchPlaceholder">
              </label>
              <button
                v-if="props.kind === 'books' && userStore.isAdmin"
                class="record-sync"
                type="button"
                :disabled="syncLoading"
                @click="handleSyncWeRead"
              >
                <el-icon><Timer /></el-icon>
                <span>{{ syncLoading ? '同步中' : '同步微信读书' }}</span>
              </button>
              <button v-if="userStore.isAdmin" class="record-add" type="button">
                <el-icon><Plus /></el-icon>
                <span>{{ config.actionLabel }}</span>
              </button>
            </div>
            <p v-if="props.kind === 'books' && userStore.isAdmin" class="record-sync-meta">
              {{ syncStatus?.configured === false ? '微信读书 API Key 未配置' : `上次同步：${formatSyncTime(syncStatus?.last_success_at || bookStats?.last_sync_at)}` }}
            </p>
          </div>
        </header>

        <section class="record-stats" aria-label="统计">
          <div v-for="stat in config.stats" :key="stat.label" class="record-stat">
            <el-icon><component :is="stat.icon" /></el-icon>
            <span>{{ stat.label }}</span>
            <strong>{{ stat.value }}<small>{{ stat.suffix }}</small></strong>
          </div>
        </section>

        <section class="record-content">
          <div class="record-panel record-list-panel">
            <div class="panel-toolbar">
              <h2>{{ config.navLabel }}</h2>
              <div class="segmented-control" aria-label="状态筛选">
                <button
                  v-for="status in config.statuses"
                  :key="status"
                  type="button"
                  :class="{ 'is-active': activeStatus === status }"
                  @click="activeStatus = status"
                >
                  {{ status }}
                </button>
              </div>
            </div>

            <div v-if="props.kind === 'books' && bookLoading" class="record-empty">
              正在读取微信读书缓存...
            </div>
            <div v-else-if="!filteredRecords.length" class="record-empty">
              暂无读书记录。配置 API Key 后可同步微信读书，或稍后再试。
            </div>
            <div v-else class="record-list">
              <button
                v-for="(item, index) in filteredRecords"
                :key="item.id ?? item.title"
                type="button"
                class="record-row"
                :class="{ 'record-row--active': selectedIndex === index }"
                @click="selectedIndex = index"
              >
                <span class="cover-art" :style="{ '--cover': item.color, '--cover-accent': item.accent }">
                  <span></span>
                </span>
                <span class="record-row__body">
                  <span class="record-row__title">{{ item.title }}</span>
                  <span class="record-row__meta">{{ item.creator }} · {{ item.format }}</span>
                  <span class="progress-track" aria-hidden="true">
                    <span :style="{ width: `${item.progress}%` }"></span>
                  </span>
                </span>
                <span class="record-row__score">
                  <el-icon><StarFilled /></el-icon>
                  {{ item.rating || '-' }}
                </span>
              </button>
            </div>
          </div>

          <article v-if="filteredRecords.length" class="record-panel detail-panel">
            <div class="detail-cover" :style="{ '--cover': selectedRecord.color, '--cover-accent': selectedRecord.accent }">
              <span class="detail-cover__spine"></span>
              <span class="detail-cover__title">{{ selectedRecord.title }}</span>
            </div>

            <div class="detail-copy">
              <div class="detail-topline">
                <span>{{ selectedRecord.status }}</span>
                <span>{{ selectedRecord.date }}</span>
              </div>
              <h2>{{ selectedRecord.title }}</h2>
              <p class="detail-creator">{{ selectedRecord.creator }}</p>
              <p class="detail-note">{{ selectedRecord.note }}</p>

              <div class="detail-tags">
                <span v-for="tag in selectedRecord.tags" :key="tag">{{ tag }}</span>
              </div>

              <div class="detail-grid">
                <div>
                  <el-icon><TrendCharts /></el-icon>
                  <span>{{ config.progressLabel }}</span>
                  <strong>{{ selectedRecord.progress }}%</strong>
                </div>
                <div>
                  <el-icon><Clock /></el-icon>
                  <span>{{ config.durationLabel }}</span>
                  <strong>{{ selectedRecord.duration }}</strong>
                </div>
                <div>
                  <el-icon><StarFilled /></el-icon>
                  <span>个人评分</span>
                  <strong>{{ selectedRecord.rating || '未评' }}</strong>
                </div>
                <div>
                  <el-icon><Calendar /></el-icon>
                  <span>最近更新</span>
                  <strong>{{ selectedRecord.date }}</strong>
                </div>
              </div>
            </div>
          </article>

          <article v-else class="record-panel detail-panel detail-panel--empty">
            <div class="detail-copy">
              <div class="detail-topline">
                <span>微信读书</span>
                <span>等待同步</span>
              </div>
              <h2>暂无记录</h2>
              <p class="detail-note">当前没有可展示的公开读书记录。管理员配置 `WEREAD_API_KEY` 后，可点击同步按钮或等待定时任务刷新。</p>
            </div>
          </article>

          <aside class="record-insights" aria-label="洞察">
            <section class="insight-block">
              <div class="insight-heading">
                <el-icon><DataAnalysis /></el-icon>
                <h2>{{ config.insightTitle }}</h2>
              </div>
              <div class="tempo-ring">
                <span>{{ averageRating }}</span>
                <small>Avg</small>
              </div>
              <p>{{ selectedRecord.paceLabel }}</p>
            </section>

            <section class="insight-block">
              <div class="insight-heading">
                <el-icon><CollectionTag /></el-icon>
                <h2>标签密度</h2>
              </div>
              <div class="tag-cloud">
                <span v-for="tag in selectedRecord.tags" :key="tag">{{ tag }}</span>
                <span>{{ selectedRecord.status }}</span>
                <span>{{ selectedRecord.format }}</span>
              </div>
            </section>

            <section v-if="userStore.isAdmin" class="insight-block compact-actions">
              <button type="button">
                <el-icon><EditPen /></el-icon>
                <span>写笔记</span>
              </button>
              <button type="button">
                <el-icon><Timer /></el-icon>
                <span>记录时长</span>
              </button>
              <button type="button">
                <el-icon><View /></el-icon>
                <span>查看回顾</span>
              </button>
            </section>
          </aside>
        </section>
      </main>
    </div>
  </section>
</template>

<style scoped>
.record-page {
  --page-bg: #eef5f0;
  --surface: #fffdf8;
  --surface-strong: #ffffff;
  --ink: #17211f;
  --muted: #6c756f;
  --line: rgba(23, 33, 31, 0.12);
  --accent: #1f6a65;
  --accent-strong: #173f3b;
  --warm: #c76d3d;
  --shadow: 0 24px 70px rgba(26, 42, 38, 0.14);
  min-height: 100vh;
  padding: 6rem 1.5rem 3rem;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.68), rgba(255,255,255,0) 36%),
    radial-gradient(circle at 6% 18%, rgba(199,109,61,0.14), transparent 26rem),
    linear-gradient(180deg, var(--page-bg), #f8faf8 62%, #edf2ef);
  color: var(--ink);
}

.record-page--movies {
  --page-bg: #111820;
  --surface: #18222c;
  --surface-strong: #202c36;
  --ink: #edf4ed;
  --muted: #a4b2b0;
  --line: rgba(255, 255, 255, 0.12);
  --accent: #d9a64f;
  --accent-strong: #f1c15d;
  --warm: #58b6bd;
  --shadow: 0 28px 78px rgba(0, 0, 0, 0.32);
  background:
    radial-gradient(circle at 12% 14%, rgba(217,166,79,0.18), transparent 27rem),
    radial-gradient(circle at 90% 18%, rgba(88,182,189,0.16), transparent 28rem),
    linear-gradient(180deg, #0f151d, #151f27 54%, #10161c);
}

.record-shell {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: 1rem;
  width: min(1500px, 100%);
  margin: 0 auto;
}

.record-sidebar,
.record-panel,
.record-stat,
.record-search,
.record-sync,
.record-add {
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.record-sidebar {
  position: sticky;
  top: 5.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  height: calc(100vh - 7rem);
  min-height: 36rem;
  padding: 1rem 0.65rem;
  border-radius: 8px;
}

.brand-mark,
.record-nav__item {
  display: grid;
  place-items: center;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 8px;
}

.brand-mark {
  color: var(--surface);
  background: linear-gradient(135deg, var(--accent), var(--warm));
  font-size: 1.4rem;
}

.record-nav {
  display: grid;
  gap: 0.55rem;
  width: 100%;
}

.record-nav__item {
  color: var(--muted);
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.record-nav__item span {
  display: none;
}

.record-nav__item:hover,
.record-nav__item--active {
  color: var(--ink);
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  transform: translateY(-1px);
}

.record-sidebar__meter {
  margin-top: auto;
  writing-mode: vertical-rl;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--muted);
  font-size: 0.78rem;
}

.record-sidebar__meter strong {
  color: var(--ink);
  font-size: 0.9rem;
}

.record-main {
  min-width: 0;
}

.record-header {
  display: grid;
  grid-template-columns: minmax(18rem, 1fr) minmax(22rem, 34rem);
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
}

.record-heading h1 {
  margin: 0.35rem 0 0.5rem;
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 6vw, 5.5rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.record-heading p {
  max-width: 38rem;
  margin: 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
}

.record-eyebrow,
.detail-topline,
.panel-toolbar,
.record-actions,
.record-search,
.record-add,
.record-stat,
.record-row,
.detail-tags,
.detail-grid div,
.insight-heading,
.compact-actions button {
  display: flex;
  align-items: center;
}

.record-eyebrow {
  gap: 0.45rem;
  color: var(--accent-strong);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.record-action-stack {
  display: grid;
  gap: 0.45rem;
}

.record-actions {
  justify-content: flex-end;
  gap: 0.75rem;
}

.record-search {
  flex: 1;
  min-width: 15rem;
  gap: 0.55rem;
  height: 3rem;
  padding: 0 0.9rem;
  border-radius: 8px;
  color: var(--muted);
  box-shadow: none;
}

.record-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font: inherit;
}

.record-search input::placeholder {
  color: color-mix(in srgb, var(--muted) 72%, transparent);
}

.record-sync,
.record-add {
  flex: 0 0 auto;
  gap: 0.45rem;
  height: 3rem;
  padding: 0 1rem;
  border-radius: 8px;
  color: var(--surface);
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.record-sync {
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
}

.record-sync:disabled {
  cursor: progress;
  opacity: 0.68;
}

.record-add:hover {
  transform: translateY(-1px);
  filter: saturate(1.1);
}

.record-sync:not(:disabled):hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--accent) 12%, var(--surface));
}

.record-sync-meta {
  margin: 0;
  color: var(--muted);
  font-size: 0.78rem;
  text-align: right;
}

.record-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.record-stat {
  gap: 0.7rem;
  min-height: 5.25rem;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: none;
}

.record-stat > .el-icon {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 8px;
  color: var(--surface);
  background: linear-gradient(135deg, var(--warm), var(--accent));
}

.record-stat span {
  color: var(--muted);
  font-size: 0.85rem;
}

.record-stat strong {
  margin-left: auto;
  font-size: 2rem;
  line-height: 1;
}

.record-stat small {
  margin-left: 0.2rem;
  color: var(--muted);
  font-size: 0.82rem;
}

.record-content {
  display: grid;
  grid-template-columns: minmax(21rem, 0.9fr) minmax(28rem, 1.35fr) minmax(17rem, 0.65fr);
  gap: 1rem;
  align-items: stretch;
}

.record-panel,
.record-insights {
  min-width: 0;
}

.record-panel {
  border-radius: 8px;
  overflow: hidden;
}

.record-list-panel {
  padding: 1rem;
}

.panel-toolbar {
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.panel-toolbar h2,
.insight-heading h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 850;
}

.segmented-control {
  display: flex;
  max-width: 100%;
  padding: 0.25rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow-x: auto;
}

.segmented-control button {
  flex: 0 0 auto;
  min-width: 3.2rem;
  height: 2rem;
  border: 0;
  border-radius: 6px;
  padding: 0 0.65rem;
  color: var(--muted);
  background: transparent;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.segmented-control button.is-active {
  color: var(--surface);
  background: var(--accent);
}

.record-list {
  display: grid;
  gap: 0.7rem;
}

.record-empty {
  display: grid;
  place-items: center;
  min-height: 12rem;
  border: 1px dashed color-mix(in srgb, var(--muted) 34%, transparent);
  border-radius: 8px;
  padding: 1.25rem;
  color: var(--muted);
  text-align: center;
  line-height: 1.7;
}

.record-row {
  width: 100%;
  gap: 0.75rem;
  min-height: 5.35rem;
  padding: 0.7rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.record-row:hover,
.record-row--active {
  border-color: color-mix(in srgb, var(--accent) 34%, transparent);
  background: color-mix(in srgb, var(--accent) 9%, transparent);
}

.record-row:hover {
  transform: translateY(-1px);
}

.cover-art {
  position: relative;
  flex: 0 0 auto;
  width: 3.4rem;
  height: 4.25rem;
  border-radius: 6px;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(0,0,0,0.18), transparent 22%),
    linear-gradient(135deg, var(--cover), var(--cover-accent));
  box-shadow: 0 12px 22px rgba(0,0,0,0.18);
}

.cover-art span {
  position: absolute;
  right: 0.48rem;
  bottom: 0.48rem;
  width: 1.7rem;
  height: 0.45rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.74);
}

.record-page--movies .cover-art {
  border-radius: 5px;
  height: 4.7rem;
}

.record-row__body {
  display: grid;
  gap: 0.28rem;
  min-width: 0;
  flex: 1;
}

.record-row__title {
  overflow: hidden;
  color: var(--ink);
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-row__meta {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.83rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-track {
  display: block;
  width: 100%;
  height: 0.38rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--muted) 18%, transparent);
  overflow: hidden;
}

.progress-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--warm), var(--accent));
}

.record-row__score {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  align-self: flex-start;
  color: var(--accent-strong);
  font-size: 0.84rem;
  font-weight: 850;
}

.detail-panel {
  display: grid;
  grid-template-columns: minmax(12rem, 0.72fr) minmax(0, 1fr);
  min-height: 38rem;
  background: var(--surface-strong);
}

.detail-panel--empty {
  display: flex;
  min-height: 20rem;
}

.detail-cover {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 100%;
  padding: 1.25rem;
  overflow: hidden;
  color: #fff;
  background:
    linear-gradient(90deg, rgba(0,0,0,0.28), rgba(0,0,0,0) 34%),
    radial-gradient(circle at 72% 18%, rgba(255,255,255,0.2), transparent 11rem),
    linear-gradient(135deg, var(--cover), var(--cover-accent));
}

.detail-cover::after {
  content: "";
  position: absolute;
  inset: 1.25rem;
  border: 1px solid rgba(255,255,255,0.34);
  border-radius: 8px;
}

.detail-cover__spine {
  position: absolute;
  inset: 0 auto 0 0;
  width: 1.8rem;
  background: rgba(0,0,0,0.18);
}

.detail-cover__title {
  position: relative;
  z-index: 1;
  max-width: 12rem;
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 3vw, 2.8rem);
  line-height: 1.06;
  letter-spacing: 0;
}

.detail-copy {
  display: flex;
  flex-direction: column;
  padding: clamp(1.25rem, 3vw, 2rem);
}

.detail-topline {
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 800;
}

.detail-copy h2 {
  margin: 1.2rem 0 0.3rem;
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1;
  letter-spacing: 0;
}

.detail-creator {
  margin: 0 0 1.35rem;
  color: var(--accent-strong);
  font-weight: 800;
}

.detail-note {
  margin: 0;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.75;
}

.detail-tags {
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.4rem 0;
}

.detail-tags span,
.tag-cloud span {
  border: 1px solid color-mix(in srgb, var(--accent) 24%, transparent);
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  color: var(--accent-strong);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  font-size: 0.78rem;
  font-weight: 800;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: auto;
}

.detail-grid div {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.2rem 0.55rem;
  min-height: 5rem;
  padding: 0.9rem;
  border: 1px solid var(--line);
  border-radius: 8px;
}

.detail-grid .el-icon {
  grid-row: span 2;
  color: var(--accent);
  font-size: 1.1rem;
}

.detail-grid span {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 750;
}

.detail-grid strong {
  align-self: end;
  min-width: 0;
  font-size: 1.05rem;
}

.record-insights {
  display: grid;
  gap: 1rem;
}

.insight-block {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 1rem;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
}

.insight-heading {
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.insight-heading .el-icon {
  color: var(--accent);
}

.tempo-ring {
  display: grid;
  place-items: center;
  width: min(11rem, 100%);
  aspect-ratio: 1;
  margin: 0 auto 1rem;
  border: 0.9rem solid color-mix(in srgb, var(--accent) 16%, transparent);
  border-top-color: var(--warm);
  border-right-color: var(--accent);
  border-radius: 999px;
}

.tempo-ring span {
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1;
}

.tempo-ring small {
  color: var(--muted);
  font-weight: 800;
}

.insight-block p {
  margin: 0;
  color: var(--muted);
  text-align: center;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.compact-actions {
  display: grid;
  gap: 0.55rem;
}

.compact-actions button {
  justify-content: flex-start;
  gap: 0.55rem;
  height: 2.75rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 0 0.75rem;
  color: var(--ink);
  background: transparent;
  font-weight: 800;
  cursor: pointer;
}

.compact-actions button:hover {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}

@media (max-width: 1180px) {
  .record-content {
    grid-template-columns: minmax(20rem, 0.95fr) minmax(28rem, 1.35fr);
  }

  .record-insights {
    grid-column: 1 / -1;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .record-page {
    padding: 5.5rem 1rem 2rem;
  }

  .record-shell {
    grid-template-columns: 1fr;
  }

  .record-sidebar {
    position: static;
    flex-direction: row;
    width: 100%;
    height: auto;
    min-height: 0;
    padding: 0.75rem;
  }

  .record-nav {
    display: flex;
  }

  .record-nav__item {
    display: flex;
    width: auto;
    padding: 0 0.85rem;
    gap: 0.45rem;
  }

  .record-nav__item span {
    display: inline;
    font-weight: 800;
  }

  .record-sidebar__meter {
    writing-mode: initial;
  }

  .record-header,
  .record-content,
  .detail-panel {
    grid-template-columns: 1fr;
  }

  .record-actions {
    justify-content: stretch;
  }

  .record-stats,
  .record-insights {
    grid-template-columns: 1fr;
  }

  .detail-cover {
    min-height: 20rem;
  }
}

@media (max-width: 620px) {
  .record-actions,
  .panel-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .record-search {
    min-width: 0;
  }

  .record-add {
    justify-content: center;
    width: 100%;
  }

  .record-sync {
    justify-content: center;
    width: 100%;
  }

  .record-sync-meta {
    text-align: left;
  }

  .record-stats,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .record-row__score {
    display: none;
  }
}
</style>
