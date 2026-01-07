<template>
  <!-- 弹窗模式 -->
  <el-dialog
    v-model="dialogVisible"
    title="选择资源"
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
          <el-radio-button label="image">图片</el-radio-button>
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
          <el-button type="primary" size="small">
            <el-icon class="mr-1"><Upload /></el-icon> 上传
          </el-button>
        </el-upload>
      </div>

      <!-- 资源网格 -->
      <div class="flex-1 overflow-y-auto bg-gray-50 rounded-lg" v-loading="store.loading">
        <ResourceGrid 
          :items="store.items" 
          :selected-id="selectedId"
          @select="handleSelect"
          @delete="handleDelete"
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
            插入
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useResourceStore, type ResourceItem } from '../stores/resource'
import { uploadToQiniu } from '../utils/upload'
import ResourceGrid from './ResourceGrid.vue'

const emit = defineEmits<{
  select: [item: ResourceItem]
}>()

const store = useResourceStore()

const dialogVisible = ref(false)
const selectedId = ref<number | null>(null)
const selectedItem = ref<ResourceItem | null>(null)
const localFilter = ref('')

// 监听弹窗打开
watch(dialogVisible, (val) => {
  if (val) {
    store.fetchData()
  } else {
    selectedId.value = null
    selectedItem.value = null
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

const handleUpload = async (file: any) => {
  const rawFile = file.raw
  if (!rawFile) return
  
  try {
    await uploadToQiniu(rawFile)
    ElMessage.success('上传成功')
    store.fetchData()
  } catch {
    ElMessage.error('上传失败')
  }
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
const open = (type?: string) => {
  if (type === 'image') localFilter.value = 'image'
  else if (type === 'video') localFilter.value = 'video'
  else localFilter.value = ''
  
  dialogVisible.value = true
}

defineExpose({ open })
</script>
