<template>
  <div class="min-h-screen bg-gray-50/50 pt-24 pb-12">
    <div class="max-w-3xl mx-auto px-4">
      <div class="text-center mb-16 relative">
        <h1 class="text-3xl font-bold text-gray-800 mb-4 font-serif">建站日志 📅</h1>
        <p class="text-gray-500">记录博客的每一次成长与蜕变</p>
        
        <!-- Admin Add Button -->
        <div v-if="isAdmin" class="mt-6">
          <el-button type="primary" @click="openDialog('create')">
            <el-icon class="mr-1"><Plus /></el-icon> 新增日志
          </el-button>
        </div>
      </div>

      <!-- Timeline -->
      <div class="relative pl-8 md:pl-0">
        <!-- Vertical Line -->
        <div class="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 transform -translate-x-1/2"></div>

        <div v-for="(log, index) in logs" :key="log.id" class="relative mb-12 group">
          <!-- Dot -->
          <div class="absolute left-8 md:left-1/2 w-4 h-4 bg-white border-4 border-miyazaki-blue rounded-full transform -translate-x-1/2 mt-1.5 z-10 group-hover:scale-125 transition-transform"></div>

          <!-- Content -->
          <div :class="['md:w-1/2 relative', index % 2 === 0 ? 'md:pr-12 md:text-right md:ml-0' : 'md:pl-12 md:ml-auto']">
            <div class="pl-12 md:pl-0">
              <div class="flex items-center mb-2" :class="[index % 2 === 0 ? 'md:justify-end' : 'md:justify-start']">
                <span class="inline-block px-3 py-1 bg-blue-50 text-miyazaki-blue text-xs font-bold rounded-full">
                  {{ log.version || 'Update' }}
                </span>
                <!-- Admin Actions -->
                <div v-if="isAdmin" class="ml-2 flex space-x-2">
                  <el-button link type="primary" size="small" @click="openDialog('edit', log)">编辑</el-button>
                  <el-button link type="danger" size="small" @click="handleDelete(log)">删除</el-button>
                </div>
              </div>

              <h3 class="text-lg font-bold text-gray-800 mb-2">{{ formatDate(log.created_at) }}</h3>
              <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left relative">
                <div class="prose prose-sm max-w-none text-gray-600" v-html="renderContent(log.content)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div class="mt-20 pt-12 border-t border-gray-200">
        <h2 class="text-2xl font-bold text-gray-800 mb-8 text-center font-serif">留言互动</h2>
        <!-- 使用 changelog 类型，content-id=0 表示整个建站日志页面 -->
        <CommentSection :content-id="0" content-type="changelog" /> 
      </div>
    </div>

    <!-- Admin Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新增日志' : '编辑日志'"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="版本号">
          <el-input v-model="form.version" placeholder="e.g. v1.0.0" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="支持 Markdown 格式"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { getChangelogs, createChangelog, updateChangelog, deleteChangelog } from '../api'
import { marked } from 'marked'
import CommentSection from '../components/CommentSection.vue'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.userInfo?.is_admin === true)

const logs = ref<any[]>([])
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const form = reactive({
  id: 0,
  version: '',
  content: ''
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const renderContent = (content: string) => {
  return marked(content)
}

const fetchLogs = async () => {
  try {
    const res: any = await getChangelogs()
    if (res.code === 200) {
      logs.value = res.data
    }
  } catch (error) {
    console.error('Failed to fetch changelogs', error)
  }
}

const openDialog = (type: 'create' | 'edit', log?: any) => {
  dialogType.value = type
  if (type === 'edit' && log) {
    form.id = log.id
    form.version = log.version
    form.content = log.content
  } else {
    form.id = 0
    form.version = ''
    form.content = ''
  }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!form.content) {
    ElMessage.warning('请输入日志内容')
    return
  }
  
  try {
    if (dialogType.value === 'create') {
      await createChangelog({
        version: form.version,
        content: form.content
      })
      ElMessage.success('发布成功')
    } else {
      await updateChangelog(form.id, {
        version: form.version,
        content: form.content
      })
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchLogs()
  } catch (error) {
    // Error handled by request interceptor usually
  }
}

const handleDelete = (log: any) => {
  ElMessageBox.confirm(
    '确定要删除这条日志吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      await deleteChangelog(log.id)
      ElMessage.success('删除成功')
      fetchLogs()
    })
    .catch(() => {})
}

onMounted(() => {
  fetchLogs()
})
</script>
