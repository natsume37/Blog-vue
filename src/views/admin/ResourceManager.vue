<template>
  <div class="p-6 h-full flex flex-col bg-slate-50/80">
    <!-- 顶部工具栏 -->
    <div class="mb-4 rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div class="space-y-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.28em] text-sky-500">Resource Lab</div>
            <h2 class="mt-2 text-2xl font-bold text-slate-800">图库管理</h2>
            <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-500">支持拖拽上传、粘贴截图、批量整理与全屏预览。现在可以直接把素材流转成文章内容或封面资源。</p>
          </div>

          <div
            class="rounded-3xl border border-dashed px-4 py-4 transition-all duration-300"
            :class="dragActive ? 'border-sky-400 bg-sky-50 shadow-[0_12px_30px_rgba(14,165,233,0.12)]' : 'border-slate-200 bg-slate-50/80'"
            @dragenter.prevent="handleDragEnter"
            @dragover.prevent="handleDragEnter"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div class="text-sm font-semibold text-slate-700">拖拽文件到这里，或直接粘贴截图上传</div>
                <div class="mt-1 text-xs leading-6 text-slate-500">当前页面已监听 Ctrl/Cmd + V。图片、视频、音频会自动识别并落到对应目录。</div>
              </div>
              <div class="flex flex-wrap gap-2">
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleUpload"
                  multiple
                >
                  <el-button type="primary" :loading="uploading">
                    <el-icon class="mr-1"><Upload /></el-icon> 上传文件
                  </el-button>
                </el-upload>
                <div class="rounded-full bg-slate-900/5 px-3 py-2 text-xs font-medium text-slate-600">
                  {{ uploading ? '上传中...' : '拖拽 / 粘贴 / 点击上传' }}
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <el-radio-group v-model="filterType" size="small" @change="handleFilterChange">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="img">图片</el-radio-button>
              <el-radio-button label="video">视频</el-radio-button>
              <el-radio-button label="audio">音频</el-radio-button>
            </el-radio-group>
            <el-input
              v-model="keyword"
              placeholder="搜索文件名或 key"
              clearable
              style="width: 240px"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2 xl:max-w-[20rem] xl:justify-end">
          <el-button @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleSyncQiniu" :loading="syncing">
            同步七牛
          </el-button>
          <el-button type="danger" plain :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            批量删除({{ selectedIds.length }})
          </el-button>
          <el-button @click="store.fetchData()" :loading="store.loading" circle>
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 资源网格 -->
    <div class="flex-1 overflow-y-auto rounded-[24px] border border-slate-200/70 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]" v-loading="store.loading">
      <ResourceGrid 
        :items="store.items" 
        :selected-ids="selectedIds"
        @select="handleSelect"
        @delete="handleDelete"
        @view-refs="handleViewReferences"
        @image-error="handleImageError"
      />
    </div>

    <!-- 分页 -->
    <div class="mt-4 flex justify-center rounded-[22px] border border-slate-200/70 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
      <el-pagination 
        layout="prev, pager, next, sizes, total" 
        :total="store.total"
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :page-sizes="[24, 48, 96]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <el-drawer
      v-model="refDrawerVisible"
      title="资源引用详情"
      size="460px"
      :with-header="true"
    >
      <div class="text-sm text-gray-500 mb-3">资源：{{ refResourceName }}</div>
      <div v-loading="refLoading">
        <el-empty v-if="!refLoading && refArticles.length === 0" description="暂无文章引用" />
        <div v-else class="space-y-2">
          <div
            v-for="article in refArticles"
            :key="article.id"
            class="flex items-center justify-between rounded border border-gray-100 px-3 py-2"
          >
            <div class="truncate text-sm text-gray-700">{{ article.title }}</div>
            <el-button link type="primary" @click="goEditArticle(article.id)">编辑</el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useResourceStore, type ResourceItem } from '../../stores/resource'
import { extractClipboardFiles, uploadBatchToQiniu } from '../../utils/upload'
import ResourceGrid from '../../components/ResourceGrid.vue'

const store = useResourceStore()
const router = useRouter()

const filterType = ref('')
const selectedIds = ref<number[]>([])
const currentPage = ref(1)
const currentPageSize = ref(24)
const keyword = ref('')
const syncing = ref(false)
const uploading = ref(false)
const dragActive = ref(false)
const dragDepth = ref(0)
const refDrawerVisible = ref(false)
const refLoading = ref(false)
const refResourceName = ref('')
const refArticles = ref<{ id: number; title: string }[]>([])

// 同步 store 的分页状态
watch(() => store.page, (val) => { currentPage.value = val })
watch(() => store.pageSize, (val) => { currentPageSize.value = val })

onMounted(() => {
  store.setPageSize(24)
  store.fetchData()
  window.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
})

const handleFilterChange = () => {
  store.setFilter(filterType.value)
}

const handleSearch = () => {
  store.setKeyword(keyword.value.trim())
}

const handlePageChange = (page: number) => {
  store.setPage(page)
}

const handleSizeChange = (size: number) => {
  store.setPageSize(size)
}

const handleSelect = (item: ResourceItem) => {
  if (selectedIds.value.includes(item.id)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
  } else {
    selectedIds.value = [...selectedIds.value, item.id]
  }
}

const handleDelete = async (item: ResourceItem) => {
  try {
    const refRes: any = await store.getReferences(item.id)
    const refCount = refRes?.data?.article_refs?.length || 0
    let force = false
    let message = '确定删除该资源？此操作将同时删除七牛云上的文件。'
    if (refCount > 0) {
      force = true
      message = `该资源被 ${refCount} 篇文章引用，继续删除会导致文章资源失效。确定强制删除吗？`
    }

    await ElMessageBox.confirm(message, '警告', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await store.removeResource(item.id, force)
    ElMessage.success('删除成功')
    selectedIds.value = selectedIds.value.filter((id) => id !== item.id)
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedIds.value.length} 个资源吗？此操作将同步删除七牛文件。`,
      '批量删除确认',
      { type: 'warning' }
    )
    const res: any = await store.removeResources(selectedIds.value, false)
    const skipped = res?.data?.skipped_refs?.length || 0
    if (skipped > 0) {
      ElMessage.warning(`批量删除完成，${skipped} 个资源因被文章引用而跳过`)
    } else {
      ElMessage.success('批量删除成功')
    }
    selectedIds.value = []
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSyncQiniu = async () => {
  syncing.value = true
  try {
    const res: any = await store.syncQiniu('', 1000)
    ElMessage.success(res?.msg || '同步完成')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '同步失败')
  } finally {
    syncing.value = false
  }
}

const handleImageError = async (_event: Event, item: ResourceItem) => {
  await store.refreshItemUrl(item)
}

const handleViewReferences = async (item: ResourceItem) => {
  refDrawerVisible.value = true
  refLoading.value = true
  refResourceName.value = item.filename
  refArticles.value = []
  try {
    const res: any = await store.getReferences(item.id)
    refArticles.value = res?.data?.article_refs || []
  } catch {
    ElMessage.error('加载引用详情失败')
  } finally {
    refLoading.value = false
  }
}

const goEditArticle = (id: number) => {
  router.push(`/admin/articles/${id}`)
}

const uploadFiles = async (files: File[] | FileList) => {
  const normalizedFiles = Array.from(files || []).filter((file): file is File => Boolean(file))
  if (normalizedFiles.length === 0) {
    return
  }

  uploading.value = true
  try {
    await uploadBatchToQiniu(normalizedFiles)
    ElMessage.success(`已上传 ${normalizedFiles.length} 个文件`)
    await store.fetchData()
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

const handleUpload = async (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return

  await uploadFiles([rawFile])
}

const handlePaste = async (event: ClipboardEvent) => {
  const files = extractClipboardFiles(event)
  if (files.length === 0) {
    return
  }

  event.preventDefault()
  await uploadFiles(files)
}

const handleDragEnter = () => {
  dragDepth.value += 1
  dragActive.value = true
}

const handleDragLeave = () => {
  dragDepth.value = Math.max(0, dragDepth.value - 1)
  if (dragDepth.value === 0) {
    dragActive.value = false
  }
}

const handleDrop = async (event: DragEvent) => {
  dragDepth.value = 0
  dragActive.value = false
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) {
    return
  }

  await uploadFiles(files)
}
</script>
