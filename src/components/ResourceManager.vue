<template>
  <!-- 弹窗模式 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="800px"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
  >
    <div class="flex flex-col" style="height: 500px;">
      <!-- 工具栏 -->
      <div class="flex justify-between items-center mb-3 px-1">
        <el-radio-group v-model="localFilter" size="small" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="img">图片</el-radio-button>
          <el-radio-button label="video">视频</el-radio-button>
          <el-radio-button label="audio">音频</el-radio-button>
        </el-radio-group>
        
        <el-upload
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleUpload"
          multiple
        >
          <el-button type="primary" size="small" :loading="uploading">
            <el-icon class="mr-1"><Upload /></el-icon> 上传
          </el-button>
        </el-upload>
      </div>

      <div
        class="mb-3 rounded-2xl border border-dashed px-4 py-3 transition-all duration-300"
        :class="dragActive ? 'border-sky-400 bg-sky-50 shadow-sm' : 'border-slate-200 bg-white/80'"
        @dragenter.prevent="handleDragEnter"
        @dragover.prevent="handleDragEnter"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="text-sm font-semibold text-slate-700">拖拽文件到这里，或直接粘贴截图上传</div>
            <div class="mt-1 text-xs leading-6 text-slate-500">当前弹窗打开时支持 Ctrl/Cmd + V。图片、视频、音频会自动归类到图库。</div>
          </div>
          <div class="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-600">
            {{ uploading ? '上传中...' : '拖拽 / 粘贴 / 点击上传' }}
          </div>
        </div>
      </div>

      <!-- 资源网格 -->
      <div class="flex-1 overflow-y-auto bg-gray-50 rounded-lg" v-loading="store.loading">
        <ResourceGrid 
          :items="store.items" 
          :selected-ids="selectedId ? [selectedId] : []"
          @select="handleSelect"
          @delete="handleDelete"
          @view-refs="handleViewRefs"
          @image-error="handleImageError"
        />
      </div>
      
      <!-- 分页 -->
      <div class="mt-3 flex justify-center">
        <el-pagination 
          small
          layout="prev, pager, next" 
          :total="store.total"
          :current-page="store.page"
          :page-size="store.pageSize"
          @current-change="store.setPage"
        />
      </div>
    </div>
    
    <template #footer>
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-400">
          已选: {{ selectedItem?.filename || '无' }}
        </span>
        <div>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :disabled="!selectedItem" @click="confirmSelect">
            {{ confirmButtonText }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useResourceStore, type ResourceItem } from '../stores/resource'
import { extractClipboardFiles, uploadBatchToQiniu } from '../utils/upload'
import ResourceGrid from './ResourceGrid.vue'

const emit = defineEmits<{
  select: [item: ResourceItem]
}>()

const store = useResourceStore()

const dialogVisible = ref(false)
const selectedId = ref<number | null>(null)
const selectedItem = ref<ResourceItem | null>(null)
const localFilter = ref('')
const scene = ref<'content' | 'cover'>('content')
const dragActive = ref(false)
const dragDepth = ref(0)
const uploading = ref(false)

const dialogTitle = computed(() => (scene.value === 'cover' ? '选择封面' : '选择资源'))
const confirmButtonText = computed(() => (scene.value === 'cover' ? '设为封面' : '插入'))

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

const handlePaste = async (event: ClipboardEvent) => {
  if (!dialogVisible.value) {
    return
  }

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

// 监听弹窗打开
watch(dialogVisible, (val) => {
  if (val) {
    store.fetchData()
    window.addEventListener('paste', handlePaste)
  } else {
    selectedId.value = null
    selectedItem.value = null
    dragDepth.value = 0
    dragActive.value = false
    window.removeEventListener('paste', handlePaste)
  }
})

const handleFilterChange = () => {
  store.setFilter(localFilter.value)
}

const handleSelect = (item: ResourceItem) => {
  selectedId.value = item.id
  selectedItem.value = item
}

const handleDelete = async (item: ResourceItem) => {
  try {
    await ElMessageBox.confirm('确定删除该资源？', '提示', { type: 'warning' })
    await store.removeResource(item.id)
    ElMessage.success('删除成功')
    if (selectedId.value === item.id) {
      selectedId.value = null
      selectedItem.value = null
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleImageError = async (_event: Event, item: ResourceItem) => {
  await store.refreshItemUrl(item)
}

const handleViewRefs = async (item: ResourceItem) => {
  try {
    const res: any = await store.getReferences(item.id)
    const refs = res?.data?.article_refs || []
    if (!refs.length) {
      ElMessage.info('该资源暂无文章引用')
      return
    }
    ElMessage.info(`该资源被 ${refs.length} 篇文章引用`)
  } catch {
    ElMessage.error('查询引用失败')
  }
}

const handleUpload = async (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return

  await uploadFiles([rawFile])
}

const confirmSelect = () => {
  if (selectedItem.value) {
    emit('select', {
      ...selectedItem.value,
      url: selectedItem.value.displayUrl || selectedItem.value.url
    })
    dialogVisible.value = false
  }
}

// 暴露打开方法
const open = (type?: string, options?: { scene?: 'content' | 'cover' }) => {
  if (type === 'image') localFilter.value = 'img'
  else if (type === 'video') localFilter.value = 'video'
  else localFilter.value = ''

  scene.value = options?.scene || 'content'
  
  dialogVisible.value = true
}

defineExpose({ open })

onUnmounted(() => {
  window.removeEventListener('paste', handlePaste)
})
</script>
