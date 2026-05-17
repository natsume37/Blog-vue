<template>
  <div class="record-visibility-admin space-y-6">
    <section class="visibility-hero">
      <div>
        <div class="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Access control</div>
        <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">记录权限</h2>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
          控制读书记录和电影记录对外展示范围。公开内容所有访客可见，登录可见只对站内用户开放，仅管理员用于私密记录和草稿式沉淀。
        </p>
      </div>
      <el-button :loading="loading" class="!rounded-full" @click="loadRecords">
        <el-icon class="mr-1"><Refresh /></el-icon>
        刷新
      </el-button>
    </section>

    <section class="visibility-toolbar">
      <div class="visibility-tabs" role="tablist" aria-label="记录类型">
        <button
          v-for="item in kindTabs"
          :key="item.value"
          type="button"
          :class="{ 'is-active': activeKind === item.value }"
          @click="activeKind = item.value"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </button>
      </div>

      <label class="visibility-search">
        <el-icon><Search /></el-icon>
        <input v-model="keyword" type="search" placeholder="搜索标题 / 作者 / 导演 / 标签">
      </label>
    </section>

    <section class="visibility-summary">
      <article v-for="card in summaryCards" :key="card.key" class="summary-card">
        <el-icon><component :is="card.icon" /></el-icon>
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </article>
    </section>

    <section class="visibility-table-shell">
      <el-table :data="filteredRows" v-loading="loading" row-key="id" class="visibility-table">
        <el-table-column label="记录" min-width="360">
          <template #default="{ row }">
            <div class="record-cell">
              <div class="record-cover" :style="{ '--cover': row.color || '#174f3b', '--accent': row.accent || '#c8763d' }">
                {{ String(row.title || '记').slice(0, 1) }}
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <strong class="truncate text-[15px] text-slate-900">{{ row.title }}</strong>
                  <el-tag size="small" effect="plain" :type="visibilityType(row.visibility)">
                    {{ visibilityLabel(row.visibility) }}
                  </el-tag>
                  <el-tag v-if="activeKind === 'books' && row.is_private" size="small" type="danger" effect="plain">
                    微信读书私密
                  </el-tag>
                </div>
                <p class="mt-2 text-sm leading-6 text-slate-500">
                  {{ activeKind === 'books' ? row.author || '未知作者' : row.director || '未知导演' }}
                  · {{ row.status }}
                  · {{ activeKind === 'books' ? row.read_duration : row.duration }}
                </p>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="标签" min-width="220">
          <template #default="{ row }">
            <div class="tag-line">
              <span v-for="tag in normalizedTags(row.tags)" :key="tag">{{ tag }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="谁可见" width="220" fixed="right">
          <template #default="{ row }">
            <el-select
              :model-value="row.visibility || 'public'"
              :disabled="row.updating"
              size="large"
              class="w-full"
              @change="handleSelectVisibility(row, $event)"
            >
              <el-option
                v-for="item in visibilityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <template #empty>
          <div class="py-12 text-center text-slate-500">
            当前筛选下没有记录。
          </div>
        </template>
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Film, Lock, Reading, Refresh, Search, User, View } from '@element-plus/icons-vue'
import {
  getAdminBookRecords,
  getAdminMovieRecords,
  updateBookRecordVisibility,
  updateMovieRecordVisibility,
} from '../../api'

type RecordKind = 'books' | 'movies'

type ManagedRecord = {
  id: number
  title: string
  author?: string
  director?: string
  status?: string
  read_duration?: string
  duration?: string
  tags?: string[]
  color?: string
  accent?: string
  visibility?: string
  is_private?: boolean
  updating?: boolean
}

const activeKind = ref<RecordKind>('books')
const loading = ref(false)
const keyword = ref('')
const bookRows = ref<ManagedRecord[]>([])
const movieRows = ref<ManagedRecord[]>([])

const kindTabs = [
  { value: 'books' as const, label: '图书记录', icon: Reading },
  { value: 'movies' as const, label: '电影记录', icon: Film },
]

const visibilityOptions = [
  { value: 'public', label: '公开' },
  { value: 'login', label: '登录用户可见' },
  { value: 'private', label: '仅管理员可见' },
]

const activeRows = computed(() => activeKind.value === 'books' ? bookRows.value : movieRows.value)
const filteredRows = computed(() => {
  const value = keyword.value.trim().toLowerCase()
  if (!value) return activeRows.value
  return activeRows.value.filter((row) => [
    row.title,
    row.author,
    row.director,
    row.status,
    ...(row.tags || []),
  ].join(' ').toLowerCase().includes(value))
})

const summaryCards = computed(() => [
  { key: 'total', label: '全部记录', value: activeRows.value.length, icon: View },
  { key: 'public', label: '公开', value: countByVisibility('public'), icon: View },
  { key: 'login', label: '登录可见', value: countByVisibility('login'), icon: User },
  { key: 'private', label: '仅管理员', value: countByVisibility('private'), icon: Lock },
])

const countByVisibility = (value: string) => activeRows.value.filter((row) => (row.visibility || 'public') === value).length
const normalizedTags = (tags?: string[]) => (Array.isArray(tags) && tags.length ? tags.slice(0, 4) : ['未标记'])

const visibilityLabel = (value?: string) => {
  if (value === 'login') return '登录用户可见'
  if (value === 'private') return '仅管理员可见'
  return '公开'
}

const visibilityType = (value?: string) => {
  if (value === 'login') return 'warning'
  if (value === 'private') return 'danger'
  return 'success'
}

const loadRecords = async () => {
  loading.value = true
  try {
    const [bookResRaw, movieResRaw] = await Promise.all([
      getAdminBookRecords({}),
      getAdminMovieRecords({}),
    ])
    const bookRes: any = bookResRaw
    const movieRes: any = movieResRaw
    if (bookRes?.code === 200 && Array.isArray(bookRes.data)) {
      bookRows.value = bookRes.data
    }
    if (movieRes?.code === 200 && Array.isArray(movieRes.data)) {
      movieRows.value = movieRes.data
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('记录权限加载失败')
  } finally {
    loading.value = false
  }
}

const handleVisibilityChange = async (row: ManagedRecord, value: string) => {
  const previous = row.visibility || 'public'
  row.updating = true
  try {
    const res: any = activeKind.value === 'books'
      ? await updateBookRecordVisibility(row.id, value)
      : await updateMovieRecordVisibility(row.id, value)
    if (res?.code === 200 && res.data) {
      row.visibility = res.data.visibility || value
      ElMessage.success('可见性已更新')
    } else {
      row.visibility = previous
      ElMessage.error(res?.msg || '可见性更新失败')
    }
  } catch (error) {
    row.visibility = previous
    console.error(error)
    ElMessage.error('可见性更新失败')
  } finally {
    row.updating = false
  }
}

const handleSelectVisibility = (row: ManagedRecord, value: unknown) => {
  handleVisibilityChange(row, String(value))
}

watch(activeKind, () => {
  keyword.value = ''
})

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.record-visibility-admin {
  --record-border: rgba(226, 232, 240, 0.92);
  --record-text: #0f172a;
  --record-muted: #64748b;
  --record-green: #145c43;
}

.visibility-hero,
.visibility-toolbar,
.visibility-table-shell {
  border: 1px solid var(--record-border);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

.visibility-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
}

.visibility-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
}

.visibility-tabs {
  display: flex;
  gap: 0.5rem;
  border-radius: 18px;
  background: #f8fafc;
  padding: 0.35rem;
}

.visibility-tabs button,
.visibility-search,
.summary-card,
.record-cell {
  display: flex;
  align-items: center;
}

.visibility-tabs button {
  gap: 0.45rem;
  min-height: 2.55rem;
  border: 0;
  border-radius: 14px;
  padding: 0 1rem;
  color: var(--record-muted);
  background: transparent;
  font-weight: 700;
  cursor: pointer;
}

.visibility-tabs button.is-active {
  color: #fff;
  background: var(--record-green);
}

.visibility-search {
  flex: 1;
  max-width: 25rem;
  gap: 0.5rem;
  min-height: 2.75rem;
  border: 1px solid var(--record-border);
  border-radius: 16px;
  padding: 0 0.85rem;
  color: var(--record-muted);
  background: #fff;
}

.visibility-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
}

.visibility-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.summary-card {
  gap: 0.75rem;
  border: 1px solid var(--record-border);
  border-radius: 20px;
  padding: 1rem;
  background: linear-gradient(180deg, #fff, #f8fafc);
}

.summary-card .el-icon {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 14px;
  color: var(--record-green);
  background: #e6f3ec;
}

.summary-card span {
  color: var(--record-muted);
  font-size: 0.85rem;
  font-weight: 700;
}

.summary-card strong {
  margin-left: auto;
  color: var(--record-text);
  font-size: 1.8rem;
  line-height: 1;
}

.visibility-table-shell {
  padding: 1rem;
}

.record-cell {
  gap: 0.85rem;
}

.record-cover {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 3.4rem;
  height: 4.25rem;
  border-radius: 12px;
  color: #fff;
  background:
    linear-gradient(90deg, rgba(0, 0, 0, 0.2), transparent 26%),
    linear-gradient(135deg, var(--cover), var(--accent));
  font-weight: 900;
}

.tag-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tag-line span {
  border-radius: 999px;
  background: #f1f5f9;
  padding: 0.3rem 0.65rem;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
}

:deep(.visibility-table) {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #fbfdfc;
}

:deep(.visibility-table .el-table__header th) {
  border-bottom: 1px solid var(--record-border);
  color: #475569;
  font-weight: 700;
}

:deep(.visibility-table .el-table__row td) {
  border-bottom: 1px solid rgba(241, 245, 249, 0.95);
  padding-top: 14px;
  padding-bottom: 14px;
}

@media (max-width: 900px) {
  .visibility-hero,
  .visibility-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .visibility-search {
    max-width: none;
  }

  .visibility-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .visibility-tabs {
    overflow-x: auto;
  }

  .visibility-summary {
    grid-template-columns: 1fr;
  }
}
</style>
