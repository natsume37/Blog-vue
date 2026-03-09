<template>
  <div class="article-admin space-y-6">
    <section class="article-hero rounded-[28px] border border-slate-200/80 bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-7">
      <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Content workspace</div>
          <h2 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">文章管理</h2>
          <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            统一管理文章、草稿和回收站内容。当前界面把筛选、批量操作和状态控制重新分层，减少编辑时的视觉负担。
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
            <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
            {{ currentFilterMeta.label }}
          </div>
          <el-button
            type="primary"
            size="large"
            class="!h-11 !rounded-full !border-none !bg-slate-900 !px-6 hover:!bg-slate-800"
            @click="$router.push('/admin/articles/new')"
          >
            <el-icon class="mr-2"><Plus /></el-icon>
            新建文章
          </el-button>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article v-for="card in overviewCards" :key="card.label" class="overview-card">
          <div class="overview-card__icon">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="min-w-0">
            <div class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{{ card.label }}</div>
            <div class="mt-2 text-3xl font-semibold text-slate-900">{{ card.value }}</div>
            <p class="mt-2 text-sm text-slate-500">{{ card.hint }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="rounded-[28px] border border-slate-200/80 bg-white/94 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div class="border-b border-slate-100 px-6 py-6">
        <div class="flex flex-col gap-5 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div class="grid gap-3 md:grid-cols-3">
            <button
              v-for="item in filterOptions"
              :key="item.value"
              class="filter-card text-left"
              :class="statusFilter === item.value ? 'filter-card-active' : 'filter-card-default'"
              @click="setStatusFilter(item.value)"
            >
              <div class="text-sm font-semibold text-slate-900">{{ item.label }}</div>
              <div class="mt-1 text-xs leading-6 text-slate-500">{{ item.description }}</div>
            </button>
          </div>

          <div class="batch-panel" :class="selectedIds.length ? 'batch-panel-active' : ''">
            <div class="flex flex-wrap items-center gap-3">
              <div class="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                <span class="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs text-white">
                  {{ selectedIds.length }}
                </span>
                已选文章
              </div>
              <div class="flex flex-wrap gap-2">
                <el-button size="small" @click="handleBatch('publish')" :disabled="!selectedIds.length">批量发布</el-button>
                <el-button size="small" @click="handleBatch('unpublish')" :disabled="!selectedIds.length">批量下线</el-button>
                <el-button size="small" @click="handleBatch('recycle')" :disabled="!selectedIds.length">移入回收站</el-button>
                <el-button size="small" @click="handleBatch('restore')" :disabled="!selectedIds.length">恢复文章</el-button>
                <el-button size="small" type="danger" plain @click="handleBatch('delete')" :disabled="!selectedIds.length">永久删除</el-button>
              </div>
            </div>
            <div class="text-xs text-slate-400">
              {{ selectedIds.length ? '已激活批量操作。危险动作仍会二次确认。' : '先勾选文章，再执行批量操作。' }}
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 py-5">
        <el-table
          :data="articles"
          v-loading="loading"
          row-key="id"
          class="article-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="48" />

          <el-table-column prop="title" label="文章" min-width="420">
            <template #default="{ row }">
              <div class="article-main">
                <div class="article-cover" :class="row.cover ? '' : 'article-cover-fallback'">
                  <img v-if="row.cover" :src="row.cover" alt="cover" class="h-full w-full object-cover" />
                  <span v-else>{{ (row.title || '文').slice(0, 1) }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="truncate text-[15px] font-semibold text-slate-900">{{ row.title }}</div>
                    <el-tag size="small" effect="plain" :type="visibilityTagType(row.visibility)">
                      {{ visibilityLabel(row.visibility) }}
                    </el-tag>
                    <span v-if="row.categoryName" class="meta-pill">{{ row.categoryName }}</span>
                    <span v-if="row.is_top" class="meta-pill meta-pill-dark">置顶</span>
                    <span v-if="row.is_recommend" class="meta-pill meta-pill-warm">推荐</span>
                    <span v-if="row.is_hidden" class="meta-pill meta-pill-muted">已隐藏</span>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-slate-500 line-clamp-2">
                    {{ row.summary || '暂无摘要，建议补充一段简洁摘要来提高列表可读性。' }}
                  </p>
                  <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>发布时间 {{ formatDate(row.createTime) }}</span>
                    <span>浏览 {{ row.viewCount }}</span>
                    <span>评论 {{ row.commentCount }}</span>
                    <span>点赞 {{ row.likeCount }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="状态控制" width="230">
            <template #default="{ row }">
              <div class="status-grid">
                <div class="status-item">
                  <span>发布</span>
                  <el-switch
                    v-model="row.is_published"
                    size="small"
                    style="--el-switch-on-color: #0f766e"
                    :loading="row.updating"
                    @change="handleStatusChange(row, 'is_published')"
                  />
                </div>
                <div class="status-item">
                  <span>隐藏</span>
                  <el-switch
                    v-model="row.is_hidden"
                    size="small"
                    style="--el-switch-on-color: #ea580c"
                    :loading="row.updating"
                    @change="handleStatusChange(row, 'is_hidden')"
                  />
                </div>
                <div class="status-item">
                  <span>置顶</span>
                  <el-switch
                    v-model="row.is_top"
                    size="small"
                    :loading="row.updating"
                    @change="handleStatusChange(row, 'is_top')"
                  />
                </div>
                <div class="status-item">
                  <span>推荐</span>
                  <el-switch
                    v-model="row.is_recommend"
                    size="small"
                    :loading="row.updating"
                    @change="handleStatusChange(row, 'is_recommend')"
                  />
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="数据" width="170">
            <template #default="{ row }">
              <div class="metric-stack">
                <div class="metric-row">
                  <span class="metric-row__icon metric-row__icon-blue"><el-icon><View /></el-icon></span>
                  <span class="metric-row__label">阅读</span>
                  <strong>{{ row.viewCount }}</strong>
                </div>
                <div class="metric-row">
                  <span class="metric-row__icon metric-row__icon-amber"><el-icon><ChatDotSquare /></el-icon></span>
                  <span class="metric-row__label">评论</span>
                  <strong>{{ row.commentCount }}</strong>
                </div>
                <div class="metric-row">
                  <span class="metric-row__icon metric-row__icon-rose"><el-icon><Star /></el-icon></span>
                  <span class="metric-row__label">点赞</span>
                  <strong>{{ row.likeCount }}</strong>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" align="right" fixed="right">
            <template #default="{ row }">
              <div class="flex justify-end gap-1">
                <el-button text type="primary" @click="$router.push(`/admin/articles/${row.id}`)">
                  <el-icon class="mr-1"><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button text @click="handleDuplicate(row)">
                  <el-icon class="mr-1"><CopyDocument /></el-icon>
                  复制
                </el-button>
                <el-button text type="danger" @click="handleDelete(row)">
                  <el-icon class="mr-1"><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>

          <template #empty>
            <div class="py-12 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <el-icon><Document /></el-icon>
              </div>
              <div class="mt-4 text-base font-semibold text-slate-700">当前筛选下还没有文章</div>
              <p class="mt-2 text-sm text-slate-400">可以切换筛选状态，或者直接创建一篇新文章。</p>
            </div>
          </template>
        </el-table>
      </div>

      <div class="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-sm text-slate-500">
          当前列表共 <span class="font-semibold text-slate-900">{{ total }}</span> 篇，
          本页显示 <span class="font-semibold text-slate-900">{{ articles.length }}</span> 篇。
        </div>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="fetchArticles"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Plus, View, ChatDotSquare, Star, Edit, Delete, CopyDocument, Document, Select } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as api from '../../api'

const articles = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const statusFilter = ref<'all' | 'draft' | 'recycle'>('all')
const selectedIds = ref<number[]>([])

const filterOptions = [
  { value: 'all' as const, label: '全部文章', description: '查看当前站点中的全部内容。' },
  { value: 'draft' as const, label: '草稿箱', description: '聚焦未发布内容，适合继续编辑。' },
  { value: 'recycle' as const, label: '回收站', description: '处理已移除文章，决定恢复或清理。' },
]

const currentFilterMeta = computed<(typeof filterOptions)[number]>(() => {
  return filterOptions.find(item => item.value === statusFilter.value) ?? filterOptions[0]!
})

const overviewCards = computed(() => [
  {
    label: '当前列表',
    value: total.value,
    hint: `${currentFilterMeta.value.label}中的总文章数`,
    icon: Document,
  },
  {
    label: '本页已发布',
    value: articles.value.filter(item => item.is_published).length,
    hint: '当前分页里已对外可见的文章',
    icon: Select,
  },
  {
    label: '本页推荐',
    value: articles.value.filter(item => item.is_recommend || item.is_top).length,
    hint: '包含推荐或置顶标记的内容',
    icon: Star,
  },
  {
    label: '当前选中',
    value: selectedIds.value.length,
    hint: selectedIds.value.length ? '可立即执行批量操作' : '选中文章后可批量处理',
    icon: View,
  },
])

const visibilityLabel = (value?: string) => {
  if (value === 'login') return '登录可见'
  if (value === 'private') return '仅管理员'
  return '公开'
}

const visibilityTagType = (value?: string) => {
  if (value === 'login') return 'warning'
  if (value === 'private') return 'danger'
  return 'success'
}

const formatDate = (value?: string) => {
  if (!value) return '--'
  return value.split(' ')[0]
}

const fetchArticles = async () => {
  loading.value = true
  try {
    const res: any = await api.getAdminArticles({
      current: currentPage.value,
      size: pageSize.value,
      status: statusFilter.value,
    })
    if (res.code === 200) {
      articles.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  currentPage.value = 1
  selectedIds.value = []
  fetchArticles()
}

const setStatusFilter = (value: 'all' | 'draft' | 'recycle') => {
  if (statusFilter.value === value) return
  statusFilter.value = value
  handleFilterChange()
}

const handleSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.map((row) => row.id)
}

const handleStatusChange = async (row: any, field: string) => {
  row.updating = true
  try {
    const payload: any = {}
    payload[field] = row[field]
    await api.updateArticle(row.id, payload)
    ElMessage.success('更新成功')
  } catch (error) {
    row[field] = !row[field]
    console.error(error)
    ElMessage.error('更新失败')
  } finally {
    row.updating = false
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '确定要删除这篇文章吗？此操作不可恢复。',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: '!bg-red-500 !border-red-500',
    }
  ).then(async () => {
    try {
      const res: any = await api.deleteArticle(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchArticles()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (error) {
      console.error(error)
    }
  })
}

const handleDuplicate = async (row: any) => {
  try {
    const res: any = await api.duplicateArticle(row.id)
    if (res.code === 200) {
      ElMessage.success('复制成功')
      fetchArticles()
    } else {
      ElMessage.error(res.msg || '复制失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('复制失败')
  }
}

const handleBatch = (action: 'publish' | 'unpublish' | 'recycle' | 'restore' | 'delete') => {
  const actionLabelMap: Record<string, string> = {
    publish: '批量发布',
    unpublish: '批量下线',
    recycle: '移入回收站',
    restore: '恢复文章',
    delete: '永久删除',
  }
  ElMessageBox.confirm(
    `确定要执行“${actionLabelMap[action]}”吗？`,
    '批量操作确认',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res: any = await api.batchOperateArticles({ ids: selectedIds.value, action })
      if (res.code === 200) {
        ElMessage.success(res.msg || '操作成功')
        selectedIds.value = []
        fetchArticles()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.article-admin {
  --admin-border: rgba(226, 232, 240, 0.9);
  --admin-muted: #64748b;
  --admin-text: #0f172a;
}

.article-hero {
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.12), transparent 28%),
    radial-gradient(circle at bottom left, rgba(15, 23, 42, 0.05), transparent 28%),
    rgba(255, 255, 255, 0.94);
}

.overview-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  border-radius: 22px;
  border: 1px solid var(--admin-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  padding: 1rem 1.1rem;
}

.overview-card__icon {
  display: inline-flex;
  height: 42px;
  width: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #eff6ff;
  color: #0284c7;
  box-shadow: inset 0 0 0 1px rgba(186, 230, 253, 0.8);
}

.filter-card {
  border-radius: 18px;
  border: 1px solid var(--admin-border);
  background: #fff;
  padding: 1rem 1.1rem;
  transition: all 0.2s ease;
}

.filter-card-default:hover {
  border-color: rgba(56, 189, 248, 0.35);
  transform: translateY(-1px);
}

.filter-card-active {
  border-color: rgba(56, 189, 248, 0.4);
  background: linear-gradient(135deg, rgba(240, 249, 255, 0.95), rgba(250, 250, 255, 0.98));
  box-shadow: 0 14px 32px rgba(14, 165, 233, 0.08);
}

.batch-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 22px;
  border: 1px solid var(--admin-border);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(255, 255, 255, 0.94));
  padding: 1rem 1.1rem;
  transition: all 0.2s ease;
}

.batch-panel-active {
  border-color: rgba(56, 189, 248, 0.32);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
}

.article-main {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 0.2rem 0;
}

.article-cover {
  display: flex;
  height: 64px;
  width: 64px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--admin-border);
  background: #f8fafc;
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 700;
}

.article-cover-fallback {
  background: linear-gradient(135deg, #e2e8f0, #f8fafc);
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  background: #eff6ff;
  color: #2563eb;
  padding: 0.22rem 0.56rem;
  font-size: 0.74rem;
  font-weight: 600;
}

.meta-pill-dark {
  background: #e2e8f0;
  color: #334155;
}

.meta-pill-warm {
  background: #fff7ed;
  color: #c2410c;
}

.meta-pill-muted {
  background: #f1f5f9;
  color: #64748b;
}

.status-grid {
  display: grid;
  gap: 8px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 14px;
  background: #f8fafc;
  padding: 0.55rem 0.75rem;
  font-size: 0.82rem;
  color: var(--admin-muted);
}

.metric-stack {
  display: grid;
  gap: 8px;
}

.metric-row {
  display: grid;
  grid-template-columns: 26px 1fr auto;
  align-items: center;
  gap: 8px;
  border-radius: 14px;
  background: #f8fafc;
  padding: 0.55rem 0.7rem;
  font-size: 0.82rem;
  color: var(--admin-muted);
}

.metric-row strong {
  color: var(--admin-text);
  font-size: 0.84rem;
}

.metric-row__icon {
  display: inline-flex;
  height: 22px;
  width: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
}

.metric-row__icon-blue {
  background: #eff6ff;
  color: #2563eb;
}

.metric-row__icon-amber {
  background: #fffbeb;
  color: #d97706;
}

.metric-row__icon-rose {
  background: #fff1f2;
  color: #e11d48;
}

.metric-row__label {
  color: var(--admin-muted);
}

:deep(.article-table) {
  --el-table-border-color: transparent;
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #fafcff;
  --el-table-text-color: #334155;
  --el-table-header-text-color: #475569;
}

:deep(.article-table .el-table__header th) {
  font-weight: 600;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

:deep(.article-table .el-table__row td) {
  border-bottom: 1px solid rgba(241, 245, 249, 0.95);
  padding-top: 14px;
  padding-bottom: 14px;
}

:deep(.article-table .el-table__inner-wrapper::before) {
  display: none;
}

:deep(.article-table .el-button.is-text) {
  border-radius: 9999px;
  padding-inline: 10px;
}
</style>
