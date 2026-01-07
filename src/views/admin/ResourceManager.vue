<template>
  <div class="p-6 h-full flex flex-col bg-gray-50">
    <!-- 顶部工具栏 -->
    <div class="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-bold text-gray-700">图库管理</h2>
        <el-radio-group v-model="filterType" size="small" @change="handleFilterChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button label="image">图片</el-radio-button>
          <el-radio-button label="video">视频</el-radio-button>
          <el-radio-button label="audio">音频</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="flex gap-2">
        <el-button @click="store.fetchData()" :loading="store.loading" circle>
          <el-icon><RefreshRight /></el-icon>
        </el-button>
        
        <el-upload
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleUpload"
          multiple
        >
          <el-button type="primary">
            <el-icon class="mr-1"><Upload /></el-icon> 上传文件
          </el-button>
        </el-upload>
      </div>
    </div>

    <!-- 资源网格 -->
    <div class="flex-1 overflow-y-auto bg-white rounded-lg shadow-sm" v-loading="store.loading">
      <ResourceGrid 
        :items="store.items" 
        :selected-id="selectedId"
        @select="handleSelect"
        @delete="handleDelete"
        @image-error="handleImageError"
      />
    </div>

    <!-- 分页 -->
    <div class="mt-4 flex justify-center bg-white p-3 rounded-lg shadow-sm">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Upload, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useResourceStore, type ResourceItem } from '../../stores/resource'
import { uploadToQiniu } from '../../utils/upload'
import ResourceGrid from '../../components/ResourceGrid.vue'

const store = useResourceStore()

const filterType = ref('')
const selectedId = ref<number | null>(null)
const currentPage = ref(1)
const currentPageSize = ref(24)

// 同步 store 的分页状态
watch(() => store.page, (val) => { currentPage.value = val })
watch(() => store.pageSize, (val) => { currentPageSize.value = val })

onMounted(() => {
  store.setPageSize(24)
  store.fetchData()
})

const handleFilterChange = () => {
  store.setFilter(filterType.value)
}

const handlePageChange = (page: number) => {
  store.setPage(page)
}

const handleSizeChange = (size: number) => {
  store.setPageSize(size)
}

const handleSelect = (item: ResourceItem) => {
  selectedId.value = selectedId.value === item.id ? null : item.id
}

const handleDelete = async (item: ResourceItem) => {
  try {
    await ElMessageBox.confirm('确定删除该资源？此操作将同时删除七牛云上的文件。', '警告', { 
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    await store.removeResource(item.id)
    ElMessage.success('删除成功')
    if (selectedId.value === item.id) {
      selectedId.value = null
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
</script>