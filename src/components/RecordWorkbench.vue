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
import {
  getBookRecords,
  getBookRecordStats,
  getBookReadingTimeStats,
  getMovieRecords,
  getMovieRecordStats,
  getWeReadSyncStatus,
  syncWeReadRecords,
} from '../api'
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
  visibility?: string
  readSeconds?: number
}

type BookStats = {
  monthly_count: number
  completion_rate: number
  note_count: number
  average_rating: number
  read_duration: string
  last_sync_at?: string | null
}

type BookTimeStats = {
  total_read_seconds: number
  total_read_duration: string
  day_average_seconds: number
  day_average_duration: string
  read_days: number
  active_days: number
  compare?: number
  book_count: number
  note_count: number
  read_distribution_word?: string
  daily: Array<{
    timestamp: number
    date?: string
    label: string
    read_seconds: number
    read_duration: string
  }>
  categories?: Array<{
    name: string
    parent_name?: string
    reading_count?: number
    read_seconds: number
    read_duration: string
    percent: number
  }>
  longest_books?: Array<{
    source_id?: string
    title: string
    author?: string
    cover?: string
    read_seconds: number
    read_duration: string
    tags?: string[]
  }>
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

type MovieStats = {
  monthly_count: number
  finished_count: number
  average_rating: number
  total_duration: string
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
const bookTimeStats = ref<BookTimeStats | null>(null)
const movieStats = ref<MovieStats | null>(null)
const bookLoading = ref(false)
const movieLoading = ref(false)
const bookApiLoaded = ref(false)
const movieApiLoaded = ref(false)
const movieApiRecords = ref<RecordItem[]>([])
const syncLoading = ref(false)
const syncStatus = ref<SyncStatus | null>(null)
const activeTimeRange = ref<'week' | 'month' | 'all'>('month')

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

const activeMovieRecords = computed(() => {
  if (!movieApiLoaded.value) return movieRecords
  return movieApiRecords.value
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

const visibilityLabel = (value?: string) => {
  if (value === 'login') return '登录可见'
  if (value === 'public') return '公开'
  return '仅管理员'
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
  visibility: String(item.visibility || 'private'),
  readSeconds: Number(item.read_seconds || 0),
})

const transformMovieRecord = (item: any): RecordItem => ({
  id: Number(item.id),
  title: String(item.title || '未命名影片'),
  creator: String(item.director || '未知导演'),
  status: String(item.status || '想看'),
  format: String(item.format || '电影'),
  progress: Number(item.progress || 0),
  rating: Number(item.rating || 0),
  date: formatDate(item.watched_at),
  duration: String(item.duration || '0 min'),
  paceLabel: `${String(item.duration || '0 min')} · ${visibilityLabel(item.visibility)}`,
  note: String(item.note || '暂无观影笔记'),
  tags: Array.isArray(item.tags) && item.tags.length ? item.tags.map(String) : ['电影'],
  color: String(item.color || '#2f5d7c'),
  accent: String(item.accent || '#d6a35d'),
  cover: String(item.cover || ''),
  visibility: String(item.visibility || 'private'),
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
        { label: '累计阅读', value: String(bookTimeStats.value?.total_read_duration || stats?.read_duration || '0分钟'), suffix: '', icon: Timer },
      ],
    }
  }

  const stats = movieStats.value
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
    records: activeMovieRecords.value,
    statuses: ['全部', '已看完', '想看', '重看中'],
    stats: [
      { label: '本月观影', value: String(stats?.monthly_count ?? 14), suffix: '部', icon: VideoPlay },
      { label: '平均评分', value: String(stats?.average_rating ?? 4.6), suffix: '/5', icon: StarFilled },
      { label: '已看完', value: String(stats?.finished_count ?? 7), suffix: '部', icon: EditPen },
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
const recordLoading = computed(() => props.kind === 'books' ? bookLoading.value : movieLoading.value)
const emptyMessage = computed(() => (
  props.kind === 'books'
    ? '暂无可见读书记录。管理员可以在后台调整图书可见范围，或稍后等待微信读书同步。'
    : '暂无可见电影记录。管理员可以在后台调整电影可见范围。'
))

const timeRangeOptions = [
  { label: '近7天', value: 'week' as const },
  { label: '近30天', value: 'month' as const },
  { label: '全部', value: 'all' as const },
]

const secondsToShortDuration = (seconds?: number) => {
  const total = Math.max(0, Math.round(seconds || 0))
  const hours = Math.floor(total / 3600)
  const minutes = Math.round((total % 3600) / 60)
  if (hours > 0 && minutes > 0) return `${hours}小时${minutes}分钟`
  if (hours > 0) return `${hours}小时`
  return `${minutes}分钟`
}

const bookTimeDaily = computed(() => {
  const daily = [...(bookTimeStats.value?.daily || [])].sort((a, b) => a.timestamp - b.timestamp)
  if (activeTimeRange.value === 'all' || daily.length === 0) return daily
  const newestItem = daily[daily.length - 1]
  const newest = newestItem ? newestItem.timestamp : 0
  const days = activeTimeRange.value === 'week' ? 7 : 30
  const start = newest - (days - 1) * 86400
  return daily.filter((item) => item.timestamp >= start)
})

const bookTimePeakSeconds = computed(() => Math.max(1, ...bookTimeDaily.value.map((item) => item.read_seconds)))
const bookTimeChartPoints = computed(() => bookTimeDaily.value.map((item, index) => ({
  ...item,
  index,
  height: item.read_seconds <= 0 ? 4 : Math.max(10, Math.round((item.read_seconds / bookTimePeakSeconds.value) * 100)),
})))

const bookTimeTotalSeconds = computed(() => {
  if (activeTimeRange.value === 'all') {
    return bookTimeStats.value?.total_read_seconds || 0
  }
  return bookTimeDaily.value.reduce((sum, item) => sum + Number(item.read_seconds || 0), 0)
})

const bookTimeActiveDays = computed(() => bookTimeDaily.value.filter((item) => item.read_seconds > 0).length)
const bookTimeAverageSeconds = computed(() => {
  if (activeTimeRange.value === 'all') return bookTimeStats.value?.day_average_seconds || 0
  return bookTimeActiveDays.value ? Math.round(bookTimeTotalSeconds.value / bookTimeActiveDays.value) : 0
})

const bookTimeSummaryCards = computed(() => [
  { label: '累计阅读', value: secondsToShortDuration(bookTimeTotalSeconds.value), meta: activeTimeRange.value === 'all' ? '全部同步数据' : '当前时间范围' },
  { label: '活跃天数', value: String(activeTimeRange.value === 'all' ? bookTimeStats.value?.active_days || 0 : bookTimeActiveDays.value), meta: '有阅读记录的天数' },
  { label: '日均阅读', value: secondsToShortDuration(bookTimeAverageSeconds.value), meta: bookTimeStats.value?.read_distribution_word || '阅读节奏' },
  { label: '书籍 / 笔记', value: `${bookTimeStats.value?.book_count || activeBookRecords.value.length} / ${bookTimeStats.value?.note_count || bookStats.value?.note_count || 0}`, meta: '本 / 条' },
])

const bookYearCards = computed(() => {
  const grouped = new Map<number, { year: number; seconds: number; days: number; peak: number }>()
  ;(bookTimeStats.value?.daily || []).forEach((item) => {
    const date = new Date((item.timestamp || 0) * 1000)
    const year = Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear()
    const current = grouped.get(year) || { year, seconds: 0, days: 0, peak: 0 }
    current.seconds += Number(item.read_seconds || 0)
    if (item.read_seconds > 0) current.days += 1
    current.peak = Math.max(current.peak, Number(item.read_seconds || 0))
    grouped.set(year, current)
  })
  return Array.from(grouped.values())
    .sort((a, b) => b.year - a.year)
    .slice(0, 3)
    .map((item) => ({
      ...item,
      duration: secondsToShortDuration(item.seconds),
      peakPercent: Math.max(8, Math.round((item.peak / Math.max(1, item.seconds)) * 100)),
    }))
})

const recentReadingBooks = computed(() => activeBookRecords.value.slice(0, 6))

const longestReadingBooks = computed(() => {
  const fromStats = (bookTimeStats.value?.longest_books || [])
    .filter((item) => item.read_seconds > 0)
    .map((item) => ({
      title: item.title,
      creator: item.author || '',
      cover: item.cover || '',
      color: '#2f6c8f',
      accent: '#c76d3d',
      readSeconds: item.read_seconds,
      duration: item.read_duration,
    }))
  if (fromStats.length) return fromStats.slice(0, 8)
  return activeBookRecords.value
    .filter((item) => (item.readSeconds || 0) > 0)
    .sort((a, b) => (b.readSeconds || 0) - (a.readSeconds || 0))
    .slice(0, 8)
    .map((item) => ({
      title: item.title,
      creator: item.creator,
      cover: item.cover || '',
      color: item.color,
      accent: item.accent,
      readSeconds: item.readSeconds || 0,
      duration: item.duration,
    }))
})

const categoryPreference = computed(() => {
  const fromStats = (bookTimeStats.value?.categories || [])
    .filter((item) => item.name)
    .slice(0, 6)
    .map((item) => ({
      name: item.name,
      value: item.read_duration || secondsToShortDuration(item.read_seconds),
      percent: Math.max(4, Math.min(100, item.percent || 0)),
    }))
  if (fromStats.length) return fromStats

  const tagCount = new Map<string, number>()
  activeBookRecords.value.forEach((record) => {
    record.tags.slice(0, 2).forEach((tag) => {
      if (tag && tag !== '微信读书') tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
    })
  })
  const max = Math.max(1, ...Array.from(tagCount.values()))
  return Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({
      name,
      value: `${count}本`,
      percent: Math.max(8, Math.round((count / max) * 100)),
    }))
})

const timeRangeLabel = computed(() => timeRangeOptions.find((item) => item.value === activeTimeRange.value)?.label || '近30天')

const routeLinks = [
  { label: '读书', to: '/records/books', icon: Reading },
  { label: '电影', to: '/records/movies', icon: Film },
]

const loadBookRecords = async () => {
  if (props.kind !== 'books') return
  bookLoading.value = true
  try {
    const [recordsResRaw, statsResRaw, timeStatsResRaw] = await Promise.all([
      getBookRecords({}, true),
      getBookRecordStats(true),
      getBookReadingTimeStats(true),
    ])
    const recordsRes: any = recordsResRaw
    const statsRes: any = statsResRaw
    const timeStatsRes: any = timeStatsResRaw
    if (recordsRes?.code === 200 && Array.isArray(recordsRes.data)) {
      bookApiRecords.value = recordsRes.data.map(transformBookRecord)
      bookApiLoaded.value = true
    }
    if (statsRes?.code === 200 && statsRes.data) {
      bookStats.value = statsRes.data
    }
    if (timeStatsRes?.code === 200 && timeStatsRes.data) {
      bookTimeStats.value = timeStatsRes.data
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

const loadMovieRecords = async () => {
  if (props.kind !== 'movies') return
  movieLoading.value = true
  try {
    const [recordsResRaw, statsResRaw] = await Promise.all([
      getMovieRecords({}, true),
      getMovieRecordStats(true),
    ])
    const recordsRes: any = recordsResRaw
    const statsRes: any = statsResRaw
    if (recordsRes?.code === 200 && Array.isArray(recordsRes.data)) {
      movieApiRecords.value = recordsRes.data.map(transformMovieRecord)
      movieApiLoaded.value = true
    }
    if (statsRes?.code === 200 && statsRes.data) {
      movieStats.value = statsRes.data
    }
  } catch (_error) {
    movieApiLoaded.value = false
  } finally {
    movieLoading.value = false
  }
}

const loadRecords = () => {
  if (props.kind === 'books') {
    loadBookRecords()
  } else {
    loadMovieRecords()
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
  loadRecords()
})

watch(() => props.kind, () => {
  activeStatus.value = '全部'
  selectedIndex.value = 0
  searchKeyword.value = ''
  loadRecords()
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

        <section v-if="props.kind === 'books'" class="book-time-dashboard" aria-label="阅读时长统计">
          <div class="time-dashboard-head">
            <div>
              <span class="record-eyebrow">
                <el-icon><DataAnalysis /></el-icon>
                WeRead Time
              </span>
              <h2>我的阅读</h2>
              <p>
                {{ timeRangeLabel }}累计 {{ secondsToShortDuration(bookTimeTotalSeconds) }}，
                日均 {{ secondsToShortDuration(bookTimeAverageSeconds) }}，
                活跃 {{ activeTimeRange === 'all' ? bookTimeStats?.active_days || 0 : bookTimeActiveDays }} 天。
              </p>
            </div>
            <div class="time-range-tabs" aria-label="阅读时间范围">
              <button
                v-for="item in timeRangeOptions"
                :key="item.value"
                type="button"
                :class="{ 'is-active': activeTimeRange === item.value }"
                @click="activeTimeRange = item.value"
              >
                {{ item.label }}
              </button>
            </div>
          </div>

          <div class="time-summary-grid">
            <article v-for="card in bookTimeSummaryCards" :key="card.label" class="time-summary-card">
              <span>{{ card.label }}</span>
              <strong>{{ card.value }}</strong>
              <small>{{ card.meta }}</small>
            </article>
          </div>

          <div v-if="bookYearCards.length" class="time-year-strip">
            <article v-for="year in bookYearCards" :key="year.year" class="time-year-card">
              <span>{{ year.year }}</span>
              <strong>{{ year.duration }}</strong>
              <small>{{ year.days }} 天阅读</small>
              <i :style="{ width: `${year.peakPercent}%` }"></i>
            </article>
          </div>

          <div class="time-dashboard-grid">
            <article class="time-card time-card--wide">
              <div class="time-card__head">
                <h3>阅读时长变化</h3>
                <span>{{ timeRangeLabel }}</span>
              </div>
              <div v-if="bookTimeChartPoints.length" class="time-bar-chart">
                <div v-for="point in bookTimeChartPoints" :key="point.timestamp" class="time-bar-chart__item">
                  <span>{{ point.read_duration }}</span>
                  <i :style="{ height: `${point.height}%` }"></i>
                  <small>{{ point.label }}</small>
                </div>
              </div>
              <div v-else class="book-time-empty">暂无阅读时长数据</div>
            </article>

            <article class="time-card">
              <div class="time-card__head">
                <h3>最近阅读</h3>
                <span>{{ recentReadingBooks.length }} 本</span>
              </div>
              <div class="recent-book-grid">
                <div v-for="book in recentReadingBooks" :key="book.id ?? book.title" class="recent-book">
                  <img v-if="book.cover" :src="book.cover" :alt="book.title" loading="lazy">
                  <span v-else class="mini-cover" :style="{ '--cover': book.color, '--cover-accent': book.accent }"></span>
                  <strong>{{ book.title }}</strong>
                  <small>{{ book.duration }}</small>
                </div>
              </div>
            </article>

            <article class="time-card time-card--wide">
              <div class="time-card__head">
                <h3>阅读最长</h3>
                <span>{{ longestReadingBooks.length }} 本</span>
              </div>
              <div v-if="longestReadingBooks.length" class="longest-book-list">
                <div v-for="book in longestReadingBooks" :key="book.title" class="longest-book">
                  <img v-if="book.cover" :src="book.cover" :alt="book.title" loading="lazy">
                  <span v-else class="mini-cover" :style="{ '--cover': book.color, '--cover-accent': book.accent }"></span>
                  <div>
                    <strong>{{ book.title }}</strong>
                    <small>{{ book.creator || '微信读书' }}</small>
                    <i :style="{ width: `${Math.max(8, Math.round((book.readSeconds / Math.max(1, longestReadingBooks[0]?.readSeconds || 1)) * 100))}%` }"></i>
                  </div>
                  <em>{{ book.duration }}</em>
                </div>
              </div>
              <div v-else class="book-time-empty">暂无单本阅读时长</div>
            </article>

            <article class="time-card">
              <div class="time-card__head">
                <h3>偏好分类</h3>
                <span>{{ categoryPreference.length }} 类</span>
              </div>
              <div v-if="categoryPreference.length" class="category-bars">
                <div v-for="item in categoryPreference" :key="item.name" class="category-bar">
                  <div>
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.value }}</span>
                  </div>
                  <i><b :style="{ width: `${item.percent}%` }"></b></i>
                </div>
              </div>
              <div v-else class="book-time-empty">暂无分类偏好</div>
            </article>
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

            <div v-if="recordLoading" class="record-empty">
              {{ props.kind === 'books' ? '正在读取微信读书缓存...' : '正在读取电影记录...' }}
            </div>
            <div v-else-if="!filteredRecords.length" class="record-empty">
              {{ emptyMessage }}
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
                  <span class="record-row__meta">
                    {{ item.creator }} · {{ item.format }}
                    <template v-if="userStore.isAdmin"> · {{ visibilityLabel(item.visibility) }}</template>
                  </span>
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
                <span>{{ userStore.isAdmin ? visibilityLabel(selectedRecord.visibility) : selectedRecord.date }}</span>
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
              <p class="detail-note">{{ emptyMessage }}</p>
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.book-time-dashboard {
  display: grid;
  gap: 0.85rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(143, 190, 180, 0.32);
  border-radius: 8px;
  padding: 1rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(247, 253, 251, 0.88)),
    linear-gradient(135deg, rgba(115, 203, 218, 0.08), rgba(255, 183, 104, 0.1));
  box-shadow: 0 18px 50px rgba(26, 42, 38, 0.1);
}

.time-dashboard-head,
.time-card__head,
.time-summary-card,
.time-year-card,
.category-bar div,
.longest-book,
.recent-book {
  display: flex;
  align-items: center;
}

.time-dashboard-head {
  justify-content: space-between;
  gap: 1rem;
}

.time-dashboard-head h2 {
  margin: 0.35rem 0 0.35rem;
  color: var(--ink);
  font-size: clamp(1.55rem, 3vw, 2.2rem);
  line-height: 1.05;
}

.time-dashboard-head p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.time-range-tabs {
  display: flex;
  flex: 0 0 auto;
  gap: 0.3rem;
  border: 1px solid rgba(31, 106, 101, 0.12);
  border-radius: 999px;
  padding: 0.25rem;
  background: rgba(255, 255, 255, 0.76);
}

.time-range-tabs button {
  min-width: 4.1rem;
  height: 2.15rem;
  border: 0;
  border-radius: 999px;
  padding: 0 0.8rem;
  color: var(--muted);
  background: transparent;
  font-weight: 850;
  cursor: pointer;
}

.time-range-tabs button.is-active {
  color: #fff;
  background: linear-gradient(135deg, #21a7c9, #247c74);
  box-shadow: 0 10px 22px rgba(33, 167, 201, 0.22);
}

.time-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.time-summary-card,
.time-year-card,
.time-card {
  border: 1px solid rgba(143, 190, 180, 0.28);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 28px rgba(22, 61, 64, 0.07);
}

.time-summary-card {
  align-items: flex-start;
  flex-direction: column;
  gap: 0.3rem;
  min-height: 5.8rem;
  padding: 0.85rem;
}

.time-summary-card span,
.time-summary-card small,
.time-year-card span,
.time-year-card small,
.time-card__head span {
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.time-summary-card strong {
  color: #0f3432;
  font-size: clamp(1.35rem, 2vw, 1.9rem);
  line-height: 1.1;
}

.time-year-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
}

.time-year-card {
  position: relative;
  align-items: flex-start;
  flex-direction: column;
  gap: 0.22rem;
  min-height: 6rem;
  padding: 0.9rem;
  overflow: hidden;
}

.time-year-card strong {
  color: var(--accent-strong);
  font-size: 1.2rem;
}

.time-year-card i {
  position: absolute;
  right: 0.9rem;
  bottom: 0.8rem;
  height: 2.4rem;
  max-width: calc(100% - 1.8rem);
  border-radius: 999px 999px 8px 8px;
  background: linear-gradient(180deg, #2fc5ef, #8ad9ee);
  opacity: 0.72;
}

.time-dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(18rem, 0.88fr);
  gap: 0.85rem;
}

.time-card {
  min-width: 0;
  padding: 1rem;
}

.time-card--wide {
  grid-column: span 1;
}

.time-card__head {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.time-card__head h3 {
  margin: 0;
  color: #102c2b;
  font-size: 1rem;
  font-weight: 900;
}

.time-bar-chart {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(1.35rem, 1fr));
  gap: 0.35rem;
  min-height: 15rem;
  overflow-x: auto;
}

.time-bar-chart__item {
  display: grid;
  grid-template-rows: 1.35rem 11.5rem 1.25rem;
  gap: 0.28rem;
  min-width: 1.35rem;
  text-align: center;
}

.time-bar-chart__item span,
.time-bar-chart__item small {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time-bar-chart__item i {
  display: block;
  align-self: end;
  width: 100%;
  border-radius: 999px 999px 5px 5px;
  background: linear-gradient(180deg, #29c0f0 0%, #62d1ee 48%, #b9ebf4 100%);
  box-shadow: inset 0 -14px 24px rgba(15, 108, 140, 0.12);
}

.recent-book-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.recent-book {
  align-items: stretch;
  flex-direction: column;
  min-width: 0;
}

.recent-book img,
.recent-book .mini-cover {
  width: 100%;
  aspect-ratio: 0.72;
  border-radius: 7px;
  object-fit: cover;
  box-shadow: 0 12px 20px rgba(15, 44, 42, 0.14);
}

.mini-cover {
  display: block;
  background:
    linear-gradient(90deg, rgba(0,0,0,0.18), transparent 22%),
    linear-gradient(135deg, var(--cover), var(--cover-accent));
}

.recent-book strong {
  overflow: hidden;
  margin-top: 0.55rem;
  color: var(--ink);
  font-size: 0.76rem;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-book small {
  color: var(--muted);
  font-size: 0.7rem;
}

.longest-book-list,
.category-bars {
  display: grid;
  gap: 0.65rem;
}

.longest-book {
  gap: 0.75rem;
  min-width: 0;
}

.longest-book img,
.longest-book .mini-cover {
  flex: 0 0 auto;
  width: 3.05rem;
  height: 4.1rem;
  border-radius: 6px;
  object-fit: cover;
}

.longest-book div {
  display: grid;
  flex: 1;
  gap: 0.26rem;
  min-width: 0;
}

.longest-book strong {
  overflow: hidden;
  color: var(--ink);
  font-size: 0.88rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.longest-book small,
.longest-book em {
  color: var(--muted);
  font-size: 0.75rem;
  font-style: normal;
  font-weight: 800;
}

.longest-book i,
.category-bar i {
  display: block;
  height: 0.55rem;
  border-radius: 999px;
  background: rgba(95, 202, 221, 0.16);
  overflow: hidden;
}

.longest-book i {
  background: linear-gradient(90deg, #bceff6, #f4fbfd);
}

.longest-book i,
.category-bar b {
  max-width: 100%;
}

.longest-book i::before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1ab8e7, #9ae6f3);
}

.category-bar {
  display: grid;
  gap: 0.38rem;
}

.category-bar div {
  justify-content: space-between;
  gap: 0.8rem;
}

.category-bar strong {
  overflow: hidden;
  color: var(--ink);
  font-size: 0.86rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-bar span {
  flex: 0 0 auto;
  color: var(--muted);
  font-size: 0.74rem;
  font-weight: 800;
}

.category-bar b {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffb15e, #e879b7, #7d7cf0);
}

.book-time-empty {
  display: grid;
  place-items: center;
  min-height: 10rem;
  border: 1px dashed color-mix(in srgb, var(--muted) 32%, transparent);
  border-radius: 8px;
  color: var(--muted);
}

.record-content {
  display: grid;
  grid-template-columns: minmax(21rem, 0.9fr) minmax(28rem, 1.35fr) minmax(17rem, 0.65fr);
  gap: 1rem;
  align-items: start;
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
  display: flex;
  flex-direction: column;
  align-self: start;
  max-height: min(74vh, 56rem);
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
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.25rem;
  scrollbar-gutter: stable;
}

.record-list::-webkit-scrollbar {
  width: 0.45rem;
}

.record-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 38%, transparent);
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
  align-self: start;
  min-height: clamp(34rem, 66vh, 42rem);
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
  min-height: 0;
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
  overflow-wrap: anywhere;
  font-size: clamp(1.9rem, 3.4vw, 3.05rem);
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
  align-self: start;
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

@media (min-width: 1181px) {
  .detail-panel,
  .record-insights {
    position: sticky;
    top: 5.5rem;
  }
}

@media (min-width: 901px) and (max-width: 1180px) {
  .detail-panel {
    position: sticky;
    top: 5.5rem;
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
  .book-time-dashboard,
  .time-dashboard-head,
  .time-dashboard-grid,
  .detail-panel {
    grid-template-columns: 1fr;
  }

  .time-dashboard-head {
    align-items: stretch;
    flex-direction: column;
  }

  .time-range-tabs,
  .time-summary-grid,
  .time-year-strip {
    overflow-x: auto;
  }

  .time-summary-grid,
  .time-year-strip {
    grid-template-columns: repeat(4, minmax(10.5rem, 1fr));
  }

  .time-year-strip {
    grid-template-columns: repeat(3, minmax(10.5rem, 1fr));
  }

  .record-list-panel {
    max-height: none;
  }

  .record-list {
    overflow: visible;
    padding-right: 0;
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

  .time-bar-chart__item span {
    display: none;
  }

  .time-bar-chart__item {
    grid-template-rows: 6rem 1.3rem;
  }

  .recent-book-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
